export type UserRole =
  | 'ROLE_STUDENT'
  | 'ROLE_INTERNAL_GUIDE'
  | 'ROLE_SECTION_COORDINATOR'
  | 'ROLE_OVERALL_COORDINATOR'
  | 'ROLE_PANEL'
  | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  section?: string;
  teamLead?: boolean;
  rollNumber?: string;
  phone?: string;
  skills?: string;
  researchInterests?: string;
  experienceYears?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  active: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  section?: string;
  teamLead?: boolean;
}

export interface AuditLogItem {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface Team {
  id: string;
  name: string;
  leaderEmail: string;
  leaderName?: string;
  section: string;
  academicTerm: string;
  status: string;
  discordWebhookUrl?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userEmail: string;
  fullName: string;
  rollNumber?: string;
  claimedRole?: string;
  inviteStatus: 'INVITED' | 'ACCEPTED' | 'DECLINED';
  joinedAt?: string;
}

export interface TeamDetailsDto {
  team: Team | null;
  members: TeamMember[];
  pendingInvitesForMe: TeamMember[];
}

export interface ContributionEntry {
  id: string;
  projectId: string;
  studentEmail: string;
  studentName: string;
  moduleName: string;
  taskDescription: string;
  hoursSpent: number;
  githubCommitOrPr?: string;
  leaderApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  leaderFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface GuideCapacity {
  id: string;
  guideEmail: string;
  guideName: string;
  department: string;
  section?: string;
  maxProjects: number;
  currentProjects: number;
  availableSlots: number;
}

export interface NotificationItem {
  id: string;
  recipientEmail: string;
  title: string;
  message: string;
  channel: 'EMAIL' | 'DISCORD' | 'BOTH';
  type: string;
  discordWebhookUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface GuideReviewData {
  id?: string;
  guideEmail: string;
  guideName: string;
  problemScore: number;
  methodologyScore: number;
  feasibilityScore: number;
  innovationScore: number;
  totalScore: number;
  percentage: number;
  comments: string;
  decision: string;
  submittedAt: string;
}

export interface ValidationReportData {
  id?: string;
  similarityPercentage: number;
  duplicateRisk: boolean;
  noveltyScore: number;
  complexityScore: number;
  scopeEvaluation: string;
  noveltySummary: string;
  closestMatchesJson?: string;
  alternativeDirectionsJson?: string;
  attributedFeaturesJson?: string;
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH_SCOPE_CREEP' | 'RESOURCE_CONSTRAINED';
  riskSummary?: string;
  timelineFeasibility?: string;
  generatedAt: string;
}

export interface ProjectProposal {
  id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  domain: string;
  keywords: string;
  techStack: string;
  projectType: string;
  status: string;
  teamName: string;
  teamLeadEmail: string;
  section: string;
  guideEmail?: string;
  assignedGuideEmail?: string;
  assignedGuideName?: string;
  currentVersion?: number;
  slaDaysPending?: number;
  slaBreached?: boolean;
  escalationTier?: number;
  createdAt: string;
  submittedAt?: string;
  validationReport?: ValidationReportData;
  guideReview?: GuideReviewData;
  githubRepoUrl?: string;
  demoVideoUrl?: string;
  finalReportUrl?: string;
  presentationUrl?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  techStack?: string;
  diffSummary?: string;
  createdAt: string;
}

export interface SystemHealthData {
  status: 'HEALTHY' | 'DEGRADED';
  timestamp: string;
  database: {
    status: string;
    latencyMs?: number;
    engine?: string;
    error?: string;
  };
  jvmMemory: {
    usedMb: number;
    freeMb: number;
    totalMb: number;
    maxMb: number;
    availableProcessors: number;
  };
  aiService: {
    status: string;
    latencyMs?: number;
    endpoint?: string;
    note?: string;
  };
  storage: {
    status: string;
    provider: string;
    bucket: string;
    encryption: string;
  };
}

export interface DeliverablesRequest {
  githubRepoUrl: string;
  demoVideoUrl: string;
  finalReportUrl: string;
  presentationUrl: string;
}

export type Project = ProjectProposal;

export interface DashboardStats {
  totalProjects: number;
  approvedProjects: number;
  underReviewProjects: number;
  totalStudents: number;
  totalFaculty: number;
  validationRate: number;
  guideWorkloadRatio: number;
  availableGuideSlots: number;
}

export interface PanelReview {
  id?: string;
  projectId: string;
  panelistEmail: string;
  panelistName: string;
  rubricProblemScore: number;
  rubricMethodologyScore: number;
  rubricFeasibilityScore: number;
  rubricInnovationScore: number;
  comments: string;
  decision: 'APPROVED' | 'REVISION' | 'REJECTED';
  submittedAt?: string;
  averageScore?: number;
}

export interface PanelSummary {
  projectId: string;
  reviewCount: number;
  averageRubricScore: number;
  approvedCount: number;
  revisionCount: number;
  rejectedCount: number;
  blindReviewEnabled: boolean;
  reviews: PanelReview[];
}

export interface MilestoneReview {
  id: string;
  projectId: string;
  stageName: 'REVIEW_1' | 'REVIEW_2' | 'REVIEW_3' | 'FINAL_VIVA';
  stageTitle: string;
  deadline?: string;
  submissionUrl?: string;
  submissionNotes?: string;
  status: 'PENDING' | 'SUBMITTED' | 'EVALUATED';
  innovationScore?: number;
  designScore?: number;
  implementationScore?: number;
  documentationScore?: number;
  presentationScore?: number;
  totalScore?: number;
  evaluatorEmail?: string;
  evaluatorName?: string;
  evaluatorFeedback?: string;
  submittedAt?: string;
  evaluatedAt?: string;
}


