import type { MSBadgeId, MSGameState } from './Types';

const LS_KEY = 'physicmut_ms_game_v1';

// ── Persistence ───────────────────────────────────────────────────────────────
interface StoredMS {
    badges: MSBadgeId[];
    streakCount: number;
    lastPlayDate: string;
}

function loadStored(): StoredMS {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw) as StoredMS;
    } catch { /* ignore */ }
    return { badges: [], streakCount: 0, lastPlayDate: '' };
}

export function persistMSGameState(gs: MSGameState) {
    try {
        const stored: StoredMS = {
            badges:       Array.from(gs.badges) as MSBadgeId[],
            streakCount:  gs.streakCount,
            lastPlayDate: gs.lastPlayDate,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
    } catch { /* ignore */ }
}

// ── Streak ────────────────────────────────────────────────────────────────────
function computeStreak(stored: StoredMS): { streakCount: number; lastPlayDate: string } {
    const today = new Date().toISOString().slice(0, 10);
    if (!stored.lastPlayDate) return { streakCount: 1, lastPlayDate: today };

    const last = new Date(stored.lastPlayDate);
    const now  = new Date(today);
    const diff = Math.round((now.getTime() - last.getTime()) / 86400000);

    if (diff === 0)  return { streakCount: stored.streakCount,     lastPlayDate: stored.lastPlayDate };
    if (diff === 1)  return { streakCount: stored.streakCount + 1, lastPlayDate: today };
    return { streakCount: 1, lastPlayDate: today };
}

// ── Initial State ─────────────────────────────────────────────────────────────
export function createInitialMSGameState(): MSGameState {
    const stored  = loadStored();
    const { streakCount, lastPlayDate } = computeStreak(stored);

    const state: MSGameState = {
        mode:    'free',
        badges:  new Set(stored.badges),
        streakCount,
        lastPlayDate,
        m1Calibrated:  false,
        m2Bin1Count:   0,
        m2Bin2Count:   0,
        m3Bin1Count:   0,
        m3Bin2Count:   0,
        spectrumCounts: {},
    };

    persistMSGameState(state); // update streak date
    return state;
}

// ── Badge Awarding ────────────────────────────────────────────────────────────
export function awardMSBadge(gs: MSGameState, id: MSBadgeId): boolean {
    if (gs.badges.has(id)) return false;
    gs.badges.add(id);
    persistMSGameState(gs);
    return true;
}

// ── Target counts ─────────────────────────────────────────────────────────────
export const M2_TARGET_COUNT = 30;  // 30 per bin to win (reduced from 50 for UX)
export const M3_TARGET_COUNT = 20;
