import { ResumeData } from "@/types/resume";

export const serializeProfileToPrompt = (profile: ResumeData): string => {
  const parts: string[] = [];

  if (profile.personalInfo) {
    const info = profile.personalInfo;
    const infoStr = `My name is ${info.fullName || ""}. I am based in ${info.location || ""}. Phone: ${info.phone || ""}. Email: ${info.email || ""}.`;
    parts.push(infoStr);
  }

  if (profile.summary) {
    parts.push(`SUMMARY:\n${profile.summary}`);
  }

  if (profile.skills && profile.skills.length > 0) {
    parts.push(`SKILLS:\n${profile.skills.map((s) => `- ${s}`).join("\n")}`);
  }

  if (profile.experience && profile.experience.length > 0) {
    const expStr = profile.experience
      .map(
        (exp) => `${exp.company || ""} | ${exp.position || ""} — ${exp.startDate || ""} to ${exp.endDate || ""}\n${(exp.description || []).map((bullet) => `- ${bullet}`).join("\n")}`
      )
      .join("\n\n");
    parts.push(`WORK EXPERIENCE:\n${expStr}`);
  }

  if (profile.education && profile.education.length > 0) {
    const eduStr = profile.education
      .map((edu) => `- ${edu.degree || ""} — ${edu.institution || ""} — ${edu.endDate || ""}`)
      .join("\n");
    parts.push(`EDUCATION:\n${eduStr}`);
  }

  return parts.join("\n\n").trim();
};
