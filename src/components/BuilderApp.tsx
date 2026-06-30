"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Sparkles, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "@/app/build/page.module.css";
import { ResumeData } from "@/types/resume";

import EditorPanel from "@/components/ui/EditorPanel";
import ResumeSkeleton from "@/components/ui/ResumeSkeleton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const MinimalistTemplate = dynamic(() => import("@/components/resume/MinimalistTemplate"), {
  ssr: false,
  loading: () => <ResumeSkeleton />,
});

const ModernTemplate = dynamic(() => import("@/components/resume/ModernTemplate"), {
  ssr: false,
  loading: () => <ResumeSkeleton />,
});

const AtsTemplate = dynamic(() => import("@/components/resume/AtsTemplate"), {
  ssr: false,
  loading: () => <ResumeSkeleton />,
});

const STORAGE_KEY = "promptly_saved_prompt";

import { serializeProfileToPrompt } from "@/utils/promptSerializer";


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

export interface BuilderAppProps {
  onGoHome: () => void;
}

function BuilderApp({ onGoHome }: BuilderAppProps) {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>(WELCOME_PROFILE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<"minimalist" | "modern" | "ats">("minimalist");
  const [jobBanner, setJobBanner] = useState<{ title: string; company: string } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
    pageStyle: `
      @page { size: ${A4_WIDTH_MM}mm ${A4_HEIGHT_MM}mm; margin: 10mm; }
      html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      /* Safari fix — @page adds 10mm margin, so strip equivalent top/bottom padding from any template's
         root element. This is centralized here so no individual template needs to handle it. */
      [data-resume-print] > * { padding-top: 0 !important; padding-bottom: 0 !important; }
      [data-resume-print] > * > * { padding-top: 0 !important; padding-bottom: 0 !important; }
    `,
    onAfterPrint: () => setIsPrinting(false),
  });

  const handlePrintClick = () => {
    setIsPrinting(true);
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  // Pre-fill job context when Career Radar deep-links with job params
  useEffect(() => {
    const jobTitle = searchParams.get("jobTitle");
    const company = searchParams.get("company");

    if (!jobTitle || !company) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJobBanner({ title: jobTitle, company });
  }, [searchParams]); // Run when searchParams change

  return (
    <div className={styles.container}>
      {/* App Header */}
      <header className={styles.appHeader}>
        <button onClick={onGoHome} className={styles.logo}>promptly</button>

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
            <button
              className={`${styles.switcherButton} ${activeTemplate === "ats" ? styles.active : ""}`}
              onClick={() => setActiveTemplate("ats")}
            >
              ATS
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
          <button className={styles.downloadButton} onClick={handlePrintClick} disabled={isPrinting}>
            {isPrinting ? <Loader2 size={18} className={styles.iconSpin} /> : <Download size={18} />}
            {isPrinting ? "Preparing PDF..." : "Download PDF"}
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
            initialJobDesc={searchParams.get("description") || undefined}
          />
        </section>

        {/* Right Side: Preview & Export Area */}
        <section className={styles.previewPanel}>
          <div className={styles.resumeWrapper}>
            
            {/* Screen preview */}
            <div className={styles.resumeCanvas}>
              <ErrorBoundary>
                <div key={activeTemplate} className={`${styles.templateFadeIn} sp-comfortable`}>
                  {isGenerating ? (
                    <ResumeSkeleton />
                  ) : activeTemplate === "modern" ? (
                    <ModernTemplate data={resumeData} onChange={handleResumeDataChange} />
                  ) : activeTemplate === "ats" ? (
                    <AtsTemplate data={resumeData} onChange={handleResumeDataChange} />
                  ) : (
                    <MinimalistTemplate data={resumeData} onChange={handleResumeDataChange} />
                  )}
                </div>
              </ErrorBoundary>
            </div>

            {/* Generating Overlay */}
            {isGenerating && (
              <div className={styles.generatingOverlay}>
                <div className={styles.generatingBox}>
                  <Loader2 size={28} className={styles.iconSpin} />
                  <span>Tailoring your resume...</span>
                </div>
              </div>
            )}

            <div
              className={styles.printOnly}
              ref={printRef}
              data-resume-print="true"
              style={{
                width: `${A4_WIDTH_MM}mm`,
              }}
            >
              <ErrorBoundary>
                {activeTemplate === "modern" ? (
                  <ModernTemplate data={resumeData} className="sp-comfortable" />
                ) : activeTemplate === "ats" ? (
                  <AtsTemplate data={resumeData} className="sp-comfortable" />
                ) : (
                  <MinimalistTemplate data={resumeData} className="sp-comfortable" />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function BuilderAppWrapper({ onGoHome }: BuilderAppProps) {
  return (
    <Suspense fallback={<div className={styles.container}><ResumeSkeleton /></div>}>
      <BuilderApp onGoHome={onGoHome} />
    </Suspense>
  );
}
