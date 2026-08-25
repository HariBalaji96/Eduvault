package com.psgtech.eduvault.config;

import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomTeacherRepository classroomTeacherRepository;
    private final ClassroomStudentRepository classroomStudentRepository;
    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final McqOptionRepository mcqOptionRepository;
    private final DescriptiveModelAnswerRepository descriptiveModelAnswerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Create Users
        User admin = userRepository.findByEmail("admin@eduvault.com").orElseGet(() -> {
            User u = new User();
            u.setName("Admin User");
            u.setEmail("admin@eduvault.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setRole(Role.ADMIN);
            return userRepository.save(u);
        });

        User teacher1 = userRepository.findByEmail("teacher@eduvault.com").orElseGet(() -> {
            User u = new User();
            u.setName("John Doe");
            u.setEmail("teacher@eduvault.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setRole(Role.TEACHER);
            return userRepository.save(u);
        });

        User teacher2 = userRepository.findByEmail("teacher2@eduvault.com").orElseGet(() -> {
            User u = new User();
            u.setName("Jane Smith");
            u.setEmail("teacher2@eduvault.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setRole(Role.TEACHER);
            return userRepository.save(u);
        });

        User teacher3 = userRepository.findByEmail("teacher3@eduvault.com").orElseGet(() -> {
            User u = new User();
            u.setName("David Clark");
            u.setEmail("teacher3@eduvault.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setRole(Role.TEACHER);
            return userRepository.save(u);
        });

        User student1 = userRepository.findByEmail("student1@eduvault.com").orElseGet(() -> {
            User u = new User();
            u.setName("Alice Smith");
            u.setEmail("student1@eduvault.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setRole(Role.STUDENT);
            return userRepository.save(u);
        });

        User student2 = userRepository.findByEmail("student2@eduvault.com").orElseGet(() -> {
            User u = new User();
            u.setName("Bob Johnson");
            u.setEmail("student2@eduvault.com");
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setRole(Role.STUDENT);
            return userRepository.save(u);
        });

        // Check if demo assessment already exists to avoid duplication
        if (classroomRepository.count() > 0 && assessmentRepository.count() > 0) {
            System.out.println("Demo data already seems to exist. Skipping further seeding.");
            return;
        }

        // 2. Create Academic Year and School Class
        AcademicYear year = academicYearRepository.findByYearLabel("2025-2026").orElseGet(() -> {
            AcademicYear y = new AcademicYear();
            y.setYearLabel("2025-2026");
            return academicYearRepository.save(y);
        });

        SchoolClass sc = new SchoolClass();
        sc.setName("Grade 10 - Section A");
        sc.setAcademicYear(year);
        sc = schoolClassRepository.save(sc);

        // 3. Create Classroom
        Classroom cs101 = new Classroom();
        cs101.setName("CS101: Intro to Programming");
        cs101.setSubject("Computer Science");
        cs101.setDescription("Learn the basics of programming with Java.");
        cs101.setSchoolClass(sc);
        cs101.setCreatedBy(admin);
        cs101 = classroomRepository.save(cs101);

        // 4. Assign Teacher
        ClassroomTeacher ct = new ClassroomTeacher();
        ct.setClassroom(cs101);
        ct.setTeacher(teacher1);
        ct.setPermissionLevel(PermissionLevel.OWNER);
        classroomTeacherRepository.save(ct);

        // 5. Enroll Students
        ClassroomStudent cs1 = new ClassroomStudent();
        cs1.setClassroom(cs101);
        cs1.setStudent(student1);
        classroomStudentRepository.save(cs1);

        ClassroomStudent cs2 = new ClassroomStudent();
        cs2.setClassroom(cs101);
        cs2.setStudent(student2);
        classroomStudentRepository.save(cs2);

        // 6. Create Assessment
        Assessment assessment = new Assessment();
        assessment.setTitle("Midterm Exam");
        assessment.setClassroom(cs101);
        assessment.setTotalMarks(20.0);
        assessment.setDeadline(LocalDateTime.now().plusDays(7));
        assessment.setPublishedAt(LocalDateTime.now());
        assessment.setCreatedBy(teacher1);
        assessment = assessmentRepository.save(assessment);

        // 7. Create Questions
        Question q1 = new Question();
        q1.setAssessment(assessment);
        q1.setText("What is the main advantage of Java?");
        q1.setType(QuestionType.MCQ);
        q1.setMarks(10.0);
        q1.setOrderIndex(1);
        q1 = questionRepository.save(q1);

        McqOption opt1 = new McqOption();
        opt1.setQuestion(q1);
        opt1.setOptionText("Platform Independence");
        opt1.setCorrect(true);
        mcqOptionRepository.save(opt1);

        McqOption opt2 = new McqOption();
        opt2.setQuestion(q1);
        opt2.setOptionText("Manual Memory Management");
        opt2.setCorrect(false);
        mcqOptionRepository.save(opt2);

        Question q2 = new Question();
        q2.setAssessment(assessment);
        q2.setText("Explain the concept of OOP.");
        q2.setType(QuestionType.DESCRIPTIVE);
        q2.setMarks(10.0);
        q2.setOrderIndex(2);
        q2 = questionRepository.save(q2);

        DescriptiveModelAnswer modelAnswer = new DescriptiveModelAnswer();
        modelAnswer.setQuestion(q2);
        modelAnswer.setModelAnswerText("Object-oriented programming is a programming paradigm based on the concept of objects, which can contain data and code: data in the form of fields, and code, in the form of procedures.");
        descriptiveModelAnswerRepository.save(modelAnswer);

        System.out.println("Demo data seeded successfully!");
    }
}
