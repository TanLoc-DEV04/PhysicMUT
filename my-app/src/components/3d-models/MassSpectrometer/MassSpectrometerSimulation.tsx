import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

interface SimulationParams {
    velocity: number;
    magneticField: number;
    particleMass: number;
    showTrajectory: boolean;
}

const MassSpectrometerSimulation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const guiRef = useRef<GUI | null>(null);

    const paramsRef = useRef<SimulationParams>({
        velocity: 1000,
        magneticField: 0.5,
        particleMass: 1.0,
        showTrajectory: true,
    });

    useEffect(() => {
        if (!mountRef.current) return;

        // --- 1. SETUP SCENE ---
        // Clean up any existing children (prevents double canvas)
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1f);
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.set(5, 5, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- 2. LIGHTING ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // --- 3. DUMMY OBJECTS ---
        // Chamber Box
        const chamberMesh = new THREE.Mesh(
            new THREE.BoxGeometry(4, 2, 4),
            new THREE.MeshPhongMaterial({ 
                color: 0x8888cc, 
                transparent: true, 
                opacity: 0.3,
                side: THREE.DoubleSide
            })
        );
        scene.add(chamberMesh);

        // Source Box
        const sourceMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 1),
            new THREE.MeshPhongMaterial({ color: 0x333333 })
        );
        sourceMesh.position.set(-2, 0, 0);
        scene.add(sourceMesh);

        // Detector Plate
        const detectorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1, 3),
            new THREE.MeshPhongMaterial({ color: 0x222222 })
        );
        detectorMesh.position.set(2, 0, 0);
        scene.add(detectorMesh);

        // Particle (Placeholder)
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        scene.add(particle);

        // --- 4. GUI ---
        if (guiRef.current) guiRef.current.destroy();
        const gui = new GUI({ container: mountRef.current, width: 300 });
        gui.domElement.style.position = 'absolute';
        gui.domElement.style.top = '10px';
        gui.domElement.style.right = '10px';
        guiRef.current = gui;

        gui.add(paramsRef.current, 'velocity', 0, 5000).name("Vận tốc (m/s)");
        gui.add(paramsRef.current, 'magneticField', 0, 2).name("Từ trường (T)");
        gui.add(paramsRef.current, 'particleMass', 0.1, 10).name("Khối lượng (u)");

        // --- 5. ANIMATION LOOP ---
        let frameId: number;
        let time = 0;

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();

            // Simple dummy animation: bounce particle back and forth
            time += 0.02;
            particle.position.x = Math.sin(time) * 1.5;
            particle.position.z = Math.cos(time * 0.5);

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

export default MassSpectrometerSimulation;
