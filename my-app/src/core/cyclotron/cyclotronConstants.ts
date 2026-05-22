
export const VISUAL_SCALE = 50;

export const PARTICLE_TYPES = {
    Proton:     { mass: 1.67e-27,  charge: 1.6e-19,  color: 0xffffaa, label: "Proton" },
    Deuteron:   { mass: 3.34e-27,  charge: 1.6e-19,  color: 0x88ffaa, label: "Deuteron" },
    Alpha:      { mass: 6.64e-27,  charge: 3.2e-19,  color: 0xff8866, label: "Alpha" },
    "Heavy Ion":{ mass: 1.0e-26,   charge: 4.8e-19,  color: 0xcc88ff, label: "Heavy Ion" },
};

// ─── Game Mode ───────────────────────────────────────────────────────────────
export type GameMode = "free" | "mission1" | "mission2" | "mission3";

export const BADGES = {
    RESONANCE_MASTER: {
        id: "RESONANCE_MASTER",
        name: "Bậc thầy Cộng hưởng",
        emoji: "⚡",
        description: "Hoàn thành 5 lần đảo cực chuẩn nhịp liên tiếp",
        mission: 1,
    },
    NUCLEAR_HEALER: {
        id: "NUCLEAR_HEALER",
        name: "Xạ thủ Y học Hạt nhân",
        emoji: "🏥",
        description: "Bắn chùm hạt Deuteron đúng 8.0 MeV điều trị khối u",
        mission: 2,
    },
    PHYSICS_EYE: {
        id: "PHYSICS_EYE",
        name: "Đôi mắt Vật lý",
        emoji: "👁",
        description: "Xác định đúng đồng vị hạt bí ẩn",
        mission: 3,
    },
} as const;

export type BadgeId = keyof typeof BADGES;

export type CosmedicSkin = "default" | "xray" | "cyberpunk";
export type ParticleColor = "blue" | "red" | "purple" | "orange";

export interface GameState {
    mode: GameMode;
    // Mission 1
    perfectHits: number;
    autoSyncEnabled: boolean;
    autoSyncIntervalId: ReturnType<typeof setInterval> | null;
    eFieldPolarity: 1 | -1;
    // Mission 2
    targetReached: boolean;
    // Mission 3
    particle2Type: "Proton" | "Alpha";
    m3Answer1: string;
    m3Answer2: string;
    // Rewards
    badges: Set<BadgeId>;
    cosmeticSkin: CosmedicSkin;
    particleColor: ParticleColor;
    // Streaks
    streakCount: number;
}

// ─── Simulation interfaces (unchanged) ───────────────────────────────────────
export interface SimulationParams {
    particleType: string;
    mass: number;
    charge: number;
    voltage: number;
    magneticField: number;
    maxRadius: number;
    oscillationFreq: number;
    showFieldLines: boolean;
    animateFieldLines: boolean;
    fieldAnimationSpeed: number;
    animationSpeed: number;
    isRunning: boolean;
    showEField: boolean;
    showTrajectory: boolean;
    
    // Computed
    cyclotronFreq: number;
    currentRadius: number;
    currentVelocity: number;
    revolutions: number;
    kineticEnergyMeV: number;
    extractParticle: boolean;

    // LC Oscillator parameters
    lc_L: number; // Inductance (H)
    lc_C: number; // Capacitance (F)
    lc_R: number; // Resistance (Ohm)
    lc_isOn: boolean; // Oscillator Power state
    lc_frequency: number; // Angular frequency w = 1/sqrt(LC)
    showOscilloscope: boolean;
}

export interface SimulationState {
    angle: number;
    radius: number;
    velocity: number;
    isInDee: boolean;
    currentDee: number;
    revolutionCount: number;
    isAccelerating: boolean;
    time: number;
    isExtracted: boolean;
    isInGapNow: boolean;
}

export interface OscillatorState {
    q: number; // Charge (Coulomb)
    i: number; // Current (Ampere)
    historyQ: number[]; // History for SVG
    historyI: number[]; // History for SVG
}
