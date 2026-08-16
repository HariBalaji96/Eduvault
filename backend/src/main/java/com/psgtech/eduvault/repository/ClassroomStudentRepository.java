package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.ClassroomStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomStudentRepository extends JpaRepository<ClassroomStudent, Long> {
}
