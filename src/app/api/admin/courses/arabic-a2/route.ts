import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const arabicA2CourseData = {
  course: {
    title: "Arabic A2 - Elementary",
    description: "العربية للمستوى الابتدائي. تعلم الماضي، المستقبل، المقارنات، والتواصل اليومي.",
    difficulty: "ELEMENTARY",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "الماضي البسيط",
      lessons: [
        {
          title: "أفعال منتظمة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو ماضي 'كتب'؟",
              options: ["كتب", "يكتب", "سيكتب", "مكتوب"],
              correctAnswer: "0",
              explanation: "كتب = كتب (فعل ماضي).",
              language: "ar",
            },
            {
              type: "FILL_BLANK",
              question: "أكمل: أنا ___ (سافر) إلى المدينة أمس.",
              correctAnswer: "سافرت",
              explanation: "سافر → سافرت (ماضي).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التعابير المستقبلية",
      lessons: [
        {
          title: "سوف + المضارع",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "كيف تقول 'سأذهب'؟",
              options: ["سأذهب", "ذهبت", "أذهب", "سأكون ذهبت"],
              correctAnswer: "0",
              explanation: "سوف + مضارع = مستقبل.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "إعطاء الاتجاهات",
      lessons: [
        {
          title: "حرف الجر مكان",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أين المحل؟",
              options: ["إلى المحل", "مع المحل", "من المحل", "في المحل"],
              correctAnswer: "0",
              explanation: "إلى = Richtung (direction).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التسوق والملابس",
      lessons: [
        {
          title: "قطع الملابس",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما تلبسه في الجزء العلوي؟",
              options: ["قميص", "بنطال", "حذاء", "قبعة"],
              correctAnswer: "0",
              explanation: "القميص = shirt.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الصحة والجسم",
      lessons: [
        {
          title: "أمراض شائعة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يسبب الحرارة؟",
              options: ["الإنفلونزا", "كسر عظم", "جرح", "كدمة"],
              correctAnswer: "0",
              explanation: "الإنفلونزا تسبب الحرارة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "السفر والنقل",
      lessons: [
        {
          title: "وسائل النقل",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "بم تطير؟",
              options: ["طائرة", "سيارة", "قطار", "دراجة"],
              correctAnswer: "0",
              explanation: "الطائرة = airplane.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المقارنات",
      lessons: [
        {
          title: "أفعل من",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو صحيح؟",
              options: ["أكبر من", "أكثر كبير من", "كبير من", "أكبر مثل"],
              correctAnswer: "0",
              explanation: "أكبر = مقارنة (أفعل).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المضارع المستمر",
      lessons: [
        {
          title: "أنا أفعل الآن",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'أنا آكل الآن'؟",
              options: ["أنا آكل الآن", "أنا آكل", "أكلت", "لقد أكلت"],
              correctAnswer: "0",
              explanation: "مع 'الآن' = مضارع مستمر.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المنزل والأثاث",
      lessons: [
        {
          title: "غرف المنزل",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أين تنام؟",
              options: ["غرفة النوم", "المطبخ", "غرفة المعيشة", "الحمام"],
              correctAnswer: "0",
              explanation: "غرفة النوم = bedroom.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الطقس والفصول",
      lessons: [
        {
          title: "تقارير الطقس",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'مشمس'؟",
              options: ["مشمس", "ممطر", "ثلجي", "عاصف"],
              correctAnswer: "0",
              explanation: "مشمس = sunny.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "العمل والمهن",
      lessons: [
        {
          title: "مسميات وظيفية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "من يعلم الطلاب؟",
              options: ["معلم", "طبيب", "سائق", "طباخ"],
              correctAnswer: "0",
              explanation: "المعلم = teacher.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الطعام والشراب",
      lessons: [
        {
          title: "أطعمة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'خبز'؟",
              options: ["خبز", "أرز", "لحم", "سمك"],
              correctAnswer: "0",
              explanation: "الخبز = bread.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المدرسة والتعليم",
      lessons: [
        {
          title: "مواد دراسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'رياضيات'؟",
              options: ["رياضيات", "تاريخ", "فن", "موسيقى"],
              correctAnswer: "0",
              explanation: "الرياضيات = math.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "وقت الفراغ والهوايات",
      lessons: [
        {
          title: "رياضات",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما تلعب بالكرة والسلة؟",
              options: ["كرة السلة", "كرة القدم", "تنس", "سباحة"],
              correctAnswer: "0",
              explanation: "كرة السلة = basketball.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الإعلام والترفيه",
      lessons: [
        {
          title: "وسائل الإعلام",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أين تقرأ الأخبار؟",
              options: ["جريدة", "كتاب طبخ", "رواية", "قاموس"],
              correctAnswer: "0",
              explanation: "الجريدة = newspaper.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "البيئة والطبيعة",
      lessons: [
        {
          title: "حماية الطبيعة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يسبب الاحتباس الحراري؟",
              options: ["غازات الدفيئة", "أشجار", "مطر", "رياح"],
              correctAnswer: "0",
              explanation: "غازات الدفيئة تحتفظ بالحرارة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الناس والعلاقات",
      lessons: [
        {
          title: "صفات الشخصية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'لطيف'؟",
              options: ["لطيف", "غاضب", "طويل", "قصير"],
              correctAnswer: "0",
              explanation: "لطيف = kind.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التسوق والخدمات",
      lessons: [
        {
          title: "أنواع المتاجر",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أين تشتري الطعام؟",
              options: ["سوبر ماركت", "متجر ملابس", "مكتبة", "صيدلية"],
              correctAnswer: "0",
              explanation: "السوبر ماركت = supermarket.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الروتين والعادات",
      lessons: [
        {
          title: "ظرف التكرار",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'دائماً'؟",
              options: ["دائماً", "أحياناً", "أبداً", "نادراً"],
              correctAnswer: "0",
              explanation: "دائماً = always.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الثقافة والتقاليد",
      lessons: [
        {
          title: "عطل رسمية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "متى عيد الميلاد؟",
              options: ["٢٥ ديسمبر", "٣١ أكتوبر", "١ يناير", "٥ مايو"],
              correctAnswer: "0",
              explanation: "عيد الميلاد = ٢٥ ديسمبر.",
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
    const { course: courseData, modules: modulesData } = arabicA2CourseData;
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
            xpReward: 15 + Math.floor(Math.random() * 10),
            gemReward: 2 + Math.floor(Math.random() * 3),
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
          points: q.points || 10,
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
    console.error("Error creating Arabic A2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
