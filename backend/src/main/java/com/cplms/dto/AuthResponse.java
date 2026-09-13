package com.cplms.dto;

import com.cplms.entity.Role;
import java.util.UUID;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String department;
    private String section;
    private boolean teamLead;

    public AuthResponse() {}

    public AuthResponse(String token, UUID id, String email, String fullName, String role, String department, String section, boolean teamLead) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.department = department;
        this.section = section;
        this.teamLead = teamLead;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(Role role) { this.role = role != null ? role.name() : null; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public boolean isTeamLead() { return teamLead; }
    public void setTeamLead(boolean teamLead) { this.teamLead = teamLead; }
}
