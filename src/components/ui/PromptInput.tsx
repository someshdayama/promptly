"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import styles from "./PromptInput.module.css";
import { ResumeData } from "@/types/resume";

interface PromptInputProps {
  onDataGenerated: (data: ResumeData) => void;
  onLoading?: (isLoading: boolean) => void;
  jobContext?: { title: string; company: string };
  initialJobDesc?: string;
}

import { SOMESH_PROFILE } from "@/data/someshProfile";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";

const DEFAULT_PROFILE_TEXT = serializeProfileToPrompt(SOMESH_PROFILE);

const STORAGE_KEY = "promptly_saved_prompt";

export default function PromptInput({ onDataGenerated, onLoading, jobContext, initialJobDesc }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [jobDesc, setJobDesc] = useState(initialJobDesc || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "job">("profile");
  const isInitialMount = useRef(true);

  // Load saved prompt and job description on mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem(STORAGE_KEY);
    const savedJobDesc = localStorage.getItem("promptly_saved_job_desc");
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
    if (savedJobDesc && !initialJobDesc) {
      setJobDesc(savedJobDesc);
    }
    isInitialMount.current = false;
  }, [initialJobDesc]);

  // Handle autosave with debounce
  useEffect(() => {
    if (isInitialMount.current) return;

    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, prompt);
      localStorage.setItem("promptly_saved_job_desc", jobDesc);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [prompt, jobDesc]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter your details first.");
      return;
    }

    setIsLoading(true);
    onLoading?.(true);
    setError("");

    try {
      const finalPrompt = jobDesc.trim() 
        ? `${prompt}\n\n--- TARGET JOB DESCRIPTION ---\n${jobDesc}\n\nPlease tailor my resume summary, skills, and bullet points to match the keywords and requirements in this job description.` 
        : prompt;
        
      const contextToSend = jobContext || (jobDesc.trim() ? { title: "Target Role", company: "Target Company" } : undefined);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, ...(contextToSend ? { jobContext: contextToSend } : {}) }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to generate resume.");
      }

      onDataGenerated(json.data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setJobDesc("");
    setError("");
  };

  const handleInsertExample = () => {
    setPrompt(DEFAULT_PROFILE_TEXT);
    setError("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabHeader}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "profile" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          1. Your Details
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === "job" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("job")}
        >
          2. Target Job {jobDesc.trim() ? <span className={styles.tabBadge}>Active</span> : null}
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "profile" ? (
          <div className={styles.stepCard}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>Your Details</h2>
              <div className={styles.helperActions}>
                <button className={styles.helperButton} onClick={handleClear} disabled={isLoading}>Clear</button>
                <button className={styles.helperButton} onClick={handleInsertExample} disabled={isLoading}>Example</button>
              </div>
            </div>
            <p className={styles.subtitle}>
              Dump your work history, education, skills, and contact info below. Our AI will instantly format it into a professional resume.
            </p>
            <textarea
              className={styles.textarea}
              placeholder="e.g. My name is John Doe. I've worked as a Software Engineer at Acme Corp since Jan 2020 where I migrated the database to PostgreSQL and increased performance by 40%. Before that, I was at..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        ) : (
          <div className={styles.stepCard}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>Target Job <span className={styles.optionalBadge}>Optional</span></h2>
            </div>
            <p className={styles.subtitle}>
              Paste the job description here. Our AI will analyze the keywords and tailor your resume specifically for this role.
            </p>
            <textarea
              className={styles.textarea}
              placeholder="Paste the job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        )}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <button
        className={styles.button}
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className={styles.iconSpin} size={18} />
            Analyzing & Formatting...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Resume Now
          </>
        )}
      </button>
    </div>
  );
}
