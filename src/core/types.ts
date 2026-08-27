export interface LocationInfo {
  country?: string | null;
  city?: string | null;
  state?: string | null;
  raw: string;
}

export interface CompanySummary {
  name: string;
  title: string;
  industry?: string | null;
  companyUrl?: string | null;
  companyUrn?: string | null;
  companyStaffCount?: number | null;
}

export interface ProfilePicture {
  url: string;
  expiresAt?: string | null;
  rawUrn?: string | null;
}

export interface ExperienceItem {
  id?: string;
  title: string;
  companyName: string;
  companyUrl?: string | null;
  companyUrn?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  duration?: string | null;
  isCurrent: boolean;
  description?: string | null;
  employmentType?: string | null;
}

export interface EducationItem {
  id?: string;
  schoolName: string;
  schoolUrl?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  grade?: string | null;
  activities?: string | null;
  description?: string | null;
}

export interface SkillItem {
  name: string;
  endorsementCount?: number;
}

export interface CertificationItem {
  name: string;
  issuingAuthority?: string | null;
  issueDate?: string | null;
  expirationDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

export interface LanguageItem {
  name: string;
  proficiency?: string | null;
}

export interface ContactInfo {
  emails: string[];
  professionalEmail?: string | null;
  phones?: string[];
  websites?: string[];
  twitter?: string | null;
  birthday?: string | null;
  address?: string | null;
}

export interface LinkedInProfile {
  // Core Identifiers (PhantomBuster columns 1-6)
  profileUrl: string;
  slug: string;
  urn: string;
  memberId?: string | null;
  publicIdentifier: string;

  // Name & Headline (PhantomBuster columns 7-12)
  fullName: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string | null;

  // Location (PhantomBuster columns 13-16)
  location: LocationInfo;

  // Current Position & Company (PhantomBuster columns 17-22)
  currentCompany?: CompanySummary | null;

  // Images & Media (PhantomBuster columns 23-26)
  profilePicture?: ProfilePicture | null;
  backgroundPicture?: ProfilePicture | null;

  // Experience History (PhantomBuster columns 27-32)
  experience: ExperienceItem[];

  // Education History (PhantomBuster columns 33-36)
  education: EducationItem[];

  // Skills, Certs, Languages (PhantomBuster columns 37-40)
  skills: SkillItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];

  // Contact Info & Discovered Emails (PhantomBuster columns 41-44+)
  contactInfo: ContactInfo;

  // Additional Metadata & Stats
  connectionCount?: number | null;
  followerCount?: number | null;
  isInfluencer?: boolean;
  isCreator?: boolean;
  isPremium?: boolean;

  // Metadata
  meta: {
    fetchedAt: string;
    dataSource: 'voyager_api' | 'public_html' | 'sandbox_demo';
    processingTimeMs: number;
    cached?: boolean;
  };
}

export interface ProfileRequestInput {
  url: string;
  liAtCookie?: string;
  jsessionId?: string;
  enrichEmail?: boolean;
  useSandboxFallback?: boolean;
}

export interface BatchRequestInput {
  urls: string[];
  liAtCookie?: string;
  jsessionId?: string;
  enrichEmail?: boolean;
  useSandboxFallback?: boolean;
}

export interface ProfileResponse {
  status: 'success' | 'error';
  data?: LinkedInProfile;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface BatchResponse {
  status: 'success' | 'partial' | 'error';
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    url: string;
    success: boolean;
    data?: LinkedInProfile;
    error?: string;
  }>;
  processingTimeMs: number;
}
