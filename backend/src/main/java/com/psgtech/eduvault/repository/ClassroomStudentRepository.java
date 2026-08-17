package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.Classroom;
import com.psgtech.eduvault.entity.ClassroomStudent;
import com.psgtech.eduvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassroomStudentRepository extends JpaRepository<ClassroomStudent, Long> {
    Optional<ClassroomStudent> findByClassroomAndStudent(Classroom classroom, User student);
    java.util.List<ClassroomStudent> findByStudentId(Long studentId);
}
