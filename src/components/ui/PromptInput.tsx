"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import styles from "./PromptInput.module.css";
import { ResumeData } from "@/types/resume";

interface PromptInputProps {
  onDataGenerated: (data: ResumeData) => void;
  onLoading?: (isLoading: boolean) => void;
}

export default function PromptInput({ onDataGenerated, onLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to generate resume.");
      }

      onDataGenerated(json.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setError("");
  };

  const handleInsertExample = () => {
    setPrompt("My name is Jane Smith.\n\nI am a Senior Product Manager based in Austin, TX. (jane.smith@email.com). I have over 6 years of experience driving cross-functional teams to launch B2B SaaS products.\n\nFrom Jan 2021 to Present, I worked at CloudCore Industries as a Senior Product Manager. I launched a new analytics dashboard that increased enterprise retention by 15%, guided a team of 4 designers and 8 engineers, and managed a $2M annual budget.\n\nBefore that (June 2018 - Dec 2020), I was a Product Owner at NexaTech. I mapped user journeys, wrote agile stories, and reduced time-to-market for key features by 20%.\n\nI went to the University of Texas at Austin and got my B.S. in Business Administration (May 2018).\n\nMy skills include: Agile Strategy, JIRA, SQL, User Research, Wireframing, and Cross-functional Leadership.");
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
        onChange={(e) => setPrompt(e.target.value)}
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
