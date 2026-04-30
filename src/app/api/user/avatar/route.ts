import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToR2, isR2Configured } from "@/lib/r2"
import { db } from "@/lib/db"
import sharp from "sharp"

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isR2Configured) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP" }, { status: 400 })
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 2MB" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer) as unknown as Buffer

    // Compress image using sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Resize to max 500x500 if larger, and compress
    let processedBuffer: Buffer = buffer
    if (metadata.width && metadata.width > 500) {
      processedBuffer = await image
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer() as unknown as Buffer
    } else {
      // Just compress without resizing
      processedBuffer = await image
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer() as unknown as Buffer
    }

    // If still too large after compression, reduce quality further
    if (processedBuffer.length > maxSize) {
      processedBuffer = await image
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 60 })
        .toBuffer() as unknown as Buffer
    }

    const userId = session.user.id
    const result = await uploadToR2(processedBuffer, {
      folder: 'avatars',
      contentType: 'image/jpeg',
      fileType: 'image',
      maxSizeBytes: maxSize,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Update user avatar
    await db.user.update({
      where: { id: userId },
      data: { avatar: result.url },
    })

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
