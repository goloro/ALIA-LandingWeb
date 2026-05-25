const fs = require('fs');
const path = 'HTML/prototipo.html';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Remove lines 282 through 476 (inclusive, 1-indexed)
// This is indices 281 through 475
lines.splice(281, 476 - 282 + 1);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed broken HTML block by removing duplicate lines');
