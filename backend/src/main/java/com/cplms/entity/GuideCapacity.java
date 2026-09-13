package com.cplms.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "guide_capacities")
public class GuideCapacity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "guide_email", nullable = false, unique = true)
    private String guideEmail;

    @Column(name = "guide_name", nullable = false)
    private String guideName;

    private String department;

    private String section;

    @Column(name = "max_projects", nullable = false)
    private int maxProjects = 3;

    @Column(name = "current_projects", nullable = false)
    private int currentProjects = 0;

    public GuideCapacity() {}

    public GuideCapacity(String guideEmail, String guideName, String department, String section, int maxProjects, int currentProjects) {
        this.guideEmail = guideEmail;
        this.guideName = guideName;
        this.department = department;
        this.section = section;
        this.maxProjects = maxProjects;
        this.currentProjects = currentProjects;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getGuideEmail() { return guideEmail; }
    public void setGuideEmail(String guideEmail) { this.guideEmail = guideEmail; }

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public int getMaxProjects() { return maxProjects; }
    public void setMaxProjects(int maxProjects) { this.maxProjects = maxProjects; }

    public int getCurrentProjects() { return currentProjects; }
    public void setCurrentProjects(int currentProjects) { this.currentProjects = currentProjects; }

    public int getAvailableSlots() {
        return Math.max(0, maxProjects - currentProjects);
    }
}
