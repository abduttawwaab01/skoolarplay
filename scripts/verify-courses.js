// Verify seeded courses in Neon
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Verifying seeded courses in Neon database...\n')
  
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { title: { contains: 'German' } },
        { title: { contains: 'Arabic' } },
        { title: { contains: 'Portuguese' } },
        { title: { contains: 'Igbo' } },
        { title: { contains: 'Swahili' } },
      ]
    },
    include: {
      _count: {
        select: { modules: true }
      }
    },
    orderBy: [
      { minimumLevel: 'asc' },
      { title: 'asc' }
    ]
  })
  
  console.log(`Found ${courses.length} courses:\n`)
  
  courses.forEach(c => {
    console.log(`${c.title}`)
    console.log(`  Level: ${c.minimumLevel} | Difficulty: ${c.difficulty}`)
    console.log(`  Modules: ${c._count.modules}`)
    console.log(``)
  })
  
  const totalModules = await prisma.module.count()
  const totalLessons = await prisma.lesson.count()
  const totalQuestions = await prisma.question.count()
  
  console.log('========== DATABASE SUMMARY ==========')
  console.log(`Total Courses: ${courses.length}`)
  console.log(`Total Modules: ${totalModules}`)
  console.log(`Total Lessons: ${totalLessons}`)
  console.log(`Total Questions: ${totalQuestions}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
