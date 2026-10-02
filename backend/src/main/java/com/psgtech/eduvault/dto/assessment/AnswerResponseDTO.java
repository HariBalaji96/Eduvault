package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.util.List;
import com.psgtech.eduvault.entity.QuestionType;

@Data
public class AnswerResponseDTO {
    private Long id;
    private Long questionId;
    private QuestionType questionType;
    private String questionText;
    private Double questionMarks;
    
    // For MCQ
    private List<McqOptionDTO> mcqSelectedOptions;
    private Boolean isMcqCorrect;
    
    // For Descriptive
    private String descriptiveText;
    private String modelAnswerText;
    
    // For Coding
    private String codeSubmitted;
    
    private Double aiScore;
    private String aiEvaluationNotes;
    private Double teacherOverrideScore;
    private String teacherFeedback;
    private Double finalScore;
}
