import * as THREE from 'three';

export class IonizationChamber {
    public mesh: THREE.Group;
    private electronBeam: THREE.Mesh | null = null;
    private filamentLight: THREE.PointLight | null = null;

    constructor(
        position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        chamberLength: number = 8,
        radius: number = 2.5
    ) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        this.initStructure(chamberLength, radius);
        this.initElectronGun(radius);
        this.initSlits(chamberLength, radius);
    }

    private initStructure(length: number, radius: number): void {
        // 1. Vỏ buồng (Housing) - Trong suốt để nhìn thấy bên trong
        const housingGeo = new THREE.BoxGeometry(length, radius * 2.2, radius * 2.2);
        const housingMat = new THREE.MeshPhysicalMaterial({
            color: 0x888888,
            metalness: 0.8,
            roughness: 0.1,
            transmission: 0.7, // Độ truyền sáng (nhìn xuyên thấu)
            opacity: 0.3,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false // Giúp render các vật thể trong suốt lồng nhau tốt hơn
        });
        const housing = new THREE.Mesh(housingGeo, housingMat);
        this.mesh.add(housing);

        // 2. Electron Trap (Giả định nằm phía dưới đáy)
        const trapGeo = new THREE.BoxGeometry(2, 0.2, 2);
        const trapMat = new THREE.MeshStandardMaterial({ color: 0x222222 }); 
        const trap = new THREE.Mesh(trapGeo, trapMat);
        trap.position.set(0, -radius + 0.5, 0);
        this.mesh.add(trap);
    }

    private initElectronGun(radius: number): void {
        // 1. Dây tóc (Filament) - Dạng lò xo xoắn
        const curvePoints = [];
        const turns = 5;
        const coilRadius = 0.3;
        const coilHeight = 1.5;

        for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const angle = t * Math.PI * 2 * turns;
            // Tạo hình lò xo theo trục Y
            const x = Math.cos(angle) * coilRadius;
            const y = (t - 0.5) * coilHeight; // Centered Y
            const z = Math.sin(angle) * coilRadius;
            curvePoints.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
        const filamentMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00, // Màu cam
            emissive: 0xff4400, // Tự phát sáng đỏ cam
            emissiveIntensity: 3,
            toneMapped: false // Giữ màu sáng rực rỡ
        });
        
        const filament = new THREE.Mesh(tubeGeo, filamentMat);
        // Đặt phía trên đỉnh buồng (Top)
        filament.rotation.z = Math.PI / 2; // Xoay ngang cho đúng hướng bắn
        filament.position.set(0, radius - 0.8, 0);
        this.mesh.add(filament);

        // 2. Ánh sáng từ dây tóc (Glow)
        this.filamentLight = new THREE.PointLight(0xffaa00, 5, 10);
        this.filamentLight.position.copy(filament.position);
        this.mesh.add(this.filamentLight);

        // 3. Chùm tia điện tử (Electron Beam) - 70eV
        // Nối từ Filament xuống Trap
        const beamGeo = new THREE.CylinderGeometry(0.1, 0.2, radius * 1.8, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Màu Cyan (năng lượng cao)
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending, // Cộng màu để tạo hiệu ứng phát sáng
        });
        this.electronBeam = new THREE.Mesh(beamGeo, beamMat);
        this.electronBeam.position.set(0, 0, 0); // Giữa tâm
        this.mesh.add(this.electronBeam);
    }

    private initSlits(length: number, radius: number): void {
        const slitThickness = 0.2;
        
        // Helper tạo đĩa có lỗ (Slitted Disk)
        const createSlit = (color: number, xPos: number) => {
            // Shape bên ngoài
            const shape = new THREE.Shape();
            shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
            
            // Lỗ hổng bên trong (Hole)
            const holePath = new THREE.Path();
            holePath.absarc(0, 0, 0.5, 0, Math.PI * 2, true); // Lỗ nhỏ 0.5
            shape.holes.push(holePath);

            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth: slitThickness,
                bevelEnabled: false,
                curveSegments: 32
            });

            const material = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.5,
                roughness: 0.5,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.y = Math.PI / 2; // Dựng đứng vuông góc trục X
            mesh.position.set(xPos, 0, 0);
            return mesh;
        };

        // Cửa ải B (Vàng) - Đầu vào từ Buồng hóa hơi
        // Đã có ở VaporizationChamber, nhưng ở đây cũng có thể coi là vách ngăn
        // Tùy thiết kế: Nếu VaporizationChamber đã vẽ, ở đây có thể bỏ qua hoặc vẽ đè
        // Theo yêu cầu: "Đoạn từ B đến C".
        // Để seamless, ta sẽ vẽ Slit C ở cuối. Slit B ở đầu.
        
        // Cửa ải C (Xanh lá) - Đầu ra sang Buồng gia tốc
        const slitC = createSlit(0x00ff00, length / 2); // Green
        this.mesh.add(slitC);
    }

    // Hàm cập nhật animation (gọi trong loop)
    public update(time: number): void {
        if (this.electronBeam) {
            // Hiệu ứng chùm tia dao động nhẹ (pulsing)
            const pulse = 1 + Math.sin(time * 10) * 0.1;
            this.electronBeam.scale.set(pulse, 1, pulse);
        }
        
        if (this.filamentLight) {
            // Hiệu ứng ánh sáng dây tóc nhấp nháy nhẹ
            this.filamentLight.intensity = 5 + Math.random() * 0.5;
        }
    }
}
