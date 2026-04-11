import type { GameState, BadgeId } from './cyclotronConstants';

export const TARGET_ENERGY_MEV = 8.0;
export const TARGET_TOLERANCE_MEV = 0.4;
export const MISSION1_REQUIRED_HITS = 5;

const STORAGE_KEY = 'cyclotron_game_data';

// ─── Serialisable snapshot ────────────────────────────────────────────────────
interface StoredData {
    badges: BadgeId[];
    cosmeticSkin: GameState['cosmeticSkin'];
    particleColor: GameState['particleColor'];
    streakCount: number;
    lastVisitDate: string; // ISO date string YYYY-MM-DD
}

function toISODate(d: Date) {
    return d.toISOString().slice(0, 10);
}

export function createInitialGameState(): GameState {
    const stored = loadStoredData();
    const today = toISODate(new Date());
    let streak = stored?.streakCount ?? 0;
    if (stored) {
        const lastVisit = new Date(stored.lastVisitDate);
        const diffDays = Math.round(
            (new Date(today).getTime() - lastVisit.getTime()) / 86_400_000
        );
        if (diffDays === 1) streak += 1;        // consecutive day
        else if (diffDays > 1) streak = 1;      // streak broken
        // diffDays === 0 → same day, keep streak
    } else {
        streak = 1;
    }

    return {
        mode: 'free',
        perfectHits: 0,
        autoSyncEnabled: false,
        autoSyncIntervalId: null,
        eFieldPolarity: 1,
        targetReached: false,
        particle2Type: 'Alpha',
        m3Answer1: '',
        m3Answer2: '',
        badges: new Set<BadgeId>(stored?.badges ?? []),
        cosmeticSkin: stored?.cosmeticSkin ?? 'default',
        particleColor: stored?.particleColor ?? 'blue',
        streakCount: streak,
    };
}

function loadStoredData(): StoredData | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredData;
    } catch {
        return null;
    }
}

export function persistGameState(state: GameState) {
    const data: StoredData = {
        badges: Array.from(state.badges) as BadgeId[],
        cosmeticSkin: state.cosmeticSkin,
        particleColor: state.particleColor,
        streakCount: state.streakCount,
        lastVisitDate: toISODate(new Date()),
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // ignore storage errors
    }
}

export function awardBadge(state: GameState, badgeId: BadgeId): boolean {
    if (state.badges.has(badgeId)) return false; // already have it
    state.badges.add(badgeId);
    persistGameState(state);
    return true;
}
