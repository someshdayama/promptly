import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/utils/rateLimit';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
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

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY is not configured on the server.' },
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

    const fullSystemInstruction = systemInstruction + `\n\nYou MUST return ONLY valid JSON matching this schema:\n${JSON.stringify(resumeSchema, null, 2)}\n\nDo not include any other text, markdown formatting, or explanations. Just the JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: fullSystemInstruction },
        { role: 'user', content: finalPrompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const outputText = response.choices[0]?.message?.content;

    if (!outputText) {
      throw new Error('No output generated from Deepseek');
    }

    const parsedData = cleanAndParseJSON(outputText);

    return NextResponse.json({ data: parsedData });
  } catch (error: unknown) {
    console.error('Error generating resume data:', error);
    
    // Extract the API error message if it exists
    const err = error as { message?: string; status?: number };
    let errorMessage = err?.message || 'Failed to generate resume data.';
    
    if (errorMessage.includes('quota') || errorMessage.includes('balance') || err?.status === 429) {
      errorMessage = "Deepseek API quota/balance exceeded. Please try again in a minute, or update your API key in .env.local.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
