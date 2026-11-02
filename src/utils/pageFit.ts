/**
 * Page sizes, print margins and spacing presets used to fit a resume on one page.
 */

export type PageSizeKey = "a4" | "letter";

export interface PageSize {
  label: string;
  /** Value for the CSS @page `size` property. */
  css: string;
  widthMm: number;
  heightMm: number;
}

export const PAGE_SIZES: Record<PageSizeKey, PageSize> = {
  a4: { label: "A4", css: "A4", widthMm: 210, heightMm: 297 },
  letter: { label: "Letter", css: "letter", widthMm: 215.9, heightMm: 279.4 },
};

/** Print margins, also used as padding on the on-screen page so preview = PDF. */
export const PAGE_MARGIN_MM = { vertical: 10, horizontal: 10 };

/**
 * Page layout. "One page" fits the resume to a single page: one scale number
 * (1 = normal) sizes fonts, gaps and padding, and the PDF builder picks the
 * largest scale in FIT_RANGE that still fits, so the page reads as filled.
 * Above 1, text stops growing at 1.2× (12pt body) and only the gaps keep
 * growing, evenly everywhere, so a short resume still reaches the bottom.
 * "Multi-page" uses the normal size and lets content flow onto more pages.
 */
export type PageMode = "one" | "multi";
export const PAGE_MODES: { key: PageMode; label: string }[] = [
  { key: "one", label: "One page" },
  { key: "multi", label: "Multi-page" },
];
export const isPageMode = (v: unknown): v is PageMode => v === "one" || v === "multi";

/** Smallest and largest one-page scale. 0.8 keeps body text at 8pt or more. */
export const FIT_RANGE = { min: 0.8, max: 1.75 } as const;

/** Text grows with the scale up to 1.2×; gaps keep growing past that. */
export function fitFactors(scale: number) {
  const font = Math.min(scale, 1.2);
  const gap = scale <= 1 ? scale : 1 + (scale - 1) * 2;
  return { font, gap };
}

/**
 * Line height follows the scale a little, within a tidy 1.24–1.4 band, so
 * dense resumes stay readable and roomy ones never look loose.
 */
export function fitLineHeight(base: number, scale: number): number {
  return Math.round(Math.min(1.4, Math.max(1.24, base + (scale - 1) * 0.5)) * 1000) / 1000;
}

/** CSS custom properties the templates read (`--fit`, `--fit-dl`). */
export function fitStyle(scale: number): Record<string, string> {
  const { font, gap } = fitFactors(scale);
  return {
    "--fit": String(font),
    "--fit-gap": String(gap),
    "--fit-dl": String(Math.round(Math.min(0.06, Math.max(-0.09, (font - 1) * 0.5)) * 1000) / 1000),
  };
}

const PX_PER_MM = 96 / 25.4;

export const mmToPx = (mm: number) => mm * PX_PER_MM;

export function contentBox(size: PageSize) {
  const widthMm = size.widthMm - 2 * PAGE_MARGIN_MM.horizontal;
  const heightMm = size.heightMm - 2 * PAGE_MARGIN_MM.vertical;
  return { widthMm, heightMm, heightPx: mmToPx(heightMm) };
}
