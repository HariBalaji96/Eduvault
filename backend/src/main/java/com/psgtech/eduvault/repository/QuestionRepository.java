package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    java.util.List<Question> findByAssessmentIdOrderByOrderIndexAsc(Long assessmentId);
    int countByAssessmentId(Long assessmentId);
    boolean existsByAssessmentIdAndTextIgnoreCase(Long assessmentId, String text);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(q.marks), 0.0) FROM Question q WHERE q.assessment.id = :assessmentId")
    Double sumMarksByAssessmentId(@org.springframework.data.repository.query.Param("assessmentId") Long assessmentId);
}
