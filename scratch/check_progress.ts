import { db } from '../src/lib/db'

async function checkCounts() {
  const courses = [
    'English A2 - Intermediate Foundations',
    'English B1 - Intermediate Plus',
    'English B2 - Upper Intermediate',
    'English C1 - Advanced',
    'English C2 - Mastery'
  ];

  for (const title of courses) {
    const course = await db.course.findFirst({
      where: { title },
      include: {
        _count: {
          select: { modules: true }
        }
      }
    });
    
    if (course) {
      console.log(`${title}: ${course._count.modules} modules`);
    }
  }
  
  await db.$disconnect();
}

checkCounts().catch(console.error);
