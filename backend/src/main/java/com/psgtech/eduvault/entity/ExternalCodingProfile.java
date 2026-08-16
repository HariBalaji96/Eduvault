package com.psgtech.eduvault.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalCodingProfile extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private int problemsSolved;

    @Column(nullable = false)
    private int easySolved;

    @Column(nullable = false)
    private int mediumSolved;

    @Column(nullable = false)
    private int hardSolved;

    private Double contestRating;

    private LocalDateTime lastSyncedAt;
}
