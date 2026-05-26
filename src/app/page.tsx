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

I am a Software Engineer with over 3 years of experience specializing in cloud infrastructure, high-performance CI/CD automation, and site reliability engineering.

SKILLS:
- Cloud Platforms: GCP (Compute Engine, GKE, Cloud SQL, IAM, VPC), AWS, Azure
- DevOps & IaC: Terraform, Ansible, Docker, Kubernetes (GKE), Helm, Jenkins, GitHub Actions
- Programming & Scripting: Java, Python, Groovy, Bash, Linux Shell, SQL
- Monitoring & Observability: Prometheus, Grafana
- Methodologies & Tools: System Design, Agile/Scrum, Git, JIRA, Maven

WORK EXPERIENCE:

NCR Atleos Corporation | Mumbai, India — Software Engineer — Feb 2025 to Present
- Release Train Engineer (RTE): Managed release lifecycles and cross-functional CI/CD coordination for the AMP Services Product on Azure, aligning delivery timelines and mitigating operational risks.
- Scrum Master: Facilitated agile ceremonies and cleared blockers for an 11-member engineering squad, driving sprint predictability and process optimization.
- Incident Response & Release Lead: Functioned as primary Incident Commander for mission-critical production outages, architecting coordination strategies between Dev and Ops teams to significantly reduce Mean Time to Resolution.
- DevOps Orchestration: Spearheaded infrastructure provisioning and environment setup using GCP (GKE, Compute Engine), utilizing Jenkins, Helm, and Ansible to maintain high availability and deployment velocity.
- Infrastructure Optimization: Conducted self-initiated legacy upgrades and continuous drift detection, successfully maintaining zero configuration drift across multi-cloud environments.

Monocept Consulting Pvt. Ltd. | Hyderabad, India — Software Engineer — May 2023 to Feb 2025
- FinOps & Cost Optimization: Developed automated scripts and engineered resource allocation strategies on GCP, delivering a 34.56% reduction in cloud infrastructure costs via precision instance rightsizing and auto-scaling.
- Database Reliability: Architected automated database maintenance blueprints and failover strategies utilizing Terraform and Ansible, decreasing database-related production incidents by 24%.
- Infrastructure as Code (IaC): Orchestrated environment deployment for the Authentic Switch application across production and staging GCP environments using Terraform, establishing fully reproducible, scalable infrastructure.

Monocept Consulting Pvt. Ltd. | Remote — Trainee Software Engineer — Jan 2023 to Apr 2023
- CI/CD Automation: Automated Jenkins-based deployment pipelines for the flagship Domino’s App (Jubilant Foods), radically minimizing manual interventions and reducing deployment cycle times.
- Cloud Provisioning: Managed Linux virtual environments and leveraged AWS core services to dynamically provision scalable staging environments for cross-functional development teams.

PROJECTS:
- Velocity: Developed a high-performance network diagnostic and credit monitoring tool hosted on Netlify, focusing on low-latency network telemetry and automated diagnostic reporting.
- Promptly: Architected a privacy-focused, AI-driven resume builder application, implementing local model optimizations to securely generate tailored professional profiles without external data leaks.

EDUCATION:
- Master of Computer Applications (MCA) — National Institute of Technology (NIT), Bhopal — 2023
- Bachelor of Computer Applications (BCA) — Prestige Institute of Management and Research, Indore — 2020

OTHER:
- Languages: English, Hindi`;

const generatePlaceholderData = (): ResumeData => ({
  personalInfo: {
    fullName: "Somesh Dayama",
    email: "someshdayama2@gmail.com",
    phone: "7049614849",
    location: "Mumbai, India",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
    portfolioUrl: "https://portfolio.com",
  },
  summary:
    "Results-driven Software Engineer with over 3 years of experience specializing in cloud infrastructure, high-performance CI/CD automation, and site reliability engineering. Adept at optimizing system architecture across GCP, Azure, and AWS to drive down cloud expenditures and maximize deployment frequencies. Leverages automated tooling and agile practices as a force multiplier to streamline complex release management, eliminate technical debt, and ensure zero-drift infrastructure stability.",
  experience: [
    {
      company: "NCR Atleos Corporation",
      position: "Software Engineer",
      startDate: "Feb 2025",
      endDate: "Present",
      description: [
        "Release Train Engineer (RTE): Managed release lifecycles and cross-functional CI/CD coordination for the AMP Services Product on Azure, aligning delivery timelines and mitigating operational risks.",
        "Scrum Master: Facilitated agile ceremonies and cleared blockers for an 11-member engineering squad, driving sprint predictability and process optimization.",
        "Incident Response & Release Lead: Functioned as primary Incident Commander for mission-critical production outages, architecting coordination strategies between Dev and Ops teams to significantly reduce Mean Time to Resolution.",
        "DevOps Orchestration: Spearheaded infrastructure provisioning and environment setup using GCP (GKE, Compute Engine), utilizing Jenkins, Helm, and Ansible to maintain high availability and deployment velocity.",
        "Infrastructure Optimization: Conducted self-initiated legacy upgrades and continuous drift detection, successfully maintaining zero configuration drift across multi-cloud environments.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Software Engineer",
      startDate: "May 2023",
      endDate: "Feb 2025",
      description: [
        "FinOps & Cost Optimization: Developed automated scripts and engineered resource allocation strategies on GCP, delivering a 34.56% reduction in cloud infrastructure costs via precision instance rightsizing and auto-scaling.",
        "Database Reliability: Architected automated database maintenance blueprints and failover strategies utilizing Terraform and Ansible, decreasing database-related production incidents by 24%.",
        "Infrastructure as Code (IaC): Orchestrated environment deployment for the Authentic Switch application across production and staging GCP environments using Terraform, establishing fully reproducible, scalable infrastructure.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Trainee Software Engineer",
      startDate: "Jan 2023",
      endDate: "Apr 2023",
      description: [
        "CI/CD Automation: Automated Jenkins-based deployment pipelines for the flagship Domino’s App (Jubilant Foods), radically minimizing manual interventions and reducing deployment cycle times.",
        "Cloud Provisioning: Managed Linux virtual environments and leveraged AWS core services to dynamically provision scalable staging environments for cross-functional development teams.",
      ],
    },
  ],
  projects: [
    {
      name: "Velocity",
      description: "Developed a high-performance network diagnostic and credit monitoring tool hosted on Netlify, focusing on low-latency network telemetry and automated diagnostic reporting.",
    },
    {
      name: "Promptly",
      description: "Architected a privacy-focused, AI-driven resume builder application, implementing local model optimizations to securely generate tailored professional profiles without external data leaks.",
    },
  ],
  education: [
    { institution: "National Institute of Technology (NIT), Bhopal", degree: "Master of Computer Applications (MCA)", startDate: "", endDate: "2023" },
    { institution: "Prestige Institute of Management and Research, Indore", degree: "Bachelor of Computer Applications (BCA)", startDate: "", endDate: "2020" },
  ],
  skills: [
    "GCP (Compute Engine, GKE, Cloud SQL, IAM, VPC)",
    "AWS",
    "Azure",
    "Terraform",
    "Ansible",
    "Docker",
    "Kubernetes (GKE)",
    "Helm",
    "Jenkins",
    "GitHub Actions",
    "Java",
    "Python",
    "Groovy",
    "Bash",
    "Linux Shell",
    "SQL",
    "Prometheus",
    "Grafana",
    "System Design",
    "Agile/Scrum",
    "Git",
    "JIRA",
    "Maven",
    "English",
    "Hindi"
  ],
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
