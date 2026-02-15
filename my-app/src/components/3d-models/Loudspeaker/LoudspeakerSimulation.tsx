import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

const LoudspeakerSimulation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const guiRef = useRef<GUI | null>(null);

    const paramsRef = useRef({
        frequency: 440,
        amplitude: 1.0,
        isPlaying: false,
    });

    useEffect(() => {
        if (!mountRef.current) return;

        // --- 1. SETUP SCENE ---
        // Clean up any existing children (prevents double canvas)
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.set(3, 3, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- 2. LIGHTING ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // --- 3. DUMMY OBJECTS ---
        const group = new THREE.Group();

        // Magnet Casing
        const magnetMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 1, 32),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 })
        );
        magnetMesh.rotation.x = Math.PI / 2;
        group.add(magnetMesh);

        // Cone (Diaphragm)
        const coneMesh = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 1, 32, 1, true),
            new THREE.MeshStandardMaterial({ color: 0xaa4444, side: THREE.DoubleSide })
        );
        coneMesh.rotation.x = Math.PI / 2; // Point forward
        coneMesh.position.z = 0.5;
        group.add(coneMesh);

        // Coil (conceptual)
        const coilMesh = new THREE.Mesh(
            new THREE.TorusGeometry(0.6, 0.1, 16, 32),
            new THREE.MeshStandardMaterial({ color: 0xcdaa7d })
        );
        coilMesh.position.z = 0;
        group.add(coilMesh);

        scene.add(group);

        // --- 4. GUI ---
        if (guiRef.current) guiRef.current.destroy();
        const gui = new GUI({ container: mountRef.current, width: 300 });
        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '10px';
        gui.domElement.style.right = '10px';
        guiRef.current = gui;

        gui.add(paramsRef.current, 'frequency', 20, 20000).name("Tần số (Hz)");
        gui.add(paramsRef.current, 'amplitude', 0, 2).name("Biên độ");
        gui.add(paramsRef.current, 'isPlaying').name("Phát âm thanh");

        // --- 5. ANIMATION LOOP ---
        let frameId: number;
        let time = 0;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();

            // Simple dummy animation: vibrate cone
            if (paramsRef.current.isPlaying) {
                time += 0.1 * (paramsRef.current.frequency / 100); 
                const displacement = Math.sin(time) * 0.1 * paramsRef.current.amplitude;
                coneMesh.position.z = 0.5 + displacement;
                coilMesh.position.z = displacement;
            } else {
                coneMesh.position.z = 0.5;
                coilMesh.position.z = 0;
            }

            renderer.render(scene, camera);
        };
        animate();

        // --- 6. RESIZE ---
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
            if (guiRef.current) guiRef.current.destroy();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full relative" />;
};

export default LoudspeakerSimulation;
