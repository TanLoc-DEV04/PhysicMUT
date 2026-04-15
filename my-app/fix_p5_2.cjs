const fs = require('fs');
const path = require('path');

function replaceAll(fPath, oldS, newS) {
    const full = path.join(__dirname, fPath);
    let c = fs.readFileSync(full, 'utf8');
    c = c.replace(new RegExp(oldS.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newS);
    fs.writeFileSync(full, c, 'utf8');
}

// Fix services imports in ChatInterface and others inside components/physicmut-bot and components/ai-generate
function fixDeepImports(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixDeepImports(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let c = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            if(c.includes("from '../../services/")) {
                c = c.replace(/from '\.\.\/\.\.\/services\//g, "from '../../../../../../services/");
                changed = true;
            }
            if(c.includes("from '../../../hooks/")) {
                // components/ai-generate was depth 2, src/hooks is depth 1 -> ../../hooks/
                // Now from ModelDetail/components/ai-generate (depth 5) -> ../../../../../hooks/
                c = c.replace(/from '\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../../../../../hooks/");
                c = c.replace(/from '\.\.\/\.\.\/hooks\//g, "from '../../../../../../hooks/"); // just in case
                changed = true;
            }

            if (changed) { fs.writeFileSync(fullPath, c, 'utf8'); console.log('fixed', fullPath); }
        }
    }
}
fixDeepImports(path.join(__dirname, 'src/pages/(public)/ModelDetail/components'));


// FIX MainModelDetail and Theory
const thP = 'src/pages/(public)/ModelDetail/Theory.tsx';
replaceAll(thP, "from '../../../components/ai-generate", "from './components/ai-generate");
replaceAll(thP, "from '../../../../components/ai-generate", "from './components/ai-generate");

const mnP = 'src/pages/(public)/ModelDetail/MainModelDetail.tsx';
replaceAll(mnP, "from '../../../components/physicmut-bot", "from './components/physicmut-bot");
replaceAll(mnP, "from '../../../../components/physicmut-bot", "from './components/physicmut-bot");

