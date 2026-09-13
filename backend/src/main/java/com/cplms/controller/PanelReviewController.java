package com.cplms.controller;

import com.cplms.entity.PanelReview;
import com.cplms.service.PanelReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/panel-reviews")
@CrossOrigin(origins = "*")
public class PanelReviewController {

    private final PanelReviewService panelReviewService;

    public PanelReviewController(PanelReviewService panelReviewService) {
        this.panelReviewService = panelReviewService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PanelReview>> getReviewsForProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(panelReviewService.getPanelReviewsForProject(projectId));
    }

    @GetMapping("/project/{projectId}/summary")
    public ResponseEntity<Map<String, Object>> getProjectPanelSummary(@PathVariable UUID projectId) {
        return ResponseEntity.ok(panelReviewService.getProjectPanelSummary(projectId));
    }

    @GetMapping("/policy")
    public ResponseEntity<Map<String, Boolean>> getPolicyStatus() {
        return ResponseEntity.ok(Map.of("blindReviewMode", panelReviewService.isBlindReviewMode()));
    }

    @PostMapping("/policy")
    public ResponseEntity<Map<String, Boolean>> togglePolicy(@RequestBody Map<String, Boolean> body) {
        Boolean blind = body.getOrDefault("blindReviewMode", true);
        panelReviewService.setBlindReviewMode(blind);
        return ResponseEntity.ok(Map.of("blindReviewMode", panelReviewService.isBlindReviewMode()));
    }

    public static class PanelReviewRequest {
        public UUID projectId;
        public String panelistEmail;
        public String panelistName;
        public Integer rubricProblemScore;
        public Integer rubricMethodologyScore;
        public Integer rubricFeasibilityScore;
        public Integer rubricInnovationScore;
        public String comments;
        public String decision;
    }

    @PostMapping
    public ResponseEntity<PanelReview> submitPanelReview(@RequestBody PanelReviewRequest req) {
        PanelReview review = panelReviewService.submitPanelReview(
                req.projectId,
                req.panelistEmail != null ? req.panelistEmail : "panel.member@gcet.edu.in",
                req.panelistName != null ? req.panelistName : "Dr. S. K. Gupta (Panelist)",
                req.rubricProblemScore,
                req.rubricMethodologyScore,
                req.rubricFeasibilityScore,
                req.rubricInnovationScore,
                req.comments,
                req.decision
        );
        return ResponseEntity.ok(review);
    }
}
