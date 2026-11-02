import { ResumeData } from "@/types/resume";

/**
 * A made-up person used by "Try an example". Every name, company, school,
 * email, phone number and link here is fictional.
 */
export const EXAMPLE_PROFILE: ResumeData = {
  personalInfo: {
    fullName: "Maya Fernandes",
    email: "maya.fernandes@example.com",
    phone: "+91 90000 00000",
    location: "Pune, India",
    linkedinUrl: "https://www.linkedin.com/in/maya-fernandes-example/",
    portfolioUrl: "https://maya.example.com/",
  },
  summary:
    "Backend engineer with 5 years of experience building payment APIs and the cloud systems behind them on AWS and GCP. Led a team of 4, moved a monolith to 12 services, and kept checkout running at 99.95% uptime.",
  skillGroups: [
    { category: "Languages", items: ["Go", "Python", "TypeScript", "SQL"] },
    { category: "Cloud", items: ["AWS", "GCP"] },
    { category: "Containers & IaC", items: ["Kubernetes", "Docker", "Terraform"] },
    { category: "Data", items: ["PostgreSQL", "Redis", "Kafka"] },
    { category: "Monitoring", items: ["Prometheus", "Grafana"] },
  ],
  skills: [
    "Go", "Python", "TypeScript", "SQL",
    "AWS", "GCP",
    "Kubernetes", "Docker", "Terraform",
    "PostgreSQL", "Redis", "Kafka",
    "Prometheus", "Grafana",
  ],
  experience: [
    {
      company: "Kestrel Pay Pvt. Ltd.",
      position: "Senior Backend Engineer",
      startDate: "Mar 2023",
      endDate: "Present",
      description: [
        "Lead a team of 4 engineers that owns the checkout and refunds APIs, handling 1.2M payments a day.",
        "Moved the payments monolith to 12 Go services on Kubernetes over 9 months with no customer-facing downtime.",
        "Cut p95 checkout latency from 480 ms to 190 ms by adding Redis caching and fixing slow PostgreSQL queries.",
        "Set up Prometheus alerts and on-call runbooks for 12 services, bringing uptime from 99.8% to 99.95%.",
      ],
    },
    {
      company: "Kestrel Pay Pvt. Ltd.",
      position: "Backend Engineer",
      startDate: "Jul 2021",
      endDate: "Feb 2023",
      note: "promoted to Senior Backend Engineer",
      description: [
        "Built the refunds service in Go, now used by 3,000 merchants.",
        "Wrote Terraform for 3 AWS environments, replacing manual setup that took 2 days per environment.",
      ],
    },
    {
      company: "Bluefin Software",
      position: "Software Engineer",
      startDate: "Jun 2020",
      endDate: "Jun 2021",
      description: [
        "Built Python data pipelines on Kafka that fed reports to 40 retail clients.",
        "Added integration tests to 5 services, cutting release bugs by about a third.",
      ],
    },
  ],
  education: [
    {
      institution: "Western Ghats Institute of Technology",
      degree: "B.Tech in Computer Engineering",
      startDate: "2016",
      endDate: "2020",
      details: "CGPA: 8.4/10",
    },
  ],
  certifications: ["AWS Certified Developer – Associate"],
};
