package com.psgtech.eduvault.dto.classroom;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ClassroomResponse {
    private Long id;
    private String name;
    private String subject;
    private String description;
    private Long schoolClassId;
    private String schoolClassName;
    private Long createdById;
    private String createdByName;
}
