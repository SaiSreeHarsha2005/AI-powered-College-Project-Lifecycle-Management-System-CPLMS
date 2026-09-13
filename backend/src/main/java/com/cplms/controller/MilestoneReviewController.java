package com.cplms.controller;

import com.cplms.entity.AuditLog;
import com.cplms.entity.MilestoneReview;
import com.cplms.entity.User;
import com.cplms.repository.AuditLogRepository;
import com.cplms.repository.MilestoneReviewRepository;
import com.cplms.repository.UserRepository;
import com.cplms.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/milestones")
@CrossOrigin(origins = "*")
@Tag(name = "Milestone Review Schedule", description = "Endpoints for Review 1, Review 2, Review 3 & Final Viva")
public class MilestoneReviewController {

    private final MilestoneReviewRepository milestoneReviewRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public MilestoneReviewController(MilestoneReviewRepository milestoneReviewRepository,
                                     UserRepository userRepository,
                                     AuditLogRepository auditLogRepository,
                                     NotificationService notificationService) {
        this.milestoneReviewRepository = milestoneReviewRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get or auto-initialize 4 academic milestones for project")
    public ResponseEntity<List<MilestoneReview>> getMilestones(@PathVariable UUID projectId) {
        List<MilestoneReview> list = milestoneReviewRepository.findByProjectIdOrderByDeadlineAsc(projectId);
        if (list.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            List<MilestoneReview> initList = List.of(
                    new MilestoneReview(projectId, "REVIEW_1", "Review 1: Problem Formulation & Concept Validation", now.plusWeeks(2)),
                    new MilestoneReview(projectId, "REVIEW_2", "Review 2: Architecture, Methodology & Midterm Design", now.plusWeeks(6)),
                    new MilestoneReview(projectId, "REVIEW_3", "Review 3: Code Implementation & Working Prototype Demo", now.plusWeeks(10)),
                    new MilestoneReview(projectId, "FINAL_VIVA", "Final Viva: Capstone Defense & Institutional Presentation", now.plusWeeks(14))
            );
            list = milestoneReviewRepository.saveAll(initList);
        }
        return ResponseEntity.ok(list);
    }

    public static class MilestoneSubmitRequest {
        public String submissionUrl;
        public String submissionNotes;
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Student submits milestone slide deck or document")
    public ResponseEntity<MilestoneReview> submitMilestone(@PathVariable UUID id, @RequestBody MilestoneSubmitRequest req) {
        User user = getAuthenticatedUser();
        MilestoneReview review = milestoneReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found: " + id));

        review.setSubmissionUrl(req.submissionUrl);
        review.setSubmissionNotes(req.submissionNotes);
        review.setStatus("SUBMITTED");
        review.setSubmittedAt(LocalDateTime.now());

        MilestoneReview saved = milestoneReviewRepository.save(review);

        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "MILESTONE_SUBMISSION",
                "Submitted deliverables for " + review.getStageTitle(),
                "MilestoneReview",
                saved.getId().toString()
        ));

        return ResponseEntity.ok(saved);
    }

    public static class MilestoneEvaluationRequest {
        public Integer innovationScore;
        public Integer designScore;
        public Integer implementationScore;
        public Integer documentationScore;
        public Integer presentationScore;
        public String evaluatorFeedback;
    }

    @PostMapping("/{id}/evaluate")
    @Operation(summary = "Faculty guide records marks across 5 criteria (Innovation, Design, Implementation, Doc, Presentation)")
    public ResponseEntity<MilestoneReview> evaluateMilestone(@PathVariable UUID id, @RequestBody MilestoneEvaluationRequest req) {
        User evaluator = getAuthenticatedUser();
        MilestoneReview review = milestoneReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found: " + id));

        review.setInnovationScore(req.innovationScore != null ? req.innovationScore : 3);
        review.setDesignScore(req.designScore != null ? req.designScore : 3);
        review.setImplementationScore(req.implementationScore != null ? req.implementationScore : 3);
        review.setDocumentationScore(req.documentationScore != null ? req.documentationScore : 3);
        review.setPresentationScore(req.presentationScore != null ? req.presentationScore : 3);

        int total = review.getInnovationScore() + review.getDesignScore() + review.getImplementationScore()
                + review.getDocumentationScore() + review.getPresentationScore();
        review.setTotalScore(total);

        review.setEvaluatorEmail(evaluator.getEmail());
        review.setEvaluatorName(evaluator.getFullName());
        review.setEvaluatorFeedback(req.evaluatorFeedback);
        review.setStatus("EVALUATED");
        review.setEvaluatedAt(LocalDateTime.now());

        MilestoneReview saved = milestoneReviewRepository.save(review);

        auditLogRepository.save(new AuditLog(
                evaluator.getEmail(),
                "MILESTONE_EVALUATED",
                "Graded " + review.getStageTitle() + " with total score " + total + "/25",
                "MilestoneReview",
                saved.getId().toString()
        ));

        return ResponseEntity.ok(saved);
    }
}
