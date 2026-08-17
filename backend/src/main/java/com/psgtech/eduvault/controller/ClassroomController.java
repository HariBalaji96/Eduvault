package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.classroom.*;
import com.psgtech.eduvault.service.ClassroomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/classrooms")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @PostMapping
    public ResponseEntity<ClassroomResponse> createClassroom(@Valid @RequestBody ClassroomRequest request, Authentication auth) {
        return ResponseEntity.ok(classroomService.createClassroom(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponse>> getMyClassrooms(Authentication auth) {
        return ResponseEntity.ok(classroomService.getMyClassrooms(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomResponse> getClassroomDetails(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(classroomService.getClassroomDetails(id, auth.getName()));
    }

    @PostMapping("/{id}/teachers")
    public ResponseEntity<Void> addCollaborator(@PathVariable Long id, @Valid @RequestBody CollaboratorRequest request, Authentication auth) {
        classroomService.addCollaborator(id, request, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/students")
    public ResponseEntity<Void> enrollStudents(@PathVariable Long id, @Valid @RequestBody StudentEnrollRequest request, Authentication auth) {
        classroomService.enrollStudents(id, request, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<PostResponse> createPost(@PathVariable Long id, @Valid @RequestBody PostRequest request, Authentication auth) {
        return ResponseEntity.ok(classroomService.createPost(id, request, auth.getName()));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostResponse>> getPosts(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(classroomService.getPosts(id, auth.getName()));
    }
}
