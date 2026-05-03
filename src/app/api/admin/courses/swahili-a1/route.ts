import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const swahiliA1CourseData = {
  course: {
    title: "Swahili A1 - Beginner",
    description: "Kiswahili kwa wanaoanza. Jifunze salamu, nambari, rangi, familia na mawasiliano ya msingi ya kila siku.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Salamu na Kujitambulisha",
      lessons: [
        {
          title: "Hujambo na Kwaheri",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jambo la kusema 'Hello' kwa Kiswahili ni lipi?",
              options: ["Hujambo", "Kwaheri", "Asante", "Samahani"],
              correctAnswer: "0",
              explanation: "Hujambo = Hello.",
              language: "sw",
            },
            {
              type: "SPEECH",
              question: "Hujambo, jina langu ni Juma.",
              correctAnswer: "Hujambo, jina langu ni Juma.",
              language: "sw",
              hint: "Say: Hello, my name is Juma",
            },
          ],
        },
      ],
    },
    {
      title: "Nambari na Kuhesabu",
      lessons: [
        {
          title: "Nambari 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nambari '5' ni ipi?",
              options: ["Tano", "Sita", "Saba", "Nane"],
              correctAnswer: "0",
              explanation: "5 = Tano.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Rangi na Mwonekano",
      lessons: [
        {
          title: "Rangi za Msingi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Rangi ya jua ni nini?",
              options: ["Njano", "Bluu", "Nyekundu", "Kijani"],
              correctAnswer: "0",
              explanation: "Jua ni rangi ya njano.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Familia na Mahusiano",
      lessons: [
        {
          title: "Wanafamilia",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Baba ya baba ni nani?",
              options: ["Babu", "Mjukuu", "Mjomba", "Kaka"],
              correctAnswer: "0",
              explanation: "Baba ya baba ni babu.",
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
          title: "Chakula cha Msingi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Jinsi ya kusema 'bread' kwa Kiswahili ni?",
              options: ["Mkate", "Nyama", "Samaki", "Wali"],
              correctAnswer: "0",
              explanation: "Mkate = bread.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ratiba ya Kila Siku",
      lessons: [
        {
          title: "Asubuhi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unafanya nini unapoamka?",
              options: ["Naamka", "Nalala", "Nakula chakula cha jioni", "Natazama TV"],
              correctAnswer: "0",
              explanation: "Kuamka = waking up.",
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
          title: "Vyumba vya Nyumba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unalala wapi?",
              options: ["Chumba cha kulala", "Jikoni", "Bafu", "Sebule"],
              correctAnswer: "0",
              explanation: "Chumba cha kulala = bedroom.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hali ya Sasa - Simple",
      lessons: [
        {
          title: "Kuwa na Kuwa na",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Mimi ___ mwanafunzi.",
              options: ["ni", "yuko", "nilikuwa", "nilikuwa"],
              correctAnswer: "0",
              explanation: "Kuwa = to be (permanent).",
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
          title: "Vifaa vya Shuleni",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unaandikia kwa kutumia nini?",
              options: ["Kalamu", "Kitabu", "Bamba la kufuta", "Mkasi"],
              correctAnswer: "0",
              explanation: "Kalamu = pen.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Maumbo na Saizi",
      lessons: [
        {
          title: "Maumbo ya Jometri",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Umbo la mpira ni nini?",
              options: ["Duara", "Mraba", "Pembe tatu", "Mstatili"],
              correctAnswer: "0",
              explanation: "Duara = circle.",
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
          title: "Misimu ya Mwaka",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kiangazi ni ___",
              options: ["joto", "baridi", "wastani", "mvua"],
              correctAnswer: "0",
              explanation: "Kiangazi = summer (hot).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Nguo na Mitindo",
      lessons: [
        {
          title: "Vipande vya Nguo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unavaa nini miguuni mwako?",
              options: ["Viatu", "Shati", "Suruali", "Kofia"],
              correctAnswer: "0",
              explanation: "Viatu = shoes.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sehemu za Mwili na Afya",
      lessons: [
        {
          title: "Sehemu za Uso",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unanusa kwa kutumia nini?",
              options: ["Pua", "Jicho", "Sikio", "Kinywa"],
              correctAnswer: "0",
              explanation: "Pua = nose.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Wanyama na Asili",
      lessons: [
        {
          title: "Wanyama wa Shambani",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Nani hutoa maziwa?",
              options: ["Ng'ombe", "Kuku", "Kondoo", "Farasi"],
              correctAnswer: "0",
              explanation: "Ng'ombe hutoa maziwa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Usafiri na Safari",
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
      title: "Michezo na Hobbies",
      lessons: [
        {
          title: "Michezo Mashuhuri",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Mchezo gani unachezea kwa miguu?",
              options: ["Mpira wa miguu", "Baskeli", "Tenisi", "Kuogelea"],
              correctAnswer: "0",
              explanation: "Mpira wa miguu = football/soccer.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ununuzi na Pesa",
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
      title: "Maeneo Mjini",
      lessons: [
        {
          title: "Maeneo Muhimu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wapi huhubiri wagonjwa?",
              options: ["Hospitali", "Shule", "Msikiti", "Mkahawa"],
              correctAnswer: "0",
              explanation: "Hospitali = hospital.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Muda na Tarehe",
      lessons: [
        {
          title: "Kusoma Saa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Saa ngapi kuna kwa siku moja?",
              options: ["24", "12", "36", "48"],
              correctAnswer: "0",
              explanation: "Siku moja = saa 24.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mawasiliano ya Msingi",
      lessons: [
        {
          title: "Maneno ya Adabu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unasema nini unapopokea kitu?",
              options: ["Asante", "Samahani", "Hujambo", "Kwaheri"],
              correctAnswer: "0",
              explanation: "Asante = thank you.",
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
    const { course: courseData, modules: modulesData } = swahiliA1CourseData;
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
    console.error("Error creating Swahili A1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
