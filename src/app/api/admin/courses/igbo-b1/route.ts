import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const igboB1CourseData = {
  course: {
    title: "Igbo B1 - Intermediate",
    description: "Igbo maka ọkwa etiti. Chịkwanụ oge gara aga zuru ezu, ọnọdụ, ụdị okwu na mkparịta ụka ọrụ.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Oge Gara AgA Zuru Ezu",
      lessons: [
        {
          title: "I + Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke ziri ezi?",
              options: ["Ahụla m", "Ahụ m", "M na-ahụ", "M ga-ahụ"],
              correctAnswer: "0",
              explanation: "I + participle (ahụla) = present perfect.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ọnọdụ 1",
      lessons: [
        {
          title: "Ọ bụrụ + ugbu a, ga",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ọnọdụ nke mbụ?",
              options: ["Ọ bụrụ mmiri na-ezo, m ga-anọ", "Ọ bụrụ mmiri zoro, m ga-anọ", "Ọ bụrụ mmiri na-ezo, m na-anọ", "Ọ bụrụ mmiri zoro, m anọ"],
              correctAnswer: "0",
              explanation: "Ọ bụrụ + present, ga + infinitive = first conditional.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ahịrị Mkparịta Ụka",
      lessons: [
        {
          title: "Onye/Nke",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke ziri ezi?",
              options: ["Nwoke ahụ nke guzo ebe ahụ", "Nwoke ahụ nke guzo ebe ahụ nke", "Nwoke ahụ onye guzo ebe ahụ", "Nwoke ahụ nke ebe ahụ"],
              correctAnswer: "0",
              explanation: "Nke/onye for people/things.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ụdị Okwu Nzuzo",
      lessons: [
        {
          title: "Bụ + Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke bụ passive?",
              options: ["A na-agụ akwụkwọ", "M na-agụ akwụkwọ", "Aguola m akwụkwọ", "Ahụla m akwụkwọ"],
              correctAnswer: "0",
              explanation: "Bụ + participle = passive.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Okwu Nzuzo Ekwentị",
      lessons: [
        {
          title: "Mgbagbanwe Oge",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O kwuru: 'A na-agụ m' → O kwuru na ___ .",
              options: ["ọ na-agụ", "ọ na-agụ", "ọ gụrụ", "ọ agụla"],
              correctAnswer: "0",
              explanation: "Present → present in reported speech.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ngwaa Modal Nke Ọrụ",
      lessons: [
        {
          title: "Ga/Nwere Ike",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị na-egosi ọrụ?",
              options: ["Ga m aga", "M nwere ike aga", "M na-aga", "M ga-aga"],
              correctAnswer: "0",
              explanation: "Ga = obligation.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ngwaa Njikọ",
      lessons: [
        {
          title: "Ngwaa Njikọ Ndị Dị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Bilie' pụtara:",
              options: ["Kpọtara/Ịpụ", "Nọdụ", "Dina", "Hịa"],
              correctAnswer: "0",
              explanation: "Bilie = to wake up/get up.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ọrụ na Ndụ Ọrụ",
      lessons: [
        {
          title: "Ajụjụ Ọrụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị ị ga-ekwu banyere ike?",
              options: ["M bụ onye ọsịsọ", "M bụ ọsịsọ", "M nwere ọsịsọ", "M ga-abụ ọsịsọ"],
              correctAnswer: "0",
              explanation: "M bụ + adjective (ọsịsọ).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Gburugburu Ebe Obibi na Ọha",
      lessons: [
        {
          title: "Nsogbu Gburugburu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị na-akpata okpomọkụ ụwa?",
              options: ["Gas na-ekpo oku", "Osisi", "Oké osimiri", "Mmiri"],
              correctAnswer: "0",
              explanation: "Gas na-ekpo oku na-ejide oku.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Mgbanwe na Ụtụndụ",
      lessons: [
        {
          title: "Akụkọ Ụtụntụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ebee ka ị na-agụ akụkọ ugbu a?",
              options: ["Ebe ntanetị akụkọ", "Akwụkwọ nri", "Akụkọ ifo", "Ọkọwa okwu"],
              correctAnswer: "0",
              explanation: "Ebe ntanetị akụkọ nwere ihe omume ugbu a.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Agụmakwụkwọ na Mmụta",
      lessons: [
        {
          title: "Agụmakwụkwọ Elulu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ mahadum?",
              options: ["Ebe agụmakwụkwọ elulu", "Ụlọ akwụkwọ praimari", "Nursery", "Ụlọ ọrụ"],
              correctAnswer: "0",
              explanation: "Mahadum na-enye mmemme degree.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ahụ Ike na Ụdị Ndụ",
      lessons: [
        {
          title: "Nri Ahụ Ike",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ nri ahụ ike?",
              options: ["Akwụkwọ nri", "Sweets", "Chips", "Soda"],
              correctAnswer: "0",
              explanation: "Akwụkwọ nri bara uru.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njem na Njem Nlegharị Anyị",
      lessons: [
        {
          title: "Ebe Njem Nlegharị Anyị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị ndị njem na-ahụ na Paris?",
              options: ["Eiffel Tower", "Big Ben", "Statue of Liberty", "Great Wall"],
              correctAnswer: "0",
              explanation: "Eiffel Tower dị na Paris.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Teknụzụ na Ọhụụ",
      lessons: [
        {
          title: "Ntughari Dijital",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ AI?",
              options: ["Igwe na-eche echiche", "Kọmputa ngwa ngwa", "Nnukwu ihuenyo", "Ebe nchekwa"],
              correctAnswer: "0",
              explanation: "AI = igwe na-eche echiche dị ka mmadụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ndọrọ Ndọrọ Ọchịchị na Ọchịchị",
      lessons: [
        {
          title: "Ụdị Ndọrọ Ndọrọ Ọchịchị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ ochichi onye kwuo uche ya?",
              options: ["Ndị mmadụ na-ahọpụta", "Onye ndu otu", "Ndị agha na-achị", "Ndị ndu okpukperechi na-achị"],
              correctAnswer: "0",
              explanation: "Ochichi onye kwuo uche ya = democracy.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Sayensị na Okike",
      lessons: [
        {
          title: "Usoro Sayensị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ nzọụkwụ mbụ?",
              options: ["Jụọ ajụjụ", "Mee nnwale", "Mepụta nkwubi", "Nyochaa data"],
              correctAnswer: "0",
              explanation: "Usoro sayensị na-amalite site na ajụjụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nka na Omenala",
      lessons: [
        {
          title: "Nka Anya",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ ihe osise?",
              options: ["Nka na akwa", "Ihe ọkpụ a n'ụrọ", "Ụlọ nkume", "Iberibe egwu"],
              correctAnswer: "0",
              explanation: "Ihe osise = nka na akwa/akwụkwọ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Atụmatụ Ụdịnihu",
      lessons: [
        {
          title: "Ebumnuche Ọrụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ ebumnuche ọrụ?",
              options: ["Ịghọ dọkịta", "Rịọ nri ehihie", "Hịa nke ọma", "Ekiri TV"],
              correctAnswer: "0",
              explanation: "Ebumnuche ọrụ = nrọ ọrụ.",
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
    const { course: courseData, modules: modulesData } = igboB1CourseData;
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
    console.error("Error creating Igbo B1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
