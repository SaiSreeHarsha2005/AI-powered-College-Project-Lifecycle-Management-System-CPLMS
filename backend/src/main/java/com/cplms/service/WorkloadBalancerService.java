package com.cplms.service;

import com.cplms.entity.GuideCapacity;
import com.cplms.entity.Project;
import com.cplms.entity.Role;
import com.cplms.entity.User;
import com.cplms.repository.GuideCapacityRepository;
import com.cplms.repository.ProjectRepository;
import com.cplms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class WorkloadBalancerService {

    private final GuideCapacityRepository guideCapacityRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WorkloadBalancerService(GuideCapacityRepository guideCapacityRepository,
                                  ProjectRepository projectRepository,
                                  UserRepository userRepository,
                                  NotificationService notificationService) {
        this.guideCapacityRepository = guideCapacityRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<GuideCapacity> getGuideWorkloads(String section) {
        List<GuideCapacity> capacities;
        if (section != null && !section.trim().isEmpty()) {
            capacities = guideCapacityRepository.findBySection(section);
        } else {
            capacities = guideCapacityRepository.findAll();
        }

        // Sync with live project counts
        for (GuideCapacity gc : capacities) {
            long count = projectRepository.findByAssignedGuideEmail(gc.getGuideEmail()).size();
            gc.setCurrentProjects((int) count);
            guideCapacityRepository.save(gc);
        }

        return capacities;
    }

    @Transactional
    public Project assignGuide(UUID projectId, String guideEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        GuideCapacity capacity = guideCapacityRepository.findByGuideEmail(guideEmail)
                .orElseThrow(() -> new IllegalArgumentException("Guide capacity record not found for: " + guideEmail));

        // Hard capacity check (FR-7.3)
        long currentLoad = projectRepository.findByAssignedGuideEmail(guideEmail).size();
        if (currentLoad >= capacity.getMaxProjects()) {
            throw new IllegalStateException("Cannot allocate: " + capacity.getGuideName() + " has reached maximum capacity (" + capacity.getMaxProjects() + " projects).");
        }

        project.setAssignedGuideEmail(capacity.getGuideEmail());
        project.setAssignedGuideName(capacity.getGuideName());
        Project updated = projectRepository.save(project);

        // Update workload
        capacity.setCurrentProjects((int) currentLoad + 1);
        guideCapacityRepository.save(capacity);

        // Dispatch Dual-channel Notifications (Email + Discord)
        notificationService.dispatch(
                capacity.getGuideEmail(),
                "New Project Assigned: " + project.getTitle(),
                "You have been assigned as Internal Guide for '" + project.getTitle() + "' (" + project.getTeamName() + ", " + project.getSection() + ").",
                "SYSTEM",
                null
        );

        notificationService.dispatch(
                project.getTeamLeadEmail(),
                "Internal Guide Assigned",
                capacity.getGuideName() + " has been assigned as your team's Internal Guide for '" + project.getTitle() + "'.",
                "SYSTEM",
                null
        );

        return updated;
    }

    @Transactional
    public GuideCapacity updateGuideCap(String guideEmail, int newMax) {
        GuideCapacity cap = guideCapacityRepository.findByGuideEmail(guideEmail)
                .orElseThrow(() -> new IllegalArgumentException("Guide not found: " + guideEmail));

        cap.setMaxProjects(newMax);
        return guideCapacityRepository.save(cap);
    }
}
