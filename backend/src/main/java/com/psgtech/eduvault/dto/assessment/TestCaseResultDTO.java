package com.psgtech.eduvault.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResultDTO {
    private Long testCaseId;
    private boolean passed;
    private String actualOutput;
    private String stderr;
    private boolean isHidden;
}
