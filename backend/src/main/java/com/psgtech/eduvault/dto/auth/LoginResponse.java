package com.psgtech.eduvault.dto.auth;

import com.psgtech.eduvault.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Role role;
    private String name;
    private String email;
}
