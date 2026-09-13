package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_members")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "team_id", nullable = false)
    private UUID teamId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "roll_number")
    private String rollNumber;

    @Column(name = "claimed_role")
    private String claimedRole; // "Frontend Lead", "Backend & APIs", "ML & Data", "Documentation"

    @Column(name = "invite_status", nullable = false)
    private String inviteStatus = "INVITED"; // INVITED, ACCEPTED, DECLINED

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    public TeamMember() {}

    public TeamMember(UUID teamId, String userEmail, String fullName, String rollNumber, String claimedRole, String inviteStatus) {
        this.teamId = teamId;
        this.userEmail = userEmail;
        this.fullName = fullName;
        this.rollNumber = rollNumber;
        this.claimedRole = claimedRole;
        this.inviteStatus = inviteStatus;
        this.joinedAt = "ACCEPTED".equalsIgnoreCase(inviteStatus) ? LocalDateTime.now() : null;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTeamId() { return teamId; }
    public void setTeamId(UUID teamId) { this.teamId = teamId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getClaimedRole() { return claimedRole; }
    public void setClaimedRole(String claimedRole) { this.claimedRole = claimedRole; }

    public String getInviteStatus() { return inviteStatus; }
    public void setInviteStatus(String inviteStatus) { this.inviteStatus = inviteStatus; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
