const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('========== DELETING ALL COURSES AND CATEGORIES ==========\n')
  
  // Count before
  const coursesBefore = await prisma.course.count()
  const modulesBefore = await prisma.module.count()
  const lessonsBefore = await prisma.lesson.count()
  const questionsBefore = await prisma.question.count()
  const categoriesBefore = await prisma.category.count()
  
  console.log('BEFORE:')
  console.log(`  Courses: ${coursesBefore}`)
  console.log(`  Modules: ${modulesBefore}`)
  console.log(`  Lessons: ${lessonsBefore}`)
  console.log(`  Questions: ${questionsBefore}`)
  console.log(`  Categories: ${categoriesBefore}\n`)
  
  try {
    // Delete in correct order (respecting foreign keys)
    console.log('Deleting questions...')
    const deletedQuestions = await prisma.question.deleteMany({})
    console.log(`  Deleted ${deletedQuestions.count} questions`)
    
    console.log('Deleting lessons...')
    const deletedLessons = await prisma.lesson.deleteMany({})
    console.log(`  Deleted ${deletedLessons.count} lessons`)
    
    console.log('Deleting modules...')
    const deletedModules = await prisma.module.deleteMany({})
    console.log(`  Deleted ${deletedModules.count} modules`)
    
    console.log('Deleting courses...')
    const deletedCourses = await prisma.course.deleteMany({})
    console.log(`  Deleted ${deletedCourses.count} courses`)
    
    console.log('Deleting categories...')
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`  Deleted ${deletedCategories.count} categories\n`)
    
    // Count after
    const coursesAfter = await prisma.course.count()
    const modulesAfter = await prisma.module.count()
    const lessonsAfter = await prisma.lesson.count()
    const questionsAfter = await prisma.question.count()
    const categoriesAfter = await prisma.category.count()
    
    console.log('AFTER:')
    console.log(`  Courses: ${coursesAfter}`)
    console.log(`  Modules: ${modulesAfter}`)
    console.log(`  Lessons: ${lessonsAfter}`)
    console.log(`  Questions: ${questionsAfter}`)
    console.log(`  Categories: ${categoriesAfter}`)
    
    console.log('\n✅ Database cleaned successfully!')
    
  } catch (error) {
    console.error('Error during deletion:', error)
    throw error
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })