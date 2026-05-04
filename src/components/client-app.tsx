'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'

// Core pages that load immediately (most frequently used)
import { LandingPage } from '@/components/pages/landing-page'
import { LoginPage } from '@/components/pages/login-page'
import { RegisterPage } from '@/components/pages/register-page'
import { AppLayout } from '@/components/layout/app-layout'

// Teacher pages (moderately used)
import { TeacherRegisterPage } from '@/components/pages/teacher-register-page'
import { TeacherLoginPage } from '@/components/pages/teacher-login-page'

// Student dashboard pages (frequently used after login)
import { StudentDashboard } from '@/components/pages/student-dashboard'
import { CoursesPage } from '@/components/pages/courses-page'
import { ProfilePage } from '@/components/pages/profile-page'
import { ShopPage } from '@/components/pages/shop-page'
import { LeaderboardPage } from '@/components/pages/leaderboard-page'
import { AchievementsPage } from '@/components/pages/achievements-page'
import { DailyChallengePage } from '@/components/pages/daily-challenge-page'
import { LessonPage } from '@/components/pages/lesson-page'
import { VideoLessonPage } from '@/components/pages/video-lesson-page'
import { AnalyticsPage } from '@/components/pages/analytics-page'
import { LearningPathsPage } from '@/components/pages/learning-paths-page'
import { ExamHubPage } from '@/components/pages/exam-hub-page'
import { ExamPage } from '@/components/pages/exam-page'
import { NotificationsPage } from '@/components/pages/notifications-page'
import { StudyGroupsPage } from '@/components/pages/study-groups-page'
import { StudyGroupPage } from '@/components/pages/study-group-page'
import { MessagesPage } from '@/components/pages/messages-page'
import { IDEPage } from '@/components/pages/ide-page'

// Other student pages
import { CoursePage } from '@/components/pages/course-page'
import { SpinWheelPage } from '@/components/pages/spin-wheel-page'
import { MysteryBoxPage } from '@/components/pages/mystery-box-page'
import { LoginRewardsPage } from '@/components/pages/login-rewards-page'
import { QuestsPage } from '@/components/pages/quests-page'
import { BossBattlePage } from '@/components/pages/boss-battle-page'
import { CertificatePage } from '@/components/pages/certificate-page'
import { ReferralPage } from '@/components/pages/referral-page'
import { ShareGemsPage } from '@/components/pages/share-gems-page'
import { GemHistoryPage } from '@/components/pages/gem-history-page'
import { GameCenterPage } from '@/components/pages/game-center-page'
import { DonatePage } from '@/components/pages/donate-page'
import { RefundPolicyPage } from '@/components/pages/refund-policy-page'
import { ForgotPasswordPage } from '@/components/pages/forgot-password-page'
import { ResetPasswordPage } from '@/components/pages/reset-password-page'
import LessonNotePage from '@/components/pages/lesson-note-page'
import SurveysPage from '@/components/pages/surveys-page'
import { VocabularyPage } from '@/components/pages/vocabulary-page'
import FeedPage from '@/components/pages/feed-page'
import MySubscriptionPage from '@/components/pages/my-subscription'

// Teacher pages (lazy loaded)
const TeacherProfilePage = dynamic(() => import('@/components/pages/teacher-profile-page').then(mod => mod.TeacherProfilePage))
const TeacherDashboardPage = dynamic(() => import('@/components/pages/teacher-dashboard').then(mod => mod.TeacherDashboardPage))
const TeacherCourseCreatePage = dynamic(() => import('@/components/pages/teacher-course-create').then(mod => mod.TeacherCourseCreatePage))
const TeacherPayoutPage = dynamic(() => import('@/components/pages/teacher-payout-page').then(mod => mod.TeacherPayoutPage))
const TeacherMarketplacePage = dynamic(() => import('@/components/pages/teacher-marketplace').then(mod => mod.TeacherMarketplacePage))
const TeacherApplicationPage = dynamic(() => import('@/components/pages/teacher-application').then(mod => mod.TeacherApplicationPage))

// Admin pages - Load dynamically to reduce initial bundle
const AdminLayout = dynamic(() => import('@/components/layout/admin-layout').then(mod => mod.AdminLayout))
const AdminDashboard = dynamic(() => import('@/components/pages/admin/dashboard-page').then(mod => mod.AdminDashboard))
const SupportDashboardPage = dynamic(() => import('@/components/pages/admin/support-dashboard-page').then(mod => mod.default))
const AdminUsersPage = dynamic(() => import('@/components/pages/admin/users-page').then(mod => mod.AdminUsersPage))
const AdminCoursesPage = dynamic(() => import('@/components/pages/admin/courses-page').then(mod => mod.AdminCoursesPage))
const AdminQuestionsPage = dynamic(() => import('@/components/pages/admin/questions-page').then(mod => mod.AdminQuestionsPage))
const AdminVideosPage = dynamic(() => import('@/components/pages/admin/videos-page').then(mod => mod.AdminVideosPage))
const AdminShopPage = dynamic(() => import('@/components/pages/admin/shop-page').then(mod => mod.AdminShopPage))
const AdminAnnouncementsPage = dynamic(() => import('@/components/pages/admin/announcements-page').then(mod => mod.AdminAnnouncementsPage))
const AdminFeatureFlagsPage = dynamic(() => import('@/components/pages/admin/feature-flags-page').then(mod => mod.AdminFeatureFlagsPage))
const AdminSettingsPage = dynamic(() => import('@/components/pages/admin/settings-page').then(mod => mod.AdminSettingsPage))
const AdminAchievementsPage = dynamic(() => import('@/components/pages/admin/achievements-page').then(mod => mod.AdminAchievementsPage))
const AdminQuotesPage = dynamic(() => import('@/components/pages/admin/quotes-page').then(mod => mod.AdminQuotesPage))
const AdminChallengesPage = dynamic(() => import('@/components/pages/admin/challenges-page').then(mod => mod.AdminChallengesPage))
const AdminQuestsPage = dynamic(() => import('@/components/pages/admin/quests-page').then(mod => mod.AdminQuestsPage))
const AdminBossBattlesPage = dynamic(() => import('@/components/pages/admin/boss-battles-page').then(mod => mod.AdminBossBattlesPage))
const AdminExamsPage = dynamic(() => import('@/components/pages/admin/exams-page').then(mod => mod.AdminExamsPage))
const AdminTeacherAppsPage = dynamic(() => import('@/components/pages/admin/teacher-apps-page').then(mod => mod.AdminTeacherAppsPage))
const AdminTeacherPayoutsPage = dynamic(() => import('@/components/pages/admin/teacher-payouts-page').then(mod => mod.AdminTeacherPayoutsPage))
const AdminCategoriesPage = dynamic(() => import('@/components/pages/admin/categories-page').then(mod => mod.AdminCategoriesPage))
const AdminAuditLogsPage = dynamic(() => import('@/components/pages/admin/audit-logs-page').then(mod => mod.AdminAuditLogsPage))
const DangerZonePage = dynamic(() => import('@/components/pages/admin/danger-zone-page').then(mod => mod.DangerZonePage))
const InvestorsPage = dynamic(() => import('@/components/pages/admin/investors-page').then(mod => mod.InvestorsPage))
const SponsorsPage = dynamic(() => import('@/components/pages/admin/sponsors-page').then(mod => mod.SponsorsPage))
const DonationSettingsPage = dynamic(() => import('@/components/pages/admin/donation-settings-page').then(mod => mod.DonationSettingsPage))
const DonationsPage = dynamic(() => import('@/components/pages/admin/donations-page').then(mod => mod.DonationsPage))
const AdminSupportAgentsPage = dynamic(() => import('@/components/pages/admin/support-agents-page').then(mod => mod.AdminSupportAgentsPage))
const AdminSurveysPage = dynamic(() => import('@/components/pages/admin/surveys-page').then(mod => mod.AdminSurveysPage))
const AdminFeedPage = dynamic(() => import('@/components/pages/admin/feed-page').then(mod => mod.AdminFeedPage))
const AdminGroupsPage = dynamic(() => import('@/components/pages/admin/groups-page').then(mod => mod.AdminGroupsPage))
const AdminVolunteersPage = dynamic(() => import('@/components/pages/admin/volunteers-page').then(mod => mod.AdminVolunteersPage))
const AdminLessonNotesPage = dynamic(() => import('@/components/pages/admin/lesson-notes-page').then(mod => mod.AdminLessonNotesPage))
const AdminSubscriptionTiersPage = dynamic(() => import('@/components/pages/admin/subscription-tiers-page').then(mod => mod.AdminSubscriptionTiersPage))
const AdminFeatureTiersPage = dynamic(() => import('@/components/pages/admin/feature-tiers-page').then(mod => mod.AdminFeatureTiersPage))
const AdminGiftCodesPage = dynamic(() => import('@/components/pages/admin/gift-codes-page').then(mod => mod.AdminGiftCodesPage))
const AdminVocabularyPage = dynamic(() => import('@/components/pages/admin/vocabulary-page').then(mod => mod.AdminVocabularyPage))
const AdminVideoQuizPage = dynamic(() => import('@/components/pages/admin/video-quiz-page').then(mod => mod.AdminVideoQuizPage))
const AdminStoriesPage = dynamic(() => import('@/components/pages/admin/stories-page').then(mod => mod.AdminStoriesPage))
const AdminProfilePage = dynamic(() => import('@/components/pages/admin/profile-page').then(mod => mod.AdminProfilePage))
const AdminStudyPathsPage = dynamic(() => import('@/components/pages/admin/study-paths-page').then(mod => mod.AdminStudyPathsPage))
const AdminGameCenterSettingsPage = dynamic(() => import('@/components/pages/admin/game-center-settings-page').then(mod => mod.AdminGameCenterSettingsPage))
const AdminGamesPage = dynamic(() => import('@/components/pages/admin/games-page').then(mod => mod.AdminGamesPage))

// Loading components
import { LoadingScreen } from '@/components/shared/loading-screen'

const VerifyEmailPage = dynamic(() => import('@/app/auth/verify-email/page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
})

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

const AUTH_STORAGE_KEY = 'skoolar-auth-storage'

// Read auth state synchronously from localStorage
function readPersistedAuth() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.state?.isAuthenticated && parsed.state?.user) {
        return {
          isAuthenticated: true,
          user: parsed.state.user
        }
      }
    }
  } catch {}
  return null
}

export default function ClientApp() {
  const { currentPage, navigateTo } = useAppStore()
  const { fetchSession, isAuthenticated, user } = useAuthStore()
  
  // Track if we've initialized session
  const initialized = useRef(false)
  
  // Read persisted auth synchronously (before render)
  const persistedAuth = readPersistedAuth()
  
  // State for whether we've verified the session from server
  const [sessionVerified, setSessionVerified] = useState(false)

  // Initialize session on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    
    // Always fetch session to sync state
    fetchSession().finally(() => {
      setSessionVerified(true)
    })
  }, [fetchSession])

  // Periodic session refresh
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => fetchSession(), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchSession])

  // Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        fetchSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated, fetchSession])

  const handlePreloaderComplete = useCallback(() => {}, [])

  // Use Zustand auth OR persisted auth for rendering
  // This ensures users stay logged in even if session verification is slow
  const effectiveAuth = isAuthenticated || !!persistedAuth
  const effectiveUser = user || persistedAuth?.user
  
  // Don't redirect - page state is now persisted, user stays on their current page
  
  const isAdminPage = currentPage === 'admin' || currentPage.startsWith('admin-') || currentPage === 'support'
  const isAdmin = effectiveUser?.role === 'ADMIN'
  const isSupportAgent = effectiveUser?.role === 'SUPPORT'

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage />
      case 'login': return <LoginPage />
      case 'register': return <RegisterPage />
      case 'teacher-register': return <TeacherRegisterPage />
      case 'teacher-login': return <TeacherLoginPage />
      case 'dashboard': return effectiveAuth ? <StudentDashboard /> : <LandingPage />
      case 'courses': return effectiveAuth ? <CoursesPage /> : <LoginPage />
      case 'course': return effectiveAuth ? <CoursePage /> : <LoginPage />
      case 'profile': return effectiveAuth ? <ProfilePage /> : <LoginPage />
      case 'lesson': return effectiveAuth ? <LessonPage /> : <LoginPage />
      case 'video-lesson': return effectiveAuth ? <VideoLessonPage /> : <LoginPage />
      case 'lesson-note': return effectiveAuth ? <LessonNotePage /> : <LoginPage />
      case 'shop': return effectiveAuth ? <ShopPage /> : <LoginPage />
      case 'leaderboard': return effectiveAuth ? <LeaderboardPage /> : <LoginPage />
      case 'achievements': return effectiveAuth ? <AchievementsPage /> : <LoginPage />
      case 'daily-challenge': return effectiveAuth ? <DailyChallengePage /> : <LoginPage />
      case 'analytics': return effectiveAuth ? <AnalyticsPage /> : <LoginPage />
      case 'learning-paths': return effectiveAuth ? <LearningPathsPage /> : <LoginPage />
      case 'vocabulary': return effectiveAuth ? <VocabularyPage /> : <LoginPage />
      case 'vocabulary-practice': return effectiveAuth ? <VocabularyPage /> : <LoginPage />
      case 'exam-hub': return effectiveAuth ? <ExamHubPage /> : <LoginPage />
      case 'exam': return effectiveAuth ? <ExamPage /> : <LoginPage />
      case 'ide': return effectiveAuth ? <IDEPage /> : <LoginPage />
      case 'study-plan': return effectiveAuth ? <LearningPathsPage /> : <LoginPage />
      case 'notifications': return effectiveAuth ? <NotificationsPage /> : <LoginPage />
      case 'study-groups': return effectiveAuth ? <StudyGroupsPage /> : <LoginPage />
      case 'study-group': return effectiveAuth ? <StudyGroupPage /> : <LoginPage />
      case 'teacher-marketplace': return effectiveAuth ? <TeacherMarketplacePage /> : <LoginPage />
      case 'teacher-application': return effectiveAuth ? <TeacherApplicationPage /> : <LoginPage />
      case 'teacher-profile': return effectiveAuth && (effectiveUser?.role === 'TEACHER' || effectiveUser?.role === 'ADMIN') ? <TeacherProfilePage /> : <LoginPage />
      case 'teacher-dashboard': return effectiveAuth ? <TeacherDashboardPage /> : <LoginPage />
      case 'teacher-course-create': return effectiveAuth && (effectiveUser?.role === 'TEACHER' || effectiveUser?.role === 'ADMIN') ? <TeacherCourseCreatePage /> : <LoginPage />
      case 'teacher-payout': return effectiveAuth && (effectiveUser?.role === 'TEACHER' || effectiveUser?.role === 'ADMIN') ? <TeacherPayoutPage /> : <LoginPage />
      case 'spin-wheel': return effectiveAuth ? <SpinWheelPage /> : <LoginPage />
      case 'mystery-box': return effectiveAuth ? <MysteryBoxPage /> : <LoginPage />
      case 'login-rewards': return effectiveAuth ? <LoginRewardsPage /> : <LoginPage />
      case 'quests': return effectiveAuth ? <QuestsPage /> : <LoginPage />
      case 'boss-battle': return effectiveAuth ? <BossBattlePage /> : <LoginPage />
      case 'certificate': return effectiveAuth ? <CertificatePage /> : <LoginPage />
      case 'referral': return effectiveAuth ? <ReferralPage /> : <LoginPage />
      case 'share-gems': return effectiveAuth ? <ShareGemsPage /> : <LoginPage />
      case 'messages': return effectiveAuth ? <MessagesPage /> : <LoginPage />
      case 'feed': return effectiveAuth ? <FeedPage /> : <LoginPage />
      case 'surveys': return effectiveAuth ? <SurveysPage /> : <LoginPage />
      case 'subscription': return effectiveAuth ? <MySubscriptionPage /> : <LoginPage />
      case 'upgrade': return effectiveAuth ? <MySubscriptionPage /> : <LoginPage />
      case 'donate': return <DonatePage />
      case 'refund-policy': return <RefundPolicyPage />
      case 'forgot-password': return <ForgotPasswordPage />
      case 'reset-password': return <ResetPasswordPage />
      case 'verify-email': return <VerifyEmailPage />
      case 'admin': return <AdminDashboard />
      case 'support': return <SupportDashboardPage />
      case 'admin-users': return <AdminUsersPage />
      case 'admin-courses': return <AdminCoursesPage />
      case 'admin-categories': return <AdminCategoriesPage />
      case 'admin-study-paths': return <AdminStudyPathsPage />
      case 'admin-questions': return <AdminQuestionsPage />
      case 'admin-videos': return <AdminVideosPage />
      case 'admin-shop': return <AdminShopPage />
      case 'admin-announcements': return <AdminAnnouncementsPage />
      case 'admin-flags': return <AdminFeatureFlagsPage />
      case 'admin-settings': return <AdminSettingsPage />
      case 'admin-achievements': return <AdminAchievementsPage />
      case 'admin-quotes': return <AdminQuotesPage />
      case 'admin-challenges': return <AdminChallengesPage />
      case 'admin-quests': return <AdminQuestsPage />
      case 'admin-boss-battles': return <AdminBossBattlesPage />
      case 'admin-exams': return <AdminExamsPage />
      case 'admin-games': return <AdminGamesPage />
      case 'admin-game-settings': return <AdminGameCenterSettingsPage />
      case 'admin-teacher-apps': return <AdminTeacherAppsPage />
      case 'admin-teacher-payouts': return <AdminTeacherPayoutsPage />
      case 'admin-audit-logs': return <AdminAuditLogsPage />
      case 'admin-danger-zone': return <DangerZonePage />
      case 'admin-investors': return <InvestorsPage />
      case 'admin-sponsors': return <SponsorsPage />
      case 'admin-donation-settings': return <DonationSettingsPage />
      case 'admin-donations': return <DonationsPage />
      case 'admin-support-agents': return <AdminSupportAgentsPage />
      case 'admin-surveys': return <AdminSurveysPage />
      case 'admin-feed': return <AdminFeedPage />
      case 'admin-groups': return <AdminGroupsPage />
      case 'admin-volunteers': return <AdminVolunteersPage />
      case 'admin-lesson-notes': return <AdminLessonNotesPage />
      case 'admin-subscription-tiers': return <AdminSubscriptionTiersPage />
      case 'admin-feature-tiers': return <AdminFeatureTiersPage />
      case 'admin-gift-codes': return <AdminGiftCodesPage />
      case 'admin-vocabulary': return <AdminVocabularyPage />
      case 'admin-video-quiz': return <AdminVideoQuizPage />
      case 'admin-stories': return <AdminStoriesPage />
      case 'admin-profile': return <AdminProfilePage />
      case 'gem-history': return effectiveAuth ? <GemHistoryPage /> : <LoginPage />
      case 'game-center': return effectiveAuth ? <GameCenterPage /> : <LoginPage />
      default: return <LandingPage />
    }
  }

  const isFullPage = ['lesson', 'video-lesson', 'exam', 'boss-battle', 'certificate', 'ide'].includes(currentPage)
  const isPublicPage = ['landing', 'login', 'register', 'teacher-register', 'teacher-login', 'refund-policy', 'donate', 'forgot-password', 'reset-password', 'verify-email'].includes(currentPage)

  if (isAdminPage && !effectiveAuth) return <LoginPage />
  if (isAdminPage && !isAdmin && !isSupportAgent) {
    return (
      <div className="min-h-screen bg-background">
        <AppLayout>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access this panel.</p>
          </div>
        </AppLayout>
      </div>
    )
  }

  if (isFullPage) return renderPage()

  if (isAdminPage && (isAdmin || isSupportAgent)) {
    return <AdminLayout>{renderPage()}</AdminLayout>
  }

  if (effectiveAuth && !isPublicPage) {
    return <AppLayout>{renderPage()}</AppLayout>
  }

  return <div className="min-h-screen bg-background">{renderPage()}</div>
}
