package com.psgtech.eduvault.dto.classroom;
import com.psgtech.eduvault.entity.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class PostRequest {
    @NotNull
    private PostType type;
    @NotBlank
    private String content;
    private String title;
    private LocalDateTime dueDate;
    private String attachmentUrl;
}
