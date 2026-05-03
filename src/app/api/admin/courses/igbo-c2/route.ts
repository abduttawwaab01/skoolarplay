import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const igboC2CourseData = {
  course: {
    title: "Igbo C2 - Mastery",
    description: "Igbo maka ọkwa njikwa. Ihe fọrọ nke nne, ghọta ihe fọrọ nke niile, mkparịta ụka ziri ezi na nke pụrụ iche.",
    difficulty: "MASTERY",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Nkenke Okwu",
      lessons: [
        {
          title: "Okwu Ndị Adịghị Mma",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'obscure' pụtara?",
              options: ["Amaghị/Mgbagwoju anya", "Doro anya", "Nnukwu ụda", "Ngwa ngwa"],
              correctAnswer: "0",
              explanation: "Obscure = amaghị ma ọ bụ mgbagwoju anya.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Okwu Ochie na Akwụkwọ",
      lessons: [
        {
          title: "Asụsụ Shakespeare",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'thou' bụ na Igbo ochie?",
              options: ["Gị (oge gboo)", "M", "Ọ", "Ụnụ"],
              correctAnswer: "0",
              explanation: "Thou = gị (oge gboo).",
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
          title: "Okwu Ọrụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ technical language?",
              options: ["Okwu pụrụ iche maka ọrụ", "Asụsụ nkịtị", "Okwu ala", "Dialect"],
              correctAnswer: "0",
              explanation: "Technical language = okwu pụrụ iche maka ọrụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Dialects na Slang",
      lessons: [
        {
          title: "Ọdịiche Mpaghara",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'Moin' bụ?",
              options: ["Ndebe na Northern Germany", "Daalụ", "Ka ọ dị", "Biko"],
              correctAnswer: "0",
              explanation: "Moin = ndebe pụrụ iche na Northern Germany.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njikwa Metaphor",
      lessons: [
        {
          title: "Metaphors Mgbagwoju Anya",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ extended metaphor?",
              options: ["Metaphor gafere paragraf", "Atụnyere otu okwu", "Okwu oke", "Iyi ọchị"],
              correctAnswer: "0",
              explanation: "Extended metaphor = atụnyere gafere n'akụkụ ederede.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Arụmụka Dị Elu",
      lessons: [
        {
          title: "Rhetoric Elulu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ Ethos?",
              options: ["Ntụkwasị obi onye na-ekwu okwu", "Mkpesa mmetụta uche", "Ihe akaebe mgbagho", "Ọchị"],
              correctAnswer: "0",
              explanation: "Ethos = ime ka onye na-ekwu okwu nwee ntụkwasị obi.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nkenke Omenala Dị Nro",
      lessons: [
        {
          title: "Gburugburu Omenala",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ cultural context?",
              options: ["Ihe ndị dị n'azu", "Ntụọ asụsụ", "Nhọrọ okwu", "Npụpụ ụda"],
              correctAnswer: "0",
              explanation: "Cultural context = ihe ndị a pụtaghị n'ihu.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ntụgharị Okwu Njikọ",
      lessons: [
        {
          title: "Okwu Njikọ Elulu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe 'iji ọkụkọ abịa' pụtara?",
              options: ["Inwe ije/eme emume", "Ọkụkọ na-abịa", "Izu ike", "Iyi ngwa"],
              correctAnswer: "0",
              explanation: "Jiji ọkụkọ abịa = inwe ije na ihe ọṅụṅụ.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nzu adjuncta Ziri Ezi",
      lessons: [
        {
          title: "Usoro Mgbakọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ reduced clause?",
              options: ["Inwe obi ụtọ", "M bụ obi ụtọ", "Nyere m aka", "Obi ụtọ"],
              correctAnswer: "0",
              explanation: "Reduced clause = ngwaa isi wedara na gerund/participle.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ederede Creative",
      lessons: [
        {
          title: "Nkà Ide Akwụkwọ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ stylistic device?",
              options: ["Ihe asụsụ eji ama ụma", "Njehie", "Ihe n'apụta", "Usoro ntụọ asụsụ"],
              correctAnswer: "0",
              explanation: "Stylistic device = ihe asụsụ eji ama ụma.",
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
          title: "Ide Sayensị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ abstract?",
              options: ["Nchịkọta", "Mmalite", "Ahụ isi", "Nkwubi"],
              correctAnswer: "0",
              explanation: "Abstract = nchịkọta mkpụmkpụ nke ederede sayensị.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Mkparịta Ọrụ",
      lessons: [
        {
          title: "Mkparịta Executive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ Elevator Pitch?",
              options: ["Nkọwa mkpụmkpụ", "Nkọwa ogologo", "Email", "Akụkọ"],
              correctAnswer: "0",
              explanation: "Elevator Pitch = nkọwa mkpụmkpụ na nke na-eme ka a kwenye.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nnyocha Nkatọ",
      lessons: [
        {
          title: "Usoro Nnyocha",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ SWOT analysis?",
              options: ["Ike/Adịghị ike/Ohere/Egwu", "Nnyocha ego", "Usoro marketing", "Mmepụta"],
              correctAnswer: "0",
              explanation: "SWOT = Strengths, Weaknesses, Opportunities, Threats.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njikọ Omenala",
      lessons: [
        {
          title: "Ọgụgụ Isi Omenala",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ cultural intelligence?",
              options: ["Ikike ịgafe omenala dị iche iche", "IQ", "Inweta asụsụ", "Njem"],
              correctAnswer: "0",
              explanation: "Cultural intelligence = imeghari n'omenala dị iche iche.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Ntụgharị Okwu Pụrụ Iche",
      lessons: [
        {
          title: "Usoro Ntụgharị",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ equivalence na ntụgharị?",
              options: ["Mmetụta otu onye na-agụ ya", "Ntụgharị okwu-na-okwu", "Ntụgharị n'efu", "Iwepụ"],
              correctAnswer: "0",
              explanation: "Equivalence = otu mmetụta na onye na-agụ ya.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Usoro Asụsụ",
      lessons: [
        {
          title: "Generative Grammar",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ universal grammar?",
              options: ["Usoro asụsụ amụrụ na ya", "Usoro amatara", "Usoro ụlọ akwụkwọ", "Dialect"],
              correctAnswer: "0",
              explanation: "Universal grammar = ikike asụsụ amụrụ na ya (Chomsky).",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Nnyocha Discourse",
      lessons: [
        {
          title: "Nnyocha Okwu Na-akpa Arụ",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe discourse analysis na-amụ?",
              options: ["Asụsụ na gburugburu mmekọrịta", "Ntụọ asụsụ", "Nhọrọ okwu", "Npụpụ ụda"],
              correctAnswer: "0",
              explanation: "Discourse analysis = asụsụ dị ka omume mmekọrịta.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Rhetoric Dị Mma",
      lessons: [
        {
          title: "Ime Ka A Kwenye Dị Mma",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ Logos?",
              options: ["Mkpesa mgbagho", "Mkpesa mmetụta uche", "Ntụkwasị obi", "Ọchị"],
              correctAnswer: "0",
              explanation: "Logos = ime ka a kwenye site na mgbagho/arụmụka.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Njikọ Omenala",
      lessons: [
        {
          title: "Ịbịbịa Omenala",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe bụ cultural hybridity?",
              options: ["Ngwakọta omenala", "Omenala dị ọcha", "Ikewapụ", "Agha"],
              correctAnswer: "0",
              explanation: "Cultural hybridity = ngwakọta omenala dị iche iche.",
              language: "ig",
            },
          ],
        },
      ],
    },
    {
      title: "Igosi Njikwa",
      lessons: [
        {
          title: "Asụsụ fọrọ nke nne",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kedu ihe n'egosi ọkwa C2?",
              options: ["Ghọta ihe fọrọ nke niile", "Mkparịta ụka mbụ", "Ahịrị dị mfe", "Njehie dị ụbara"],
              correctAnswer: "0",
              explanation: "C2 = ikike fọrọ nke nne.",
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
    const { course: courseData, modules: modulesData } = igboC2CourseData;
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
            xpReward: 40 + Math.floor(Math.random() * 30),
            gemReward: 5 + Math.floor(Math.random() * 8),
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
          points: q.points || 25,
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
    console.error("Error creating Igbo C2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
