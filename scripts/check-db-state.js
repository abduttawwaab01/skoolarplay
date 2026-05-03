const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          modules: true
        }
      },
      modules: {
        include: {
          _count: {
            select: {
              lessons: true
            }
          },
          lessons: {
            include: {
              _count: {
                select: {
                  questions: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      title: 'asc'
    }
  })
  
  console.log('========== DATABASE STATE ==========\n')
  console.log(`Total courses: ${courses.length}\n`)
  
  let totalModules = 0
  let totalLessons = 0
  let totalQuestions = 0
  
  courses.forEach(c => {
    let courseModules = c._count.modules
    totalModules += courseModules
    
    let courseLessons = 0
    let courseQuestions = 0
    
    c.modules.forEach(m => {
      courseLessons += m._count.lessons
      m.lessons.forEach(l => {
        courseQuestions += l._count.questions
      })
    })
    
    totalLessons += courseLessons
    totalQuestions += courseQuestions
    
    console.log(`${c.title}: ${courseModules} modules, ${courseLessons} lessons, ${courseQuestions} questions`)
  })
  
  console.log(`\n========== TOTALS ==========`)
  console.log(`Courses: ${courses.length}`)
  console.log(`Modules: ${totalModules}`)
  console.log(`Lessons: ${totalLessons}`)
  console.log(`Questions: ${totalQuestions}`)
  console.log(`\nTarget: 54 courses × ~2600 questions = ~140,400 questions`)
  console.log(`Progress: ${((totalQuestions / 140400) * 100).toFixed(2)}%`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })