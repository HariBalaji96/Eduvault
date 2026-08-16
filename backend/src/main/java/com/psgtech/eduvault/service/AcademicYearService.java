package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.AcademicYearRequest;
import com.psgtech.eduvault.entity.AcademicYear;
import com.psgtech.eduvault.repository.AcademicYearRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AcademicYearService {
    private final AcademicYearRepository repository;

    public AcademicYearService(AcademicYearRepository repository) {
        this.repository = repository;
    }

    public AcademicYear create(AcademicYearRequest request) {
        AcademicYear year = new AcademicYear();
        year.setYearLabel(request.getYearLabel());
        return repository.save(year);
    }

    public List<AcademicYear> getAll() {
        return repository.findAll();
    }

    public AcademicYear update(Long id, AcademicYearRequest request) {
        AcademicYear year = repository.findById(id).orElseThrow();
        year.setYearLabel(request.getYearLabel());
        return repository.save(year);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
