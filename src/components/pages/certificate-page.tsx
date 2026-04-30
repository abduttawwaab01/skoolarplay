'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Share2,
  X,
  Loader2,
  Copy,
  Check,
  Award,
  ArrowLeft,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { CertificateView } from '@/components/certificate/certificate-view'
import { toast } from 'sonner'

interface CertificateData {
  id: string
  courseName: string
  verificationCode: string
  type: string
  score: number | null
  totalLessons: number | null
  completedLessons: number | null
  issuedBy: string
  ownerName: string
  earnedAt: string
  userName: string
  userEmail: string
  course: {
    title: string
    description: string | null
    difficulty: string
    category: string | null
  } | null
}

export function CertificatePage() {
  const { params, goBack } = useAppStore()
  const certificateId = params?.certificateId as string
  const playCorrect = useSoundEffect('correct')
  const playClick = useSoundEffect('click')
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchCertificate() {
      if (!certificateId) {
        setError('No certificate ID provided')
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/certificates/${certificateId}`)
        if (!res.ok) {
          throw new Error('Failed to load certificate')
        }
        const data = await res.json()
        setCertificate(data.certificate)
        // Play celebration sound
        setTimeout(() => playCorrect(), 300)
      } catch (err: any) {
        setError(err.message || 'Failed to load certificate')
      } finally {
        setLoading(false)
      }
    }
    fetchCertificate()
  }, [certificateId])

  const getShareText = useCallback(() => {
    if (!certificate) return ''
    const type = certificate.type === 'PREMIUM' ? 'Premium' : ''
    return `I just earned a ${type} Certificate for completing "${certificate.courseName}" on SkoolarPlay! Verify: ${certificate.verificationCode}`
  }, [certificate])

  const getShareUrl = useCallback(() => {
    if (!certificate) return ''
    return `https://skoolarplay.com/cert/verify?code=${certificate.verificationCode}`
  }, [certificate])

  const shareToWhatsApp = () => {
    playClick()
    const text = encodeURIComponent(getShareText())
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShowShareMenu(false)
  }

  const shareToTwitter = () => {
    playClick()
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    setShowShareMenu(false)
  }

  const shareToFacebook = () => {
    playClick()
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
    setShowShareMenu(false)
  }

  const shareToLinkedIn = () => {
    playClick()
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
    setShowShareMenu(false)
  }

  const copyLink = () => {
    playClick()
    const url = getShareUrl()
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Verification link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const downloadCertificate = async () => {
    playClick()
    setDownloading(true)
    try {
      // Use canvas-based approach: serialize the DOM to SVG foreignObject then render
      const el = certificateRef.current
      if (!el) {
        toast.error('Certificate element not found')
        return
      }

      // Try using the browser's built-in print to PDF
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Certificate - ${certificate?.courseName || 'SkoolarPlay'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
              @media print {
                body { background: white; }
                .no-print { display: none !important; }
              }
              @page { size: landscape; margin: 0; }
            </style>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
          </head>
          <body>
            <div id="print-cert">${el.innerHTML}</div>
            <div class="no-print" style="text-align:center;padding:20px;position:fixed;bottom:20px;left:50%;transform:translateX(-50%)">
              <button onclick="window.print()" style="padding:12px 32px;background:#15803d;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;margin-right:10px;">Download as PDF</button>
              <button onclick="window.close()" style="padding:12px 32px;background:#6b7280;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;">Close</button>
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()
      }
    } catch (err) {
      toast.error('Failed to download certificate')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your certificate...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <X className="w-16 h-16 text-red-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'This certificate could not be loaded.'}</p>
          <Button onClick={() => goBack()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isPremium = certificate.type === 'PREMIUM'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-amber-50">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => goBack()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            size="sm"
            onClick={downloadCertificate}
            disabled={downloading}
            className={isPremium ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' : ''}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Preparing...' : 'Download'}
          </Button>
        </div>
      </div>

      {/* Share menu dropdown */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-4 z-50 bg-white rounded-xl shadow-xl border p-2 w-56"
          >
            <button
              onClick={shareToWhatsApp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </button>
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-sm transition-colors"
            >
              <Twitter className="w-4 h-4 text-blue-500" />
              Twitter / X
            </button>
            <button
              onClick={shareToFacebook}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-sm transition-colors"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </button>
            <button
              onClick={shareToLinkedIn}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-sm transition-colors"
            >
              <Linkedin className="w-4 h-4 text-blue-700" />
              LinkedIn
            </button>
            <div className="border-t my-1" />
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
              {copied ? 'Copied!' : 'Copy Verification Link'}
            </button>
            <button
              onClick={() => {
                playClick()
                window.open(getShareUrl(), '_blank')
                setShowShareMenu(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
              Verify Online
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate display */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -5 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="overflow-auto"
        >
          <CertificateView ref={certificateRef} certificate={certificate} />
        </motion.div>
      </div>

      {/* Certificate info cards */}
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <Award className={`w-6 h-6 mx-auto mb-1 ${isPremium ? 'text-amber-500' : 'text-green-600'}`} />
            <p className="text-lg font-bold">{certificate.type}</p>
            <p className="text-xs text-gray-500">Certificate Type</p>
          </div>
          {certificate.score !== null && (
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
              <p className="text-lg font-bold text-green-700">{certificate.score}%</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </div>
          )}
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <p className="text-lg font-bold text-gray-700">
              {certificate.completedLessons}/{certificate.totalLessons}
            </p>
            <p className="text-xs text-gray-500">Lessons Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border">
            <p className="text-sm font-bold text-gray-700 font-mono">{certificate.verificationCode.slice(0, 12)}</p>
            <p className="text-xs text-gray-500">Verification ID</p>
          </div>
        </div>

        {/* Share CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center text-white"
        >
          <h3 className="text-lg font-bold mb-2">Share Your Achievement!</h3>
          <p className="text-sm text-green-100 mb-4">
            Let the world know about your accomplishment. Share on social media or download your certificate.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button variant="secondary" size="sm" onClick={shareToWhatsApp}>
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="secondary" size="sm" onClick={shareToTwitter}>
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button variant="secondary" size="sm" onClick={shareToFacebook}>
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button variant="secondary" size="sm" onClick={shareToLinkedIn}>
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCertificate} className="text-white border-white/30 hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </motion.div>

        {/* Premium upsell for standard certificate holders */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900">Upgrade to Premium Certificate</h4>
                <p className="text-sm text-amber-800 mt-1">
                  Get a premium verified certificate with a gold seal, enhanced design, and priority verification.
                  Premium certificates carry more weight on your CV and LinkedIn profile.
                </p>
                <Button size="sm" className="mt-3 bg-gradient-to-r from-amber-500 to-amber-600">
                  Upgrade for 200 Gems
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
