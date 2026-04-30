import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface TTSConfig {
  provider: 'browser' | 'zai'
  voice?: string
  lang?: string
}

const rateLimitMap = new Map<string, number[]>()
const DEFAULT_RATE_LIMIT = 30
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

if (typeof globalThis !== 'undefined') {
  ;(globalThis as Record<string, unknown>).__ttsRateLimitCleanupInterval ??= setInterval(() => {
    const now = Date.now()
    for (const [userId, timestamps] of rateLimitMap.entries()) {
      const filtered = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
      if (filtered.length === 0) {
        rateLimitMap.delete(userId)
      } else {
        rateLimitMap.set(userId, filtered)
      }
    }
  }, CLEANUP_INTERVAL_MS)
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(userId) || []
  const recentTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recentTimestamps.length >= DEFAULT_RATE_LIMIT) {
    rateLimitMap.set(userId, recentTimestamps)
    return false
  }

  recentTimestamps.push(now)
  rateLimitMap.set(userId, recentTimestamps)
  return true
}

function selectTTSTransport(lang?: string): TTSConfig {
  const normalizedLang = (lang || 'yo').toLowerCase().split('-')[0]
  
  const nigerianLanguages = ['yo', 'ig', 'ha', 'pcm']
  
  if (nigerianLanguages.includes(normalizedLang)) {
    return {
      provider: 'zai',
      voice: 'jam',
      lang: normalizedLang
    }
  }
  
  return {
    provider: 'browser',
    lang: normalizedLang
  }
}

function splitTextIntoChunks(text: string, maxLength = 1000): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  let currentChunk = ''
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (!trimmed) continue

    if ((currentChunk + ' ' + trimmed).trim().length <= maxLength) {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmed : trimmed
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
      if (trimmed.length > maxLength) {
        let remaining = trimmed
        while (remaining.length > maxLength) {
          chunks.push(remaining.slice(0, maxLength).trim())
          remaining = remaining.slice(maxLength)
        }
        currentChunk = remaining
      } else {
        currentChunk = trimmed
      }
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

async function generateZAITTS(text: string, voice: string, speed: number) {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  if (text.length <= 1024) {
    const response = await zai.audio.tts.create({
      input: text,
      voice,
      speed,
      response_format: 'wav',
      stream: false,
    })

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer))

    return buffer
  }

  const chunks = splitTextIntoChunks(text, 1000)
  const audioBuffers: Buffer[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    if (!chunk) continue

    const response = await zai.audio.tts.create({
      input: chunk,
      voice,
      speed,
      response_format: 'wav',
      stream: false,
    })

    const arrayBuffer = await response.arrayBuffer()
    const chunkBuffer = Buffer.from(new Uint8Array(arrayBuffer))

    if (i === 0) {
      audioBuffers.push(chunkBuffer)
    } else {
      if (chunkBuffer.length > 44) {
        audioBuffers.push(chunkBuffer.subarray(44))
      }
    }
  }

  const combinedBuffer = Buffer.concat(audioBuffers)

  if (combinedBuffer.length > 44) {
    combinedBuffer.writeUInt32LE(combinedBuffer.length - 8, 4)
    combinedBuffer.writeUInt32LE(combinedBuffer.length - 44, 40)
  }

  return combinedBuffer
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { text, voice = 'jam', speed = 0.9, lang } = body as {
      text?: string
      voice?: string
      speed?: number
      lang?: string
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const cleanedText = text.trim().replace(/\s+/g, ' ')
    const ttsConfig = selectTTSTransport(lang)

    if (ttsConfig.provider === 'zai') {
      const validVoices = ['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo']
      if (!validVoices.includes(voice)) {
        return NextResponse.json(
          { error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (typeof speed !== 'number' || speed < 0.5 || speed > 2.0) {
      return NextResponse.json(
        { error: 'Speed must be between 0.5 and 2.0' },
        { status: 400 }
      )
    }

    let audioBuffer: Buffer

    if (ttsConfig.provider === 'zai') {
      audioBuffer = await generateZAITTS(cleanedText, voice, speed)
    } else {
      return NextResponse.json({
        useBrowserTTS: true,
        lang: ttsConfig.lang,
        text: cleanedText,
        message: 'Use browser Web Speech API for this language'
      }, { status: 200 })
    }

    return new NextResponse(audioBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate speech'
    console.error('TTS API Error:', message)

    if (message.includes('maximum length') || message.includes('1024')) {
      return NextResponse.json({ error: 'Text exceeds maximum length' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to generate speech. Please try again.' }, { status: 500 })
  }
}