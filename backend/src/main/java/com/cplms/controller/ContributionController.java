package com.cplms.controller;

import com.cplms.entity.ContributionEntry;
import com.cplms.service.ContributionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contributions")
@Tag(name = "Two-Level Contribution Tracking", description = "Endpoints for student self-logging and team leader approvals")
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(ContributionService contributionService) {
        this.contributionService = contributionService;
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get all contribution logs for a specific project")
    public ResponseEntity<List<ContributionEntry>> getContributions(@PathVariable UUID projectId) {
        return ResponseEntity.ok(contributionService.getContributionsForProject(projectId));
    }

    @PostMapping
    @Operation(summary = "Student self-logs individual task contribution (Level 1)")
    public ResponseEntity<ContributionEntry> logContribution(@RequestBody Map<String, Object> body) {
        UUID projectId = UUID.fromString((String) body.get("projectId"));
        String moduleName = (String) body.get("moduleName");
        String taskDescription = (String) body.get("taskDescription");
        double hours = Double.parseDouble(body.get("hoursSpent").toString());
        String github = (String) body.get("githubCommitOrPr");

        return ResponseEntity.ok(contributionService.logContribution(projectId, moduleName, taskDescription, hours, github));
    }

    @PatchMapping("/{contributionId}/leader-review")
    @Operation(summary = "Team Leader approves or requests correction on member's task entry (Level 2)")
    public ResponseEntity<ContributionEntry> reviewContribution(
            @PathVariable UUID contributionId,
            @RequestBody Map<String, Object> body) {
        boolean approve = Boolean.TRUE.equals(body.get("approve"));
        String feedback = (String) body.get("feedback");

        return ResponseEntity.ok(contributionService.reviewContribution(contributionId, approve, feedback));
    }
}
