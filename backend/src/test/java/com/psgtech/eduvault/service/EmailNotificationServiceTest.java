package com.psgtech.eduvault.service;

import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.ClassroomStudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceTest {

    @Mock
    private ClassroomStudentRepository classroomStudentRepository;

    @Mock
    private com.psgtech.eduvault.service.mail.EmailSenderClient emailSenderClient;

    private EmailNotificationService emailNotificationService;

    private Classroom classroom;
    private User teacher;
    private User student1;
    private User student2;

    @BeforeEach
    void setUp() {
        emailNotificationService = new EmailNotificationService(classroomStudentRepository, emailSenderClient);

        teacher = new User();
        teacher.setId(1L);
        teacher.setName("Prof. Xavier");
        teacher.setEmail("xavier@eduvault.com");

        student1 = new User();
        student1.setId(2L);
        student1.setName("Alice Smith");
        student1.setEmail("alice@eduvault.com");
        student1.setActive(true);

        student2 = new User();
        student2.setId(3L);
        student2.setName("Bob Jones");
        student2.setEmail("bob@eduvault.com");
        student2.setActive(false); // Inactive student should be skipped

        classroom = new Classroom();
        classroom.setId(10L);
        classroom.setName("CS101: Intro to Programming");
        classroom.setSubject("Computer Science");
        classroom.setCreatedBy(teacher);
    }

    @Test
    void testNotifyStudentsNewAssignmentPost() {
        ClassroomStudent cs1 = new ClassroomStudent();
        cs1.setClassroom(classroom);
        cs1.setStudent(student1);

        ClassroomStudent cs2 = new ClassroomStudent();
        cs2.setClassroom(classroom);
        cs2.setStudent(student2);

        when(classroomStudentRepository.findByClassroom(classroom)).thenReturn(List.of(cs1, cs2));

        ClassroomPost post = new ClassroomPost();
        post.setId(100L);
        post.setClassroom(classroom);
        post.setAuthor(teacher);
        post.setType(PostType.ASSIGNMENT);
        post.setTitle("Recursion Problem Set");
        post.setContent("Please complete exercises 1 to 5.");
        post.setDueDate(LocalDateTime.now().plusDays(3));

        assertDoesNotThrow(() -> emailNotificationService.notifyStudentsNewPost(post));
    }

    @Test
    void testNotifyStudentsNewAnnouncementPost() {
        ClassroomStudent cs1 = new ClassroomStudent();
        cs1.setClassroom(classroom);
        cs1.setStudent(student1);

        when(classroomStudentRepository.findByClassroom(classroom)).thenReturn(List.of(cs1));

        ClassroomPost post = new ClassroomPost();
        post.setId(101L);
        post.setClassroom(classroom);
        post.setAuthor(teacher);
        post.setType(PostType.ANNOUNCEMENT);
        post.setTitle("Midterm Schedule Released");
        post.setContent("Exam will take place on Friday.");

        assertDoesNotThrow(() -> emailNotificationService.notifyStudentsNewPost(post));
    }

    @Test
    void testNotifyStudentsAssessmentPublished() {
        ClassroomStudent cs1 = new ClassroomStudent();
        cs1.setClassroom(classroom);
        cs1.setStudent(student1);

        when(classroomStudentRepository.findByClassroom(classroom)).thenReturn(List.of(cs1));

        Assessment assessment = new Assessment();
        assessment.setId(50L);
        assessment.setClassroom(classroom);
        assessment.setCreatedBy(teacher);
        assessment.setTitle("Algorithms Quiz 1");
        assessment.setTotalMarks(25.0);
        assessment.setDurationMinutes(45);
        assessment.setDeadline(LocalDateTime.now().plusDays(2));
        assessment.setPublishedAt(LocalDateTime.now());

        assertDoesNotThrow(() -> emailNotificationService.notifyStudentsAssessmentPublished(assessment));
    }

    @Test
    void testNotifyWithEmptyClassroom() {
        when(classroomStudentRepository.findByClassroom(classroom)).thenReturn(List.of());

        ClassroomPost post = new ClassroomPost();
        post.setClassroom(classroom);
        post.setAuthor(teacher);
        post.setType(PostType.ANNOUNCEMENT);
        post.setTitle("Empty room announcement");

        assertDoesNotThrow(() -> emailNotificationService.notifyStudentsNewPost(post));
    }

    @Test
    void testNotifyAnnouncementWithoutTitleAndWithAttachment() {
        ClassroomStudent cs1 = new ClassroomStudent();
        cs1.setClassroom(classroom);
        cs1.setStudent(student1);

        when(classroomStudentRepository.findByClassroom(classroom)).thenReturn(List.of(cs1));

        ClassroomPost post = new ClassroomPost();
        post.setId(102L);
        post.setClassroom(classroom);
        post.setAuthor(teacher);
        post.setType(PostType.ANNOUNCEMENT);
        post.setTitle(null); // Announcement without title
        post.setContent("Class tomorrow is moved to room 402.");
        post.setAttachmentUrl("http://localhost:8080/files/syllabus.pdf");

        assertDoesNotThrow(() -> emailNotificationService.notifyStudentsNewPost(post));
    }
}
