package com.psgtech.eduvault.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponse extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mcq_selected_option_id")
    private McqOption mcqSelectedOption;

    @Column(columnDefinition = "TEXT")
    private String descriptiveText;

    @Column(columnDefinition = "TEXT")
    private String codeSubmitted;

    private Double aiScore;

    @Column(columnDefinition = "TEXT")
    private String aiEvaluationNotes;

    private Double teacherOverrideScore;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;

    private Double finalScore;
}
