import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Use transaction to ensure all data is deleted or none
    await db.$transaction(async (tx) => {
      await tx.groupMessage.deleteMany({ where: { senderId: userId } })
      await tx.studyGroupMember.deleteMany({ where: { userId } })
      await tx.studyGroup.deleteMany({ where: { createdBy: userId } })
      await tx.enrollment.deleteMany({ where: { userId } })
      await tx.lessonProgress.deleteMany({ where: { userId } })
      await tx.userAchievement.deleteMany({ where: { userId } })
      await tx.purchase.deleteMany({ where: { userId } })
      await tx.dailyChallengeCompletion.deleteMany({ where: { userId } })
      await tx.leaderboardEntry.deleteMany({ where: { userId } })
      await tx.certificate.deleteMany({ where: { userId } })
      await tx.examAttempt.deleteMany({ where: { userId } })
      await tx.notification.deleteMany({ where: { userId } })
      await tx.loginReward.deleteMany({ where: { userId } })
      await tx.spinResult.deleteMany({ where: { userId } })
      await tx.questCompletion.deleteMany({ where: { userId } })
      await tx.referral.deleteMany({ 
        where: { 
          OR: [{ referrerId: userId }, { referredId: userId }] 
        } 
      })
      await tx.mysteryBox.deleteMany({ where: { userId } })
      await tx.bossBattleCompletion.deleteMany({ where: { userId } })
      await tx.motivationalQuote.deleteMany({ where: { createdBy: userId } })
      await tx.courseReview.deleteMany({ where: { userId } })
      await tx.groupChallengeCompletion.deleteMany({ where: { userId } })
      await tx.gemGift.deleteMany({ 
        where: { 
          OR: [{ senderId: userId }, { recipientId: userId }] 
        } 
      })
      await tx.teacherMessage.deleteMany({ 
        where: { 
          OR: [{ senderId: userId }, { recipientId: userId }] 
        } 
      })
      await tx.auditLog.deleteMany({ where: { actorId: userId } })
      await tx.payment.deleteMany({ where: { userId } })
      await tx.userReport.deleteMany({ 
        where: { 
          reporterId: userId 
        } 
      })
      await tx.pushSubscription.deleteMany({ where: { userId } })
      
      // Delete user last
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
