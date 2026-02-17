import * as THREE from 'three';

export class MassAnalyzer {
    public mesh: THREE.Group;
    
    // Thông số kích thước
    private bendRadius: number;
    private tubeRadius: number;
    private angle: number;

    constructor(
        position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        bendRadius: number = 12, // Bán kính cong (R)
        tubeRadius: number = 2,  // Bán kính tiết diện ống
        angle: number = Math.PI / 2 // Góc uốn (90 độ)
    ) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        this.bendRadius = bendRadius;
        this.tubeRadius = tubeRadius;
        this.angle = angle;

        this.initCurvedTube();
        this.initMagnetPoles();
        this.initFieldLines(); // Mô phỏng đường sức từ
    }

    /**
     * 1. Ống cong (Curved Tube / Flight Tube)
     * - Hình dạng: Một phần hình xuyến (Torus)
     */
    private initCurvedTube(): void {
        const geometry = new THREE.TorusGeometry(
            this.bendRadius, 
            this.tubeRadius, 
            20, 
            64, 
            this.angle 
        );

        // Vật liệu thủy tinh/kim loại trong suốt
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xaaccff, // Màu xanh nhạt
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9, 
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide
        });

        const tube = new THREE.Mesh(geometry, material);

        // ĐỊNH VỊ: 
        // TorusGeometry mặc định nằm trên mặt phẳng XY, tâm tại (0,0,0).
        // Ta cần xoay nó nằm ngang (mặt phẳng XZ) và dịch chuyển để khớp đầu vào.
        
        tube.rotation.x = Math.PI / 2; // Xoay nằm ngang
        // Xoay trục Z để đầu vào hướng theo trục X dương
        tube.rotation.z = -Math.PI / 2; // hoặc điều chỉnh tùy hướng kết nối
        
        // Dịch chuyển tâm torus
        // Giả sử buồng gia tốc kết thúc tại (0,0,0) và bắn theo hướng +X
        // Torus bắt đầu tại góc 0 (phải) hoặc PI (trái) tùy cách vẽ
        // Với TorusGeometry(R, r, ..., arc), arc bắt đầu từ góc 0.
        // Khi rotation.z = PI, điểm bắt đầu nằm ở (-R, 0, 0) trong hệ local quay quanh Y.
        // Ta cần điểm bắt đầu đó trùng với gốc (0,0,0) của Group
        // => Dịch tâm group đi (+R, 0, 0)? Không, ta dịch Mesh.
        // Phức tạp tọa độ: 
        // Thử đặt tâm cong tại (0, 0, bendRadius) để khi vẽ cung nó bắt đầu từ (0,0,0)
        
        // Cách đơn giản nhất: Vẽ Tube bắt đầu từ (0,0,0) đi theo cung cong.
        // TorusGeometry tâm tại 0,0,0. Điểm (Radius + tubeR) nằm trên vòng ngoài.
        // Ta sẽ dịch chuyển Mesh sau khi xoay để điểm bắt đầu khớp (0,0,0).
        
        // Điều chỉnh: Tâm Torus tại (0, 0, bendRadius)
        // Khi đó cung tròn mặt trong (tại Z=0) sẽ tiếp xúc?
        // Ta đặt Tube sao cho tâm ống (tại tiết diện đầu) nằm tại 0,0,0
        // Điểm đầu của Torus (với start angle 0) nằm tại (R, 0, 0).
        // Ta muốn điểm đó về (0,0,0). => Dịch x = -R.
        // Sau đó xoay?
        
        // Thử nghiệm cấu hình này:
        // Xoay nằm ngang.
        // Dịch chuyển để đầu ống khớp vào input.
        tube.position.set(0, 0, this.bendRadius); 

        this.mesh.add(tube);
    }

    /**
     * 2. Nam châm (Magnet Pole Pieces)
     */
    private initMagnetPoles(): void {
        const gap = this.tubeRadius + 0.5; // Khoảng cách khe hở cho ống đi qua
        const thickness = 4; // Độ dày nam châm
        
        // Tạo group chung để transform theo Tube
        const poleGroup = new THREE.Group();

        // Tạo hình dạng 2D của nam châm (hình rẻ quạt cong theo ống)
        // Match với TorusGeometry: bắt đầu từ 0 đến this.angle
        const shape = new THREE.Shape();
        const outerR = this.bendRadius + this.tubeRadius + 2;
        const innerR = this.bendRadius - this.tubeRadius - 2;
        
        // Vẽ cung tròn từ 0 -> angle
        shape.absarc(0, 0, outerR, 0, this.angle, false);
        shape.lineTo(
            innerR * Math.cos(this.angle), 
            innerR * Math.sin(this.angle)
        );
        shape.absarc(0, 0, innerR, this.angle, 0, true);
        shape.lineTo(outerR, 0); // Về điểm bắt đầu (outerR, 0)

        const extrudeSettings = { depth: thickness, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // Vật liệu Nam châm
        const matN = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.6 }); // Bắc - Đỏ
        const matS = new THREE.MeshStandardMaterial({ color: 0x3333cc, roughness: 0.6 }); // Nam - Xanh

        // Cực Bắc (N) - Nằm phía trên (Z dương trong local Torus)
        const poleN = new THREE.Mesh(geometry, matN);
        poleN.position.set(0, 0, gap); 
        poleGroup.add(poleN);

        // Cực Nam (S) - Nằm phía dưới (Z âm)
        const poleS = new THREE.Mesh(geometry, matS);
        // Extrude đi theo hướng +Z, nên đặt tại -gap - thickness để mặt trên chạm -gap
        poleS.position.set(0, 0, -gap - thickness); 
        poleGroup.add(poleS);

        // Áp dụng transform giống hệt Tube
        poleGroup.rotation.x = Math.PI / 2; // Xoay nằm ngang
        poleGroup.rotation.z = -Math.PI / 2; // Xoay đầu vào
        poleGroup.position.set(0, 0, this.bendRadius);

        this.mesh.add(poleGroup);
    }

    private initFieldLines(): void {
        const lineCount = 8;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        // Tạo group cho đường sức
        const linesGroup = new THREE.Group();

        for(let i=0; i<lineCount; i++) {
            const t = (i / (lineCount - 1));
            const theta = t * this.angle; // Từ 0 -> angle
            const r = this.bendRadius;
            
            // Tọa độ trên cung tròn trong mặt phẳng XY (local Torus)
            const x = r * Math.cos(theta); 
            const y = r * Math.sin(theta);
            
            // Đường sức đi dọc theo trục Z local (từ cực nọ sang cực kia)
            const zTop = this.tubeRadius;
            const zBot = -this.tubeRadius;

            positions.push(x, y, zTop);
            positions.push(x, y, zBot);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffff00, 
            opacity: 0.3, 
            transparent: true 
        });
        const lines = new THREE.LineSegments(geometry, material);
        linesGroup.add(lines);

        // Áp dụng transform giống Tube
        linesGroup.rotation.x = Math.PI / 2;
        linesGroup.rotation.z = -Math.PI / 2;
        linesGroup.position.set(0, 0, this.bendRadius);

        this.mesh.add(linesGroup);
    }
}
