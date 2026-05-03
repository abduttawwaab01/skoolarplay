import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const swahiliB1CourseData = {
  course: {
    title: "Swahili B1 - Intermediate",
    description: "Kiswahili kwa kiwango cha kati. Dhibitisha wakati uliopita kamili, sharti, hali ya kupasuliwa, na mawasiliano ya kitaaluma.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Wakati Ulio Kamili",
      lessons: [
        {
          title: "Kuwa + Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sahihi?",
              options: ["Nimeona", "Naona", "Nitaona", "Nilionge"],
              correctAnswer: "0",
              explanation: "Kuwa + participle (imeona) = present perfect.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sharti la Kwanza",
      lessons: [
        {
          title: "Kama + present, future",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sharti la kwanza?",
              options: ["Kama mvua itanyesha, nitakaa", "Kama mvua inyesha, ningekaa", "Kama mvua ilinyesha, nilikaa", "Kama mvua imekwisha, nimekaa"],
              correctAnswer: "0",
              explanation: "Kama + present, future = first conditional.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vishazi vya Kurejelea",
      lessons: [
        {
          title: "Ambaye/Ambacho",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni sahihi?",
              options: ["Mtu ambaye anasimama hapo", "Mtu ambaye anasimama hapo anaye", "Mtu anaye anasimama hapo", "Mtu ambaye anasimama hapo na"],
              correctAnswer: "0",
              explanation: "Ambaye/ambacho kwa watu/vitu.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Hali ya Kupasuliwa",
      lessons: [
        {
          title: "Kuwa + Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni passive?",
              options: ["Kitabu kinasomwa", "Ninasoma kitabu", "Nilisoma kitabu", "Nimesoma kitabu"],
              correctAnswer: "0",
              explanation: "Kuwa + participle = passive.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Ujumbe wa Kuripotiwa",
      lessons: [
        {
          title: "Mabadiliko ya Wakati",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Alisema: 'Nina choka' → Alisema kuwa ___ .",
              options: ["ana choka", "alikuwa choka", "amechoka", "atakuwa choka"],
              correctAnswer: "0",
              explanation: "Present → present katika ujumbe wa kuripotiwa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vitenzi vya Modal ya Wajibu",
      lessons: [
        {
          title: "Lazima na Paswa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi kinaonyesha wajibu?",
              options: ["Lazima niende", "Naweza kwenda", "Naruhusiwa kwenda", "Nitaenda"],
              correctAnswer: "0",
              explanation: "Lazima = wajibu mkubwa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Vitenzi vya Kishikaji",
      lessons: [
        {
          title: "Vitenzi vya Kishikaji",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Amka' maana yake ni:",
              options: ["Kuamka/Inuka", "Kukaa", "Kulala", "Kwenda kulala"],
              correctAnswer: "0",
              explanation: "Amka = to wake up/get up.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Kazi na Maisha ya Kitaaluma",
      lessons: [
        {
          title: "Mahojiano",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unasemaje kuhusu nguvu zako?",
              options: ["Mimi ni mpenda kazi", "Mimi ni upendeleo", "Nina upendeleo", "Mimi kuwa mpenda kazi"],
              correctAnswer: "0",
              explanation: "Mimi + adjective (mpenda kazi).",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mazingira na Jamii",
      lessons: [
        {
          title: "Shida za Mazingira",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi husababisha ongezeko la joto la dunia?",
              options: ["Gesi chafu", "Miti", "Bahari", "Mvua"],
              correctAnswer: "0",
              explanation: "Gesi chafu hushika joto.",
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
          title: "Habari",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Unasoma habari za sasa wapi?",
              options: ["Tovuti ya habari", "Kitabu cha mapishi", "Riwaya", "Kamusi"],
              correctAnswer: "0",
              explanation: "Tovuti za habari zina matukio ya sasa.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Elimu na Ujifunzaji",
      lessons: [
        {
          title: "Elimu ya Juu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Chuo kikuu ni nini?",
              options: ["Mahali pa elimu ya juu", "Shule ya msingi", "Chekechea", "Shule ya ufundi"],
              correctAnswer: "0",
              explanation: "Vyuo vikuu hutoa shahada.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Afya na Mtindo wa Maisha",
      lessons: [
        {
          title: "Lishe Bora",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kipi ni chakula cha afya?",
              options: ["Mboga", "Pipi", "Krisp", "Soda"],
              correctAnswer: "0",
              explanation: "Mboga ni ya lishe.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Safari na Utalii",
      lessons: [
        {
          title: "Maeneo ya Kitalii",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Watalii wanapenda kuona nini Paris?",
              options: ["Mnara wa Eiffel", "Big Ben", "Kikapu cha Uhuru", "Ukingo wa Kati"],
              correctAnswer: "0",
              explanation: "Mnara wa Eiffel uko Paris.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Teknolojia na Ubunifu",
      lessons: [
        {
          title: "Mabadiliko ya Dijitali",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "AI ni nini?",
              options: ["Mashine zinazofikiri", "Kompyuta za haraka", "Skrini kubwa", "Kumbukumbu nyingi"],
              correctAnswer: "0",
              explanation: "AI = mashine zinazofikiri kama binadamu.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Siasa na Serikali",
      lessons: [
        {
          title: "Mifumo ya Kisiasa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Demokrasia ni nini?",
              options: ["Wananchi huchagua", "Kiongozi mmoja", "Jeshi linatawala", "Viongozi wa dini hutawala"],
              correctAnswer: "0",
              explanation: "Demokrasia = serikali ya wananchi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sayansi na Asili",
      lessons: [
        {
          title: "Mbinu ya Sayansi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Hatua ya kwanza ni nini?",
              options: ["Kuuliza swali", "Kufanya majaribio", "Kutoa hitimisho", "Kuchambua data"],
              correctAnswer: "0",
              explanation: "Mbinu ya sayansi huanza na swali.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Sanaa na Utamaduni",
      lessons: [
        {
          title: "Sanaa ya Kuona",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Mchoro ni nini?",
              options: ["Sanaa kwenye turubai", "Sanamu ya udongo", "Jengo la mawe", "Kipande cha muziki"],
              correctAnswer: "0",
              explanation: "Mchoro = sanaa kwenye turubai/karatasi.",
              language: "sw",
            },
          ],
        },
      ],
    },
    {
      title: "Mipango ya Baadaye",
      lessons: [
        {
          title: "Malengo ya Kazi",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Malengo ya kazi ni nini?",
              options: ["Kuwa daktari", "Kula chakula cha mchana", "Kulala vizuri", "Kutazama TV"],
              correctAnswer: "0",
              explanation: "Malengo ya kazi = tamaa za kitaaluma.",
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
    const { course: courseData, modules: modulesData } = swahiliB1CourseData;
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
    console.error("Error creating Swahili B1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
