package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.*;
import com.psgtech.eduvault.entity.Role;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.entity.SchoolClass;
import com.psgtech.eduvault.repository.UserRepository;
import com.psgtech.eduvault.repository.SchoolClassRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public StudentService(UserRepository userRepository, SchoolClassRepository schoolClassRepository, PasswordEncoder passwordEncoder, Validator validator) {
        this.userRepository = userRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.passwordEncoder = passwordEncoder;
        this.validator = validator;
    }

    @Transactional
    public List<UserResponse> getAllStudents() {
        return userRepository.findByRole(Role.STUDENT).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createStudent(UserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password cannot be blank");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setActive(true);
        if (request.getSchoolClassId() != null) {
            SchoolClass sc = schoolClassRepository.findById(request.getSchoolClassId())
                    .orElseThrow(() -> new IllegalArgumentException("School class not found"));
            user.setSchoolClass(sc);
        }
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public BulkUserResponse bulkCreateStudents(List<UserRequest> requests) {
        List<UserResponse> created = new ArrayList<>();
        List<BulkSkippedRow> skipped = new ArrayList<>();
        Set<String> seenEmailsInBatch = new HashSet<>();

        List<String> allEmails = requests.stream().map(UserRequest::getEmail).collect(Collectors.toList());
        Set<String> existingEmails = userRepository.findByEmailIn(allEmails).stream()
                .map(User::getEmail)
                .collect(Collectors.toSet());

        List<User> usersToSave = new ArrayList<>();

        for (UserRequest req : requests) {
            Set<ConstraintViolation<UserRequest>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                skipped.add(new BulkSkippedRow(req, violations.iterator().next().getMessage()));
                continue;
            }

            if (seenEmailsInBatch.contains(req.getEmail())) {
                skipped.add(new BulkSkippedRow(req, "Duplicate email within batch"));
                continue;
            }
            seenEmailsInBatch.add(req.getEmail());

            if (existingEmails.contains(req.getEmail())) {
                skipped.add(new BulkSkippedRow(req, "Email already exists in database"));
                continue;
            }
            if (req.getPassword() == null || req.getPassword().isBlank()) {
                skipped.add(new BulkSkippedRow(req, "Password cannot be blank"));
                continue;
            }

            User user = new User();
            user.setName(req.getName());
            user.setEmail(req.getEmail());
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            user.setRole(Role.STUDENT);
            user.setActive(true);
            if (req.getSchoolClassId() != null) {
                schoolClassRepository.findById(req.getSchoolClassId()).ifPresent(user::setSchoolClass);
            }
            usersToSave.add(user);
        }

        userRepository.saveAll(usersToSave).forEach(u -> created.add(mapToResponse(u)));
        return new BulkUserResponse(created, skipped);
    }

    @Transactional
    public UserResponse updateStudent(Long id, UserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (!user.getEmail().equals(request.getEmail()) && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getSchoolClassId() != null) {
            SchoolClass sc = schoolClassRepository.findById(request.getSchoolClassId())
                    .orElseThrow(() -> new IllegalArgumentException("School class not found"));
            user.setSchoolClass(sc);
        } else {
            user.setSchoolClass(null);
        }
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateStatus(Long id, boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        user.setActive(active);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteStudent(Long id) {
        userRepository.deleteById(id);
    }

    private UserResponse mapToResponse(User user) {
        String fullName = user.getName() != null ? user.getName().trim() : "";
        int spaceIdx = fullName.indexOf(' ');
        String firstName = spaceIdx == -1 ? fullName : fullName.substring(0, spaceIdx);
        String lastName = spaceIdx == -1 ? "" : fullName.substring(spaceIdx + 1).trim();

        return UserResponse.builder()
                .id(user.getId())
                .firstName(firstName)
                .lastName(lastName)
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .schoolClassId(user.getSchoolClass() != null ? user.getSchoolClass().getId() : null)
                .schoolClassName(user.getSchoolClass() != null ? user.getSchoolClass().getName() : null)
                .build();
    }
}
