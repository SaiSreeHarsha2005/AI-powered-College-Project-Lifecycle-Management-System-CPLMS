package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contribution_entries")
public class ContributionEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "student_email", nullable = false)
    private String studentEmail;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "module_name", nullable = false)
    private String moduleName; // e.g., "Authentication & RBAC", "Vector Search Pipeline"

    @Column(name = "task_description", columnDefinition = "TEXT", nullable = false)
    private String taskDescription;

    @Column(name = "hours_spent", nullable = false)
    private double hoursSpent;

    @Column(name = "github_commit_or_pr")
    private String githubCommitOrPr;

    @Column(name = "leader_approval_status", nullable = false)
    private String leaderApprovalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "leader_feedback")
    private String leaderFeedback;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public ContributionEntry() {}

    public ContributionEntry(UUID projectId, String studentEmail, String studentName, String moduleName, String taskDescription, double hoursSpent, String githubCommitOrPr) {
        this.projectId = projectId;
        this.studentEmail = studentEmail;
        this.studentName = studentName;
        this.moduleName = moduleName;
        this.taskDescription = taskDescription;
        this.hoursSpent = hoursSpent;
        this.githubCommitOrPr = githubCommitOrPr;
        this.leaderApprovalStatus = "PENDING";
        this.submittedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }

    public String getTaskDescription() { return taskDescription; }
    public void setTaskDescription(String taskDescription) { this.taskDescription = taskDescription; }

    public double getHoursSpent() { return hoursSpent; }
    public void setHoursSpent(double hoursSpent) { this.hoursSpent = hoursSpent; }

    public String getGithubCommitOrPr() { return githubCommitOrPr; }
    public void setGithubCommitOrPr(String githubCommitOrPr) { this.githubCommitOrPr = githubCommitOrPr; }

    public String getLeaderApprovalStatus() { return leaderApprovalStatus; }
    public void setLeaderApprovalStatus(String leaderApprovalStatus) { this.leaderApprovalStatus = leaderApprovalStatus; }

    public String getLeaderFeedback() { return leaderFeedback; }
    public void setLeaderFeedback(String leaderFeedback) { this.leaderFeedback = leaderFeedback; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
