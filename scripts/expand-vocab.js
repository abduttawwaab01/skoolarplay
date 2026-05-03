const fs = require('fs');
const path = require('path');

function expandAndAppend(setInput) {
  const fileName = { 'B2': 'b2.ts', 'C1': 'c1.ts', 'C2': 'c2.ts' }[setInput.level];
  const varName = { 'B2': 'englishB2Data', 'C1': 'englishC1Data', 'C2': 'englishC2Data' }[setInput.level];
  
  const filePath = path.join(process.cwd(), 'prisma', 'vocab-data', 'en', fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  const orderRegex = /order:\s*(\d+)/g;
  let maxOrder = 0;
  let match;
  while ((match = orderRegex.exec(content)) !== null) {
    maxOrder = Math.max(maxOrder, parseInt(match[1]));
  }

  const wordLines = setInput.words.split(';').filter(l => l.trim());
  const words = wordLines.map(line => {
    const parts = line.split('|').map(s => s.trim());
    return {
      word: parts[0],
      definition: parts[1],
      partOfSpeech: parts[2],
      pronunciation: parts[3],
      exampleSentence: parts[4],
      synonyms: parts[5] || "",
      antonyms: parts[6] || ""
    };
  });

  const newSet = {
    title: setInput.title,
    description: setInput.description,
    level: setInput.level,
    difficulty: setInput.difficulty,
    order: maxOrder + 1,
    xpReward: setInput.level === 'B2' ? 18 : (setInput.level === 'C1' ? 22 : 25),
    gemReward: setInput.level === 'B2' ? 4 : (setInput.level === 'C1' ? 5 : 6),
    words
  };

  const setJson = JSON.stringify(newSet, null, 2);
  const arrayEndIndex = content.lastIndexOf('];');
  
  if (arrayEndIndex === -1) {
    const arrayEndIndexNoSemi = content.lastIndexOf(']');
    content = content.slice(0, arrayEndIndexNoSemi).trim();
    content = content.endsWith(',') ? content + `\n  ${setJson}\n];` : content + `,\n  ${setJson}\n];`;
  } else {
    content = content.slice(0, arrayEndIndex).trim();
    content = content.endsWith(',') ? content + `\n  ${setJson}\n];` : content + `,\n  ${setJson}\n];`;
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Appended "${setInput.title}" to ${fileName}. New order: ${maxOrder + 1}`);
}

const args = process.argv.slice(2);
expandAndAppend({
  level: args[0],
  title: args[1],
  description: args[2],
  difficulty: args[3],
  words: args[4]
});
