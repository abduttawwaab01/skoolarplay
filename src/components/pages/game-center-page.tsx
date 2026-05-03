'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  Lock,
  Trophy,
  Star,
  Clock,
  Zap,
  Gem,
  ChevronRight,
  Unlock,
  Timer,
  Target,
  BookOpen,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { isFeatureUnlocked } from '@/lib/premium'
import { toast } from 'sonner'
import { WordMatchGame } from '@/components/games/word-match-game'
import { MathChallengeGame } from '@/components/games/math-challenge-game'
import { TypingRaceGame } from '@/components/games/typing-race-game'
import { WordScrambleGame } from '@/components/games/word-scramble-game'
import { MemoryFlipGame } from '@/components/games/memory-flip-game'
import { QuizRaceGame } from '@/components/games/quiz-race-game'
import { SpellingBeeGame } from '@/components/games/spelling-bee-game'
import { AnagramsGame } from '@/components/games/anagrams-game'

interface Game {
  id: string
  title: string
  description: string | null
  type: string
  difficulty: string
  icon: string | null
  color: string | null
  xpReward: number
  gemReward: number
  timeLimit: number | null
  minLevel: number
  userLevel: number
  hasAccess: boolean
  highScore: number
  timesPlayed: number
}

interface GameCenterStatus {
  allowed: boolean
  reason?: string
  lessonsCompleted: number
  timeSpentMinutes: number
  requiredLessons: number
  requiredMinutes: number
  isPremium: boolean
  lessonsRemaining: number
  minutesRemaining: number
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
  EXPERT: 'bg-purple-100 text-purple-700',
}

const GAME_ICONS: Record<string, any> = {
  WORD_MATCH: 'Grid3x3',
  MATH_CHALLENGE: 'Calculator',
  TYPING_RACE: 'Type',
  WORD_SCRAMBLE: 'Shuffle',
  MEMORY_FLIP: 'FlipHorizontal',
  QUIZ_RACE: 'Zap',
  SPELLING_BEE: 'SpellCheck',
  ANAGRAMS: 'ArrowLeftRight',
}

export function GameCenterPage() {
  const { user } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [status, setStatus] = useState<GameCenterStatus | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const hasPremiumAccess = user ? isFeatureUnlocked(
    user.isPremium,
    user.premiumExpiresAt,
    user.unlockedFeatures || [],
    'GAME_CENTER'
  ) : false

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statusRes, gamesRes] = await Promise.all([
        fetch('/api/game-center/status'),
        fetch('/api/games'),
      ])

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setStatus(statusData)
      }

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json()
        setGames(gamesData.games || [])
      }
    } catch (error) {
      toast.error('Failed to load Game Center')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayGame = (game: Game) => {
    if (!game.hasAccess) {
      toast.error(`You need to reach level ${game.minLevel} to play this game`)
      return
    }
    setSelectedGame(game)
  }

  const handleGameComplete = (score: number, timeSpent: number) => {
    setSelectedGame(null)
    fetchData() // Refresh to update high scores
    toast.success(`Game completed! Earned ${score} points`)
  }

  if (selectedGame) {
    return (
      <div className="p-4 md:p-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedGame(null)}
          className="mb-4"
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Game Center
        </Button>
        {selectedGame.type === 'WORD_MATCH' && (
          <WordMatchGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'MATH_CHALLENGE' && (
          <MathChallengeGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'TYPING_RACE' && (
          <TypingRaceGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'WORD_SCRAMBLE' && (
          <WordScrambleGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'MEMORY_FLIP' && (
          <MemoryFlipGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'ANAGRAMS' && (
          <AnagramsGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'QUIZ_RACE' && (
          <QuizRaceGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
        {selectedGame.type === 'SPELLING_BEE' && (
          <SpellingBeeGame
            onComplete={handleGameComplete}
            timeLimit={selectedGame.timeLimit || undefined}
            difficulty={selectedGame.difficulty}
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const isLocked = !status?.allowed && !hasPremiumAccess

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 max-w-6xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-primary" />
          Game Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Learn through play! Complete lessons to unlock games.
        </p>
      </div>

      {/* Lock Status Card */}
      {isLocked && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Game Center Locked</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete lessons and spend time learning to unlock educational games.
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lessons Completed</span>
                      <span className="font-medium">
                        {status?.lessonsCompleted}/{status?.requiredLessons}
                      </span>
                    </div>
                    <Progress
                      value={(status?.lessonsCompleted || 0) / (status?.requiredLessons || 1) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time Spent Learning</span>
                      <span className="font-medium">
                        {status?.timeSpentMinutes}/{status?.requiredMinutes} min
                      </span>
                    </div>
                    <Progress
                      value={(status?.timeSpentMinutes || 0) / (status?.requiredMinutes || 1) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {status?.lessonsRemaining} more lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {status?.minutesRemaining} more minutes
                    </span>
                  </div>
                </div>
              </div>

              {hasPremiumAccess && (
                <Badge className="bg-amber-500">
                  <Unlock className="w-3 h-3 mr-1" />
                  Premium Unlock
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLocked && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-2">
          <Unlock className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">Game Center Unlocked! Enjoy the games below.</span>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, idx) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`h-full transition-all hover:shadow-lg ${
              !game.hasAccess ? 'opacity-60' : 'cursor-pointer hover:border-primary/50'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: game.color || '#6B7280' + '20' }}
                  >
                    <Gamepad2 className="w-6 h-6" style={{ color: game.color || '#6B7280' }} />
                  </div>
                  <Badge className={DIFFICULTY_COLORS[game.difficulty] || ''}>
                    {game.difficulty}
                  </Badge>
                </div>

                <h3 className="font-bold text-lg mb-1">{game.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {game.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {game.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Gem className="w-3 h-3 text-purple-500" />
                    {game.gemReward} Gems
                  </span>
                  {game.timeLimit && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {game.timeLimit}s
                    </span>
                  )}
                </div>

                {game.timesPlayed > 0 && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    <Trophy className="w-3 h-3 inline mr-1" />
                    High Score: {game.highScore} | Played {game.timesPlayed}x
                  </div>
                )}

                {!game.hasAccess ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Requires Level {game.minLevel}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handlePlayGame(game)}
                    disabled={isLocked}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-16">
          <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No Games Available</h3>
          <p className="text-muted-foreground">Check back later for new games!</p>
        </div>
      )}
    </motion.div>
  )
}
