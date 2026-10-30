import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { rateLimit } from '@/utils/rateLimit';

export const maxDuration = 60;

import { SOMESH_PROFILE } from '@/data/someshProfile';

/**
 * Writing rules shared by both modes. They steer the model toward plain, specific
 * resumes: role-focused summary, grouped skills, plain verbs, concrete scope,
 * roles at one company kept together, and a one-page length.
 */
const WRITING_RULES = `
WRITING STYLE (apply to every section):
- Summary: 2-4 plain sentences that say what role the candidate does, years of experience, the main tools/platforms, and 1-2 concrete highlights (team size, scale, certifications). No buzzwords ("results-driven", "proven track record", "passionate", "world-class", "dynamic").
- Bullets: start with a plain past- or present-tense verb (Built, Ran, Owned, Cut, Automated, Led, Migrated, Designed). Do NOT use inflated verbs or filler such as "Architected", "Spearheaded", "Orchestrated", "Harnessed", "Leveraged", "Utilized", "Slashed", "robust", "complex", "cutting-edge", "seamless".
- Every bullet should carry concrete scope: a number, team size, users, systems, environments, % or time saved. Keep the candidate's real metrics exactly; never invent numbers. If none exist, name the concrete system, platform or audience instead.
- No "Label: ..." prefixes on bullets (e.g. "Cloud Optimization: ..."). One to two lines per bullet (under ~220 characters).
- Skills: fill "skillGroups" with 4-7 short categories that fit the candidate (for a DevOps/SRE profile e.g. Cloud, CI/CD, Containers & IaC, Monitoring, Languages, Delivery & AI). Also fill the flat "skills" array with the same items. Drop spoken languages and soft skills unless the job needs them.
- Experience: one entry per role, most recent first. Multiple roles at the same company must use the exact same company string and be listed consecutively (newest first); put a short "note" such as "promoted to Software Engineer" on the earlier role when it led to a promotion.
- Education: put GPA/CGPA or honours in "details", not in the degree name.
- Keep personalInfo.linkedinUrl and personalInfo.portfolioUrl (portfolio, GitHub or personal site) when present in the source.
- Certifications go in "certifications".
- Length: the resume must fit on ONE page. Aim for 4-6 bullets for the current role, 2-4 for older roles, and drop the weakest or most repetitive bullets first.
`.trim();

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
        portfolioUrl: { type: SchemaType.STRING },
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
          note: { type: SchemaType.STRING },
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
          details: { type: SchemaType.STRING },
        },
        required: ['institution', 'degree', 'startDate', 'endDate'],
      },
    },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    skillGroups: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING },
          items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ['category', 'items'],
      },
    },
    certifications: {
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

3. BULLET POINT REWRITING:
   - Rewrite bullets to show what was done, for whom/at what scope, and the result, following the WRITING STYLE rules below.
   - Retain 100% of existing quantitative metrics (percentages, cost savings, downtime reductions, team sizes).
   - Never fabricate non-existent companies, degrees, dates, metrics or credentials.

4. PROFESSIONAL SUMMARY:
   - 2-4 plain sentences tailored to the target job: the candidate's role, years of experience, the tools that match the job, and concrete highlights.

5. SKILLS CURATION & ORDERING:
   - Order skill groups (and items within them) so the skills most relevant to the target job appear first.
   - Retain all authentic technical skills from the candidate profile.

6. STRICT SCHEMA ADHERENCE:
   - Return valid JSON matching the schema. Ensure fullName, email, phone, location, linkedinUrl, portfolioUrl, experience, education, skills and skillGroups are populated cleanly.

${WRITING_RULES}
`.trim();
    } else {
      // GENERIC MODE: Parse & optimize raw text into structured resume JSON
      finalPrompt = prompt;
      systemInstruction = `
You are a world-class executive resume writer and ATS parser.
Your task is to parse raw candidate text and structure it into a clean, highly polished JSON format matching the schema provided.

INSTRUCTIONS:
1. Extract all personal contact info (name, email, phone, location, LinkedIn URL, portfolio/GitHub/personal site URL) accurately.
2. Extract and preserve EVERY work experience, job title, company, start/end dates, education, certification and skill.
3. Tighten work experience bullets following the WRITING STYLE rules below, preserving all facts and metrics.
4. Write a 2-4 sentence role-focused professional summary.
5. Return ONLY valid JSON matching the schema.

${WRITING_RULES}
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
