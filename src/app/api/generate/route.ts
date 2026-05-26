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
    linkedinUrl: '',
    portfolioUrl: '',
  },
  experience: [
    {
      company: 'NCR Atleos Corporation',
      position: 'DevOps Engineer / Release Lead',
      startDate: 'Feb 2025',
      endDate: 'Present',
      bullets: [
        'Managed release lifecycles and CI/CD coordination for an 11-member engineering squad on the AMP Services Product in Azure.',
        'Acted as primary Incident Commander for production outages, coordinating Dev and Ops teams to significantly reduce Mean Time to Resolution (MTTR).',
        'Orchestrated end-to-end cloud infrastructure using GCP (GKE, Compute Engine).',
        'Maintained and optimised CI/CD pipelines using Jenkins, Helm, and Ansible, ensuring high availability and deployment frequency.',
        'Led self-initiated legacy infrastructure upgrades and drift detection using Terraform, ensuring zero configuration drift.',
      ],
    },
    {
      company: 'Monocept Consulting Pvt. Ltd.',
      position: 'Software Engineer / Cloud & SRE',
      startDate: 'May 2023',
      endDate: 'Feb 2025',
      bullets: [
        'FinOps: Achieved a 34.56% reduction in GCP cloud infrastructure costs by rightsizing instances and implementing auto-scaling policies.',
        'Database Reliability: Reduced database-related production incidents by 24% using automated maintenance and failover strategies with Terraform and Ansible.',
        'Infrastructure as Code: Deployed the "Authentic Switch" application across multiple GCP environments using Terraform, ensuring reproducible and scalable infrastructure provisioning.',
      ],
    },
    {
      company: 'Monocept Consulting Pvt. Ltd.',
      position: 'Trainee Software Engineer',
      startDate: 'Jan 2023',
      endDate: 'Apr 2023',
      bullets: [
        'Automated Jenkins-based deployment pipelines for the Domino\'s App (Jubilant Foods), reducing manual deployment time.',
        'Managed Linux VMs and utilised AWS services to provision scalable testing environments.',
      ],
    },
  ],
  education: [
    { institution: 'National Institute of Technology, Bhopal', degree: 'Master of Computer Applications (MCA)', startDate: '2020', endDate: '2022' },
    { institution: 'Prestige Institute of Management and Research, Indore', degree: 'Bachelor of Computer Applications (BCA)', startDate: '2017', endDate: '2020' },
  ],
  allSkills: ['GCP', 'AWS', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'Jenkins', 'Helm', 'GitHub Actions', 'Prometheus', 'Grafana', 'Python', 'Java', 'Bash', 'SQL', 'Groovy', 'Linux', 'Scrum (CSM)', 'JIRA', 'CI/CD', 'IaC', 'Incident Management', 'Release Management', 'FinOps', 'SRE'],
};

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
      // Pick 3 bullets from each experience that best match the target role
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

3. SKILLS: Reorder the skills array so the most relevant skills to "${jobContext.title}" appear first.

4. Do NOT change any dates, company names, or personal info.

Respond ONLY with valid JSON in exactly this schema — no markdown, no explanation:
{
  "personalInfo": { "fullName": "...", "email": "...", "phone": "...", "location": "...", "linkedinUrl": "...", "portfolioUrl": "..." },
  "summary": "...",
  "experience": [ { "company": "...", "position": "...", "startDate": "...", "endDate": "...", "description": ["bullet 1", "bullet 2"] } ],
  "education": [ { "institution": "...", "degree": "...", "startDate": "...", "endDate": "..." } ],
  "skills": ["most relevant first", "..."]
}
      `.trim();

    } else {
      // GENERIC MODE: parse raw text prompt into structured resume
      finalPrompt = prompt;
      systemInstruction = `
You are an expert resume parser and writer.
The user will provide raw, unstructured text containing their work history, education, skills, and personal details.
Structure this data into a clean, professional JSON format.

Respond ONLY with valid JSON matching the following schema:
{
  "personalInfo": { "fullName": "...", "email": "...", "phone": "...", "location": "...", "linkedinUrl": "...", "portfolioUrl": "..." },
  "summary": "...",
  "experience": [ { "company": "...", "position": "...", "startDate": "...", "endDate": "...", "description": ["bullet point 1", "bullet point 2"] } ],
  "education": [ { "institution": "...", "degree": "...", "startDate": "...", "endDate": "..." } ],
  "skills": ["skill 1", "skill 2"]
}

Write a compelling 2-3 sentence professional summary if one is not given.
Make bullet points action-oriented with quantified outcomes where possible.
No markdown codeblocks. Return raw JSON only.
      `.trim();
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text;

    if (!outputText) {
      throw new Error('No output generated from Gemini');
    }

    const parsedData = JSON.parse(outputText);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error('Error generating resume data:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume data.' },
      { status: 500 }
    );
  }
}
