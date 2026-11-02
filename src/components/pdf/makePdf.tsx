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
 * Builds the PDF that is both shown and downloaded.
 * Multi-page: normal size, content flows over as many pages as it needs.
 * One page: the largest scale in FIT_RANGE that still fits one page, found by
 * bisection on the real PDF layout, so the page reads as filled. If even the
 * smallest scale runs over, it uses the normal size and flows onto more pages
 * rather than shrinking text further.
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

  const top = await build(FIT_RANGE.max);
  if (top.pages <= 1) return top;
  let best = await build(FIT_RANGE.min);
  // Too long for one readable page: use the normal size over two pages instead of tiny text.
  if (best.pages > 1) return build(1);
  let lo: number = FIT_RANGE.min;
  let hi: number = FIT_RANGE.max;
  while (hi - lo > 0.012) {
    const mid = Math.round(((lo + hi) / 2) * 1000) / 1000;
    const tryMid = await build(mid);
    if (tryMid.pages <= 1) {
      best = tryMid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

export { resumeFileName } from "@/utils/fileName";
