package com.cplms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "historical_projects")
public class HistoricalProject {

    @Id
    private String id; // e.g., "ARCH-2024-01"

    @Column(nullable = false)
    private String title;

    @Column(name = "problem_statement", columnDefinition = "TEXT")
    private String problemStatement;

    private String domain;

    @Column(name = "academic_year")
    private String academicYear;

    public HistoricalProject() {}

    public HistoricalProject(String id, String title, String problemStatement, String domain, String academicYear) {
        this.id = id;
        this.title = title;
        this.problemStatement = problemStatement;
        this.domain = domain;
        this.academicYear = academicYear;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
