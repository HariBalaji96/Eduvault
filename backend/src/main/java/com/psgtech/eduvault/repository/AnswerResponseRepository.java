package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.AnswerResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerResponseRepository extends JpaRepository<AnswerResponse, Long> {
    java.util.Optional<AnswerResponse> findBySubmissionIdAndQuestionId(Long submissionId, Long questionId);
    java.util.List<AnswerResponse> findBySubmissionId(Long submissionId);
}
