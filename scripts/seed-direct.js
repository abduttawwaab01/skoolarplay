// Direct seeding script for all new courses - no API needed
// This seeds: German A2-C2, Arabic A1-C2, Portuguese A1-C2, Igbo A1-C2, Swahili A1-C2

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Course data inlined (simplified for seeding)
const coursesData = [
  // German A2-C2
  { title: 'German A2 - Elementary', desc: 'Deutsch auf Elementarniveau.', level: 'A2', diff: 'ELEMENTARY' },
  { title: 'German B1 - Intermediate', desc: 'Deutsch auf B1-Niveau.', level: 'B1', diff: 'INTERMEDIATE' },
  { title: 'German B2 - Upper Intermediate', desc: 'Deutsch auf B2-Niveau.', level: 'B2', diff: 'UPPER_INTERMEDIATE' },
  { title: 'German C1 - Advanced', desc: 'Deutsch auf C1-Niveau.', level: 'C1', diff: 'ADVANCED' },
  { title: 'German C2 - Mastery', desc: 'Deutsch auf C2-Niveau.', level: 'C2', diff: 'MASTERY' },
  
  // Arabic A1-C2
  { title: 'Arabic A1 - Beginner', desc: 'العربية للمبتدئين.', level: 'A1', diff: 'BEGINNER' },
  { title: 'Arabic A2 - Elementary', desc: 'العربية للمستوى الابتدائي.', level: 'A2', diff: 'ELEMENTARY' },
  { title: 'Arabic B1 - Intermediate', desc: 'العربية للمستوى المتوسط.', level: 'B1', diff: 'INTERMEDIATE' },
  { title: 'Arabic B2 - Upper Intermediate', desc: 'العربية للمستوى المتقدم العلوي.', level: 'B2', diff: 'UPPER_INTERMEDIATE' },
  { title: 'Arabic C1 - Advanced', desc: 'العربية للمستوى المتقدم.', level: 'C1', diff: 'ADVANCED' },
  { title: 'Arabic C2 - Mastery', desc: 'العربية للمستوى الإتقان.', level: 'C2', diff: 'MASTERY' },
  
  // Portuguese A1-C2
  { title: 'Portuguese A1 - Beginner', desc: 'Português para iniciantes.', level: 'A1', diff: 'BEGINNER' },
  { title: 'Portuguese A2 - Elementary', desc: 'Português para nível elementar.', level: 'A2', diff: 'ELEMENTARY' },
  { title: 'Portuguese B1 - Intermediate', desc: 'Português para nível intermediário.', level: 'B1', diff: 'INTERMEDIATE' },
  { title: 'Portuguese B2 - Upper Intermediate', desc: 'Português para nível intermediário superior.', level: 'B2', diff: 'UPPER_INTERMEDIATE' },
  { title: 'Portuguese C1 - Advanced', desc: 'Português para nível avançado.', level: 'C1', diff: 'ADVANCED' },
  { title: 'Portuguese C2 - Mastery', desc: 'Português para nível de mestria.', level: 'C2', diff: 'MASTERY' },
  
  // Igbo A1-C2
  { title: 'Igbo A1 - Beginner', desc: 'Igbo maka ndị mbido.', level: 'A1', diff: 'BEGINNER' },
  { title: 'Igbo A2 - Elementary', desc: 'Igbo maka ọkwa elementrị.', level: 'A2', diff: 'ELEMENTARY' },
  { title: 'Igbo B1 - Intermediate', desc: 'Igbo maka ọkwa etiti.', level: 'B1', diff: 'INTERMEDIATE' },
  { title: 'Igbo B2 - Upper Intermediate', desc: 'Igbo maka ọkwa etiti elu.', level: 'B2', diff: 'UPPER_INTERMEDIATE' },
  { title: 'Igbo C1 - Advanced', desc: 'Igbo maka ọkwa elu.', level: 'C1', diff: 'ADVANCED' },
  { title: 'Igbo C2 - Mastery', desc: 'Igbo maka ọkwa njikwa.', level: 'C2', diff: 'MASTERY' },
  
  // Swahili A1-C2
  { title: 'Swahili A1 - Beginner', desc: 'Kiswahili kwa wanaoza.', level: 'A1', diff: 'BEGINNER' },
  { title: 'Swahili A2 - Elementary', desc: 'Kiswahili kwa kiwango cha msingi.', level: 'A2', diff: 'ELEMENTARY' },
  { title: 'Swahili B1 - Intermediate', desc: 'Kiswahili kwa kiwango cha kati.', level: 'B1', diff: 'INTERMEDIATE' },
  { title: 'Swahili B2 - Upper Intermediate', desc: 'Kiswahili kwa kiwango cha kati cha juu.', level: 'B2', diff: 'UPPER_INTERMEDIATE' },
  { title: 'Swahili C1 - Advanced', desc: 'Kiswahili kwa kiwango cha juu.', level: 'C1', diff: 'ADVANCED' },
  { title: 'Swahili C2 - Mastery', desc: 'Kiswahili kwa kiwango cha ustadi.', level: 'C2', diff: 'MASTERY' },
]

async function main() {
  console.log('Starting to seed courses to Neon database...')
  console.log(`Total courses to seed: ${coursesData.length}\n`)
  
  const results = []
  
  for (const courseData of coursesData) {
    console.log(`Processing: ${courseData.title}...`)
    
    try {
      // Check if course already exists
      let course = await prisma.course.findFirst({
        where: { title: courseData.title }
      })
      
      if (course) {
        console.log(`  Course already exists, skipping...`)
        results.push({ title: courseData.title, success: true, status: 'exists' })
        continue
      }
      
      // Create course
      course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.desc,
          difficulty: courseData.diff,
          minimumLevel: courseData.level,
          isActive: true,
          category: { connect: { name: 'Languages' } }
        }
      })
      
      // Create 20 modules per course
      const modules = []
      for (let m = 0; m < 20; m++) {
        const newModule = await prisma.module.create({
          data: {
            title: `Module ${m + 1}`,
            courseId: course.id,
            order: m,
            isActive: true
          }
        })
        modules.push(newModule)
        
        // Create 10 lessons per module
        for (let l = 0; l < 10; l++) {
          const newLesson = await prisma.lesson.create({
            data: {
              title: `Lesson ${l + 1}`,
              moduleId: newModule.id,
              type: 'QUIZ',
              order: l,
              xpReward: 10 + Math.floor(Math.random() * 40),
              gemReward: 1 + Math.floor(Math.random() * 5),
              isActive: true
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
              lessonId: newLesson.id,
              type,
              question,
              options,
              correctAnswer,
              explanation,
              hint: 'Think about the lesson content',
              language: courseData.title.includes('German') ? 'de' :
                        courseData.title.includes('Arabic') ? 'ar' :
                        courseData.title.includes('Portuguese') ? 'pt' :
                        courseData.title.includes('Igbo') ? 'ig' :
                        courseData.title.includes('Swahili') ? 'sw' : 'en',
              order: q,
              points: 10,
              isActive: true
            })
          }
          
          await prisma.question.createMany({ data: questionsToCreate })
        }
      }
      
      console.log(`  ✅ Created: ${course.title} with 20 modules`)
      results.push({ title: courseData.title, success: true, status: 'created' })
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`)
      results.push({ title: courseData.title, success: false, error: error.message })
    }
  }
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log('\n========== SEEDING SUMMARY ==========')
  console.log(`Total: ${coursesData.length}`)
  console.log(`Successful: ${successful}`)
  console.log(`Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\nFailed courses:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.title}: ${r.error}`)
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
