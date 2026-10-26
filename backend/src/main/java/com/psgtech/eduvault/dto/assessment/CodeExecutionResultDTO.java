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
    private Integer currentStreak;
    private Integer highestStreak;
    private Boolean streakUpdated;
    private String streakMessage;

    // Mark allocation details based on test cases: (Total / Total Testcase) * Correct Count
    private Double marksAwarded;
    private Double totalMarks;
    private Double markPerTestCase;
    private Integer correctTestCaseCount;
    private Integer totalTestCaseCount;
}
