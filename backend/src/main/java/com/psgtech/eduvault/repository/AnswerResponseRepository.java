package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.AnswerResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerResponseRepository extends JpaRepository<AnswerResponse, Long> {
}
