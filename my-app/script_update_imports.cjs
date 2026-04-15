const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);
const oldPathPrefix = 'pages/';
// In reality the best way is using regex from all imports, but since we just appended (groupings) we can do a naive replace:
// e.g. "pages/Dashboard" => "pages/(admin)/Dashboard"
// e.g. "pages/Auth" => "pages/(auth)/Auth"
// e.g. "pages/Home" => "pages/(public)/Home"
const replaceMap = {
    'pages/Dashboard': 'pages/(admin)/Dashboard',
    'pages/Auth': 'pages/(auth)/Auth',
    'pages/Home': 'pages/(public)/Home',
    'pages/Examples': 'pages/(public)/Examples',
    'pages/Exercises': 'pages/(public)/Exercises',
    'pages/Models': 'pages/(public)/Models',
    'pages/ModelDetail': 'pages/(public)/ModelDetail',
    'pages/Cyclotron': 'pages/(public)/Cyclotron',
    
    // Reverse logic references
    'components/3d-models/Cyclotron/logic': 'core/cyclotron',
    'components/3d-models/MassSpectrometry/logic': 'core/mass-spectrometry',
    'components/3d-models/Loudspeaker/logic': 'core/loudspeaker'
};

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [oldName, newName] of Object.entries(replaceMap)) {
    // Basic string replace for exact imports
    if (content.includes(oldName)) {
      content = content.split(oldName).join(newName);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated routing imports in ${path.relative(srcDir, file)}`);
  }
}
