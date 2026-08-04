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
      model: 'gemini-2.5-flash',
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
      // JOB-TAILORED MODE: High-impact ATS tailoring engine
      const candidateSourceText = prompt
        ? `CANDIDATE SOURCE PROFILE (Raw Text / CV):\n${prompt}`
        : `CANDIDATE DATA JSON:\n${JSON.stringify(activeProfile)}`;

      const targetTitle = jobContext.title && jobContext.title !== "Target Role" ? jobContext.title : "the target role";
      const targetCompany = jobContext.company && jobContext.company !== "Target Company" ? jobContext.company : "the target company";

      finalPrompt = `
TARGET JOB CONTEXT:
Provided Title: ${jobContext.title || 'Unspecified'}
Provided Company: ${jobContext.company || 'Unspecified'}
Provided Location: ${jobContext.location || 'India'}
Full Job Description: ${jobContext.description || 'See source text'}

${candidateSourceText}
`.trim();

      systemInstruction = `
You are an elite executive resume writer, ATS optimization strategist, and tech recruiter.
Your task is to transform the candidate's background into a world-class, ATS-optimized resume JSON matching the exact schema provided, specifically tailored for ${targetTitle} at ${targetCompany}.

CORE OPTIMIZATION RULES — Follow each precisely:

1. DYNAMIC JOB & COMPANY MATCHING:
   - Analyze the target job description to extract the exact role title, target company name, core technical keywords, required skills, and domain focus.
   - Use the extracted target company name and role title in the professional summary if they are clear from context.

2. ATS KEYWORD OPTIMIZATION & RELEVANCE:
   - Identify the top high-frequency technical keywords, frameworks, tools, and methodologies in the job description.
   - Inject these matching keywords naturally into the Summary, Work Experience bullets, and Skills array.

3. HIGH-IMPACT BULLET POINT REWRITING (Google XYZ Formula):
   - For EVERY work experience entry, rewrite bullet points using the XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".
   - Begin EVERY bullet point with a powerful active verb (e.g., Spearheaded, Architected, Engineered, Optimized, Orchestrated, Automated, Reduced).
   - Retain 100% of existing quantitative metrics (percentages, cost savings, downtime reductions, team sizes). If metrics are absent, highlight technical complexity, scale, and business impact.
   - Never fabricate non-existent companies, degrees, dates, or credentials.

4. EXECUTIVE PROFESSIONAL SUMMARY:
   - Draft a crisp 2-3 sentence executive summary tailored for the target job.
   - Explicitly highlight core competencies, key metrics, and value proposition for the target role.

5. SKILLS CURATION & ORDERING:
   - Reorder the skills array so the technical and soft skills most relevant to the target job description appear FIRST.
   - Retain all authentic skills from the candidate profile.

6. STRICT SCHEMA ADHERENCE:
   - Return valid JSON matching the schema. Ensure fullName, email, phone, location, linkedinUrl, experience, education, and skills are populated cleanly.
`.trim();
    } else {
      // GENERIC MODE: Parse & optimize raw text into structured resume JSON
      finalPrompt = prompt;
      systemInstruction = `
You are a world-class executive resume writer and ATS parser.
Your task is to parse raw candidate text and structure it into a clean, highly polished JSON format matching the schema provided.

INSTRUCTIONS:
1. Extract all personal contact info (name, email, phone, location, LinkedIn URL) accurately.
2. Extract and preserve EVERY work experience, job title, company, start/end dates, education, and skill.
3. Enhance work experience bullet points to start with strong active verbs (e.g. Engineered, Spearheaded, Optimized, Automated) while preserving all facts and metrics.
4. Craft a compelling 2-3 sentence professional summary highlighting core engineering strengths.
5. Return ONLY valid JSON matching the schema.
`.trim();
    }

    const fullPrompt = `${systemInstruction}\n\n${finalPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const outputText = result.response.text();

    if (!outputText) {
      throw new Error('No output generated from AI');
    }

    // Clean JSON response string (strip markdown code fences if present)
    const cleanedText = outputText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ data: parsedData });
  } catch (error: unknown) {
    console.error('Error generating resume data:', error);

    const err = error as { message?: string; status?: number };
    let errorMessage = err?.message || 'Failed to generate resume data.';

    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || err?.status === 429) {
      errorMessage = 'API quota exceeded. Please try again in a moment.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
