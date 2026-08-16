package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    java.util.List<User> findByEmailIn(java.util.List<String> emails);
    java.util.List<User> findByRole(com.psgtech.eduvault.entity.Role role);
}
