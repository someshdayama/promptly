import { ResumeData } from "@/types/resume";

/** Separate keys for what you typed and for the resume you edited. */
export const STORAGE = {
  notes: "promptly.notes.v2",
  jobPost: "promptly.jobPost.v2",
  resume: "promptly.resume.v2",
  prefs: "promptly.prefs.v2",
} as const;

/** Keys used before v2. The old notes key could hold the example resume instead of your notes. */
export const LEGACY = {
  notes: "promptly_saved_prompt",
  jobPost: "promptly_saved_job_desc",
  resume: "promptly_saved_resume",
  prefs: "promptly_preview_prefs",
  builderOpen: "promptly_builder_open",
} as const;

export const isResumeData = (value: unknown): value is ResumeData => {
  const v = value as ResumeData;
  return !!v && typeof v === "object" && !!v.personalInfo && typeof v.personalInfo === "object" && Array.isArray(v.experience);
};

/** Text written by the old app from a resume (not typed by a person) starts like this. */
export const looksGenerated = (text: string) => /^My name is .*\. I am based in /.test(text.trim());

export interface Saved {
  notes: string;
  jobPost: string;
  resume: ResumeData | null;
  prefs: { template?: string; pageSize?: string; spacing?: string };
}

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

/**
 * Loads saved work. Migrates old notes only when they were typed by a person,
 * never migrates the old resume (it may be the old built-in example), then
 * removes all old keys.
 */
export function loadSaved(): Saved {
  const out: Saved = { notes: "", jobPost: "", resume: null, prefs: {} };

  const notes = read(STORAGE.notes);
  const legacyNotes = read(LEGACY.notes);
  if (notes !== null) out.notes = notes;
  else if (legacyNotes && !looksGenerated(legacyNotes)) out.notes = legacyNotes;

  const job = read(STORAGE.jobPost);
  out.jobPost = job !== null ? job : read(LEGACY.jobPost) || "";

  try {
    const parsed = JSON.parse(read(STORAGE.resume) || "null");
    if (isResumeData(parsed)) out.resume = parsed;
  } catch {
    /* ignore corrupt data */
  }

  try {
    out.prefs = JSON.parse(read(STORAGE.prefs) || read(LEGACY.prefs) || "{}") || {};
  } catch {
    out.prefs = {};
  }

  try {
    if (notes === null) localStorage.setItem(STORAGE.notes, out.notes);
    if (job === null) localStorage.setItem(STORAGE.jobPost, out.jobPost);
    [LEGACY.notes, LEGACY.jobPost, LEGACY.resume, LEGACY.prefs].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem(LEGACY.builderOpen);
  } catch {
    /* ignore */
  }
  return out;
}
