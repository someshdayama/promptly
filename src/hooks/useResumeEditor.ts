import { ResumeData, SkillGroup } from "@/types/resume";
import { normalizeUrl } from "@/utils/links";
import { parseSkillList } from "@/utils/skills";

export function useResumeEditor(data: ResumeData, onChange?: (updated: ResumeData) => void) {
  const isEditable = !!onChange;

  const updatePersonalInfo = (field: keyof NonNullable<ResumeData["personalInfo"]>, value: string) => {
    if (!onChange) return;
    const personalInfo = data.personalInfo || { fullName: "", email: "" };
    onChange({
      ...data,
      personalInfo: {
        ...personalInfo,
        [field]: value,
      },
    });
  };

  const updateSummary = (value: string) => {
    if (!onChange) return;
    onChange({
      ...data,
      summary: value,
    });
  };

  const updateJobField = (index: number, field: string, value: string) => {
    if (!onChange) return;
    const experience = data.experience || [];
    const updatedExp = [...experience];
    if (!updatedExp[index]) {
      updatedExp[index] = { company: "", position: "", startDate: "", endDate: "", description: [] };
    }
    updatedExp[index] = {
      ...updatedExp[index],
      [field]: value,
    };
    onChange({
      ...data,
      experience: updatedExp,
    });
  };

  const updateJobBullet = (jobIndex: number, bulletIndex: number, value: string) => {
    if (!onChange) return;
    const experience = data.experience || [];
    const updatedExp = [...experience];
    if (!updatedExp[jobIndex]) {
      updatedExp[jobIndex] = { company: "", position: "", startDate: "", endDate: "", description: [] };
    }
    const bullets = [...(updatedExp[jobIndex].description || [])];
    bullets[bulletIndex] = value;
    updatedExp[jobIndex] = {
      ...updatedExp[jobIndex],
      description: bullets,
    };
    onChange({
      ...data,
      experience: updatedExp,
    });
  };

  const updateEduField = (index: number, field: string, value: string) => {
    if (!onChange) return;
    const education = data.education || [];
    const updatedEdu = [...education];
    if (!updatedEdu[index]) {
      updatedEdu[index] = { institution: "", degree: "", startDate: "", endDate: "" };
    }
    updatedEdu[index] = {
      ...updatedEdu[index],
      [field]: value,
    };
    onChange({
      ...data,
      education: updatedEdu,
    });
  };

  const updateSkill = (index: number, value: string) => {
    if (!onChange) return;
    const skills = data.skills || [];
    const updatedSkills = [...skills];
    updatedSkills[index] = value;
    onChange({
      ...data,
      skills: updatedSkills,
    });
  };

  /**
   * In edit mode, clicking a profile link asks for a new URL instead of navigating.
   * An empty answer removes the link.
   */
  const handleLinkClick = (field: "linkedinUrl" | "portfolioUrl", label: string) => (e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    const currentUrl = data.personalInfo?.[field] || "";
    const newUrl = prompt(`Enter your ${label} URL (leave empty to remove):`, currentUrl);
    if (newUrl !== null) {
      const trimmed = newUrl.trim();
      updatePersonalInfo(field, trimmed ? normalizeUrl(trimmed) || currentUrl : "");
    }
  };

  const handleLinkedinClick = handleLinkClick("linkedinUrl", "LinkedIn");

  /** Renames the company on every role in a grouped company block in one update. */
  const updateCompanyForRoles = (indices: number[], value: string) => {
    if (!onChange) return;
    const updatedExp = [...(data.experience || [])];
    indices.forEach((i) => {
      if (updatedExp[i]) updatedExp[i] = { ...updatedExp[i], company: value };
    });
    onChange({ ...data, experience: updatedExp });
  };

  /** Updates the items of one skill group. Seeds explicit groups from `groups` (e.g. auto-grouped) if needed. */
  const updateSkillGroupItems = (groups: SkillGroup[], groupIndex: number, text: string) => {
    if (!onChange) return;
    const items = parseSkillList(text);
    const updatedGroups = groups
      .map((g, i) => (i === groupIndex ? { ...g, items } : g))
      .filter((g) => g.items.length > 0);
    onChange({
      ...data,
      skillGroups: updatedGroups,
      skills: updatedGroups.flatMap((g) => g.items),
    });
  };

  const updateSkillsFromText = (text: string) => {
    if (!onChange) return;
    onChange({ ...data, skills: parseSkillList(text), skillGroups: undefined });
  };

  const updateCertification = (index: number, value: string) => {
    if (!onChange) return;
    const certs = [...(data.certifications || [])];
    certs[index] = value.trim();
    onChange({ ...data, certifications: certs.filter(Boolean) });
  };

  const handleJobDateBlur = (index: number, text: string) => {
    if (!onChange) return;
    const parts = text.split(/\s*[-–—]|\s+to\s+/i);
    const start = parts[0]?.trim() || "";
    const end = parts[1]?.trim() || "";
    
    const experience = data.experience || [];
    const updatedExp = [...experience];
    if (!updatedExp[index]) {
      updatedExp[index] = { company: "", position: "", startDate: "", endDate: "", description: [] };
    }
    updatedExp[index] = {
      ...updatedExp[index],
      startDate: start,
      endDate: end,
    };
    onChange({
      ...data,
      experience: updatedExp,
    });
  };

  const handleEduDateBlur = (index: number, text: string) => {
    if (!onChange) return;
    const parts = text.split(/\s*[-–—]|\s+to\s+/i);
    const start = parts[0]?.trim() || "";
    const end = parts[1]?.trim() || "";
    
    const education = data.education || [];
    const updatedEdu = [...education];
    if (!updatedEdu[index]) {
      updatedEdu[index] = { institution: "", degree: "", startDate: "", endDate: "" };
    }
    updatedEdu[index] = {
      ...updatedEdu[index],
      startDate: start,
      endDate: end,
    };
    onChange({
      ...data,
      education: updatedEdu,
    });
  };

  return {
    isEditable,
    updatePersonalInfo,
    updateSummary,
    updateJobField,
    updateJobBullet,
    updateEduField,
    updateSkill,
    handleLinkedinClick,
    handleLinkClick,
    updateCompanyForRoles,
    updateSkillGroupItems,
    updateSkillsFromText,
    updateCertification,
    handleJobDateBlur,
    handleEduDateBlur,
  };
}
