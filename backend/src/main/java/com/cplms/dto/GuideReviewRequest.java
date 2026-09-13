package com.cplms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class GuideReviewRequest {
    @Min(1) @Max(5)
    private int problemScore;

    @Min(1) @Max(5)
    private int methodologyScore;

    @Min(1) @Max(5)
    private int feasibilityScore;

    @Min(1) @Max(5)
    private int innovationScore;

    private String comments;

    @NotBlank(message = "Decision is required")
    private String decision; // APPROVED, REVISED, REJECTED

    public GuideReviewRequest() {}

    public int getProblemScore() { return problemScore; }
    public void setProblemScore(int problemScore) { this.problemScore = problemScore; }

    public int getMethodologyScore() { return methodologyScore; }
    public void setMethodologyScore(int methodologyScore) { this.methodologyScore = methodologyScore; }

    public int getFeasibilityScore() { return feasibilityScore; }
    public void setFeasibilityScore(int feasibilityScore) { this.feasibilityScore = feasibilityScore; }

    public int getInnovationScore() { return innovationScore; }
    public void setInnovationScore(int innovationScore) { this.innovationScore = innovationScore; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
}
