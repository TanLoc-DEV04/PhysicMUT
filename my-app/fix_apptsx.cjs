const fs = require("fs");
const path = require("path");
const srcDir = path.join(__dirname, "src");

function manualReplace() {
    const appTsx = path.join(srcDir, "App.tsx");
    if (fs.existsSync(appTsx)) {
        let content = fs.readFileSync(appTsx, "utf8");
        content = content.replace(/pages\/\(public\)\/\(public\)\//g, 'pages/(public)/');
        content = content.replace(/pages\/\(admin\)\/\(admin\)\//g, 'pages/(admin)/');
        content = content.replace(/pages\/\(auth\)\/\(auth\)\//g, 'pages/(auth)/');
        
        content = content.replace(/import\s+(.*?)\s+from\s+['"]\.\/pages\/Home['"]/g, "import $1 from './pages/(public)/Home/Home'");
        content = content.replace(/import\s+(.*?)\s+from\s+['"]\.\/pages\/Auth\/LoginPage['"]/g, "import $1 from './pages/(auth)/Auth/LoginPage'");
        content = content.replace(/import\s+(.*?)\s+from\s+['"]\.\/pages\/Auth\/RegisterPage['"]/g, "import $1 from './pages/(auth)/Auth/RegisterPage'");
        
        fs.writeFileSync(appTsx, content);
    }
}
manualReplace();
