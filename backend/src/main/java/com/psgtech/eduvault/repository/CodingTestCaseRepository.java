package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.CodingTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingTestCaseRepository extends JpaRepository<CodingTestCase, Long> {
    List<CodingTestCase> findByQuestionId(Long questionId);
    List<CodingTestCase> findByQuestionIdAndIsHiddenFalse(Long questionId);
    void deleteByQuestionId(Long questionId);
}
