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
export const PAGE_MARGIN_MM = { vertical: 10, horizontal: 13 };

/**
 * Fit-to-page scale. Every template sizes its fonts and gaps from one number
 * (`--fit`, 1 = normal). Auto mode measures the resume at each step and uses the
 * roomiest one that fits one page: long resumes shrink a little before they
 * overflow, short ones get slightly roomier. Nothing is ever stretched apart to
 * fill the page, so a short resume may end with some white space.
 */
export const FIT_STEPS = [1.12, 1.08, 1.04, 1, 0.96, 0.92, 0.88, 0.84] as const;
export type FitStep = (typeof FIT_STEPS)[number];

export const SPACING_PRESETS = { roomy: 1.08, regular: 1, compact: 0.92, dense: 0.84 } as const;
export type SpacingPreset = keyof typeof SPACING_PRESETS;
export type SpacingSetting = SpacingPreset | "auto";

export const SPACING_LABELS: Record<SpacingPreset, string> = {
  roomy: "Roomy",
  regular: "Regular",
  compact: "Compact",
  dense: "Dense",
};

export const isSpacingSetting = (v: unknown): v is SpacingSetting =>
  v === "auto" || (typeof v === "string" && v in SPACING_PRESETS);

/**
 * Line height follows the scale a little, within a tidy 1.24–1.4 band, so
 * dense resumes stay readable and roomy ones never look loose.
 */
export function fitLineHeight(base: number, scale: number): number {
  return Math.round(Math.min(1.4, Math.max(1.24, base + (scale - 1) * 0.5)) * 1000) / 1000;
}

/** CSS custom properties the templates read (`--fit`, `--fit-dl`). */
export function fitStyle(scale: number): Record<string, string> {
  return { "--fit": String(scale), "--fit-dl": String(Math.round((scale - 1) * 0.5 * 1000) / 1000) };
}

const PX_PER_MM = 96 / 25.4;

export const mmToPx = (mm: number) => mm * PX_PER_MM;

export function contentBox(size: PageSize) {
  const widthMm = size.widthMm - 2 * PAGE_MARGIN_MM.horizontal;
  const heightMm = size.heightMm - 2 * PAGE_MARGIN_MM.vertical;
  return { widthMm, heightMm, heightPx: mmToPx(heightMm) };
}

export interface FitResult {
  scale: number;
  /** Estimated number of printed pages at that scale (1 decimal). */
  pages: number;
  fits: boolean;
}

/**
 * Picks the fit scale. `heights` maps scale → measured content height in px
 * (0/undefined = not measured yet). Auto mode waits for every step.
 */
export function pickFit(
  heights: Partial<Record<number, number>>,
  pageHeightPx: number,
  setting: SpacingSetting = "auto"
): FitResult | null {
  const pagesFor = (f: number) => {
    const h = heights[f] || 0;
    return h > 0 ? Math.max(1, Math.round((h / pageHeightPx) * 10) / 10) : 0;
  };
  // Small tolerance for sub-pixel rounding.
  const fitsFor = (f: number) => (heights[f] || 0) > 0 && (heights[f] as number) <= pageHeightPx + 2;

  if (setting !== "auto") {
    const f = SPACING_PRESETS[setting];
    if (!heights[f]) return null;
    return { scale: f, pages: pagesFor(f), fits: fitsFor(f) };
  }

  if (FIT_STEPS.some((f) => !heights[f])) return null;
  const fitting = FIT_STEPS.find(fitsFor);
  const scale = fitting ?? FIT_STEPS[FIT_STEPS.length - 1];
  return { scale, pages: pagesFor(scale), fits: fitting !== undefined };
}
