package com.psgtech.eduvault.dto.classroom;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClassroomRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String subject;
    private String description;
    @NotNull
    private Long schoolClassId;
}
