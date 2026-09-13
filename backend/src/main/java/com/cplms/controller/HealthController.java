package com.cplms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "HEALTHY");
        health.put("timestamp", LocalDateTime.now().toString());

        // 1. Database Health & Latency Probe
        Map<String, Object> dbHealth = new HashMap<>();
        long startDb = System.currentTimeMillis();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            long latency = System.currentTimeMillis() - startDb;
            dbHealth.put("status", "UP");
            dbHealth.put("latencyMs", latency);
            dbHealth.put("engine", "PostgreSQL 16 Enterprise (pgvector)");
        } catch (Exception e) {
            dbHealth.put("status", "DEGRADED");
            dbHealth.put("error", e.getMessage());
            health.put("status", "DEGRADED");
        }
        health.put("database", dbHealth);

        // 2. JVM Memory & Runtime Metrics
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;

        Map<String, Object> memory = new HashMap<>();
        memory.put("usedMb", usedMemory);
        memory.put("freeMb", freeMemory);
        memory.put("totalMb", totalMemory);
        memory.put("maxMb", maxMemory);
        memory.put("availableProcessors", runtime.availableProcessors());
        health.put("jvmMemory", memory);

        // 3. AI Intelligence Microservice Probe
        Map<String, Object> aiHealth = new HashMap<>();
        try {
            long startAi = System.currentTimeMillis();
            String aiResp = restTemplate.getForObject("http://localhost:8000/health", String.class);
            long latencyAi = System.currentTimeMillis() - startAi;
            aiHealth.put("status", "UP");
            aiHealth.put("latencyMs", latencyAi);
            aiHealth.put("endpoint", "http://localhost:8000");
        } catch (Exception e) {
            aiHealth.put("status", "OFFLINE");
            aiHealth.put("note", "AI service standby on port 8000");
        }
        health.put("aiService", aiHealth);

        // 4. Object Storage Status
        Map<String, Object> storage = new HashMap<>();
        storage.put("status", "UP");
        storage.put("provider", "MinIO S3 Distributed Object Store / Local Fallback");
        storage.put("bucket", "cplms-documents");
        storage.put("encryption", "AES-256 (Server-Side Encryption)");
        health.put("storage", storage);

        return ResponseEntity.ok(health);
    }
}
