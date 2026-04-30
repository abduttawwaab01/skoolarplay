import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const conversationWith = searchParams.get('with')
    const courseId = searchParams.get('courseId')

    if (conversationWith) {
      const messages = await db.teacherMessage.findMany({
        where: {
          AND: [
            { OR: [
              { senderId: userId, recipientId: conversationWith },
              { senderId: conversationWith, recipientId: userId },
            ]},
            ...(courseId ? [{ courseId }] : []),
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      })
      await db.teacherMessage.updateMany({
        where: { senderId: conversationWith, recipientId: userId, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ messages })
    }

    const sentMessages = await db.teacherMessage.findMany({
      where: { senderId: userId },
      select: { recipientId: true, createdAt: true, content: true, isRead: true },
      orderBy: { createdAt: 'desc' },
      distinct: ['recipientId'],
    })
    const receivedMessages = await db.teacherMessage.findMany({
      where: { recipientId: userId },
      select: { senderId: true, createdAt: true, content: true, isRead: true },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId'],
    })

    const contactIds = new Set<string>()
    sentMessages.forEach(m => contactIds.add(m.recipientId))
    receivedMessages.forEach(m => contactIds.add(m.senderId))

    const contacts = await db.user.findMany({
      where: { id: { in: Array.from(contactIds) } },
      select: { id: true, name: true, avatar: true, role: true },
    })

    const unreadCount = await db.teacherMessage.count({
      where: { recipientId: userId, isRead: false },
    })

    return NextResponse.json({ contacts, unreadCount })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { recipientId, subject, content, courseId } = await request.json()
    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Recipient and content are required' }, { status: 400 })
    }

    const message = await db.teacherMessage.create({
      data: {
        senderId: userId,
        recipientId,
        subject: subject || null,
        content,
        courseId: courseId || null,
        senderRole: session?.user?.role || 'STUDENT',
      },
    })

    await db.notification.create({
      data: {
        userId: recipientId,
        title: `New message from ${session?.user?.name || 'Someone'}`,
        message: subject ? `${subject}: ${content.substring(0, 100)}...` : content.substring(0, 150),
        type: 'INFO',
        link: 'messages',
      },
    })

    return NextResponse.json({ message, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
