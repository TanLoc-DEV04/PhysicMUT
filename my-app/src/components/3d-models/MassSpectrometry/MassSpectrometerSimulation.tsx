import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VaporizationChamber } from './VaporizationChamber';
import { IonizationChamber }   from './IonizationChamber';
import { AccelerationChamber } from './AccelerationChamber';
import { MassAnalyzer }        from './MassAnalyzer';
import { LabController }       from './LabController';
import { ParticleSystem }      from './ParticleSystem';
import { MultiDetector }       from './MultiDetector';
import type { MSGameState }    from './Types';
import type { MSCallbacks }    from './msMissionLogic';
import { checkDetectorBin, computeVisualR } from './msMissionLogic';

export interface MSSimulationProps {
    gameStateRef:  React.MutableRefObject<MSGameState>;
    msCallbacks:   MSCallbacks;
    imperativeRef?: React.MutableRefObject<{ reset: () => void } | null>;
}

const MassSpectrometerSimulation: React.FC<MSSimulationProps> = ({
    gameStateRef,
    msCallbacks,
    imperativeRef,
}) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        // ── Scene ─────────────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0d0d18);

        const W = mountRef.current.clientWidth;
        const H = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
        camera.position.set(10, 14, 45);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(5, 0, 0);
        controls.enableDamping = true;

        // ── Lighting ──────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const pt = new THREE.PointLight(0xffffff, 1.2);
        pt.position.set(10, 12, 10);
        scene.add(pt);
        const pt2 = new THREE.DirectionalLight(0x8888ff, 0.4);
        pt2.position.set(-5, 8, -5);
        scene.add(pt2);

        // ── Spectrometer stages ───────────────────────────────────────────────
        const group = new THREE.Group();
        group.add(new VaporizationChamber(new THREE.Vector3(-15, 0, 0)).mesh);
        group.add(new IonizationChamber(new THREE.Vector3(-6, 0, 0)).mesh);
        group.add(new AccelerationChamber(new THREE.Vector3(3, 0, 0), 10).mesh);

        const bendRadius = 12;
        const analyzer = new MassAnalyzer(new THREE.Vector3(8, 0, 0), bendRadius, 2, Math.PI / 2);
        analyzer.mesh.rotation.x = Math.PI;
        group.add(analyzer.mesh);

        scene.add(group);

        // ── Multi-Detector ────────────────────────────────────────────────────
        // Physics: particles exit the π/2 analyzer arc at (8+R, 0, −R) moving in −Z.
        // For default B=0.5T, U=2000V: R_C12≈12.05, R_C14≈13.01.
        // We center the detector group at the typical exit zone (20, 0, -12.5).
        // Cup openings face +Z (rotation.x = -π/2 already applied in MultiDetector).
        // The 3 cups are spaced 1.5 units apart along X (lighter isotopes at lower X).
        const detector = new MultiDetector();
        // Place at center of arc exit zone
        detector.mesh.position.set(8 + bendRadius - 0.5, -0.5, -bendRadius - 0.5);
        // No extra Y-rotation — cups already face +Z in local space
        scene.add(detector.mesh);

        // ── LabController (lil-gui) ───────────────────────────────────────────
        const controller = new LabController(
            mountRef.current,
            () => {}, // onUpdatePhysics
            () => {
                const opacity   = controller.params.housingOpacity;
                const showLines = controller.params.showFieldLines;
                group.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        const mat = child.material as THREE.MeshPhysicalMaterial;
                        if (mat.transparent && mat.opacity < 1.0) mat.opacity = opacity;
                    }
                    if (child instanceof THREE.LineSegments) child.visible = showLines;
                });
                particleSystem.updateVisuals();
            }
        );

        // ── ParticleSystem ────────────────────────────────────────────────────
        const particleSystem = new ParticleSystem(
            scene,
            controller.params,
            (mass, charge, actualR, isotopeName) => {
                // Update spectrum (legacy: for MassSpectrumGraph if mounted externally)
                const mz = (mass / charge).toFixed(1);
                void mz;

                // Determine bin target radii from current params
                const gs = gameStateRef.current;
                checkDetectorBin(
                    gs,
                    mass,
                    charge,
                    actualR,
                    isotopeName,
                    msCallbacks,
                    controller.params.bin1TargetR,
                    controller.params.bin2TargetR,
                );

                // Flash & update in-scene detector
                const hitBin1 = Math.abs(actualR - controller.params.bin1TargetR) < 0.9;
                const hitBin2 = Math.abs(actualR - controller.params.bin2TargetR) < 0.9;
                if (hitBin1)       { detector.flashBin(0, true);  detector.addCount(0); }
                else if (hitBin2)  { detector.flashBin(1, true);  detector.addCount(1); }
                else               { detector.flashBin(0, false); }
            }
        );

        // ── Reset handler ─────────────────────────────────────────────────────
        const reset = () => {
            particleSystem.clearAll();
            detector.resetCounts();
        };
        if (imperativeRef) imperativeRef.current = { reset };

        // ── Sync isotope mode + bin targets from game state each frame ─────────
        const syncParamsFromGameState = () => {
            const gs  = gameStateRef.current;
            const { voltage, magneticField } = controller.params;

            if (gs.mode === 'mission1') {
                controller.params.isotope = 'C-12';
                controller.params.bin1TargetR = computeVisualR(12.000, 1, voltage, magneticField);
                controller.params.bin2TargetR = computeVisualR(14.003, 1, voltage, magneticField);
            } else if (gs.mode === 'mission2') {
                controller.params.isotope = 'Mix';
                controller.params.bin1TargetR = computeVisualR(12.000, 1, voltage, magneticField);
                controller.params.bin2TargetR = computeVisualR(14.003, 1, voltage, magneticField);
            } else if (gs.mode === 'mission3') {
                controller.params.isotope = 'Iodine-Mix';
                controller.params.bin1TargetR = computeVisualR(126.905, 1, voltage, magneticField);
                controller.params.bin2TargetR = computeVisualR(130.906, 1, voltage, magneticField);
            }
        };

        // ── Animation loop ────────────────────────────────────────────────────
        let frameId: number;
        let spawnTimer = 0;
        let lastTime   = 0;

        const animate = (time: number) => {
            frameId = requestAnimationFrame(animate);
            const delta = (time - lastTime) / 1000;
            lastTime = time;

            syncParamsFromGameState();
            controls.update();

            if (controller.params.isRunning) {
                spawnTimer += delta * controller.params.simulationSpeed;
                if (spawnTimer > 0.22) {
                    particleSystem.spawnParticle();
                    spawnTimer = 0;
                }
            }

            particleSystem.update();
            renderer.render(scene, camera);
        };
        animate(0);

        // ── Resize ────────────────────────────────────────────────────────────
        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
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
            controller.destroy();
            if (mountRef.current?.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />;
};

export default MassSpectrometerSimulation;
