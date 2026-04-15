
import React, { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import Placeholder from './Placeholder/Placeholder';
import Model3D from '../../pages/(public)/ModelDetail/Model3D';

// Lazy load heavy simulation components
const CyclotronSim = lazy(() => import('./Cyclotron/CyclotronGame'));
const LoudspeakerSim = lazy(() => import('./Loudspeaker/LSGame'));
const MassSpectrometerSim = lazy(() => import('./MassSpectrometry/MSGame'));

interface ModelRegistryProps {
    modelType?: string; // e.g., 'CYCLOTRON', 'MASS_SPECTROMETER'
    modelName?: string;
    description?: string;
    thumbnailUrl?: string; // Fallback image if needed
}

/**
 * ModelRegistry
 * 
 * This component decides WHICH 3D component to render based on the model type/ID.
 * It handles lazy loading to keep the initial bundle size small.
 */
const ModelRegistry: React.FC<ModelRegistryProps> = ({ 
    modelType, 
    modelName, 
    description,
    thumbnailUrl 
}) => {
    
    // Normalize model type for comparison (case-insensitive)
    const normalizedType = modelType?.toUpperCase().trim();

    const renderContent = () => {
        switch (normalizedType) {
            case 'CYCLOTRON':
                return <CyclotronSim />;
            
            case 'MASS_SPECTROMETER':
            case 'MASS-SPECTROMETER': // Handle potential variant
                 return <MassSpectrometerSim />;

            case 'LOUDSPEAKER':
            case 'SPEAKER':
                 return <LoudspeakerSim />;

            default:
                // Default fallback: If we have a thumbnail, show it (static mode)
                // Otherwise show the placeholder
                if (thumbnailUrl) {
                    return (
                        <div className="w-full h-full relative group">
                             <img 
                                src={thumbnailUrl} 
                                alt={modelName} 
                                className="w-full h-full object-contain" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-bold">Mô hình tĩnh (GLTF View chưa kích hoạt)</p>
                            </div>
                        </div>
                    );
                }
                return <Placeholder modelName={modelName || ''} description={description} />;
        }
    };

    return (
        <Model3D title={modelName}>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Spin size="large" />
                    <p className="text-gray-500">Đang tải mô phỏng 3D...</p>
                </div>
            }>
                {renderContent()}
            </Suspense>
        </Model3D>
    );
};

export default ModelRegistry;
