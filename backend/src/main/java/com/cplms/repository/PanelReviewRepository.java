package com.cplms.repository;

import com.cplms.entity.PanelReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PanelReviewRepository extends JpaRepository<PanelReview, UUID> {
    List<PanelReview> findByProjectId(UUID projectId);
    Optional<PanelReview> findByProjectIdAndPanelistEmail(UUID projectId, String panelistEmail);
}
