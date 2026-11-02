/**
 * Reads the text out of a PDF in the browser (pdf.js is loaded only when needed).
 * Used for "Upload PDF": a LinkedIn "Save to PDF" export or an old resume.
 */

export const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_PAGES = 15;

/** An error with a message that is safe and plain enough to show as-is. */
export class PdfReadError extends Error {
  name = "PdfReadError";
}

export async function extractPdfText(file: File): Promise<string> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) throw new PdfReadError("That file is not a PDF. Choose a PDF file.");
  if (file.size > MAX_PDF_BYTES) throw new PdfReadError("That PDF is over 5 MB. Choose a smaller file.");

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "PasswordException") throw new PdfReadError("That PDF is password protected. Remove the password and try again.");
    throw new PdfReadError("Couldn't open this PDF. Try copying the text instead.");
  }

  const pages: string[] = [];
  try {
    for (let i = 1; i <= Math.min(doc.numPages, MAX_PAGES); i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      let text = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        text += item.str;
        if (item.hasEOL) text += "\n";
      }
      pages.push(text);
    }
  } finally {
    doc.destroy();
  }

  const text = pages
    .join("\n\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.replace(/\s/g, "").length < 40) {
    throw new PdfReadError("Couldn't read text from this PDF, try copying the text instead.");
  }
  return text;
}
