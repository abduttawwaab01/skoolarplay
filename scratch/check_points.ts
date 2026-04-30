import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const points = await prisma.question.groupBy({
    by: ['points'],
    _count: {
      id: true
    }
  })
  console.log('Points distribution:', JSON.stringify(points, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
