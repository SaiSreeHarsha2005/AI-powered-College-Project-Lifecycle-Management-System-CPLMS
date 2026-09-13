package com.cplms.service;

import com.cplms.entity.ContributionEntry;
import com.cplms.entity.Project;
import com.cplms.entity.User;
import com.cplms.repository.ContributionEntryRepository;
import com.cplms.repository.ProjectRepository;
import com.cplms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ContributionService {

    private final ContributionEntryRepository contributionEntryRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ContributionService(ContributionEntryRepository contributionEntryRepository,
                               ProjectRepository projectRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.contributionEntryRepository = contributionEntryRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public List<ContributionEntry> getContributionsForProject(UUID projectId) {
        return contributionEntryRepository.findByProjectIdOrderBySubmittedAtDesc(projectId);
    }

    @Transactional
    public ContributionEntry logContribution(UUID projectId, String moduleName, String taskDescription, double hoursSpent, String githubCommitOrPr) {
        User student = getAuthenticatedUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        ContributionEntry entry = new ContributionEntry(
                projectId,
                student.getEmail(),
                student.getFullName(),
                moduleName,
                taskDescription,
                hoursSpent,
                githubCommitOrPr
        );
        ContributionEntry saved = contributionEntryRepository.save(entry);

        // Level 1 -> Notify Team Leader for Level 2 review
        notificationService.dispatch(
                project.getTeamLeadEmail(),
                "Contribution Pending Approval: " + student.getFullName(),
                student.getFullName() + " logged " + hoursSpent + " hours on '" + moduleName + "'. Review and approve in your Contribution board.",
                "CONTRIBUTION",
                null
        );

        return saved;
    }

    @Transactional
    public ContributionEntry reviewContribution(UUID contributionId, boolean approve, String feedback) {
        User leader = getAuthenticatedUser();
        ContributionEntry entry = contributionEntryRepository.findById(contributionId)
                .orElseThrow(() -> new IllegalArgumentException("Contribution entry not found: " + contributionId));

        Project project = projectRepository.findById(entry.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found."));

        // Enforce that caller is the designated team leader
        if (!leader.getEmail().equalsIgnoreCase(project.getTeamLeadEmail())) {
            throw new IllegalArgumentException("Only the designated Team Leader can approve or reject contribution entries.");
        }

        entry.setLeaderApprovalStatus(approve ? "APPROVED" : "REJECTED");
        entry.setLeaderFeedback(feedback);
        entry.setReviewedAt(LocalDateTime.now());
        ContributionEntry saved = contributionEntryRepository.save(entry);

        // Level 2 -> Notify student of approval/rejection
        String actionText = approve ? "approved" : "rejected";
        notificationService.dispatch(
                entry.getStudentEmail(),
                "Contribution Log " + (approve ? "Approved" : "Requires Correction"),
                "Team Leader " + leader.getFullName() + " has " + actionText + " your task entry for '" + entry.getModuleName() + "'. Feedback: " + (feedback != null ? feedback : "None"),
                "CONTRIBUTION",
                null
        );

        return saved;
    }
}
