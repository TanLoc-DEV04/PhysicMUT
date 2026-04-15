const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function fixFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            // Fix broken service imports since Phase 2 Services moved
            if (content.match(/from ['"](\.\.\/)*services\/(.*?)['"]/)) {
                content = content.replace(/from ['"](\.\.\/)*services\/(.*?)['"]/g, (match, p1, serviceName) => {
                    const cleanName = serviceName.replace('Service', '').replace('.service', '');
                    const newService = cleanName + '.service';
                    
                    if (serviceName !== newService && !serviceName.endsWith('.service')) {
                        console.log(`Rewriting ${serviceName} to ${newService} in ${fullPath}`);
                        return `from '${p1 || ""}services/${newService}'`;
                    }
                    return match;
                });
                changed = true;
            }
            
            // Fix import paths inside core
            if (fullPath.includes('core')) {
                if(content.includes('from "../../../types/')) {
                    content = content.replace(/from "\.\.\/\.\.\/\.\.\/types\//g, 'from "../../types/');
                    changed = true;
                }
                if(content.includes('from "../../types/')) {
                    // check depth
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
            }
        }
    }
}
fixFiles(srcDir);
