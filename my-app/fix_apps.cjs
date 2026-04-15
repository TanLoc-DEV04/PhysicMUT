const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function replaceImports(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceImports(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            // src/App.tsx imports: pages/Dashboard/MainDashboard -> pages/(admin)/Dashboard/MainDashboard
            // src/App.tsx imports: pages/Home/Home -> pages/(public)/Home/Home
            content = content.replace(/pages\/Dashboard/g, 'pages/(admin)/Dashboard')
                             .replace(/pages\/Auth/g, 'pages/(auth)/Auth')
                             .replace(/pages\/Home\/Home/g, 'pages/(public)/Home/Home')
                             .replace(/pages\/Models\/ModelList/g, 'pages/(public)/Models/ModelList')
                             .replace(/pages\/ModelDetail\/MainModelDetail/g, 'pages/(public)/ModelDetail/MainModelDetail')
                             .replace(/pages\/Cyclotron/g, 'pages/(public)/Cyclotron');

            // Now components referencing logic in core
            content = content.replace(/logic\/cyclotronPhysics/g, '../../core/cyclotron/cyclotronPhysics');
            content = content.replace(/logic\/flameLogic/g, '../../core/cyclotron/flameLogic');
            content = content.replace(/logic\/gameState/g, '../../core/cyclotron/gameState');

            if (content !== fs.readFileSync(fullPath, "utf8")) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log("Fixed main imports in: " + fullPath);
            }
        }
    }
}
replaceImports(srcDir);
