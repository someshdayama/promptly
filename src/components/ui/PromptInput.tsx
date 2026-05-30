"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import styles from "./PromptInput.module.css";
import { ResumeData } from "@/types/resume";

interface PromptInputProps {
  onDataGenerated: (data: ResumeData) => void;
  onLoading?: (isLoading: boolean) => void;
  jobContext?: { title: string; company: string };
}

import { SOMESH_PROFILE } from "@/data/someshProfile";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";

const DEFAULT_PROFILE_TEXT = serializeProfileToPrompt(SOMESH_PROFILE);

const STORAGE_KEY = "promptly_saved_prompt";

export default function PromptInput({ onDataGenerated, onLoading, jobContext }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved prompt on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPrompt(saved);
    }
  }, []);

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    localStorage.setItem(STORAGE_KEY, val);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter your details first.");
      return;
    }

    setIsLoading(true);
    onLoading?.(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, ...(jobContext ? { jobContext } : {}) }),
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
    handlePromptChange("");
    setError("");
  };

  const handleInsertExample = () => {
    handlePromptChange(DEFAULT_PROFILE_TEXT);
    setError("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Paste Your Info</h2>
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
        onChange={(e) => handlePromptChange(e.target.value)}
      />

      {error && <p className={styles.error}>{error}</p>}

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
