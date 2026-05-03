import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const swahiliA2CourseData = {
  course: {
    title: "Swahili A2 - Elementary",
    description: "Kiswahili kwa kiwango cha msingi. Jifunze wakati uliopita, ujao, mlinganisho na mawasiliano ya kila siku.",
    difficulty: "ELEMENTARY",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Wakati Uliopita - Simple",
      lessons: [
        {
          title: "Vitenzi vya Kawaida",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'I walked' kwa Kiswahili?",
              options: ["Nilikwenda", "Ninaenda", "Ninaenda", "Nimekwenda"],
              correctAnswer: "0",
              explanation: "Kwenda → Nilikwenda (past).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Methali za Wakati Ujao",
      lessons: [
        {
          title: "Kuenda + infinitivu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'I am going to go'?",
              options: ["Nitaenda", "Ninaenda", "Nilikwenda", "Nimekwenda"],
              correctAnswer: "0",
              explanation: "Kuenda + infinitivu = wakati ujao.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Kutoa Mwelekeo",
      lessons: [
        {
          title: "Viashiria vya Kusogea",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sahihi?",
              options: ["Nenda dukani", "Nenda dukani", "Nenda na dukani", "Nenda kutoka dukani"],
              correctAnswer: "0",
              explanation: "Dukani = direction (kwa).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ununuzi na Nguo",
      lessons: [
        {
          title: "Vipande vya Nguo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'shirt'?",
              options: ["Shati", "Suruali", "Viatu", "Kofia"],
              correctAnswer: "0",
              explanation: "Shati = shirt.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Afya na Mwili",
      lessons: [
        {
          title: "Magonjwa ya Kawaida",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini husababisha homa?",
              options: ["Mafua", "Kuvunjika mguu", "Kukatwa", "Kuumwa"],
              correctAnswer: "0",
              explanation: "Mafua husababisha homa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Safari na Usafiri",
      lessons: [
        {
          title: "Njia za Usafiri",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini huruka angani?",
              options: ["Ndege", "Gari", "Treni", "Baiskeli"],
              correctAnswer: "0",
              explanation: "Ndege = airplane.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mlinganisho",
      lessons: [
        {
          title: "Mlinganisho na -er",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sahihi?",
              options: ["Kubwa kuliko", "Zaidi kubwa kuliko", "Kubwa kuliko", "Kubwa kama"],
              correctAnswer: "0",
              explanation: "Kubwa = mlinganisho (kubwa).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hali ya Sasa Inayoendelea",
      lessons: [
        {
          title: "Kuwa + -na",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'I am eating'?",
              options: ["Nina kula", "Nakula", "Nilikula", "Nimekula"],
              correctAnswer: "0",
              explanation: "Kuwa + -na = hali ya sasa inayoendelea.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Nyumba na Samani",
      lessons: [
        {
          title: "Vyumba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unalala wapi?",
              options: ["Chumba cha kulala", "Jikoni", "Sebule", "Bafu"],
              correctAnswer: "0",
              explanation: "Chumba cha kulala = bedroom.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hali ya Hewa na Misimu",
      lessons: [
        {
          title: "Ripoti ya Hali ya Hewa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini maana ya 'jua kali'?",
              options: ["Jua kali", "Mvua", "Theluji", "Upepo"],
              correctAnswer: "0",
              explanation: "Jua kali = sunny.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Kazi na Taaluma",
      lessons: [
        {
          title: "Majina ya Kazi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nani hufundisha wanafunzi?",
              options: ["Mwalimu", "Daktari", "Dereva", "Mpishi"],
              correctAnswer: "0",
              explanation: "Mwalimu = teacher.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Chakula na Vinywaji",
      lessons: [
        {
          title: "Chakula",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'bread'?",
              options: ["Mkate", "Wali", "Nyama", "Samaki"],
              correctAnswer: "0",
              explanation: "Mkate = bread.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Shule na Elimu",
      lessons: [
        {
          title: "Masomo ya Shuleni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'math'?",
              options: ["Hesabu", "Historia", "Sanaa", "Muziki"],
              correctAnswer: "0",
              explanation: "Hesabu = math.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Muda wa Kupumzika na Hobbies",
      lessons: [
        {
          title: "Michezo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini unachochezea kwa mpira na kikapu?",
              options: ["Baskeli", "Mpira wa miguu", "Tenisi", "Kuogelea"],
              correctAnswer: "0",
              explanation: "Baskeli = basketball.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vyombo vya Habari",
      lessons: [
        {
          title: "Aina za Vyombo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unasoma habari wapi?",
              options: ["Gazeti", "Kitabu cha mapishi", "Riyaya", "Kamusi"],
              correctAnswer: "0",
              explanation: "Gazeti = newspaper.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mazingira na Asili",
      lessons: [
        {
          title: "Shida za Mazingira",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini husababisha mbishana wa joto?",
              options: ["Gesijoto", "Miti", "Mvua", "Upepo"],
              correctAnswer: "0",
              explanation: "Gesijoto hushika joto.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Watu na Mahusiano",
      lessons: [
        {
          title: "Tabia",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini maana ya 'mkarimu'?",
              options: ["Mkarimu", "Mkali", "Mrefu", "Mfupi"],
              correctAnswer: "0",
              explanation: "Mkarimu = kind.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ununuzi na Huduma",
      lessons: [
        {
          title: "Aina za Maduka",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unanunua chakula wapi?",
              options: ["Supermarket", "Duka la nguo", "Maktaba", "Pharmacy"],
              correctAnswer: "0",
              explanation: "Supermarket = supermarket.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ratiba na Tabia",
      lessons: [
        {
          title: "Viashiria vya Mara kwa Mara",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nini maana ya 'kila wakati'?",
              options: ["Kila wakati", "Mara kwa mara", "Kamwe", "Marairai"],
              correctAnswer: "0",
              explanation: "Kila wakati = always.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Utamaduni na Desturi",
      lessons: [
        {
          title: "Sikukuu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Krismasi ni lini?",
              options: ["Desemba 25", "Oktoba 31", "Januari 1", "Mei 5"],
              correctAnswer: "0",
              explanation: "Krismasi = Desemba 25.",
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
    const { course: courseData, modules: modulesData } = swahiliA2CourseData;
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
          language: q.language || "sw",
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
    console.error("Error creating Swahili A2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
