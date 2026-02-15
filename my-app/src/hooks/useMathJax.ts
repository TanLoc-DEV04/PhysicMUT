import { useEffect } from 'react';

/**
 * Custom hook to trigger MathJax typesetting when content changes.
 * @param content The HTML content that contains MathJax formulas.
 */
export const useMathJax = (content?: string) => {
  useEffect(() => {
    if ((window as any).MathJax && content) {
      // Use a small timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        (window as any).MathJax.typesetPromise();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [content]);
};
