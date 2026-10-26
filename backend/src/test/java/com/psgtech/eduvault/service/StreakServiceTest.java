package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.streak.StudentStreakDTO;
import com.psgtech.eduvault.entity.Role;
import com.psgtech.eduvault.entity.StudentStreak;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StreakServiceTest {

    @Mock
    private StudentStreakRepository studentStreakRepository;

    @Mock
    private CodeExecutionRepository codeExecutionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClassroomStudentRepository classroomStudentRepository;

    @Mock
    private ClassroomRepository classroomRepository;

    @InjectMocks
    private StreakService streakService;

    private User student;

    @BeforeEach
    void setUp() {
        student = new User();
        student.setId(10L);
        student.setName("Alice Walker");
        student.setEmail("alice@eduvault.com");
        student.setRole(Role.STUDENT);
    }

    @Test
    void testFirstTimeExecutionStartsStreakAtOne() {
        when(studentStreakRepository.findByStudentId(10L)).thenReturn(Optional.empty());
        when(studentStreakRepository.save(any(StudentStreak.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentStreakDTO result = streakService.recordExecution(student);

        assertNotNull(result);
        assertEquals(1, result.getCurrentStreak());
        assertEquals(1, result.getHighestStreak());
        assertEquals(LocalDate.now(), result.getLastActiveDate());
        assertTrue(result.isActiveToday());
        assertEquals("ACTIVE", result.getStreakStatus());
    }

    @Test
    void testConsecutiveDayExecutionIncrementsStreak() {
        StudentStreak existingStreak = new StudentStreak();
        existingStreak.setId(1L);
        existingStreak.setStudent(student);
        existingStreak.setCurrentStreak(2);
        existingStreak.setHighestStreak(2);
        existingStreak.setLastActiveDate(LocalDate.now().minusDays(1)); // Executed yesterday

        when(studentStreakRepository.findByStudentId(10L)).thenReturn(Optional.of(existingStreak));
        when(studentStreakRepository.save(any(StudentStreak.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentStreakDTO result = streakService.recordExecution(student);

        assertNotNull(result);
        assertEquals(3, result.getCurrentStreak());
        assertEquals(3, result.getHighestStreak());
        assertEquals(LocalDate.now(), result.getLastActiveDate());
        assertTrue(result.isActiveToday());
    }

    @Test
    void testMultipleExecutionsSameDayDoesNotInflateStreak() {
        StudentStreak existingStreak = new StudentStreak();
        existingStreak.setId(1L);
        existingStreak.setStudent(student);
        existingStreak.setCurrentStreak(3);
        existingStreak.setHighestStreak(5);
        existingStreak.setLastActiveDate(LocalDate.now()); // Already executed today

        when(studentStreakRepository.findByStudentId(10L)).thenReturn(Optional.of(existingStreak));
        when(studentStreakRepository.save(any(StudentStreak.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentStreakDTO result = streakService.recordExecution(student);

        assertNotNull(result);
        assertEquals(3, result.getCurrentStreak()); // Remains 3
        assertEquals(5, result.getHighestStreak());
        assertEquals(LocalDate.now(), result.getLastActiveDate());
    }

    @Test
    void testMissedDayBreaksStreakAndStartsNewStreak() {
        StudentStreak existingStreak = new StudentStreak();
        existingStreak.setId(1L);
        existingStreak.setStudent(student);
        existingStreak.setCurrentStreak(7);
        existingStreak.setHighestStreak(10);
        existingStreak.setLastActiveDate(LocalDate.now().minusDays(3)); // Missed 2 days!

        when(studentStreakRepository.findByStudentId(10L)).thenReturn(Optional.of(existingStreak));
        when(studentStreakRepository.save(any(StudentStreak.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentStreakDTO result = streakService.recordExecution(student);

        assertNotNull(result);
        assertEquals(1, result.getCurrentStreak()); // Streak broke, restarts at 1 today
        assertEquals(10, result.getHighestStreak()); // Best streak of 10 is preserved!
        assertEquals(LocalDate.now(), result.getLastActiveDate());
    }

    @Test
    void testGetStudentStreakDetectsBrokenStreakBeforeExecution() {
        StudentStreak existingStreak = new StudentStreak();
        existingStreak.setId(1L);
        existingStreak.setStudent(student);
        existingStreak.setCurrentStreak(5);
        existingStreak.setHighestStreak(8);
        existingStreak.setLastActiveDate(LocalDate.now().minusDays(2)); // Missed yesterday!

        when(userRepository.findById(10L)).thenReturn(Optional.of(student));
        when(studentStreakRepository.findByStudentId(10L)).thenReturn(Optional.of(existingStreak));
        when(studentStreakRepository.save(any(StudentStreak.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentStreakDTO result = streakService.getStudentStreakById(10L);

        assertNotNull(result);
        assertEquals(0, result.getCurrentStreak()); // Broken streak resets to 0
        assertEquals(8, result.getHighestStreak()); // Highest streak preserved
        assertEquals("BROKEN", result.getStreakStatus());
        assertFalse(result.isActiveToday());
    }
}
