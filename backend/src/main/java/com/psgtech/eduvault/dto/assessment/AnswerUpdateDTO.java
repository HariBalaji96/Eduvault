package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.util.List;

@Data
public class AnswerUpdateDTO {
    private List<Long> mcqSelectedOptionIds;
    private String descriptiveText;
}
