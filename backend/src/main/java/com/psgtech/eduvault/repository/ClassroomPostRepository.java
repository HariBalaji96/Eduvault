package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.ClassroomPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassroomPostRepository extends JpaRepository<ClassroomPost, Long> {
}
