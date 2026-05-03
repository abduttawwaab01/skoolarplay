import { db } from '../src/lib/db'

async function check() {
  const q = await db.question.findFirst({ 
    where: { lesson: { module: { course: { title: 'Yoruba A1 - Ìbẹ̀rẹ̀ (Beginner)' } } } } 
  });
  console.log(q);
  await db.$disconnect();
}

check().catch(console.error);
