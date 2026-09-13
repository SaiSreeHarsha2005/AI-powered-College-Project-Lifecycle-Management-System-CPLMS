package com.cplms;

import com.cplms.entity.MilestoneReview;
import com.cplms.entity.User;
import com.cplms.entity.Role;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class ApplicationTests {

    @Test
    void testUserSkillsAndProfileFields() {
        User user = new User();
        user.setEmail("faculty.test@gcet.edu.in");
        user.setFullName("Dr. Tester");
        user.setRole(Role.ROLE_INTERNAL_GUIDE);
        user.setSkills("Python, FastAPI, Spring Boot, PyTorch");
        user.setResearchInterests("Edge AI, Distributed Systems");
        user.setExperienceYears(8);
        user.setLinkedinUrl("https://linkedin.com/in/drtester");
        user.setGithubUrl("https://github.com/drtester");

        assertEquals("Dr. Tester", user.getFullName());
        assertEquals("Python, FastAPI, Spring Boot, PyTorch", user.getSkills());
        assertEquals("Edge AI, Distributed Systems", user.getResearchInterests());
        assertEquals(8, user.getExperienceYears());
        assertEquals(Role.ROLE_INTERNAL_GUIDE, user.getRole());
    }

    @Test
    void testMilestoneReviewRubricCalculation() {
        MilestoneReview review = new MilestoneReview();
        review.setProjectId(UUID.randomUUID());
        review.setStageName("REVIEW_1");
        review.setStageTitle("Review 1: Synopsis & Architecture");
        review.setInnovationScore(4);
        review.setDesignScore(5);
        review.setImplementationScore(4);
        review.setDocumentationScore(4);
        review.setPresentationScore(5);

        // Calculate total CIE rubric score out of 25
        int total = review.getInnovationScore() +
                review.getDesignScore() +
                review.getImplementationScore() +
                review.getDocumentationScore() +
                review.getPresentationScore();
        review.setTotalScore(total);
        review.setStatus("EVALUATED");

        assertEquals(22, review.getTotalScore());
        assertEquals("REVIEW_1", review.getStageName());
        assertEquals("EVALUATED", review.getStatus());
    }

    @Test
    void testSsoRequestAndRoleInference() {
        com.cplms.dto.SsoLoginRequest studentReq = new com.cplms.dto.SsoLoginRequest(
                "MICROSOFT",
                "saisa.student@gcet.edu.in",
                "Saisa Student",
                "CSE",
                "Section A"
        );
        assertEquals("MICROSOFT", studentReq.getProvider());
        assertEquals("saisa.student@gcet.edu.in", studentReq.getEmail());
        assertEquals("Saisa Student", studentReq.getFullName());

        com.cplms.dto.SsoLoginRequest facultyReq = new com.cplms.dto.SsoLoginRequest(
                "GOOGLE",
                "faculty.guide@gcet.edu.in",
                "Dr. Guide",
                "CSE",
                "Section B"
        );
        assertEquals("GOOGLE", facultyReq.getProvider());
        assertTrue(facultyReq.getEmail().contains("guide"));
    }

    @Test
    void testApiErrorResponseAndExceptionHandling() {
        com.cplms.dto.ApiErrorResponse err = new com.cplms.dto.ApiErrorResponse(
                404,
                "Resource Not Found",
                "Project with specified ID does not exist",
                "/api/projects/123"
        );
        assertEquals(404, err.getStatus());
        assertEquals("Resource Not Found", err.getError());
        assertEquals("Project with specified ID does not exist", err.getMessage());
        assertEquals("/api/projects/123", err.getPath());
        assertNotNull(err.getTimestamp());

        com.cplms.exception.ResourceNotFoundException ex = new com.cplms.exception.ResourceNotFoundException("Team not found");
        assertEquals("Team not found", ex.getMessage());

        com.cplms.exception.BadRequestException badReqEx = new com.cplms.exception.BadRequestException("Team size must be between 2 and 4");
        assertEquals("Team size must be between 2 and 4", badReqEx.getMessage());
    }
}
