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

            // Now fixing Cyclotron physics imports
            const oldCore = "../../core/";
            const newCore = "../../../core/";
            if (fullPath.includes("components") && content.includes(oldCore)) {
               content = content.split(oldCore).join(newCore);
               changed = true;
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log("Fixed core depth in: " + fullPath);
            }
        }
    }
}
tryFixAllFiles(srcDir);
