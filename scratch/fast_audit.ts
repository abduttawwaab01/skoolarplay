import { db } from '../src/lib/db'

async function fastAudit() {
  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
      _count: {
        select: { modules: true }
      }
    }
  });

  console.log(`Total Courses in DB: ${courses.length}`);
  
  for (const course of courses) {
    const moduleCount = course._count.modules;
    const lessonCount = await db.lesson.count({
      where: { module: { courseId: course.id } }
    });
    const questionCount = await db.question.count({
      where: { lesson: { module: { courseId: course.id } } }
    });
    
    const sampleQuestion = await db.question.findFirst({
      where: { lesson: { module: { courseId: course.id } } },
      select: { question: true }
    });

    console.log(`- ${course.title.padEnd(50)}: ${moduleCount} Modules, ${lessonCount} Lessons, ${questionCount} Questions. Sample: "${sampleQuestion?.question.substring(0, 50)}..."`);
    
    if (moduleCount < 20 || lessonCount < 200 || questionCount < 2400) {
      if (!course.title.includes('English for Learners') && !course.title.includes('French')) {
         console.warn(`  [WARNING] ${course.title} has low density!`);
      }
    }
  }

  await db.$disconnect();
}

fastAudit().catch(console.error);
