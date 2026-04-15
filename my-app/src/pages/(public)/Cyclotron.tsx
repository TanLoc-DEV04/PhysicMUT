import { useEffect, useRef, useState } from 'react';
import { Cyclotron3DService } from '../../services/cyclotron3d.service';

function Cyclotron() {
  const containerRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<Cyclotron3DService | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize service

    
    // Correct structure:
    let cleanup: (() => void) | undefined;

    if (containerRef.current) {
        try {
            const service = new Cyclotron3DService();
            serviceRef.current = service;
            service.initialize(containerRef.current);

            const resizeObserver = new ResizeObserver((entries) => {
                 for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    service.resize(width, height);
                 }
            });
            resizeObserver.observe(containerRef.current);

            cleanup = () => {
                resizeObserver.disconnect();
                service.dispose();
                serviceRef.current = null;
            };
        } catch (err) {
             console.error(err);
             setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    return () => {
        if (cleanup) cleanup();
    };
  }, []); // Run once on mount

  return (
    <div className="w-full h-full relative bg-black min-h-screen">
       <div ref={containerRef} className="w-full h-full min-h-[600px] block absolute inset-0"></div>
       
       {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-75">
            <div className="p-8 text-center text-red-600 bg-red-100 border border-red-600 rounded m-8">
                <p className="font-semibold">Lỗi: {error}</p>
            </div>
        </div>
       )}

       {/* Optional controls toggle button (can be added later if needed) */}
    </div>
  );
}

export default Cyclotron;
