import { db } from '../src/lib/db'

async function check() {
  const course = await db.course.findFirst({ 
    where: { title: 'English for Learners A1' },
    include: { _count: { select: { modules: true } } }
  });
  console.log(course);
  await db.$disconnect();
}

check().catch(console.error);
