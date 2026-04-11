import * as THREE from 'three';
import type { SimulationParams } from './Types';
import { ISOTOPE_PRESETS } from './Types';

interface Particle {
    mesh:  THREE.Mesh;
    velocity: THREE.Vector3;
    position: THREE.Vector3;
    state: 'VAPOR' | 'ION' | 'ACCEL' | 'DEFLECT' | 'DETECTED' | 'DEAD';
    t: number;
}

export class ParticleSystem {
    private scene:    THREE.Group | THREE.Scene;
    private particles: Particle[] = [];
    private params:   SimulationParams;
    private onParticleDetected: (mass: number, charge: number, actualR: number, isotopeName: string) => void;

    constructor(
        scene: THREE.Group | THREE.Scene,
        params: SimulationParams,
        onParticleDetected: (mass: number, charge: number, actualR: number, isotopeName: string) => void
    ) {
        this.scene   = scene;
        this.params  = params;
        this.onParticleDetected = onParticleDetected;
    }

    public spawnParticle() {
        if (!this.params.isRunning) return;
        if (this.params.heaterTemp < 100) return;

        let mass   = this.params.customMass;
        let charge = this.params.customCharge;
        let color  = 0xffffff;
        let isotopeKey = this.params.isotope;

        if (this.params.isotope === 'Mix') {
            // C-12 + C-14 equally random
            isotopeKey = Math.random() < 0.5 ? 'C-12' : 'C-14';
        } else if (this.params.isotope === 'Iodine-Mix') {
            isotopeKey = Math.random() < 0.5 ? 'I-127' : 'I-131';
        }

        if (ISOTOPE_PRESETS[isotopeKey]) {
            const d = ISOTOPE_PRESETS[isotopeKey];
            mass   = d.mass;
            charge = d.charge;
            color  = d.color;
        }

        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = this._getMaterial(color);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(-18, (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5);
        mesh.userData = {
            mass, charge, color, isotopeName: isotopeKey,
            velocity: new THREE.Vector3(0.05, 0, 0),
            state: 'VAPOR', t: 0,
        };

        this.scene.add(mesh);
        this.particles.push({
            mesh,
            velocity: mesh.userData.velocity,
            position: mesh.position,
            state: 'VAPOR',
            t: 0,
        });
    }

    private _getMaterial(color: number): THREE.Material {
        switch (this.params.particleSkin) {
            case 'Glow':
                return new THREE.MeshBasicMaterial({ color });
            case 'Metallic':
                return new THREE.MeshStandardMaterial({ color, metalness: 1.0, roughness: 0.2 });
            case 'Ghost':
                return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
            default:
                return new THREE.MeshStandardMaterial({ color });
        }
    }

    public update() {
        if (!this.params.isRunning) return;

        const dt = 0.02 * this.params.simulationSpeed;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p    = this.particles[i];
            const data = p.mesh.userData;
            const mass   = (data.mass   as number) || 12;
            const charge = (data.charge as number) || 1;

            // 1. VAPOR
            if (p.state === 'VAPOR') {
                p.position.x += p.velocity.x * dt * 10;
                p.position.y += (Math.random()-0.5) * 0.1 * (this.params.heaterTemp / 500);
                p.position.z += (Math.random()-0.5) * 0.1 * (this.params.heaterTemp / 500);
                if (p.position.x > -10) p.state = 'ION';
            }

            // 2. ION
            else if (p.state === 'ION') {
                p.position.x += p.velocity.x * dt * 10;
                if (this.params.electronEnergy < 10) {
                    p.state = 'DEAD';
                    (p.mesh.material as THREE.MeshStandardMaterial).color?.setHex(0x555555);
                } else {
                    if (p.position.x > -2) p.state = 'ACCEL';
                }
            }

            // 3. ACCEL
            else if (p.state === 'ACCEL') {
                const K = 0.05;
                const v_target = Math.sqrt(2 * charge * this.params.voltage / mass) * K;
                p.velocity.x += (v_target - p.velocity.x) * 5 * dt;
                p.position.x += p.velocity.x * dt * 20;
                if (p.position.x >= 8) {
                    p.state = 'DEFLECT';
                    p.t = 0;
                    p.velocity.x = v_target;
                }
            }

            // 4. DEFLECT (mass analyzer)
            else if (p.state === 'DEFLECT') {
                const K_B = 0.55;
                const v = Math.abs(p.velocity.x);
                const R = (mass * v) / (charge * this.params.magneticField) * K_B;

                const angularSpeed = v / R;
                p.t += angularSpeed * dt * 5;

                p.position.x = 8  + R * Math.sin(p.t);
                p.position.z = -R + R * Math.cos(p.t);

                // Wall collision: too far from tube radius
                const tubeR = 12;
                if (Math.abs(R - tubeR) > 7.0) {
                    p.state = 'DEAD';
                }

                if (p.t >= Math.PI / 2) {
                    p.state = 'DETECTED';
                    this.onParticleDetected(mass, charge, R, (data.isotopeName as string) || 'Unknown');
                    this._removeParticle(i);
                    continue;
                }
            }

            // 5. DEAD
            else if (p.state === 'DEAD') {
                p.position.y -= 0.5 * dt;
                if (p.position.y < -8) this._removeParticle(i);
            }

            p.mesh.position.copy(p.position);
        }
    }

    private _removeParticle(index: number) {
        const p = this.particles[index];
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(index, 1);
    }

    public updateVisuals() {
        this.particles.forEach(p => {
            const color = (p.mesh.userData.color as number) || 0xffffff;
            const old = p.mesh.material as THREE.Material;
            p.mesh.material = this._getMaterial(color);
            old.dispose();
        });
    }

    public clearAll() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this._removeParticle(i);
        }
    }
}
