package com.psgtech.eduvault.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDTO {
    private Long id;
    private String input;
    private String expectedOutput;
    private boolean isHidden;

    public boolean isHidden() {
        return isHidden;
    }

    public void setHidden(boolean hidden) {
        this.isHidden = hidden;
    }

    public void setIsHidden(boolean hidden) {
        this.isHidden = hidden;
    }

    public boolean getIsHidden() {
        return isHidden;
    }
}
