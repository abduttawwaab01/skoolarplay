import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const swahiliC2CourseData = {
  course: {
    title: "Swahili C2 - Mastery",
    description: "Kiswahili kwa kiwango cha ustadi. Karibu ujuzi wa asili, elewa karibu maandishi yote, na usemi sahihi na tofauti.",
    difficulty: "MASTERY",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Ufasaha wa Msamiati",
      lessons: [
        {
          title: "Msamiati wa Nadra",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini maana ya 'giza'?",
              options: ["Isiyojulikana/fumbo", "Wazi", "Kelele", "Haraka"],
              correctAnswer: "0",
              explanation: "Giza = isiyojulikana au fumbo.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Maneno ya Kale na Fasihi",
      lessons: [
        {
          title: "Lugha ya Shakespeare",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nani ni 'thou' kwa Kiswahili cha kale?",
              options: ["Wewe (zamani)", "Mimi", "Yeye", "Ninyi"],
              correctAnswer: "0",
              explanation: "Thou = wewe (cha kale).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ut specialization wa Kazi",
      lessons: [
        {
          title: "Hotuba Maalum",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni lugha ya kitaalamu?",
              options: ["Lugha maalum ya taaluma", "Lugha ya kawaida", "Slang", "Lahaja"],
              correctAnswer: "0",
              explanation: "Lugha ya kitaalamu = istilahi maalum za taaluma.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Lahaja za Kikanda na Slang",
      lessons: [
        {
          title: "Tofauti za Kikanda",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni 'Moin'?",
              options: ["Salamu kaskazini mwa Ujerumani", "Asante", "Kwaheri", "Tafadhali"],
              correctAnswer: "0",
              explanation: "Moin = salamu ya kawaida kaskazini mwa Ujerumani.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Utawala wa Methali",
      lessons: [
        {
          title: "Methali Ngumu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni methali iliyopanuliwa?",
              options: ["Methali inayozungumza kwa funguo", "Ulinganisho wa neno moja", "Dhulumu", "Ucheshi"],
              correctAnswer: "0",
              explanation: "Methali iliyopanuliwa = ulinganisho unaendelea katika kipande cha maandishi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mjadala wa Kiwango cha Juu",
      lessons: [
        {
          title: "Uandishi wa Hati",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni Ethos?",
              options: ["Uaminifu wa mzungumzaji", "Rukwa la hisia", "Uthibitisho wa mantiki", "Ucheshi"],
              correctAnswer: "0",
              explanation: "Ethos = kushawishi kupitia mtu.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mdundo wa Utamaduni Ndogo",
      lessons: [
        {
          title: "Muktadha wa Utamaduni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni muktadha wa utamaduni?",
              options: ["Habari za nyuma", "Sarufi", "Chaguo la maneno", "Matamshi"],
              correctAnswer: "0",
              explanation: "Muktadha wa utamaduni = maana zisizo zimeongelewa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ufasaha wa Misemo ya Methali",
      lessons: [
        {
          title: "Misemo ya Methali ya Juu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini maana ya 'Mwamba umepasuka'?",
              options: ["Kuna shida/hatari", "Mwamba umepasuka", "Kuna utulivu", "Kuna baridi"],
              correctAnswer: "0",
              explanation: "Mwamba umepasuka = hali itakuwa ngumu/hatari.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ukamilifu wa Sarufi",
      lessons: [
        {
          title: "Sintaksia ya Juu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni sentensi iliyopunguzwa?",
              options: ["Kuwa na furaha", "Mimi ni mwenye furaha", "Nisaidie", "Furaha"],
              correctAnswer: "0",
              explanation: "Sentensi iliyopunguzwa = kitenzi kuu kimepunguzwa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uandishi wa Ubunifu",
      lessons: [
        {
          title: "Ubunifu wa Fasihi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni chombo cha mtindo?",
              options: ["Kitu cha lugha kilichotambulika", "Kosa", "Ajali", "Sheria ya sarufi"],
              correctAnswer: "0",
              explanation: "Chombo cha mtindo = kitu cha lugha kinachotumika kwa kutarajia.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hotuba ya Kielimu",
      lessons: [
        {
          title: "Uandishi wa Sayansi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni Muhtasari?",
              options: ["Muhtasari", "Utangulizi", "Mwili", "Hitimisho"],
              correctAnswer: "0",
              explanation: "Abstract = muhtasari mfupi wa karatasi ya kisayansi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mawasiliano ya Kitaalamu",
      lessons: [
        {
          title: "Mawasiliano ya Utendaji",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni Elevator Pitch?",
              options: ["Muhtasari mfupi", "Muhtasari mrefu", "Barua pepe", "Ripoti"],
              correctAnswer: "0",
              explanation: "Elevator Pitch = muhtasari mfupi na wa kushawishi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uchambuzi wa Makosa",
      lessons: [
        {
          title: "Miundo ya Uchambuzi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni uchambuzi wa SWOT?",
              options: ["Nguvu/Dhaifu/Fursa/Tishio", "Uchambuzi wa fedha", "Mkakati wa masoko", "Uzalishaji"],
              correctAnswer: "0",
              explanation: "SWOT = Strengths, Weaknesses, Opportunities, Threats.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uwezo wa Kikanda",
      lessons: [
        {
          title: "Akili ya Utamaduni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni akili ya utamaduni?",
              options: ["Uwezo wa kusonga kati ya tamaduni", "IQ", "Ujuzi wa lugha", "Uzoefu wa kusafiri"],
              correctAnswer: "0",
              explanation: "Akili ya utamaduni = kuzoea tamaduni tofauti.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Tafsiri Maalum",
      lessons: [
        {
          title: "Nadharia ya Tafsiri",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni uwiano katika tafsiri?",
              options: ["Athari ileile kwa msomaji", "Tafsiri ya neno kwa neno", "Tafsiri huru", "Kufuta"],
              correctAnswer: "0",
              explanation: "Uwiano = athari ileile kwa msomaji.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Nadharia ya Lugha",
      lessons: [
        {
          title: "Sarufi ya Kuzalisha",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni sarufi ya jumla?",
              options: ["Muundo wa lugha aliyezaliwa nao", "Sarufi iliyojifunzwa", "Sarufi ya shule", "Lahaja"],
              correctAnswer: "0",
              explanation: "Sarufi ya jumla = uwezo wa lugha aliyezaliwa nao (Chomsky).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uchambuzi wa Hotuba",
      lessons: [
        {
          title: "Uchambuzi wa Kikatili wa Hotuba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini huchunguza uchambuzi wa hotuba?",
              options: ["Lugha katika muktadha wa kijamii", "Sarufi", "Chaguo la maneno", "Matamshi"],
              correctAnswer: "0",
              explanation: "Uchambuzi wa hotuba = lugha kama zoezi la kijamii.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uandishi Bora",
      lessons: [
        {
          title: "Kushawishi kwa Ubingwa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni Logos?",
              options: ["Rukwa la mantiki", "Rukwa la hisia", "Uaminifu", "Ucheshi"],
              correctAnswer: "0",
              explanation: "Logos = kushawishi kupitia mantiki/hoja.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mchanganyiko wa Utamaduni",
      lessons: [
        {
          title: "Uhibridi wa Utamaduni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni uhibridi wa utamaduni?",
              options: ["Mchanganyiko wa tamaduni", "Utamaduni safi", "Kutengwa", "Vita"],
              correctAnswer: "0",
              explanation: "Uhibridi wa utamaduni = mchanganyiko wa tamaduni tofauti.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Onyesho la Ustadi",
      lessons: [
        {
          title: "Ufasaha karibu wa asili",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini hufafanua kiwango cha C2?",
              options: ["Elewa karibu maandishi yote", "Mawasiliano ya msingi", "Sentensi rahisi", "Makosa mengi"],
              correctAnswer: "0",
              explanation: "C2 = ujuzi karibu wa asili.",
              language: "sw",
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
    const { course: courseData, modules: modulesData } = swahiliC2CourseData;
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
          language: q.language || "sw",
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
    console.error("Error creating Swahili C2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
