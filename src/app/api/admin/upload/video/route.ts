import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { uploadToR2, isR2Configured } from "@/lib/r2"
import { db } from "@/lib/db"

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for large video uploads

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isR2Configured) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }

    // Get video size limit from admin settings
    const settings = await db.adminSettings.findFirst()
    const maxVideoSizeMb = settings?.maxVideoSizeMb || 100
    const maxSizeBytes = maxVideoSizeMb * 1024 * 1024

    // Parse allowed formats
    let allowedFormats = ['mp4', 'webm', 'mov']
    try {
      if (settings?.allowedVideoFormats) {
        allowedFormats = JSON.parse(settings.allowedVideoFormats)
      }
    } catch (e) {}

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    const allowedMimes = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
    }

    if (!allowedFormats.includes(fileExt)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed formats: ${allowedFormats.join(', ')}` 
      }, { status: 400 })
    }

    if (file.size > maxSizeBytes) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${maxVideoSizeMb}MB` 
      }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadToR2(buffer, {
      folder: 'videos',
      contentType: allowedMimes[fileExt as keyof typeof allowedMimes] || 'video/mp4',
      fileType: 'video',
      maxSizeBytes,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error: any) {
    console.error('Video upload error:', error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
