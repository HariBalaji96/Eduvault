package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.assessment.*;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.service.AssessmentTeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/assessments")
@RequiredArgsConstructor
public class AssessmentTeacherController {

    private final AssessmentTeacherService assessmentTeacherService;
    private final com.psgtech.eduvault.service.GeminiService geminiService;

    @PostMapping
    public ResponseEntity<AssessmentTeacherDTO> createAssessment(@RequestBody AssessmentCreateDTO dto, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.createAssessment(dto, teacher));
    }

    @PostMapping("/{id}/questions/mcq")
    public ResponseEntity<QuestionTeacherDTO> addMcqQuestion(@PathVariable Long id, @RequestBody McqQuestionCreateDTO dto, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.addMcqQuestion(id, dto, teacher));
    }

    @PostMapping("/{id}/questions/descriptive")
    public ResponseEntity<QuestionTeacherDTO> addDescriptiveQuestion(@PathVariable Long id, @RequestBody DescriptiveQuestionCreateDTO dto, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.addDescriptiveQuestion(id, dto, teacher));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionTeacherDTO> updateQuestion(@PathVariable Long id, @RequestBody QuestionUpdateDTO dto, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.updateQuestion(id, dto, teacher));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User teacher) {
        assessmentTeacherService.deleteQuestion(id, teacher);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<AssessmentTeacherDTO> publishAssessment(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.publishAssessment(id, teacher));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User teacher) {
        assessmentTeacherService.deleteAssessment(id, teacher);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentTeacherDTO> getAssessment(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.getAssessmentForTeacher(id, teacher));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<java.util.List<SubmissionListDTO>> getSubmissions(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.getSubmissionsForAssessment(id, teacher));
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<SubmissionDetailDTO> getSubmissionDetail(@PathVariable Long id, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.getSubmissionDetail(id, teacher));
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<java.util.List<AssessmentTeacherDTO>> getClassroomAssessments(@PathVariable Long classroomId, @AuthenticationPrincipal(expression = "user") User teacher) {
        return ResponseEntity.ok(assessmentTeacherService.getClassroomAssessments(classroomId, teacher));
    }

    @PostMapping("/submissions/answers/{answerId}/evaluate")
    public ResponseEntity<Void> evaluateAnswer(
            @PathVariable Long answerId,
            @RequestBody AnswerEvaluationDTO dto,
            @AuthenticationPrincipal(expression = "user") User teacher) {
        assessmentTeacherService.evaluateAnswer(answerId, dto, teacher);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/submissions/{submissionId}/auto-evaluate")
    public ResponseEntity<Void> autoEvaluateSubmission(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal(expression = "user") User teacher) {
        assessmentTeacherService.autoEvaluateSubmission(submissionId, teacher, geminiService);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{assessmentId}/publish-results")
    public ResponseEntity<Void> publishResults(
            @PathVariable Long assessmentId,
            @AuthenticationPrincipal(expression = "user") User teacher) {
        assessmentTeacherService.publishResults(assessmentId, teacher, geminiService);
        return ResponseEntity.ok().build();
    }
}
