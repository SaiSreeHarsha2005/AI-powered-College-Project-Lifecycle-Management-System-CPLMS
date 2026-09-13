package com.cplms.repository;

import com.cplms.entity.GuideCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuideCapacityRepository extends JpaRepository<GuideCapacity, UUID> {
    Optional<GuideCapacity> findByGuideEmail(String guideEmail);
    List<GuideCapacity> findByDepartment(String department);
    List<GuideCapacity> findBySection(String section);
}
