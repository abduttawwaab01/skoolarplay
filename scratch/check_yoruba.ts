import { db } from '../src/lib/db'

async function check() {
  const course = await db.course.findFirst({ 
    where: { title: 'Yoruba A1 - Ìbẹ̀rẹ̀ (Beginner)' },
    include: { _count: { select: { modules: true } } }
  });
  console.log(course);
  await db.$disconnect();
}

check().catch(console.error);
