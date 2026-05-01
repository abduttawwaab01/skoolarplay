// Seed initial games for Game Center
import { db } from '../src/lib/db'

const GAMES = [
  // Word Match - All difficulties
  {
    title: 'Word Match (Easy)',
    description: 'Match words with their correct definitions',
    type: 'WORD_MATCH',
    difficulty: 'EASY',
    icon: 'Grid3x3',
    color: '#3B82F6', // blue
    xpReward: 10,
    gemReward: 1,
    timeLimit: 120,
    minLevel: 1,
    sortOrder: 1,
  },
  {
    title: 'Word Match (Medium)',
    description: 'Match words with their correct definitions',
    type: 'WORD_MATCH',
    difficulty: 'MEDIUM',
    icon: 'Grid3x3',
    color: '#3B82F6', // blue
    xpReward: 15,
    gemReward: 2,
    timeLimit: 120,
    minLevel: 3,
    sortOrder: 2,
  },
  {
    title: 'Word Match (Hard)',
    description: 'Match words with their correct definitions',
    type: 'WORD_MATCH',
    difficulty: 'HARD',
    icon: 'Grid3x3',
    color: '#3B82F6', // blue
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 5,
    sortOrder: 3,
  },
  {
    title: 'Word Match (Expert)',
    description: 'Match words with their correct definitions',
    type: 'WORD_MATCH',
    difficulty: 'EXPERT',
    icon: 'Grid3x3',
    color: '#3B82F6', // blue
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 8,
    sortOrder: 4,
  },
  
  // Math Challenge - All difficulties
  {
    title: 'Math Challenge (Easy)',
    description: 'Solve math problems under time pressure',
    type: 'MATH_CHALLENGE',
    difficulty: 'EASY',
    icon: 'Calculator',
    color: '#10B981', // green
    xpReward: 10,
    gemReward: 1,
    timeLimit: 120,
    minLevel: 1,
    sortOrder: 5,
  },
  {
    title: 'Math Challenge (Medium)',
    description: 'Solve math problems under time pressure',
    type: 'MATH_CHALLENGE',
    difficulty: 'MEDIUM',
    icon: 'Calculator',
    color: '#10B981', // green
    xpReward: 15,
    gemReward: 2,
    timeLimit: 120,
    minLevel: 3,
    sortOrder: 6,
  },
  {
    title: 'Math Challenge (Hard)',
    description: 'Solve math problems under time pressure',
    type: 'MATH_CHALLENGE',
    difficulty: 'HARD',
    icon: 'Calculator',
    color: '#10B981', // green
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 5,
    sortOrder: 7,
  },
  {
    title: 'Math Challenge (Expert)',
    description: 'Solve math problems under time pressure',
    type: 'MATH_CHALLENGE',
    difficulty: 'EXPERT',
    icon: 'Calculator',
    color: '#10B981', // green
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 8,
    sortOrder: 8,
  },
  
  // Typing Race - All difficulties
  {
    title: 'Typing Race (Easy)',
    description: 'Type sentences as fast as you can',
    type: 'TYPING_RACE',
    difficulty: 'EASY',
    icon: 'Type',
    color: '#8B5CF6', // purple
    xpReward: 10,
    gemReward: 1,
    timeLimit: 60,
    minLevel: 1,
    sortOrder: 9,
  },
  {
    title: 'Typing Race (Medium)',
    description: 'Type sentences as fast as you can',
    type: 'TYPING_RACE',
    difficulty: 'MEDIUM',
    icon: 'Type',
    color: '#8B5CF6', // purple
    xpReward: 15,
    gemReward: 2,
    timeLimit: 60,
    minLevel: 3,
    sortOrder: 10,
  },
  {
    title: 'Typing Race (Hard)',
    description: 'Type sentences as fast as you can',
    type: 'TYPING_RACE',
    difficulty: 'HARD',
    icon: 'Type',
    color: '#8B5CF6', // purple
    xpReward: 20,
    gemReward: 3,
    timeLimit: 60,
    minLevel: 5,
    sortOrder: 11,
  },
  {
    title: 'Typing Race (Expert)',
    description: 'Type sentences as fast as you can',
    type: 'TYPING_RACE',
    difficulty: 'EXPERT',
    icon: 'Type',
    color: '#8B5CF6', // purple
    xpReward: 25,
    gemReward: 4,
    timeLimit: 60,
    minLevel: 8,
    sortOrder: 12,
  },
  
  // Word Scramble - All difficulties
  {
    title: 'Word Scramble (Easy)',
    description: 'Unscramble the letters to form the correct word',
    type: 'WORD_SCRAMBLE',
    difficulty: 'EASY',
    icon: 'Shuffle',
    color: '#F59E0B', // amber
    xpReward: 10,
    gemReward: 1,
    timeLimit: 120,
    minLevel: 1,
    sortOrder: 13,
  },
  {
    title: 'Word Scramble (Medium)',
    description: 'Unscramble the letters to form the correct word',
    type: 'WORD_SCRAMBLE',
    difficulty: 'MEDIUM',
    icon: 'Shuffle',
    color: '#F59E0B', // amber
    xpReward: 15,
    gemReward: 2,
    timeLimit: 120,
    minLevel: 3,
    sortOrder: 14,
  },
  {
    title: 'Word Scramble (Hard)',
    description: 'Unscramble the letters to form the correct word',
    type: 'WORD_SCRAMBLE',
    difficulty: 'HARD',
    icon: 'Shuffle',
    color: '#F59E0B', // amber
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 5,
    sortOrder: 15,
  },
  {
    title: 'Word Scramble (Expert)',
    description: 'Unscramble the letters to form the correct word',
    type: 'WORD_SCRAMBLE',
    difficulty: 'EXPERT',
    icon: 'Shuffle',
    color: '#F59E0B', // amber
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 8,
    sortOrder: 16,
  },
  
  // Memory Flip - All difficulties
  {
    title: 'Memory Flip (Easy)',
    description: 'Find matching pairs by flipping cards',
    type: 'MEMORY_FLIP',
    difficulty: 'EASY',
    icon: 'FlipHorizontal',
    color: '#EC4899', // pink
    xpReward: 10,
    gemReward: 1,
    timeLimit: 90,
    minLevel: 1,
    sortOrder: 17,
  },
  {
    title: 'Memory Flip (Medium)',
    description: 'Find matching pairs by flipping cards',
    type: 'MEMORY_FLIP',
    difficulty: 'MEDIUM',
    icon: 'FlipHorizontal',
    color: '#EC4899', // pink
    xpReward: 15,
    gemReward: 2,
    timeLimit: 90,
    minLevel: 3,
    sortOrder: 18,
  },
  {
    title: 'Memory Flip (Hard)',
    description: 'Find matching pairs by flipping cards',
    type: 'MEMORY_FLIP',
    difficulty: 'HARD',
    icon: 'FlipHorizontal',
    color: '#EC4899', // pink
    xpReward: 20,
    gemReward: 3,
    timeLimit: 90,
    minLevel: 5,
    sortOrder: 19,
  },
  {
    title: 'Memory Flip (Expert)',
    description: 'Find matching pairs by flipping cards',
    type: 'MEMORY_FLIP',
    difficulty: 'EXPERT',
    icon: 'FlipHorizontal',
    color: '#EC4899', // pink
    xpReward: 25,
    gemReward: 4,
    timeLimit: 90,
    minLevel: 8,
    sortOrder: 20,
  },
  
  // Quiz Race - All difficulties
  {
    title: 'Quiz Race (Easy)',
    description: 'Answer general knowledge questions quickly',
    type: 'QUIZ_RACE',
    difficulty: 'EASY',
    icon: 'Zap',
    color: '#EF4444', // red
    xpReward: 10,
    gemReward: 1,
    timeLimit: 60,
    minLevel: 1,
    sortOrder: 21,
  },
  {
    title: 'Quiz Race (Medium)',
    description: 'Answer general knowledge questions quickly',
    type: 'QUIZ_RACE',
    difficulty: 'MEDIUM',
    icon: 'Zap',
    color: '#EF4444', // red
    xpReward: 15,
    gemReward: 2,
    timeLimit: 60,
    minLevel: 3,
    sortOrder: 22,
  },
  {
    title: 'Quiz Race (Hard)',
    description: 'Answer general knowledge questions quickly',
    type: 'QUIZ_RACE',
    difficulty: 'HARD',
    icon: 'Zap',
    color: '#EF4444', // red
    xpReward: 20,
    gemReward: 3,
    timeLimit: 60,
    minLevel: 5,
    sortOrder: 23,
  },
  {
    title: 'Quiz Race (Expert)',
    description: 'Answer general knowledge questions quickly',
    type: 'QUIZ_RACE',
    difficulty: 'EXPERT',
    icon: 'Zap',
    color: '#EF4444', // red
    xpReward: 25,
    gemReward: 4,
    timeLimit: 60,
    minLevel: 8,
    sortOrder: 24,
  },
  
  // Spelling Bee - All difficulties
  {
    title: 'Spelling Bee (Easy)',
    description: 'Spell words correctly to earn points',
    type: 'SPELLING_BEE',
    difficulty: 'EASY',
    icon: 'SpellCheck',
    color: '#06B6D4', // cyan
    xpReward: 15,
    gemReward: 2,
    timeLimit: 120,
    minLevel: 1,
    sortOrder: 25,
  },
  {
    title: 'Spelling Bee (Medium)',
    description: 'Spell words correctly to earn points',
    type: 'SPELLING_BEE',
    difficulty: 'MEDIUM',
    icon: 'SpellCheck',
    color: '#06B6D4', // cyan
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 3,
    sortOrder: 26,
  },
  {
    title: 'Spelling Bee (Hard)',
    description: 'Spell words correctly to earn points',
    type: 'SPELLING_BEE',
    difficulty: 'HARD',
    icon: 'SpellCheck',
    color: '#06B6D4', // cyan
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 5,
    sortOrder: 27,
  },
  {
    title: 'Spelling Bee (Expert)',
    description: 'Spell words correctly to earn points',
    type: 'SPELLING_BEE',
    difficulty: 'EXPERT',
    icon: 'SpellCheck',
    color: '#06B6D4', // cyan
    xpReward: 30,
    gemReward: 5,
    timeLimit: 120,
    minLevel: 8,
    sortOrder: 28,
  },
  
  // Anagrams - All difficulties
  {
    title: 'Anagrams (Easy)',
    description: 'Rearrange letters to form new words',
    type: 'ANAGRAMS',
    difficulty: 'EASY',
    icon: 'ArrowLeftRight',
    color: '#14B8A6', // teal
    xpReward: 15,
    gemReward: 2,
    timeLimit: 120,
    minLevel: 1,
    sortOrder: 29,
  },
  {
    title: 'Anagrams (Medium)',
    description: 'Rearrange letters to form new words',
    type: 'ANAGRAMS',
    difficulty: 'MEDIUM',
    icon: 'ArrowLeftRight',
    color: '#14B8A6', // teal
    xpReward: 20,
    gemReward: 3,
    timeLimit: 120,
    minLevel: 3,
    sortOrder: 30,
  },
  {
    title: 'Anagrams (Hard)',
    description: 'Rearrange letters to form new words',
    type: 'ANAGRAMS',
    difficulty: 'HARD',
    icon: 'ArrowLeftRight',
    color: '#14B8A6', // teal
    xpReward: 25,
    gemReward: 4,
    timeLimit: 120,
    minLevel: 5,
    sortOrder: 31,
  },
  {
    title: 'Anagrams (Expert)',
    description: 'Rearrange letters to form new words',
    type: 'ANAGRAMS',
    difficulty: 'EXPERT',
    icon: 'ArrowLeftRight',
    color: '#14B8A6', // teal
    xpReward: 30,
    gemReward: 5,
    timeLimit: 120,
    minLevel: 8,
    sortOrder: 32,
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
