const fs = require('fs');
const path = require('path');

const file = 'prisma/vocab-data/en/b2.ts';
const filePath = path.join(process.cwd(), file);
let content = fs.readFileSync(filePath, 'utf8');

let order = 1;
// Replace all order: X or "order": X with sequential numbers
content = content.replace(/(order\":\s*)(\d+)/g, (match, p1, p2) => {
  return p1 + (order++);
});

// Also handle unquoted if any
content = content.replace(/(order:\s*)(\d+)/g, (match, p1, p2) => {
  return p1 + (order++);
});

fs.writeFileSync(filePath, content);
console.log(`✅ Fixed orders in ${file}. Total sets: ${order - 1}`);
