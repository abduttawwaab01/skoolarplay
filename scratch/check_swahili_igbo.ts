import { db } from '../src/lib/db'

async function check() {
  const swahili = await db.course.findMany({ where: { title: { contains: 'Swahili' } }, select: { title: true } });
  const igbo = await db.course.findMany({ where: { title: { contains: 'Igbo' } }, select: { title: true } });
  
  console.log('Swahili:', swahili);
  console.log('Igbo:', igbo);
  
  await db.$disconnect();
}

check().catch(console.error);
