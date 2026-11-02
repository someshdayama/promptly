/**
 * Validation for POST /api/generate. Shared limits are also used by the input
 * boxes so people see the cap before the server rejects anything.
 */

export const LIMITS = {
  /** Notes, old resume or LinkedIn text. */
  notes: 15000,
  /** Job post text. */
  jobPost: 8000,
  /** Optional job title / company passed in by a deep link. */
  label: 200,
  /** Whole request body in bytes (JSON). */
  bodyBytes: 40000,
} as const;

export interface GenerateInput {
  notes: string;
  jobPost: string;
  jobTitle: string;
  company: string;
}

export type ValidationResult =
  | { ok: true; input: GenerateInput }
  | { ok: false; status: number; error: string };

const asText = (value: unknown): string | null => {
  if (value === undefined || value === null) return "";
  return typeof value === "string" ? value.trim() : null;
};

export function validateGenerateBody(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "Send your notes as JSON." };
  }
  const b = body as Record<string, unknown>;
  const notes = asText(b.notes);
  const jobPost = asText(b.jobPost);
  const jobTitle = asText(b.jobTitle);
  const company = asText(b.company);

  if (notes === null || jobPost === null || jobTitle === null || company === null) {
    return { ok: false, status: 400, error: "Notes and job post must be plain text." };
  }
  if (!notes) {
    return { ok: false, status: 400, error: "Paste your old resume, LinkedIn, or notes first." };
  }
  if (notes.length > LIMITS.notes) {
    return { ok: false, status: 413, error: `Your notes are too long. Keep them under ${LIMITS.notes.toLocaleString("en-US")} characters.` };
  }
  if (jobPost.length > LIMITS.jobPost) {
    return { ok: false, status: 413, error: `The job post is too long. Keep it under ${LIMITS.jobPost.toLocaleString("en-US")} characters.` };
  }

  return {
    ok: true,
    input: {
      notes,
      jobPost,
      jobTitle: jobTitle.slice(0, LIMITS.label),
      company: company.slice(0, LIMITS.label),
    },
  };
}
