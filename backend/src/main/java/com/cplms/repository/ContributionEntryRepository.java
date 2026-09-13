package com.cplms.repository;

import com.cplms.entity.ContributionEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContributionEntryRepository extends JpaRepository<ContributionEntry, UUID> {
    List<ContributionEntry> findByProjectIdOrderBySubmittedAtDesc(UUID projectId);
    List<ContributionEntry> findByStudentEmailOrderBySubmittedAtDesc(String studentEmail);
}
