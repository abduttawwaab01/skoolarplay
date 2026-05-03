import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const igboA2CourseData = {
  course: {
    title: "Igbo A2 - Elementary",
    description: "Igbo maka ọkwa elementrị. Mụta oge gara aga, ọdịnihu, ntụnyere na mkparịta ụka kwa ụbọchị.",
    difficulty: "ELEMENTARY",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Oge Gara AgA2",
      lessons: [
        {
          title: "Ngwaa Ndị Nkịtị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ka ị sị 'I walked' na Igbo?",
              options: ["Agara m ije", "Aga m ije", "M na-aga ije", "M alawo ije"],
              correctAnswer: "0",
              explanation: "Agara m ije = I walked (past).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Okwu Mgbe Ọdịnihu",
      lessons: [
        {
          title: "Ga + Ngwaa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ka ị sị 'I am going to go'?",
              options: ["Aga m aga", "Aga m", "Agara m", "M na-aga"],
              correctAnswer: "0",
              explanation: "Ga + ngwaa = ọdịnihu.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Inye Ntụziaka",
      lessons: [
        {
          title: "Prepositions nke Mgbago",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke ziri ezi?",
              options: ["Gaa n'ụlọ ahịa", "Gaa n'ime ụlọ ahịa", "Gaa na ụlọ ahịa", "Gaa site ụlọ ahịa"],
              correctAnswer: "0",
              explanation: "N' = n' (direction).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ịzụ Ahịa na Uwe",
      lessons: [
        {
          title: "Uwe Ndị Dị Iche",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ka ị sị 'shirt'?",
              options: ["Uwe elu", "Trouser", "Akpụkpọ ụkwụ", "Okpu"],
              correctAnswer: "0",
              explanation: "Uwe elu = shirt.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ahụ Ike na Ahụ",
      lessons: [
        {
          title: "Ọrịa Ndị Nkịtị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe na-akpata ọkụ ahụ?",
              options: ["Oyi bąrą", "Ọkpụkpụ gbajiri", "Mmerụ ahụ", "Nkwọcha"],
              correctAnswer: "0",
              explanation: "Oyi bąrą na-akpata ọkụ ahụ.",
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
              question: "Kedu ụgbọ mmadụ na-efe elu igwe?",
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
      title: "Ntụnyere",
      lessons: [
        {
          title: "Ntụnyere na -rịrị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke ziri ezi?",
              options: ["Ukwu karịa", "Mmụnwa ukwu karịa", "Ukwnu karịa", "Ukwnu dị ka"],
              correctAnswer: "0",
              explanation: "Ukwnu = ntụnyere (comparative).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ndebe Ugbu A Na-aga N'ihu",
      lessons: [
        {
          title: "Na-eme + Ihe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu 'I am eating' na Igbo?",
              options: ["M na-eri nri", "M eri nri", "M riri nri", "M erila nri"],
              correctAnswer: "0",
              explanation: "Na-eme = present continuous.",
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
      title: "Ihu Igwe na Oge",
      lessons: [
        {
          title: "Amụma Igwe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'sunny' pụtara?",
              options: ["Anwụ na-achasi", "Mmiri na-ezo", "Snow", "Ifufe"],
              correctAnswer: "0",
              explanation: "Anwụ na-achasi = sunny.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ọrụ na Ọkachamara",
      lessons: [
        {
          title: "Aha Ọrụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu onye na-akụzi ụmụ akwụkwọ?",
              options: ["Onye nkuzi", "Dọkịta", "Ọkwọ ụgbọ", "Onye nri"],
              correctAnswer: "0",
              explanation: "Onye nkuzi = teacher.",
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
          title: "Nri Ndị Dị Iche",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu aha 'bread' na Igbo?",
              options: ["Nri", "Osikapa", "Anụ", "Azụ"],
              correctAnswer: "0",
              explanation: "Nri = bread/food.",
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
          title: "Isi Nkuzi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu aha 'math' na Igbo?",
              options: ["Mgbakọ na mkpa", "Akụkọ ihe", "Nka", "Egwu"],
              correctAnswer: "0",
              explanation: "Mgbakọ na mkpa = math.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Oge Ntụrụndụ na Hobbies",
      lessons: [
        {
          title: "Egwuregwu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu egwuregwu ị na-agba bọọlụ na nkata?",
              options: ["Basketball", "Bọọlụ ukwu", "Tennis", "Swimming"],
              correctAnswer: "0",
              explanation: "Basketball = basketball.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Mgbanwe na Ntụrụndụ",
      lessons: [
        {
          title: "Ụdị Mgbanwe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ebe ị na-agụ akụkọ ndị na-eme ugbu a?",
              options: ["Akwụkwọ akụkọ", "Akwụkwọ nri", "Akụkọ ifo", "Ọkọwa okwu"],
              correctAnswer: "0",
              explanation: "Akwụkwọ akụkọ = newspaper.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Gburugburu Ebe Obibi",
      lessons: [
        {
          title: "Nsogbu Gburugburu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe na-akpata okpo oku uwa?",
              options: ["Gas na-ekpo oku", "Osisi", "Mmiri", "Ifufe"],
              correctAnswer: "0",
              explanation: "Gas na-ekpo oku na-ejide oku.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ndị Mmadụ na Mmekọrịta",
      lessons: [
        {
          title: "Àgwà",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'kind' pụtara?",
              options: ["Obi ọma", "Iwe", "Ogologo", "Obere"],
              correctAnswer: "0",
              explanation: "Obi ọma = kind.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ịzụ Ahịa na Ọrụ",
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
      title: "Usoro Ụbọchị na Agwa",
      lessons: [
        {
          title: "Adverbs nke Ugboro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'always' pụtara?",
              options: ["Mgbe niile", "Oge ụfọdụ", "Ọ dịghị mgbe", "Adịlaala"],
              correctAnswer: "0",
              explanation: "Mgbe niile = always.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Omenala na Omenaala",
      lessons: [
        {
          title: "Ememe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu mgbe ekeresimesi dị?",
              options: ["Disemba 25", "Oktoba 31", "Jenụwarị 1", "Mee 5"],
              correctAnswer: "0",
              explanation: "Ekeresimesi = Disemba 25.",
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
    const { course: courseData, modules: modulesData } = igboA2CourseData;
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
    console.error("Error creating Igbo A2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
