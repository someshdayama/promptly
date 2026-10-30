"use client";

import { ResumeData } from "@/types/resume";
import styles from "./AtsTemplate.module.css";
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

interface AtsTemplateProps {
  data: ResumeData;
  className?: string;
  onChange?: (data: ResumeData) => void;
}

/** Single-column, ATS-friendly layout: plain headings with a thin rule, real text (no icons or tables), one-page friendly. */
export default function AtsTemplate({ data, className = "", onChange }: AtsTemplateProps) {
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
