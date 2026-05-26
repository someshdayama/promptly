"use client";

import { useState, useRef, useEffect, ComponentType, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Download, Sparkles } from "lucide-react";
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

// Somesh's real resume — pre-filled when Career Radar launches Promptly
const SOMESH_BASE_PROMPT = `My name is Somesh Dayama. I am based in Mumbai, India. Phone: 7049614849. Email: someshdayama2@gmail.com.

I am a Software Engineer with a deep foundation in DevOps and Cloud Infrastructure, currently serving as a Release Train Engineer (RTE) for a 17-member team. I blend technical expertise from cloud side with Scrum Master role to bridge the gap between complex engineering requirements.

SKILLS:
- Cloud Platforms: GCP (Compute Engine, GKE, Cloud SQL, IAM, VPC), AWS, Azure
- DevOps Tools: Jenkins, Docker, Kubernetes, Terraform, Ansible, Helm, GitHub Actions
- Programming & Scripting: Java, Python, SQL, Groovy, Bash, Linux Shell
- Monitoring & CI/CD: Prometheus, Grafana, CI/CD Pipelines, Maven, Git
- Agile & Project Management: Scrum (CSM certified), Agile Methodologies, JIRA
- Other: Infrastructure as Code (IaC), System Design, Data Visualisation

WORK EXPERIENCE:

NCR Atleos Corporation | Mumbai, India — Software Engineer — Feb 2025 to Present
- Managed release lifecycles and CI/CD coordination for an 11-member engineering squad on the AMP Services Product in Azure.
- Primary Incident Commander for production outages, coordinating Dev and Ops teams to significantly reduce Mean Time to Resolution.
- Orchestrated end-to-end cloud infrastructure using GCP (GKE, Compute Engine).
- Maintained and optimised CI/CD pipelines using Jenkins, Helm, and Ansible, ensuring high availability and deployment frequency.
- Led self-initiated legacy infrastructure upgrades and drift detection using Terraform, ensuring zero configuration drift.

Monocept Consulting Pvt. Ltd. | Hyderabad — Software Engineer — May 2023 to Feb 2025
- FinOps/Cost Optimisation: Achieved a 34.56% reduction in GCP cloud infrastructure costs by rightsizing instances and implementing auto-scaling policies.
- Database Reliability: Reduced database-related production incidents by 24% using automated maintenance and failover strategies with Terraform and Ansible.
- Infrastructure as Code: Deployed the "Authentic Switch" application across multiple GCP environments using Terraform.

Monocept Consulting Pvt. Ltd. | Remote — Trainee Software Engineer — Jan 2023 to Apr 2023
- Automated Jenkins-based deployment pipelines for the Domino's App (Jubilant Foods), reducing manual deployment time.
- Managed Linux VMs and utilised AWS services to provision scalable testing environments.

EDUCATION:
Master of Computer Applications (MCA) — National Institute of Technology, Bhopal - 2020 to 2023
Bachelor of Computer Applications (BCA) — Prestige Institute of Management and Research, Indore - 2017 to 2020

Languages: Hindi, English`;

const generatePlaceholderData = (): ResumeData => ({
  personalInfo: {
    fullName: "Somesh Dayama",
    email: "someshdayama2@gmail.com",
    phone: "7049614849",
    location: "Mumbai, India",
    linkedinUrl: "",
  },
  summary:
    "A Software Engineer with a deep foundation in DevOps and Cloud Infrastructure, currently serving as a Release Train Engineer (RTE) for a 17-member team. I blend technical expertise from cloud side with Scrum Master role to bridge the gap between complex engineering requirements.",
  experience: [
    {
      company: "NCR Atleos Corporation",
      position: "Software Engineer",
      startDate: "Feb 2025",
      endDate: "Present",
      description: [
        "Managed release lifecycles and CI/CD coordination for an 11-member engineering squad on the AMP Services Product in Azure.",
        "Primary Incident Commander for production outages, reducing MTTR significantly.",
        "Orchestrated GCP cloud infrastructure (GKE, Compute Engine) and optimised Jenkins/Helm/Ansible pipelines.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Software Engineer",
      startDate: "May 2023",
      endDate: "Feb 2025",
      description: [
        "Achieved 34.56% reduction in GCP infrastructure costs through rightsizing and auto-scaling.",
        "Reduced database-related production incidents by 24% via Terraform/Ansible automation.",
        "Deployed \"Authentic Switch\" across multiple GCP environments using Terraform.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Trainee Software Engineer",
      startDate: "Jan 2023",
      endDate: "Apr 2023",
      description: [
        "Automated Jenkins-based deployment pipelines for the Domino's App (Jubilant Foods).",
        "Managed Linux VMs and provisioned AWS testing environments.",
      ],
    },
  ],
  education: [
    { institution: "National Institute of Technology, Bhopal", degree: "Master of Computer Applications (MCA)", startDate: "", endDate: "" },
    { institution: "Prestige Institute of Management and Research, Indore", degree: "Bachelor of Computer Applications (BCA)", startDate: "", endDate: "" },
  ],
  skills: ["GCP", "AWS", "Azure", "Kubernetes", "Docker", "Terraform", "Ansible", "Jenkins", "Helm", "GitHub Actions", "Prometheus", "Grafana", "Python", "Bash", "Scrum (CSM)", "JIRA", "CI/CD", "IaC"],
});

function HomeContent() {
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>(generatePlaceholderData());
  const [template, setTemplate] = useState("corporate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    accentColor: "",
    fontFamily: "",
    spacing: "normal",
  });
  const [jobBanner, setJobBanner] = useState<{ title: string; company: string } | null>(null);

  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${resumeData.personalInfo?.fullName || "Resume"}_CV`,
  });

  // Auto-generate when Career Radar deep-links with job params
  useEffect(() => {
    const jobTitle = searchParams.get("jobTitle");
    const company = searchParams.get("company");
    const location = searchParams.get("location");
    const description = searchParams.get("description");

    if (!jobTitle || !company) return;

    setJobBanner({ title: jobTitle, company });

    const jobContext = { title: jobTitle, company, location: location || "India", description: description || "" };

    const tailoredPrompt = `${SOMESH_BASE_PROMPT}

--- TARGET JOB ---
I am applying for the role of ${jobTitle} at ${company} (${location || "India"}).
${description ? `Role context: ${description}` : ""}

Please tailor my resume summary and skill highlights to this specific role while keeping all information truthful and based only on my actual background above.`;

    setIsGenerating(true);

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: tailoredPrompt, jobContext }),
    })
      .then(res => res.json())
      .then(json => {
        if (json.data) setResumeData(json.data);
      })
      .catch(console.error)
      .finally(() => setIsGenerating(false));
  }, []); // Run once on mount

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

        <div className={styles.headerCenter}>
          <TemplateSwitcher currentTemplate={template} onTemplateChange={setTemplate} />
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
            jobContext={jobBanner ? { title: jobBanner.title, company: jobBanner.company } : undefined}
          />
          <FormatCustomizer options={formatOptions} onChange={setFormatOptions} />
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

export default function Home() {
  return (
    <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh' }} />}>
      <HomeContent />
    </Suspense>
  );
}
