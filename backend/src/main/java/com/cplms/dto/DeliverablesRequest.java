package com.cplms.dto;

public class DeliverablesRequest {
    private String githubRepoUrl;
    private String demoVideoUrl;
    private String finalReportUrl;
    private String presentationUrl;

    public DeliverablesRequest() {}

    public DeliverablesRequest(String githubRepoUrl, String demoVideoUrl, String finalReportUrl, String presentationUrl) {
        this.githubRepoUrl = githubRepoUrl;
        this.demoVideoUrl = demoVideoUrl;
        this.finalReportUrl = finalReportUrl;
        this.presentationUrl = presentationUrl;
    }

    public String getGithubRepoUrl() {
        return githubRepoUrl;
    }

    public void setGithubRepoUrl(String githubRepoUrl) {
        this.githubRepoUrl = githubRepoUrl;
    }

    public String getDemoVideoUrl() {
        return demoVideoUrl;
    }

    public void setDemoVideoUrl(String demoVideoUrl) {
        this.demoVideoUrl = demoVideoUrl;
    }

    public String getFinalReportUrl() {
        return finalReportUrl;
    }

    public void setFinalReportUrl(String finalReportUrl) {
        this.finalReportUrl = finalReportUrl;
    }

    public String getPresentationUrl() {
        return presentationUrl;
    }

    public void setPresentationUrl(String presentationUrl) {
        this.presentationUrl = presentationUrl;
    }
}
