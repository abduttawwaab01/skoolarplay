import { db } from '../src/lib/db'

async function checkCounts() {
  const titles = [
    'English A2 - Intermediate Foundations',
    'English B1 - Intermediate Plus',
    'English B2 - Upper Intermediate',
    'English C1 - Advanced',
    'English C2 - Mastery'
  ];

  let totalQuestions = 0;
  for (const title of titles) {
    const course = await db.course.findFirst({
      where: { title },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                _count: {
                  select: { questions: true }
                }
              }
            }
          }
        }
      }
    });
    
    if (course) {
      let qCount = 0;
      course.modules.forEach(m => {
        m.lessons.forEach(l => {
          qCount += l._count.questions;
        })
      });
      console.log(`${title}: ${course.modules.length} Modules, ${course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons, ${qCount} Questions`);
      totalQuestions += qCount;
    }
  }
  
  console.log(`Total Questions Generated: ${totalQuestions}`);
  await db.$disconnect();
}

checkCounts().catch(console.error);
