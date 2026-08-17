package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.DescriptiveModelAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DescriptiveModelAnswerRepository extends JpaRepository<DescriptiveModelAnswer, Long> {
    java.util.Optional<DescriptiveModelAnswer> findByQuestionId(Long questionId);
}
