/**
 * English Vocabulary Seed Script (v2)
 * Uses unified seed architecture with proper word-level difficulty
 * Also audits and rebalances B2 vocabulary
 */

import { PrismaClient } from "@prisma/client";
import { seedVocabulary, loadVocabData } from "./vocab-seed-utils";
import * as enA1 from "../vocab-data/en/a1";
import * as enA2 from "../vocab-data/en/a2";
import * as enB1 from "../vocab-data/en/b1";
import * as enB2 from "../vocab-data/en/b2";
import * as enC1 from "../vocab-data/en/c1";
import * as enC2 from "../vocab-data/en/c2";

const db = new PrismaClient();

async function auditB2Vocabulary() {
  console.log("\n🔍 Auditing B2 English vocabulary...");
  const data = await loadVocabData("en", "B2");
  
  if (!data) {
    console.log("   ❌ No B2 data found");
    return;
  }

  const b2Data = Array.isArray(data) ? data : [data];

  const totalWords = b2Data.reduce((sum, set) => sum + set.words.length, 0);
  console.log(`   Total words in B2: ${totalWords}`);
  console.log(`   Total sets in B2: ${b2Data.length}`);

  // Check for duplicates
  const wordMap = new Map<string, number[]>();
  b2Data.forEach((set, setIdx) => {
    set.words.forEach((word, wordIdx) => {
      const key = word.word.toLowerCase();
      if (!wordMap.has(key)) wordMap.set(key, []);
      wordMap.get(key)!.push(setIdx);
    });
  });

  const duplicates = Array.from(wordMap.entries()).filter(([_, positions]) => positions.length > 1);
  if (duplicates.length > 0) {
    console.log(`   ⚠️  Found ${duplicates.length} duplicate words across sets:`);
    duplicates.slice(0, 10).forEach(([word, positions]) => {
      console.log(`      - "${word}" appears in sets: ${positions.map(i => b2Data[i].title).join(', ')}`);
    });
    if (duplicates.length > 10) console.log(`      ... and ${duplicates.length - 10} more`);
  } else {
    console.log("   ✅ No duplicates found across sets");
  }

  // Check word difficulty distribution
  const diffDist: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  b2Data.forEach(set => {
    set.words.forEach(word => {
      const diff = word.difficulty || "MEDIUM";
      diffDist[diff] = (diffDist[diff] || 0) + 1;
    });
  });
  console.log(`   Word difficulty distribution:`, diffDist);

  // Check for very long/short sets
  b2Data.forEach(set => {
    if (set.words.length > 300) {
      console.log(`   ⚠️  Set "${set.title}" has ${set.words.length} words (consider splitting)`);
    }
    if (set.words.length < 10) {
      console.log(`   ⚠️  Set "${set.title}" has only ${set.words.length} words (consider merging)`);
    }
  });
}

async function seedEnglishVocabularyV2() {
  console.log("🌱 Seeding English Vocabulary (A1-C2) with v2 architecture...\n");

  // First, audit B2
  await auditB2Vocabulary();

  // Check word-level difficulty assignments
  console.log("\n🔧 Checking word-level difficulty assignments...");
  const allLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  
  let totalWordsWithMedium = 0;
  for (const level of allLevels) {
    const data = await loadVocabData("en", level);
    if (!data) continue;
    
    const sets = Array.isArray(data) ? data : [data];
    let levelMediumCount = 0;
    let levelTotalCount = 0;

    sets.forEach(set => {
      set.words.forEach(word => {
        levelTotalCount++;
        if (!word.difficulty || word.difficulty === "MEDIUM") {
          levelMediumCount++;
        }
      });
    });

    if (levelMediumCount === levelTotalCount && levelTotalCount > 0) {
      console.log(`   ⚠️  All words in ${level} are still MEDIUM or missing difficulty`);
      totalWordsWithMedium += levelTotalCount;
    }
  }

  // Run the actual seed
  console.log("\n🚀 Running seed...");
  const result = await seedVocabulary(db, {
    languages: ["en"],
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    replaceExisting: true,
  });

  console.log("\n📊 Seed Summary:");
  console.log(`   - New sets created: ${result.created}`);
  console.log(`   - Sets updated: ${result.updated}`);
  console.log(`   - Sets skipped: ${result.skipped}`);
  console.log(`   - Total words: ${result.totalWords}`);
  if (result.errors.length > 0) {
    console.log(`   - Errors: ${result.errors.length}`);
    result.errors.slice(0, 5).forEach(e => console.log(`     ${e}`));
  }
  console.log("\n✨ English vocabulary seeding completed (v2)!");
}

seedEnglishVocabularyV2()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
