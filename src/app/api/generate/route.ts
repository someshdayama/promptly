import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export const maxDuration = 60; // Set Vercel specific timeout max if deploying

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const systemInstruction = `
      You are an expert resume parser and writer. 
      The user will provide raw, unstructured text containing their work history, education, skills, and personal details.
      Your job is to structure this data into a clean, professional JSON format.
      
      Respond ONLY with valid JSON matching the following schema:
      {
        "personalInfo": {
          "fullName": "...",
          "email": "...",
          "phone": "...",
          "location": "...",
          "portfolioUrl": "..." // optional
        },
        "summary": "...", // Write a compelling 2-3 sentence professional summary based on the provided text if one is not explicitly given.
        "experience": [
          {
            "company": "...",
            "position": "...",
            "startDate": "...", // e.g., "Jan 2020"
            "endDate": "...",   // e.g., "Present" or "Dec 2023"
            "description": ["bullet point 1", "bullet point 2"] // Extract and polish bullet points. Make them action-oriented.
          }
        ],
        "education": [
          {
            "institution": "...",
            "degree": "...",
            "startDate": "...",
            "endDate": "..."
          }
        ],
        "skills": ["skill 1", "skill 2"] // Extract a flat list of technical and soft skills
      }

      Do not include markdown codeblocks (\`\`\`json) in your response, just the raw JSON object. If any data is missing from the user's prompt (e.g., they don't provide an email), just leave the field as an empty string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Keep it relatively deterministic
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text;
    
    if (!outputText) {
        throw new Error("No output generated from Gemini");
    }

    // Try to parse just to validate it is valid JSON before sending to client
    const parsedData = JSON.parse(outputText);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error('Error generating resume data:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume data. Please try again or refine your input.' },
      { status: 500 }
    );
  }
}
