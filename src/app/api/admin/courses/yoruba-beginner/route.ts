import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const yorubaBeginnerCourseData = {
  course: {
    title: "Yoruba Beginner",
    description: "Learn Yoruba from scratch. Master greetings, numbers, common phrases, and descriptions.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Greetings & Introductions",
      lessons: [
        {
          title: "Basic Morning Greetings",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Good morning' in Yoruba?",
              hint: "Said in the morning hours",
              options: ["Ẹ káàrọ̀", "Ẹ káàsán", "Ẹ kú alẹ́", "Báwo ni"],
              correctAnswer: "0",
              explanation: "Ẹ káàrọ̀ means 'Good morning' and is used from dawn until late morning.",
            },
            {
              type: "MCQ",
              question: "What does 'Ẹ káàrọ̀' mean?",
              options: ["Good evening", "Good afternoon", "Good morning", "Good night"],
              correctAnswer: "2",
              explanation: "Ẹ káàrọ̀ is the Yoruba greeting for good morning.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ káàrọ̀ (Good morning to you)",
              correctAnswer: "Ẹ",
              explanation: "Ẹ is the polite form of 'you' in Yoruba greetings.",
            },
          ],
        },
        {
          title: "Afternoon & Evening Greetings",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Good afternoon' in Yoruba?",
              options: ["Ẹ káàrọ̀", "Ẹ káàsán", "Ẹ kú alẹ́", "O da abọ̀"],
              correctAnswer: "1",
              explanation: "Ẹ káàsán is used for good afternoon (midday to evening).",
            },
            {
              type: "MCQ",
              question: "What does 'Ẹ kú alẹ́' mean?",
              options: ["Good morning", "Good afternoon", "Good evening", "Goodbye"],
              correctAnswer: "2",
              explanation: "Ẹ kú alẹ́ means 'Good evening' and is used after sunset.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Ẹ káàsán' is used in the evening",
              correctAnswer: "false",
              explanation: "Ẹ káàsán is used in the afternoon, while Ẹ kú alẹ́ is for evening.",
            },
          ],
        },
        {
          title: "Casual Greetings",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'Báwo ni' mean?",
              options: ["Goodbye", "Thank you", "How are you?", "Good morning"],
              correctAnswer: "2",
              explanation: "Báwo ni is a common greeting meaning 'How are you?'",
            },
            {
              type: "MCQ",
              question: "How do you respond to 'Báwo ni'?",
              options: ["Ẹ káàrọ̀", "Mo wà dáadáa", "O da abọ̀", "Ẹ ṣé"],
              correctAnswer: "1",
              explanation: "Mo wà dáadáa means 'I am fine/doing well'.",
            },
            {
              type: "SPEECH",
              question: "Báwo ni?",
              correctAnswer: "Mo wà dáadáa",
              language: "yo",
              hint: "Say 'I am fine'",
            },
          ],
        },
        {
          title: "Farewells",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Goodbye' in Yoruba?",
              options: ["Ẹ káàrọ̀", "Báwo ni", "O da abọ̀", "Mo wà dáadáa"],
              correctAnswer: "2",
              explanation: "O da abọ̀ means 'Goodbye' or 'See you later'.",
            },
            {
              type: "MCQ",
              question: "What does 'O da abọ̀' mean?",
              options: ["Thank you", "See you later", "Good morning", "How are you"],
              correctAnswer: "1",
              explanation: "O da abọ̀ literally means 'I will return' - a way to say goodbye.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ da abọ̀ (See you tomorrow)",
              correctAnswer: "A",
              explanation: "A da abọ̀ means 'We will see each other tomorrow'.",
            },
          ],
        },
      ],
    },
    {
      title: "Numbers & Counting",
      lessons: [
        {
          title: "Numbers 1-5",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'ọ̀kan' in English?",
              options: ["Two", "Three", "One", "Four"],
              correctAnswer: "2",
              explanation: "ọ̀kan means 'one' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "How do you say 'three' in Yoruba?",
              options: ["èjí", "ẹ̀ta", "àrún", "ẹrin"],
              correctAnswer: "1",
              explanation: "ẹ̀ta means 'three' in Yoruba.",
            },
            {
              type: "ORDERING",
              question: "Arrange in order: èjí, ọ̀kan, àrún, ẹ̀ta",
              hint: "From smallest to largest (1, 2, 3, 5)",
              correctAnswer: "ọ̀kan,èjí,ẹ̀ta,àrún",
              explanation: "ọ̀kan=1, èjí=2, ẹ̀ta=3, àrún=5",
            },
            {
              type: "FILL_BLANK",
              question: "The number 5 in Yoruba is ___",
              correctAnswer: "àrún",
              explanation: "àrún means five in Yoruba.",
            },
          ],
        },
        {
          title: "Numbers 6-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'ẹ̀fà' mean?",
              options: ["Six", "Seven", "Eight", "Nine"],
              correctAnswer: "0",
              explanation: "ẹ̀fà means 'six' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "How do you say 'seven' in Yoruba?",
              options: ["ẹ̀fà", "èje", "ẹ̀jọ", "ẹ̀sán"],
              correctAnswer: "1",
              explanation: "èje means 'seven' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "What is 'ẹ̀wá'?",
              options: ["Eight", "Seven", "Nine", "Ten"],
              correctAnswer: "3",
              explanation: "ẹ̀wá means 'ten' in Yoruba.",
            },
            {
              type: "FILL_BLANK",
              question: "Eight in Yoruba is ___",
              correctAnswer: "ẹ̀jọ",
              explanation: "ẹ̀jọ means eight in Yoruba.",
            },
          ],
        },
        {
          title: "Numbers 11-20",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'eleven' in Yoruba?",
              options: ["ọ̀kanlá", "èjìlá", "ẹ̀ta lá", "ọgún"],
              correctAnswer: "0",
              explanation: "ọ̀kanlá (or oókànlá) is 11 in Yoruba.",
            },
            {
              type: "MCQ",
              question: "What does 'ọgún' mean?",
              options: ["Ten", "Fifteen", "Twenty", "Thirty"],
              correctAnswer: "2",
              explanation: "ọgún means 'twenty' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "ọkanlelogun is the Yoruba word for:",
              options: ["19", "21", "20", "18"],
              correctAnswer: "1",
              explanation: "ọkanlelogun = 21 (ọkan + le + logun = 1 + and + 20).",
            },
            {
              type: "FILL_BLANK",
              question: "Twelve in Yoruba is ___",
              correctAnswer: "èjìlá",
              explanation: "èjìlá means twelve (2 + 10).",
            },
          ],
        },
        {
          title: "Counting Practice",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What number represents 'ẹrin'?",
              options: ["3", "4", "5", "6"],
              correctAnswer: "1",
              explanation: "ẹrin means 'four' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "How many is 'ẹ̀sán'?",
              options: ["7", "8", "9", "10"],
              correctAnswer: "2",
              explanation: "ẹ̀sán means 'nine' in Yoruba.",
            },
            {
              type: "SPEECH",
              question: "èje",
              correctAnswer: "èje",
              language: "yo",
              hint: "Say the number seven in Yoruba",
            },
            {
              type: "CHECKBOX",
              question: "Select all numbers that equal 10:",
              options: ["ẹ̀wá", "ọgọ́rùn", "ẹ̀wá", "ọ̀kanlá"],
              correctAnswer: "[0,2]",
              explanation: "ẹ̀wá means 10. ọgọ́rùn also equals 100, and ọ̀kanlá is 11.",
            },
          ],
        },
      ],
    },
    {
      title: "Common Phrases",
      lessons: [
        {
          title: "Essential Phrases",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Thank you' in Yoruba?",
              options: ["Ẹ ṣé", "Báwo ni", "Mo wà dáadáa", "Jọ̀ọ́"],
              correctAnswer: "0",
              explanation: "Ẹ ṣé means 'Thank you' (honorific form).",
            },
            {
              type: "MCQ",
              question: "What does 'Mo dúpẹ́' mean?",
              options: ["Hello", "I am sorry", "I am grateful", "Goodbye"],
              correctAnswer: "2",
              explanation: "Mo dúpẹ́ means 'I am grateful/Thank you' (more formal).",
            },
            {
              type: "FILL_BLANK",
              question: "Please in Yoruba is ___",
              correctAnswer: "jọ̀ọ́",
              explanation: "jọ̀ọ́ means 'please' in Yoruba.",
            },
          ],
        },
        {
          title: "Polite Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Please' in Yoruba?",
              options: ["Ẹ ṣé", "Jọ̀ọ́", "Mo dúpẹ́", "Káàbọ̀"],
              correctAnswer: "1",
              explanation: "Jọ̀ọ́ is the word for 'please' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "What does 'káàbọ̀' mean?",
              options: ["Thank you", "Welcome", "Please", "Sorry"],
              correctAnswer: "1",
              explanation: "káàbọ̀ means 'welcome' as a response to thanks.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Ẹ má bínú' means 'Sorry'",
              correctAnswer: "true",
              explanation: "Ẹ má bínú literally means 'Do not be angry' - used to apologize.",
            },
          ],
        },
        {
          title: "Family References",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'My mother' in Yoruba?",
              options: ["àbú mi", "ìyá mi", "ọbá mi", "ọmọ mi"],
              correctAnswer: "1",
              explanation: "ìyá mi means 'my mother'.",
            },
            {
              type: "MCQ",
              question: "What does 'baba mi' mean?",
              options: ["My mother", "My father", "My child", "My brother"],
              correctAnswer: "1",
              explanation: "baba mi means 'my father'.",
            },
            {
              type: "FILL_BLANK",
              question: "My child in Yoruba is ___",
              correctAnswer: "ọmọ mi",
              explanation: "ọmọ mi means 'my child'.",
            },
          ],
        },
        {
          title: "Speaking Practice",
          type: "QUIZ",
          questions: [
            {
              type: "SPEECH",
              question: "Ẹ ṣé",
              correctAnswer: "Ẹ ṣé",
              language: "yo",
              hint: "Say thank you",
            },
            {
              type: "SPEECH",
              question: "Mo wà dáadáa",
              correctAnswer: "Mo wà dáadáa",
              language: "yo",
              hint: "Say I am fine",
            },
            {
              type: "SPEECH",
              question: "Báwo ni?",
              correctAnswer: "Báwo ni?",
              language: "yo",
              hint: "Ask how are you",
            },
          ],
        },
      ],
    },
    {
      title: "Colors & Descriptions",
      lessons: [
        {
          title: "Basic Colors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'red' in Yoruba?",
              options: ["àwo pupa", "àwo funfun", "àwo dudu", "àwo àsan"],
              correctAnswer: "0",
              explanation: "àwo pupa means 'red color' in Yoruba.",
            },
            {
              type: "MCQ",
              question: "What does 'àwo funfun' mean?",
              options: ["Red", "Black", "White", "Blue"],
              correctAnswer: "2",
              explanation: "àwo funfun means 'white color'.",
            },
            {
              type: "MCQ",
              question: "Which color is 'àwo dudu'?",
              options: ["White", "Black", "Blue", "Yellow"],
              correctAnswer: "1",
              explanation: "àwo dudu means 'black color'.",
            },
          ],
        },
        {
          title: "More Colors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the Yoruba word for 'blue'?",
              options: ["àwo ewé", "àwo ojo", "àwo fọn", "àwo pupa"],
              correctAnswer: "1",
              explanation: "àwo ojo means 'blue color' (lit: water color).",
            },
            {
              type: "MCQ",
              question: "'àwo ewé' means what color?",
              options: ["Green", "Purple", "Orange", "Pink"],
              correctAnswer: "0",
              explanation: "àwo ewé means 'green color' (lit: leaf color).",
            },
            {
              type: "FILL_BLANK",
              question: "Yellow in Yoruba is ___",
              correctAnswer: "àwo oran",
              explanation: "àwo oran means 'yellow/orange color'.",
            },
          ],
        },
        {
          title: "Describing Objects",
          type: "QUIZ",
          questions: [
            {
              type: "MATCHING",
              question: "Match the colors:",
              options: [
                { left: "pupa", right: "Red" },
                { left: "dudu", right: "Black" },
                { left: "funfun", right: "White" },
                { left: "ewé", right: "Green" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "pupa=red, dudu=black, funfun=white, ewé=green",
            },
            {
              type: "MCQ",
              question: "How would you describe a red car?",
              options: ["ìgbọnì àwo pupa", "Ọkọ̀ àwo pupa", "Ọkọ̀ àwo funfun", "Ọkọ̀ àwo dudu"],
              correctAnswer: "1",
              explanation: "Ọkọ̀ + color describes the car color.",
            },
          ],
        },
        {
          title: "Color Review",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What color is 'àwo pupa'?",
              options: ["White", "Red", "Blue", "Green"],
              correctAnswer: "1",
              explanation: "àwo pupa is red.",
            },
            {
              type: "CHECKBOX",
              question: "Select all green-related colors:",
              options: ["àwo ewé", "àwo oran", "àwo ojo", "àwo funfun"],
              correctAnswer: "[0]",
              explanation: "àwo ewé (leaf color) = green. àwo ojo = blue, àwo oran = yellow, àwo funfun = white.",
            },
            {
              type: "SPEECH",
              question: "àwo funfun",
              correctAnswer: "àwo funfun",
              language: "yo",
              hint: "Say white color",
            },
          ],
        },
      ],
    },
  ],
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { seedDefault = true } = body

    if (!seedDefault) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // First, find or create the Languages category
    let category = await db.category.findFirst({
      where: { name: { equals: "Languages", mode: "insensitive" } },
    })

    if (!category) {
      category = await db.category.create({
        data: {
          name: "Languages",
          description: "Learn African and world languages",
          icon: "🌍",
          color: "#008751",
        },
      })
    }

    // Check if Yoruba Beginner course already exists
    const existingCourse = await db.course.findFirst({
      where: { title: { equals: "Yoruba Beginner", mode: "insensitive" } },
    })

    if (existingCourse) {
      return NextResponse.json({
        message: "Yoruba Beginner course already exists",
        courseId: existingCourse.id,
      })
    }

    // Create the course
    const course = await db.course.create({
      data: {
        title: yorubaBeginnerCourseData.course.title,
        description: yorubaBeginnerCourseData.course.description,
        categoryId: category.id,
        difficulty: yorubaBeginnerCourseData.course.difficulty,
        minimumLevel: yorubaBeginnerCourseData.course.minimumLevel,
        isFree: true,
        icon: "� Yoruba",
        color: "#008751",
      },
    })

    // Create modules and lessons with questions
    for (let m = 0; m < yorubaBeginnerCourseData.modules.length; m++) {
      const moduleData = yorubaBeginnerCourseData.modules[m]

      const createdModule = await db.module.create({
        data: {
          title: moduleData.title,
          courseId: course.id,
          order: m + 1,
        },
      })

      for (let l = 0; l < moduleData.lessons.length; l++) {
        const lessonData = moduleData.lessons[l]

        const createdLesson = await db.lesson.create({
          data: {
            title: lessonData.title,
            moduleId: createdModule.id,
            type: lessonData.type,
            order: l + 1,
          },
        })

        // Create questions
        for (let q = 0; q < lessonData.questions.length; q++) {
          const questionData = lessonData.questions[q] as {
            type: string
            question: string
            hint?: string
            explanation?: string
            options?: string[] | string
            correctAnswer: string
            language?: string
          }

          let optionsStr: string | null = null
          if (questionData.options && Array.isArray(questionData.options)) {
            optionsStr = JSON.stringify(questionData.options)
          } else if (questionData.options && typeof questionData.options === "string") {
            optionsStr = questionData.options
          } else if (questionData.options) {
            optionsStr = JSON.stringify(questionData.options)
          }

          await db.question.create({
            data: {
              lessonId: createdLesson.id,
              type: questionData.type,
              question: questionData.question,
              hint: questionData.hint || null,
              explanation: questionData.explanation || null,
              options: optionsStr,
              correctAnswer: String(questionData.correctAnswer),
              language: questionData.language || null,
              order: q + 1,
            },
          })
        }
      }
    }

    return NextResponse.json({
      message: "Yoruba Beginner course created successfully",
      courseId: course.id,
      moduleCount: yorubaBeginnerCourseData.modules.length,
    })
  } catch (error: any) {
    console.error("Seed Yoruba course error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to seed Yoruba course" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if course exists
    const course = await db.course.findFirst({
      where: { title: { equals: "Yoruba Beginner", mode: "insensitive" } },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                _count: { select: { questions: true } },
              },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({
        exists: false,
        message: "Yoruba Beginner course does not exist",
      })
    }

    const totalQuestions = course.modules.reduce(
      (acc, m) =>
        acc + m.lessons.reduce((a, l) => a + l._count.questions, 0),
      0
    )

    return NextResponse.json({
      exists: true,
      course: {
        id: course.id,
        title: course.title,
        moduleCount: course.modules.length,
        lessonCount: course.modules.reduce((a, m) => a + m.lessons.length, 0),
        questionCount: totalQuestions,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check course" },
      { status: 500 }
    )
  }
}