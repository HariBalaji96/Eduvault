package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.streak.StudentStreakDTO;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.UserRepository;
import com.psgtech.eduvault.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;
    private final UserRepository userRepository;

    /**
     * Get the logged-in student's daily coding streak.
     */
    @GetMapping("/student/streak")
    public ResponseEntity<StudentStreakDTO> getMyStreak(Authentication auth) {
        User student = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(streakService.getStudentStreak(student));
    }

    /**
     * Get streak for an individual student by ID (accessible by Admin/Teacher).
     */
    @GetMapping("/streaks/student/{studentId}")
    public ResponseEntity<StudentStreakDTO> getStudentStreakById(@PathVariable Long studentId) {
        return ResponseEntity.ok(streakService.getStudentStreakById(studentId));
    }

    /**
     * Get streak leaderboard / all student streaks (Admin or authenticated users).
     */
    @GetMapping("/streaks/leaderboard")
    public ResponseEntity<List<StudentStreakDTO>> getLeaderboard(@RequestParam(required = false) Long classroomId) {
        if (classroomId != null) {
            return ResponseEntity.ok(streakService.getClassroomStudentStreaks(classroomId));
        }
        return ResponseEntity.ok(streakService.getAllStudentStreaks());
    }

    /**
     * Get all student streaks (Admin).
     */
    @GetMapping("/admin/streaks")
    public ResponseEntity<List<StudentStreakDTO>> getAllStreaksAdmin() {
        return ResponseEntity.ok(streakService.getAllStudentStreaks());
    }

    /**
     * Get streaks for students in a specific classroom (Teacher).
     */
    @GetMapping("/teacher/classrooms/{classroomId}/streaks")
    public ResponseEntity<List<StudentStreakDTO>> getClassroomStreaks(@PathVariable Long classroomId) {
        return ResponseEntity.ok(streakService.getClassroomStudentStreaks(classroomId));
    }

    /**
     * Recalculate all streaks from historical CodeExecution records (Admin).
     */
    @PostMapping("/admin/streaks/recalculate")
    public ResponseEntity<Map<String, Object>> recalculateAllStreaks() {
        return ResponseEntity.ok(streakService.recalculateAllStreaks());
    }

    /**
     * Recalculate single student's streak (Admin).
     */
    @PostMapping("/admin/streaks/recalculate/{studentId}")
    public ResponseEntity<StudentStreakDTO> recalculateStudentStreak(@PathVariable Long studentId) {
        return ResponseEntity.ok(streakService.recalculateStudentStreak(studentId));
    }
}
