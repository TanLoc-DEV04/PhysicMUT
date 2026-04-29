import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "lil-gui";
import {
  MEDIUMS,
  HEARING_RANGES,
  NOTE_PRESETS,
  type NotePreset,
  type LSGameState,
} from "./types";
import { M1_B, M1_L } from "./lsGameState";
import { renderToString } from "react-dom/server";
import {
  PlayCircleOutlined,
  ThunderboltOutlined,
  SoundOutlined,
  GlobalOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

// ── Props ─────────────────────────────────────────────────────────────────────
export interface LSSimCallbacks {
  onStateChange: (fMax: number, freq: number, isVacuum: boolean) => void;
  onMission1Win: () => void;
  onMission2Win: () => void;
  onMission3Reveal: () => void;
}

export interface LSSimulationProps {
  gameStateRef: React.MutableRefObject<LSGameState>;
  callbacks: LSSimCallbacks;
  imperativeRef?: React.MutableRefObject<{
    setMedium: (m: string) => void;
  } | null>;
}

export default function LoudspeakerSimulation({
  gameStateRef,
  callbacks,
  imperativeRef,
}: LSSimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const guiRef = useRef<GUI | null>(null);

  const [radarData, setRadarData] = useState({
    freq: 20,
    medium: "Không khí (Air)",
    statusText: "Sóng lan truyền bình thường",
    statusColor: "#00ffcc",
    animals: HEARING_RANGES.map((a) => ({ ...a, active: false })),
  });

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild)
      mountRef.current.removeChild(mountRef.current.firstChild);

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 10, 60);

    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(20, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spotLight = new THREE.SpotLight(0xffffff, 20);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    // ── Loudspeaker model ─────────────────────────────────────────────────
    const staticGroup = new THREE.Group();
    const movingGroup = new THREE.Group();

    const matSteel = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.3,
      metalness: 0.8,
    });
    const matCopper = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.3,
      metalness: 0.6,
    });
    const matCone = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const matSpider = new THREE.MeshStandardMaterial({
      color: 0xed8936,
      side: THREE.DoubleSide,
      wireframe: true,
    });

    const magnet = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 2, 32),
      matSteel,
    );
    magnet.rotation.x = Math.PI / 2;
    staticGroup.add(magnet);

    const coil = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 1.5, 32, 1, true),
      matCopper,
    );
    coil.rotation.x = Math.PI / 2;
    movingGroup.add(coil);

    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 2, 3, 64, 1, true),
      matCone,
    );
    cone.rotation.x = Math.PI / 2;
    cone.position.z = 1.5;
    movingGroup.add(cone);

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, 0.5),
      matCone,
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 1.8;
    movingGroup.add(cap);

    const spider = new THREE.Mesh(
      new THREE.RingGeometry(2, 4, 32, 4),
      matSpider,
    );
    spider.position.z = 0.5;
    movingGroup.add(spider);

    scene.add(staticGroup);
    scene.add(movingGroup);

    // ── Particle system ───────────────────────────────────────────────────
    const PARTICLE_COUNT = 4000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(PARTICLE_COUNT * 3);
    const particleBase = new Float32Array(PARTICLE_COUNT * 3);

    const secureRandom = () => {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] / (0xffffffff + 1);
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (secureRandom() - 0.5) * 40;
      const y = (secureRandom() - 0.5) * 40;
      const z = secureRandom() * 50;
      particlePos[i * 3] = particleBase[i * 3] = x;
      particlePos[i * 3 + 1] = particleBase[i * 3 + 1] = y;
      particlePos[i * 3 + 2] = particleBase[i * 3 + 2] = z;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePos, 3),
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const soundCloud = new THREE.Points(particleGeo, particleMat);
    scene.add(soundCloud);

    // ── State ─────────────────────────────────────────────────────────────
    const state = {
      frequency: 20,
      currentAmplitude: 1.0, // I₀ (A)
      medium: "Air",
      waveform: "Sine",
      exploded: 0,
      currentNote: "Custom",
      isPlaying: true,
    };

    // Track mission1/2 win so we only fire once
    let m1WinFired = false;
    let m2WinFired = false;
    let m3WinFired = false;
    let prevVacuum = false;

    // ── Bio-Radar update ──────────────────────────────────────────────────
    const updateBioRadar = () => {
      const f = state.frequency;
      const medium = MEDIUMS[state.medium];
      const matchPreset = NOTE_PRESETS.find(
        (n) => Math.abs(n.frequency - f) < 0.1,
      );

      let statusText = "Sóng lan truyền bình thường";
      let statusColor = "#00ffcc";
      if (!medium.canPropagate) {
        statusText = "CHÂN KHÔNG: Không có âm thanh!";
        statusColor = "red";
      } else if (matchPreset) {
        statusText = `${matchPreset.note} - ${matchPreset.description}`;
        statusColor = "#fff";
      }

      setRadarData({
        freq: f,
        medium: medium.name,
        statusText,
        statusColor,
        animals: HEARING_RANGES.map((a) => ({
          ...a,
          active: f >= a.min && f <= a.max,
        })),
      });
      if (medium.canPropagate) {
        const hue = Math.max(0, 0.7 - Math.log10(f) / 6);
        particleMat.color.setHSL(hue, 1.0, 0.5);
      }
    };

    const updateMediumVisuals = (mKey: string) => {
      const m = MEDIUMS[mKey];
      soundCloud.visible = m.canPropagate;
      if (mKey === "Air") {
        scene.background = new THREE.Color(0xf5f5f5);
        scene.fog = new THREE.Fog(0xf5f5f5, 10, 60);
        particleMat.color.setHex(0x3b82f6);
      } else if (mKey === "Water") {
        scene.background = new THREE.Color(0x001133);
        scene.fog = new THREE.Fog(0x001133, 10, 60);
        particleMat.color.setHex(0x88ccff);
      } else /* Vacuum */ {
        scene.background = new THREE.Color(0x111111);
        scene.fog = new THREE.Fog(0x111111, 10, 60);
      }
      updateBioRadar();
    };

    const stopAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };

    const playNote = (preset: NotePreset) => {
      stopAudio();
      state.frequency = preset.frequency;
      updateBioRadar();
      if (preset.audioFile) {
        const audio = new Audio(`/${preset.audioFile}`);
        audio.loop = true;
        audio.volume = Math.min(1, state.currentAmplitude * 0.2);
        audio.play().catch((e) => console.warn("Audio blocked", e));
        audioRef.current = audio;
      }
    };

    // ── Imperative API ────────────────────────────────────────────────────
    if (imperativeRef) {
      imperativeRef.current = {
        setMedium: (m: string) => {
          state.medium = m;
          updateMediumVisuals(m);
        },
      };
    }

    // ── GUI ───────────────────────────────────────────────────────────────
    if (guiRef.current) guiRef.current.destroy();
    const gui = new GUI({
      container: mountRef.current,
      title: "ĐIỀU KHIỂN LOA",
      width: 290,
    });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "10px";
    gui.domElement.style.right = "10px";
    guiRef.current = gui;

    const styleId = "ls-gui-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
                .lil-gui { --width:290px; --name-width:45%; --background-color:#1f1f1f; --text-color:#eaeaea;
                    --title-background-color:#111; --widget-color:#444; --hover-color:#0088ff;
                    --number-color:#2cc9ff; --string-color:#a2db3c; font-size:14px; }
                .lil-gui select { background:#111 !important; color:#eaeaea !important; }
            `;
      document.head.appendChild(style);
    }

    const addIcon = (item: any, icon: React.ReactElement, text: string) => {
      const html = `${renderToString(icon)} ${text}`;
      if (item.$title) item.$title.innerHTML = html;
      else if (item.$name) item.$name.innerHTML = html;
    };

    const ctrlPower = gui
      .add(state, "isPlaying")
      .name("Nguồn điện (Power)")
      .onChange((v: boolean) => {
        if (!v) stopAudio();
      });
    addIcon(
      ctrlPower,
      <PlayCircleOutlined style={{ marginRight: 6, color: "#22c55e" }} />,
      "Nguồn điện (Power)",
    );

    const folderPhys = gui.addFolder("Vật Lý & Tín Hiệu");
    addIcon(
      folderPhys,
      <ThunderboltOutlined style={{ marginRight: 6, color: "#f59e0b" }} />,
      "Vật Lý & Tín Hiệu",
    );
    folderPhys
      .add(state, "frequency", 1, 25000, 1)
      .name("Tần số f (Hz)")
      .listen()
      .onChange(updateBioRadar);
    folderPhys
      .add(state, "currentAmplitude", 0, 5, 0.01)
      .name("Cường độ I₀ (A)")
      .listen()
      .onChange((v: number) => {
        if (audioRef.current) audioRef.current.volume = Math.min(1, v * 0.2);
      });
    folderPhys
      .add(state, "waveform", ["Sine", "Square", "Triangle", "Pulse"])
      .name("Dạng sóng");
    folderPhys.add(state, "exploded", 0, 5).name("Tháo rời (Exploded View)");

    const folderNotes = gui.addFolder("Mẫu Âm Thanh");
    addIcon(
      folderNotes,
      <SoundOutlined style={{ marginRight: 6, color: "#a78bfa" }} />,
      "Mẫu Âm Thanh",
    );
    folderNotes
      .add(state, "currentNote", ["Custom", ...NOTE_PRESETS.map((n) => n.note)])
      .name("Chọn nốt")
      .onChange((val: string) => {
        if (val === "Custom") stopAudio();
        else {
          const p = NOTE_PRESETS.find((n) => n.note === val);
          if (p) playNote(p);
        }
      });

    const folderEnv = gui.addFolder("Môi Trường");
    addIcon(
      folderEnv,
      <GlobalOutlined style={{ marginRight: 6, color: "#38bdf8" }} />,
      "Môi Trường",
    );
    folderEnv
      .add(state, "medium", Object.keys(MEDIUMS))
      .name("Chất dẫn truyền")
      .onChange(updateMediumVisuals);

    const infoF = gui.addFolder("Thông số");
    addIcon(
      infoF,
      <BarChartOutlined style={{ marginRight: 6, color: "#4ade80" }} />,
      "Thông số",
    );
    const info = { FMax: 0, FreqHz: 0 };
    infoF.add(info, "FMax").name("F_max (N)").disable().listen();
    infoF.add(info, "FreqHz").name("Tần số (Hz)").disable().listen();

    // ── Animation loop ────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const medium = MEDIUMS[state.medium];

      // Exploded view
      if (state.exploded >= 0) {
        cone.position.z = 1.5 + state.exploded * 1.5;
        cap.position.z = 1.8 + state.exploded * 1.5;
        spider.position.z = 0.5 + state.exploded * 0.8;
        coil.position.z = 0 + state.exploded * 0.2;
      }

      if (!state.isPlaying) {
        movingGroup.position.z = 0;
        renderer.render(scene, camera);
        controls.update();
        return;
      }

      // Coil vibration (B × I always acts, even in vacuum — correct physics!)
      const B = M1_B,
        L = M1_L;
      const I0 = state.currentAmplitude;
      const fMax = B * I0 * L;
      info.FMax = parseFloat(fMax.toFixed(4));
      info.FreqHz = Math.round(state.frequency);

      const visualFreq =
        state.frequency > 60
          ? 60 + Math.log10(state.frequency) * 10
          : state.frequency;
      let disp = 0;
      const phi = visualFreq * time;
      switch (state.waveform) {
        case "Sine":
          disp = Math.sin(phi);
          break;
        case "Square":
          disp = Math.sign(Math.sin(phi));
          break;
        case "Triangle":
          disp = Math.asin(Math.sin(phi)) / (Math.PI / 2);
          break;
        case "Pulse":
          disp = Math.sin(phi) > 0.9 ? 1 : 0;
          break;
      }
      // Scale displacement by F (amplitude ∝ current)
      disp *= Math.min(fMax / 0.2, 1.0) * 0.8;
      movingGroup.position.z = disp;

      // Particle waves — only when medium can propagate
      if (medium.canPropagate) {
        const pos = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const zIdx = i * 3 + 2;
          const zBase = particleBase[zIdx];
          const phase = zBase * (0.5 / medium.speed) - phi * medium.speed;
          const wave = Math.sin(phase);
          const decay = Math.exp(-zBase * 0.05);
          pos[zIdx] = zBase + wave * state.currentAmplitude * decay;
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // ── Mission checks ────────────────────────────────────────────────
      const gs = gameStateRef.current;

      // M1: I₀ close to target 2A → F_max ≈ 0.175N
      if (gs.mode === "mission1" && !m1WinFired && Math.abs(I0 - 2.0) < 0.06) {
        m1WinFired = true;
        callbacks.onMission1Win();
      }
      // M2: freq > 20kHz
      if (gs.mode === "mission2" && !m2WinFired && state.frequency > 20000) {
        m2WinFired = true;
        callbacks.onMission2Win();
      }
      // M3: vacuum activated while power is on
      const nowVacuum = state.medium === "Vacuum";
      if (
        gs.mode === "mission3" &&
        !m3WinFired &&
        nowVacuum &&
        !prevVacuum &&
        state.isPlaying
      ) {
        m3WinFired = true;
        callbacks.onMission3Reveal();
      }
      prevVacuum = nowVacuum;

      // Report state to UI each frame
      callbacks.onStateChange(fMax, state.frequency, nowVacuum);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    updateMediumVisuals("Air");

    // ── Resize ────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth,
        h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(mountRef.current);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameId);
      renderer.dispose();
      stopAudio();
      if (guiRef.current) guiRef.current.destroy();
      if (mountRef.current?.contains(renderer.domElement))
        mountRef.current.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />
      {/* Bio-Radar Overlay */}
      <div className="absolute bottom-5 left-5 w-[280px] bg-slate-900/90 text-[#00ffcc] p-4 rounded-lg border border-[#4fd1c5] font-mono shadow-lg pointer-events-auto">
        <h3 className="font-bold text-base mb-2 text-[#4fd1c5] border-b border-gray-600 pb-1">
          RADAR ÂM THANH
        </h3>
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-400">Tần số (f):</span>
          <span className="font-bold text-white">
            {Math.round(radarData.freq).toLocaleString()} Hz
          </span>
        </div>
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-400">Môi trường:</span>
          <span className="font-bold text-white">{radarData.medium}</span>
        </div>
        <div className="flex justify-between mb-3 text-sm">
          <span className="text-gray-400">Trạng thái:</span>
          <span className="font-bold" style={{ color: radarData.statusColor }}>
            {radarData.statusText}
          </span>
        </div>
        <hr className="border-gray-700 my-2" />
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {radarData.animals.map((a, i) => (
            <div
              key={i}
              className={`text-xs transition-all duration-300 ${a.active ? "opacity-100 text-yellow-300 font-bold" : "opacity-30 text-gray-400"}`}
            >
              {a.icon} {a.name} ({a.min}–{a.max} Hz)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
