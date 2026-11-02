"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Download, FileUp, Loader2, PenLine } from "lucide-react";
import styles from "./Builder.module.css";
import { ResumeData } from "@/types/resume";
import { EXAMPLE_PROFILE } from "@/data/exampleProfile";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";
import { LIMITS } from "@/utils/generateRequest";
import { PAGE_MARGIN_MM, PAGE_MODES, PAGE_SIZES, PageMode, PageSizeKey, fitStyle, isPageMode } from "@/utils/pageFit";
import type { MadePdf } from "@/components/pdf/makePdf";
import PdfPreview from "@/components/PdfPreview";
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
  const [pageMode, setPageMode] = useState<PageMode>("one");
  const [editing, setEditing] = useState(false);
  const [made, setMade] = useState<(MadePdf & { key: string }) | null>(null);
  const [making, setMaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [reading, setReading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(0);

  const previewRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const page = PAGE_SIZES[pageSize];

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
    if (isPageMode(saved.prefs.pageMode)) setPageMode(saved.prefs.pageMode);
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
      localStorage.setItem(STORAGE.prefs, JSON.stringify({ template, pageSize, pageMode }));
    } catch {
      /* ignore */
    }
  }, [resume, template, pageSize, pageMode, hydrated]);

  // ── Build the real PDF (shown in the preview and saved by Download), shortly after each change.
  const pdfKey = resume ? JSON.stringify([resume, template, pageSize, pageMode]) : "";
  const runRef = useRef(0);
  const buildPdf = useCallback(async (): Promise<MadePdf & { key: string }> => {
    const { makeResumePdf } = await import("@/components/pdf/makePdf");
    const out = await makeResumePdf({ data: resume as ResumeData, template, pageSize, mode: pageMode });
    return { ...out, key: pdfKey };
  }, [resume, template, pageSize, pageMode, pdfKey]);

  useEffect(() => {
    if (!resume || loading) return;
    const run = ++runRef.current;
    const id = setTimeout(async () => {
      setMaking(true);
      try {
        const out = await buildPdf();
        if (run === runRef.current) setMade(out);
      } catch (err) {
        console.error(err);
      } finally {
        if (run === runRef.current) setMaking(false);
      }
    }, editing ? 700 : 250);
    return () => clearTimeout(id);
  }, [buildPdf, resume, loading, editing]);

  // The edit view uses the scale the PDF was laid out at, so it looks the same.
  const scale = made?.scale ?? 1;

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
  }, [pagePx, editing, resume, loading]);

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
      setEditing(false);
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
    setEditing(false);
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
    setMade(null);
    setEditing(false);
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
      const { resumeFileName } = await import("@/components/pdf/makePdf");
      const { blob } = made && made.key === pdfKey ? made : await buildPdf();
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
                    onClick={() => setTemplate(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className={styles.selectField}>
                <span className={styles.srOnly}>Paper</span>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSizeKey)} aria-label="Paper">
                  {(Object.keys(PAGE_SIZES) as PageSizeKey[]).map((k) => (
                    <option key={k} value={k}>{PAGE_SIZES[k].label}</option>
                  ))}
                </select>
              </label>
              <div className={styles.segmented} role="group" aria-label="Pages">
                {PAGE_MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    aria-pressed={pageMode === m.key}
                    className={pageMode === m.key ? styles.segmentActive : styles.segment}
                    onClick={() => setPageMode(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`${styles.editButton} ${editing ? styles.editOn : ""}`}
                aria-pressed={editing}
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? <><Check size={14} aria-hidden="true" /> Done</> : <><PenLine size={14} aria-hidden="true" /> Edit</>}
              </button>
              {making && <span className={styles.busy} aria-label="Updating"><Loader2 size={14} className={styles.spin} aria-hidden="true" /></span>}
            </div>
          )}

          <div ref={sheetAreaRef} className={styles.sheetArea}>
            {resume && !editing && !loading ? (
              <div className={styles.pdfArea} style={{ maxWidth: pagePx }}>
                <PdfPreview
                  blob={made?.blob ?? null}
                  aspect={page.widthMm / page.heightMm}
                  onPageClick={() => setEditing(true)}
                />
              </div>
            ) : (
            <div className={styles.sheetFrame} style={{ width: pagePx * zoom, height: sheetHeight ? sheetHeight * zoom : undefined }}>
            <div
              ref={sheetRef}
              className={styles.sheet}
              style={{
                width: `${page.widthMm}mm`,
                minHeight: `${page.heightMm}mm`,
                padding: template === "modern" && resume && !loading ? 0 : `${PAGE_MARGIN_MM.vertical}mm ${PAGE_MARGIN_MM.horizontal}mm`,
                transform: zoom < 1 ? `scale(${zoom})` : undefined,
              }}
            >
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
            )}
          </div>

          {resume && (
            <p className={styles.editHint}>
              {editing ? "Click any line to change it. Tap Done to see the final PDF." : "This is the exact PDF you'll download. Tap the page or Edit to change text."}
            </p>
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
