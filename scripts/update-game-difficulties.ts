// Update existing games to have proper difficulties
import { db } from '../src/lib/db'

async function main() {
  console.log('🔄 Updating game difficulties...')
  
  // Define the games with their proper difficulties
  const gameUpdates = [
    // Word Match
    { type: 'WORD_MATCH', difficulty: 'EASY', minLevel: 1, xpReward: 10, gemReward: 1, timeLimit: 120 },
    { type: 'WORD_MATCH', difficulty: 'MEDIUM', minLevel: 3, xpReward: 15, gemReward: 2, timeLimit: 120 },
    { type: 'WORD_MATCH', difficulty: 'HARD', minLevel: 5, xpReward: 20, gemReward: 3, timeLimit: 120 },
    { type: 'WORD_MATCH', difficulty: 'EXPERT', minLevel: 8, xpReward: 25, gemReward: 4, timeLimit: 120 },
    
    // Math Challenge
    { type: 'MATH_CHALLENGE', difficulty: 'EASY', minLevel: 1, xpReward: 10, gemReward: 1, timeLimit: 120 },
    { type: 'MATH_CHALLENGE', difficulty: 'MEDIUM', minLevel: 3, xpReward: 15, gemReward: 2, timeLimit: 120 },
    { type: 'MATH_CHALLENGE', difficulty: 'HARD', minLevel: 5, xpReward: 20, gemReward: 3, timeLimit: 120 },
    { type: 'MATH_CHALLENGE', difficulty: 'EXPERT', minLevel: 8, xpReward: 25, gemReward: 4, timeLimit: 120 },
    
    // Typing Race
    { type: 'TYPING_RACE', difficulty: 'EASY', minLevel: 1, xpReward: 10, gemReward: 1, timeLimit: 60 },
    { type: 'TYPING_RACE', difficulty: 'MEDIUM', minLevel: 3, xpReward: 15, gemReward: 2, timeLimit: 60 },
    { type: 'TYPING_RACE', difficulty: 'HARD', minLevel: 5, xpReward: 20, gemReward: 3, timeLimit: 60 },
    { type: 'TYPING_RACE', difficulty: 'EXPERT', minLevel: 8, xpReward: 25, gemReward: 4, timeLimit: 60 },
    
    // Word Scramble
    { type: 'WORD_SCRAMBLE', difficulty: 'EASY', minLevel: 1, xpReward: 10, gemReward: 1, timeLimit: 120 },
    { type: 'WORD_SCRAMBLE', difficulty: 'MEDIUM', minLevel: 3, xpReward: 15, gemReward: 2, timeLimit: 120 },
    { type: 'WORD_SCRAMBLE', difficulty: 'HARD', minLevel: 5, xpReward: 20, gemReward: 3, timeLimit: 120 },
    { type: 'WORD_SCRAMBLE', difficulty: 'EXPERT', minLevel: 8, xpReward: 25, gemReward: 4, timeLimit: 120 },
    
    // Memory Flip
    { type: 'MEMORY_FLIP', difficulty: 'EASY', minLevel: 1, xpReward: 10, gemReward: 1, timeLimit: 90 },
    { type: 'MEMORY_FLIP', difficulty: 'MEDIUM', minLevel: 3, xpReward: 15, gemReward: 2, timeLimit: 90 },
    { type: 'MEMORY_FLIP', difficulty: 'HARD', minLevel: 5, xpReward: 20, gemReward: 3, timeLimit: 90 },
    { type: 'MEMORY_FLIP', difficulty: 'EXPERT', minLevel: 8, xpReward: 25, gemReward: 4, timeLimit: 90 },
    
    // Quiz Race
    { type: 'QUIZ_RACE', difficulty: 'EASY', minLevel: 1, xpReward: 10, gemReward: 1, timeLimit: 60 },
    { type: 'QUIZ_RACE', difficulty: 'MEDIUM', minLevel: 3, xpReward: 15, gemReward: 2, timeLimit: 60 },
    { type: 'QUIZ_RACE', difficulty: 'HARD', minLevel: 5, xpReward: 20, gemReward: 3, timeLimit: 60 },
    { type: 'QUIZ_RACE', difficulty: 'EXPERT', minLevel: 8, xpReward: 25, gemReward: 4, timeLimit: 60 },
    
    // Spelling Bee
    { type: 'SPELLING_BEE', difficulty: 'EASY', minLevel: 1, xpReward: 15, gemReward: 2, timeLimit: 120 },
    { type: 'SPELLING_BEE', difficulty: 'MEDIUM', minLevel: 3, xpReward: 20, gemReward: 3, timeLimit: 120 },
    { type: 'SPELLING_BEE', difficulty: 'HARD', minLevel: 5, xpReward: 25, gemReward: 4, timeLimit: 120 },
    { type: 'SPELLING_BEE', difficulty: 'EXPERT', minLevel: 8, xpReward: 30, gemReward: 5, timeLimit: 120 },
    
    // Anagrams
    { type: 'ANAGRAMS', difficulty: 'EASY', minLevel: 1, xpReward: 15, gemReward: 2, timeLimit: 120 },
    { type: 'ANAGRAMS', difficulty: 'MEDIUM', minLevel: 3, xpReward: 20, gemReward: 3, timeLimit: 120 },
    { type: 'ANAGRAMS', difficulty: 'HARD', minLevel: 5, xpReward: 25, gemReward: 4, timeLimit: 120 },
    { type: 'ANAGRAMS', difficulty: 'EXPERT', minLevel: 8, xpReward: 30, gemReward: 5, timeLimit: 120 },
  ]
  
  for (const gameData of gameUpdates) {
    // Check if this specific game difficulty already exists
    const existing = await db.game.findFirst({
      where: {
        type: gameData.type,
        difficulty: gameData.difficulty
      }
    })
    
    if (existing) {
      // Update existing game
      await db.game.update({
        where: { id: existing.id },
        data: {
          minLevel: gameData.minLevel,
          xpReward: gameData.xpReward,
          gemReward: gameData.gemReward,
          timeLimit: gameData.timeLimit,
          // Update title to reflect difficulty
          title: `${gameData.type.replace('_', ' ')} (${gameData.difficulty})`
        }
      })
      console.log(`✅ Updated ${gameData.type} (${gameData.difficulty})`)
    } else {
      // Create new game entry
      await db.game.create({
        data: {
          type: gameData.type,
          difficulty: gameData.difficulty,
          title: `${gameData.type.replace('_', ' ')} (${gameData.difficulty})`,
          description: getDescription(gameData.type, gameData.difficulty),
          icon: getIcon(gameData.type),
          color: getColor(gameData.type),
          xpReward: gameData.xpReward,
          gemReward: gameData.gemReward,
          timeLimit: gameData.timeLimit,
          minLevel: gameData.minLevel,
          sortOrder: getSortOrder(gameData.type, gameData.difficulty),
          isActive: true
        }
      })
      console.log(`✅ Created ${gameData.type} (${gameData.difficulty})`)
    }
  }
  
  console.log('🎉 Game difficulty updates complete!')
}

function getDescription(type: string, difficulty: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    WORD_MATCH: {
      EASY: 'Match simple words with their definitions',
      MEDIUM: 'Match moderate vocabulary words with definitions',
      HARD: 'Match challenging words with their definitions',
      EXPERT: 'Match complex and obscure words with definitions'
    },
    MATH_CHALLENGE: {
      EASY: 'Solve basic arithmetic problems',
      MEDIUM: 'Solve intermediate math problems',
      HARD: 'Solve advanced arithmetic and algebraic problems',
      EXPERT: 'Solve complex mathematical problems'
    },
    TYPING_RACE: {
      EASY: 'Type simple sentences quickly',
      MEDIUM: 'Type moderate sentences with good speed',
      HARD: 'Type complex sentences accurately and fast',
      EXPERT: 'Type expert-level sentences with high speed and accuracy'
    },
    WORD_SCRAMBLE: {
      EASY: 'Unscramble simple words',
      MEDIUM: 'Unscramble moderate difficulty words',
      HARD: 'Unscramble challenging words',
      EXPERT: 'Unscramble expert-level complex words'
    },
    MEMORY_FLIP: {
      EASY: 'Match pairs of simple emojis',
      MEDIUM: 'Match pairs of moderate complexity emojis',
      HARD: 'Match pairs of challenging emoji sets',
      EXPERT: 'Match pairs of expert-level emoji combinations'
    },
    QUIZ_RACE: {
      EASY: 'Answer basic general knowledge questions',
      MEDIUM: 'Answer intermediate general knowledge questions',
      HARD: 'Answer advanced general knowledge questions',
      EXPERT: 'Answer expert-level general knowledge questions'
    },
    SPELLING_BEE: {
      EASY: 'Spell simple words correctly',
      MEDIUM: 'Spell moderate difficulty words correctly',
      HARD: 'Spell challenging words correctly',
      EXPERT: 'Spell expert-level complex words correctly'
    },
    ANAGRAMS: {
      EASY: 'Rearrange letters to form simple words',
      MEDIUM: 'Rearrange letters to form moderate words',
      HARD: 'Rearrange letters to form challenging words',
      EXPERT: 'Rearrange letters to form expert-level complex words'
    }
  }
  
  return descriptions[type]?.[difficulty] || `Play the ${difficulty} level of ${type.replace('_', ' ')}`
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    WORD_MATCH: 'Grid3x3',
    MATH_CHALLENGE: 'Calculator',
    TYPING_RACE: 'Type',
    WORD_SCRAMBLE: 'Shuffle',
    MEMORY_FLIP: 'FlipHorizontal',
    QUIZ_RACE: 'Zap',
    SPELLING_BEE: 'SpellCheck',
    ANAGRAMS: 'ArrowLeftRight'
  }
  
  return icons[type] || 'Gamepad2'
}

function getColor(type: string): string {
  const colors: Record<string, string> = {
    WORD_MATCH: '#3B82F6', // blue
    MATH_CHALLENGE: '#10B981', // green
    TYPING_RACE: '#8B5CF6', // purple
    WORD_SCRAMBLE: '#F59E0B', // amber
    MEMORY_FLIP: '#EC4899', // pink
    QUIZ_RACE: '#EF4444', // red
    SPELLING_BEE: '#06B6D4', // cyan
    ANAGRAMS: '#14B8A6' // teal
  }
  
  return colors[type] || '#6B7280'
}

function getSortOrder(type: string, difficulty: string): number {
  const typeOrder: Record<string, number> = {
    WORD_MATCH: 1,
    MATH_CHALLENGE: 2,
    TYPING_RACE: 3,
    WORD_SCRAMBLE: 4,
    MEMORY_FLIP: 5,
    QUIZ_RACE: 6,
    SPELLING_BEE: 7,
    ANAGRAMS: 8
  }
  
  const difficultyOrder: Record<string, number> = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
    EXPERT: 3
  }
  
  return (typeOrder[type] || 0) * 4 + difficultyOrder[difficulty] + 1
}

main()
  .catch((e) => {
    console.error('❌ Error updating games:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })