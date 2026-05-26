import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export const maxDuration = 60;

// Somesh's real resume — the factual source of truth. Never fabricate beyond this.
const SOMESH_PROFILE = {
  personalInfo: {
    fullName: 'Somesh Dayama',
    email: 'someshdayama2@gmail.com',
    phone: '7049614849',
    location: 'Mumbai, India',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    portfolioUrl: 'https://portfolio.com',
  },
  experience: [
    {
      company: 'NCR Atleos Corporation',
      position: 'Software Engineer',
      startDate: 'Feb 2025',
      endDate: 'Present',
      bullets: [
        'Release Train Engineer (RTE): Managed release lifecycles and cross-functional CI/CD coordination for the AMP Services Product on Azure, aligning delivery timelines and mitigating operational risks.',
        'Scrum Master: Facilitated agile ceremonies and cleared blockers for an 11-member engineering squad, driving sprint predictability and process optimization.',
        'Incident Response & Release Lead: Functioned as primary Incident Commander for mission-critical production outages, architecting coordination strategies between Dev and Ops teams to significantly reduce Mean Time to Resolution.',
        'DevOps Orchestration: Spearheaded infrastructure provisioning and environment setup using GCP (GKE, Compute Engine), utilizing Jenkins, Helm, and Ansible to maintain high availability and deployment velocity.',
        'Infrastructure Optimization: Conducted self-initiated legacy upgrades and drift detection, successfully maintaining zero configuration drift across multi-cloud environments.',
      ],
    },
    {
      company: 'Monocept Consulting Pvt. Ltd.',
      position: 'Software Engineer',
      startDate: 'May 2023',
      endDate: 'Feb 2025',
      bullets: [
        'FinOps & Cost Optimization: Developed automated scripts and engineered resource allocation strategies on GCP, delivering a 34.56% reduction in cloud infrastructure costs via precision instance rightsizing and auto-scaling.',
        'Database Reliability: Architected automated database maintenance blueprints and failover strategies utilizing Terraform and Ansible, decreasing database-related production incidents by 24%.',
        'Infrastructure as Code (IaC): Orchestrated environment deployment for the Authentic Switch application across production and staging GCP environments using Terraform, establishing fully reproducible, scalable infrastructure.',
      ],
    },
    {
      company: 'Monocept Consulting Pvt. Ltd.',
      position: 'Trainee Software Engineer',
      startDate: 'Jan 2023',
      endDate: 'Apr 2023',
      bullets: [
        'CI/CD Automation: Automated Jenkins-based deployment pipelines for the flagship Domino’s App (Jubilant Foods), radically minimizing manual interventions and reducing deployment cycle times.',
        'Cloud Provisioning: Managed Linux virtual environments and leveraged AWS core services to dynamically provision scalable staging environments for cross-functional development teams.',
      ],
    },
  ],
  projects: [
    {
      name: 'Velocity',
      description: 'Developed a high-performance network diagnostic and credit monitoring tool hosted on Netlify, focusing on low-latency network telemetry and automated diagnostic reporting.',
    },
    {
      name: 'Promptly',
      description: 'Architected a privacy-focused, AI-driven resume builder application, implementing local model optimizations to securely generate tailored professional profiles without external data leaks.',
    },
  ],
  education: [
    { institution: 'National Institute of Technology (NIT), Bhopal', degree: 'Master of Computer Applications (MCA)', startDate: '', endDate: '2023' },
    { institution: 'Prestige Institute of Management and Research, Indore', degree: 'Bachelor of Computer Applications (BCA)', startDate: '', endDate: '2020' },
  ],
  allSkills: [
    'GCP (Compute Engine, GKE, Cloud SQL, IAM, VPC)', 'AWS', 'Azure',
    'Terraform', 'Ansible', 'Docker', 'Kubernetes (GKE)', 'Helm', 'Jenkins', 'GitHub Actions',
    'Java', 'Python', 'Groovy', 'Bash', 'Linux Shell', 'SQL',
    'Prometheus', 'Grafana',
    'System Design', 'Agile/Scrum', 'Git', 'JIRA', 'Maven',
    'English', 'Hindi'
  ],
};

const resumeSchema = {
  type: "OBJECT",
  properties: {
    personalInfo: {
      type: "OBJECT",
      properties: {
        fullName: { type: "STRING" },
        email: { type: "STRING" },
        phone: { type: "STRING" },
        location: { type: "STRING" },
        linkedinUrl: { type: "STRING" },
        githubUrl: { type: "STRING" },
        portfolioUrl: { type: "STRING" }
      },
      required: ["fullName", "email"]
    },
    summary: { type: "STRING" },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          company: { type: "STRING" },
          position: { type: "STRING" },
          startDate: { type: "STRING" },
          endDate: { type: "STRING" },
          description: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["company", "position", "description"]
      }
    },
    projects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          description: { type: "STRING" }
        },
        required: ["name", "description"]
      }
    },
    education: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          institution: { type: "STRING" },
          degree: { type: "STRING" },
          startDate: { type: "STRING" },
          endDate: { type: "STRING" }
        },
        required: ["institution", "degree"]
      }
    },
    skills: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["personalInfo", "summary", "experience", "projects", "education", "skills"]
};

function cleanAndParseJSON(text: string) {
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }
  return JSON.parse(cleanText);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, jobContext } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    let finalPrompt: string;
    let systemInstruction: string;

    if (jobContext) {
      // JOB-TAILORED MODE: very specific instructions per role
      const expJson = JSON.stringify(SOMESH_PROFILE.experience.map(e => ({
        company: e.company,
        position: e.position,
        startDate: e.startDate,
        endDate: e.endDate,
        allBullets: e.bullets,
      })));

      finalPrompt = `
TARGET JOB:
Title: ${jobContext.title}
Company: ${jobContext.company}
Location: ${jobContext.location || 'India'}
Job Description / Context: ${jobContext.description || 'Not provided'}

CANDIDATE DATA (factual, do not invent anything beyond this):
${JSON.stringify(SOMESH_PROFILE.personalInfo)}

Work Experience (choose and rewrite the most relevant bullets per role):
${expJson}

Projects (factual, do not invent projects):
${JSON.stringify(SOMESH_PROFILE.projects)}

All Available Skills: ${SOMESH_PROFILE.allSkills.join(', ')}

Education: ${JSON.stringify(SOMESH_PROFILE.education)}
`.trim();

      systemInstruction = `
You are an expert resume writer. Your job is to produce a TAILORED resume JSON for the candidate applying to the specific TARGET JOB above.

MANDATORY RULES — follow each one precisely:

1. SUMMARY: Write a 2-3 sentence professional summary that:
   - Mentions the company name "${jobContext.company}" and target role "${jobContext.title}" explicitly.
   - Highlights only the experience most relevant to this specific role.
   - Uses keywords from the job title and description.

2. EXPERIENCE BULLETS: For EACH work experience entry, you MUST:
   - Select only the 2-3 bullet points most relevant to "${jobContext.title}" role.
   - Rewrite them to front-load keywords from the job description.
   - If the job is cloud-heavy: emphasise GCP/AWS/Azure, Terraform, Kubernetes.
   - If the job is SRE/reliability: emphasise MTTR, incident management, availability, monitoring.
   - If the job is CI/CD/DevOps: emphasise Jenkins, Helm, Ansible, pipeline speed.
   - If the job is release/program management: emphasise release coordination, squad management, stakeholder communication.
   - NEVER fabricate new bullet points — only select and reword from the provided bullets.

3. PROJECTS: Include the projects exactly as provided, but you may rephrase or emphasize aspects matching the target job description if appropriate.

4. SKILLS: Reorder the skills array so the most relevant skills to "${jobContext.title}" appear first.

5. Do NOT change any dates, company names, or personal info.
      `.trim();

    } else {
      // GENERIC MODE: parse raw text prompt into structured resume
      finalPrompt = prompt;
      systemInstruction = `
You are an expert resume parser and writer.
The user will provide raw, unstructured text containing their work history, education, skills, projects, and personal details.
Structure this data into a clean, professional JSON format matching the schema.

Write a compelling 2-3 sentence professional summary if one is not given.
Make bullet points action-oriented with quantified outcomes where possible.
      `.trim();
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
      },
    });

    const outputText = response.text;

    if (!outputText) {
      throw new Error('No output generated from Gemini');
    }

    const parsedData = cleanAndParseJSON(outputText);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error('Error generating resume data:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume data.' },
      { status: 500 }
    );
  }
}
