'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Grid3x3,
  Calculator,
  Type,
  Shuffle,
  FlipHorizontal,
  Zap,
  SpellCheck,
  ArrowLeftRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

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
  maxAttempts: number | null
  isActive: boolean
  minLevel: number
  sortOrder: number
}

const GAME_TYPES = [
  { value: 'WORD_MATCH', label: 'Word Match' },
  { value: 'MATH_CHALLENGE', label: 'Math Challenge' },
  { value: 'TYPING_RACE', label: 'Typing Race' },
  { value: 'WORD_SCRAMBLE', label: 'Word Scramble' },
  { value: 'MEMORY_FLIP', label: 'Memory Flip' },
  { value: 'QUIZ_RACE', label: 'Quiz Race' },
  { value: 'SPELLING_BEE', label: 'Spelling Bee' },
  { value: 'ANAGRAMS', label: 'Anagrams' },
]

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']

export function AdminGamesPage() {
  const { user } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WORD_MATCH',
    difficulty: 'EASY',
    icon: '',
    color: '#6B7280',
    xpReward: 10,
    gemReward: 1,
    timeLimit: 120,
    maxAttempts: 0,
    isActive: true,
    minLevel: 1,
    sortOrder: 0,
  })

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigateTo('dashboard')
      return
    }
    fetchGames()
  }, [user, navigateTo])

  const fetchGames = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/games')
      if (res.ok) {
        const data = await res.json()
        setGames(data.games || [])
      }
    } catch (error) {
      toast.error('Failed to load games')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingGame
        ? `/api/admin/games/${editingGame.id}`
        : '/api/admin/games'
      const method = editingGame ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingGame ? 'Game updated!' : 'Game created!')
        setShowForm(false)
        setEditingGame(null)
        resetForm()
        fetchGames()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save game')
      }
    } catch (error) {
      toast.error('Failed to save game')
    }
  }

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    setFormData({
      title: game.title,
      description: game.description || '',
      type: game.type,
      difficulty: game.difficulty,
      icon: game.icon || '',
      color: game.color || '#6B7280',
      xpReward: game.xpReward,
      gemReward: game.gemReward,
      timeLimit: game.timeLimit || 120,
      maxAttempts: game.maxAttempts || 0,
      isActive: game.isActive,
      minLevel: game.minLevel,
      sortOrder: game.sortOrder,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return

    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Game deleted!')
        fetchGames()
      }
    } catch (error) {
      toast.error('Failed to delete game')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'WORD_MATCH',
      difficulty: 'EASY',
      icon: '',
      color: '#6B7280',
      xpReward: 10,
      gemReward: 1,
      timeLimit: 120,
      maxAttempts: 0,
      isActive: true,
      minLevel: 1,
      sortOrder: 0,
    })
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      WORD_MATCH: Grid3x3,
      MATH_CHALLENGE: Calculator,
      TYPING_RACE: Type,
      WORD_SCRAMBLE: Shuffle,
      MEMORY_FLIP: FlipHorizontal,
      QUIZ_RACE: Zap,
      SPELLING_BEE: SpellCheck,
      ANAGRAMS: ArrowLeftRight,
    }
    const Icon = icons[type] || Gamepad2
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigateTo('admin')}>
            <X className="w-4 h-4 mr-2 rotate-180" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            Manage Games
          </h1>
        </div>
        <Button onClick={() => { resetForm(); setEditingGame(null); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Game
        </Button>
      </div>

      {/* Game Form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingGame ? 'Edit Game' : 'Create New Game'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Game title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Game Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GAME_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Game description"
                  />
                </div>
                <div>
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="gemReward">Gem Reward</Label>
                  <Input
                    id="gemReward"
                    type="number"
                    value={formData.gemReward}
                    onChange={(e) => setFormData({ ...formData, gemReward: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (seconds, 0 = no limit)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="minLevel">Minimum Level</Label>
                  <Input
                    id="minLevel"
                    type="number"
                    value={formData.minLevel}
                    onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="ml-auto flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setEditingGame(null) }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {editingGame ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Games List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: game.color + '20' }}
                      >
                        {getTypeIcon(game.type)}
                      </div>
                      <div>
                        <h3 className="font-bold">{game.title}</h3>
                        <p className="text-sm text-muted-foreground">{game.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="flex items-center gap-1">
                            {getTypeIcon(game.type)}
                            {game.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            game.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                            game.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            game.difficulty === 'HARD' ? 'bg-red-100 text-red-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {game.difficulty}
                          </span>
                          <span className="text-muted-foreground">
                            Lvl {game.minLevel}+
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${game.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {game.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(game)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(game.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {games.length === 0 && (
            <div className="text-center py-16">
              <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No Games Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first game to get started!</p>
              <Button onClick={() => { resetForm(); setShowForm(true) }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Game
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
