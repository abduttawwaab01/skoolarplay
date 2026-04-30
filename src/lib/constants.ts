export const SPIN_COST = 5
export const MIN_PAYOUT_AMOUNT = 5000
export const DEFAULT_COMMISSION_RATE = 0.15
export const REFERRAL_REWARD_GEMS = 25
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PURCHASE_QUANTITY = 99
export const XP_PER_LEVEL = 100

// API Endpoints (use environment variables for flexibility)
export const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL || 'https://api.paystack.co'
export const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1'
