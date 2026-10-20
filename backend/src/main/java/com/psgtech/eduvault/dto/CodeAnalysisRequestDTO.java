package com.psgtech.eduvault.dto;

import lombok.Data;

@Data
public class CodeAnalysisRequestDTO {
    private String code;
    private String language;
}
