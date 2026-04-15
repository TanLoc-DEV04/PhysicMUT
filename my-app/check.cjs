const fs = require('fs');
console.log(fs.readFileSync('mybuild_log.txt', 'utf8').substring(0, 2000));
