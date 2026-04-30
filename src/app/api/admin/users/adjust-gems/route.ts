import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// POST /api/admin/users/adjust-gems - Adjust user gems (reward or deduct)
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, amount, action, reason } = await req.json()

    if (!userId || !amount || !action) {
      return NextResponse.json({ error: 'User ID, amount, and action are required' }, { status: 400 })
    }

    if (action !== 'add' && action !== 'subtract') {
      return NextResponse.json({ error: 'Action must be "add" or "subtract"' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let newGems: number
    if (action === 'add') {
      newGems = user.gems + amount
    } else {
      newGems = Math.max(0, user.gems - amount)
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { gems: newGems },
    })

    return NextResponse.json({
      success: true,
      gems: updatedUser.gems,
      message: `Successfully ${action === 'add' ? 'added' : 'subtracted'} ${amount} gems`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to adjust gems' },
      { status: 500 }
    )
  }
}