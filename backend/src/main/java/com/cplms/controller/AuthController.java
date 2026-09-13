package com.cplms.controller;

import com.cplms.dto.AuthRequest;
import com.cplms.dto.AuthResponse;
import com.cplms.dto.RegisterRequest;
import com.cplms.dto.SsoLoginRequest;
import com.cplms.dto.UserDto;
import com.cplms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication & Identity", description = "Endpoints for login, registration, and session info")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login and obtain JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/sso/institutional-login")
    @Operation(summary = "Institutional Single Sign-On (Microsoft 365 / Google Workspace)")
    public ResponseEntity<AuthResponse> institutionalSsoLogin(@Valid @RequestBody SsoLoginRequest request) {
        return ResponseEntity.ok(authService.ssoLogin(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
