package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.CodingQuestionDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodingQuestionDetailRepository extends JpaRepository<CodingQuestionDetail, Long> {
}
