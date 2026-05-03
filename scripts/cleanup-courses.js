// Script to remove all courses except A1-C2 with real content
// Keeps only: English, Spanish, German, Arabic, Portuguese, Igbo, Swahili, Yoruba, Hausa - A1 through C2

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting course cleanup...\n')
  
  // Get all courses
  const allCourses = await prisma.course.findMany({
    include: {
      _count: {
        select: { modules: true }
      }
    }
  })
  
  console.log(`Found ${allCourses.length} total courses\n`)
  
  // Courses to KEEP (A1-C2 of main languages)
  const keepPatterns = [
    /^English A[12] -/,
    /^English B[12] -/,
    /^English C[12] -/,
    /^Spanish A[12] -/,
    /^Spanish B[12] -/,
    /^Spanish C[12] -/,
    /^German A[12] -/,
    /^German B[12] -/,
    /^German C[12] -/,
    /^Arabic A[12] -/,
    /^Arabic B[12] -/,
    /^Arabic C[12] -/,
    /^Portuguese A[12] -/,
    /^Portuguese B[12] -/,
    /^Portuguese C[12] -/,
    /^Igbo A[12] -/,
    /^Igbo B[12] -/,
    /^Igbo C[12] -/,
    /^Swahili A[12] -/,
    /^Swahili B[12] -/,
    /^Swahili C[12] -/,
    /^Yoruba A[12] -/,
    /^Yoruba B[12] -/,
    /^Yoruba C[12] -/,
    /^Hausa A[12] -/,
    /^Hausa B[12] -/,
    /^Hausa C[12] -/,
  ]
  
  // Also keep courses with 20 modules (the properly seeded ones)
  const toDelete = []
  const toKeep = []
  
  for (const course of allCourses) {
    const shouldKeep = keepPatterns.some(pattern => pattern.test(course.title))
    const hasModules = course._count.modules > 0
    
    if (shouldKeep && hasModules && course._count.modules === 20) {
      toKeep.push(course)
    } else {
      toDelete.push(course)
    }
  }
  
  console.log(`Courses to KEEP: ${toKeep.length}`)
  toKeep.forEach(c => {
    console.log(`  ✅ ${c.title} (${c._count.modules} modules)`)
  })
  
  console.log(`\nCourses to DELETE: ${toDelete.length}`)
  toDelete.forEach(c => {
    console.log(`  ❌ ${c.title} (${c._count.modules} modules)`)
  })
  
  if (toDelete.length > 0) {
    console.log('\nDeleting courses...')
    
    for (const course of toDelete) {
      console.log(`  Deleting: ${course.title}...`)
      
      // Delete in order: questions -> lessons -> modules -> course
      const modules = await prisma.module.findMany({
        where: { courseId: course.id }
      })
      
      for (const mod of modules) {
        const lessons = await prisma.lesson.findMany({
          where: { moduleId: mod.id }
        })
        
        for (const lesson of lessons) {
          await prisma.question.deleteMany({
            where: { lessonId: lesson.id }
          })
        }
        
        await prisma.lesson.deleteMany({
          where: { moduleId: mod.id }
        })
      }
      
      await prisma.module.deleteMany({
        where: { courseId: course.id }
      })
      
      await prisma.course.delete({
        where: { id: course.id }
      })
    }
    
    console.log(`\n✅ Deleted ${toDelete.length} courses`)
  }
  
  // Final count
  const remaining = await prisma.course.findMany({
    orderBy: [
      { minimumLevel: 'asc' },
      { title: 'asc' }
    ]
  })
  
  console.log(`\n========== FINAL STATE ==========`)
  console.log(`Total courses remaining: ${remaining.length}\n`)
  
  remaining.forEach(c => {
    console.log(`${c.title} (${c.minimumLevel})`)
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
