package com.cplms.dto;

import jakarta.validation.constraints.NotBlank;

public class ProjectRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Problem statement is required")
    private String problemStatement;

    @NotBlank(message = "Proposed solution is required")
    private String proposedSolution;

    private String domain;
    private String projectType = "Major";
    private String techStack;
    private String keywords;
    private String teamName;
    private boolean triggerAiValidation = true;

    public ProjectRequest() {}

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

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public boolean isTriggerAiValidation() { return triggerAiValidation; }
    public void setTriggerAiValidation(boolean triggerAiValidation) { this.triggerAiValidation = triggerAiValidation; }
}
