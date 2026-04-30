'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantProps {
  context?: string
}

const QUICK_QUESTIONS = [
  'Explain photosynthesis',
  'WAEC Maths tips',
  'How to study effectively',
]

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 bg-muted-foreground/50 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}

export function AIAssistant({ context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    error: string
    retryAfterSeconds: number
    limitType: string
  } | null>(null)
  const [retryCountdown, setRetryCountdown] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  // Auto-scroll when messages change or loading state changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryCountdown > 0) {
      retryTimerRef.current = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            setRateLimitInfo(null)
            if (retryTimerRef.current) clearInterval(retryTimerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => {
        if (retryTimerRef.current) clearInterval(retryTimerRef.current)
      }
    }
  }, [retryCountdown])

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim()
    if (!text || isLoading) return

    // Clear rate limit state
    setRateLimitInfo(null)
    setRetryCountdown(0)

    const userMessage: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context,
        }),
      })

      const data = await res.json()

      if (res.status === 429) {
        // Rate limited
        setRateLimitInfo({
          error: data.error || 'Rate limited. Please try again later.',
          retryAfterSeconds: data.retryAfterSeconds || 60,
          limitType: data.limitType || 'minute',
        })
        setRetryCountdown(data.retryAfterSeconds || 60)
        // Remove the user message that failed
        setMessages(messages)
        return
      }

      if (res.status === 503 || data.error?.includes('disabled')) {
        // AI service disabled
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: 'AI Assistant is currently unavailable. Please try again later.',
        }
        setMessages((prev) => [...prev, assistantMessage])
        return
      }

      if (!res.ok) {
        // Remove user message on error
        setMessages(messages)
        // Show user-friendly error message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.error || 'Sorry, something went wrong. Please try again.',
        }
        setMessages((prev) => [...prev, assistantMessage])
        return
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || 'Sorry, I could not generate a response.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Network error
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Unable to connect. Please check your internet connection and try again.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickQuestion = (question: string) => {
    handleSend(question)
  }

  const handleClearChat = () => {
    setMessages([])
    setRateLimitInfo(null)
    setRetryCountdown(0)
  }

  const formatCountdown = (seconds: number) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600)
      const m = Math.ceil((seconds % 3600) / 60)
      return `${h}h ${m}m`
    }
    if (seconds >= 60) {
      const m = Math.ceil(seconds / 60)
      return `${m} min`
    }
    return `${seconds}s`
  }

  const isOpenPanel = isOpen

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpenPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[380px] bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: 'min(460px, calc(100vh - 180px))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">AI Tutor</h3>
                  <p className="text-[10px] text-muted-foreground">SkoolarPlay Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleClearChat}
                    title="Clear chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
              }}
            >
              {messages.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                    className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <Sparkles className="w-7 h-7 text-primary" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-medium mb-1"
                  >
                    👋 Hi! I&apos;m your SkoolarPlay AI Tutor
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-muted-foreground mb-5"
                  >
                    Ask me any question about your studies!
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-2 w-full"
                  >
                    {QUICK_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-left text-xs px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted transition-colors border border-border/50"
                      >
                        💬 {question}
                      </button>
                    ))}
                  </motion.div>
                </div>
              ) : (
                /* Messages */
                <div className="px-4 py-3 space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-2 ${
                          msg.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                              : 'bg-muted rounded-2xl rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {/* User avatar */}
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary-foreground">You</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {isLoading && <TypingIndicator />}
                </div>
              )}
            </div>

            {/* Rate Limit Warning */}
            <AnimatePresence>
              {rateLimitInfo && retryCountdown > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 dark:border-amber-800"
                >
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <p className="text-xs">
                      {rateLimitInfo.limitType === 'day'
                        ? `Daily limit reached. Try again in ${formatCountdown(retryCountdown)}.`
                        : `Slow down! Try again in ${formatCountdown(retryCountdown)}.`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t px-3 py-2.5 bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your studies!"
                  disabled={isLoading || (retryCountdown > 0)}
                  className="flex-1 text-sm border-muted bg-muted/50 rounded-full px-4 py-2 focus-visible:ring-1 focus-visible:ring-primary"
                  maxLength={2000}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim() || retryCountdown > 0}
                  className="shrink-0 w-9 h-9 rounded-full bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot for first-time */}
        {!isOpen && messages.length === 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[8px] text-white font-bold">1</span>
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}
