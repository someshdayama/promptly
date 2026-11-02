import { Font, pdf } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { DENSITIES, Density, PageSizeKey } from "@/utils/pageFit";
import ResumePdf from "./ResumePdf";
import { SPACING, TemplateKey, scaleSpacing } from "./pdfStyles";

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
  /** Spacing used by the on-screen preview; the PDF starts there. */
  density: Density;
}

/**
 * Builds the PDF and tightens spacing (then font size, down to 88%) until it
 * fits on one page. Returns the last attempt if nothing fits.
 */
export async function makeResumePdf({ data, template, pageSize, density }: MakePdfOptions) {
  registerFonts();
  const start = Math.max(0, DENSITIES.indexOf(density));
  const attempts: { d: Density; f: number }[] = [
    ...DENSITIES.slice(start).map((d) => ({ d, f: 1 })),
    ...[0.96, 0.92, 0.88].map((f) => ({ d: DENSITIES[DENSITIES.length - 1], f })),
  ];

  let blob: Blob | null = null;
  let pages = 0;
  for (const { d, f } of attempts) {
    const spacing = scaleSpacing(SPACING[template][d], f);
    blob = await pdf(<ResumePdf data={data} template={template} pageSize={pageSize} spacing={spacing} />).toBlob();
    pages = await countPdfPages(blob);
    if (pages <= 1) break;
  }
  return { blob: blob as Blob, pages };
}

export { resumeFileName } from "@/utils/fileName";
