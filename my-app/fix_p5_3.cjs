const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/(public)/ModelDetail/components/physicmut-bot/ChatInterface.tsx');
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/services\//g, "from '../../../../../services/");
fs.writeFileSync(file, c, 'utf8');
