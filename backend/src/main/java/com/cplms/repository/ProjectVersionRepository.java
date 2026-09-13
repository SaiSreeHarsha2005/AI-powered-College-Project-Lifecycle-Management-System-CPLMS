package com.cplms.repository;

import com.cplms.entity.ProjectVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectVersionRepository extends JpaRepository<ProjectVersion, UUID> {
    List<ProjectVersion> findByProjectIdOrderByVersionNumberDesc(UUID projectId);
}
