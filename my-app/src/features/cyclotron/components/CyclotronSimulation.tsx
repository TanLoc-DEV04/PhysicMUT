import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import {
  createDee,
  createElectromagnet,
  createOscillator,
  createTarget,
  createVacuumChamber,
  createDeeEnclosure,
} from "../logic/sceneObjects";
import {
  PARTICLE_TYPES,
  type SimulationParams,
  type SimulationState,
  type OscillatorState,
  type GameState,
  type GameMode,
} from "../../../core/cyclotron/cyclotronConstants";
import { renderToString } from "react-dom/server";
import {
  PlayCircleOutlined,
  ReloadOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  EyeOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { updateParticlePhysics } from "../../../core/cyclotron/cyclotronPhysics";
import {
  updateFlameEffect,
  cleanupFlames,
} from "../../../core/cyclotron/flameLogic";
import { handleSpacePress, type MissionCallbacks } from "../logic/missionLogic";

// ─── Colour / skin maps ───────────────────────────────────────────────────────
const PARTICLE_COLOUR_MAP: Record<GameState["particleColor"], number> = {
  blue: 0x88ccff,
  red: 0xff5533,
  purple: 0xcc66ff,
  orange: 0xff8822,
};

const DEE_SKIN: Record<
  GameState["cosmeticSkin"],
  { d1: number; d2: number; opacity: number }
> = {
  default: { d1: 0xff8800, d2: 0x0088ff, opacity: 0.7 },
  xray: { d1: 0xaaffff, d2: 0xaaffff, opacity: 0.25 },
  cyberpunk: { d1: 0xff00cc, d2: 0x00ffcc, opacity: 0.85 },
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CyclotronSimulationProps {
  /** Live reference — the component reads it every frame so React re-renders are avoided */
  gameStateRef: React.MutableRefObject<GameState>;
  callbacks: MissionCallbacks;
  onParticleExtracted?: (keMev: number) => void;
  imperativeRef?: React.MutableRefObject<{ resetParticle: () => void } | null>;
}

// ─── Programmatic Arrow Texture ───────────────────────────────────────────────
/**
 * Creates a vertical arrow-strip texture using Canvas API.
 * Returns a THREE.CanvasTexture with wrapT = RepeatWrapping so it scrolls.
 */
function createArrowTexture(): THREE.CanvasTexture {
  const W = 64;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Transparent background
  ctx.clearRect(0, 0, W, H);

  // Draw 4 repeating arrow segments (each H/4 tall)
  const segH = H / 4;
  for (let seg = 0; seg < 4; seg++) {
    const yBase = seg * segH;

    // Stem line
    ctx.strokeStyle = "rgba(0, 255, 255, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2, yBase + segH * 0.85);
    ctx.lineTo(W / 2, yBase + segH * 0.2);
    ctx.stroke();

    // Arrowhead pointing UP (toward negative Y offset → flows downward visually with offset.y--)
    ctx.fillStyle = "rgba(0, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(W / 2, yBase + segH * 0.1); // tip
    ctx.lineTo(W / 2 - 10, yBase + segH * 0.28); // left
    ctx.lineTo(W / 2 + 10, yBase + segH * 0.28); // right
    ctx.closePath();
    ctx.fill();

    // Subtle glow dot at tip
    const grad = ctx.createRadialGradient(
      W / 2,
      yBase + segH * 0.1,
      0,
      W / 2,
      yBase + segH * 0.1,
      8,
    );
    grad.addColorStop(0, "rgba(0,255,255,0.6)");
    grad.addColorStop(1, "rgba(0,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(W / 2, yBase + segH * 0.1, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3); // 3 repeats along cylinder height
  return tex;
}

// ─── Trail constants ──────────────────────────────────────────────────────────

export default function CyclotronSimulation({
  gameStateRef,
  callbacks,
  onParticleExtracted,
  imperativeRef,
}: CyclotronSimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const guiRef = useRef<GUI | null>(null);
  const hudRef = useRef<SVGSVGElement | null>(null);
  const hudAnimRef = useRef<Animation | null>(null);

  // ----- Physics state (mutable refs, not React state) -----------------------
  const paramsRef = useRef<SimulationParams>({
    particleType: "Proton",
    mass: 1.67e-27,
    charge: 1.6e-19,
    voltage: 2000,
    magneticField: 1.0,
    maxRadius: 2.5,
    oscillationFreq: 1.0,
    showFieldLines: true,
    animateFieldLines: true,
    fieldAnimationSpeed: 2.0,
    animationSpeed: 1.0,
    isRunning: true,
    showEField: true,
    cyclotronFreq: 0,
    currentRadius: 0,
    currentVelocity: 0,
    revolutions: 0,
    kineticEnergyMeV: 0,
    extractParticle: false,
    // LC Oscillator defaults
    lc_L: 0.5,
    lc_C: 0.002,
    lc_R: 0.05,
    lc_frequency: 0,
    lc_isOn: true,
    showOscilloscope: true,
  });

  const oscStateRef = useRef<OscillatorState>({
    q: 10.0,
    i: 0.0,
    historyQ: [],
    historyI: [],
  });

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isAudioOnRef = useRef(false);

  const simStateRef = useRef<SimulationState>({
    angle: Math.PI / 2,
    radius: 0.1,
    velocity: 0,
    isInDee: false,
    currentDee: 1,
    revolutionCount: 0,
    isAccelerating: false,
    time: 0,
    isExtracted: false,
    isInGapNow: false,
  });

  // Second particle state (Mission 3 — Alpha)
  const simState2Ref = useRef<SimulationState>({
    angle: Math.PI / 2,
    radius: 0.1,
    velocity: 0,
    isInDee: false,
    currentDee: 1,
    revolutionCount: 0,
    isAccelerating: false,
    time: 0,
    isExtracted: false,
    isInGapNow: false,
  });

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // ── Scene setup ──────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d14);

    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ── Lighting ─────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.8);
    d1.position.set(3, 4, 3);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.4);
    d2.position.set(-3, 2, -3);
    scene.add(d2);

    // ── Dees ─────────────────────────────────────────────────────────────
    const MAGNET_SPACING = 2.2;
    const deeGroup = new THREE.Group();

    const dee1 = createDee(0xff8800, "+", 0);
    dee1.rotation.z = Math.PI / 2;
    dee1.position.x = -0.25;

    const dee2 = createDee(0x0088ff, "-", Math.PI);
    dee2.rotation.z = -Math.PI / 2;
    dee2.position.x = 0.25;

    deeGroup.add(dee1, dee2);
    scene.add(deeGroup);

    scene.add(
      createElectromagnet(new THREE.Vector3(0, MAGNET_SPACING, 0), "S"),
    );
    scene.add(
      createElectromagnet(new THREE.Vector3(0, -MAGNET_SPACING, 0), "N"),
    );
    scene.add(createVacuumChamber());
    scene.add(createDeeEnclosure());
    const oscGroup = createOscillator();
    scene.add(oscGroup);
    scene.add(createTarget());

    // References to oscillator parts for glow/particles
    // References to oscillator parts for glow/particles
    const capPart = oscGroup.getObjectByName("capacitorPart") as THREE.Group;
    const indPart = oscGroup.getObjectByName("inductorPart") as THREE.Mesh;
    const elePart = oscGroup.getObjectByName(
      "electronParticles",
    ) as THREE.Points;
    const capMat = (capPart?.children[0] as THREE.Mesh)
      ?.material as THREE.MeshPhongMaterial;
    const indMat = indPart?.material as THREE.MeshPhongMaterial;
    const powerBtn = oscGroup.getObjectByName("lcPowerButton") as THREE.Mesh;
    const statusLed = oscGroup.getObjectByName("lcStatusLed") as THREE.Mesh;

    // ── FEATURE: E-field Visualization ──────────────────────────────────
    const eFieldArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      0.5,
      0xff0044,
    );
    scene.add(eFieldArrow);

    // Label for E-field
    const eFieldCanvas = document.createElement("canvas");
    eFieldCanvas.width = 128;
    eFieldCanvas.height = 64;
    const ectx = eFieldCanvas.getContext("2d")!;
    ectx.fillStyle = "white";
    ectx.font = "bold 40px Arial";
    // ectx.textAlign = 'center'; ectx.fillText('E-field', 64, 45);
    const eFieldTex = new THREE.CanvasTexture(eFieldCanvas);
    const eFieldLabelMat = new THREE.SpriteMaterial({
      map: eFieldTex,
      transparent: true,
    });
    const eFieldLabel = new THREE.Sprite(eFieldLabelMat);
    eFieldLabel.scale.set(0.8, 0.4, 1);
    eFieldLabel.position.set(0, 0.6, 0);
    scene.add(eFieldLabel);

    // ── Interaction: Raycaster for 3D Button ──────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([powerBtn], true);
      if (intersects.length > 0) {
        paramsRef.current.lc_isOn = !paramsRef.current.lc_isOn;
        // Add a small click feedack (move button slightly or flash)
        powerBtn.position.z -= 0.02;
        setTimeout(() => {
          if (powerBtn) powerBtn.position.z += 0.02;
        }, 100);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // ── Main particle ─────────────────────────────────────────────────────
    const particleMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffaa }),
    );
    const particleLight = new THREE.PointLight(0xffffaa, 2, 5);
    particleMesh.add(particleLight);
    scene.add(particleMesh);

    // ── Second particle (Mission 3 — Alpha) ───────────────────────────────
    const particle2Mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xff8866 }),
    );
    const particle2Light = new THREE.PointLight(0xff4400, 1.5, 5);
    particle2Mesh.add(particle2Light);
    particle2Mesh.visible = false;
    scene.add(particle2Mesh);

    // Alpha params (shared const)
    const params2: SimulationParams = {
      ...paramsRef.current,
      particleType: "Alpha",
      mass: PARTICLE_TYPES["Alpha"].mass,
      charge: PARTICLE_TYPES["Alpha"].charge,
    };

    // ════════════════════════════════════════════════════════════════════
    // ── FEATURE 1: Animated Magnetic Field Lines (UV Texture Scrolling) ──
    // ════════════════════════════════════════════════════════════════════
    const arrowTexture = createArrowTexture();

    const bFieldMaterial = new THREE.MeshBasicMaterial({
      map: arrowTexture,
      transparent: true,
      opacity: 0.65,
      color: 0x00ffff,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const bFieldLines: THREE.Mesh[] = [];
    const bFieldGroup = new THREE.Group();
    scene.add(bFieldGroup);

    const FIELD_HEIGHT = MAGNET_SPACING * 2 - 0.4; // span between magnets

    const rebuildFieldLines = () => {
      // Remove old meshes
      bFieldGroup.clear();
      bFieldLines.length = 0;

      if (!paramsRef.current.showFieldLines) return;

      const maxR = paramsRef.current.maxRadius;
      const spacing = Math.max(0.55, maxR / 4);

      for (let xi = -maxR; xi <= maxR; xi += spacing) {
        for (let zi = -maxR; zi <= maxR; zi += spacing) {
          const dist = Math.hypot(xi, zi);
          if (dist > maxR + 0.1 || dist < 0.3) continue; // skip centre & outside

          // Vary opacity by magnetic field strength
          const op = Math.min(
            0.8,
            0.35 + 0.35 * (paramsRef.current.magneticField / 4.0),
          );
          const mat = bFieldMaterial.clone();
          mat.opacity = op;

          const geo = new THREE.CylinderGeometry(0.04, 0.04, FIELD_HEIGHT, 6);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(xi, 0, zi);
          bFieldGroup.add(mesh);
          bFieldLines.push(mesh);
        }
      }
    };
    rebuildFieldLines();

    // ── Flash screen quad ─────────────────────────────────────────────────
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    const flashMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), flashMat);
    flashMesh.renderOrder = 999;
    scene.add(flashMesh);

    const triggerFlash = (colour: number) => {
      flashMat.color.setHex(colour);
      flashMat.opacity = 0.35;
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        flashMat.opacity = 0;
      }, 250);
    };

    // Connect flash to callbacks
    callbacks.onFlash = triggerFlash;

    // ── Healing effect (Mission 2 win) ────────────────────────────────────
    const healMat = new THREE.SpriteMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    let healingParticles: THREE.Sprite[] = [];
    let healingActive = false;
    let healingTimer = 0;
    const triggerHealing = () => {
      healingActive = true;
      healingTimer = 0;
    };
    const onHealingEvent = () => triggerHealing();
    window.addEventListener("cyclotron_healing", onHealingEvent);

    const updateHealing = (dt: number) => {
      if (!healingActive) return;
      healingTimer += dt;
      if (healingTimer < 0.1) {
        for (let i = 0; i < 8; i++) {
          const s = new THREE.Sprite(healMat.clone() as THREE.SpriteMaterial);
          s.position.set(
            2.9 + (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
          );
          s.scale.setScalar(0.4 + Math.random() * 0.3);
          scene.add(s);
          healingParticles.push(s);
        }
      }
      for (let i = healingParticles.length - 1; i >= 0; i--) {
        const sp = healingParticles[i];
        (sp.material as THREE.SpriteMaterial).opacity -= dt * 0.7;
        sp.position.x += dt * 0.4;
        if ((sp.material as THREE.SpriteMaterial).opacity <= 0) {
          scene.remove(sp);
          healingParticles.splice(i, 1);
        }
      }
      if (healingTimer > 3) {
        healingActive = false;
        healingParticles.forEach((s) => scene.remove(s));
        healingParticles = [];
      }
    };

    // ── Reset ─────────────────────────────────────────────────────────────
    const resetParticle = () => {
      simStateRef.current = {
        angle: Math.PI / 2,
        radius: 0.1,
        velocity: 0,
        isInDee: false,
        currentDee: 1,
        revolutionCount: 0,
        isAccelerating: false,
        time: 0,
        isExtracted: false,
        isInGapNow: false,
      };
      simState2Ref.current = { ...simStateRef.current };
      particleMesh.position.set(0, 0, 0);
      particle2Mesh.position.set(0, 0, 0);
      paramsRef.current.revolutions = 0;
      paramsRef.current.currentRadius = 0;
      paramsRef.current.currentVelocity = 0;
      paramsRef.current.kineticEnergyMeV = 0;
      hideHUD();
    };
    if (imperativeRef) imperativeRef.current = { resetParticle };

    // ── Visuals update ────────────────────────────────────────────────────
    const updateVisuals = () => {
      const gs = gameStateRef.current;
      const skin = DEE_SKIN[gs.cosmeticSkin];
      const p = paramsRef.current;
      const st = simStateRef.current;

      // --- RESONANCE SYNC ---
      // Use same omega and simulation time as physics
      const omega = (Math.abs(p.charge) * p.magneticField) / p.mass;
      const phaseValue = Math.cos(omega * st.time);
      const pol = phaseValue > 0 ? 1 : -1;

      const m1 = (dee1.children[0] as THREE.Mesh)
        .material as THREE.MeshPhongMaterial;
      const m2 = (dee2.children[0] as THREE.Mesh)
        .material as THREE.MeshPhongMaterial;
      m1.opacity = skin.opacity;
      m2.opacity = skin.opacity;
      m1.color.setHex(pol > 0 ? skin.d1 : skin.d2);
      m2.color.setHex(pol > 0 ? skin.d2 : skin.d1);

      // Live particle colour
      const pc = PARTICLE_COLOUR_MAP[gs.particleColor];
      (particleMesh.material as THREE.MeshBasicMaterial).color.setHex(pc);
      particleLight.color.setHex(pc);
    };

    // ════════════════════════════════════════════════════════════════════
    // ── FEATURE 3: SVG HUD — helpers ─────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════
    const showHUD = (worldPos: THREE.Vector3) => {
      const hud = hudRef.current;
      if (!hud) return;

      // Project 3D → 2D screen coordinates
      const screenPos = worldPos.clone().project(camera);
      const hw = mountRef.current
        ? mountRef.current.clientWidth
        : window.innerWidth;
      const hh = mountRef.current
        ? mountRef.current.clientHeight
        : window.innerHeight;
      const sx = ((1 + screenPos.x) / 2) * hw;
      const sy = ((1 - screenPos.y) / 2) * hh;

      hud.style.display = "block";
      hud.style.left = `${sx}px`;
      hud.style.top = `${sy}px`;

      // Kick off stroke-dashoffset CSS animation via Web Animations API
      const circle = hud.querySelector(
        "#hud-target-circle",
      ) as SVGCircleElement | null;
      const text = hud.querySelector(
        "#hud-target-text",
      ) as SVGTextElement | null;
      if (!circle) return;

      const total = 2 * Math.PI * 80; // circumference for r=80
      circle.style.strokeDasharray = `${total}`;
      circle.style.strokeDashoffset = `${total}`;

      // Cancel previous animation if any
      if (hudAnimRef.current) hudAnimRef.current.cancel();
      hudAnimRef.current = circle.animate(
        [{ strokeDashoffset: total }, { strokeDashoffset: 0 }],
        {
          duration: 1400,
          easing: "ease-in-out",
          fill: "forwards",
        },
      );

      // Fade in the text
      if (text) {
        text.style.opacity = "0";
        text.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 600,
          delay: 900,
          fill: "forwards",
          easing: "ease-in",
        });
      }
    };

    const hideHUD = () => {
      const hud = hudRef.current;
      if (!hud) return;
      hud.style.display = "none";
      if (hudAnimRef.current) {
        hudAnimRef.current.cancel();
        hudAnimRef.current = null;
      }
    };

    // ── Extraction ────────────────────────────────────────────────────────
    const performExtraction = (mesh: THREE.Mesh, st: SimulationState) => {
      st.isExtracted = true;
      const startPos = mesh.position.clone();
      const endPos = new THREE.Vector3(2.9, 0, 0); // Vị trí chính xác của Target
      let t = 0;

      // Show HUD at extraction point
      showHUD(startPos);

      const anim = () => {
        t += 0.02;
        if (t <= 1) {
          mesh.position.lerpVectors(startPos, endPos, t);
          requestAnimationFrame(anim);
        } else {
          setTimeout(resetParticle, 2000);
        }
      };
      anim();
      if (onParticleExtracted)
        onParticleExtracted(paramsRef.current.kineticEnergyMeV);
    };

    // ── GUI ───────────────────────────────────────────────────────────────
    if (guiRef.current) guiRef.current.destroy();
    const gui = new GUI({ container: mountRef.current, width: 270 });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "10px";
    gui.domElement.style.right = "10px";
    guiRef.current = gui;

    const p = paramsRef.current;
    const addIcon = (item: any, icon: React.ReactElement, text: string) => {
      const html = `${renderToString(icon)} ${text}`;
      if (item.$title) item.$title.innerHTML = html;
      else if (item.$name) item.$name.innerHTML = html;
    };

    const simF = gui.addFolder("Điều Khiển");
    addIcon(
      simF,
      <PlayCircleOutlined style={{ marginRight: 6, color: "#22c55e" }} />,
      "Điều Khiển",
    );
    const playCtrl = simF.add(p, "isRunning").name("Dừng / Chạy").listen();
    addIcon(
      playCtrl,
      <PlayCircleOutlined style={{ marginRight: 6, color: "#3b82f6" }} />,
      "Dừng / Chạy",
    );
    const resetCtrl = simF
      .add({ reset: resetParticle }, "reset")
      .name("Đặt Lại");
    addIcon(
      resetCtrl,
      <ReloadOutlined style={{ marginRight: 6, color: "#f59e0b" }} />,
      "Đặt Lại",
    );

    const partF = gui.addFolder("Hạt");
    addIcon(
      partF,
      <RocketOutlined style={{ marginRight: 6, color: "#ef4444" }} />,
      "Hạt",
    );
    partF
      .add(p, "particleType", Object.keys(PARTICLE_TYPES))
      .name("Loại Hạt")
      .onChange((v: string) => {
        const data = PARTICLE_TYPES[v as keyof typeof PARTICLE_TYPES];
        p.mass = data.mass;
        p.charge = data.charge;
        resetParticle();
      });
    partF.add(p, "mass").name("Khối lượng (kg)").listen().disable();
    partF.add(p, "charge").name("Điện tích (C)").listen().disable();

    const emF = gui.addFolder("Điện - Từ Trường");
    addIcon(
      emF,
      <ThunderboltOutlined style={{ marginRight: 6, color: "#f59e0b" }} />,
      "Điện - Từ Trường",
    );
    emF.add(p, "voltage", 500, 200000, 500).name("HĐT (V)").listen();
    emF
      .add(p, "magneticField", 0.1, 8.0, 0.1)
      .name("Từ trường B (T)")
      .onChange(rebuildFieldLines)
      .listen();

    const cycF = gui.addFolder("Cyclotron");
    addIcon(
      cycF,
      <SyncOutlined style={{ marginRight: 6, color: "#8b5cf6" }} />,
      "Cyclotron",
    );
    cycF
      .add(p, "maxRadius", 1.0, 6.0, 0.1)
      .name("BK tối đa (đơn vị)")
      .onChange(rebuildFieldLines)
      .listen();
    cycF.add(p, "animationSpeed", 0.1, 3.0).name("Tốc độ mô phỏng");

    const vizF = gui.addFolder("Hiển Thị");
    addIcon(
      vizF,
      <EyeOutlined style={{ marginRight: 6, color: "#06b6d4" }} />,
      "Hiển Thị",
    );
    vizF
      .add(p, "showFieldLines")
      .name("Đường sức từ")
      .onChange(rebuildFieldLines);
    vizF.add(p, "showEField").name("Hiện điện trường (E)");
    vizF.add(p, "animateFieldLines").name("Cuộn đường sức từ");
    vizF.add(p, "fieldAnimationSpeed", 0.5, 5.0).name("Tốc độ cuộn B");

    const infoF = gui.addFolder("Thông số thực");
    addIcon(
      infoF,
      <BarChartOutlined style={{ marginRight: 6, color: "#10b981" }} />,
      "Thông số thực",
    );
    infoF.add(p, "cyclotronFreq").name("Tần số (Hz)").listen().disable();
    infoF.add(p, "currentVelocity").name("Vận tốc (m/s)").listen().disable();
    infoF.add(p, "kineticEnergyMeV").name("Động năng (MeV)").listen().disable();
    infoF.add(p, "revolutions").name("Số vòng quay").listen().disable();

    // ── FEATURE 5: LC Oscillator Folder ─────────────────────────────────
    const lcF = gui.addFolder("Mạch Dao Động (LC)");
    addIcon(
      lcF,
      <ThunderboltOutlined style={{ marginRight: 6, color: "#facc15" }} />,
      "Mạch Dao Động (LC)",
    );
    lcF.add(p, "lc_isOn").name("Nguồn Máy (On/Off)").listen();
    lcF.add(p, "lc_L", 0.1, 2.0).name("Độ tự cảm L (H)");
    lcF.add(p, "lc_C", 0.0005, 0.01).name("Điện dung C (F)");
    lcF.add(p, "lc_R", 0, 0.5).name("Điện trở R (Ω)");
    // lcF.add(p, 'showOscilloscope').name('Hiện Oscilloscope');

    const audioSetup = {
      toggle: () => {
        if (!audioCtxRef.current) {
          const AC = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AC();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          gain.gain.setValueAtTime(0, ctx.currentTime);
          audioCtxRef.current = ctx;
          oscNodeRef.current = osc;
          gainNodeRef.current = gain;
        }
        isAudioOnRef.current = !isAudioOnRef.current;
        if (!isAudioOnRef.current && gainNodeRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(
            0,
            audioCtxRef.current!.currentTime,
            0.1,
          );
        }
      },
    };
    lcF.add(audioSetup, "toggle").name("Bật/Tắt Âm thanh");

    // ── SPACE key bridge (dispatched from CyclotronGame) ──────────────────
    const onSpaceEvent = () => {
      handleSpacePress(
        gameStateRef.current,
        simStateRef.current,
        paramsRef.current,
        callbacks,
      );
    };
    window.addEventListener("cyclotron_space", onSpaceEvent);

    // ── Mission 2 FIRE event ───────────────────────────────────────────────
    const onFireEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        mass: number;
        charge: number;
      };
      const p = paramsRef.current;
      const R = p.maxRadius / 50; // VISUAL_SCALE = 50
      const q = detail.charge;
      const B = p.magneticField;
      const m = detail.mass;
      const wdJoules = (q * q * B * B * R * R) / (2 * m);
      const wdMev = wdJoules / 1.6e-13;
      const TARGET_MEV = 8.0;
      const TOLERANCE = 0.4;
      const success = Math.abs(wdMev - TARGET_MEV) <= TOLERANCE;
      callbacks.onMission2Result(success, wdMev);
      if (success) {
        triggerHealing();
      }
    };
    window.addEventListener("cyclotron_fire", onFireEvent);

    // ── Animation loop ────────────────────────────────────────────────────
    let frameId: number;
    let prevTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      const now = performance.now();
      const dt =
        Math.min((now - prevTime) / 1000, 0.05) *
        paramsRef.current.animationSpeed;
      prevTime = now;

      updateVisuals();
      updateHealing(dt);

      // ── UV Texture Scrolling for B-field lines ──────────────────────
      if (
        paramsRef.current.showFieldLines &&
        paramsRef.current.animateFieldLines
      ) {
        const scrollSpeed =
          paramsRef.current.fieldAnimationSpeed *
          paramsRef.current.magneticField *
          0.15;
        arrowTexture.offset.y -= dt * scrollSpeed;
        // needsUpdate not required for offset changes
      }

      if (paramsRef.current.isRunning) {
        updateParticlePhysics(dt, simStateRef.current, paramsRef.current);
        updateFlameEffect(
          scene,
          dt,
          particleMesh.position,
          simStateRef.current.velocity > 0,
        );

        // Mission 3: second particle (Alpha)
        const mode: GameMode = gameStateRef.current.mode;
        if (mode === "mission3") {
          particle2Mesh.visible = true;
          updateParticlePhysics(dt, simState2Ref.current, params2);
          if (!simState2Ref.current.isExtracted) {
            particle2Mesh.position.set(
              simState2Ref.current.radius *
                Math.cos(simState2Ref.current.angle),
              0,
              simState2Ref.current.radius *
                Math.sin(simState2Ref.current.angle),
            );
          }
        } else {
          particle2Mesh.visible = false;
        }

        // ── E-field Visualization Logic ─────────────────────────────
        if (eFieldArrow && eFieldLabel) {
          const pr = paramsRef.current;
          eFieldArrow.visible = pr.showEField;
          eFieldLabel.visible = pr.showEField;

          if (pr.showEField) {
            const omega = (Math.abs(pr.charge) * pr.magneticField) / pr.mass;
            const phase = Math.cos(omega * simStateRef.current.time);

            const len = Math.max(0.01, Math.abs(phase) * 0.5);
            eFieldArrow.setLength(len, len * 0.2, len * 0.2);

            if (phase >= 0) {
              eFieldArrow.setDirection(new THREE.Vector3(1, 0, 0));
              eFieldArrow.setColor(0xff0044);
            } else {
              eFieldArrow.setDirection(new THREE.Vector3(-1, 0, 0));
              eFieldArrow.setColor(0x00aaff);
            }
          }
        }

        // ── FEATURE 4: LC Oscillator Physics ────────────────────────
        const pr = paramsRef.current;
        const os = oscStateRef.current;

        if (pr.lc_isOn) {
          // Diff eq: L*di/dt + R*i + q/C = 0  =>  di/dt = -(q/C + R*i) / L
          const di_dt = -(os.q / pr.lc_C + pr.lc_R * os.i) / pr.lc_L;
          const dq_dt = os.i;

          os.i += di_dt * dt;
          os.q += dq_dt * dt;
        } else {
          // Quickly damp to zero when off
          os.i *= 0.92;
          os.q *= 0.92;
        }

        if (statusLed) {
          const ledMat = statusLed.material as THREE.MeshPhongMaterial;
          if (pr.lc_isOn) {
            ledMat.color.setHex(0x00ff00);
            ledMat.emissive.setHex(0x00ff00);
          } else {
            ledMat.color.setHex(0x440000);
            ledMat.emissive.setHex(0x000000);
          }
        }

        pr.lc_frequency = 1 / Math.sqrt(pr.lc_L * pr.lc_C);

        // History for HUD
        os.historyQ.push(os.q);
        os.historyI.push(os.i);
        if (os.historyQ.length > 200) {
          os.historyQ.shift();
          os.historyI.shift();
        }

        // ── Visual Glow update ──────────────────────────────────────
        if (capMat)
          capMat.emissiveIntensity = pr.lc_isOn
            ? Math.min(2.5, Math.abs(os.q) * 0.2)
            : 0;
        if (indMat)
          indMat.emissiveIntensity = pr.lc_isOn
            ? Math.min(2.5, Math.abs(os.i) * 0.8)
            : 0;

        // ── Electron Particle update ────────────────────────────────
        if (elePart) {
          const posAttr = elePart.geometry.attributes.position;
          const arr = posAttr.array as Float32Array;
          const time = performance.now() * 0.001;
          const flowSpeed = pr.lc_isOn ? os.i * 5.0 : 0;

          for (let i = 0; i < arr.length / 3; i++) {
            // Move particles along a rectangular loop (simplified)
            const offset = i / (arr.length / 3) + time * flowSpeed;
            const t = offset % 1.0;

            let px = 0,
              py = 0,
              pz = 0;
            // Map t [0..1] to a loop: (left -> top -> right -> bottom)
            if (t < 0.25) {
              // bottom
              px = -0.5 + (t / 0.25) * 1.0;
              py = 0.05;
              pz = (Math.random() - 0.5) * 0.1;
            } else if (t < 0.5) {
              // right
              px = 0.5;
              py = 0.05 + ((t - 0.25) / 0.25) * 0.4;
              pz = (Math.random() - 0.5) * 0.1;
            } else if (t < 0.75) {
              // top
              px = 0.5 - ((t - 0.5) / 0.25) * 1.0;
              py = 0.45;
              pz = (Math.random() - 0.5) * 0.1;
            } else {
              // left
              px = -0.5;
              py = 0.45 - ((t - 0.75) / 0.25) * 0.4;
              pz = (Math.random() - 0.5) * 0.1;
            }

            arr[i * 3] = px;
            arr[i * 3 + 1] = py;
            arr[i * 3 + 2] = pz;
          }
          posAttr.needsUpdate = true;
        }

        // ── Audio update ────────────────────────────────────────────
        if (
          pr.lc_isOn &&
          isAudioOnRef.current &&
          audioCtxRef.current &&
          oscNodeRef.current &&
          gainNodeRef.current
        ) {
          const audioHz = pr.lc_frequency * 8.0; // scale to audible
          oscNodeRef.current.frequency.setTargetAtTime(
            audioHz,
            audioCtxRef.current.currentTime,
            0.1,
          );

          const energy =
            (0.5 * (os.q * os.q)) / pr.lc_C + 0.5 * pr.lc_L * (os.i * os.i);
          const vol = Math.min(0.2, energy * 0.005);
          gainNodeRef.current.gain.setTargetAtTime(
            vol,
            audioCtxRef.current.currentTime,
            0.1,
          );
        } else if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(
            0,
            audioCtxRef.current.currentTime,
            0.1,
          );
        }
      }

      // Extraction check
      if (
        simStateRef.current.radius >= paramsRef.current.maxRadius &&
        !simStateRef.current.isExtracted
      ) {
        if (Math.cos(simStateRef.current.angle) > 0.9) {
          performExtraction(particleMesh, simStateRef.current);
        }
      }
      if (
        paramsRef.current.extractParticle &&
        !simStateRef.current.isExtracted
      ) {
        if (Math.cos(simStateRef.current.angle) > 0.9) {
          performExtraction(particleMesh, simStateRef.current);
          paramsRef.current.extractParticle = false;
        }
      }

      // Particle mesh position + trail update
      if (!simStateRef.current.isExtracted) {
        const px =
          simStateRef.current.radius * Math.cos(simStateRef.current.angle);
        const pz =
          simStateRef.current.radius * Math.sin(simStateRef.current.angle);
        particleMesh.position.set(px, 0, pz);
      }

      // Keep flash quad in front of camera
      flashMesh.position.copy(camera.position);
      flashMesh.quaternion.copy(camera.quaternion);
      flashMesh.translateZ(-0.5);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (!w || !h) return;
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
      arrowTexture.dispose();
      bFieldMaterial.dispose();
      cleanupFlames(scene);
      window.removeEventListener("cyclotron_healing", onHealingEvent);
      window.removeEventListener("cyclotron_space", onSpaceEvent);
      window.removeEventListener("cyclotron_fire", onFireEvent);
      healingParticles.forEach((s) => scene.remove(s));
      if (guiRef.current) guiRef.current.destroy();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (hudAnimRef.current) hudAnimRef.current.cancel();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── FEATURE 6: SVG Oscilloscope Path Update ─────────────────────────────
  const getPathStrings = () => {
    const os = oscStateRef.current;
    let pathQ = "M 0 50 ";
    let pathI = "M 0 50 ";
    const W = 280;
    const step = W / 200;

    for (let j = 0; j < os.historyQ.length; j++) {
      const x = j * step;
      const yQ = 50 - os.historyQ[j] * 3.5;
      const yI = 50 - os.historyI[j] * 12.0;
      pathQ += `L ${x} ${Math.max(0, Math.min(100, yQ))} `;
      pathI += `L ${x} ${Math.max(0, Math.min(100, yI))} `;
    }
    return { pathQ, pathI };
  };

  const qRef = useRef<SVGPathElement>(null);
  const iRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let tid: number;
    const updateHUD = () => {
      if (qRef.current && iRef.current && paramsRef.current.showOscilloscope) {
        const { pathQ, pathI } = getPathStrings();
        qRef.current.setAttribute("d", pathQ);
        iRef.current.setAttribute("d", pathI);
      }
      tid = requestAnimationFrame(updateHUD);
    };
    updateHUD();
    return () => cancelAnimationFrame(tid);
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // ── FEATURE 3: SVG HUD Overlay (rendered in React, positioned absolute) ─
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div ref={mountRef} className="w-full h-full relative">
      {/* SVG HUD — absolute overlay, pointer-events: none so it doesn't block OrbitControls */}
      <svg
        ref={hudRef}
        id="hud-target"
        width="200"
        height="200"
        style={{
          position: "absolute",
          display: "none",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          overflow: "visible",
          zIndex: 10,
        }}
      >
        {/* Outer rotating ring */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(0,255,100,0.18)"
          strokeWidth="1"
          strokeDasharray="8 6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Main target circle — animated by Web Animations API */}
        <circle
          id="hud-target-circle"
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#00ff64"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Corner brackets */}
        <path
          d="M55,55 L55,70 M55,55 L70,55"
          stroke="#00ff64"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M145,55 L145,70 M145,55 L130,55"
          stroke="#00ff64"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M55,145 L55,130 M55,145 L70,145"
          stroke="#00ff64"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M145,145 L145,130 M145,145 L130,145"
          stroke="#00ff64"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Cross-hair lines */}
        <line
          x1="100"
          y1="60"
          x2="100"
          y2="75"
          stroke="#00ff64"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="100"
          y1="125"
          x2="100"
          y2="140"
          stroke="#00ff64"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="60"
          y1="100"
          x2="75"
          y2="100"
          stroke="#00ff64"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <line
          x1="125"
          y1="100"
          x2="140"
          y2="100"
          stroke="#00ff64"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* HUD text */}
        <text
          id="hud-target-text"
          x="100"
          y="108"
          fill="#00ff64"
          fontFamily="'Courier New', monospace"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          style={{ opacity: 0 }}
        >
          PARTICLE EXTRACTED
        </text>

        {/* Sub-label */}
        <text
          x="100"
          y="165"
          fill="rgba(0,255,100,0.5)"
          fontFamily="'Courier New', monospace"
          fontSize="8"
          textAnchor="middle"
        >
          TARGET LOCKED
        </text>
      </svg>

      {/* FEATURE 6: Oscilloscope HUD */}
      {paramsRef.current.showOscilloscope && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            width: "300px",
            height: "140px",
            background: "rgba(0,0,0,0.7)",
            border: "2px solid #555",
            borderRadius: "8px",
            padding: "10px",
            pointerEvents: "none",
            fontFamily: "monospace",
            fontSize: "10px",
            color: "#0f0",
            zIndex: 20,
          }}
        >
          <div
            style={{
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>OSCILLOSCOPE (U, I)</span>
            <span>
              Q=
              {(
                (1 / paramsRef.current.lc_R) *
                Math.sqrt(paramsRef.current.lc_L / paramsRef.current.lc_C)
              ).toFixed(1)}
            </span>
          </div>
          <svg
            width="280"
            height="100"
            style={{ background: "#050505", border: "1px solid #333" }}
          >
            {/* Grid lines */}
            <line
              x1="0"
              y1="50"
              x2="280"
              y2="50"
              stroke="#113311"
              strokeWidth="1"
            />
            <path ref={qRef} fill="none" stroke="#0088ff" strokeWidth="2" />
            <path ref={iRef} fill="none" stroke="#ff4400" strokeWidth="2" />
          </svg>
          <div style={{ marginTop: "5px", display: "flex", gap: "15px" }}>
            <span style={{ color: "#0088ff" }}>● U(t)</span>
            <span style={{ color: "#ff4400" }}>● I(t)</span>
            <span style={{ marginLeft: "auto" }}>
              f={(paramsRef.current.lc_frequency / (2 * Math.PI)).toFixed(1)} Hz
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
