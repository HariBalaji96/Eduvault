package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.util.List;

@Data
public class McqQuestionCreateDTO {
    private String text;
    private Double marks;
    private List<McqOptionCreateDTO> options;
}
