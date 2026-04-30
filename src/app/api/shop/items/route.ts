import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = { isActive: true }
    if (type) {
      where.type = type
    }

    const items = await db.shopItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('Shop items API error:', error)
    return NextResponse.json({ error: 'Failed to fetch shop items' }, { status: 500 })
  }
}
