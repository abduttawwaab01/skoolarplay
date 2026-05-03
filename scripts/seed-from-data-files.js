// Master seed script - seeds all courses from data files
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Import course data directly
const courses = [
  { name: 'yoruba-a1', data: require('./src/data/courses/yoruba-a1.js') },
  { name: 'yoruba-a2', data: require('./src/data/courses/yoruba-a2.js') },
  { name: 'yoruba-b1', data: require('./src/data/courses/yoruba-b1.js') },
  { name: 'yoruba-b2', data: require('./src/data/courses/yoruba-b2.js') },
  { name: 'yoruba-c1', data: require('./src/data/courses/yoruba-c1.js') },
  { name: 'yoruba-c2', data: require('./src/data/courses/yoruba-c2.js') },
  { name: 'hausa-a1', data: require('./src/data/courses/hausa-a1.js') },
  { name: 'hausa-a2', data: require('./src/data/courses/hausa-a2.js') },
  { name: 'hausa-b1', data: require('./src/data/courses/hausa-b1.js') },
  { name: 'hausa-b2', data: require('./src/data/courses/hausa-b2.js') },
  { name: 'hausa-c1', data: require('./src/data/courses/hausa-c1.js') },
  { name: 'hausa-c2', data: require('./src/data/courses/hausa-c2.js') },
]

async function main() {
  console.log('========== MASTER SEED FROM DATA FILES ==========\n')
  
  // Get or create Languages category
  let langCategory = await prisma.category.findFirst({
    where: { name: 'Languages' }
  })
  
  if (!langCategory) {
    langCategory = await prisma.category.create({
      data: {
        name: 'Languages',
        description: 'Language learning courses',
        icon: '🌍',
        color: '#4ECDC4',
        order: 1,
        isActive: true,
      }
    })
  }
  
  console.log(`Seeding ${courses.length} courses with REAL data...\n`)
  
  let successCount = 0
  let errorCount = 0
  const errors = []
  
  for (const courseInfo of courses) {
    console.log(`Processing: ${courseInfo.name}...`)
    
    // Extract data from file (handle ES module wrapper)
    let courseData = courseInfo.data
    if (courseInfo.data.__esModule && courseInfo.data.default) {
      courseData = courseInfo.data.default
    }
    
    // Handle route.ts files that have the data as a variable
    if (!courseData.course && !courseData.default) {
      // Try to extract from the module
      const keys = Object.keys(courseInfo.data)
      if (keys.length > 0 && keys[0] !== '__esModule') {
        courseData = courseInfo.data[keys[0]]
      }
    }
    
    if (!courseData || !courseData.course || !courseData.modules) {
      console.log(`  ❌ Invalid data format`)
      errorCount++
      continue
    }
    
    try {
      // Check if course already exists
      const existingCourse = await prisma.course.findFirst({
        where: { title: courseData.course.title }
      })
      
      if (existingCourse) {
        console.log(`  ⚠️  Already exists (ID: ${existingCourse.id}), skipping...`)
        successCount++
        continue
      }
      
      // Create course
      const course = await prisma.course.create({
        data: {
          title: courseData.course.title,
          description: courseData.course.description,
          difficulty: courseData.course.difficulty,
          minimumLevel: courseData.course.minimumLevel,
          isActive: true,
          category: { connect: { id: langCategory.id } }
        }
      })
      
      // Create modules, lessons, and questions
      for (let m = 0; m < courseData.modules.length; m++) {
        const moduleData = courseData.modules[m]
        
        const newModule = await prisma.module.create({
          data: {
            title: moduleData.title,
            courseId: course.id,
            order: m,
            isActive: true,
          }
        })
        
        for (let l = 0; l < moduleData.lessons.length; l++) {
          const lessonData = moduleData.lessons[l]
          
          const newLesson = await prisma.lesson.create({
            data: {
              title: lessonData.title,
              moduleId: newModule.id,
              type: lessonData.type,
              order: l,
              xpReward: lessonData.xpReward || (10 + Math.floor(Math.random() * 40)),
              gemReward: lessonData.gemReward || (1 + Math.floor(Math.random() * 5)),
              isActive: true,
            }
          })
          
          // Create questions
          if (lessonData.questions && lessonData.questions.length > 0) {
            const questionsToCreate = lessonData.questions.map((q, idx) => ({
              lessonId: newLesson.id,
              type: q.type,
              question: q.question,
              options: q.options || null,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || null,
              hint: q.hint || null,
              language: q.language || null,
              order: idx,
              points: q.points || 10,
              isActive: true,
            }))
            
            await prisma.question.createMany({ data: questionsToCreate })
          }
        }
      }
      
      console.log(`  ✅ Seeded with ${courseData.modules.length} modules`)
      successCount++
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`)
      errorCount++
      errors.push({ course: courseInfo.name, error: error.message })
    }
  }
  
  // Summary
  console.log('\n========== SEEDING SUMMARY ==========')
  console.log(`Total: ${courses.length}`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(e => {
      console.log(`  - ${e.course}: ${e.error}`)
    })
  }
  
  // Database stats
  const totalCourses = await prisma.course.count()
  const totalModules = await prisma.module.count()
  const totalLessons = await prisma.lesson.count()
  const totalQuestions = await prisma.question.count()
  
  console.log('\n========== DATABASE STATS ==========')
  console.log(`Courses: ${totalCourses}`)
  console.log(`Modules: ${totalModules}`)
  console.log(`Lessons: ${totalLessons}`)
  console.log(`Questions: ${totalQuestions}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })