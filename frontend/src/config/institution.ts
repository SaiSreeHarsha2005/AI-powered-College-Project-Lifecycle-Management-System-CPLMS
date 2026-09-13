/**
 * Multi-tenant Institutional Branding Configuration
 * Customize this file or supply environment variables to white-label
 * the platform for any college, university, or academic department.
 */

export interface InstitutionConfig {
  name: string;
  shortName: string;
  acronym: string;
  tagline: string;
  logoUrl: string;
  primaryDepartment: string;
  academicYear: string;
  supportEmail: string;
  portalTitle: string;
}

export const defaultInstitutionConfig: InstitutionConfig = {
  name: import.meta.env.VITE_INSTITUTION_NAME || "Geethanjali College of Engineering and Technology",
  shortName: import.meta.env.VITE_INSTITUTION_SHORT_NAME || "GCET Autonomous",
  acronym: import.meta.env.VITE_INSTITUTION_ACRONYM || "GCET",
  tagline: "Department of Computer Science & Engineering",
  logoUrl: "/gcet_logo.png",
  primaryDepartment: "Computer Science and Engineering",
  academicYear: "2025 - 2026",
  supportEmail: "projects-support@gcet.edu.in",
  portalTitle: "AI-Powered Project Lifecycle & Governance System",
};

export default defaultInstitutionConfig;
