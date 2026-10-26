package com.psgtech.eduvault.dto.classroom;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import java.util.List;
import lombok.Setter;

@Getter
@Setter
public class ClassroomRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String subject;
    private Long schoolClassId;
    private String description;
    private List<Long> studentIds;
}
