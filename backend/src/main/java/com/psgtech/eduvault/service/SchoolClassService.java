package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.SchoolClassRequest;
import com.psgtech.eduvault.dto.admin.SchoolClassResponse;
import com.psgtech.eduvault.entity.AcademicYear;
import com.psgtech.eduvault.entity.SchoolClass;
import com.psgtech.eduvault.repository.AcademicYearRepository;
import com.psgtech.eduvault.repository.SchoolClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchoolClassService {
    private final SchoolClassRepository classRepository;
    private final AcademicYearRepository yearRepository;

    public SchoolClassService(SchoolClassRepository classRepository, AcademicYearRepository yearRepository) {
        this.classRepository = classRepository;
        this.yearRepository = yearRepository;
    }

    public SchoolClassResponse create(SchoolClassRequest request) {
        AcademicYear year = yearRepository.findById(request.getAcademicYearId()).orElseThrow();
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(request.getName());
        schoolClass.setAcademicYear(year);
        SchoolClass saved = classRepository.save(schoolClass);
        return mapToResponse(saved);
    }

    public List<SchoolClassResponse> getAll() {
        return classRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public SchoolClassResponse update(Long id, SchoolClassRequest request) {
        SchoolClass schoolClass = classRepository.findById(id).orElseThrow();
        AcademicYear year = yearRepository.findById(request.getAcademicYearId()).orElseThrow();
        schoolClass.setName(request.getName());
        schoolClass.setAcademicYear(year);
        return mapToResponse(classRepository.save(schoolClass));
    }

    public void delete(Long id) {
        classRepository.deleteById(id);
    }

    private SchoolClassResponse mapToResponse(SchoolClass schoolClass) {
        return SchoolClassResponse.builder()
                .id(schoolClass.getId())
                .name(schoolClass.getName())
                .academicYearId(schoolClass.getAcademicYear().getId())
                .batchName(schoolClass.getAcademicYear().getBatchName())
                .yearLabel(schoolClass.getAcademicYear().getYearLabel())
                .build();
    }
}
