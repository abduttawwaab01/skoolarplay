import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const igboC1CourseData = {
  course: {
    title: "Igbo C1 - Advanced",
    description: "Igbo maka ọkwa elu. Ghọta ederede siri ike, mkparịta ụka n'efu na nke ziri ezi, na njikwa ụtọ asụsụ mgbagwoju anya.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Nkenke Pụtara Ihe",
      lessons: [
        {
          title: "Ndịiche Dị Nro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ndịiche di n'etiti 'kwụsị' na 'kwụsị'?",
              options: ["Enweghị ndịiche", "Otu bụ nke jọrọ", "Otu bụ ọtụ ọtụ", "Otu bụ oge gara aga"],
              correctAnswer: "0",
              explanation: "Kwụsị = kwụsị (transitive); kwụsị = kwụsị (intransitive) - ndịiche dị nro.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ngwaa Okwu Ọgba",
      lessons: [
        {
          title: "Metaphor na Simile",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ simile?",
              options: ["Atụnyere ihe na 'dị ka'", "Metaphor", "Personification", "Hyperbole"],
              correctAnswer: "0",
              explanation: "Simile = atụnyere jiri 'dị ka' ma ọ bụ 'ka'.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ederede Mkpakọba",
      lessons: [
        {
          title: "Ndebe Mkpakọba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke bụ nke jọrọ?",
              options: ["A na-enyocha", "Enyochala m", "Anyị na-enyocha", "Nke a dị egwu"],
              correctAnswer: "0",
              explanation: "Ederede passive bụ nke jọrọ na mkpakọba.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ndebe Jọrọ vs Nke Na-emekọrịta",
      lessons: [
        {
          title: "N'usoro Ndebe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke kachasị jọrọ?",
              options: ["Ezigbo Maazị na Oriakụ", "Nnọọ unu", "Ị bụrụ", "Ụtụtụ ọma"],
              correctAnswer: "0",
              explanation: "Ezigbo Maazị na Oriakụ = ndebe kachasị jọrọ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Usoro Ahịrị Mgbagwoju Anya",
      lessons: [
        {
          title: "Usoro Ntinye N'okpuru",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ ahịrị n'okpuru?",
              options: ["Ahịrị nke bido na 'n'ihi'", "Ahịrị isi", "Ahịrị na-enweghị ngwaa", "Ajụjụ"],
              correctAnswer: "0",
              explanation: "Ahịrị n'okpuru bido na njikọ (n'ihi, na, ọ bụrụ...).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nkà na Uzo Omume",
      lessons: [
        {
          title: "Usoro Omume",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ deontology?",
              options: ["Uzo omume ọrụ", "Uzo nke obi uto", "Uzo nke omume oma", "Uzo nke ibu ọrụ"],
              correctAnswer: "0",
              explanation: "Deontology = usoro omume ọrụ (Kant).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nnyocha Akwụkwọ",
      lessons: [
        {
          title: "Nkatọ Akwụkwọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ allegory?",
              options: ["Okwu ihe onyonyo", "Ihe pụtara n'ihu", "Okwu oke", "Iyi ọchị"],
              correctAnswer: "0",
              explanation: "Allegory = okwu ihe onyonyo maka echiche dị nro.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njikọ Okwu Mkpakọba",
      lessons: [
        {
          title: "Njikọ Mkpakọba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe na-egosi ntụgharị?",
              options: ["Ma otu o sikwa", "Na mgbakwunye", "N'ihi ya", "Na mgbakwunye"],
              correctAnswer: "0",
              explanation: "Ma otu o sikwa = ma otu o sikwa (ntụgharị).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ahịrị Cleft",
      lessons: [
        {
          title: "Ahịrị Cleft ji 'bụ'",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ ahịrị cleft?",
              options: ["Ị bụ Meri na-abịa", "Meri na-abịa", "Na-abịa Meri", "Meri abịala"],
              correctAnswer: "0",
              explanation: "Ahịrị cleft na-emesi akụkụ nke ahịrị ike.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ngbanwe Maka Mmesie Ike",
      lessons: [
        {
          title: "Ngbanwe Na-eweda",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ ngbanwe?",
              options: ["Ọ dịghị mgbe m hụrụ nke a", "Ahụghị m nke a mgbe ọ bụla", "Nke a ahụghị m mgbe ọ bụla", "Ahụrụ m nke a mgbe ọ bụla"],
              correctAnswer: "0",
              explanation: "Jiri ntụgharị na-adịghị na mbido.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ọrụ Pụrụ Iche",
      lessons: [
        {
          title: "Okwu Iwu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu onye bụ 'plaintiff'?",
              options: ["Onye na-ekpe ikpe", "Onye ikpe", "Onye ọkàiwu", "Onye akaebe"],
              correctAnswer: "0",
              explanation: "Plaintiff = onye na-ekpe ikpe.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Sociolinguistics",
      lessons: [
        {
          title: "Ọdịiche Asụsụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ dialect?",
              options: ["Ọdịiche mpaghara", "Asụsụ ọkọrị", "Okwu ọrụ", "Okwu ala"],
              correctAnswer: "0",
              explanation: "Dialect = ọdịiche mpaghara.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Cognitive Linguistics",
      lessons: [
        {
          title: "Metaphors Cognitive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ conceptual metaphor?",
              options: ["Oge bụ ego", "Tebolu bụ osisi", "Akwụkwọ bụ akwụkwọ", "Ụlọ bụ nkume"],
              correctAnswer: "0",
              explanation: "Metaphor conceptual: echiche dị nro aghọta site na ihe ezi.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nnyocha Media Discourse",
      lessons: [
        {
          title: "Nnyocha Okwu Na-akpa Arụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe Critical Discourse Analysis na-amụ?",
              options: ["Mmekọrịta ike na ederede", "Ntụọ asụsụ", "Nhọrọ okwu", "Npụpụ ụda"],
              correctAnswer: "0",
              explanation: "CDA na-amụ ka asụsụ si egosipụta ike na echiche.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Usoro Nchọpụta",
      lessons: [
        {
          title: "Nhazi Nchọpụta",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ hypothesis?",
              options: ["Echiche enwere ike ịnwale", "Eziokwu", "Usoro echiche", "Iwu"],
              correctAnswer: "0",
              explanation: "Hypothesis = echiche enwere ike ịnwale.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nkatọ Omenala",
      lessons: [
        {
          title: "Usoro Omenala",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ Cultural Studies?",
              options: ["Ọmụmụ ọtụtụ ọrụ banyere omenala", "Sayensị eke", "Mgbakọ", "Egwuregwu"],
              correctAnswer: "0",
              explanation: "Cultural Studies = ọmụmụ ọtụtụ ọrụ banyere omenala.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Arụmụka Elulu",
      lessons: [
        {
          title: "Ntụghọ Mgbagha",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ Ad hominem?",
              options: ["Ibikọta onye, ọ bụghị arụmụka", "Ima ihe na-abụghị eziokwu", "Ntụgharị okirikiri", "Nwoke ọhịa"],
              correctAnswer: "0",
              explanation: "Ad hominem = ibikọta onye kama ịbikọta arụmụka.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Psycholinguistics",
      lessons: [
        {
          title: "Inweta Asụsụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ oge dị mkpa?",
              options: ["Window oge maka inweta asụsụ", "Oge ụra", "Oge ọrụ", "Oge ezumike"],
              correctAnswer: "0",
              explanation: "Oge dị mkpa = window kachasị mma maka inweta asụsụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Okwu Ụwa na Diplomacy",
      lessons: [
        {
          title: "Okwu Diplomatic",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ diplomatic?",
              options: ["Nkwube isi na ịkpachara anya", "Nke ozuzo na nke gbasara", "Nke iwe", "Nke ukwu ụda"],
              correctAnswer: "0",
              explanation: "Okwu diplomatic bụ nkwube isi na ịkpachara anya.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njikwa Ụdị",
      lessons: [
        {
          title: "Ọdịiche Ụdị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ register?",
              options: ["Ojiji asụsụ dịka ọnọdụ", "Nhọrọ okwu", "Ntụọ asụsụ", "Npụpụ ụda"],
              correctAnswer: "0",
              explanation: "Register = ojiji asụsụ dịka ọnọdụ.",
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
    const { course: courseData, modules: modulesData } = igboC1CourseData;
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
          language: q.language || "ig",
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
    console.error("Error creating Igbo C1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
