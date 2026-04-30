import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2, isR2Configured, FileType } from '@/lib/r2'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_FOLDERS = ['images', 'logos', 'videos', 'avatars', 'documents', 'announcements', 'misc']

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

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || 'misc'
    const fileType = formData.get('fileType') as FileType || 'image'
    const customFileName = formData.get('fileName') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
    }

    if (!isR2Configured) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadToR2(buffer, {
      folder,
      fileName: customFileName || undefined,
      contentType: file.type,
      fileType,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
