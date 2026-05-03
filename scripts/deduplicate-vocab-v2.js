/**
 * Properly deduplicate vocabulary words within each vocab set
 * Handles TypeScript structure without corrupting it
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

function deduplicateWordsInFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  console.log(`\nProcessing: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Find all words: [ ... ] arrays and deduplicate each one
  // Strategy: find each "words: [" then find matching closing "]"
  
  let result = '';
  let pos = 0;
  let totalRemoved = 0;
  
  while (pos < content.length) {
    // Find next "words: ["
    const wordsStart = content.indexOf('words: [', pos);
    
    if (wordsStart === -1) {
      // No more words arrays, add rest of content
      result += content.substring(pos);
      break;
    }
    
    // Add content before this words array
    result += content.substring(pos, wordsStart);
    
    // Find the matching closing bracket for this words array
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
    
    // Extract the words array content (including "words: [")
    const wordsSection = content.substring(wordsStart, wordsEnd + 1);
    
    // Extract individual word objects from this section
    const wordObjects = [];
    const seenWords = new Set();
    let removed = 0;
    
    // Find all { ... } objects within the words array
    let searchStart = 0;
    while (searchStart < wordsSection.length) {
      const objStart = wordsSection.indexOf('{', searchStart);
      if (objStart === -1) break;
      
      // Find matching closing brace
      let braceCount = 0;
      let objEnd = objStart;
      for (let i = objStart; i < wordsSection.length; i++) {
        if (wordsSection[i] === '{') braceCount++;
        if (wordsSection[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            objEnd = i;
            break;
          }
        }
      }
      
      if (objEnd <= objStart) break;
      
      const objStr = wordsSection.substring(objStart, objEnd + 1);
      
      // Extract the word field
      const wordMatch = objStr.match(/word:\s*"([^"]+)"/);
      if (wordMatch) {
        const word = wordMatch[1].toLowerCase().trim();
        if (!seenWords.has(word)) {
          seenWords.add(word);
          wordObjects.push(objStr);
        } else {
          removed++;
        }
      }
      
      searchStart = objEnd + 1;
    }
    
    totalRemoved += removed;
    
    // Rebuild the words array with deduplicated entries
    const indent = '       '; // Assume standard indentation
    const newWordsArray = 'words: [\n' + wordObjects.map(w => indent + w).join(',\n') + '\n       ]';
    
    result += newWordsArray;
    
    // Move position past this words array
    pos = wordsEnd + 1;
  }
  
  console.log(`  Total duplicates removed: ${totalRemoved}`);
  
  // Write back
  fs.writeFileSync(fullPath, result, 'utf8');
  console.log(`  File updated successfully`);
}

// Process all files
vocabFiles.forEach(file => {
  try {
    deduplicateWordsInFile(file);
  } catch (error) {
    console.error(`ERROR processing ${file}:`, error.message);
  }
});

console.log('\n✅ Deduplication complete!');
