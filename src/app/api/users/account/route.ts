import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// DELETE /api/users/account - Delete own account (self-delete)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const password = searchParams.get('password')

    if (!password) {
      return NextResponse.json({ error: 'Password required for account deletion' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, isDeleted: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isDeleted) {
      return NextResponse.json({ error: 'Account already deleted' }, { status: 400 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Soft delete
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
        email: `deleted_${Date.now()}_${session.user.email}`,
        name: 'Deleted User',
        password: 'DELETED',
        avatar: null,
      },
    })

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}