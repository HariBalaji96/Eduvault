package com.psgtech.eduvault.dto.classroom;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CollaboratorRequest {
    @NotNull
    private Long teacherId;
}
