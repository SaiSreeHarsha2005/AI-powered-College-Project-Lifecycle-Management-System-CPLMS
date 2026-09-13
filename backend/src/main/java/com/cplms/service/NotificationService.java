package com.cplms.service;

import com.cplms.entity.NotificationItem;
import com.cplms.repository.NotificationItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class NotificationService {

    private final NotificationItemRepository notificationItemRepository;
    private final RestTemplate restTemplate;

    @Value("${app.notifications.default-discord-webhook:}")
    private String defaultDiscordWebhook;

    public NotificationService(NotificationItemRepository notificationItemRepository) {
        this.notificationItemRepository = notificationItemRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public NotificationItem dispatch(String recipientEmail, String title, String message, String type, String customWebhookUrl) {
        String webhook = (customWebhookUrl != null && !customWebhookUrl.trim().isEmpty())
                ? customWebhookUrl.trim()
                : defaultDiscordWebhook;

        // 1. Save in-app notification to database
        NotificationItem item = new NotificationItem(recipientEmail, title, message, "BOTH", type, webhook);
        NotificationItem saved = notificationItemRepository.save(item);

        // 2. Dispatch Institutional Email
        dispatchEmail(recipientEmail, title, message);

        // 3. Dispatch Discord Webhook
        if (webhook != null && webhook.startsWith("https://discord.com/api/webhooks/")) {
            dispatchDiscordWebhook(webhook, title, message, type);
        }

        return saved;
    }

    private void dispatchEmail(String recipientEmail, String title, String message) {
        // Standard institutional email dispatch log
        System.out.println("================================================================================");
        System.out.println("[INSTITUTIONAL EMAIL DISPATCH]");
        System.out.println("TO: " + recipientEmail);
        System.out.println("SUBJECT: [CPLMS Alert] " + title);
        System.out.println("BODY: " + message);
        System.out.println("================================================================================");
    }

    public boolean dispatchDiscordWebhook(String webhookUrl, String title, String message, String type) {
        try {
            int color;
            switch (type) {
                case "GUIDE_APPROVE":
                    color = 0x10B981; // Green
                    break;
                case "DUPLICATION_ALERT":
                case "GUIDE_REJECT":
                    color = 0xEF4444; // Red
                    break;
                case "REVISION_REQUEST":
                    color = 0xF59E0B; // Amber
                    break;
                case "TEAM_INVITE":
                    color = 0x3B82F6; // Blue
                    break;
                default:
                    color = 0x6366F1; // Indigo
                    break;
            }

            Map<String, Object> embed = new HashMap<>();
            embed.put("title", title);
            embed.put("description", message);
            embed.put("color", color);
            embed.put("timestamp", java.time.Instant.now().toString());

            Map<String, String> footer = new HashMap<>();
            footer.put("text", "CPLMS • AI College Project Lifecycle Platform");
            embed.put("footer", footer);

            Map<String, Object> payload = new HashMap<>();
            payload.put("username", "CPLMS Project Bot");
            payload.put("avatar_url", "https://cdn-icons-png.flaticon.com/512/4712/4712109.png");
            payload.put("embeds", Collections.singletonList(embed));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "CPLMS-Academic-Portal/2.0");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, entity, String.class);
            System.out.println("[DISCORD WEBHOOK DISPATCH SUCCESS] -> " + title);
            return true;
        } catch (Exception e) {
            System.err.println("[DISCORD WEBHOOK DISPATCH FAILED] -> " + e.getMessage());
            return false;
        }
    }

    public List<NotificationItem> getMyNotifications(String email) {
        return notificationItemRepository.findTop20ByRecipientEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public void markAsRead(UUID id) {
        notificationItemRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationItemRepository.save(n);
        });
    }
}
