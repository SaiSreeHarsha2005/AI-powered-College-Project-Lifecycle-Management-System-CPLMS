package com.cplms.controller;

import com.cplms.entity.AuditLog;
import com.cplms.entity.Role;
import com.cplms.entity.User;
import com.cplms.repository.AuditLogRepository;
import com.cplms.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/import")
@Tag(name = "Bulk Excel Import", description = "Endpoints for batch user import and account generation")
public class BulkImportController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public BulkImportController(UserRepository userRepository,
                                AuditLogRepository auditLogRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static class ImportCommitRequest {
        private String type; // "STUDENT" or "FACULTY"
        private List<Map<String, String>> records;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public List<Map<String, String>> getRecords() { return records; }
        public void setRecords(List<Map<String, String>> records) { this.records = records; }
    }

    @PostMapping("/commit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Commit parsed Excel records into database with BCrypt-hashed passwords")
    public ResponseEntity<Map<String, Object>> commitImport(@RequestBody ImportCommitRequest req) {
        String actor = SecurityContextHolder.getContext().getAuthentication().getName();
        String defaultPassword = passwordEncoder.encode("password123");
        int count = 0;

        Role targetRole = "FACULTY".equalsIgnoreCase(req.getType()) ? Role.ROLE_INTERNAL_GUIDE : Role.ROLE_STUDENT;

        if (req.getRecords() != null) {
            for (Map<String, String> row : req.getRecords()) {
                String email = row.get("email");
                if (email != null && !email.trim().isEmpty() && !userRepository.existsByEmail(email.trim())) {
                    User user = new User();
                    user.setEmail(email.trim());
                    user.setPassword(defaultPassword);
                    user.setFullName(row.getOrDefault("name", "Imported User"));
                    user.setRole(targetRole);
                    user.setDepartment(row.getOrDefault("department", "Computer Science & Engineering"));
                    user.setSection(row.getOrDefault("section", "Section A"));
                    user.setRollNumber(row.getOrDefault("roll_number", "REG-" + (1000 + count)));
                    user.setPhone(row.getOrDefault("phone", "9876543210"));
                    user.setActive(true);
                    userRepository.save(user);
                    count++;
                }
            }
        }

        auditLogRepository.save(new AuditLog(
                actor,
                "BULK_EXCEL_IMPORT_COMMITTED",
                "USER_BATCH",
                "BATCH-" + System.currentTimeMillis(),
                "Imported " + count + " " + req.getType().toLowerCase() + " accounts into database."
        ));

        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("createdAccounts", count);
        result.put("roleAssigned", targetRole.name());
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/parse-excel", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Parse uploaded .xlsx or .csv file with Apache POI and extract headers and rows")
    public ResponseEntity<Map<String, Object>> parseExcelFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        List<String> headers = new ArrayList<>();
        List<Map<String, String>> rows = new ArrayList<>();

        try {
            org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream());
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);

            org.apache.poi.ss.usermodel.DataFormatter formatter = new org.apache.poi.ss.usermodel.DataFormatter();
            org.apache.poi.ss.usermodel.Row headerRow = sheet.getRow(0);

            if (headerRow != null) {
                for (org.apache.poi.ss.usermodel.Cell cell : headerRow) {
                    String val = formatter.formatCellValue(cell).trim();
                    if (!val.isEmpty()) {
                        headers.add(val);
                    }
                }
            }

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(r);
                if (row == null) continue;

                Map<String, String> rowMap = new HashMap<>();
                boolean hasContent = false;
                for (int c = 0; c < headers.size(); c++) {
                    org.apache.poi.ss.usermodel.Cell cell = row.getCell(c);
                    String val = cell != null ? formatter.formatCellValue(cell).trim() : "";
                    if (!val.isEmpty()) hasContent = true;
                    rowMap.put(headers.get(c), val);
                }
                if (hasContent) {
                    rows.add(rowMap);
                }
            }
            workbook.close();

            response.put("fileName", file.getOriginalFilename());
            response.put("headers", headers);
            response.put("rows", rows);
            response.put("totalRows", rows.size());
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to parse Excel file: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
