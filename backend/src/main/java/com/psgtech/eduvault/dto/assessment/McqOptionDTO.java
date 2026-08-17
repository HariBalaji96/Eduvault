package com.psgtech.eduvault.dto.assessment;

import lombok.Data;

@Data
public class McqOptionDTO {
    private Long id;
    private String optionText;
    private boolean isCorrect;
}
