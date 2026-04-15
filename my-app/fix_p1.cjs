const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    for (const [oldStr, newStr] of replacements) {
        if (content.includes(oldStr)) {
            content = content.replace(new RegExp(oldStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newStr);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

replaceInFile('src/components/3d-models/Cyclotron/CyclotronSimulation.tsx', [
    [`from "./logic/cyclotronConstants"`, `from "../../../../core/cyclotron/cyclotronConstants"`],
    [`from "./../../../../core/cyclotron/cyclotronPhysics"`, `from "../../../../core/cyclotron/cyclotronPhysics"`],
    [`from "./../../../../core/cyclotron/flameLogic"`, `from "../../../../core/cyclotron/flameLogic"`]
]);

replaceInFile('src/components/3d-models/Cyclotron/logic/missionLogic.ts', [
    [`from './cyclotronConstants'`, `from '../../../../core/cyclotron/cyclotronConstants'`]
]);

