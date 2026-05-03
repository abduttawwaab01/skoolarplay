import { db } from '../src/lib/db'

async function check() {
  const course = await db.course.findFirst({ 
    where: { title: { contains: 'Hausa B2' } }
  });
  console.log(course);
  await db.$disconnect();
}

check().catch(console.error);
