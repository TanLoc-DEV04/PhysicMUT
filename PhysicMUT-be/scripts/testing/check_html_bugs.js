const fs = require('fs');

try {
    const content = fs.readFileSync('seed.js', 'utf8');

    // Find all blocks wrapped in backticks that look like HTML
    const regex = /`(.*?)`/gs;
    let match;
    let errorCount = 0;

    const checkTags = (str, blockId) => {
        // Find tags
        const openDivs = (str.match(/<div[^>]*>/g) || []).length;
        const closeDivs = (str.match(/<\/div>/g) || []).length;
        
        const openP = (str.match(/<p[^>]*>/g) || []).length;
        const closeP = (str.match(/<\/p>/g) || []).length;
        
        const openStrong = (str.match(/<strong[^>]*>/g) || []).length;
        const closeStrong = (str.match(/<\/strong>/g) || []).length;

        const openEm = (str.match(/<em[^>]*>/g) || []).length;
        const closeEm = (str.match(/<\/em>/g) || []).length;

        // Space inside tags bug: < p > or < / p >
        const badTags = str.match(/<\s+[a-zA-Z]+[^>]*>|<\/\s+[a-zA-Z]+>/g);

        if (openDivs !== closeDivs) console.log(`[Block ${blockId}] DIV mismatch: ${openDivs} open vs ${closeDivs} close`);
        if (openP !== closeP) {
            console.log(`[Block ${blockId}] P mismatch: ${openP} open vs ${closeP} close. Content preview: ${str.substring(0, 100).trim()}...`);
            errorCount++;
        }
        if (openStrong !== closeStrong) console.log(`[Block ${blockId}] STRONG mismatch: ${openStrong} open vs ${closeStrong} close`);
        if (openEm !== closeEm) console.log(`[Block ${blockId}] EM mismatch: ${openEm} open vs ${closeEm} close`);
        if (badTags) {
            console.log(`[Block ${blockId}] Badly formatted tags (esp < p >):`, badTags);
            errorCount++;
        }
    };

    let blockId = 0;
    while ((match = regex.exec(content)) !== null) {
        const innerHTML = match[1];
        if (innerHTML.includes('<p>') || innerHTML.includes('<div>') || innerHTML.includes('< p >')) {
            checkTags(innerHTML, blockId);
        }
        blockId++;
    }

    if (errorCount === 0) {
        console.log("No obvious HTML tag mismatches or `< p >` bugs found.");
    } else {
        console.log(`Found ${errorCount} formatting issues in seed.js HTML strings!`);
    }

} catch(e) {
    console.error(e);
}
