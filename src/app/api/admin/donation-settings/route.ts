import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create donation settings (should be exactly one record)
    let settings = await db.donationSettings.findFirst()
    if (!settings) {
      settings = await db.donationSettings.create({
        data: {
          goalAmount: 5000000,
          currentAmount: 0,
          currency: 'NGN',
          isActive: true,
          updatedBy: admin.id,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch donation settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Whitelist allowed fields
    const ALLOWED_FIELDS = [
      'goalAmount',
      'currentAmount',
      'currency',
      'paystackPublicKey',
      'paystackSecretKey',
      'message',
      'isActive',
    ]
    
    let settings = await db.donationSettings.findFirst()
    if (!settings) {
      // Build data object with required fields
      const createData: any = {
        updatedBy: admin.id,
      }
      for (const key of ALLOWED_FIELDS) {
        if (key in body) {
          createData[key] = body[key]
        }
      }
      settings = await db.donationSettings.create({
        data: createData,
      })
    } else {
      // Build data object for update
      const updateData: any = {
        updatedBy: admin.id,
      }
      for (const key of ALLOWED_FIELDS) {
        if (key in body) {
          updateData[key] = body[key]
        }
      }
      settings = await db.donationSettings.update({
        where: { id: settings.id },
        data: updateData,
      })
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update donation settings' },
      { status: 500 }
    )
  }
}
