package com.cplms.repository;

import com.cplms.entity.HistoricalProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricalProjectRepository extends JpaRepository<HistoricalProject, String> {
    List<HistoricalProject> findByDomain(String domain);
}
