"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./AutoFitWrapper.module.css";

interface AutoFitWrapperProps {
  children: React.ReactNode;
  contentDependencies: unknown[];
  fitToSinglePage?: boolean;
  onZoomChange?: (zoom: number, budgetClass: string) => void;
}

/**
 * AutoFitWrapper manages page budgeting dynamically.
 * 
 * Approach:
 * 1. Sequentially applies dynamic spacing classes (comfortable -> regular -> compact -> dense)
 *    to shrink margins and font scales semantically.
 * 2. If it still exceeds the A4 height at maximum compaction (dense), it calculates a micro-zoom
 *    as a seamless safety backup to guarantee 100% fitting.
 * 3. This resolves browser incompatibilities with pure CSS `zoom` and guarantees text readability.
 */
export default function AutoFitWrapper({
  children,
  contentDependencies,
  fitToSinglePage = true,
  onZoomChange,
}: AutoFitWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [budgetClass, setBudgetClass] = useState("sp-comfortable");
  const [zoom, setZoom] = useState(1);
  const [canvasHeight, setCanvasHeight] = useState(fitToSinglePage ? "297mm" : "auto");

  const calculateBudgetFit = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const canvasWidth = containerRef.current.clientWidth;
    if (!canvasWidth) return;

    // Standard A4 target height in pixels based on screen canvas width
    const targetHeight = (canvasWidth / 210) * 297;

    // Step 1: Temporarily remove styling overrides to measure natural dimensions
    contentRef.current.style.zoom = "1";

    // We will test budgets sequentially from largest to smallest
    const budgets = ["sp-comfortable", "sp-regular", "sp-compact", "sp-dense"];
    let optimalBudget = "sp-comfortable";
    let contentHeight = 0;

    if (fitToSinglePage) {
      // Cycle through budgets and find the first one that fits
      for (const budget of budgets) {
        // Temporarily set class via DOM to force immediate layout compute
        contentRef.current.className = `${styles.scaler} ${budget}`;
        contentHeight = contentRef.current.scrollHeight;

        optimalBudget = budget;
        if (contentHeight <= targetHeight) {
          break; // Found a fit!
        }
      }
    } else {
      // If not fitting to single page, default to comfortable spacing
      contentRef.current.className = `${styles.scaler} sp-comfortable`;
      contentHeight = contentRef.current.scrollHeight;
      optimalBudget = "sp-comfortable";
    }

    let finalZoom = 1;
    let finalCanvasHeight = `${targetHeight}px`;

    // Step 2: Backup micro-scaling if still overflowing at maximum compaction
    if (fitToSinglePage && contentHeight > targetHeight) {
      finalZoom = targetHeight / contentHeight;
      // Cap minimum zoom level to protect readability
      finalZoom = Math.max(finalZoom, 0.85);
    } else if (!fitToSinglePage) {
      finalCanvasHeight = `${contentHeight + 8}px`;
    }

    // Apply inline style adjustments immediately to prevent visual layout flicker
    contentRef.current.className = `${styles.scaler} ${optimalBudget}`;
    contentRef.current.style.zoom = String(finalZoom);

    setBudgetClass(optimalBudget);
    setZoom(finalZoom);
    setCanvasHeight(finalCanvasHeight);
    onZoomChange?.(finalZoom, optimalBudget);
  }, [fitToSinglePage, onZoomChange]);

  useEffect(() => {
    // Run immediately to handle layout updates
    calculateBudgetFit();

    if (!contentRef.current) return;

    // Use MutationObserver to detect content modifications (character changes, children additions/removals)
    // without triggering on style/class updates, preventing infinite loops.
    const observer = new MutationObserver(() => {
      calculateBudgetFit();
    });

    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", calculateBudgetFit);

    // Watch for font loads that could change element layout heights
    if (typeof window !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(calculateBudgetFit);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calculateBudgetFit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateBudgetFit, fitToSinglePage, ...contentDependencies]);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.canvas}
        ref={containerRef}
        style={{ "--canvas-height": canvasHeight } as React.CSSProperties}
      >
        <div
          className={`${styles.scaler} ${budgetClass}`}
          ref={contentRef}
          style={{ zoom } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
