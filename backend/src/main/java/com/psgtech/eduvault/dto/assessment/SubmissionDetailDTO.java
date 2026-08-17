package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.psgtech.eduvault.entity.SubmissionStatus;

@Data
public class SubmissionDetailDTO {
    private Long id;
    private Long assessmentId;
    private String assessmentTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDateTime submittedAt;
    private SubmissionStatus status;
    private Double totalScore;
    private List<AnswerResponseDTO> answers;
}
