package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.assessment.*;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.service.AssessmentStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class AssessmentStudentController {

    private final AssessmentStudentService assessmentStudentService;

    @GetMapping("/assessments")
    public ResponseEntity<List<StudentAssessmentListDTO>> getAssessments(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(assessmentStudentService.getPublishedAssessments(student));
    }

    @GetMapping("/assessments/{id}")
    public ResponseEntity<AssessmentStudentDTO> getAssessment(@PathVariable Long id, @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(assessmentStudentService.getAssessmentForStudent(id, student));
    }

    @PostMapping("/assessments/{id}/start")
    public ResponseEntity<Long> startAssessment(@PathVariable Long id, @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(assessmentStudentService.startAssessment(id, student));
    }

    @PutMapping("/submissions/{id}/answers/{questionId}")
    public ResponseEntity<Void> saveAnswer(@PathVariable Long id, @PathVariable Long questionId, @RequestBody AnswerUpdateDTO dto, @AuthenticationPrincipal User student) {
        assessmentStudentService.saveAnswer(id, questionId, dto, student);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submissions/{id}/submit")
    public ResponseEntity<Void> submitAssessment(@PathVariable Long id, @AuthenticationPrincipal User student) {
        assessmentStudentService.submitAssessment(id, student);
        return ResponseEntity.ok().build();
    }
}
