import { db } from '../src/lib/db'

async function auditCourses() {
  const courses = await db.course.findMany({
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  })

  const dummyCourses = [];

  for (const course of courses) {
    let isDummy = false;
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        for (const q of lesson.questions) {
          if (q.question.match(/Question \d+ for|Q\d+/i)) {
            isDummy = true;
          }
        }
      }
    }
    if (isDummy) {
      dummyCourses.push(course.title);
    }
  }

  console.log("Dummy Courses Detected:");
  console.log(dummyCourses);

  await db.$disconnect()
}

auditCourses().catch(console.error)
