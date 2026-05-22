
import { type SimulationParams, type SimulationState, VISUAL_SCALE } from './cyclotronConstants';

export function calculateCyclotronFrequency(params: SimulationParams): number {
    // f = qB / (2πm)
    params.cyclotronFreq = (params.charge * params.magneticField) / (2 * Math.PI * params.mass);
    return params.cyclotronFreq;
}

export function checkIsInGap(state: SimulationState): boolean {
    const gapSize = 0.15;
    // Gap is the Z-axis (x = 0), which means angle is PI/2 or -PI/2
    return (
        state.radius < gapSize ||
        Math.abs((state.angle % Math.PI)) > Math.PI / 2 - 0.15 && Math.abs((state.angle % Math.PI)) < Math.PI / 2 + 0.15 ||
        Math.abs(Math.abs(state.angle % Math.PI) - Math.PI / 2) < 0.12
    );
}

export function updateParticlePhysics(
    dt: number,
    state: SimulationState,
    params: SimulationParams
): { justExtracted: boolean } {
    if (state.isExtracted) return { justExtracted: false };

    state.time += dt;

    calculateCyclotronFrequency(params);

    const inGap = checkIsInGap(state);
    state.isInGapNow = inGap;

    if (inGap && !state.isAccelerating) {
        // --- REAL RESONANCE LOGIC ---
        // 1. Calculate the resonance omega
        const omega = (Math.abs(params.charge) * params.magneticField) / params.mass;
        // 2. Voltage phase at current simulation time (scaled for visual stability)
        const phaseValue = Math.cos(omega * state.time * 1e-7);
        
        // 3. Direction check
        // cos(angle) > 0 means we are on the Right half (towards Right/D2)
        // With angle decreasing:
        // At Top (angle ~= -1.5PI): we go Left -> Right. Needs phaseValue > 0
        // At Bottom (angle ~= -0.5PI): we go Right -> Left. Needs phaseValue < 0
        
        const isAtTop = Math.sin(state.angle) > 0; // z > 0
        const isAtBottom = Math.sin(state.angle) < 0; // z < 0
        
        let canAccelerate = false;
        if (isAtTop && phaseValue > 0) canAccelerate = true;    // Path D1 -> D2, Field D1 -> D2
        if (isAtBottom && phaseValue < 0) canAccelerate = true; // Path D2 -> D1, Field D2 -> D1
        
        // Check for radius < small value (initial emission)
        if (state.radius < 0.2) canAccelerate = true; 

        if (canAccelerate) {
            state.isAccelerating = true;
            const deltaV = params.voltage;
            const currentKE = 0.5 * params.mass * state.velocity * state.velocity;
            const deltaKE = Math.abs(params.charge) * deltaV;
            const newKE = currentKE + deltaKE;

            state.velocity = Math.sqrt((2 * newKE) / params.mass);

            // Update physical radius: r = mv/(qB)
            const physicalRadius = (params.mass * state.velocity) / (Math.abs(params.charge) * params.magneticField);
            state.radius = physicalRadius * VISUAL_SCALE;
        }

    } else if (!inGap) {
        state.isAccelerating = false;
    }

    // Update GUI readings
    const physRadius = (params.mass * state.velocity) / (Math.abs(params.charge) * params.magneticField);
    params.currentVelocity = state.velocity;
    params.currentRadius   = physRadius || 0;

    // Kinetic energy in MeV
    const joules = 0.5 * params.mass * state.velocity * state.velocity;
    params.kineticEnergyMeV = joules / 1.6e-13;

    // Circular motion
    if (state.velocity > 0) {
        const angularVelocity = (Math.abs(params.charge) * params.magneticField) / params.mass;
        state.angle -= angularVelocity * dt * 1e-7;

        if (Math.abs(state.angle) > (state.revolutionCount + 1) * 2 * Math.PI) {
            state.revolutionCount++;
            params.revolutions = state.revolutionCount;
        }
    }

    return { justExtracted: false };
}
