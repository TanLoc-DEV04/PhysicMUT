const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function findUsage(dir, targetPart) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            findUsage(fullPath, targetPart);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, "utf8");
            if (content.includes("components/" + targetPart)) {
                console.log(`Found ${targetPart} usage in: ${fullPath}`);
            }
        }
    }
}
console.log("--- 3d-models ---");
findUsage(srcDir, "3d-models");
console.log("--- ai-generate ---");
findUsage(srcDir, "ai-generate");
console.log("--- physicmut-bot ---");
findUsage(srcDir, "physicmut-bot");
