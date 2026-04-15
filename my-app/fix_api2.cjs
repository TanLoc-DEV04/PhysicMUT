const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/services');
fs.readdirSync(srcDir).forEach(f => {
    if (f.endsWith('.service.ts')) {
        const p = path.join(srcDir, f);
        let content = fs.readFileSync(p, 'utf8');
        let changed = false;
        if (content.includes("from './api'")) {
            content = content.replace(/from '\.\/api'/g, "from './api.service'");
            changed = true;
        }
        if (content.includes('from "./api"')) {
            content = content.replace(/from "\.\/api"/g, 'from "./api.service"');
            changed = true;
        }
        if (changed) fs.writeFileSync(p, content, 'utf8');
    }
});
console.log('Fixed quotes in api imports');
