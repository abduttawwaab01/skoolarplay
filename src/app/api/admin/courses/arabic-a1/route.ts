import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const arabicA1CourseData = {
  course: {
    title: "Arabic A1 - Beginner",
    description: "العربية للمبتدئين. تعلم الحروف، التحيات، الأرقام، العائلة، والحياة اليومية.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "التحيات ومقدمات",
      lessons: [
        {
          title: "السلام عليكم",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "كيف تقول 'مرحباً'؟",
              options: ["مرحباً", "مع السلامة", "شكراً", "عفواً"],
              correctAnswer: "0",
              explanation: "مرحباً = أهلاً وسهلاً.",
              language: "ar",
            },
            {
              type: "SPEECH",
              question: "السلام عليكم",
              correctAnswer: "السلام عليكم",
              language: "ar",
              hint: "Say: Peace be upon you",
            },
            {
              type: "FILL_BLANK",
              question: "أكمل: ___ عليكم ورحمة الله",
              correctAnswer: "السلام",
              explanation: "التحية الكاملة: السلام عليكم ورحمة الله وبركاته.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الأرقام والعد",
      lessons: [
        {
          title: "الأرقام 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الرقم ٥؟",
              options: ["خمسة", "ستة", "سبعة", "ثمانية"],
              correctAnswer: "0",
              explanation: "٥ = خمسة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الألوان والمظهر",
      lessons: [
        {
          title: "الألوان الأساسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما لون الشمس؟",
              options: ["أصفر", "أزرق", "أحمر", "أخضر"],
              correctAnswer: "0",
              explanation: "الشمس صفراء.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "العائلة والعلاقات",
      lessons: [
        {
          title: "أفراد العائلة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "من هو والد الأب؟",
              options: ["الجد", "الحفيد", "العم", "الأخ"],
              correctAnswer: "0",
              explanation: "والد الأب هو الجد.",
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
          title: "أطعمة أساسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الخبز بالعربية؟",
              options: ["خبز", "لحم", "سمك", "أرز"],
              correctAnswer: "0",
              explanation: "الخبز = bread.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الروتين اليومي",
      lessons: [
        {
          title: "في الصباح",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تفعل عند الاستيقاظ؟",
              options: ["أستيقظ", "أنام", "آكل العشاء", "أشاهد التلفاز"],
              correctAnswer: "0",
              explanation: "الاستيقاظ = waking up.",
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
              options: ["غرفة النوم", "المطبخ", "الحمام", "غرفة المعيشة"],
              correctAnswer: "0",
              explanation: "غرفة النوم = bedroom.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المضارع الأساسي",
      lessons: [
        {
          title: "كان وأخواتها",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أنا ___ طالباً.",
              options: ["أنا", "كان", "كانت", "يكون"],
              correctAnswer: "0",
              explanation: "أنا = I am.",
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
          title: "أدوات المدرسة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما تكتب به؟",
              options: ["قلم", "كتاب", "ممحاة", "مقص"],
              correctAnswer: "0",
              explanation: "القلم = pen.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الأشكال والأحجام",
      lessons: [
        {
          title: "أشكال هندسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما شكل الكرة؟",
              options: ["دائرة", "مربع", "مثلث", "مستطيل"],
              correctAnswer: "0",
              explanation: "الدائرة = circle.",
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
          title: "فصول السنة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "الصيف هو ___",
              options: ["حار", "بارد", "دافئ", "ممطر"],
              correctAnswer: "0",
              explanation: "الصيف حار.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الملابس والأزياء",
      lessons: [
        {
          title: "قطع الملابس",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما تلبسه في قدميك؟",
              options: ["حذاء", "قميص", "بنطال", "قبعة"],
              correctAnswer: "0",
              explanation: "الحذاء = shoes.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "أجزاء الجسم والصحة",
      lessons: [
        {
          title: "أجزاء الوجه",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "تشم بأنفك. ما هو الأنف؟",
              options: ["أنف", "عين", "أذن", "فم"],
              correctAnswer: "0",
              explanation: "الأنف = nose.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الحيوانات والطبيعة",
      lessons: [
        {
          title: "حيوانات المزرعة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يعطي الحليب؟",
              options: ["بقرة", "دجاجة", "خروف", "حصان"],
              correctAnswer: "0",
              explanation: "البقرة تعطي الحليب.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المواصلات والسفر",
      lessons: [
        {
          title: "وسائل النقل",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يطير في السماء؟",
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
      title: "الرياضة والهوايات",
      lessons: [
        {
          title: "رياضات شعبية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما الرياضة التي تلعب بالقدم؟",
              options: ["كرة القدم", "كرة السلة", "التنس", "السباحة"],
              correctAnswer: "0",
              explanation: "كرة القدم = football/soccer.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التسوق والمال",
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
      title: "أماكن في المدينة",
      lessons: [
        {
          title: "أماكن مهمة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أين تعالج المرضى؟",
              options: ["مستشفى", "مدرسة", "مسجد", "مطعم"],
              correctAnswer: "0",
              explanation: "المستشفى = hospital.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الوقت والتواريخ",
      lessons: [
        {
          title: "قراءة الساعة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "كم ساعة في اليوم؟",
              options: ["٢٤", "١٢", "٣٦", "٤٨"],
              correctAnswer: "0",
              explanation: "يوم واحد = ٢٤ ساعة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التواصل الأساسي",
      lessons: [
        {
          title: "كلمات مهذبة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تقول عند أخذ شيء؟",
              options: ["شكراً", "عفواً", "مرحباً", "مع السلامة"],
              correctAnswer: "0",
              explanation: "شكراً = thank you.",
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
    const { course: courseData, modules: modulesData } = arabicA1CourseData;
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
            xpReward: 10 + Math.floor(Math.random() * 10),
            gemReward: 1 + Math.floor(Math.random() * 3),
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
    console.error("Error creating Arabic A1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
