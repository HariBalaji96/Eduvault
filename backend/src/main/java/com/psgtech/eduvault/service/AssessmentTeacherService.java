package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.assessment.*;
import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentTeacherService {
    private final AssessmentRepository assessmentRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomTeacherRepository classroomTeacherRepository;
    private final QuestionRepository questionRepository;
    private final McqOptionRepository mcqOptionRepository;
    private final DescriptiveModelAnswerRepository descriptiveModelAnswerRepository;
    private final SubmissionRepository submissionRepository;
    private final AnswerResponseRepository answerResponseRepository;

    private Assessment getAndValidateAssessmentAccess(Long assessmentId, User teacher) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        if (!assessment.getCreatedBy().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized to access this assessment");
        }
        return assessment;
    }

    @Transactional
    public AssessmentTeacherDTO createAssessment(AssessmentCreateDTO dto, User teacher) {
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        classroomTeacherRepository.findByClassroomAndTeacher(classroom, teacher)
                .orElseThrow(() -> new RuntimeException("Unauthorized to create assessment in this classroom"));

        Assessment assessment = new Assessment();
        assessment.setTitle(dto.getTitle());
        assessment.setClassroom(classroom);
        assessment.setCreatedBy(teacher);
        assessment.setDeadline(dto.getDeadline());
        assessment.setTotalMarks(dto.getTotalMarks());
        assessment = assessmentRepository.save(assessment);

        return getAssessmentForTeacher(assessment.getId(), teacher);
    }

    @Transactional
    public QuestionTeacherDTO addMcqQuestion(Long assessmentId, McqQuestionCreateDTO dto, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);

        Question question = new Question();
        question.setAssessment(assessment);
        question.setType(QuestionType.MCQ);
        question.setText(dto.getText());
        question.setMarks(dto.getMarks());
        question.setOrderIndex(questionRepository.countByAssessmentId(assessmentId) + 1);
        question = questionRepository.save(question);

        for (McqOptionCreateDTO optDto : dto.getOptions()) {
            McqOption option = new McqOption();
            option.setQuestion(question);
            option.setOptionText(optDto.getOptionText());
            option.setCorrect(optDto.isCorrect());
            mcqOptionRepository.save(option);
        }

        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public QuestionTeacherDTO addDescriptiveQuestion(Long assessmentId, DescriptiveQuestionCreateDTO dto, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);

        Question question = new Question();
        question.setAssessment(assessment);
        question.setType(QuestionType.DESCRIPTIVE);
        question.setText(dto.getText());
        question.setMarks(dto.getMarks());
        question.setOrderIndex(questionRepository.countByAssessmentId(assessmentId) + 1);
        question = questionRepository.save(question);

        DescriptiveModelAnswer modelAnswer = new DescriptiveModelAnswer();
        modelAnswer.setQuestion(question);
        modelAnswer.setModelAnswerText(dto.getModelAnswer());
        descriptiveModelAnswerRepository.save(modelAnswer);

        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public QuestionTeacherDTO updateQuestion(Long questionId, QuestionUpdateDTO dto, User teacher) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        getAndValidateAssessmentAccess(question.getAssessment().getId(), teacher);

        question.setText(dto.getText());
        question.setMarks(dto.getMarks());
        questionRepository.save(question);
        
        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId, User teacher) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        getAndValidateAssessmentAccess(question.getAssessment().getId(), teacher);
        
        if (question.getType() == QuestionType.MCQ) {
            List<McqOption> options = mcqOptionRepository.findByQuestionId(questionId);
            mcqOptionRepository.deleteAll(options);
        } else if (question.getType() == QuestionType.DESCRIPTIVE) {
            DescriptiveModelAnswer ans = descriptiveModelAnswerRepository.findByQuestionId(questionId).orElse(null);
            if (ans != null) {
                descriptiveModelAnswerRepository.delete(ans);
            }
        }
        questionRepository.delete(question);
    }

    @Transactional
    public AssessmentTeacherDTO publishAssessment(Long assessmentId, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        
        if (assessment.getDeadline() == null) {
            throw new RuntimeException("Assessment must have a deadline to be published");
        }
        int qCount = questionRepository.countByAssessmentId(assessmentId);
        if (qCount == 0) {
            throw new RuntimeException("Assessment must have at least one question");
        }
        
        assessment.setPublishedAt(LocalDateTime.now());
        assessmentRepository.save(assessment);
        
        return getAssessmentForTeacher(assessmentId, teacher);
    }

    @Transactional(readOnly = true)
    public AssessmentTeacherDTO getAssessmentForTeacher(Long assessmentId, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(assessmentId);
        
        AssessmentTeacherDTO dto = new AssessmentTeacherDTO();
        dto.setId(assessment.getId());
        dto.setTitle(assessment.getTitle());
        dto.setClassroomId(assessment.getClassroom().getId());
        dto.setClassroomName(assessment.getClassroom().getName());
        dto.setPublishedAt(assessment.getPublishedAt());
        dto.setDeadline(assessment.getDeadline());
        dto.setTotalMarks(assessment.getTotalMarks());
        
        dto.setQuestions(questions.stream().map(this::mapToQuestionTeacherDTO).collect(Collectors.toList()));
        return dto;
    }

    private QuestionTeacherDTO mapToQuestionTeacherDTO(Question q) {
        QuestionTeacherDTO dto = new QuestionTeacherDTO();
        dto.setId(q.getId());
        dto.setType(q.getType());
        dto.setText(q.getText());
        dto.setMarks(q.getMarks());
        dto.setOrderIndex(q.getOrderIndex());
        
        if (q.getType() == QuestionType.MCQ) {
            List<McqOption> options = mcqOptionRepository.findByQuestionId(q.getId());
            dto.setOptions(options.stream().map(o -> {
                McqOptionDTO optDto = new McqOptionDTO();
                optDto.setId(o.getId());
                optDto.setOptionText(o.getOptionText());
                optDto.setCorrect(o.isCorrect());
                return optDto;
            }).collect(Collectors.toList()));
        } else if (q.getType() == QuestionType.DESCRIPTIVE) {
            descriptiveModelAnswerRepository.findByQuestionId(q.getId())
                .ifPresent(ans -> dto.setModelAnswer(ans.getModelAnswerText()));
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<SubmissionListDTO> getSubmissionsForAssessment(Long assessmentId, User teacher) {
        getAndValidateAssessmentAccess(assessmentId, teacher);
        List<Submission> submissions = submissionRepository.findByAssessmentId(assessmentId);
        return submissions.stream().map(sub -> {
            SubmissionListDTO dto = new SubmissionListDTO();
            dto.setId(sub.getId());
            dto.setStudentId(sub.getStudent().getId());
            dto.setStudentName(sub.getStudent().getName());
            dto.setStudentEmail(sub.getStudent().getEmail());
            dto.setSubmittedAt(sub.getSubmittedAt());
            dto.setStatus(sub.getStatus());
            dto.setTotalScore(sub.getTotalScore());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionDetailDTO getSubmissionDetail(Long submissionId, User teacher) {
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        getAndValidateAssessmentAccess(submission.getAssessment().getId(), teacher);

        SubmissionDetailDTO dto = new SubmissionDetailDTO();
        dto.setId(submission.getId());
        dto.setAssessmentId(submission.getAssessment().getId());
        dto.setAssessmentTitle(submission.getAssessment().getTitle());
        dto.setStudentId(submission.getStudent().getId());
        dto.setStudentName(submission.getStudent().getName());
        dto.setStudentEmail(submission.getStudent().getEmail());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setStatus(submission.getStatus());
        dto.setTotalScore(submission.getTotalScore());

        List<AnswerResponse> answers = answerResponseRepository.findBySubmissionId(submissionId);
        dto.setAnswers(answers.stream().map(ans -> {
            AnswerResponseDTO ansDto = new AnswerResponseDTO();
            ansDto.setId(ans.getId());
            ansDto.setQuestionId(ans.getQuestion().getId());
            ansDto.setQuestionType(ans.getQuestion().getType());
            ansDto.setQuestionText(ans.getQuestion().getText());
            ansDto.setQuestionMarks(ans.getQuestion().getMarks());

            if (ans.getQuestion().getType() == QuestionType.MCQ) {
                if (ans.getMcqSelectedOption() != null) {
                    ansDto.setMcqSelectedOptionId(ans.getMcqSelectedOption().getId());
                    ansDto.setMcqSelectedOptionText(ans.getMcqSelectedOption().getOptionText());
                    ansDto.setIsMcqCorrect(ans.getMcqSelectedOption().isCorrect());
                }
            } else if (ans.getQuestion().getType() == QuestionType.DESCRIPTIVE) {
                ansDto.setDescriptiveText(ans.getDescriptiveText());
                descriptiveModelAnswerRepository.findByQuestionId(ans.getQuestion().getId())
                    .ifPresent(m -> ansDto.setModelAnswerText(m.getModelAnswerText()));
            }

            ansDto.setAiScore(ans.getAiScore());
            ansDto.setAiEvaluationNotes(ans.getAiEvaluationNotes());
            ansDto.setTeacherOverrideScore(ans.getTeacherOverrideScore());
            ansDto.setTeacherFeedback(ans.getTeacherFeedback());
            ansDto.setFinalScore(ans.getFinalScore());

            return ansDto;
        }).collect(Collectors.toList()));

        return dto;
    }
}
