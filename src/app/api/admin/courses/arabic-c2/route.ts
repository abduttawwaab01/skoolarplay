import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const arabicC2CourseData = {
  course: {
    title: "Arabic C2 - Mastery",
    description: "العربية للمستوى الإتقان. قرب الكفاءة اللغوية الأصلية، فهم جميع النصوص تقريباً، وتعبير دقيق ومتمايز.",
    difficulty: "MASTERY",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "الدقة المعجمية",
      lessons: [
        {
          title: "المفردات النادرة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'غامض'؟",
              options: ["غير معروف/غامض", "مشرق", "صاخب", "سريع"],
              correctAnswer: "0",
              explanation: "غامض = غير معروف أو غامض.",
              language: "ar",
            },
            {
              type: "FILL_BLANK",
              question: "أكمل: البحث ___ أتى بنتائج جديدة.",
              correctAnswer: "الغامض",
              explanation: "البحث الغامض = بحث قليل المعرفة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المصطلحات الأثرية والأدبية",
      lessons: [
        {
          title: "لغة شكسبير",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'أنت' بالإنجليزية القديمة؟",
              options: ["أنت (قديماً)", "أنا", "هو", "هم"],
              correctAnswer: "0",
              explanation: "Thou = أنت (أثري).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التخصص المهني",
      lessons: [
        {
          title: "الخطاب الخبير",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي لغة تخصصية؟",
              options: ["لغة خاصة بمجال مهني", "لغة عامية", "عامية", "لهجة"],
              correctAnswer: "0",
              explanation: "اللغة التخصصية = مصطلحات لمجال معين.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "اللهجات الإقليمية والعامية",
      lessons: [
        {
          title: "التنوعات الإقليمية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'موين'؟",
              options: ["تحية في شمال ألمانيا", "شكراً", "وداعاً", "عفواً"],
              correctAnswer: "0",
              explanation: "موين = تحية نموذجية في شمال ألمانيا.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "إتقان الاستعارة",
      lessons: [
        {
          title: "الاستعارات المعقدة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الاستعارة الممتدة؟",
              options: ["استعارة عبر فقرات", "مقارنة كلمة", "مبالغة", "سخرية"],
              correctAnswer: "0",
              explanation: "الاستعارة الممتدة = مقارنة استعارية عبر نص.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المناظرة الرفيعة",
      lessons: [
        {
          title: "البلاغة المتقدمة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الإيثوس؟",
              options: ["مصداقية المتحدث", "مناشدة عاطفية", "إثبات منطقي", "فكاهة"],
              correctAnswer: "0",
              explanation: "الإيثوس = الإقناع عبر الشخصية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الدلالات الثقافية الدقيقة",
      lessons: [
        {
          title: "السياق الثقافي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو السياق الثقافي؟",
              options: ["معلومات خلفية", "النحو", "اختيار الكلمات", "النطق"],
              correctAnswer: "0",
              explanation: "السياق الثقافي = معانٍ غير منطوقة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "طلاقة التعابير الاصطلاحية",
      lessons: [
        {
          title: "التعابير الاصطلاحية المتقدمة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'الدب يرقص'؟",
              options: ["يوجد حراك/حفلة", "دب يرقص", "هدوء", "برودة"],
              correctAnswer: "0",
              explanation: "الدب يرقص = يوجد حراك وجو جيد.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الكمال النحوي",
      lessons: [
        {
          title: "التركيب المتقدم",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي جملة مصدرية؟",
              options: ["لكي تساعد", "أساعد", "ساعدني", "مساعدة"],
              correctAnswer: "0",
              explanation: "الجملة المصدرية = لكي/لكي + مصدر.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التعبير الإبداعي",
      lessons: [
        {
          title: "الإبداع الأدبي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو أسلوب بياني؟",
              options: ["عنصر لغوي واعٍ", "خطأ", "صدفة", "قاعدة نحوية"],
              correctAnswer: "0",
              explanation: "الأسلوب البياني = عنصر لغوي مستخدم بوعي.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الخطاب الأكاديمي",
      lessons: [
        {
          title: "الكتابة العلمية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو ملخص؟",
              options: ["تلخيص", "مقدمة", "متن", "خاتمة"],
              correctAnswer: "0",
              explanation: "الملخص = ملخص قصير لورقة علمية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التواصل المهني",
      lessons: [
        {
          title: "التواصل التنفيذي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو عرض المصعد؟",
              options: ["تقديم قصير", "عرض طويل", "بريد إلكتروني", "تقرير"],
              correctAnswer: "0",
              explanation: "عرض المصعد = تقديم قصير ومقنع.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التحليل النقدي",
      lessons: [
        {
          title: "الأطر التحليلية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو تحليل SWOT؟",
              options: ["نقاط القوة/الضعف/الفرص/التهديدات", "تحليل مالي", "استراتيجية تسويق", "إنتاج"],
              correctAnswer: "0",
              explanation: "SWOT = نقاط القوة والضعف والفرص والتهديدات.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الكفاءة بين الثقافات",
      lessons: [
        {
          title: "الذكاء الثقافي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الذكاء الثقافي؟",
              options: ["القدرة على التنقل بين الثقافات", "معدل الذكاء", "إتقان اللغة", "خبرة السفر"],
              correctAnswer: "0",
              explanation: "الذكاء الثقافي = التكيف مع ثقافات مختلفة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الترجمة المتخصصة",
      lessons: [
        {
          title: "نظرية الترجمة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو التكافؤ في الترجمة؟",
              options: ["نفس التأثير في النص الهدف", "ترجمة حرفية", "ترجمة حرة", "حذف"],
              correctAnswer: "0",
              explanation: "التكافؤ = نفس التأثير على القارئ.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "النظرية اللسانية",
      lessons: [
        {
          title: "النحو التوليدي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي القواعد الكونية؟",
              options: ["بنية لغوية فطرية", "قواعد مكتسبة", "قواعد مدرسية", "لهجة"],
              correctAnswer: "0",
              explanation: "القواعد الكونية = قدرة لغوية فطرية (تشومسكي).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "تحليل الخطاب",
      lessons: [
        {
          title: "التحليل النقدي للخطاب",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا يدرس تحليل الخطاب؟",
              options: ["اللغة في سياق اجتماعي", "النحو", "اختيار الكلمات", "النطق"],
              correctAnswer: "0",
              explanation: "تحليل الخطاب = اللغة كممارسة اجتماعية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "البلاغة المتميزة",
      lessons: [
        {
          title: "الإقناع المتميز",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو لوغوس؟",
              options: ["مناشدة منطقية", "مناشدة عاطفية", "مصداقية", "فكاهة"],
              correctAnswer: "0",
              explanation: "لوغوس = الإقناع عبر المنطق/الحجج.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التوليف الثقافي",
      lessons: [
        {
          title: "التعددية الثقافية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الهجين الثقافي؟",
              options: ["مزيج من الثقافات", "ثقافة نقية", "عزلة", "حرب"],
              correctAnswer: "0",
              explanation: "الهجين الثقافي = اندماج ثقافات مختلفة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "إظهار الإتقان",
      lessons: [
        {
          title: "الطلاقة شبه الأصلية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يميز مستوى C2؟",
              options: ["فهم جميع النصوص تقريباً", "تواصل أساسي", "جمل بسيطة", "أخطاء كثيرة"],
              correctAnswer: "0",
              explanation: "C2 = كفاءة قريبة من اللغة الأم.",
              language: "ar",
            },
          ],
        },
      ],
    },
  ],
}

export async function POST(req: NextRequest) {
  try {
    await getAdminUser(req);
    const { course: courseData, modules: modulesData } = arabicC2CourseData;
    let course = await db.course.findFirst({ where: { title: courseData.title } });
    if (course) {
      await db.module.deleteMany({ where: { courseId: course.id } });
      course = await db.course.update({
        where: { id: course.id },
        data: {
          description: courseData.description,
          difficulty: courseData.difficulty as any,
          minimumLevel: courseData.minimumLevel,
          isActive: true,
        }
      });
    } else {
      course = await db.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty as any,
          minimumLevel: courseData.minimumLevel,
          isActive: true,
          category: { connect: { name: "Languages" } }
        }
      });
    }
    for (let modIdx = 0; modIdx < modulesData.length; modIdx++) {
      const moduleData = modulesData[modIdx];
      const newModule = await db.module.create({
        data: { title: moduleData.title, courseId: course.id, order: modIdx, isActive: true }
      });
      for (let lessIdx = 0; lessIdx < moduleData.lessons.length; lessIdx++) {
        const lessonData = moduleData.lessons[lessIdx];
        const newLesson = await db.lesson.create({
          data: {
            title: lessonData.title,
            moduleId: newModule.id,
            type: lessonData.type as any,
            order: lessIdx,
            xpReward: 40 + Math.floor(Math.random() * 30),
            gemReward: 5 + Math.floor(Math.random() * 8),
            isActive: true,
          }
        });
        const questionsToCreate = lessonData.questions.map((q: any, idx: number) => ({
          lessonId: newLesson.id,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          hint: q.hint || null,
          language: q.language || "ar",
          order: idx,
          points: q.points || 25,
          isActive: true,
        }));
        await db.question.createMany({ data: questionsToCreate });
      }
    }
    return NextResponse.json({
      success: true,
      message: `Course "${courseData.title}" created/updated with ${modulesData.length} modules`,
      courseId: course.id
    });
  } catch (error: any) {
    console.error("Error creating Arabic C2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
