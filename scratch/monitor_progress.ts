import { db } from '../src/lib/db'

async function monitor() {
  const courses = await db.course.count();
  const modules = await db.module.count();
  const lessons = await db.lesson.count();
  const questions = await db.question.count();
  
  console.log(`Courses: ${courses}`);
  console.log(`Modules: ${modules}`);
  console.log(`Lessons: ${lessons}`);
  console.log(`Questions: ${questions}`);
  
  await db.$disconnect();
}

monitor().catch(console.error);
