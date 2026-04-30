'use client'

import { useEffect, useState, useRef, useSyncExternalStore } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  GraduationCap,
  Globe,
  Beaker,
  Palette,
  BookOpen,
  Briefcase,
  Code2,
  ChevronRight,
  Play,
  Trophy,
  Star,
  Award,
  Video,
  Shield,
  ShoppingBag,
  Sparkles,
  Users,
  CheckCircle,
  ArrowRight,
  Gem,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { PublicLayout } from '@/components/layout/app-layout'
import { toast } from 'sonner'
import { InvestorCarousel } from '@/components/shared/investor-carousel'
import { SponsorCarousel } from '@/components/shared/sponsor-carousel'
import { VolunteerCarousel } from '@/components/shared/volunteer-carousel'
import { useSoundEffect } from '@/hooks/use-sound'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  
  useEffect(() => {
    if (!isInView || !hydrated) return
    let start = 0
    const duration = 2000
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target, hydrated])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const categories = [
  { name: 'Languages', icon: Globe, color: 'bg-blue-500/10 text-blue-600', count: 4 },
  { name: 'STEM', icon: Beaker, color: 'bg-purple-500/10 text-purple-600', count: 3 },
  { name: 'Arts & Humanities', icon: Palette, color: 'bg-pink-500/10 text-pink-600', count: 1 },
  { name: 'Nigerian Studies', icon: BookOpen, color: 'bg-green-500/10 text-green-600', count: 2 },
  { name: 'Business & Finance', icon: Briefcase, color: 'bg-amber-500/10 text-amber-600', count: 1 },
  { name: 'Technology & Coding', icon: Code2, color: 'bg-cyan-500/10 text-cyan-600', count: 2 },
]

const howItWorks = [
  {
    icon: BookOpen,
    title: 'Choose Your Path',
    description: 'Browse 100+ courses across 6 categories. Find what excites you and start learning at your own pace.',
    step: 1,
  },
  {
    icon: Sparkles,
    title: 'Learn & Play',
    description: 'Interactive quizzes, video lessons from Nigerian educators, and gamified exercises make learning addictive.',
    step: 2,
  },
  {
    icon: Trophy,
    title: 'Earn & Grow',
    description: 'Collect XP, earn gems, unlock achievements, and earn certificates as you master new skills.',
    step: 3,
  },
]

const features = [
  {
    icon: Video,
    title: 'Video Lessons from Nigerian Educators',
    description: 'Learn from the best teachers across Nigeria with curated video content.',
  },
  {
    icon: Globe,
    title: '6 Nigerian Language Courses',
    description: 'Yoruba, Igbo, Hausa, Pidgin, Fulfulde, and Tiv — preserve our heritage.',
  },
  {
    icon: Shield,
    title: 'WAEC & JAMB Prep',
    description: 'Targeted preparation courses to help students ace their exams.',
  },
  {
    icon: ShoppingBag,
    title: 'Virtual Shop with Power-ups',
    description: 'Spend your gems on streak freezes, double XP boosts, and more.',
  },
  {
    icon: Award,
    title: 'Certificates on Completion',
    description: 'Earn verifiable certificates to showcase your achievements.',
  },
  {
    icon: Star,
    title: 'AI-Powered Recommendations',
    description: 'Smart suggestions based on your learning style and progress.',
  },
]

const testimonials = [
  {
    name: 'Aisha Bello',
    role: 'University Student, Lagos',
    avatar: 'AB',
    text: "SkoolarPlay made learning Yoruba so much fun! I went from beginner to conversational in just 3 months. The gamification keeps me coming back every day.",
    rating: 5,
  },
  {
    name: 'Emeka Okonkwo',
    role: 'Secondary School, Enugu',
    avatar: 'EO',
    text: "I used SkoolarPlay's WAEC prep courses and scored 8 A's! The daily challenges and streak system really motivated me to study consistently.",
    rating: 5,
  },
  {
    name: 'Fatima Abdullahi',
    role: 'Working Professional, Abuja',
    avatar: 'FA',
    text: "As a busy professional, SkoolarPlay's bite-sized lessons are perfect. I'm learning Python during my commute and earning certificates that add value to my CV.",
    rating: 5,
  },
]

export function LandingPage() {
  const { navigateTo } = useAppStore()
  const { isAuthenticated, user } = useAuthStore()
  const playHover = useSoundEffect('hover')
  const playClick = useSoundEffect('click')
  const playSlide = useSoundEffect('slide')

  const handleEducatorClick = () => {
    playClick()
    // Immediate navigation for educator - no auth gate on landing page
    if (isAuthenticated && user?.role === 'TEACHER') {
      navigateTo('teacher-dashboard')
    } else if (isAuthenticated) {
      navigateTo('teacher-application')
    } else {
      // Not logged in - go to register so they can sign up first
      navigateTo('register')
    }
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-yellow-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <FadeIn>
                <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Nigeria&apos;s #1 Gamified Learning Platform
                </Badge>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Learn Anything,{' '}
                  <span className="text-green-gradient">Playfully</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                  Master languages, STEM, arts, and more — all for free! Join thousands
                  of Nigerian learners on the most fun way to learn.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => { playClick(); navigateTo('register') }}
                    onPointerEnter={playHover}
                    className="rounded-full px-8 h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                  >
                    Start Learning Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onPointerEnter={playHover}
                    onClick={() => {
                      playClick()
                      if (isAuthenticated && user?.role === 'TEACHER') {
                        navigateTo('teacher-dashboard')
                      } else if (isAuthenticated) {
                        navigateTo('teacher-application')
                      } else {
                        navigateTo('login')
                      }
                    }}
                    className="rounded-full px-8 h-12 text-base font-semibold cursor-pointer"
                  >
                    I&apos;m an Educator
                    <GraduationCap className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-2">
                    {['AO', 'BI', 'CK', 'DL', 'EM'].map((initials, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">50,000+</span> learners already onboard
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Hero Illustration */}
            <FadeIn delay={0.2} className="hidden lg:block">
              <div className="relative">
                <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-yellow-500/10 border border-primary/10 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-3 gap-3 p-8">
                    {[
                      { icon: GraduationCap, label: 'Courses', bg: 'bg-green-500' },
                      { icon: Trophy, label: 'XP', bg: 'bg-yellow-500' },
                      { icon: Gem, label: 'Gems', bg: 'bg-blue-500' },
                      { icon: Flame, label: 'Streak', bg: 'bg-orange-500' },
                      { icon: Award, label: 'Certs', bg: 'bg-purple-500' },
                      { icon: Play, label: 'Learn', bg: 'bg-pink-500' },
                      { icon: Star, label: 'Rate', bg: 'bg-amber-500' },
                      { icon: Users, label: 'Social', bg: 'bg-cyan-500' },
                      { icon: CheckCircle, label: 'Done', bg: 'bg-emerald-500' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="aspect-square rounded-2xl bg-card shadow-lg flex flex-col items-center justify-center gap-1.5 hover:shadow-xl transition-shadow cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-yellow-500 shadow-lg flex items-center justify-center"
                >
                  <Gem className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 w-14 h-14 rounded-2xl bg-orange-500 shadow-lg flex items-center justify-center"
                >
                  <Flame className="w-7 h-7 text-white" />
                </motion.div>
              </div>
            </FadeIn>
          </div>

          {/* Stats */}
          <FadeIn delay={0.5}>
            <div className="grid grid-cols-3 gap-4 mt-16 md:mt-24">
              {[
                { value: 50000, suffix: '+', label: 'Learners' },
                { value: 100, suffix: '+', label: 'Courses' },
                { value: 6, suffix: '', label: 'Nigerian Languages' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-2xl bg-muted/30"
                >
                  <p className="text-2xl md:text-3xl font-extrabold text-green-gradient">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Explore <span className="text-green-gradient">Categories</span>
              </h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Something for everyone — from languages to technology
              </p>
            </div>
          </FadeIn>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {categories.map((cat, i) => (
              <FadeIn key={cat.name} delay={i * 0.1}>
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigateTo('dashboard')}
                  className="snap-start shrink-0 w-44 p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-3`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.count} courses</p>
                </motion.button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                How <span className="text-green-gradient">SkoolarPlay</span> Works
              </h2>
              <p className="text-muted-foreground mt-2">Three simple steps to start your learning journey</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {howItWorks.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  {i < howItWorks.length - 1 && (
                    <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/40" />
                  )}
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Beyond Duolingo */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0 mb-4">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Beyond the Ordinary
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Built for <span className="text-green-gradient">Nigeria</span>, by Nigeria
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Features that make SkoolarPlay uniquely suited for Nigerian learners
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Loved by <span className="text-green-gradient">Learners</span>
              </h2>
              <p className="text-muted-foreground mt-2">Hear from our amazing community</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.15}>
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investor/Partner Logos */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <p className="text-center text-sm text-muted-foreground mb-6">Trusted by Leading Organizations</p>
          </FadeIn>
          <InvestorCarousel />
        </div>
      </section>

      {/* Sponsor Logos */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-primary mb-1">Our Sponsors & Donors</p>
              <p className="text-xs text-muted-foreground">Supporting Nigerian education, one donation at a time</p>
            </div>
          </FadeIn>
          <SponsorCarousel />
        </div>
      </section>

      {/* Volunteer Names */}
      <section className="py-8 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-muted-foreground">Our Amazing Volunteers</p>
            </div>
          </FadeIn>
          <VolunteerCarousel />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="relative rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/10 blur-xl" />
                <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-yellow-500/10 blur-xl" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-white/80 max-w-md mx-auto mb-8">
                  Join 50,000+ Nigerian learners already mastering new skills every day.
                  It&apos;s free, fun, and effective!
                </p>
                <Button
                  size="lg"
                  onClick={() => { playClick(); navigateTo('register') }}
                  onPointerEnter={playHover}
                  className="rounded-full px-10 h-14 text-base font-semibold bg-white text-primary hover:bg-white/90"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-green-gradient">SkoolarPlay</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nigeria&apos;s #1 gamified learning platform. Making education fun, accessible, and free for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigateTo('dashboard')} className="hover:text-foreground transition-colors">Courses</button></li>
                <li><button onClick={() => navigateTo('shop')} className="hover:text-foreground transition-colors">Shop</button></li>
                <li><button onClick={() => navigateTo('teacher-marketplace')} className="hover:text-foreground transition-colors">For Educators</button></li>
                <li><button onClick={() => navigateTo('study-groups')} className="hover:text-foreground transition-colors">Study Groups</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigateTo('leaderboard')} className="hover:text-foreground transition-colors">Leaderboard</button></li>
                <li><button onClick={() => navigateTo('quests')} className="hover:text-foreground transition-colors">Quests</button></li>
                <li><button onClick={() => navigateTo('achievements')} className="hover:text-foreground transition-colors">Achievements</button></li>
                <li><button onClick={() => navigateTo('referral')} className="hover:text-foreground transition-colors">Refer a Friend</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigateTo('notifications')} className="hover:text-foreground transition-colors">Help Center</button></li>
                <li><button onClick={() => navigateTo('notifications')} className="hover:text-foreground transition-colors">Contact Us</button></li>
                <li><button onClick={() => navigateTo('login')} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigateTo('login')} className="hover:text-foreground transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SkoolarPlay. All rights reserved. Made with ❤️ in Nigeria.
            </p>
            <div className="flex items-center gap-3">
              {[{ label: 'Twitter', letter: '𝕏', page: 'login' as const }, { label: 'Instagram', letter: '📷', page: 'login' as const }, { label: 'YouTube', letter: '▶', page: 'login' as const }, { label: 'LinkedIn', letter: 'in', page: 'login' as const }].map((social) => (
                <button
                  key={social.label}
                  onClick={() => navigateTo(social.page)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  aria-label={social.label}
                >
                  {social.letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </PublicLayout>
  )
}
