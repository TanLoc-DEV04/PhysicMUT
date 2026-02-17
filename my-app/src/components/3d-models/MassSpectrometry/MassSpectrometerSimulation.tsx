import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VaporizationChamber } from './VaporizationChamber';
import { IonizationChamber } from './IonizationChamber';
import { AccelerationChamber } from './AccelerationChamber';
import { MassAnalyzer } from './MassAnalyzer';
import { DetectionSystem } from './DetectionSystem';
import { LabController } from './LabController';
import { ParticleSystem } from './ParticleSystem';
import { MassSpectrumGraph } from './MassSpectrumGraph';

const MassSpectrometerSimulation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [spectrumData, setSpectrumData] = useState<{ [mz: string]: number }>({});
    const spectrumRef = useRef<{ [mz: string]: number }>({});
    const particleSystemRef = useRef<ParticleSystem | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clean up any existing children to prevent duplicate canvases
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        // 1. Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(10, 10, 40); 

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(5, 0, 0); 
        controls.enableDamping = true;

        // 2. Add Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // 3. Create Mass Spectrometer Stages
        const group = new THREE.Group();

        // A. Vaporization
        const vaporization = new VaporizationChamber(new THREE.Vector3(-15, 0, 0));
        group.add(vaporization.mesh);

        // B. Ionization
        const ionization = new IonizationChamber(new THREE.Vector3(-6, 0, 0));
        group.add(ionization.mesh);

        // C. Acceleration
        const acceleration = new AccelerationChamber(new THREE.Vector3(3, 0, 0), 10);
        group.add(acceleration.mesh);

        // D. Analyzer
        const bendRadius = 12;
        const analyzer = new MassAnalyzer(new THREE.Vector3(8, 0, 0), bendRadius, 2, Math.PI / 2);
        analyzer.mesh.rotation.x = Math.PI; 
        group.add(analyzer.mesh);

        // E. Detection
        const detectPos = new THREE.Vector3(8 + bendRadius, 0, -bendRadius);
        const detection = new DetectionSystem(detectPos);
        detection.mesh.rotation.y = Math.PI / 2; 
        group.add(detection.mesh);

        scene.add(group);

        // 4. Controller & Physics
        const controller = new LabController(
            mountRef.current,
            () => {}, // onUpdatePhysics
            () => { // onUpdateVisuals
                const opacity = controller.params.housingOpacity;
                const showLines = controller.params.showFieldLines;

                // Update Static Mesh Opacity
                group.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const mat = child.material as THREE.MeshPhysicalMaterial;
                        if (mat.transparent && mat.opacity < 1.0) {
                            mat.opacity = opacity;
                        }
                    }
                    if (child instanceof THREE.LineSegments) {
                        child.visible = showLines;
                    }
                });

                // Update Particle Skins
                particleSystemRef.current?.updateVisuals();
            }
        );

        // Instantiate ParticleSystem with Callback
        const particleSystem = new ParticleSystem(scene, controller.params, (mass, charge) => {
            const mz = (mass / charge).toFixed(1);
            spectrumRef.current[mz] = (spectrumRef.current[mz] || 0) + 1;
        });
        particleSystemRef.current = particleSystem;

        // 5. Animation Loop
        let lastTime = 0;
        let spawnTimer = 0;
        let lastGraphUpdate = 0;
        let frameId: number;

        const animate = (time: number) => {
            frameId = requestAnimationFrame(animate);
            
            const delta = (time - lastTime) / 1000;
            lastTime = time;

            if (controller.params.isRunning) {
                spawnTimer += delta * controller.params.simulationSpeed;
                if (spawnTimer > 0.2) { 
                    particleSystem.spawnParticle();
                    spawnTimer = 0;
                }
            }

            particleSystem.update();
            controls.update();
            renderer.render(scene, camera);

            // Update Graph UI (throttled ~5fps)
            if (time - lastGraphUpdate > 200) {
                setSpectrumData({ ...spectrumRef.current });
                lastGraphUpdate = time;
            }
        };

        animate(0);

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(mountRef.current);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(frameId);
            renderer.dispose();
            controller.destroy();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div className="w-full h-full relative">
            <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />
            <MassSpectrumGraph data={spectrumData} />
        </div>
    );
};

export default MassSpectrometerSimulation;
