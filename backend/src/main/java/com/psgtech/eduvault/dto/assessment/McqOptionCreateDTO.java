package com.psgtech.eduvault.dto.assessment;

import lombok.Data;

@Data
public class McqOptionCreateDTO {
    private String optionText;
    private boolean isCorrect;
}
