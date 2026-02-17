import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { MEDIUMS, HEARING_RANGES, NOTE_PRESETS, type NotePreset } from './types';

const LoudspeakerSimulation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const guiRef = useRef<GUI | null>(null);

    // React State for UI Overlay (Bio-Radar)
    const [radarData, setRadarData] = useState({
        freq: 20,
        medium: 'Không khí (Air)',
        statusText: 'Sóng lan truyền bình thường',
        statusColor: '#00ffcc',
        animals: HEARING_RANGES.map(a => ({ ...a, active: false }))
    });

    useEffect(() => {
        if (!mountRef.current) return;

        // --- CLEANUP setup ---
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        // --- 1. SETUP SCENE ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        scene.fog = new THREE.Fog(0x111111, 10, 60);

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(20, 10, 20);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- LIGHTS ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const spotLight = new THREE.SpotLight(0xffffff, 20);
        spotLight.position.set(10, 20, 10);
        spotLight.castShadow = true;
        scene.add(spotLight);

        // --- 2. BUILD LOUDSPEAKER MODEL ---
        const staticGroup = new THREE.Group();
        const movingGroup = new THREE.Group();

        // Materials
        const matSteel = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.3, metalness: 0.8 });
        const matCopper = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.3, metalness: 0.6 });
        const matCone = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, side: THREE.DoubleSide });
        const matSpider = new THREE.MeshStandardMaterial({ color: 0xed8936, side: THREE.DoubleSide, wireframe: true });

        // Magnet (Static)
        const magnet = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 2, 32), matSteel);
        magnet.rotation.x = Math.PI / 2;
        staticGroup.add(magnet);

        // Moving Parts
        const coil = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 1.5, 32, 1, true), matCopper);
        coil.rotation.x = Math.PI / 2;
        movingGroup.add(coil);

        const cone = new THREE.Mesh(new THREE.CylinderGeometry(8, 2, 3, 64, 1, true), matCone);
        cone.rotation.x = Math.PI / 2;
        cone.position.z = 1.5;
        movingGroup.add(cone);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, 0.5), matCone);
        cap.rotation.x = Math.PI / 2;
        cap.position.z = 1.8;
        movingGroup.add(cap);

        const spider = new THREE.Mesh(new THREE.RingGeometry(2, 4, 32, 4), matSpider);
        spider.position.z = 0.5;
        movingGroup.add(spider);

        scene.add(staticGroup);
        scene.add(movingGroup);

        // --- 3. PARTICLE SYSTEM (Sound Waves) ---
        const particleCount = 4000;
        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        const particleBasePos = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            const z = Math.random() * 50;

            particlePos[i * 3] = x;
            particlePos[i * 3 + 1] = y;
            particlePos[i * 3 + 2] = z;

            particleBasePos[i * 3] = x;
            particleBasePos[i * 3 + 1] = y;
            particleBasePos[i * 3 + 2] = z;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        
        const particleMat = new THREE.PointsMaterial({
            size: 0.2,
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        const soundCloud = new THREE.Points(particleGeo, particleMat);
        scene.add(soundCloud);

        // --- 4. LOGIC STATE ---
        const state = {
            frequency: 20,
            amplitude: 1.0,
            medium: 'Air',
            waveform: 'Sine',
            exploded: 0,
            currentNote: 'Custom',
            isPlaying: true
        };

        const updateBioRadar = () => {
            const f = state.frequency;
            const medium = MEDIUMS[state.medium];
            
            // 1. Update React State for UI
            const matchingPreset = NOTE_PRESETS.find(n => Math.abs(n.frequency - f) < 0.1);
            
            let statusText = "Sóng lan truyền bình thường";
            let statusColor = "#00ffcc";

            if (!medium.canPropagate) {
                statusText = "CHÂN KHÔNG: Không có âm thanh!";
                statusColor = "red";
            } else if (matchingPreset) {
                statusText = `${matchingPreset.note} - ${matchingPreset.description}`;
                statusColor = "#fff"; // We'll handle yellow highlight in JSX
            }

            setRadarData(_prev => ({
                freq: f,
                medium: medium.name,
                statusText,
                statusColor,
                animals: HEARING_RANGES.map(a => ({
                    ...a,
                    active: f >= a.min && f <= a.max
                }))
            }));

            // 2. Update Visuals (Particles Color)
            if (medium.canPropagate) {
                const hue = Math.max(0, 0.7 - (Math.log10(f) / 6));
                particleMat.color.setHSL(hue, 1.0, 0.5);
            }
        };

        const updateMediumVisuals = (mediumKey: string) => {
            const medium = MEDIUMS[mediumKey];
            soundCloud.visible = medium.canPropagate;

            if (mediumKey === 'Air') {
                scene.background = new THREE.Color(0xf5f5f5);
                scene.fog = new THREE.Fog(0xf5f5f5, 10, 60);
                particleMat.color.setHex(0x3b82f6);
            } else if (mediumKey === 'Water') {
                scene.background = new THREE.Color(0x001133);
                scene.fog = new THREE.Fog(0x001133, 10, 60);
                particleMat.color.setHex(0x88ccff);
            } else {
                scene.background = new THREE.Color(0x111111);
                scene.fog = new THREE.Fog(0x111111, 10, 60);
                particleMat.color.setHex(0x88ccff);
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
            state.frequency = preset.frequency; // Update internal logic state
            guiRef.current?.controllers.find(c => c.property === 'frequency')?.updateDisplay(); // Sync GUI
            updateBioRadar();

            if (preset.audioFile) {
                // Ensure path is relative to public/
                const audio = new Audio(`/${preset.audioFile}`); 
                audio.loop = true;
                audio.volume = Math.min(1, state.amplitude * 0.5);
                audio.play().catch(e => console.warn("Audio play blocked", e));
                audioRef.current = audio;
            }
        };

        // --- 5. GUI SETUP ---
        if (guiRef.current) guiRef.current.destroy();
        const gui = new GUI({ container: mountRef.current, title: 'ĐIỀU KHIỂN LOA' });
        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '10px';
        gui.domElement.style.right = '10px';
        guiRef.current = gui;

        // Inject Custom Styles (Reusable Dark Theme)
        const styleId = 'ls-gui-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .lil-gui { 
                    --width: 300px;
                    --name-width: 45%;
                    --background-color: #1f1f1f;
                    --text-color: #eaeaea;
                    --title-background-color: #111;
                    --widget-color: #444444;
                    --hover-color: #0088ff;
                    --focus-color: #646464;
                    --number-color: #2cc9ff; 
                    --string-color: #a2db3c;
                    font-size: 14px;
                }
            `;
            document.head.appendChild(style);
        }

        gui.add(state, 'isPlaying').name('Nguồn điện (Power)').onChange((val: boolean) => {
            if (!val) stopAudio();
        });

        const folderPhys = gui.addFolder('Vật Lý & Tín Hiệu');
        folderPhys.add(state, 'frequency', 1, 20000).name('Tần số (Hz)').listen().onChange(updateBioRadar);
        folderPhys.add(state, 'amplitude', 0, 5).name('Cường độ (I)').onChange((v: number) => {
            if (audioRef.current) audioRef.current.volume = Math.min(1, v * 0.5);
        });
        folderPhys.add(state, 'waveform', ['Sine', 'Square', 'Triangle', 'Pulse']).name('Dạng sóng');
        folderPhys.add(state, 'exploded', 0, 5).name('Tháo rời (Exploded View)');

        const folderNotes = gui.addFolder('Mẫu Âm Thanh');
        const noteNames = ['Custom', ...NOTE_PRESETS.map(n => n.note)];
        folderNotes.add(state, 'currentNote', noteNames).name('Chọn nốt').onChange((val: string) => {
            if (val === 'Custom') stopAudio();
            else {
                const preset = NOTE_PRESETS.find(n => n.note === val);
                if (preset) playNote(preset);
            }
        });

        const folderEnv = gui.addFolder('Môi Trường');
        folderEnv.add(state, 'medium', Object.keys(MEDIUMS)).name('Chất dẫn truyền').onChange(updateMediumVisuals);

        // --- 6. ANIMATION LOOP ---
        const clock = new THREE.Clock();
        let frameId: number;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            const medium = MEDIUMS[state.medium];

            // 1. Exploded View (Static parts)
            if (state.exploded >= 0) {
                cone.position.z = 1.5 + state.exploded * 1.5;
                cap.position.z = 1.8 + state.exploded * 1.5;
                spider.position.z = 0.5 + state.exploded * 0.8;
                coil.position.z = 0 + state.exploded * 0.2;
            }

            if (!state.isPlaying) {
                movingGroup.position.z = 0;
                renderer.render(scene, camera);
                return;
            }

            // 2. Source Vibration
            let displacement = 0;
            const visualFreq = state.frequency > 60 ? 60 + Math.log10(state.frequency) * 10 : state.frequency;
            const omega = visualFreq * time;

            switch (state.waveform) {
                case 'Sine': displacement = Math.sin(omega); break;
                case 'Square': displacement = Math.sign(Math.sin(omega)); break;
                case 'Triangle': displacement = Math.asin(Math.sin(omega)) / (Math.PI / 2); break;
                case 'Pulse': displacement = (Math.sin(omega) > 0.9) ? 1 : 0; break;
            }
            displacement *= state.amplitude * 0.5;
            movingGroup.position.z = displacement;

            // 3. Particle Physics
            if (medium.canPropagate) {
                const positions = particleGeo.attributes.position.array as Float32Array;
                for (let i = 0; i < particleCount; i++) {
                    const zIdx = i * 3 + 2;
                    const zBase = particleBasePos[zIdx];
                    const dist = zBase;
                    
                    // Simple Wave Propagation Logic
                    const phase = dist * (0.5 / medium.speed) - (omega * medium.speed);
                    
                    // Particle wave logic matches main logic
                    const waveVal = Math.sin(phase); 
                    const decay = Math.exp(-dist * 0.05);
                    
                    positions[zIdx] = zBase + waveVal * state.amplitude * decay;
                }
                particleGeo.attributes.position.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };

        animate();
        updateMediumVisuals('Air'); // Init visuals

        // --- RESIZE ---
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
            stopAudio();
            if (guiRef.current) guiRef.current.destroy();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div className="w-full h-full relative">
            <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />
            
            {/* Overlay UI: Bio-Radar */}
            <div className="absolute bottom-5 left-5 w-[300px] bg-slate-900/90 text-[#00ffcc] p-4 rounded-lg border border-[#4fd1c5] font-mono shadow-lg pointer-events-auto">
                <h3 className="font-bold text-lg mb-2 text-[#4fd1c5] border-b border-gray-600 pb-1">RADAR ÂM THANH</h3>
                
                <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Tần số (f):</span>
                    <span className="font-bold text-white">{Math.round(radarData.freq).toLocaleString()} Hz</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Môi trường:</span>
                    <span className="font-bold text-white">{radarData.medium}</span>
                </div>
                <div className="flex justify-between mb-3">
                    <span className="text-gray-400">Trạng thái:</span>
                    <span className="font-bold" style={{ color: radarData.statusColor }}>
                        {radarData.statusText}
                    </span>
                </div>
                
                <hr className="border-gray-700 my-2" />
                
                <div className="space-y-1 max-h-40 overflow-y-auto">
                    {radarData.animals.map((animal, idx) => (
                        <div key={idx} className={`transition-all duration-300 text-sm ${animal.active ? 'opacity-100 text-red-500 font-bold scale-105' : 'opacity-30 text-gray-300'}`}>
                            {animal.name} ({animal.min} - {animal.max} Hz)
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoudspeakerSimulation;
