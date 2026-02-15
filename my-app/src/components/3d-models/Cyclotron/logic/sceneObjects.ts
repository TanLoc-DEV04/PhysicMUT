
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

// =====================================================
// 3.1) VACUUM CHAMBER
// =====================================================
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
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false, // Good for transparent objects
  });

  const chamber = new THREE.Mesh(geometry, material);
  return chamber;
}

// =====================================================
// 4) OSCILLATOR BOX AND CONNECTIONS
// =====================================================
export function createOscillator() {
  const group = new THREE.Group();

  // Main oscillator box
  const oscGeo = new THREE.BoxGeometry(1.0, 0.6, 0.8);
  const oscMat = new THREE.MeshPhongMaterial({
    color: 0x888888,
    shininess: 50,
  });
  const oscillator = new THREE.Mesh(oscGeo, oscMat);

  // Control panel
  const panelGeo = new THREE.BoxGeometry(0.8, 0.4, 0.02);
  const panelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.z = 0.41;

  // LED indicators
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

  group.add(oscillator, panel);

  // Connection points (terminals) on the oscillator box
  const termLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshPhongMaterial({ color: 0x000000 })
  );
  termLeft.position.set(-0.3, 0, -0.4); // Left side

  const termRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshPhongMaterial({ color: 0x000000 })
  );
  termRight.position.set(0.3, 0, -0.4); // Right side

  group.add(termLeft, termRight, oscillator, panel);

  // Vector math for precise connection
  const rodLength = 1.7; // Slightly overlapping
  const rodGeometry = new THREE.CylinderGeometry(0.04, 0.04, rodLength, 8);
  rodGeometry.rotateX(Math.PI / 2); // Verify alignment

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

  group.add(rodLeft, rodRight);

  // Position the whole group on Z axis
  group.position.set(0, 0, 4.5);
  group.rotation.y = 0; // Terminals (Z-) face the Dees (at Z=0)

  return group;
}

// =====================================================
// 7.1) TARGET (Extraction Point)
// =====================================================
export function createTarget() {
  const group = new THREE.Group();

  // Target Plate
  const plateGeo = new THREE.BoxGeometry(0.1, 0.5, 0.5);
  const plateMat = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);

  // Target Center (Bullseye)
  const ringGeo = new THREE.RingGeometry(0.05, 0.15, 16);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.y = Math.PI / 2;
  ring.position.x = -0.06;

  group.add(plate, ring);

  const radius = 2.9; // Slightly outside maxRadius

  group.position.set(radius, 0, 0); // Place on X axis
  return group;
}
