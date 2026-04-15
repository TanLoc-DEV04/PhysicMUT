const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixFiles5(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles5(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            if (content.includes("from './../../../../core/cyclotron/cyclotronPhysics'")) {
                 content = content.replace(/from '\.\/\.\.\/\.\.\/\.\.\/\.\.\/core\/cyclotron\/cyclotronPhysics'/g, "from '../../../../core/cyclotron/cyclotronPhysics'");
                 changed = true;
            }
             if (content.includes("from './../../../../core/cyclotron/flameLogic'")) {
                 content = content.replace(/from '\.\/\.\.\/\.\.\/\.\.\/\.\.\/core\/cyclotron\/flameLogic'/g, "from '../../../../core/cyclotron/flameLogic'");
                 changed = true;
            }
             if (content.includes("from '../../../core/cyclotron/gameState'")) {
                 if(fullPath.includes('missionLogic.ts') && fullPath.includes('components')) {
                    content = content.replace(/from '\.\.\/\.\.\/\.\.\/core\/cyclotron\/gameState'/g, "from '../../../../core/cyclotron/gameState'");
                    changed = true;
                 }
             }

            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                 console.log(`Fixed depth in: ${fullPath}`);
            }
        }
    }
}
fixFiles5(srcDir);
