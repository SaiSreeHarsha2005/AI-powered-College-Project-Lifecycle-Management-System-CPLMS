package com.cplms.repository;

import com.cplms.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    List<TeamMember> findByTeamId(UUID teamId);
    List<TeamMember> findByUserEmail(String userEmail);
    Optional<TeamMember> findByTeamIdAndUserEmail(UUID teamId, String userEmail);
    List<TeamMember> findByUserEmailAndInviteStatus(String userEmail, String inviteStatus);
}
