"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, CheckCircle2, Download, FileUp, Loader2 } from "lucide-react";
import styles from "./Builder.module.css";
import { ResumeData } from "@/types/resume";
import { EXAMPLE_PROFILE } from "@/data/exampleProfile";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";
import { LIMITS } from "@/utils/generateRequest";
import {
  FIT_STEPS,
  PAGE_MARGIN_MM,
  PAGE_SIZES,
  PageSizeKey,
  SPACING_LABELS,
  SPACING_PRESETS,
  SpacingPreset,
  SpacingSetting,
  contentBox,
  fitStyle,
  isSpacingSetting,
  pickFit,
} from "@/utils/pageFit";
import { STORAGE, isResumeData, loadSaved } from "@/utils/storage";
import ResumeSkeleton from "@/components/ui/ResumeSkeleton";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ResumeCheck from "@/components/ui/ResumeCheck";

const MinimalistTemplate = dynamic(() => import("@/components/resume/MinimalistTemplate"), { ssr: false, loading: () => <ResumeSkeleton /> });
const ModernTemplate = dynamic(() => import("@/components/resume/ModernTemplate"), { ssr: false, loading: () => <ResumeSkeleton /> });
const AtsTemplate = dynamic(() => import("@/components/resume/AtsTemplate"), { ssr: false, loading: () => <ResumeSkeleton /> });

type TemplateKey = "ats" | "minimalist" | "modern";

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: "ats", label: "ATS" },
  { key: "minimalist", label: "Minimalist" },
  { key: "modern", label: "Modern" },
];

const EXAMPLE_NOTES = serializeProfileToPrompt(EXAMPLE_PROFILE);

function renderTemplate(template: TemplateKey, data: ResumeData, className: string, onChange?: (d: ResumeData) => void) {
  if (template === "modern") return <ModernTemplate data={data} className={className} onChange={onChange} />;
  if (template === "minimalist") return <MinimalistTemplate data={data} className={className} onChange={onChange} />;
  return <AtsTemplate data={data} className={className} onChange={onChange} />;
}

const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches;

export default function Builder() {
  const [hydrated, setHydrated] = useState(false);
  const [notes, setNotes] = useState("");
  const [jobPost, setJobPost] = useState("");
  const [showJob, setShowJob] = useState(false);
  const [jobLabel, setJobLabel] = useState<{ title: string; company: string } | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [template, setTemplate] = useState<TemplateKey>("ats");
  const [pageSize, setPageSize] = useState<PageSizeKey>("a4");
  const [densitySetting, setDensitySetting] = useState<SpacingSetting>("auto");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [reading, setReading] = useState(false);
  const [heights, setHeights] = useState<Partial<Record<number, number>>>({});
  const [zoom, setZoom] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(0);

  const previewRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const page = PAGE_SIZES[pageSize];
  const content = contentBox(page);

  // ── Restore saved work (and quietly drop the old, mixed-up storage keys).
  useEffect(() => {
    const saved = loadSaved();
    const params = new URLSearchParams(window.location.search);
    const linkedJob = params.get("description") || "";
    const title = params.get("jobTitle") || "";
    const company = params.get("company") || "";
    setNotes(saved.notes);
    setJobPost(linkedJob || saved.jobPost);
    setShowJob(Boolean(linkedJob || saved.jobPost || title));
    if (title && company) setJobLabel({ title: title.slice(0, 120), company: company.slice(0, 120) });
    setResume(saved.resume);
    if (saved.prefs.template && TEMPLATES.some((t) => t.key === saved.prefs.template)) setTemplate(saved.prefs.template as TemplateKey);
    if (saved.prefs.pageSize && saved.prefs.pageSize in PAGE_SIZES) setPageSize(saved.prefs.pageSize as PageSizeKey);
    if (isSpacingSetting(saved.prefs.spacing)) setDensitySetting(saved.prefs.spacing);
    setHydrated(true);
  }, []);

  // ── Save as you type (notes and job post), and the resume on every change.
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE.notes, notes);
        localStorage.setItem(STORAGE.jobPost, jobPost);
      } catch {
        /* storage full or blocked: nothing to do */
      }
    }, 300);
    return () => clearTimeout(id);
  }, [notes, jobPost, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (resume) localStorage.setItem(STORAGE.resume, JSON.stringify(resume));
      else localStorage.removeItem(STORAGE.resume);
      localStorage.setItem(STORAGE.prefs, JSON.stringify({ template, pageSize, spacing: densitySetting }));
    } catch {
      /* ignore */
    }
  }, [resume, template, pageSize, densitySetting, hydrated]);

  // ── One-page fit: render off-screen at every spacing and measure.
  const measureRefs = useRef<Partial<Record<number, HTMLDivElement | null>>>({});
  const measure = useCallback(() => {
    const next: Partial<Record<number, number>> = {};
    FIT_STEPS.forEach((d) => {
      const el = measureRefs.current[d];
      if (el && !el.querySelector("[data-skeleton]")) next[d] = el.scrollHeight;
    });
    setHeights((prev) => (FIT_STEPS.every((d) => prev[d] === next[d]) ? prev : next));
  }, []);

  useEffect(() => {
    if (!resume) return;
    const observer = new ResizeObserver(() => measure());
    FIT_STEPS.forEach((d) => {
      const el = measureRefs.current[d];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [measure, template, pageSize, resume]);

  const fit = resume ? pickFit(heights, content.heightPx, densitySetting) : null;
  const scale = fit?.scale ?? (densitySetting === "auto" ? 1 : SPACING_PRESETS[densitySetting]);

  // ── Scale the page to the available width (transform keeps text spacing exact).
  const pagePx = (page.widthMm * 96) / 25.4;
  const sheetAreaRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const area = sheetAreaRef.current;
    const sheet = sheetRef.current;
    if (!area || !sheet) return;
    const update = () => {
      setZoom(Math.min(1, Math.max(0.25, area.clientWidth / pagePx)));
      setSheetHeight(sheet.offsetHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(area);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [pagePx]);

  const scrollToPreview = () => {
    if (isPhone()) previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMake = async () => {
    const text = notes.trim();
    if (!text) {
      setError("Paste your old resume, LinkedIn, or notes first.");
      return;
    }
    if (text.length > LIMITS.notes || jobPost.trim().length > LIMITS.jobPost) {
      setError("That is too much text. Please shorten it.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: text,
          jobPost: showJob ? jobPost.trim() : "",
          jobTitle: jobLabel?.title || "",
          company: jobLabel?.company || "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !isResumeData(json.data)) throw new Error(json.error || "Could not make your resume this time. Please try again.");
      setResume(json.data);
      setHeights({});
      setTimeout(scrollToPreview, 50);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setReading(true);
    setError("");
    try {
      const { extractPdfText } = await import("@/utils/pdfText");
      const text = await extractPdfText(file);
      setNotes(text.slice(0, LIMITS.notes));
      if (text.length > LIMITS.notes) setError("This PDF has a lot of text, so only the first part was kept. Remove anything you don't need.");
      notesRef.current?.focus();
      notesRef.current?.setSelectionRange(0, 0);
      if (notesRef.current) notesRef.current.scrollTop = 0;
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.name === "PdfReadError"
          ? err.message
          : "Couldn't read text from this PDF, try copying the text instead.";
      setError(message);
    } finally {
      setReading(false);
    }
  };

  const handleExample = () => {
    setNotes(EXAMPLE_NOTES);
    setJobPost("");
    setShowJob(false);
    setError("");
    setResume(EXAMPLE_PROFILE);
    setHeights({});
    setTimeout(scrollToPreview, 50);
  };

  useEffect(() => {
    if (!confirmClear) return;
    const id = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(id);
  }, [confirmClear]);

  const handleClear = () => {
    if (!confirmClear && (notes || jobPost || resume)) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    setNotes("");
    setJobPost("");
    setShowJob(false);
    setJobLabel(null);
    setResume(null);
    setError("");
    setHeights({});
    try {
      Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  };

  const handleDownload = async () => {
    if (!resume || downloading) return;
    setDownloading(true);
    setError("");
    try {
      const { makeResumePdf, resumeFileName } = await import("@/components/pdf/makePdf");
      const { blob } = await makeResumePdf({ data: resume, template, pageSize, scale });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resumeFileName(resume.personalInfo?.fullName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error(err);
      setError("Could not make the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const templateClass = "resume-in-sheet";

  const downloadButton = (extra = "") => (
    <button
      type="button"
      className={`${styles.secondaryButton} ${extra}`}
      onClick={handleDownload}
      disabled={!resume || downloading || loading}
      aria-busy={downloading}
    >
      {downloading ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
      {downloading ? "Making PDF…" : "Download PDF"}
    </button>
  );

  const makeButton = (extra = "") => (
    <button type="button" className={`${styles.primaryButton} ${extra}`} onClick={handleMake} disabled={loading} aria-busy={loading}>
      {loading ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : null}
      {loading ? "Making your resume…" : "Make my resume"}
    </button>
  );

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.logo}>promptly</span>
        <div className={styles.headerActions}>{downloadButton(styles.headerDownload)}</div>
      </header>

      <main className={styles.main}>
        <section className={styles.inputColumn} aria-labelledby="make-title">
          <h1 id="make-title" className={styles.title}>Make your resume</h1>

          <label htmlFor="notes" className={styles.srOnly}>Paste your old resume, LinkedIn, or notes</label>
          <textarea
            id="notes"
            ref={notesRef}
            className={styles.textarea}
            placeholder="Paste your old resume, LinkedIn, or notes"
            value={notes}
            maxLength={LIMITS.notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className={styles.uploadRow}>
            <button type="button" className={styles.uploadButton} onClick={() => fileRef.current?.click()} disabled={reading || loading}>
              {reading ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : <FileUp size={15} aria-hidden="true" />}
              {reading ? "Reading PDF…" : "Upload PDF"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className={styles.srOnly}
              tabIndex={-1}
              aria-label="Upload a PDF of your resume or LinkedIn profile"
              onChange={handleUpload}
            />
            <p className={styles.tip}>Tip: on LinkedIn, open your profile, tap More, then Save to PDF, and upload it here.</p>
          </div>
          {notes.length > LIMITS.notes * 0.8 && (
            <p className={styles.counter}>{notes.length.toLocaleString("en-US")} / {LIMITS.notes.toLocaleString("en-US")} characters</p>
          )}

          {showJob ? (
            <div className={styles.jobBlock}>
              <div className={styles.jobHeader}>
                <label htmlFor="job-post" className={styles.label}>
                  Job post (optional){jobLabel ? ` · ${jobLabel.title} at ${jobLabel.company}` : ""}
                </label>
                <button type="button" className={styles.textButton} onClick={() => { setShowJob(false); setJobPost(""); setJobLabel(null); }}>
                  Remove
                </button>
              </div>
              <textarea
                id="job-post"
                className={`${styles.textarea} ${styles.jobTextarea}`}
                placeholder="Paste the job post. Your resume will put the most relevant work first."
                value={jobPost}
                maxLength={LIMITS.jobPost}
                onChange={(e) => setJobPost(e.target.value)}
              />
            </div>
          ) : (
            <button type="button" className={styles.addJob} onClick={() => setShowJob(true)}>
              + Add the job post (optional)
            </button>
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}

          {makeButton(styles.inlineMake)}

          <div className={styles.smallActions}>
            <button type="button" className={styles.textButton} onClick={handleExample} disabled={loading}>Try an example</button>
            <span aria-hidden="true" className={styles.dotSep}>·</span>
            <button type="button" className={styles.textButton} onClick={handleClear} disabled={loading}>
              {confirmClear ? "Tap again to clear everything" : "Clear"}
            </button>
          </div>

          {resume && <ResumeCheck resumeData={resume} />}
        </section>

        <section ref={previewRef} className={styles.previewColumn} aria-label="Resume preview">
          {resume && (
            <div className={styles.toolbar} role="toolbar" aria-label="Page options">
              <div className={styles.segmented} role="group" aria-label="Template">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={template === t.key}
                    className={template === t.key ? styles.segmentActive : styles.segment}
                    onClick={() => { setTemplate(t.key); setHeights({}); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className={styles.selectField}>
                <span className={styles.srOnly}>Paper</span>
                <select value={pageSize} onChange={(e) => { setPageSize(e.target.value as PageSizeKey); setHeights({}); }} aria-label="Paper">
                  {(Object.keys(PAGE_SIZES) as PageSizeKey[]).map((k) => (
                    <option key={k} value={k}>{PAGE_SIZES[k].label}</option>
                  ))}
                </select>
              </label>
              <label className={styles.selectField}>
                <span className={styles.srOnly}>Spacing</span>
                <select value={densitySetting} onChange={(e) => setDensitySetting(e.target.value as SpacingSetting)} aria-label="Spacing">
                  <option value="auto">Auto spacing</option>
                  {(Object.keys(SPACING_PRESETS) as SpacingPreset[]).map((k) => (
                    <option key={k} value={k}>{SPACING_LABELS[k]}</option>
                  ))}
                </select>
              </label>
              <span className={`${styles.fit} ${fit && !fit.fits ? styles.fitWarn : ""}`} role="status" aria-live="polite">
                {!fit ? "Checking length…" : fit.fits ? (
                  <><CheckCircle2 size={14} aria-hidden="true" /> Fits on one page</>
                ) : (
                  <><AlertTriangle size={14} aria-hidden="true" /> Runs over one page (about {fit.pages}). Cut older bullets.</>
                )}
              </span>
            </div>
          )}

          <div ref={sheetAreaRef} className={styles.sheetArea}>
            <div className={styles.sheetFrame} style={{ width: pagePx * zoom, height: sheetHeight ? sheetHeight * zoom : undefined }}>
            <div
              ref={sheetRef}
              className={styles.sheet}
              style={{
                width: `${page.widthMm}mm`,
                minHeight: `${page.heightMm}mm`,
                padding: `${PAGE_MARGIN_MM.vertical}mm ${PAGE_MARGIN_MM.horizontal}mm`,
                transform: zoom < 1 ? `scale(${zoom})` : undefined,
              }}
            >
              {resume && fit && !fit.fits && (
                <div className={styles.pageBreak} style={{ top: `${PAGE_MARGIN_MM.vertical}mm`, height: `${content.heightMm}mm` }} aria-hidden="true">
                  <span>End of page 1</span>
                </div>
              )}
              {loading ? (
                <ResumeSkeleton />
              ) : resume ? (
                <ErrorBoundary>
                  <div key={template} className={styles.fadeIn} style={fitStyle(scale)}>{renderTemplate(template, resume, templateClass, setResume)}</div>
                </ErrorBoundary>
              ) : (
                <div className={styles.placeholder}>
                  <p>Your resume shows up here</p>
                </div>
              )}
            </div>
            </div>
          </div>

          {resume && (
            <p className={styles.editHint}>Click any line on the page to change it.</p>
          )}

          {resume && (
            <div className={styles.measureArea} aria-hidden="true" style={{ width: `${content.widthMm}mm` }}>
              {FIT_STEPS.map((d) => (
                <div key={d} style={fitStyle(d)} ref={(el) => { measureRefs.current[d] = el; }}>
                  {renderTemplate(template, resume, "resume-in-sheet")}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <div className={styles.bottomBar}>
        {makeButton()}
        {downloadButton()}
      </div>
    </div>
  );
}
