import React from "react";
import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { ResumeData, SkillGroup } from "@/types/resume";
import { PAGE_MARGIN_MM, PageSizeKey } from "@/utils/pageFit";
import { displayUrl, normalizeUrl } from "@/utils/links";
import { formatDateRange, groupExperienceByCompany } from "@/utils/experience";
import { getSkillGroups } from "@/utils/skills";
import { PdfSpacing, TemplateKey, mm, px } from "./pdfStyles";

/**
 * Text-based PDF versions of the three templates. Real text (not an image), so
 * applicant tracking systems and copy-paste can read it.
 */

interface Theme {
  ink: string;
  accent: string;
  muted: string;
  rule: string;
  link: string;
  body: string;
}

const THEMES: Record<TemplateKey, Theme> = {
  ats: { ink: "#111111", accent: "#111111", muted: "#222222", rule: "#111111", link: "#111111", body: "#111111" },
  minimalist: { ink: "#0f172a", accent: "#1e3a5f", muted: "#475569", rule: "#cbd5e1", link: "#1e3a5f", body: "#1f2937" },
  modern: { ink: "#0f172a", accent: "#0f2a4a", muted: "#475569", rule: "#cbd5e1", link: "#0f2a4a", body: "#1f2937" },
};

const PAGE_WIDTH_PT: Record<PageSizeKey, number> = { a4: 595.28, letter: 612 };

export interface ResumePdfProps {
  data: ResumeData;
  template: TemplateKey;
  pageSize: PageSizeKey;
  spacing: PdfSpacing;
}

interface Ctx {
  t: Theme;
  s: PdfSpacing;
  template: TemplateKey;
  sidebar?: boolean;
}

function makeStyles({ t, s, template }: Ctx) {
  const lh = s.line;
  return StyleSheet.create({
    page: {
      fontFamily: "Inter",
      fontSize: s.text,
      lineHeight: lh,
      color: t.ink,
      paddingTop: mm(PAGE_MARGIN_MM.vertical),
      paddingBottom: mm(PAGE_MARGIN_MM.vertical),
      paddingLeft: mm(PAGE_MARGIN_MM.horizontal),
      paddingRight: mm(PAGE_MARGIN_MM.horizontal),
    },
    headerAts: { alignItems: "center", marginBottom: px(s.sectionGap) },
    headerMin: {
      marginBottom: px(s.sectionGap + 2),
      paddingBottom: px(8),
      borderBottomWidth: px(2),
      borderBottomColor: t.accent,
    },
    name:
      template === "ats"
        ? { fontSize: s.name, fontWeight: 800, textTransform: "uppercase", letterSpacing: s.name * 0.02, lineHeight: 1.1, marginBottom: px(4), textAlign: "center" }
        : { fontSize: s.name, fontWeight: 800, letterSpacing: -s.name * 0.02, lineHeight: 1.1, color: t.accent, marginBottom: px(4) },
    contactLine: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: template === "ats" ? "center" : "flex-start",
      fontSize: s.small,
      color: t.muted,
    },
    sep: { color: template === "ats" ? "#555555" : "#94a3b8", marginHorizontal: s.small * 0.45 },
    link: { color: t.link, textDecoration: "underline" },
    section: { marginBottom: px(s.sectionGap) },
    sectionTitle: {
      fontSize: s.title,
      fontWeight: 800,
      textTransform: "uppercase",
      // Wide tracking (as on screen) makes some PDF readers split words into letters.
      letterSpacing: s.title * (template === "ats" ? 0.03 : 0.08),
      color: t.accent,
      borderBottomWidth: px(1),
      borderBottomColor: t.rule,
      paddingBottom: px(template === "ats" ? 1 : 2),
      marginBottom: px(template === "modern" ? 6 : template === "ats" ? 4 : 5),
    },
    body: { color: t.body },
    item: { marginBottom: px(s.itemGap) },
    itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    company: { fontWeight: 700, fontSize: template === "ats" ? s.text : s.text + 0.4, color: t.ink, flexShrink: 1, paddingRight: 8 },
    date: { fontSize: template === "ats" ? s.text : s.small, color: template === "ats" ? t.ink : t.muted },
    roleLine: { flexDirection: "row", flexWrap: "wrap", fontSize: template === "ats" ? s.text : s.small, color: t.muted },
    position:
      template === "minimalist"
        ? { fontWeight: 600, fontStyle: "italic", color: "#1e293b" }
        : template === "modern"
          ? { fontWeight: 600, color: "#1e293b" }
          : { fontWeight: 700, color: t.ink },
    degree: template === "ats" ? { fontWeight: 600, fontSize: s.small } : { fontWeight: 500, color: "#1e293b" },
    roleSep: { color: template === "ats" ? "#555555" : "#94a3b8", marginHorizontal: s.small * 0.4 },
    bulletRow: { flexDirection: "row", marginBottom: px(1) },
    bulletMark: { width: px(14) },
    dotWrap: { width: px(13), paddingTop: s.text * lh * 0.5 - 1.5 },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: t.accent, marginLeft: px(3) },
    bulletText: { flex: 1, color: t.body },
    skillRow: { marginBottom: px(1), color: t.body },
    bold: { fontWeight: 700, color: t.ink },
    roleGap: { marginTop: px(template === "ats" ? 3 : 4) },
  });
}

type Styles = ReturnType<typeof makeStyles>;

/** Font size that keeps one unbreakable line (an email or URL) inside `width` points. */
const fitSize = (text: string, base: number, width?: number) =>
  width ? Math.max(5.5, Math.min(base, width / (Math.max(1, text.length) * 0.56))) : base;

function Contact({ data, st, stack, width, base }: { data: ResumeData; st: Styles; stack?: boolean; width?: number; base?: number }) {
  const info = data.personalInfo || { fullName: "", email: "", phone: "", location: "" };
  const size = (text: string) => (stack && base ? { fontSize: fitSize(text, base, width) } : {});
  const basics: React.ReactNode[] = [];
  if (info.location) basics.push(<Text key="loc">{info.location}</Text>);
  if (info.phone) basics.push(<Text key="phone">{info.phone}</Text>);
  if (info.email) basics.push(<Link key="email" src={`mailto:${info.email}`} style={[st.link, size(info.email)]}>{info.email}</Link>);
  const links = (
    [
      ["linkedinUrl", "LinkedIn"],
      ["portfolioUrl", "Portfolio"],
    ] as const
  )
    .filter(([f]) => normalizeUrl(info[f]))
    .map(([f, label]) =>
      stack ? (
        <View key={f}>
          <Text style={{ fontWeight: 600, color: st.contactLine.color as string }}>{label}:</Text>
          <Link src={normalizeUrl(info[f])} style={[st.link, size(displayUrl(info[f]))]}>{displayUrl(info[f])}</Link>
        </View>
      ) : (
        <Text key={f}>
          {label}: <Link src={normalizeUrl(info[f])} style={st.link}>{displayUrl(info[f])}</Link>
        </Text>
      )
    );

  if (stack) {
    return (
      <View>
        {[...basics, ...links].map((item, i) => (
          <View key={i} style={{ marginBottom: 2 }}>{item}</View>
        ))}
      </View>
    );
  }
  const line = (items: React.ReactNode[]) => (
    <View style={st.contactLine}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row" }}>
          {i > 0 && <Text style={st.sep}>|</Text>}
          {item}
        </View>
      ))}
    </View>
  );
  return (
    <View>
      {basics.length > 0 && line(basics)}
      {links.length > 0 && line(links)}
    </View>
  );
}

function Section({ title, st, children }: { title: string; st: Styles; children: React.ReactNode }) {
  return (
    <View style={st.section}>
      <Text style={st.sectionTitle} minPresenceAhead={30}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ text, st, dot }: { text: string; st: Styles; dot: boolean }) {
  return (
    <View style={st.bulletRow} wrap={false}>
      {dot ? (
        <View style={st.dotWrap}><View style={st.dot} /></View>
      ) : (
        <Text style={st.bulletMark}>{"  •"}</Text>
      )}
      <Text style={st.bulletText}>{text}</Text>
    </View>
  );
}

function Skills({ data, st, sidebar }: { data: ResumeData; st: Styles; sidebar?: boolean }) {
  const groups: SkillGroup[] | null = getSkillGroups(data);
  const flat = (data.skills || []).filter(Boolean);
  if (!groups && flat.length === 0) return null;
  return (
    <Section title="Skills" st={st}>
      {groups ? (
        groups.map((g, i) =>
          sidebar ? (
            <View key={i} style={{ marginBottom: px(4) }}>
              <Text style={st.bold}>{g.category}</Text>
              <Text style={st.body}>{g.items.join(", ")}</Text>
            </View>
          ) : (
            <Text key={i} style={st.skillRow}>
              <Text style={st.bold}>{g.category}:</Text> {g.items.join(", ")}
            </Text>
          )
        )
      ) : (
        <Text style={st.body}>{flat.join(", ")}</Text>
      )}
    </Section>
  );
}

function Experience({ data, st, dot }: { data: ResumeData; st: Styles; dot: boolean }) {
  const groups = groupExperienceByCompany(data.experience);
  if (groups.length === 0) return null;
  return (
    <Section title="Experience" st={st}>
      {groups.map((group, gi) => {
        const multi = group.roles.length > 1;
        const first = group.roles[0];
        return (
          <View key={gi} style={st.item}>
            <View style={st.itemHeader} wrap={false}>
              <Text style={st.company}>{group.company}</Text>
              <Text style={st.date}>
                {multi ? formatDateRange(group.startDate, group.endDate) : formatDateRange(first.startDate, first.endDate)}
              </Text>
            </View>
            {group.roles.map((role, ri) => (
              <View key={ri} style={ri > 0 ? st.roleGap : undefined}>
                <View style={st.roleLine}>
                  <Text style={st.position}>{role.position}</Text>
                  {multi && formatDateRange(role.startDate, role.endDate) && (
                    <>
                      <Text style={st.roleSep}>|</Text>
                      <Text>{formatDateRange(role.startDate, role.endDate)}</Text>
                    </>
                  )}
                  {role.note && <Text style={{ marginLeft: 3 }}>({role.note})</Text>}
                </View>
                <View style={{ marginTop: px(2) }}>
                  {(role.description || []).filter(Boolean).map((d, di) => (
                    <Bullet key={di} text={d} st={st} dot={dot} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </Section>
  );
}

function Education({ data, st, sidebar }: { data: ResumeData; st: Styles; sidebar?: boolean }) {
  const education = data.education || [];
  if (education.length === 0) return null;
  return (
    <Section title="Education" st={st}>
      {education.map((edu, i) => {
        const dates = formatDateRange(edu.startDate, edu.endDate);
        return (
          <View key={i} style={st.item} wrap={false}>
            {sidebar ? (
              <>
                <Text style={[st.company, { fontSize: st.date.fontSize as number }]}>{edu.institution}</Text>
                {dates ? <Text style={st.date}>{dates}</Text> : null}
                <Text style={st.degree}>{edu.degree}</Text>
                {edu.details ? <Text style={{ color: st.roleLine.color as string }}>{edu.details}</Text> : null}
              </>
            ) : (
              <>
                <View style={st.itemHeader}>
                  <Text style={st.company}>{edu.institution}</Text>
                  {dates ? <Text style={st.date}>{dates}</Text> : null}
                </View>
                <View style={st.roleLine}>
                  <Text style={st.degree}>{edu.degree}</Text>
                  {edu.details && (
                    <>
                      <Text style={st.roleSep}>|</Text>
                      <Text>{edu.details}</Text>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        );
      })}
    </Section>
  );
}

function Certifications({ data, st }: { data: ResumeData; st: Styles }) {
  const certs = (data.certifications || []).filter(Boolean);
  if (certs.length === 0) return null;
  return (
    <Section title="Certifications" st={st}>
      {certs.map((c, i) => (
        <Text key={i} style={st.body}>{c}</Text>
      ))}
    </Section>
  );
}

function Summary({ data, st }: { data: ResumeData; st: Styles }) {
  if (!data.summary) return null;
  return (
    <Section title="Summary" st={st}>
      <Text style={st.body}>{data.summary}</Text>
    </Section>
  );
}

export default function ResumePdf({ data, template, pageSize, spacing }: ResumePdfProps) {
  const t = THEMES[template];
  const st = makeStyles({ t, s: spacing, template });
  const name = data.personalInfo?.fullName || "Your Name";
  const size = pageSize === "letter" ? "LETTER" : "A4";
  const meta = { title: `${name} – Resume`, author: name, creator: "Promptly", producer: "Promptly" };

  if (template === "modern") {
    const side = makeStyles({ t, s: spacing, template, sidebar: true });
    return (
      <Document {...meta}>
        <Page size={size} style={st.page}>
          {/* Sidebar background on every page */}
          <View
            fixed
            style={{
              position: "absolute",
              top: mm(PAGE_MARGIN_MM.vertical),
              bottom: mm(PAGE_MARGIN_MM.vertical),
              left: mm(PAGE_MARGIN_MM.horizontal),
              width: 0.31 * (PAGE_WIDTH_PT[pageSize] - 2 * mm(PAGE_MARGIN_MM.horizontal)),
              backgroundColor: "#f1f5f9",
              borderRightWidth: px(1),
              borderRightColor: "#e2e8f0",
            }}
          />
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "31%", paddingVertical: px(spacing.padV), paddingHorizontal: px(spacing.padH) }}>
              <Text style={[side.name, { marginBottom: px(spacing.sectionGap) }]}>{name}</Text>
              <Section title="Contact" st={side}>
                <View style={{ fontSize: spacing.small }}>
                  <Contact
                    data={data}
                    st={side}
                    stack
                    base={spacing.small}
                    width={0.31 * (PAGE_WIDTH_PT[pageSize] - 2 * mm(PAGE_MARGIN_MM.horizontal)) - 2 * px(spacing.padH) - 2}
                  />
                </View>
              </Section>
              <View style={{ fontSize: spacing.small }}>
                <Skills data={data} st={side} sidebar />
                <Education data={data} st={side} sidebar />
                <Certifications data={data} st={side} />
              </View>
            </View>
            <View style={{ flex: 1, paddingVertical: px(spacing.mainV ?? spacing.padV), paddingHorizontal: px(spacing.mainH ?? spacing.padH) }}>
              <Summary data={data} st={st} />
              <Experience data={data} st={st} dot />
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  const dot = template === "minimalist";
  return (
    <Document {...meta}>
      <Page size={size} style={st.page}>
        <View>
          <View style={template === "ats" ? st.headerAts : st.headerMin}>
            <Text style={st.name}>{name}</Text>
            <Contact data={data} st={st} />
          </View>
          <Summary data={data} st={st} />
          <Skills data={data} st={st} />
          <Experience data={data} st={st} dot={dot} />
          <Education data={data} st={st} />
          <Certifications data={data} st={st} />
        </View>
      </Page>
    </Document>
  );
}
