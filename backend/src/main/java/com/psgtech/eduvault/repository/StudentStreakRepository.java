package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.StudentStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentStreakRepository extends JpaRepository<StudentStreak, Long> {
    Optional<StudentStreak> findByStudentId(Long studentId);
}
