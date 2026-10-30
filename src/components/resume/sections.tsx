"use client";

import React from "react";
import { ResumeData, SkillGroup } from "@/types/resume";
import { useResumeEditor } from "@/hooks/useResumeEditor";
import { sanitizeHtml } from "@/utils/sanitize";
import { displayUrl, normalizeUrl } from "@/utils/links";
import { formatDateRange, groupExperienceByCompany } from "@/utils/experience";
import { getSkillGroups } from "@/utils/skills";

/**
 * Shared resume building blocks. Each template passes its own CSS module so the
 * markup (and ATS-friendly structure) stays identical while the look differs.
 */

type Classes = { readonly [key: string]: string };
type Editor = ReturnType<typeof useResumeEditor>;

interface EditableProps {
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "li";
  html: string;
  editable: boolean;
  onCommit: (text: string) => void;
  className?: string;
  label?: string;
}

/** Inline-editable text. Renders plain text for print, a contentEditable field in the builder. */
export function Editable({ as: Tag = "span", html, editable, onCommit, className, label }: EditableProps) {
  return (
    <Tag
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      {...(editable ? { role: "textbox", "aria-label": label, tabIndex: 0 } : {})}
      onBlur={(e: React.FocusEvent<HTMLElement>) => editable && onCommit(e.currentTarget.innerText.trim())}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

const cx = (...names: (string | undefined | false)[]) => names.filter(Boolean).join(" ");

interface BlockProps {
  data: ResumeData;
  ed: Editor;
  s: Classes;
}

/** Contact details and profile links. `layout="lines"` puts links on their own line. */
export function ContactInfo({ data, ed, s, layout = "lines" }: BlockProps & { layout?: "lines" | "stack" }) {
  const info = data.personalInfo || { fullName: "", email: "", phone: "", location: "" };
  const editable = ed.isEditable;

  const basics: React.ReactNode[] = [
    info.location && (
      <Editable key="location" html={info.location} editable={editable} label="Location"
        onCommit={(t) => ed.updatePersonalInfo("location", t)} className={s.contactItem} />
    ),
    info.phone && (
      <Editable key="phone" html={info.phone} editable={editable} label="Phone"
        onCommit={(t) => ed.updatePersonalInfo("phone", t)} className={s.contactItem} />
    ),
    info.email && (
      <a key="email" href={`mailto:${info.email}`} className={s.contactLink}
        onClick={(e) => editable && e.preventDefault()}>
        <Editable html={info.email} editable={editable} label="Email"
          onCommit={(t) => ed.updatePersonalInfo("email", t)} />
      </a>
    ),
  ].filter(Boolean);

  const links: React.ReactNode[] = (
    [
      ["linkedinUrl", "LinkedIn"],
      ["portfolioUrl", "Portfolio"],
    ] as const
  )
    .filter(([field]) => normalizeUrl(info[field]))
    .map(([field, label]) => (
      <span key={field} className={s.contactItem}>
        <span className={s.linkLabel}>{label}: </span>
        <a
          href={normalizeUrl(info[field])}
          target="_blank"
          rel="noopener noreferrer"
          className={s.contactLink}
          onClick={ed.handleLinkClick(field, label)}
          title={editable ? `Click to change your ${label} URL` : undefined}
        >
          {displayUrl(info[field])}
        </a>
      </span>
    ));

  if (layout === "stack") {
    return (
      <ul className={s.contactList}>
        {[...basics, ...links].map((item, i) => (
          <li key={i} className={s.contactRow}>{item}</li>
        ))}
      </ul>
    );
  }

  // Each separator travels with the item after it, so a wrapped line never starts or ends with "|".
  const joinWithSeparators = (items: React.ReactNode[]) =>
    items.map((item, idx) => (
      <span key={idx} className={s.contactChunk}>
        {idx > 0 && <span className={s.contactSeparator} aria-hidden="true">|</span>}
        {item}
      </span>
    ));

  return (
    <div className={s.contact}>
      {basics.length > 0 && <div className={s.contactLine}>{joinWithSeparators(basics)}</div>}
      {links.length > 0 && <div className={s.contactLine}>{joinWithSeparators(links)}</div>}
    </div>
  );
}

export function SectionTitle({ s, children }: { s: Classes; children: React.ReactNode }) {
  return <h2 className={s.sectionTitle}>{children}</h2>;
}

export function SummarySection({ data, ed, s, title = "Summary" }: BlockProps & { title?: string }) {
  if (!data.summary) return null;
  return (
    <section className={s.section}>
      <SectionTitle s={s}>{title}</SectionTitle>
      <Editable as="p" className={s.summary} html={data.summary} editable={ed.isEditable}
        label="Summary" onCommit={ed.updateSummary} />
    </section>
  );
}

export function SkillsSection({ data, ed, s, title = "Skills" }: BlockProps & { title?: string }) {
  const groups: SkillGroup[] | null = getSkillGroups(data);
  const flat = (data.skills || []).filter(Boolean);
  if (!groups && flat.length === 0) return null;

  return (
    <section className={s.section}>
      <SectionTitle s={s}>{title}</SectionTitle>
      {groups ? (
        <ul className={s.skillGroups}>
          {groups.map((g, i) => (
            <li key={`${g.category}-${i}`} className={s.skillRow}>
              <strong className={s.skillCategory}>{g.category}:</strong>{" "}
              <Editable html={g.items.join(", ")} editable={ed.isEditable} label={`${g.category} skills`}
                className={s.skillItems} onCommit={(t) => ed.updateSkillGroupItems(groups, i, t)} />
            </li>
          ))}
        </ul>
      ) : (
        <Editable as="p" className={s.skillsList} html={flat.join(", ")} editable={ed.isEditable}
          label="Skills" onCommit={ed.updateSkillsFromText} />
      )}
    </section>
  );
}

export function ExperienceSection({ data, ed, s, title = "Experience" }: BlockProps & { title?: string }) {
  const groups = groupExperienceByCompany(data.experience);
  if (groups.length === 0) return null;
  const editable = ed.isEditable;

  return (
    <section className={s.section}>
      <SectionTitle s={s}>{title}</SectionTitle>
      <div className={s.itemList}>
        {groups.map((group, gi) => {
          const multi = group.roles.length > 1;
          const first = group.roles[0];
          return (
            <div key={gi} className={s.item}>
              <div className={s.itemHeader}>
                <Editable as="h3" className={s.company} html={group.company} editable={editable}
                  label="Company" onCommit={(t) => ed.updateCompanyForRoles(group.roles.map((r) => r.index), t)} />
                {multi ? (
                  <span className={s.itemDate}>{formatDateRange(group.startDate, group.endDate)}</span>
                ) : (
                  <Editable className={s.itemDate} html={formatDateRange(first.startDate, first.endDate)}
                    editable={editable} label="Dates" onCommit={(t) => ed.handleJobDateBlur(first.index, t)} />
                )}
              </div>
              {group.roles.map((role) => (
                <div key={role.index} className={s.role}>
                  <div className={s.roleLine}>
                    <Editable className={s.position} html={role.position} editable={editable}
                      label="Job title" onCommit={(t) => ed.updateJobField(role.index, "position", t)} />
                    {multi && (
                      <span className={s.roleExtra}>
                        <span className={s.roleSeparator} aria-hidden="true">|</span>
                        <Editable className={s.roleDate} html={formatDateRange(role.startDate, role.endDate)}
                          editable={editable} label="Dates" onCommit={(t) => ed.handleJobDateBlur(role.index, t)} />
                      </span>
                    )}
                    {role.note && (
                      <span className={s.roleExtra}>
                        <span className={s.roleSeparator} aria-hidden="true">|</span>
                        <Editable className={s.roleNote} html={role.note} editable={editable}
                          label="Role note" onCommit={(t) => ed.updateJobField(role.index, "note", t)} />
                      </span>
                    )}
                  </div>
                  {(role.description || []).length > 0 && (
                    <ul className={s.bulletList}>
                      {role.description.map((desc, di) => (
                        <Editable key={di} as="li" className={s.bullet} html={desc} editable={editable}
                          label="Bullet point" onCommit={(t) => ed.updateJobBullet(role.index, di, t)} />
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function EducationSection({ data, ed, s, title = "Education" }: BlockProps & { title?: string }) {
  const education = data.education || [];
  if (education.length === 0) return null;
  const editable = ed.isEditable;
  return (
    <section className={s.section}>
      <SectionTitle s={s}>{title}</SectionTitle>
      <div className={s.itemList}>
        {education.map((edu, index) => {
          const dates = formatDateRange(edu.startDate, edu.endDate);
          return (
            <div key={index} className={cx(s.item, s.educationItem)}>
              <div className={s.itemHeader}>
                <Editable as="h3" className={s.institution} html={edu.institution} editable={editable}
                  label="Institution" onCommit={(t) => ed.updateEduField(index, "institution", t)} />
                {dates && (
                  <Editable className={s.itemDate} html={dates} editable={editable} label="Dates"
                    onCommit={(t) => ed.handleEduDateBlur(index, t)} />
                )}
              </div>
              <div className={s.roleLine}>
                <Editable className={s.degree} html={edu.degree} editable={editable} label="Degree"
                  onCommit={(t) => ed.updateEduField(index, "degree", t)} />
                {edu.details && (
                  <span className={s.roleExtra}>
                    <span className={s.roleSeparator} aria-hidden="true">|</span>
                    <Editable className={s.roleNote} html={edu.details} editable={editable} label="Details"
                      onCommit={(t) => ed.updateEduField(index, "details", t)} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CertificationsSection({ data, ed, s, title = "Certifications" }: BlockProps & { title?: string }) {
  const certs = (data.certifications || []).filter(Boolean);
  if (certs.length === 0) return null;
  return (
    <section className={s.section}>
      <SectionTitle s={s}>{title}</SectionTitle>
      <ul className={s.plainList}>
        {certs.map((c, i) => (
          <Editable key={i} as="li" html={c} editable={ed.isEditable} label="Certification"
            onCommit={(t) => ed.updateCertification(i, t)} />
        ))}
      </ul>
    </section>
  );
}
