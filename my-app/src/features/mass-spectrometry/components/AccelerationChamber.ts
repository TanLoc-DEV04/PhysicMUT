import * as THREE from 'three';

export class AccelerationChamber {
    public mesh: THREE.Group;

    constructor(
        position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        length: number = 10,
        radius: number = 2.5
    ) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        this.initStructure(length, radius);
        this.initAccelerationPlates(length, radius);
    }

    /**
     * 1. Vỏ buồng gia tốc (Chamber Housing) - Từ C đến D
     */
    private initStructure(length: number, radius: number): void {
        const geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, true);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xaaddff, // Màu xanh nhạt
            metalness: 0.2,
            roughness: 0.1,
            transmission: 0.8, // Trong suốt để thấy các đĩa bên trong
            opacity: 0.3,
            transparent: true,
            side: THREE.DoubleSide
        });

        const housing = new THREE.Mesh(geometry, material);
        // Xoay ngang trục Z để khớp với luồng ion (Cylinder đứng dọc trục Y -> Xoay Z=90)
        housing.rotation.z = Math.PI / 2; 
        this.mesh.add(housing);
    }

    /**
     * 2. Các đĩa gia tốc (Acceleration Plates - Slitted Disks)
     * - Cấu tạo: Đĩa kim loại phẳng có lỗ hở ở giữa.
     */
    private initAccelerationPlates(length: number, radius: number): void {
        const plateCount = 4; // Số lượng đĩa
        const plateThickness = 0.2;
        const holeRadius = 0.5; // Lỗ nhỏ để hội tụ chùm tia
        const spacing = length / (plateCount + 1); // Khoảng cách đều nhau

        // Tạo Geometry chung cho một đĩa có lỗ
        const shape = new THREE.Shape();
        shape.absarc(0, 0, radius - 0.1, 0, Math.PI * 2, false); 
        
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true); 
        shape.holes.push(holePath);

        const plateGeo = new THREE.ExtrudeGeometry(shape, {
            depth: plateThickness,
            bevelEnabled: false,
            curveSegments: 32
        });

        // Tạo các đĩa
        for (let i = 0; i < plateCount; i++) {
            // Đĩa cuối cùng sẽ là Cửa D
            const isLast = i === plateCount - 1;
            
            // Màu sắc: Các đĩa trung gian màu kim loại/cam nhạt
            // Cửa D: Màu Đỏ
            const color = isLast ? 0xff0000 : 0xcccccc; 
            
            const plateMat = new THREE.MeshStandardMaterial({
                color: color,
                metalness: 0.8,
                roughness: 0.3,
                side: THREE.DoubleSide
            });

            const plate = new THREE.Mesh(plateGeo, plateMat);
            plate.rotation.y = Math.PI / 2; // Đặt mặt phẳng vuông góc trục X

            // Tính vị trí dọc trục X (từ -length/2 đến +length/2)
            // Đĩa đầu tiên gần C (bắt đầu), Đĩa cuối cùng là D (kết thúc)
            const xPos = -length / 2 + spacing * (i + 1);
            
            plate.position.set(xPos, 0, 0);
            this.mesh.add(plate);
        }
    }
}
