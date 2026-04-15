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

            // Fix quotes: allow both ' and "
            const regexes = [
               { regex: /from ['"](\.\.\/)+services\/(.*?)['"]/g, type: 'services' },
               { regex: /from ['"](\.\.\/)+components\/(.*?)['"]/g, type: 'components' },
               { regex: /from ['"](\.\.\/)+core\/(.*?)['"]/g, type: 'core' },
               { regex: /from ['"](\.\.\/)+hooks\/(.*?)['"]/g, type: 'hooks' }
            ];

            regexes.forEach(({regex, type}) => {
                if (content.match(regex)) {
                   content = content.replace(regex, (match, p1, name) => {
                        const depth = fullPath.split('src')[1].split(path.sep).length - 2;
                        let correctPrefix = '';
                        for (let i = 0; i < depth; i++) {
                            correctPrefix += '../';
                        }
                        if (correctPrefix === '') correctPrefix = './';
                        const originalQuote = match.includes('"') ? '"' : "'";
                        const newImport = `from ${originalQuote}${correctPrefix}${type}/${name}${originalQuote}`;
                        if (newImport !== match) {
                           changed = true;
                           return newImport;
                        }
                        return match;
                   });
                }
            });

            // Fix Cross-Dashboard cross-imports which are breaking!
            // Example: from '../../../3DModels/...' inside 'Dashboard/Examples/...'
            // Actually `../../../3DModels/...` is wrong.
            // From Dashboard/Examples (depth 3), to reach Dashboard/3DModels is `../3DModels`
            const crossRegex = /from ['"](\.\.\/)+3DModels\/(.*?)['"]/g;
            if (content.match(crossRegex)) {
                content = content.replace(crossRegex, (match, p1, name) => {
                   const originalQuote = match.includes('"') ? '"' : "'";
                   // If we are in Dashboard/Something, go up to Dashboard is `../`
                   // Assuming all are in `pages/(admin)/Dashboard/Xxx`
                   const newImport = `from ${originalQuote}../3DModels/${name}${originalQuote}`;
                   if (newImport !== match) { changed = true; return newImport; }
                   return match;
                });
            }

            // Fix specific TS errors
            if (content.includes("from './cyclotronConstants.ts'")) {
               content = content.replace(/from '\.\/cyclotronConstants\.ts'/g, "from './cyclotronConstants'");
               changed = true;
            }
             if (content.includes("from \"./cyclotronConstants.ts\"")) {
               content = content.replace(/from "\.\/cyclotronConstants\.ts"/g, "from \"./cyclotronConstants\"");
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
