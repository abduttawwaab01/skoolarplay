import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientEmail, amount, message } = body

    // Validate required fields
    if (!recipientEmail || !amount) {
      return NextResponse.json({ error: 'Recipient email and amount are required' }, { status: 400 })
    }

    // Validate amount range
    const parsedAmount = Number(amount)
    if (!Number.isInteger(parsedAmount) || parsedAmount < 1 || parsedAmount > 500) {
      return NextResponse.json({ error: 'Amount must be between 1 and 500' }, { status: 400 })
    }

    // Validate message length
    if (message && message.length > 200) {
      return NextResponse.json({ error: 'Message must be 200 characters or less' }, { status: 400 })
    }

    // Find recipient
    const recipient = await db.user.findUnique({
      where: { email: recipientEmail.trim().toLowerCase() },
      select: { id: true, name: true, isBanned: true },
    })

    if (!recipient) {
      return NextResponse.json({ error: 'User with this email not found' }, { status: 404 })
    }

    if (recipient.isBanned) {
      return NextResponse.json({ error: 'Cannot send gems to a suspended user' }, { status: 400 })
    }

    // Can't send to self
    if (recipient.id === (session.user as any).id) {
      return NextResponse.json({ error: 'You cannot send gems to yourself' }, { status: 400 })
    }

    const senderId = (session.user as any).id

    // Execute in a transaction — balance check is inside to prevent TOCTOU race
    const result = await db.$transaction(async (tx) => {
      // Re-fetch sender inside transaction for accurate balance
      const sender = await tx.user.findUnique({
        where: { id: senderId },
        select: { gems: true, name: true },
      })

      if (!sender) {
        throw new Error('SENDER_NOT_FOUND')
      }

      if (sender.gems < parsedAmount) {
        throw new Error(`INSUFFICIENT_GEMS:${sender.gems}`)
      }

      // Decrement sender gems
      const updatedSender = await tx.user.update({
        where: { id: senderId },
        data: { gems: { decrement: parsedAmount } },
        select: { gems: true },
      })

      // Increment recipient gems
      await tx.user.update({
        where: { id: recipient.id },
        data: { gems: { increment: parsedAmount } },
      })

      // Create gift record
      const gift = await tx.gemGift.create({
        data: {
          senderId,
          recipientId: recipient.id,
          amount: parsedAmount,
          message: message?.trim() || null,
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          recipient: { select: { id: true, name: true, avatar: true } },
        },
      })

      // Create notification for sender
      await tx.notification.create({
        data: {
          userId: senderId,
          title: 'Gift Sent! 💎',
          message: `You sent ${parsedAmount} gem${parsedAmount > 1 ? 's' : ''} to ${recipient.name}.`,
          type: 'SOCIAL',
          link: 'share-gems',
        },
      })

      // Create notification for recipient
      await tx.notification.create({
        data: {
          userId: recipient.id,
          title: 'Gift Received! 💎',
          message: `${sender.name} sent you ${parsedAmount} gem${parsedAmount > 1 ? 's' : ''}${message ? `: "${message}"` : ''}.`,
          type: 'SOCIAL',
          link: 'share-gems',
        },
      })

      return { gift, updatedSenderGems: updatedSender.gems }
    })

    return NextResponse.json({
      success: true,
      gift: result.gift,
      senderGems: result.updatedSenderGems,
    })
  } catch (error: any) {
    if (error.message === 'SENDER_NOT_FOUND') {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
    }
    if (error.message?.startsWith('INSUFFICIENT_GEMS:')) {
      const gems = error.message.split(':')[1]
      return NextResponse.json(
        { error: `Insufficient gems. You have ${gems} gems.` },
        { status: 400 }
      )
    }
    console.error('Send gems error:', error)
    return NextResponse.json({ error: 'Failed to send gems' }, { status: 500 })
  }
}
