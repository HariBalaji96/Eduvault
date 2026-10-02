package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.classroom.ClassroomResponse;
import com.psgtech.eduvault.service.ClassroomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student/classrooms")
public class StudentClassroomController {

    private final ClassroomService classroomService;

    public StudentClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponse>> getMyClassrooms(Authentication auth) {
        return ResponseEntity.ok(classroomService.getStudentClassrooms(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomResponse> getClassroomDetails(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(classroomService.getStudentClassroomDetails(id, auth.getName()));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<com.psgtech.eduvault.dto.classroom.PostResponse>> getPosts(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(classroomService.getStudentClassroomPosts(id, auth.getName()));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/posts/{postId}/submit")
    public ResponseEntity<com.psgtech.eduvault.dto.classroom.AssignmentSubmissionResponse> submitAssignment(@PathVariable Long id, @PathVariable Long postId, @org.springframework.web.bind.annotation.RequestBody com.psgtech.eduvault.dto.classroom.AssignmentSubmissionRequest request, Authentication auth) {
        return ResponseEntity.ok(classroomService.submitAssignment(id, postId, request, auth.getName()));
    }
}
