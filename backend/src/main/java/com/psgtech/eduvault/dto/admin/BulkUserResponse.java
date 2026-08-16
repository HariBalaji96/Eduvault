package com.psgtech.eduvault.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class BulkUserResponse {
    private List<UserResponse> created;
    private List<BulkSkippedRow> skipped;
}
