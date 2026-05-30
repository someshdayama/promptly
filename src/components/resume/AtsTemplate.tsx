import React, { Fragment } from "react";
import styles from "./AtsTemplate.module.css";
import { ResumeData } from "@/types/resume";
import { useResumeEditor } from "@/hooks/useResumeEditor";

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
    updateSkill,
  } = useResumeEditor(data, onChange);

  return (
    <div className={`${styles.page} ${className || ""}`}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1
          className={`${styles.name} ${styles.editable}`}
          contentEditable={!!onChange}
          suppressContentEditableWarning
          onBlur={(e) => updatePersonalInfo("fullName", e.currentTarget.textContent || "")}
        >
          {data.personalInfo?.fullName || "Your Name"}
        </h1>

        <div className={styles.contactInfo}>
          {data.personalInfo?.location && (
            <>
              <span
                className={styles.editable}
                contentEditable={!!onChange}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo("location", e.currentTarget.textContent || "")}
              >
                {data.personalInfo.location}
              </span>
              <span className={styles.contactSeparator}>|</span>
            </>
          )}
          {data.personalInfo?.phone && (
            <>
              <span
                className={styles.editable}
                contentEditable={!!onChange}
                suppressContentEditableWarning
                onBlur={(e) => updatePersonalInfo("phone", e.currentTarget.textContent || "")}
              >
                {data.personalInfo.phone}
              </span>
              <span className={styles.contactSeparator}>|</span>
            </>
          )}
          {data.personalInfo?.email && (
            <>
              <a href={`mailto:${data.personalInfo.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                <span
                  className={styles.editable}
                  contentEditable={!!onChange}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("email", e.currentTarget.textContent || "")}
                >
                  {data.personalInfo.email}
                </span>
              </a>
            </>
          )}
          {data.personalInfo?.linkedinUrl && (
            <>
              <span className={styles.contactSeparator}>|</span>
              <a 
                href={data.personalInfo.linkedinUrl.startsWith("http") ? data.personalInfo.linkedinUrl : `https://${data.personalInfo.linkedinUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <span
                  className={styles.editable}
                  contentEditable={!!onChange}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("linkedinUrl", e.currentTarget.textContent || "")}
                >
                  {data.personalInfo.linkedinUrl.replace("https://www.", "")}
                </span>
              </a>
            </>
          )}
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
            onBlur={(e) => updateSummary(e.currentTarget.textContent || "")}
          >
            {data.summary}
          </p>
        </div>
      )}

      {/* SKILLS */}
      {data.skills && data.skills.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.skillsList}>
            {data.skills.map((skill, index) => (
              <Fragment key={index}>
                <span
                  className={styles.editable}
                  contentEditable={!!onChange}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSkill(index, e.currentTarget.textContent || "")}
                >
                  {skill}
                </span>
                {index < data.skills!.length - 1 && <span>, </span>}
              </Fragment>
            ))}
          </div>
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
                    onBlur={(e) => updateJobField(index, "company", e.currentTarget.textContent || "")}
                  >
                    {exp.company}
                  </span>
                </div>
                
                <div className={styles.positionHeader}>
                  <span
                    className={`${styles.position} ${styles.editable}`}
                    contentEditable={!!onChange}
                    suppressContentEditableWarning
                    onBlur={(e) => updateJobField(index, "position", e.currentTarget.textContent || "")}
                  >
                    {exp.position}
                  </span>
                  <span className={styles.itemDate}>
                    <span
                      className={styles.editable}
                      contentEditable={!!onChange}
                      suppressContentEditableWarning
                      onBlur={(e) => updateJobField(index, "startDate", e.currentTarget.textContent || "")}
                    >
                      {exp.startDate}
                    </span>{" "}
                    -{" "}
                    <span
                      className={styles.editable}
                      contentEditable={!!onChange}
                      suppressContentEditableWarning
                      onBlur={(e) => updateJobField(index, "endDate", e.currentTarget.textContent || "")}
                    >
                      {exp.endDate}
                    </span>
                  </span>
                </div>
                
                <ul className={styles.bulletList}>
                  {(exp.description || []).map((desc, dIndex) => (
                    <li
                      key={dIndex}
                      className={styles.editable}
                      contentEditable={!!onChange}
                      suppressContentEditableWarning
                      onBlur={(e) => updateJobBullet(index, dIndex, e.currentTarget.textContent || "")}
                    >
                      {desc}
                    </li>
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
                    onBlur={(e) => updateEduField(index, "institution", e.currentTarget.textContent || "")}
                  >
                    {edu.institution}
                  </span>
                </div>
                
                <div className={styles.positionHeader}>
                  <span
                    className={`${styles.position} ${styles.editable}`}
                    contentEditable={!!onChange}
                    suppressContentEditableWarning
                    onBlur={(e) => updateEduField(index, "degree", e.currentTarget.textContent || "")}
                  >
                    {edu.degree}
                  </span>
                  <span className={styles.itemDate}>
                    <span
                      className={styles.editable}
                      contentEditable={!!onChange}
                      suppressContentEditableWarning
                      onBlur={(e) => updateEduField(index, "endDate", e.currentTarget.textContent || "")}
                    >
                      {edu.endDate}
                    </span>
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
