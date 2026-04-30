'use client'

import { forwardRef } from 'react'
import { Award, Shield, ExternalLink, Star, Crown } from 'lucide-react'

interface CertificateData {
  id: string
  courseName: string
  verificationCode: string
  type: string
  certificateLevel?: string
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

interface CertificateViewProps {
  certificate: CertificateData
}

const levelConfig: Record<string, {
  label: string
  bgColor: string
  textColor: string
  borderColor: string
  glowColor: string
  icon: typeof Award
}> = {
  premium: {
    label: 'PREMIUM',
    bgColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
    textColor: '#78350f',
    borderColor: '#FFD700',
    glowColor: '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1)',
    icon: Crown,
  },
  intermediate: {
    label: 'INTERMEDIATE',
    bgColor: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
    textColor: '#FFFFFF',
    borderColor: '#60A5FA',
    glowColor: '0 0 15px rgba(96, 165, 250, 0.2)',
    icon: Star,
  },
  basic: {
    label: 'BASIC',
    bgColor: 'linear-gradient(135deg, #22c55e, #15803d)',
    textColor: '#FFFFFF',
    borderColor: '#22c55e',
    glowColor: 'none',
    icon: Shield,
  },
}

export const CertificateView = forwardRef<HTMLDivElement, CertificateViewProps>(
  ({ certificate }, ref) => {
    const isPremium = certificate.type === 'PREMIUM'
    const level = certificate.certificateLevel || 'basic'
    const levelInfo = levelConfig[level] || levelConfig.basic
    const LevelIcon = levelInfo.icon
    const earnedDate = new Date(certificate.earnedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return (
      <div
        ref={ref}
        className="relative w-[900px] h-[636px] bg-white overflow-hidden shadow-2xl"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          boxShadow: isPremium ? levelInfo.glowColor + ', 0 25px 50px -12px rgba(0,0,0,0.25)' : undefined,
        }}
      >
        {/* Outer decorative border */}
        <div className={`absolute inset-0 border-[3px] ${isPremium ? 'border-amber-400' : 'border-amber-600'}`} />
        <div className={`absolute inset-[6px] border-[1px] ${isPremium ? 'border-amber-300' : 'border-amber-400'}`} />
        <div className="absolute inset-[10px] border-[2px] border-green-700" />
        <div className="absolute inset-[14px] border-[1px] border-green-500" />

        {/* Premium gold glow border */}
        {isPremium && (
          <div
            className="absolute inset-[4px] rounded-sm pointer-events-none z-0"
            style={{
              boxShadow: 'inset 0 0 30px rgba(255, 215, 0, 0.15), inset 0 0 60px rgba(255, 215, 0, 0.05)',
            }}
          />
        )}

        {/* Diagonal watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'rotate(-30deg)', zIndex: 1 }}
        >
          <p
            className="text-[72px] font-bold tracking-widest opacity-[0.04] text-gray-800 select-none whitespace-nowrap"
          >
            SkoolarPlay | Odebunmi Tawwāb
          </p>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full py-8 px-16">
          {/* Top section */}
          <div className="text-center w-full">
            {/* Logo area */}
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                isPremium ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-green-600 to-green-800'
              }`}>
                S
              </div>
              <span
                className="text-2xl font-bold tracking-wide"
                style={{
                  fontFamily: 'sans-serif',
                  color: isPremium ? '#92400e' : '#166534',
                }}
              >
                SkoolarPlay
              </span>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-2 my-2">
              <div className={`w-16 h-[1px] bg-gradient-to-r from-transparent ${isPremium ? 'to-amber-400' : 'to-amber-500'}`} />
              <div className={`w-2 h-2 rotate-45 ${isPremium ? 'bg-amber-400' : 'bg-amber-500'}`} />
              <div className={`w-3 h-3 rotate-45 border ${isPremium ? 'border-amber-400' : 'border-amber-500'}`} />
              <div className={`w-2 h-2 rotate-45 ${isPremium ? 'bg-amber-400' : 'bg-amber-500'}`} />
              <div className={`w-16 h-[1px] bg-gradient-to-l from-transparent ${isPremium ? 'to-amber-400' : 'to-amber-500'}`} />
            </div>

            {/* Certificate type and level badges */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {/* Level badge */}
              <span
                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                style={{
                  background: levelInfo.bgColor,
                  color: levelInfo.textColor,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                <LevelIcon className="w-3 h-3" />
                {levelInfo.label}
              </span>

              {/* Type badge */}
              {isPremium ? (
                <span
                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#78350f',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  <Award className="w-3 h-3" />
                  Verified Certificate
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #15803d)',
                    color: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  <Shield className="w-3 h-3" />
                  Certificate of Completion
                </span>
              )}
            </div>
          </div>

          {/* Middle section - Main content */}
          <div className="text-center flex-1 flex flex-col items-center justify-center -mt-4">
            <p className="text-sm text-gray-500 uppercase tracking-[0.3em] mb-2">This is to certify that</p>

            <h2
              className="text-4xl font-bold mb-4 border-b-2 pb-2 px-6"
              style={{
                fontFamily: 'Georgia, serif',
                color: isPremium ? '#92400e' : '#166534',
                borderColor: isPremium ? 'rgba(146, 64, 14, 0.3)' : 'rgba(22, 101, 52, 0.3)',
              }}
            >
              {certificate.userName}
            </h2>

            <p className="text-sm text-gray-500 mb-2">has successfully completed the course</p>

            <h3 className={`text-2xl font-bold mb-4 max-w-lg ${isPremium ? 'text-amber-900' : 'text-gray-800'}`}>
              &ldquo;{certificate.courseName}&rdquo;
            </h3>

            {/* Course details */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-4">
              {certificate.score !== null && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-green-700">{certificate.score}%</span>
                  <span>Average Score</span>
                </div>
              )}
              {certificate.totalLessons && certificate.completedLessons && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-green-700">{certificate.completedLessons}/{certificate.totalLessons}</span>
                  <span>Lessons</span>
                </div>
              )}
              {certificate.course?.difficulty && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-green-700 capitalize">{certificate.course.difficulty}</span>
                  <span>Level</span>
                </div>
              )}
            </div>

            {/* Premium seal for premium certificates */}
            {isPremium && (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-amber-500 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFC107, #FFD700)',
                }}
              >
                <div className="text-center">
                  <Award className="w-6 h-6 text-amber-800 mx-auto" />
                  <span className="text-[8px] font-bold text-amber-900 uppercase">Verified</span>
                </div>
              </div>
            )}

            {/* Intermediate level seal */}
            {level === 'intermediate' && !isPremium && (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                  borderColor: '#93C5FD',
                }}
              >
                <div className="text-center">
                  <Star className="w-5 h-5 text-white mx-auto" />
                  <span className="text-[7px] font-bold text-white uppercase">Advanced</span>
                </div>
              </div>
            )}

            {/* Basic level seal */}
            {level === 'basic' && !isPremium && (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-green-600 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                }}
              >
                <div className="text-center">
                  <Shield className="w-5 h-5 text-white mx-auto" />
                  <span className="text-[7px] font-bold text-white uppercase">Complete</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom section - Signatures and dates */}
          <div className="w-full">
            {/* Date */}
            <p className="text-center text-sm text-gray-500 mb-4">
              Issued on <span className="font-semibold text-gray-700">{earnedDate}</span>
            </p>

            {/* Signatures */}
            <div className="flex justify-between items-end px-8">
              {/* Left - Date and verification */}
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Verification Code</p>
                <p className="text-sm font-mono font-bold text-green-700 tracking-wider">
                  {certificate.verificationCode}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                  <p className="text-[10px] text-gray-400">
                    Verify at skoolarplay.com/cert/verify
                  </p>
                </div>
              </div>

              {/* Center - Description */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400 max-w-[200px]">
                  {certificate.course?.category
                    ? `${certificate.course.category} | ${certificate.course.difficulty}`
                    : 'Certificate of Achievement'}
                </p>
              </div>

              {/* Right - Owner signature */}
              <div className="text-center">
                {/* Calligraphy signature image */}
                <div className="w-32 h-10 flex items-center justify-center mb-0.5">
                  <img
                    src="/signature-abdut-tawwab.png"
                    alt="Signature"
                    className="h-full object-contain"
                    style={{ filter: 'contrast(1.2)' }}
                  />
                </div>
                <div className="w-32 border-t-2 border-green-700 mx-auto" />
                <p className="text-sm font-bold text-gray-700 mt-1 italic" style={{ fontFamily: 'Georgia, cursive' }}>
                  Abdut Tawwāb
                </p>
                <p className="text-[10px] text-gray-500">Founder &amp; CEO</p>
                <p className="text-[10px] text-gray-500">SkoolarPlay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium corner accents */}
        {isPremium && (
          <>
            <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rotate-45" />
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-20">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-bl from-amber-400/20 to-transparent -rotate-45" />
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 overflow-hidden z-20">
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-transparent -rotate-45" />
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden z-20">
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-tl from-amber-400/20 to-transparent rotate-45" />
            </div>
          </>
        )}

        {/* Intermediate level subtle blue accents */}
        {level === 'intermediate' && !isPremium && (
          <>
            <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden z-20">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-transparent rotate-45" />
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden z-20">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-bl from-blue-400/10 to-transparent -rotate-45" />
            </div>
            <div className="absolute bottom-0 left-0 w-20 h-20 overflow-hidden z-20">
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-tr from-blue-400/10 to-transparent -rotate-45" />
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden z-20">
              <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-tl from-blue-400/10 to-transparent rotate-45" />
            </div>
          </>
        )}
      </div>
    )
  }
)

CertificateView.displayName = 'CertificateView'
