package com.psgtech.eduvault.dto.assessment;

import lombok.Data;

@Data
public class DescriptiveQuestionCreateDTO {
    private String text;
    private Double marks;
    private String modelAnswer;
}
