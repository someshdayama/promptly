import { fitLineHeight } from "@/utils/pageFit";

export type TemplateKey = "ats" | "minimalist" | "modern";

/** Spacing at one fit scale (px values for gaps/padding, pt for font sizes). */
export interface PdfSpacing {
  /** Modern only: sidebar padding. The sheet margins replace page padding elsewhere. */
  padV: number;
  padH: number;
  /** Modern only: main column padding. */
  mainV?: number;
  mainH?: number;
  sectionGap: number;
  itemGap: number;
  text: number;
  small: number;
  title: number;
  name: number;
  line: number;
}

/** Base sizes at --fit = 1. Keep in step with the template CSS modules. */
const BASE: Record<TemplateKey, PdfSpacing> = {
  ats: { padV: 0, padH: 0, sectionGap: 10, itemGap: 7, text: 10, small: 9.5, title: 10.5, name: 22, line: 1.32 },
  minimalist: { padV: 0, padH: 0, sectionGap: 11, itemGap: 8, text: 10, small: 9.4, title: 9, name: 24, line: 1.34 },
  modern: { padV: 24, padH: 20, mainV: 24, mainH: 26, sectionGap: 13, itemGap: 8, text: 9.8, small: 9, title: 8.8, name: 22, line: 1.34 },
};

/** Same formula as the CSS: sizes and gaps × scale, line height kept in a tidy band. */
export function spacingFor(template: TemplateKey, scale: number): PdfSpacing {
  const b = BASE[template];
  return {
    ...b,
    padV: b.padV * scale,
    mainV: b.mainV !== undefined ? b.mainV * scale : undefined,
    sectionGap: b.sectionGap * scale,
    itemGap: b.itemGap * scale,
    text: b.text * scale,
    small: b.small * scale,
    title: b.title * scale,
    name: b.name * scale,
    line: fitLineHeight(b.line, scale),
  };
}

/** CSS px to PDF points. */
export const px = (v: number) => v * 0.75;
/** Millimetres to PDF points. */
export const mm = (v: number) => (v * 72) / 25.4;
