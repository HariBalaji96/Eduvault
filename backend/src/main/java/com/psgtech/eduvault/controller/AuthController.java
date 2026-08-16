package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.auth.LoginRequest;
import com.psgtech.eduvault.dto.auth.LoginResponse;
import com.psgtech.eduvault.security.CustomUserDetails;
import com.psgtech.eduvault.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(userDetails);

        LoginResponse response = new LoginResponse(
                jwtToken,
                userDetails.getUser().getRole(),
                userDetails.getUser().getName(),
                userDetails.getUser().getEmail()
        );

        return ResponseEntity.ok(response);
    }
}
