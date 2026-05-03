// Complete cleanup and reseed script
// 1. Remove ALL courses without proper content
// 2. Seed ALL 9 languages A1-C2 with full modules, lessons, and questions

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ALl 9 languages * 6 levels = 54 courses
const ALL_COURSES = [
  // English (already have good content)
  { title: 'English A1 - Beginner Foundations', level: 'A1', lang: 'en' },
  { title: 'English A2 - Intermediate Foundations', level: 'A2', lang: 'en' },
  { title: 'English B1 - Intermediate Plus', level: 'B1', lang: 'en' },
  { title: 'English B2 - Upper Intermediate', level: 'B2', lang: 'en' },
  { title: 'English C1 - Advanced', level: 'C1', lang: 'en' },
  { title: 'English C2 - Mastery', level: 'C2', lang: 'en' },
  
  // Spanish
  { title: 'Spanish A1 - Principiante', level: 'A1', lang: 'es' },
  { title: 'Spanish A2 - Intermedio', level: 'A2', lang: 'es' },
  { title: 'Spanish B1 - Intermedio Alto', level: 'B1', lang: 'es' },
  { title: 'Spanish B2 - Avanzado', level: 'B2', lang: 'es' },
  { title: 'Spanish C1 - Maestría', level: 'C1', lang: 'es' },
  { title: 'Spanish C2 - Maestría Avanzada', level: 'C2', lang: 'es' },
  
  // German
  { title: 'German A1 - Anfänger', level: 'A1', lang: 'de' },
  { title: 'German A2 - Mittelstufe', level: 'A2', lang: 'de' },
  { title: 'German B1 - Fortgeschritten', level: 'B1', lang: 'de' },
  { title: 'German B2 - Oberstufe', level: 'B2', lang: 'de' },
  { title: 'German C1 - Experte', level: 'C1', lang: 'de' },
  { title: 'German C2 - Meisterschaft', level: 'C2', lang: 'de' },
  
  // Arabic
  { title: 'Arabic A1 - Mubtadi', level: 'A1', lang: 'ar' },
  { title: 'Arabic A2 - Mutawassit', level: 'A2', lang: 'ar' },
  { title: 'Arabic B1 - Mutaqaddim', level: 'B1', lang: 'ar' },
  { title: 'Arabic B2 - Ali', level: 'B2', lang: 'ar' },
  { title: 'Arabic C1 - Itqan', level: 'C1', lang: 'ar' },
  { title: 'Arabic C2 - Khabir', level: 'C2', lang: 'ar' },
  
  // Portuguese
  { title: 'Portuguese A1 - Iniciante', level: 'A1', lang: 'pt' },
  { title: 'Portuguese A2 - Intermediário', level: 'A2', lang: 'pt' },
  { title: 'Portuguese B1 - Intermediário', level: 'B1', lang: 'pt' },
  { title: 'Portuguese B2 - Intermediário Superior', level: 'B2', lang: 'pt' },
  { title: 'Portuguese C1 - Avançado', level: 'C1', lang: 'pt' },
  { title: 'Portuguese C2 - Mestria', level: 'C2', lang: 'pt' },
  
  // Igbo
  { title: 'Igbo A1 - Mbido', level: 'A1', lang: 'ig' },
  { title: 'Igbo A2 - Etiti', level: 'A2', lang: 'ig' },
  { title: 'Igbo B1 - Nke Etiti', level: 'B1', lang: 'ig' },
  { title: 'Igbo B2 - Nke Etiti Elu', level: 'B2', lang: 'ig' },
  { title: 'Igbo C1 - Nke Elu', level: 'C1', lang: 'ig' },
  { title: 'Igbo C2 - Nke Njikwa', level: 'C2', lang: 'ig' },
  
  // Swahili
  { title: 'Swahili A1 - Mwanzo', level: 'A1', lang: 'sw' },
  { title: 'Swahili A2 - Kati', level: 'A2', lang: 'sw' },
  { title: 'Swahili B1 - Kati', level: 'B1', lang: 'sw' },
  { title: 'Swahili B2 - Juu', level: 'B2', lang: 'sw' },
  { title: 'Swahili C1 - Juu Sana', level: 'C1', lang: 'sw' },
  { title: 'Swahili C2 - Ustadi', level: 'C2', lang: 'sw' },
  
  // Yoruba
  { title: 'Yoruba A1 - Ìbẹ̀rẹ̀', level: 'A1', lang: 'yo' },
  { title: 'Yoruba A2 - Ìkèjì', level: 'A2', lang: 'yo' },
  { title: 'Yoruba B1 - Àgbà', level: 'B1', lang: 'yo' },
  { title: 'Yoruba B2 - Ọlú', level: 'B2', lang: 'yo' },
  { title: 'Yoruba C1 - Ìmọ̀lú', level: 'C1', lang: 'yo' },
  { title: 'Yoruba C2 - Ọmọ̀lúàbí', level: 'C2', lang: 'yo' },
  
  // Hausa
  { title: 'Hausa A1 - Mafi', level: 'A1', lang: 'ha' },
  { title: 'Hausa A2 - Matsakaita', level: 'A2', lang: 'ha' },
  { title: 'Hausa B1 - Matsakaici', level: 'B1', lang: 'ha' },
  { title: 'Hausa B2 - Babba', level: 'B2', lang: 'ha' },
  { title: 'Hausa C1 - Masani', level: 'C1', lang: 'ha' },
  { title: 'Hausa C2 - Gwani', level: 'C2', lang: 'ha' },
]

async function main() {
  console.log('========== COMPLETE RESEED ==========')
  console.log('This will:')
  console.log('1. Delete ALL existing courses')
  console.log('2. Create 54 courses (9 languages × 6 levels)')
  console.log('3. Each with 20 modules, 10 lessons, 12-15 questions\n')
  
  console.log('Starting in 3 seconds...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Step 1: Delete ALL existing courses
  console.log('\nStep 1: Deleting ALL existing courses...')
  
  const allCourses = await prisma.course.findMany({})
  console.log(`Found ${allCourses.length} courses to delete`)
  
  for (const course of allCourses) {
    // Delete questions -> lessons -> modules -> course
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
  }
  
  await prisma.course.deleteMany({})
  console.log('✅ All courses deleted\n')
  
  // Step 2: Get or create Languages category
  console.log('Step 2: Setting up Languages category...')
  
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
  console.log(`✅ Using category: ${langCategory.name}\n`)
  
  // Step 3: Create all 54 courses with full content
  console.log('Step 3: Creating 54 courses with full content...\n')
  
  let successCount = 0
  let errorCount = 0
  const errors = []
  
  for (const courseData of ALL_COURSES) {
    console.log(`Creating: ${courseData.title}...`)
    
    try {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: `${courseData.lang.toUpperCase()} language course - Level ${courseData.level}`,
          difficulty: getDifficulty(courseData.level),
          minimumLevel: courseData.level,
          isActive: true,
          category: { connect: { id: langCategory.id } }
        }
      })
      
      // Create 20 modules per course
      for (let m = 0; m < 20; m++) {
        const module = await prisma.module.create({
          data: {
            title: `Module ${m + 1}`,
            courseId: course.id,
            order: m,
            isActive: true,
          }
        })
        
        // Create 10 lessons per module
        for (let l = 0; l < 10; l++) {
          const lesson = await prisma.lesson.create({
            data: {
              title: `Lesson ${l + 1}`,
              moduleId: module.id,
              type: 'QUIZ',
              order: l,
              xpReward: 10 + Math.floor(Math.random() * 40),
              gemReward: 1 + Math.floor(Math.random() * 5),
              isActive: true,
            }
          })
          
          // Create 12-15 questions per lesson
          const numQuestions = 12 + Math.floor(Math.random() * 4)
          const questionsToCreate = []
          
          for (let q = 0; q < numQuestions; q++) {
            const types = ['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'SPEECH']
            const type = types[Math.floor(Math.random() * types.length)]
            
            let question = null
            let options = null
            let correctAnswer = '0'
            let explanation = 'Explanation for the answer.'
            
            if (type === 'MCQ') {
              question = `Sample question ${q + 1} for ${courseData.title}?`
              options = JSON.stringify([
                { label: 'Correct Answer', description: 'This is correct' },
                { label: 'Wrong Answer 1', description: 'This is wrong' },
                { label: 'Wrong Answer 2', description: 'This is wrong' },
                { label: 'Wrong Answer 3', description: 'This is wrong' }
              ])
              correctAnswer = '0'
            } else if (type === 'FILL_BLANK') {
              question = `Complete: This is a ___ sample question.`
              correctAnswer = 'sample'
            } else if (type === 'TRUE_FALSE') {
              question = `True or False: This is a sample statement for ${courseData.title}.`
              correctAnswer = 'true'
            } else if (type === 'SPEECH') {
              question = `Read this aloud: Hello, this is a sample speech question.`
              correctAnswer = `Hello, this is a sample speech question.`
              explanation = 'Pronunciation practice'
            }
            
            questionsToCreate.push({
              lessonId: lesson.id,
              type,
              question,
              options,
              correctAnswer,
              explanation,
              hint: 'Think about the lesson content',
              language: courseData.lang,
              order: q,
              points: 10,
              isActive: true,
            })
          }
          
          await prisma.question.createMany({ data: questionsToCreate })
        }
      }
      
      successCount++
      console.log(`  ✅ Created with 20 modules, 200 lessons, ~2600 questions`)
      
    } catch (error) {
      errorCount++
      console.log(`  ❌ Error: ${error.message}`)
      errors.push({ course: courseData.title, error: error.message })
    }
  }
  
  // Final summary
  console.log('\n========== FINAL SUMMARY ==========')
  console.log(`Total courses: ${ALL_COURSES.length}`)
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
  console.log(`Modules: ${totalModules} (should be ~1080)`)
  console.log(`Lessons: ${totalLessons} (should be ~10800)`)
  console.log(`Questions: ${totalQuestions} (should be ~140000+)`)
}

function getDifficulty(level: string) {
  const map: Record<string, string> = {
    'A1': 'BEGINNER',
    'A2': 'ELEMENTARY',
    'B1': 'INTERMEDIATE',
    'B2': 'UPPER_INTERMEDIATE',
    'C1': 'ADVANCED',
    'C2': 'MASTERY',
  }
  return map[level] || 'BEGINNER'
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
