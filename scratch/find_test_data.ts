import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.findFirst({
    where: { isActive: true },
    include: {
      modules: {
        include: {
          lessons: true
        }
      }
    }
  })

  if (!course) {
    console.log('No courses found')
    return
  }

  console.log('Course ID:', course.id)
  console.log('Module ID:', course.modules[0]?.id)
  console.log('Lesson ID:', course.modules[0]?.lessons[0]?.id)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
