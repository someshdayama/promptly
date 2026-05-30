"use client";

import { ResumeData } from "@/types/resume";
import styles from "./ModernTemplate.module.css";
import { useResumeEditor } from "@/hooks/useResumeEditor";

interface ModernTemplateProps {
  data: ResumeData;
  className?: string;
  onChange?: (updated: ResumeData) => void;
}

export default function ModernTemplate({ data, className = "", onChange }: ModernTemplateProps) {
  const {
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
  } = useResumeEditor(data, onChange);

  return (
    <div className={`${styles.page} ${className}`}>
      {/* Sidebar - Left Column */}
      <aside className={styles.sidebar}>
        {/* Name Header */}
        <header className={styles.header}>
          <h1
            className={styles.name}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => updatePersonalInfo("fullName", e.currentTarget.innerText)}
            dangerouslySetInnerHTML={{ __html: data.personalInfo?.fullName || "Your Name" }}
          />
        </header>

        {/* Contact Info */}
        <div className={styles.sidebarSection}>
          <h2 className={styles.sidebarTitle}>Contact</h2>
          <div className={styles.contactList}>
            {data.personalInfo?.email && (
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <a href={`mailto:${data.personalInfo.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                  <span
                    className={styles.contactValue}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updatePersonalInfo("email", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: data.personalInfo.email }}
                  />
                </a>
              </div>
            )}
            {data.personalInfo?.phone && (
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Phone</span>
                <span
                  className={styles.contactValue}
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("phone", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: data.personalInfo.phone }}
                />
              </div>
            )}
            {data.personalInfo?.location && (
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Location</span>
                <span
                  className={styles.contactValue}
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => updatePersonalInfo("location", e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: data.personalInfo.location }}
                />
              </div>
            )}
            {data.personalInfo?.linkedinUrl && (
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>LinkedIn</span>
                <a
                  href={data.personalInfo.linkedinUrl.startsWith("http") ? data.personalInfo.linkedinUrl : `https://${data.personalInfo.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkedinClick}
                  className={styles.linkedinLink}
                  style={{ cursor: isEditable ? "pointer" : "inherit" }}
                >
                  linkedin
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className={styles.sidebarSection}>
            <h2 className={styles.sidebarTitle}>Education</h2>
            <div className={styles.educationList}>
              {data.education.map((edu, index) => (
                <div key={index} className={styles.educationItem}>
                  <div
                    className={styles.degree}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updateEduField(index, "degree", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: edu.degree }}
                  />
                  <div
                    className={styles.institution}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updateEduField(index, "institution", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: edu.institution }}
                  />
                  <div
                    className={styles.educationDate}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => handleEduDateBlur(index, e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: `${edu.startDate} – ${edu.endDate}` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className={styles.sidebarSection}>
            <h2 className={styles.sidebarTitle}>Skills</h2>
            <div className={styles.skillsList}>
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className={styles.skillTag}
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => updateSkill(index, e.currentTarget.innerText)}
                  dangerouslySetInnerHTML={{ __html: skill }}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area - Right Column */}
      <main className={styles.mainContent}>

        {/* Professional Summary */}
        {data.summary && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Profile Summary</h2>
            <p
              className={styles.summary}
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => updateSummary(e.currentTarget.innerText)}
              dangerouslySetInnerHTML={{ __html: data.summary }}
            />
          </section>
        )}

        {/* Professional Experience */}
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
                      dangerouslySetInnerHTML={{ __html: exp.position }}
                    />
                    <span
                      className={styles.jobDate}
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => handleJobDateBlur(index, e.currentTarget.innerText)}
                      dangerouslySetInnerHTML={{ __html: `${exp.startDate} – ${exp.endDate}` }}
                    />
                  </div>
                  <div
                    className={styles.company}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    onBlur={(e) => updateJobField(index, "company", e.currentTarget.innerText)}
                    dangerouslySetInnerHTML={{ __html: exp.company }}
                  />
                  {exp.description && exp.description.length > 0 && (
                    <ul className={styles.descriptionList}>
                      {exp.description.map((desc, i) => (
                        <li
                          key={i}
                          contentEditable={isEditable}
                          suppressContentEditableWarning
                          onBlur={(e) => updateJobBullet(index, i, e.currentTarget.innerText)}
                          dangerouslySetInnerHTML={{ __html: desc }}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
