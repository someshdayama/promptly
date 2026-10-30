import { ExperienceEntry } from "@/types/resume";

export interface RoleWithIndex extends ExperienceEntry {
  /** Index of this role in the original `experience` array (used for inline edits). */
  index: number;
}

export interface CompanyGroup {
  company: string;
  /** Overall date range across all roles at this company. */
  startDate: string;
  endDate: string;
  roles: RoleWithIndex[];
}

const normalizeCompany = (name: string) =>
  (name || "")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Groups consecutive roles at the same company under one heading, so a promotion
 * reads as one company with several roles instead of the company repeated.
 * Experience is assumed to be ordered most recent first.
 */
export function groupExperienceByCompany(experience: ExperienceEntry[] | undefined): CompanyGroup[] {
  const groups: CompanyGroup[] = [];
  (experience || []).forEach((entry, index) => {
    const last = groups[groups.length - 1];
    const key = normalizeCompany(entry.company);
    if (last && key && normalizeCompany(last.company) === key) {
      last.roles.push({ ...entry, index });
      // Oldest role is last, so its start date becomes the group's start date.
      if (entry.startDate) last.startDate = entry.startDate;
      if (!last.endDate && entry.endDate) last.endDate = entry.endDate;
    } else {
      groups.push({
        company: entry.company,
        startDate: entry.startDate,
        endDate: entry.endDate,
        roles: [{ ...entry, index }],
      });
    }
  });
  return groups;
}

export function formatDateRange(start?: string, end?: string): string {
  const s = (start || "").trim();
  const e = (end || "").trim();
  if (s && e) return `${s} – ${e}`;
  return s || e;
}
