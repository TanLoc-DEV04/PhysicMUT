const fs = require('fs');

try {
    let code = fs.readFileSync('seed.js', 'utf8');

    // Find reference: '\n ... \n' and replace with backticks.
    // We match `reference: '` then everything until `\n                '` or `\r\n                '`
    // Actually, looking at the diffs, the user wrote:
    // reference: '
    // <p>...</p>
    //                 '
    
    // So we match `reference:\s*'(.*?)'` where `(.*?)` can contain newlines.
    // To match across newlines in JS regex we use [\s\S]*?
    const regex = /reference:\s*'([\s\S]*?)'/g;

    let count = 0;
    code = code.replace(regex, (match, innerText) => {
        // Only replace if there is a newline in innerText and it looks like HTML
        if (innerText.includes('<') && (innerText.includes('\n') || innerText.includes('\r'))) {
            count++;
            return 'reference: `\n' + innerText.trim() + '\n`';
        }
        return match;
    });

    if (count > 0) {
        fs.writeFileSync('seed.js', code, 'utf8');
        console.log(`Successfully fixed ${count} multiline single-quote strings.`);
    } else {
        console.log('No matches found. Single quotes might have been stripped or formatted differently.');
    }
} catch (e) {
    console.error(e);
    process.exit(1);
}
