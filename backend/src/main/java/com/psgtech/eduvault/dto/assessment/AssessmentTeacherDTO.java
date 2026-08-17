package com.psgtech.eduvault.dto.assessment;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AssessmentTeacherDTO {
    private Long id;
    private String title;
    private Long classroomId;
    private String classroomName;
    private LocalDateTime publishedAt;
    private LocalDateTime deadline;
    private Double totalMarks;
    private List<QuestionTeacherDTO> questions;
}
