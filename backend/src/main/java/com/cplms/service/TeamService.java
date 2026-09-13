package com.cplms.service;

import com.cplms.entity.Role;
import com.cplms.entity.Team;
import com.cplms.entity.TeamMember;
import com.cplms.entity.User;
import com.cplms.repository.TeamMemberRepository;
import com.cplms.repository.TeamRepository;
import com.cplms.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       UserRepository userRepository,
                       NotificationService notificationService) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public static class TeamDetailsDto {
        private Team team;
        private List<TeamMember> members;
        private List<TeamMember> pendingInvitesForMe;

        public TeamDetailsDto(Team team, List<TeamMember> members, List<TeamMember> pendingInvitesForMe) {
            this.team = team;
            this.members = members;
            this.pendingInvitesForMe = pendingInvitesForMe;
        }

        public Team getTeam() { return team; }
        public List<TeamMember> getMembers() { return members; }
        public List<TeamMember> getPendingInvitesForMe() { return pendingInvitesForMe; }
    }

    public TeamDetailsDto getMyTeamDetails() {
        User user = getAuthenticatedUser();
        List<TeamMember> myMemberships = teamMemberRepository.findByUserEmail(user.getEmail());
        List<TeamMember> pendingInvites = teamMemberRepository.findByUserEmailAndInviteStatus(user.getEmail(), "INVITED");

        Team team = null;
        List<TeamMember> members = Collections.emptyList();

        // Check if leader of a team
        Optional<Team> leadTeam = teamRepository.findByLeaderEmail(user.getEmail());
        if (leadTeam.isPresent()) {
            team = leadTeam.get();
            members = teamMemberRepository.findByTeamId(team.getId());
        } else {
            // Check if accepted member of any team
            for (TeamMember m : myMemberships) {
                if ("ACCEPTED".equalsIgnoreCase(m.getInviteStatus())) {
                    team = teamRepository.findById(m.getTeamId()).orElse(null);
                    if (team != null) {
                        members = teamMemberRepository.findByTeamId(team.getId());
                        break;
                    }
                }
            }
        }

        return new TeamDetailsDto(team, members, pendingInvites);
    }

    @Transactional
    public Team createTeam(String name, String discordWebhookUrl) {
        User user = getAuthenticatedUser();
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new IllegalArgumentException("Only students can create project teams.");
        }

        user.setTeamLead(true);
        userRepository.save(user);

        Team team = new Team(name, user.getEmail(), user.getFullName(), user.getSection() != null ? user.getSection() : "Section A");
        team.setDiscordWebhookUrl(discordWebhookUrl);
        team.setStatus("FORMING");
        Team savedTeam = teamRepository.save(team);

        // Add leader as accepted member
        TeamMember leaderMember = new TeamMember(
                savedTeam.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRollNumber(),
                "Team Leader",
                "ACCEPTED"
        );
        teamMemberRepository.save(leaderMember);

        notificationService.dispatch(
                user.getEmail(),
                "Team Created: " + name,
                "Your team '" + name + "' was successfully created. You can now invite members and configure Discord notifications.",
                "TEAM_INVITE",
                discordWebhookUrl
        );

        return savedTeam;
    }

    @Transactional
    public TeamMember inviteMember(String inviteeEmail, String roleInTeam) {
        User leader = getAuthenticatedUser();
        Team team = teamRepository.findByLeaderEmail(leader.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Only the designated Team Leader can invite members."));

        List<TeamMember> currentMembers = teamMemberRepository.findByTeamId(team.getId());
        if (currentMembers.size() >= 4) {
            throw new IllegalArgumentException("Team reached maximum capacity (4 members).");
        }

        User invitee = userRepository.findByEmail(inviteeEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with email: " + inviteeEmail));

        // Check if already in team
        Optional<TeamMember> existing = teamMemberRepository.findByTeamIdAndUserEmail(team.getId(), inviteeEmail);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Student already has an active invitation or is a member of this team.");
        }

        TeamMember member = new TeamMember(
                team.getId(),
                invitee.getEmail(),
                invitee.getFullName(),
                invitee.getRollNumber(),
                roleInTeam != null ? roleInTeam : "Developer",
                "INVITED"
        );
        TeamMember saved = teamMemberRepository.save(member);

        // Dispatch Dual-channel Alert (Email + Discord)
        notificationService.dispatch(
                invitee.getEmail(),
                "Team Invitation: " + team.getName(),
                "You have been invited by " + leader.getFullName() + " to join '" + team.getName() + "' for " + team.getSection() + ".",
                "TEAM_INVITE",
                team.getDiscordWebhookUrl()
        );

        return saved;
    }

    @Transactional
    public TeamMember respondToInvite(UUID teamMemberId, boolean accept) {
        User user = getAuthenticatedUser();
        TeamMember member = teamMemberRepository.findById(teamMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found."));

        if (!member.getUserEmail().equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Not authorized to respond to this invite.");
        }

        Team team = teamRepository.findById(member.getTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));

        member.setInviteStatus(accept ? "ACCEPTED" : "DECLINED");
        if (accept) {
            member.setJoinedAt(LocalDateTime.now());
        }
        TeamMember saved = teamMemberRepository.save(member);

        // Dispatch notification to Team Leader
        String statusText = accept ? "accepted" : "declined";
        notificationService.dispatch(
                team.getLeaderEmail(),
                "Invitation " + (accept ? "Accepted" : "Declined"),
                user.getFullName() + " has " + statusText + " the invitation to join '" + team.getName() + "'.",
                "TEAM_INVITE",
                team.getDiscordWebhookUrl()
        );

        return saved;
    }

    @Transactional
    public Team updateDiscordWebhook(String webhookUrl) {
        User leader = getAuthenticatedUser();
        Team team = teamRepository.findByLeaderEmail(leader.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Only team leader can update team webhook."));

        team.setDiscordWebhookUrl(webhookUrl);
        Team saved = teamRepository.save(team);

        // Test webhook dispatch
        notificationService.dispatchDiscordWebhook(
                webhookUrl,
                "Discord Webhook Connected!",
                "Team '" + team.getName() + "' has connected this Discord channel to the CPLMS Academic Portal.",
                "SYSTEM"
        );

        return saved;
    }
}
