package com.psgtech.eduvault.dto.streak;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStreakDTO {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String registrationId;
    private int currentStreak;
    private int highestStreak;
    private LocalDate lastActiveDate;
    private boolean activeToday;
    private String streakStatus; // ACTIVE, AT_RISK, BROKEN, INACTIVE
    private long totalExecutions;
    private String schoolClassName;
    private Integer rank;
    private String message;
    private List<LocalDate> recentActiveDates;
}
