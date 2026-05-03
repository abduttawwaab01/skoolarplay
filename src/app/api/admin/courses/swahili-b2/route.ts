import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const swahiliB2CourseData = {
  course: {
    title: "Swahili B2 - Upper Intermediate",
    description: "Kiswahili kwa kiwango cha kati cha juu. Elewa maandishi magumu, mawasiliano ya ufasaha, na sarufi ngumu.",
    difficulty: "UPPER_INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Masharti Mchanganyiko",
      lessons: [
        {
          title: "Kama + past perfect, conditional",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sharti la tatu?",
              options: ["Kama ningekuwa na wakati, ningalikuja", "Kama nina wakati, nitaaja", "Kama nilikuwa na wakati, nilikuja", "Kama nimekuwa na wakati, nimekuja"],
              correctAnswer: "0",
              explanation: "Kama + past perfect, conditional = sharti la tatu (dhana).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hali ya Kupasuliwa ya Juu",
      lessons: [
        {
          title: "Passive na modal",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni passive na modal?",
              options: ["Kitabu lazima kisomwe", "Lazima nisome kitabu", "Kitabu kinasomwa", "Ninasoma kitabu"],
              correctAnswer: "0",
              explanation: "Modal + passive (participle).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Kudhani na Kubahatisha",
      lessons: [
        {
          title: "Lazima iwe/ Haiwezi iwe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi kinaonyesha uhakika?",
              options: ["Lazima awe nyumbani", "Anaweza kuwa nyumbani", "Pengine anaweza kuwa nyumbani", "Atakuwa nyumbani"],
              correctAnswer: "0",
              explanation: "Lazima iwe = udhani (uhakika).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vishazi vya Kurejelea vya Juu",
      lessons: [
        {
          title: "Relatives na prepositions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sahihi?",
              options: ["Kitabu ambacho nimezungumza nacho", "Kitabu ambacho nimezungumza nacho na", "Kitabu ambacho nimezungumza nacho", "Kitabu, nimezungumza nacho"],
              correctAnswer: "0",
              explanation: "Ambacho + preposition + pronoun.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Misemo ya Kisasa",
      lessons: [
        {
          title: "Misemo ya Kawaida",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Maana ya 'Vunja barafu' ni nini?",
              options: ["Kuanza mazungumzo", "Huzuni", "Hasira", "Uchovu"],
              correctAnswer: "0",
              explanation: "Vunja barafu = kuanza mazungumzo.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mawasiliano ya Biashara",
      lessons: [
        {
          title: "Barua pepe za Biashara",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kuanza barua rasmi?",
              options: ["Mpendwa Mheshimiwa Silva", "Hujambo Silva", "Haya Wananchi", "Habari za asubuhi"],
              correctAnswer: "0",
              explanation: "Mpendwa/Mheshimiwa = rasmi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Historia na Utamaduni",
      lessons: [
        {
          title: "Matukio ya Historia",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ukuta wa Berlin ulianguka lini?",
              options: ["1989", "1945", "1961", "2000"],
              correctAnswer: "0",
              explanation: "Ukuta wa Berlin ulianguka 1989.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sayansi na Teknolojia",
      lessons: [
        {
          title: "Mafanikio ya Sayansi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "AI ni nini?",
              options: ["Mashine zinazofikiri", "Kompyuta za haraka", "Skrini kubwa", "Kumbukumbu nyingi"],
              correctAnswer: "0",
              explanation: "AI hufikiri kama binadamu.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Siasa na Masuala ya Kijamii",
      lessons: [
        {
          title: "Hotuba ya Kisiasa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Demokrasia ni nini?",
              options: ["Serikali ya wananchi", "Kiongozi mmoja", "Jeshi linatawala", "Viongozi wa dini"],
              correctAnswer: "0",
              explanation: "Demokrasia = serikali ya wananchi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Dhana Mbali na Mbali",
      lessons: [
        {
          title: "Mawazo ya Falsafa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Uhuru ni nini?",
              options: ["Kujitawala", "Kahawa ya bure", "Gari la haraka", "Nyumba kubwa"],
              correctAnswer: "0",
              explanation: "Uhuru = kujitawala.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vitenzi vya Kishikaji vya Juu",
      lessons: [
        {
          title: "Vitenzi vya Kishikaji ngumu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Maana ya 'tendea' ni nini?",
              options: ["Kufanya kwa", "Kuanza", "Kumaliza", "Kusimama"],
              correctAnswer: "0",
              explanation: "Tendea = to do to/for.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mazingira na Uendelevu",
      lessons: [
        {
          title: "Mabadiliko ya Tabia Nchi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi husababisha ongezeko la joto la dunia?",
              options: ["Gesi chafu", "Miti", "Mvua", "Upepo"],
              correctAnswer: "0",
              explanation: "Gesi chafu hushika joto.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Elimu na Ufundishaji",
      lessons: [
        {
          title: "Nadharia za Kujifunza",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Constructivism ni nini?",
              options: ["Kujifunza kwa uzoefu", "Kukariri", "Kufundishwa", "Mitihani"],
              correctAnswer: "0",
              explanation: "Constructivism = kujifunza kwa uzoefu binafsi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Afya na Tiba",
      lessons: [
        {
          title: "Istilahi za Matibabu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "High Blood Pressure ni nini?",
              options: ["Mkazo wa damu", "Mkazo wa damu chini", "Kichwa kiu", "Homa"],
              correctAnswer: "0",
              explanation: "Mkazo wa damu = hypertension.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vyombo vya Habari na Uandishi wa Habari",
      lessons: [
        {
          title: "Uandishi wa Uhariri",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Headline ni nini?",
              options: ["Kichwa cha habari", "Mwili wa maandishi", "Maelezo ya picha", "Kolumni"],
              correctAnswer: "0",
              explanation: "Headline = kichwa cha habari.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Fasihi na Sanaa",
      lessons: [
        {
          title: "Uchambuzi wa Fasihi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Methali ni nini?",
              options: ["Methali ya picha", "Lugha ya wazi", "Ufupishaji", "Kichekesho"],
              correctAnswer: "0",
              explanation: "Methali = msemo wa picha.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Uchumi na Fedha",
      lessons: [
        {
          title: "Kanuni za Uchumi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Inflation ni nini?",
              options: ["Ongezeko la bei", "Upungufu wa bei", "Ongezeko la mishahara", "Ukosefu wa kazi"],
              correctAnswer: "0",
              explanation: "Inflation = ongezeko la bei kwa ujumla.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Saikolojia na Tabia",
      lessons: [
        {
          title: "Nadharia za Saikolojia",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Conditioning ni nini?",
              options: ["Kujifunza kwa kuchochea", "Sifa za kuzaliwa", "Matatizo ya kisaikolojia", "Ndoto"],
              correctAnswer: "0",
              explanation: "Conditioning = kujifunza kwa mwitikio.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Utajiri na Utamaduni",
      lessons: [
        {
          title: "Mabadilano ya Kitamaduni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Globalization ni nini?",
              options: ["Uunganisho wa dunia", "Desturi za kienyeji", "Kutengwa", "Vita"],
              correctAnswer: "0",
              explanation: "Globalization = uunganisho wa dunia.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ubunifu na Baadaye",
      lessons: [
        {
          title: "Teknolojia Zinazochipuka",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Blockchain ni nini?",
              options: ["Hifadhi ya data iliyosambazwa", "Benki kuu", "Mtandao wa kijamii", "Mchezo"],
              correctAnswer: "0",
              explanation: "Blockchain = hifadhi ya data iliyosambazwa isiyobadilika.",
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
    const { course: courseData, modules: modulesData } = swahiliB2CourseData;
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
          language: q.language || "sw",
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
    console.error("Error creating Swahili B2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
