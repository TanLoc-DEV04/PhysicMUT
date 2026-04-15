const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixCyclotronPath(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixCyclotronPath(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            if (content.includes("from './../../../../core/cyclotron/")) {
                content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/core\/cyclotron\//g, "from '../../../core/cyclotron/");
                changed = true;
            }

            if (content.includes("from './../../../../../core/cyclotron/")) {
                 content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/core\/cyclotron\//g, "from '../../../../core/cyclotron/");
                 changed = true;
            }

            if (content.includes("from './gameState'")) {
               if(fullPath.includes('missionLogic.ts') && fullPath.includes('components')) {
                   content = content.replace(/from '\.\/gameState'/g, "from '../../../../core/cyclotron/gameState'");
                   changed = true;
               }
            }


            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log(`Fixed cyclotron path in: ${fullPath}`);
            }
        }
    }
}
fixCyclotronPath(srcDir);
