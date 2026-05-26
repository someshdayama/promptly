"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AutoFitWrapper.module.css";

interface AutoFitWrapperProps {
  children: React.ReactNode;
  contentDependencies: any[]; // Triggers recalculation when content changes
}

/**
 * AutoFitWrapper intelligently scales the resume content to fit perfectly
 * on a single A4 page. It scales down to prevent overflow and scales up
 * to fill empty space, ensuring a professional, balanced look.
 */
export default function AutoFitWrapper({ children, contentDependencies }: AutoFitWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [virtualWidth, setVirtualWidth] = useState("100%");

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      // Reset to natural 1x scale and 100% width to get fresh measurements
      contentRef.current.style.transform = `scale(1)`;
      contentRef.current.style.width = `100%`;
      
      const targetHeight = containerRef.current.clientHeight;
      let contentHeight = contentRef.current.scrollHeight;

      // If content is too long -> Scale DOWN
      if (contentHeight > targetHeight) {
        let s = targetHeight / contentHeight;
        
        // Iteratively find perfect virtual aspect ratio (2 passes is usually enough)
        for(let i=0; i<2; i++) {
          contentRef.current.style.width = `${(1 / s) * 100}%`;
          contentHeight = contentRef.current.scrollHeight;
          const virtualTargetHeight = targetHeight / s;
          s = s * (virtualTargetHeight / contentHeight); 
        }
        
        const finalScale = Math.max(s * 0.98, 0.4); // 2% safety margin
        setScale(finalScale);
        setVirtualWidth(`${(1 / finalScale) * 100}%`);
      } 
      // If content is too short -> Scale UP to fill the page (max 1.25x to avoid looking "blown up")
      else if (contentHeight < targetHeight * 0.9) {
        let s = targetHeight / contentHeight;
        const cappedScale = Math.min(s * 0.95, 1.25); // Cap at 1.25x
        
        setScale(cappedScale);
        setVirtualWidth(`${(1 / cappedScale) * 100}%`);
      }
      // Otherwise, stay at 1x
      else {
        setScale(1);
        setVirtualWidth("100%");
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
    
  }, [...contentDependencies]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvas} ref={containerRef}>
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
