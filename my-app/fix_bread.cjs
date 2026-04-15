const fs = require("fs");
let content = fs.readFileSync("src/components/shared/Breadcrumb.tsx", "utf8");
content = content.replace(/className=\{\\mb-4 \$className\\\}/g, "`className={\`mb-4 ${className}\`}`");
content = content.replace(/const url = \\\/\\;/g, "const url = \`/${pathnames.slice(0, index + 1).join('/')}\`;");
content = content.replace(/<div className=\{g-gray-100 py-3 px-6 border-b border-gray-200 \$className\\\}>/g, "<div className={\`bg-gray-100 py-3 px-6 border-b border-gray-200 ${className}\`}>");
fs.writeFileSync("src/components/shared/Breadcrumb.tsx", content, "utf8");
