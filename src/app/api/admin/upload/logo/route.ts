import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { uploadToR2, isR2Configured } from "@/lib/r2"

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG" }, { status: 400 })
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 2MB" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadToR2(buffer, {
      folder: 'logos',
      contentType: file.type,
      fileType: 'image',
      maxSizeBytes: maxSize,
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
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
