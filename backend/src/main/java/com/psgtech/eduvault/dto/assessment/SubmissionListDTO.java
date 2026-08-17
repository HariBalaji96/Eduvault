package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.time.LocalDateTime;
import com.psgtech.eduvault.entity.SubmissionStatus;

@Data
public class SubmissionListDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDateTime submittedAt;
    private SubmissionStatus status;
    private Double totalScore;
}
