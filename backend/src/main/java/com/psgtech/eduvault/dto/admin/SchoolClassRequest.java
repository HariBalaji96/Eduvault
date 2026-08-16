package com.psgtech.eduvault.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SchoolClassRequest {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotNull(message = "Academic Year ID cannot be null")
    private Long academicYearId;
}
