package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.admin.*;
import com.psgtech.eduvault.entity.AcademicYear;
import com.psgtech.eduvault.entity.SchoolClass;
import com.psgtech.eduvault.service.AcademicYearService;
import com.psgtech.eduvault.service.SchoolClassService;
import com.psgtech.eduvault.service.StudentService;
import com.psgtech.eduvault.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final AcademicYearService academicYearService;
    private final SchoolClassService schoolClassService;

    public AdminController(StudentService studentService, TeacherService teacherService, 
                           AcademicYearService academicYearService, SchoolClassService schoolClassService) {
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.academicYearService = academicYearService;
        this.schoolClassService = schoolClassService;
    }

    // --- Students ---
    @GetMapping("/students")
    public ResponseEntity<List<UserResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<UserResponse> createStudent(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(studentService.createStudent(request));
    }

    @PostMapping("/students/bulk")
    public ResponseEntity<BulkUserResponse> bulkCreateStudents(@RequestBody List<UserRequest> requests) {
        return ResponseEntity.ok(studentService.bulkCreateStudents(requests));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<UserResponse> updateStudent(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @PatchMapping("/students/{id}/status")
    public ResponseEntity<UserResponse> updateStudentStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(studentService.updateStatus(id, request.isActive()));
    }

    // --- Teachers ---
    @GetMapping("/teachers")
    public ResponseEntity<List<UserResponse>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PostMapping("/teachers")
    public ResponseEntity<UserResponse> createTeacher(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(teacherService.createTeacher(request));
    }

    @PostMapping("/teachers/bulk")
    public ResponseEntity<BulkUserResponse> bulkCreateTeachers(@RequestBody List<UserRequest> requests) {
        return ResponseEntity.ok(teacherService.bulkCreateTeachers(requests));
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<UserResponse> updateTeacher(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, request));
    }

    @PatchMapping("/teachers/{id}/status")
    public ResponseEntity<UserResponse> updateTeacherStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(teacherService.updateStatus(id, request.isActive()));
    }

    // --- Academic Years ---
    @PostMapping("/academic-years")
    public ResponseEntity<AcademicYear> createAcademicYear(@Valid @RequestBody AcademicYearRequest request) {
        return ResponseEntity.ok(academicYearService.create(request));
    }
    
    @GetMapping("/academic-years")
    public ResponseEntity<List<AcademicYear>> getAllAcademicYears() {
        return ResponseEntity.ok(academicYearService.getAll());
    }

    @PutMapping("/academic-years/{id}")
    public ResponseEntity<AcademicYear> updateAcademicYear(@PathVariable Long id, @Valid @RequestBody AcademicYearRequest request) {
        return ResponseEntity.ok(academicYearService.update(id, request));
    }

    @DeleteMapping("/academic-years/{id}")
    public ResponseEntity<Void> deleteAcademicYear(@PathVariable Long id) {
        academicYearService.delete(id);
        return ResponseEntity.ok().build();
    }

    // --- Classes ---
    @PostMapping("/classes")
    public ResponseEntity<SchoolClass> createClass(@Valid @RequestBody SchoolClassRequest request) {
        return ResponseEntity.ok(schoolClassService.create(request));
    }
    
    @GetMapping("/classes")
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        return ResponseEntity.ok(schoolClassService.getAll());
    }

    @PutMapping("/classes/{id}")
    public ResponseEntity<SchoolClass> updateClass(@PathVariable Long id, @Valid @RequestBody SchoolClassRequest request) {
        return ResponseEntity.ok(schoolClassService.update(id, request));
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        schoolClassService.delete(id);
        return ResponseEntity.ok().build();
    }
}
