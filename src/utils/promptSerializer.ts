import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/utils/experience";

export const serializeProfileToPrompt = (profile: ResumeData): string => {
  const parts: string[] = [];

  if (profile.personalInfo) {
    const info = profile.personalInfo;
    const lines = [
      `My name is ${info.fullName || ""}. I am based in ${info.location || ""}. Phone: ${info.phone || ""}. Email: ${info.email || ""}.`,
    ];
    if (info.linkedinUrl) lines.push(`LinkedIn: ${info.linkedinUrl}`);
    if (info.portfolioUrl) lines.push(`Portfolio: ${info.portfolioUrl}`);
    parts.push(lines.join("\n"));
  }

  if (profile.summary) {
    parts.push(`SUMMARY:\n${profile.summary}`);
  }

  if (profile.skillGroups && profile.skillGroups.length > 0) {
    parts.push(`SKILLS:\n${profile.skillGroups.map((g) => `- ${g.category}: ${g.items.join(", ")}`).join("\n")}`);
  } else if (profile.skills && profile.skills.length > 0) {
    parts.push(`SKILLS:\n${profile.skills.map((s) => `- ${s}`).join("\n")}`);
  }

  if (profile.experience && profile.experience.length > 0) {
    const expStr = profile.experience
      .map((exp) => {
        const header = `${exp.company || ""} | ${exp.position || ""} — ${exp.startDate || ""} to ${exp.endDate || ""}${exp.note ? ` (${exp.note})` : ""}`;
        return `${header}\n${(exp.description || []).map((bullet) => `- ${bullet}`).join("\n")}`;
      })
      .join("\n\n");
    parts.push(`WORK EXPERIENCE:\n${expStr}`);
  }

  if (profile.education && profile.education.length > 0) {
    const eduStr = profile.education
      .map((edu) => {
        const dates = formatDateRange(edu.startDate, edu.endDate);
        return `- ${[edu.degree, edu.institution, dates, edu.details].filter(Boolean).join(" — ")}`;
      })
      .join("\n");
    parts.push(`EDUCATION:\n${eduStr}`);
  }

  if (profile.certifications && profile.certifications.length > 0) {
    parts.push(`CERTIFICATIONS:\n${profile.certifications.map((c) => `- ${c}`).join("\n")}`);
  }

  return parts.join("\n\n").trim();
};
