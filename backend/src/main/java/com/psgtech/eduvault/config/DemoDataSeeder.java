package com.psgtech.eduvault.config;

import com.psgtech.eduvault.entity.Role;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        userRepository.findByEmail("admin@eduvault.com").ifPresentOrElse(
            admin -> {
                admin.setName("Admin User");
                admin.setPasswordHash(passwordEncoder.encode("Demo@12345"));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
            },
            () -> {
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@eduvault.com");
                admin.setPasswordHash(passwordEncoder.encode("Demo@12345"));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
            }
        );
        System.out.println("Default admin account ready: admin@eduvault.com");
    }
}

