import GUI from 'lil-gui'; 
import type { SimulationParams } from './Types';
import { ISOTOPE_PRESETS } from './Types';
import { renderToString } from 'react-dom/server';
import React from 'react';
import {
    SettingOutlined,
    ExperimentOutlined,
    ThunderboltOutlined,
    BarChartOutlined,
    EyeOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    RocketOutlined,
} from '@ant-design/icons';

export class LabController {
    public params: SimulationParams;
    private gui: GUI;
    
    // Callbacks để giao tiếp với Scene chính
    private onUpdatePhysics: () => void;
    private onUpdateVisuals: () => void;
    public updateCalculations: () => void = () => {};

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
            showForces: false,
            // Game fields (updated each frame by MassSpectrometerSimulation)
            gameMode:    'free',
            bin1TargetR: 12.05,  // C-12 default R at B=0.5, U=2000
            bin2TargetR: 13.01,  // C-14 default R at B=0.5, U=2000
        };

        this.gui = new GUI({ container, title: '🔬 MS Control Center', width: 320 });
        this.gui.$title.innerHTML = `${renderToString(<RocketOutlined style={{ marginRight: 8, color: '#fca5a5' }} />)} MS Control Center`;
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
                .lil-gui select { background: #111111 !important; color: #eaeaea !important; }
            `;
            document.head.appendChild(style);
        }

        this.initGUI();
    }

    private initGUI(): void {
        const addIcon = (item: any, icon: React.ReactElement, text: string) => {
            const html = `${renderToString(icon)} ${text}`;
            if (item.$title) item.$title.innerHTML = html;
            else if (item.$name) item.$name.innerHTML = html;
        };

        // --- GROUP 1: SYSTEM ---
        const sysFolder = this.gui.addFolder('System Control');
        addIcon(sysFolder, <SettingOutlined style={{ marginRight: 6, color: '#94a3b8' }} />, 'System Control');
        const playCtrl = sysFolder.add(this.params, 'isRunning').name('Power On/Off').listen();
        addIcon(playCtrl, <PlayCircleOutlined style={{ marginRight: 6, color: '#22c55e' }} />, 'Power On/Off');
        sysFolder.add(this.params, 'simulationSpeed', 0.1, 5.0).name('Time Scale').listen();
        const resetCtrl = sysFolder.add({ reset: () => location.reload() }, 'reset').name('Emergency Reset');
        addIcon(resetCtrl, <ReloadOutlined style={{ marginRight: 6, color: '#ef4444' }} />, 'Emergency Reset');

        // --- GROUP 2: SAMPLE & PARTICLES ---
        const sampleFolder = this.gui.addFolder('Sample Properties');
        addIcon(sampleFolder, <ExperimentOutlined style={{ marginRight: 6, color: '#10b981' }} />, 'Sample Properties');
        
        // Tùy chỉnh (Cho phép nhập số lẻ để học về độ phân giải khối)
        sampleFolder.add(this.params, 'customMass', 1, 100).name('Mass (amu)').listen();
        sampleFolder.add(this.params, 'customCharge', 1, 3, 1).name('Charge (q)').listen();

        // Chọn Đồng vị
        // Chọn Đồng vị
        sampleFolder.add(this.params, 'isotope', Object.keys(ISOTOPE_PRESETS))
            .name('Isotope Select').listen()
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
            .name('Ion Appearance').listen()
            .onChange(() => this.onUpdateVisuals());

        // --- GROUP 3: MACHINE PARAMETERS (Các cửa ải) ---
        const machFolder = this.gui.addFolder('Instrument Settings');
        addIcon(machFolder, <ThunderboltOutlined style={{ marginRight: 6, color: '#f59e0b' }} />, 'Instrument Settings');
        
        // 1. Vaporization (A -> B)
        machFolder.add(this.params, 'heaterTemp', 25, 500).name('Heater Temp (°C)').listen()
            .onChange(() => {
                // Logic: Nhiệt độ thấp -> Mẫu di chuyển chậm/ngưng tụ
            });

        // 2. Ionization (B -> C)
        machFolder.add(this.params, 'electronEnergy', 0, 100).name('Electron Beam (eV)').listen()
            .onChange(() => {
                // Logic: < 10eV -> Không ion hóa được (hạt không đổi màu/không bị gia tốc)
            });

        // 3. Acceleration (C -> D)
        machFolder.add(this.params, 'voltage', 0, 5000).name('Accel Voltage U (V)').listen()
            .onChange(() => this.updateCalculations());

        // 4. Analyzer (D -> E)
        machFolder.add(this.params, 'magneticField', 0.1, 2.0).name('Magnetic Field B (T)').listen()
            .onChange(() => this.updateCalculations());

        // --- GROUP 4: REAL-TIME ANALYSIS (Công thức tính) ---
        const dataFolder = this.gui.addFolder('Physics Monitor');
        addIcon(dataFolder, <BarChartOutlined style={{ marginRight: 6, color: '#60a5fa' }} />, 'Physics Monitor');
        
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
        const visFolder = this.gui.addFolder('X-Ray Mode');
        addIcon(visFolder, <EyeOutlined style={{ marginRight: 6, color: '#8b5cf6' }} />, 'X-Ray Mode');
        visFolder.add(this.params, 'housingOpacity', 0, 1).name('Case Opacity').listen()
            .onChange(() => this.onUpdateVisuals());
        visFolder.add(this.params, 'showFieldLines').name('Show B-Field Lines').listen()
            .onChange(() => this.onUpdateVisuals());
    }
    
    public destroy() {
        this.gui.destroy();
    }
}
