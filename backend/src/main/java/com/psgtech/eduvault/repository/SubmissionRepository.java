package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    java.util.Optional<Submission> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
    java.util.List<Submission> findByStudentIdAndAssessmentIdIn(Long studentId, java.util.List<Long> assessmentIds);
    java.util.List<Submission> findByAssessmentId(Long assessmentId);
}
