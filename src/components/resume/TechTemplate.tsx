"use client";

import { ResumeData } from "@/types/resume";
import styles from "./TechTemplate.module.css";

interface TechTemplateProps {
  data: ResumeData;
}

export default function TechTemplate({ data }: TechTemplateProps) {
  const { personalInfo, summary, experience, education, skills } = data;

  return (
    <div className={styles.page}>
      {/* Full-width dark header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.name}>{personalInfo?.fullName || "Your Name"}</h1>
          <p className={styles.roleLabel}>
            {experience?.[0]?.position || "DevOps & Cloud Engineer"}
          </p>
        </div>
        <div className={styles.contactBar}>
          {personalInfo?.email && (
            <span className={styles.contactItem}>✉ {personalInfo.email}</span>
          )}
          {personalInfo?.phone && (
            <span className={styles.contactItem}>📱 {personalInfo.phone}</span>
          )}
          {personalInfo?.location && (
            <span className={styles.contactItem}>📍 {personalInfo.location}</span>
          )}
          {personalInfo?.linkedinUrl && (
            <span className={styles.contactItem}>
              <a href={personalInfo.linkedinUrl}>LinkedIn ↗</a>
            </span>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className={styles.sideSection}>
            <h2 className={styles.sideSectionTitle}>Tech Stack</h2>
            <div className={styles.skillsList}>
              {skills.map((skill, i) => (
                <span key={i} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className={styles.sideSection}>
            <h2 className={styles.sideSectionTitle}>Education</h2>
            {education.map((edu, i) => (
              <div key={i} className={styles.eduItem}>
                <h3 className={styles.degree}>{edu.degree}</h3>
                <p className={styles.institution}>{edu.institution}</p>
                {(edu.startDate || edu.endDate) && (
                  <p className={styles.eduDate}>{edu.startDate} – {edu.endDate}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {/* Summary */}
        {summary && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Professional Summary</h2>
            <p className={styles.summary}>{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} className={styles.job}>
                <div className={styles.jobHeader}>
                  <h3 className={styles.jobTitle}>{exp.position}</h3>
                  <span className={styles.jobDate}>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className={styles.company}>{exp.company}</div>
                {exp.description && exp.description.length > 0 && (
                  <ul className={styles.bulletList}>
                    {exp.description.map((desc, j) => (
                      <li key={j}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
