const fs = require('fs');
const path = require('path');

const thP = path.join(__dirname, 'src/pages/(public)/ModelDetail/Theory.tsx');
let theoryObj = fs.readFileSync(thP, 'utf8');
theoryObj = theoryObj.replace("from '../../../../components/ai-generate", "from './components/ai-generate");
fs.writeFileSync(thP, theoryObj, 'utf8');

const mnP = path.join(__dirname, 'src/pages/(public)/ModelDetail/MainModelDetail.tsx');
let mainObj = fs.readFileSync(mnP, 'utf8');
mainObj = mainObj.replace("from '../../../../components/physicmut-bot", "from './components/physicmut-bot");
fs.writeFileSync(mnP, mainObj, 'utf8');
