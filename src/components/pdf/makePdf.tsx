import { Font, pdf } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { FIT_RANGE, PageMode, PageSizeKey } from "@/utils/pageFit";
import ResumePdf from "./ResumePdf";
import { TemplateKey, spacingFor } from "./pdfStyles";

let fontsReady = false;

function registerFonts() {
  if (fontsReady) return;
  const base = `${window.location.origin}/fonts`;
  Font.register({
    family: "Inter",
    fonts: [
      { src: `${base}/Inter-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/Inter-Italic.ttf`, fontWeight: 400, fontStyle: "italic" },
      { src: `${base}/Inter-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/Inter-SemiBold.ttf`, fontWeight: 600 },
      { src: `${base}/Inter-SemiBoldItalic.ttf`, fontWeight: 600, fontStyle: "italic" },
      { src: `${base}/Inter-Bold.ttf`, fontWeight: 700 },
      { src: `${base}/Inter-ExtraBold.ttf`, fontWeight: 800 },
    ],
  });
  // Never hyphenate words across lines.
  Font.registerHyphenationCallback((word) => [word]);
  fontsReady = true;
}

/** Counts pages in a PDF made by react-pdf (page objects are written as plain text). */
export async function countPdfPages(blob: Blob): Promise<number> {
  const text = new TextDecoder("latin1").decode(await blob.arrayBuffer());
  return (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
}

export interface MakePdfOptions {
  data: ResumeData;
  template: TemplateKey;
  pageSize: PageSizeKey;
  mode: PageMode;
}

export interface MadePdf {
  blob: Blob;
  pages: number;
  /** Scale the PDF was laid out at (the edit view uses the same one). */
  scale: number;
}

/**
 * Last one-page answer per template and paper: the bisection's final [lo, hi]
 * bracket. A small edit almost always lands in the same bracket, so two builds
 * (lo fits, hi doesn't) prove the answer instead of running the whole search.
 */
type Bracket = { lo: number; hi: number };
const HINT_KEY = "promptly.fitHint.v1";
let lastBracket: Map<string, Bracket> | null = null;

/** Kept across visits too (just scale numbers), so reopening the app with a saved resume is fast. */
function brackets(): Map<string, Bracket> {
  if (lastBracket) return lastBracket;
  lastBracket = new Map();
  try {
    const saved = JSON.parse(localStorage.getItem(HINT_KEY) || "{}") as Record<string, Bracket>;
    for (const [k, v] of Object.entries(saved)) {
      if (v && typeof v.lo === "number" && typeof v.hi === "number" && v.lo < v.hi) lastBracket.set(k, v);
    }
  } catch {
    /* no storage: start fresh */
  }
  return lastBracket;
}

function rememberBracket(key: string, bracket: Bracket) {
  const all = brackets();
  all.set(key, bracket);
  try {
    localStorage.setItem(HINT_KEY, JSON.stringify(Object.fromEntries(all)));
  } catch {
    /* ignore */
  }
}

/**
 * Builds the PDF that is both shown and downloaded.
 * Multi-page: normal size, content flows over as many pages as it needs.
 * One page: the largest scale in FIT_RANGE that still fits one page, found by
 * bisection on the real PDF layout, so the page reads as filled. If even the
 * smallest scale runs over, it uses the normal size and flows onto more pages
 * rather than shrinking text further.
 *
 * Speed: each react-pdf build is a full layout (tens to hundreds of ms on the
 * main thread), so the search never builds a scale whose answer is already
 * known. The bisection relies on "bigger scale = taller", so any scale at or
 * below one that fit also fits, and any at or above one that ran over also runs
 * over. With the last bracket checked first, the steps below take exactly the
 * same path, and give exactly the same result, as building every step.
 */
export async function makeResumePdf({ data, template, pageSize, mode }: MakePdfOptions): Promise<MadePdf> {
  registerFonts();
  const build = async (scale: number) => {
    const blob = await pdf(
      <ResumePdf data={data} template={template} pageSize={pageSize} spacing={spacingFor(template, scale)} />
    ).toBlob();
    return { blob, pages: await countPdfPages(blob), scale };
  };

  if (mode === "multi") return build(1);

  const built = new Map<number, MadePdf>();
  let fitsUpTo = -Infinity; // largest scale known to fit on one page
  let overFrom = Infinity; // smallest scale known to run over
  const fits = async (scale: number): Promise<boolean> => {
    if (scale <= fitsUpTo) return true;
    if (scale >= overFrom) return false;
    const out = await build(scale);
    built.set(scale, out);
    if (out.pages <= 1) fitsUpTo = scale;
    else overFrom = scale;
    return out.pages <= 1;
  };
  const result = async (scale: number) => built.get(scale) ?? build(scale);

  const bracketKey = `${template}:${pageSize}`;
  const hint = brackets().get(bracketKey);
  if (hint) {
    await fits(hint.lo);
    await fits(hint.hi);
  }

  if (await fits(FIT_RANGE.max)) return result(FIT_RANGE.max);
  // Too long for one readable page: use the normal size over two pages instead of tiny text.
  if (!(await fits(FIT_RANGE.min))) return build(1);
  let best: number = FIT_RANGE.min;
  let lo: number = FIT_RANGE.min;
  let hi: number = FIT_RANGE.max;
  while (hi - lo > 0.012) {
    const mid = Math.round(((lo + hi) / 2) * 1000) / 1000;
    if (await fits(mid)) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  rememberBracket(bracketKey, { lo, hi });
  return result(best);
}

export { resumeFileName } from "@/utils/fileName";
