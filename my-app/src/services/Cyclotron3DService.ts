import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

export interface CyclotronParams {
  particleType: 'Proton' | 'Deuteron' | 'Alpha' | 'Heavy Ion';
  mass: number;
  charge: number;
  voltage: number;
  magneticField: number;
  maxRadius: number;
  oscillationFreq: number;
  animationSpeed: number;
  showFieldLines: boolean;
  isRunning: boolean;
  cyclotronFreq: number;
  currentRadius: number;
  currentVelocity: number;
  revolutions: number;
  extractParticle: boolean;
}

interface SimulationState {
  angle: number;
  radius: number;
  velocity: number;
  isInDee: boolean;
  currentDee: number;
  revolutionCount: number;
  isAccelerating: boolean;
  time: number;
  isExtracted: boolean;
}

interface ParticleType {
  mass: number;
  charge: number;
}

export class Cyclotron3DService {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private gui: GUI | null = null;
  private animationId: number | null = null;
  private container: HTMLElement | null = null;
  private guiStyleElement: HTMLStyleElement | null = null;

  // State properties (replaced signals)
  public params: CyclotronParams = {
    particleType: 'Proton',
    mass: 1.67e-27,
    charge: 1.6e-19,
    voltage: 2000,
    magneticField: 1.0,
    maxRadius: 2.0,
    oscillationFreq: 1.0,
    animationSpeed: 1.0,
    showFieldLines: true,
    isRunning: true,
    cyclotronFreq: 0,
    currentRadius: 0,
    currentVelocity: 0,
    revolutions: 0,
    extractParticle: false,
  };

  private particleTypes: Record<string, ParticleType> = {
    Proton: { mass: 1.67e-27, charge: 1.6e-19 },
    Deuteron: { mass: 3.34e-27, charge: 1.6e-19 },
    Alpha: { mass: 6.64e-27, charge: 3.2e-19 },
    'Heavy Ion': { mass: 1.0e-26, charge: 4.8e-19 },
  };

  private simulationState: SimulationState = {
    angle: 0,
    radius: 0.1,
    velocity: 0,
    isInDee: false,
    currentDee: 1,
    revolutionCount: 0,
    isAccelerating: false,
    time: 0,
    isExtracted: false,
  };

  private dee1: THREE.Group | null = null;
  private dee2: THREE.Group | null = null;
  private particle: THREE.Mesh | null = null;
  private fieldLines: THREE.ArrowHelper[] = [];
  private activeFlames: FlameParticle[] = [];
  private flameMaterial: THREE.SpriteMaterial | null = null;

  private readonly VISUAL_SCALE = 50;
  private readonly MAGNET_SPACING = 2.2;

  constructor() {}

  initialize(container: HTMLElement): void {
    if (this.renderer && this.container) {
      console.warn('Cyclotron3DService already initialized. Disposing previous instance.');
      this.dispose();
    }

    this.container = container;
    this.setupScene();
    this.setupCamera();
    this.setupRenderer(container);
    this.setupControls();
    this.setupLighting();
    this.createCyclotronComponents();
    this.setupGUI();
    this.createFieldLines();
    this.resetParticle();
    this.animate();
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
    const loader = new THREE.CubeTextureLoader().setPath('https://sbcode.net/img/');
    loader.load(
      ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
      (texture) => {
        if (this.scene) {
          this.scene.background = texture;
          this.scene.backgroundBlurriness = 0.5;
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load background texture:', error);
        if (this.scene) {
          this.scene.background = new THREE.Color(0x000000);
        }
      }
    );
  }

  private setupCamera(): void {
    if (!this.scene || !this.container) return;
    const aspect = this.container.clientWidth / this.container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    this.camera.position.set(5, 5, 5);
  }

  private setupRenderer(container: HTMLElement): void {
    if (!this.scene || !this.camera) return;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
  }

  private setupControls(): void {
    if (!this.camera || !this.renderer) return;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  private setupLighting(): void {
    if (!this.scene) return;
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 4, 3);
    dir.castShadow = true;
    this.scene.add(dir);

    const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dir2.position.set(-3, 2, -3);
    this.scene.add(dir2);
  }

  private createDee(color: number, _sign: '+' | '-', _rotation: number): THREE.Group {
    const group = new THREE.Group();
    const outerRadius = 2.5;
    const height = 0.3;

    const deeGeo = new THREE.CylinderGeometry(
      outerRadius,
      outerRadius,
      height,
      32,
      1,
      false,
      0,
      Math.PI
    );
    const deeMat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const dee = new THREE.Mesh(deeGeo, deeMat);
    dee.rotation.z = Math.PI / 2;
    group.add(dee);
    return group;
  }

  private createElectromagnet(position: THREE.Vector3, _poleType: 'N' | 'S'): THREE.Group {
    const group = new THREE.Group();
    const magnetRadius = 3.0;
    const magnetHeight = 0.4;

    const magnetGeo = new THREE.CylinderGeometry(
      magnetRadius,
      magnetRadius,
      magnetHeight,
      32
    );
    const magnetMat = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 30,
    });
    const magnet = new THREE.Mesh(magnetGeo, magnetMat);

    const poleGeo = new THREE.CylinderGeometry(
      magnetRadius * 0.8,
      magnetRadius * 0.8,
      0.1,
      32
    );

    const topPoleMat = new THREE.MeshPhongMaterial({
      color: 0xff4444,
      emissive: 0x220000,
    });
    const topPole = new THREE.Mesh(poleGeo, topPoleMat);
    topPole.position.y = magnetHeight / 2 + 0.05;

    const bottomPoleMat = new THREE.MeshPhongMaterial({
      color: 0x4444ff,
      emissive: 0x000022,
    });
    const bottomPole = new THREE.Mesh(poleGeo, bottomPoleMat);
    bottomPole.position.y = -magnetHeight / 2 - 0.05;

    for (let i = 0; i < 8; i++) {
        const coilGeo = new THREE.TorusGeometry(
          magnetRadius * 0.9 - i * 0.05,
          0.02,
          8,
          16
        );
        const coilMat = new THREE.MeshPhongMaterial({ color: 0xcc6600 });
        const coil = new THREE.Mesh(coilGeo, coilMat);
        coil.position.y = -magnetHeight / 2 + 0.1 + i * 0.05;
        coil.rotation.x = Math.PI / 2;
        group.add(coil);
    }

    group.add(magnet, topPole, bottomPole);
    group.position.copy(position);
    return group;
  }

  private createVacuumChamber(): THREE.Mesh {
    const height = 3.8;
    const radius = 2.9;
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    return new THREE.Mesh(geometry, material);
  }

  private createOscillator(): THREE.Group {
    const group = new THREE.Group();
    const oscGeo = new THREE.BoxGeometry(1.0, 0.6, 0.8);
    const oscMat = new THREE.MeshPhongMaterial({
      color: 0x888888,
      shininess: 50,
    });
    const oscillator = new THREE.Mesh(oscGeo, oscMat);

    const panelGeo = new THREE.BoxGeometry(0.8, 0.4, 0.02);
    const panelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.z = 0.41;

    for (let i = 0; i < 3; i++) {
      const ledGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const ledMat = new THREE.MeshPhongMaterial({
        color: i === 0 ? 0x00ff00 : i === 1 ? 0xff0000 : 0x0000ff,
        emissive: i === 0 ? 0x002200 : i === 1 ? 0x220000 : 0x000022,
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(-0.2 + i * 0.2, 0.1, 0.42);
      group.add(led);
    }

    const termLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    termLeft.position.set(-0.3, 0, -0.4);

    const termRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    termRight.position.set(0.3, 0, -0.4);

    const rodLength = 1.7;
    const rodGeometry = new THREE.CylinderGeometry(0.04, 0.04, rodLength, 8);
    rodGeometry.rotateX(Math.PI / 2);

    const rodLeft = new THREE.Mesh(
      rodGeometry,
      new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    rodLeft.position.set(-0.3, 0, -1.25);

    const rodRight = new THREE.Mesh(
      rodGeometry,
      new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    rodRight.position.set(0.3, 0, -1.25);

    group.add(oscillator, panel, termLeft, termRight, rodLeft, rodRight);
    group.position.set(0, 0, 4.5);
    return group;
  }

  private createTarget(): THREE.Group {
    const group = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(0.1, 0.5, 0.5);
    const plateMat = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);

    const ringGeo = new THREE.RingGeometry(0.05, 0.15, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = -0.06;

    group.add(plate, ring);
    const radius = 2.9;
    group.position.set(radius, 0, 0);
    return group;
  }

  private createCyclotronComponents(): void {
    if (!this.scene) return;

    const deeGroup = new THREE.Group();
    const spacingBetweenDees = -0.5;
    this.dee1 = this.createDee(0xff8800, '+', 0);
    this.dee1.rotation.z = Math.PI / 2;
    this.dee1.position.x = spacingBetweenDees / 2;
    this.dee1.userData = { sign: '+', potential: 1 };

    this.dee2 = this.createDee(0x0088ff, '-', Math.PI);
    this.dee2.rotation.z = -Math.PI / 2;
    this.dee2.position.x = -spacingBetweenDees / 2;
    this.dee2.userData = { sign: '-', potential: -1 };

    deeGroup.add(this.dee1, this.dee2);
    this.scene.add(deeGroup);

    const topMagnet = this.createElectromagnet(
      new THREE.Vector3(0, this.MAGNET_SPACING, 0),
      'S'
    );
    const bottomMagnet = this.createElectromagnet(
      new THREE.Vector3(0, -this.MAGNET_SPACING, 0),
      'N'
    );
    this.scene.add(topMagnet, bottomMagnet);

    const vacuumChamber = this.createVacuumChamber();
    this.scene.add(vacuumChamber);

    const oscillator = this.createOscillator();
    this.scene.add(oscillator);

    const target = this.createTarget();
    this.scene.add(target);

    const particleGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
    });
    this.particle = new THREE.Mesh(particleGeo, particleMat);
    const particleLight = new THREE.PointLight(0xffaa00, 2, 5);
    this.particle.add(particleLight);
    this.scene.add(this.particle);

    // Setup flame material
    const flameTexture = this.getFlameTexture();
    if (flameTexture) {
      this.flameMaterial = new THREE.SpriteMaterial({
        map: flameTexture,
        color: 0xffaa00,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
    }
  }

  private getFlameTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 200, 0, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
  }

  private createFieldLines(): void {
    if (!this.scene) return;
    this.fieldLines.forEach((arrow) => this.scene!.remove(arrow));
    this.fieldLines.length = 0;

    if (!this.params.showFieldLines) return;

    const topMagnetY = this.MAGNET_SPACING;
    const bottomMagnetY = -this.MAGNET_SPACING;
    const fieldLength = topMagnetY - bottomMagnetY;
    const spacing = 0.9;

    for (let x = -2; x <= 2; x += spacing) {
      for (let z = -2; z <= 2; z += spacing) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance < 0.5) continue;

        const origin = new THREE.Vector3(x, bottomMagnetY + 0.2, z);
        const arrowLength = fieldLength * 0.9;
        const direction = new THREE.Vector3(0, 1, 0);

        const arrow = new THREE.ArrowHelper(
          direction.normalize(),
          origin,
          arrowLength,
          0x00ffff,
          0.3,
          0.15
        );

        const lineMaterial = arrow.line.material as THREE.LineBasicMaterial;
        const coneMaterial = arrow.cone.material as THREE.MeshBasicMaterial;

        lineMaterial.transparent = true;
        lineMaterial.opacity = 0.5;
        coneMaterial.transparent = true;
        coneMaterial.opacity = 0.5;

        this.fieldLines.push(arrow);
        this.scene.add(arrow);
      }
    }
  }

  private setupGUI(): void {
    if (typeof document === 'undefined') return;

    this.gui = new GUI({ 
      title: 'Bảng Điều Khiển'
    });

    // Remove existing style if any
    const existingStyle = document.getElementById('cyclotron-gui-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    this.guiStyleElement = document.createElement('style');
    this.guiStyleElement.id = 'cyclotron-gui-style';
    this.guiStyleElement.innerHTML = `
      .lil-gui { 
        --width: 350px;
        --name-width: 50%;
        font-size: 15px !important;
      }
      .lil-gui .title { font-size: 17px !important; font-weight: bold; padding: 8px; }
      .lil-gui button { font-size: 15px !important; height: 32px; }
      .lil-gui .controller { padding-top: 4px; padding-bottom: 4px; }
    `;
    if (document.head) {
      document.head.appendChild(this.guiStyleElement);
    }

    const guiParams: any = { ...this.params };

    const simFolder = this.gui.addFolder('Điều Khiển Chung');
    simFolder
      .add({ toggleRun: () => this.toggleRun() }, 'toggleRun')
      .name('⏯ Dừng / Chạy');
    simFolder
      .add({ reset: () => this.resetParticle() }, 'reset')
      .name('🔄 Đặt Lại Hạt');

    const particleFolder = this.gui.addFolder('Thuộc tính Hạt');
    particleFolder
      .add(guiParams, 'particleType', ['Proton', 'Deuteron', 'Alpha', 'Heavy Ion'])
      .name('Loại Hạt')
      .onChange((value: string) => {
        const particleData = this.particleTypes[value];
        this.params.particleType = value as any;
        this.params.mass = particleData.mass;
        this.params.charge = particleData.charge;
        
        guiParams.particleType = value;
        guiParams.mass = particleData.mass;
        guiParams.charge = particleData.charge;
    
        this.resetParticle();
      });
    particleFolder
      .add(guiParams, 'mass', 1e-27, 1e-25)
      .name('Khối lượng (kg)')
      .onChange((value: number) => {
        this.params.mass = value;
      });
    particleFolder
      .add(guiParams, 'charge', 1e-19, 5e-19)
      .name('Điện tích (C)')
      .onChange((value: number) => {
        this.params.charge = value;
      });

    const emFolder = this.gui.addFolder('Điện - Từ Trường');
    emFolder
      .add(guiParams, 'voltage', 500, 10000)
      .name('Hiệu điện thế (V)')
      .onChange((value: number) => {
        this.params.voltage = value;
        this.updateElectricField();
      });
    emFolder
      .add(guiParams, 'magneticField', 0.1, 3.0)
      .name('Từ trường B (Tesla)')
      .onChange((value: number) => {
        this.params.magneticField = value;
        this.createFieldLines();
        this.updateMagnetIndicators();
      });

    const cyclotronFolder = this.gui.addFolder('Cài đặt Cyclotron');
    cyclotronFolder
      .add(guiParams, 'maxRadius', 1.0, 4.0)
      .name('Bán kính tối đa (m)')
      .onChange((value: number) => {
        this.params.maxRadius = value;
      });
    cyclotronFolder
      .add(guiParams, 'oscillationFreq', 0.5, 3.0)
      .name('Tần số dao động')
      .onChange((value: number) => {
        this.params.oscillationFreq = value;
      });
    cyclotronFolder
      .add(guiParams, 'animationSpeed', 0.1, 3.0)
      .name('Tốc độ mô phỏng')
      .onChange((value: number) => {
        this.params.animationSpeed = value;
      });

    const vizFolder = this.gui.addFolder('Hiển thị');
    vizFolder
      .add(guiParams, 'showFieldLines')
      .name('Hiện đường sức từ')
      .onChange((value: boolean) => {
        this.params.showFieldLines = value;
        this.createFieldLines();
      });
    vizFolder
      .add(guiParams, 'extractParticle')
      .name('Bắn hạt ra ngoài')
      .onChange((value: boolean) => {
        this.params.extractParticle = value;
        if (value) {
          this.extractParticle();
        }
      });

    const infoFolder = this.gui.addFolder('Thông số Thực');
    // For read-only values, we need to update guiParams
    const updateInfoValues = () => {
      guiParams.cyclotronFreq = this.params.cyclotronFreq;
      guiParams.currentRadius = this.params.currentRadius;
      guiParams.currentVelocity = this.params.currentVelocity;
      guiParams.revolutions = this.params.revolutions;
    };

    infoFolder.add(guiParams, 'cyclotronFreq').name('Tần số Cyclotron (Hz)').listen();
    infoFolder.add(guiParams, 'currentRadius').name('Bán kính quỹ đạo (m)').listen();
    infoFolder.add(guiParams, 'currentVelocity').name('Vận tốc (m/s)').listen();
    infoFolder.add(guiParams, 'revolutions').name('Số vòng quay').listen();

    // Update info values periodically
    setInterval(updateInfoValues, 100);
  }

  toggleRun(): void {
    this.params.isRunning = !this.params.isRunning;
  }

  resetParticle(): void {
    this.simulationState = {
      angle: 0,
      radius: 0.1,
      velocity: 0,
      isInDee: false,
      currentDee: 1,
      revolutionCount: 0,
      isAccelerating: false,
      time: 0,
      isExtracted: false,
    };

    if (this.particle) {
      this.particle.position.set(0, 0, 0);
    }

    this.params.revolutions = 0;
    this.params.currentRadius = 0;
    this.params.currentVelocity = 0;
  }

  private updateElectricField(): void {
    if (!this.dee1 || !this.dee2) return;
    const time = Date.now() * 0.001 * this.params.oscillationFreq;
    const polarity = Math.sin(time) > 0 ? 1 : -1;

    const dee1Material = (this.dee1.children[0] as THREE.Mesh)
      .material as THREE.MeshPhongMaterial;
    const dee2Material = (this.dee2.children[0] as THREE.Mesh)
      .material as THREE.MeshPhongMaterial;

    if (polarity > 0) {
      dee1Material.color.setHex(0xff8800);
      dee2Material.color.setHex(0x0088ff);
      this.dee1.userData['potential'] = 1;
      this.dee2.userData['potential'] = -1;
    } else {
      dee1Material.color.setHex(0x0088ff);
      dee2Material.color.setHex(0xff8800);
      this.dee1.userData['potential'] = -1;
      this.dee2.userData['potential'] = 1;
    }
  }

  private updateMagnetIndicators(): void {
    this.fieldLines.forEach((arrow) => {
      const intensity = this.params.magneticField / 2.0;
      const lineMaterial = arrow.line.material as THREE.LineBasicMaterial;
      const coneMaterial = arrow.cone.material as THREE.MeshBasicMaterial;
      lineMaterial.opacity = intensity;
      coneMaterial.opacity = intensity;
    });
  }

  private calculateCyclotronFrequency(): number {
    const freq =
      (this.params.charge * this.params.magneticField) /
      (2 * Math.PI * this.params.mass);
    this.params.cyclotronFreq = freq;
    return freq;
  }

  private updateParticlePhysics(dt: number): void {
    if (this.simulationState.isExtracted) return;

    this.simulationState.time += dt;
    this.calculateCyclotronFrequency();

    const gapSize = 0.1;
    const inGap =
      this.simulationState.radius < gapSize ||
      Math.abs(this.simulationState.angle % Math.PI) < 0.1;

    if (inGap && !this.simulationState.isAccelerating) {
      this.simulationState.isAccelerating = true;
      const deltaV = this.params.voltage;
      const currentKE =
        0.5 * this.params.mass * this.simulationState.velocity * this.simulationState.velocity;
      const deltaKE = this.params.charge * deltaV;
      const newKE = currentKE + deltaKE;
      this.simulationState.velocity = Math.sqrt((2 * newKE) / this.params.mass);

      const physicalRadius =
        (this.params.mass * this.simulationState.velocity) /
        (this.params.charge * this.params.magneticField);
      this.simulationState.radius = physicalRadius * this.VISUAL_SCALE;
    } else if (!inGap) {
      this.simulationState.isAccelerating = false;
    }

    const currentPhysicalRadius =
      (this.params.mass * this.simulationState.velocity) /
      (this.params.charge * this.params.magneticField);
    
    this.params.currentVelocity = this.simulationState.velocity;
    this.params.currentRadius = currentPhysicalRadius || 0;

    if (this.simulationState.velocity > 0) {
      const angularVelocity =
        (this.params.charge * this.params.magneticField) / this.params.mass;
      this.simulationState.angle -=
        angularVelocity * dt * this.params.animationSpeed * 0.05;

      if (
        Math.abs(this.simulationState.angle) >
        (this.simulationState.revolutionCount + 1) * 2 * Math.PI
      ) {
        this.simulationState.revolutionCount++;
        this.params.revolutions = this.simulationState.revolutionCount;
      }
    }

    if (this.simulationState.radius >= this.params.maxRadius) {
      if (!this.simulationState.isExtracted) {
        this.extractParticle();
      }
    }

    if (!this.simulationState.isExtracted && this.particle) {
      const x = this.simulationState.radius * Math.cos(this.simulationState.angle);
      const z = this.simulationState.radius * Math.sin(this.simulationState.angle);
      this.particle.position.set(x, 0, z);
    }
  }

  private extractParticle(): void {
    this.simulationState.isExtracted = true;
    this.params.extractParticle = false;

    if (!this.particle) return;
    const extractionDirection = new THREE.Vector3(1, 0, 0);
    extractionDirection.normalize();

    const startPos = this.particle.position.clone();
    const endPos = startPos.clone().add(extractionDirection.multiplyScalar(5));

    let t = 0;
    const extractAnimation = () => {
      t += 0.02;
      if (t <= 1 && this.particle) {
        this.particle.position.lerpVectors(startPos, endPos, t);
        requestAnimationFrame(extractAnimation);
      } else {
        setTimeout(() => {
          this.resetParticle();
        }, 2000);
      }
    };
    extractAnimation();
  }

  private updateFlameEffect(dt: number, sourcePosition: THREE.Vector3, isMoving: boolean): void {
    if (!this.scene || !this.flameMaterial) return;

    if (isMoving) {
      const spawnCount = 2;
      for (let i = 0; i < spawnCount; i++) {
        const jitter = new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        );
        this.activeFlames.push(
          new FlameParticle(this.scene, this.flameMaterial, sourcePosition.clone().add(jitter))
        );
      }
    }

    for (let i = this.activeFlames.length - 1; i >= 0; i--) {
      const alive = this.activeFlames[i].update(dt);
      if (!alive) {
        this.activeFlames[i].dispose();
        this.activeFlames.splice(i, 1);
      }
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.scene || !this.camera || !this.renderer) return;

    this.updateElectricField();

    if (this.params.isRunning) {
      this.updateParticlePhysics(0.016 * this.params.animationSpeed);
      if (this.particle) {
        this.updateFlameEffect(
          0.016,
          this.particle.position,
          this.simulationState.velocity > 0
        );
      }
    }

    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };

  resize(width: number, height: number): void {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.activeFlames.forEach((flame) => flame.dispose());
    this.activeFlames = [];

    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
    }

    // Remove style element
    if (this.guiStyleElement && this.guiStyleElement.parentNode) {
      this.guiStyleElement.parentNode.removeChild(this.guiStyleElement);
      this.guiStyleElement = null;
    }

    if (this.renderer && this.container) {
      try {
        this.container.removeChild(this.renderer.domElement);
      } catch (e) {
        // Element might have been removed already
      }
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.particle = null;
    this.dee1 = null;
    this.dee2 = null;
  }
}

class FlameParticle {
  sprite: THREE.Sprite;
  life: number;
  maxLife: number;
  velocity: THREE.Vector3;
  private scene: THREE.Scene;

  constructor(
    scene: THREE.Scene,
    material: THREE.SpriteMaterial,
    position: THREE.Vector3
  ) {
    this.scene = scene;
    this.sprite = new THREE.Sprite(material);
    this.sprite.position.copy(position);

    const scale = 0.15 + Math.random() * 0.1;
    this.sprite.scale.set(scale, scale, 1);

    this.life = 0;
    this.maxLife = 0.5 + Math.random() * 0.5;

    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );

    scene.add(this.sprite);
  }

  update(dt: number): boolean {
    this.life += dt;
    this.sprite.position.add(this.velocity);

    const progress = this.life / this.maxLife;
    this.sprite.material.opacity = 0.8 * (1 - progress);
    const scale = this.sprite.scale.x * 0.95;
    this.sprite.scale.set(scale, scale, 1);

    return this.life < this.maxLife;
  }

  dispose(): void {
    this.scene.remove(this.sprite);
    this.sprite.geometry.dispose();
    this.sprite.material.dispose();
  }
}
