package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.assessment.*;
import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentStudentService {
    private final AssessmentRepository assessmentRepository;
    private final ClassroomStudentRepository classroomStudentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final McqOptionRepository mcqOptionRepository;
    private final AnswerResponseRepository answerResponseRepository;

    @Transactional(readOnly = true)
    public List<StudentAssessmentListDTO> getPublishedAssessments(User student) {
        List<ClassroomStudent> enrollments = classroomStudentRepository.findByStudentId(student.getId());
        List<Long> classroomIds = enrollments.stream()
                .map(e -> e.getClassroom().getId())
                .collect(Collectors.toList());

        List<Assessment> assessments = assessmentRepository.findByClassroomIdInAndPublishedAtIsNotNull(classroomIds);
        List<Long> assessmentIds = assessments.stream().map(Assessment::getId).collect(Collectors.toList());

        List<Submission> submissions = submissionRepository.findByStudentIdAndAssessmentIdIn(student.getId(), assessmentIds);

        return assessments.stream().map(assessment -> {
            StudentAssessmentListDTO dto = new StudentAssessmentListDTO();
            dto.setId(assessment.getId());
            dto.setTitle(assessment.getTitle());
            dto.setClassroomId(assessment.getClassroom().getId());
            dto.setClassroomName(assessment.getClassroom().getName());
            dto.setPublishedAt(assessment.getPublishedAt());
            dto.setDeadline(assessment.getDeadline());
            dto.setTotalMarks(assessment.getTotalMarks());

            Optional<Submission> submission = submissions.stream()
                    .filter(s -> s.getAssessment().getId().equals(assessment.getId()))
                    .findFirst();

            dto.setStatus(submission.map(Submission::getStatus).orElse(SubmissionStatus.NOT_STARTED));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentStudentDTO getAssessmentForStudent(Long assessmentId, User student) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        if (assessment.getPublishedAt() == null) {
            throw new RuntimeException("Assessment is not published yet");
        }

        classroomStudentRepository.findByClassroomAndStudent(assessment.getClassroom(), student)
                .orElseThrow(() -> new RuntimeException("Student not enrolled in this classroom"));

        AssessmentStudentDTO dto = new AssessmentStudentDTO();
        dto.setId(assessment.getId());
        dto.setTitle(assessment.getTitle());
        dto.setClassroomId(assessment.getClassroom().getId());
        dto.setClassroomName(assessment.getClassroom().getName());
        dto.setPublishedAt(assessment.getPublishedAt());
        dto.setDeadline(assessment.getDeadline());
        dto.setTotalMarks(assessment.getTotalMarks());

        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(assessmentId);
        dto.setQuestions(questions.stream().map(this::mapToQuestionStudentDTO).collect(Collectors.toList()));

        return dto;
    }

    @Transactional
    public Long startAssessment(Long assessmentId, User student) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        if (assessment.getPublishedAt() == null) {
            throw new RuntimeException("Assessment not published");
        }
        classroomStudentRepository.findByClassroomAndStudent(assessment.getClassroom(), student)
                .orElseThrow(() -> new RuntimeException("Student not enrolled"));

        Optional<Submission> existing = submissionRepository.findByAssessmentIdAndStudentId(assessmentId, student.getId());
        if (existing.isPresent()) {
            return existing.get().getId(); // Already started
        }

        Submission submission = new Submission();
        submission.setAssessment(assessment);
        submission.setStudent(student);
        submission.setStatus(SubmissionStatus.IN_PROGRESS);
        submission = submissionRepository.save(submission);
        return submission.getId();
    }

    @Transactional
    public void saveAnswer(Long submissionId, Long questionId, AnswerUpdateDTO dto, User student) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Submission is already submitted or evaluated");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        if (!question.getAssessment().getId().equals(submission.getAssessment().getId())) {
            throw new RuntimeException("Question doesn't belong to this assessment");
        }

        AnswerResponse answer = answerResponseRepository.findBySubmissionIdAndQuestionId(submissionId, questionId)
                .orElse(new AnswerResponse());

        if (answer.getId() == null) {
            answer.setSubmission(submission);
            answer.setQuestion(question);
        }

        if (question.getType() == QuestionType.MCQ) {
            if (dto.getMcqSelectedOptionId() != null) {
                McqOption option = mcqOptionRepository.findById(dto.getMcqSelectedOptionId())
                        .orElseThrow(() -> new RuntimeException("Option not found"));
                answer.setMcqSelectedOption(option);
            } else {
                answer.setMcqSelectedOption(null);
            }
        } else if (question.getType() == QuestionType.DESCRIPTIVE) {
            answer.setDescriptiveText(dto.getDescriptiveText());
        }

        answerResponseRepository.save(answer);
    }

    @Transactional
    public void submitAssessment(Long submissionId, User student) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Submission is not in progress");
        }

        List<AnswerResponse> answers = answerResponseRepository.findBySubmissionId(submissionId);
        double mcqTotalScore = 0.0;

        for (AnswerResponse answer : answers) {
            Question question = answer.getQuestion();
            if (question.getType() == QuestionType.MCQ) {
                McqOption selected = answer.getMcqSelectedOption();
                if (selected != null && selected.isCorrect()) {
                    answer.setFinalScore(question.getMarks());
                    mcqTotalScore += question.getMarks();
                } else {
                    answer.setFinalScore(0.0);
                }
                answerResponseRepository.save(answer);
            }
            // Descriptive score is left null
        }

        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setTotalScore(mcqTotalScore); // This will only be MCQ score initially
        submissionRepository.save(submission);
    }

    private QuestionStudentDTO mapToQuestionStudentDTO(Question q) {
        QuestionStudentDTO dto = new QuestionStudentDTO();
        dto.setId(q.getId());
        dto.setType(q.getType());
        dto.setText(q.getText());
        dto.setMarks(q.getMarks());
        dto.setOrderIndex(q.getOrderIndex());

        if (q.getType() == QuestionType.MCQ) {
            List<McqOption> options = mcqOptionRepository.findByQuestionId(q.getId());
            dto.setOptions(options.stream().map(o -> {
                McqOptionStudentDTO optDto = new McqOptionStudentDTO();
                optDto.setId(o.getId());
                optDto.setOptionText(o.getOptionText());
                return optDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
