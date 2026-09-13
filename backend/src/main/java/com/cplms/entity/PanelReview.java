package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "panel_reviews")
public class PanelReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String panelistEmail;

    @Column(nullable = false)
    private String panelistName;

    private Integer rubricProblemScore;      // 1-5
    private Integer rubricMethodologyScore;  // 1-5
    private Integer rubricFeasibilityScore;  // 1-5
    private Integer rubricInnovationScore;   // 1-5

    @Column(length = 2000)
    private String comments;

    @Column(nullable = false)
    private String decision; // "APPROVED", "REVISION", "REJECTED"

    private LocalDateTime submittedAt = LocalDateTime.now();

    public PanelReview() {
    }

    public PanelReview(UUID projectId, String panelistEmail, String panelistName,
                       Integer rubricProblemScore, Integer rubricMethodologyScore,
                       Integer rubricFeasibilityScore, Integer rubricInnovationScore,
                       String comments, String decision) {
        this.projectId = projectId;
        this.panelistEmail = panelistEmail;
        this.panelistName = panelistName;
        this.rubricProblemScore = rubricProblemScore;
        this.rubricMethodologyScore = rubricMethodologyScore;
        this.rubricFeasibilityScore = rubricFeasibilityScore;
        this.rubricInnovationScore = rubricInnovationScore;
        this.comments = comments;
        this.decision = decision;
        this.submittedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getPanelistEmail() {
        return panelistEmail;
    }

    public void setPanelistEmail(String panelistEmail) {
        this.panelistEmail = panelistEmail;
    }

    public String getPanelistName() {
        return panelistName;
    }

    public void setPanelistName(String panelistName) {
        this.panelistName = panelistName;
    }

    public Integer getRubricProblemScore() {
        return rubricProblemScore;
    }

    public void setRubricProblemScore(Integer rubricProblemScore) {
        this.rubricProblemScore = rubricProblemScore;
    }

    public Integer getRubricMethodologyScore() {
        return rubricMethodologyScore;
    }

    public void setRubricMethodologyScore(Integer rubricMethodologyScore) {
        this.rubricMethodologyScore = rubricMethodologyScore;
    }

    public Integer getRubricFeasibilityScore() {
        return rubricFeasibilityScore;
    }

    public void setRubricFeasibilityScore(Integer rubricFeasibilityScore) {
        this.rubricFeasibilityScore = rubricFeasibilityScore;
    }

    public Integer getRubricInnovationScore() {
        return rubricInnovationScore;
    }

    public void setRubricInnovationScore(Integer rubricInnovationScore) {
        this.rubricInnovationScore = rubricInnovationScore;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public double getAverageScore() {
        int count = 0;
        double sum = 0;
        if (rubricProblemScore != null) { sum += rubricProblemScore; count++; }
        if (rubricMethodologyScore != null) { sum += rubricMethodologyScore; count++; }
        if (rubricFeasibilityScore != null) { sum += rubricFeasibilityScore; count++; }
        if (rubricInnovationScore != null) { sum += rubricInnovationScore; count++; }
        return count > 0 ? (sum / count) : 0.0;
    }
}
