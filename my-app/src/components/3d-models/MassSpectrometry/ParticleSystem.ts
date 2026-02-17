import * as THREE from 'three';
import type { SimulationParams } from './Types';
import { ISOTOPE_PRESETS } from './Types';

interface Particle {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    position: THREE.Vector3;
    state: 'VAPOR' | 'ION' | 'ACCEL' | 'DEFLECT' | 'DETECTED' | 'DEAD';
    t: number; // Time/Progress tracker
}

export class ParticleSystem {
    private scene: THREE.Group | THREE.Scene;
    private particles: Particle[] = [];
    private params: SimulationParams;
    private onParticleDetected: (mass: number, charge: number) => void;

    constructor(
        scene: THREE.Group | THREE.Scene, 
        params: SimulationParams,
        onParticleDetected: (mass: number, charge: number) => void
    ) {
        this.scene = scene;
        this.params = params;
        this.onParticleDetected = onParticleDetected;
    }

    public spawnParticle() {
        if (!this.params.isRunning) return;

        // Check if heater is hot enough
        if (this.params.heaterTemp < 100) return;

        // Determine Mass & Charge
        let mass = this.params.customMass;
        let charge = this.params.customCharge;
        let color = 0xffffff;

        if (this.params.isotope === 'Mix') {
            const options = ['C-12', 'C-13', 'C-14'];
            const choice = options[Math.floor(Math.random() * options.length)];
            const data = ISOTOPE_PRESETS[choice];
            mass = data.mass;
            charge = data.charge;
            color = data.color;
        } else if (ISOTOPE_PRESETS[this.params.isotope]) {
            const data = ISOTOPE_PRESETS[this.params.isotope];
            // Only override if not Custom
            if (this.params.isotope !== 'Unknown') {
                 mass = data.mass;
                 charge = data.charge;
                 color = data.color;
            }
        }

        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = this.getMaterial(color);
        const mesh = new THREE.Mesh(geometry, material);

        // Start at Vaporization Chamber (A) - Center is -15, Length 10 -> Range -20 to -10
        // Spawn around -18
        mesh.position.set(-18, (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5); 
        
        // Add UserData for physics
        mesh.userData = {
            mass: mass,
            charge: charge,
            color: color,
            velocity: new THREE.Vector3(0.05, 0, 0), // Slow drift
            state: 'VAPOR',
            t: 0
        };

        this.scene.add(mesh);
        this.particles.push({
            mesh,
            velocity: mesh.userData.velocity, // Reference
            position: mesh.position,
            state: 'VAPOR',
            t: 0
        });
    }

    private getMaterial(color: number): THREE.Material {
        switch (this.params.particleSkin) {
            case 'Glow':
                return new THREE.MeshBasicMaterial({ color: color });
            case 'Metallic':
                return new THREE.MeshStandardMaterial({ 
                    color: color, 
                    metalness: 1.0, 
                    roughness: 0.2 
                });
            case 'Ghost':
                return new THREE.MeshBasicMaterial({ 
                    color: color, 
                    transparent: true, 
                    opacity: 0.3 
                });
            default: // Standard
                return new THREE.MeshStandardMaterial({ color: color });
        }
    }

    public update() {
        if (!this.params.isRunning) return;

        const dt = 0.02 * this.params.simulationSpeed; 

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const data = p.mesh.userData;
            const mass = data.mass || 12;
            const charge = data.charge || 1;

            // --- STATE MACHINE PHYSICS ---
            
            // 1. VAPORIZATION (A: -20 -> -10)
            if (p.state === 'VAPOR') {
                p.position.x += p.velocity.x * dt * 10; // Drift
                
                // Jitter
                p.position.y += (Math.random() - 0.5) * 0.1 * (this.params.heaterTemp / 500);
                p.position.z += (Math.random() - 0.5) * 0.1 * (this.params.heaterTemp / 500);

                // Transition to IONIZATION at -10
                if (p.position.x > -10) {
                    p.state = 'ION';
                }
            }

            // 2. IONIZATION (B: -10 -> -2) (Center -6)
            else if (p.state === 'ION') {
                p.position.x += p.velocity.x * dt * 10;

                // Check Electron Energy
                if (this.params.electronEnergy < 10) {
                    p.state = 'DEAD'; 
                    (p.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x555555);
                } else {
                    if (p.position.x > -2) {
                         p.state = 'ACCEL';
                    }
                }
            }

            // 3. ACCELERATION (C: -2 -> 8) (Center 3)
            else if (p.state === 'ACCEL') {
                // v = sqrt(2qU/m)
                // Real physics scale adaptation
                const K = 0.05; 
                const v_target = Math.sqrt(2 * charge * this.params.voltage / mass) * K;
                
                // Accelerate
                p.velocity.x += (v_target - p.velocity.x) * 5 * dt;
                
                p.position.x += p.velocity.x * dt * 20; // Move fast

                if (p.position.x >= 8) {
                    p.state = 'DEFLECT';
                    p.t = 0; 
                    // Set Entry Velocity for math
                    p.velocity.x = v_target; 
                }
            }

            // 4. MASS ANALYZER (D: 8 -> ...)
            else if (p.state === 'DEFLECT') {
                // R = mv/qB
                const v = Math.abs(p.velocity.x); // Current speed
                // Scale factor to match visual tube R=12
                // If m=12, q=1, B=0.5, U=2000 -> we want R ~ 12
                // v ~ sqrt(4000/12) ~ 18.
                // R = 12*18 / (1*0.5) = 432 >> 12.
                // Need scaling constant K_B
                const K_B = 0.55; 
                const R = (mass * v) / (charge * this.params.magneticField) * K_B;
                
                // Angular speed w = v/R
                const angularSpeed = v / R;
                p.t += angularSpeed * dt * 5; // *5 speedup

                // Center of curvature: (8, 0, -R)
                // Path: Start at (8, 0, 0).
                // x = 8 + R * sin(t)
                // z = -R + R * cos(t)
                
                p.position.x = 8 + R * Math.sin(p.t);
                p.position.z = -R + R * Math.cos(p.t);
                
                // Height jitter (minor)
                // p.position.y is const

                // Collision Check (Tube Width ~ 2)
                const tubeR = 12; // Visual Tube Radius
                if (Math.abs(R - tubeR) > 5.0) {
                     // Hit wall
                     // Optional: Visual crash
                     p.state = 'DEAD';
                }

                if (p.t >= Math.PI / 2) {
                    p.state = 'DETECTED';
                    // Hit the detector!
                    this.onParticleDetected(mass, charge);
                    this.removeParticle(i);
                    continue; 
                }
            }
            
            else if (p.state === 'DEAD') {
                p.position.y -= 0.5 * dt; 
                if (p.position.y < -5) this.removeParticle(i);
            }

            // Update mesh
            p.mesh.position.copy(p.position);
        }
    }

    private removeParticle(index: number) {
        const p = this.particles[index];
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(index, 1);
    }
    
    public updateVisuals() {
        this.particles.forEach(p => {
            const color = p.mesh.userData.color || 0xffffff;
            const oldMat = p.mesh.material as THREE.Material;
            p.mesh.material = this.getMaterial(color);
            oldMat.dispose();
        });
    }
}
