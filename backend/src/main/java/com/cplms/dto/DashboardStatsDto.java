package com.cplms.dto;

public class DashboardStatsDto {
    private long totalProjects;
    private long approvedProjects;
    private long underReviewProjects;
    private long totalStudents;
    private long totalFaculty;
    private double validationRate;
    private double guideWorkloadRatio;
    private long availableGuideSlots;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalProjects, long approvedProjects, long underReviewProjects, long totalStudents, long totalFaculty, double validationRate, double guideWorkloadRatio, long availableGuideSlots) {
        this.totalProjects = totalProjects;
        this.approvedProjects = approvedProjects;
        this.underReviewProjects = underReviewProjects;
        this.totalStudents = totalStudents;
        this.totalFaculty = totalFaculty;
        this.validationRate = validationRate;
        this.guideWorkloadRatio = guideWorkloadRatio;
        this.availableGuideSlots = availableGuideSlots;
    }

    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }

    public long getApprovedProjects() { return approvedProjects; }
    public void setApprovedProjects(long approvedProjects) { this.approvedProjects = approvedProjects; }

    public long getUnderReviewProjects() { return underReviewProjects; }
    public void setUnderReviewProjects(long underReviewProjects) { this.underReviewProjects = underReviewProjects; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }

    public double getValidationRate() { return validationRate; }
    public void setValidationRate(double validationRate) { this.validationRate = validationRate; }

    public double getGuideWorkloadRatio() { return guideWorkloadRatio; }
    public void setGuideWorkloadRatio(double guideWorkloadRatio) { this.guideWorkloadRatio = guideWorkloadRatio; }

    public long getAvailableGuideSlots() { return availableGuideSlots; }
    public void setAvailableGuideSlots(long availableGuideSlots) { this.availableGuideSlots = availableGuideSlots; }
}
