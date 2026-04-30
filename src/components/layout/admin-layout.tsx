'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  Video,
  VideoIcon,
  ShoppingBag,
  Trophy,
  Target,
  Megaphone,
  Flag,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  FileText,
  CalendarCheck,
  Swords,
  Skull,
  ClipboardList,
  ClipboardCheck,
  UserCheck,
  Wallet,
  ScrollText,
  FolderOpen,
  AlertTriangle,
  Building2,
  HeadphonesIcon,
  Heart,
  HandHeart,
  TrendingUp,
  SpellCheck,
  Crown,
  Gem,
  Gift,
  CreditCard,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuthStore } from '@/store/auth-store'
  import { useAppStore, type PageName } from '@/store/app-store'
  import { NotificationCenter } from '@/components/shared/notification-center'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'admin' as PageName },
  { icon: Users, label: 'Users', page: 'admin-users' as PageName },
  { icon: BookOpen, label: 'Courses', page: 'admin-courses' as PageName },
  { icon: FolderOpen, label: 'Categories', page: 'admin-categories' as PageName },
  { icon: GraduationCap, label: 'Study Paths', page: 'admin-study-paths' as PageName },
  { icon: HelpCircle, label: 'Questions', page: 'admin-questions' as PageName },
   { icon: Video, label: 'Videos', page: 'admin-videos' as PageName },
   { icon: VideoIcon, label: 'Video Quizzes', page: 'admin-video-quiz' as PageName },
   { icon: BookOpen, label: 'Lesson Notes', page: 'admin-lesson-notes' as PageName },
   { icon: SpellCheck, label: 'Vocabulary', page: 'admin-vocabulary' as PageName },
  { icon: ShoppingBag, label: 'Shop', page: 'admin-shop' as PageName },
  { icon: Megaphone, label: 'Announcements', page: 'admin-announcements' as PageName },
  { icon: Flag, label: 'Feature Flags', page: 'admin-flags' as PageName },
  { icon: Target, label: 'Achievements', page: 'admin-achievements' as PageName },
  { icon: FileText, label: 'Quotes', page: 'admin-quotes' as PageName },
  { icon: CalendarCheck, label: 'Challenges', page: 'admin-challenges' as PageName },
  { icon: Swords, label: 'Quests', page: 'admin-quests' as PageName },
  { icon: Skull, label: 'Boss Battles', page: 'admin-boss-battles' as PageName },
  { icon: ClipboardList, label: 'Exams', page: 'admin-exams' as PageName },
  { icon: UserCheck, label: 'Teacher Apps', page: 'admin-teacher-apps' as PageName },
  { icon: Wallet, label: 'Payouts', page: 'admin-teacher-payouts' as PageName },
  { icon: Crown, label: 'Subscription Tiers', page: 'admin-subscription-tiers' as PageName },
  { icon: Gem, label: 'Feature Tiers', page: 'admin-feature-tiers' as PageName },
  { icon: Gift, label: 'Gift Codes', page: 'admin-gift-codes' as PageName },
  { icon: Settings, label: 'Settings', page: 'admin-settings' as PageName },
  { icon: ScrollText, label: 'Audit Logs', page: 'admin-audit-logs' as PageName },
   { icon: Building2, label: 'Investors', page: 'admin-investors' as PageName },
   { icon: Heart, label: 'Sponsors', page: 'admin-sponsors' as PageName },
   { icon: HandHeart, label: 'Volunteers', page: 'admin-volunteers' as PageName },
   { icon: TrendingUp, label: 'Donations', page: 'admin-donations' as PageName },
   { icon: CreditCard, label: 'Donation Settings', page: 'admin-donation-settings' as PageName },
   { icon: HeadphonesIcon, label: 'Support Agents', page: 'admin-support-agents' as PageName },
   { icon: ClipboardCheck, label: 'Surveys', page: 'admin-surveys' as PageName },
   { icon: FileText, label: 'Feed', page: 'admin-feed' as PageName },
   { icon: Users, label: 'Groups', page: 'admin-groups' as PageName },
   { icon: AlertTriangle, label: 'Danger Zone', page: 'admin-danger-zone' as PageName },
  ]

 const pageTitles: Record<string, string> = {
    'admin': 'Dashboard',
    'admin-users': 'User Management',
    'admin-courses': 'Course Management',
    'admin-categories': 'Category Management',
    'admin-questions': 'Question Management',
    'admin-videos': 'Video Management',
    'admin-shop': 'Shop Management',
    'admin-achievements': 'Achievement Management',
    'admin-quotes': 'Quote Management',
    'admin-challenges': 'Challenge Management',
    'admin-quests': 'Quest Management',
    'admin-boss-battles': 'Boss Battle Management',
    'admin-exams': 'Exam Management',
    'admin-teacher-apps': 'Teacher Applications',
    'admin-teacher-payouts': 'Teacher Payouts',
    'admin-subscription-tiers': 'Subscription Tiers',
    'admin-feature-tiers': 'Feature Access Tiers',
    'admin-gift-codes': 'Gift Codes',
    'admin-announcements': 'Announcements',
    'admin-flags': 'Feature Flags',
    'admin-audit-logs': 'Audit Logs',
    'admin-investors': 'Investors',
    'admin-sponsors': 'Sponsor Management',
    'admin-donation-settings': 'Donation Settings',
    'admin-donations': 'Donation Management',
    'admin-support-agents': 'Support Agents',
    'admin-surveys': 'Surveys & Feedback',
    'admin-feed': 'Feed Management',
    'admin-groups': 'Groups Management',
    'admin-volunteers': 'Volunteers',
    'admin-lesson-notes': 'Lesson Notes',
    'admin-video-quiz': 'Video Quiz Management',
    'admin-vocabulary': 'Vocabulary Management',
    'admin-danger-zone': 'Danger Zone',
   }

function SidebarContent({
  collapsed,
  currentPage,
  onNavigate,
  onBack,
}: {
  collapsed: boolean
  currentPage: PageName
  onNavigate: (page: PageName) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-green-gradient whitespace-nowrap"
          >
            SkoolarPlay
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-3 min-h-0">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <motion.button
                key={item.page}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </motion.button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="border-t p-3">
        <Separator className="mb-3" />
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Back to App' : undefined}
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </motion.button>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigateTo } = useAppStore()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageTitle = pageTitles[currentPage] || 'Admin'

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD'

  const isAdminPage = currentPage === 'admin' || currentPage.startsWith('admin-')

  if (!isAdminPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col border-r bg-card fixed top-0 left-0 bottom-0 z-40 overflow-hidden"
      >
        <SidebarContent
          collapsed={collapsed}
          currentPage={currentPage}
          onNavigate={(page) => navigateTo(page)}
          onBack={() => navigateTo('admin')}
        />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border bg-card flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent
            collapsed={false}
            currentPage={currentPage}
            onNavigate={(page) => {
              navigateTo(page)
              setMobileOpen(false)
            }}
            onBack={() => {
              navigateTo('admin')
              setMobileOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        {/* Top Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div>
                <h1 className="text-lg font-bold">{pageTitle}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Administration Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-muted/50 border-0 rounded-full w-64 text-sm"
                />
              </div>

              {/* Notification bell */}
              <NotificationCenter />

              {/* Admin badge */}
              <Badge variant="outline" className="hidden sm:flex bg-primary/10 text-primary border-primary/20 text-xs">
                Admin
              </Badge>

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-full">
                    <Avatar className="w-8 h-8 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo('admin-profile')}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('admin-settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout()
                      navigateTo('landing')
                    }}
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
