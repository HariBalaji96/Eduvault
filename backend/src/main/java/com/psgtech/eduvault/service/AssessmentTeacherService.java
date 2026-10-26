package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.assessment.*;
import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
    private final EmailNotificationService emailNotificationService;
    private final CodingQuestionDetailRepository codingQuestionDetailRepository;
    private final CodingTestCaseRepository codingTestCaseRepository;

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
        if (dto.getTotalMarks() == null || dto.getTotalMarks() <= 0) {
            throw new RuntimeException("Expected total marks must be greater than 0");
        }
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
        assessment.setDurationMinutes(dto.getDurationMinutes());
        assessment = assessmentRepository.save(assessment);

        return getAssessmentForTeacher(assessment.getId(), teacher);
    }

    @Transactional
    public QuestionTeacherDTO addMcqQuestion(Long assessmentId, McqQuestionCreateDTO dto, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        if (assessment.getPublishedAt() != null) {
            throw new RuntimeException("Cannot edit a published assessment");
        }

        if (dto.getText() == null || dto.getText().trim().isEmpty()) {
            throw new RuntimeException("Question text is required");
        }
        if (dto.getMarks() == null || dto.getMarks() <= 0) {
            throw new RuntimeException("Question marks must be greater than 0");
        }
        if (questionRepository.existsByAssessmentIdAndTextIgnoreCase(assessmentId, dto.getText().trim())) {
            throw new RuntimeException("A question with this text already exists in this assessment");
        }
        Double currentTotal = questionRepository.sumMarksByAssessmentId(assessmentId);
        if (currentTotal == null) currentTotal = 0.0;
        if (currentTotal + dto.getMarks() > assessment.getTotalMarks() + 0.001) {
            throw new RuntimeException("Adding " + dto.getMarks() + " marks would exceed expected total marks (" + assessment.getTotalMarks() + "). Remaining: " + (assessment.getTotalMarks() - currentTotal));
        }

        if (dto.getOptions() == null || dto.getOptions().size() < 2) {
            throw new RuntimeException("Multiple choice question must have at least 2 options");
        }
        boolean hasCorrect = dto.getOptions().stream().anyMatch(McqOptionCreateDTO::isCorrect);
        if (!hasCorrect) {
            throw new RuntimeException("At least one option must be marked as correct");
        }
        for (McqOptionCreateDTO opt : dto.getOptions()) {
            if (opt.getOptionText() == null || opt.getOptionText().trim().isEmpty()) {
                throw new RuntimeException("All options must have non-empty text");
            }
        }

        Question question = new Question();
        question.setAssessment(assessment);
        question.setType(QuestionType.MCQ);
        question.setText(dto.getText().trim());
        question.setMarks(dto.getMarks());
        question.setOrderIndex(questionRepository.countByAssessmentId(assessmentId) + 1);
        question = questionRepository.save(question);

        for (McqOptionCreateDTO optDto : dto.getOptions()) {
            McqOption option = new McqOption();
            option.setQuestion(question);
            option.setOptionText(optDto.getOptionText().trim());
            option.setCorrect(optDto.isCorrect());
            mcqOptionRepository.save(option);
        }

        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public QuestionTeacherDTO addDescriptiveQuestion(Long assessmentId, DescriptiveQuestionCreateDTO dto, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        if (assessment.getPublishedAt() != null) {
            throw new RuntimeException("Cannot edit a published assessment");
        }

        if (dto.getText() == null || dto.getText().trim().isEmpty()) {
            throw new RuntimeException("Question text is required");
        }
        if (dto.getMarks() == null || dto.getMarks() <= 0) {
            throw new RuntimeException("Question marks must be greater than 0");
        }
        if (questionRepository.existsByAssessmentIdAndTextIgnoreCase(assessmentId, dto.getText().trim())) {
            throw new RuntimeException("A question with this text already exists in this assessment");
        }
        Double currentTotal = questionRepository.sumMarksByAssessmentId(assessmentId);
        if (currentTotal == null) currentTotal = 0.0;
        if (currentTotal + dto.getMarks() > assessment.getTotalMarks() + 0.001) {
            throw new RuntimeException("Adding " + dto.getMarks() + " marks would exceed expected total marks (" + assessment.getTotalMarks() + "). Remaining: " + (assessment.getTotalMarks() - currentTotal));
        }
        if (dto.getModelAnswer() == null || dto.getModelAnswer().trim().isEmpty()) {
            throw new RuntimeException("Model answer is required for descriptive question");
        }

        Question question = new Question();
        question.setAssessment(assessment);
        question.setType(QuestionType.DESCRIPTIVE);
        question.setText(dto.getText().trim());
        question.setMarks(dto.getMarks());
        question.setOrderIndex(questionRepository.countByAssessmentId(assessmentId) + 1);
        question = questionRepository.save(question);

        DescriptiveModelAnswer modelAnswer = new DescriptiveModelAnswer();
        modelAnswer.setQuestion(question);
        modelAnswer.setModelAnswerText(dto.getModelAnswer().trim());
        descriptiveModelAnswerRepository.save(modelAnswer);

        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public QuestionTeacherDTO addCodingQuestion(Long assessmentId, CodingQuestionCreateDTO dto, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        if (assessment.getPublishedAt() != null) {
            throw new RuntimeException("Cannot edit a published assessment");
        }

        if (dto.getText() == null || dto.getText().trim().isEmpty()) {
            throw new RuntimeException("Question title/summary is required");
        }
        if (dto.getMarks() == null || dto.getMarks() <= 0) {
            throw new RuntimeException("Question marks must be greater than 0");
        }
        if (questionRepository.existsByAssessmentIdAndTextIgnoreCase(assessmentId, dto.getText().trim())) {
            throw new RuntimeException("A question with this title already exists in this assessment");
        }
        Double currentTotal = questionRepository.sumMarksByAssessmentId(assessmentId);
        if (currentTotal == null) currentTotal = 0.0;
        if (currentTotal + dto.getMarks() > assessment.getTotalMarks() + 0.001) {
            throw new RuntimeException("Adding " + dto.getMarks() + " marks would exceed expected total marks (" + assessment.getTotalMarks() + "). Remaining: " + (assessment.getTotalMarks() - currentTotal));
        }

        if (dto.getProblemStatement() == null || dto.getProblemStatement().trim().isEmpty()) {
            throw new RuntimeException("Problem statement is required");
        }
        if (dto.getTestCases() == null || dto.getTestCases().isEmpty()) {
            throw new RuntimeException("At least one testcase is required");
        }

        Question question = new Question();
        question.setAssessment(assessment);
        question.setType(QuestionType.CODING);
        question.setText(dto.getText().trim());
        question.setMarks(dto.getMarks());
        question.setOrderIndex(questionRepository.countByAssessmentId(assessmentId) + 1);
        question = questionRepository.save(question);

        CodingQuestionDetail detail = new CodingQuestionDetail();
        detail.setQuestion(question);
        detail.setProblemStatement(dto.getProblemStatement().trim());
        detail.setInputDescription(dto.getInputDescription() != null ? dto.getInputDescription().trim() : "");
        detail.setOutputDescription(dto.getOutputDescription() != null ? dto.getOutputDescription().trim() : "");
        detail.setConstraints(dto.getConstraints() != null ? dto.getConstraints().trim() : "");
        detail.setSampleInput(dto.getSampleInput() != null ? dto.getSampleInput().trim() : "");
        detail.setSampleOutput(dto.getSampleOutput() != null ? dto.getSampleOutput().trim() : "");
        detail.setAllowedLanguage(dto.getAllowedLanguage() != null && !dto.getAllowedLanguage().trim().isEmpty() ? dto.getAllowedLanguage().trim() : "java,javascript");
        codingQuestionDetailRepository.save(detail);

        for (TestCaseDTO tc : dto.getTestCases()) {
            CodingTestCase testCase = new CodingTestCase();
            testCase.setQuestion(question);
            testCase.setInput(tc.getInput() != null ? tc.getInput() : "");
            testCase.setExpectedOutput(tc.getExpectedOutput() != null ? tc.getExpectedOutput().trim() : "");
            testCase.setHidden(tc.isHidden());
            codingTestCaseRepository.save(testCase);
        }

        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public QuestionTeacherDTO updateQuestion(Long questionId, QuestionUpdateDTO dto, User teacher) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        Assessment assessment = getAndValidateAssessmentAccess(question.getAssessment().getId(), teacher);
        if (assessment.getPublishedAt() != null) {
            throw new RuntimeException("Cannot edit a published assessment");
        }

        if (dto.getText() == null || dto.getText().trim().isEmpty()) {
            throw new RuntimeException("Question text is required");
        }
        if (dto.getMarks() == null || dto.getMarks() <= 0) {
            throw new RuntimeException("Question marks must be greater than 0");
        }

        Double currentTotal = questionRepository.sumMarksByAssessmentId(assessment.getId());
        if (currentTotal == null) currentTotal = 0.0;
        double newTotal = currentTotal - question.getMarks() + dto.getMarks();
        if (newTotal > assessment.getTotalMarks() + 0.001) {
            throw new RuntimeException("Updated marks would exceed expected assessment total marks (" + assessment.getTotalMarks() + ")");
        }

        question.setText(dto.getText().trim());
        question.setMarks(dto.getMarks());
        questionRepository.save(question);
        
        return mapToQuestionTeacherDTO(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId, User teacher) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        Assessment assessment = getAndValidateAssessmentAccess(question.getAssessment().getId(), teacher);
        if (assessment.getPublishedAt() != null) {
            throw new RuntimeException("Cannot edit a published assessment");
        }
        
        if (question.getType() == QuestionType.MCQ) {
            List<McqOption> options = mcqOptionRepository.findByQuestionId(questionId);
            mcqOptionRepository.deleteAll(options);
        } else if (question.getType() == QuestionType.DESCRIPTIVE) {
            DescriptiveModelAnswer ans = descriptiveModelAnswerRepository.findByQuestionId(questionId).orElse(null);
            if (ans != null) {
                descriptiveModelAnswerRepository.delete(ans);
            }
        } else if (question.getType() == QuestionType.CODING) {
            codingTestCaseRepository.deleteByQuestionId(questionId);
            codingQuestionDetailRepository.deleteByQuestionId(questionId);
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
        
        Double totalQuestionsMarks = questionRepository.sumMarksByAssessmentId(assessmentId);
        if (totalQuestionsMarks == null || Math.abs(totalQuestionsMarks - assessment.getTotalMarks()) > 0.001) {
            throw new RuntimeException("Cannot publish: Total marks of created questions (" + (totalQuestionsMarks != null ? totalQuestionsMarks : 0.0) + ") must match expected total marks (" + assessment.getTotalMarks() + ").");
        }

        assessment.setPublishedAt(LocalDateTime.now());
        assessment = assessmentRepository.save(assessment);
        emailNotificationService.notifyStudentsAssessmentPublished(assessment);
        
        return getAssessmentForTeacher(assessmentId, teacher);
    }

    @Transactional
    public void deleteAssessment(Long assessmentId, User teacher) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        
        // Delete submissions and their answers first
        List<Submission> submissions = submissionRepository.findByAssessmentId(assessmentId);
        for (Submission sub : submissions) {
            List<AnswerResponse> answers = answerResponseRepository.findBySubmissionId(sub.getId());
            answerResponseRepository.deleteAll(answers);
        }
        submissionRepository.deleteAll(submissions);
        
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(assessmentId);
        for (Question q : questions) {
            if (q.getType() == QuestionType.MCQ) {
                List<McqOption> options = mcqOptionRepository.findByQuestionId(q.getId());
                mcqOptionRepository.deleteAll(options);
            } else if (q.getType() == QuestionType.DESCRIPTIVE) {
                DescriptiveModelAnswer ans = descriptiveModelAnswerRepository.findByQuestionId(q.getId()).orElse(null);
                if (ans != null) {
                    descriptiveModelAnswerRepository.delete(ans);
                }
            } else if (q.getType() == QuestionType.CODING) {
                codingTestCaseRepository.deleteByQuestionId(q.getId());
                codingQuestionDetailRepository.deleteByQuestionId(q.getId());
            }
            questionRepository.delete(q);
        }
        
        assessmentRepository.delete(assessment);
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
        dto.setDurationMinutes(assessment.getDurationMinutes());
        
        dto.setQuestions(questions.stream().map(this::mapToQuestionTeacherDTO).collect(Collectors.toList()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<AssessmentTeacherDTO> getClassroomAssessments(Long classroomId, User teacher) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        classroomTeacherRepository.findByClassroomAndTeacher(classroom, teacher)
                .orElseThrow(() -> new RuntimeException("Unauthorized to access this classroom"));
        
        List<Assessment> assessments = assessmentRepository.findByClassroomId(classroomId);
        return assessments.stream().map(assessment -> {
            AssessmentTeacherDTO dto = new AssessmentTeacherDTO();
            dto.setId(assessment.getId());
            dto.setTitle(assessment.getTitle());
            dto.setClassroomId(assessment.getClassroom().getId());
            dto.setClassroomName(assessment.getClassroom().getName());
            dto.setPublishedAt(assessment.getPublishedAt());
            dto.setDeadline(assessment.getDeadline());
            dto.setTotalMarks(assessment.getTotalMarks());
            dto.setDurationMinutes(assessment.getDurationMinutes());
            return dto;
        }).collect(Collectors.toList());
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
            List<CodingTestCase> testCases = codingTestCaseRepository.findByQuestionId(q.getId());
            dto.setTestCases(testCases.stream().map(tc -> {
                TestCaseDTO tcDto = new TestCaseDTO();
                tcDto.setId(tc.getId());
                tcDto.setInput(tc.getInput());
                tcDto.setExpectedOutput(tc.getExpectedOutput());
                tcDto.setHidden(tc.isHidden());
                return tcDto;
            }).collect(Collectors.toList()));
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
                if (ans.getMcqSelectedOptions() != null) {
                    List<McqOptionDTO> selectedOptDtos = ans.getMcqSelectedOptions().stream().map(o -> {
                        McqOptionDTO opt = new McqOptionDTO();
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

    @Transactional
    public void evaluateAnswer(Long answerId, AnswerEvaluationDTO dto, User teacher) {
        AnswerResponse answer = answerResponseRepository.findById(answerId)
            .orElseThrow(() -> new RuntimeException("Answer not found"));
        
        Submission submission = answer.getSubmission();
        getAndValidateAssessmentAccess(submission.getAssessment().getId(), teacher);

        answer.setTeacherOverrideScore(dto.getScore());
        answer.setTeacherFeedback(dto.getFeedback());
        answer.setFinalScore(dto.getScore());
        answerResponseRepository.save(answer);

        // Recalculate total score for submission from all answers
        List<AnswerResponse> allAnswers = answerResponseRepository.findBySubmissionId(submission.getId());
        double total = 0.0;
        for (AnswerResponse ans : allAnswers) {
            if (ans.getFinalScore() != null) {
                total += ans.getFinalScore();
            }
        }
        submission.setTotalScore(total);
        submissionRepository.save(submission);
    }

    @Transactional
    public void autoEvaluateSubmission(Long submissionId, User teacher, GeminiService geminiService) {
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        getAndValidateAssessmentAccess(submission.getAssessment().getId(), teacher);

        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(submission.getAssessment().getId());
        List<AnswerResponse> allAnswers = answerResponseRepository.findBySubmissionId(submissionId);

        Map<Long, AnswerResponse> answerMap = allAnswers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (a1, a2) -> a1));

        for (Question q : questions) {
            AnswerResponse ans = answerMap.get(q.getId());
            if (ans == null) {
                ans = new AnswerResponse();
                ans.setSubmission(submission);
                ans.setQuestion(q);
                ans.setFinalScore(0.0);
                ans = answerResponseRepository.save(ans);
                allAnswers.add(ans);
                answerMap.put(q.getId(), ans);
            }

            if (q.getType() == QuestionType.MCQ) {
                List<McqOption> allOptions = mcqOptionRepository.findByQuestionId(q.getId());
                long correctCount = allOptions.stream().filter(McqOption::isCorrect).count();
                List<McqOption> selected = ans.getMcqSelectedOptions();
                long selectedCorrectCount = selected != null ? selected.stream().filter(McqOption::isCorrect).count() : 0;
                long selectedWrongCount = selected != null ? selected.stream().filter(o -> !o.isCorrect()).count() : 0;

                boolean isCorrect = correctCount > 0 && selectedCorrectCount == correctCount && selectedWrongCount == 0;
                ans.setFinalScore(isCorrect ? q.getMarks() : 0.0);
                answerResponseRepository.save(ans);
            } else if (q.getType() == QuestionType.DESCRIPTIVE) {
                // Only auto-evaluate if teacher hasn't overridden
                if (ans.getTeacherOverrideScore() == null) {
                    String studentAnswer = ans.getDescriptiveText();
                    if (studentAnswer != null && !studentAnswer.trim().isEmpty()) {
                        DescriptiveModelAnswer modelAns = descriptiveModelAnswerRepository.findByQuestionId(q.getId()).orElse(null);
                        if (modelAns != null) {
                            try {
                                com.psgtech.eduvault.dto.AiEvaluationResultDTO result = geminiService.autoEvaluateDescriptiveAnswer(
                                        q.getText(),
                                        modelAns.getModelAnswerText(),
                                        studentAnswer,
                                        q.getMarks()
                                );
                                ans.setAiScore(result.getScore());
                                ans.setAiEvaluationNotes(result.getFeedback());
                                ans.setFinalScore(result.getScore());
                                answerResponseRepository.save(ans);
                            } catch (Exception e) {
                                System.err.println("Auto-evaluation failed for answer " + ans.getId() + ": " + e.getMessage());
                                ans.setAiScore(0.0);
                                ans.setAiEvaluationNotes("AI evaluation failed: " + e.getMessage());
                                ans.setFinalScore(0.0);
                                answerResponseRepository.save(ans);
                            }
                        } else {
                            ans.setAiScore(0.0);
                            ans.setFinalScore(0.0);
                            answerResponseRepository.save(ans);
                        }
                    } else {
                        ans.setAiScore(0.0);
                        ans.setAiEvaluationNotes("No answer provided.");
                        ans.setFinalScore(0.0);
                        answerResponseRepository.save(ans);
                    }
                }
            } else if (q.getType() == QuestionType.CODING) {
                if (ans.getFinalScore() == null) {
                    ans.setFinalScore(0.0);
                    answerResponseRepository.save(ans);
                }
            }
        }

        // Recalculate total score including both MCQ, Descriptive, and Coding
        double total = 0.0;
        for (AnswerResponse ans : allAnswers) {
            if (ans.getFinalScore() != null) {
                total += ans.getFinalScore();
            }
        }
        submission.setTotalScore(total);
        submissionRepository.save(submission);
    }

    @Transactional
    public void publishResults(Long assessmentId, User teacher, GeminiService geminiService) {
        Assessment assessment = getAndValidateAssessmentAccess(assessmentId, teacher);
        
        List<Submission> submissions = submissionRepository.findByAssessmentId(assessmentId);
        for (Submission sub : submissions) {
            if (sub.getStatus() == SubmissionStatus.IN_PROGRESS) {
                sub.setStatus(SubmissionStatus.SUBMITTED);
                sub.setSubmittedAt(LocalDateTime.now());
                submissionRepository.save(sub);
            }
            if (sub.getStatus() == SubmissionStatus.SUBMITTED) {
                autoEvaluateSubmission(sub.getId(), teacher, geminiService);
            }
        }
        
        assessment.setResultsPublishedAt(LocalDateTime.now());
        assessmentRepository.save(assessment);
    }
}
