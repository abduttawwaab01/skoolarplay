import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function withRetry(fn: () => Promise<any>, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Connection failed, retrying in ${delay}ms... (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

async function verifyB1Course() {
  console.log('Verifying B1 Course...');

  try {
    const b1Course = await withRetry(() => 
      prisma.course.findFirst({
        where: { title: { contains: 'B1' } },
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  questions: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      })
    );

    if (!b1Course) {
      console.log('B1 Course not found');
      return;
    }

    console.log(`\nCourse: ${b1Course.title}`);
    console.log(`Description: ${b1Course.description}`);
    console.log(`Level: ${b1Course.level}`);
    console.log(`Total Modules: ${b1Course.modules.length}`);

    let totalLessons = 0;
    let totalQuestions = 0;
    let questionTypeCounts: Record<string, number> = {};
    let mcqPositions: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let lockedLessons = 0;
    let unlockedLessons = 0;

    for (const module of b1Course.modules) {
      const lessons = module.lessons || [];
      totalLessons += lessons.length;

      for (const lesson of lessons) {
        const questions = lesson.questions || [];
        totalQuestions += questions.length;

        if (lesson.isLocked) lockedLessons++;
        else unlockedLessons++;

        for (const q of questions) {
          questionTypeCounts[q.type] = (questionTypeCounts[q.type] || 0) + 1;

          if (q.type === 'MCQ' && q.options) {
            try {
              const options = JSON.parse(q.options as string);
              const correctIndex = q.correctAnswer ? parseInt(String(q.correctAnswer)) : 0;
              if (mcqPositions[correctIndex] !== undefined) {
                mcqPositions[correctIndex]++;
              }
            } catch (e) {}
          }
        }
      }
    }

    console.log(`\nTotal Lessons: ${totalLessons}`);
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Questions per Module (avg): ${(totalQuestions / b1Course.modules.length).toFixed(1)}`);
    console.log(`Unlocked Lessons: ${unlockedLessons}`);
    console.log(`Locked Lessons: ${lockedLessons}`);

    console.log('\nQuestion Type Distribution:');
    for (const [type, count] of Object.entries(questionTypeCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count} (${((count / totalQuestions) * 100).toFixed(1)}%)`);
    }

    console.log('\nMCQ Correct Answer Position Distribution:');
    const totalMCQ = Object.values(mcqPositions).reduce((sum, c) => sum + c, 0);
    for (const [pos, count] of Object.entries(mcqPositions)) {
      console.log(`  Position ${pos}: ${count} (${((count / totalMCQ) * 100).toFixed(1)}%)`);
    }

    console.log('\nModule Breakdown:');
    for (const module of b1Course.modules) {
      const lessons = module.lessons || [];
      const qCount = lessons.reduce((sum, l) => sum + (l.questions?.length || 0), 0);
      console.log(`  Module ${module.order}: ${module.title} (${lessons.length} lessons, ${qCount} questions)`);
    }

    console.log('\nB1 Course Verification Complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyB1Course();
