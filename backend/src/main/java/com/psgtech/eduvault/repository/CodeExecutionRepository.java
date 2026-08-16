package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.CodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodeExecutionRepository extends JpaRepository<CodeExecution, Long> {
}
