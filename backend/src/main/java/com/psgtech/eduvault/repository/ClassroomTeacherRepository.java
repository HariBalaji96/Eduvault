package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.ClassroomTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomTeacherRepository extends JpaRepository<ClassroomTeacher, Long> {
}
