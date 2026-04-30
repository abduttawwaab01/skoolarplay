import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courses = await db.course.findMany({
      where: { isActive: true },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                questions: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    })

    const report = courses.map((course) => {
      let totalLessons = 0
      let totalQuestions = 0
      let emptyModules = 0
      let emptyLessons = 0
      let untitledModules = 0
      let untitledLessons = 0
      let lessonsWithTooManyQuestions: any[] = []

      const modules = course.modules.map((mod) => {
        const moduleLessons = mod.lessons.length
        const moduleQuestions = mod.lessons.reduce(
          (sum, lesson) => sum + lesson.questions.length,
          0
        )

        totalLessons += moduleLessons
        totalQuestions += moduleQuestions

        if (moduleLessons === 0) emptyModules++
        if (!mod.title || mod.title.trim() === "") untitledModules++

        const lessons = mod.lessons.map((lesson) => {
          const qCount = lesson.questions.length
          if (qCount === 0) emptyLessons++
          if (!lesson.title || lesson.title.trim() === "") untitledLessons++
          if (qCount > 10) {
            lessonsWithTooManyQuestions.push({
              lessonId: lesson.id,
              lessonTitle: lesson.title || "(untitled)",
              questionCount: qCount,
              moduleId: mod.id,
              moduleTitle: mod.title || "(untitled)",
            })
          }

          const questionTypes = lesson.questions.reduce(
            (acc: Record<string, number>, q) => {
              acc[q.type] = (acc[q.type] || 0) + 1
              return acc
            },
            {}
          )

          return {
            id: lesson.id,
            title: lesson.title || "(untitled)",
            type: lesson.type,
            order: lesson.order,
            questionCount: qCount,
            questionTypes,
            questions: lesson.questions.map((q, i) => ({
              order: i + 1,
              type: q.type,
              question: q.question.substring(0, 80) + (q.question.length > 80 ? "..." : ""),
              hasHint: !!q.hint,
              hasExplanation: !!q.explanation,
              language: q.language,
            })),
          }
        })

        return {
          id: mod.id,
          title: mod.title || "(untitled)",
          order: mod.order,
          lessonCount: moduleLessons,
          questionCount: moduleQuestions,
          lessons,
        }
      })

      return {
        id: course.id,
        title: course.title,
        difficulty: course.difficulty,
        minimumLevel: course.minimumLevel,
        totalModules: course.modules.length,
        totalLessons,
        totalQuestions,
        emptyModules,
        emptyLessons,
        untitledModules,
        untitledLessons,
        lessonsWithTooManyQuestions,
        modules,
      }
    })

    const summary = {
      totalCourses: report.length,
      coursesWithIssues: report.filter(
        (c) =>
          c.emptyModules > 0 ||
          c.emptyLessons > 0 ||
          c.untitledModules > 0 ||
          c.untitledLessons > 0 ||
          c.lessonsWithTooManyQuestions.length > 0
      ).length,
      totalLessons: report.reduce((sum, c) => sum + c.totalLessons, 0),
      totalQuestions: report.reduce((sum, c) => sum + c.totalQuestions, 0),
      totalEmptyModules: report.reduce((sum, c) => sum + c.emptyModules, 0),
      totalEmptyLessons: report.reduce((sum, c) => sum + c.emptyLessons, 0),
      totalUntitledModules: report.reduce(
        (sum, c) => sum + c.untitledModules,
        0
      ),
      totalUntitledLessons: report.reduce(
        (sum, c) => sum + c.untitledLessons,
        0
      ),
      totalLessonsWithTooManyQuestions: report.reduce(
        (sum, c) => sum + c.lessonsWithTooManyQuestions.length,
        0
      ),
    }

    return NextResponse.json({
      summary,
      courses: report,
    })
  } catch (error: any) {
    console.error("Course audit error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to audit courses" },
      { status: 500 }
    )
  }
}
