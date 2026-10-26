package com.psgtech.eduvault.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingQuestionDetailDTO {
    private Long id;
    private String problemStatement;
    private String inputDescription;
    private String outputDescription;
    private String constraints;
    private String sampleInput;
    private String sampleOutput;
    private String allowedLanguage;
}
