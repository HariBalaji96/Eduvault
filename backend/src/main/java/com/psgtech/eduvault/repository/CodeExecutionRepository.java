package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.CodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CodeExecutionRepository extends JpaRepository<CodeExecution, Long> {
    long countByStudentId(Long studentId);
    List<CodeExecution> findByStudentIdOrderByExecutedAtAsc(Long studentId);

    @Query("SELECT ce.executedAt FROM CodeExecution ce WHERE ce.student.id = :studentId ORDER BY ce.executedAt ASC")
    List<LocalDateTime> findExecutionDatesByStudentId(@Param("studentId") Long studentId);
}

