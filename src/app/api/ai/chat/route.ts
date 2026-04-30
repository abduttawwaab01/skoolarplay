import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { OPENROUTER_API_URL } from '@/lib/constants'
import { getTierLimitsAsync } from '@/lib/premium'

async function getAISettings() {
  let settings = await db.adminSettings.findFirst()
  if (!settings) {
    settings = await db.adminSettings.create({ data: {} })
  }
  return {
    enabled: settings.aiEnabled !== false,
    maxContextMessages: settings.aiMaxContextMessages || 20,
    model: settings.aiModel || 'default',
  }
}

async function getUserPlanTier(session: any): Promise<string> {
  if (session?.user?.isPremium && session?.user?.premiumExpiresAt && new Date(session.user.premiumExpiresAt) > new Date()) {
    return session.user.planTier
  }
  return 'FREE'
}

const SYSTEM_PROMPT = `You are SkoolarPlay AI Tutor, a helpful educational assistant for Nigerian students. You help with:

- Explaining concepts in simple terms
- Providing study tips and strategies
- Answering questions about WAEC, JAMB, NECO subjects
- Helping with Mathematics, English, Sciences, Arts, etc.
- Encouraging students and making learning fun
- Responding in English but can explain in Nigerian Pidgin if asked
- Being culturally relevant to Nigerian students

Guidelines:
- Be encouraging and supportive. Celebrate small wins!
- Use simple language that a secondary school student can understand.
- Provide step-by-step explanations for complex topics.
- Relate examples to Nigerian context where possible (e.g., local food, places, culture).
- If asked about Nigerian Pidgin, respond warmly and helpfully.
- Keep responses concise but thorough. Use bullet points or numbered lists when helpful.
- Never give harmful, offensive, or inappropriate content.
- If you don't know something, be honest and suggest where the student can learn more.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if AI is enabled
    const aiSettings = await getAISettings()
    if (!aiSettings.enabled) {
      return NextResponse.json(
        { error: 'AI Assistant is currently disabled. Please try again later.' },
        { status: 503 }
      )
    }

    // Get user's plan tier and calculate their daily limit
    const planTier = await getUserPlanTier(session)
    const { aiChatLimitPerDay } = await getTierLimitsAsync(planTier as any)

    // Rate limiting using Redis - per minute (always 10 for all plans)
    const perMinuteResult = await rateLimiter.checkLimit(
      `ai:minute:${userId}`,
      RATE_LIMITS.AI_CHAT_PER_MINUTE
    )

    if (!perMinuteResult.allowed) {
      return NextResponse.json(
        {
          error: `You're sending messages too quickly. Please wait ${perMinuteResult.retryAfter} seconds.`,
          retryAfterSeconds: perMinuteResult.retryAfter,
          limitType: 'minute',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(perMinuteResult.retryAfter) },
        }
      )
    }

    // Plan-based daily limit
    const perDayResult = await rateLimiter.checkLimit(
      `ai:day:${userId}`,
      { maxRequests: aiChatLimitPerDay, windowSeconds: 86400 }
    )

    if (!perDayResult.allowed) {
      const minutes = Math.ceil((perDayResult.retryAfter || 0) / 60)
      return NextResponse.json(
        {
          error: `You've reached your daily AI chat limit (${aiChatLimitPerDay}/day). ${planTier !== 'FREE' ? 'Upgrade your plan for more chats.' : ''} Try again in about ${minutes} minutes.`,
          retryAfterSeconds: perDayResult.retryAfter,
          limitType: 'day',
          dailyLimit: aiChatLimitPerDay,
          planTier,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(perDayResult.retryAfter) },
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const { messages, context } = body as {
      messages?: ChatMessage[]
      context?: string
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required and must be a non-empty array.' },
        { status: 400 }
      )
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return NextResponse.json(
          { error: 'Each message must have a role (user/assistant) and content (string).' },
          { status: 400 }
        )
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        return NextResponse.json(
          { error: 'Message role must be either "user" or "assistant".' },
          { status: 400 }
        )
      }
      if (msg.content.length > 2000) {
        return NextResponse.json(
          { error: 'Each message must be under 2000 characters.' },
          { status: 400 }
        )
      }
    }

    // Trim messages to max context length (keep most recent)
    const maxContext = aiSettings.maxContextMessages
    const trimmedMessages = messages.slice(-maxContext)

    // Build messages array for the AI
    const systemMessage = context
      ? {
          role: 'system' as const,
          content: `${SYSTEM_PROMPT}\n\nAdditional context from the user's current activity: ${context}`,
        }
      : {
          role: 'system' as const,
          content: SYSTEM_PROMPT,
        }

    const apiMessages = [
      systemMessage,
      ...trimmedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.5:free'
    const FALLBACK_MODELS = [
      'google/gemma-2-9b-it:free',
      'mistralai/mistral-7b-instruct:free',
      'meta-llama/llama-3-8b-instruct:free',
      'stepfun/step-3.5-flash:free',
      'openrouter/auto:free',
      'qwen/qwen-2.5-7b-instruct:free',
      'deepseek/deepseek-chat:free',
    ]

    // Helper function to try different AI providers
    async function tryZaiFallback(): Promise<string | null> {
      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default
        const zai = await ZAI.create()
        const completion = await zai.chat.completions.create({
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1000,
        })
        return completion.choices?.[0]?.message?.content || null
      } catch {
        return null
      }
    }

    async function tryOllamaFallback(): Promise<string | null> {
      try {
        const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3.2',
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          return data.message?.content || null
        }
        return null
      } catch {
        return null
      }
    }

    async function tryDeepSeekDirect(): Promise<string | null> {
      try {
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
        if (!DEEPSEEK_API_KEY) return null
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          return data.choices?.[0]?.message?.content || null
        }
        return null
      } catch {
        return null
      }
    }

    // If no OpenRouter key, try all fallbacks
    if (!OPENROUTER_API_KEY) {
      // Try ZAI first (web-based, no config needed)
      let result = await tryZaiFallback()
      if (result) {
        return NextResponse.json({ message: result, provider: 'zai' })
      }
      
      // Try Ollama (local)
      result = await tryOllamaFallback()
      if (result) {
        return NextResponse.json({ message: result, provider: 'ollama' })
      }
      
      // Try DeepSeek direct API
      result = await tryDeepSeekDirect()
      if (result) {
        return NextResponse.json({ message: result, provider: 'deepseek' })
      }
      
      // All fallbacks failed
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // Use OpenRouter API with fallbacks
    let openrouterResponse: any = null
    const modelsToTry = [OPENROUTER_MODEL, ...FALLBACK_MODELS]

     for (const model of modelsToTry) {
       try {
         openrouterResponse = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://skoolarplay.com',
            'X-Title': 'SkoolarPlay AI Tutor',
          },
          body: JSON.stringify({
            model: model,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })

        if (openrouterResponse.ok) {
          break
        }
      } catch (err) {
        console.error(`Failed with model ${model}:`, err)
      }
    }

    if (!openrouterResponse || !openrouterResponse.ok) {
      if (openrouterResponse) {
        const errorText = await openrouterResponse.text()
        console.error('OpenRouter API error:', errorText)
      }
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }

    const completion = await openrouterResponse.json()
    const messageContent = completion.choices?.[0]?.message?.content

    if (!messageContent) {
      return NextResponse.json(
        { error: 'AI did not return a response. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: messageContent,
      provider: 'openrouter',
      model: completion.model,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get AI response'
    console.error('AI Chat API Error:', message)

    return NextResponse.json(
      { error: 'Something went wrong with the AI assistant. Please try again later.' },
      { status: 500 }
    )
  }
}
