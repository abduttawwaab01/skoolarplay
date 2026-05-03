// Simplified seed script using JSON files
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

const courseFiles = [
  'yoruba-a1', 'yoruba-a2', 'yoruba-b1', 'yoruba-b2', 'yoruba-c1', 'yoruba-c2',
  'hausa-a1', 'hausa-a2', 'hausa-b1', 'hausa-b2', 'hausa-c1', 'hausa-c2'
]

async function main() {
  console.log('========== SEEDING FROM JSON FILES ==========\n')
  
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
  
  console.log(`Seeding ${courseFiles.length} courses...\n`)
  
  let successCount = 0
  let errorCount = 0
  const errors = []
  
  for (const courseName of courseFiles) {
    console.log(`Processing: ${courseName}...`)
    
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'courses', `${courseName}.json`)
    
    if (!fs.existsSync(jsonPath)) {
      console.log(`  ❌ JSON file not found: ${jsonPath}`)
      errorCount++
      continue
    }
    
    const courseData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    if (!courseData.course || !courseData.modules) {
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
            const questionsToCreate = lessonData.questions.map((q, idx) => {
              // Handle options - convert array to JSON string if needed
              let optionsValue = null
              if (q.options) {
                if (Array.isArray(q.options)) {
                  optionsValue = JSON.stringify(q.options)
                } else {
                  optionsValue = q.options
                }
              }
              
              return {
                lessonId: newLesson.id,
                type: q.type,
                question: q.question,
                options: optionsValue,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || null,
                hint: q.hint || null,
                language: q.language || null,
                order: idx,
                points: q.points || 10,
                isActive: true,
              }
            })
            
            await prisma.question.createMany({ data: questionsToCreate })
          }
        }
      }
      
      console.log(`  ✅ Seeded with ${courseData.modules.length} modules`)
      successCount++
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`)
      errorCount++
      errors.push({ course: courseName, error: error.message })
    }
  }
  
  // Summary
  console.log('\n========== SEEDING SUMMARY ==========')
  console.log(`Total: ${courseFiles.length}`)
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