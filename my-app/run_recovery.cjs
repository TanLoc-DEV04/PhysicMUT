const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, 'src');

function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function safeRenameSync(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        ensureDirSync(path.dirname(newPath));
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Moved: ${oldPath} -> ${newPath}`);
        } catch (e) {
            console.error(`Failed to move ${oldPath} to ${newPath}: ${e.message}`);
            // Try fallback using shell command if file locked
            try {
               execSync(`move /Y "${oldPath}" "${newPath}"`, {stdio: 'ignore'});
               console.log(`Moved (fallback cmd): ${oldPath} -> ${newPath}`);
            } catch(e2) {
               console.error(`Fallback failed too...`);
            }
        }
    }
}

// Setup phase directories
ensureDirSync(path.join(rootDir, 'core', 'cyclotron'));
ensureDirSync(path.join(rootDir, 'core', 'mass-spectrometry'));
ensureDirSync(path.join(rootDir, 'core', 'loudspeaker'));
ensureDirSync(path.join(rootDir, 'pages', '(public)'));
ensureDirSync(path.join(rootDir, 'pages', '(admin)'));
ensureDirSync(path.join(rootDir, 'pages', '(auth)'));

console.log("Basic refactoring template ready, adjust per actual logic files...");
