import { Resend } from 'resend'
import { db } from '@/lib/db'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SkoolarPlay <noreply@skoolarplay.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://skoolarplay.com'

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const resend = getResendClient()
  if (!resend) {
    console.log('[Email] RESEND_API_KEY not configured, skipping email to:', to)
    return false
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    if (error) {
      console.error('[Email] Send error:', error)
      return false
    }

    console.log('[Email] Sent successfully:', data?.id)
    return true
  } catch (err) {
    console.error('[Email] Exception:', err)
    return false
  }
}

async function shouldSendEmail(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { emailNotifications: true },
    })
    return user?.emailNotifications ?? true
  } catch {
    return true // Default to sending if check fails
  }
}

function wrapInTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #008751 0%, #005E38 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #008751; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
    .button:hover { background: #005E38; }
    .highlight { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #008751; }
    .emoji { font-size: 48px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 SkoolarPlay</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SkoolarPlay. All rights reserved.</p>
      <p><a href="${APP_URL}" style="color: #008751;">Visit SkoolarPlay</a> • <a href="${APP_URL}/profile" style="color: #008751;">Update Preferences</a></p>
    </div>
  </div>
</body>
</html>
  `
}

export async function sendAchievementEmail(
  userId: string,
  userEmail: string,
  userName: string,
  achievement: { title: string; description: string; xpReward: number; gemReward: number }
): Promise<boolean> {
  if (!await shouldSendEmail(userId)) {
    console.log('[Email] User has email notifications disabled:', userId)
    return false
  }
  
  const html = wrapInTemplate(`
    <div class="emoji">🏆</div>
    <h2 style="text-align: center; color: #008751;">Achievement Unlocked!</h2>
    <p>Congratulations, <strong>${userName}</strong>!</p>
    <div class="highlight">
      <h3 style="margin: 0 0 10px 0;">${achievement.title}</h3>
      <p style="margin: 0;">${achievement.description}</p>
    </div>
    <p>You've earned:</p>
    <ul>
      <li>⭐ <strong>${achievement.xpReward} XP</strong></li>
      <li>💎 <strong>${achievement.gemReward} Gems</strong></li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/achievements" class="button">View Achievements</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `🏆 Achievement Unlocked: ${achievement.title}`,
    html,
  })
}

export async function sendLevelUpEmail(
  userId: string,
  userEmail: string,
  userName: string,
  newLevel: number,
  gemsEarned: number
): Promise<boolean> {
  if (!await shouldSendEmail(userId)) {
    console.log('[Email] User has email notifications disabled:', userId)
    return false
  }
  
  const html = wrapInTemplate(`
    <div class="emoji">⬆️</div>
    <h2 style="text-align: center; color: #008751;">Level Up!</h2>
    <p>Awesome job, <strong>${userName}</strong>!</p>
    <div class="highlight" style="text-align: center;">
      <p style="font-size: 18px; margin: 0;">You're now</p>
      <p style="font-size: 48px; font-weight: bold; color: #008751; margin: 10px 0;">LEVEL ${newLevel}</p>
    </div>
    <p>You earned a level-up bonus of <strong>💎 ${gemsEarned} gems</strong>!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/profile" class="button">View Profile</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `🎉 Level Up! You're now Level ${newLevel}!`,
    html,
  })
}

export async function sendQuestCompleteEmail(
  userId: string,
  userEmail: string,
  userName: string,
  quest: { title: string; xpReward: number; gemReward: number }
): Promise<boolean> {
  if (!await shouldSendEmail(userId)) {
    console.log('[Email] User has email notifications disabled:', userId)
    return false
  }
  
  const html = wrapInTemplate(`
    <div class="emoji">⚔️</div>
    <h2 style="text-align: center; color: #008751;">Quest Complete!</h2>
    <p>Well done, <strong>${userName}</strong>!</p>
    <div class="highlight">
      <h3 style="margin: 0 0 10px 0;">${quest.title}</h3>
    </div>
    <p>Rewards claimed:</p>
    <ul>
      <li>⭐ <strong>${quest.xpReward} XP</strong></li>
      <li>💎 <strong>${quest.gemReward} Gems</strong></li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/quests" class="button">View More Quests</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `⚔️ Quest Complete: ${quest.title}`,
    html,
  })
}

export async function sendStreakMilestoneEmail(
  userId: string,
  userEmail: string,
  userName: string,
  streakDays: number
): Promise<boolean> {
  if (!await shouldSendEmail(userId)) {
    console.log('[Email] User has email notifications disabled:', userId)
    return false
  }
  
  const milestones = {
    3: { emoji: '🔥', message: 'You\'re on fire!' },
    7: { emoji: '🌟', message: 'One full week!' },
    14: { emoji: '💪', message: 'Two weeks strong!' },
    30: { emoji: '🏅', message: 'A month of dedication!' },
    60: { emoji: '👑', message: 'Two months of excellence!' },
    100: { emoji: '💎', message: 'A true Skoolar champion!' },
    180: { emoji: '🚀', message: 'Half a year of learning!' },
    365: { emoji: '🎯', message: 'One full year! Legendary!' },
  }

  const milestone = milestones[streakDays as keyof typeof milestones] || { emoji: '🔥', message: 'Keep it up!' }

  const html = wrapInTemplate(`
    <div class="emoji">${milestone.emoji}</div>
    <h2 style="text-align: center; color: #008751;">Streak Milestone!</h2>
    <p>Congratulations, <strong>${userName}</strong>!</p>
    <div class="highlight" style="text-align: center;">
      <p style="font-size: 18px; margin: 0;">${milestone.message}</p>
      <p style="font-size: 48px; font-weight: bold; color: #008751; margin: 10px 0;">${streakDays} DAYS</p>
    </div>
    <p>Your consistent learning is paying off. Keep the streak going!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">Continue Learning</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `🔥 ${streakDays}-Day Streak! ${milestone.message}`,
    html,
  })
}

export async function sendDailyDigestEmail(
  userEmail: string,
  userName: string,
  data: {
    lessonsCompleted: number
    xpEarned: number
    currentStreak: number
    dailyChallengeCompleted: boolean
    gemsEarned: number
  }
): Promise<boolean> {
  const html = wrapInTemplate(`
    <h2 style="text-align: center;">Good ${getTimeOfDay()}, ${userName}!</h2>
    <p style="text-align: center;">Here's your daily learning summary:</p>
    <div class="highlight">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">📚 Lessons Completed</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.lessonsCompleted}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">⭐ XP Earned</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.xpEarned}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">💎 Gems Earned</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.gemsEarned}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">🔥 Current Streak</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.currentStreak} days</td>
        </tr>
        <tr>
          <td style="padding: 10px;">✅ Daily Challenge</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${data.dailyChallengeCompleted ? 'Completed!' : 'Not yet'}</td>
        </tr>
      </table>
    </div>
    ${data.currentStreak > 0 ? '<p>🔥 Don\'t break your streak! Keep learning every day.</p>' : '<p>Start a new streak today!</p>'}
    <p style="text-align: center;">
      <a href="${APP_URL}/daily-challenge" class="button">Start Today's Challenge</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `📊 Your Daily Learning Summary - ${new Date().toLocaleDateString()}`,
    html,
  })
}

export async function sendWeeklyDigestEmail(
  userEmail: string,
  userName: string,
  data: {
    lessonsCompleted: number
    xpEarned: number
    gemsEarned: number
    achievementsEarned: number
    currentStreak: number
    levelProgress: number
    nextMilestone: string
  }
): Promise<boolean> {
  const html = wrapInTemplate(`
    <h2 style="text-align: center;">Your Weekly Report, ${userName}!</h2>
    <p style="text-align: center;">Here's what you accomplished this week:</p>
    <div class="emoji">📈</div>
    <div class="highlight">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">📚 Lessons Completed</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.lessonsCompleted}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">⭐ Total XP</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.xpEarned}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">💎 Gems Earned</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.gemsEarned}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">🏆 Achievements</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${data.achievementsEarned}</td>
        </tr>
        <tr>
          <td style="padding: 10px;">🔥 Longest Streak</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${data.currentStreak} days</td>
        </tr>
      </table>
    </div>
    <p><strong>Level Progress:</strong> ${data.levelProgress}% to ${data.nextMilestone}</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/profile" class="button">View Full Progress</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `📊 Your Weekly Learning Report - ${getWeekRange()}`,
    html,
  })
}

export async function sendInactivityReminderEmail(
  userEmail: string,
  userName: string,
  daysInactive: number,
  lastActive: string
): Promise<boolean> {
  const html = wrapInTemplate(`
    <div class="emoji">👋</div>
    <h2 style="text-align: center;">We Miss You, ${userName}!</h2>
    <p style="text-align: center;">It's been <strong>${daysInactive} days</strong> since your last lesson.</p>
    <p>Your streak is waiting for you! Don't let it go to waste.</p>
    <div class="highlight">
      <p style="margin: 0;"><strong>Last active:</strong> ${lastActive}</p>
    </div>
    <p>Return now and keep your learning momentum going!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">Start Learning Now</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `👋 We Miss You! Your Learning Journey Awaits`,
    html,
  })
}

export async function sendHeartReminderEmail(
  userEmail: string,
  userName: string,
  currentHearts: number,
  maxHearts: number
): Promise<boolean> {
  const html = wrapInTemplate(`
    <div class="emoji">❤️</div>
    <h2 style="text-align: center;">Hearts Running Low!</h2>
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Your hearts are running low. You have <strong>${currentHearts} of ${maxHearts} hearts</strong> remaining.</p>
    <p>Wait a few hours for your hearts to refill, or purchase more gems to get back in the game!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">Play Now</a>
    </p>
  `)

  return sendEmail({
    to: userEmail,
    subject: `❤️ Hearts Running Low - Keep Learning!`,
    html,
  })
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function getWeekRange(): string {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  
  const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${format(start)} - ${format(end)}`
}
