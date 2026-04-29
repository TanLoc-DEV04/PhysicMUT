import { useCallback, useEffect, useRef, useState } from 'react';
import CyclotronSimulation from './CyclotronSimulation';
import { BADGES, type GameMode, type GameState, type BadgeId } from '../../../core/cyclotron/cyclotronConstants';
import {
    createInitialGameState,
    persistGameState,
    MISSION1_REQUIRED_HITS,
} from '../../../core/cyclotron/gameState';
import {
    startAutoSync,
    stopAutoSync,
    checkMission3Answer,
    type MissionCallbacks,
} from '../logic/missionLogic';
import {
    SoundOutlined,
    MedicineBoxOutlined,
    SearchOutlined,
    TrophyOutlined,
    BgColorsOutlined,
    CheckCircleFilled,
    LockOutlined,
    UnlockOutlined,
    FireOutlined,
    ArrowLeftOutlined,
    ThunderboltOutlined,
    BulbOutlined,
    CheckOutlined,
    CloseOutlined,
    AimOutlined,
} from '@ant-design/icons';
import './CyclotronGame.css';

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; text: string; type: 'success' | 'error' | 'info' | 'badge' }
let _toastId = 0;

// ─── Mission cards ────────────────────────────────────────────────────────────
const MISSION_CARDS = [
    {
        id: 'mission1' as GameMode,
        title: 'Nhiệm Vụ 1: The Rhythm Game',
        subtitle: 'Cộng hưởng Cyclotron',
        icon: <SoundOutlined />,
        color: '#3b82f6',
        story: 'Hệ thống tự động đảo cực điện trường đang bị hỏng! Nhấn SPACE đúng lúc hạt Proton đến khe hở để tăng tốc nó.',
        badge: 'RESONANCE_MASTER',
    },
    {
        id: 'mission2' as GameMode,
        title: 'Nhiệm Vụ 2: Target Energy',
        subtitle: 'Kỹ sư Hạt nhân',
        icon: <MedicineBoxOutlined />,
        color: '#10b981',
        story: 'Bệnh viện cần gấp chùm hạt Deuteron có động năng 8.0 MeV để xạ trị. Điều chỉnh B và BK tối đa trong lil-gui (góc phải) rồi bấm FIRE! Gợi ý: đầu tiên chọn Deuteron trong muục Hạt.',
        badge: 'NUCLEAR_HEALER',
    },
    {
        id: 'mission3' as GameMode,
        title: 'Nhiệm Vụ 3: Isotope Mystery',
        subtitle: 'Truy tìm Đồng vị',
        icon: <SearchOutlined />,
        color: '#8b5cf6',
        story: 'Hai loại hạt bí ẩn lọt vào máy. Dựa vào quỹ đạo, xác định hạt nào là Proton và hạt nào là Alpha!',
        badge: 'PHYSICS_EYE',
    },
];

// ─── Cosmetics ────────────────────────────────────────────────────────────────
const COLOUR_OPTIONS: { label: string; value: GameState['particleColor']; hex: string }[] = [
    { label: 'Xanh dương', value: 'blue',   hex: '#88ccff' },
    { label: 'Đỏ',         value: 'red',    hex: '#ff5533' },
    { label: 'Tím',        value: 'purple', hex: '#cc66ff' },
    { label: 'Cam lửa',    value: 'orange', hex: '#ff8822' },
];

const SKIN_OPTIONS: { label: string; value: GameState['cosmeticSkin']; desc: string }[] = [
    { label: 'Mặc định',  value: 'default',   desc: 'Kim loại cổ điển' },
    { label: 'X-Ray',     value: 'xray',      desc: 'Kính trong suốt' },
    { label: 'Cyberpunk', value: 'cyberpunk', desc: 'Kim loại phát sáng' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CyclotronGame() {
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
    // Always-fresh ref read by the 3D loop without triggering re-renders
    const gameStateRef = useRef<GameState>(gameState);

    const imperative    = useRef<{ resetParticle: () => void } | null>(null);
    const [toasts, setToasts]               = useState<ToastMsg[]>([]);
    const [showMissionSelect, setShowMissionSelect] = useState(true);
    const [m3Answer, setM3Answer]           = useState({ larger: '', smaller: '' });
    const [autoSyncHz, setAutoSyncHz]       = useState<number | null>(null);
    const [perfectHits, setPerfectHits]     = useState(0);
    const [showBadgeDrawer, setShowBadgeDrawer]   = useState(false);
    const [showCosmetics,  setShowCosmetics]      = useState(false);

    // Keep ref in sync with state
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // ── Toast helpers ──────────────────────────────────────────────────────────
    const pushToast = useCallback((text: string, type: ToastMsg['type'] = 'info') => {
        const id = ++_toastId;
        setToasts(t => [...t, { id, text, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
    }, []);

    // ── Select mission ─────────────────────────────────────────────────────────
    const selectMission = useCallback((mode: GameMode) => {
        stopAutoSync(gameStateRef.current);
        const ns: GameState = {
            ...gameStateRef.current,
            mode,
            perfectHits: 0,
            autoSyncEnabled: false,
            autoSyncIntervalId: null,
            eFieldPolarity: 1,
        };
        gameStateRef.current = ns;
        setGameState(ns);
        setPerfectHits(0);
        setAutoSyncHz(null);
        setM3Answer({ larger: '', smaller: '' });
        imperative.current?.resetParticle();
        setShowMissionSelect(false);
    }, []);

    // ── Callbacks wired into 3D scene ──────────────────────────────────────────
    const simCallbacks = useRef<MissionCallbacks>({
        onPerfectHit: (hits) => {
            setPerfectHits(hits);
            pushToast(`Perfect Hit! (${hits}/${MISSION1_REQUIRED_HITS})`, 'success');
        },
        onMiss: () => {
            setPerfectHits(0);
            pushToast('Sai nhịp! Chuỗi bị cắt!', 'error');
        },
        onBadgeEarned: (_id, name, emoji) => {
            setGameState((s: any) => {
                const ns = { ...s, badges: new Set(s.badges) };
                ns.badges.add(_id as BadgeId);
                persistGameState(ns);
                gameStateRef.current = ns;
                return ns;
            });
            pushToast(`Huy hiệu mới: ${emoji} ${name}`, 'badge');
        },
        onMission1Unlocked: () => {
            pushToast('Auto-Sync mở khoá! Tần số cộng hưởng tự động!', 'info');
            setGameState((s: any) => {
                const ns = { ...s, autoSyncEnabled: true };
                gameStateRef.current = ns;
                startAutoSync(ns, simCallbacks.current);
                return ns;
            });
        },
        onMission2Result: (success, mev) => {
            if (success) {
                pushToast(`THÀNH CÔNG! ${mev.toFixed(2)} MeV — Khối u đã bị tiêu diệt!`, 'success');
                window.dispatchEvent(new Event('cyclotron_healing'));
            } else {
                pushToast(`${mev.toFixed(2)} MeV — Cần 8.0 MeV. Điều chỉnh B hoặc R!`, 'error');
            }
        },
        onMission3Result: (success) => {
            if (success) pushToast('Chính xác! Alpha có quỹ đạo lớn hơn Proton!', 'success');
            else         pushToast('Sai! Gợi ý: r = mv/qB — Hạt nặng → r lớn hơn', 'error');
        },
        onAutoSyncEnabled: (freq) => setAutoSyncHz(freq),
        onFlash: (_) => { /* handled in 3D scene */ },
    });

    // ── SPACE key (mission 1) ──────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code !== 'Space') return;
            if (gameStateRef.current.mode !== 'mission1') return;
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('cyclotron_space'));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleSpaceButton = () => window.dispatchEvent(new CustomEvent('cyclotron_space'));

    // ── Mission 2 ──────────────────────────────────────────────────────────────
    const handleFire = () => {
        const DEUTERON = { mass: 3.34e-27, charge: 1.6e-19 };
        window.dispatchEvent(new CustomEvent('cyclotron_fire', {
            detail: { mass: DEUTERON.mass, charge: DEUTERON.charge }
        }));
    };

    // ── Mission 3 ──────────────────────────────────────────────────────────────
    const handleM3Submit = () => {
        checkMission3Answer(
            gameStateRef.current,
            m3Answer.larger,
            m3Answer.smaller,
            simCallbacks.current
        );
    };

    // ── Cosmetics ──────────────────────────────────────────────────────────────
    const setColour = (c: GameState['particleColor']) =>
        setGameState((s: any) => {
            const ns = { ...s, particleColor: c };
            persistGameState(ns); gameStateRef.current = ns; return ns;
        });

    const setSkin = (sk: GameState['cosmeticSkin']) =>
        setGameState((s: any) => {
            const ns = { ...s, cosmeticSkin: sk };
            persistGameState(ns); gameStateRef.current = ns; return ns;
        });

    // ── Derived ────────────────────────────────────────────────────────────────
    const currentMission = MISSION_CARDS.find(m => m.id === gameState.mode);
    const hasBadge = (id: string) => gameState.badges.has(id as BadgeId);

    return (
        <div className="cg-root">
            {/* ── 3D Canvas ── */}
            <CyclotronSimulation
                gameStateRef={gameStateRef}
                callbacks={simCallbacks.current}
                imperativeRef={imperative}
            />

            {/* ── Mission Select Modal ── */}
            {showMissionSelect && (
                <div className="cg-modal-bg">
                    <div className="cg-modal">
                        <div className="cg-modal-header">
                            <h2><ThunderboltOutlined style={{ color: '#60a5fa', marginRight: 8 }} />CYCLOTRON – CHỌN NHIỆM VỤ</h2>
                            <p className="cg-streak"><FireOutlined style={{ color: '#f97316' }} /> Streak: {gameState.streakCount} ngày</p>
                        </div>
                        <div className="cg-mission-cards">
                            {MISSION_CARDS.map(m => (
                                <button
                                    key={m.id}
                                    className="cg-mission-card"
                                    style={{ borderColor: m.color }}
                                    onClick={() => selectMission(m.id)}
                                >
                                    <span className="cg-mission-icon">{m.icon}</span>
                                    <div className="cg-mission-info">
                                        <strong style={{ color: m.color }}>{m.title}</strong>
                                        <span>{m.subtitle}</span>
                                    </div>
                                    {hasBadge(m.badge) && (
                                        <span className="cg-badge-tick" title="Đã hoàn thành">✅</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            className="cg-btn cg-btn-secondary"
                            onClick={() => selectMission('free')}
                        >
                            <UnlockOutlined /> Chế độ Tự Do
                        </button>
                    </div>
                </div>
            )}

            {/* ── Top HUD ── */}
            {!showMissionSelect && (
                <div className="cg-hud-top">
                    <button className="cg-btn cg-btn-icon" onClick={() => setShowMissionSelect(true)}>
                        <ArrowLeftOutlined /> Nhiệm vụ
                    </button>
                    {currentMission && (
                        <span className="cg-hud-mission-label" style={{ color: currentMission.color }}>
                            {currentMission.icon} {currentMission.subtitle}
                        </span>
                    )}
                    <div className="cg-hud-right">
                        <button className="cg-btn cg-btn-icon" onClick={() => setShowBadgeDrawer(v => !v)}>
                            <TrophyOutlined /> {gameState.badges.size}/{Object.keys(BADGES).length}
                        </button>
                        <button className="cg-btn cg-btn-icon" onClick={() => setShowCosmetics(v => !v)}>
                            <BgColorsOutlined />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Story Banner ── */}
            {currentMission && !showMissionSelect && (
                <div className="cg-story-banner" style={{ borderColor: currentMission.color }}>
                    <p>{currentMission.story}</p>
                </div>
            )}

            {/* ── Mission 1 Controls ── */}
            {gameState.mode === 'mission1' && !showMissionSelect && (
                <div className="cg-panel cg-m1-panel">
                    <div className="cg-hit-counter">
                        <span>Cộng hưởng:</span>
                        {Array.from({ length: MISSION1_REQUIRED_HITS }).map((_, i) => (
                            <span key={i} className={`cg-hit-dot ${i < perfectHits ? 'cg-hit-active' : ''}`} />
                        ))}
                        <span>{perfectHits}/{MISSION1_REQUIRED_HITS}</span>
                    </div>
                    {!gameState.autoSyncEnabled ? (
                        <button className="cg-btn cg-btn-space" onClick={handleSpaceButton}>
                            <ThunderboltOutlined /> SPACE — Đảo Cực Điện Trường
                        </button>
                    ) : (
                        <div className="cg-auto-sync">
                            <span><CheckCircleFilled style={{ color: '#22c55e' }} /> Auto-Sync bật!</span>
                            {autoSyncHz && <span>f = {autoSyncHz.toExponential(2)} Hz</span>}
                        </div>
                    )}
                    <p className="cg-hint"><BulbOutlined /> Nhấn khi hạt ở khe hở giữa hai hộp D (phím SPACE hoặc nút trên)</p>
                </div>
            )}

            {/* ── Mission 2 Controls ── */}
            {gameState.mode === 'mission2' && !showMissionSelect && (
                <div className="cg-panel cg-m2-panel">
                    <p className="cg-target"><AimOutlined /> Mục tiêu: <strong>8.0 MeV</strong> cho Deuteron</p>
                    <div className="cg-m2-steps">
                        <div className="cg-m2-step">
                            <span className="cg-step-num">1</span>
                            <span>Chọn <strong>Deuteron</strong> ở mục <em>Hạt</em></span>
                        </div>
                        <div className="cg-m2-step">
                            <span className="cg-step-num">2</span>
                            <span>Tăng <strong>Từ trường B</strong> lên ≈ <strong>5.8 T</strong></span>
                        </div>
                        <div className="cg-m2-step">
                            <span className="cg-step-num">3</span>
                            <span>Tăng <strong>BK tối đa</strong> lên ≈ <strong>5 đv</strong> (= 0.1 m thực)</span>
                        </div>
                        <div className="cg-m2-step">
                            <span className="cg-step-num">4</span>
                            <span>Bấm <strong>FIRE</strong> và kiểm tra kết quả</span>
                        </div>
                    </div>
                    <details className="cg-hint-detail">
                        <summary><BulbOutlined /> Công thức</summary>
                        <p>
                            W<sub>max</sub> = q²B²R<sub>thực</sub>² / 2m<br />
                            R<sub>thực</sub> = BK ÷ 50 (dạng mô phỏng)<br />
                            Với B=5.8T, R=0.1m: W ≈ <strong>8.0 MeV</strong> ✅
                        </p>
                    </details>
                    <button className="cg-btn cg-btn-fire" onClick={handleFire}>
                        <ThunderboltOutlined /> FIRE — Phóng hạt Deuteron!
                    </button>
                </div>
            )}

            {/* ── Mission 3 Controls ── */}
            {gameState.mode === 'mission3' && !showMissionSelect && (
                <div className="cg-panel cg-m3-panel">
                    <p className="cg-hint"><SearchOutlined /> Quan sát hai quỹ đạo — hạt nào có bán kính lớn hơn?</p>
                    <div className="cg-m3-form">
                        <div className="cg-m3-row">
                            <div className="cg-orbit-indicator cg-orbit-large" />
                            <label>Quỹ đạo LỚN hơn (vàng):</label>
                            <select value={m3Answer.larger} onChange={e => setM3Answer(v => ({ ...v, larger: e.target.value }))}>
                                <option value="">-- Chọn --</option>
                                <option>Proton</option>
                                <option>Alpha</option>
                            </select>
                        </div>
                        <div className="cg-m3-row">
                            <div className="cg-orbit-indicator cg-orbit-small" />
                            <label>Quỹ đạo NHỎ hơn (đỏ):</label>
                            <select value={m3Answer.smaller} onChange={e => setM3Answer(v => ({ ...v, smaller: e.target.value }))}>
                                <option value="">-- Chọn --</option>
                                <option>Proton</option>
                                <option>Alpha</option>
                            </select>
                        </div>
                    </div>
                    <button
                        className="cg-btn cg-btn-primary"
                        disabled={!m3Answer.larger || !m3Answer.smaller}
                        onClick={handleM3Submit}
                    >
                        <CheckOutlined /> Xác nhận đáp án
                    </button>
                    <details className="cg-hint-detail">
                        <summary><BulbOutlined /> Gợi ý vật lý</summary>
                        <p>r = mv/qB → Alpha (4u, q=2e): r_alpha/r_proton = (4m·e)/(2e·m) = 2 lần lớn hơn</p>
                    </details>
                </div>
            )}

            {/* ── Badge Drawer ── */}
            {showBadgeDrawer && (
                <div className="cg-drawer">
                    <div className="cg-drawer-header">
                        <h3><TrophyOutlined style={{ color: '#f59e0b', marginRight: 6 }} /> Huy Hiệu</h3>
                        <button onClick={() => setShowBadgeDrawer(false)}><CloseOutlined /></button>
                    </div>
                    {Object.values(BADGES).map((b: any) => (
                        <div key={b.id} className={`cg-badge-row ${hasBadge(b.id) ? 'cg-badge-earned' : 'cg-badge-locked'}`}>
                            <span className="cg-badge-emoji">{b.emoji}</span>
                            <div><strong>{b.name}</strong><p>{b.description}</p></div>
                            {hasBadge(b.id)
                                ? <CheckCircleFilled className="cg-check" style={{ color: '#22c55e', fontSize: 18 }} />
                                : <LockOutlined className="cg-lock" style={{ color: '#475569', fontSize: 16 }} />}
                        </div>
                    ))}
                    <div className="cg-streak-info">
                        <FireOutlined style={{ color: '#f97316' }} /> Streak: <strong>{gameState.streakCount}</strong> ngày liên tiếp
                    </div>
                </div>
            )}

            {/* ── Cosmetics Drawer ── */}
            {showCosmetics && (
                <div className="cg-drawer cg-drawer-left">
                    <div className="cg-drawer-header">
                        <h3><BgColorsOutlined style={{ marginRight: 6 }} /> Tùy chỉnh</h3>
                        <button onClick={() => setShowCosmetics(false)}><CloseOutlined /></button>
                    </div>
                    <div className="cg-cosmetic-section">
                        <h4>Màu tia đạn</h4>
                        <div className="cg-colour-grid">
                            {COLOUR_OPTIONS.map(c => (
                                <button
                                    key={c.value}
                                    className={`cg-colour-btn ${gameState.particleColor === c.value ? 'cg-colour-active' : ''}`}
                                    style={{ background: c.hex }}
                                    title={c.label}
                                    onClick={() => setColour(c.value)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="cg-cosmetic-section">
                        <h4>Vỏ máy</h4>
                        {SKIN_OPTIONS.map((s: any) => (
                            <button
                                key={s.value}
                                className={`cg-skin-btn ${gameState.cosmeticSkin === s.value ? 'cg-skin-active' : ''}`}
                                onClick={() => setSkin(s.value)}
                            >
                                {s.label} <em>{s.desc}</em>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Toasts ── */}
            <div className="cg-toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`cg-toast cg-toast-${t.type}`}>{t.text}</div>
                ))}
            </div>
        </div>
    );
};


