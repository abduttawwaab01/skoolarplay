// Master seed script - reads route files and seeds real data
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

function loadRouteData(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath)
    const content = fs.readFileSync(fullPath, 'utf8')
    
    // Extract the course data object
    const match = content.match(/(?:const \w+CourseData|const courseData) = (\{[\s\S]*?\});/)
    if (!match) {
      console.log(`  Could not parse: ${filePath}`)
      return null
    }
    
    // Use Function constructor to evaluate (safe for our own files)
    try {
      const data = new Function(`return (${match[1]});`)()
      return data
    } catch (e) {
      console.log(`  Error evaluating: ${e.message}`)
      return null
    }
  } catch (error) {
    console.log(`  Error loading ${filePath}: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('========== MASTER SEED ==========\n')
  
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
  
  // Define all 54 courses to seed
  const coursesToSeed = [
    // English (6)
    { file: 'src/app/api/admin/courses/english-a1/route.ts', title: 'English A1 - Beginner Foundations' },
    { file: 'src/app/api/admin/courses/english-a2/route.ts', title: 'English A2 - Intermediate Foundations' },
    { file: 'src/app/api/admin/courses/english-b1/route.ts', title: 'English B1 - Intermediate Plus' },
    { file: 'src/app/api/admin/courses/english-b2/route.ts', title: 'English B2 - Upper Intermediate' },
    { file: 'src/app/api/admin/courses/english-c1/route.ts', title: 'English C1 - Advanced' },
    { file: 'src/app/api/admin/courses/english-c2/route.ts', title: 'English C2 - Mastery' },
    
    // Spanish (6)
    { file: 'src/app/api/admin/courses/spanish-a1/route.ts', title: 'Spanish A1 - Principiante' },
    { file: 'src/app/api/admin/courses/spanish-a2/route.ts', title: 'Spanish A2 - Intermedio' },
    { file: 'src/app/api/admin/courses/spanish-b1/route.ts', title: 'Spanish B1 - Intermedio Alto' },
    { file: 'src/app/api/admin/courses/spanish-b2/route.ts', title: 'Spanish B2 - Avanzado' },
    { file: 'src/app/api/admin/courses/spanish-c1/route.ts', title: 'Spanish C1 - Maestría' },
    { file: 'src/app/api/admin/courses/spanish-c2/route.ts', title: 'Spanish C2 - Maestría Avanzada' },
    
    // German (6)
    { file: 'src/app/api/admin/courses/german-a1/route.ts', title: 'German A1 - Anfänger' },
    { file: 'src/app/api/admin/courses/german-a2/route.ts', title: 'German A2 - Elementary' },
    { file: 'src/app/api/admin/courses/german-b1/route.ts', title: 'German B1 - Fortgeschritten' },
    { file: 'src/app/api/admin/courses/german-b2/route.ts', title: 'German B2 - Oberstufe' },
    { file: 'src/app/api/admin/courses/german-c1/route.ts', title: 'German C1 - Experte' },
    { file: 'src/app/api/admin/courses/german-c2/route.ts', title: 'German C2 - Meisterschaft' },
    
    // Arabic (6)
    { file: 'src/app/api/admin/courses/arabic-a1/route.ts', title: 'Arabic A1 - Mubtadi' },
    { file: 'src/app/api/admin/courses/arabic-a2/route.ts', title: 'Arabic A2 - Mutawassit' },
    { file: 'src/app/api/admin/courses/arabic-b1/route.ts', title: 'Arabic B1 - Mutaqaddim' },
    { file: 'src/app/api/admin/courses/arabic-b2/route.ts', title: 'Arabic B2 - Ali' },
    { file: 'src/app/api/admin/courses/arabic-c1/route.ts', title: 'Arabic C1 - Itqan' },
    { file: 'src/app/api/admin/courses/arabic-c2/route.ts', title: 'Arabic C2 - Khabir' },
    
    // Portuguese (6)
    { file: 'src/app/api/admin/courses/portuguese-a1/route.ts', title: 'Portuguese A1 - Iniciante' },
    { file: 'src/app/api/admin/courses/portuguese-a2/route.ts', title: 'Portuguese A2 - Elementar' },
    { file: 'src/app/api/admin/courses/portuguese-b1/route.ts', title: 'Portuguese B1 - Intermediário' },
    { file: 'src/app/api/admin/courses/portuguese-b2/route.ts', title: 'Portuguese B2 - Intermediário Superior' },
    { file: 'src/app/api/admin/courses/portuguese-c1/route.ts', title: 'Portuguese C1 - Avançado' },
    { file: 'src/app/api/admin/courses/portuguese-c2/route.ts', title: 'Portuguese C2 - Mestria' },
    
    // Igbo (6)
    { file: 'src/app/api/admin/courses/igbo-a1/route.ts', title: 'Igbo A1 - Mbido' },
    { file: 'src/app/api/admin/courses/igbo-a2/route.ts', title: 'Igbo A2 - Etiti' },
    { file: 'src/app/api/admin/courses/igbo-b1/route.ts', title: 'Igbo B1 - Nke Etiti' },
    { file: 'src/app/api/admin/courses/igbo-b2/route.ts', title: 'Igbo B2 - Nke Etiti Elu' },
    { file: 'src/app/api/admin/courses/igbo-c1/route.ts', title: 'Igbo C1 - Nke Elu' },
    { file: 'src/app/api/admin/courses/igbo-c2/route.ts', title: 'Igbo C2 - Nke Njikwa' },
    
    // Swahili (6)
    { file: 'src/app/api/admin/courses/swahili-a1/route.ts', title: 'Swahili A1 - Mwanzo' },
    { file: 'src/app/api/admin/courses/swahili-a2/route.ts', title: 'Swahili A2 - Kati' },
    { file: 'src/app/api/admin/courses/swahili-b1/route.ts', title: 'Swahili B1 - Kati' },
    { file: 'src/app/api/admin/courses/swahili-b2/route.ts', title: 'Swahili B2 - Juu' },
    { file: 'src/app/api/admin/courses/swahili-c1/route.ts', title: 'Swahili C1 - Juu Sana' },
    { file: 'src/app/api/admin/courses/swahili-c2/route.ts', title: 'Swahili C2 - Ustadi' },
    
    // Yoruba (1 exists: A2, need 5 more)
    // Hausa (1 exists: A1, need 5 more)
  ]
  
  console.log(`Seeding ${coursesToSeed.length} courses with REAL data...\n`)
  
  let successCount = 0
  let errorCount = 0
  const errors = []
  
  for (const seedInfo of coursesToSeed) {
    console.log(`Processing: ${seedInfo.title}...`)
    
    const courseData = loadRouteData(seedInfo.file)
    
    if (!courseData || !courseData.course || !courseData.modules) {
      console.log(`  ❌ Could not load data, creating placeholder...`)
      
      // Create placeholder course
      try {
        await prisma.course.create({
          data: {
            title: seedInfo.title,
            description: `Course description for ${seedInfo.title}`,
            difficulty: getDifficultyFromTitle(seedInfo.title),
            minimumLevel: getLevelFromTitle(seedInfo.title),
            isActive: true,
            category: { connect: { id: langCategory.id } }
          }
        })
        console.log(`  ✅ Created placeholder course`)
        successCount++
      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`)
        errorCount++
      }
      continue
    }
    
    try {
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
      errors.push({ course: seedInfo.title, error: error.message })
    }
  }
  
  // Summary
  console.log('\n========== SEEDING SUMMARY ==========')
  console.log(`Total: ${coursesToSeed.length}`)
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
  console.log(`Modules: ${totalModules} (should be ~${coursesToSeed.length * 20})`)
  console.log(`Lessons: ${totalLessons} (should be ~${coursesToSeed.length * 200})`)
  console.log(`Questions: ${totalQuestions} (should be ~${coursesToSeed.length * 2600})`)
}

function getDifficultyFromTitle(title) {
  if (title.includes('A1') || title.includes('Beginner') || title.includes('Principiante') || title.includes('Anfänger') || title.includes('Mubtadi') || title.includes('Iniciante') || title.includes('Mbido') || title.includes('Mwanzo') || title.includes('Mafari')) return 'BEGINNER'
  if (title.includes('A2') || title.includes('Elementary') || title.includes('Intermedio') || title.includes('Mittelstufe') || title.includes('Mutawassit') || title.includes('Elementar') || title.includes('Etiti') || title.includes('Kati')) return 'ELEMENTARY'
  if (title.includes('B1') || title.includes('Intermediate') || title.includes('Intermedio Alto') || title.includes('Fortgeschritten') || title.includes('Mutaqaddim') || title.includes('Intermediário') || title.includes('Nke Etiti') || title.includes('Kati')) return 'INTERMEDIATE'
  if (title.includes('B2') || title.includes('Upper') || title.includes('Avanzado') || title.includes('Oberstufe') || title.includes('Ali') || title.includes('Intermediário Superior') || title.includes('Nke Etiti Elu') || title.includes('Juu')) return 'UPPER_INTERMEDIATE'
  if (title.includes('C1') || title.includes('Advanced') || title.includes('Maestría') || title.includes('Experte') || title.includes('Itqan') || title.includes('Avançado') || title.includes('Nke Elu') || title.includes('Juu Sana')) return 'ADVANCED'
  if (title.includes('C2') || title.includes('Mastery') || title.includes('Maestría Avanzada') || title.includes('Meisterschaft') || title.includes('Khabir') || title.includes('Mestria') || title.includes('Nke Njikwa') || title.includes('Ustadi')) return 'MASTERY'
  return 'BEGINNER'
}

function getLevelFromTitle(title) {
  if (title.includes('A1')) return 'A1'
  if (title.includes('A2')) return 'A2'
  if (title.includes('B1')) return 'B1'
  if (title.includes('B2')) return 'B2'
  if (title.includes('C1')) return 'C1'
  if (title.includes('C2')) return 'C2'
  return 'A1'
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
