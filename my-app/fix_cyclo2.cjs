const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixCyclotronPath2(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixCyclotronPath2(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            if (content.includes("from './cyclotronConstants'")) {
               if(fullPath.includes('core')) {
                   // Fix self-imports if they are bad
               }
            }
            if (content.includes("from '../../../core/cyclotron/")) {
                content = content.replace(/from '\.\.\/\.\.\/\.\.\/core\/cyclotron\//g, "from '../../../../core/cyclotron/");
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log(`Fixed path in: ${fullPath}`);
            }
        }
    }
}
fixCyclotronPath2(srcDir);
