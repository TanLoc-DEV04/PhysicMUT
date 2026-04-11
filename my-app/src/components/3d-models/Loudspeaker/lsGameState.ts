import type { LSBadgeId, LSGameState } from './types';

const LS_KEY = 'physicmut_ls_game_v1';

interface StoredLS {
    badges:      LSBadgeId[];
    streakCount: number;
    lastPlayDate: string;
}

function loadStored(): StoredLS {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw) as StoredLS;
    } catch { /* ignore */ }
    return { badges: [], streakCount: 0, lastPlayDate: '' };
}

export function persistLSGameState(gs: LSGameState) {
    try {
        const s: StoredLS = {
            badges:       Array.from(gs.badges) as LSBadgeId[],
            streakCount:  gs.streakCount,
            lastPlayDate: gs.lastPlayDate,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch { /* ignore */ }
}

function computeStreak(stored: StoredLS): { streakCount: number; lastPlayDate: string } {
    const today = new Date().toISOString().slice(0, 10);
    if (!stored.lastPlayDate) return { streakCount: 1, lastPlayDate: today };
    const diff = Math.round(
        (new Date(today).getTime() - new Date(stored.lastPlayDate).getTime()) / 86400000
    );
    if (diff === 0) return { streakCount: stored.streakCount,     lastPlayDate: stored.lastPlayDate };
    if (diff === 1) return { streakCount: stored.streakCount + 1, lastPlayDate: today };
    return { streakCount: 1, lastPlayDate: today };
}

export function createInitialLSGameState(): LSGameState {
    const stored = loadStored();
    const { streakCount, lastPlayDate } = computeStreak(stored);
    const state: LSGameState = {
        mode:         'free',
        badges:       new Set(stored.badges),
        streakCount,
        lastPlayDate,
        currentFMax:  0,
        currentFreq:  20,
        isVacuum:     false,
    };
    persistLSGameState(state);
    return state;
}

export function awardLSBadge(gs: LSGameState, id: LSBadgeId): boolean {
    if (gs.badges.has(id)) return false;
    gs.badges.add(id);
    persistLSGameState(gs);
    return true;
}

// ── Mission physics constants ─────────────────────────────────────────────────
export const M1_B          = 0.35;   // Tesla
export const M1_L          = 0.25;   // metres
export const M1_TARGET_F   = 0.175;  // Newton
export const M1_TARGET_I   = M1_TARGET_F / (M1_B * M1_L);  // = 2.0 A
export const M1_TOLERANCE  = 0.05;   // A

export const M2_ULTRASOUND = 20000;  // Hz — human upper limit
