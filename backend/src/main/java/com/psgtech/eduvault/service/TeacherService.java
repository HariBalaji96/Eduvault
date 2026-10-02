package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.*;
import com.psgtech.eduvault.entity.Role;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.UserRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public TeacherService(UserRepository userRepository, PasswordEncoder passwordEncoder, Validator validator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.validator = validator;
    }

    @Transactional
    public List<UserResponse> getAllTeachers() {
        return userRepository.findByRole(Role.TEACHER).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createTeacher(UserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (request.getRegistrationId() != null && !request.getRegistrationId().isBlank() &&
            userRepository.findByRegistrationId(request.getRegistrationId()).isPresent()) {
            throw new IllegalArgumentException("Registration ID already exists");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password cannot be blank");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TEACHER);
        user.setActive(true);
        user.setRegistrationId(request.getRegistrationId());
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public BulkUserResponse bulkCreateTeachers(List<UserRequest> requests) {
        List<UserResponse> created = new ArrayList<>();
        List<BulkSkippedRow> skipped = new ArrayList<>();
        Set<String> seenEmailsInBatch = new HashSet<>();

        List<String> allEmails = requests.stream().map(UserRequest::getEmail).collect(Collectors.toList());
        Set<String> existingEmails = userRepository.findByEmailIn(allEmails).stream()
                .map(User::getEmail)
                .collect(Collectors.toSet());

        List<String> allRegistrationIds = requests.stream()
                .map(UserRequest::getRegistrationId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toList());
        Set<String> existingRegistrationIds = allRegistrationIds.isEmpty() ? Collections.emptySet() :
                userRepository.findByRegistrationIdIn(allRegistrationIds).stream()
                .map(User::getRegistrationId)
                .collect(Collectors.toSet());
        Set<String> seenRegistrationIdsInBatch = new HashSet<>();

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
            if (req.getRegistrationId() != null && !req.getRegistrationId().isBlank()) {
                if (seenRegistrationIdsInBatch.contains(req.getRegistrationId())) {
                    skipped.add(new BulkSkippedRow(req, "Duplicate registration ID within batch"));
                    continue;
                }
                seenRegistrationIdsInBatch.add(req.getRegistrationId());

                if (existingRegistrationIds.contains(req.getRegistrationId())) {
                    skipped.add(new BulkSkippedRow(req, "Registration ID already exists in database"));
                    continue;
                }
            }
            if (req.getPassword() == null || req.getPassword().isBlank()) {
                skipped.add(new BulkSkippedRow(req, "Password cannot be blank"));
                continue;
            }

            User user = new User();
            user.setName(req.getName());
            user.setEmail(req.getEmail());
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            user.setRole(Role.TEACHER);
            user.setActive(true);
            user.setRegistrationId(req.getRegistrationId());
            usersToSave.add(user);
        }

        userRepository.saveAll(usersToSave).forEach(u -> created.add(mapToResponse(u)));
        return new BulkUserResponse(created, skipped);
    }

    @Transactional
    public UserResponse updateTeacher(Long id, UserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        if (!user.getEmail().equals(request.getEmail()) && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (request.getRegistrationId() != null && !request.getRegistrationId().isBlank() && 
            !request.getRegistrationId().equals(user.getRegistrationId()) &&
            userRepository.findByRegistrationId(request.getRegistrationId()).isPresent()) {
            throw new IllegalArgumentException("Registration ID already exists");
        }
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRegistrationId(request.getRegistrationId());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateStatus(Long id, boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        user.setActive(active);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteTeacher(Long id) {
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
                .registrationId(user.getRegistrationId())
                .build();
    }
}
