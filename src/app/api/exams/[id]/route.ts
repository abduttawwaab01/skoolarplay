import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

 export async function GET(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
 ) {
   try {
     const session = await getServerSession()
     if (!session?.user?.email) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }

     const user = await db.user.findUnique({ where: { email: session.user.email } })
     if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 })
     }

     const { id } = await params

     const exam = await db.exam.findUnique({
       where: { id },
       include: {
         sections: {
           orderBy: { order: 'asc' },
           include: {
             questions: {
               orderBy: { order: 'asc' },
             },
           },
         },
       },
     })

     if (!exam || !exam.isActive || !exam.isPublished) {
       return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
     }

     // Randomize question order for each attempt (shuffle sections and questions)
     const shuffleArray = <T,>(array: T[]): T[] => {
       const arr = [...array]
       for (let i = arr.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1))
         ;[arr[i], arr[j]] = [arr[j], arr[i]]
       }
       return arr
     }

     const randomizedExam = {
       ...exam,
       sections: shuffleArray(exam.sections).map((section) => ({
         ...section,
         questions: shuffleArray(section.questions),
       })),
     }

     // Get previous attempts
     const attempts = await db.examAttempt.findMany({
       where: { userId: user.id, examId: id },
       orderBy: { createdAt: 'desc' },
     })

     return NextResponse.json({
       exam: {
         id: randomizedExam.id,
         title: randomizedExam.title,
         description: randomizedExam.description,
         type: randomizedExam.type,
         subject: randomizedExam.subject,
         year: randomizedExam.year,
         duration: randomizedExam.duration,
         totalQuestions: randomizedExam.totalQuestions,
         totalMarks: randomizedExam.totalMarks,
         passingMark: randomizedExam.passingMark,
         sections: randomizedExam.sections.map((section) => ({
           id: section.id,
           title: section.title,
           instruction: section.instruction,
           marks: section.marks,
           order: section.order,
           questions: section.questions.map((q) => ({
             id: q.id,
             type: q.type,
             question: q.question,
             options: q.options,
             marks: q.marks,
             order: q.order,
           })),
         })),
         previousAttempts: attempts.map((a) => ({
           id: a.id,
           score: a.score,
           totalMarks: a.totalMarks,
           percentage: a.percentage,
           passed: a.passed,
           timeSpent: a.timeSpent,
           completedAt: a.completedAt,
         })),
       },
     })
   } catch (error) {
     console.error('Failed to fetch exam:', error)
     return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 })
   }
 }
