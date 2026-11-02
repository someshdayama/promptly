import { fitFactors, fitLineHeight } from "@/utils/pageFit";

export type TemplateKey = "ats" | "minimalist" | "modern";

/** Spacing at one fit scale (px values for gaps/padding, pt for font sizes). */
export interface PdfSpacing {
  /** Modern only: sidebar and main column side padding, in mm (the page has no side margin). */
  sideH?: number;
  mainH?: number;
  sectionGap: number;
  itemGap: number;
  /** Space under each bullet / skill row (px at scale 1 = 1.5). */
  bulletGap: number;
  text: number;
  small: number;
  title: number;
  name: number;
  line: number;
}

/** Base sizes at --fit = 1. Keep in step with the template CSS modules. */
const BASE: Record<TemplateKey, Omit<PdfSpacing, "bulletGap">> = {
  ats: { sectionGap: 10, itemGap: 7, text: 10, small: 9.5, title: 10.5, name: 22, line: 1.32 },
  minimalist: { sectionGap: 11, itemGap: 8, text: 10, small: 9.4, title: 9, name: 24, line: 1.34 },
  modern: { sideH: 7, mainH: 9, sectionGap: 13, itemGap: 8, text: 9.8, small: 9, title: 8.8, name: 22, line: 1.34 },
};

/** Same formula as the CSS: text × font factor, gaps × gap factor, line height in a tidy band. */
export function spacingFor(template: TemplateKey, scale: number): PdfSpacing {
  const b = BASE[template];
  const { font, gap } = fitFactors(scale);
  return {
    ...b,
    sectionGap: b.sectionGap * gap,
    itemGap: b.itemGap * gap,
    bulletGap: 1.5 * gap,
    text: b.text * font,
    small: b.small * font,
    title: b.title * font,
    name: b.name * font,
    line: fitLineHeight(b.line, font),
  };
}

/** CSS px to PDF points. */
export const px = (v: number) => v * 0.75;
/** Millimetres to PDF points. */
export const mm = (v: number) => (v * 72) / 25.4;
