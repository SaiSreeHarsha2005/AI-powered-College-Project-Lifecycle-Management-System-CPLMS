package com.cplms.repository;

import com.cplms.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Optional<Project> findFirstByTeamLeadEmailOrderByCreatedAtDesc(String teamLeadEmail);
    List<Project> findByAssignedGuideEmail(String assignedGuideEmail);
    List<Project> findBySection(String section);
    List<Project> findByStatus(String status);
    long countByStatus(String status);
}
