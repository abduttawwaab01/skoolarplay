'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Search, Loader2, BookOpen, FileText,
  ChevronDown, ChevronUp, Upload, Download, Globe, Star, Sparkles, Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface VocabularySet {
  id: string
  title: string
  description: string | null
  language: string
  difficulty: string
  xpReward: number
  gemReward: number
  isActive: boolean
  isPremium: boolean
  words: { id: string; word: string }[]
  _count: { words: number }
}

interface VocabularyWord {
  id: string
  vocabularySetId: string
  word: string
  definition: string
  partOfSpeech: string | null
  pronunciation: string | null
  exampleSentence: string | null
  synonyms: string | null
  antonyms: string | null
  difficulty: string
  scrambledWord: string | null
  missingLetter: string | null
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
]

const DIFFICULTIES = [
  { value: 'BEGINNER', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ADVANCED', label: 'Advanced', color: 'bg-red-100 text-red-800' },
]

export function AdminVocabularyPage() {
  const [sets, setSets] = useState<VocabularySet[]>([])
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLanguage, setFilterLanguage] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [seeding, setSeeding] = useState(false)

  // Set dialog
  const [setDialogOpen, setSetDialogOpen] = useState(false)
  const [editingSet, setEditingSet] = useState<VocabularySet | null>(null)
  const [setForm, setSetForm] = useState({
    title: '',
    description: '',
    language: 'en',
    difficulty: 'BEGINNER',
    xpReward: 10,
    gemReward: 2,
    isPremium: false,
  })

  // Word dialog
  const [wordDialogOpen, setWordDialogOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [wordForm, setWordForm] = useState({
    word: '',
    definition: '',
    partOfSpeech: '',
    pronunciation: '',
    exampleSentence: '',
    synonyms: '',
    antonyms: '',
    difficulty: 'MEDIUM',
    scrambledWord: '',
    missingLetter: '',
  })

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'set' | 'word'; id: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchSets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterLanguage !== 'all') params.set('language', filterLanguage)
      if (filterDifficulty !== 'all') params.set('difficulty', filterDifficulty)

      const res = await fetch(`/api/admin/vocabulary?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSets(data.sets || [])
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary sets:', error)
      toast.error('Failed to load vocabulary sets')
    } finally {
      setLoading(false)
    }
  }, [filterLanguage, filterDifficulty])

  const fetchWords = useCallback(async (setId: string) => {
    try {
      const res = await fetch(`/api/admin/vocabulary-words?setId=${setId}`)
      if (res.ok) {
        const data = await res.json()
        setWords(data.words || [])
      }
    } catch (error) {
      console.error('Failed to fetch words:', error)
    }
  }, [])

  useEffect(() => {
    fetchSets()
  }, [fetchSets])

  const filteredSets = sets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openSetDialog = (set?: VocabularySet) => {
    if (set) {
      setEditingSet(set)
      setSetForm({
        title: set.title,
        description: set.description || '',
        language: set.language,
        difficulty: set.difficulty,
        xpReward: set.xpReward,
        gemReward: set.gemReward,
        isPremium: set.isPremium,
      })
    } else {
      setEditingSet(null)
      setSetForm({
        title: '',
        description: '',
        language: 'en',
        difficulty: 'BEGINNER',
        xpReward: 10,
        gemReward: 2,
        isPremium: false,
      })
    }
    setSetDialogOpen(true)
  }

  const saveSet = async () => {
    if (!setForm.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const url = editingSet ? `/api/admin/vocabulary?id=${editingSet.id}` : '/api/admin/vocabulary'
      const method = editingSet ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setForm),
      })

      if (res.ok) {
        toast.success(editingSet ? 'Set updated' : 'Set created')
        setSetDialogOpen(false)
        fetchSets()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save set')
      }
    } catch (error) {
      toast.error('Failed to save set')
    } finally {
      setSaving(false)
    }
  }

  const openWordDialog = (setId: string, word?: VocabularyWord) => {
    setSelectedSetId(setId)
    if (word) {
      setEditingWord(word)
      setWordForm({
        word: word.word,
        definition: word.definition,
        partOfSpeech: word.partOfSpeech || '',
        pronunciation: word.pronunciation || '',
        exampleSentence: word.exampleSentence || '',
        synonyms: word.synonyms ? JSON.parse(word.synonyms).join(', ') : '',
        antonyms: word.antonyms ? JSON.parse(word.antonyms).join(', ') : '',
        difficulty: word.difficulty,
        scrambledWord: word.scrambledWord || '',
        missingLetter: word.missingLetter || '',
      })
    } else {
      setEditingWord(null)
      setWordForm({
        word: '',
        definition: '',
        partOfSpeech: '',
        pronunciation: '',
        exampleSentence: '',
        synonyms: '',
        antonyms: '',
        difficulty: 'MEDIUM',
        scrambledWord: '',
        missingLetter: '',
      })
    }
    fetchWords(setId)
    setWordDialogOpen(true)
  }

  const saveWord = async () => {
    if (!selectedSetId || !wordForm.word.trim() || !wordForm.definition.trim()) {
      toast.error('Word and definition are required')
      return
    }

    setSaving(true)
    try {
      const synonyms = wordForm.synonyms
        ? wordForm.synonyms.split(',').map(s => s.trim()).filter(Boolean)
        : []
      const antonyms = wordForm.antonyms
        ? wordForm.antonyms.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const payload = {
        vocabularySetId: editingWord ? undefined : selectedSetId,
        word: wordForm.word,
        definition: wordForm.definition,
        partOfSpeech: wordForm.partOfSpeech || null,
        pronunciation: wordForm.pronunciation || null,
        exampleSentence: wordForm.exampleSentence || null,
        synonyms: synonyms.length > 0 ? synonyms : null,
        antonyms: antonyms.length > 0 ? antonyms : null,
        difficulty: wordForm.difficulty,
        scrambledWord: wordForm.scrambledWord || null,
        missingLetter: wordForm.missingLetter || null,
      }

      let res
      if (editingWord) {
        res = await fetch('/api/admin/vocabulary-words', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingWord.id, ...payload }),
        })
      } else {
        res = await fetch('/api/admin/vocabulary-words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        toast.success(editingWord ? 'Word updated' : 'Word added')
        if (selectedSetId) {
          fetchWords(selectedSetId)
          fetchSets()
        }
        if (!editingWord) {
          setWordDialogOpen(false)
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save word')
      }
    } catch (error) {
      toast.error('Failed to save word')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async () => {
    if (!deleteConfirm) return
    setSaving(true)
    try {
      let res
      if (deleteConfirm.type === 'set') {
        res = await fetch(`/api/admin/vocabulary?id=${deleteConfirm.id}`, {
          method: 'DELETE',
        })
      } else {
        res = await fetch(`/api/admin/vocabulary-words?id=${deleteConfirm.id}`, {
          method: 'DELETE',
        })
      }

      if (res.ok) {
        toast.success('Deleted successfully')
        setDeleteConfirm(null)
        if (deleteConfirm.type === 'set') {
          fetchSets()
        } else if (selectedSetId) {
          fetchWords(selectedSetId)
          fetchSets()
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const generateScrambledWord = (word: string) => {
    if (word.length < 3) return word
    const chars = word.split('')
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]]
    }
    const shuffled = chars.join('')
    return shuffled === word ? shuffled + word[0] : shuffled
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vocabulary Management</h1>
          <p className="text-muted-foreground">Manage vocabulary sets and words</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            setSeeding(true)
            try {
              const res = await fetch('/api/admin/vocabulary/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seedDefault: true }),
              })
              if (res.ok) {
                const data = await res.json()
                toast.success(data.message || 'Seed completed')
                fetchSets()
              } else {
                toast.error('Failed to seed')
              }
            } catch {
              toast.error('Failed to seed')
            } finally {
              setSeeding(false)
            }
          }} disabled={seeding}>
            <Database className="w-4 h-4 mr-2" />
            Seed Default Sets
          </Button>
          <Button onClick={() => openSetDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Vocabulary Set
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterLanguage} onValueChange={setFilterLanguage}>
          <SelectTrigger className="w-[150px]">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[150px]">
            <Star className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {DIFFICULTIES.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sets Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredSets.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vocabulary sets found</p>
              <Button variant="outline" className="mt-4" onClick={() => openSetDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Set
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Set</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Rewards</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{set.title}</p>
                        {set.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{set.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {LANGUAGES.find(l => l.code === set.language)?.name || set.language}
                    </TableCell>
                    <TableCell>
                      <Badge className={DIFFICULTIES.find(d => d.value === set.difficulty)?.color}>
                        {set.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openWordDialog(set.id)}>
                        {set._count.words} words
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-primary">+{set.xpReward} XP</span>
                        <span className="text-amber-500">+{set.gemReward} 💎</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={set.isActive ? 'default' : 'outline'}>
                        {set.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openWordDialog(set.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openSetDialog(set)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'set', id: set.id })}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Set Dialog */}
      <Dialog open={setDialogOpen} onOpenChange={setSetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSet ? 'Edit Vocabulary Set' : 'Create Vocabulary Set'}</DialogTitle>
            <DialogDescription>
              {editingSet ? 'Update the vocabulary set details.' : 'Create a new vocabulary set for students to practice.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={setForm.title}
                onChange={(e) => setSetForm({ ...setForm, title: e.target.value })}
                placeholder="Basic English Words"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={setForm.description}
                onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                placeholder="A collection of essential everyday words..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={setForm.language} onValueChange={(v) => setSetForm({ ...setForm, language: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={setForm.difficulty} onValueChange={(v) => setSetForm({ ...setForm, difficulty: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input
                  type="number"
                  value={setForm.xpReward}
                  onChange={(e) => setSetForm({ ...setForm, xpReward: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gem Reward</Label>
                <Input
                  type="number"
                  value={setForm.gemReward}
                  onChange={(e) => setSetForm({ ...setForm, gemReward: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveSet} disabled={saving}>
              {saving ? 'Saving...' : editingSet ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Word Dialog */}
      <Dialog open={wordDialogOpen} onOpenChange={setWordDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWord ? 'Edit Word' : 'Add Words'}
            </DialogTitle>
            <DialogDescription>
              {editingWord
                ? 'Update the word details.'
                : 'Add words to this vocabulary set.'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Word Details</TabsTrigger>
              <TabsTrigger value="list" className="flex-1">Words List ({words.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Word *</Label>
                  <Input
                    value={wordForm.word}
                    onChange={(e) => {
                      const word = e.target.value
                      setWordForm({
                        ...wordForm,
                        word,
                        scrambledWord: generateScrambledWord(word),
                      })
                    }}
                    placeholder="apple"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Part of Speech</Label>
                  <Input
                    value={wordForm.partOfSpeech}
                    onChange={(e) => setWordForm({ ...wordForm, partOfSpeech: e.target.value })}
                    placeholder="noun, verb, adjective..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Definition *</Label>
                <Textarea
                  value={wordForm.definition}
                  onChange={(e) => setWordForm({ ...wordForm, definition: e.target.value })}
                  placeholder="A round fruit with red, yellow, or green skin..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Pronunciation</Label>
                <Input
                  value={wordForm.pronunciation}
                  onChange={(e) => setWordForm({ ...wordForm, pronunciation: e.target.value })}
                  placeholder="/ˈæpəl/"
                />
              </div>

              <div className="space-y-2">
                <Label>Example Sentence</Label>
                <Textarea
                  value={wordForm.exampleSentence}
                  onChange={(e) => setWordForm({ ...wordForm, exampleSentence: e.target.value })}
                  placeholder="I ate an apple for breakfast."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Synonyms (comma separated)</Label>
                  <Input
                    value={wordForm.synonyms}
                    onChange={(e) => setWordForm({ ...wordForm, synonyms: e.target.value })}
                    placeholder="fruit, produce"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Antonyms (comma separated)</Label>
                  <Input
                    value={wordForm.antonyms}
                    onChange={(e) => setWordForm({ ...wordForm, antonyms: e.target.value })}
                    placeholder="enemy, poison"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Scrambled Word (for assembly activity)</Label>
                <Input
                  value={wordForm.scrambledWord}
                  onChange={(e) => setWordForm({ ...wordForm, scrambledWord: e.target.value })}
                  placeholder="Auto-generated from word"
                />
              </div>

              <div className="space-y-2">
                <Label>Missing Letter (for missing letter activity)</Label>
                <Input
                  value={wordForm.missingLetter}
                  onChange={(e) => setWordForm({ ...wordForm, missingLetter: e.target.value })}
                  placeholder="a"
                  maxLength={1}
                />
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {words.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No words yet. Add your first word!</p>
                ) : (
                  words.map((word) => (
                    <div key={word.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{word.word}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{word.definition}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openWordDialog(selectedSetId!, word)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'word', id: word.id })}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWordDialogOpen(false)} disabled={saving}>
              {editingWord ? 'Done' : 'Cancel'}
            </Button>
            {!editingWord && (
              <Button onClick={saveWord} disabled={saving}>
                {saving ? 'Adding...' : 'Add Word'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteItem} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
