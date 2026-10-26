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
    java.util.List<ClassroomStudent> findByClassroom(Classroom classroom);
    java.util.List<ClassroomStudent> findByStudentId(Long studentId);
    void deleteByClassroom(Classroom classroom);

    @org.springframework.data.jpa.repository.Query("SELECT cs FROM ClassroomStudent cs JOIN FETCH cs.student WHERE cs.classroom = :classroom")
    java.util.List<ClassroomStudent> findByClassroomWithStudent(@org.springframework.data.repository.query.Param("classroom") Classroom classroom);

    @org.springframework.data.jpa.repository.Query("SELECT cs FROM ClassroomStudent cs JOIN FETCH cs.student WHERE cs.classroom.id = :classroomId")
    java.util.List<ClassroomStudent> findByClassroomIdWithStudent(@org.springframework.data.repository.query.Param("classroomId") Long classroomId);
}
