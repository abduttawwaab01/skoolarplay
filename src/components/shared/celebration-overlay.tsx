'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSoundEffect } from '@/hooks/use-sound'

interface CelebrationOverlayProps {
  onComplete: () => void
  duration?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  shape: 'circle' | 'rect' | 'star'
  life: number
  maxLife: number
}

export function CelebrationOverlay({ onComplete, duration = 3500 }: CelebrationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const startTimeRef = useRef<number>(Date.now())
  const playAchievement = useSoundEffect('achievement')

  useEffect(() => {
    playAchievement()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#008751', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981']

    // Create initial burst of particles
    const createBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = 4 + Math.random() * 8
        const shapes: Particle['shape'][] = ['circle', 'rect', 'star']
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          life: 0,
          maxLife: 60 + Math.random() * 60,
        })
      }
    }

    // Initial burst from center top
    createBurst(canvas.width / 2, canvas.height * 0.3, 80)

    // Delayed bursts
    const burst1 = setTimeout(() => createBurst(canvas.width * 0.3, canvas.height * 0.25, 40), 200)
    const burst2 = setTimeout(() => createBurst(canvas.width * 0.7, canvas.height * 0.25, 40), 400)
    const burst3 = setTimeout(() => createBurst(canvas.width / 2, canvas.height * 0.4, 60), 600)
    const burst4 = setTimeout(() => createBurst(canvas.width * 0.2, canvas.height * 0.35, 30), 800)
    const burst5 = setTimeout(() => createBurst(canvas.width * 0.8, canvas.height * 0.35, 30), 1000)

    // Balloon particles
    const createBalloons = () => {
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -(2 + Math.random() * 3),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 12 + Math.random() * 16,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 2,
          opacity: 0.8,
          shape: 'circle',
          life: 0,
          maxLife: 120 + Math.random() * 60,
        })
      }
    }

    const balloon1 = setTimeout(createBalloons, 300)
    const balloon2 = setTimeout(createBalloons, 800)

    // Draw star shape
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const px = Math.cos(angle) * size
        const py = Math.sin(angle) * size
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    // Draw balloon shape
    const drawBalloon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = color

      // Balloon body
      ctx.beginPath()
      ctx.ellipse(x, y, size * 0.6, size, 0, 0, Math.PI * 2)
      ctx.fill()

      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.ellipse(x - size * 0.15, y - size * 0.3, size * 0.15, size * 0.25, -0.3, 0, Math.PI * 2)
      ctx.fill()

      // String
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y + size)
      ctx.quadraticCurveTo(x + 3, y + size + 10, x - 2, y + size + 20)
      ctx.stroke()

      ctx.restore()
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current

      if (elapsed > duration) {
        cancelAnimationFrame(animFrameRef.current)
        onComplete()
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Fade out in last 500ms
      const fadeOut = elapsed > duration - 500 ? (duration - elapsed) / 500 : 1

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // gravity
        p.vx *= 0.99 // air resistance
        p.rotation += p.rotationSpeed

        // Calculate opacity based on life
        const lifeRatio = p.life / p.maxLife
        const alpha = lifeRatio > 0.7 ? 1 - ((lifeRatio - 0.7) / 0.3) : Math.min(1, lifeRatio / 0.3)
        p.opacity = alpha * fadeOut

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1)
          continue
        }

        if (p.size > 15) {
          // It's a balloon
          drawBalloon(ctx, p.x, p.y, p.size, p.color, p.opacity)
        } else {
          ctx.save()
          ctx.globalAlpha = p.opacity

          if (p.shape === 'circle') {
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
          } else if (p.shape === 'rect') {
            ctx.fillStyle = p.color
            ctx.translate(p.x, p.y)
            ctx.rotate((p.rotation * Math.PI) / 180)
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          } else if (p.shape === 'star') {
            ctx.fillStyle = p.color
            drawStar(ctx, p.x, p.y, p.size / 2, p.rotation)
          }

          ctx.restore()
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      clearTimeout(burst1)
      clearTimeout(burst2)
      clearTimeout(burst3)
      clearTimeout(burst4)
      clearTimeout(burst5)
      clearTimeout(balloon1)
      clearTimeout(balloon2)
      window.removeEventListener('resize', handleResize)
    }
  }, [duration, onComplete, playAchievement])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}
