import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function auditCourses() {
  console.log("🔍 Auditing courses...\n");

  const courses = await db.course.findMany({
    where: { isActive: true },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  console.log(`📊 Found ${courses.length} active courses\n`);

  for (const course of courses) {
    let totalLessons = 0;
    let totalQuestions = 0;
    let emptyModules = 0;
    let emptyLessons = 0;
    let untitledModules = 0;
    let untitledLessons = 0;
    let lessonsWithTooManyQuestions: any[] = [];

    console.log(`\n${"=".repeat(80)}`);
    console.log(`📚 COURSE: ${course.title}`);
    console.log(`   Difficulty: ${course.difficulty} | Level: ${course.minimumLevel}`);
    console.log(`   Modules: ${course.modules.length}`);
    console.log(`${"=".repeat(80)}`);

    for (const mod of course.modules) {
      const moduleLessons = mod.lessons.length;
      const moduleQuestions = mod.lessons.reduce(
        (sum, lesson) => sum + lesson.questions.length,
        0
      );

      totalLessons += moduleLessons;
      totalQuestions += moduleQuestions;

      if (moduleLessons === 0) emptyModules++;
      if (!mod.title || mod.title.trim() === "") untitledModules++;

      const title = mod.title || "(UNTITLED)";
      console.log(`\n  📁 Module ${mod.order}: ${title}`);
      console.log(`     Lessons: ${moduleLessons} | Questions: ${moduleQuestions}`);

      if (!mod.title || mod.title.trim() === "") {
        console.log(`     ⚠️  WARNING: Module has no title!`);
      }

      if (moduleLessons === 0) {
        console.log(`     ⚠️  WARNING: Module has NO lessons!`);
      }

      for (const lesson of mod.lessons) {
        const qCount = lesson.questions.length;
        if (qCount === 0) emptyLessons++;
        if (!lesson.title || lesson.title.trim() === "") untitledLessons++;

        const lessonTitle = lesson.title || "(UNTITLED)";
        const warn = qCount > 10 ? " ⚠️ TOO MANY QUESTIONS" : qCount === 0 ? " ⚠️ NO QUESTIONS" : "";
        console.log(`    - Lesson ${lesson.order}: ${lessonTitle} [${qCount} questions]${warn}`);

        if (!lesson.title || lesson.title.trim() === "") {
          console.log(`       ⚠️  WARNING: Lesson has no title!`);
        }

        if (qCount > 10) {
          lessonsWithTooManyQuestions.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title || "(untitled)",
            questionCount: qCount,
          });
        }

        if (qCount > 0) {
          const questionTypes: Record<string, number> = {};
          lesson.questions.forEach((q) => {
            questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
          });
          const typesStr = Object.entries(questionTypes)
            .map(([type, count]) => `${type}:${count}`)
            .join(", ");
          console.log(`       Types: ${typesStr}`);

          // Show first 3 questions for context
          const showCount = Math.min(3, lesson.questions.length);
          for (let i = 0; i < showCount; i++) {
            const q = lesson.questions[i];
            const qPreview = q.question.length > 60 ? q.question.substring(0, 60) + "..." : q.question;
            console.log(`       Q${i + 1} [${q.type}]: ${qPreview}`);
          }
          if (lesson.questions.length > 3) {
            console.log(`       ... and ${lesson.questions.length - 3} more questions`);
          }
        }
      }
    }

    console.log(`\n  📊 SUMMARY for ${course.title}:`);
    console.log(`     Total Lessons: ${totalLessons}`);
    console.log(`     Total Questions: ${totalQuestions}`);
    console.log(`     Empty Modules: ${emptyModules}`);
    console.log(`     Empty Lessons: ${emptyLessons}`);
    console.log(`     Untitled Modules: ${untitledModules}`);
    console.log(`     Untitled Lessons: ${untitledLessons}`);
    console.log(`     Lessons with >10 questions: ${lessonsWithTooManyQuestions.length}`);

    if (lessonsWithTooManyQuestions.length > 0) {
      console.log(`     🚨 OVERLOADED LESSONS:`);
      lessonsWithTooManyQuestions.forEach((l) => {
        console.log(`        - "${l.lessonTitle}": ${l.questionCount} questions`);
      });
    }

    console.log("");
  }

  // Overall summary
  console.log(`\n${"=".repeat(80)}`);
  console.log("📈 OVERALL SUMMARY");
  console.log(`${"=".repeat(80)}`);
  console.log(`Total Courses: ${courses.length}`);
  console.log(
    `Total Lessons: ${courses.reduce((s, c) => s + c.modules.reduce((ss, m) => ss + m.lessons.length, 0), 0)}`
  );
  console.log(
    `Total Questions: ${courses.reduce(
      (s, c) =>
        s +
        c.modules.reduce(
          (ss, m) =>
            ss + m.lessons.reduce((sss, l) => sss + l.questions.length, 0),
          0
        ),
      0
    )}`
  );
}

auditCourses()
  .catch((e) => {
    console.error("❌ Audit failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
