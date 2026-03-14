"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AutoFitWrapper.module.css";

interface AutoFitWrapperProps {
  children: React.ReactNode;
  contentDependencies: any[]; // Triggers recalculation when content changes
}

export default function AutoFitWrapper({ children, contentDependencies }: AutoFitWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [virtualWidth, setVirtualWidth] = useState("100%");

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      // Reset to natural 1x scale to get fresh measurements
      contentRef.current.style.transform = `scale(1)`;
      contentRef.current.style.width = `100%`;
      
      const targetHeight = containerRef.current.clientHeight;
      let contentHeight = contentRef.current.scrollHeight;

      if (contentHeight > targetHeight) {
        let s = targetHeight / contentHeight;
        
        // Iteratively find perfect virtual aspect ratio
        for(let i=0; i<3; i++) {
          contentRef.current.style.width = `${(1 / s) * 100}%`;
          contentHeight = contentRef.current.scrollHeight;
          const virtualTargetHeight = targetHeight / s;
          
          // Easing factor to prevent overshoot
          s = s * Math.pow(virtualTargetHeight / contentHeight, 0.5); 
        }
        
        // Final sanity bounds
        const finalScale = Math.max(s * 0.99, 0.4); // 0.99 margin of safety
        setScale(finalScale);
        setVirtualWidth(`${(1 / finalScale) * 100}%`);
      } else {
        setScale(1);
        setVirtualWidth("100%");
      }
    };

    const timeoutId = setTimeout(calculateScale, 100);
    return () => clearTimeout(timeoutId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...contentDependencies]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvas} ref={containerRef}>
        <div 
          className={styles.scaler} 
          ref={contentRef}
          style={{ 
            transform: `scale(${scale})`, 
            width: virtualWidth 
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
