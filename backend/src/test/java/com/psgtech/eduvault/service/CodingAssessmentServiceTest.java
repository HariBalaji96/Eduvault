package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.assessment.*;
import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodingAssessmentServiceTest {

    @Mock
    private AssessmentRepository assessmentRepository;
    @Mock
    private ClassroomRepository classroomRepository;
    @Mock
    private ClassroomTeacherRepository classroomTeacherRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private McqOptionRepository mcqOptionRepository;
    @Mock
    private DescriptiveModelAnswerRepository descriptiveModelAnswerRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private AnswerResponseRepository answerResponseRepository;
    @Mock
    private EmailNotificationService emailNotificationService;
    @Mock
    private CodingQuestionDetailRepository codingQuestionDetailRepository;
    @Mock
    private CodingTestCaseRepository codingTestCaseRepository;
    @Mock
    private CodeExecutionService codeExecutionService;
    @Mock
    private ClassroomStudentRepository classroomStudentRepository;

    private AssessmentTeacherService teacherService;
    private AssessmentStudentService studentService;

    private User teacher;
    private User student;
    private Assessment assessment;

    @BeforeEach
    void setUp() {
        teacherService = new AssessmentTeacherService(
                assessmentRepository,
                classroomRepository,
                classroomTeacherRepository,
                questionRepository,
                mcqOptionRepository,
                descriptiveModelAnswerRepository,
                submissionRepository,
                answerResponseRepository,
                emailNotificationService,
                codingQuestionDetailRepository,
                codingTestCaseRepository
        );

        studentService = new AssessmentStudentService(
                assessmentRepository,
                classroomRepository,
                classroomStudentRepository,
                submissionRepository,
                questionRepository,
                mcqOptionRepository,
                answerResponseRepository,
                codeExecutionService,
                codingTestCaseRepository,
                codingQuestionDetailRepository,
                descriptiveModelAnswerRepository
        );

        teacher = new User();
        teacher.setId(1L);
        teacher.setName("Teacher Smith");

        student = new User();
        student.setId(2L);
        student.setName("Student Doe");

        Classroom classroom = new Classroom();
        classroom.setId(10L);

        assessment = new Assessment();
        assessment.setId(100L);
        assessment.setTitle("Comprehensive Exam");
        assessment.setTotalMarks(50.0);
        assessment.setCreatedBy(teacher);
        assessment.setClassroom(classroom);
    }

    @Test
    void testAddCodingQuestionSuccess() {
        when(assessmentRepository.findById(100L)).thenReturn(Optional.of(assessment));
        when(questionRepository.sumMarksByAssessmentId(100L)).thenReturn(20.0); // 30 remaining
        when(questionRepository.countByAssessmentId(100L)).thenReturn(2);

        Question savedQuestion = new Question();
        savedQuestion.setId(500L);
        savedQuestion.setAssessment(assessment);
        savedQuestion.setType(QuestionType.CODING);
        savedQuestion.setText("Two Sum");
        savedQuestion.setMarks(20.0);
        savedQuestion.setOrderIndex(3);

        when(questionRepository.save(any(Question.class))).thenReturn(savedQuestion);

        CodingQuestionCreateDTO dto = new CodingQuestionCreateDTO();
        dto.setText("Two Sum");
        dto.setMarks(20.0);
        dto.setProblemStatement("Given an array of integers, return indices of two numbers that add up to target.");
        dto.setInputDescription("First line contains target, second line contains array.");
        dto.setOutputDescription("Indices separated by space.");
        dto.setConstraints("2 <= nums.length <= 10^4");
        dto.setSampleInput("9\n2 7 11 15");
        dto.setSampleOutput("0 1");
        dto.setAllowedLanguage("java,javascript");
        dto.setTestCases(List.of(
                TestCaseDTO.builder().input("9\n2 7 11 15").expectedOutput("0 1").isHidden(false).build(),
                TestCaseDTO.builder().input("6\n3 2 4").expectedOutput("1 2").isHidden(true).build()
        ));

        QuestionTeacherDTO result = teacherService.addCodingQuestion(100L, dto, teacher);

        assertNotNull(result);
        assertEquals(QuestionType.CODING, result.getType());
        assertEquals("Two Sum", result.getText());
        verify(codingQuestionDetailRepository, times(1)).save(any(CodingQuestionDetail.class));
        verify(codingTestCaseRepository, times(2)).save(any(CodingTestCase.class));
    }

    @Test
    void testSubmitCodeProportionalScoring() {
        Submission submission = new Submission();
        submission.setId(300L);
        submission.setAssessment(assessment);
        submission.setStudent(student);
        submission.setStatus(SubmissionStatus.IN_PROGRESS);

        Question codingQ = new Question();
        codingQ.setId(500L);
        codingQ.setType(QuestionType.CODING);
        codingQ.setMarks(20.0);

        CodingTestCase tc1 = new CodingTestCase(1L, codingQ, "input1", "out1", false);
        CodingTestCase tc2 = new CodingTestCase(2L, codingQ, "input2", "out2", false);
        CodingTestCase tc3 = new CodingTestCase(3L, codingQ, "input3", "out3", true);
        List<CodingTestCase> allCases = List.of(tc1, tc2, tc3);

        when(submissionRepository.findById(300L)).thenReturn(Optional.of(submission));
        when(questionRepository.findById(500L)).thenReturn(Optional.of(codingQ));
        when(codingTestCaseRepository.findByQuestionId(500L)).thenReturn(allCases);
        when(answerResponseRepository.findBySubmissionIdAndQuestionId(300L, 500L)).thenReturn(Optional.empty());

        // 2 out of 3 test cases pass -> score = 20.0 * (2 / 3) = 13.333
        CodeExecutionResultDTO execResult = CodeExecutionResultDTO.builder()
                .compiled(true)
                .results(List.of(
                        TestCaseResultDTO.builder().testCaseId(1L).passed(true).build(),
                        TestCaseResultDTO.builder().testCaseId(2L).passed(true).build(),
                        TestCaseResultDTO.builder().testCaseId(3L).passed(false).build()
                ))
                .build();

        when(codeExecutionService.execute(eq(student), eq(codingQ), eq("java"), anyString(), eq(allCases)))
                .thenReturn(execResult);

        CodeSubmitRequest req = new CodeSubmitRequest();
        req.setLanguage("java");
        req.setCode("public class Main {}");

        CodeExecutionResultDTO result = studentService.submitCode(300L, 500L, req, student);

        assertNotNull(result);
        assertTrue(result.isCompiled());
        verify(answerResponseRepository).save(argThat(ans -> {
            assertEquals("public class Main {}", ans.getCodeSubmitted());
            assertNotNull(ans.getFinalScore());
            assertEquals(20.0 * (2.0 / 3.0), ans.getFinalScore(), 0.001);
            return true;
        }));
    }

    @Test
    void testSubmitAssessmentSumsAllThreeQuestionTypes() {
        Submission submission = new Submission();
        submission.setId(300L);
        submission.setAssessment(assessment);
        submission.setStudent(student);
        submission.setStatus(SubmissionStatus.IN_PROGRESS);

        // MCQ Question (5 marks)
        Question mcqQ = new Question();
        mcqQ.setId(101L);
        mcqQ.setType(QuestionType.MCQ);
        mcqQ.setMarks(5.0);

        McqOption opt1 = new McqOption();
        opt1.setId(11L);
        opt1.setCorrect(true);

        AnswerResponse mcqAns = new AnswerResponse();
        mcqAns.setId(1L);
        mcqAns.setSubmission(submission);
        mcqAns.setQuestion(mcqQ);
        mcqAns.setMcqSelectedOptions(List.of(opt1));

        // Coding Question (25 marks) - Already submitted with score 20.0
        Question codingQ = new Question();
        codingQ.setId(102L);
        codingQ.setType(QuestionType.CODING);
        codingQ.setMarks(25.0);

        AnswerResponse codingAns = new AnswerResponse();
        codingAns.setId(2L);
        codingAns.setSubmission(submission);
        codingAns.setQuestion(codingQ);
        codingAns.setCodeSubmitted("class Main {}");
        codingAns.setFinalScore(20.0);

        // Descriptive Question (10 marks) - Score 8.0
        Question descQ = new Question();
        descQ.setId(103L);
        descQ.setType(QuestionType.DESCRIPTIVE);
        descQ.setMarks(10.0);

        AnswerResponse descAns = new AnswerResponse();
        descAns.setId(3L);
        descAns.setSubmission(submission);
        descAns.setQuestion(descQ);
        descAns.setDescriptiveText("A process is an executing program instance.");
        descAns.setFinalScore(8.0);

        when(submissionRepository.findById(300L)).thenReturn(Optional.of(submission));
        when(answerResponseRepository.findBySubmissionId(300L)).thenReturn(List.of(mcqAns, codingAns, descAns));
        when(mcqOptionRepository.findByQuestionId(101L)).thenReturn(List.of(opt1));

        studentService.submitAssessment(300L, student);

        assertEquals(SubmissionStatus.SUBMITTED, submission.getStatus());
        // Total score should be MCQ (5.0) + Coding (20.0) + Descriptive (8.0) = 33.0
        assertEquals(33.0, submission.getTotalScore(), 0.001);
        verify(submissionRepository).save(submission);
    }
}
