"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import styles from "./MinimalistTemplate.module.css";
import { useResumeEditor } from "@/hooks/useResumeEditor";
import { sanitizeHtml } from "@/utils/sanitize";

interface MinimalistTemplateProps {
  data: ResumeData;
  className?: string;
  onChange?: (updated: ResumeData) => void;
}

export default function MinimalistTemplate({ data, className = "", onChange }: MinimalistTemplateProps) {
  const {
    isEditable,
    updatePersonalInfo,
    updateSummary,
    updateJobField,
    updateJobBullet,
    updateEduField,
    handleLinkedinClick,
    handleJobDateBlur,
    handleEduDateBlur,
  } = useResumeEditor(data, onChange);

  return (
    <div className={`${styles.page} ${className}`}>
      {/* Header */}
      <header className={styles.header}>
        <h1
          className={styles.name}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo("fullName", e.currentTarget.innerText)}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo?.fullName || "Your Name") }}
        />
        <div className={styles.contact}>
          {[
            data.personalInfo?.email && (
              <a
                key="email"
                href={`mailto:${data.personalInfo.email}`}
                onClick={(e) => {
                  if (isEditable) e.preventDefault();
                }}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <span
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("email", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.email) }}
                />
              </a>
            ),
            data.personalInfo?.phone && (
              <span
                key="phone"
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo("phone", e.currentTarget.innerText)}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.phone) }}
              />
            ),
            data.personalInfo?.location && (
              <span
                key="location"
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo("location", e.currentTarget.innerText)}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.location) }}
              />
            ),
            data.personalInfo?.linkedinUrl && (
              <a
                key="linkedin"
                href={data.personalInfo.linkedinUrl.startsWith("http") ? data.personalInfo.linkedinUrl : `https://${data.personalInfo.linkedinUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkedinClick}
                style={{ fontWeight: 600, borderBottom: "1px dashed var(--resume-accent, #64748b)", cursor: isEditable ? "pointer" : "inherit" }}
              >
                linkedin
              </a>
            ),
          ]
            .filter(Boolean)
            .map((item, idx, arr) => (
              <React.Fragment key={idx}>
                {item}
                {idx < arr.length - 1 && <span className={styles.dot}>•</span>}
              </React.Fragment>
            ))}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p
            className={styles.summary}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => updateSummary(e.currentTarget.innerText)}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }}
          />
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div
            className={styles.skillsList}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.textContent || "";
              const updatedSkills = text
                .split(/[•,]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              onChange?.({
                ...data,
                skills: updatedSkills,
              });
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.skills.join(" • ")) }}
          />
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <div className={styles.experienceList}>
            {data.experience.map((exp, index) => (
              <div key={index} className={styles.job}>
                <div className={styles.jobHeader}>
                  <h3
                    className={styles.jobTitle}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updateJobField(index, "position", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.position) }}
                  />
                  <span
                    className={styles.jobDate}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleJobDateBlur(index, e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml((exp.startDate && exp.endDate)
                        ? `${exp.startDate} – ${exp.endDate}`
                        : exp.startDate || exp.endDate || "")
                    }}
                  />
                </div>
                <div
                  className={styles.company}
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => updateJobField(index, "company", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.company) }}
                />
                {exp.description && exp.description.length > 0 && (
                  <ul className={styles.descriptionList}>
                    {exp.description.map((desc, i) => (
                      <li
                        key={i}
                        contentEditable={isEditable}
                        suppressContentEditableWarning
                        onBlur={(e) => updateJobBullet(index, i, e.currentTarget.innerText)}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc) }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <div className={styles.educationList}>
            {data.education.map((edu, index) => (
              <div key={index} className={styles.educationItem}>
                <div className={styles.educationHeader}>
                  <h3
                    className={styles.degree}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updateEduField(index, "degree", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.degree) }}
                  />
                  <span
                    className={styles.educationDate}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleEduDateBlur(index, e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml((edu.startDate && edu.endDate)
                        ? `${edu.startDate} – ${edu.endDate}`
                        : edu.startDate || edu.endDate || "")
                    }}
                  />
                </div>
                <div
                  className={styles.institution}
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => updateEduField(index, "institution", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.institution) }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
