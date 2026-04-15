const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixCycloDirs(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixCycloDirs(fullPath);
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
                if(fullPath.includes('src\\core\\cyclotron')) {
                    content = content.replace(/from '\.\/cyclotronConstants'/g, "from './cyclotronConstants.ts'");
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
            }
        }
    }
}
fixCycloDirs(srcDir);
