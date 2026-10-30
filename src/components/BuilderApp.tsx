"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "@/app/build/page.module.css";
import { ResumeData } from "@/types/resume";
import { SOMESH_PROFILE } from "@/data/someshProfile";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";
import {
  DENSITIES,
  DENSITY_LABELS,
  Density,
  DensitySetting,
  PAGE_MARGIN_MM,
  PAGE_SIZES,
  PageSizeKey,
  contentBox,
  pickDensity,
} from "@/utils/pageFit";

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
const RESUME_STORAGE_KEY = "promptly_saved_resume";
const PREFS_STORAGE_KEY = "promptly_preview_prefs";

type TemplateKey = "minimalist" | "modern" | "ats";

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: "ats", label: "ATS" },
  { key: "minimalist", label: "Minimalist" },
  { key: "modern", label: "Modern" },
];

/** The default preview: Somesh's own resume, so the app opens on a real, one-page example. */
const DEFAULT_PROFILE: ResumeData = SOMESH_PROFILE;

const isResumeData = (value: unknown): value is ResumeData => {
  const v = value as ResumeData;
  return !!v && typeof v === "object" && !!v.personalInfo && Array.isArray(v.experience);
};

function renderTemplate(template: TemplateKey, data: ResumeData, className: string, onChange?: (d: ResumeData) => void) {
  if (template === "modern") return <ModernTemplate data={data} className={className} onChange={onChange} />;
  if (template === "ats") return <AtsTemplate data={data} className={className} onChange={onChange} />;
  return <MinimalistTemplate data={data} className={className} onChange={onChange} />;
}

export interface BuilderAppProps {
  onGoHome: () => void;
}

function BuilderApp({ onGoHome }: BuilderAppProps) {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_PROFILE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("ats");
  const [pageSize, setPageSize] = useState<PageSizeKey>("a4");
  const [densitySetting, setDensitySetting] = useState<DensitySetting>("auto");
  const [jobBanner, setJobBanner] = useState<{ title: string; company: string } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [heights, setHeights] = useState<Partial<Record<Density, number>>>({});
  const [previewZoom, setPreviewZoom] = useState(1);

  const page = PAGE_SIZES[pageSize];
  const content = contentBox(page);

  // Restore the last resume and preview preferences after a refresh.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RESUME_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isResumeData(parsed)) setResumeData(parsed);
      const prefs = JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY) || "{}");
      if (prefs.template && TEMPLATES.some((t) => t.key === prefs.template)) setActiveTemplate(prefs.template);
      if (prefs.pageSize && prefs.pageSize in PAGE_SIZES) setPageSize(prefs.pageSize);
      if (prefs.density === "auto" || DENSITIES.includes(prefs.density)) setDensitySetting(prefs.density);
    } catch {
      // Ignore corrupt storage and keep the defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({ template: activeTemplate, pageSize, density: densitySetting })
    );
  }, [activeTemplate, pageSize, densitySetting]);

  const handleResumeDataChange = (updatedData: ResumeData) => {
    setResumeData(updatedData);
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(updatedData));
    localStorage.setItem(STORAGE_KEY, serializeProfileToPrompt(updatedData));
  };

  const handleResetToExample = () => {
    setResumeData(DEFAULT_PROFILE);
    localStorage.removeItem(RESUME_STORAGE_KEY);
  };

  // ── One-page fit: render the template off-screen at every density and measure it.
  const measureRefs = useRef<Partial<Record<Density, HTMLDivElement | null>>>({});
  const measure = useCallback(() => {
    const next: Partial<Record<Density, number>> = {};
    DENSITIES.forEach((d) => {
      const el = measureRefs.current[d];
      // Skeletons are shown while a template chunk loads; ignore those measurements.
      if (el && !el.querySelector("[data-skeleton]")) next[d] = el.scrollHeight;
    });
    setHeights((prev) => (DENSITIES.every((d) => prev[d] === next[d]) ? prev : next));
  }, []);

  useEffect(() => {
    // ResizeObserver reports each element once on observe(), then on every size change.
    const observer = new ResizeObserver(() => measure());
    DENSITIES.forEach((d) => {
      const el = measureRefs.current[d];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [measure, activeTemplate, pageSize, resumeData]);

  const fit = pickDensity(heights, content.heightPx, densitySetting);
  const density: Density = fit?.density || (densitySetting === "auto" ? "sp-comfortable" : densitySetting);

  // ── Scale the page preview down on narrow screens instead of cutting it off.
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const pagePx = (page.widthMm * 96) / 25.4;
    const update = () => {
      const styleObj = getComputedStyle(el);
      const available = el.clientWidth - parseFloat(styleObj.paddingLeft) - parseFloat(styleObj.paddingRight);
      setPreviewZoom(Math.min(1, Math.max(0.3, available / pagePx)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [page.widthMm]);

  // Hidden print target — renders the template at the printable content width.
  const printRef = useRef<HTMLDivElement>(null);

  const rawName = resumeData.personalInfo?.fullName || "Resume";
  const sanitizedName = rawName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_");
  const documentTitle = `${sanitizedName}_Resume`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle,
    pageStyle: `
      @page {
        size: ${page.css} portrait;
        margin: ${PAGE_MARGIN_MM.vertical}mm ${PAGE_MARGIN_MM.horizontal}mm;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }
      [contenteditable] {
        outline: none !important;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      h1, h2, h3 {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      ul li {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      [data-resume-print] {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      [data-resume-print] > * {
        box-shadow: none !important;
      }
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
  }, [searchParams]);

  const templateClass = `${density} resume-in-sheet`;

  return (
    <div className={styles.container}>
      {/* App Header */}
      <header className={styles.appHeader}>
        <button type="button" onClick={onGoHome} className={styles.logo} aria-label="Promptly home">
          promptly
        </button>

        <div className={styles.headerCenter}>
          <div className={styles.templateSwitcher} role="group" aria-label="Resume template">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                aria-pressed={activeTemplate === t.key}
                className={`${styles.switcherButton} ${activeTemplate === t.key ? styles.active : ""}`}
                onClick={() => setActiveTemplate(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Job context banner — shown when launched from Career Radar */}
          {jobBanner && (
            <div className={styles.jobBanner}>
              <Sparkles size={14} aria-hidden="true" />
              <span>
                Tailored for <strong>{jobBanner.title}</strong> at <strong>{jobBanner.company}</strong>
              </span>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.downloadButton}
            onClick={handlePrintClick}
            disabled={isPrinting}
            aria-busy={isPrinting}
          >
            {isPrinting ? <Loader2 size={18} className={styles.iconSpin} aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
            {isPrinting ? "Preparing PDF..." : "Download PDF"}
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className={styles.main}>
        {/* Left Side: Input Area */}
        <section className={styles.editorPanel} aria-label="Resume input">
          <EditorPanel
            resumeData={resumeData}
            onDataChange={handleResumeDataChange}
            onLoading={setIsGenerating}
            jobContext={jobBanner ? { title: jobBanner.title, company: jobBanner.company } : undefined}
            initialJobDesc={searchParams.get("description") || undefined}
            onResetExample={handleResetToExample}
          />
        </section>

        {/* Right Side: Preview & Export Area */}
        <section className={styles.previewPanel} aria-label="Resume preview">
          <div className={styles.previewToolbar}>
            <label className={styles.toolbarField}>
              <span>Paper</span>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSizeKey)}>
                {(Object.keys(PAGE_SIZES) as PageSizeKey[]).map((k) => (
                  <option key={k} value={k}>{PAGE_SIZES[k].label}</option>
                ))}
              </select>
            </label>
            <label className={styles.toolbarField}>
              <span>Spacing</span>
              <select value={densitySetting} onChange={(e) => setDensitySetting(e.target.value as DensitySetting)}>
                <option value="auto">Auto-fit to one page</option>
                {DENSITIES.map((d) => (
                  <option key={d} value={d}>{DENSITY_LABELS[d]}</option>
                ))}
              </select>
            </label>
            <div
              className={`${styles.fitStatus} ${fit && !fit.fits ? styles.fitWarn : styles.fitOk}`}
              role="status"
              aria-live="polite"
            >
              {!fit ? (
                <span>Measuring…</span>
              ) : fit.fits ? (
                <>
                  <CheckCircle2 size={14} aria-hidden="true" />
                  <span>
                    Fits on 1 {page.label} page
                    {densitySetting === "auto" ? ` · ${DENSITY_LABELS[fit.density]} spacing` : ""}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} aria-hidden="true" />
                  <span>≈ {fit.pages} pages on {page.label}. Trim older bullets to fit one page.</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.resumeWrapper} ref={wrapperRef}>
            {/* Screen preview: same width and margins as the printed page */}
            <div
              className={styles.resumeCanvas}
              style={{
                width: `${page.widthMm}mm`,
                minHeight: `${page.heightMm}mm`,
                padding: `${PAGE_MARGIN_MM.vertical}mm ${PAGE_MARGIN_MM.horizontal}mm`,
                zoom: previewZoom,
              }}
            >
              {fit && !fit.fits && (
                <div
                  className={styles.pageBreakGuide}
                  style={{ top: `${PAGE_MARGIN_MM.vertical}mm`, height: `${content.heightMm}mm` }}
                  aria-hidden="true"
                >
                  <span>End of page 1</span>
                </div>
              )}
              <ErrorBoundary>
                <div key={activeTemplate} className={styles.templateFadeIn}>
                  {isGenerating ? (
                    <ResumeSkeleton />
                  ) : (
                    renderTemplate(activeTemplate, resumeData, templateClass, handleResumeDataChange)
                  )}
                </div>
              </ErrorBoundary>
            </div>

            {/* Generating Overlay */}
            {isGenerating && (
              <div className={styles.generatingOverlay} role="status">
                <div className={styles.generatingBox}>
                  <Loader2 size={28} className={styles.iconSpin} aria-hidden="true" />
                  <span>Tailoring your resume...</span>
                </div>
              </div>
            )}

            <div
              className={styles.printOnly}
              ref={printRef}
              data-resume-print="true"
              style={{ width: `${content.widthMm}mm` }}
            >
              <ErrorBoundary>{renderTemplate(activeTemplate, resumeData, templateClass)}</ErrorBoundary>
            </div>
          </div>

          {/* Off-screen copies used to measure the printed height at each spacing preset */}
          <div className={styles.measureArea} aria-hidden="true" style={{ width: `${content.widthMm}mm` }}>
            {DENSITIES.map((d) => (
              <div key={d} ref={(el) => { measureRefs.current[d] = el; }}>
                {renderTemplate(activeTemplate, resumeData, `${d} resume-in-sheet`)}
              </div>
            ))}
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
