package com.psgtech.eduvault.dto.classroom;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AssignmentSubmissionResponse {
    private Long id;
    private Long postId;
    private Long studentId;
    private String studentName;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private Double score;
    private String feedback;
}
