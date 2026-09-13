package com.cplms.controller;

import com.cplms.dto.DashboardStatsDto;
import com.cplms.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Intelligence", description = "Endpoints for dynamic department metrics and workloads")
public class DashboardController {

    private final ProjectService projectService;

    public DashboardController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get live department statistics calculated directly from database records")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(projectService.getDashboardStats());
    }
}
