export interface SkillGroup {
  /** Category label, e.g. "Cloud" or "CI/CD". */
  category: string;
  items: string[];
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
  /** Optional short note shown next to the role, e.g. "promoted to Software Engineer". */
  note?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  /** Optional extra line such as "GPA: 8/10". */
  details?: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  summary: string;
  /**
   * Consecutive entries with the same company are rendered under one company
   * heading (e.g. a promotion), most recent role first.
   */
  experience: ExperienceEntry[];
  education: EducationEntry[];
  /** Flat skills list. Kept for backwards compatibility and as a fallback. */
  skills: string[];
  /** Skills grouped by category. Preferred over `skills` when present. */
  skillGroups?: SkillGroup[];
  certifications?: string[];
}
