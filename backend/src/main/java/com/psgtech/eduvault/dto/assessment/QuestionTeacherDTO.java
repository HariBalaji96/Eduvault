package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.util.List;
import com.psgtech.eduvault.entity.QuestionType;

@Data
public class QuestionTeacherDTO {
    private Long id;
    private QuestionType type;
    private String text;
    private Double marks;
    private Integer orderIndex;
    
    // For MCQ
    private List<McqOptionDTO> options;
    
    // For Descriptive
    private String modelAnswer;
}
