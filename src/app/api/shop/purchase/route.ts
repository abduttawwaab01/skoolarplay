import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantity = 1 } = body

    // Validate quantity
    const qty = Math.max(1, Math.min(99, quantity || 1))

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const item = await db.shopItem.findUnique({
      where: { id: itemId, isActive: true },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check stock for limited items
    if (item.quantity !== null && item.quantity <= 0) {
      return NextResponse.json({ error: 'Item is out of stock' }, { status: 400 })
    }

    const totalGems = item.price * qty

    // Create purchase and deduct gems in transaction — balance check inside to prevent TOCTOU
     const result = await db.$transaction(async (tx) => {
       // Re-fetch user inside transaction for accurate balance
       const freshUser = await tx.user.findUnique({
         where: { id: userId },
         select: { gems: true, hearts: true, maxHearts: true, activeBoosts: true, xpMultiplier: true },
       })

       if (!freshUser) {
         throw new Error('USER_NOT_FOUND')
       }

       if (freshUser.gems < totalGems) {
         throw new Error(`INSUFFICIENT_GEMS:${totalGems}:${freshUser.gems}`)
       }

       const purchase = await tx.purchase.create({
         data: {
           userId,
           itemId,
           quantity: qty,
           totalGems,
         },
         include: {
           shopItem: {
             select: { title: true, icon: true, type: true },
           },
         },
         // Note: We avoid selecting shopItem.type and title in purchase include to avoid circular; we'll fetch separately if needed
       })

       // Deduct gems first
       let updatedUser: { gems: number; hearts: number; maxHearts: number; xpMultiplier?: number } = await tx.user.update({
         where: { id: userId },
         data: { gems: { decrement: totalGems } },
         select: { gems: true, hearts: true, maxHearts: true, xpMultiplier: true },
       })

       // Fetch the shop item to determine effect
       const shopItem = await tx.shopItem.findUnique({
         where: { id: itemId },
         select: { title: true, type: true },
       })

       if (shopItem) {
         const title = shopItem.title.toLowerCase()
         const type = shopItem.type

          // Heart Refill: restore hearts to max
          if (type === 'HEART_REFILL' || (type === 'POWER_UP' && title.includes('heart'))) {
            const settings = await tx.adminSettings.findFirst()
            const maxHearts = settings?.maxHearts || freshUser.maxHearts || 5
            await tx.user.update({
              where: { id: userId },
              data: {
                hearts: maxHearts,
                lastHeartRefillAt: new Date(),
              },
            })
            // Update the returned user object
            updatedUser.hearts = maxHearts
          }

         // Extra Life: increase max hearts and refill
         if (type === 'POWER_UP' && title.includes('extra life')) {
           await tx.user.update({
             where: { id: userId },
             data: {
               maxHearts: { increment: 1 },
               hearts: { increment: 1 },
             },
           })
           updatedUser.maxHearts = (freshUser.maxHearts || 5) + 1
           updatedUser.hearts = (freshUser.hearts || 0) + 1
         }

// Streak Freeze: no immediate effect; purchase record is enough
          // The streak freeze endpoint will check purchases where shopItem.type === 'STREAK_FREEZE'

          // Boosts: Apply XP or Gem multipliers
          if (type === 'BOOST') {
            // Extract duration from title or use default 24 hours
            let durationHours = 24
            if (title.includes('1 hour')) durationHours = 1
            else if (title.includes('3 hour')) durationHours = 3
            else if (title.includes('6 hour')) durationHours = 6
            else if (title.includes('12 hour')) durationHours = 12
            else if (title.includes('24 hour')) durationHours = 24
            else if (title.includes('48 hour')) durationHours = 48
            else if (title.includes('1 day')) durationHours = 24
            else if (title.includes('3 day')) durationHours = 72
            
            const boostExpiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)
            
            // Parse existing active boosts
            const currentBoosts = JSON.parse(freshUser?.activeBoosts || '[]')
            
            // Add new boost
            const newBoost = {
              type: title.toUpperCase().includes('XP') ? 'XP_BOOST' : 'GEM_BOOST',
              multiplier: title.toUpperCase().includes('2X') ? 2.0 : title.toUpperCase().includes('3X') ? 3.0 : 1.5,
              expiresAt: boostExpiresAt.toISOString(),
            }
            
            // Filter out expired boosts and add new one
            const validBoosts = currentBoosts.filter((b: any) => new Date(b.expiresAt) > new Date())
            validBoosts.push(newBoost)
            
            // Calculate combined multiplier
            const xpMultiplier = validBoosts
              .filter((b: any) => b.type === 'XP_BOOST')
              .reduce((max: number, b: any) => Math.max(max, b.multiplier), 1.0)
            
            await tx.user.update({
              where: { id: userId },
              data: {
                xpMultiplier,
                activeBoosts: JSON.stringify(validBoosts),
              },
            })
            
            updatedUser.xpMultiplier = xpMultiplier
          }
        }

       // Decrease stock if limited
       if (item.quantity !== null) {
         await tx.shopItem.update({
           where: { id: itemId },
           data: { quantity: { decrement: qty } },
         })
       }

       return { purchase, updatedUser }
     })

    return NextResponse.json({
      success: true,
      purchase: result.purchase,
      gemsRemaining: result.updatedUser.gems,
    })
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (error.message?.startsWith('INSUFFICIENT_GEMS:')) {
      const [, required, current] = error.message.split(':')
      return NextResponse.json(
        { error: 'Insufficient gems', required: Number(required), current: Number(current) },
        { status: 400 }
      )
    }
    console.error('Purchase API error:', error)
    return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 })
  }
}
