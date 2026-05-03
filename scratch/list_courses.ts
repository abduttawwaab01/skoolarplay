import { db } from '../src/lib/db'

async function listCourses() {
  const courses = await db.course.findMany({
    select: { title: true }
  });
  
  console.log("All Courses in DB:");
  courses.forEach(c => console.log(c.title));
  
  await db.$disconnect();
}

listCourses().catch(console.error);
