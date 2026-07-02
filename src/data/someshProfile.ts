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
    "Site Reliability Engineer with 3+ years of experience specializing in automated cloud infrastructure, container orchestration, and resilient CI/CD pipelines. Proven track record of managing high-availability environments on AWS, GCP, and Azure, optimizing cloud costs, and building automated failover architectures.",
  experience: [
    {
      company: "NCR Atleos Corporation",
      position: "Site Reliability / DevOps Engineer",
      startDate: "Feb 2025",
      endDate: "Present",
      description: [
        "Orchestrated end-to-end product releases and automated deployment lifecycles for ATM Management Platform Services (AMPS) to ensure highly secure, compliant, and zero-downtime releases.",
        "Architected and maintained robust GitHub Actions workflows and CI/CD pipelines, streamlining code validation, artifact management, and multi-environment cloud deployments.",
        "Automated release procedures, health checks, and pipeline triggers, minimizing human intervention and deployment risk.",
        "Spearheaded DevOps alignment across development groups to standardize infrastructure provisioning, reduce technical debt, and ensure 99.9% system availability.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Software Engineer (SRE / Cloud)",
      startDate: "May 2023",
      endDate: "Feb 2025",
      description: [
        "Cloud Optimization: Engineered data-driven resource allocation strategies and custom autoscaling scripts on GCP, slashing infrastructure costs by 34.56% through precision instance rightsizing and automated resource cleanup.",
        "High Availability & Disaster Recovery: Designed and implemented automated database maintenance playbooks and robust failover architectures using Terraform and Ansible, reducing database-related production incidents by 24%.",
        "Environment Provisioning: Built and managed reproducible, dynamically scalable staging and production environments using Terraform for the flagship Authentic Switch transactional system.",
      ],
    },
    {
      company: "Monocept Consulting Pvt. Ltd.",
      position: "Trainee Software Engineer",
      startDate: "Jan 2023",
      endDate: "Apr 2023",
      description: [
        "Jenkins Pipeline Automation: Architected and automated complex, script-driven Jenkins pipelines for the high-traffic Domino's application (Jubilant Foods), eliminating manual release tasks and cutting deployment cycle times.",
        "Environment Provisioning: Managed complex Linux virtual environments and harnessed core AWS services (EC2, VPC, S3) to provision elastic, isolated staging environments for cross-functional product teams.",
      ],
    },
  ],

  education: [
    { 
      institution: "National Institute of Technology (NIT), Bhopal", 
      degree: "Master of Computer Applications (MCA) - CGPA: 8.00/10", 
      startDate: "2021", 
      endDate: "2023" 
    },
    { 
      institution: "Prestige Institute of Management and Research, Indore", 
      degree: "Bachelor of Computer Applications (BCA) - CGPA: 8.14/10", 
      startDate: "2017", 
      endDate: "2020" 
    },
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
