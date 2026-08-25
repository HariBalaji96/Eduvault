package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.assessment.TestCaseDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticeExecuteRequest {
    @NotBlank
    private String language;
    
    @NotBlank
    private String code;
    
    private String input;
}
