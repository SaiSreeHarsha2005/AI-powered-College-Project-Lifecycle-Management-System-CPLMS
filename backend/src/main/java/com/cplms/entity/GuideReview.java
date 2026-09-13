package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "guide_reviews")
public class GuideReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "guide_email", nullable = false)
    private String guideEmail;

    @Column(name = "guide_name")
    private String guideName;

    @Column(name = "problem_score")
    private int problemScore;

    @Column(name = "methodology_score")
    private int methodologyScore;

    @Column(name = "feasibility_score")
    private int feasibilityScore;

    @Column(name = "innovation_score")
    private int innovationScore;

    @Column(name = "total_score")
    private int totalScore;

    private int percentage;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(nullable = false)
    private String decision; // APPROVED, REVISED, REJECTED

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    public GuideReview() {}

    public GuideReview(UUID projectId, String guideEmail, String guideName, int problemScore, int methodologyScore, int feasibilityScore, int innovationScore, String comments, String decision) {
        this.projectId = projectId;
        this.guideEmail = guideEmail;
        this.guideName = guideName;
        this.problemScore = problemScore;
        this.methodologyScore = methodologyScore;
        this.feasibilityScore = feasibilityScore;
        this.innovationScore = innovationScore;
        this.totalScore = problemScore + methodologyScore + feasibilityScore + innovationScore;
        this.percentage = Math.round(((float) this.totalScore / 20.0f) * 100);
        this.comments = comments;
        this.decision = decision;
        this.submittedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public String getGuideEmail() { return guideEmail; }
    public void setGuideEmail(String guideEmail) { this.guideEmail = guideEmail; }

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public int getProblemScore() { return problemScore; }
    public void setProblemScore(int problemScore) { this.problemScore = problemScore; }

    public int getMethodologyScore() { return methodologyScore; }
    public void setMethodologyScore(int methodologyScore) { this.methodologyScore = methodologyScore; }

    public int getFeasibilityScore() { return feasibilityScore; }
    public void setFeasibilityScore(int feasibilityScore) { this.feasibilityScore = feasibilityScore; }

    public int getInnovationScore() { return innovationScore; }
    public void setInnovationScore(int innovationScore) { this.innovationScore = innovationScore; }

    public int getTotalScore() { return totalScore; }
    public void setTotalScore(int totalScore) { this.totalScore = totalScore; }

    public int getPercentage() { return percentage; }
    public void setPercentage(int percentage) { this.percentage = percentage; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
