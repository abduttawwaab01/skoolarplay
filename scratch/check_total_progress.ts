import { db } from '../src/lib/db'

async function checkTotalProgress() {
  const courses = await db.course.findMany({
    select: { title: true, _count: { select: { modules: true } } }
  });
  
  let completed = 0;
  let totalModules = 0;
  
  courses.forEach(c => {
    totalModules += c._count.modules;
    if (c._count.modules >= 20) {
      completed++;
    }
    console.log(`${c.title}: ${c._count.modules} modules`);
  });
  
  console.log(`\nProgress: ${completed}/${courses.length} courses completed (>= 20 modules).`);
  console.log(`Total modules in DB: ${totalModules}`);
  
  await db.$disconnect();
}

checkTotalProgress().catch(console.error);
