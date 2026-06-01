import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { rateLimit } from '@/utils/rateLimit';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export const maxDuration = 60;

import { SOMESH_PROFILE } from '@/data/someshProfile';

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
        linkedinUrl: { type: "STRING" }
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
        required: ["company", "position", "startDate", "endDate", "description"]
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
        required: ["institution", "degree", "startDate", "endDate"]
      }
    },
    skills: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["personalInfo", "summary", "experience", "education", "skills"]
};

function cleanAndParseJSON(text: string) {
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }
  try {
    return JSON.parse(cleanText);
  } catch {
    // Strip trailing commas from objects/arrays
    const cleaned = cleanText.replace(/,(\s*[\]}])/g, '$1');
    return JSON.parse(cleaned);
  }
}

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
          }
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

    let finalPrompt: string;
    let systemInstruction: string;

    const activeProfile = candidateProfile || SOMESH_PROFILE;

    if (jobContext) {
      // JOB-TAILORED MODE: very specific instructions per role
      // If a custom prompt was entered by the user, we supply it as the candidate source text.
      // Otherwise, we use the active profile JSON.
      const candidateSourceText = prompt ? `CANDIDATE SOURCE PROFILE (Raw Text):\n${prompt}` : `CANDIDATE DATA JSON:\n${JSON.stringify(activeProfile)}`;

      finalPrompt = `
TARGET JOB:
Title: ${jobContext.title}
Company: ${jobContext.company}
Location: ${jobContext.location || 'India'}
Job Description / Context: ${jobContext.description || 'Not provided'}

${candidateSourceText}
`.trim();

      systemInstruction = `
You are an expert resume writer. Your job is to produce a TAILORED resume JSON matching the schema for the candidate applying to the specific TARGET JOB.

MANDATORY RULES — follow each one precisely:

1. CANDIDATE PROFILE: Read the CANDIDATE SOURCE PROFILE or CANDIDATE DATA JSON carefully. Extract their real name, email, phone, location, LinkedIn, work experience (companies, roles, dates, bullets), education, and skills. Do NOT invent new experiences, schools, or credentials.

2. SUMMARY: Write a compelling 2-3 sentence professional summary that:
   - Mentions the company name "${jobContext.company}" and target role "${jobContext.title}" explicitly.
   - Highlights only the experience or skills most relevant to this specific role.
   - Uses keywords from the job title and description.

3. EXPERIENCE BULLETS: For EACH work experience entry:
   - Select or rewrite the 2-3 most relevant bullet points to align with "${jobContext.title}".
   - Front-load keywords from the target job context.
   - If the job is cloud-heavy: emphasize cloud engineering (e.g. GCP/AWS/Azure, Terraform, Kubernetes).
   - If the job is SRE/reliability: emphasize MTTR, incident response, system uptime, and monitoring.
   - If the job is CI/CD/DevOps: emphasize pipeline efficiency, test automation, and release flows.
   - If the job is leadership-heavy: emphasize leadership, coordination, and team size/outcomes.
   - Do NOT fabricate achievements or metrics not supported by the candidate's input.
   - CRITICAL: You MUST include EVERY single job/experience listed in the input text. Do not drop older or less relevant jobs.

4. SKILLS: Reorder the skills array so the most relevant skills to "${jobContext.title}" appear first.

5. Keep all dates, company names, and personal contact details completely factual based on the candidate's input.
      `.trim();

    } else {
      // GENERIC MODE: parse raw text prompt into structured resume
      finalPrompt = prompt;
      systemInstruction = `
You are an expert resume parser and writer.
The user will provide raw, unstructured text containing their work history, education, skills, and personal details.
Structure this data into a clean, professional JSON format matching the schema.

CRITICAL INSTRUCTION: You MUST extract and include EVERY single work experience listed in the input. Do NOT omit, drop, or consolidate any jobs, even if they seem less relevant or older.

Write a compelling 2-3 sentence professional summary if one is not given.
Make bullet points action-oriented with quantified outcomes where possible.
      `.trim();
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
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
  } catch (error: unknown) {
    console.error('Error generating resume data:', error);
    
    // Extract the Gemini API error message if it exists
    const err = error as { message?: string; status?: number };
    let errorMessage = err?.message || 'Failed to generate resume data.';
    
    if (errorMessage.includes('quota') || err?.status === 429) {
      errorMessage = "Gemini API free tier quota exceeded. Please try again in a minute, or update your API key in .env.local.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
