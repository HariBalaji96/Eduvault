package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.StudentStreak;
import com.psgtech.eduvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentStreakRepository extends JpaRepository<StudentStreak, Long> {
    Optional<StudentStreak> findByStudentId(Long studentId);
    Optional<StudentStreak> findByStudent(User student);
    List<StudentStreak> findByStudentIn(Collection<User> students);
    List<StudentStreak> findByStudentIdIn(Collection<Long> studentIds);
}

