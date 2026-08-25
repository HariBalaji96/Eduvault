package com.psgtech.eduvault.dto.assessment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TestCaseDTO {
    @NotBlank
    private String input;
    
    @NotBlank
    private String expectedOutput;
}
