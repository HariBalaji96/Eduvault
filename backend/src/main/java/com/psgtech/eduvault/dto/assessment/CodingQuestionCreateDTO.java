package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.util.List;

@Data
public class CodingQuestionCreateDTO {
    private String text;
    private Double marks;
    private String problemStatement;
    private String inputDescription;
    private String outputDescription;
    private String constraints;
    private String sampleInput;
    private String sampleOutput;
    private String allowedLanguage;
    private List<TestCaseDTO> testCases;
}
