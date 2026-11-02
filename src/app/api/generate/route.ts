import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/utils/rateLimit";
import { LIMITS, validateGenerateBody } from "@/utils/generateRequest";
import { cleanResume } from "@/utils/cleanResume";
import { SYSTEM_INSTRUCTION, buildUserPrompt, resumeSchema } from "./prompt";

export const maxDuration = 60;

const MODEL = "gemini-2.5-flash";

const fail = (status: number, error: string, headers?: Record<string, string>) =>
  NextResponse.json({ error }, { status, headers });

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "local";

  const { success, limit, remaining, reset } = rateLimit(ip);
  if (!success) {
    return fail(429, `Too many tries. Please wait ${reset} seconds and try again.`, {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
      "Retry-After": String(reset),
    });
  }

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > LIMITS.bodyBytes) return fail(413, "That is too much text. Please shorten it.");

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > LIMITS.bodyBytes) return fail(413, "That is too much text. Please shorten it.");
    body = JSON.parse(raw);
  } catch {
    return fail(400, "Send your notes as JSON.");
  }

  const checked = validateGenerateBody(body);
  if (!checked.ok) return fail(checked.status, checked.error);

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return fail(500, "The resume writer is not set up right now. Please try again later.");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.1,
      },
    });

    const result = await model.generateContent(buildUserPrompt(checked.input));
    const text = result.response.text();
    if (!text) throw new Error("Empty response from the model");

    const json = JSON.parse(text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim());
    return NextResponse.json({ data: cleanResume(json) });
  } catch (error: unknown) {
    console.error("Resume generation failed:", error);
    const err = error as { message?: string; status?: number };
    const message = err?.message || "";
    if (err?.status === 429 || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return fail(503, "The resume writer is busy. Please try again in a minute.");
    }
    return fail(500, "Could not make your resume this time. Please try again.");
  }
}
