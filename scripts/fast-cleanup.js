// Fast cleanup using Prisma raw SQL
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting FAST cleanup using raw SQL...\n')
  
  // Delete in correct order
  console.log('Deleting all questions...')
  const qResult = await prisma.$executeRaw`DELETE FROM "Question"`
  console.log(`Deleted ${qResult} questions`)
  
  console.log('Deleting all lessons...')
  const lResult = await prisma.$executeRaw`DELETE FROM "Lesson"`
  console.log(`Deleted ${lResult} lessons`)
  
  console.log('Deleting all modules...')
  const mResult = await prisma.$executeRaw`DELETE FROM "Module"`
  console.log(`Deleted ${mResult} modules`)
  
  console.log('Deleting all courses...')
  const cResult = await prisma.$executeRaw`DELETE FROM "Course"`
  console.log(`Deleted ${cResult} courses`)
  
  // Verify
  const courses = await prisma.course.count()
  const modules = await prisma.module.count()
  const lessons = await prisma.lesson.count()
  const questions = await prisma.question.count()
  
  console.log('\n========== CLEANUP COMPLETE ==========')
  console.log(`Courses: ${courses}`)
  console.log(`Modules: ${modules}`)
  console.log(`Lessons: ${lessons}`)
  console.log(`Questions: ${questions}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
