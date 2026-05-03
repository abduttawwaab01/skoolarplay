// Direct seeding script - fixed version
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed courses to Neon database...\n')
  
  // Get or create Languages category
  let languagesCategory = await prisma.category.findFirst({
    where: { name: 'Languages' }
  })
  
  if (!languagesCategory) {
    console.log('Creating "Languages" category...')
    languagesCategory = await prisma.category.create({
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
  
  console.log(`Using category: ${languagesCategory.name} (ID: ${languagesCategory.id})\n`)
  
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
          category: {
            connect: { id: languagesCategory.id }
          }
        }
      })
      
      console.log(`  ✅ Created course: ${course.title}`)
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
