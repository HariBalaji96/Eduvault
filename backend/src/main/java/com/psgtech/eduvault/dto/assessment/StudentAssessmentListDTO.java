package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.time.LocalDateTime;
import com.psgtech.eduvault.entity.SubmissionStatus;

@Data
public class StudentAssessmentListDTO {
    private Long id;
    private String title;
    private Long classroomId;
    private String classroomName;
    private LocalDateTime publishedAt;
    private LocalDateTime deadline;
    private Double totalMarks;
    private SubmissionStatus status; // NOT_STARTED, IN_PROGRESS, SUBMITTED
}
