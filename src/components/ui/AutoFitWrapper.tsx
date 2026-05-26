"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AutoFitWrapper.module.css";

interface AutoFitWrapperProps {
  children: React.ReactNode;
  contentDependencies: any[]; // Triggers recalculation when content changes
  fitToSinglePage?: boolean;
}

/**
 * AutoFitWrapper intelligently scales the resume content to fit perfectly
 * on a single A4 page. It scales down to prevent overflow and scales up
 * to fill empty space, ensuring a professional, balanced look.
 */
export default function AutoFitWrapper({
  children,
  contentDependencies,
  fitToSinglePage = true,
}: AutoFitWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [virtualWidth, setVirtualWidth] = useState("100%");
  const [canvasHeight, setCanvasHeight] = useState("297mm");

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      // Reset to natural 1x scale and 100% width to get fresh measurements
      contentRef.current.style.transform = `scale(1)`;
      contentRef.current.style.width = `100%`;
      
      const canvasWidth = containerRef.current.clientWidth;
      const targetHeight = (canvasWidth / 210) * 297; // Exact A4 height in px based on container width
      
      // Temporarily remove height constraints to measure true unconstrained height
      contentRef.current.style.minHeight = 'auto';
      containerRef.current.style.height = 'auto';
      
      let contentHeight = contentRef.current.scrollHeight;
      
      // Reset DOM overrides so React state styles can take over
      contentRef.current.style.minHeight = '';
      containerRef.current.style.height = '';

      if (fitToSinglePage) {
        // Mode 1: Force Single Page (scale down if too long)
        if (contentHeight > targetHeight) {
          let s = targetHeight / contentHeight;
          
          // Damped numerical convergence loop to find exact scaling and prevent oscillation
          for (let i = 0; i < 4; i++) {
            contentRef.current.style.width = `${(1 / s) * 100}%`;
            contentHeight = contentRef.current.scrollHeight;
            const sCalculated = targetHeight / contentHeight;
            s = 0.5 * s + 0.5 * sCalculated;
          }
          
          const finalScale = Math.max(s, 0.35); // Remove large safety margins to fit A4 exactly
          setScale(finalScale);
          setVirtualWidth(`${(1 / finalScale) * 100}%`);
          setCanvasHeight(`${targetHeight}px`);
        } else if (contentHeight >= targetHeight * 0.85) {
          // Close to A4: scale to fit exactly 1 page
          let s = targetHeight / contentHeight;
          for (let i = 0; i < 4; i++) {
            contentRef.current.style.width = `${(1 / s) * 100}%`;
            contentHeight = contentRef.current.scrollHeight;
            const sCalculated = targetHeight / contentHeight;
            s = 0.5 * s + 0.5 * sCalculated;
          }
          const finalScale = Math.max(s, 0.4);
          setScale(finalScale);
          setVirtualWidth(`${(1 / finalScale) * 100}%`);
          setCanvasHeight(`${targetHeight}px`);
        } else {
          // Short content: keep 1.0 scale, shrink page height to fit content
          setScale(1);
          setVirtualWidth("100%");
          setCanvasHeight(`${contentHeight + 20}px`);
        }
      } else {
        // Mode 2: Multi-Page / Natural height (do not scale down to fit long content)
        if (contentHeight >= targetHeight * 0.85 && contentHeight <= targetHeight * 1.15) {
          // Close to A4: scale to fit exactly 1 page
          let s = targetHeight / contentHeight;
          for (let i = 0; i < 4; i++) {
            contentRef.current.style.width = `${(1 / s) * 100}%`;
            contentHeight = contentRef.current.scrollHeight;
            const sCalculated = targetHeight / contentHeight;
            s = 0.5 * s + 0.5 * sCalculated;
          }
          const finalScale = Math.max(s, 0.4);
          setScale(finalScale);
          setVirtualWidth(`${(1 / finalScale) * 100}%`);
          setCanvasHeight(`${targetHeight}px`);
        } else {
          // Short or long: keep 1.0 scale, adjust canvas height to fit content
          setScale(1);
          setVirtualWidth("100%");
          setCanvasHeight(`${contentHeight + 20}px`);
        }
      }
    };

    // Use a small delay to ensure DOM is rendered
    const timeoutId = setTimeout(calculateScale, 150);
    
    // Add window resize listener in case of browser zoom changes
    window.addEventListener('resize', calculateScale);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateScale);
    };
    
  }, [...contentDependencies, fitToSinglePage]);

  return (
    <div className={styles.wrapper}>
      <div 
        className={styles.canvas} 
        ref={containerRef}
        style={{ "--canvas-height": canvasHeight } as React.CSSProperties}
      >
        <div 
          className={styles.scaler} 
          ref={contentRef}
          style={{ 
            transform: `scale(${scale})`, 
            width: virtualWidth,
            // Pass scale to CSS variable for animations
            '--current-scale': scale 
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
