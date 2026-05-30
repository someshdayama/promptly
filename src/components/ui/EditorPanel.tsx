"use client";

import PromptInput from "./PromptInput";
import { ResumeData } from "@/types/resume";

interface EditorPanelProps {
  resumeData: ResumeData;
  onDataChange: (data: ResumeData) => void;
  onLoading?: (isLoading: boolean) => void;
  jobContext?: { title: string; company: string };
}

export default function EditorPanel({
  onDataChange,
  onLoading,
  jobContext,
}: EditorPanelProps) {
  const handleGeneratedData = (updatedData: ResumeData) => {
    onDataChange(updatedData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <PromptInput
          onDataGenerated={handleGeneratedData}
          onLoading={onLoading}
          jobContext={jobContext}
        />
      </div>
    </div>
  );
}
