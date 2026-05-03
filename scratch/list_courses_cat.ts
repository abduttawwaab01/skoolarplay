import { db } from '../src/lib/db'

async function list() {
  const courses = await db.course.findMany({
    select: { title: true, category: { select: { name: true } } }
  });
  console.log(JSON.stringify(courses, null, 2));
  await db.$disconnect();
}

list().catch(console.error);
