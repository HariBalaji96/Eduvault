package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.Classroom;
import com.psgtech.eduvault.entity.ClassroomPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassroomPostRepository extends JpaRepository<ClassroomPost, Long> {
    List<ClassroomPost> findByClassroomOrderByCreatedAtDesc(Classroom classroom);
}
