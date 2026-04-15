const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');

function moveWithRetry(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), {recursive: true});
  }
  try { fs.renameSync(src, dest); console.log(`Moved ${src} => ${dest}`); }
  catch (e) {
    try {
        require('child_process').execSync(`move /Y "${src}" "${dest}"`, {stdio: 'ignore'});
        console.log(`Force Moved ${src} => ${dest}`);
    } catch(e) { console.error(`Failed ${src}`); }
  }
}

const publicFiles = ['Home', 'Examples', 'Exercises', 'Models', 'ModelDetail', 'Cyclotron.tsx'];
for (const f of publicFiles) {
  moveWithRetry(path.join(pagesDir, f), path.join(pagesDir, '(public)', f));
}

moveWithRetry(path.join(pagesDir, 'Dashboard'), path.join(pagesDir, '(admin)', 'Dashboard'));
moveWithRetry(path.join(pagesDir, 'Auth'), path.join(pagesDir, '(auth)', 'Auth'));
