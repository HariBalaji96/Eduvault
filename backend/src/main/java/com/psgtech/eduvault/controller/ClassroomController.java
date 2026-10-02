package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.classroom.*;
import com.psgtech.eduvault.service.ClassroomService;
import com.psgtech.eduvault.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/classrooms")
public class ClassroomController {

    private final ClassroomService classroomService;
    private final StudentService studentService;
    private final com.psgtech.eduvault.service.SchoolClassService schoolClassService;

    public ClassroomController(ClassroomService classroomService, StudentService studentService, 
                               com.psgtech.eduvault.service.SchoolClassService schoolClassService) {
        this.classroomService = classroomService;
        this.studentService = studentService;
        this.schoolClassService = schoolClassService;
    }

    @PostMapping
    public ResponseEntity<ClassroomResponse> createClassroom(@Valid @RequestBody ClassroomRequest request, Authentication auth) {
        return ResponseEntity.ok(classroomService.createClassroom(request, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponse>> getMyClassrooms(Authentication auth) {
        return ResponseEntity.ok(classroomService.getMyClassrooms(auth.getName()));
    }

    @GetMapping("/all-students")
    public ResponseEntity<List<com.psgtech.eduvault.dto.admin.UserResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/school-classes")
    public ResponseEntity<List<com.psgtech.eduvault.dto.admin.SchoolClassResponse>> getAllSchoolClasses() {
        return ResponseEntity.ok(schoolClassService.getAll());
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

    @GetMapping("/{id}/students")
    public ResponseEntity<List<com.psgtech.eduvault.dto.admin.UserResponse>> getStudents(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(classroomService.getStudents(id, auth.getName()));
    }

    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> removeStudent(@PathVariable Long id, @PathVariable Long studentId, Authentication auth) {
        classroomService.removeStudent(id, studentId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<PostResponse> createPost(@PathVariable Long id, @Valid @RequestBody PostRequest request, Authentication auth) {
        return ResponseEntity.ok(classroomService.createPost(id, request, auth.getName()));
    }

    @PatchMapping("/{id}/posts/{postId}")
    public ResponseEntity<PostResponse> editPost(@PathVariable Long id, @PathVariable Long postId, @Valid @RequestBody PostRequest request, Authentication auth) {
        return ResponseEntity.ok(classroomService.editPost(id, postId, request, auth.getName()));
    }

    @DeleteMapping("/{id}/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @PathVariable Long postId, Authentication auth) {
        classroomService.deletePost(id, postId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/posts/{postId}/submissions")
    public ResponseEntity<List<com.psgtech.eduvault.dto.classroom.AssignmentSubmissionResponse>> getAssignmentSubmissions(@PathVariable Long id, @PathVariable Long postId, Authentication auth) {
        return ResponseEntity.ok(classroomService.getAssignmentSubmissions(id, postId, auth.getName()));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostResponse>> getPosts(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(classroomService.getPosts(id, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClassroom(@PathVariable Long id, Authentication auth) {
        classroomService.deleteClassroom(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}
