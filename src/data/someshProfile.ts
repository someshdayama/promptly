import { ResumeData } from "@/types/resume";

/**
 * Somesh Dayama's resume. Used as the default preview and the "Example" profile.
 */
export const SOMESH_PROFILE: ResumeData = {
  personalInfo: {
    fullName: "Somesh Dayama",
    email: "someshdayama2@gmail.com",
    phone: "+91 7049614849",
    location: "Mumbai, India",
    linkedinUrl: "https://www.linkedin.com/in/somesh-dayama/",
    portfolioUrl: "https://portfolio-someshdayama.netlify.app/",
  },
  summary:
    "DevOps and SRE-focused Software Engineer with 4 years of experience building CI/CD pipelines, cloud infrastructure, and release automation across GCP, Azure, and AWS, with hands-on Kubernetes, Terraform, and GitHub Actions. Release Train Engineer leading release planning for 5 teams (21 engineers), and builder of AI agents that automate SDLC and Jira workflows. Certified Scrum Master.",
  skillGroups: [
    { category: "Cloud", items: ["GCP", "Azure", "AWS"] },
    { category: "CI/CD", items: ["GitHub Actions", "Jenkins", "Maven", "Git"] },
    { category: "Containers & IaC", items: ["Kubernetes", "Helm", "Docker", "Terraform", "Ansible"] },
    { category: "Monitoring", items: ["Prometheus", "Grafana"] },
    { category: "Languages", items: ["Python", "Bash", "Groovy", "Java", "SQL"] },
    {
      category: "Delivery & AI",
      items: ["Agile/Scrum", "release train management", "JIRA", "AI agents for SDLC automation"],
    },
  ],
  skills: [
    "GCP", "Azure", "AWS",
    "GitHub Actions", "Jenkins", "Maven", "Git",
    "Kubernetes", "Helm", "Docker", "Terraform", "Ansible",
    "Prometheus", "Grafana",
    "Python", "Bash", "Groovy", "Java", "SQL",
    "Agile/Scrum", "release train management", "JIRA", "AI agents for SDLC automation",
  ],
  experience: [
    {
      company: "NCR Atleos Corporation",
      position: "Software Engineer",
      startDate: "Feb 2025",
      endDate: "Present",
      description: [
        "Own end-to-end releases and deployment automation for ATM Management Platform Services (AMPS), delivering secure, compliant, zero-downtime releases.",
        "Release Train Engineer (RTE) for the product, running release planning and delivery across 5 teams (21 members).",
        "Build and maintain CI/CD pipelines in GitHub Actions and Jenkins for code validation, artifact management, and multi-environment deployments on Azure and GCP.",
        "Built AI agents that automate SDLC tasks and Jira workflows for the engineering teams.",
        "Automated release procedures, health checks, and pipeline triggers, reducing manual steps and deployment risk.",
        "Drive DevOps alignment across development groups to standardize infrastructure provisioning, reduce technical debt, and improve system availability.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Software Engineer (SRE / Cloud)",
      startDate: "May 2023",
      endDate: "Feb 2025",
      description: [
        "Built resource allocation strategies and custom autoscaling scripts on GCP, cutting infrastructure costs by 34.56% through instance rightsizing and automated resource cleanup.",
        "Developed automated database maintenance playbooks and failover setups with Terraform and Ansible, reducing database-related production incidents by 24%.",
        "Built and managed reproducible, scalable staging and production environments with Terraform for the Authentic Switch transactional system.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Trainee Software Engineer",
      startDate: "Jan 2023",
      endDate: "Apr 2023",
      note: "promoted to Software Engineer",
      description: [
        "Built script-driven Jenkins pipelines for the high-traffic Domino's application (Jubilant Foods), removing manual release tasks and shortening deployment cycles.",
        "Managed Linux environments and AWS services (EC2, VPC, S3) to provision isolated staging environments for product teams.",
      ],
    },
  ],
  education: [
    {
      institution: "National Institute of Technology (NIT), Bhopal (MANIT)",
      degree: "Master of Computer Applications (MCA)",
      startDate: "",
      endDate: "2023",
      details: "GPA: 8/10",
    },
    {
      institution: "Prestige Institute of Management and Research, Indore",
      degree: "Bachelor of Computer Applications (BCA)",
      startDate: "",
      endDate: "",
    },
  ],
  certifications: ["Certified Scrum Master (CSM)"],
};
