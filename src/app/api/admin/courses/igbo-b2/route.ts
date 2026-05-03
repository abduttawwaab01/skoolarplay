import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const igboB2CourseData = {
  course: {
    title: "Igbo B2 - Upper Intermediate",
    description: "Igbo maka ọkwa etiti elu. Ghọta ederede mgbagwoju anya, mkparịta ụka n'efu, na ụtọ asụsụ mgbagwoju anya.",
    difficulty: "UPPER_INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Ọnọdụ Agwakọtara",
      lessons: [
        {
          title: "Ọ bụrụ + past perfect, conditional",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke bụ ọnọdụ nke atọ?",
              options: ["Ọ bụrụ m nwere oge, m gaara bịa", "Ọ bụrụ m nwere oge, m ga-abịa", "Ọ bụrụ m nwere oge, m na-abịa", "Ọ bụrụ m nwere oge, m bịara"],
              correctAnswer: "0",
              explanation: "Ọ bụrụ + past perfect, conditional = third conditional (hypothetical).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ụdị Okwu Nzuzo Elulu",
      lessons: [
        {
          title: "Passive na modal",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke bụ passive na modal?",
              options: ["A ga-agụ akwụkwọ", "M ga-agụ akwụkwọ", "A na-agụ akwụkwọ", "M na-agụ akwụkwọ"],
              correctAnswer: "0",
              explanation: "Modal + passive (participle).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nchọpụta na Echeta",
      lessons: [
        {
          title: "Ga + bụrụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị na-egosi njide?na",
              options: ["Ga-abụ n'ụlọ", "Pụrụ ịbụ n'ụlọ", "Pụrụ ịbụ na ọ nọ n'ụlọ", "Ga-abụ n'ụlọ"],
              correctAnswer: "0",
              explanation: "Ga-abụ = deduction (certainty).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ahịrị Mkparịta Ụka Elulu",
      lessons: [
        {
          title: "Relatives na prepositions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu nke ziri ezi?",
              options: ["Akwụkwọ ahụ m na-ekwu banyere ya", "Akwụkwọ ahụ m na-ekwu banyere ya na", "Akwụkwọ ahụ m na-ekwu banyere ya", "Akwụkwọ ahụ, m na-ekwu banyere ya"],
              correctAnswer: "0",
              explanation: "Nke + preposition + reflexive pronoun.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Okwu Njikọ Ụdị",
      lessons: [
        {
          title: "Okwu Njikọ Ndị Ama",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị pụtara 'kwụsịlị'?",
              options: ["Ghọta/Mepụta", "Bido", "Kwụsị", "Kwụsị"],
              correctAnswer: "0",
              explanation: "Kwụsịlị = to recover/regain.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Mkparịta Ụka Ụlọ Ọrụ",
      lessons: [
        {
          title: "Emails Ụlọ Ọrụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ka ị ga-esi amalite email n'ọrụ?",
              options: ["Ezigbo Maazị Okeke", "Nnọọ Okeke", "Hapụ ụmụnne", "Ụtụtụ ọma"],
              correctAnswer: "0",
              explanation: "Ezigbo = formal.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Akụkọ Ihe Ndị Mere Eme na Omenala",
      lessons: [
        {
          title: "Ihe Ndị Mere Eme",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu mgbe mgbidi Berlin dara?",
              options: ["1989", "1945", "1961", "2000"],
              correctAnswer: "0",
              explanation: "Mgbidi Berlin dara na 1989.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Sayensị na Teknụzụ",
      lessons: [
        {
          title: "Nchọpụta Sayensị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ AI?",
              options: ["Igwe na-eche echiche", "Kọmputa ngwa ngwa", "Nnukwu ihuenyo", "Ebe nchekwa"],
              correctAnswer: "0",
              explanation: "AI na-eṅomi ọgụgụ isi mmadụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ndọrọ Ndọrọ Ọchịchị na Okwu Ọha",
      lessons: [
        {
          title: "Okwu Ndọrọ Ndọrọ Ọchịchị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ ochichi onye kwuo uche ya?",
              options: ["Ndị mmadụ na-ahọpụta", "Onye ndu otu", "Ndị agha na-achị", "Ndị ndu okpukperechi na-achị"],
              correctAnswer: "0",
              explanation: "Ochichi onye kwuo uche ya = ọchịchị ndị mmadụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Echiche Ndị Dị Nrọ",
      lessons: [
        {
          title: "Echiche Nkànu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ nnwere onwe?",
              options: ["Onwe onye", "Kọfị n'efu", "Ụgbọ ala ngwa", "Ụlọ buru ibu"],
              correctAnswer: "0",
              explanation: "Nnwere onwe = onwe onye.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Okwu Njikọ Mgbagwoju Anya",
      lessons: [
        {
          title: "Ngwaa Njikọ Mgbagwoju Anya",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị pụtara 'ghọta'?",
              options: ["Ghọta/Nweta", "Bido", "Kwụsị", "Hịa"],
              correctAnswer: "0",
              explanation: "Ghọta = to recover/regain.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Gburugburu Ebe Obibi na Nkwado",
      lessons: [
        {
          title: "Mgbanwe Ihu Igwe",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị na-akpata okpomọkụ ụwa?",
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
      title: "Agụmakwụkwọ na Nkuzi",
      lessons: [
        {
          title: "Usoro Mmụta",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ constructivism?",
              options: ["Mmụta site na ahụmịhe", "Kpụ akụkụ", "Nkuzi oge gboo", "Nnwale"],
              correctAnswer: "0",
              explanation: "Constructivism = mmụta site na ahụmịhe onwe.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ahụ Ike na Ọgwụ",
      lessons: [
        {
          title: "Okwu Ọgwụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ 'High Blood Pressure'?",
              options: ["Ọbara mgbali elu", "Ọbara mgbali ala", "Isi ọwụwa", "Ọkụ ahụ"],
              correctAnswer: "0",
              explanation: "Ọbara mgbali elu = hypertension.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Mgbanwe na Ntụntụ",
      lessons: [
        {
          title: "Edemede Akụkọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ headline?",
              options: ["Aha akụkọ", "Ahịrị okwu", "Nkọwa foto", "Kọlụm"],
              correctAnswer: "0",
              explanation: "Headline = aha akụkọ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nka na Akwụkwọ",
      lessons: [
        {
          title: "Nnyocha Akwụkwọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ ihe atụ?",
              options: ["Nkọwa site na ihe atụ", "Nkọwa nkịtị", "Okwu ukwu", "Ijiji"],
              correctAnswer: "0",
              explanation: "Ihe atụ = metaphor (direct comparison).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Akụnụba na Ego",
      lessons: [
        {
          title: "Usoro Akụnụba",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ inflation?",
              options: ["Ọnụ ahịa na-abawanye", "Ọnụ ahịa na-ebelata", "Ụgwọ na-abawanye", "Enweghị ọrụ"],
              correctAnswer: "0",
              explanation: "Inflation = ọpụpụ ego n'ozuzu.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Sayensị Nke Ụbụrụ na Omume",
      lessons: [
        {
          title: "Usoro Nkànu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ conditioning?",
              options: ["Mmụta site na njikọ", "Àgwà amụrụ", "Trauma", "Nrọ"],
              correctAnswer: "0",
              explanation: "Conditioning = mmụta site na nzaghachi.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Jikọọwa Ụwa na Omenala",
      lessons: [
        {
          title: "Mgbanwe Omenala",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ globalization?",
              options: ["Njikọ ụwa", "Omenala mpaghara", "Ikewapụ", "Agha"],
              correctAnswer: "0",
              explanation: "Globalization = njikọ ụwa.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ọhụụ na Ụdịnihu",
      lessons: [
        {
          title: "Teknụzụ Ndị Na-apụta",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Gịnị bụ Blockchain?",
              options: ["Ebe data kesara", "Ụlọ akụ etiti", "Njikọ ọha", "Egwuregwu"],
              correctAnswer: "0",
              explanation: "Blockchain = ebe data kesara na-enweghị mgbanwe.",
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
    const { course: courseData, modules: modulesData } = igboB2CourseData;
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
          language: q.language || "ig",
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
    console.error("Error creating Igbo B2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
