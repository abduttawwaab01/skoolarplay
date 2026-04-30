import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch donation settings from database
    const settings = await db.donationSettings.findFirst()

    // Fetch sponsors and investors for testimonials
    const sponsors = await db.sponsor.findMany({
      where: { isActive: true },
      orderBy: { donatedAmount: 'desc' },
      take: 5,
    })

    const investors = await db.investorPartner.findMany({
      where: { isActive: true },
      orderBy: { tier: 'asc' },
      take: 5,
    })

    // Build testimonials from real sponsors/investors
    const testimonials = [
      ...sponsors.map(s => ({
        name: s.name,
        role: `${s.tier} Sponsor`,
        text: s.description || `Thank you to our ${s.tier} sponsor ${s.name} for supporting Nigerian education!`,
      })),
      ...investors.map(i => ({
        name: i.name,
        role: `${i.tier} Partner`,
        text: i.description || `Thank you to our ${i.tier} partner ${i.name} for believing in our mission!`,
      })),
    ]

    // Default donation tiers
    const tiers = [
      { name: "Supporter", amount: 1000, description: "Help cover basic server costs", perks: "Name on supporters page" },
      { name: "Champion", amount: 5000, description: "Fund a month of learning for 10 students", perks: "Supporter badge + early access" },
      { name: "Patron", amount: 25000, description: "Sponsor a full classroom for a term", perks: "All Champion perks + mentorship access" },
      { name: "Partner", amount: 100000, description: "Strategic investment in Nigerian education", perks: "All Patron perks + advisory board seat" },
    ]

    // Default why invest content
    const whyInvest = [
      { title: "Direct Impact", description: "100% of donations go directly to platform development, content creation, and student access." },
      { title: "Tax Deductible", description: "Your donation may be eligible for tax deductions under Nigerian law." },
      { title: "Transparency", description: "We publish quarterly impact reports showing exactly how funds are used." },
      { title: "Scalable", description: "Your contribution helps us reach more students across Nigeria's 36 states." },
    ]

    const responseSettings = {
      message: settings?.message || "Support Nigerian Education — Invest in the Future",
      goalAmount: settings?.goalAmount || 5000000,
      currentAmount: settings?.currentAmount || 0,
      currency: settings?.currency || "NGN",
      isActive: settings?.isActive ?? true,
      tiers,
      testimonials,
      whyInvest,
    }

    return NextResponse.json({ settings: responseSettings })
  } catch (error: any) {
    console.error('Donate GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

