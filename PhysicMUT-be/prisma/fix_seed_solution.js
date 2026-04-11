const fs = require('fs');

try {
    let content = fs.readFileSync('seed.js', 'utf8');

    // For exercises, the format typically is:
    // status: 'ACTIVE',
    // reference: `...`  OR  solution: `...`
    // We want to replace `reference:` with `solution:` only inside the exercises arrays.
    // Actually, since all "reference" mappings for Example and Exercise with long string answers should be `solution`, 
    // Wait, Example model actually has `solution` AND `reference` already!
    // Let's check schema for Example:
    // model Example {
    //   problem      String   // Problem statement
    //   solution     String   // Step-by-step solution
    //   reference    String?
    // }
    // So Example already has `solution`. Exercise now also has `solution`.
    // We can just replace all occurrences of `reference: \`` with `solution: \`` 
    // AND `reference: '` with `solution: '` where it contains HTML like `<p>`.

    let count = 0;
    content = content.replace(/reference:\s*(`|')([\s\S]*?)\1/g, (match, quote, innerText) => {
        // If it contains HTML tags, it's definitely the detailed solution
        if (innerText.includes('<p>') || innerText.includes('Đáp án')) {
            count++;
            return `solution: ${quote}${innerText}${quote}`;
        }
        return match; // keep as reference: '...' if it's just a short source
    });

    fs.writeFileSync('seed.js', content, 'utf8');
    console.log(`Successfully replaced ${count} reference keys with solution keys in seed.js`);
} catch (e) {
    console.error(e);
    process.exit(1);
}
