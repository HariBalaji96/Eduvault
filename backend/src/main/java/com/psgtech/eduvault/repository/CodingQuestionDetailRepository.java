package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.CodingQuestionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingQuestionDetailRepository extends JpaRepository<CodingQuestionDetail, Long> {
    Optional<CodingQuestionDetail> findByQuestionId(Long questionId);
    void deleteByQuestionId(Long questionId);
}
