import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface TTSConfig {
  provider: 'browser' | 'zai'
  voice?: string
  lang?: string
}

interface LanguageVoiceConfig {
  lang: string
  name: string
  nativeName: string
  voices: string[]
  defaultVoice: string
  fallbackLang?: string
}

const languageVoiceMap: Record<string, LanguageVoiceConfig> = {
  // Nigerian languages (use ZAI)
  yo: { lang: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  ig: { lang: 'ig', name: 'Igbo', nativeName: 'Igbo', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  ha: { lang: 'ha', name: 'Hausa', nativeName: 'Hausa', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  pcm: { lang: 'pcm', name: 'Pidgin', nativeName: 'Naija', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  
  // European languages (use ZAI with appropriate voices)
  en: { lang: 'en', name: 'English', nativeName: 'English', voices: ['jam', 'tongtong'], defaultVoice: 'jam', fallbackLang: 'en-US' },
  fr: { lang: 'fr', name: 'French', nativeName: 'Français', voices: ['chuichui', 'jam'], defaultVoice: 'chuichui', fallbackLang: 'fr-FR' },
  de: { lang: 'de', name: 'German', nativeName: 'Deutsch', voices: ['luodo', 'jam'], defaultVoice: 'luodo', fallbackLang: 'de-DE' },
  es: { lang: 'es', name: 'Spanish', nativeName: 'Español', voices: ['xiaochen', 'jam'], defaultVoice: 'xiaochen', fallbackLang: 'es-ES' },
  it: { lang: 'it', name: 'Italian', nativeName: 'Italiano', voices: ['jam', 'tongtong'], defaultVoice: 'jam', fallbackLang: 'it-IT' },
  pt: { lang: 'pt', name: 'Portuguese', nativeName: 'Português', voices: ['jam', 'tongtong'], defaultVoice: 'jam', fallbackLang: 'pt-BR' },
  ru: { lang: 'ru', name: 'Russian', nativeName: 'Русский', voices: ['jam', 'douji'], defaultVoice: 'jam', fallbackLang: 'ru-RU' },
  
  // Asian languages
  zh: { lang: 'zh', name: 'Chinese', nativeName: '中文', voices: ['tongtong', 'chuichui'], defaultVoice: 'tongtong', fallbackLang: 'zh-CN' },
  ja: { lang: 'ja', name: 'Japanese', nativeName: '日本語', voices: ['chuichui', 'jam'], defaultVoice: 'chuichui', fallbackLang: 'ja-JP' },
  ko: { lang: 'ko', name: 'Korean', nativeName: '한국어', voices: ['jam', 'tongtong'], defaultVoice: 'jam', fallbackLang: 'ko-KR' },
  hi: { lang: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voices: ['jam', 'kazi'], defaultVoice: 'jam', fallbackLang: 'hi-IN' },
  ar: { lang: 'ar', name: 'Arabic', nativeName: 'العربية', voices: ['jam', 'kazi'], defaultVoice: 'jam', fallbackLang: 'ar-SA' },
  sw: { lang: 'sw', name: 'Swahili', nativeName: 'Kiswahili', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  
  // African languages
  am: { lang: 'am', name: 'Amharic', nativeName: 'አማርኛ', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  zu: { lang: 'zu', name: 'Zulu', nativeName: 'isiZulu', voices: ['jam', 'kazi'], defaultVoice: 'jam' },
  af: { lang: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', voices: ['jam'], defaultVoice: 'jam', fallbackLang: 'af-ZA' },
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
  const normalizedLang = (lang || 'en').toLowerCase().split('-')[0]
  
  const langConfig = languageVoiceMap[normalizedLang]
  
  if (langConfig) {
    return {
      provider: 'zai',
      voice: langConfig.defaultVoice,
      lang: normalizedLang
    }
  }
  
  // Fallback to browser TTS for unsupported languages
  return {
    provider: 'browser',
    lang: normalizedLang
  }
}

function getLanguageConfig(lang?: string): LanguageVoiceConfig | null {
  if (!lang) return null
  const normalizedLang = lang.toLowerCase().split('-')[0]
  return languageVoiceMap[normalizedLang] || null
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
    const { text, voice, speed = 1.0, lang = 'en' } = body as {
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
    const langConfig = getLanguageConfig(lang)

    if (ttsConfig.provider === 'zai') {
      const validVoices = ['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo']
      const selectedVoice = voice || ttsConfig.voice || 'jam'
      if (!validVoices.includes(selectedVoice)) {
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
      audioBuffer = await generateZAITTS(cleanedText, voice || ttsConfig.voice || 'jam', speed)
    } else {
      return NextResponse.json({
        useBrowserTTS: true,
        lang: langConfig?.fallbackLang || ttsConfig.lang || 'en-US',
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lang = searchParams.get('lang') || 'en'
    
    const langConfig = getLanguageConfig(lang)
    const ttsConfig = selectTTSTransport(lang)
    
    return NextResponse.json({
      language: langConfig || { lang, name: lang, nativeName: lang },
      ttsProvider: ttsConfig.provider,
      availableVoices: langConfig?.voices || [],
      defaultVoice: langConfig?.defaultVoice || 'jam',
      fallbackLang: langConfig?.fallbackLang,
    })
  } catch (error) {
    console.error('TTS config error:', error)
    return NextResponse.json({ error: 'Failed to get TTS config' }, { status: 500 })
  }
}