package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.UserRequest;
import com.psgtech.eduvault.dto.admin.UserResponse;
import com.psgtech.eduvault.entity.Role;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse createAdmin(UserRequest request) {
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
        user.setRole(Role.ADMIN);
        user.setActive(true);
        user = userRepository.save(user);
        
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
                .build();
    }
}
