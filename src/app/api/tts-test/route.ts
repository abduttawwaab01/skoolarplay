import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'This is a test',
        voice: 'jam',
        speed: 0.85,
      }),
    })

    if (!response.ok) {
      throw new Error(`TTS API returned ${response.status}`)
    }

    const blob = await response.blob()
    return new Response(blob, {
      headers: { 'Content-Type': 'audio/wav' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}