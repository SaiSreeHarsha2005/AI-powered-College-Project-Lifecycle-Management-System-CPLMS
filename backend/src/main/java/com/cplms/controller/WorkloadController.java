package com.cplms.controller;

import com.cplms.entity.GuideCapacity;
import com.cplms.entity.Project;
import com.cplms.service.WorkloadBalancerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workload")
@Tag(name = "Guide Workload Balancer", description = "Endpoints for faculty capacity monitoring and guide allocations")
public class WorkloadController {

    private final WorkloadBalancerService workloadBalancerService;

    public WorkloadController(WorkloadBalancerService workloadBalancerService) {
        this.workloadBalancerService = workloadBalancerService;
    }

    @GetMapping("/guides")
    @Operation(summary = "Get list of faculty guides with current project loads and remaining slots")
    public ResponseEntity<List<GuideCapacity>> getGuides(@RequestParam(required = false) String section) {
        return ResponseEntity.ok(workloadBalancerService.getGuideWorkloads(section));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('SECTION_COORDINATOR', 'OVERALL_COORDINATOR', 'ADMIN')")
    @Operation(summary = "Coordinator assigns guide to project team with hard capacity check")
    public ResponseEntity<Project> assignGuide(@RequestBody Map<String, String> body) {
        UUID projectId = UUID.fromString(body.get("projectId"));
        String guideEmail = body.get("guideEmail");
        return ResponseEntity.ok(workloadBalancerService.assignGuide(projectId, guideEmail));
    }

    @PatchMapping("/capacity/{guideEmail}")
    @PreAuthorize("hasAnyRole('OVERALL_COORDINATOR', 'ADMIN')")
    @Operation(summary = "Update maximum project capacity cap for a faculty guide")
    public ResponseEntity<GuideCapacity> updateCapacity(
            @PathVariable String guideEmail,
            @RequestBody Map<String, Integer> body) {
        int maxProjects = body.getOrDefault("maxProjects", 3);
        return ResponseEntity.ok(workloadBalancerService.updateGuideCap(guideEmail, maxProjects));
    }
}
