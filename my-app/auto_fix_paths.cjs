const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function autoFixImports(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            autoFixImports(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;

            // Fix services imports that have too many relative paths
            if (content.match(/from '(\.\.\/)+services\/(.*?)'/g)) {
               content = content.replace(/from '(\.\.\/)+services\/(.*?)'/g, (match, p1, serviceName) => {
                    // compute correct depth to src
                    const depth = fullPath.split('src')[1].split(path.sep).length - 2;
                    let correctPrefix = '';
                    for (let i = 0; i < depth; i++) {
                        correctPrefix += '../';
                    }
                    if (correctPrefix === '') correctPrefix = './';
                    const newImport = `from '${correctPrefix}services/${serviceName}'`;
                    if (newImport !== match) {
                       changed = true;
                       return newImport;
                    }
                    return match;
               });
            }

            // Fix components imports
             if (content.match(/from '(\.\.\/)+components\/(.*?)'/g)) {
               content = content.replace(/from '(\.\.\/)+components\/(.*?)'/g, (match, p1, componentName) => {
                    const depth = fullPath.split('src')[1].split(path.sep).length - 2;
                    let correctPrefix = '';
                    for (let i = 0; i < depth; i++) {
                        correctPrefix += '../';
                    }
                    if (correctPrefix === '') correctPrefix = './';
                    const newImport = `from '${correctPrefix}components/${componentName}'`;
                    if (newImport !== match) {
                       changed = true;
                       return newImport;
                    }
                    return match;
               });
            }

             // Fix core imports
             if (content.match(/from '(\.\.\/)+core\/(.*?)'/g)) {
               content = content.replace(/from '(\.\.\/)+core\/(.*?)'/g, (match, p1, coreName) => {
                    const depth = fullPath.split('src')[1].split(path.sep).length - 2;
                    let correctPrefix = '';
                    for (let i = 0; i < depth; i++) {
                        correctPrefix += '../';
                    }
                    if (correctPrefix === '') correctPrefix = './';
                    const newImport = `from '${correctPrefix}core/${coreName}'`;
                    if (newImport !== match) {
                       changed = true;
                       return newImport;
                    }
                    return match;
               });
            }
            
            // Fix hooks imports
             if (content.match(/from '(\.\.\/)+hooks\/(.*?)'/g)) {
               content = content.replace(/from '(\.\.\/)+hooks\/(.*?)'/g, (match, p1, name) => {
                    const depth = fullPath.split('src')[1].split(path.sep).length - 2;
                    let correctPrefix = '';
                    for (let i = 0; i < depth; i++) {
                        correctPrefix += '../';
                    }
                    if (correctPrefix === '') correctPrefix = './';
                    const newImport = `from '${correctPrefix}hooks/${name}'`;
                    if (newImport !== match) {
                       changed = true;
                       return newImport;
                    }
                    return match;
               });
            }

            // Fix specific TS errors
            if (content.includes("from './cyclotronConstants.ts'")) {
               content = content.replace(/from '\.\/cyclotronConstants\.ts'/g, "from './cyclotronConstants'");
               changed = true;
            }

             if (content.includes("from '../../../Admin/RenderFormItem'")) {
               content = content.replace(/from '\.\.\/\.\.\/\.\.\/Admin\/RenderFormItem'/g, "from '../Admin/RenderFormItem'");
               changed = true;
            }


            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log(`Auto-fixed imports in ${fullPath}`);
            }
        }
    }
}
autoFixImports(srcDir);
