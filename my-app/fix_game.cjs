const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/3d-models/Cyclotron/CyclotronGame.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix import
content = content.replace("from './logic/cyclotronConstants'", "from '../../../core/cyclotron/cyclotronConstants'");

// Fix implicitly any types 's'
content = content.replace(/s =>/g, "(s: any) =>");
content = content.replace(/\(s\) =>/g, "(s: any) =>");
content = content.replace(/\(b\)/g, "(b: any)");
content = content.replace(/b =>/g, "(b: any) =>");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CyclotronGame.tsx');
