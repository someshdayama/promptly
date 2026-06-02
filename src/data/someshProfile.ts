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
        "Release Train Engineer (RTE): Directed comprehensive release lifecycles and cross-functional CI/CD coordination for the AMP Services Product on Azure, ensuring strict alignment of delivery timelines while mitigating operational deployment risks.",
        "Scrum Master: Orchestrated agile ceremonies and proactively eliminated operational blockers for a high-performing 18-member engineering squad, significantly enhancing sprint predictability and development velocity.",
        "Incident Response & Release Lead: Served as primary Incident Commander during mission-critical production outages, designing and enforcing rapid-response protocols between Dev and Ops teams to drastically reduce Mean Time to Resolution (MTTR).",
        "DevOps Orchestration: Architected robust infrastructure provisioning and automated environment setups across GCP (GKE, Compute Engine) using Jenkins, Helm, and Ansible, ensuring high availability and accelerated deployment cycles.",
        "Infrastructure Optimization: Spearheaded self-initiated legacy system upgrades and automated continuous drift detection, successfully sustaining zero configuration drift across complex multi-cloud environments.",
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
    { institution: "National Institute of Technology (NIT), Bhopal", degree: "Master of Computer Applications (MCA)", startDate: "", endDate: "2023" },
    { institution: "Prestige Institute of Management and Research, Indore", degree: "Bachelor of Computer Applications (BCA)", startDate: "", endDate: "2020" },
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
