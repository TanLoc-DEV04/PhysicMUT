import type { MSGameState, MSGameMode } from "./Types";
import { awardMSBadge, M2_TARGET_COUNT, M3_TARGET_COUNT } from "./msGameState";

// ─── Physics constants ────────────────────────────────────────────────────────
// const AMU   = 1.66053906660e-27; // kg
// const E_CHG = 1.60217663e-19;    // C
const K_B = 0.55; // Same visual scale as ParticleSystem
const K_V = 0.05; // Same velocity scale as ParticleSystem

/** Compute visual R for a given isotope preset keyed by amu, charge, and current U & B */
export function computeVisualR(
  massAmu: number,
  chargeE: number,
  voltage: number,
  magField: number,
): number {
  const v = Math.sqrt((2 * chargeE * voltage) / massAmu) * K_V;
  return ((massAmu * v) / (chargeE * magField)) * K_B;
}

// ─── Callbacks ────────────────────────────────────────────────────────────────
export interface MSCallbacks {
  onBinHit: (binIndex: 1 | 2 | 3, isotope: string) => void;
  onBinMiss: (isotope: string) => void;
  onMissionComplete: (mode: MSGameMode) => void;
  onBadgeEarned: (id: string, name: string, emoji: string) => void;
  onSpectrumUpdate: (key: string, count: number) => void;
}

// ─── Bin-hit logic (called from ParticleSystem) ────────────────────────────────
export function checkDetectorBin(
  gs: MSGameState,
  massAmu: number,
  chargeE: number,
  actualR: number,
  isotopeName: string,
  callbacks: MSCallbacks,
  bin1R: number,
  bin2R: number,
) {
  // Tolerance depends on mission
  const tolerance = gs.mode === "mission3" ? 0.35 : 0.9;

  const hitBin1 = Math.abs(actualR - bin1R) < tolerance;
  const hitBin2 = Math.abs(actualR - bin2R) < tolerance;

  const mz = (massAmu / chargeE).toFixed(1);

  if (hitBin1) {
    callbacks.onBinHit(1, isotopeName);
    gs.spectrumCounts[`Bin1_${mz}`] =
      (gs.spectrumCounts[`Bin1_${mz}`] || 0) + 1;
    callbacks.onSpectrumUpdate(`Bin1_${mz}`, gs.spectrumCounts[`Bin1_${mz}`]);
  } else if (hitBin2) {
    callbacks.onBinHit(2, isotopeName);
    gs.spectrumCounts[`Bin2_${mz}`] =
      (gs.spectrumCounts[`Bin2_${mz}`] || 0) + 1;
    callbacks.onSpectrumUpdate(`Bin2_${mz}`, gs.spectrumCounts[`Bin2_${mz}`]);
  } else {
    callbacks.onBinMiss(isotopeName);
    return;
  }

  _checkMissionProgress(gs, callbacks);
}

// ─── Per-hit side effects ──────────────────────────────────────────────────────
function _checkMissionProgress(gs: MSGameState, callbacks: MSCallbacks) {
  const { mode } = gs;

  if (mode === "mission1") {
    if (gs.m1Calibrated) return;
    // Bin 1 hit for the calibration mission
    if (gs.spectrumCounts["Bin1_12.0"] >= 1) {
      gs.m1Calibrated = true;
      if (awardMSBadge(gs, "CALIBRATOR")) {
        callbacks.onBadgeEarned("CALIBRATOR", "Hiệu chuẩn viên", "🎯");
      }
      callbacks.onMissionComplete("mission1");
    }
  } else if (mode === "mission2") {
    // Count green (C-12 at ~12.0) in Bin1, red (C-14 at ~14.0) in Bin2
    const c12Bin1 = gs.spectrumCounts["Bin1_12.0"] || 0;
    const c14Bin2 = gs.spectrumCounts["Bin2_14.0"] || 0;
    gs.m2Bin1Count = c12Bin1;
    gs.m2Bin2Count = c14Bin2;

    if (c12Bin1 >= M2_TARGET_COUNT && c14Bin2 >= M2_TARGET_COUNT) {
      if (awardMSBadge(gs, "ISOTOPE_HUNTER")) {
        callbacks.onBadgeEarned("ISOTOPE_HUNTER", "Thợ săn Đồng vị", "⚗️");
      }
      callbacks.onMissionComplete("mission2");
    }
  } else if (mode === "mission3") {
    const i127Bin1 =
      gs.spectrumCounts["Bin1_126.9"] || gs.spectrumCounts["Bin1_127.0"] || 0;
    const i131Bin2 =
      gs.spectrumCounts["Bin2_130.9"] || gs.spectrumCounts["Bin2_131.0"] || 0;
    gs.m3Bin1Count = i127Bin1;
    gs.m3Bin2Count = i131Bin2;

    if (i127Bin1 >= M3_TARGET_COUNT && i131Bin2 >= M3_TARGET_COUNT) {
      if (awardMSBadge(gs, "NUCLEAR_MED_TECH")) {
        callbacks.onBadgeEarned(
          "NUCLEAR_MED_TECH",
          "Kỹ sư Y tế Hạt nhân",
          "🏥",
        );
      }
      callbacks.onMissionComplete("mission3");
    }
  }
}

// ─── Helpers for UI ───────────────────────────────────────────────────────────
/** Return calibration B value for C-12 to hit Bin 1 in mission 1.
 *  Bin1 is at fixed R_target = 12 visual units, so we solve B = mv/(qR) */
export function getCalibrationB(voltage: number): number {
  // m=12 amu, q=1, using K_V and K_B
  const m = 12,
    q = 1;
  const v = Math.sqrt((2 * q * voltage) / m) * K_V;
  const R_target = 12; // visual radius of tube
  // R = (m * v) / (q * B) * K_B  =>  B = (m * v * K_B) / (q * R_target)
  return (m * v * K_B) / (q * R_target);
}

export { M2_TARGET_COUNT, M3_TARGET_COUNT };
