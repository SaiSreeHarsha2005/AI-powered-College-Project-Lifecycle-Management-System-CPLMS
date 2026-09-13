package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "milestone_reviews")
public class MilestoneReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "stage_name", nullable = false)
    private String stageName; // "REVIEW_1", "REVIEW_2", "REVIEW_3", "FINAL_VIVA"

    @Column(name = "stage_title", nullable = false)
    private String stageTitle;

    private LocalDateTime deadline;

    @Column(name = "submission_url")
    private String submissionUrl;

    @Column(name = "submission_notes", length = 1000)
    private String submissionNotes;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, SUBMITTED, EVALUATED

    private Integer innovationScore;     // 1-5
    private Integer designScore;         // 1-5
    private Integer implementationScore; // 1-5
    private Integer documentationScore;  // 1-5
    private Integer presentationScore;   // 1-5
    private Integer totalScore;          // out of 25

    @Column(name = "evaluator_email")
    private String evaluatorEmail;

    @Column(name = "evaluator_name")
    private String evaluatorName;

    @Column(name = "evaluator_feedback", length = 2000)
    private String evaluatorFeedback;

    private LocalDateTime submittedAt;
    private LocalDateTime evaluatedAt;

    public MilestoneReview() {}

    public MilestoneReview(UUID projectId, String stageName, String stageTitle, LocalDateTime deadline) {
        this.projectId = projectId;
        this.stageName = stageName;
        this.stageTitle = stageTitle;
        this.deadline = deadline;
        this.status = "PENDING";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }

    public String getStageTitle() { return stageTitle; }
    public void setStageTitle(String stageTitle) { this.stageTitle = stageTitle; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public String getSubmissionUrl() { return submissionUrl; }
    public void setSubmissionUrl(String submissionUrl) { this.submissionUrl = submissionUrl; }

    public String getSubmissionNotes() { return submissionNotes; }
    public void setSubmissionNotes(String submissionNotes) { this.submissionNotes = submissionNotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getInnovationScore() { return innovationScore; }
    public void setInnovationScore(Integer innovationScore) { this.innovationScore = innovationScore; }

    public Integer getDesignScore() { return designScore; }
    public void setDesignScore(Integer designScore) { this.designScore = designScore; }

    public Integer getImplementationScore() { return implementationScore; }
    public void setImplementationScore(Integer implementationScore) { this.implementationScore = implementationScore; }

    public Integer getDocumentationScore() { return documentationScore; }
    public void setDocumentationScore(Integer documentationScore) { this.documentationScore = documentationScore; }

    public Integer getPresentationScore() { return presentationScore; }
    public void setPresentationScore(Integer presentationScore) { this.presentationScore = presentationScore; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public String getEvaluatorEmail() { return evaluatorEmail; }
    public void setEvaluatorEmail(String evaluatorEmail) { this.evaluatorEmail = evaluatorEmail; }

    public String getEvaluatorName() { return evaluatorName; }
    public void setEvaluatorName(String evaluatorName) { this.evaluatorName = evaluatorName; }

    public String getEvaluatorFeedback() { return evaluatorFeedback; }
    public void setEvaluatorFeedback(String evaluatorFeedback) { this.evaluatorFeedback = evaluatorFeedback; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
