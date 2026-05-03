/**
 * Phase 1 P0 Fixes for English Vocabulary
 * 1. Fix c2.ts syntax errors (typos with "": instead of ":)
 * 2. Fix Chinese/non-English characters in all files
 * 3. Convert any remaining JSON-format entries to TypeScript format
 * 4. Remove duplicates within each vocab set
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

// Chinese character regex
const chineseRegex = /[\u4e00-\u9fff]/g;

// Replacement map for known Chinese character issues
const chineseFixes = {
  '自我介绍': 'self-introduction',
  '避': 'avoidance',
  '纪念品': 'memento/souvenir',
  '低落': 'low mood',
  '??': '',
  '???': '',
};

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  console.log(`\nFixing: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fixesApplied = 0;
  
  // Fix 1: Replace "word": with word: (JSON format to TS format)
  const jsonKeyRegex = /"(\w+)":\s*/g;
  let match;
  let fixedContent = '';
  let lastIndex = 0;
  
  while ((match = jsonKeyRegex.exec(content)) !== null) {
    // Check if this is inside a word object (after "words: [")
    const beforeMatch = content.substring(0, match.index);
    const wordsArrayStart = beforeMatch.lastIndexOf('words: [');
    
    if (wordsArrayStart !== -1) {
      // We're inside a words array, convert JSON to TS
      fixedContent += content.substring(lastIndex, match.index) + match[1] + ': ';
      lastIndex = jsonKeyRegex.lastIndex;
      fixesApplied++;
    }
  }
  
  if (lastIndex > 0) {
    fixedContent += content.substring(lastIndex);
    content = fixedContent;
  }
  
  // Fix 2: Replace Chinese characters
  for (const [chinese, replacement] of Object.entries(chineseFixes)) {
    if (content.includes(chinese)) {
      content = content.split(chinese).join(replacement);
      fixesApplied++;
      console.log(`  Replaced: ${chinese} → ${replacement}`);
    }
  }
  
  // Fix 3: Fix c2.ts specific typos (antonyms": → antonyms:, etc.)
  const typos = [
    ['antonyms": "', 'antonyms: "'],
    ['synonyms": "', 'synonyms: "'],
    ['exampleSentence": "', 'exampleSentence: "'],
    ['title": "', 'title: "'],
    ['description": "', 'description: "'],
    ['level": "', 'level: "'],
    ['difficulty": "', 'difficulty: "'],
    ['order": ', 'order: '],
    ['xpReward": ', 'xpReward: '],
    ['gemReward": ', 'gemReward: '],
    ['words": [', 'words: ['],
  ];
  
  for (const [typo, fix] of typos) {
    if (content.includes(typo)) {
      content = content.split(typo).join(fix);
      fixesApplied += 10; // approximate
    }
  }
  
  // Fix 4: Remove duplicates within each words array
  // Find all words arrays and deduplicate
  let result = '';
  let pos = 0;
  let totalRemoved = 0;
  
  while (pos < content.length) {
    const wordsStart = content.indexOf('words: [', pos);
    
    if (wordsStart === -1) {
      result += content.substring(pos);
      break;
    }
    
    result += content.substring(pos, wordsStart);
    
    // Find matching closing bracket
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
    
    const wordsSection = content.substring(wordsStart, wordsEnd + 1);
    
    // Extract word objects and deduplicate
    const wordObjects = [];
    const seenWords = new Set();
    let removed = 0;
    let searchStart = 0;
    
    while (searchStart < wordsSection.length) {
      const objStart = wordsSection.indexOf('{', searchStart);
      if (objStart === -1) break;
      
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
    
    // Rebuild words array
    const indent = '       ';
    const newWordsArray = 'words: [\n' + wordObjects.map(w => indent + w).join(',\n') + '\n       ]';
    
    result += newWordsArray;
    pos = wordsEnd + 1;
  }
  
  // Write back if changes were made
  if (fixesApplied > 0 || totalRemoved > 0) {
    fs.writeFileSync(fullPath, result || content, 'utf8');
    console.log(`  Applied ${fixesApplied} syntax fixes`);
    console.log(`  Removed ${totalRemoved} duplicate words`);
  } else {
    console.log(`  No fixes needed`);
  }
}

// Process all files
vocabFiles.forEach(file => {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`ERROR processing ${file}:`, error.message);
  }
});

console.log('\n✅ Phase 1 P0 fixes complete!');
