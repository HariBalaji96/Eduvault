package com.psgtech.eduvault.dto.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SchoolClassResponse {
    private Long id;
    private String name;
    private Long academicYearId;
    private String batchName;
    private String yearLabel;
}
