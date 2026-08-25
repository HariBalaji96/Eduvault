package com.psgtech.eduvault.dto.assessment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CodeSubmitRequest {
    @NotBlank
    private String language;
    
    @NotBlank
    private String code;
}
