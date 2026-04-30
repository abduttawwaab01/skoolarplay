'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Shield,
  Clock,
  CreditCard,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

const faqItems = [
  {
    question: 'How long do I have to request a refund?',
    answer: 'You have 7 days from the date of purchase to request a refund. This applies to both premium subscriptions and teacher course purchases.',
  },
  {
    question: 'How will I receive my refund?',
    answer: 'Refunds are processed back to your original payment method (bank card, transfer, etc.). Please allow 3-5 business days for the funds to appear in your account.',
  },
  {
    question: 'Can I get a refund for gems or in-app purchases?',
    answer: 'Gem purchases through the in-app shop are non-refundable as they are digital items consumed immediately. This policy only applies to premium subscriptions and paid course enrollments.',
  },
  {
    question: 'What if I was charged incorrectly?',
    answer: 'If you believe you were charged by mistake or the wrong amount, please contact our support team immediately. We will investigate and resolve the issue promptly.',
  },
  {
    question: 'Can I still access content after requesting a refund?',
    answer: 'Once a refund is processed, you will lose access to any premium features or paid course content. Your progress data is preserved in case you decide to repurchase in the future.',
  },
  {
    question: 'What about teacher-created courses?',
    answer: 'Refunds for teacher-created courses follow the same 7-day policy. When a refund is processed, the teacher is notified and the platform commission is reversed.',
  },
]

export function RefundPolicyPage() {
  const { goBack, navigateTo } = useAppStore()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Refund Policy</h1>
            <p className="text-sm text-muted-foreground">Your satisfaction is our priority</p>
          </div>
        </motion.div>

        {/* Money-back Guarantee Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">7-Day Money-Back Guarantee</h2>
                  <p className="text-white/80 text-sm">
                    We stand behind our platform. If you&apos;re not satisfied with your purchase, 
                    you can request a full refund within 7 days. No questions asked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium Plan Refund */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold">Premium Plan Refund</h3>
                  <Badge variant="secondary" className="text-xs rounded-full">7-day policy</Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Full refund available within 7 days of premium subscription purchase</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Refund processed to original payment method within 3-5 business days</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Upon refund, premium features and access are immediately revoked</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Your learning progress and data are preserved for future repurchase</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Prorated refunds available after the 7-day window (contact support)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teacher Course Refund */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold">Teacher Course Refund</h3>
                  <Badge variant="secondary" className="text-xs rounded-full">Subject to availability</Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Refund available within 7 days of course enrollment purchase</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>If a course is removed or significantly altered, a full refund is issued regardless of timeframe</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Teacher refund policy is subject to platform admin approval</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p>Certificates earned before refund will be marked as expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Terms & Conditions</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Refund requests must be submitted through the platform or by contacting support.</p>
                <p>• Only one refund request per purchase is allowed.</p>
                <p>• Abusive or repeated refund requests may result in account review.</p>
                <p>• Promotional or discounted purchases follow the same refund policy.</p>
                <p>• SkoolarPlay reserves the right to modify this policy at any time.</p>
                <p>• For disputes, please contact our support team for resolution.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left p-4 flex items-center justify-between"
                >
                  <span className="font-medium text-sm pr-4">{item.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 -mt-1"
                  >
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Request Refund CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-blue-500/10 to-primary/10">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Need Help With a Refund?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about our refund policy or need to request a refund, 
                our support team is here to help.
              </p>
              <Button
                onClick={() => navigateTo('notifications')}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
