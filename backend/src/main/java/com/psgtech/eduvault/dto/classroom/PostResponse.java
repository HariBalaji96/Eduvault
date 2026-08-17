package com.psgtech.eduvault.dto.classroom;
import com.psgtech.eduvault.entity.PostType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PostResponse {
    private Long id;
    private PostType type;
    private String content;
    private String attachmentUrl;
    private Long authorId;
    private String authorName;
    private LocalDateTime createdAt;
}
