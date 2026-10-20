package com.psgtech.eduvault.dto.assessment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class McqOptionDTO {
    private Long id;
    private String optionText;

    @JsonProperty("isCorrect")
    private boolean isCorrect;

    @JsonProperty("isCorrect")
    public boolean isCorrect() {
        return isCorrect;
    }

    @JsonProperty("isCorrect")
    public void setIsCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public void setCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}
