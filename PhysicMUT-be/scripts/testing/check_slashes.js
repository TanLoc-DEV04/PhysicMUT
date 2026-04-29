const fs = require('fs');
const content = fs.readFileSync('seed.js', 'utf8');

const regex = /\$(.*?)\$/g;
let match;
let matchCount = 0;
while ((match = regex.exec(content)) !== null) {
    if (match[1].includes('\\')) {
        matchCount++;
        if (matchCount < 5) {
            console.log(`Original: ${match[0]}`);
            // Let's see how JS evaluates it since we are reading from file string, wait, 
            // fs.readFileSync returns the EXACT content of the file.
            // If the file contains `\cdot`, fs.readFileSync gives us `\cdot`.
        }
    }
}
console.log(`Found ${matchCount} math formulas with backslashes.`);
