package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByAcademicYearId(Long academicYearId);
}
