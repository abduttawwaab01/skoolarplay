'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Skull, Clock, Zap, Gem, Heart, Shield, Trophy, RotateCcw, Star, Sparkles, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'
import { QuotePreloader } from '@/components/shared/quote-preloader'
import { isFeatureUnlocked } from '@/lib/premium'

interface BossBattleInfo {
  id: string
  title: string
  description: string
  difficulty: string
  hp: number
  xpReward: number
  gemReward: number
  timeLimit: number
  completed: boolean
  bestScore: number
  bestDamage: number
}

interface Question {
  id: string
  question: string
  type: string
  options: string | null
  correctAnswer: string
  points: number
  hint: string | null
  explanation: string | null
}

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  EASY: { color: 'text-green-600', bg: 'bg-green-100', label: 'Easy' },
  NORMAL: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Normal' },
  HARD: { color: 'text-red-600', bg: 'bg-red-100', label: 'Hard' },
  LEGENDARY: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Legendary' },
}

export function BossBattlePage() {
  const { user, updateGems, updateXP, updateUser } = useAuthStore()
  const { navigateTo, goBack } = useAppStore()
  const playBossIntro = useSoundEffect('bossIntro')
  const playBossAttack = useSoundEffect('bossAttack')
  const playBossDefeat = useSoundEffect('bossDefeat')
  const playBossHit = useSoundEffect('bossHit')
  const playPowerUp = useSoundEffect('powerUp')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')

  // List state - always call hooks first
  const [bosses, setBosses] = useState<BossBattleInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Battle state - always call hooks before any conditional returns
  const [inBattle, setInBattle] = useState(false)
  const [currentBoss, setCurrentBoss] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [bossHp, setBossHp] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [battleAnswers, setBattleAnswers] = useState<Array<{ questionId: string; answer: string }>>([])
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null)
  const [showQuoteLoader, setShowQuoteLoader] = useState(true)

  // Check premium access
  const hasPremiumAccess = user ? isFeatureUnlocked(
    user.isPremium,
    user.premiumExpiresAt,
    user.unlockedFeatures,
    'BOSS_BATTLES'
  ) : false

  const fetchBosses = useCallback(async () => {
    try {
      const res = await fetch('/api/boss-battles')
      const data = await res.json()
      setBosses(data.bossBattles || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!showQuoteLoader) {
      fetchBosses()
    }
  }, [fetchBosses, showQuoteLoader])

  const handleQuoteComplete = useCallback(() => {
    setShowQuoteLoader(false)
  }, [])

  // Timer
  useEffect(() => {
    if (!inBattle || timeLeft <= 0 || battleResult) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setBattleResult('defeat')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [inBattle, timeLeft, battleResult])

  // Show premium gate for non-premium users
  if (user && !hasPremiumAccess) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-gray-500 mb-6">Boss Battles require a Premium subscription.</p>
          <Button onClick={() => navigateTo('profile')}>Upgrade to Premium</Button>
        </div>
      </div>
    )
  }

  const startBattle = async (bossId: string) => {
    try {
      const res = await fetch(`/api/boss-battles/${bossId}/start`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to start battle')
        return
      }

      setCurrentBoss(data.boss)
      setQuestions(data.questions)
      setBossHp(data.boss.hp)
      setTimeLeft(data.boss.timeLimit)
      setScore(0)
      setHearts(3)
      setCurrentQuestionIndex(0)
      setAnswerState('idle')
      setBattleResult(null)
      setBattleAnswers([])
      setInBattle(true)
      playBossIntro()
    } catch {
      toast.error('Failed to start battle')
    }
  }

  const handleAnswer = async (answer: string) => {
    if (answerState !== 'idle') return

    const currentQ = questions[currentQuestionIndex]
    const correct = JSON.parse(currentQ.correctAnswer)
    const isCorrect = answer === correct || (Array.isArray(correct) && correct.includes(answer))

    // Track the answer for server-side verification
    setBattleAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, answer },
    ])

    if (isCorrect) {
      setAnswerState('correct')
      setSelectedAnswer(answer)
      playCorrect()
      playBossHit()
      const damage = currentQ.points || 10
      setBossHp((prev) => Math.max(0, prev - damage))
      setScore((prev) => prev + currentQ.points)

      setTimeout(() => {
        if (bossHp - damage <= 0) {
          setBattleResult('victory')
          playBossDefeat()
        } else {
          setAnswerState('idle')
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
          } else {
            setBattleResult('defeat')
          }
        }
      }, 1000)
    } else {
      setAnswerState('wrong')
      setSelectedAnswer(answer)
      playWrong()
      playBossAttack()
      setHearts((prev) => prev - 1)

      setTimeout(() => {
        if (hearts <= 1) {
          setBattleResult('defeat')
        } else {
          setAnswerState('idle')
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
          } else {
            setBattleResult('defeat')
          }
        }
      }, 1000)
    }
  }

  const completeBattle = async () => {
    if (!currentBoss) return

    try {
      const res = await fetch(`/api/boss-battles/${currentBoss.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: battleAnswers }),
      })

      const data = await res.json()

       if (data.xpEarned) updateXP(data.xpEarned)
       if (data.gemsEarned) updateGems(data.gemsEarned)
       if (data.user?.hearts !== undefined) {
         updateUser({ hearts: data.user.hearts })
       }

       setInBattle(false)
      fetchBosses()
    } catch {
      toast.error('Failed to record battle')
    }
  }

  const exitBattle = () => {
    setInBattle(false)
    setBattleResult(null)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  // Battle Mode
  if (inBattle && currentBoss) {
    const currentQ = questions[currentQuestionIndex]
    const options = currentQ?.options ? JSON.parse(currentQ.options) : []
    const diffConfig = DIFFICULTY_CONFIG[currentBoss.difficulty] || DIFFICULTY_CONFIG.NORMAL
    const hpPercent = (bossHp / currentBoss.hp) * 100

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
        {/* Boss HP Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500" />
              <span className="font-bold">{currentBoss.title}</span>
              <Badge className={`${diffConfig.bg} ${diffConfig.color} text-xs border-0`}>
                {diffConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-red-400">❤️ {hearts}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </span>
            </div>
          </div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <motion.div
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${hpPercent > 50 ? 'bg-red-500' : hpPercent > 25 ? 'bg-orange-500' : 'bg-red-600'}`}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">Boss HP: {bossHp}/{currentBoss.hp}</p>
        </div>

        {/* Question */}
        {currentQ && !battleResult && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-xs">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </Badge>
                <span className="text-amber-400 font-bold">+{currentQ.points} pts</span>
              </div>

              <h3 className="text-lg font-semibold mb-6">{currentQ.question}</h3>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map((option: string, i: number) => {
                  const letter = String.fromCharCode(65 + i)
                  const isSelected = answerState !== 'idle'
                  const correct = JSON.parse(currentQ.correctAnswer)
                  const isThisCorrect = option === correct
                  const isWrong = answerState === 'wrong' && option === selectedAnswer

                  return (
                    <motion.button
                      key={i}
                      whileHover={!isSelected ? { scale: 1.02 } : {}}
                      whileTap={!isSelected ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(option)}
                      disabled={isSelected}
                      className={`p-4 rounded-xl border-2 text-left transition-all font-medium ${answerState === 'correct' && isThisCorrect
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : answerState === 'wrong' && isThisCorrect
                            ? 'border-green-500 bg-green-500/20 text-green-300'
                            : isWrong
                              ? 'border-red-500 bg-red-500/20 text-red-300'
                              : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                        }`}
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-xs mr-2">
                        {letter}
                      </span>
                      {option}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Answer feedback */}
            <AnimatePresence>
              {answerState !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl text-center font-bold ${answerState === 'correct'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                      : 'bg-red-500/20 border border-red-500/30 text-red-300'
                    }`}
                >
                  {answerState === 'correct' ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Correct! Boss takes damage!
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ x: [-5, 5, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Skull className="w-5 h-5" />
                      Wrong! Boss attacks you!
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Victory Screen */}
        <AnimatePresence>
          {battleResult === 'victory' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 2 }}
                className="text-7xl mb-4"
              >
                🏆
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-[#F59E0B]">BOSS DEFEATED!</h2>
              <p className="text-gray-400 mb-6">You conquered {currentBoss.title}!</p>

              <div className="flex justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span className="text-2xl font-bold">+{currentBoss.xpReward}</span>
                  </div>
                  <p className="text-xs text-gray-400">XP</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Gem className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-bold">+{currentBoss.gemReward}</span>
                  </div>
                  <p className="text-xs text-gray-400">Gems</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold">{score}</span>
                  </div>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </div>

              <Button
                onClick={completeBattle}
                className="rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold px-8"
              >
                Collect Rewards
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Defeat Screen */}
        <AnimatePresence>
          {battleResult === 'defeat' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                className="text-7xl mb-4"
              >
                💀
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-red-400">DEFEATED!</h2>
              <p className="text-gray-400 mb-6">
                {hearts <= 0 ? 'You ran out of hearts!' : 'Time ran out!'}
              </p>

              <div className="flex justify-center gap-6 mb-8">
                <div className="text-center">
                  <span className="text-2xl font-bold">{score}</span>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold">{currentBoss.hp - bossHp}/{currentBoss.hp}</span>
                  <p className="text-xs text-gray-400">Damage</p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => startBattle(currentBoss.id)}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={completeBattle}
                  variant="outline"
                  className="rounded-full text-gray-300 border-gray-600"
                >
                  Exit Battle
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Show motivational quote preloader
  if (showQuoteLoader) {
    return <QuotePreloader show={true} onComplete={handleQuoteComplete} />
  }

  // Boss Selection Screen
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-red-900 p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-red-500/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-[#F59E0B]/10 translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl"
            >
              ⚔️
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Boss Battles</h1>
              <p className="text-white/80 text-sm">Challenge powerful bosses for epic rewards!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Boss Cards */}
      {bosses.length > 0 ? (
        <div className="space-y-4">
          {bosses.map((boss, i) => {
            const diffConfig = DIFFICULTY_CONFIG[boss.difficulty] || DIFFICULTY_CONFIG.NORMAL

            return (
              <motion.div
                key={boss.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={`rounded-xl border p-5 transition-all ${boss.completed
                    ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'
                    : 'bg-card border-border hover:shadow-lg'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={boss.completed ? {} : { rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl shrink-0"
                    >
                      {boss.difficulty === 'LEGENDARY' ? '🐉' :
                        boss.difficulty === 'HARD' ? '💀' :
                          boss.difficulty === 'EASY' ? '👾' : '👾'}
                    </motion.div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{boss.title}</h3>
                        <Badge className={`${diffConfig.bg} ${diffConfig.color} text-xs border-0`}>
                          {diffConfig.label}
                        </Badge>
                        {boss.completed && (
                          <Badge className="bg-green-100 text-green-700 text-xs border-0">
                            <Check className="w-3 h-3 mr-1" />Defeated
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{boss.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">❤️ {boss.hp} HP</span>
                        <span className="text-muted-foreground">⏱️ {boss.timeLimit}s</span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-semibold">+{boss.xpReward} XP</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Gem className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold">+{boss.gemReward} Gems</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      onClick={() => startBattle(boss.id)}
                      className={`rounded-xl font-bold ${boss.completed
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                        }`}
                    >
                      <Swords className="w-4 h-4 mr-2" />
                      {boss.completed ? 'Retry' : '⚔️ CHALLENGE!'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Swords className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No boss battles available</h3>
          <p className="text-muted-foreground mb-4">Check back later for new boss challenges!</p>
          <Button
            onClick={() => navigateTo('dashboard')}
            variant="outline"
            className="rounded-full"
          >
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}
