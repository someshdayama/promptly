"use client";

import { ResumeData } from "@/types/resume";
import styles from "./CorporateTemplate.module.css";

interface CorporateTemplateProps {
  data: ResumeData;
}

export default function CorporateTemplate({ data }: CorporateTemplateProps) {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerCore}>
          <h1 className={styles.name}>{data.personalInfo?.fullName || "Your Name"}</h1>
          <div className={styles.contactRow}>
            {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo?.phone && (
              <>
                <span className={styles.divider}>|</span>
                <span>{data.personalInfo.phone}</span>
              </>
            )}
            {data.personalInfo?.location && (
              <>
                <span className={styles.divider}>|</span>
                <span>{data.personalInfo.location}</span>
              </>
            )}
            {data.personalInfo?.linkedinUrl && (
              <>
                <span className={styles.divider}>|</span>
                <a href={data.personalInfo.linkedinUrl}>LinkedIn</a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Summary</h2>
          <p className={styles.summary}>{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Experience</h2>
          
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.jobItem}>
              <div className={styles.jobHeader}>
                <div className={styles.jobTitleGroup}>
                  <h3 className={styles.jobTitle}>{exp.position}</h3>
                  <span className={styles.companyName}>, {exp.company}</span>
                </div>
                <span className={styles.dateRange}>
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              
              {exp.description && exp.description.length > 0 && (
                <ul className={styles.bulletList}>
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          
          {data.education.map((edu, index) => (
            <div key={index} className={styles.eduItem}>
              <div className={styles.eduHeader}>
                <h3 className={styles.degree}>{edu.degree}</h3>
                <span className={styles.dateRange}>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              <div className={styles.institution}>{edu.institution}</div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Core Competencies</h2>
          <div className={styles.skillsGrid}>
            {data.skills.map((skill, index) => (
              <div key={index} className={styles.skillItem}>
                • {skill}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
