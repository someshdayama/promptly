import { ResumeData } from "@/types/resume";

export const SOMESH_PROFILE: ResumeData = {
  personalInfo: {
    fullName: "Somesh Dayama",
    email: "someshdayama2@gmail.com",
    phone: "7049614849",
    location: "Mumbai, India",
    linkedinUrl: "https://www.linkedin.com/in/somesh-dayama/",
  },
  summary:
    "Software Engineer with over 3 years of experience focusing on cloud infrastructure, site reliability and project management. Utilizes automation and agile workflows to streamline release processes, reducing technical debt, and maintaining multi-cloud infrastructure stability",
  experience: [
    {
      company: "NCR Atleos Corporation",
      position: "Software Engineer",
      startDate: "Feb 2025",
      endDate: "Present",
      description: [
        "Direct end-to-end product releases and deployment lifecycles for AMP Services (ATM Management Platform Services), ensuring stable, compliant, and timely software deliveries.",
        "Oversee and manage all CI/CD pipeline automation tasks for the AMPS application, streamlining build, test, and release flows to minimize deployment risks.",
        "Lead DevOps orchestration and infrastructure activities for AMPS to optimize operational efficiency and high system availability.",
        "Architect and build robust workflows using GitHub Actions to automate release procedures, pipeline triggers, and cloud environment deployments.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Software Engineer",
      startDate: "May 2023",
      endDate: "Feb 2025",
      description: [
        "FinOps & Cost Optimization: Engineered data-driven resource allocation strategies and automated scaling scripts on GCP, successfully slashing cloud infrastructure costs by 34.56% through precision instance rightsizing.",
        "Database Reliability: Designed and implemented robust automated database maintenance blueprints and seamless failover architectures utilizing Terraform and Ansible, driving down database-related production incidents by 24%.",
        "Infrastructure as Code (IaC): Championed end-to-end environment deployment for the flagship Authentic Switch application across GCP production and staging environments using Terraform, cementing a fully reproducible and dynamically scalable infrastructure.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Trainee Software Engineer",
      startDate: "Jan 2023",
      endDate: "Apr 2023",
      description: [
        "CI/CD Automation: Architected and automated sophisticated Jenkins-based deployment pipelines for the high-traffic Domino’s App (Jubilant Foods), virtually eliminating manual interventions and accelerating release cycles.",
        "Cloud Provisioning: Administered complex Linux virtual environments and harnessed AWS core services to dynamically provision elastic, scalable staging environments tailored for cross-functional development teams.",
      ],
    },
  ],

  education: [
    { institution: "National Institute of Technology (NIT), Bhopal", degree: "Master of Computer Applications (MCA)", startDate: "2021", endDate: "2023" },
    { institution: "Prestige Institute of Management and Research, Indore", degree: "Bachelor of Computer Applications (BCA)", startDate: "2017", endDate: "2020" },
  ],
  skills: [
    "GCP",
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
};
