const fs = require("fs");
const path = require("path");
const srcDir = path.join(__dirname, "src");

// We need to resolve relative imports to absolute matching correctly. Because we moved pages, they now sit deeper.
// So `../../hooks` inside pages/(admin)/Dashboard may need to be `../../../hooks`.
// An easier approach for a vite project with standard TS config is fixing via absolute alias like `@/` or replacing relative paths recursively.
// Wait, my-app Vite doesn't have `@/` configured universally. Let's fix relative nesting.

// Node AST is complex. We will use simple regex replacement for the moved files.
function updateNesting(dir, extraNestingLevel) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            updateNesting(fullPath, extraNestingLevel);
        } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
            let content = fs.readFileSync(fullPath, "utf8");
            let changed = false;
            
            // Matches `import ... from '../something'` and `import ... from '../../something'` etc.
            const importRegex = /from\s+['"]((?:\.\.\/)+)([^'"]+)['"]/g;
            content = content.replace(importRegex, (match, prefix, rest) => {
                // If it's pointing to something outside the moved directory, it needs one more `../`
                const newPrefix = prefix + '../'.repeat(extraNestingLevel);
                changed = true;
                return `from '${newPrefix}${rest}'`;
            });
            
            if (changed) {
                fs.writeFileSync(fullPath, content, "utf8");
                console.log("Updated relative paths in: " + fullPath);
            }
        }
    }
}

updateNesting(path.join(srcDir, "pages", "(admin)"), 1);
updateNesting(path.join(srcDir, "pages", "(auth)"), 1);
updateNesting(path.join(srcDir, "pages", "(public)"), 1);
