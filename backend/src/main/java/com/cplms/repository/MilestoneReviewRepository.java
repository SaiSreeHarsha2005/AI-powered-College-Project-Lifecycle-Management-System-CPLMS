package com.cplms.repository;

import com.cplms.entity.MilestoneReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MilestoneReviewRepository extends JpaRepository<MilestoneReview, UUID> {
    List<MilestoneReview> findByProjectIdOrderByDeadlineAsc(UUID projectId);
    Optional<MilestoneReview> findByProjectIdAndStageName(UUID projectId, String stageName);
}
