import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPresignedUploadUrl, isR2Configured, FileType, FILE_LIMITS } from '@/lib/r2'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const ALLOWED_FOLDERS = ['images', 'logos', 'videos', 'avatars', 'documents', 'announcements']

const FILE_TYPE_LIMITS = {
  image: 5 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
}

async function getUploadUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session.user as { id: string; role: string }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUploadUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fileName, contentType, fileType = 'image', folder = 'misc' } = body

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'fileName and contentType are required' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
    }

    if (!isR2Configured) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })
    }

    const maxSize = FILE_TYPE_LIMITS[fileType as FileType] || FILE_LIMITS.image

    const result = await getPresignedUploadUrl(
      fileName,
      contentType,
      fileType as FileType,
      maxSize
    )

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      uploadUrl: result.url,
      key: result.key,
    })
  } catch (error: any) {
    console.error('Presigned URL error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate upload URL' }, { status: 500 })
  }
}
