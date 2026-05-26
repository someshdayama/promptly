"use client";

import { useState, useRef, useEffect, ComponentType, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Sparkles } from "lucide-react";
import styles from "./page.module.css";
import { ResumeData } from "@/types/resume";
import { SOMESH_PROFILE } from "@/data/someshProfile";

import PromptInput from "@/components/ui/PromptInput";
import TemplateSwitcher from "@/components/ui/TemplateSwitcher";
import FormatCustomizer, { FormatOptions } from "@/components/ui/FormatCustomizer";
import MinimalistTemplate from "@/components/resume/MinimalistTemplate";
import CreativeTemplate from "@/components/resume/CreativeTemplate";
import CorporateTemplate from "@/components/resume/CorporateTemplate";
import StartupTemplate from "@/components/resume/StartupTemplate";
import ElegantTemplate from "@/components/resume/ElegantTemplate";
import AutoFitWrapper from "@/components/ui/AutoFitWrapper";
import ResumeSkeleton from "@/components/ui/ResumeSkeleton";

const TEMPLATES: Record<string, ComponentType<{ data: ResumeData }>> = {
  minimalist: MinimalistTemplate,
  creative: CreativeTemplate,
  corporate: CorporateTemplate,
  startup: StartupTemplate,
  elegant: ElegantTemplate,
};

// Dynamically construct baseline prompt from profile data to avoid duplication
const buildBasePromptFromProfile = (profile: ResumeData): string => {
  return `My name is ${profile.personalInfo.fullName}. I am based in ${profile.personalInfo.location}. Phone: ${profile.personalInfo.phone}. Email: ${profile.personalInfo.email}.

I am a Software Engineer with over 3 years of experience specializing in cloud infrastructure, high-performance CI/CD automation, and site reliability engineering.

SKILLS:
${profile.skills.map(s => `- ${s}`).join("\n")}

WORK EXPERIENCE:
${profile.experience.map(exp => `
${exp.company} | ${profile.personalInfo.location} — ${exp.position} — ${exp.startDate} to ${exp.endDate}
${exp.description.map(bullet => `- ${bullet}`).join("\n")}
`).join("\n")}

EDUCATION:
${profile.education.map(edu => `- ${edu.degree} — ${edu.institution} — ${edu.endDate}`).join("\n")}

OTHER:
- Languages: English, Hindi`;
};

const SOMESH_BASE_PROMPT = buildBasePromptFromProfile(SOMESH_PROFILE);

const generatePlaceholderData = (): ResumeData => SOMESH_PROFILE;

function HomeContent() {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>(generatePlaceholderData());
  const [template, setTemplate] = useState("corporate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    accentColor: "",
    fontFamily: "",
    spacing: "normal",
    fitToSinglePage: true,
  });
  const [jobBanner, setJobBanner] = useState<{ title: string; company: string } | null>(null);

  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${resumeData.personalInfo?.fullName || "Resume"}_CV`,
  });

  // Auto-generate when Career Radar deep-links with job params
  useEffect(() => {
    const jobTitle = searchParams.get("jobTitle");
    const company = searchParams.get("company");
    const location = searchParams.get("location");
    const description = searchParams.get("description");

    if (!jobTitle || !company) return;

    setJobBanner({ title: jobTitle, company });

    const jobContext = { title: jobTitle, company, location: location || "India", description: description || "" };

    const tailoredPrompt = `${SOMESH_BASE_PROMPT}

--- TARGET JOB ---
I am applying for the role of ${jobTitle} at ${company} (${location || "India"}).
${description ? `Role context: ${description}` : ""}

Please tailor my resume summary and skill highlights to this specific role while keeping all information truthful and based only on my actual background above.`;

    setIsGenerating(true);

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: tailoredPrompt, jobContext }),
    })
      .then(res => res.json())
      .then(json => {
        if (json.data) setResumeData(json.data);
      })
      .catch(console.error)
      .finally(() => setIsGenerating(false));
  }, []); // Run once on mount

  const TemplateComponent = TEMPLATES[template] || MinimalistTemplate;

  const spacingScale = { compact: 0.8, normal: 1, relaxed: 1.2 };
  const resumeStyle: React.CSSProperties = {
    ...(formatOptions.accentColor && { "--resume-accent": formatOptions.accentColor }),
    ...(formatOptions.fontFamily && { "--resume-font": formatOptions.fontFamily }),
    ...(formatOptions.spacing !== "normal" && { "--resume-spacing": String(spacingScale[formatOptions.spacing]) }),
  } as React.CSSProperties;

  return (
    <div className={styles.container}>
      {/* App Header */}
      <header className={styles.appHeader}>
        <div className={styles.logo}>promptly</div>

        {/* Job context banner — shown when launched from Career Radar */}
        {jobBanner && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "8px",
            padding: "0.35rem 0.85rem",
            fontSize: "0.8rem",
            color: "#a5b4fc",
            maxWidth: "360px",
          }}>
            <Sparkles size={14} />
            <span>
              Tailored for <strong style={{ color: "#e0e7ff" }}>{jobBanner.title}</strong> at{" "}
              <strong style={{ color: "#e0e7ff" }}>{jobBanner.company}</strong>
            </span>
          </div>
        )}

        <div className={styles.headerCenter}>
          <TemplateSwitcher currentTemplate={template} onTemplateChange={setTemplate} />
        </div>

        <div className={styles.headerRight} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Fit to 1 Page Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fit to 1 Page
            </span>
            <button
              type="button"
              onClick={() => setFormatOptions({ ...formatOptions, fitToSinglePage: !formatOptions.fitToSinglePage })}
              style={{
                width: "38px",
                height: "20px",
                backgroundColor: formatOptions.fitToSinglePage ? "var(--primary)" : "var(--surface-border)",
                borderRadius: "10px",
                position: "relative",
                transition: "background-color 0.2s ease",
                border: "none",
                cursor: "pointer"
              }}
            >
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "3px",
                  left: "3px",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                  transform: formatOptions.fitToSinglePage ? "translateX(18px)" : "translateX(0)"
                }}
              />
            </button>
          </div>

          <button className={styles.downloadButton} onClick={() => handlePrint()}>
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className={styles.main}>
        {/* Left Side: Input Area */}
        <section className={styles.editorPanel}>
          <PromptInput
            onDataGenerated={setResumeData}
            onLoading={setIsGenerating}
            jobContext={jobBanner ? { title: jobBanner.title, company: jobBanner.company } : undefined}
          />
          <FormatCustomizer options={formatOptions} onChange={setFormatOptions} />
        </section>

        {/* Right Side: Preview & Export Area */}
        <section className={styles.previewPanel}>
          <div className={styles.resumeWrapper}>
            <div ref={resumeRef} style={resumeStyle}>
              <AutoFitWrapper
                contentDependencies={[resumeData, template, isGenerating, formatOptions]}
                fitToSinglePage={formatOptions.fitToSinglePage}
              >
                {isGenerating ? (
                  <ResumeSkeleton />
                ) : (
                  <TemplateComponent data={resumeData} />
                )}
              </AutoFitWrapper>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh' }} />}>
      <HomeContent />
    </Suspense>
  );
}
