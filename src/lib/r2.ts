import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME || 'skoolarplay',
  publicUrl: process.env.R2_PUBLIC_URL,
}

const isR2Configured = Boolean(
  R2_CONFIG.accountId &&
  R2_CONFIG.accessKeyId &&
  R2_CONFIG.secretAccessKey &&
  R2_CONFIG.bucketName
)

const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId!,
        secretAccessKey: R2_CONFIG.secretAccessKey!,
      },
    })
  : null

export type FileType = 'image' | 'video' | 'document' | 'audio'

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export interface UploadOptions {
  folder?: string
  fileName?: string
  contentType?: string
  maxSizeBytes?: number
}

const FILE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB (admin configurable)
  document: 10 * 1024 * 1024, // 10MB
  audio: 50 * 1024 * 1024, // 50MB
}

const ALLOWED_CONTENT_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

function generateFileName(originalName: string, folder: string): string {
  const ext = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = uuidv4().slice(0, 8)
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
  return `${folder}/${timestamp}-${random}-${baseName}${ext ? '.' + ext : ''}`
}

function isContentTypeAllowed(contentType: string, fileType: FileType): boolean {
  return ALLOWED_CONTENT_TYPES[fileType]?.includes(contentType) || false
}

export async function uploadToR2(
  file: Buffer | ArrayBuffer,
  options: UploadOptions & { fileType: FileType }
): Promise<UploadResult> {
  const { folder = 'misc', fileName, contentType, fileType, maxSizeBytes } = options

  if (!isR2Configured || !s3Client) {
    return {
      success: false,
      error: 'R2 is not configured. Please set R2 environment variables.',
    }
  }

  try {
    const buffer = Buffer.from(new Uint8Array(file as ArrayBuffer))
    const effectiveMaxSize = maxSizeBytes || FILE_LIMITS[fileType]

    if (buffer.length > effectiveMaxSize) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${Math.round(effectiveMaxSize / 1024 / 1024)}MB`,
      }
    }

    if (contentType && !isContentTypeAllowed(contentType, fileType)) {
      return {
        success: false,
        error: `File type ${contentType} is not allowed for ${fileType} uploads`,
      }
    }

    const key = fileName || generateFileName('file', folder)

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
      })
    )

    // For public access, use the R2 public URL format
    // The publicUrl should be the base R2 domain without the bucket name
    const baseUrl = R2_CONFIG.publicUrl
      ? R2_CONFIG.publicUrl.replace(/\/$/, '')
      : `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`
    
    const url = `${baseUrl}/${key}`

    return {
      success: true,
      url,
      key,
    }
  } catch (error: any) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    }
  }
}

export async function deleteFromR2(key: string): Promise<boolean> {
  if (!isR2Configured || !s3Client) {
    return false
  }

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error('R2 delete error:', error)
    return false
  }
}

export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  fileType: FileType,
  maxSizeBytes?: number
): Promise<{ url: string; key: string; expiresIn: number } | { error: string }> {
  if (!isR2Configured || !s3Client) {
    return { error: 'R2 is not configured' }
  }

  try {
    const effectiveMaxSize = maxSizeBytes || FILE_LIMITS[fileType]
    const key = generateFileName(fileName, fileType === 'video' ? 'videos' : fileType === 'image' ? 'images' : 'files')

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const baseUrl = R2_CONFIG.publicUrl
      ? R2_CONFIG.publicUrl.replace(/\/$/, '')
      : `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`
    const publicUrl = `${baseUrl}/${key}`

    return {
      url,
      key,
      expiresIn: 3600,
    } as { url: string; key: string; expiresIn: number } | { error: string }
  } catch (error: any) {
    console.error('Presigned URL error:', error)
    return { error: error.message || 'Failed to generate upload URL' }
  }
}

export async function getPresignedDownloadUrl(key: string): Promise<string | null> {
  if (!isR2Configured || !s3Client) {
    return null
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    })

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  } catch (error) {
    console.error('Presigned download URL error:', error)
    return null
  }
}

export function extractR2KeyFromUrl(url: string): string | null {
  if (!url) return null

  if (url.includes(R2_CONFIG.bucketName) && url.includes('.r2.')) {
    const match = url.match(/\.r2\.cloudflarestorage\.com\/(.+)$/i)
    if (match) return match[1]
  }

  if (R2_CONFIG.publicUrl && url.includes(R2_CONFIG.publicUrl)) {
    return url.replace(R2_CONFIG.publicUrl.replace(/\/$/, ''), '').replace(/^\//, '')
  }

  if (url.includes('/videos/') || url.includes('/images/') || url.includes('/avatars/') || url.includes('/logos/')) {
    return url.split('/').slice(-2).join('/')
  }

  return null
}

export { isR2Configured, FILE_LIMITS, R2_CONFIG }
