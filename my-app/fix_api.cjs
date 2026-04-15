const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/services');
fs.readdirSync(srcDir).forEach(f => {
    if (f.endsWith('.service.ts')) {
        const p = path.join(srcDir, f);
        let content = fs.readFileSync(p, 'utf8');
        if (content.includes("from './api'")) {
            content = content.replace(/from '\.\/api'/g, "from './api.service'");
            fs.writeFileSync(p, content, 'utf8');
            console.log(`Updated ${f}`);
        }
    }
});

const cycloFile = path.join(__dirname, 'src/components/3d-models/Cyclotron/CyclotronSimulation.tsx');
let cycloContent = fs.readFileSync(cycloFile, 'utf8');
cycloContent = cycloContent.replace(/from '..\/..\/..\/..\/core\/cyclotron\//g, "from '../../../core/cyclotron/");
cycloContent = cycloContent.replace(/from "..\/..\/..\/..\/core\/cyclotron\//g, "from \"../../../core/cyclotron/");
fs.writeFileSync(cycloFile, cycloContent, 'utf8');

