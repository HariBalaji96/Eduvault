package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.PracticeProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeProblemRepository extends JpaRepository<PracticeProblem, Long> {
}
