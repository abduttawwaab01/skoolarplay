import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const igboA1CourseData = {
  course: {
    title: "Igbo A1 - Beginner",
    description: "Igbo maka ndị mbido. Mụta ekele, ọnụọgụgụ, agba, ezinụlọ na mkparịta ụka kwa ụbọchị.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Ekele na Mkparịta Ụka",
      lessons: [
        {
          title: "Nnọọ na Ka ọ dị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ka ị sị 'Hello' na Igbo?",
              options: ["Nnọọ", "Ka ọ dị", "Daalụ", "Biko"],
              correctAnswer: "0",
              explanation: "Nnọọ = Hello.",
              language: "ig",
            },
            {
              type: "SPEECH",
              question: "Nnọọ, aha m bụ Chidi.",
              correctAnswer: "Nnọọ, aha m bụ Chidi.",
              language: "ig",
              hint: "Say: Hello, my name is Chidi",
            },
          ],
        },
      ],
    },
    {
      title: "Ọnụọgụgụ na Ịgụta",
      lessons: [
        {
          title: "Ọnụọgụgụ 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ ọnụọgụgụ '5'?",
              options: ["Ise", "Isii", "Asaa", "Asatọ"],
              correctAnswer: "0",
              explanation: "5 = Ise.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Agba na Ọdịdị",
      lessons: [
        {
          title: "Agba Ndị Isi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu agba anyanwụ?",
              options: ["Odo", "Acha anụnụ", "Uhie", "Akwụkwọ ndụ"],
              correctAnswer: "0",
              explanation: "Anyanwụ na-acha odo.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ezinụlọ na Mmekọrịta",
      lessons: [
        {
          title: "Ndị Ezinụlọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu onye bụ nna nna?",
              options: ["Nna ochie", "Nwa nwa", "Nwanne nna", "Nwanne nne"],
              correctAnswer: "0",
              explanation: "Nna nna bụ nna ochie.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nri na Ihe Ọṅụṅụ",
      lessons: [
        {
          title: "Nri Ndị Isi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu aha 'bread' na Igbo?",
              options: ["Nri", "Anụ", "Azụ", "Osikapa"],
              correctAnswer: "0",
              explanation: "Nri = bread/food.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Usoro Ụbọchị",
      lessons: [
        {
          title: "N'ụtụtụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị ị na-eme mgbe ị na-eteta?",
              options: ["M na-eteta", "M na-ara", "M na-eri nri abalị", "M na-ekiri TV"],
              correctAnswer: "0",
              explanation: "Eteta = waking up.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ụlọ na Àrụsị",
      lessons: [
        {
          title: "Ụlọ Ndị Dị Iche",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ebee ka ị na-ehi ụra?",
              options: ["Ụlọ ehi ụra", "Kichin", "Ụlọ maịl", "Bathroom"],
              correctAnswer: "0",
              explanation: "Ụlọ ehi ụra = bedroom.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ndebe Ugbu A",
      lessons: [
        {
          title: "Bụ na Ịdị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "M ___ bụ nwa akwụkwọ.",
              options: ["bụ", "dị", "bụrụ", "dịrị"],
              correctAnswer: "0",
              explanation: "Bụ = am/is/are.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ụlọ Akwụkwọ na Agụmakwụkwọ",
      lessons: [
        {
          title: "Ihe Ndị Ụlọ Akwụkwọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe ị na-ede ya?",
              options: ["Pensụl", "Akwụkwọ", "Eraser", "Mkpa"],
              correctAnswer: "0",
              explanation: "Pensụl = pen/pencil.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ụdị na Nha",
      lessons: [
        {
          title: "Ụdị Geometric",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ụdị bọọlụ?",
              options: ["Okirikiri", "Nkuku anọ", "Triangle", "Rectangular"],
              correctAnswer: "0",
              explanation: "Okirikiri = circle.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ihu Igwe na Oge",
      lessons: [
        {
          title: "Oge Ụbọchị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Okochi bụ ___",
              options: ["ọkụ", "oyi", "jụụ", "mmiri"],
              correctAnswer: "0",
              explanation: "Okochi = summer (hot).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Uwe na Ejiji",
      lessons: [
        {
          title: "Uwe Ndị Dị Iche",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe ị na-eyi n'ukwu?",
              options: ["Akpụkpọ ụkwụ", "Uwe elu", "Trouser", "Okpu"],
              correctAnswer: "0",
              explanation: "Akpụkpọ ụkwụ = shoes.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Akụkụ Ahụ na Ahụ Ike",
      lessons: [
        {
          title: "Ihu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe ị na-esi isi?",
              options: ["Imi", "Anya", "Ntị", "Ọnụ"],
              correctAnswer: "0",
              explanation: "Imi = nose.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Anụmanụ na Okike",
      lessons: [
        {
          title: "Anụ Ulo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu anụ na-enye mmiri ara?",
              options: ["Ehi", "Ọkụkọ", "Atụrụ", "Inyinya"],
              correctAnswer: "0",
              explanation: "Ehi na-enye mmiri ara.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njem na Ụgbọ",
      lessons: [
        {
          title: "Ụgbọ Ndị Dị Iche",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ụgbọ na-efe elu igwe?",
              options: ["Ugbọ elu", "Ụgbọ ala", "Ụgbọ oloko", "Bicycle"],
              correctAnswer: "0",
              explanation: "Ugbọ elu = airplane.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Egwuregwu na Ihe Ntụrụndụ",
      lessons: [
        {
          title: "Egwuregwu Ndị Ama",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu egwuregwu ị na-agba bọọlụ ji ukwu?",
              options: ["Bọọlụ ukwu", "Basketball", "Tennis", "Swimming"],
              correctAnswer: "0",
              explanation: "Bọọlụ ukwu = football/soccer.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ịzụ Ahịa na Ego",
      lessons: [
        {
          title: "Ụdị Shops",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ebee ka ị na-azụ nri?",
              options: ["Supermarket", "Uwe shop", "Library", "Pharmacy"],
              correctAnswer: "0",
              explanation: "Supermarket = ebe a na-azụ nri.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ebe Ndị Dị Na Obodo",
      lessons: [
        {
          title: "Ebe Ndị Dị Mkpa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ebee ka a na-agwọ ndị ọrịa?",
              options: ["Hospitall", "Ụlọ akwụkwọ", "Mosque", "Restaurant"],
              correctAnswer: "0",
              explanation: "Hospitall = ụlọ ọgwụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Oge na Ubọchị",
      lessons: [
        {
          title: "Ịgụ Oge",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ogugu ole ka o nwere n'otu ụbọchị?",
              options: ["24", "12", "36", "48"],
              correctAnswer: "0",
              explanation: "Otu ụbọchị = awa 24.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Mkparịta Ụka Ndị Isi",
      lessons: [
        {
          title: "Okwu Ndị Mma",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị ị na-ekwu mgbe ị natara ihe?",
              options: ["Daalụ", "Biko", "Nnọọ", "Ka ọ dị"],
              correctAnswer: "0",
              explanation: "Daalụ = thank you.",
              language: "ig",
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
    const { course: courseData, modules: modulesData } = igboA1CourseData;
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
          language: q.language || "ig",
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
    console.error("Error creating Igbo A1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
