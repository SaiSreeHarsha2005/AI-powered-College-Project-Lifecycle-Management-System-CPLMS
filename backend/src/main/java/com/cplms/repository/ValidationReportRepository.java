package com.cplms.repository;

import com.cplms.entity.ValidationReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ValidationReportRepository extends JpaRepository<ValidationReport, UUID> {
    Optional<ValidationReport> findFirstByProjectIdOrderByGeneratedAtDesc(UUID projectId);
}
