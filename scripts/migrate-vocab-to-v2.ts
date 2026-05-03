/**
 * Migration script: Upgrade vocab data files from v1 to v2 format
 * Adds: difficulty (EASY/MEDIUM/HARD), languageCode, translation, exampleTranslation
 * Usage: npx ts-node scripts/migrate-vocab-to-v2.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { WORD_DIFFICULTY_MAP } from '../prisma/vocab-data/types';

const VOCAB_DATA_DIR = path.join(__dirname, '..', 'prisma', 'vocab-data');

interface OldVocabWord {
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation: string;
  exampleSentence: string;
  synonyms?: string;
  antonyms?: string;
}

interface OldVocabSet {
  title: string;
  description: string;
  level: string;
  difficulty: string;
  order: number;
  xpReward: number;
  gemReward: number;
  words: OldVocabWord[];
}

/**
 * Get word-level difficulty based on CEFR level and word frequency
 * For simplicity: assign based on CEFR level from WORD_DIFFICULTY_MAP
 * In future: use word frequency lists for finer granularity
 */
function getWordDifficulty(level: string, _word: string): "EASY" | "MEDIUM" | "HARD" {
  const cefrLevel = level as keyof typeof WORD_DIFFICULTY_MAP;
  return WORD_DIFFICULTY_MAP[cefrLevel] || "MEDIUM";
}

/**
 * Get translation for English words (placeholder - in production, use translation API or manual entries)
 */
function getTranslation(word: string, _languageCode: string): string {
  // Placeholder - in real implementation, this would use a translation service
  // or a pre-built dictionary. For now, return empty string.
  return "";
}

/**
 * Migrate a single vocab file
 */
async function migrateFile(
  filePath: string,
  languageCode: string,
  level: string
): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the export name (e.g., "englishA1Data")
  const exportMatch = content.match(/export const (\w+Data):/);
  if (!exportMatch) {
    console.warn(`   ⚠️  Could not find export in ${filePath}`);
    return;
  }
  const exportName = exportMatch[1];
  
  // Parse the old format and migrate
  // Since we can't fully parse TypeScript, we'll use a transformer approach
  const newContent = transformContent(content, exportName, languageCode, level);
  
  // Write back
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`   ✅ Migrated: ${filePath}`);
}

/**
 * Transform file content from v1 to v2 format
 */
function transformContent(
  content: string,
  exportName: string,
  languageCode: string,
  level: string
): string {
  // Remove old interface definitions
  let newContent = content.replace(
    /export interface VocabWord \{[\s\S]*?\}\s*/g,
    ''
  );
  newContent = newContent.replace(
    /export interface VocabSet \{[\s\S]*?\})\s*/g,
    ''
  );
  
  // Add import from types
  const importStatement = `import { VocabSet } from "../types";\n\n`;
  if (!newContent.includes('from "../types"')) {
    newContent = importStatement + newContent;
  }
  
  // Transform word objects to include new fields
  // This is a simplified approach - in production, use a proper TS parser
  const wordRegex = /\{ word: "([^"]+)", definition: "([^"]*)", partOfSpeech: "([^"]*)", pronunciation: "([^"]*)", exampleSentence: "([^"]*)", synonyms: "([^"]*)", antonyms: "([^"]*)" \}/g;
  
  newContent = newContent.replace(wordRegex, (match, word, def, pos, pron, ex, syn, ant) => {
    const difficulty = getWordDifficulty(level, word);
    return `{ word: "${word}", definition: "${def}", translation: "${getTranslation(word, languageCode)}", partOfSpeech: "${pos}", pronunciation: "${pron}", exampleSentence: "${ex}", exampleTranslation: "", synonyms: "${syn}", antonyms: "${ant}", difficulty: "${difficulty}", languageCode: "${languageCode}" }`;
  });
  
  // Also handle words without synonyms/antonyms
  const wordRegex2 = /\{ word: "([^"]+)", definition: "([^"]*)", partOfSpeech: "([^"]*)", pronunciation: "([^"]*)", exampleSentence: "([^"]*)" \}/g;
  newContent = newContent.replace(wordRegex2, (match, word, def, pos, pron, ex) => {
    const difficulty = getWordDifficulty(level, word);
    return `{ word: "${word}", definition: "${def}", translation: "${getTranslation(word, languageCode)}", partOfSpeech: "${pos}", pronunciation: "${pron}", exampleSentence: "${ex}", exampleTranslation: "", synonyms: "", antonyms: "", difficulty: "${difficulty}", languageCode: "${languageCode}" }`;
  });
  
  return newContent;
}

/**
 * Main migration function
 */
async function migrateAll(): Promise<void> {
  console.log("🚀 Starting vocabulary migration to v2 format...\n");
  
  const languages = ['en', 'yo', 'fr'];
  
  for (const lang of languages) {
    const langDir = path.join(VOCAB_DATA_DIR, lang);
    if (!fs.existsSync(langDir)) {
      console.log(`   ⚠️  Directory not found: ${langDir}`);
      continue;
    }
    
    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.ts'));
    console.log(`📁 Migrating ${lang} (${files.length} files)...`);
    
    for (const file of files) {
      const filePath = path.join(langDir, file);
      const level = file.replace('.ts', '').toUpperCase();
      await migrateFile(filePath, lang, level);
    }
  }
  
  console.log("\n✨ Migration complete!");
  console.log("⚠️  Note: 'translation' and 'exampleTranslation' fields are empty.");
  console.log("   Run the translation population script next.");
}

migrateAll().catch(e => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
