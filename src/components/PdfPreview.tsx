"use client";

import { useEffect, useRef } from "react";
import styles from "./Builder.module.css";

interface Props {
  blob: Blob | null;
  /** Page width / height, used to reserve space before the first render. */
  aspect: number;
  onPageClick?: () => void;
}

/**
 * Shows the real PDF (the same file the download button saves), page by page,
 * drawn with pdf.js onto canvases. Works on phone Safari, where embedded PDFs don't.
 * New renders replace the old pages only once they are ready, so nothing flickers.
 */
export default function PdfPreview({ blob, aspect, onPageClick }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clickRef = useRef(onPageClick);
  clickRef.current = onPageClick;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !blob) return;
    let cancelled = false;
    let lastWidth = 0;

    const draw = async () => {
      const width = host.clientWidth;
      if (!width || width === lastWidth) return;
      lastWidth = width;
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const pages: HTMLElement[] = [];
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (width / base.width) * dpr });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        canvas.className = styles.pdfCanvas;
        await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
        const wrap = document.createElement("div");
        wrap.className = styles.pdfPage;
        wrap.setAttribute("role", "img");
        wrap.setAttribute("aria-label", `Page ${n} of ${doc.numPages}`);
        wrap.appendChild(canvas);
        if (doc.numPages > 1) {
          const label = document.createElement("span");
          label.className = styles.pageLabel;
          label.textContent = `Page ${n} of ${doc.numPages}`;
          wrap.appendChild(label);
        }
        wrap.addEventListener("click", () => clickRef.current?.());
        pages.push(wrap);
      }
      doc.destroy();
      if (!cancelled) host.replaceChildren(...pages);
    };

    draw().catch((err) => console.error(err));
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => draw().catch((err) => console.error(err)), 150);
    });
    observer.observe(host);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [blob]);

  return (
    <div ref={hostRef} className={styles.pdfPages}>
      {!blob && <div className={styles.pdfPage} style={{ aspectRatio: String(aspect) }} />}
    </div>
  );
}
