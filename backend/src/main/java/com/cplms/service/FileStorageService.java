package com.cplms.service;

import io.minio.*;
import io.minio.errors.MinioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.minio.endpoint:http://localhost:9000}")
    private String minioEndpoint;

    @Value("${app.minio.access-key:minioadmin}")
    private String minioAccessKey;

    @Value("${app.minio.secret-key:minioadmin}")
    private String minioSecretKey;

    @Value("${app.minio.bucket:cplms-documents}")
    private String bucketName;

    private final Path localFallbackPath = Paths.get("uploads").toAbsolutePath().normalize();
    private MinioClient minioClient;
    private boolean minioAvailable = false;

    public FileStorageService() {
        try {
            Files.createDirectories(localFallbackPath);
        } catch (Exception e) {
            log.warn("Could not create local upload fallback directory: {}", e.getMessage());
        }
    }

    private synchronized MinioClient getMinioClient() {
        if (minioClient == null) {
            try {
                minioClient = MinioClient.builder()
                        .endpoint(minioEndpoint)
                        .credentials(minioAccessKey, minioSecretKey)
                        .build();

                boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
                if (!found) {
                    minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                    log.info("Created MinIO S3 bucket: {}", bucketName);
                }
                minioAvailable = true;
            } catch (Exception e) {
                log.warn("MinIO S3 is not currently reachable at {}. Operating with local resilient storage fallback.", minioEndpoint);
                minioAvailable = false;
            }
        }
        return minioClient;
    }

    public Map<String, Object> uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        long size = file.getSize();

        // 1. Attempt MinIO S3 upload
        MinioClient client = getMinioClient();
        if (client != null && minioAvailable) {
            try (InputStream is = file.getInputStream()) {
                client.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(uniqueFileName)
                                .stream(is, size, -1)
                                .contentType(contentType)
                                .build()
                );
                log.info("Successfully uploaded file to MinIO S3: {}/{}", bucketName, uniqueFileName);
                String fileUrl = "/api/files/" + uniqueFileName;
                return Map.of(
                        "fileName", cleanName,
                        "storedName", uniqueFileName,
                        "fileUrl", fileUrl,
                        "fileSize", size,
                        "contentType", contentType,
                        "storageProvider", "MinIO S3 (" + bucketName + ")"
                );
            } catch (Exception e) {
                log.warn("MinIO S3 upload failed ({}); falling back to local disk storage.", e.getMessage());
            }
        }

        // 2. Resilient Fallback to Local Disk
        try {
            Path targetLocation = this.localFallbackPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "/api/files/" + uniqueFileName;
            log.info("Saved file locally to fallback disk store: {}", targetLocation);
            return Map.of(
                    "fileName", cleanName,
                    "storedName", uniqueFileName,
                    "fileUrl", fileUrl,
                    "fileSize", size,
                    "contentType", contentType,
                    "storageProvider", "Local Disk Store (Fallback)"
            );
        } catch (Exception e) {
            throw new RuntimeException("Could not store file locally: " + e.getMessage(), e);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        // Try MinIO first
        MinioClient client = getMinioClient();
        if (client != null && minioAvailable) {
            try {
                InputStream is = client.getObject(
                        GetObjectArgs.builder().bucket(bucketName).object(fileName).build()
                );
                return new org.springframework.core.io.InputStreamResource(is);
            } catch (Exception e) {
                log.debug("File not found in MinIO or MinIO offline; checking local storage fallback.");
            }
        }

        // Try local disk
        try {
            Path filePath = this.localFallbackPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }
}
