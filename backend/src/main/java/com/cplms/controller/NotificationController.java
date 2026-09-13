package com.cplms.controller;

import com.cplms.entity.NotificationItem;
import com.cplms.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Center", description = "Endpoints for Email, Discord Webhook alerts, and in-app feed")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get recent in-app notifications for authenticated user")
    public ResponseEntity<List<NotificationItem>> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test-discord")
    @Operation(summary = "Test dispatching a real Discord Webhook notification")
    public ResponseEntity<Map<String, Object>> testDiscordWebhook(@RequestBody Map<String, String> body) {
        String webhookUrl = body.get("webhookUrl");
        String title = body.getOrDefault("title", "CPLMS Notification Test");
        String message = body.getOrDefault("message", "Testing live Discord integration for academic project alerts!");
        String type = body.getOrDefault("type", "SYSTEM");

        boolean success = notificationService.dispatchDiscordWebhook(webhookUrl, title, message, type);
        return ResponseEntity.ok(Map.of("success", success, "webhookUrl", webhookUrl != null ? webhookUrl : ""));
    }
}
