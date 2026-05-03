// Script to clean up fake/placeholder questions from database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting cleanup of fake questions...')

  let totalDeleted = 0

  // 1. Delete questions with "fox" (the infamous issue)
  const foxDeleted = await prisma.question.deleteMany({
    where: {
      OR: [
        { question: { contains: 'fox', mode: 'insensitive' } },
        { correctAnswer: { contains: 'fox', mode: 'insensitive' } }
      ]
    }
  })
  if (foxDeleted.count > 0) {
    console.log(`Deleted ${foxDeleted.count} questions containing "fox"`)
    totalDeleted += foxDeleted.count
  }

  // 2. Delete questions with "Correct Option" or generic options
  const genericOptionsDeleted = await prisma.$executeRaw`
    DELETE FROM "Question" 
    WHERE "options" LIKE '%Correct Option%' 
    OR "options" LIKE '%Distractor A%' 
    OR "options" LIKE '%Distractor B%' 
    OR "options" LIKE '%Distractor C%'
    OR "options" LIKE '%Option A%'
    OR "options" LIKE '%Option B%'
    OR "options" LIKE '%Option C%'
  `
  console.log(`Deleted ${genericOptionsDeleted} questions with generic options`)
  totalDeleted += Number(genericOptionsDeleted)

  // 3. Delete questions with placeholder text
  const placeholders = ['TODO', 'FIXME', 'lorem ipsum', 'test question', 'foobar']
  for (const placeholder of placeholders) {
    const deleted = await prisma.question.deleteMany({
      where: {
        OR: [
          { question: { contains: placeholder, mode: 'insensitive' } },
          { correctAnswer: { contains: placeholder, mode: 'insensitive' } }
        ]
      }
    })
    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} questions containing "${placeholder}"`)
      totalDeleted += deleted.count
    }
  }

  // 4. Find and delete questions where all options are generic
  const allQuestions = await prisma.question.findMany({
    select: { id: true, options: true, question: true }
  })

  console.log(`Checking ${allQuestions.length} questions for generic content...`)

  let genericCount = 0
  for (const q of allQuestions) {
    if (q.options) {
      try {
        const opts = JSON.parse(q.options)
        if (Array.isArray(opts)) {
          const allGeneric = opts.every((opt: any) => 
            opt.label && (
              opt.label === 'Correct Option' ||
              opt.label.match(/^Option\s+[A-C]$/) ||
              opt.label.match(/^Distractor\s+[A-C]$/)
            )
          )
          if (allGeneric) {
            await prisma.question.delete({ where: { id: q.id } })
            genericCount++
          }
        }
      } catch (e) {
        // Skip parsing errors
      }
    }
  }

  if (genericCount > 0) {
    console.log(`Deleted ${genericCount} questions with all generic options`)
    totalDeleted += genericCount
  }

  console.log(`\nCleanup complete! Total deleted: ${totalDeleted} questions`)
  
  // Summary
  const remaining = await prisma.question.count()
  const remainingLessons = await prisma.lesson.count()
  const remainingModules = await prisma.module.count()
  const remainingCourses = await prisma.course.count()
  
  console.log(`\nDatabase summary:`)
  console.log(`  Questions: ${remaining}`)
  console.log(`  Lessons: ${remainingLessons}`)
  console.log(`  Modules: ${remainingModules}`)
  console.log(`  Courses: ${remainingCourses}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
