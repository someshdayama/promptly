import { Density } from "@/utils/pageFit";

export type TemplateKey = "ats" | "minimalist" | "modern";

/** Spacing for one density, copied from the template CSS (px values, pt font sizes). */
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

type Row = [number, number, number, number, number, number, number, number, number];
const row = ([padV, padH, sectionGap, itemGap, text, small, title, name, line]: Row): PdfSpacing => ({
  padV, padH, sectionGap, itemGap, text, small, title, name, line,
});

export const SPACING: Record<TemplateKey, Record<Density, PdfSpacing>> = {
  ats: {
    "sp-comfortable": row([28, 40, 10, 8, 10, 9.5, 10.5, 22, 1.35]),
    "sp-regular": row([22, 34, 8, 6, 9.6, 9.1, 10.2, 20, 1.3]),
    "sp-compact": row([16, 28, 6, 5, 9.2, 8.8, 9.8, 18, 1.27]),
    "sp-dense": row([10, 22, 5, 4, 8.8, 8.4, 9.4, 17, 1.22]),
  },
  minimalist: {
    "sp-comfortable": row([32, 44, 12, 9, 10, 9.4, 9, 24, 1.4]),
    "sp-regular": row([24, 36, 10, 7, 9.6, 9, 8.8, 22, 1.33]),
    "sp-compact": row([18, 30, 8, 5, 9.2, 8.7, 8.5, 20, 1.28]),
    "sp-dense": row([12, 24, 6, 4, 8.8, 8.3, 8.2, 18, 1.22]),
  },
  modern: {
    "sp-comfortable": { ...row([28, 20, 14, 9, 9.8, 9, 8.8, 22, 1.4]), mainV: 28, mainH: 28 },
    "sp-regular": { ...row([22, 18, 11, 7, 9.4, 8.7, 8.6, 20, 1.33]), mainV: 22, mainH: 24 },
    "sp-compact": { ...row([18, 16, 9, 5, 9, 8.4, 8.3, 18, 1.28]), mainV: 18, mainH: 20 },
    "sp-dense": { ...row([12, 14, 7, 4, 8.6, 8.1, 8, 17, 1.22]), mainV: 12, mainH: 16 },
  },
};

/** CSS px to PDF points. */
export const px = (v: number) => v * 0.75;
/** Millimetres to PDF points. */
export const mm = (v: number) => (v * 72) / 25.4;

/** Scales every font size (used as a last resort to fit one page). */
export function scaleSpacing(s: PdfSpacing, f: number): PdfSpacing {
  if (f === 1) return s;
  return {
    ...s,
    sectionGap: s.sectionGap * f,
    itemGap: s.itemGap * f,
    text: s.text * f,
    small: s.small * f,
    title: s.title * f,
    name: s.name * f,
  };
}
