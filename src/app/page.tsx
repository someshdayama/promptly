"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Sparkles } from "lucide-react";
import styles from "./page.module.css";
import { ResumeData } from "@/types/resume";
import { SOMESH_PROFILE } from "@/data/someshProfile";

import EditorPanel from "@/components/ui/EditorPanel";
import MinimalistTemplate from "@/components/resume/MinimalistTemplate";
import ModernTemplate from "@/components/resume/ModernTemplate";
import AutoFitWrapper from "@/components/ui/AutoFitWrapper";
import ResumeSkeleton from "@/components/ui/ResumeSkeleton";

const STORAGE_KEY = "promptly_saved_prompt";

import { serializeProfileToPrompt } from "@/utils/promptSerializer";

const SOMESH_BASE_PROMPT = serializeProfileToPrompt(SOMESH_PROFILE);

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const WELCOME_PROFILE: ResumeData = {
  personalInfo: {
    fullName: "Your Name",
    email: "hello@example.com",
    phone: "(555) 123-4567",
    location: "City, Country",
    linkedinUrl: "linkedin.com/in/username",
  },
  summary: "Welcome to Promptly! 👋 \n\nTo get started, simply paste your LinkedIn profile text, existing resume, or brief career history into the prompt box on the left. Our AI will instantly parse your details and format them into this beautiful, ATS-friendly template. \n\nYou can also click directly on any text here to edit it inline!",
  skills: ["Communication", "Problem Solving", "Adaptability"],
  experience: [],
  education: [],
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>(WELCOME_PROFILE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeBudgetClass, setActiveBudgetClass] = useState("sp-comfortable");
  const [activeTemplate, setActiveTemplate] = useState<"minimalist" | "modern">("minimalist");
  const [jobBanner, setJobBanner] = useState<{ title: string; company: string } | null>(null);

  const handleZoomAndClassChange = useCallback((zoom: number, budgetClass: string) => {
    setActiveBudgetClass(budgetClass);
  }, []);

  const handleResumeDataChange = (updatedData: ResumeData) => {
    setResumeData(updatedData);
    const serialized = serializeProfileToPrompt(updatedData);
    localStorage.setItem(STORAGE_KEY, serialized);
  };

  // Hidden print target — renders template at natural A4 width, no zoom wrapper
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${resumeData.personalInfo?.fullName || "Resume"}_CV`,
    pageStyle: `@page { size: ${A4_WIDTH_MM}mm ${A4_HEIGHT_MM}mm; margin: 0; } html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }`,
  });

  // Auto-generate when Career Radar deep-links with job params
  useEffect(() => {
    const jobTitle = searchParams.get("jobTitle");
    const company = searchParams.get("company");
    const location = searchParams.get("location");
    const description = searchParams.get("description");

    if (!jobTitle || !company) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [searchParams]); // Run when searchParams change

  return (
    <div className={styles.container}>
      {/* App Header */}
      <header className={styles.appHeader}>
        <div className={styles.logo}>promptly</div>

        <div className={styles.headerCenter}>
          <div className={styles.templateSwitcher}>
            <button
              className={`${styles.switcherButton} ${activeTemplate === "minimalist" ? styles.active : ""}`}
              onClick={() => setActiveTemplate("minimalist")}
            >
              Minimalist
            </button>
            <button
              className={`${styles.switcherButton} ${activeTemplate === "modern" ? styles.active : ""}`}
              onClick={() => setActiveTemplate("modern")}
            >
              Modern
            </button>
          </div>

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
        </div>

        <div className={styles.headerRight}>
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
          <EditorPanel
            resumeData={resumeData}
            onDataChange={handleResumeDataChange}
            onLoading={setIsGenerating}
            jobContext={jobBanner ? { title: jobBanner.title, company: jobBanner.company } : undefined}
          />
        </section>

        {/* Right Side: Preview & Export Area */}
        <section className={styles.previewPanel}>
          <div className={styles.resumeWrapper}>
            {/* Screen preview — uses zoom for visual scaling */}
            <div>
              <AutoFitWrapper
                contentDependencies={[resumeData, isGenerating]}
                fitToSinglePage={false}
                onZoomChange={(z, bc) => handleZoomAndClassChange(z, bc)}
              >
                {isGenerating ? (
                  <ResumeSkeleton />
                ) : activeTemplate === "modern" ? (
                  <ModernTemplate data={resumeData} onChange={handleResumeDataChange} />
                ) : (
                  <MinimalistTemplate data={resumeData} onChange={handleResumeDataChange} />
                )}
              </AutoFitWrapper>
            </div>

            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                top: "-9999px",
                left: "-9999px",
                width: `${A4_WIDTH_MM}mm`,
                overflow: "visible",
                pointerEvents: "none",
              }}
            >
              <div
                ref={printRef}
                style={{
                  width: `${A4_WIDTH_MM}mm`,
                }}
              >
                {activeTemplate === "modern" ? (
                  <ModernTemplate data={resumeData} className={activeBudgetClass} />
                ) : (
                  <MinimalistTemplate data={resumeData} className={activeBudgetClass} />
                )}
              </div>
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
