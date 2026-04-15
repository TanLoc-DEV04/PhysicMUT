const fs = require('fs');
const path = require('path');

const log = fs.readFileSync('mybuild_log.txt', 'utf16le');
console.log(log.substring(0, 1000));
const lines = log.split(/\r?\n/);
let changes = 0;

for (const line of lines) {
    const match = line.match(/^(.+?)\(\d+,\d+\): error TS2307: Cannot find module '(.+?)'/);
    if (match) {
        const fileRel = match[1];
        const targetModule = match[2];
        const fullPath = path.join(__dirname, fileRel);
        
        if (fs.existsSync(fullPath)) {
             let content = fs.readFileSync(fullPath, "utf8");
             // Example targetModule: '../../../../contexts/AuthContext'
             // Actual location is src/contexts/AuthContext.ts
             // Figure out correct relative path from fullPath to src
             
             let correctMod = targetModule;
             const depth = fileRel.split('/').length - 2;
             
             // If we need AuthContext, it's typically in src/contexts/AuthContext
             if (targetModule.includes('AuthContext')) {
                 correctMod = '../'.repeat(depth) + 'contexts/AuthContext';
             }
             // If we need api.service
              if (targetModule.includes('api.service')) {
                 correctMod = '../'.repeat(depth) + 'services/api.service';
             }
             // If we need models.service
             if (targetModule.includes('models.service')) {
                 correctMod = '../'.repeat(depth) + 'services/models.service';
             }
              // If we need model.ts or other types
             if (targetModule.includes('model') && targetModule.includes('types/')) {
                 correctMod = '../'.repeat(depth) + 'types/model';
             }
             // If we need RenderFormItem
             if (targetModule.includes('RenderFormItem') && targetModule.includes('Admin/')) {
                 // from any Dashboard page up to Dashboard and then down to Admin/RenderFormItem
                 correctMod = '../Admin/RenderFormItem'; // wait, what if from Roles? Wait depth-3 go to Dashboard.
                 // Depth from Dashboard is 3. Dashboard/Roles/AddRole.tsx (depth 4)
                 // to Dashboard/Admin/RenderFormItem
                 // from Roles goes to Admin => ../Admin/
                 correctMod = '../Admin/RenderFormItem';
             }

             // Apply simple static rules:
             // Find the actual file in src
             const findFilePaths = (dir, name, type) => {
                 let arr = [];
                 fs.readdirSync(dir, {withFileTypes: true}).forEach(dirent => {
                     const res = path.resolve(dir, dirent.name);
                     if (dirent.isDirectory() && !res.includes('node_modules')) {
                         arr = arr.concat(findFilePaths(res, name, type));
                     } else if (res.endsWith('.ts') || res.endsWith('.tsx')) {
                         if (dirent.name.toLowerCase().includes(name.toLowerCase())) {
                            arr.push(res);
                         }
                     }
                 });
                 return arr;
             };
             
             // If I don't write complex search, I'll just replace with correctMod:
             // Replace ALL occurrences of targetModule in `import ... from 'targetModule'`
             if (correctMod !== targetModule) {
                 const quoteRegex = new RegExp(`from ['"]${targetModule.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}['"]`, 'g');
                 content = content.replace(quoteRegex, `from '${correctMod}'`);
                 fs.writeFileSync(fullPath, content, "utf8");
                 console.log(`Replaced ${targetModule} with ${correctMod} in ${fileRel}`);
                 changes++;
             }
        }
    }
}
if (changes === 0) console.log("No specific automated replacements made.");
