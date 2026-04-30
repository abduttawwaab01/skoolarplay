import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const defaultStudyPaths = [
  {
    title: "WAEC Exam Preparation",
    description: "Comprehensive preparation for West African Examinations Council (WAEC) exams. Covering all major subjects including Mathematics, English, Physics, Chemistry, Biology, and more.",
    type: "EXAM",
    icon: "📚",
    color: "#2563eb",
    order: 1,
  },
  {
    title: "NECO Exam Prep",
    description: "Prepare for NECO Senior Secondary Certificate Examination. Timed practice tests, past questions, and expert explanations.",
    type: "EXAM",
    icon: "🎯",
    color: "#7c3aed",
    order: 2,
  },
  {
    title: "JAMB UTME Practice",
    description: "Master the JAMB UTME with comprehensive past questions, mock tests, and score-boosting strategies.",
    type: "EXAM",
    icon: "🏆",
    color: "#dc2626",
    order: 3,
  },
  {
    title: "Programming Fundamentals",
    description: "Learn the basics of programming with Python, JavaScript, and other popular languages. Perfect for beginners.",
    type: "SKILL",
    icon: "💻",
    color: "#7c3aed",
    order: 4,
  },
  {
    title: "Web Development",
    description: "Build modern websites with HTML, CSS, JavaScript, React, and Next.js. From basics to advanced concepts.",
    type: "SKILL",
    icon: "🌐",
    color: "#059669",
    order: 5,
  },
  {
    title: "Data Science & AI",
    description: "Explore data science, machine learning, and artificial intelligence. Learn Python, data analysis, and ML libraries.",
    type: "SKILL",
    icon: "🤖",
    color: "#0891b2",
    order: 6,
  },
  {
    title: "English Language",
    description: "Master English from beginner to advanced. Grammar, vocabulary, speaking, writing, and comprehension.",
    type: "LANGUAGE",
    icon: "🇬🇧",
    color: "#d97706",
    order: 7,
  },
  {
    title: "French Language",
    description: "Learn French from scratch. Common phrases, grammar rules, and cultural insights for beginners.",
    type: "LANGUAGE",
    icon: "🇫🇷",
    color: "#2563eb",
    order: 8,
  },
  {
    title: "Chinese (Mandarin)",
    description: "Introduction to Mandarin Chinese. Basic phrases, tones, and characters for everyday conversation.",
    type: "LANGUAGE",
    icon: "🇨🇳",
    color: "#dc2626",
    order: 9,
  },
  {
    title: "Business Skills",
    description: "Essential business skills including communication, presentations, time management, and leadership.",
    type: "BUSINESS",
    icon: "💼",
    color: "#059669",
    order: 10,
  },
  {
    title: "Financial Literacy",
    description: "Learn personal finance, budgeting, investing basics, and wealth-building strategies.",
    type: "BUSINESS",
    icon: "📈",
    color: "#16a34a",
    order: 11,
  },
  {
    title: "Entrepreneurship",
    description: "Start and grow your own business. From ideation to launch and scaling strategies.",
    type: "BUSINESS",
    icon: "🚀",
    color: "#ea580c",
    order: 12,
  },
]

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { seedDefault = true } = body

    if (!seedDefault) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const createdPaths: Awaited<ReturnType<typeof db.studyPath.create>>[] = []
    
    for (const pathData of defaultStudyPaths) {
      const existing = await db.studyPath.findFirst({
        where: { title: pathData.title },
      })

      if (!existing) {
        const created = await db.studyPath.create({
          data: pathData,
        })
        createdPaths.push(created)
      }
    }

    return NextResponse.json({ 
      message: `Created ${createdPaths.length} study paths`,
      studyPaths: createdPaths,
    })
  } catch (error: any) {
    console.error('Seed study paths error:', error)
    return NextResponse.json(
      { error: error.message || "Failed to seed study paths" },
      { status: 500 }
    )
  }
}