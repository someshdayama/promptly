"use client";

import { ResumeData } from "@/types/resume";
import styles from "./ModernTemplate.module.css";
import { useResumeEditor } from "@/hooks/useResumeEditor";
import {
  CertificationsSection,
  ContactInfo,
  EducationSection,
  Editable,
  ExperienceSection,
  SectionTitle,
  SkillsSection,
  SummarySection,
} from "./sections";

interface ModernTemplateProps {
  data: ResumeData;
  className?: string;
  onChange?: (updated: ResumeData) => void;
}

/** Two-column layout: contact, skills, education and certifications in a sidebar. */
export default function ModernTemplate({ data, className = "", onChange }: ModernTemplateProps) {
  const ed = useResumeEditor(data, onChange);
  const side = { data, ed, s: { ...styles, section: styles.sidebarSection, sectionTitle: styles.sidebarTitle } };
  const main = { data, ed, s: styles };

  return (
    <div className={`${styles.page} ${onChange ? styles.isEditable : ""} ${className}`}>
      <aside className={styles.sidebar}>
        <header className={styles.header}>
          <Editable
            as="h1"
            className={styles.name}
            html={data.personalInfo?.fullName || "Your Name"}
            editable={ed.isEditable}
            label="Full name"
            onCommit={(t) => ed.updatePersonalInfo("fullName", t)}
          />
        </header>
        <section className={styles.sidebarSection}>
          <SectionTitle s={side.s}>Contact</SectionTitle>
          <ContactInfo {...side} layout="stack" />
        </section>
        <SkillsSection {...side} />
        <EducationSection {...side} />
        <CertificationsSection {...side} />
      </aside>
      <div className={styles.main}>
        <SummarySection {...main} />
        <ExperienceSection {...main} />
      </div>
    </div>
  );
}
