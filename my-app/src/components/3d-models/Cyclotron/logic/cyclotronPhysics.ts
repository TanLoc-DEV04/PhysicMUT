
import { type SimulationParams, type SimulationState, VISUAL_SCALE } from './cyclotronConstants';

export function calculateCyclotronFrequency(params: SimulationParams): number {
    // f = qB / (2πm)
    params.cyclotronFreq = (params.charge * params.magneticField) / (2 * Math.PI * params.mass);
    return params.cyclotronFreq;
}

export function updateParticlePhysics(
    dt: number,
    state: SimulationState,
    params: SimulationParams
) {
    if (state.isExtracted) return;

    state.time += dt;

    // Calculate current cyclotron frequency
    calculateCyclotronFrequency(params);

    // Check if particle is in gap (between Dees)
    const gapSize = 0.1;
    // Gap is roughly along X axis (angle 0 or PI)
    // Simplified check: if angle is close to 0 or PI relative to 2PI
    // Note: The original logic used radius < gapSize OR angle check. 
    // We replicate the angle check: Math.abs(simulationState.angle % Math.PI) < 0.1;
    const inGap =
        state.radius < gapSize ||
        Math.abs(state.angle % Math.PI) < 0.1; // This modulo might behave oddly with negative angles, checking Logic consistency is key.
    
    // Original: Math.abs(simulationState.angle % Math.PI) < 0.1
    // If angle is large negative, % PI keeps it in range (-PI, PI)? JS % operator preserves sign.
    // -3.15 % 3.14 = -0.01. abs(-0.01) = 0.01 < 0.1. Correct.

    if (inGap && !state.isAccelerating) {
        // Particle is being accelerated by electric field
        state.isAccelerating = true;

        // Calculate velocity after acceleration: v = √(2qV/m)
        // We add energy: KE_new = KE_old + qV
        const deltaV = params.voltage;
        const currentKE = 0.5 * params.mass * state.velocity * state.velocity;
        const deltaKE = params.charge * deltaV;
        const newKE = currentKE + deltaKE;

        state.velocity = Math.sqrt((2 * newKE) / params.mass);

        // Update physical radius: r = mv/(qB)
        const physicalRadius = (params.mass * state.velocity) / (params.charge * params.magneticField);

        // Update visual radius
        state.radius = physicalRadius * VISUAL_SCALE;

    } else if (!inGap) {
        state.isAccelerating = false;
    }

    // ALWAYS update GUI parameters for real-time display
    // We use the last calculated physical radius
    const currentPhysicalRadius = (params.mass * state.velocity) / (params.charge * params.magneticField);
    params.currentVelocity = state.velocity;
    params.currentRadius = currentPhysicalRadius || 0;
    
    // Circular motion
    if (state.velocity > 0) {
        const angularVelocity = (params.charge * params.magneticField) / params.mass;

        // Angle decreases because (qB/m) > 0 and we subtract.
        // Original: simulationState.angle -= angularVelocity * dt * params.animationSpeed * 0.05;
        // The 0.05 factor was likely a "slow down for visual" factor in the original code.
        state.angle -= angularVelocity * dt * params.animationSpeed * 0.05;

        // Count revolutions
        if (Math.abs(state.angle) > (state.revolutionCount + 1) * 2 * Math.PI) {
            state.revolutionCount++;
            params.revolutions = state.revolutionCount;
        }
    }
}
