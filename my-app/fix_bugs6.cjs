const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixFiles6(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles6(fullPath);
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
             if (content.includes("from './cyclotronConstants'")) {
                 if(fullPath.includes('cyclotronPhysics.ts') || fullPath.includes('gameState.ts')) {
                     content = content.replace(/from '\.\/cyclotronConstants'/g, "from '../../../../src/core/cyclotron/cyclotronConstants'");
                     changed = true;
                 }
             }
              if (content.includes("from '../services/api.service'")) {
                  content = content.replace(/from '\.\.\/services\/api\.service'/g, "from '../../services/api.service'");
                  changed = true;
              }
               if (content.includes("from '../../../../../components/shared/")) {
                  content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components\/shared\//g, "from '../../../../components/shared/");
                  changed = true;
              }


            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                 console.log(`Fixed in: ${fullPath}`);
            }
        }
    }
}
fixFiles6(srcDir);
