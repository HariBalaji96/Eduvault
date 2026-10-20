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
    public ResponseEntity<List<StudentAssessmentListDTO>> getAssessments(@AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.getPublishedAssessments(student));
    }

    @GetMapping("/assessments/{id}")
    public ResponseEntity<AssessmentStudentDTO> getAssessment(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.getAssessmentForStudent(id, student));
    }

    @PostMapping("/assessments/{id}/start")
    public ResponseEntity<Long> startAssessment(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.startAssessment(id, student));
    }

    @PutMapping("/submissions/{id}/answers/{questionId}")
    public ResponseEntity<Void> saveAnswer(@PathVariable Long id, @PathVariable Long questionId, @RequestBody AnswerUpdateDTO dto, @AuthenticationPrincipal(expression = "user") User student) {
        assessmentStudentService.saveAnswer(id, questionId, dto, student);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submissions/{id}/submit")
    public ResponseEntity<Void> submitAssessment(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User student) {
        assessmentStudentService.submitAssessment(id, student);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/submissions/{id}/questions/{qId}/run")
    public ResponseEntity<CodeExecutionResultDTO> runCode(@PathVariable Long id, @PathVariable Long qId, @RequestBody CodeSubmitRequest dto, @AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.runCode(id, qId, dto, student));
    }

    @PostMapping("/submissions/{id}/questions/{qId}/submit-code")
    public ResponseEntity<CodeExecutionResultDTO> submitCode(@PathVariable Long id, @PathVariable Long qId, @RequestBody CodeSubmitRequest dto, @AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.submitCode(id, qId, dto, student));
    }

    @GetMapping("/assessments/classroom/{classroomId}")
    public ResponseEntity<List<StudentAssessmentListDTO>> getClassroomAssessments(@PathVariable Long classroomId, @AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.getClassroomAssessments(classroomId, student));
    }

    @GetMapping("/assessments/{id}/result")
    public ResponseEntity<com.psgtech.eduvault.dto.assessment.SubmissionDetailDTO> getAssessmentResult(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User student) {
        return ResponseEntity.ok(assessmentStudentService.getAssessmentResult(id, student));
    }
}
