import GUI from 'lil-gui'; 
import type { SimulationParams } from './Types';
import { ISOTOPE_PRESETS } from './Types';

export class LabController {
    public params: SimulationParams;
    private gui: GUI;
    
    // Callbacks để giao tiếp với Scene chính
    private onUpdatePhysics: () => void;
    private onUpdateVisuals: () => void;
    private updateCalculations: () => void = () => {};

    constructor(
        container: HTMLElement,
        onUpdatePhysics: () => void, 
        onUpdateVisuals: () => void
    ) {
        this.onUpdatePhysics = onUpdatePhysics;
        this.onUpdateVisuals = onUpdateVisuals;

        // Giá trị mặc định
        this.params = {
            isRunning: true,
            simulationSpeed: 1.0,
            isotope: 'C-12',
            customMass: 12,
            customCharge: 1,
            particleSkin: 'Glow',
            heaterTemp: 150,
            electronEnergy: 70,
            voltage: 2000, // 2000 V
            magneticField: 0.5, // 0.5 T
            housingOpacity: 0.3,
            showFieldLines: false,
            showForces: false
        };

        this.gui = new GUI({ container, title: '🔬 MS Control Center', width: 320 });
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.top = '10px';
        this.gui.domElement.style.right = '10px';

        // Inject Custom Styles for lil-gui (Force Dark Theme)
        const styleId = 'ms-gui-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .lil-gui { 
                    --width: 350px;
                    --name-width: 50%;
                    --background-color: #1f1f1f;
                    --text-color: #eaeaea;
                    --title-background-color: #111;
                    --widget-color: #444444; /* Darker widget bg */
                    --hover-color: #0088ff; /* Blue hover/select */
                    --focus-color: #646464;
                    --number-color: #2cc9ff; 
                    --string-color: #a2db3c;
                    font-size: 15px !important;
                }
                .lil-gui .title { font-size: 17px !important; font-weight: bold; padding: 8px; }
                .lil-gui button { font-size: 15px !important; height: 32px; }
                .lil-gui .controller { padding-top: 4px; padding-bottom: 4px; }
            `;
            document.head.appendChild(style);
        }

        this.initGUI();
    }

    private initGUI(): void {
        // --- GROUP 1: SYSTEM ---
        const sysFolder = this.gui.addFolder('⚙️ System Control');
        sysFolder.add(this.params, 'isRunning').name('Power On/Off');
        sysFolder.add(this.params, 'simulationSpeed', 0.1, 5.0).name('Time Scale');
        sysFolder.add({ reset: () => location.reload() }, 'reset').name('⚠️ Emergency Reset');

        // --- GROUP 2: SAMPLE & PARTICLES ---
        const sampleFolder = this.gui.addFolder('🧪 Sample Properties');
        
        // Tùy chỉnh (Cho phép nhập số lẻ để học về độ phân giải khối)
        sampleFolder.add(this.params, 'customMass', 1, 100).name('Mass (amu)').listen();
        sampleFolder.add(this.params, 'customCharge', 1, 3, 1).name('Charge (q)').listen();

        // Chọn Đồng vị
        // Chọn Đồng vị
        sampleFolder.add(this.params, 'isotope', Object.keys(ISOTOPE_PRESETS))
            .name('Isotope Select')
            .onChange((val: string) => {
                // Tự động điền thông số khi chọn Preset
                if (val !== 'Mix') {
                    const data = ISOTOPE_PRESETS[val];
                    this.params.customMass = data.mass;
                    this.params.customCharge = data.charge;
                }
                // Cập nhật ngược lại UI của các slider bên dưới
                // massCtrl.updateDisplay(); // .listen() handles this
                // chargeCtrl.updateDisplay();
                this.updateCalculations();
            });


        // Particle Skins (Hiệu ứng thị giác)
        sampleFolder.add(this.params, 'particleSkin', ['Standard', 'Glow', 'Metallic', 'Ghost'])
            .name('Ion Appearance')
            .onChange(() => this.onUpdateVisuals());

        // --- GROUP 3: MACHINE PARAMETERS (Các cửa ải) ---
        const machFolder = this.gui.addFolder('⚡ Instrument Settings');
        
        // 1. Vaporization (A -> B)
        machFolder.add(this.params, 'heaterTemp', 25, 500).name('Heater Temp (°C)')
            .onChange(() => {
                // Logic: Nhiệt độ thấp -> Mẫu di chuyển chậm/ngưng tụ
            });

        // 2. Ionization (B -> C)
        machFolder.add(this.params, 'electronEnergy', 0, 100).name('Electron Beam (eV)')
            .onChange(() => {
                // Logic: < 10eV -> Không ion hóa được (hạt không đổi màu/không bị gia tốc)
            });

        // 3. Acceleration (C -> D)
        machFolder.add(this.params, 'voltage', 0, 5000).name('Accel Voltage U (V)')
            .onChange(() => this.updateCalculations());

        // 4. Analyzer (D -> E)
        machFolder.add(this.params, 'magneticField', 0.1, 2.0).name('Magnetic Field B (T)')
            .onChange(() => this.updateCalculations());

        // --- GROUP 4: REAL-TIME ANALYSIS (Công thức tính) ---
        const dataFolder = this.gui.addFolder('📊 Physics Monitor');
        
        // Hiển thị công thức (dạng text dummy, giá trị sẽ được update)
        const calcData = {
            velocity: 0,
            radius: 0
        };
        
        // Thêm controllers ở chế độ disable (chỉ để xem)
        dataFolder.add(calcData, 'velocity').name('v (km/s)').disable().listen();
        dataFolder.add(calcData, 'radius').name('Radius R (cm)').disable().listen();
        
        // Hàm cập nhật số liệu thời gian thực
        this.updateCalculations = () => {
            // v = sqrt(2qU/m)
            // Lưu ý đổi đơn vị: 1 amu = 1.66e-27 kg, 1 eV = 1.6e-19 J
            // Để đơn giản mô phỏng, dùng hệ số tỷ lệ K_sim
            const K_sim_v = 10; 
            const v = Math.sqrt(2 * this.params.customCharge * this.params.voltage / this.params.customMass) * K_sim_v;
            
            // R = mv/qB
            const R = (this.params.customMass * v) / (this.params.customCharge * this.params.magneticField);
            
            calcData.velocity = parseFloat(v.toFixed(2));
            calcData.radius = parseFloat(R.toFixed(2));
            
            this.onUpdatePhysics(); // Báo cho hệ thống 3D cập nhật quỹ đạo
        };

        // Gọi tính toán lần đầu
        this.updateCalculations();

        // --- GROUP 5: VISUALS ---
        const visFolder = this.gui.addFolder('👁️ X-Ray Mode');
        visFolder.add(this.params, 'housingOpacity', 0, 1).name('Case Opacity')
            .onChange(() => this.onUpdateVisuals());
        visFolder.add(this.params, 'showFieldLines').name('Show B-Field Lines')
            .onChange(() => this.onUpdateVisuals());
    }
    
    public destroy() {
        this.gui.destroy();
    }
}
