
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HoloAvatar, type AvatarState } from './HoloAvatar';

interface HologramSceneProps {
    botState: AvatarState;
}

export const HologramScene = ({ botState }: HologramSceneProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HoloAvatar | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clean up any existing children to prevent "stuck" screens
        while (mountRef.current.firstChild) {
             mountRef.current.removeChild(mountRef.current.firstChild);
        }

        // 1. Setup Scene
        const scene = new THREE.Scene();
        // scene.background = new THREE.Color(0x050510); // Remove background for transparency

        // 2. Setup Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.5, 5); // Adjust camera position for better view

        // 3. Setup Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // 4. Lights (Hologram is self-illuminated but lights help shadows if any standard mats used)
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // 5. Add Holo Avatar
        const avatar = new HoloAvatar(new THREE.Vector3(0, -1, 0)); // Lower it a bit
        scene.add(avatar.mesh);
        avatarRef.current = avatar;

        // 6. GUI Removed for Production
        // If needed, we can re-enable later or use a different control mechanism

        // 7. Animation Loop
        const clock = new THREE.Clock();
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            
            if (avatarRef.current) {
                avatarRef.current.update(time);
            }

            renderer.render(scene, camera);
        };
        animate();

        // 8. Handle Resize
        const handleResize = () => {
             if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };

    }, []);

    // React Prop State Update
    useEffect(() => {
        if (avatarRef.current) {
            avatarRef.current.setState(botState);
            // Also update GUI if it exists to match
            // Note: managing bidirectional state between GUI and React props can be tricky.
            // Here we just prioritize props.
        }
    }, [botState]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
};
