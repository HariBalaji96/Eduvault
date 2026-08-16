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
public class StudentService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public StudentService(UserRepository userRepository, PasswordEncoder passwordEncoder, Validator validator) {
        this.userRepository = userRepository;
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
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setActive(true);
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

            User user = new User();
            user.setName(req.getName());
            user.setEmail(req.getEmail());
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            user.setRole(Role.STUDENT);
            user.setActive(true);
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
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateStatus(Long id, boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        user.setActive(active);
        return mapToResponse(userRepository.save(user));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
