import { ResumeData, SkillGroup } from "@/types/resume";

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Turns raw model output into a safe ResumeData: fills missing fields with empty
 * strings (never invented values), trims text, and drops any skill that is also
 * listed as a certification so nothing appears twice.
 */
export function cleanResume(raw: unknown): ResumeData {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const p = (r.personalInfo && typeof r.personalInfo === "object" ? r.personalInfo : {}) as Record<string, unknown>;

  const certifications = strList(r.certifications);
  const certKeys = new Set(certifications.map(key));
  const notCert = (s: string) => !certKeys.has(key(s));

  const skillGroups: SkillGroup[] = (Array.isArray(r.skillGroups) ? r.skillGroups : [])
    .map((g) => {
      const group = (g && typeof g === "object" ? g : {}) as Record<string, unknown>;
      return { category: str(group.category), items: strList(group.items).filter(notCert) };
    })
    .filter((g) => g.category && g.items.length > 0);

  const skills = strList(r.skills).filter(notCert);

  const experience = (Array.isArray(r.experience) ? r.experience : []).map((e) => {
    const x = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
    const note = str(x.note);
    return {
      company: str(x.company),
      position: str(x.position),
      startDate: str(x.startDate),
      endDate: str(x.endDate),
      description: strList(x.description),
      ...(note ? { note } : {}),
    };
  }).filter((e) => e.company || e.position);

  const education = (Array.isArray(r.education) ? r.education : []).map((e) => {
    const x = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
    const details = str(x.details);
    return {
      institution: str(x.institution),
      degree: str(x.degree),
      startDate: str(x.startDate),
      endDate: str(x.endDate),
      ...(details ? { details } : {}),
    };
  }).filter((e) => e.institution || e.degree);

  return {
    personalInfo: {
      fullName: str(p.fullName),
      email: str(p.email),
      phone: str(p.phone),
      location: str(p.location),
      linkedinUrl: str(p.linkedinUrl),
      portfolioUrl: str(p.portfolioUrl),
    },
    summary: str(r.summary),
    experience,
    education,
    skills: skills.length > 0 ? skills : skillGroups.flatMap((g) => g.items),
    ...(skillGroups.length > 0 ? { skillGroups } : {}),
    ...(certifications.length > 0 ? { certifications } : {}),
  };
}
