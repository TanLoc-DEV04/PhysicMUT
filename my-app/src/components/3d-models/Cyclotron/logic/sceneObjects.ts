
import * as THREE from 'three';

// =====================================================
// 2) CREATE DEES (Enhanced hollow half cylinders)
// =====================================================
export function createDee(color: number, _sign: "+" | "-", _rotation: number) {
  const group = new THREE.Group();

  // Main Dee structure - hollow half cylinder
  const outerRadius = 2.5;
  // const innerRadius = 0.15; // Unused in original code block for geometry
  const height = 0.3;

  // Create main shape using cylinder geometry and clipping
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

  // Note: The original code had commented out indicator logic. 
  // We keep it simple as per the active code in main.ts.

  return group;
}

// =====================================================
// 3) ELECTROMAGNETS (Top and Bottom)
// =====================================================
export function createElectromagnet(position: THREE.Vector3, _poleType: "N" | "S") {
  const group = new THREE.Group();

  // Main magnet body
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

  // Create BOTH poles for each magnet
  const poleGeo = new THREE.CylinderGeometry(
    magnetRadius * 0.8,
    magnetRadius * 0.8,
    0.1,
    32
  );

  // TOP POLE (N for both magnets, but different faces)
  const topPoleMat = new THREE.MeshPhongMaterial({
    color: 0xff4444, // Red for N pole
    emissive: 0x220000,
  });
  const topPole = new THREE.Mesh(poleGeo, topPoleMat);
  topPole.position.y = magnetHeight / 2 + 0.05;

  // BOTTOM POLE (S for both magnets, but different faces)
  const bottomPoleMat = new THREE.MeshPhongMaterial({
    color: 0x4444ff, // Blue for S pole
    emissive: 0x000022,
  });
  const bottomPole = new THREE.Mesh(poleGeo, bottomPoleMat);
  bottomPole.position.y = -magnetHeight / 2 - 0.05;

  // Coil windings representation
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

  // CREATE LABELS FOR BOTH POLES
  function createPoleLabel(
    type: "N" | "S",
    yPosition: number,
    rot: number
  ) {
    const labelGeo = new THREE.PlaneGeometry(0.6, 0.6);
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    // Create label texture
    ctx.fillStyle = type === "N" ? "#ffdddd" : "#ddddff";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, 118, 118);
    ctx.fillStyle = type === "N" ? "#ff0000" : "#0000ff";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(type, 64, 64);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide
    });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = yPosition;
    label.rotation.x = rot;
    return label;
  }

  // Add labels for both poles
  const topLabel = createPoleLabel("N", magnetHeight / 2 + 0.15, -Math.PI / 2);
  const bottomLabel = createPoleLabel(
    "S",
    -magnetHeight / 2 - 0.15,
    Math.PI / 2
  );

  // Add all components to group
  group.add(magnet, topPole, bottomPole, topLabel, bottomLabel);
  group.position.copy(position);
  return group;
}

export function createVacuumChamber() {
  const height = 3.8; // Fits between poles at +/- 1.9
  const radius = 2.9;

  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    height,
    64,
    1,
    true
  );

  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false, // Good for transparent objects
  });

  const chamber = new THREE.Mesh(geometry, material);
  return chamber;
}

// =====================================================
// 3.2) DEE ENCLOSURE (Inner shell with slot)
// =====================================================
export function createDeeEnclosure() {
  const radius = 2.65; // Slightly larger than Dees (2.5)
  const height = 0.32; // Slightly taller than Dees (0.3)
  const windowWidth = Math.PI / 12; // ~15 degree gap
  const thetaStart = windowWidth / 2; // Center gap at angle 0
  const thetaLength = 2 * Math.PI - windowWidth;

  const geometry = new THREE.CylinderGeometry(
    radius, radius, height,
    64, 1, true,
    thetaStart, thetaLength
  );

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x8899a6,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const enclosure = new THREE.Mesh(geometry, material);
  return enclosure;
}

// =====================================================
// 4) OSCILLATOR (LC CIRCUIT)
// =====================================================
export function createOscillator() {
  const group = new THREE.Group();

  // 1. Oscillator Base / Platform
  const baseGeo = new THREE.BoxGeometry(1.2, 0.1, 1.2);
  const baseMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.05;
  group.add(base);

  // 2. CAPACITOR (C) - Two parallel plates
  const capGroup = new THREE.Group();
  const plateGeo = new THREE.BoxGeometry(0.5, 0.4, 0.05);
  const capMat   = new THREE.MeshPhongMaterial({ 
    color: 0x88ccff, 
    emissive: 0x0088ff, 
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.9
  });
  
  const plate1 = new THREE.Mesh(plateGeo, capMat);
  plate1.position.z = -0.1;
  const plate2 = new THREE.Mesh(plateGeo, capMat);
  plate2.position.z = 0.1;
  
  capGroup.add(plate1, plate2);
  capGroup.position.set(-0.35, 0.25, 0);
  capGroup.name = "capacitorPart";
  group.add(capGroup);

  // 3. INDUCTOR (L) - Helical Coil
  class HelixCurve extends THREE.Curve<THREE.Vector3> {
    radius: number;
    height: number;
    turns: number;
    constructor(radius: number, height: number, turns: number) {
      super();
      this.radius = radius;
      this.height = height;
      this.turns = turns;
    }
    getPoint(t: number, optionalTarget = new THREE.Vector3()) {
      const angle = t * Math.PI * 2 * this.turns;
      const x = this.radius * Math.cos(angle);
      const z = this.radius * Math.sin(angle);
      const y = t * this.height - this.height / 2;
      return optionalTarget.set(x, y, z);
    }
  }

  const helixPath = new HelixCurve(0.15, 0.6, 6);
  const inductorGeo = new THREE.TubeGeometry(helixPath, 64, 0.02, 8, false);
  const inductorMat = new THREE.MeshPhongMaterial({ 
    color: 0xffaa44, 
    emissive: 0xff4400, 
    emissiveIntensity: 0 
  });
  const inductor = new THREE.Mesh(inductorGeo, inductorMat);
  inductor.rotation.z = Math.PI / 2;
  inductor.position.set(0.35, 0.25, 0);
  inductor.name = "inductorPart";
  group.add(inductor);

  // 4. ELECTRON PARTICLES (Points)
  const numParticles = 40;
  const electronPoints: THREE.Vector3[] = [];
  
  for (let i = 0; i < numParticles; i++) {
    // Initial dummy positions, will be updated in animation loop
    electronPoints.push(new THREE.Vector3(0, 0, 0));
  }
  
  const electronGeo = new THREE.BufferGeometry().setFromPoints(electronPoints);
  const electronMat = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.06,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const electronSystem = new THREE.Points(electronGeo, electronMat);
  electronSystem.name = "electronParticles";
  group.add(electronSystem);

  // 5. ENCLOSURE (Transparent Grey Box)
  const boxGeo = new THREE.BoxGeometry(1.4, 0.7, 1.4);
  const boxMat = new THREE.MeshPhongMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 1.0,
    shininess: 100
  });
  const enclosure = new THREE.Mesh(boxGeo, boxMat);
  enclosure.position.set(0, 0.25, 0); // Center around components
  group.add(enclosure);

  // 5.1 POWER BUTTON & LED
  const btnGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
  const btnMat = new THREE.MeshPhongMaterial({ color: 0x333333 }); 
  const powerBtn = new THREE.Mesh(btnGeo, btnMat);
  powerBtn.name = "lcPowerButton";
  powerBtn.rotation.x = Math.PI / 2;
  powerBtn.position.set(0, 0.2, 0.7); // On the front face of the box
  group.add(powerBtn);

  const ledGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const ledMat = new THREE.MeshPhongMaterial({ color: 0x440000 }); // Dim red initially
  const statusLed = new THREE.Mesh(ledGeo, ledMat);
  statusLed.name = "lcStatusLed";
  statusLed.position.set(0.15, 0.2, 0.7); 
  group.add(statusLed);

  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 128; labelCanvas.height = 64;
  const lctx = labelCanvas.getContext('2d')!;
  lctx.fillStyle = "#ffffff"; lctx.font = "bold 40px Arial";
  lctx.textAlign = "center"; lctx.fillText("POWER", 64, 45);
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), labelMat);
  labelMesh.position.set(0, 0.4, 0.71);
  group.add(labelMesh);

  // 6. INTERNAL WIRING
  const wireMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
  const wireGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.0);
  
  const wireTop = new THREE.Mesh(wireGeo, wireMat);
  wireTop.rotation.z = Math.PI / 2;
  wireTop.position.y = 0.45;
  group.add(wireTop);

  const wireBot = new THREE.Mesh(wireGeo, wireMat);
  wireBot.rotation.z = Math.PI / 2;
  wireBot.position.y = 0.05;
  group.add(wireBot);

  // 7. Z-SHAPED CONNECTION RODS TO DEES
  const zWireMat = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 80 });
  const jointGeo = new THREE.SphereGeometry(0.04, 8, 8);
  
  function createZPath(side: number) {
    const sideGroup = new THREE.Group();
    const x = side * 0.3;
    
    // Segment 1: Horizontal from Oscillator (local z=0) to z=1.5 (local z=-3.0)
    const seg1Len = 1.5; 
    const seg1Geo = new THREE.CylinderGeometry(0.02, 0.02, seg1Len);
    const seg1 = new THREE.Mesh(seg1Geo, zWireMat);
    seg1.rotation.x = Math.PI / 2;
    seg1.position.set(x, 0.25, -seg1Len/2);
    sideGroup.add(seg1);

    // Elbow 1
    const elbow1 = new THREE.Mesh(jointGeo, zWireMat);
    elbow1.position.set(x, 0.25, -seg1Len);
    sideGroup.add(elbow1);

    // Segment 2: Vertical Riser (from local y=0.25 to local y=2.1)
    const riserHeight = 1.85; 
    const seg2Geo = new THREE.CylinderGeometry(0.02, 0.02, riserHeight);
    const seg2 = new THREE.Mesh(seg2Geo, zWireMat);
    seg2.position.set(x, 0.25 + riserHeight/2, -seg1Len);
    sideGroup.add(seg2);

    // Elbow 2
    const elbow2 = new THREE.Mesh(jointGeo, zWireMat);
    elbow2.position.set(x, 2.1, -seg1Len);
    sideGroup.add(elbow2);

    // Segment 3: Horizontal into Dees (from local z=-3.0 to local z=-4.5)
    const seg3Len = 0.6; 
    const seg3Geo = new THREE.CylinderGeometry(0.02, 0.02, seg3Len);
    const seg3 = new THREE.Mesh(seg3Geo, zWireMat);
    seg3.rotation.x = Math.PI / 2;
    seg3.position.set(x, 2.1, -seg1Len - seg3Len/2);
    sideGroup.add(seg3);

    return sideGroup;
  }

  group.add(createZPath(-1)); 
  group.add(createZPath(1));  

  // Position the whole group level with the bottom magnet (y=-2.2)
  group.position.set(0, -2.1, 4.5);
  
  return group;
}

// =====================================================
// 7.1) TARGET (Extraction Point)
// =====================================================
export function createTarget() {
  const group = new THREE.Group();

  // Target Holder / Housing
  const holderGeo = new THREE.BoxGeometry(0.3, 0.4, 0.4);
  const holderMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    transparent: true,
    opacity: 0.2,
    roughness: 0.2
  });
  const holder = new THREE.Mesh(holderGeo, holderMat);
  holder.position.x = -0.1;
  group.add(holder);

  // Target core (Bia vật liệu - radioactive warning color)
  const targetGeo = new THREE.BoxGeometry(0.1, 0.3, 0.3);
  const targetMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0x442200,
  });
  const target = new THREE.Mesh(targetGeo, targetMat);
  target.position.x = -0.18; // Face toward the cyclotron
  group.add(target);

  // Square extraction aperture (Khe hình vuông)
  const frameGeo = new THREE.RingGeometry(0.12, 0.18, 4); // Square-ish frame
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide});
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.rotation.y = Math.PI / 2;
  frame.rotation.z = Math.PI / 4; // Square alignment
  frame.position.x = -0.251;
  group.add(frame);

  const radius = 2.9; 
  group.position.set(radius, 0, 0); 
  return group;
}
