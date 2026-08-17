package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AssessmentCreateDTO {
    private String title;
    private Long classroomId;
    private Double totalMarks;
    private LocalDateTime deadline;
}
