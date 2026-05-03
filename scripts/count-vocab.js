/**
 * Count words and validate vocab files
 */

const fs = require('fs');
const path = require('path');

const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const levelLabels = { a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2' };
const targets = { a1: '500-700', a2: '1,000-1,500', b1: '2,000-3,000', b2: '4,000-5,000', c1: '6,000-8,000', c2: '10,000+' };

let totalWords = 0;

console.log('\n=== VOCABULARY WORD COUNT REPORT ===\n');

levels.forEach(level => {
  const filePath = path.join(process.cwd(), 'prisma/vocab-data/en', level + '.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Count word entries
  const wordMatches = content.match(/word:\s*"[^"]+"/g);
  const count = wordMatches ? wordMatches.length : 0;
  totalWords += count;
  
  // Count unique words
  const words = wordMatches ? wordMatches.map(m => m.match(/word:\s*"([^"]+)"/)[1].toLowerCase()) : [];
  const uniqueWords = new Set(words);
  
  // Status vs target
  let status = '';
  if (level === 'a1') {
    status = (count >= 500 && count <= 700) ? '✅ PASS' : (count < 500 ? '⚠️ UNDER' : '⚠️ OVER');
  } else if (level === 'a2') {
    status = (count >= 1000 && count <= 1500) ? '✅ PASS' : (count < 1000 ? '⚠️ UNDER' : '⚠️ OVER');
  } else if (level === 'b1') {
    status = (count >= 2000 && count <= 3000) ? '✅ PASS' : (count < 2000 ? '⚠️ UNDER' : '⚠️ OVER');
  } else if (level === 'b2') {
    status = (count >= 4000 && count <= 5000) ? '✅ PASS' : (count < 4000 ? '⚠️ UNDER' : '⚠️ OVER');
  } else if (level === 'c1') {
    status = (count >= 6000 && count <= 8000) ? '✅ PASS' : (count < 6000 ? '⚠️ UNDER' : '⚠️ OVER');
  } else if (level === 'c2') {
    status = (count >= 10000) ? '✅ PASS' : '⚠️ UNDER';
  }
  
  console.log(`${levelLabels[level]}: ${count} words (${uniqueWords.size} unique) | Target: ${targets[level]} | ${status}`);
});

console.log(`\nTOTAL: ${totalWords} words\n`);
