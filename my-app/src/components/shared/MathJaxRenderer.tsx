import React, { useEffect, useRef } from 'react';

interface MathJaxRendererProps {
  html: string;
  className?: string;
}

// Global queue to ensure MathJax typesetPromise calls execute sequentially.
// This prevents async bottleneck crashes when many formulas load/render at once.
let mathJaxPromise: Promise<any> = Promise.resolve();

const MathJaxRenderer = React.memo(({ html, className = '' }: MathJaxRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only queue if MathJax is loaded and the container exists
    if ((window as any).MathJax && containerRef.current) {
      // Chain the new typesetting request onto the global promise queue
      mathJaxPromise = mathJaxPromise
        .then(() => {
          // Double check container still exists when promise resolves in the queue
          if (!containerRef.current) return Promise.resolve();
          
          (window as any).MathJax.typesetClear([containerRef.current]);
          return (window as any).MathJax.typesetPromise([containerRef.current]);
        })
        .catch((err: any) => {
          console.warn('MathJax error:', err);
        });
    }
  }, [html]); // Re-run whenever HTML content changes

  return (
    <div 
      ref={containerRef} 
      className={className} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
});

export default MathJaxRenderer;
