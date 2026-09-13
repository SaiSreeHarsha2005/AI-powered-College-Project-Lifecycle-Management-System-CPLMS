package com.cplms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SsoLoginRequest {

    @NotBlank(message = "SSO provider is required (MICROSOFT or GOOGLE)")
    private String provider; // "MICROSOFT" or "GOOGLE"

    @NotBlank(message = "Institutional email is required")
    @Email(message = "Must be a valid institutional email address")
    private String email;

    private String fullName;
    private String department;
    private String section;
    private String idToken;

    public SsoLoginRequest() {}

    public SsoLoginRequest(String provider, String email, String fullName, String department, String section) {
        this.provider = provider;
        this.email = email;
        this.fullName = fullName;
        this.department = department;
        this.section = section;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
