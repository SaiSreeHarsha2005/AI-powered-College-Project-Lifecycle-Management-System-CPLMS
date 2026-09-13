package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "problem_statement", columnDefinition = "TEXT", nullable = false)
    private String problemStatement;

    @Column(name = "proposed_solution", columnDefinition = "TEXT", nullable = false)
    private String proposedSolution;

    private String domain;

    @Column(name = "project_type")
    private String projectType; // "Mini" or "Major"

    @Column(name = "tech_stack")
    private String techStack;

    private String keywords;

    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REVISE_REQUESTED, REJECTED

    @Column(name = "team_name")
    private String teamName;

    @Column(name = "team_lead_email")
    private String teamLeadEmail;

    private String section;

    @Column(name = "assigned_guide_email")
    private String assignedGuideEmail;

    @Column(name = "assigned_guide_name")
    private String assignedGuideName;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "github_repo_url")
    private String githubRepoUrl;

    @Column(name = "demo_video_url")
    private String demoVideoUrl;

    @Column(name = "final_report_url")
    private String finalReportUrl;

    @Column(name = "presentation_url")
    private String presentationUrl;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by")
    private String completedBy;

    @Column(name = "current_version")
    private int currentVersion = 1;

    @Column(name = "sla_days_pending")
    private Integer slaDaysPending = 0;

    @Column(name = "is_sla_breached")
    private boolean slaBreached = false;

    @Column(name = "escalation_tier")
    private Integer escalationTier = 0;

    public Project() {}

    public Project(String title, String problemStatement, String proposedSolution, String domain, String projectType, String techStack, String keywords, String teamName, String teamLeadEmail, String section) {
        this.title = title;
        this.problemStatement = problemStatement;
        this.proposedSolution = proposedSolution;
        this.domain = domain;
        this.projectType = projectType;
        this.techStack = techStack;
        this.keywords = keywords;
        this.teamName = teamName;
        this.teamLeadEmail = teamLeadEmail;
        this.section = section;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getProposedSolution() { return proposedSolution; }
    public void setProposedSolution(String proposedSolution) { this.proposedSolution = proposedSolution; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getProjectType() { return projectType; }
    public void setProjectType(String projectType) { this.projectType = projectType; }

    public String getTechStack() { return techStack; }
    public void setTechStack(String techStack) { this.techStack = techStack; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamLeadEmail() { return teamLeadEmail; }
    public void setTeamLeadEmail(String teamLeadEmail) { this.teamLeadEmail = teamLeadEmail; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getAssignedGuideEmail() { return assignedGuideEmail; }
    public void setAssignedGuideEmail(String assignedGuideEmail) { this.assignedGuideEmail = assignedGuideEmail; }

    public String getAssignedGuideName() { return assignedGuideName; }
    public void setAssignedGuideName(String assignedGuideName) { this.assignedGuideName = assignedGuideName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getGithubRepoUrl() { return githubRepoUrl; }
    public void setGithubRepoUrl(String githubRepoUrl) { this.githubRepoUrl = githubRepoUrl; }

    public String getDemoVideoUrl() { return demoVideoUrl; }
    public void setDemoVideoUrl(String demoVideoUrl) { this.demoVideoUrl = demoVideoUrl; }

    public String getFinalReportUrl() { return finalReportUrl; }
    public void setFinalReportUrl(String finalReportUrl) { this.finalReportUrl = finalReportUrl; }

    public String getPresentationUrl() { return presentationUrl; }
    public void setPresentationUrl(String presentationUrl) { this.presentationUrl = presentationUrl; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getCompletedBy() { return completedBy; }
    public void setCompletedBy(String completedBy) { this.completedBy = completedBy; }

    public int getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(int currentVersion) { this.currentVersion = currentVersion; }

    public Integer getSlaDaysPending() { return slaDaysPending; }
    public void setSlaDaysPending(Integer slaDaysPending) { this.slaDaysPending = slaDaysPending; }

    public boolean isSlaBreached() { return slaBreached; }
    public void setSlaBreached(boolean slaBreached) { this.slaBreached = slaBreached; }

    public Integer getEscalationTier() { return escalationTier; }
    public void setEscalationTier(Integer escalationTier) { this.escalationTier = escalationTier; }
}
