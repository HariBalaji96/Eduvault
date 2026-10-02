package com.psgtech.eduvault.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "answer_response_mcq_options",
        joinColumns = @JoinColumn(name = "answer_response_id"),
        inverseJoinColumns = @JoinColumn(name = "mcq_option_id")
    )
    private List<McqOption> mcqSelectedOptions;

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
