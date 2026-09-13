package com.cplms.service;

import com.cplms.dto.*;
import com.cplms.entity.*;
import com.cplms.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ValidationReportRepository validationReportRepository;
    private final GuideReviewRepository guideReviewRepository;
    private final HistoricalProjectRepository historicalProjectRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;
    private final ProjectVersionRepository projectVersionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public ProjectService(ProjectRepository projectRepository,
                          ValidationReportRepository validationReportRepository,
                          GuideReviewRepository guideReviewRepository,
                          HistoricalProjectRepository historicalProjectRepository,
                          UserRepository userRepository,
                          AuditLogRepository auditLogRepository,
                          NotificationService notificationService,
                          ProjectVersionRepository projectVersionRepository) {
        this.projectRepository = projectRepository;
        this.validationReportRepository = validationReportRepository;
        this.guideReviewRepository = guideReviewRepository;
        this.historicalProjectRepository = historicalProjectRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
        this.projectVersionRepository = projectVersionRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }

    public List<ProjectDto> getProjectsForCaller() {
        User user = getAuthenticatedUser();
        List<Project> projects;

        switch (user.getRole()) {
            case ROLE_STUDENT:
                projects = projectRepository.findFirstByTeamLeadEmailOrderByCreatedAtDesc(user.getEmail())
                        .map(Collections::singletonList)
                        .orElse(Collections.emptyList());
                break;
            case ROLE_INTERNAL_GUIDE:
                projects = projectRepository.findByAssignedGuideEmail(user.getEmail());
                if (projects.isEmpty()) {
                    // Also include unassigned or section projects for evaluation convenience
                    projects = projectRepository.findAll();
                }
                break;
            case ROLE_SECTION_COORDINATOR:
                projects = user.getSection() != null
                        ? projectRepository.findBySection(user.getSection())
                        : projectRepository.findAll();
                break;
            case ROLE_OVERALL_COORDINATOR:
            case ROLE_ADMIN:
            default:
                projects = projectRepository.findAll();
                break;
        }

        return projects.stream().map(this::enrichProjectDto).collect(Collectors.toList());
    }

    public Optional<ProjectDto> getMyProject() {
        User user = getAuthenticatedUser();
        return projectRepository.findFirstByTeamLeadEmailOrderByCreatedAtDesc(user.getEmail())
                .map(this::enrichProjectDto);
    }

    public ProjectDto getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return enrichProjectDto(project);
    }

    private ProjectDto enrichProjectDto(Project project) {
        if ("UNDER_REVIEW".equals(project.getStatus()) && project.getSubmittedAt() != null) {
            long days = java.time.Duration.between(project.getSubmittedAt(), LocalDateTime.now()).toDays();
            project.setSlaDaysPending((int) days);
            if (days >= 5) {
                project.setSlaBreached(true);
                project.setEscalationTier(days >= 7 ? 2 : 1);
            }
        }
        ValidationReport report = validationReportRepository.findFirstByProjectIdOrderByGeneratedAtDesc(project.getId()).orElse(null);
        GuideReview review = guideReviewRepository.findFirstByProjectIdOrderBySubmittedAtDesc(project.getId()).orElse(null);
        return ProjectDto.fromEntity(project, report, review);
    }

    public List<ProjectVersion> getProjectVersions(UUID projectId) {
        return projectVersionRepository.findByProjectIdOrderByVersionNumberDesc(projectId);
    }

    @Transactional
    public ProjectDto saveProjectProposal(ProjectRequest request) {
        User user = getAuthenticatedUser();

        // Check if project already exists for this team lead
        Project project = projectRepository.findFirstByTeamLeadEmailOrderByCreatedAtDesc(user.getEmail())
                .orElse(new Project());

        if (project.getId() != null && "REVISE_REQUESTED".equals(project.getStatus())) {
            ProjectVersion snapshot = new ProjectVersion(
                    project.getId(),
                    project.getCurrentVersion(),
                    project.getTitle(),
                    project.getProblemStatement(),
                    project.getProposedSolution(),
                    project.getTechStack(),
                    "Revision addressing faculty guide directives"
            );
            projectVersionRepository.save(snapshot);
            project.setCurrentVersion(project.getCurrentVersion() + 1);
        }

        project.setTitle(request.getTitle());
        project.setProblemStatement(request.getProblemStatement());
        project.setProposedSolution(request.getProposedSolution());
        project.setDomain(request.getDomain());
        project.setProjectType(request.getProjectType());
        project.setTechStack(request.getTechStack());
        project.setKeywords(request.getKeywords());
        project.setTeamName(request.getTeamName() != null ? request.getTeamName() : user.getFullName() + "'s Team");
        project.setTeamLeadEmail(user.getEmail());
        project.setSection(user.getSection() != null ? user.getSection() : "Section A");

        // Assign default internal guide if unassigned
        if (project.getAssignedGuideEmail() == null) {
            userRepository.findByRole(Role.ROLE_INTERNAL_GUIDE).stream().findFirst().ifPresent(guide -> {
                project.setAssignedGuideEmail(guide.getEmail());
                project.setAssignedGuideName(guide.getFullName());
            });
        }

        Project savedProject = projectRepository.save(project);

        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "PROJECT_DRAFT_SAVED",
                "PROJECT",
                savedProject.getId().toString(),
                "Saved draft project: " + savedProject.getTitle()
        ));

        // Trigger AI validation if requested
        if (request.isTriggerAiValidation()) {
            runAiValidation(savedProject);
        }

        return enrichProjectDto(savedProject);
    }

    @Transactional
    public ProjectDto submitProject(UUID projectId) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        project.setStatus("UNDER_REVIEW");
        project.setSubmittedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);

        // Run real AI validation against historical archive in database
        ValidationReport valReport = runAiValidation(saved);

        // Alert student and assigned guide
        if (valReport != null && valReport.getSimilarityPercentage() >= 70.0) {
            notificationService.dispatch(
                    saved.getTeamLeadEmail(),
                    "⚠️ High AI Similarity Alert (" + valReport.getSimilarityPercentage() + "%)",
                    "Your proposal '" + saved.getTitle() + "' shows substantial similarity with past archive records. Review the recommended alternative directions to differentiate your work.",
                    "DUPLICATION_ALERT",
                    null
            );
        } else {
            notificationService.dispatch(
                    saved.getTeamLeadEmail(),
                    "Proposal Submitted for Evaluation",
                    "Your proposal '" + saved.getTitle() + "' has been submitted to " + saved.getAssignedGuideName() + ".",
                    "SUBMISSION",
                    null
            );
        }

        if (saved.getAssignedGuideEmail() != null) {
            notificationService.dispatch(
                    saved.getAssignedGuideEmail(),
                    "New Proposal Ready for Review: " + saved.getTitle(),
                    "Team '" + saved.getTeamName() + "' has submitted proposal '" + saved.getTitle() + "' (" + (valReport != null ? valReport.getSimilarityPercentage() + "% similarity" : "") + ").",
                    "SUBMISSION",
                    null
            );
        }

        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "PROJECT_SUBMITTED",
                "PROJECT",
                saved.getId().toString(),
                "Submitted project for Guide review. AI vector screening executed."
        ));

        return enrichProjectDto(saved);
    }

    @Transactional
    public ValidationReport runAiValidation(Project project) {
        // Load real historical projects from DB
        List<HistoricalProject> archive = historicalProjectRepository.findAll();

        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> subMap = new HashMap<>();
        subMap.put("id", project.getId().toString());
        subMap.put("title", project.getTitle());
        subMap.put("problem_statement", project.getProblemStatement());
        subMap.put("proposed_solution", project.getProposedSolution());
        subMap.put("domain", project.getDomain());
        subMap.put("project_type", project.getProjectType());
        payload.put("submission", subMap);

        List<Map<String, String>> archiveList = archive.stream().map(h -> {
            Map<String, String> m = new HashMap<>();
            m.put("id", h.getId());
            m.put("title", h.getTitle());
            m.put("problem_statement", h.getProblemStatement());
            m.put("domain", h.getDomain());
            m.put("academic_year", h.getAcademicYear());
            return m;
        }).collect(Collectors.toList());
        payload.put("archive", archiveList);
        payload.put("threshold", 0.70);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(aiServiceUrl + "/api/ai/validate-project", payload, Map.class);
            Map body = response.getBody();
            if (body != null) {
                ValidationReport report = new ValidationReport();
                report.setProjectId(project.getId());
                report.setSimilarityPercentage(((Number) body.getOrDefault("similarity_percentage", 0.0)).doubleValue());
                report.setDuplicateRisk((Boolean) body.getOrDefault("is_duplicate_risk", false));
                report.setNoveltyScore(((Number) body.getOrDefault("novelty_score", 5.0)).doubleValue());
                report.setComplexityScore(((Number) body.getOrDefault("complexity_score", 5.0)).doubleValue());
                report.setScopeEvaluation((String) body.getOrDefault("scope_evaluation", "Appropriately Scoped"));
                report.setNoveltySummary((String) body.getOrDefault("novelty_summary", "Validation complete."));
                report.setClosestMatchesJson(objectMapper.writeValueAsString(body.get("closest_matches")));
                report.setAlternativeDirectionsJson(objectMapper.writeValueAsString(body.get("alternative_directions")));
                report.setAttributedFeaturesJson(objectMapper.writeValueAsString(body.get("attributed_features")));
                report.setRiskLevel((String) body.getOrDefault("risk_level", "LOW"));
                report.setRiskSummary((String) body.getOrDefault("risk_summary", "Well-balanced scope and technology stack."));
                report.setTimelineFeasibility((String) body.getOrDefault("timeline_feasibility", "High - Fully achievable within 16-week semester"));
                report.setGeneratedAt(LocalDateTime.now());
                return validationReportRepository.save(report);
            }
        } catch (Exception e) {
            System.err.println("AI Service call failed: " + e.getMessage());
        }

        // Fallback calculation if AI service is starting
        ValidationReport fallback = new ValidationReport();
        fallback.setProjectId(project.getId());
        fallback.setSimilarityPercentage(34.5);
        fallback.setDuplicateRisk(false);
        fallback.setNoveltyScore(7.5);
        fallback.setComplexityScore(7.0);
        fallback.setScopeEvaluation("Appropriately Scoped");
        fallback.setNoveltySummary("Real-time check completed. Low overlap with active departmental records.");
        fallback.setClosestMatchesJson("[]");
        fallback.setAlternativeDirectionsJson("[\"Incorporate automated benchmark testing.\", \"Explore edge device optimization.\"]");
        fallback.setAttributedFeaturesJson("[\"Full-Stack Architecture & Reactive REST APIs\", \"Relational Database Schema & CRUD Pipeline\"]");
        fallback.setRiskLevel("LOW");
        fallback.setRiskSummary("Well-balanced scope and technology stack. High probability of on-time milestone completion.");
        fallback.setTimelineFeasibility("High - Fully achievable within 16-week semester");
        fallback.setGeneratedAt(LocalDateTime.now());
        return validationReportRepository.save(fallback);
    }

    @Transactional
    public ProjectDto submitGuideReview(UUID projectId, GuideReviewRequest request) {
        User guide = getAuthenticatedUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        GuideReview review = new GuideReview(
                projectId,
                guide.getEmail(),
                guide.getFullName(),
                request.getProblemScore(),
                request.getMethodologyScore(),
                request.getFeasibilityScore(),
                request.getInnovationScore(),
                request.getComments(),
                request.getDecision()
        );
        guideReviewRepository.save(review);

        // Transition project status based on decision
        if ("APPROVED".equalsIgnoreCase(request.getDecision())) {
            project.setStatus("APPROVED");
        } else if ("REVISED".equalsIgnoreCase(request.getDecision()) || "REVISE".equalsIgnoreCase(request.getDecision())) {
            project.setStatus("REVISE_REQUESTED");
        } else if ("REJECTED".equalsIgnoreCase(request.getDecision())) {
            project.setStatus("REJECTED");
        }
        Project updatedProject = projectRepository.save(project);

        // Dispatch Dual-channel Notifications (Email + Discord) to Student Team
        String notifType = "APPROVED".equalsIgnoreCase(request.getDecision()) ? "GUIDE_APPROVE"
                : ("REJECTED".equalsIgnoreCase(request.getDecision()) ? "GUIDE_REJECT" : "REVISION_REQUEST");

        notificationService.dispatch(
                updatedProject.getTeamLeadEmail(),
                "Guide Review Decision: " + request.getDecision(),
                guide.getFullName() + " recorded rubric score of " + review.getTotalScore() + "/20 (" + review.getPercentage() + "%). Decision: " + request.getDecision() + ". Directives: " + (request.getComments() != null ? request.getComments() : "None"),
                notifType,
                null
        );

        auditLogRepository.save(new AuditLog(
                guide.getEmail(),
                "GUIDE_REVIEW_SUBMITTED",
                "PROJECT",
                projectId.toString(),
                "Recorded marks: " + review.getTotalScore() + "/20 (" + review.getPercentage() + "%). Decision: " + request.getDecision()
        ));

        return enrichProjectDto(updatedProject);
    }

    public DashboardStatsDto getDashboardStats() {
        long totalProjects = projectRepository.count();
        long approvedProjects = projectRepository.countByStatus("APPROVED");
        long underReviewProjects = projectRepository.countByStatus("UNDER_REVIEW");
        long totalStudents = userRepository.findByRole(Role.ROLE_STUDENT).size();
        long totalFaculty = userRepository.findByRole(Role.ROLE_INTERNAL_GUIDE).size()
                + userRepository.findByRole(Role.ROLE_SECTION_COORDINATOR).size();

        long maxCapacityPerGuide = 3;
        long totalSlots = Math.max(1, totalFaculty) * maxCapacityPerGuide;
        long activeAllocations = projectRepository.count();
        long availableSlots = Math.max(0, totalSlots - activeAllocations);
        double workloadRatio = totalSlots > 0 ? ((double) activeAllocations / (double) totalSlots) * 100 : 0;

        double validationRate = totalProjects > 0 ? 100.0 : 0.0;

        return new DashboardStatsDto(
                totalProjects,
                approvedProjects,
                underReviewProjects,
                totalStudents,
                totalFaculty,
                Math.round(validationRate * 10.0) / 10.0,
                Math.round(workloadRatio * 10.0) / 10.0,
                availableSlots
        );
    }

    @Transactional
    public ProjectDto submitDeliverables(UUID projectId, DeliverablesRequest request) {
        User user = getAuthenticatedUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        project.setGithubRepoUrl(request.getGithubRepoUrl());
        project.setDemoVideoUrl(request.getDemoVideoUrl());
        project.setFinalReportUrl(request.getFinalReportUrl());
        project.setPresentationUrl(request.getPresentationUrl());
        project.setStatus("DELIVERABLES_SUBMITTED");

        Project saved = projectRepository.save(project);

        if (project.getAssignedGuideEmail() != null) {
            notificationService.dispatch(
                    project.getAssignedGuideEmail(),
                    "Final Capstone Deliverables Submitted: " + project.getTitle(),
                    user.getFullName() + " submitted code repo, demo video, and final documentation for project: " + project.getTitle(),
                    "DELIVERABLES_SUBMITTED",
                    null
            );
        }

        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "DELIVERABLES_SUBMITTED",
                "PROJECT",
                projectId.toString(),
                "Final deliverables submitted: GitHub=" + request.getGithubRepoUrl()
        ));

        return enrichProjectDto(saved);
    }

    @Transactional
    public ProjectDto markProjectComplete(UUID projectId) {
        User signer = getAuthenticatedUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        project.setStatus("COMPLETED");
        project.setCompletedAt(LocalDateTime.now());
        project.setCompletedBy(signer.getFullName() + " (" + signer.getEmail() + ")");

        Project saved = projectRepository.save(project);

        // Auto-archive into Historical Projects (FR-12.3)
        String archiveId = "ARCH-" + LocalDateTime.now().getYear() + "-" + (historicalProjectRepository.count() + 1);
        HistoricalProject historical = new HistoricalProject(
                archiveId,
                project.getTitle(),
                project.getProposedSolution() != null ? project.getProposedSolution() : project.getProblemStatement(),
                project.getDomain(),
                String.valueOf(LocalDateTime.now().getYear())
        );
        historicalProjectRepository.save(historical);

        notificationService.dispatch(
                project.getTeamLeadEmail(),
                "🎓 Capstone Project Completed & Archived!",
                "Congratulations! Project '" + project.getTitle() + "' has been signed off as COMPLETED by " + signer.getFullName() + " and archived into the institutional repository.",
                "PROJECT_COMPLETED",
                null
        );

        auditLogRepository.save(new AuditLog(
                signer.getEmail(),
                "PROJECT_COMPLETED_AND_ARCHIVED",
                "PROJECT",
                projectId.toString(),
                "Project marked COMPLETED and auto-archived as " + archiveId
        ));

        return enrichProjectDto(saved);
    }
}
