"use client";

import { ResumeData } from "@/types/resume";
import styles from "./MinimalistTemplate.module.css";
import { useResumeEditor } from "@/hooks/useResumeEditor";
import {
  CertificationsSection,
  ContactInfo,
  EducationSection,
  Editable,
  ExperienceSection,
  SkillsSection,
  SummarySection,
} from "./sections";

interface MinimalistTemplateProps {
  data: ResumeData;
  className?: string;
  onChange?: (data: ResumeData) => void;
}

/** Clean single-column layout with a left-aligned header and accent headings. */
export default function MinimalistTemplate({ data, className = "", onChange }: MinimalistTemplateProps) {
  const ed = useResumeEditor(data, onChange);
  const props = { data, ed, s: styles };

  return (
    <div className={`${styles.page} ${onChange ? styles.isEditable : ""} ${className}`}>
      <header className={styles.header}>
        <Editable
          as="h1"
          className={styles.name}
          html={data.personalInfo?.fullName || "Your Name"}
          editable={ed.isEditable}
          label="Full name"
          onCommit={(t) => ed.updatePersonalInfo("fullName", t)}
        />
        <ContactInfo {...props} />
      </header>
      <SummarySection {...props} />
      <SkillsSection {...props} />
      <ExperienceSection {...props} />
      <EducationSection {...props} />
      <CertificationsSection {...props} />
    </div>
  );
}
