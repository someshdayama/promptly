"use client";

import React from "react";
import styles from "./AtsTemplate.module.css";
import { ResumeData } from "@/types/resume";
import { useResumeEditor } from "@/hooks/useResumeEditor";
import { sanitizeHtml } from "@/utils/sanitize";

interface AtsTemplateProps {
  data: ResumeData;
  className?: string;
  onChange?: (data: ResumeData) => void;
}

export default function AtsTemplate({ data, className, onChange }: AtsTemplateProps) {
  const {
    updatePersonalInfo,
    updateSummary,
    updateJobField,
    updateJobBullet,
    updateEduField,
  } = useResumeEditor(data, onChange);

  return (
    <div className={`${styles.page} ${className || ""}`}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1
          className={`${styles.name} ${styles.editable}`}
          contentEditable={!!onChange}
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo("fullName", e.currentTarget.innerText)}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo?.fullName || "Your Name") }}
        />

        <div className={styles.contactInfo}>
          {[
            data.personalInfo?.location && (
              <span
                key="location"
                className={styles.editable}
                contentEditable={!!onChange}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo("location", e.currentTarget.innerText)}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.location) }}
              />
            ),
            data.personalInfo?.phone && (
              <span
                key="phone"
                className={styles.editable}
                contentEditable={!!onChange}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo("phone", e.currentTarget.innerText)}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.phone) }}
              />
            ),
            data.personalInfo?.email && (
              <a
                key="email"
                href={`mailto:${data.personalInfo.email}`}
                onClick={(e) => {
                  if (onChange) e.preventDefault();
                }}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <span
                  className={styles.editable}
                  contentEditable={!!onChange}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("email", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.email) }}
                />
              </a>
            ),
            data.personalInfo?.linkedinUrl && (
              <a 
                key="linkedin"
                href={data.personalInfo.linkedinUrl.startsWith("http") ? data.personalInfo.linkedinUrl : `https://${data.personalInfo.linkedinUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (onChange) e.preventDefault();
                }}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <span
                  className={styles.editable}
                  contentEditable={!!onChange}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("linkedinUrl", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.personalInfo.linkedinUrl.replace("https://www.", "")) }}
                />
              </a>
            ),
          ]
            .filter(Boolean)
            .map((item, idx, arr) => (
              <React.Fragment key={idx}>
                {item}
                {idx < arr.length - 1 && <span className={styles.contactSeparator}>|</span>}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* SUMMARY */}
      {data.summary && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p
            className={`${styles.summary} ${styles.editable}`}
            contentEditable={!!onChange}
            suppressContentEditableWarning
            onBlur={(e) => updateSummary(e.currentTarget.innerText)}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }}
          />
        </div>
      )}

      {/* SKILLS */}
      {data.skills && data.skills.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div
            className={`${styles.skillsList} ${styles.editable}`}
            contentEditable={!!onChange}
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
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.skills.join(", ")) }}
          />
        </div>
      )}

      {/* EXPERIENCE */}
      {data.experience && data.experience.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <div className={styles.itemList}>
            {data.experience.map((exp, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span
                    className={`${styles.company} ${styles.editable}`}
                    contentEditable={!!onChange}
                    suppressContentEditableWarning
                    onBlur={(e) => updateJobField(index, "company", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.company) }}
                  />
                </div>
                
                <div className={styles.positionHeader}>
                  <span
                    className={`${styles.position} ${styles.editable}`}
                    contentEditable={!!onChange}
                    suppressContentEditableWarning
                    onBlur={(e) => updateJobField(index, "position", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.position) }}
                  />
                  <span className={styles.itemDate}>
                    {exp.startDate && (
                      <span
                        className={styles.editable}
                        contentEditable={!!onChange}
                        suppressContentEditableWarning
                        onBlur={(e) => updateJobField(index, "startDate", e.currentTarget.innerText)}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.startDate) }}
                      />
                    )}
                    {exp.startDate && exp.endDate && <span> - </span>}
                    {exp.endDate && (
                      <span
                        className={styles.editable}
                        contentEditable={!!onChange}
                        suppressContentEditableWarning
                        onBlur={(e) => updateJobField(index, "endDate", e.currentTarget.innerText)}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.endDate) }}
                      />
                    )}
                  </span>
                </div>
                
                <ul className={styles.bulletList}>
                  {(exp.description || []).map((desc, dIndex) => (
                    <li
                      key={dIndex}
                      className={styles.editable}
                      contentEditable={!!onChange}
                      suppressContentEditableWarning
                      onBlur={(e) => updateJobBullet(index, dIndex, e.currentTarget.innerText)}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc) }}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION */}
      {data.education && data.education.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <div className={styles.itemList}>
            {data.education.map((edu, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span
                    className={`${styles.company} ${styles.editable}`}
                    contentEditable={!!onChange}
                    suppressContentEditableWarning
                    onBlur={(e) => updateEduField(index, "institution", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.institution) }}
                  />
                </div>
                
                <div className={styles.positionHeader}>
                  <span
                    className={`${styles.position} ${styles.editable}`}
                    contentEditable={!!onChange}
                    suppressContentEditableWarning
                    onBlur={(e) => updateEduField(index, "degree", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.degree) }}
                  />
                  <span className={styles.itemDate}>
                    <span
                      className={styles.editable}
                      contentEditable={!!onChange}
                      suppressContentEditableWarning
                      onBlur={(e) => updateEduField(index, "endDate", e.currentTarget.innerText)}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.endDate) }}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
