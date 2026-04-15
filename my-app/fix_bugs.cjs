const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function tryFixAllFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            tryFixAllFiles(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            // The main issue: pages/(admin)/Dashboard lost their connection to components/
            // e.g. from '../../../components/...' => from '../../../../components/...'
            // We ran the fix_relative.cjs but it only added `../` to ALL relative prefixes. 
            // Wait, we need to add `../` only if it navigated up to `src`!
            // Actually, an easier regex is just finding all `Cannot find module ...` errors and ignoring for now, or using a generic vite alias.
            
            // Wait, a lot of errors are `Cannot find module '../../core/cyclotron/cyclotronPhysics'`
            // from src\components\3d-models\Cyclotron\CyclotronGame.tsx.
            // CyclotronGame.tsx is in src\components\3d-models\Cyclotron\
            // So to reach src\core\cyclotron => `../../../core/cyclotron` (3 levels up, not 2).
            const oldCore = "../../core/";
            const newCore = "../../../core/";
            if (fullPath.includes("components") && content.includes(oldCore)) {
               content = content.split(oldCore).join(newCore);
               changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
            }
        }
    }
}
tryFixAllFiles(srcDir);
