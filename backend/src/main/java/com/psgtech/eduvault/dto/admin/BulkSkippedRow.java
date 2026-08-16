package com.psgtech.eduvault.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BulkSkippedRow {
    private UserRequest row;
    private String reason;
}
