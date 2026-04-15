const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixAll(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixAll(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            // Fix services imports correctly
            if(content.includes('from "../../../services/api"')) {
                content = content.replace(/from "\.\.\/\.\.\/\.\.\/services\/api"/g, 'from "../../../services/api.service"');
                changed = true;
            }
            if(content.includes('from "../../services/api"')) {
                content = content.replace(/from "\.\.\/\.\.\/services\/api"/g, 'from "../../services/api.service"');
                changed = true;
            }
            if(content.includes('from "../services/api"')) {
                content = content.replace(/from "\.\.\/services\/api"/g, 'from "../services/api.service"');
                changed = true;
            }
            if(content.includes('from "services/api"')) {
                content = content.replace(/from "services\/api"/g, 'from "services/api.service"');
                changed = true;
            }
            
            // Revert incorrectly renamed api.service.service -> api.service
            if(content.includes('api.service.service')) {
                content = content.replace(/api\.service\.service/g, 'api.service');
                changed = true;
            }
             if(content.includes('auth.service.service')) {
                content = content.replace(/auth\.service\.service/g, 'auth.service');
                changed = true;
            }
             if(content.includes('models.service.service')) {
                content = content.replace(/models\.service\.service/g, 'models.service');
                changed = true;
            }
             if(content.includes('users.service.service')) {
                content = content.replace(/users\.service\.service/g, 'users.service');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log(`Fixed api service imports in: ${fullPath}`);
            }
        }
    }
}
fixAll(srcDir);
