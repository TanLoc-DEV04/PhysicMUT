import React from 'react';

interface MassSpectrumGraphProps {
    data: { [mz: string]: number };
}

export const MassSpectrumGraph: React.FC<MassSpectrumGraphProps> = ({ data }) => {
    // Convert data to array for sorting and rendering
    const bars = Object.entries(data)
        .map(([mz, count]) => ({ mz: parseFloat(mz), count }))
        .sort((a, b) => a.mz - b.mz);

    const maxCount = Math.max(...bars.map(b => b.count), 10); // Minimum scale 10

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '400px',
            height: '250px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '15px',
            color: '#fff',
            fontFamily: 'monospace',
            zIndex: 1000
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid #666', paddingBottom: '5px' }}>
                📊 Mass Spectrum (Recorder)
            </h3>
            <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                height: '180px', 
                gap: '10px',
                overflowX: 'auto'
            }}>
                {bars.map((bar) => {
                    const heightPercent = (bar.count / maxCount) * 100;
                    return (
                        <div key={bar.mz} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            width: '40px' 
                        }}>
                            <div style={{ fontSize: '10px', marginBottom: '2px' }}>{bar.count}</div>
                            <div style={{
                                width: '100%',
                                height: `${Math.max(heightPercent, 1)}%`,
                                backgroundColor: getBarColor(bar.mz),
                                borderRadius: '2px 2px 0 0',
                                transition: 'height 0.3s'
                            }} />
                            <div style={{ fontSize: '10px', marginTop: '2px' }}>{bar.mz.toFixed(1)}</div>
                        </div>
                    );
                })}
                {bars.length === 0 && <div style={{ width: '100%', textAlign: 'center', color: '#888', alignSelf: 'center' }}>No Data</div>}
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px', color: '#aaa' }}>m/z Ratio</div>
        </div>
    );
};

function getBarColor(mz: number): string {
    // Match colors with presets roughly
    if (Math.abs(mz - 12) < 0.5) return '#00ff00'; // C-12
    if (Math.abs(mz - 14) < 0.5) return '#ff0000'; // C-14
    if (Math.abs(mz - 13) < 0.5) return '#ffff00'; // C-13
    return '#00ffff'; // Others
}
