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

/** Spacing presets from roomiest to tightest; each template defines these classes. */
export const DENSITIES = ["sp-comfortable", "sp-regular", "sp-compact", "sp-dense"] as const;
export type Density = (typeof DENSITIES)[number];
export type DensitySetting = Density | "auto";

export const DENSITY_LABELS: Record<Density, string> = {
  "sp-comfortable": "Comfortable",
  "sp-regular": "Regular",
  "sp-compact": "Compact",
  "sp-dense": "Dense",
};

const PX_PER_MM = 96 / 25.4;

export const mmToPx = (mm: number) => mm * PX_PER_MM;

export function contentBox(size: PageSize) {
  const widthMm = size.widthMm - 2 * PAGE_MARGIN_MM.horizontal;
  const heightMm = size.heightMm - 2 * PAGE_MARGIN_MM.vertical;
  return { widthMm, heightMm, heightPx: mmToPx(heightMm) };
}

export interface FitResult {
  density: Density;
  /** Estimated number of printed pages at that density (1 decimal). */
  pages: number;
  fits: boolean;
}

/**
 * Chooses the roomiest density whose measured height fits on one page.
 * Falls back to the tightest density when nothing fits.
 * `heights` maps density → rendered content height in px (0/undefined = not measured yet).
 */
export function pickDensity(
  heights: Partial<Record<Density, number>>,
  pageHeightPx: number,
  setting: DensitySetting = "auto"
): FitResult | null {
  const pagesFor = (d: Density) => {
    const h = heights[d] || 0;
    return h > 0 ? Math.max(1, Math.round((h / pageHeightPx) * 10) / 10) : 0;
  };
  // Small tolerance for sub-pixel rounding.
  const fitsFor = (d: Density) => (heights[d] || 0) > 0 && (heights[d] as number) <= pageHeightPx + 2;

  if (setting !== "auto") {
    if (!heights[setting]) return null;
    return { density: setting, pages: pagesFor(setting), fits: fitsFor(setting) };
  }

  if (DENSITIES.some((d) => !heights[d])) return null;
  const fitting = DENSITIES.find(fitsFor);
  const density = fitting || DENSITIES[DENSITIES.length - 1];
  return { density, pages: pagesFor(density), fits: !!fitting };
}
