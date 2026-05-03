import { PrismaClient, VocabularyWordCreateManyInput } from "@prisma/client";
import { VocabSet, CEFR_LEVELS, DIFFICULTY_MAP, WORD_DIFFICULTY_MAP } from "../vocab-data/types";

/**
 * Unified vocabulary seed utility
 * Handles validation, incremental updates, and multi-language support
 */

export interface SeedOptions {
  languages?: string[];      // e.g. ['en', 'yo', 'fr'] - defaults to all
  levels?: string[];          // e.g. ['A1', 'A2'] - defaults to all CEFR levels
  dryRun?: boolean;           // Preview changes without writing to DB
  validateOnly?: boolean;     // Only run validation, no DB ops
  replaceExisting?: boolean;  // Replace all words in existing sets (default: true)
}

export interface SeedResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  totalWords: number;
}

/**
 * Load vocab data for a given language and level
 * Dynamically imports from prisma/vocab-data/{lang}/{level}.ts
 */
export async function loadVocabData(
  language: string,
  level: string
): Promise<VocabSet[] | VocabSet | null> {
  try {
    const module = await import(`../vocab-data/${language}/${level.toLowerCase()}.ts`);
    const exportName = getExportName(language, level);
    return module[exportName] || null;
  } catch (error) {
    console.warn(`   ⚠️  No data found for ${language}/${level}`);
    return null;
  }
}

function getExportName(lang: string, level: string): string {
  const langUpper = lang.toUpperCase();
  const levelLower = level.toLowerCase();
  // e.g., englishA1Data, yorubaA1Data, frenchA1Data
  if (langUpper === 'EN') return `english${levelUpper(level)}Data`;
  if (langUpper === 'YO') return `yoruba${levelUpper(level)}Data`;
  if (langUpper === 'FR') return `french${levelUpper(level)}Data`;
  if (langUpper === 'IG') return `igbo${levelUpper(level)}Data`;
  if (langUpper === 'HA') return `hausa${levelUpper(level)}Data`;
  if (langUpper === 'ES') return `spanish${levelUpper(level)}Data`;
  if (langUpper === 'DE') return `german${levelUpper(level)}Data`;
  if (langUpper === 'PT') return `portuguese${levelUpper(level)}Data`;
  if (langUpper === 'AR') return `arabic${levelUpper(level)}Data`;
  return `${lang}${levelUpper(level)}Data`;
}

function levelUpper(level: string): string {
  return level.toUpperCase();
}

/**
 * Validate a VocabSet for completeness and correctness
 */
export function validateVocabSet(
  set: VocabSet,
  language: string,
  level: string
): string[] {
  const errors: string[] = [];

  if (!set.title) errors.push(`Missing title in ${language}/${level}`);
  if (!set.description) errors.push(`Missing description in ${language}/${level}`);
  if (!set.words || set.words.length === 0) {
    errors.push(`No words in ${language}/${level}`);
    return errors;
  }

  set.words.forEach((word, idx) => {
    const prefix = `  [${idx}] "${word.word}":`;
    if (!word.word) errors.push(`${prefix} Missing word text`);
    if (!word.definition) errors.push(`${prefix} Missing definition`);
    if (!word.partOfSpeech) errors.push(`${prefix} Missing partOfSpeech`);
    if (!word.pronunciation) errors.push(`${prefix} Missing pronunciation`);
    if (!word.exampleSentence) errors.push(`${prefix} Missing exampleSentence`);
    
    // We allow missing difficulty and languageCode here, as they can be filled with defaults during seeding
    if (word.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(word.difficulty)) {
      errors.push(`${prefix} Invalid difficulty: ${word.difficulty}`);
    }
    if (word.languageCode && word.languageCode !== language) {
      errors.push(`${prefix} languageCode mismatch: expected ${language}, got ${word.languageCode}`);
    }
  });

  // Check for duplicate words within set
  const wordTexts = set.words.map(w => w.word.toLowerCase());
  const duplicates = wordTexts.filter((item, index) => wordTexts.indexOf(item) !== index);
  if (duplicates.length > 0) {
    errors.push(`  Duplicate words found: ${[...new Set(duplicates)].join(', ')}`);
  }

  return errors;
}

/**
 * Convert VocabWord to Prisma VocabularyWordCreateManyInput
 */
function toPrismaWord(
  word: VocabSet['words'][0],
  vocabularySetId: string,
  languageCode: string,
  level: string
): VocabularyWordCreateManyInput {
  return {
    vocabularySetId,
    word: word.word,
    definition: word.definition,
    translation: word.translation || null,
    partOfSpeech: word.partOfSpeech,
    pronunciation: word.pronunciation,
    exampleSentence: word.exampleSentence,
    exampleTranslation: word.exampleTranslation || null,
    synonyms: word.synonyms || null,
    antonyms: word.antonyms || null,
    difficulty: word.difficulty || WORD_DIFFICULTY_MAP[level as CEFRLevel] || "MEDIUM",
    languageCode: word.languageCode || languageCode,
    audioUrl: word.audioUrl || null,
    ttsUrl: word.ttsUrl || null,
    scrambledWord: word.scrambledWord || null,
    missingLetter: word.missingLetter || null,
  };
}

import { CEFRLevel } from "../vocab-data/types";

/**
 * Main seed function - seeds vocabulary for specified languages/levels
 */
export async function seedVocabulary(
  db: PrismaClient,
  options: SeedOptions = {}
): Promise<SeedResult> {
  const {
    languages = ['en', 'yo', 'ig', 'ha', 'fr', 'es', 'de', 'pt', 'ar'],
    levels = [...CEFR_LEVELS],
    dryRun = false,
    validateOnly = false,
    replaceExisting = true,
  } = options;

  const result: SeedResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    totalWords: 0,
  };

  console.log(`\n🌱 Starting vocabulary seed (dryRun=${dryRun}, validateOnly=${validateOnly})`);
  console.log(`   Languages: ${languages.join(', ')}`);
  console.log(`   Levels: ${levels.join(', ')}\n`);

  // Get or create Languages category
  // Get or create Languages category
  let languagesCategory = await db.vocabularyCategory.findFirst({
    where: { name: "Languages", language: 'en' },
  });

  if (!languagesCategory && !dryRun && !validateOnly) {
    languagesCategory = await db.vocabularyCategory.create({
      data: {
        name: "Languages",
        description: "Learn Nigerian and international languages",
        language: 'en',
        icon: "🌍",
        color: "#10B981",
        order: 1,
      },
    });
    console.log("   ✅ Created VocabularyCategory: Languages");
  }

  for (const lang of languages) {
    for (const level of levels) {
      const data = await loadVocabData(lang, level);
      
      if (!data) {
        result.skipped++;
        continue;
      }

      const sets = Array.isArray(data) ? data : [data];

      for (const vocabSet of sets) {
        // Validate
        const validationErrors = validateVocabSet(vocabSet, lang, level);
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          if (!validateOnly) {
            console.error(`   ❌ Validation failed for ${lang}/${level} ("${vocabSet.title}"):`, validationErrors);
            continue;
          }
        }

        if (validateOnly) continue;

        // Find existing set
        const existingSet = await db.vocabularySet.findFirst({
          where: {
            title: vocabSet.title,
            language: lang,
            level: level,
          },
        });

        const setData = {
          title: vocabSet.title,
          description: vocabSet.description,
          language: lang,
          difficulty: (vocabSet.difficulty as any) || DIFFICULTY_MAP[level as keyof typeof DIFFICULTY_MAP] || "BEGINNER",
          level: level,
          isActive: true,
          xpReward: vocabSet.xpReward,
          gemReward: vocabSet.gemReward,
          order: vocabSet.order,
          categoryId: languagesCategory?.id,
        };

        if (dryRun) {
          console.log(`   [DRY RUN] Would seed: ${vocabSet.title} (${lang}/${level}) - ${vocabSet.words.length} words`);
          result.totalWords += vocabSet.words.length;
          continue;
        }

        if (existingSet) {
          // Update existing set
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
            data: vocabSet.words.map(w => toPrismaWord(w, existingSet.id, lang, level)),
          });

          result.updated++;
          result.totalWords += vocabSet.words.length;
          console.log(`   🔄 Updated: ${vocabSet.title} (${lang}/${level}) - ${vocabSet.words.length} words`);
        } else {
          // Create new set
          const createdSet = await db.vocabularySet.create({
            data: {
              ...setData,
              isPremium: false,
            },
          });

          await db.vocabularyWord.createMany({
            data: vocabSet.words.map(w => toPrismaWord(w, createdSet.id, lang, level)),
          });

          result.created++;
          result.totalWords += vocabSet.words.length;
          console.log(`   ✅ Created: ${vocabSet.title} (${lang}/${level}) - ${vocabSet.words.length} words`);
        }
      }
    }
  }

  return result;
}
