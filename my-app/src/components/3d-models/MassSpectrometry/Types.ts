export interface SimulationParams {
    // 1. System
    isRunning: boolean;
    simulationSpeed: number;
    
    // 2. Sample
    isotope: string; // 'Carbon-12', 'Carbon-14', 'Custom'
    customMass: number; // amu
    customCharge: number; // e
    particleSkin: string; // 'Standard', 'Glow', 'Metallic', 'Ghost'
    
    // 3. Machine
    heaterTemp: number; // Độ C (Ảnh hưởng rung động hạt ở buồng A)
    electronEnergy: number; // eV (Ảnh hưởng xác suất ion hóa ở buồng B)
    voltage: number; // Volts (U - Buồng C-D)
    magneticField: number; // Tesla (B - Buồng D-E)
    
    // 4. Visuals
    housingOpacity: number;
    showFieldLines: boolean;
    showForces: boolean;
}

export const ISOTOPE_PRESETS: { [key: string]: { mass: number; charge: number; color: number; name: string } } = {
    'C-12': { mass: 12.0, charge: 1, color: 0x00ff00, name: 'Carbon-12' },
    'C-13': { mass: 13.003, charge: 1, color: 0xffff00, name: 'Carbon-13' },
    'C-14': { mass: 14.003, charge: 1, color: 0xff0000, name: 'Carbon-14 (Radioactive)' },
    'Mix': { mass: 0, charge: 0, color: 0xffffff, name: 'Hỗn hợp mẫu' }
};
