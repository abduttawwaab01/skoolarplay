import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bankName, accountNumber, accountName } = body

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: 'Bank name, account number, and account name are required' },
        { status: 400 }
      )
    }

    // Get teacher profile
    const profile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    })

    if (!profile || profile.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not an approved teacher' }, { status: 403 })
    }

    // Update bank details
    const updated = await db.teacherProfile.update({
      where: { id: profile.id },
      data: {
        bankName,
        accountNumber,
        accountName,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Bank details updated successfully',
      bankName: updated.bankName,
      accountNumber: updated.accountNumber,
      accountName: updated.accountName,
    })
  } catch (error) {
    console.error('Error updating bank details:', error)
    return NextResponse.json({ error: 'Failed to update bank details' }, { status: 500 })
  }
}
