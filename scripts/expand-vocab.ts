import fs from 'fs';
import path from 'path';

/**
 * Format: word|definition|pos|pron|example|synonyms|antonyms
 */
interface InputSet {
  title: string;
  description: string;
  level: string;
  difficulty: string;
  words: string; // Pipe and semicolon separated
}

const levelToFileName: Record<string, string> = {
  'B2': 'b2.ts',
  'C1': 'c1.ts',
  'C2': 'c2.ts'
};

const levelToVariableName: Record<string, string> = {
  'B2': 'englishB2Data',
  'C1': 'englishC1Data',
  'C2': 'englishC2Data'
};

export function expandAndAppend(setInput: InputSet) {
  const fileName = levelToFileName[setInput.level];
  const varName = levelToVariableName[setInput.level];
  if (!fileName) throw new Error(`Invalid level: ${setInput.level}`);

  const filePath = path.join(process.cwd(), 'prisma', 'vocab-data', 'en', fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find existing order
  const orderRegex = /order:\s*(\d+)/g;
  let maxOrder = 0;
  let match;
  while ((match = orderRegex.exec(content)) !== null) {
    maxOrder = Math.max(maxOrder, parseInt(match[1]));
  }

  const wordLines = setInput.words.split(';').filter(l => l.trim());
  const words = wordLines.map(line => {
    const [word, definition, partOfSpeech, pronunciation, exampleSentence, synonyms, antonyms] = line.split('|').map(s => s.trim());
    return {
      word,
      definition,
      partOfSpeech,
      pronunciation,
      exampleSentence,
      synonyms: synonyms || "",
      antonyms: antonyms || ""
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
  // Remove the trailing ] and add the new set
  const arrayEndIndex = content.lastIndexOf('];');
  if (arrayEndIndex === -1) {
    // Try without semicolon
    const arrayEndIndexNoSemi = content.lastIndexOf(']');
    if (arrayEndIndexNoSemi === -1) throw new Error("Could not find end of array in " + fileName);
    
    content = content.slice(0, arrayEndIndexNoSemi).trim();
    if (content.endsWith(',')) {
      content += `\n  ${setJson}\n];`;
    } else {
      content += `,\n  ${setJson}\n];`;
    }
  } else {
    content = content.slice(0, arrayEndIndex).trim();
    if (content.endsWith(',')) {
      content += `\n  ${setJson}\n];`;
    } else {
      content += `,\n  ${setJson}\n];`;
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Appended "${setInput.title}" to ${fileName} (${words.length} words). New order: ${maxOrder + 1}`);
}

// If running directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.log("Usage: npx tsx scripts/expand-vocab.ts <Level> <Title> <Description> <Difficulty> <WordsString>");
    process.exit(1);
  }
  const [level, title, description, difficulty, words] = args;
  expandAndAppend({ level, title, description, difficulty, words });
}
