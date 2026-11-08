package com.logistics.security;

import com.logistics.security.dto.AuthResponse;
import com.logistics.security.dto.CustomerLoginRequest;
import com.logistics.security.dto.LoginRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

/**
 * Authentication Controller.
 * Handles team login, customer login, and current authenticated user retrieval.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Team member login (ADMIN, SUPPORT, INVESTIGATOR).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticateUser(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Customer login (Email + Order ID).
     */
    @PostMapping("/customer/login")
    public ResponseEntity<AuthResponse> customerLogin(@Valid @RequestBody CustomerLoginRequest request) {
        AuthResponse response = authService.authenticateCustomer(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Current authenticated user profile.
     */
    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Unauthorized"));
        }
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getCurrentUser(email));
    }
}
