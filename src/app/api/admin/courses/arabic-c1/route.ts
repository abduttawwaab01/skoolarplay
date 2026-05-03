import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const arabicC1CourseData = {
  course: {
    title: "Arabic C1 - Advanced",
    description: "العربية للمستوى المتقدم. فهم النصوص المعقدة، التعبير الطلق والدقيق، وإتقان القواعد المعقدة.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "دقّة المعنى",
      lessons: [
        {
          title: "الفروق الدقيقة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما الفرق بين 'أنهى' و'أنهى'؟",
              options: ["لا فرق", "كلمة أكثر رسمية", "كلمة جمع", "كلمة ماضي"],
              correctAnswer: "0",
              explanation: "أنهى = أنهى (transitive); أنهى = أنهى (intransitive) - فروق دقيقة.",
              language: "ar",
            },
            {
              type: "FILL_BLANK",
              question: "أكمل: كلمة '___' لها دلالة إيجابية.",
              correctAnswer: "ناجح",
              explanation: "ناجح = successful (دلالة إيجابية).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الأدوات البلاغية",
      lessons: [
        {
          title: "الاستعارة والتشبيه",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو تشبيه بـ 'مثل'؟",
              options: ["تشبيه", "استعارة", "تجسيد", "مبالغة"],
              correctAnswer: "0",
              explanation: "التشبيه = مقارنة بـ 'مثل' أو 'كأن'.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "أسلوب الكتابة الأكاديمي",
      lessons: [
        {
          title: "التسجيل الأكاديمي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو رسمي؟",
              options: ["يتم البحث", "بحثت", "بنبحث", "هذا رهيب"],
              correctAnswer: "0",
              explanation: "المبني للمجهول رسمي أكاديمياً.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الرسمي وغير الرسمي",
      lessons: [
        {
          title: "استمرار التسجيل",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الأكثر رسمية؟",
              options: ["حضرات السيدات والسادة", "مرحباً يا جماعة", "أهلاً", "صباح الخير"],
              correctAnswer: "0",
              explanation: "حضرات السيدات والسادة = أرفع تحية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "هياكل الجمل المعقدة",
      lessons: [
        {
          title: "أنماط التبعية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو جملة فرعية؟",
              options: ["جملة لأن", "الجملة الرئيسية", "جملة بدون فعل", "سؤال"],
              correctAnswer: "0",
              explanation: "الجمل الفرعية تبدأ بحروف ربط (لأن، أن، إذا...).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الفلسفة والأخلاق",
      lessons: [
        {
          title: "الأطر الأخلاقية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الديونطيقا؟",
              options: ["أخلاق الواجب", "أخلاق السعادة", "أخلاق الفضيلة", "أخلاق المسؤولية"],
              correctAnswer: "0",
              explanation: "الديونطيقا = أخلاق الواجب (كانط).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "تحليل الأدب",
      lessons: [
        {
          title: "النقد الأدبي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو رمز؟",
              options: ["تعبير صوري", "معنى حرفي", "مبالغة", "سخرية"],
              correctAnswer: "0",
              explanation: "الرمز = تعبير صوري لمفاهيم مجردة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "روابط الخطاب المتقدمة",
      lessons: [
        {
          title: "الروابط الأكاديمية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يعبر عن التناقض؟",
              options: ["ومع ذلك", "بالإضافة إلى ذلك", "لذلك", "علاوة على ذلك"],
              correctAnswer: "0",
              explanation: "ومع ذلك = ومع ذلك (تناقض).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "جمل التركيز",
      lessons: [
        {
          title: "جمل التركيز مع 'إن'",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو جملة تركيز؟",
              options: ["إنها مريم التي تأتي", "مريم تأتي", "تأتي مريم", "قد أتت مريم"],
              correctAnswer: "0",
              explanation: "جمل التركيز تؤكد جزءاً معيناً من الجملة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "قلب الترتيب للتأكيد",
      lessons: [
        {
          title: "قلب الجمل للتأكيد",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو قلب الترتيب؟",
              options: ["أبداً لم أر ذلك", "لم أر ذلك أبداً", "ذلك لم أره أبداً", "رأيت ذلك أبداً"],
              correctAnswer: "0",
              explanation: "مع الظروف السلبية في البداية يتم القلب.",
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
          title: "اللغة القانونية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'المدعي'؟",
              options: ["شخص يرفع دعوى", "قاضي", "محامي", "شاهد"],
              correctAnswer: "0",
              explanation: "المدعي = plaintiff.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "علم الاجتماع اللغوي",
      lessons: [
        {
          title: "تنوع اللغة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو لهجة؟",
              options: ["تنوع إقليمي للغة", "اللغة المعيارية", "لغة تخصصية", "عامية"],
              correctAnswer: "0",
              explanation: "اللهجة = تنوع إقليمي.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "اللسانيات المعرفية",
      lessons: [
        {
          title: "الاستعارات المعرفية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الاستعارة المفاهيمية؟",
              options: ["الوقت هو المال", "الطاولة خشب", "الكتاب ورق", "المنزل حجر"],
              correctAnswer: "0",
              explanation: "الاستعارة المفاهيمية: مفهوم مجرد يُفهم عبر ملموس.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "تحليل الخطاب الإعلامي",
      lessons: [
        {
          title: "التحليل النقدي للخطاب",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا يدرس التحليل النقدي للخطاب؟",
              options: ["علاقات القوة في النص", "النحو", "اختيار الكلمات", "النطق"],
              correctAnswer: "0",
              explanation: "CDA يدرس كيف تعكس اللغة السلطة والأيديولوجيا.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "منهجية البحث",
      lessons: [
        {
          title: "تصميم البحث",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو فرضية؟",
              options: ["افتراض قابل للاختبار", "حقيقة", "نظرية", "قانون"],
              correctAnswer: "0",
              explanation: "الفرضية = افتراض قابل للاختبار.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "النقد الثقافي",
      lessons: [
        {
          title: "النظرية الثقافية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الدراسات الثقافية؟",
              options: ["دراسة ثقافية متعددة التخصصات", "العلوم الطبيعية", "الرياضيات", "الرياضة"],
              correctAnswer: "0",
              explanation: "الدراسات الثقافية = دراسة متعددة التخصصات للثقافة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الحجاج المتقدم",
      lessons: [
        {
          title: "المغالطات المنطقية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو Ad hominem؟",
              options: ["هجوم على الشخص لا الحجة", "سببية زائفة", "دوران", "رجل قش"],
              correctAnswer: "0",
              explanation: "Ad hominem = هجوم على الشخص بدلاً من الحجة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "علم النفس اللغوي",
      lessons: [
        {
          title: "اكتساب اللغة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الفترة الحرجة؟",
              options: ["نافذة زمنية لاكتساب اللغة", "وقت النوم", "وقت العمل", "عطلة"],
              correctAnswer: "0",
              explanation: "الفترة الحرجة = نافذة مثالية لاكتساب اللغة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "القضايا العالمية والدبلوماسية",
      lessons: [
        {
          title: "اللغة الدبلوماسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو دبلوماسي؟",
              options: ["مهذب وحذر", "مباشر وصريح", "عدواني", "صاخب"],
              correctAnswer: "0",
              explanation: "اللغة الدبلوماسية مهذبة وحذرة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "إتقان الأسلوب",
      lessons: [
        {
          title: "تنوع الأسلوب",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو تسجيل؟",
              options: ["استخدام لغة حسب السياق", "اختيار الكلمات", "النحو", "النطق"],
              correctAnswer: "0",
              explanation: "التسجيل = استخدام اللغة حسب السياق.",
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
    const { course: courseData, modules: modulesData } = arabicC1CourseData;
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
            xpReward: 35 + Math.floor(Math.random() * 25),
            gemReward: 4 + Math.floor(Math.random() * 6),
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
          points: q.points || 20,
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
    console.error("Error creating Arabic C1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
