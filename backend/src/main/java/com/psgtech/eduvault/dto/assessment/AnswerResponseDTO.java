package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import com.psgtech.eduvault.entity.QuestionType;

@Data
public class AnswerResponseDTO {
    private Long id;
    private Long questionId;
    private QuestionType questionType;
    private String questionText;
    private Double questionMarks;
    
    // For MCQ
    private Long mcqSelectedOptionId;
    private String mcqSelectedOptionText;
    private Boolean isMcqCorrect;
    
    // For Descriptive
    private String descriptiveText;
    private String modelAnswerText;
    
    private Double aiScore;
    private String aiEvaluationNotes;
    private Double teacherOverrideScore;
    private String teacherFeedback;
    private Double finalScore;
}
