import { ResumeData } from "@/types/resume";

export const serializeProfileToPrompt = (profile: ResumeData): string => {
  if (!profile.personalInfo) return "";

  return `My name is ${profile.personalInfo.fullName || ""}. I am based in ${profile.personalInfo.location || ""}. Phone: ${profile.personalInfo.phone || ""}. Email: ${profile.personalInfo.email || ""}.

${profile.summary ? `SUMMARY:\n${profile.summary}\n` : ""}
SKILLS:
${(profile.skills || []).map((s) => `- ${s}`).join("\n")}

WORK EXPERIENCE:
${(profile.experience || [])
      .map(
        (exp) => `
${exp.company || ""} | ${exp.position || ""} — ${exp.startDate || ""} to ${exp.endDate || ""}
${(exp.description || []).map((bullet) => `- ${bullet}`).join("\n")}
`
      )
      .join("\n")}

EDUCATION:
${(profile.education || [])
      .map((edu) => `- ${edu.degree || ""} — ${edu.institution || ""} — ${edu.endDate || ""}`)
      .join("\n")}`.trim();
};
