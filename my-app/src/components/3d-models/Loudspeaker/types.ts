export interface AudioRange {
    min: number;
    max: number;
    name: string;
    description: string;
    icon: string;
}

export interface ComponentMetadata {
    name: string;
    formula?: string;
    description: string;
}

export const PART_INFO: Record<string, ComponentMetadata> = {
    'VoiceCoil': { 
        name: "Cuộn dây âm (Voice Coil)", 
        formula: "F = B \\cdot I \\cdot \\ell", 
        description: "Chịu lực từ F khi có dòng điện chạy qua, kéo màng loa di chuyển." 
    },
    'Magnet': { 
        name: "Nam châm vĩnh cửu", 
        formula: "\\vec{B} = const", 
        description: "Tạo từ trường đều trong khe từ để tương tác với cuộn dây." 
    },
    'Cone': { 
        name: "Màng loa (Diaphragm)", 
        formula: "f_{dao động} = f_{dòng điện}", 
        description: "Nén và giãn không khí để tạo ra sóng âm." 
    },
    'Spider': { 
        name: "Nhện loa (Suspension)", 
        formula: "F_{đh} = -k \\cdot x", 
        description: "Giữ cuộn dây đồng tâm và đưa hệ thống về vị trí cân bằng." 
    }
};

export const HEARING_RANGES: AudioRange[] = [
    { min: 0, max: 20, name: "Voi", icon: "🐘", description: "Nghe được hạ âm dưới 20Hz." },
    { min: 20, max: 20000, name: "Con người", icon: "🧍", description: "Ngưỡng nghe tiêu chuẩn." },
    { min: 67, max: 45000, name: "Chó", icon: "🐕", description: "Nhạy cảm với âm thanh tần số cao." },
    { min: 45, max: 64000, name: "Mèo", icon: "🐈", description: "Thính hơn chó ở dải cao." },
    { min: 1000, max: 100000, name: "Cá heo", icon: "🐬", description: "Sử dụng siêu âm để định vị." },
    { min: 1000, max: 160000, name: "Dơi", icon: "🦇", description: "Phát siêu âm để săn mồi." },
    { min: 1000, max: 300000, name: "Bướm đêm", icon: "🦋", description: "Nghe siêu âm cực cao để tránh dơi." }
];

export interface NotePreset {
    note: string;
    description: string;
    frequency: number;
    audioFile?: string;
}

export const NOTE_PRESETS: NotePreset[] = [
    { note: "C-1", frequency: 8.18, description: "Nốt đàn organ thấp nhất (Hạ âm)", audioFile: undefined },
    { note: "C0", frequency: 16.35, description: "Nốt thấp nhất của tuba/grand piano (Khó nghe)", audioFile: undefined },
    { note: "C1", frequency: 32.70, description: "Nốt thấp nhất trên đàn piano 88 nốt", audioFile: "assets/loudspeaker/Audio_Frequency_tone,_C1,_32.70hz.ogg" },
    { note: "C2", frequency: 65.41, description: "Nốt thấp nhất của cello", audioFile: "assets/loudspeaker/Audio_frequency_tone,_C2,_65.41hz.ogg" },
    { note: "C3", frequency: 130.81, description: "Nốt thấp nhất của viola, mandola", audioFile: "assets/loudspeaker/Audio_frequency_tone,_C3,_130.81hz.ogg" },
    { note: "C4", frequency: 261.63, description: "Nốt đô trung (Middle C)", audioFile: "assets/loudspeaker/Audio_Frequency_tone,_Middle_C,_C4,_261.63hz.ogg" },
    { note: "C5", frequency: 523.25, description: "Nốt đô ở giữa khóa treble", audioFile: "assets/loudspeaker/Audio_Frequency_tone,_C5,_523.25hz.ogg" },
    { note: "C6", frequency: 1046.50, description: "Nốt cao nhất giọng nữ (Soprano)", audioFile: "assets/loudspeaker/Audio_Frequency_tone,_C6,_1046.50hz.ogg" },
    { note: "C7", frequency: 2093.00, description: "Nốt cao nhất của sáo", audioFile: "assets/loudspeaker/Audio_Frequency_tone,_C7,_2093hz.ogg" },
    { note: "C8", frequency: 4186.00, description: "Nốt cao nhất trên đàn piano 88 nốt", audioFile: "assets/loudspeaker/Audio_frequency_tone,_C8,_4186hz.ogg" },
    { note: "C9", frequency: 8372.00, description: "Tần số rất cao, chói tai", audioFile: "assets/loudspeaker/Audio_frequency_tone,_C9,_8372hz.ogg" },
    { note: "C10", frequency: 16744.00, description: "Tiếng rít của TV CRT (Gần siêu âm)", audioFile: "assets/loudspeaker/Audio_frequency_tone,_C10,_16744hz.ogg" }
];

export interface MediumProps {
    name: string;
    speed: number;
    damping: number;
    color: number;
    canPropagate: boolean;
}

export const MEDIUMS: Record<string, MediumProps> = {
    'Air': { name: 'Không khí (Air)', speed: 1.0, damping: 0.99, color: 0x88ccff, canPropagate: true },
    'Water': { name: 'Nước (Water)', speed: 4.0, damping: 0.995, color: 0x0044ff, canPropagate: true },
    'Vacuum': { name: 'Chân không (Vacuum)', speed: 0, damping: 0, color: 0x000000, canPropagate: false }
};
