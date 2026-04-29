const fs = require('fs');

try {
    let content = fs.readFileSync('seed.js', 'utf8');

    // Fix malformed tags with spaces inside
    // e.g., < em > -> <em>, < / em > -> </em>
    const badTagsRegex = /<\s*(\/?)\s*([a-zA-Z]+)\s*>/g;
    
    // We only want to replace tags that have spaces where they shouldn't.
    content = content.replace(badTagsRegex, (match, slash, tagName) => {
        // if original match has spaces like "< p >" or "< /p >"
        if (match.includes(' ')) {
            // Reconstruct tag cleanly
            return `<${slash}${tagName}>`;
        }
        return match;
    });

    // We can also fix `<Strong>` to `<strong>` for consistency though HTML is case-insensitive
    content = content.replace(/<Strong>/g, '<strong>');
    content = content.replace(/<\/Strong>/g, '</strong>');

    // And ensure \( ... \) math formulas don't get broken by <br> or things inside them by bad copy-paste,
    // though that's harder. But the space-in-tags fix is the most critical for "mảnh html thuần".
    
    fs.writeFileSync('seed.js', content, 'utf8');
    console.log("Successfully fixed spaced HTML tags in seed.js!");

} catch(e) {
    console.error(e);
}
