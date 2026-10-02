package com.psgtech.eduvault.dto.classroom;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@Builder
public class ClassroomResponse {
    private Long id;
    private String name;
    private String subject;
    private Long schoolClassId;
    private String targetClassName;
    private String description;
    private Long createdById;
    private String createdByName;
    private java.time.LocalDateTime createdAt;
}
