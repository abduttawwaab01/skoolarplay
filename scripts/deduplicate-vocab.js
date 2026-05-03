/**
 * Deduplicate vocabulary words within each CEFR level file
 * Removes duplicate words (case-insensitive), keeping the first occurrence
 */

const fs = require('fs');
const path = require('path');

const vocabFiles = [
  'prisma/vocab-data/en/a1.ts',
  'prisma/vocab-data/en/a2.ts', 
  'prisma/vocab-data/en/b1.ts',
  'prisma/vocab-data/en/b2.ts',
  'prisma/vocab-data/en/c1.ts',
  'prisma/vocab-data/en/c2.ts',
];

function deduplicateFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  console.log(`\nProcessing: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Extract all word entries using regex
  const wordRegex = /\{[\s\S]*?word:\s*"([^"]+)"[\s\S]*?\}/g;
  const entries = [];
  const seen = new Set();
  let match;
  let duplicatesRemoved = 0;
  
  // First pass: collect all entries
  const allEntries = [];
  while ((match = wordRegex.exec(content)) !== null) {
    allEntries.push({
      fullMatch: match[0],
      word: match[1],
      index: match.index
    });
  }
  
  // Second pass: identify duplicates (case-insensitive)
  const uniqueEntries = [];
  const seenLower = new Set();
  
  for (const entry of allEntries) {
    const lowerWord = entry.word.toLowerCase().trim();
    if (seenLower.has(lowerWord)) {
      duplicatesRemoved++;
    } else {
      seenLower.add(lowerWord);
      uniqueEntries.push(entry);
    }
  }
  
  console.log(`  Total entries: ${allEntries.length}`);
  console.log(`  Unique entries: ${uniqueEntries.length}`);
  console.log(`  Duplicates removed: ${duplicatesRemoved}`);
  
  // Now rebuild the words array with unique entries only
  // Find the words array start and end
  const wordsStart = content.indexOf('words: [');
  if (wordsStart === -1) {
    console.log('  ERROR: Could not find words array');
    return;
  }
  
  // Find matching closing bracket for words array
  let bracketCount = 0;
  let wordsEnd = wordsStart;
  let foundStart = false;
  
  for (let i = wordsStart; i < content.length; i++) {
    if (content[i] === '[') {
      bracketCount++;
      foundStart = true;
    } else if (content[i] === ']') {
      bracketCount--;
      if (foundStart && bracketCount === 0) {
        wordsEnd = i;
        break;
      }
    }
  }
  
  // Extract the words array content
  const beforeWords = content.substring(0, wordsStart);
  const afterWords = content.substring(wordsEnd + 1);
  
  // Build new words array with unique entries only
  const uniqueWords = uniqueEntries.map(e => e.fullMatch);
  const newWordsArray = 'words: [\n' + uniqueWords.join(',\n') + '\n  ]';
  
  // Reconstruct file
  const newContent = beforeWords + newWordsArray + afterWords;
  
  // Write back
  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log(`  File updated successfully`);
}

// Process all files
vocabFiles.forEach(file => {
  try {
    deduplicateFile(file);
  } catch (error) {
    console.error(`ERROR processing ${file}:`, error.message);
  }
});

console.log('\n✅ Deduplication complete!');
