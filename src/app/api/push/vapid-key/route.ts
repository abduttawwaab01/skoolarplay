import { NextResponse } from 'next/server'

export async function GET() {
  const vapidKey = process.env.VAPID_PUBLIC_KEY
  
  if (!vapidKey) {
    return NextResponse.json(
      { error: 'Push notifications not configured', vapidKey: null },
      { status: 200 }
    )
  }

  return NextResponse.json({ vapidKey })
}
