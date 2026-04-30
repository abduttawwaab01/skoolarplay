// Seed initial games for Game Center
import { db } from '../src/lib/db'

const GAMES = [
  {
    title: 'Word Match',
    description: 'Match words with their correct definitions',
    type: 'WORD_MATCH',
    difficulty: 'EASY',
    icon: 'Grid3x3',
    color: '#3B82F6', // blue
    xpReward: 15,
    gemReward: 2,
    timeLimit: 120,
    minLevel: 1,
    sortOrder: 1,
  },
  {
    title: 'Math Challenge',
    description: 'Solve math problems under time pressure',
    type: 'MATH_CHALLENGE',
    difficulty: 'MEDIUM',
    icon: 'Calculator',
    color: '#10B981', // green
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 2,
    sortOrder: 2,
  },
  {
    title: 'Typing Race',
    description: 'Type sentences as fast as you can',
    type: 'TYPING_RACE',
    difficulty: 'EASY',
    icon: 'Type',
    color: '#8B5CF6', // purple
    xpReward: 15,
    gemReward: 2,
    timeLimit: 60,
    minLevel: 1,
    sortOrder: 3,
  },
  {
    title: 'Word Scramble',
    description: 'Unscramble the letters to form the correct word',
    type: 'WORD_SCRAMBLE',
    difficulty: 'MEDIUM',
    icon: 'Shuffle',
    color: '#F59E0B', // amber
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 2,
    sortOrder: 4,
  },
  {
    title: 'Memory Flip',
    description: 'Find matching pairs by flipping cards',
    type: 'MEMORY_FLIP',
    difficulty: 'EASY',
    icon: 'FlipHorizontal',
    color: '#EC4899', // pink
    xpReward: 15,
    gemReward: 2,
    timeLimit: 90,
    minLevel: 1,
    sortOrder: 5,
  },
  {
    title: 'Quiz Race',
    description: 'Answer general knowledge questions quickly',
    type: 'QUIZ_RACE',
    difficulty: 'MEDIUM',
    icon: 'Zap',
    color: '#EF4444', // red
    xpReward: 20,
    gemReward: 3,
    timeLimit: 60,
    minLevel: 3,
    sortOrder: 6,
  },
  {
    title: 'Spelling Bee',
    description: 'Spell words correctly to earn points',
    type: 'SPELLING_BEE',
    difficulty: 'HARD',
    icon: 'SpellCheck',
    color: '#06B6D4', // cyan
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 4,
    sortOrder: 7,
  },
  {
    title: 'Anagrams',
    description: 'Rearrange letters to form new words',
    type: 'ANAGRAMS',
    difficulty: 'HARD',
    icon: 'ArrowLeftRight',
    color: '#14B8A6', // teal
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 5,
    sortOrder: 8,
  },
]

async function main() {
  console.log('🎮 Seeding Game Center games...')

  // Create Game Center Settings if not exists
  const existingSettings = await db.gameCenterSettings.findFirst()
  if (!existingSettings) {
    await db.gameCenterSettings.create({
      data: {
        minLessonsCompleted: 5,
        minTimeSpentMinutes: 30,
        enablePremiumBypass: true,
        dailyXpCap: 100,
        dailyGemCap: 50,
      },
    })
    console.log('✅ Created Game Center settings')
  }

  // Seed games
  for (const game of GAMES) {
    const existing = await db.game.findFirst({
      where: { type: game.type },
    })

    if (!existing) {
      await db.game.create({
        data: game,
      })
      console.log(`✅ Created game: ${game.title}`)
    } else {
      console.log(`⏭ Game already exists: ${game.title}`)
    }
  }

  console.log('🎉 Game Center seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding games:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
