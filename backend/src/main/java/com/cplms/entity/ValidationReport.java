package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "validation_reports")
public class ValidationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "similarity_percentage")
    private double similarityPercentage;

    @Column(name = "is_duplicate_risk")
    private boolean duplicateRisk;

    @Column(name = "novelty_score")
    private double noveltyScore;

    @Column(name = "complexity_score")
    private double complexityScore;

    @Column(name = "scope_evaluation")
    private String scopeEvaluation;

    @Column(name = "novelty_summary", columnDefinition = "TEXT")
    private String noveltySummary;

    @Column(name = "closest_matches_json", columnDefinition = "TEXT")
    private String closestMatchesJson;

    @Column(name = "alternative_directions_json", columnDefinition = "TEXT")
    private String alternativeDirectionsJson;

    @Column(name = "attributed_features_json", columnDefinition = "TEXT")
    private String attributedFeaturesJson;

    @Column(name = "risk_level")
    private String riskLevel = "LOW";

    @Column(name = "risk_summary", columnDefinition = "TEXT")
    private String riskSummary;

    @Column(name = "timeline_feasibility")
    private String timelineFeasibility;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    public ValidationReport() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public double getSimilarityPercentage() { return similarityPercentage; }
    public void setSimilarityPercentage(double similarityPercentage) { this.similarityPercentage = similarityPercentage; }

    public boolean isDuplicateRisk() { return duplicateRisk; }
    public void setDuplicateRisk(boolean duplicateRisk) { this.duplicateRisk = duplicateRisk; }

    public double getNoveltyScore() { return noveltyScore; }
    public void setNoveltyScore(double noveltyScore) { this.noveltyScore = noveltyScore; }

    public double getComplexityScore() { return complexityScore; }
    public void setComplexityScore(double complexityScore) { this.complexityScore = complexityScore; }

    public String getScopeEvaluation() { return scopeEvaluation; }
    public void setScopeEvaluation(String scopeEvaluation) { this.scopeEvaluation = scopeEvaluation; }

    public String getNoveltySummary() { return noveltySummary; }
    public void setNoveltySummary(String noveltySummary) { this.noveltySummary = noveltySummary; }

    public String getClosestMatchesJson() { return closestMatchesJson; }
    public void setClosestMatchesJson(String closestMatchesJson) { this.closestMatchesJson = closestMatchesJson; }

    public String getAlternativeDirectionsJson() { return alternativeDirectionsJson; }
    public void setAlternativeDirectionsJson(String alternativeDirectionsJson) { this.alternativeDirectionsJson = alternativeDirectionsJson; }

    public String getAttributedFeaturesJson() { return attributedFeaturesJson; }
    public void setAttributedFeaturesJson(String attributedFeaturesJson) { this.attributedFeaturesJson = attributedFeaturesJson; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskSummary() { return riskSummary; }
    public void setRiskSummary(String riskSummary) { this.riskSummary = riskSummary; }

    public String getTimelineFeasibility() { return timelineFeasibility; }
    public void setTimelineFeasibility(String timelineFeasibility) { this.timelineFeasibility = timelineFeasibility; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
