package com.cplms.service;

import com.cplms.dto.AuthRequest;
import com.cplms.dto.AuthResponse;
import com.cplms.dto.RegisterRequest;
import com.cplms.dto.SsoLoginRequest;
import com.cplms.dto.UserDto;
import com.cplms.entity.AuditLog;
import com.cplms.entity.Role;
import com.cplms.entity.User;
import com.cplms.repository.AuditLogRepository;
import com.cplms.repository.UserRepository;
import com.cplms.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       AuditLogRepository auditLogRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        // Audit Log
        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "LOGIN_SUCCESS",
                "USER",
                user.getId().toString(),
                "User successfully logged in with role: " + user.getRole().name()
        ));

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getDepartment(),
                user.getSection(),
                user.isTeamLead()
        );
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment());
        user.setRollNumber(request.getRollNumber());
        user.setPhone(request.getPhone());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Audit Log
        auditLogRepository.save(new AuditLog(
                savedUser.getEmail(),
                "USER_REGISTERED",
                "USER",
                savedUser.getId().toString(),
                "Account created with role: " + savedUser.getRole().name()
        ));

        return UserDto.fromEntity(savedUser);
    }

    public UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return UserDto.fromEntity(user);
    }

    @Transactional
    public AuthResponse ssoLogin(SsoLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String provider = request.getProvider() != null ? request.getProvider().toUpperCase() : "INSTITUTIONAL";

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // Just-In-Time (JIT) Institutional User Provisioning
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode("SSO_MANAGED_" + UUID.randomUUID()));

            String name = request.getFullName();
            if (name == null || name.isBlank()) {
                String localPart = email.split("@")[0];
                name = localPart.replace(".", " ").substring(0, 1).toUpperCase() +
                       (localPart.length() > 1 ? localPart.replace(".", " ").substring(1) : "");
            }
            newUser.setFullName(name);

            // Intelligently infer role from institutional email or designation
            if (email.contains("guide") || email.contains("faculty") || email.contains("prof")) {
                newUser.setRole(Role.ROLE_INTERNAL_GUIDE);
            } else if (email.contains("coord") || email.contains("hod")) {
                newUser.setRole(Role.ROLE_SECTION_COORDINATOR);
            } else if (email.contains("panel")) {
                newUser.setRole(Role.ROLE_PANEL);
            } else if (email.contains("admin")) {
                newUser.setRole(Role.ROLE_ADMIN);
            } else {
                newUser.setRole(Role.ROLE_STUDENT);
            }

            newUser.setDepartment(request.getDepartment() != null ? request.getDepartment() : "CSE");
            newUser.setSection(request.getSection() != null ? request.getSection() : "Section A");
            newUser.setActive(true);

            User saved = userRepository.save(newUser);

            // Audit Log for JIT Provisioning
            auditLogRepository.save(new AuditLog(
                    email,
                    "SSO_USER_PROVISIONED",
                    "USER",
                    saved.getId().toString(),
                    "Auto-provisioned institutional user account via " + provider + " SSO with role: " + saved.getRole().name()
            ));

            return saved;
        });

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        // Audit Log for SSO login
        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "SSO_LOGIN_SUCCESS",
                "USER",
                user.getId().toString(),
                "Logged in via Institutional " + provider + " Single Sign-On"
        ));

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getDepartment(),
                user.getSection(),
                user.isTeamLead()
        );
    }
}
