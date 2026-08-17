package com.psgtech.eduvault.dto.classroom;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class StudentEnrollRequest {
    @NotEmpty
    private List<Long> studentIds;
}
