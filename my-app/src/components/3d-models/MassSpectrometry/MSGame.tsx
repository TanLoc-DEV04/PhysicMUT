import React, { useCallback, useEffect, useRef, useState } from 'react';
import MassSpectrometerSimulation from './MassSpectrometerSimulation';
import { MS_BADGES, type MSGameMode, type MSGameState, type MSBadgeId } from './Types';
import { createInitialMSGameState, persistMSGameState, M2_TARGET_COUNT, M3_TARGET_COUNT } from './msGameState';
import { getCalibrationB, type MSCallbacks } from './msMissionLogic';
import {
    TrophyOutlined,
    ExperimentOutlined,
    MedicineBoxOutlined,
    RocketOutlined,
    BarChartOutlined,
    ArrowLeftOutlined,
    PrinterOutlined,
    CheckCircleFilled,
    LockOutlined,
    FireOutlined,
    CloseOutlined,
    AimOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import './MSGame.css';

// ─── Toasts ───────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; text: string; type: 'info' | 'success' | 'error' | 'badge'; }
let _tid = 0;

// ─── Mission Cards ────────────────────────────────────────────────────────────
const MISSION_CARDS = [
    {
        id: 'mission1' as MSGameMode,
        title: 'Nhiệm Vụ 1: Hiệu Chuẩn',
        subtitle: 'The Baseline',
        icon: <AimOutlined />,
        color: '#3b82f6',
        story: 'Hệ thống bị lệch chuẩn! Ion ¹²C⁺ đang bắn vào vách ống thay vì vào Máy dò 1. Kéo thanh trượt Từ trường B để uốn quỹ đạo cho đúng.',
        badge: 'CALIBRATOR',
    },
    {
        id: 'mission2' as MSGameMode,
        title: 'Nhiệm Vụ 2: Tách Đồng Vị',
        subtitle: 'The Sorting Puzzle',
        icon: <ExperimentOutlined />,
        color: '#10b981',
        story: 'Mẫu khảo cổ lẫn lộn C-12 và C-14 phóng xạ. Chỉnh B và U để tách hai loại hạt vào đúng rỗ hứng. Thu 30 hạt mỗi loại!',
        badge: 'ISOTOPE_HUNTER',
    },
    {
        id: 'mission3' as MSGameMode,
        title: 'Nhiệm Vụ 3: Giải Cứu Y Tế',
        subtitle: 'Medical Challenge',
        icon: <MedicineBoxOutlined />,
        color: '#8b5cf6',
        story: 'Bệnh viện cần I-131 để xạ trị, nhưng bị lẫn với I-127. Chênh lệch rất nhỏ (ΔR ≈ 2%). Cần tinh chỉnh cực kỳ chính xác!',
        badge: 'NUCLEAR_MED_TECH',
    },
];

// ─── Mass Spectrum Chart ──────────────────────────────────────────────────────
const SpectrumChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return (
        <div className="msg-spectrum-chart">
            <div className="msg-spectrum-title">📊 Mass Spectrum</div>
            <div className="msg-spectrum-bars">
                {entries.map(([key, count]) => (
                    <div key={key} className="msg-spectrum-bar-col">
                        <div
                            className="msg-spectrum-bar"
                            style={{
                                height: `${Math.max(4, (count / max) * 80)}px`,
                                background: key.startsWith('Bin1') ? '#44ff88' : '#ff4444',
                            }}
                        />
                        <span className="msg-spectrum-label">{key.replace('Bin1_', '').replace('Bin2_', '')}</span>
                    </div>
                ))}
                {entries.length === 0 && <span className="msg-no-data">Chưa có dữ liệu...</span>}
            </div>
        </div>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────
const MSGame: React.FC = () => {
    const [gameState, setGameState] = useState<MSGameState>(() => createInitialMSGameState());
    const gameStateRef = useRef<MSGameState>(gameState);
    const imperativeRef = useRef<{ reset: () => void } | null>(null);

    const [toasts, setToasts]     = useState<ToastMsg[]>([]);
    const [showModal, setShowModal]   = useState(true);
    const [showBadges, setShowBadges] = useState(false);
    const [showSpectrum, setShowSpectrum] = useState(false);
    const [spectrumData, setSpectrumData] = useState<Record<string, number>>({});
    const [m2Counts, setM2Counts]   = useState({ bin1: 0, bin2: 0 });
    const [m3Counts, setM3Counts]   = useState({ bin1: 0, bin2: 0 });
    const [m1Done, setM1Done]       = useState(false);

    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const pushToast = useCallback((text: string, type: ToastMsg['type'] = 'info') => {
        const id = ++_tid;
        setToasts(t => [...t, { id, text, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
    }, []);

    // ── Select mission ────────────────────────────────────────────────────────
    const selectMission = useCallback((mode: MSGameMode) => {
        const ns: MSGameState = {
            ...gameStateRef.current,
            mode,
            m1Calibrated: false,
            m2Bin1Count: 0, m2Bin2Count: 0,
            m3Bin1Count: 0, m3Bin2Count: 0,
            spectrumCounts: {},
        };
        gameStateRef.current = ns;
        setGameState(ns);
        setSpectrumData({});
        setM2Counts({ bin1: 0, bin2: 0 });
        setM3Counts({ bin1: 0, bin2: 0 });
        setM1Done(false);
        imperativeRef.current?.reset();
        setShowModal(false);
    }, []);

    // ── MS Callbacks ──────────────────────────────────────────────────────────
    const msCallbacks = useRef<MSCallbacks>({
        onBinHit: (binIndex, isotope) => {
            pushToast(`✅ ${isotope} → Rổ ${binIndex}!`, 'success');
            setM2Counts(c => binIndex === 1
                ? { ...c, bin1: c.bin1 + 1 }
                : { ...c, bin2: c.bin2 + 1 });
            setM3Counts(c => binIndex === 1
                ? { ...c, bin1: c.bin1 + 1 }
                : { ...c, bin2: c.bin2 + 1 });
        },
        onBinMiss: (isotope) => {
            pushToast(`❌ ${isotope} bắn vào vách!`, 'error');
        },
        onMissionComplete: (mode) => {
            if (mode === 'mission1') {
                setM1Done(true);
                pushToast('🎉 Hiệu chuẩn thành công! Huy hiệu đã mở!', 'badge');
            } else if (mode === 'mission2') {
                pushToast('🎉 Đã tách đủ 30 hạt mỗi loại! Nhiệm vụ hoàn thành!', 'badge');
            } else if (mode === 'mission3') {
                pushToast('🎉 Chính xác tuyệt vời! I-131 đã được tách ra!', 'badge');
            }
        },
        onBadgeEarned: (id, name, emoji) => {
            setGameState(s => {
                const ns = { ...s, badges: new Set(s.badges) };
                ns.badges.add(id as MSBadgeId);
                persistMSGameState(ns);
                gameStateRef.current = ns;
                return ns;
            });
            pushToast(`🏆 Huy hiệu mới: ${emoji} ${name}`, 'badge');
        },
        onSpectrumUpdate: (key, count) => {
            setSpectrumData(d => ({ ...d, [key]: count }));
        },
    });

    // ── Print spectrum ────────────────────────────────────────────────────────
    const printSpectrum = () => {
        const entries = Object.entries(spectrumData);
        const text = entries.map(([k, v]) => `${k}: ${v}`).join('\n');
        const blob = new Blob([`Mass Spectrum Report\n===================\n${text}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = 'mass_spectrum.txt'; a.click();
        URL.revokeObjectURL(url);
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const currentMission = MISSION_CARDS.find(m => m.id === gameState.mode);
    const hasBadge = (id: string) => gameState.badges.has(id as MSBadgeId);

    // ── Hint values for Mission 1 ─────────────────────────────────────────────
    const m1HintB = getCalibrationB(2000).toFixed(3);

    return (
        <div className="msg-root">
            {/* 3D Canvas */}
            <MassSpectrometerSimulation
                gameStateRef={gameStateRef}
                msCallbacks={msCallbacks.current}
                imperativeRef={imperativeRef}
            />

            {/* Mission Select Modal */}
            {showModal && (
                <div className="msg-modal-bg">
                    <div className="msg-modal">
                        <div className="msg-modal-header">
                            <h2><RocketOutlined style={{ color: '#60a5fa', marginRight: 8 }} />MÁY QUANG PHỔ KHỐI — CHỌN NHIỆM VỤ</h2>
                            <p className="msg-streak"><FireOutlined style={{ color: '#f97316' }} /> Streak: {gameState.streakCount} ngày</p>
                        </div>
                        <div className="msg-mission-cards">
                            {MISSION_CARDS.map(m => (
                                <button
                                    key={m.id}
                                    className="msg-mission-card"
                                    style={{ borderColor: m.color }}
                                    onClick={() => selectMission(m.id)}
                                >
                                    <span className="msg-mission-icon">{m.icon}</span>
                                    <div className="msg-mission-info">
                                        <strong style={{ color: m.color }}>{m.title}</strong>
                                        <span>{m.subtitle}</span>
                                    </div>
                                    {hasBadge(m.badge) && <span className="msg-badge-tick">✅</span>}
                                </button>
                            ))}
                        </div>
                        <button className="msg-btn msg-btn-secondary" onClick={() => selectMission('free')}>
                            <ExperimentOutlined /> Chế độ Tự Do
                        </button>
                    </div>
                </div>
            )}

            {/* Top HUD */}
            {!showModal && (
                <div className="msg-hud-top">
                    <button className="msg-btn msg-btn-icon" onClick={() => setShowModal(true)}>
                        <ArrowLeftOutlined /> Nhiệm vụ
                    </button>
                    {currentMission && (
                        <span className="msg-hud-label" style={{ color: currentMission.color }}>
                            {currentMission.icon} {currentMission.subtitle}
                        </span>
                    )}
                    <div className="msg-hud-right">
                        <button className="msg-btn msg-btn-icon" onClick={() => setShowBadges(v => !v)}>
                            <TrophyOutlined /> {gameState.badges.size}/{Object.keys(MS_BADGES).length}
                        </button>
                        <button className="msg-btn msg-btn-icon" onClick={() => setShowSpectrum(v => !v)}>
                            <BarChartOutlined />
                        </button>
                    </div>
                </div>
            )}

            {/* Story Banner */}
            {currentMission && !showModal && (
                <div className="msg-story-banner" style={{ borderColor: currentMission.color }}>
                    <p>{currentMission.story}</p>
                </div>
            )}

            {/* Mission 1 Panel */}
            {gameState.mode === 'mission1' && !showModal && (
                <div className="msg-panel msg-m1-panel">
                    {m1Done ? (
                        <div className="msg-success-box">
                            ✅ Hiệu chuẩn thành công! Ion ¹²C⁺ vào đúng Máy dò 1!
                        </div>
                    ) : (
                        <>
                            <p className="msg-target"><AimOutlined /> Đưa ¹²C⁺ vào Máy dò 1</p>
                            <div className="msg-m1-steps">
                                <div className="msg-step">
                                    <span className="msg-step-num">1</span>
                                    <span>Chọn <strong>C-12</strong> trong mục <em>Sample Properties</em></span>
                                </div>
                                <div className="msg-step">
                                    <span className="msg-step-num">2</span>
                                    <span>Kéo <strong>Magnetic Field B</strong> đến ≈ <strong>{m1HintB} T</strong></span>
                                </div>
                                <div className="msg-step">
                                    <span className="msg-step-num">3</span>
                                    <span>Quan sát quỹ đạo — hạt phải lọt vào rổ xanh lá đầu tiên</span>
                                </div>
                            </div>
                            <details className="msg-hint-detail">
                                <summary><BulbOutlined /> Công thức</summary>
                                <p>R = mv / (qB) — Tăng B → R nhỏ hơn (cua gấp hơn)</p>
                            </details>
                        </>
                    )}
                </div>
            )}

            {/* Mission 2 Panel */}
            {gameState.mode === 'mission2' && !showModal && (
                <div className="msg-panel msg-m2-panel">
                    <p className="msg-target"><ExperimentOutlined /> Tách C-12 (Rổ 1) và C-14 (Rổ 2)</p>
                    <div className="msg-progress-row">
                        <div className="msg-progress-item" style={{ color: '#44ff88' }}>
                            <span>🟢 C-12 → Rổ 1</span>
                            <div className="msg-prog-bar">
                                <div className="msg-prog-fill" style={{
                                    width: `${Math.min(100, (m2Counts.bin1 / M2_TARGET_COUNT) * 100)}%`,
                                    background: '#44ff88',
                                }} />
                            </div>
                            <span>{m2Counts.bin1}/{M2_TARGET_COUNT}</span>
                        </div>
                        <div className="msg-progress-item" style={{ color: '#ff4444' }}>
                            <span>🔴 C-14 → Rổ 2</span>
                            <div className="msg-prog-bar">
                                <div className="msg-prog-fill" style={{
                                    width: `${Math.min(100, (m2Counts.bin2 / M2_TARGET_COUNT) * 100)}%`,
                                    background: '#ff4444',
                                }} />
                            </div>
                            <span>{m2Counts.bin2}/{M2_TARGET_COUNT}</span>
                        </div>
                    </div>
                    <details className="msg-hint-detail">
                        <summary><BulbOutlined /> Gợi ý</summary>
                        <p>
                            R ∝ √m (cùng q, U, B) → C-14 có R lớn hơn C-12 khoảng {(Math.sqrt(14/12) * 100 - 100).toFixed(1)}%.
                            <br/>Tăng B để phân tách rộng hơn.
                        </p>
                    </details>
                </div>
            )}

            {/* Mission 3 Panel */}
            {gameState.mode === 'mission3' && !showModal && (
                <div className="msg-panel msg-m3-panel">
                    <p className="msg-target"><MedicineBoxOutlined /> Tách I-127 (Rổ 1) và I-131 (Rổ 2)</p>
                    <div className="msg-progress-row">
                        <div className="msg-progress-item" style={{ color: '#44aaff' }}>
                            <span>🔵 I-127 → Rổ 1</span>
                            <div className="msg-prog-bar">
                                <div className="msg-prog-fill" style={{
                                    width: `${Math.min(100, (m3Counts.bin1 / M3_TARGET_COUNT) * 100)}%`,
                                    background: '#44aaff',
                                }} />
                            </div>
                            <span>{m3Counts.bin1}/{M3_TARGET_COUNT}</span>
                        </div>
                        <div className="msg-progress-item" style={{ color: '#ff8822' }}>
                            <span>🟠 I-131 → Rổ 2</span>
                            <div className="msg-prog-bar">
                                <div className="msg-prog-fill" style={{
                                    width: `${Math.min(100, (m3Counts.bin2 / M3_TARGET_COUNT) * 100)}%`,
                                    background: '#ff8822',
                                }} />
                            </div>
                            <span>{m3Counts.bin2}/{M3_TARGET_COUNT}</span>
                        </div>
                    </div>
                    <details className="msg-hint-detail">
                        <summary><BulbOutlined /> Công thức & Chiến lược</summary>
                        <p>
                            m/q = B²R² / (2U)<br/>
                            ΔR/R = Δm/(2m) ≈ {(4/(2*131)*100).toFixed(2)}%<br/>
                            → Cần B lớn và U nhỏ để phân tách rõ hơn.
                        </p>
                    </details>
                </div>
            )}

            {/* Badge Drawer */}
            {showBadges && (
                <div className="msg-drawer">
                    <div className="msg-drawer-header">
                        <h3><TrophyOutlined style={{ color: '#f59e0b', marginRight: 6 }} /> Huy Hiệu</h3>
                        <button onClick={() => setShowBadges(false)}><CloseOutlined /></button>
                    </div>
                    {Object.values(MS_BADGES).map(b => (
                        <div key={b.id} className={`msg-badge-row ${hasBadge(b.id) ? 'msg-badge-earned' : 'msg-badge-locked'}`}>
                            <span className="msg-badge-emoji">{b.emoji}</span>
                            <div><strong>{b.name}</strong><p>{b.description}</p></div>
                            {hasBadge(b.id)
                                ? <CheckCircleFilled style={{ color: '#22c55e', fontSize: 18 }} />
                                : <LockOutlined style={{ color: '#475569', fontSize: 16 }} />}
                        </div>
                    ))}
                    <div className="msg-streak-info">
                        <FireOutlined style={{ color: '#f97316' }} /> Streak: <strong>{gameState.streakCount}</strong> ngày
                    </div>
                </div>
            )}

            {/* Spectrum Drawer */}
            {showSpectrum && (
                <div className="msg-drawer msg-drawer-left">
                    <div className="msg-drawer-header">
                        <h3><BarChartOutlined style={{ marginRight: 6 }} /> Phổ Khối</h3>
                        <button onClick={() => setShowSpectrum(false)}><CloseOutlined /></button>
                    </div>
                    <SpectrumChart data={spectrumData} />
                    <button className="msg-btn msg-btn-primary" onClick={printSpectrum}>
                        <PrinterOutlined /> In kết quả
                    </button>
                    <p className="msg-hint">Xuất file .txt cho giáo viên</p>
                </div>
            )}

            {/* Toasts */}
            <div className="msg-toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`msg-toast msg-toast-${t.type}`}>{t.text}</div>
                ))}
            </div>
        </div>
    );
};

export default MSGame;
