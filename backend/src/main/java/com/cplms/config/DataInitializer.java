package com.cplms.config;

import com.cplms.entity.*;
import com.cplms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ValidationReportRepository validationReportRepository;
    private final GuideReviewRepository guideReviewRepository;
    private final HistoricalProjectRepository historicalProjectRepository;
    private final AuditLogRepository auditLogRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ContributionEntryRepository contributionEntryRepository;
    private final GuideCapacityRepository guideCapacityRepository;
    private final NotificationItemRepository notificationItemRepository;
    private final PanelReviewRepository panelReviewRepository;
    private final MilestoneReviewRepository milestoneReviewRepository;
    private final ProjectVersionRepository projectVersionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           ValidationReportRepository validationReportRepository,
                           GuideReviewRepository guideReviewRepository,
                           HistoricalProjectRepository historicalProjectRepository,
                           AuditLogRepository auditLogRepository,
                           TeamRepository teamRepository,
                           TeamMemberRepository teamMemberRepository,
                           ContributionEntryRepository contributionEntryRepository,
                           GuideCapacityRepository guideCapacityRepository,
                           NotificationItemRepository notificationItemRepository,
                           PanelReviewRepository panelReviewRepository,
                           MilestoneReviewRepository milestoneReviewRepository,
                           ProjectVersionRepository projectVersionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.validationReportRepository = validationReportRepository;
        this.guideReviewRepository = guideReviewRepository;
        this.historicalProjectRepository = historicalProjectRepository;
        this.auditLogRepository = auditLogRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.contributionEntryRepository = contributionEntryRepository;
        this.guideCapacityRepository = guideCapacityRepository;
        this.notificationItemRepository = notificationItemRepository;
        this.panelReviewRepository = panelReviewRepository;
        this.milestoneReviewRepository = milestoneReviewRepository;
        this.projectVersionRepository = projectVersionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            String defaultPwd = passwordEncoder.encode("password123");

            // 1. Admin
            User admin = new User("admin@gcet.edu.in", defaultPwd, "System Administrator", Role.ROLE_ADMIN, "Information Technology");
            userRepository.save(admin);

            // 2. Overall Project Coordinator
            User overallCoord = new User("coordinator@gcet.edu.in", defaultPwd, "Dr. Ramesh Sharma (Overall Coordinator)", Role.ROLE_OVERALL_COORDINATOR, "Computer Science & Engineering");
            userRepository.save(overallCoord);

            // 3. Section-wise Guide
            User sectionGuide = new User("sectionguide@gcet.edu.in", defaultPwd, "Dr. K. V. Rao (Section-Wise Guide)", Role.ROLE_SECTION_COORDINATOR, "Computer Science & Engineering");
            sectionGuide.setSection("Section A");
            userRepository.save(sectionGuide);

            // 4. Internal Guide
            User internalGuide = new User("internalguide@gcet.edu.in", defaultPwd, "Prof. Anita Deshmukh (Internal Guide)", Role.ROLE_INTERNAL_GUIDE, "Computer Science & Engineering");
            internalGuide.setSection("Section A");
            userRepository.save(internalGuide);

            // 4b. Independent Panel Member (Phase 4)
            User panelMember = new User("panel.member@gcet.edu.in", defaultPwd, "Dr. S. K. Gupta (Senior Panelist)", Role.ROLE_PANEL, "Computer Science & Engineering");
            panelMember.setSection("Section A");
            userRepository.save(panelMember);

            // 5. Student - Team Leader
            User studentLead = new User("student.lead@gcet.edu.in", defaultPwd, "Sai Krishna (Team Leader)", Role.ROLE_STUDENT, "Computer Science & Engineering");
            studentLead.setRollNumber("21CS042");
            studentLead.setSection("Section A");
            studentLead.setTeamLead(true);
            userRepository.save(studentLead);

            // 6. Student - Team Member
            User studentMember = new User("student.member@gcet.edu.in", defaultPwd, "Rohan Verma (Team Member)", Role.ROLE_STUDENT, "Computer Science & Engineering");
            studentMember.setRollNumber("21CS089");
            studentMember.setSection("Section A");
            studentMember.setTeamLead(false);
            userRepository.save(studentMember);

            // 7. Additional students in Section A
            User s3 = new User("meera@gcet.edu.in", defaultPwd, "Meera Nambiar", Role.ROLE_STUDENT, "Computer Science & Engineering");
            s3.setRollNumber("21CS015");
            s3.setSection("Section A");
            userRepository.save(s3);

            for (int i = 4; i <= 8; i++) {
                User s = new User("student" + i + "@gcet.edu.in", defaultPwd, "Student Batch " + i, Role.ROLE_STUDENT, "Computer Science & Engineering");
                s.setRollNumber("21CS0" + (10 + i));
                s.setSection(i % 2 == 0 ? "Section B" : "Section A");
                userRepository.save(s);
            }

            // Seed Live Guide Capacities (FR-7.1)
            guideCapacityRepository.save(new GuideCapacity(
                    internalGuide.getEmail(),
                    internalGuide.getFullName(),
                    "Computer Science & Engineering",
                    "Section A",
                    3,
                    1
            ));
            guideCapacityRepository.save(new GuideCapacity(
                    sectionGuide.getEmail(),
                    sectionGuide.getFullName(),
                    "Computer Science & Engineering",
                    "Section A",
                    3,
                    0
            ));

            // Seed Live Team (FR-4.1)
            Team team = new Team("Team Alpha", studentLead.getEmail(), studentLead.getFullName(), "Section A");
            team.setStatus("ACTIVE");
            team.setDiscordWebhookUrl("https://discord.com/api/webhooks/example/demo");
            Team savedTeam = teamRepository.save(team);

            // Seed Team Members
            teamMemberRepository.save(new TeamMember(
                    savedTeam.getId(),
                    studentLead.getEmail(),
                    studentLead.getFullName(),
                    studentLead.getRollNumber(),
                    "Computer Vision Lead",
                    "ACCEPTED"
            ));
            teamMemberRepository.save(new TeamMember(
                    savedTeam.getId(),
                    studentMember.getEmail(),
                    studentMember.getFullName(),
                    studentMember.getRollNumber(),
                    "Backend & Database",
                    "ACCEPTED"
            ));
            teamMemberRepository.save(new TeamMember(
                    savedTeam.getId(),
                    s3.getEmail(),
                    s3.getFullName(),
                    s3.getRollNumber(),
                    "Edge Device Deployment",
                    "INVITED"
            ));

            // Seed Historical Projects for Vector Similarity Screening
            historicalProjectRepository.save(new HistoricalProject(
                    "ARCH-2024-01",
                    "Smart Classroom Attendance using Deep Face Recognition",
                    "Automated classroom attendance tracking with IP cameras and deep neural facial feature embedding.",
                    "Computer Vision & AI",
                    "2024"
            ));
            historicalProjectRepository.save(new HistoricalProject(
                    "ARCH-2023-14",
                    "Facial Recognition Based Attendance Management with OpenCV",
                    "Automating university attendance using camera feeds, OpenCV Haar cascades, and MySQL database.",
                    "Computer Vision",
                    "2023"
            ));
            historicalProjectRepository.save(new HistoricalProject(
                    "ARCH-2025-09",
                    "Blockchain Based Academic Credentials Verification",
                    "Tamper-proof academic degree certificates verification using Ethereum smart contracts.",
                    "Blockchain & Security",
                    "2025"
            ));

            // Seed Live Project in Database
            Project proj1 = new Project(
                    "Automated Smart Attendance System using Face Recognition",
                    "Manual attendance tracking in university lecture halls is time-consuming and prone to proxy attendance. Professors lose 10-15 minutes every lecture taking roll calls on paper attendance sheets.",
                    "A computer vision system that captures classroom images via IP cameras, performs real-time face detection and recognition using deep neural networks, and updates the college ERP attendance database automatically.",
                    "Computer Vision & AI",
                    "Major",
                    "Python, OpenCV, PyTorch, FastAPI, React",
                    "Attendance, Deep Learning, Face Recognition, Edge Computing",
                    "Team Alpha",
                    studentLead.getEmail(),
                    "Section A"
            );
            proj1.setStatus("UNDER_REVIEW");
            proj1.setAssignedGuideEmail(internalGuide.getEmail());
            proj1.setAssignedGuideName(internalGuide.getFullName());
            proj1.setSubmittedAt(LocalDateTime.now().minusDays(6));
            proj1.setCurrentVersion(2);
            proj1.setSlaDaysPending(6);
            proj1.setSlaBreached(true);
            proj1.setEscalationTier(1);
            Project savedProj1 = projectRepository.save(proj1);

            // Seed Historical Version 1 Snapshot for Version Diff Modal
            projectVersionRepository.save(new ProjectVersion(
                    savedProj1.getId(),
                    1,
                    "Classroom Attendance using Basic Webcams",
                    "Attendance in classrooms is done using manual paper sheets which is slow.",
                    "A basic Python script that captures webcam images and saves timestamps in a local CSV file.",
                    "Python, OpenCV, SQLite",
                    "Initial baseline proposal draft before faculty revision directives."
            ));

            // Seed Live AI Validation Report in Database (with explainability & risk assessment)
            ValidationReport valReport = new ValidationReport();
            valReport.setProjectId(savedProj1.getId());
            valReport.setSimilarityPercentage(78.5);
            valReport.setDuplicateRisk(true);
            valReport.setNoveltyScore(3.2);
            valReport.setComplexityScore(7.0);
            valReport.setScopeEvaluation("Appropriately Scoped");
            valReport.setNoveltySummary("High similarity (78.5%) detected against ARCH-2024-01. Core objectives overlap with prior year attendance projects.");
            valReport.setClosestMatchesJson("[{\"historical_id\":\"ARCH-2024-01\",\"title\":\"Smart Classroom Attendance using Deep Face Recognition\",\"domain\":\"Computer Vision & AI\",\"academic_year\":\"2024\",\"similarity_percentage\":78.5},{\"historical_id\":\"ARCH-2023-14\",\"title\":\"Facial Recognition Based Attendance Management with OpenCV\",\"domain\":\"Computer Vision\",\"academic_year\":\"2023\",\"similarity_percentage\":65.2}]");
            valReport.setAlternativeDirectionsJson("[\"Introduce privacy-preserving edge computing with on-device facial feature extraction.\",\"Incorporate 3D liveness / anti-spoofing detection to prevent static photo proxy attacks.\",\"Pivot to real-time classroom engagement and attention tracking using head pose estimation.\"]");
            valReport.setAttributedFeaturesJson("[\"Facial Recognition & Biometrics Pipeline\", \"Automated Attendance CSV Logger\", \"Computer Vision & Multi-Camera Video Stream Processing\"]");
            valReport.setRiskLevel("LOW");
            valReport.setRiskSummary("Well-balanced scope and technology stack. High probability of on-time milestone completion.");
            valReport.setTimelineFeasibility("High - Fully achievable within 16-week semester");
            valReport.setGeneratedAt(LocalDateTime.now().minusHours(3));
            validationReportRepository.save(valReport);

            // Seed 4 Milestone Reviews (Review 1 evaluated, Review 2 submitted, Review 3 & Viva pending)
            MilestoneReview m1 = new MilestoneReview(savedProj1.getId(), "REVIEW_1", "Review 1: Synopsis & Architecture Review", LocalDateTime.now().minusDays(15));
            m1.setStatus("EVALUATED");
            m1.setSubmissionUrl("https://github.com/cplms/attendance-cv");
            m1.setSubmissionNotes("Completed system architecture, data flow diagrams, and dataset acquisition.");
            m1.setInnovationScore(4);
            m1.setDesignScore(5);
            m1.setImplementationScore(4);
            m1.setDocumentationScore(4);
            m1.setPresentationScore(5);
            m1.setTotalScore(22);
            m1.setEvaluatorEmail(internalGuide.getEmail());
            m1.setEvaluatorName(internalGuide.getFullName());
            m1.setEvaluatorFeedback("Outstanding architecture document and clear dataset preprocessing pipeline.");
            m1.setSubmittedAt(LocalDateTime.now().minusDays(16));
            m1.setEvaluatedAt(LocalDateTime.now().minusDays(14));
            milestoneReviewRepository.save(m1);

            MilestoneReview m2 = new MilestoneReview(savedProj1.getId(), "REVIEW_2", "Review 2: Mid-Term Implementation Check", LocalDateTime.now().plusDays(5));
            m2.setStatus("SUBMITTED");
            m2.setSubmissionUrl("https://github.com/cplms/attendance-cv/releases/tag/v0.5-alpha");
            m2.setSubmissionNotes("Implemented FaceNet face detection pipeline and benchmarked 94% accuracy on test video.");
            m2.setSubmittedAt(LocalDateTime.now().minusHours(4));
            milestoneReviewRepository.save(m2);

            MilestoneReview m3 = new MilestoneReview(savedProj1.getId(), "REVIEW_3", "Review 3: Final Code Complete & Test Coverage", LocalDateTime.now().plusDays(25));
            m3.setStatus("PENDING");
            milestoneReviewRepository.save(m3);

            MilestoneReview m4 = new MilestoneReview(savedProj1.getId(), "FINAL_VIVA", "Stage 6: Final Viva Voce & Committee Defense", LocalDateTime.now().plusDays(40));
            m4.setStatus("PENDING");
            milestoneReviewRepository.save(m4);

            // Seed Live Guide Review in Database
            GuideReview guideReview = new GuideReview(
                    savedProj1.getId(),
                    internalGuide.getEmail(),
                    internalGuide.getFullName(),
                    4, 3, 4, 2,
                    "Good formulation, but AI screening confirms 78.5% similarity with 2024 project. Student must incorporate edge computing or 3D anti-spoofing before final milestone.",
                    "APPROVED"
            );
            guideReviewRepository.save(guideReview);

            // Seed Independent Panel Review (Phase 4)
            PanelReview panelReview = new PanelReview(
                    savedProj1.getId(),
                    "panel.member@gcet.edu.in",
                    "Dr. S. K. Gupta (Senior Panelist)",
                    4, 4, 4, 3,
                    "Proposal is technically solid. Good implementation scope for major project. Recommend proceeding with edge-based deployment.",
                    "APPROVED"
            );
            panelReviewRepository.save(panelReview);

            // Seed Live Contribution Entries (FR-11.1 & FR-11.2)
            contributionEntryRepository.save(new ContributionEntry(
                    savedProj1.getId(),
                    studentLead.getEmail(),
                    studentLead.getFullName(),
                    "Computer Vision Pipeline",
                    "Developed MTCNN and FaceNet model integrations for classroom video frames. Achieved 94% detection rate.",
                    18.5,
                    "https://github.com/cplms/attendance-cv/pull/4"
            ));
            ContributionEntry rohanEntry = new ContributionEntry(
                    savedProj1.getId(),
                    studentMember.getEmail(),
                    studentMember.getFullName(),
                    "Database & REST APIs",
                    "Designed PostgreSQL attendance tables and developed FastAPI synchronization endpoints.",
                    14.0,
                    "https://github.com/cplms/attendance-cv/pull/2"
            );
            rohanEntry.setLeaderApprovalStatus("APPROVED");
            rohanEntry.setLeaderFeedback("Excellent schema and integration tests.");
            rohanEntry.setReviewedAt(LocalDateTime.now().minusHours(1));
            contributionEntryRepository.save(rohanEntry);

            // Seed Live Multi-Channel Notification Items (Email + Discord)
            notificationItemRepository.save(new NotificationItem(
                    studentLead.getEmail(),
                    "⚠️ High AI Similarity Alert (78.5%)",
                    "Your proposal 'Automated Smart Attendance System' has 78.5% similarity with ARCH-2024-01. Review constructive alternative angles.",
                    "BOTH",
                    "DUPLICATION_ALERT",
                    team.getDiscordWebhookUrl()
            ));
            notificationItemRepository.save(new NotificationItem(
                    studentLead.getEmail(),
                    "Team Invitation Sent to Meera Nambiar",
                    "Invitation dispatched via institutional email and team Discord channel.",
                    "BOTH",
                    "TEAM_INVITE",
                    team.getDiscordWebhookUrl()
            ));
            notificationItemRepository.save(new NotificationItem(
                    studentMember.getEmail(),
                    "Team Invitation: Team Alpha",
                    "Sai Krishna invited you to join Team Alpha for Section A.",
                    "BOTH",
                    "TEAM_INVITE",
                    team.getDiscordWebhookUrl()
            ));
            notificationItemRepository.save(new NotificationItem(
                    internalGuide.getEmail(),
                    "New Proposal Ready for Review: Team Alpha",
                    "Automated Smart Attendance System using Face Recognition (78.5% similarity flag).",
                    "BOTH",
                    "SUBMISSION",
                    null
            ));

            System.out.println(">>> CPLMS Initializer: Phase 2 & 3 entities live (Teams, Members, Workloads, Contributions, Dual-Channel Notifications, AI Reports).");
        }
    }
}
