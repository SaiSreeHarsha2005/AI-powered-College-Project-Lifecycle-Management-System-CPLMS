package com.cplms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "leader_email", nullable = false)
    private String leaderEmail;

    @Column(name = "leader_name")
    private String leaderName;

    private String section;

    @Column(name = "academic_term")
    private String academicTerm = "2026-TERM-1";

    @Column(nullable = false)
    private String status = "FORMING"; // FORMING, ACTIVE, LOCKED

    @Column(name = "discord_webhook_url")
    private String discordWebhookUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Team() {}

    public Team(String name, String leaderEmail, String leaderName, String section) {
        this.name = name;
        this.leaderEmail = leaderEmail;
        this.leaderName = leaderName;
        this.section = section;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLeaderEmail() { return leaderEmail; }
    public void setLeaderEmail(String leaderEmail) { this.leaderEmail = leaderEmail; }

    public String getLeaderName() { return leaderName; }
    public void setLeaderName(String leaderName) { this.leaderName = leaderName; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getAcademicTerm() { return academicTerm; }
    public void setAcademicTerm(String academicTerm) { this.academicTerm = academicTerm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDiscordWebhookUrl() { return discordWebhookUrl; }
    public void setDiscordWebhookUrl(String discordWebhookUrl) { this.discordWebhookUrl = discordWebhookUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
