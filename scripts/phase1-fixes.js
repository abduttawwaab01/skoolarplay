/**
 * Phase 1 P0 Fixes - Complete and Safe
 * 1. Fix syntax errors in c2.ts
 * 2. Fix Chinese characters in all files
 * 3. Convert JSON-format entries to TS format in b2.ts
 * 4. Remove duplicates safely
 * 5. Count words and report status
 */

const fs = require('fs');
const path = require('path');

const vocabDir = path.join(process.cwd(), 'prisma/vocab-data/en');
const files = ['a1.ts', 'a2.ts', 'b1.ts', 'b2.ts', 'c1.ts', 'c2.ts'];

console.log('\n=== PHASE 1 P0 FIXES ===\n');

// Process each file
files.forEach(filename => {
  const filePath = path.join(vocabDir, filename);
  console.log(`Processing: ${filename}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixesApplied = 0;
  
  // Fix 1: c2.ts syntax errors (typos)
  if (filename === 'c2.ts') {
    const before = content;
    content = content.split('antonyms": "').join('antonyms: "');
    content = content.split('synonyms": "').join('synonyms: "');
    content = content.split('exampleSentence": "').join('exampleSentence: "');
    if (content !== before) {
      fixesApplied += 3;
      console.log('  Fixed syntax errors (typos)');
    }
  }
  
  // Fix 2: Chinese characters
  const chineseFixes = {
    '自我介绍': 'self-introduction',
    '避': 'avoidance',
    '纪念品': 'memento/souvenir',
    '低落': 'low mood',
    '??': '',
    '???': '',
    'é': 'e',  // Fix special chars
    'Exposé': 'Expose',
    'Expos': 'Expose'
  };
  
  for (const [chinese, replacement] of Object.entries(chineseFixes)) {
    if (content.includes(chinese)) {
      content = content.split(chinese).join(replacement);
      fixesApplied++;
      console.log(`  Replaced: ${chinese} → ${replacement}`);
    }
  }
  
  // Fix 3: Convert JSON-format to TS format (only in b2.ts)
  if (filename === 'b2.ts') {
    const jsonKeyRegex = /"(\w+)":\s*/g;
    let match;
    let fixedContent = '';
    let lastIndex = 0;
    let jsonFixes = 0;
    
    while ((match = jsonKeyRegex.exec(content)) !== null) {
      // Check if inside words array
      const beforeMatch = content.substring(0, match.index);
      const wordsArrayStart = beforeMatch.lastIndexOf('words: [');
      
      if (wordsArrayStart !== -1) {
        fixedContent += content.substring(lastIndex, match.index) + match[1] + ': ';
        lastIndex = jsonKeyRegex.lastIndex;
        jsonFixes++;
      }
    }
    
    if (lastIndex > 0) {
      fixedContent += content.substring(lastIndex);
      content = fixedContent;
      fixesApplied += jsonFixes;
      console.log(`  Converted ${jsonFixes} JSON entries to TS format`);
    }
  }
  
  // Fix 4: Remove duplicates within each words array
  let pos = 0;
  let result = '';
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
    
    // Extract and deduplicate word objects
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
  
  if (totalRemoved > 0) {
    console.log(`  Removed ${totalRemoved} duplicate words`);
  }
  
  // Write back if changes were made
  if (fixesApplied > 0 || totalRemoved > 0) {
    fs.writeFileSync(filePath, result || content, 'utf8');
    console.log(`  ✅ File updated (${fixesApplied} fixes, ${totalRemoved} duplicates removed)`);
  } else {
    console.log(`  ✅ No fixes needed`);
  }
});

// Now count words
console.log('\n=== WORD COUNT REPORT ===\n');

const targets = {
  'a1.ts': { min: 500, max: 700, label: 'A1' },
  'a2.ts': { min: 1000, max: 1500, label: 'A2' },
  'b1.ts': { min: 2000, max: 3000, label: 'B1' },
  'b2.ts': { min: 4000, max: 5000, label: 'B2' },
  'c1.ts': { min: 6000, max: 8000, label: 'C1' },
  'c2.ts': { min: 10000, max: Infinity, label: 'C2' }
};

let totalWords = 0;
let totalUnique = 0;

files.forEach(filename => {
  const filePath = path.join(vocabDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const wordMatches = content.match(/word:\s*"[^"]+"/g);
  const count = wordMatches ? wordMatches.length : 0;
  const words = wordMatches ? wordMatches.map(m => m.match(/word:\s*"([^"]+)"/)[1].toLowerCase()) : [];
  const unique = new Set(words);
  
  totalWords += count;
  totalUnique += unique.size;
  
  const target = targets[filename];
  let status = '';
  
  if (count >= target.min && count <= target.max) {
    status = '✅ PASS';
  } else if (count < target.min) {
    status = `⚠️ UNDER (need ${target.min - count} more)`;
  } else {
    status = `⚠️ OVER (${count - target.max} over)`;
  }
  
  console.log(`${target.label}: ${count} words (${unique.size} unique) | Target: ${target.min}-${target.max === Infinity ? '+' : target.max} | ${status}`);
});

console.log(`\nTOTAL: ${totalWords} words (${totalUnique} unique)\n`);
console.log('✅ Phase 1 P0 fixes complete!\n');
