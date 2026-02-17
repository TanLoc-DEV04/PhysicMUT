
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { createDee, createElectromagnet, createOscillator, createTarget, createVacuumChamber } from './logic/sceneObjects';
import { PARTICLE_TYPES, type SimulationParams, type SimulationState } from './logic/cyclotronConstants';
import { updateParticlePhysics } from './logic/cyclotronPhysics';
import { updateFlameEffect, cleanupFlames } from './logic/flameLogic';

const CyclotronSimulation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const guiRef = useRef<GUI | null>(null);
    
    // We use a ref for params to access them in the loop without re-renders
    const paramsRef = useRef<SimulationParams>({
        particleType: "Proton",
        mass: 1.67e-27,
        charge: 1.6e-19,
        voltage: 2000,
        magneticField: 1.0,
        maxRadius: 2.0,
        oscillationFreq: 1.0,
        showFieldLines: true,
        animateFieldLines: true,
        fieldAnimationSpeed: 2.0,
        animationSpeed: 1.0,
        isRunning: true,
        cyclotronFreq: 0,
        currentRadius: 0,
        currentVelocity: 0,
        revolutions: 0,
        extractParticle: false,
    });

    const simStateRef = useRef<SimulationState>({
        angle: 0,
        radius: 0.15, // Physical radius will be updated
        velocity: 0,
        isInDee: false,
        currentDee: 1,
        revolutionCount: 0,
        isAccelerating: false,
        time: 0,
        isExtracted: false,
    });

    useEffect(() => {
        if (!mountRef.current) return;

        // --- 1. SETUP SCENE ---
        // Clean up any existing children
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }


        const scene = new THREE.Scene();
        // Use the same tech-y background color as before, or the CubeTexture if assets were available.
        // Stick to color for consistency with other parts of the app unless assets are guaranteed.
        scene.background = new THREE.Color(0x1a1a1f); 
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- 2. LIGHTING ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // Slightly brighter
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(3, 4, 3);
        dir.castShadow = true;
        scene.add(dir);
        
        const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dir2.position.set(-3, 2, -3);
        scene.add(dir2);

        // --- 3. OBJECTS ---
        const MAGNET_SPACING = 2.2;

        const deeGroup = new THREE.Group();
        const spacingBetweenDees = -0.5;
        
        const dee1 = createDee(0xff8800, "+", 0);
        dee1.rotation.z = Math.PI / 2;
        dee1.position.x = spacingBetweenDees / 2;
        
        const dee2 = createDee(0x0088ff, "-", Math.PI);
        dee2.rotation.z = -Math.PI / 2;
        dee2.position.x = -spacingBetweenDees / 2;
        
        dee1.userData = { potential: 1 };
        dee2.userData = { potential: -1 };
        deeGroup.add(dee1, dee2);
        scene.add(deeGroup);

        const topMagnet = createElectromagnet(new THREE.Vector3(0, MAGNET_SPACING, 0), "S");
        const bottomMagnet = createElectromagnet(new THREE.Vector3(0, -MAGNET_SPACING, 0), "N");
        scene.add(topMagnet, bottomMagnet);

        const chamber = createVacuumChamber();
        scene.add(chamber);

        const oscillator = createOscillator();
        scene.add(oscillator);

        const target = createTarget();
        scene.add(target);

        // --- 4. PARTICLE ---
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xffffaa })
        );
        particle.add(new THREE.PointLight(0xffaa00, 2, 5));
        scene.add(particle);

        // --- 5. FIELD LINES LOGIC ---
        // (Moved inside to access scene easily)
        const fieldArrows: THREE.ArrowHelper[] = [];
        const createFieldLines = () => {
             fieldArrows.forEach(a => scene.remove(a));
             fieldArrows.length = 0;
             if (!paramsRef.current.showFieldLines) return;

             const fieldLength = 4.4; // +/- 2.2
             const spacing = 0.9;
             for (let x = -2; x <= 2; x += spacing) {
                 for (let z = -2; z <= 2; z += spacing) {
                     if (Math.hypot(x, z) < 0.5) continue;
                     const origin = new THREE.Vector3(x, -MAGNET_SPACING + 0.2, z);
                     const dir = new THREE.Vector3(0, 1, 0);
                     const arrow = new THREE.ArrowHelper(dir, origin, fieldLength * 0.9, 0x00ffff, 0.3, 0.15);
                     
                     (arrow.line.material as THREE.LineBasicMaterial).transparent = true;
                     (arrow.line.material as THREE.LineBasicMaterial).opacity = 0.5 * paramsRef.current.magneticField / 2.0; // Dynamic opacity
                     (arrow.cone.material as THREE.MeshBasicMaterial).transparent = true;
                     (arrow.cone.material as THREE.MeshBasicMaterial).opacity = 0.5 * paramsRef.current.magneticField / 2.0;

                     fieldArrows.push(arrow);
                     scene.add(arrow);
                 }
             }
        };
        createFieldLines();

        // --- 6. LOGIC & HELPERS ---
        const resetParticle = () => {
            simStateRef.current = {
                angle: 0,
                radius: 0.15,
                velocity: 0,
                isInDee: false,
                currentDee: 1,
                revolutionCount: 0,
                isAccelerating: false,
                time: 0,
                isExtracted: false
            };
            particle.position.set(0, 0, 0);
            
            paramsRef.current.revolutions = 0;
            paramsRef.current.currentRadius = 0;
            paramsRef.current.currentVelocity = 0;
        };

        const updateVisuals = () => {
             // Update Dee colors
             const time = Date.now() * 0.001 * paramsRef.current.oscillationFreq;
             const polarity = Math.sin(time) > 0 ? 1 : -1;
             
             const mat1 = (dee1.children[0] as THREE.Mesh).material as THREE.MeshPhongMaterial;
             const mat2 = (dee2.children[0] as THREE.Mesh).material as THREE.MeshPhongMaterial;
             
             if (polarity > 0) {
                 mat1.color.setHex(0xff8800);
                 mat2.color.setHex(0x0088ff);
             } else {
                 mat1.color.setHex(0x0088ff);
                 mat2.color.setHex(0xff8800);
             }

             // Update Field Lines intensity if B changed
             // (Done in createFieldLines mostly, but can be tweaked real-time if needed)
        };

        const performExtraction = () => {
             simStateRef.current.isExtracted = true;
             paramsRef.current.extractParticle = false;

             const extractionDir = new THREE.Vector3(1, 0, 0).normalize();
             const startPos = particle.position.clone();
             const endPos = startPos.clone().add(extractionDir.multiplyScalar(5));

             let t = 0;
             const extractAnim = () => {
                 t += 0.02;
                 if (t <= 1) {
                     particle.position.lerpVectors(startPos, endPos, t);
                     requestAnimationFrame(extractAnim);
                 } else {
                     setTimeout(resetParticle, 2000);
                 }
             };
             extractAnim();
        };

        // --- 7. GUI ---
        if (guiRef.current) guiRef.current.destroy();
        const gui = new GUI({ container: mountRef.current, width: 300 });
        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '10px';
        gui.domElement.style.right = '10px';
        guiRef.current = gui;

        const p = paramsRef.current;
        const simFolder = gui.addFolder("Điều Khiển Chung");
        simFolder.add(p, 'isRunning').name("⏯ Dừng / Chạy").listen();
        simFolder.add({ reset: resetParticle }, 'reset').name("🔄 Đặt Lại Hạt");

        const particleFolder = gui.addFolder("Thuộc tính Hạt");
        particleFolder.add(p, 'particleType', Object.keys(PARTICLE_TYPES)).name("Loại Hạt").onChange((v: string) => {
             const data = PARTICLE_TYPES[v as keyof typeof PARTICLE_TYPES];
             p.mass = data.mass;
             p.charge = data.charge;
             resetParticle();
        });
        particleFolder.add(p, 'mass').name("Khối lượng (kg)").listen().disable(); // Disable edit for safety
        particleFolder.add(p, 'charge').name("Điện tích (C)").listen().disable();

        const emFolder = gui.addFolder("Điện - Từ Trường");
        emFolder.add(p, 'voltage', 500, 10000).name("HĐT (V)").listen();
        emFolder.add(p, 'magneticField', 0.1, 3.0).name("Từ trường B (T)").onChange(createFieldLines).listen();

        const cyclotronFolder = gui.addFolder("Cài đặt Cyclotron");
        cyclotronFolder.add(p, 'maxRadius', 1.0, 4.0).name("Bán kính tối đa (m)");
        cyclotronFolder.add(p, 'oscillationFreq', 0.5, 3.0).name("Tần số dao động");
        cyclotronFolder.add(p, 'animationSpeed', 0.1, 3.0).name("Tốc độ mô phỏng");

        const vizFolder = gui.addFolder("Hiển Thị");
        vizFolder.add(p, 'showFieldLines').name("Đường sức từ").onChange(createFieldLines);
        vizFolder.add(p, 'extractParticle').name("Bắn hạt ra").listen();

        const infoFolder = gui.addFolder("Thông số Thực");
        infoFolder.add(p, 'cyclotronFreq').name("Tần số (Hz)").listen().disable();
        infoFolder.add(p, 'currentVelocity').name("Vận tốc (m/s)").listen().disable();
        infoFolder.add(p, 'revolutions').name("Số vòng quay").listen().disable();


        // --- 8. ANIMATION LOOP ---
        let frameId: number;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();

            const dt = 0.016; // Fixed timestep for consistency with original logic structure

            updateVisuals();

            if (paramsRef.current.isRunning) {
                // Update Physics
                updateParticlePhysics(dt, simStateRef.current, paramsRef.current);
                
                // Update Flame
                updateFlameEffect(scene, dt, particle.position, simStateRef.current.velocity > 0);
            }

            // Check extraction conditions from physics loop
            if (simStateRef.current.radius >= paramsRef.current.maxRadius && !simStateRef.current.isExtracted) {
                 // Or manual trigger
                 if (!simStateRef.current.isExtracted) performExtraction();
            }
            // Manual trigger check
            if (paramsRef.current.extractParticle && !simStateRef.current.isExtracted) {
                performExtraction();
            }

            // Update Mesh Position
            if (!simStateRef.current.isExtracted) {
                const x = simStateRef.current.radius * Math.cos(simStateRef.current.angle);
                const z = simStateRef.current.radius * Math.sin(simStateRef.current.angle);
                particle.position.set(x, 0, z);
            }

            renderer.render(scene, camera);
        };
        animate();

        // --- 9. RESIZE ---
        const handleResize = () => {
             if (!mountRef.current) return;
             const w = mountRef.current.clientWidth;
             const h = mountRef.current.clientHeight;
             if (w === 0 || h === 0) return;
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
            cleanupFlames(scene); // Cleanup flames
            if (guiRef.current) guiRef.current.destroy();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full relative" />;
};

export default CyclotronSimulation;
