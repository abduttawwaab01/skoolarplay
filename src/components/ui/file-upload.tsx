'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image, Video, File, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  type: 'image' | 'video' | 'document'
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  accept?: string
  maxSizeMB?: number
  uploadEndpoint?: string
  className?: string
  placeholder?: string
}

const TYPE_CONFIG = {
  image: {
    icon: Image,
    accept: 'image/*',
    defaultMaxSize: 5,
    uploadEndpoint: '/api/admin/upload/announcement',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  video: {
    icon: Video,
    accept: 'video/mp4,video/webm,video/quicktime',
    defaultMaxSize: 100,
    uploadEndpoint: '/api/admin/upload/video',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  document: {
    icon: File,
    accept: '.pdf,.doc,.docx',
    defaultMaxSize: 10,
    uploadEndpoint: '/api/upload',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
}

export function FileUpload({
  type,
  value,
  onChange,
  onClear,
  accept,
  maxSizeMB,
  uploadEndpoint,
  className,
  placeholder,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = TYPE_CONFIG[type]
  const Icon = config.icon
  const maxSize = maxSizeMB || config.defaultMaxSize
  const endpoint = uploadEndpoint || config.uploadEndpoint

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB`)
      return
    }

    handleUpload(file)
  }, [maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB`)
      return
    }

    handleUpload(file)
  }, [maxSize])

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setError(null)
    onChange('')
    onClear?.()
  }

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative group">
          {type === 'image' && (
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg border"
            />
          )}
          {type === 'video' && (
            <video
              src={value}
              controls
              className="w-full h-40 object-cover rounded-lg border"
            />
          )}
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept || config.accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={cn('p-3 rounded-full', config.bgColor)}>
                <Upload className={cn('w-6 h-6', config.color)} />
              </div>
              <p className="text-sm text-gray-500">
                {placeholder || `Drag & drop or click to upload`}
              </p>
              <p className="text-xs text-gray-400">
                Max size: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {value && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste URL"
            className="flex-1 px-3 py-2 text-sm border rounded-md"
          />
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

interface LogoUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function LogoUpload({ value, onChange, className }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Maximum size is 2MB')
      return
    }

    handleUpload(file)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Logo"
            className="h-16 w-auto object-contain rounded border"
          />
          <button
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500">Upload logo (max 2MB)</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste logo URL"
          className="w-full px-2 py-1 text-xs border rounded"
        />
      )}
    </div>
  )
}
