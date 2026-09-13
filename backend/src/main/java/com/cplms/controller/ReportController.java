package com.cplms.controller;

import com.cplms.entity.Project;
import com.cplms.entity.GuideCapacity;
import com.cplms.repository.ProjectRepository;
import com.cplms.repository.GuideCapacityRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ProjectRepository projectRepository;
    private final GuideCapacityRepository guideCapacityRepository;

    public ReportController(ProjectRepository projectRepository, GuideCapacityRepository guideCapacityRepository) {
        this.projectRepository = projectRepository;
        this.guideCapacityRepository = guideCapacityRepository;
    }

    @GetMapping(value = "/export/projects-csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportProjectsCsv() {
        List<Project> projects = projectRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Title,Domain,Project Type,Team Name,Status,Assigned Guide,Submitted At\n");

        for (Project p : projects) {
            csv.append(escapeSpecialCharacters(String.valueOf(p.getId()))).append(",")
               .append(escapeSpecialCharacters(p.getTitle())).append(",")
               .append(escapeSpecialCharacters(p.getDomain())).append(",")
               .append(escapeSpecialCharacters(p.getProjectType())).append(",")
               .append(escapeSpecialCharacters(p.getTeamName())).append(",")
               .append(escapeSpecialCharacters(p.getStatus())).append(",")
               .append(escapeSpecialCharacters(p.getAssignedGuideName() != null ? p.getAssignedGuideName() : "Unassigned")).append(",")
               .append(escapeSpecialCharacters(p.getSubmittedAt() != null ? p.getSubmittedAt().toString() : "N/A"))
               .append("\n");
        }

        byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "CPLMS_Projects_Report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping(value = "/export/workload-csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportWorkloadCsv() {
        List<GuideCapacity> capacities = guideCapacityRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Guide Name,Guide Email,Department,Section,Max Capacity,Active Projects,Remaining Slots\n");

        for (GuideCapacity gc : capacities) {
            int remaining = Math.max(0, gc.getMaxProjects() - gc.getCurrentProjects());
            csv.append(escapeSpecialCharacters(gc.getGuideName())).append(",")
               .append(escapeSpecialCharacters(gc.getGuideEmail())).append(",")
               .append(escapeSpecialCharacters(gc.getDepartment())).append(",")
               .append(escapeSpecialCharacters(gc.getSection())).append(",")
               .append(gc.getMaxProjects()).append(",")
               .append(gc.getCurrentProjects()).append(",")
               .append(remaining)
               .append("\n");
        }

        byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "CPLMS_Faculty_Workload_Report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) {
            return "\"\"";
        }
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
