package com.psgtech.eduvault.dto.assessment;

import lombok.Data;

@Data
public class AnswerUpdateDTO {
    private Long mcqSelectedOptionId;
    private String descriptiveText;
}
