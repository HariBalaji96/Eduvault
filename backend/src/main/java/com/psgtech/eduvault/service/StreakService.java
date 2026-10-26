package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.streak.StudentStreakDTO;
import com.psgtech.eduvault.entity.Role;
import com.psgtech.eduvault.entity.StudentStreak;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.ClassroomRepository;
import com.psgtech.eduvault.repository.ClassroomStudentRepository;
import com.psgtech.eduvault.repository.CodeExecutionRepository;
import com.psgtech.eduvault.repository.StudentStreakRepository;
import com.psgtech.eduvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakService {

    private final StudentStreakRepository studentStreakRepository;
    private final CodeExecutionRepository codeExecutionRepository;
    private final UserRepository userRepository;
    private final ClassroomStudentRepository classroomStudentRepository;
    private final ClassroomRepository classroomRepository;

    /**
     * Records a code execution for the student and updates their consecutive daily streak.
     * Rule: Student must execute code at least once per calendar day to maintain/increment their streak.
     * If a day is missed, the streak breaks.
     */
    @Transactional
    public StudentStreakDTO recordExecution(User student) {
        if (student == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        StudentStreak streak = studentStreakRepository.findByStudentId(student.getId())
                .orElseGet(() -> {
                    StudentStreak s = new StudentStreak();
                    s.setStudent(student);
                    s.setCurrentStreak(0);
                    s.setHighestStreak(0);
                    return s;
                });

        LocalDate lastActive = streak.getLastActiveDate();
        boolean streakIncremented = false;

        if (lastActive == null) {
            // First time running code in the code editor
            streak.setCurrentStreak(1);
            streak.setHighestStreak(Math.max(streak.getHighestStreak(), 1));
            streak.setLastActiveDate(today);
            streakIncremented = true;
        } else if (lastActive.isEqual(today)) {
            // Already executed code today - streak is maintained, do not increment count twice in the same day
            // If currentStreak was 0 for any reason, reset it to at least 1
            if (streak.getCurrentStreak() == 0) {
                streak.setCurrentStreak(1);
                streak.setHighestStreak(Math.max(streak.getHighestStreak(), 1));
            }
        } else if (lastActive.isEqual(today.minusDays(1))) {
            // Executed code yesterday! Streak continues consecutively!
            int newStreak = streak.getCurrentStreak() + 1;
            streak.setCurrentStreak(newStreak);
            streak.setHighestStreak(Math.max(streak.getHighestStreak(), newStreak));
            streak.setLastActiveDate(today);
            streakIncremented = true;
        } else {
            // Missed at least one day (yesterday or earlier) - previous streak broken!
            // Start a new 1-day streak starting today
            streak.setCurrentStreak(1);
            streak.setHighestStreak(Math.max(streak.getHighestStreak(), 1));
            streak.setLastActiveDate(today);
            streakIncremented = true;
        }

        StudentStreak saved = studentStreakRepository.save(streak);
        return mapToDTO(saved, student);
    }

    /**
     * Retrieves the current streak status for a student.
     * Automatically verifies whether the streak is broken (i.e. missed yesterday).
     */
    @Transactional
    public StudentStreakDTO getStudentStreak(User student) {
        if (student == null) return null;
        return getStudentStreakById(student.getId());
    }

    @Transactional
    public StudentStreakDTO getStudentStreakById(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        LocalDate today = LocalDate.now();
        Optional<StudentStreak> streakOpt = studentStreakRepository.findByStudentId(studentId);

        StudentStreak streak;
        if (streakOpt.isEmpty()) {
            streak = new StudentStreak();
            streak.setStudent(student);
            streak.setCurrentStreak(0);
            streak.setHighestStreak(0);
            streak.setLastActiveDate(null);
            streak = studentStreakRepository.save(streak);
        } else {
            streak = streakOpt.get();
            LocalDate lastActive = streak.getLastActiveDate();

            // Check if the streak is broken:
            // If the last execution was before yesterday, the student failed to run code yesterday,
            // so the streak has broken and resets to 0.
            if (lastActive != null && lastActive.isBefore(today.minusDays(1))) {
                if (streak.getCurrentStreak() > 0) {
                    streak.setCurrentStreak(0);
                    streak = studentStreakRepository.save(streak);
                }
            }
        }

        return mapToDTO(streak, student);
    }

    /**
     * Retrieves all student streaks for Admin/Teacher dashboard or Leaderboard.
     * Ranked by current streak desc, then highest streak desc.
     */
    @Transactional
    public List<StudentStreakDTO> getAllStudentStreaks() {
        LocalDate today = LocalDate.now();
        List<User> students = userRepository.findByRole(Role.STUDENT);
        if (students.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, StudentStreak> streakMap = studentStreakRepository.findAll().stream()
                .filter(s -> s.getStudent() != null)
                .collect(Collectors.toMap(s -> s.getStudent().getId(), s -> s, (s1, s2) -> s1));

        List<StudentStreakDTO> result = new ArrayList<>();
        List<StudentStreak> streaksToUpdate = new ArrayList<>();

        for (User student : students) {
            StudentStreak streak = streakMap.get(student.getId());
            if (streak == null) {
                streak = new StudentStreak();
                streak.setStudent(student);
                streak.setCurrentStreak(0);
                streak.setHighestStreak(0);
                streak.setLastActiveDate(null);
            } else {
                LocalDate lastActive = streak.getLastActiveDate();
                if (lastActive != null && lastActive.isBefore(today.minusDays(1))) {
                    if (streak.getCurrentStreak() > 0) {
                        streak.setCurrentStreak(0);
                        streaksToUpdate.add(streak);
                    }
                }
            }
            result.add(mapToDTO(streak, student));
        }

        if (!streaksToUpdate.isEmpty()) {
            studentStreakRepository.saveAll(streaksToUpdate);
        }

        result.sort(Comparator.comparingInt(StudentStreakDTO::getCurrentStreak).reversed()
                .thenComparing(Comparator.comparingInt(StudentStreakDTO::getHighestStreak).reversed())
                .thenComparing(StudentStreakDTO::getStudentName, String.CASE_INSENSITIVE_ORDER));

        for (int i = 0; i < result.size(); i++) {
            result.get(i).setRank(i + 1);
        }

        return result;
    }

    /**
     * Retrieves streak details for all students enrolled in a specific classroom.
     */
    @Transactional
    public List<StudentStreakDTO> getClassroomStudentStreaks(Long classroomId) {
        var classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found"));

        var enrollments = classroomStudentRepository.findByClassroom(classroom);
        List<User> students = enrollments.stream().map(e -> e.getStudent()).collect(Collectors.toList());

        if (students.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDate today = LocalDate.now();
        Map<Long, StudentStreak> streakMap = studentStreakRepository.findByStudentIn(students).stream()
                .collect(Collectors.toMap(s -> s.getStudent().getId(), s -> s, (s1, s2) -> s1));

        List<StudentStreakDTO> result = new ArrayList<>();
        for (User student : students) {
            StudentStreak streak = streakMap.get(student.getId());
            if (streak == null) {
                streak = new StudentStreak();
                streak.setStudent(student);
                streak.setCurrentStreak(0);
                streak.setHighestStreak(0);
            } else if (streak.getLastActiveDate() != null && streak.getLastActiveDate().isBefore(today.minusDays(1))) {
                if (streak.getCurrentStreak() > 0) {
                    streak.setCurrentStreak(0);
                    studentStreakRepository.save(streak);
                }
            }
            result.add(mapToDTO(streak, student));
        }

        result.sort(Comparator.comparingInt(StudentStreakDTO::getCurrentStreak).reversed()
                .thenComparing(Comparator.comparingInt(StudentStreakDTO::getHighestStreak).reversed())
                .thenComparing(StudentStreakDTO::getStudentName, String.CASE_INSENSITIVE_ORDER));

        for (int i = 0; i < result.size(); i++) {
            result.get(i).setRank(i + 1);
        }

        return result;
    }

    /**
     * Recalculates the streak for a student from their entire CodeExecution history.
     */
    @Transactional
    public StudentStreakDTO recalculateStudentStreak(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<LocalDateTime> execTimes = codeExecutionRepository.findExecutionDatesByStudentId(studentId);
        TreeSet<LocalDate> distinctDates = execTimes.stream()
                .map(LocalDateTime::toLocalDate)
                .collect(Collectors.toCollection(TreeSet::new));

        LocalDate today = LocalDate.now();
        StudentStreak streak = studentStreakRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentStreak s = new StudentStreak();
                    s.setStudent(student);
                    return s;
                });

        if (distinctDates.isEmpty()) {
            streak.setCurrentStreak(0);
            streak.setHighestStreak(0);
            streak.setLastActiveDate(null);
            studentStreakRepository.save(streak);
            return mapToDTO(streak, student);
        }

        int maxStreak = 0;
        int runningStreak = 0;
        LocalDate prev = null;

        for (LocalDate date : distinctDates) {
            if (prev == null) {
                runningStreak = 1;
            } else if (date.isEqual(prev.plusDays(1))) {
                runningStreak++;
            } else {
                runningStreak = 1;
            }
            maxStreak = Math.max(maxStreak, runningStreak);
            prev = date;
        }

        LocalDate lastActive = distinctDates.last();
        int currentStreak = 0;

        if (lastActive.isEqual(today) || lastActive.isEqual(today.minusDays(1))) {
            currentStreak = runningStreak;
        } else {
            // Gap > 1 day from today: streak broken!
            currentStreak = 0;
        }

        streak.setCurrentStreak(currentStreak);
        streak.setHighestStreak(maxStreak);
        streak.setLastActiveDate(lastActive);
        studentStreakRepository.save(streak);

        return mapToDTO(streak, student);
    }

    /**
     * Recalculates streaks for all students.
     */
    @Transactional
    public Map<String, Object> recalculateAllStreaks() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        for (User student : students) {
            recalculateStudentStreak(student.getId());
        }
        return Map.of("message", "Successfully recalculated streaks for " + students.size() + " students.");
    }

    /**
     * Daily scheduled task running at midnight to reset streaks of students who missed coding yesterday.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void resetBrokenStreaksDaily() {
        log.info("Running daily streak maintenance check at midnight...");
        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<StudentStreak> allStreaks = studentStreakRepository.findAll();
        int brokenCount = 0;

        for (StudentStreak s : allStreaks) {
            if (s.getLastActiveDate() != null && s.getLastActiveDate().isBefore(yesterday) && s.getCurrentStreak() > 0) {
                s.setCurrentStreak(0);
                studentStreakRepository.save(s);
                brokenCount++;
            }
        }
        log.info("Daily streak maintenance complete. Reset {} broken streaks.", brokenCount);
    }

    private StudentStreakDTO mapToDTO(StudentStreak streak, User student) {
        LocalDate today = LocalDate.now();
        LocalDate lastActive = streak.getLastActiveDate();

        boolean activeToday = lastActive != null && lastActive.isEqual(today);
        boolean activeYesterday = lastActive != null && lastActive.isEqual(today.minusDays(1));

        int effectiveCurrentStreak = streak.getCurrentStreak();
        if (lastActive != null && lastActive.isBefore(today.minusDays(1))) {
            effectiveCurrentStreak = 0;
        }

        String status;
        String message;

        if (activeToday) {
            status = "ACTIVE";
            message = "🔥 Streak active! You executed code today. " + effectiveCurrentStreak + " day" + (effectiveCurrentStreak == 1 ? "" : "s") + " in a row!";
        } else if (activeYesterday && effectiveCurrentStreak > 0) {
            status = "AT_RISK";
            message = "⚡ Streak at risk! Execute code in the editor today to maintain your " + effectiveCurrentStreak + "-day streak!";
        } else if (effectiveCurrentStreak > 0) {
            status = "ACTIVE";
            message = "Current streak: " + effectiveCurrentStreak + " day" + (effectiveCurrentStreak == 1 ? "" : "s");
        } else if (lastActive != null) {
            status = "BROKEN";
            message = "Streak broken. Run code in the code editor today to start a new streak!";
        } else {
            status = "INACTIVE";
            message = "No streak yet. Execute code in the editor to start your first streak!";
        }

        long totalExecs = codeExecutionRepository.countByStudentId(student.getId());

        // Get recent active dates (last 30 days) for calendar dots / heatmap
        List<LocalDateTime> recentTimes = codeExecutionRepository.findExecutionDatesByStudentId(student.getId());
        LocalDate thirtyDaysAgo = today.minusDays(30);
        List<LocalDate> recentDates = recentTimes.stream()
                .map(LocalDateTime::toLocalDate)
                .filter(d -> !d.isBefore(thirtyDaysAgo))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        return StudentStreakDTO.builder()
                .studentId(student.getId())
                .studentName(student.getName())
                .studentEmail(student.getEmail())
                .registrationId(student.getRegistrationId())
                .currentStreak(effectiveCurrentStreak)
                .highestStreak(streak.getHighestStreak())
                .lastActiveDate(lastActive)
                .activeToday(activeToday)
                .streakStatus(status)
                .totalExecutions(totalExecs)
                .schoolClassName(student.getSchoolClass() != null ? student.getSchoolClass().getName() : null)
                .message(message)
                .recentActiveDates(recentDates)
                .build();
    }
}
