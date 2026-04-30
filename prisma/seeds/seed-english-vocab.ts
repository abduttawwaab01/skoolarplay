import { PrismaClient } from "@prisma/client";
import { englishA1Data } from "../vocab-data/en/a1";
import { englishA2Data } from "../vocab-data/en/a2";
import { englishB1Data } from "../vocab-data/en/b1";
import { englishB2Data } from "../vocab-data/en/b2";
import { englishC1Data } from "../vocab-data/en/c1";
import { englishC2Data } from "../vocab-data/en/c2";

const db = new PrismaClient();

async function seedEnglishVocabulary() {
  console.log("🌱 Seeding English Vocabulary (A1-C2)...\n");

  let languagesCategory = await db.category.findFirst({
    where: { name: "Languages" },
  });

  if (!languagesCategory) {
    languagesCategory = await db.category.create({
      data: {
        name: "Languages",
        description: "Learn Nigerian and international languages",
        icon: "🌍",
        color: "#10B981",
        order: 1,
      },
    });
    console.log("   ✅ Created Languages category");
  }

  const allVocabularyData = [
    ...englishA1Data.map((set) => ({ ...set, level: "A1" as const })),
    ...englishA2Data.map((set) => ({ ...set, level: "A2" as const })),
    ...englishB1Data.map((set) => ({ ...set, level: "B1" as const })),
    ...englishB2Data.map((set) => ({ ...set, level: "B2" as const })),
    ...englishC1Data.map((set) => ({ ...set, level: "C1" as const })),
    ...englishC2Data.map((set) => ({ ...set, level: "C2" as const })),
  ];

  console.log(`   📚 Seeding ${allVocabularyData.length} vocabulary sets...`);

  let totalWords = 0;
  let createdSets = 0;
  let updatedSets = 0;

  for (const setData of allVocabularyData) {
    const existingSet = await db.vocabularySet.findFirst({
      where: {
        title: setData.title,
        language: "en",
        level: setData.level,
      },
    });

    const difficultyMap: Record<string, string> = {
      A1: "BEGINNER",
      A2: "BEGINNER",
      B1: "INTERMEDIATE",
      B2: "INTERMEDIATE",
      C1: "ADVANCED",
      C2: "ADVANCED",
    };

    if (existingSet) {
      await db.vocabularySet.update({
        where: { id: existingSet.id },
        data: {
          description: setData.description,
          difficulty: difficultyMap[setData.level] || "BEGINNER",
          level: setData.level,
          isActive: true,
          xpReward: setData.xpReward,
          gemReward: setData.gemReward,
          order: setData.order,
        },
      });

      await db.vocabularyWord.deleteMany({
        where: { vocabularySetId: existingSet.id },
      });

      await db.vocabularyWord.createMany({
        data: setData.words.map((word) => ({
          vocabularySetId: existingSet.id,
          word: word.word,
          definition: word.definition,
          partOfSpeech: word.partOfSpeech,
          pronunciation: word.pronunciation,
          exampleSentence: word.exampleSentence,
          synonyms: word.synonyms || null,
          antonyms: word.antonyms || null,
          languageCode: "en",
          difficulty: "MEDIUM",
        })),
      });

      updatedSets++;
      totalWords += setData.words.length;
      console.log(`   🔄 Updated: ${setData.title} (${setData.level}) - ${setData.words.length} words`);
    } else {
      const vocabSet = await db.vocabularySet.create({
        data: {
          title: setData.title,
          description: setData.description,
          language: "en",
          difficulty: difficultyMap[setData.level] || "BEGINNER",
          level: setData.level,
          isActive: true,
          isPremium: false,
          order: setData.order,
          xpReward: setData.xpReward,
          gemReward: setData.gemReward,
          categoryId: languagesCategory.id,
        },
      });

      await db.vocabularyWord.createMany({
        data: setData.words.map((word) => ({
          vocabularySetId: vocabSet.id,
          word: word.word,
          definition: word.definition,
          partOfSpeech: word.partOfSpeech,
          pronunciation: word.pronunciation,
          exampleSentence: word.exampleSentence,
          synonyms: word.synonyms || null,
          antonyms: word.antonyms || null,
          languageCode: "en",
          difficulty: "MEDIUM",
        })),
      });

      createdSets++;
      totalWords += setData.words.length;
      console.log(`   ✅ Created: ${setData.title} (${setData.level}) - ${setData.words.length} words`);
    }
  }

  console.log("\n📊 Seeding Summary:");
  console.log(`   - New sets created: ${createdSets}`);
  console.log(`   - Sets updated: ${updatedSets}`);
  console.log(`   - Total vocabulary sets: ${createdSets + updatedSets}`);
  console.log(`   - Total words: ${totalWords}`);
  console.log("\n✨ English vocabulary seeding completed!");
}

seedEnglishVocabulary()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });