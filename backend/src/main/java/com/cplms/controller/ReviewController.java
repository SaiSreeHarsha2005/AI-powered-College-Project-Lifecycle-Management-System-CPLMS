package com.cplms.controller;

import com.cplms.dto.GuideReviewRequest;
import com.cplms.dto.ProjectDto;
import com.cplms.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Guide Review & Evaluation", description = "Endpoints for rubric scoring, feedback, and recommendations")
public class ReviewController {

    private final ProjectService projectService;

    public ReviewController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/{projectId}")
    @PreAuthorize("hasAnyRole('INTERNAL_GUIDE', 'SECTION_COORDINATOR', 'OVERALL_COORDINATOR', 'ADMIN')")
    @Operation(summary = "Submit 1-5 rubric marks, qualitative comments, and approval decision")
    public ResponseEntity<ProjectDto> submitReview(
            @PathVariable UUID projectId,
            @Valid @RequestBody GuideReviewRequest request) {
        return ResponseEntity.ok(projectService.submitGuideReview(projectId, request));
    }
}
