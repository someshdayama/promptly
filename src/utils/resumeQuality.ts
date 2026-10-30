import { ResumeData } from "@/types/resume";
import { getSkillGroups } from "@/utils/skills";

/**
 * Resume quality checks that run locally (no AI call).
 * They nudge users toward plain verbs, concrete scope, and a one-page fit.
 */

export type IssueSeverity = "warning" | "info";

export interface BulletIssue {
  code: "buzzword" | "no-scope" | "too-long" | "weak-opening" | "filler-label";
  message: string;
  severity: IssueSeverity;
}

export interface BulletReport {
  text: string;
  jobIndex: number;
  bulletIndex: number;
  issues: BulletIssue[];
}

export interface ResumeReport {
  bullets: BulletReport[];
  summaryIssues: BulletIssue[];
  /** Total flagged bullets. */
  flaggedCount: number;
  bulletCount: number;
  wordCount: number;
  tips: string[];
}

/** Inflated words that read as filler to recruiters, with a plainer alternative. */
export const BUZZWORDS: Record<string, string> = {
  architected: "designed / built",
  spearheaded: "led",
  orchestrated: "ran / coordinated",
  robust: "(drop it, or say what made it reliable)",
  complex: "(say what made it hard: scale, users, systems)",
  "cutting-edge": "(name the technology)",
  "state-of-the-art": "(name the technology)",
  "world-class": "(show the result instead)",
  synergy: "collaboration",
  synergies: "collaboration",
  leveraged: "used",
  leverage: "use",
  leveraging: "using",
  utilized: "used",
  utilize: "use",
  utilizing: "using",
  harnessed: "used",
  "results-driven": "(show a result instead)",
  "detail-oriented": "(show it instead)",
  "go-getter": "(drop it)",
  "self-starter": "(drop it)",
  "team player": "(show collaboration instead)",
  "hard-working": "(drop it)",
  passionate: "(drop it, or show it)",
  seamless: "smooth",
  seamlessly: "smoothly",
  "best-in-class": "(show the result instead)",
  "proven track record": "(show the record: numbers, scope)",
  "thought leader": "(drop it)",
  "game-changer": "(drop it)",
  "game-changing": "(drop it)",
  revolutionized: "changed / replaced",
  "high-impact": "(show the impact)",
  slashing: "cutting",
  slashed: "cut",
};

const WEAK_OPENINGS = [
  /^responsible for\b/i,
  /^worked on\b/i,
  /^helped( to)?\b/i,
  /^assisted (in|with)\b/i,
  /^involved in\b/i,
  /^duties included\b/i,
  /^tasked with\b/i,
  /^participated in\b/i,
];

/** Numbers, percentages, money, counts, or named scale words count as concrete scope. */
const SCOPE_PATTERN =
  /(\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|dozens?|hundreds?|thousands?|millions?|billions?)\b)/i;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const BUZZWORD_PATTERNS = Object.keys(BUZZWORDS).map((word) => ({
  word,
  pattern: new RegExp(`(^|[^a-z-])${escapeRegex(word)}(?![a-z-])`, "i"),
}));

export const MAX_BULLET_CHARS = 220;

const stripHtml = (s: string) => (s || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

export function findBuzzwords(text: string): string[] {
  const plain = stripHtml(text);
  return BUZZWORD_PATTERNS.filter(({ pattern }) => pattern.test(plain)).map(({ word }) => word);
}

export function analyzeBullet(raw: string): BulletIssue[] {
  const text = stripHtml(raw);
  const issues: BulletIssue[] = [];
  if (!text) return issues;

  const buzz = findBuzzwords(text);
  if (buzz.length > 0) {
    issues.push({
      code: "buzzword",
      severity: "warning",
      message: `Buzzword${buzz.length > 1 ? "s" : ""}: ${buzz
        .map((w) => `"${w}" → ${BUZZWORDS[w]}`)
        .join("; ")}`,
    });
  }

  if (WEAK_OPENINGS.some((re) => re.test(text))) {
    issues.push({
      code: "weak-opening",
      severity: "warning",
      message: "Starts with a passive phrase. Lead with what you did (Built, Cut, Ran, Owned…).",
    });
  }

  if (/^[A-Z][A-Za-z/&\s-]{2,40}:\s/.test(text)) {
    issues.push({
      code: "filler-label",
      severity: "info",
      message: "Starts with a label (\"Cloud Optimization: …\"). Lead with the verb instead to save space.",
    });
  }

  if (!SCOPE_PATTERN.test(text)) {
    issues.push({
      code: "no-scope",
      severity: "info",
      message: "No concrete scope. Add a number: team size, users, services, %, time or cost saved.",
    });
  }

  if (text.length > MAX_BULLET_CHARS) {
    issues.push({
      code: "too-long",
      severity: "info",
      message: `Long bullet (${text.length} chars). Aim for 1–2 lines (under ${MAX_BULLET_CHARS} chars).`,
    });
  }

  return issues;
}

const countWords = (s: string) => stripHtml(s).split(/\s+/).filter(Boolean).length;

export function analyzeResume(data: ResumeData): ResumeReport {
  const bullets: BulletReport[] = [];
  let bulletCount = 0;
  (data.experience || []).forEach((job, jobIndex) => {
    (job.description || []).forEach((text, bulletIndex) => {
      if (!stripHtml(text)) return;
      bulletCount += 1;
      const issues = analyzeBullet(text);
      if (issues.length > 0) bullets.push({ text: stripHtml(text), jobIndex, bulletIndex, issues });
    });
  });

  const summaryIssues: BulletIssue[] = [];
  const summaryBuzz = findBuzzwords(data.summary || "");
  if (summaryBuzz.length > 0) {
    summaryIssues.push({
      code: "buzzword",
      severity: "warning",
      message: `Summary buzzwords: ${summaryBuzz.map((w) => `"${w}"`).join(", ")}. Say what role you do and what you work on.`,
    });
  }
  const summaryWords = countWords(data.summary || "");
  if (summaryWords > 80) {
    summaryIssues.push({
      code: "too-long",
      severity: "info",
      message: `Summary is ${summaryWords} words. 2–4 sentences (under ~80 words) reads better.`,
    });
  }

  const wordCount =
    countWords(data.summary || "") +
    (data.experience || []).reduce(
      (n, j) => n + countWords(`${j.company} ${j.position}`) + (j.description || []).reduce((m, b) => m + countWords(b), 0),
      0
    ) +
    (data.skills || []).length +
    (data.education || []).reduce((n, e) => n + countWords(`${e.degree} ${e.institution}`), 0);

  const tips: string[] = [];
  const skillCount = (data.skills || []).length;
  if (skillCount > 12 && !getSkillGroups(data)) {
    tips.push(`You list ${skillCount} skills in one line. Grouping them by category (Cloud, CI/CD, Languages…) is easier to scan.`);
  }
  const seen = new Map<string, number>();
  (data.experience || []).forEach((j) => {
    const key = (j.company || "").toLowerCase().trim();
    if (key) seen.set(key, (seen.get(key) || 0) + 1);
  });
  if ([...seen.values()].some((n) => n > 1)) {
    tips.push("Several roles at one company are shown under one company heading, so the promotion is visible.");
  }
  (data.experience || []).forEach((j) => {
    if ((j.description || []).length > 6) {
      tips.push(`"${j.position}" has ${(j.description || []).length} bullets. Keep the 4–6 strongest.`);
    }
  });

  return {
    bullets,
    summaryIssues,
    flaggedCount: bullets.length,
    bulletCount,
    wordCount,
    tips,
  };
}
