package com.cplms.repository;

import com.cplms.entity.GuideReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuideReviewRepository extends JpaRepository<GuideReview, UUID> {
    Optional<GuideReview> findFirstByProjectIdOrderBySubmittedAtDesc(UUID projectId);
    List<GuideReview> findByGuideEmail(String guideEmail);
}
