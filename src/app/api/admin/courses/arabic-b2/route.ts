import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const arabicB2CourseData = {
  course: {
    title: "Arabic B2 - Upper Intermediate",
    description: "العربية للمستوى المتقدم العلوي. فهم النصوص المعقدة، التواصل بطلاقة، والقواعد المتقدمة.",
    difficulty: "UPPER_INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "الشروط المختلطة",
      lessons: [
        {
          title: "إذا + ماضي تام، سوف",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الشرط الثالث؟",
              options: ["لو كان لدي وقت، لكنت حضرت", "إذا لدي وقت، سأحضر", "إذا كان لدي وقت، كنت أحضر", "إذا كان قد كان لدي وقت، كنت حضرت"],
              correctAnswer: "0",
              explanation: "لو + ماضي تام، لـ + ماضي = شرط ثالث (افتراضي).",
              language: "ar",
            },
            {
              type: "FILL_BLANK",
              question: "أكمل: لو كنت أعلم، لـ___ تصرفت بشكل مختلف.",
              correctAnswer: "قد",
              explanation: "لـ + قد + ماضي = شرط ثالث.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المبني للمجهول المتقدم",
      lessons: [
        {
          title: "مبني للمجهول مع أفعال المودال",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو مبني للمجهول مع فعل مودال؟",
              options: ["يجب قراءة الكتاب", "أنا يجب أن أقرأ الكتاب", "يتم قراءة الكتاب", "أقرأ الكتاب"],
              correctAnswer: "0",
              explanation: "يجب + مبني للمجهول (مصدر).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الاستنتاج والتكهن",
      lessons: [
        {
          title: "يجب أن يكون/لا يمكن أن يكون",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يعبر عن اليقين؟",
              options: ["يجب أن يكون في المنزل", "ربما يكون في المنزل", "قد يكون في المنزل", "سيكون في المنزل"],
              correctAnswer: "0",
              explanation: "يجب أن يكون = استنتاج (يقين).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الجمل الموصولة المتقدمة",
      lessons: [
        {
          title: "الموصولي مع حروف الجر",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو صحيح؟",
              options: ["الكتاب الذي أتحدث عنه", "الكتاب الذي أتحدث عنه عن", "الكتاب الذي أتحدث عنه", "الكتاب، أتحدث عنه"],
              correctAnswer: "0",
              explanation: "الذي + حرف جر + ضمير متصل.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التعابير الاصطلاحية",
      lessons: [
        {
          title: "تعابير شائعة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'كسر الجليد'؟",
              options: ["بدء المحادثة", "حزن", "غضب", "تعب"],
              correctAnswer: "0",
              explanation: "كسر الجليد = بدء محادثة/تخفيف التوتر.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الاتصال التجاري",
      lessons: [
        {
          title: "رسائل البريد الإلكتروني التجارية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "كيف تبدأ رسالة رسمية؟",
              options: ["عزيزي السيد محمد", "مرحباً محمد", "أهلاً يا رفاق", "صباح الخير"],
              correctAnswer: "0",
              explanation: "عزيزي/عزيزتي = رسمي.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التاريخ والثقافة",
      lessons: [
        {
          title: "أحداث تاريخية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "متى سقطت الأندلس؟",
              options: ["١٤٩٢", "٦٢٢", "١٩١٤", "٢٠٠٠"],
              correctAnswer: "0",
              explanation: "سقطت الأندلس عام ١٤٩٢.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "العلوم والتكنولوجيا",
      lessons: [
        {
          title: "الاكتشافات العلمية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الذكاء الاصطناعي؟",
              options: ["آلات تفكر", "حواسيب أسرع", "شاشات أكبر", "ذاكرة أكثر"],
              correctAnswer: "0",
              explanation: "الذكاء الاصطناعي يحاكي ذكاء البشر.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "السياسة والقضايا الاجتماعية",
      lessons: [
        {
          title: "الخطاب السياسي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الديمقراطية؟",
              options: ["حكم الشعب", "حاكم واحد", "حكم الجيش", "حكم ديني"],
              correctAnswer: "0",
              explanation: "الديمقراطية = حكم الشعب.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المفاهيم المجردة",
      lessons: [
        {
          title: "الأفكار الفلسفية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الحرية؟",
              options: ["تقرير المصير", "قهوة مجانية", "سيارة سريعة", "منزل كبير"],
              correctAnswer: "0",
              explanation: "الحرية = تقرير المصير.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الأفعال العضوية المتقدمة",
      lessons: [
        {
          title: "أفعال عضوية معقدة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تعني 'يستعيد'؟",
              options: ["يستعيد/يتعافى", "يبدأ", "ينتهي", "يتوقف"],
              correctAnswer: "0",
              explanation: "يستعيد = to recover/regain.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "البيئة والاستدامة",
      lessons: [
        {
          title: "تغير المناخ",
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
      title: "التعليم والمنهجية",
      lessons: [
        {
          title: "نظريات التعلم",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو البنائية؟",
              options: ["التعلم من التجربة", "الحفظ", "التلقين", "الاختبارات"],
              correctAnswer: "0",
              explanation: "البنائية = التعلم من التجربة الشخصية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الصحة والطب",
      lessons: [
        {
          title: "المصطلحات الطبية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو 'ارتفاع ضغط الدم'؟",
              options: ["ضغط دم مرتفع", "ضغط دم منخفض", "صداع", "حمى"],
              correctAnswer: "0",
              explanation: "ارتفاع ضغط الدم = hypertension.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الإعلام والصحافة",
      lessons: [
        {
          title: "الكتابة الصحفية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو عنوان رئيسي؟",
              options: ["عنوان الخبر", "نص الخبر", "التسمية التوضيحية", "العمود"],
              correctAnswer: "0",
              explanation: "العنوان الرئيسي = headline.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الأدب والفنون",
      lessons: [
        {
          title: "التحليل الأدبي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو استعارة؟",
              options: ["تشبيه بدون 'مثل'", "تشبيه بـ 'مثل'", "مبالغة", "سخرية"],
              correctAnswer: "0",
              explanation: "الاستعارة = تشبيه مباشر بدون أداة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الاقتصاد والمالية",
      lessons: [
        {
          title: "المبادئ الاقتصادية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو التضخم؟",
              options: ["زيادة الأسعار", "انخفاض الأسعار", "زيادة الأجور", "بطالة"],
              correctAnswer: "0",
              explanation: "التضخم = زيادة عامة في الأسعار.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "علم النفس والسلوك",
      lessons: [
        {
          title: "النظريات النفسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الشرط؟",
              options: ["التعلم بالارتباط", "صفات مولودة", "صدمة", "أحلام"],
              correctAnswer: "0",
              explanation: "الشرط = التعلم بالاستجابة للمنبه.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "العولمة والثقافة",
      lessons: [
        {
          title: "التبادل الثقافي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي العولمة؟",
              options: ["الترابط العالمي", "تقاليد محلية", "عزلة", "حرب"],
              correctAnswer: "0",
              explanation: "العولمة = الترابط العالمي.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الابتكار والمستقبل",
      lessons: [
        {
          title: "التقنيات الناشئة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو البلوكتشين؟",
              options: ["قاعدة بيانات موزعة", "بنك مركزي", "شبكة اجتماعية", "لعبة"],
              correctAnswer: "0",
              explanation: "البلوكتشين = قاعدة بيانات موزعة غير قابلة للتغيير.",
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
    const { course: courseData, modules: modulesData } = arabicB2CourseData;
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
            xpReward: 30 + Math.floor(Math.random() * 20),
            gemReward: 3 + Math.floor(Math.random() * 5),
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
          points: q.points || 15,
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
    console.error("Error creating Arabic B2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
