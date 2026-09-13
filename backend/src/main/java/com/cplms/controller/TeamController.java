package com.cplms.controller;

import com.cplms.entity.Team;
import com.cplms.entity.TeamMember;
import com.cplms.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@Tag(name = "Team Formation & Members", description = "Endpoints for student team creation, invites, and Discord webhook integration")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping("/my-team")
    @Operation(summary = "Get current authenticated student's team, members, and pending invites")
    public ResponseEntity<TeamService.TeamDetailsDto> getMyTeam() {
        return ResponseEntity.ok(teamService.getMyTeamDetails());
    }

    @PostMapping
    @Operation(summary = "Create a project team (creator becomes designated Team Leader)")
    public ResponseEntity<Team> createTeam(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "New Project Team");
        String webhook = body.get("discordWebhookUrl");
        return ResponseEntity.ok(teamService.createTeam(name, webhook));
    }

    @PostMapping("/invite")
    @Operation(summary = "Team Leader invites a student member by institutional email")
    public ResponseEntity<TeamMember> inviteMember(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String role = body.getOrDefault("role", "Developer");
        return ResponseEntity.ok(teamService.inviteMember(email, role));
    }

    @PostMapping("/invites/{inviteId}/respond")
    @Operation(summary = "Invited student accepts or declines team invitation")
    public ResponseEntity<TeamMember> respondToInvite(
            @PathVariable UUID inviteId,
            @RequestBody Map<String, Boolean> body) {
        boolean accept = Boolean.TRUE.equals(body.get("accept"));
        return ResponseEntity.ok(teamService.respondToInvite(inviteId, accept));
    }

    @PatchMapping("/webhook")
    @Operation(summary = "Update team Discord webhook URL for instant channel alerts")
    public ResponseEntity<Team> updateDiscordWebhook(@RequestBody Map<String, String> body) {
        String url = body.get("discordWebhookUrl");
        return ResponseEntity.ok(teamService.updateDiscordWebhook(url));
    }
}
