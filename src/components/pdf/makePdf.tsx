import { Font, pdf } from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";
import { FIT_STEPS, PageSizeKey } from "@/utils/pageFit";
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
  /** Fit scale used by the on-screen preview; the PDF starts there. */
  scale: number;
}

/**
 * Builds the PDF at the preview's scale and, only if the PDF layout runs over,
 * steps the scale down (to 0.76 at most) until it fits one page. Returns the
 * last attempt if nothing fits.
 */
export async function makeResumePdf({ data, template, pageSize, scale }: MakePdfOptions) {
  registerFonts();
  const steps = [scale, ...[...FIT_STEPS, 0.8, 0.76].filter((f) => f < scale - 0.001)];

  let blob: Blob | null = null;
  let pages = 0;
  for (const f of steps) {
    blob = await pdf(<ResumePdf data={data} template={template} pageSize={pageSize} spacing={spacingFor(template, f)} />).toBlob();
    pages = await countPdfPages(blob);
    if (pages <= 1) break;
  }
  return { blob: blob as Blob, pages };
}

export { resumeFileName } from "@/utils/fileName";
