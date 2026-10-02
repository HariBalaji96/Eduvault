package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.AssignmentSubmission;
import com.psgtech.eduvault.entity.ClassroomPost;
import com.psgtech.eduvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByPost(ClassroomPost post);
    Optional<AssignmentSubmission> findByPostAndStudent(ClassroomPost post, User student);
    void deleteByPost(ClassroomPost post);
}
