package com.cplms.repository;

import com.cplms.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    Optional<Team> findByLeaderEmail(String leaderEmail);
    List<Team> findBySection(String section);
}
