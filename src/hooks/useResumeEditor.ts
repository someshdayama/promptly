import { ResumeData } from "@/types/resume";

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

  const handleLinkedinClick = (e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    const currentUrl = data.personalInfo?.linkedinUrl || "";
    const newUrl = prompt("Enter your LinkedIn URL:", currentUrl);
    if (newUrl !== null) {
      updatePersonalInfo("linkedinUrl", newUrl);
    }
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
    handleJobDateBlur,
    handleEduDateBlur,
  };
}
