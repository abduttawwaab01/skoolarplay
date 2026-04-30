'use client'

import React from 'react'

export type PlanTier = 'FREE' | 'PREMIUM'

interface PlanBadgeProps {
  tier: PlanTier
  size?: 'tiny' | 'small' | 'medium' | 'large'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

const tierConfig: Record<PlanTier, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  iconSize: Record<string, string>
  textSize: Record<string, string>
}> = {
  FREE: {
    label: 'Free',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    icon: '👤',
    iconSize: { tiny: '10px', small: '12px', medium: '14px', large: '16px' },
    textSize: { tiny: '8px', small: '10px', medium: '11px', large: '12px' },
  },
  PREMIUM: {
    label: 'SkoolarPlay+',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: 'rgba(217, 119, 6, 0.5)',
    icon: '👑',
    iconSize: { tiny: '10px', small: '12px', medium: '14px', large: '16px' },
    textSize: { tiny: '8px', small: '10px', medium: '11px', large: '12px' },
  },
}

const sizePadding: Record<string, string> = {
  tiny: '1px 4px',
  small: '2px 6px',
  medium: '3px 8px',
  large: '4px 10px',
}

export function PlanBadge({ 
  tier, 
  size = 'small', 
  showIcon = true, 
  showText = true,
  className = '' 
}: PlanBadgeProps) {
  const config = tierConfig[tier] || tierConfig.FREE
  
  const sizeClass = size === 'tiny' ? 'inline-flex items-center gap-0.5' : 
                    size === 'small' ? 'inline-flex items-center gap-1' :
                    size === 'medium' ? 'inline-flex items-center gap-1.5' :
                    'inline-flex items-center gap-2'

  return (
    <span
      className={`font-semibold rounded-full ${sizeClass} ${className}`}
      style={{
        padding: sizePadding[size],
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        fontSize: config.textSize[size],
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
      title={`${config.label} Member`}
    >
      {showIcon && <span style={{ fontSize: config.iconSize[size] }}>{config.icon}</span>}
      {showText && <span>{config.label}</span>}
    </span>
  )
}

export function getPlanBadgeColor(tier: PlanTier): string {
  return tierConfig[tier]?.color || tierConfig.FREE.color
}

export function getPlanBadgeIcon(tier: PlanTier): string {
  return tierConfig[tier]?.icon || tierConfig.FREE.icon
}

export function isPremiumTier(tier: PlanTier): boolean {
  return tier === 'PREMIUM'
}

export function getUserTier(isPremium: boolean): PlanTier {
  return isPremium ? 'PREMIUM' : 'FREE'
}