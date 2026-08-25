package com.psgtech.eduvault.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResultDTO {
    private boolean compiled;
    private String compileError;
    private List<TestCaseResultDTO> results;
}
