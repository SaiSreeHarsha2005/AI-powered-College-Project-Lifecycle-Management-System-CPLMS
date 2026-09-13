package com.cplms.controller;

import com.cplms.entity.User;
import com.cplms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(user);
    }

    public static class ProfileUpdateRequest {
        public String fullName;
        public String phone;
        public String skills;
        public String researchInterests;
        public Integer experienceYears;
        public String linkedinUrl;
        public String githubUrl;
        public String resumeUrl;
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileUpdateRequest req) {
        User user = getAuthenticatedUser();
        if (req.fullName != null) user.setFullName(req.fullName);
        if (req.phone != null) user.setPhone(req.phone);
        if (req.skills != null) user.setSkills(req.skills);
        if (req.researchInterests != null) user.setResearchInterests(req.researchInterests);
        if (req.experienceYears != null) user.setExperienceYears(req.experienceYears);
        if (req.linkedinUrl != null) user.setLinkedinUrl(req.linkedinUrl);
        if (req.githubUrl != null) user.setGithubUrl(req.githubUrl);
        if (req.resumeUrl != null) user.setResumeUrl(req.resumeUrl);

        User updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }
}
