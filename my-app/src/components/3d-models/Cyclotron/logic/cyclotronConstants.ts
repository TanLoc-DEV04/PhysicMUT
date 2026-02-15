
export const VISUAL_SCALE = 50;

export const PARTICLE_TYPES = {
    Proton: { mass: 1.67e-27, charge: 1.6e-19 },
    Deuteron: { mass: 3.34e-27, charge: 1.6e-19 },
    Alpha: { mass: 6.64e-27, charge: 3.2e-19 },
    "Heavy Ion": { mass: 1.0e-26, charge: 4.8e-19 },
};

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
    
    // Computed values
    cyclotronFreq: number;
    currentRadius: number;
    currentVelocity: number;
    revolutions: number;
    extractParticle: boolean;
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
}
