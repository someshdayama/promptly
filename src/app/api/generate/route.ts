import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { rateLimit } from '@/utils/rateLimit';

export const maxDuration = 60;

import { SOMESH_PROFILE } from '@/data/someshProfile';

const resumeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    personalInfo: {
      type: SchemaType.OBJECT,
      properties: {
        fullName: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        location: { type: SchemaType.STRING },
        linkedinUrl: { type: SchemaType.STRING },
      },
      required: ['fullName', 'email'],
    },
    summary: { type: SchemaType.STRING },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING },
          position: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          description: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ['company', 'position', 'startDate', 'endDate', 'description'],
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
        },
        required: ['institution', 'degree', 'startDate', 'endDate'],
      },
    },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ['personalInfo', 'summary', 'experience', 'education', 'skills'],
} as Schema;

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const { success, limit, remaining, reset } = rateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${reset} seconds.` },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
          },
        }
      );
    }

    const body = await req.json();
    const { prompt, jobContext, candidateProfile } = body;

    if (!prompt && !jobContext) {
      return NextResponse.json({ error: 'Prompt or Job Context is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
        temperature: 0.1,
      },
    });

    let finalPrompt: string;
    let systemInstruction: string;

    const activeProfile = candidateProfile || SOMESH_PROFILE;

    if (jobContext) {
      // JOB-TAILORED MODE: very specific instructions per role
      // If a custom prompt was entered by the user, we supply it as the candidate source text.
      // Otherwise, we use the active profile JSON.
      const candidateSourceText = prompt
        ? `CANDIDATE SOURCE PROFILE (Raw Text):\n${prompt}`
        : `CANDIDATE DATA JSON:\n${JSON.stringify(activeProfile)}`;

      finalPrompt = `
TARGET JOB:
Title: ${jobContext.title}
Company: ${jobContext.company}
Location: ${jobContext.location || 'India'}
Job Description / Context: ${jobContext.description || 'Not provided'}

${candidateSourceText}
`.trim();

      systemInstruction = `
You are a world-class executive resume writer and career coach. Your task is to produce a highly TAILORED resume JSON matching the provided schema for the candidate applying to the TARGET JOB.

MANDATORY RULES — Follow each one precisely:

1. TRUTH & INTEGRITY: Extract real data from the CANDIDATE SOURCE. Do NOT invent new experiences, companies, metrics, schools, or credentials. Maintain 100% factual accuracy.

2. PROFESSIONAL SUMMARY: Write a highly compelling, 2-3 sentence executive summary that:
   - Explicitly names the target company ("${jobContext.company}") and target role ("${jobContext.title}").
   - Synthesizes the candidate's most relevant background, emphasizing their unique value proposition for this exact role.
   - Integrates core keywords from the job description naturally.

3. EXPERIENCE OPTIMIZATION: For EVERY single work experience entry (Do NOT omit any jobs):
   - Select or rewrite the 2-4 most relevant bullet points to strongly align with the target role.
   - Use the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]) or STAR method, leveraging existing metrics.
   - Begin every bullet point with a strong, high-impact action verb.
   - Contextual Tailoring:
     * If the job leans Cloud/Infrastructure: Emphasize provisioning (GCP/AWS/Azure), IaC (Terraform), and containerization (K8s/Docker).
     * If the job leans SRE/DevOps: Highlight CI/CD efficiency, MTTR reduction, automation, and reliability.
     * If the job leans Software Engineering: Focus on core development, system design, and cross-functional delivery.
     * If the job leans Leadership/RTE: Showcase stakeholder management, unblocking teams, and release orchestration.
   - Never fabricate data. If metrics do not exist in the source, focus on the qualitative impact and technical scope.

4. SKILLS CURATION: Reorder the skills array so the absolute most relevant technical and soft skills for "${jobContext.title}" appear first. Filter out irrelevant skills if the list is too long (keep max 15-20).

5. FORMAT & SCHEMA: Adhere strictly to the requested JSON schema. Validate that all dates, company names, and contact details match the input.
      `.trim();
    } else {
      // GENERIC MODE: parse raw text prompt into structured resume
      finalPrompt = prompt;
      systemInstruction = `
You are a world-class executive resume writer and parser.
Your task is to take raw, unstructured candidate text and structure it into a clean, professional JSON format matching the exact schema provided.

CRITICAL INSTRUCTIONS:
1. Extract and include EVERY single work experience, education, and skill listed in the input. Do NOT omit or consolidate anything.
2. If a professional summary is missing, write a compelling 2-3 sentence summary that highlights the candidate's core strengths based on their experience.
3. Enhance the bullet points to be action-oriented, starting with strong verbs. Maintain all existing metrics and factual data; do NOT fabricate information.
4. Output ONLY valid JSON.
      `.trim();
    }

    const fullPrompt = `${systemInstruction}\n\n${finalPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const outputText = result.response.text();

    if (!outputText) {
      throw new Error('No output generated from Gemini');
    }

    // Gemini with responseMimeType: 'application/json' returns clean JSON directly
    const parsedData = JSON.parse(outputText);

    return NextResponse.json({ data: parsedData });
  } catch (error: unknown) {
    console.error('Error generating resume data:', error);

    const err = error as { message?: string; status?: number };
    let errorMessage = err?.message || 'Failed to generate resume data.';

    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || err?.status === 429) {
      errorMessage = 'Gemini API quota exceeded. Please try again in a moment.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
