import { PrismaClient } from "@prisma/client";
import { vocabSetA1Data } from "./vocab-data/english-a1";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding English A1 Vocabulary...");

  // First, ensure we have the Languages category
  let languagesCategory = await db.category.findFirst({
    where: { name: "Languages" }
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

  // Create English A1 vocabulary sets based on thematic topics
  for (const setData of vocabSetA1Data) {
    // Check if set already exists
    const existingSet = await db.vocabularySet.findFirst({
      where: {
        title: setData.title,
        language: "en",
        difficulty: "BEGINNER"
      }
    });

    if (existingSet) {
      console.log(`   ⚠️  Set already exists: ${setData.title}`);
      // Update existing set
      await db.vocabularySet.update({
        where: { id: existingSet.id },
        data: {
          description: setData.description,
          isActive: true,
          xpReward: setData.xpReward,
          gemReward: setData.gemReward,
          order: setData.order,
        }
      });

      // Clear existing words for this set (for clean seeding)
      await db.vocabularyWord.deleteMany({
        where: { vocabularySetId: existingSet.id }
      });

      // Add words
      await db.vocabularyWord.createMany({
        data: setData.words.map(word => ({
          vocabularySetId: existingSet.id,
          word: word.word,
          definition: word.definition,
          partOfSpeech: word.partOfSpeech,
          pronunciation: word.pronunciation,
          exampleSentence: word.exampleSentence,
          languageCode: "en"
        }))
      });

      console.log(`   🔄 Updated set: ${setData.title} (${setData.words.length} words)`);
    } else {
      // Create new vocabulary set
      const vocabSet = await db.vocabularySet.create({
        data: {
          title: setData.title,
          description: setData.description,
          language: "en",
          difficulty: "BEGINNER",
          isActive: true,
          isPremium: false,
          order: setData.order,
          xpReward: setData.xpReward,
          gemReward: setData.gemReward,
          categoryId: languagesCategory.id,
        }
      });

      // Add words to the set
      await db.vocabularyWord.createMany({
        data: setData.words.map(word => ({
          vocabularySetId: vocabSet.id,
          word: word.word,
          definition: word.definition,
          partOfSpeech: word.partOfSpeech,
          pronunciation: word.pronunciation,
          exampleSentence: word.exampleSentence,
          languageCode: "en"
        }))
      });

      console.log(`   ✅ Created set: ${setData.title} (${setData.words.length} words)`);
    }
  }

  console.log("✨ English A1 vocabulary seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });