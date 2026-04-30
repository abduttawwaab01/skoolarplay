import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
    }

    const certificate = await db.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ valid: false, error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        courseName: certificate.courseName,
        type: certificate.type,
        certificateLevel: certificate.certificateLevel,
        score: certificate.score,
        earnedAt: certificate.earnedAt,
        userName: certificate.user.name,
        issuedBy: certificate.issuedBy,
      },
    })
  } catch (error: any) {
    console.error('Certificate verification error:', error)
    return NextResponse.json({ error: 'Failed to verify certificate' }, { status: 500 })
  }
}
