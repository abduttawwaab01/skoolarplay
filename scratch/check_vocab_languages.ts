import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log("📊 Vocabulary Language Audit")
  
  const categories = await db.vocabularyCategory.findMany({
    include: {
      _count: {
        select: { sets: true }
      }
    }
  })

  console.log("\n--- Categories ---")
  for (const cat of categories) {
    const wordCount = await db.vocabularyWord.count({
      where: {
        vocabularySet: {
          categoryId: cat.id
        }
      }
    })
    console.log(`- ${cat.name} (${cat.language}): ${cat._count.sets} sets, ${wordCount} words`)
  }

  const setsWithoutCategory = await db.vocabularySet.count({
    where: { categoryId: null }
  })
  console.log(`\n- Sets without category: ${setsWithoutCategory}`)

  const languages = await db.vocabularySet.groupBy({
    by: ['language'],
    _count: { _all: true }
  })

  console.log("\n--- Languages (by Set) ---")
  for (const lang of languages) {
    const wordCount = await db.vocabularyWord.count({
      where: {
        vocabularySet: {
          language: lang.language
        }
      }
    })
    console.log(`- ${lang.language}: ${lang._count._all} sets, ${wordCount} words`)
  }

  const wordsWithMismatchedLang = await db.vocabularyWord.findMany({
    where: {
      NOT: {
        languageCode: null
      }
    },
    include: {
      vocabularySet: true
    },
    take: 10
  })

  if (wordsWithMismatchedLang.length > 0) {
    console.log("\n--- Potential Mismatches (Word languageCode != Set language) ---")
    // Note: VocabularyWord.languageCode might be intended for the native language of the word, 
    // while VocabularySet.language is the target language.
    // Let's check some.
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect()
  })
