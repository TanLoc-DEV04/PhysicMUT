const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'src/pages/(public)/Models/ModelList.tsx');
let content = fs.readFileSync(p, 'utf8');

content = content.replace("from '../../../../components/", "from '../../../components/");
content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/components\//g, "from '../../../components/");
content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/data\//g, "from '../../../data/");
content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/types\//g, "from '../../../types/");

fs.writeFileSync(p, content, 'utf8');
