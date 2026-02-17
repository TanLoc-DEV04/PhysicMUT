import * as THREE from 'three';

// Interface lưu trữ dữ liệu phổ
interface SpectrumData {
    mass: number;
    count: number;
    barMesh?: THREE.Mesh; 
}

export class DetectionSystem {
    public mesh: THREE.Group;
    
    private detectorCup: THREE.Group | null = null;
    private spectrumBars: Map<string, SpectrumData> = new Map();
    
    constructor(
        position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
    ) {
        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);
        
        this.initFaradayCup();
        this.initElectronics();
        this.initSpectrumDisplay();
    }

    /**
     * 1. Bộ phát hiện - Dạng Cốc Faraday (Faraday Cup) - Cửa E (Màu xanh lá)
     */
    private initFaradayCup(): void {
        this.detectorCup = new THREE.Group();

        // Tạo hình dáng cốc
        const points = [];
        points.push(new THREE.Vector2(0, 0));       // Tâm đáy trong
        points.push(new THREE.Vector2(0.5, 0));    // Bán kính đáy trong
        points.push(new THREE.Vector2(0.5, 1.5));  // Thành trong cao lên
        points.push(new THREE.Vector2(0.8, 1.5));  // Độ dày thành
        points.push(new THREE.Vector2(0.8, -0.2)); // Thành ngoài sâu xuống
        points.push(new THREE.Vector2(0, -0.2));   // Đáy ngoài

        const cupGeo = new THREE.LatheGeometry(points, 32);
        // Màu xanh lá theo yêu cầu Cửa E (Detector)
        const cupMat = new THREE.MeshStandardMaterial({ 
            color: 0x00aa00, // Green
            metalness: 0.5, 
            roughness: 0.4 
        });
        
        const cup = new THREE.Mesh(cupGeo, cupMat);
        
        // Xoay cốc để miệng hướng về luồng tới (từ Mass Analyzer)
        // Mass Analyzer ra khỏi ống cong đang đi theo hướng -Z (hoặc +Z tùy góc)
        // Giả sử ống cong 90 độ, vào X+, ra Z+.
        // Detector cần quay miệng về phía -Z để đón ion.
        cup.rotation.x = -Math.PI / 2; 
        
        this.detectorCup.add(cup);
        this.mesh.add(this.detectorCup);
    }

    /**
     * 2. Bộ khuếch đại (Amplifier) & 3. Bộ ghi (Recorder)
     */
    private initElectronics(): void {
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        
        // Amplifier
        const ampGeo = new THREE.BoxGeometry(1.5, 1, 1);
        const amplifier = new THREE.Mesh(ampGeo, boxMat);
        amplifier.position.set(2, 0, 0);
        this.mesh.add(amplifier);
        
        // Recorder
        const recGeo = new THREE.BoxGeometry(3, 2, 0.5);
        const recorder = new THREE.Mesh(recGeo, new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
        recorder.position.set(5, 0.5, 0);
        this.mesh.add(recorder);
        
        // Dây nối
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(3.5, 0.5, 0)
        ]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x000000 }));
        this.mesh.add(line);
    }

    /**
     * Màn hình hiển thị Phổ Khối
     */
    private initSpectrumDisplay(): void {
        // Tạo một Group con gắn vào Recorder
        const displayGroup = new THREE.Group();
        displayGroup.position.set(5, 0.5, 0.3); 
        this.mesh.add(displayGroup);

        this.createBar("Ion-Light", -0.8, 0x00ff00, displayGroup);
        this.createBar("Ion-Medium", -0.2, 0xffff00, displayGroup);
        this.createBar("Ion-Heavy", 0.4, 0xff0000, displayGroup);
    }

    private createBar(name: string, xPos: number, color: number, parent: THREE.Group) {
        const width = 0.4;
        const geometry = new THREE.BoxGeometry(width, 1, 0.1);
        geometry.translate(0, 0.5, 0); 

        const material = new THREE.MeshBasicMaterial({ color: color });
        const bar = new THREE.Mesh(geometry, material);
        
        bar.position.set(xPos, -0.75, 0);
        bar.scale.set(1, 0.1, 1); 
        
        parent.add(bar);
        this.spectrumBars.set(name, { mass: 0, count: 0, barMesh: bar });
    }

    public updateBar(ionType: string): void {
        const data = this.spectrumBars.get(ionType);
        if (data && data.barMesh) {
            data.count++;
            const newScale = Math.min(1.5, data.count * 0.1); 
            data.barMesh.scale.y = Math.max(0.1, newScale);
        }
    }
}
