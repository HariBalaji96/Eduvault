package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.SchoolClassRequest;
import com.psgtech.eduvault.entity.AcademicYear;
import com.psgtech.eduvault.entity.SchoolClass;
import com.psgtech.eduvault.repository.AcademicYearRepository;
import com.psgtech.eduvault.repository.SchoolClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchoolClassService {
    private final SchoolClassRepository classRepository;
    private final AcademicYearRepository yearRepository;

    public SchoolClassService(SchoolClassRepository classRepository, AcademicYearRepository yearRepository) {
        this.classRepository = classRepository;
        this.yearRepository = yearRepository;
    }

    public SchoolClass create(SchoolClassRequest request) {
        AcademicYear year = yearRepository.findById(request.getAcademicYearId()).orElseThrow();
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(request.getName());
        schoolClass.setAcademicYear(year);
        return classRepository.save(schoolClass);
    }

    public List<SchoolClass> getAll() {
        return classRepository.findAll();
    }

    public SchoolClass update(Long id, SchoolClassRequest request) {
        SchoolClass schoolClass = classRepository.findById(id).orElseThrow();
        AcademicYear year = yearRepository.findById(request.getAcademicYearId()).orElseThrow();
        schoolClass.setName(request.getName());
        schoolClass.setAcademicYear(year);
        return classRepository.save(schoolClass);
    }

    public void delete(Long id) {
        classRepository.deleteById(id);
    }
}
