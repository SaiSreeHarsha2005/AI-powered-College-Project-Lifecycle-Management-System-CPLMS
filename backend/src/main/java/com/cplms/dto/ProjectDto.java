package com.cplms.dto;

import com.cplms.entity.GuideReview;
import com.cplms.entity.Project;
import com.cplms.entity.ValidationReport;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProjectDto {
    private UUID id;
    private String title;
    private String problemStatement;
    private String proposedSolution;
    private String domain;
    private String projectType;
    private String techStack;
    private String keywords;
    private String status;
    private String teamName;
    private String teamLeadEmail;
    private String section;
    private String assignedGuideEmail;
    private String assignedGuideName;
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private ValidationReport validationReport;
    private GuideReview guideReview;
    private String githubRepoUrl;
    private String demoVideoUrl;
    private String finalReportUrl;
    private String presentationUrl;
    private LocalDateTime completedAt;
    private String completedBy;
    private int currentVersion;
    private Integer slaDaysPending;
    private boolean slaBreached;
    private Integer escalationTier;

    public ProjectDto() {}

    public static ProjectDto fromEntity(Project project, ValidationReport report, GuideReview review) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setProblemStatement(project.getProblemStatement());
        dto.setProposedSolution(project.getProposedSolution());
        dto.setDomain(project.getDomain());
        dto.setProjectType(project.getProjectType());
        dto.setTechStack(project.getTechStack());
        dto.setKeywords(project.getKeywords());
        dto.setStatus(project.getStatus());
        dto.setTeamName(project.getTeamName());
        dto.setTeamLeadEmail(project.getTeamLeadEmail());
        dto.setSection(project.getSection());
        dto.setAssignedGuideEmail(project.getAssignedGuideEmail());
        dto.setAssignedGuideName(project.getAssignedGuideName());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setSubmittedAt(project.getSubmittedAt());
        dto.setValidationReport(report);
        dto.setGuideReview(review);
        dto.setGithubRepoUrl(project.getGithubRepoUrl());
        dto.setDemoVideoUrl(project.getDemoVideoUrl());
        dto.setFinalReportUrl(project.getFinalReportUrl());
        dto.setPresentationUrl(project.getPresentationUrl());
        dto.setCompletedAt(project.getCompletedAt());
        dto.setCompletedBy(project.getCompletedBy());
        dto.setCurrentVersion(project.getCurrentVersion());
        dto.setSlaDaysPending(project.getSlaDaysPending());
        dto.setSlaBreached(project.isSlaBreached());
        dto.setEscalationTier(project.getEscalationTier());
        return dto;
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

    public ValidationReport getValidationReport() { return validationReport; }
    public void setValidationReport(ValidationReport validationReport) { this.validationReport = validationReport; }

    public GuideReview getGuideReview() { return guideReview; }
    public void setGuideReview(GuideReview guideReview) { this.guideReview = guideReview; }

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
