const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VALID_TYPES = ['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'MATCHING', 'CHECKBOX', 'ORDERING', 'SPEECH'];
const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

async function main() {
  console.log('='.repeat(80));
  console.log('ENGLISH COURSES VERIFICATION REPORT (A1-C2)');
  console.log('='.repeat(80));
  console.log('');

  // Fetch all English courses
  const courses = await prisma.course.findMany({
    where: {
      minimumLevel: { in: ENGLISH_LEVELS },
      isActive: true,
    },
    include: {
      modules: {
        where: { isActive: true },
        include: {
          lessons: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
              },
            },
          },
        },
      },
    },
    orderBy: [{ minimumLevel: 'asc' }, { order: 'asc' }],
  });

  console.log(`Found ${courses.length} English courses (A1-C2)\n`);

  let totalErrors = 0;
  const allErrors = [];
  const typeDistribution = {};

  for (const course of courses) {
    console.log('-'.repeat(80));
    console.log(`COURSE: ${course.title} (${course.minimumLevel})`);
    console.log(`ID: ${course.id}`);
    console.log('-'.repeat(80));

    const courseStats = {
      modules: course.modules.length,
      lessons: 0,
      questions: 0,
      errors: [],
    };

    // Check if course has modules
    if (course.modules.length === 0) {
      const error = `Course "${course.title}" has NO modules`;
      courseStats.errors.push(error);
      allErrors.push({ course: course.title, level: course.minimumLevel, error });
      totalErrors++;
    }

    // Initialize type distribution for this course
    typeDistribution[course.minimumLevel] = typeDistribution[course.minimumLevel] || {};

    for (const module of course.modules) {
      // Check if module has lessons
      if (module.lessons.length === 0) {
        const error = `Module "${module.title}" (${module.id}) has NO lessons`;
        courseStats.errors.push(error);
        allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, moduleId: module.id, error });
        totalErrors++;
      }

      for (const lesson of module.lessons) {
        courseStats.lessons++;

        // Check if lesson has questions
        if (lesson.questions.length === 0) {
          const error = `Lesson "${lesson.title}" (${lesson.id}) has NO questions`;
          courseStats.errors.push(error);
          allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, lessonId: lesson.id, error });
          totalErrors++;
        }

        for (const question of lesson.questions) {
          courseStats.questions++;

          // Track type distribution
          typeDistribution[course.minimumLevel][question.type] = (typeDistribution[course.minimumLevel][question.type] || 0) + 1;

          // Check 1: Valid question type
          if (!VALID_TYPES.includes(question.type)) {
            const error = `Question ${question.id} in lesson "${lesson.title}": Invalid type "${question.type}"`;
            courseStats.errors.push(error);
            allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
            totalErrors++;
            continue;
          }

          // Check 2: MCQ validation
          if (question.type === 'MCQ') {
            if (!question.options) {
              const error = `MCQ Question ${question.id} in lesson "${lesson.title}": Missing options`;
              courseStats.errors.push(error);
              allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
              totalErrors++;
            } else {
              try {
                const options = JSON.parse(question.options);
                if (!Array.isArray(options)) {
                  const error = `MCQ Question ${question.id} in lesson "${lesson.title}": Options is not a JSON array`;
                  courseStats.errors.push(error);
                  allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
                  totalErrors++;
                } else {
                  // Check correctAnswer points to valid index
                  const correctAnswer = parseInt(question.correctAnswer, 10);
                  if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
                    const error = `MCQ Question ${question.id} in lesson "${lesson.title}": correctAnswer "${question.correctAnswer}" is invalid (options length: ${options.length})`;
                    courseStats.errors.push(error);
                    allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
                    totalErrors++;
                  }
                }
              } catch (e) {
                const error = `MCQ Question ${question.id} in lesson "${lesson.title}": Options is not valid JSON - ${e.message}`;
                courseStats.errors.push(error);
                allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
                totalErrors++;
              }
            }
          }

          // Check 3: MATCHING validation
          if (question.type === 'MATCHING') {
            if (question.options) {
              try {
                JSON.parse(question.options);
              } catch (e) {
                const error = `MATCHING Question ${question.id} in lesson "${lesson.title}": Options is not valid JSON - ${e.message}`;
                courseStats.errors.push(error);
                allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
                totalErrors++;
              }
            }
          }

          // Check 4: CHECKBOX validation
          if (question.type === 'CHECKBOX') {
            if (!question.correctAnswer) {
              const error = `CHECKBOX Question ${question.id} in lesson "${lesson.title}": Missing correctAnswer`;
              courseStats.errors.push(error);
              allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
              totalErrors++;
            } else {
              try {
                const correctAnswer = JSON.parse(question.correctAnswer);
                if (!Array.isArray(correctAnswer)) {
                  const error = `CHECKBOX Question ${question.id} in lesson "${lesson.title}": correctAnswer is not a JSON array`;
                  courseStats.errors.push(error);
                  allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
                  totalErrors++;
                }
              } catch (e) {
                const error = `CHECKBOX Question ${question.id} in lesson "${lesson.title}": correctAnswer is not valid JSON - ${e.message}`;
                courseStats.errors.push(error);
                allErrors.push({ course: course.title, level: course.minimumLevel, module: module.title, lesson: lesson.title, questionId: question.id, error });
                totalErrors++;
              }
            }
          }
        }
      }
    }

    // Print course summary
    console.log(`Modules: ${courseStats.modules}`);
    console.log(`Lessons: ${courseStats.lessons}`);
    console.log(`Questions: ${courseStats.questions}`);

    if (courseStats.errors.length > 0) {
      console.log(`\nERRORS (${courseStats.errors.length}):`);
      courseStats.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('\n✓ No errors found');
    }
    console.log('');
  }

  // Print summary
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total courses checked: ${courses.length}`);
  console.log(`Total errors found: ${totalErrors}`);
  console.log('');

  // Question type distribution
  console.log('QUESTION TYPE DISTRIBUTION BY LEVEL:');
  console.log('-'.repeat(80));
  for (const level of ENGLISH_LEVELS) {
    if (typeDistribution[level]) {
      console.log(`\n${level}:`);
      for (const [type, count] of Object.entries(typeDistribution[level])) {
        console.log(`  ${type}: ${count}`);
      }
    }
  }
  console.log('');

  // All errors
  if (allErrors.length > 0) {
    console.log('ALL ERRORS:');
    console.log('-'.repeat(80));
    allErrors.forEach((err, i) => {
      console.log(`\n${i + 1}. [${err.level}] ${err.course}`);
      if (err.module) console.log(`   Module: ${err.module} (${err.moduleId || 'N/A'})`);
      if (err.lesson) console.log(`   Lesson: ${err.lesson} (${err.lessonId || 'N/A'})`);
      if (err.questionId) console.log(`   Question ID: ${err.questionId}`);
      console.log(`   Error: ${err.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(80));
}

main()
  .catch((e) => {
    console.error('Error running verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
