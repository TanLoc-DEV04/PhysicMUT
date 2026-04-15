
import * as THREE from 'three';

// =====================================================
// HELPER: Generate Flame Texture
// =====================================================
function getFlameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 200, 0, 1)'); // Core: Yellow
  gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.8)'); // Mid: Orange
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Edge: Transparent Red

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// =====================================================
// FLAME PARTICLE SYSTEM
// =====================================================
const flameTexture = getFlameTexture();
const flameMaterial = new THREE.SpriteMaterial({
  map: flameTexture || undefined, // Fallback if texture is null
  color: 0xffaa00,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
});

class FlameParticle {
  sprite: THREE.Sprite;
  life: number;
  maxLife: number;
  velocity: THREE.Vector3;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.sprite = new THREE.Sprite(flameMaterial);
    this.sprite.position.copy(position);
    
    // Randomize scale
    const scale = 0.15 + Math.random() * 0.1;
    this.sprite.scale.set(scale, scale, 1);
    
    this.life = 0;
    this.maxLife = 0.5 + Math.random() * 0.5; // Short life
    
    // Random drift velocity (simulating heat rising/turbulence)
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );
    
    scene.add(this.sprite);
  }

  update(dt: number) {
    this.life += dt;
    this.sprite.position.add(this.velocity);
    
    // Fade out and shrink
    const progress = this.life / this.maxLife;
    this.sprite.material.opacity = 0.8 * (1 - progress);
    const scale = this.sprite.scale.x * 0.95; // Shrink
    this.sprite.scale.set(scale, scale, 1);
    
    return this.life < this.maxLife;
  }

  dispose(scene: THREE.Scene) {
    scene.remove(this.sprite);
  }
}

const activeFlames: FlameParticle[] = [];

export function updateFlameEffect(scene: THREE.Scene, dt: number, sourcePosition: THREE.Vector3, isMoving: boolean) {
  // Spawn new flame particles if moving
  if (isMoving) {
    // Spawn rate
    const spawnCount = 2; 
    for (let i = 0; i < spawnCount; i++) {
      // Add slight randomness to source position so it's not a thin line
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      );
      activeFlames.push(new FlameParticle(scene, sourcePosition.clone().add(jitter)));
    }
  }

  // Update existing
  for (let i = activeFlames.length - 1; i >= 0; i--) {
    const alive = activeFlames[i].update(dt);
    if (!alive) {
      activeFlames[i].dispose(scene);
      activeFlames.splice(i, 1);
    }
  }
}

export function cleanupFlames(scene: THREE.Scene) {
    activeFlames.forEach(f => f.dispose(scene));
    activeFlames.length = 0;
}
