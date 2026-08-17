package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.Classroom;
import com.psgtech.eduvault.entity.ClassroomTeacher;
import com.psgtech.eduvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomTeacherRepository extends JpaRepository<ClassroomTeacher, Long> {
    List<ClassroomTeacher> findByTeacher(User teacher);
    Optional<ClassroomTeacher> findByClassroomAndTeacher(Classroom classroom, User teacher);
}
