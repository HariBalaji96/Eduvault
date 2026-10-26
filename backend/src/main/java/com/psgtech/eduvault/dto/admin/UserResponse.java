package com.psgtech.eduvault.dto.admin;

import com.psgtech.eduvault.entity.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;

    private String registrationId;
    
    private Long schoolClassId;
    private String schoolClassName;

    private int currentStreak;
    private int highestStreak;
    private java.time.LocalDate lastActiveDate;
    private boolean activeToday;
    private String streakStatus;
}

