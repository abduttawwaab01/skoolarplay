import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const arabicB1CourseData = {
  course: {
    title: "Arabic B1 - Intermediate",
    description: "العربية للمستوى المتوسط. إتقان الماضي التام، الشرط، المبني للمجهول، والاتصال المهني.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "الماضي التام",
      lessons: [
        {
          title: "لقد + الماضي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الماضي التام؟",
              options: ["لقد رأيت", "أرى", "سأرى", "أكون رأيت"],
              correctAnswer: "0",
              explanation: "لقد + ماضي = ماضي تام.",
              language: "ar",
            },
            {
              type: "SPEECH",
              question: "لقد زرت مدريد ثلاث مرات",
              correctAnswer: "لقد زرت مدريد ثلاث مرات",
              language: "ar",
              hint: "Say: I have visited Madrid three times",
            },
          ],
        },
      ],
    },
    {
      title: "الشرط نوع ١",
      lessons: [
        {
          title: "إذا + مضارع، سوف",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الشرط الأول؟",
              options: ["إذا تمطر، سأبقى", "إذا كان تمطر، سأبقى", "إذا كان تمطر، أبقى", "إذا كان قد أمطر، بقيت"],
              correctAnswer: "0",
              explanation: "إذا + مضارع، سوف + مضارع = شرط أول.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الجمل الموصولة",
      lessons: [
        {
          title: "الذي/التي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو صحيح؟",
              options: ["الرجل الذي يقف هناك", "الرجل الذي يقف هناك ما", "الرجل من يقف هناك", "الرجل الذي هناك"],
              correctAnswer: "0",
              explanation: "الذي/التي للمؤنث للمبتدئ.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "المبني للمجهول",
      lessons: [
        {
          title: "يتم + فعل",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو مبني للمجهول؟",
              options: ["يتم قراءة الكتاب", "أقرأ الكتاب", "قرأت الكتاب", "لقد قرأت الكتاب"],
              correctAnswer: "0",
              explanation: "يتم + فعل = مبني للمجهول.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الكلام المنقول",
      lessons: [
        {
          title: "تغير الأزمنة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "قال: 'أنا متعب' ← قال إنه ___ .",
              options: ["متعب", "متعب", "كان متعباً", "قد يكون متعباً"],
              correctAnswer: "0",
              explanation: "المضارع ← المضارع في الكلام المنقول.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "أفعال المودال للالتزام",
      lessons: [
        {
          title: "يجب وما عليه",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يعبر عن الالتزام؟",
              options: ["يجب أن أذهب", "أستطيع أن أذهب", "يسمح لي أن أذهب", "سأذهب"],
              correctAnswer: "0",
              explanation: "يجب = التزام قوي.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الأفعال العضوية",
      lessons: [
        {
          title: "أفعال متصلة",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'يستيقظ' تعني:",
              options: ["يستيقظ/يقوم", "يجلس", "يستلقي", "ينام"],
              correctAnswer: "0",
              explanation: "يستيقظ = to wake up/get up.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "العمل والحياة المهنية",
      lessons: [
        {
          title: "مقابلات العمل",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا تقول عن نقاط القوة؟",
              options: ["أنا مجتهد", "أنا مجتهد", "لدي اجتهاد", "أنا أكون مجتهد"],
              correctAnswer: "0",
              explanation: "أنا + صفة (مجتهد).",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "البيئة والمجتمع",
      lessons: [
        {
          title: "مشاكل بيئية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما يسبب الاحتباس الحراري؟",
              options: ["غازات الدفيئة", "أشجار", "محيطات", "مطر"],
              correctAnswer: "0",
              explanation: "غازات الدفيئة تحتفظ بالحرارة.",
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
          title: "الأخبار",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "أين تقرأ الأخبار الحالية؟",
              options: ["موقع أخبار", "كتاب طبخ", "رواية", "قاموس"],
              correctAnswer: "0",
              explanation: "مواقع الأخبار لها أحداث جارية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التعليم والتعلم",
      lessons: [
        {
          title: "التعليم العالي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي جامعة؟",
              options: ["مكان للتعليم العالي", "مدرسة ابتدائية", "روضة أطفال", "مدرسة مهنية"],
              correctAnswer: "0",
              explanation: "الجامعات تقدم برامج أكاديمية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الصحة ونمط الحياة",
      lessons: [
        {
          title: "تغذية صحية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو طعام صحي؟",
              options: ["خضروات", "حلويات", "شيبس", "صودا"],
              correctAnswer: "0",
              explanation: "الخضروات مغذية.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "السفر والسياحة",
      lessons: [
        {
          title: "وجهات سياحية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ماذا يزور السياح في باريس؟",
              options: ["برج إيفيل", "بيغ بن", "تمثال الحرية", "السور العظيم"],
              correctAnswer: "0",
              explanation: "برج إيفيل في باريس.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "التكنولوجيا والابتكار",
      lessons: [
        {
          title: "التحول الرقمي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو الذكاء الاصطناعي؟",
              options: ["آلات تفكر", "حواسيب أسرع", "شاشات أكبر", "ذاكرة أكثر"],
              correctAnswer: "0",
              explanation: "الذكاء الاصطناعي = آلات تحاكي ذكاء البشر.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "السياسة والحكومة",
      lessons: [
        {
          title: "الأنظمة السياسية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الديمقراطية؟",
              options: ["الشعب ينتخب", "حاكم واحد", "الجيش يحكم", "زعماء دينيون يحكمون"],
              correctAnswer: "0",
              explanation: "الديمقراطية = الشعب ينتخب القادة.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "العلم والطبيعة",
      lessons: [
        {
          title: "المنهج العلمي",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي الخطوة الأولى؟",
              options: ["طرح سؤال", "إجراء تجربة", "استنتاج", "تحليل بيانات"],
              correctAnswer: "0",
              explanation: "المنهج العلمي يبدأ بسؤال.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الفنون والثقافة",
      lessons: [
        {
          title: "الفنون البصرية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هي لوحة؟",
              options: ["فن على قماش", "تمثال من طين", "مبنى حجري", "قطعة موسيقية"],
              correctAnswer: "0",
              explanation: "لوحة = فن على قماش/ورق.",
              language: "ar",
            },
          ],
        },
      ],
    },
    {
      title: "الخطط المستقبلية",
      lessons: [
        {
          title: "أهداف مهنية",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "ما هو هدف مهني؟",
              options: ["أن أصبح طبيباً", "تناول الغداء", "النوم جيداً", "مشاهدة التلفاز"],
              correctAnswer: "0",
              explanation: "هدف مهني = طموح مهني.",
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
    const { course: courseData, modules: modulesData } = arabicB1CourseData;
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
            xpReward: 20 + Math.floor(Math.random() * 20),
            gemReward: 2 + Math.floor(Math.random() * 4),
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
    console.error("Error creating Arabic B1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
