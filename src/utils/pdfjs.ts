/**
 * pdf.js for the preview, loaded once. One worker is kept for the whole visit:
 * without it pdf.js starts (and parses its 1.3 MB script in) a fresh worker for
 * every preview update.
 */
type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let loading: Promise<{ pdfjs: PdfJs; worker: InstanceType<PdfJs["PDFWorker"]> }> | null = null;

export function loadPdfjs() {
  if (!loading) {
    loading = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return { pdfjs, worker: new pdfjs.PDFWorker() };
    });
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}
