import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const swahiliC1CourseData = {
  course: {
    title: "Swahili C1 - Advanced",
    description: "Kiswahili kwa kiwango cha juu. Elewa maandishi magumu, ufasaha wa lugha kamilifu, na matumizi ya sarufi ngumu.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Utofauti wa Maana",
      lessons: [
        {
          title: "Tofauti Ndogo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni tofauti kati ya 'kukamilisha' na 'kwisha'?",
              options: ["Hakuna tofauti", "Neno moja ni rasmi zaidi", "Neno moja ni wingi", "Neno moja ni wakati uliopita"],
              correctAnswer: "0",
              explanation: "Kukamilisha = kwisha (transitive); kwisha = kukamilisha (intransitive) - tofauti ndogo.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mbinu za Uandishi",
      lessons: [
        {
          title: "Methali na Sili",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni 'simile'?",
              options: ["Ulinganisho kwa 'kama'", "Methali", "Uhusi", "Dhulumu"],
              correctAnswer: "0",
              explanation: "Simile = ulinganisho kwa 'kama' au 'kama vile'.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mtindo wa Uandishi wa Kielimu",
      lessons: [
        {
          title: "Usajili wa Kielimu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni rasmi?",
              options: ["Inachunguzwa", "Nimechunguza", "Tunaangalia", "Hii ni nzuri"],
              correctAnswer: "0",
              explanation: "Miundo ya pasivu ni rasmi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Rasmi dhidi ya Si-Rasmi",
      lessons: [
        {
          title: "Mwendeleo wa Usajili",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni rasmi zaidi?",
              options: ["Wapendwa wananchi", "Hujambo ndugu", "Haya", "Habari"],
              correctAnswer: "0",
              explanation: "Wapendwa wananchi = salamu rasmi zaidi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Miundo ya Sentensi Ngumu",
      lessons: [
        {
          title: "Mifano ya Utegemezi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni sentensi ndogo?",
              options: ["Sentensi inayoanza na 'kwa sababu'", "Sentensi kuu", "Sentensi isiyo na kitenzi", "Swali"],
              correctAnswer: "0",
              explanation: "Sentensi ndogo huanza na viunganishi (kwa sababu, kuwa, kama...).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Falsafa na Maadili",
      lessons: [
        {
          title: "Mifumo ya Maadili",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni deontology?",
              options: ["Maadili ya wajibu", "Maadili ya furaha", "Maadili ya bidii", "Maadili ya uwajibikaji"],
              correctAnswer: "0",
              explanation: "Deontology = maadili ya wajibu (Kant).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uchambuzi wa Fasihi",
      lessons: [
        {
          title: "Kakushi ya Fasihi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni alegoria?",
              options: ["Uwakilishi wa picha", "Maana halisi", "Dhulumu", "Ucheshi"],
              correctAnswer: "0",
              explanation: "Alegoria = uwakilishi wa picha wa dhana ngumu.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Viashiria vya Juu vya Hotuba",
      lessons: [
        {
          title: "Viunganishi vya Kielimu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini inaonyesha utofauti?",
              options: ["Hata hivyo", "Kwa kuongeza", "Kwa hiyo", "Kwa zaidi"],
              correctAnswer: "0",
              explanation: "Hata hivyo = lakini (utofauti).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sentensi za Kukata",
      lessons: [
        {
          title: "Sentensi za kukata 'ni'",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni sentensi ya kukata?",
              options: ["Ni Mariamu anayeja", "Mariamu anaja", "Anaja Mariamu", "Mariamu amekuja"],
              correctAnswer: "0",
              explanation: "Sentensi za kukata huweka mkazo kwenye sehemu ya sentensi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Kugeuza kwa Uhakika",
      lessons: [
        {
          title: "Kugeuza hasi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni kugeuza?",
              options: ["Sijawahi ona hili", "Mimi sijawahi ona hili", "Hili mimi sijawahi ona", "Nimeona hili sijawahi"],
              correctAnswer: "0",
              explanation: "Na viashiria hasi mwanzoni, huongezwa mpangilio.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ut specialization ya Kazi",
      lessons: [
        {
          title: "Lugha ya Sheria",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nani ni 'plaintiff'?",
              options: ["Mshtakiwa", "Hakimu", "Wakili", "Shahidi"],
              correctAnswer: "0",
              explanation: "Plaintiff = mshtakiwa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sosholingwistiksi",
      lessons: [
        {
          title: "Tofauti ya Lugha",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni lahaja?",
              options: ["Tofauti ya kikanda", "Lugha rasmi", "Lugha ya taaluma", "Slang"],
              correctAnswer: "0",
              explanation: "Lahaja = tofauti ya kikanda.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Lingwistiksi ya Kognitivu",
      lessons: [
        {
          title: "Methali za Kognitivu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni methali ya kichocheo?",
              options: ["Muda ni pesa", "Meza ni mbao", "Kitabu ni karatasi", "Nyumba ni mawe"],
              correctAnswer: "0",
              explanation: "Methali ya kichocheo: dhana ngumu inaeleweka kwa kitu halisi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uchambuzi wa Hotuba ya Vyombo",
      lessons: [
        {
          title: "Uchambuzi wa Kikatili wa Hotuba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini huchunguza Uchambuzi wa Kikatili wa Hotuba?",
              options: ["Mahusiano ya mamlaka katika maandishi", "Sarufi", "Chaguo la maneno", "Matamshi"],
              correctAnswer: "0",
              explanation: "CDA huchunguza jinsi lugha inavyoonyesha mamlaka na itikadi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mbinu ya Utafiti",
      lessons: [
        {
          title: "Muundo wa Utafiti",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni dhana?",
              options: ["Dhani inayoweza kupimwa", "Ukweli", "Nadharia", "Sheria"],
              correctAnswer: "0",
              explanation: "Hypothesis = dhani inayoweza kupimwa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Kakushi ya Utamaduni",
      lessons: [
        {
          title: "Nadharia ya Utamaduni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni Masomo ya Utamaduni?",
              options: ["Utafiti wa kati wa utamaduni", "Sayansi asilia", "Hisabati", "Michezo"],
              correctAnswer: "0",
              explanation: "Masomo ya Utamaduni = utafiti wa kati wa utamaduni.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hoja za Juu",
      lessons: [
        {
          title: "Makosa ya Mantiki",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni Ad hominem?",
              options: ["Kushambulia mtu badala ya hoja", "Sababu ya uwongo", "Mduara", "Mtu wa slami"],
              correctAnswer: "0",
              explanation: "Ad hominem = kushambulia mtu badala ya hoja.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Saikolojia ya Lugha",
      lessons: [
        {
          title: "Kupata Lugha",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni kipindi muhimu?",
              options: ["Dirisha la muda la kujifunza lugha", "Wakati wa kulala", "Wakati wa kazi", "Likizo"],
              correctAnswer: "0",
              explanation: "Kipindi muhimu = dirisha bora la kujifunza lugha.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Masuala ya Kimataifa na Diplomasia",
      lessons: [
        {
          title: "Lugha ya Diplomasia",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni kidiplomasia?",
              options: ["Ina adabu na tahadhari", "Moja kwa moja na wazi", "Kukera", "Kelele"],
              correctAnswer: "0",
              explanation: "Lugha ya diplomasia ina adabu na tahadhari.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Utawala wa Mtindo",
      lessons: [
        {
          title: "Tofauti ya Mtindo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini ni usajili?",
              options: ["Matumizi ya lugha kulingana na muktadha", "Chaguo la maneno", "Sarufi", "Matamshi"],
              correctAnswer: "0",
              explanation: "Usajili = matumizi ya lugha kulingana na hali.",
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
    const { course: courseData, modules: modulesData } = swahiliC1CourseData;
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
          language: q.language || "sw",
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
    console.error("Error creating Swahili C1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
