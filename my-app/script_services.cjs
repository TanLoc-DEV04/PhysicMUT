const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const renames = {
  'authService.ts': 'auth.service.ts',
  'chatbotService.ts': 'chatbot.service.ts',
  'Cyclotron3DService.ts': 'cyclotron3d.service.ts',
  'exampleService.ts': 'example.service.ts',
  'exerciseService.ts': 'exercise.service.ts',
  'model3DService.ts': 'models.service.ts',
  'roleService.ts': 'role.service.ts',
  'theoryService.ts': 'theory.service.ts',
  'userService.ts': 'user.service.ts'
};

const mapOldToNew = {
  'authService': 'auth.service',
  'chatbotService': 'chatbot.service',
  'Cyclotron3DService': 'cyclotron3d.service',
  'exampleService': 'example.service',
  'exerciseService': 'exercise.service',
  'model3DService': 'models.service',
  '3dModelService': 'models.service', // also replace old 3dModelService imports just in case
  'roleService': 'role.service',
  'theoryService': 'theory.service',
  'userService': 'user.service'
};

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

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [oldName, newName] of Object.entries(mapOldToNew)) {
    // Regex to match imports: from "path/to/oldName" or './oldName'
    const importRegex = new RegExp(`(['"])([^'"]*/)${oldName}(['"])`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1$2${newName}$3`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${path.relative(srcDir, file)}`);
  }
}

// Now rename the service files
const servicesDir = path.join(srcDir, 'services');
for (const [oldCName, newCName] of Object.entries(renames)) {
  const oldPath = path.join(servicesDir, oldCName);
  const newPath = path.join(servicesDir, newCName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldCName} to ${newCName}`);
  }
}
