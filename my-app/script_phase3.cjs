const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');

function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Phase 3 setups
const coreDir = path.join(srcDir, 'core');
ensureDirSync(path.join(coreDir, 'cyclotron'));
ensureDirSync(path.join(coreDir, 'mass-spectrometry'));
ensureDirSync(path.join(coreDir, 'loudspeaker'));

// Logic files mapping
const logicMoves = [
  // Cyclotron
  { src: 'components/3d-models/Cyclotron/logic/cyclotronPhysics.ts', dest: 'core/cyclotron/cyclotronPhysics.ts' },
  { src: 'components/3d-models/Cyclotron/logic/flameLogic.ts', dest: 'core/cyclotron/flameLogic.ts' },
  { src: 'components/3d-models/Cyclotron/logic/gameState.ts', dest: 'core/cyclotron/gameState.ts' },
  
  // Mass Spectrometry (update with real filenames if they exist)
  { src: 'components/3d-models/MassSpectrometry/logic/massSpectrometryPhysics.ts', dest: 'core/mass-spectrometry/massSpectrometryPhysics.ts' },
  { src: 'components/3d-models/MassSpectrometry/logic/gameState.ts', dest: 'core/mass-spectrometry/gameState.ts' },

  // Loudspeaker
  { src: 'components/3d-models/Loudspeaker/logic/loudspeakerPhysics.ts', dest: 'core/loudspeaker/loudspeakerPhysics.ts' },
  { src: 'components/3d-models/Loudspeaker/logic/gameState.ts', dest: 'core/loudspeaker/gameState.ts' }
];

for (const move of logicMoves) {
  const srcPath = path.join(srcDir, move.src);
  const destPath = path.join(srcDir, move.dest);
  
  if (fs.existsSync(srcPath)) {
    fs.renameSync(srcPath, destPath);
    console.log(`Moved logic: ${move.src} -> ${move.dest}`);
  }
}
