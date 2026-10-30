"use client";

import PromptInput from "./PromptInput";
import ResumeCheck from "./ResumeCheck";
import { ResumeData } from "@/types/resume";

interface EditorPanelProps {
  resumeData: ResumeData;
  onDataChange: (data: ResumeData) => void;
  onLoading?: (isLoading: boolean) => void;
  jobContext?: { title: string; company: string };
  initialJobDesc?: string;
  onResetExample?: () => void;
}

export default function EditorPanel({
  resumeData,
  onDataChange,
  onLoading,
  jobContext,
  initialJobDesc,
  onResetExample,
}: EditorPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <PromptInput
          onDataGenerated={onDataChange}
          onLoading={onLoading}
          jobContext={jobContext}
          initialJobDesc={initialJobDesc}
          onResetExample={onResetExample}
        />
        <ResumeCheck resumeData={resumeData} />
      </div>
    </div>
  );
}
