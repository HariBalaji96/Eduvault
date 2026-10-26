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
    private final ClassroomRepository classroomRepository;
    private final ClassroomStudentRepository classroomStudentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuestionRepository questionRepository;
    private final McqOptionRepository mcqOptionRepository;
    private final AnswerResponseRepository answerResponseRepository;
    private final CodeExecutionService codeExecutionService;
    private final CodingTestCaseRepository codingTestCaseRepository;
    private final CodingQuestionDetailRepository codingQuestionDetailRepository;
    private final com.psgtech.eduvault.repository.DescriptiveModelAnswerRepository descriptiveModelAnswerRepository;

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
            dto.setDurationMinutes(assessment.getDurationMinutes());
            dto.setResultsPublishedAt(assessment.getResultsPublishedAt());

            Optional<Submission> submission = submissions.stream()
                    .filter(s -> s.getAssessment().getId().equals(assessment.getId()))
                    .findFirst();

            dto.setStatus(submission.map(Submission::getStatus).orElse(SubmissionStatus.NOT_STARTED));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentAssessmentListDTO> getClassroomAssessments(Long classroomId, User student) {
        classroomStudentRepository.findByClassroomAndStudent(
            classroomRepository.findById(classroomId).orElseThrow(() -> new RuntimeException("Classroom not found")),
            student
        ).orElseThrow(() -> new RuntimeException("Unauthorized: You are not enrolled in this classroom"));

        List<Assessment> assessments = assessmentRepository.findByClassroomIdAndPublishedAtIsNotNull(classroomId);
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
            dto.setDurationMinutes(assessment.getDurationMinutes());
            dto.setResultsPublishedAt(assessment.getResultsPublishedAt());

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
        dto.setDurationMinutes(assessment.getDurationMinutes());
        dto.setResultsPublishedAt(assessment.getResultsPublishedAt());

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
            if (dto.getMcqSelectedOptionIds() != null && !dto.getMcqSelectedOptionIds().isEmpty()) {
                List<McqOption> options = mcqOptionRepository.findAllById(dto.getMcqSelectedOptionIds());
                answer.setMcqSelectedOptions(options);
            } else {
                answer.setMcqSelectedOptions(null);
            }
        } else if (question.getType() == QuestionType.DESCRIPTIVE) {
            answer.setDescriptiveText(dto.getDescriptiveText());
        } else if (question.getType() == QuestionType.CODING) {
            if (dto.getCodeSubmitted() != null) {
                answer.setCodeSubmitted(dto.getCodeSubmitted());
            }
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
        double totalScore = 0.0;

        for (AnswerResponse answer : answers) {
            Question question = answer.getQuestion();
            if (question.getType() == QuestionType.MCQ) {
                List<McqOption> selectedOptions = answer.getMcqSelectedOptions();
                List<McqOption> allOptions = mcqOptionRepository.findByQuestionId(question.getId());
                
                long correctCount = allOptions.stream().filter(McqOption::isCorrect).count();
                long selectedCorrectCount = selectedOptions != null ? selectedOptions.stream().filter(McqOption::isCorrect).count() : 0;
                long selectedWrongCount = selectedOptions != null ? selectedOptions.stream().filter(o -> !o.isCorrect()).count() : 0;
                
                if (correctCount > 0 && selectedCorrectCount == correctCount && selectedWrongCount == 0) {
                    answer.setFinalScore(question.getMarks());
                    totalScore += question.getMarks();
                } else {
                    answer.setFinalScore(0.0);
                }
                answerResponseRepository.save(answer);
            } else if (question.getType() == QuestionType.CODING) {
                if (answer.getFinalScore() == null && answer.getCodeSubmitted() != null && !answer.getCodeSubmitted().trim().isEmpty()) {
                    List<CodingTestCase> allCases = codingTestCaseRepository.findByQuestionId(question.getId());
                    String lang = "java";
                    Optional<CodingQuestionDetail> detail = codingQuestionDetailRepository.findByQuestionId(question.getId());
                    if (detail.isPresent() && detail.get().getAllowedLanguage() != null && !detail.get().getAllowedLanguage().isEmpty()) {
                        lang = detail.get().getAllowedLanguage().split(",")[0].trim().toLowerCase();
                    }
                    CodeExecutionResultDTO result = codeExecutionService.execute(student, question, lang, answer.getCodeSubmitted(), allCases);
                    if (result.isCompiled() && allCases.size() > 0) {
                        int totalTestCases = allCases.size();
                        long correctTestCaseCount = result.getResults().stream().filter(TestCaseResultDTO::isPassed).count();
                        double totalMarks = question.getMarks() != null ? question.getMarks() : 0.0;
                        double markPerTestCase = totalMarks / (double) totalTestCases;
                        double score = (correctTestCaseCount == totalTestCases)
                                ? totalMarks
                                : (correctTestCaseCount * markPerTestCase);
                        answer.setFinalScore(score);
                    } else {
                        answer.setFinalScore(0.0);
                    }
                    answerResponseRepository.save(answer);
                }
                if (answer.getFinalScore() != null) {
                    totalScore += answer.getFinalScore();
                }
            } else {
                if (answer.getFinalScore() != null) {
                    totalScore += answer.getFinalScore();
                }
            }
        }

        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setTotalScore(totalScore);
        submissionRepository.save(submission);
    }

    @Transactional
    public CodeExecutionResultDTO runCode(Long submissionId, Long questionId, CodeSubmitRequest dto, User student) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow(() -> new RuntimeException("Submission not found"));
        if (!submission.getStudent().getId().equals(student.getId()) || submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Unauthorized or submission not in progress");
        }
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new RuntimeException("Question not found"));
        
        List<CodingTestCase> visibleCases = codingTestCaseRepository.findByQuestionIdAndIsHiddenFalse(questionId);
        
        return codeExecutionService.execute(student, question, dto.getLanguage(), dto.getCode(), visibleCases);
    }

    @Transactional
    public CodeExecutionResultDTO submitCode(Long submissionId, Long questionId, CodeSubmitRequest dto, User student) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow(() -> new RuntimeException("Submission not found"));
        if (!submission.getStudent().getId().equals(student.getId()) || submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Unauthorized or submission not in progress");
        }
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new RuntimeException("Question not found"));
        
        List<CodingTestCase> allCases = codingTestCaseRepository.findByQuestionId(questionId);
        
        CodeExecutionResultDTO result = codeExecutionService.execute(student, question, dto.getLanguage(), dto.getCode(), allCases);
        
        AnswerResponse answer = answerResponseRepository.findBySubmissionIdAndQuestionId(submissionId, questionId)
                .orElse(new AnswerResponse());
        
        if (answer.getId() == null) {
            answer.setSubmission(submission);
            answer.setQuestion(question);
        }
        
        answer.setCodeSubmitted(dto.getCode());
        
        if (result.isCompiled() && allCases.size() > 0) {
            int totalTestCases = allCases.size();
            long correctTestCaseCount = result.getResults().stream().filter(TestCaseResultDTO::isPassed).count();
            double totalMarks = question.getMarks() != null ? question.getMarks() : 0.0;
            double markPerTestCase = totalMarks / (double) totalTestCases;
            double score = (correctTestCaseCount == totalTestCases)
                    ? totalMarks
                    : (correctTestCaseCount * markPerTestCase);

            answer.setFinalScore(score);
            result.setMarksAwarded(score);
            result.setTotalMarks(totalMarks);
            result.setMarkPerTestCase(markPerTestCase);
            result.setCorrectTestCaseCount((int) correctTestCaseCount);
            result.setTotalTestCaseCount(totalTestCases);
        } else {
            answer.setFinalScore(0.0);
            result.setMarksAwarded(0.0);
            result.setTotalMarks(question.getMarks() != null ? question.getMarks() : 0.0);
            result.setMarkPerTestCase(allCases.size() > 0 && question.getMarks() != null ? (question.getMarks() / (double) allCases.size()) : 0.0);
            result.setCorrectTestCaseCount(0);
            result.setTotalTestCaseCount(allCases.size());
        }
        
        answerResponseRepository.save(answer);
        return result;
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
            dto.setIsMultipleAnswer(options.stream().filter(McqOption::isCorrect).count() > 1);
        } else if (q.getType() == QuestionType.CODING) {
            codingQuestionDetailRepository.findByQuestionId(q.getId()).ifPresent(detail -> {
                CodingQuestionDetailDTO detailDto = new CodingQuestionDetailDTO();
                detailDto.setId(detail.getId());
                detailDto.setProblemStatement(detail.getProblemStatement());
                detailDto.setInputDescription(detail.getInputDescription());
                detailDto.setOutputDescription(detail.getOutputDescription());
                detailDto.setConstraints(detail.getConstraints());
                detailDto.setSampleInput(detail.getSampleInput());
                detailDto.setSampleOutput(detail.getSampleOutput());
                detailDto.setAllowedLanguage(detail.getAllowedLanguage());
                dto.setCodingDetails(detailDto);
            });
            List<CodingTestCase> visibleCases = codingTestCaseRepository.findByQuestionIdAndIsHiddenFalse(q.getId());
            dto.setSampleTestCases(visibleCases.stream().map(tc -> {
                TestCaseDTO tcDto = new TestCaseDTO();
                tcDto.setId(tc.getId());
                tcDto.setInput(tc.getInput());
                tcDto.setExpectedOutput(tc.getExpectedOutput());
                tcDto.setHidden(false);
                return tcDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public com.psgtech.eduvault.dto.assessment.SubmissionDetailDTO getAssessmentResult(Long assessmentId, User student) {
        Submission submission = submissionRepository.findByAssessmentIdAndStudentId(assessmentId, student.getId())
            .orElseThrow(() -> new RuntimeException("Submission not found"));
            
        if (submission.getAssessment().getResultsPublishedAt() == null) {
            throw new RuntimeException("Results for this assessment have not been published yet.");
        }

        com.psgtech.eduvault.dto.assessment.SubmissionDetailDTO dto = new com.psgtech.eduvault.dto.assessment.SubmissionDetailDTO();
        dto.setId(submission.getId());
        dto.setAssessmentId(submission.getAssessment().getId());
        dto.setAssessmentTitle(submission.getAssessment().getTitle());
        dto.setStudentId(submission.getStudent().getId());
        dto.setStudentName(submission.getStudent().getName());
        dto.setStudentEmail(submission.getStudent().getEmail());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setStatus(submission.getStatus());
        dto.setTotalScore(submission.getTotalScore());

        List<AnswerResponse> answers = answerResponseRepository.findBySubmissionId(submission.getId());
        dto.setAnswers(answers.stream().map(ans -> {
            com.psgtech.eduvault.dto.assessment.AnswerResponseDTO ansDto = new com.psgtech.eduvault.dto.assessment.AnswerResponseDTO();
            ansDto.setId(ans.getId());
            ansDto.setQuestionId(ans.getQuestion().getId());
            ansDto.setQuestionType(ans.getQuestion().getType());
            ansDto.setQuestionText(ans.getQuestion().getText());
            ansDto.setQuestionMarks(ans.getQuestion().getMarks());

            if (ans.getQuestion().getType() == QuestionType.MCQ) {
                if (ans.getMcqSelectedOptions() != null) {
                    List<com.psgtech.eduvault.dto.assessment.McqOptionDTO> selectedOptDtos = ans.getMcqSelectedOptions().stream().map(o -> {
                        com.psgtech.eduvault.dto.assessment.McqOptionDTO opt = new com.psgtech.eduvault.dto.assessment.McqOptionDTO();
                        opt.setId(o.getId());
                        opt.setOptionText(o.getOptionText());
                        opt.setCorrect(o.isCorrect());
                        return opt;
                    }).collect(Collectors.toList());
                    ansDto.setMcqSelectedOptions(selectedOptDtos);
                    
                    List<McqOption> allOptions = mcqOptionRepository.findByQuestionId(ans.getQuestion().getId());
                    long correctCount = allOptions.stream().filter(McqOption::isCorrect).count();
                    long selectedCorrectCount = ans.getMcqSelectedOptions().stream().filter(McqOption::isCorrect).count();
                    long selectedWrongCount = ans.getMcqSelectedOptions().stream().filter(o -> !o.isCorrect()).count();
                    
                    ansDto.setIsMcqCorrect(correctCount > 0 && selectedCorrectCount == correctCount && selectedWrongCount == 0);
                }
            } else if (ans.getQuestion().getType() == QuestionType.DESCRIPTIVE) {
                ansDto.setDescriptiveText(ans.getDescriptiveText());
                // For result, student can see model answer
                descriptiveModelAnswerRepository.findByQuestionId(ans.getQuestion().getId())
                    .ifPresent(m -> ansDto.setModelAnswerText(m.getModelAnswerText()));
            } else if (ans.getQuestion().getType() == QuestionType.CODING) {
                ansDto.setCodeSubmitted(ans.getCodeSubmitted());
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
