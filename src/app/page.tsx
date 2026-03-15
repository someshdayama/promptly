"use client";

import { useState, useRef, ComponentType } from "react";
import { useReactToPrint } from "react-to-print";
import { Download } from "lucide-react";
import styles from "./page.module.css";
import { ResumeData } from "@/types/resume";

import PromptInput from "@/components/ui/PromptInput";
import TemplateSwitcher from "@/components/ui/TemplateSwitcher";
import FormatCustomizer, { FormatOptions } from "@/components/ui/FormatCustomizer";
import MinimalistTemplate from "@/components/resume/MinimalistTemplate";
import CreativeTemplate from "@/components/resume/CreativeTemplate";
import CorporateTemplate from "@/components/resume/CorporateTemplate";
import StartupTemplate from "@/components/resume/StartupTemplate";
import ElegantTemplate from "@/components/resume/ElegantTemplate";
import AutoFitWrapper from "@/components/ui/AutoFitWrapper";
import ResumeSkeleton from "@/components/ui/ResumeSkeleton";

const TEMPLATES: Record<string, ComponentType<{ data: ResumeData }>> = {
  minimalist: MinimalistTemplate,
  creative: CreativeTemplate,
  corporate: CorporateTemplate,
  startup: StartupTemplate,
  elegant: ElegantTemplate,
};

// Provide some dummy initial state so the user sees *something* on load
const generatePlaceholderData = (): ResumeData => ({
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/arivera",
  },
  summary:
    "Dynamic and results-oriented Software Engineer with a passion for building scalable web applications. Proven ability to quickly learn new technologies and drive technical initiatives from conception to deployment.",
  experience: [
    {
      company: "TechNova Solutions",
      position: "Senior Frontend Engineer",
      startDate: "Mar 2021",
      endDate: "Present",
      description: [
        "Led the migration of a legacy dashboard to Next.js, improving page load speeds by 40%.",
        "Mentored a team of 4 junior developers.",
      ],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. in Computer Science",
      startDate: "Sep 2015",
      endDate: "May 2019",
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "GraphQL", "UI/UX Design"],
});

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(generatePlaceholderData());
  const [template, setTemplate] = useState("minimalist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    accentColor: "",
    fontFamily: "",
    spacing: "normal",
  });
  
  // Ref for the template wrapper that we want to print
  const resumeRef = useRef<HTMLDivElement>(null);

  // Print function provided by react-to-print
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${resumeData.personalInfo?.fullName || "Resume"}_CV`,
  });

  const TemplateComponent = TEMPLATES[template] || MinimalistTemplate;

  const spacingScale = { compact: 0.8, normal: 1, relaxed: 1.2 };
  const resumeStyle: React.CSSProperties = {
    ...(formatOptions.accentColor && { "--resume-accent": formatOptions.accentColor }),
    ...(formatOptions.fontFamily && { "--resume-font": formatOptions.fontFamily }),
    ...(formatOptions.spacing !== "normal" && { "--resume-spacing": String(spacingScale[formatOptions.spacing]) }),
  } as React.CSSProperties;

  return (
    <div className={styles.container}>
      {/* App Header */}
      <header className={styles.appHeader}>
        <div className={styles.logo}>promptly</div>

        <div className={styles.headerCenter}>
          <TemplateSwitcher
            currentTemplate={template}
            onTemplateChange={setTemplate}
          />
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
          <PromptInput 
            onDataGenerated={setResumeData} 
            onLoading={setIsGenerating}
          />
          <FormatCustomizer
            options={formatOptions}
            onChange={setFormatOptions}
          />
        </section>

        {/* Right Side: Preview & Export Area */}
        <section className={styles.previewPanel}>
          <div className={styles.resumeWrapper}>
            <div ref={resumeRef} style={resumeStyle}>
              <AutoFitWrapper contentDependencies={[resumeData, template, isGenerating, formatOptions]}>
                {isGenerating ? (
                   <ResumeSkeleton />
                ) : (
                  <TemplateComponent data={resumeData} />
                )}
              </AutoFitWrapper>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
