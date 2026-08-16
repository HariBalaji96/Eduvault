package com.psgtech.eduvault.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AcademicYearRequest {
    @NotBlank(message = "Year label cannot be blank")
    private String yearLabel;
}
