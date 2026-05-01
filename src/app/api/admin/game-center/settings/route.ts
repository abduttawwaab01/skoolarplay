import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/admin-auth'

const GAME_TYPES = [
  'WORD_MATCH', 'MATH_CHALLENGE', 'TYPING_RACE', 'WORD_SCRAMBLE',
  'MEMORY_FLIP', 'QUIZ_RACE', 'SPELLING_BEE', 'ANAGRAMS',
]

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings
    let settings = await db.gameCenterSettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await db.gameCenterSettings.create({
        data: {
          minLessonsCompleted: 5,
          minTimeSpentMinutes: 30,
          enablePremiumBypass: true,
          dailyXpCap: 100,
          dailyGemCap: 50,
        },
      })
    }

    // Get all games to build game type configs
    const games = await db.game.findMany({
      where: { isActive: true },
      select: { type: true, difficulty: true, xpReward: true, gemReward: true, timeLimit: true, minLevel: true, isActive: true },
    })

    const gameTypes = GAME_TYPES.map(type => {
      const typeGames = games.filter(g => g.type === type)
      const minLevels: Record<string, number> = {
        EASY: typeGames.find(g => g.difficulty === 'EASY')?.minLevel ?? 1,
        MEDIUM: typeGames.find(g => g.difficulty === 'MEDIUM')?.minLevel ?? 3,
        HARD: typeGames.find(g => g.difficulty === 'HARD')?.minLevel ?? 5,
        EXPERT: typeGames.find(g => g.difficulty === 'EXPERT')?.minLevel ?? 8,
      }

      const baseGame = typeGames.find(g => g.difficulty === 'EASY') ?? typeGames[0]

      return {
        type,
        isActive: typeGames.length > 0,
        xpReward: baseGame?.xpReward ?? 10,
        gemReward: baseGame?.gemReward ?? 1,
        timeLimit: baseGame?.timeLimit ?? 120,
        minLevels,
      }
    })

    return NextResponse.json({
      ...settings,
      gameTypes,
    })
  } catch (error) {
    console.error('Game center settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      minLessonsCompleted,
      minTimeSpentMinutes,
      enablePremiumBypass,
      dailyXpCap,
      dailyGemCap,
      gameConfigs,
    } = body

    // Update GameCenterSettings
    let settings = await db.gameCenterSettings.findFirst()

    if (!settings) {
      settings = await db.gameCenterSettings.create({
        data: {
          minLessonsCompleted: minLessonsCompleted ?? 5,
          minTimeSpentMinutes: minTimeSpentMinutes ?? 30,
          enablePremiumBypass: enablePremiumBypass ?? true,
          dailyXpCap: dailyXpCap ?? 100,
          dailyGemCap: dailyGemCap ?? 50,
        },
      })
    } else {
      settings = await db.gameCenterSettings.update({
        where: { id: settings.id },
        data: {
          minLessonsCompleted,
          minTimeSpentMinutes,
          enablePremiumBypass,
          dailyXpCap,
          dailyGemCap,
        },
      })
    }

    // Update game configurations if provided
    if (gameConfigs) {
      for (const [type, config] of Object.entries(gameConfigs) as [string, { xpReward: number; gemReward: number; timeLimit: number; minLevels: Record<string, number>; isActive: boolean }][]) {
        if (!GAME_TYPES.includes(type)) continue

        // Update games for this type
        for (const [difficulty, minLevel] of Object.entries(config.minLevels)) {
          const game = await db.game.findFirst({
            where: { type, difficulty },
          })

          if (game) {
            await db.game.update({
              where: { id: game.id },
              data: {
                xpReward: config.xpReward,
                gemReward: config.gemReward,
                timeLimit: config.timeLimit,
                minLevel,
                isActive: config.isActive,
              },
            })
          } else if (config.isActive) {
            // Create the game if it doesn't exist but should be active
            await db.game.create({
              data: {
                title: `${type.replace('_', ' ').toLowerCase()} (${difficulty})`,
                type,
                difficulty,
                xpReward: config.xpReward,
                gemReward: config.gemReward,
                timeLimit: config.timeLimit,
                minLevel,
                isActive: true,
              },
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Game center settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
