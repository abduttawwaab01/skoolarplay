import { PlanTier } from '@/components/shared/plan-badge'
import { db } from '@/lib/db'

export const PREMIUM_FEATURES = {
  UNLIMITED_HEARTS: { 
    key: 'UNLIMITED_HEARTS', 
    name: 'Unlimited Hearts', 
    description: 'No more waiting for heart refills',
  },
  AD_FREE: { 
    key: 'AD_FREE', 
    name: 'Ad-Free Experience', 
    description: 'No advertisements while learning',
  },
  DOWNLOAD_CERTIFICATES: { 
    key: 'DOWNLOAD_CERTIFICATES', 
    name: 'Download Certificates', 
    description: 'Download certificates as PDF with premium design',
  },
  UNLIMITED_POSTS: { 
    key: 'UNLIMITED_POSTS', 
    name: 'Unlimited Posts', 
    description: 'Post unlimited times on the feed',
  },
  UNLIMITED_GROUPS: { 
    key: 'UNLIMITED_GROUPS', 
    name: 'Unlimited Groups', 
    description: 'Create and join unlimited study groups',
  },
  AI_CHAT_LIMIT: { 
    key: 'AI_CHAT_LIMIT', 
    name: '50 AI Chats Daily', 
    description: 'Get 50 AI chat interactions per day',
  },
  PREMIUM_COURSES: { 
    key: 'PREMIUM_COURSES', 
    name: 'All Premium Courses', 
    description: 'Access all premium courses',
  },
  ADVANCED_ANALYTICS: { 
    key: 'ADVANCED_ANALYTICS', 
    name: 'Advanced Analytics', 
    description: 'Detailed learning analytics with WAEC grade predictions',
  },
  STUDY_GROUPS: { 
    key: 'STUDY_GROUPS', 
    name: 'Study Groups', 
    description: 'Create and join unlimited study groups',
  },
  BOSS_BATTLES: { 
    key: 'BOSS_BATTLES', 
    name: 'Boss Battles', 
    description: 'Access to RPG-style quiz boss battles',
  },
  MYSTERY_BOXES: { 
    key: 'MYSTERY_BOXES', 
    name: 'Mystery Boxes', 
    description: 'Open mystery boxes for bonus rewards',
  },
  DOWNLOAD_LESSONS: { 
    key: 'DOWNLOAD_LESSONS', 
    name: 'Download Lessons', 
    description: 'Download lessons for offline learning',
  },
  CUSTOM_AVATARS: { 
    key: 'CUSTOM_AVATARS', 
    name: 'Premium Avatars', 
    description: 'Exclusive avatar collection and custom uploads',
  },
  PRIORITY_SUPPORT: { 
    key: 'PRIORITY_SUPPORT', 
    name: 'Priority Support', 
    description: 'Get faster responses from our support team',
  },
  DETAILED_REPORTS: { 
    key: 'DETAILED_REPORTS', 
    name: 'Detailed Lesson Reports', 
    description: 'Comprehensive post-lesson reports with explanations',
  },
  LEARNING_PATHS: { 
    key: 'LEARNING_PATHS', 
    name: 'Learning Paths', 
    description: 'Structured learning paths for exam preparation',
  },
  TEACHER_BOOKING: { 
    key: 'TEACHER_BOOKING', 
    name: 'Teacher Booking', 
    description: 'Book 1-on-1 sessions with teachers',
  },
  DOUBLE_GEMS: { 
    key: 'DOUBLE_GEMS', 
    name: '2x Gem Bonus', 
    description: 'Earn double gems on all activities',
  },
  GAME_CENTER: {
    key: 'GAME_CENTER',
    name: 'Game Center',
    description: 'Educational games and brain teasers',
  },
} as const

export type PremiumFeatureKey = keyof typeof PREMIUM_FEATURES

const TIER_HIERARCHY: PlanTier[] = ['FREE', 'PREMIUM']

const CACHE_TTL_MS = 2 * 60 * 1000

interface CacheEntry<T> {
  data: T
  expiry: number
}

interface FeatureTierData {
  isEnabled: boolean
  gemCost: number | null
}

interface SubscriptionTierData {
  maxHearts: number
  maxGroupsCreate: number
  maxGroupsJoin: number
  dailyMessageLimit: number
  aiChatLimitPerDay: number
  maxPostsPerDay: number
  maxPostsPerMonth: number
}

class FeatureCache {
  private featureTiersData: { data: FeatureTierData[]; expiry: number } | null = null
  private subscriptionTiersData: { data: Record<string, SubscriptionTierData>; expiry: number } | null = null
  private inFlightFeatureTiers: Promise<FeatureTierData[]> | null = null
  private inFlightSubscriptionTiers: Promise<Record<string, SubscriptionTierData>> | null = null

  async getFeatureTiers(): Promise<FeatureTierData[]> {
    const now = Date.now()
    if (this.featureTiersData && this.featureTiersData.expiry > now) {
      return this.featureTiersData.data
    }

    if (this.inFlightFeatureTiers) {
      return this.inFlightFeatureTiers
    }

    this.inFlightFeatureTiers = this.fetchFeatureTiers()
    try {
      const data = await this.inFlightFeatureTiers
      this.featureTiersData = { data, expiry: now + CACHE_TTL_MS }
      return data
    } finally {
      this.inFlightFeatureTiers = null
    }
  }

  private async fetchFeatureTiers(): Promise<FeatureTierData[]> {
    try {
      const tiers = await db.featureTier.findMany()
      return tiers.map(t => ({
        isEnabled: t.isEnabled,
        gemCost: t.gemCost,
      }))
    } catch (error) {
      console.error('[FeatureCache] Failed to fetch feature tiers:', error)
      return []
    }
  }

  async getSubscriptionTiers(): Promise<Record<string, SubscriptionTierData>> {
    const now = Date.now()
    if (this.subscriptionTiersData && this.subscriptionTiersData.expiry > now) {
      return this.subscriptionTiersData.data
    }

    if (this.inFlightSubscriptionTiers) {
      return this.inFlightSubscriptionTiers
    }

    this.inFlightSubscriptionTiers = this.fetchSubscriptionTiers()
    try {
      const data = await this.inFlightSubscriptionTiers
      this.subscriptionTiersData = { data, expiry: now + CACHE_TTL_MS }
      return data
    } finally {
      this.inFlightSubscriptionTiers = null
    }
  }

  private async fetchSubscriptionTiers(): Promise<Record<string, SubscriptionTierData>> {
    try {
      const tiers = await db.subscriptionTier.findMany({ where: { isActive: true } })
      const tierMap: Record<string, SubscriptionTierData> = {}
      for (const tier of tiers) {
        tierMap[tier.key] = {
          maxHearts: tier.maxHearts,
          maxGroupsCreate: tier.maxGroupsCreate,
          maxGroupsJoin: tier.maxGroupsJoin,
          dailyMessageLimit: tier.dailyMessageLimit,
          aiChatLimitPerDay: tier.aiChatLimitPerDay || getTierLimits(tier.key as PlanTier).aiChatLimitPerDay,
          maxPostsPerDay: tier.maxGroupsCreate || 2,
          maxPostsPerMonth: tier.maxGroupsJoin || 10,
        }
      }
      return tierMap
    } catch (error) {
      console.error('[FeatureCache] Failed to fetch subscription tiers:', error)
      return {}
    }
  }

  clear(): void {
    this.featureTiersData = null
    this.subscriptionTiersData = null
    this.inFlightFeatureTiers = null
    this.inFlightSubscriptionTiers = null
  }
}

const featureCache = new FeatureCache()

function getTierLevel(tier: PlanTier): number {
  const index = TIER_HIERARCHY.indexOf(tier)
  return index >= 0 ? index : 0
}

function isTierAtLeast(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return getTierLevel(userTier) >= getTierLevel(requiredTier)
}

export async function isFeatureUnlockedAsync(
  userId: string,
  isPremiumUser: boolean,
  premiumExpiresAt: string | null | undefined,
  unlockedFeatures: string[],
  featureKey: PremiumFeatureKey,
  planTier: PlanTier = 'FREE'
): Promise<boolean> {
  if (unlockedFeatures.includes(featureKey)) return true
  
  if (isPremiumUser) {
    if (!premiumExpiresAt) return true
    if (new Date(premiumExpiresAt) > new Date()) return true
  }
  
  try {
    const override = await db.userFeatureOverride.findUnique({
      where: { userId_featureKey: { userId, featureKey } },
    })
    
    if (override) {
      if (override.access === 'GRANTED') return true
      if (override.access === 'DENIED') return false
    }

    const feature = PREMIUM_FEATURES[featureKey]
    if (!feature) return false

    const isPremiumFeature = isTierAtLeast(planTier, 'PREMIUM')
    return isPremiumFeature
  } catch (error) {
    console.error('[isFeatureUnlockedAsync] Error:', error)
    return false
  }
}

export function isFeatureUnlocked(
  isPremiumUser: boolean,
  premiumExpiresAt: string | null | undefined,
  unlockedFeatures: string[],
  featureKey: PremiumFeatureKey
): boolean {
  if (unlockedFeatures.includes(featureKey)) return true
  
  if (isPremiumUser) {
    if (!premiumExpiresAt) return true
    if (new Date(premiumExpiresAt) > new Date()) return true
  }
  
  const feature = PREMIUM_FEATURES[featureKey]
  if (!feature) return false

  return false
}

export function getGemMultiplier(planTier: PlanTier): number {
  switch (planTier) {
    case 'PREMIUM': return 2.0
    default: return 1.0
  }
}

export function getTierLimits(planTier: PlanTier): {
  maxHearts: number
  maxGroupsCreate: number
  maxGroupsJoin: number
  dailyMessageLimit: number
  aiChatLimitPerDay: number
  maxPostsPerDay: number
  maxPostsPerMonth: number
} {
  switch (planTier) {
    case 'FREE':
      return { 
        maxHearts: 5, 
        maxGroupsCreate: 2, 
        maxGroupsJoin: 2, 
        dailyMessageLimit: 10, 
        aiChatLimitPerDay: 3,
        maxPostsPerDay: 2,
        maxPostsPerMonth: 10,
      }
    case 'PREMIUM':
      return { 
        maxHearts: 999, 
        maxGroupsCreate: 999, 
        maxGroupsJoin: 999, 
        dailyMessageLimit: 999, 
        aiChatLimitPerDay: 50,
        maxPostsPerDay: 999,
        maxPostsPerMonth: 999,
      }
    default:
      return { 
        maxHearts: 5, 
        maxGroupsCreate: 2, 
        maxGroupsJoin: 2, 
        dailyMessageLimit: 10, 
        aiChatLimitPerDay: 3,
        maxPostsPerDay: 2,
        maxPostsPerMonth: 10,
      }
  }
}

export async function getTierLimitsAsync(planTier: PlanTier): Promise<{
  maxHearts: number
  maxGroupsCreate: number
  maxGroupsJoin: number
  dailyMessageLimit: number
  aiChatLimitPerDay: number
  maxPostsPerDay: number
  maxPostsPerMonth: number
}> {
  try {
    const tierMap = await featureCache.getSubscriptionTiers()
    const dbTier = tierMap[planTier]
    
    if (dbTier) return dbTier
  } catch (error) {
    console.error('[getTierLimitsAsync] Failed:', error)
  }
  
  return getTierLimits(planTier)
}

export async function checkFeatureAccess(
  userId: string,
  featureKey: PremiumFeatureKey,
  userData: {
    planTier: PlanTier
    isPremium: boolean
    premiumExpiresAt: string | null
    unlockedFeatures: string[]
  }
): Promise<{
  hasAccess: boolean
  reason?: string
  gemCost?: number
}> {
  if (userData.unlockedFeatures.includes(featureKey)) {
    return { hasAccess: true }
  }
  
  if (userData.isPremium && userData.premiumExpiresAt) {
    if (new Date(userData.premiumExpiresAt) > new Date()) {
      return { hasAccess: true }
    }
  }
  
  const feature = PREMIUM_FEATURES[featureKey]
  if (!feature) {
    return { hasAccess: false, reason: 'Feature not found' }
  }
  
  const hasAccess = isTierAtLeast(userData.planTier, 'PREMIUM')
  
  return {
    hasAccess,
    reason: hasAccess ? undefined : `${feature.name} requires SkoolarPlay+ subscription`,
  }
}

export function getMinTierForFeature(featureKey: PremiumFeatureKey): PlanTier {
  const tierMap: Record<PremiumFeatureKey, PlanTier> = {
    UNLIMITED_HEARTS: 'PREMIUM',
    AD_FREE: 'PREMIUM',
    DOWNLOAD_CERTIFICATES: 'PREMIUM',
    UNLIMITED_POSTS: 'PREMIUM',
    UNLIMITED_GROUPS: 'PREMIUM',
    AI_CHAT_LIMIT: 'PREMIUM',
    PREMIUM_COURSES: 'PREMIUM',
    ADVANCED_ANALYTICS: 'PREMIUM',
    STUDY_GROUPS: 'PREMIUM',
    BOSS_BATTLES: 'PREMIUM',
    MYSTERY_BOXES: 'PREMIUM',
    DOWNLOAD_LESSONS: 'PREMIUM',
    CUSTOM_AVATARS: 'PREMIUM',
    PRIORITY_SUPPORT: 'PREMIUM',
    DETAILED_REPORTS: 'PREMIUM',
    LEARNING_PATHS: 'PREMIUM',
    TEACHER_BOOKING: 'PREMIUM',
    DOUBLE_GEMS: 'PREMIUM',
  }
  
  return tierMap[featureKey] || 'FREE'
}