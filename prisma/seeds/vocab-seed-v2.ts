/**
 * Unified Vocabulary Seed System v2
 * - Handles both old and new vocab data formats
 * - Supports incremental updates and validation
 * - Works with all 9 languages
 */

import { PrismaClient, VocabularyWordCreateManyInput } from "@prisma/client";
import * as enA1 from "../vocab-data/en/a1";
import * as enA2 from "../vocab-data/en/a2";
import * as enB1 from "../vocab-data/en/b1";
import * as enB2 from "../vocab-data/en/b2";
import * as enC1 from "../vocab-data/en/c1";
import * as enC2 from "../vocab-data/en/c2";
import { CEFR_LEVELS, DIFFICULTY_MAP, WORD_DIFFICULTY_MAP } from "../vocab-data/types";

const db = new PrismaClient();

/**
 * Flexible VocabWord - supports both old and new format
 */
interface FlexibleVocabWord {
  word: string;
  definition: string;
  translation?: string;
  partOfSpeech: string;
  pronunciation: string;
  exampleSentence: string;
  exampleTranslation?: string;
  synonyms?: string;
  antonyms?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  languageCode?: string;
  audioUrl?: string;
  ttsUrl?: string;
  scrambledWord?: string;
  missingLetter?: string;
}

interface FlexibleVocabSet {
  title: string;
  description: string;
  level: string;
  difficulty: string;
  order: number;
  xpReward: number;
  gemReward: number;
  words: FlexibleVocabWord[];
}

/**
 * Get the export name for a language/level combination
 */
function getExportName(lang: string, level: string): string {
  const langMap: Record<string, string> = {
    'en': 'english',
    'yo': 'yoruba',
    'fr': 'french',
    'ig': 'igbo',
    'ha': 'hausa',
    'es': 'spanish',
    'de': 'german',
    'pt': 'portuguese',
    'ar': 'arabic',
  };
  return `${langMap[lang] || lang}${level.toUpperCase()}Data`;
}

/**
 * Load vocab data with compatibility for old and new formats
 */
async function loadVocabDataFlexible(
  lang: string,
  level: string
): Promise<FlexibleVocabSet[] | null> {
  try {
    // Try new format first: prisma/vocab-data/{lang}/{level}.ts
    const newFormat = await import(`../vocab-data/${lang}/${level.toLowerCase()}.ts`);
    const newExportName = getExportName(lang, level);
    if (newFormat[newExportName]) {
      return newFormat[newExportName];
    }
  } catch {
    // New format not found, try old format
  }

  try {
    // Old format: imported via the main import statements
    const oldFormatMap: Record<string, any> = {
      'en-A1': enA1,
      'en-A2': enA2,
      'en-B1': enB1,
      'en-B2': enB2,
      'en-C1': enC1,
      'en-C2': enC2,
    };
    const key = `${lang}-${level}`;
    const module = oldFormatMap[key];
    if (module) {
      const exportName = getExportName(lang, level);
      return module[exportName] || null;
    }
  } catch {
    // Old format not found either
  }

  return null;
}

/**
 * Normalize a word to the new format with defaults
 */
function normalizeWord(
  word: FlexibleVocabWord,
  lang: string,
  level: string
): VocabularyWordCreateManyInput & { _tempId?: string } {
  const defaultDifficulty = WORD_DIFFICULTY_MAP[level as keyof typeof WORD_DIFFICULTY_MAP] || "MEDIUM";
  
  return {
    vocabularySetId: "", // Will be set later
    word: word.word,
    definition: word.definition,
    translation: word.translation || null,
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    exampleSentence: word.exampleSentence,
    exampleTranslation: word.exampleTranslation || null,
    synonyms: word.synonyms || null,
    antonyms: word.antonyms || null,
    difficulty: word.difficulty || defaultDifficulty,
    languageCode: word.languageCode || lang,
    audioUrl: word.audioUrl || null,
    ttsUrl: word.ttsUrl || null,
    scrambledWord: word.scrambledWord || null,
    missingLetter: word.missingLetter || null,
  } as VocabularyWordCreateManyInput & { _tempId?: string };
}

/**
 * Validate a vocab set
 */
function validateVocabSet(
  set: FlexibleVocabSet,
  lang: string,
  level: string
): string[] {
  const errors: string[] = [];
  
  if (!set.title) errors.push(`Missing title in ${lang}/${level}`);
  if (!set.words || set.words.length === 0) {
    errors.push(`No words in ${lang}/${level}`);
    return errors;
  }

  const seenWords = new Set<string>();
  set.words.forEach((word, idx) => {
    if (!word.word) errors.push(`  [${idx}] Missing word text`);
    if (!word.definition) errors.push(`  [${idx}] "${word.word}": Missing definition`);
    if (!word.partOfSpeech) errors.push(`  [${idx}] "${word.word}": Missing partOfSpeech`);
    
    const lowerWord = word.word?.toLowerCase();
    if (seenWords.has(lowerWord)) {
      errors.push(`  Duplicate word: "${word.word}"`);
    }
    seenWords.add(lowerWord);
  });

  return errors;
}

/**
 * Main seed function
 */
async function seedVocabularyV2(options: {
  languages?: string[];
  levels?: string[];
  dryRun?: boolean;
  replaceExisting?: boolean;
} = {}) {
  const {
    languages = ['en'],
    levels = [...CEFR_LEVELS],
    dryRun = false,
    replaceExisting = true,
  } = options;

  console.log(`\n🌱 Vocabulary Seed v2`);
  console.log(`   Languages: ${languages.join(', ')}`);
  console.log(`   Levels: ${levels.join(', ')}`);
  console.log(`   Dry run: ${dryRun}\n`);

  // Get or create Languages category
  let languagesCategory = await db.category.findFirst({
    where: { name: "Languages" },
  });

  if (!languagesCategory && !dryRun) {
    languagesCategory = await db.category.create({
      data: {
        name: "Languages",
        description: "Learn Nigerian and international languages",
        icon: "🌍",
        color: "#10B981",
        order: 1,
      },
    });
  }

  let totalCreated = 0;
  let totalUpdated = 0;
  let totalWords = 0;
  const allErrors: string[] = [];

  for (const lang of languages) {
    for (const level of levels) {
      const vocabSets = await loadVocabDataFlexible(lang, level);
      
      if (!vocabSets || vocabSets.length === 0) {
        console.log(`   ⚠️  No data for ${lang}/${level}`);
        continue;
      }

      for (const set of vocabSets) {
        const errors = validateVocabSet(set, lang, level);
        if (errors.length > 0) {
          allErrors.push(...errors);
          console.error(`   ❌ ${lang}/${level} "${set.title}":`, errors.slice(0, 3));
          continue;
        }

        const normalizedWords = set.words.map(w => normalizeWord(w, lang, level));
        const difficultyMap: Record<string, string> = {
          A1: "BEGINNER", A2: "BEGINNER",
          B1: "INTERMEDIATE", B2: "INTERMEDIATE",
          C1: "ADVANCED", C2: "ADVANCED",
        };

        if (dryRun) {
          console.log(`   [DRY RUN] ${lang}/${level} - "${set.title}": ${set.words.length} words`);
          totalWords += set.words.length;
          continue;
        }

        const existingSet = await db.vocabularySet.findFirst({
          where: { title: set.title, language: lang, level },
        });

        const setData = {
          title: set.title,
          description: set.description,
          language: lang,
          difficulty: difficultyMap[level] || "BEGINNER",
          level,
          isActive: true,
          xpReward: set.xpReward,
          gemReward: set.gemReward,
          order: set.order,
          categoryId: languagesCategory?.id,
        };

        if (existingSet) {
          await db.vocabularySet.update({
            where: { id: existingSet.id },
            data: setData,
          });

          if (replaceExisting) {
            await db.vocabularyWord.deleteMany({
              where: { vocabularySetId: existingSet.id },
            });
          }

          await db.vocabularyWord.createMany({
            data: normalizedWords.map(w => ({ ...w, vocabularySetId: existingSet.id })),
          });

          totalUpdated++;
          console.log(`   🔄 Updated: ${lang}/${level} - "${set.title}" (${set.words.length} words)`);
        } else {
          const createdSet = await db.vocabularySet.create({
            data: { ...setData, isPremium: false },
          });

          await db.vocabularyWord.createMany({
            data: normalizedWords.map(w => ({ ...w, vocabularySetId: createdSet.id })),
          });

          totalCreated++;
          console.log(`   ✅ Created: ${lang}/${level} - "${set.title}" (${set.words.length} words)`);
        }

        totalWords += set.words.length;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${totalCreated} sets`);
  console.log(`   Updated: ${totalUpdated} sets`);
  console.log(`   Total words: ${totalWords}`);
  if (allErrors.length > 0) {
    console.log(`   Errors: ${allErrors.length}`);
  }
  console.log(`\n✨ Seed v2 complete!\n`);
}

// Run if called directly
if (require.main === module) {
  seedVocabularyV2({
    languages: ['en'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    dryRun: false,
    replaceExisting: true,
  })
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Seed failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}

export { seedVocabularyV2 };
