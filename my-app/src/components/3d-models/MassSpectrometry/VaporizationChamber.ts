import * as THREE from 'three';

export class VaporizationChamber {
    public mesh: THREE.Group;

    constructor(position: THREE.Vector3, length: number = 10, radius: number = 2) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        // 1. Ống dẫn mẫu (Sample Tube) - Từ A đến B
        // Sử dụng vật liệu thủy tinh chịu nhiệt (Quartz/Glass) để thấy mẫu bên trong
        const tubeGeo = new THREE.CylinderGeometry(radius, radius, length, 32, 1, true);
        const tubeMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.9, // Trong suốt
            opacity: 0.6,
            roughness: 0.1,
            transparent: true,
            side: THREE.DoubleSide
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.rotation.z = Math.PI / 2; // Nằm ngang
        this.mesh.add(tube);

        // 2. Cuộn dây nhiệt (Heating Coil) - Dạng Serpentine/Zigzag
        // Lý do: Tăng diện tích tiếp xúc bề mặt ống
        
        const coilPoints = [];
        const loops = 8; // Số vòng uốn
        const coilRadius = radius + 0.2; // Ôm sát bên ngoài ống
        
        for (let i = 0; i <= loops * 20; i++) {
            // Tạo hình lò xo xoắn quanh ống
            const t = (i / (loops * 20));
            const angle = t * Math.PI * 2 * loops; 
            const x = (t - 0.5) * length * 0.9; // Phân bố dọc trục X
            
            const y = Math.sin(angle) * coilRadius;
            const z = Math.cos(angle) * coilRadius;
            
            coilPoints.push(new THREE.Vector3(x, y, z));
        }

        // Dùng CatmullRomCurve3 để làm mượt đường dây dẫn nhiệt
        const curve = new THREE.CatmullRomCurve3(coilPoints);
        const coilGeo = new THREE.TubeGeometry(curve, 128, 0.15, 8, false);
        const coilMat = new THREE.MeshStandardMaterial({
            color: 0xff0000, // Màu đỏ đặc trưng của nhiệt
            emissive: 0xaa0000, // Tự phát sáng
            emissiveIntensity: 1, // Độ sáng mô phỏng nhiệt độ cao
            metalness: 0.5,
            roughness: 0.4
        });
        const heatingCoil = new THREE.Mesh(coilGeo, coilMat);
        this.mesh.add(heatingCoil);

        // 3. Các khe cửa (Slits) A và B
        const slitWidth = 0.5;
        const slitGeo = new THREE.CylinderGeometry(radius + 0.5, radius + 0.5, slitWidth, 32);
        
        // Slit A (Màu xanh dương) - Đầu vào
        const slitA = new THREE.Mesh(slitGeo, new THREE.MeshStandardMaterial({ color: 0x0000ff })); // A: Blue
        slitA.rotation.z = Math.PI / 2;
        slitA.position.x = -length / 2;
        this.mesh.add(slitA);

        // Slit B (Màu vàng) - Đầu ra sang buồng Ion hóa
        const slitB = new THREE.Mesh(slitGeo, new THREE.MeshStandardMaterial({ color: 0xffff00 })); // B: Yellow
        slitB.rotation.z = Math.PI / 2;
        slitB.position.x = length / 2;
        this.mesh.add(slitB);
    }
}
