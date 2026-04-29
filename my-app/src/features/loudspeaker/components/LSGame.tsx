import { useCallback, useRef, useState } from "react";
import LoudspeakerSimulation, {
  type LSSimCallbacks,
} from "./LoudspeakerSimulation";
import {
  LS_BADGES,
  type LSGameMode,
  type LSGameState,
  type LSBadgeId,
} from "./types";
import {
  createInitialLSGameState,
  awardLSBadge,
  M1_B,
  M1_L,
  M1_TARGET_F,
  M1_TARGET_I,
  M2_ULTRASOUND,
} from "./lsGameState";
import {
  TrophyOutlined,
  ToolOutlined,
  SoundOutlined,
  GlobalOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  LockOutlined,
  UnlockOutlined,
  FireOutlined,
  CloseOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  AimOutlined,
} from "@ant-design/icons";
import "./LSGame.css";

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  text: string;
  type: "success" | "error" | "info" | "badge";
}
let _tid = 0;

// ── Mission cards ─────────────────────────────────────────────────────────────
const MISSION_CARDS = [
  {
    id: "mission1" as LSGameMode,
    icon: <ToolOutlined />,
    color: "#f59e0b",
    title: "Nhiệm Vụ 1: Bật Âm Lượng",
    subtitle: "The Amplifier Challenge",
    story:
      "Ban nhạc đang biểu diễn nhưng âm thanh quá nhỏ! Tính F_max = B·I·l và điều chỉnh dòng điện I₀ để đạt đúng 0.175 N.",
    badge: "AUDIO_MECHANIC",
  },
  {
    id: "mission2" as LSGameMode,
    icon: <SoundOutlined />,
    color: "#8b5cf6",
    title: "Nhiệm Vụ 2: Cuộc Gọi Loài Chó",
    subtitle: "The Frequency Challenge",
    story:
      "Có kẻ trộm đang lẻn vào. Hãy phát siêu âm >20 000 Hz để đánh thức chó mà không kinh động tên trộm!",
    badge: "BIO_ACOUSTICS",
  },
  {
    id: "mission3" as LSGameMode,
    icon: <GlobalOutlined />,
    color: "#06b6d4",
    title: "Nhiệm Vụ 3: Bẫy Chân Không",
    subtitle: "The Vacuum Trap",
    story:
      'Mang loa lên trạm vũ trụ. Nhấn "Chân không" trong mục Môi Trường rồi bật nguồn điện — điều gì sẽ xảy ra?',
    badge: "VOID_EXPLORER",
  },
];

// ── Decibel meter component ───────────────────────────────────────────────────
function DecibelMeter({ fMax, isVacuum }: { fMax: number; isVacuum: boolean }) {
  const db = isVacuum ? 0 : Math.min(100, (fMax / M1_TARGET_F) * 80);
  const color = isVacuum
    ? "#475569"
    : db > 70
      ? "#22c55e"
      : db > 40
        ? "#f59e0b"
        : "#3b82f6";
  return (
    <div className="lsg-meter">
      <span className="lsg-meter-label">🔊 Sound Level</span>
      <div className="lsg-meter-bar-bg">
        <div
          className="lsg-meter-bar-fill"
          style={{ width: `${db}%`, background: color }}
        />
      </div>
      <span className="lsg-meter-val" style={{ color }}>
        {isVacuum ? "0 dB ← KHÔNG CÓ ÂM THANH!" : `${db.toFixed(0)} dB`}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LSGame() {
  const [gameState, setGameState] = useState<LSGameState>(() =>
    createInitialLSGameState(),
  );
  const gameStateRef = useRef<LSGameState>(gameState);
  const imperativeRef = useRef<{ setMedium: (m: string) => void } | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(true);
  const [showBadges, setShowBadges] = useState(false);

  // Real-time physics values from simulation
  const [fMax, setFMax] = useState(0);
  const [freq, setFreq] = useState(20);
  const [isVac, setIsVac] = useState(false);
  const [m3Reveal, setM3Reveal] = useState(false);

  const syncState = useCallback((s: LSGameState) => {
    gameStateRef.current = s;
    setGameState(s);
  }, []);

  const pushToast = useCallback(
    (text: string, type: Toast["type"] = "info") => {
      const id = ++_tid;
      setToasts((t) => [...t, { id, text, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4800);
    },
    [],
  );

  // ── Mission select ────────────────────────────────────────────────────────
  const selectMission = useCallback(
    (mode: LSGameMode) => {
      const ns: LSGameState = {
        ...gameStateRef.current,
        mode,
        currentFMax: 0,
        currentFreq: 20,
        isVacuum: false,
      };
      syncState(ns);
      setM3Reveal(false);
      setShowModal(false);
    },
    [syncState],
  );

  // ── Simulation callbacks ──────────────────────────────────────────────────
  const simCallbacks = useRef<LSSimCallbacks>({
    onStateChange: (fM, fr, vac) => {
      setFMax(fM);
      setFreq(fr);
      setIsVac(vac);
    },
    onMission1Win: () => {
      const gs = gameStateRef.current;
      const won = awardLSBadge(gs, "AUDIO_MECHANIC");
      syncState({ ...gs });
      if (won) pushToast(`🏆 Huy hiệu: 🔧 Thợ máy Âm thanh`, "badge");
      pushToast(
        `🎉 Chính xác! F = ${M1_TARGET_F} N — Ban nhạc đã vang lên rồi!`,
        "success",
      );
    },
    onMission2Win: () => {
      const gs = gameStateRef.current;
      const won = awardLSBadge(gs, "BIO_ACOUSTICS");
      syncState({ ...gs });
      if (won) pushToast(`🏆 Huy hiệu: 🎶 Kỹ sư Sinh âm học`, "badge");
      pushToast(
        `🐕 Chó đã tỉnh! 😴 Tên trộm vẫn ngủ. Siêu âm thành công!`,
        "success",
      );
    },
    onMission3Reveal: () => {
      const gs = gameStateRef.current;
      const won = awardLSBadge(gs, "VOID_EXPLORER");
      syncState({ ...gs });
      setM3Reveal(true);
      if (won) pushToast(`🏆 Huy hiệu: 🌌 Nhà thám hiểm Chân không`, "badge");
      pushToast(
        `🌌 Màng loa vẫn rung... nhưng HOÀN TOÀN IM LẶNG trong chân không!`,
        "info",
      );
    },
  });

  const hasBadge = (id: string) => gameState.badges.has(id as LSBadgeId);
  const currentMission = MISSION_CARDS.find((m) => m.id === gameState.mode);

  // ── F_max formula hint ────────────────────────────────────────────────────
  const targetNote = M1_TARGET_I.toFixed(1); // "2.0"

  return (
    <div className="lsg-root">
      {/* 3D Simulation */}
      <LoudspeakerSimulation
        gameStateRef={gameStateRef}
        callbacks={simCallbacks.current}
        imperativeRef={imperativeRef}
      />

      {/* Mission Select Modal */}
      {showModal && (
        <div className="lsg-modal-bg">
          <div className="lsg-modal">
            <div className="lsg-modal-header">
              <h2>
                <ThunderboltOutlined
                  style={{ color: "#60a5fa", marginRight: 8 }}
                />
                LOA ĐIỆN ĐỘNG — CHỌN NHIỆM VỤ
              </h2>
              <p className="lsg-streak">
                <FireOutlined style={{ color: "#f97316" }} /> Streak:{" "}
                {gameState.streakCount} ngày
              </p>
            </div>
            <div className="lsg-mission-cards">
              {MISSION_CARDS.map((m) => (
                <button
                  key={m.id}
                  className="lsg-mission-card"
                  style={{ borderColor: m.color }}
                  onClick={() => selectMission(m.id)}
                >
                  <span className="lsg-mission-icon">{m.icon}</span>
                  <div className="lsg-mission-info">
                    <strong style={{ color: m.color }}>{m.title}</strong>
                    <span>{m.subtitle}</span>
                  </div>
                  {hasBadge(m.badge) && <span>✅</span>}
                </button>
              ))}
            </div>
            <button
              className="lsg-btn lsg-btn-secondary"
              onClick={() => selectMission("free")}
            >
              <UnlockOutlined /> Chế độ Tự Do
            </button>
          </div>
        </div>
      )}

      {/* Top HUD */}
      {!showModal && (
        <div className="lsg-hud-top">
          <button
            className="lsg-btn lsg-btn-icon"
            onClick={() => setShowModal(true)}
          >
            <ArrowLeftOutlined /> Nhiệm vụ
          </button>
          {currentMission && (
            <span
              className="lsg-hud-label"
              style={{ color: currentMission.color }}
            >
              {currentMission.icon} {currentMission.subtitle}
            </span>
          )}
          <button
            className="lsg-btn lsg-btn-icon"
            onClick={() => setShowBadges((v) => !v)}
          >
            <TrophyOutlined /> {gameState.badges.size}/
            {Object.keys(LS_BADGES).length}
          </button>
        </div>
      )}

      {/* Story Banner */}
      {currentMission && !showModal && (
        <div
          className="lsg-story-banner"
          style={{ borderColor: currentMission.color }}
        >
          <p>{currentMission.story}</p>
        </div>
      )}

      {/* Mission 1 Panel */}
      {gameState.mode === "mission1" && !showModal && (
        <div className="lsg-panel lsg-m1-panel">
          <p className="lsg-target">
            <AimOutlined /> Mục tiêu: <strong>F_max = {M1_TARGET_F} N</strong>
          </p>
          <div className="lsg-formula-box">
            F = B × I₀ × l = {M1_B} × I₀ × {M1_L} ={" "}
            <strong>I₀ × {(M1_B * M1_L).toFixed(4)}</strong>
          </div>
          <div className="lsg-m1-live">
            <div className="lsg-m1-row">
              <span>I₀ hiện tại:</span>
              <strong
                style={{
                  color:
                    Math.abs(fMax / (M1_B * M1_L) - M1_TARGET_I) < 0.06
                      ? "#22c55e"
                      : "#f59e0b",
                }}
              >
                {(fMax / (M1_B * M1_L)).toFixed(2)} A
              </strong>
            </div>
            <div className="lsg-m1-row">
              <span>F_max:</span>
              <strong
                style={{
                  color:
                    Math.abs(fMax - M1_TARGET_F) < 0.005
                      ? "#22c55e"
                      : "#94a3b8",
                }}
              >
                {fMax.toFixed(4)} N
              </strong>
            </div>
          </div>
          <div className="lsg-prog-bar-wrap">
            <div
              className="lsg-prog-fill"
              style={{
                width: `${Math.min(100, (fMax / M1_TARGET_F) * 100)}%`,
                background:
                  Math.abs(fMax - M1_TARGET_F) < 0.005 ? "#22c55e" : "#f59e0b",
              }}
            />
          </div>
          <p className="lsg-hint">
            <BulbOutlined /> Kéo thanh <em>Cường độ I₀ (A)</em> trong lil-gui
            đến ≈ <strong>{targetNote} A</strong>
          </p>
        </div>
      )}

      {/* Mission 2 Panel */}
      {gameState.mode === "mission2" && !showModal && (
        <div className="lsg-panel lsg-m2-panel">
          <p className="lsg-target">
            <SoundOutlined /> Mục tiêu: Siêu âm &gt;{" "}
            {M2_ULTRASOUND.toLocaleString()} Hz
          </p>
          <div className="lsg-freq-display">
            <span
              className="lsg-freq-big"
              style={{ color: freq > M2_ULTRASOUND ? "#c084fc" : "#f59e0b" }}
            >
              {freq.toLocaleString()} Hz
            </span>
            <span className="lsg-freq-label">
              {freq > M2_ULTRASOUND
                ? "🟣 Siêu âm — Người 😴 Chó 🐕 nghe được!"
                : freq > 16000
                  ? "🟡 Gần ngưỡng siêu âm..."
                  : "🔵 Trong vùng nghe của con người"}
            </span>
          </div>
          <div className="lsg-creature-row">
            <div
              className={`lsg-creature ${freq >= 20 && freq <= 20000 ? "lsg-creature-active" : ""}`}
            >
              🧍 Tên trộm {freq <= 20000 ? "😴 Zzz" : "😴 Im lặng"}
            </div>
            <div
              className={`lsg-creature ${freq >= 67 && freq <= 45000 ? "lsg-creature-active" : ""}`}
            >
              🐕 Chó {freq >= 67 && freq <= 45000 ? "🔊 SỦA!" : "😴 Ngủ"}
            </div>
          </div>
          <p className="lsg-hint">
            <BulbOutlined /> Kéo thanh <em>Tần số f (Hz)</em> trong lil-gui vượt
            20 000 Hz
          </p>
        </div>
      )}

      {/* Mission 3 Panel */}
      {gameState.mode === "mission3" && !showModal && (
        <div className="lsg-panel lsg-m3-panel">
          <p className="lsg-target">
            <GlobalOutlined /> Thí nghiệm Chân Không
          </p>
          <DecibelMeter fMax={fMax} isVacuum={isVac} />
          {isVac && (
            <div className="lsg-vacuum-indicator">
              🌑 CHÂN KHÔNG — Màng loa {fMax > 0 ? "đang rung..." : "đứng yên"}
            </div>
          )}
          {m3Reveal && (
            <div className="lsg-reveal-box">
              <strong>💡 Bài học:</strong> Lực từ F = B·I·l vẫn tác dụng lên
              cuộn dây → màng loa rung. Nhưng chân không không có phân tử vật
              chất để nén/giãn → không tạo được sóng âm!
            </div>
          )}
          {!m3Reveal && (
            <p className="lsg-hint">
              <BulbOutlined /> Vào <em>Môi Trường → Chân không</em>, rồi bật
              nguồn điện — quan sát màng loa!
            </p>
          )}
        </div>
      )}

      {/* Badge Drawer */}
      {showBadges && (
        <div className="lsg-drawer">
          <div className="lsg-drawer-header">
            <h3>
              <TrophyOutlined style={{ color: "#f59e0b", marginRight: 6 }} />{" "}
              Huy Hiệu
            </h3>
            <button onClick={() => setShowBadges(false)}>
              <CloseOutlined />
            </button>
          </div>
          {Object.values(LS_BADGES).map((b) => (
            <div
              key={b.id}
              className={`lsg-badge-row ${hasBadge(b.id) ? "lsg-badge-earned" : "lsg-badge-locked"}`}
            >
              <span className="lsg-badge-emoji">{b.emoji}</span>
              <div>
                <strong>{b.name}</strong>
                <p>{b.description}</p>
              </div>
              {hasBadge(b.id) ? (
                <CheckCircleFilled style={{ color: "#22c55e", fontSize: 18 }} />
              ) : (
                <LockOutlined style={{ color: "#475569", fontSize: 16 }} />
              )}
            </div>
          ))}
          <div className="lsg-streak-info">
            <FireOutlined style={{ color: "#f97316" }} /> Streak:{" "}
            <strong>{gameState.streakCount}</strong> ngày
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="lsg-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`lsg-toast lsg-toast-${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
