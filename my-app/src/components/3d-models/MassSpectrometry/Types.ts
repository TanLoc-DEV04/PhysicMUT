export type MSGameMode = 'free' | 'mission1' | 'mission2' | 'mission3';
export type MSBadgeId  = 'CALIBRATOR' | 'ISOTOPE_HUNTER' | 'NUCLEAR_MED_TECH';

export interface MSBadge {
    id: MSBadgeId;
    name: string;
    emoji: string;
    description: string;
}

export const MS_BADGES: Record<MSBadgeId, MSBadge> = {
    CALIBRATOR:       { id: 'CALIBRATOR',       name: 'Hiệu chuẩn viên', emoji: '🎯', description: 'Hiệu chuẩn thành công máy quang phổ' },
    ISOTOPE_HUNTER:   { id: 'ISOTOPE_HUNTER',   name: 'Thợ săn Đồng vị',  emoji: '⚗️', description: 'Tách 50 hạt mỗi loại vào đúng rổ' },
    NUCLEAR_MED_TECH: { id: 'NUCLEAR_MED_TECH', name: 'Kỹ sư Y tế Hạt nhân', emoji: '🏥', description: 'Tách chính xác I-127 và I-131' },
};

export interface MSGameState {
    mode:    MSGameMode;
    badges:  Set<MSBadgeId>;
    streakCount: number;
    lastPlayDate: string;
    // M1
    m1Calibrated: boolean;
    // M2
    m2Bin1Count: number;
    m2Bin2Count: number;
    // M3
    m3Bin1Count: number;
    m3Bin2Count: number;
    // Spectrum data
    spectrumCounts: Record<string, number>;
}

export interface SimulationParams {
    // 1. System
    isRunning:       boolean;
    simulationSpeed: number;

    // 2. Sample
    isotope:       string; // 'C-12','C-14','I-127','I-131','Mix','Iodine-Mix'
    customMass:    number; // amu
    customCharge:  number; // e
    particleSkin:  string;

    // 3. Machine
    heaterTemp:     number; // °C
    electronEnergy: number; // eV
    voltage:        number; // V
    magneticField:  number; // T

    // 4. Visuals
    housingOpacity: number;
    showFieldLines: boolean;
    showForces:     boolean;

    // 5. Game runtime (read by ParticleSystem)
    gameMode:   MSGameMode;
    bin1TargetR: number;   // visual units
    bin2TargetR: number;
}

export const ISOTOPE_PRESETS: Record<string, { mass: number; charge: number; color: number; name: string }> = {
    'C-12':  { mass: 12.000, charge: 1, color: 0x44ff88, name: 'Carbon-12'  },
    'C-13':  { mass: 13.003, charge: 1, color: 0xffff44, name: 'Carbon-13'  },
    'C-14':  { mass: 14.003, charge: 1, color: 0xff4444, name: 'Carbon-14 (Phóng xạ)' },
    'I-127': { mass: 126.905, charge: 1, color: 0x44aaff, name: 'Iodine-127 (Ổn định)' },
    'I-131': { mass: 130.906, charge: 1, color: 0xff8822, name: 'Iodine-131 (Phóng xạ)' },
    'Mix':         { mass: 0, charge: 0, color: 0xffffff, name: 'Hỗn hợp C-12 + C-14' },
    'Iodine-Mix':  { mass: 0, charge: 0, color: 0xffffff, name: 'Hỗn hợp I-127 + I-131' },
};
