import type { SimulationState, SimulationParams, GameState } from './cyclotronConstants';
import { MISSION1_REQUIRED_HITS, TARGET_ENERGY_MEV, TARGET_TOLERANCE_MEV } from './gameState';
import { awardBadge } from './gameState';

// ─── Callbacks interface ─────────────────────────────────────────────────────
export interface MissionCallbacks {
    onPerfectHit: (hits: number) => void;
    onMiss: () => void;
    onBadgeEarned: (badgeId: string, badgeName: string, emoji: string) => void;
    onMission1Unlocked: () => void;
    onMission2Result: (success: boolean, actualMev: number) => void;
    onMission3Result: (success: boolean) => void;
    onAutoSyncEnabled: (freq: number) => void;
    onFlash: (color: number) => void;
}

// ─── Mission 1: Rhythm Game ──────────────────────────────────────────────────
export function handleSpacePress(
    gameState: GameState,
    simState: SimulationState,
    params: SimulationParams,
    callbacks: MissionCallbacks
) {
    if (gameState.mode !== 'mission1') return;

    // Flip polarity
    gameState.eFieldPolarity = (gameState.eFieldPolarity === 1 ? -1 : 1) as 1 | -1;

    const inGap = simState.isInGapNow;

    if (inGap) {
        // Check alignment: particle moving right (positive x dir) needs positive E, etc.
        gameState.perfectHits++;
        callbacks.onPerfectHit(gameState.perfectHits);
        callbacks.onFlash(0x00ff88);

        if (gameState.perfectHits >= MISSION1_REQUIRED_HITS && !gameState.autoSyncEnabled) {
            // Unlock auto-sync
            gameState.autoSyncEnabled = true;
            const freq = (params.charge * params.magneticField) / (2 * Math.PI * params.mass);
            callbacks.onAutoSyncEnabled(freq);

            if (awardBadge(gameState, 'RESONANCE_MASTER')) {
                callbacks.onBadgeEarned('RESONANCE_MASTER', 'Bậc thầy Cộng hưởng', '⚡');
            }
            callbacks.onMission1Unlocked();
        }
    } else {
        // Miss – reset streak
        gameState.perfectHits = 0;
        callbacks.onMiss();
        callbacks.onFlash(0xff2200);
    }
}

// Auto-sync: flip eFieldPolarity every half-period
// params are optional; if not supplied we use Proton + B=1T as default
export function startAutoSync(
    gameState: GameState,
    callbacks: MissionCallbacks,
    B = 1.0,
    mass = 1.67e-27,
    charge = 1.6e-19
) {
    if (gameState.autoSyncIntervalId) clearInterval(gameState.autoSyncIntervalId);
    const freq = (charge * B) / (2 * Math.PI * mass);
    const halfPeriodMs = (1 / freq) * 500; // ms
    // Cap to sane browser interval range
    const intervalMs = Math.max(50, Math.min(halfPeriodMs, 2000));

    callbacks.onAutoSyncEnabled(freq);

    gameState.autoSyncIntervalId = setInterval(() => {
        gameState.eFieldPolarity = (gameState.eFieldPolarity === 1 ? -1 : 1) as 1 | -1;
    }, intervalMs);
}

export function stopAutoSync(gameState: GameState) {
    if (gameState.autoSyncIntervalId) {
        clearInterval(gameState.autoSyncIntervalId);
        gameState.autoSyncIntervalId = null;
    }
}

// ─── Mission 2: Target Energy ────────────────────────────────────────────────
export function fireMission2(
    gameState: GameState,
    params: SimulationParams,
    callbacks: MissionCallbacks
) {
    // Compute expected exit KE from formula: Wd_max = q²B²R²/(2m)
    const R = params.maxRadius / 50; // VISUAL_SCALE = 50 → real radius in meters
    const q = params.charge;
    const B = params.magneticField;
    const m = params.mass;
    const wdJoules = (q * q * B * B * R * R) / (2 * m);
    const wdMev = wdJoules / 1.6e-13;

    const success = Math.abs(wdMev - TARGET_ENERGY_MEV) <= TARGET_TOLERANCE_MEV;
    callbacks.onMission2Result(success, wdMev);

    if (success) {
        if (awardBadge(gameState, 'NUCLEAR_HEALER')) {
            callbacks.onBadgeEarned('NUCLEAR_HEALER', 'Xạ thủ Y học Hạt nhân', '🏥');
        }
    }
}

// ─── Mission 3: Isotope Mystery ──────────────────────────────────────────────
// Return which particle should have larger orbital radius based on r = mv/(qB)
// At same speed: alpha (4×mass, 2×charge) → r_alpha/r_proton = (4/2) = 2
// So particle1 (larger orbit) = Alpha, particle2 (smaller orbit) = Proton
export const MISSION3_CORRECT = { larger: 'Alpha', smaller: 'Proton' } as const;

export function checkMission3Answer(
    gameState: GameState,
    answerLarger: string,
    answerSmaller: string,
    callbacks: MissionCallbacks
) {
    const correct =
        answerLarger === MISSION3_CORRECT.larger &&
        answerSmaller === MISSION3_CORRECT.smaller;

    callbacks.onMission3Result(correct);

    if (correct) {
        if (awardBadge(gameState, 'PHYSICS_EYE')) {
            callbacks.onBadgeEarned('PHYSICS_EYE', 'Đôi mắt Vật lý', '👁️');
        }
    }
}
