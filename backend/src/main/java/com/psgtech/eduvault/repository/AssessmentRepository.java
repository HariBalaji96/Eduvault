package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    java.util.List<Assessment> findByClassroomIdInAndPublishedAtIsNotNull(java.util.List<Long> classroomIds);
}
