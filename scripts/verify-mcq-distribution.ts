import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMCQDistribution() {
  const mcqs = await prisma.question.findMany({
    where: {
      type: 'MCQ',
      lesson: {
        module: {
          course: {
            title: 'English A1 - Beginner'
          }
        }
      }
    },
    select: {
      id: true,
      question: true,
      options: true,
      correctAnswer: true
    },
    take: 20
  })

  console.log('Sample MCQ questions with shuffled answers:\n')
  
  mcqs.forEach((q, i) => {
    const options = q.options ? JSON.parse(q.options) : []
    console.log(`Q${i + 1}: ${q.question}`)
    options.forEach((opt: string, j: number) => {
      const marker = j === parseInt(q.correctAnswer) ? ' <-- CORRECT' : ''
      console.log(`  ${j}: ${opt}${marker}`)
    })
    console.log('')
  })

  const distribution = await prisma.question.groupBy({
    by: ['correctAnswer'],
    where: {
      type: 'MCQ',
      lesson: {
        module: {
          course: {
            title: 'English A1 - Beginner'
          }
        }
      }
    },
    _count: true
  })

  console.log('\nAnswer Distribution:')
  distribution.forEach(d => {
    console.log(`  Position ${d.correctAnswer}: ${d._count} questions`)
  })

  await prisma.$disconnect()
}

verifyMCQDistribution()
