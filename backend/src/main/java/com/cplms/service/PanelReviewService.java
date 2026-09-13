package com.cplms.service;

import com.cplms.entity.AuditLog;
import com.cplms.entity.PanelReview;
import com.cplms.entity.Project;
import com.cplms.repository.AuditLogRepository;
import com.cplms.repository.PanelReviewRepository;
import com.cplms.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PanelReviewService {

    private final PanelReviewRepository panelReviewRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogRepository auditLogRepository;

    private boolean blindReviewMode = true; // Configurable policy, default BLIND

    public PanelReviewService(PanelReviewRepository panelReviewRepository,
                              ProjectRepository projectRepository,
                              AuditLogRepository auditLogRepository) {
        this.panelReviewRepository = panelReviewRepository;
        this.projectRepository = projectRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public boolean isBlindReviewMode() {
        return blindReviewMode;
    }

    public void setBlindReviewMode(boolean blindReviewMode) {
        this.blindReviewMode = blindReviewMode;
    }

    public List<PanelReview> getPanelReviewsForProject(UUID projectId) {
        return panelReviewRepository.findByProjectId(projectId);
    }

    public PanelReview submitPanelReview(UUID projectId, String panelistEmail, String panelistName,
                                         Integer problem, Integer methodology, Integer feasibility, Integer innovation,
                                         String comments, String decision) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            throw new IllegalArgumentException("Project not found with ID: " + projectId);
        }

        Optional<PanelReview> existingOpt = panelReviewRepository.findByProjectIdAndPanelistEmail(projectId, panelistEmail);
        PanelReview review = existingOpt.orElseGet(() -> new PanelReview(projectId, panelistEmail, panelistName, problem, methodology, feasibility, innovation, comments, decision));

        review.setRubricProblemScore(problem);
        review.setRubricMethodologyScore(methodology);
        review.setRubricFeasibilityScore(feasibility);
        review.setRubricInnovationScore(innovation);
        review.setComments(comments);
        review.setDecision(decision);
        review.setSubmittedAt(LocalDateTime.now());

        PanelReview saved = panelReviewRepository.save(review);

        // Update Project Panel Status
        List<PanelReview> allReviews = panelReviewRepository.findByProjectId(projectId);
        if (!allReviews.isEmpty()) {
            long approvedCount = allReviews.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getDecision())).count();
            Project project = projectOpt.get();
            if (approvedCount >= 2 || (allReviews.size() == 1 && "APPROVED".equalsIgnoreCase(decision))) {
                project.setStatus("PANEL_APPROVED");
            } else if ("REJECTED".equalsIgnoreCase(decision)) {
                project.setStatus("PANEL_REJECTED");
            } else {
                project.setStatus("PANEL_UNDER_REVIEW");
            }
            projectRepository.save(project);
        }

        // Audit Log
        auditLogRepository.save(new AuditLog(
                panelistEmail,
                "SUBMIT_PANEL_REVIEW",
                "Panel review submitted for Project #" + projectId + " (Decision: " + decision + ")",
                "PanelReview",
                saved.getId().toString()
        ));

        return saved;
    }

    public Map<String, Object> getProjectPanelSummary(UUID projectId) {
        List<PanelReview> reviews = panelReviewRepository.findByProjectId(projectId);
        double avgScore = reviews.stream().mapToDouble(PanelReview::getAverageScore).average().orElse(0.0);
        long approved = reviews.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getDecision())).count();
        long revision = reviews.stream().filter(r -> "REVISION".equalsIgnoreCase(r.getDecision())).count();
        long rejected = reviews.stream().filter(r -> "REJECTED".equalsIgnoreCase(r.getDecision())).count();

        return Map.of(
                "projectId", projectId,
                "reviewCount", reviews.size(),
                "averageRubricScore", Math.round(avgScore * 10.0) / 10.0,
                "approvedCount", approved,
                "revisionCount", revision,
                "rejectedCount", rejected,
                "blindReviewEnabled", blindReviewMode,
                "reviews", reviews
        );
    }
}
