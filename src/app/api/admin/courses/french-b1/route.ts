import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const frenchB1CourseData = {
  course: {
    title: "French B1 - Avance",
    description: "Intermediate French: subjunctive, conditionals, reported speech, and complex expressions.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Le Subjonctif (Subjunctive Mood)",
      lessons: [
        {
          title: "Forming the Subjunctive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the subjunctive form of 'etre' for 'que je'?",
              options: ["sois", "suis", "serai", "étais"],
              correctAnswer: "0",
              explanation: "Que je sois = that I be. Subjunctive of etre: sois, sois, soit, soyons, soyez, soient.",
            },
            {
              type: "FILL_BLANK",
              question: "Il faut que tu ___ (faire) tes devoirs.",
              correctAnswer: "fasses",
              explanation: "Faire (subjunctive): que je fasse, que tu fasses.",
            },
            {
              type: "MCQ",
              question: "How do you form the subjunctive for regular -er verbs?",
              options: [
                "Take 'ils' present form, drop -ent, add endings",
                "Take 'nous' present form, drop -ons, add endings",
                "Add -ait to the stem",
                "Use the infinitive directly",
              ],
              correctAnswer: "0",
              explanation: "Subjunctive: ils parlent → stem parl- + e, es, e, ions, iez, ent.",
            },
          ],
        },
        {
          title: "When to Use the Subjunctive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which expression triggers the subjunctive?",
              options: ["Il faut que", "Je pense que", "Je sais que", "Il est certain que"],
              correctAnswer: "0",
              explanation: "Il faut que (necessity) requires subjunctive. 'Je pense que' uses indicative.",
            },
            {
              type: "FILL_BLANK",
              question: "Je veux que vous ___ (venir) a la fete.",
              correctAnswer: "veniez",
              explanation: "Vouloir que + subjunctive. Venir → que vous veniez.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Je crois que' is followed by the subjunctive.",
              correctAnswer: "false",
              explanation: "'Je crois que' (I believe that) uses indicative. Negative 'Je ne crois pas que' uses subjunctive.",
            },
          ],
        },
        {
          title: "Subjunctive Practice",
          type: "QUIZ",
          questions: [
            {
              type: "CHECKBOX",
              question: "Select all sentences requiring the subjunctive:",
              options: [
                "Il faut que je parte.",
                "Je sais qu'il vient.",
                "Je souhaite que tu reussisses.",
                "Il est probable qu'il pleut.",
              ],
              correctAnswer: "[0,2]",
              explanation: "Il faut que + subj., Je souhaite que + subj. 'Je sais que' = indicative.",
            },
            {
              type: "FILL_BLANK",
              question: "Bien qu'il ___ (etre) fatigue, il travaille.",
              correctAnswer: "soit",
              explanation: "Bien que (although) always takes subjunctive. Etre → soit.",
            },
            {
              type: "SPEECH",
              question: "Il faut que nous finissions ce projet.",
              correctAnswer: "Il faut que nous finissions ce projet",
              language: "fr",
              hint: "Say: We must finish this project",
            },
          ],
        },
      ],
    },
    {
      title: "Le Conditionnel (Conditional Mood)",
      lessons: [
        {
          title: "Present Conditional",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'I would like'?",
              options: ["Je voudrais", "Je veux", "Je voulais", "Je veux bien"],
              correctAnswer: "0",
              explanation: "Vouloir → conditional: je voudrais (I would like).",
            },
            {
              type: "FILL_BLANK",
              question: "Si j'avais de l'argent, j'___ (acheter) une maison.",
              correctAnswer: "acheterais",
              explanation: "Si + imparfait → conditional. Acheterais = would buy.",
            },
            {
              type: "MCQ",
              question: "What are the conditional endings?",
              options: [
                "-ais, -ais, -ait, -ions, -iez, -aient",
                "-e, -es, -e, -ons, -ez, -ent",
                "-ais, -ais, -ait, -ions, -iez, -aient (same as imparfait)",
                "-ai, -as, -a, -ons, -ez, -ont",
              ],
              correctAnswer: "0",
              explanation: "Conditional endings match imparfait: -ais, -ais, -ait, -ions, -iez, -aient.",
            },
          ],
        },
        {
          title: "Si Clauses (If Clauses)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Si j'étais riche, je voyagerais' uses which structure?",
              options: [
                "Si + imparfait → conditionnel",
                "Si + present → futur",
                "Si + plus-que-parfait → conditionnel passe",
                "Si + imparfait → present",
              ],
              correctAnswer: "0",
              explanation: "Si + imparfait (j'étais) → conditionnel present (je voyagerais) = hypothetical present.",
            },
            {
              type: "FILL_BLANK",
              question: "Si tu étudiais, tu ___ (reussir) l'examen.",
              correctAnswer: "reussirais",
              explanation: "Si + imparfait → conditionnel present: reussirais.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: After 'si', you can use the conditional tense.",
              correctAnswer: "false",
              explanation: "'Si' is never followed by conditional. It's followed by present, imparfait, or plus-que-parfait.",
            },
          ],
        },
        {
          title: "Conditional Practice",
          type: "QUIZ",
          questions: [
            {
              type: "SPEECH",
              question: "Je voudrais visiter la France.",
              correctAnswer: "Je voudrais visiter la France",
              language: "fr",
              hint: "Say: I would like to visit France",
            },
            {
              type: "MATCHING",
              question: "Match the si clause type:",
              options: [
                { left: "Si + present", right: "Future/Command" },
                { left: "Si + imparfait", right: "Hypothetical present" },
                { left: "Si + pqp", right: "Hypothetical past" },
                { left: "Si + conditionnel", right: "Impossible (wrong)" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Si + present → future; Si + imparfait → conditional; Si + pqp → conditional past.",
            },
            {
              type: "FILL_BLANK",
              question: "Si nous avions su, nous ___ (venir) plus tot.",
              correctAnswer: "serions venus",
              explanation: "Si + plus-que-parfait → conditionnel passe: serions venus.",
            },
          ],
        },
      ],
    },
    {
      title: "Le Discours Indirect (Reported Speech)",
      lessons: [
        {
          title: "Reporting Statements",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you report 'Je suis fatigue'?",
              options: [
                "Il a dit qu'il était fatigue",
                "Il a dit qu'il est fatigue",
                "Il a dit que je suis fatigue",
                "Il a dit qu'il sera fatigue",
              ],
              correctAnswer: "0",
              explanation: "Present → imparfait in reported speech when the reporting verb is past tense.",
            },
            {
              type: "FILL_BLANK",
              question: "Il a dit: 'Je viendrai' → Il a dit qu'il ___ .",
              correctAnswer: "viendrait",
              explanation: "Future → conditional in reported speech: viendrait.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: When the reporting verb is present, tenses don't change.",
              correctAnswer: "true",
              explanation: "Il dit qu'il vient (no change). But Il a dit qu'il venait (change).",
            },
          ],
        },
        {
          title: "Reporting Questions & Commands",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you report 'Ou vas-tu?'",
              options: [
                "Il m'a demande ou j'allais",
                "Il m'a demande ou je vais",
                "Il m'a demande ou est-ce que je vais",
                "Il m'a demande ou j'irai",
              ],
              correctAnswer: "0",
              explanation: "Ou + subject + verb (no inversion) + imparfait for reported questions.",
            },
            {
              type: "FILL_BLANK",
              question: "Il m'a dit: 'Ferme la porte!' → Il m'a dit de ___ la porte.",
              correctAnswer: "fermer",
              explanation: "Commands become 'de + infinitive' in reported speech.",
            },
            {
              type: "MCQ",
              question: "'Elle m'a demande de venir' means:",
              options: [
                "She asked me to come",
                "She asked me if I came",
                "She told me I came",
                "She asked me where I came from",
              ],
              correctAnswer: "0",
              explanation: "Demander de + infinitive = to ask someone to do something.",
            },
          ],
        },
      ],
    },
    {
      title: "Les Connecteurs Logiques (Connectors)",
      lessons: [
        {
          title: "Cause & Effect",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'parce que' mean?",
              options: ["Because", "Although", "Therefore", "However"],
              correctAnswer: "0",
              explanation: "Parce que = because (explains reason).",
            },
            {
              type: "FILL_BLANK",
              question: "Je ne sors pas ___ il pleut.",
              correctAnswer: "parce qu",
              explanation: "Parce qu'il pleut = because it's raining. (parce que + vowel = parce qu')",
            },
            {
              type: "MCQ",
              question: "Which means 'therefore/so'?",
              options: ["Donc", "Parce que", "Cependant", "Bien que"],
              correctAnswer: "0",
              explanation: "Donc = therefore/so (shows consequence).",
            },
          ],
        },
        {
          title: "Contrast & Opposition",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'cependant' mean?",
              options: ["However", "Because", "Therefore", "Moreover"],
              correctAnswer: "0",
              explanation: "Cependant = however (formal contrast).",
            },
            {
              type: "FILL_BLANK",
              question: "___ qu'il soit jeune, il est tres intelligent.",
              correctAnswer: "Bien",
              explanation: "Bien que = although. Always followed by subjunctive.",
            },
            {
              type: "CHECKBOX",
              question: "Select all connectors expressing contrast:",
              options: ["Cependant", "Mais", "Donc", "Par contre", "Parce que"],
              correctAnswer: "[0,1,3]",
              explanation: "Cependant, mais, par contre = contrast. Donc = consequence. Parce que = cause.",
            },
          ],
        },
      ],
    },
    {
      title: "Exprimer ses Opinions (Opinions)",
      lessons: [
        {
          title: "Giving Your Opinion",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'In my opinion'?",
              options: ["A mon avis", "A mon idee", "En ma pensee", "Pour mon avis"],
              correctAnswer: "0",
              explanation: "A mon avis = In my opinion.",
            },
            {
              type: "FILL_BLANK",
              question: "Je pense ___ c'est une bonne idee.",
              correctAnswer: "que",
              explanation: "Je pense que = I think that (followed by indicative).",
            },
            {
              type: "SPEECH",
              question: "A mon avis, ce film est excellent.",
              correctAnswer: "A mon avis, ce film est excellent",
              language: "fr",
              hint: "Say: In my opinion, this film is excellent",
            },
          ],
        },
        {
          title: "Agreeing & Disagreeing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you strongly agree?",
              options: [
                "Je suis tout a fait d'accord",
                "Je ne suis pas d'accord",
                "Peut-etre",
                "Je ne sais pas",
              ],
              correctAnswer: "0",
              explanation: "Je suis tout a fait d'accord = I completely agree.",
            },
            {
              type: "FILL_BLANK",
              question: "Je ne suis pas ___ . (I disagree)",
              correctAnswer: "d'accord",
              explanation: "Je ne suis pas d'accord = I don't agree.",
            },
            {
              type: "MCQ",
              question: "'C'est vrai' means:",
              options: ["That's true", "That's false", "I don't know", "Maybe"],
              correctAnswer: "0",
              explanation: "C'est vrai = That's true / It's true.",
            },
          ],
        },
      ],
    },
    {
      title: "La Culture Francaise (French Culture)",
      lessons: [
        {
          title: "French Traditions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'Le 14 juillet'?",
              options: ["Bastille Day", "Christmas", "New Year's Day", "Labour Day"],
              correctAnswer: "0",
              explanation: "Le 14 juillet = Bastille Day, French National Day.",
            },
            {
              type: "FILL_BLANK",
              question: "La ___ est la fete nationale francaise.",
              correctAnswer: "fete",
              explanation: "La fete nationale = national holiday.",
            },
            {
              type: "MCQ",
              question: "What is 'La Galette des Rois'?",
              options: [
                "A cake eaten in January",
                "A Christmas dish",
                "A summer festival",
                "A type of cheese",
              ],
              correctAnswer: "0",
              explanation: "La Galette des Rois is eaten during Epiphany (January 6).",
            },
          ],
        },
        {
          title: "French Food Culture",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is an 'aperitif'?",
              options: [
                "A drink before a meal",
                "A dessert",
                "A type of bread",
                "A main course",
              ],
              correctAnswer: "0",
              explanation: "L'aperitif = a drink taken before a meal to stimulate appetite.",
            },
            {
              type: "FILL_BLANK",
              question: "En France, on prend le ___ entre 12h et 14h.",
              correctAnswer: "dejeuner",
              explanation: "Le dejeuner = lunch (midday meal).",
            },
            {
              type: "MATCHING",
              question: "Match the meal:",
              options: [
                { left: "le petit-dejeuner", right: "breakfast" },
                { left: "le dejeuner", right: "lunch" },
                { left: "le diner", right: "dinner" },
                { left: "le gouter", right: "afternoon snack" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "petit-dejeuner = breakfast, dejeuner = lunch, diner = dinner, gouter = snack.",
            },
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "B1 Comprehensive Review",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which sentence uses the subjunctive correctly?",
              options: [
                "Il faut que tu finisses.",
                "Il faut que tu finis.",
                "Il faut que tu finiras.",
                "Il faut que tu finissais.",
              ],
              correctAnswer: "0",
              explanation: "Il faut que + subjunctive: tu finisses.",
            },
            {
              type: "FILL_BLANK",
              question: "Si j'avais le temps, je ___ (voyager) plus.",
              correctAnswer: "voyagerais",
              explanation: "Si + imparfait → conditionnel present: voyagerais.",
            },
            {
              type: "MCQ",
              question: "Report: 'Je viendrai demain' → Il a dit qu'il ___ .",
              options: [
                "viendrait le lendemain",
                "viendra demain",
                "venait demain",
                "vient le lendemain",
              ],
              correctAnswer: "0",
              explanation: "Future → conditional + demain → le lendemain.",
            },
            {
              type: "SPEECH",
              question: "Je suis tout a fait d'accord avec toi.",
              correctAnswer: "Je suis tout a fait d'accord avec toi",
              language: "fr",
              hint: "Say: I completely agree with you",
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

    const existingCourse = await db.course.findFirst({
      where: { title: { equals: frenchB1CourseData.course.title, mode: "insensitive" } },
    })

    if (existingCourse) {
      return NextResponse.json({
        message: "French B1 course already exists",
        courseId: existingCourse.id,
      })
    }

    const course = await db.course.create({
      data: {
        title: frenchB1CourseData.course.title,
        description: frenchB1CourseData.course.description,
        categoryId: category.id,
        difficulty: frenchB1CourseData.course.difficulty,
        minimumLevel: frenchB1CourseData.course.minimumLevel,
        isFree: true,
        icon: "🇫🇷 French",
        color: "#2563eb",
      },
    })

    for (let m = 0; m < frenchB1CourseData.modules.length; m++) {
      const moduleData = frenchB1CourseData.modules[m]
      const createdModule = await db.module.create({
        data: { title: moduleData.title, courseId: course.id, order: m + 1 },
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

        for (let q = 0; q < lessonData.questions.length; q++) {
          const qd = lessonData.questions[q] as {
            type: string
            question: string
            hint?: string
            explanation?: string
            options?: string[] | string
            correctAnswer: string
            language?: string
          }
          let optionsStr: string | null = null
          if (qd.options && Array.isArray(qd.options)) {
            optionsStr = JSON.stringify(qd.options)
          } else if (qd.options && typeof qd.options === "string") {
            optionsStr = qd.options
          } else if (qd.options) {
            optionsStr = JSON.stringify(qd.options)
          }

          await db.question.create({
            data: {
              lessonId: createdLesson.id,
              type: qd.type,
              question: qd.question,
              hint: qd.hint || null,
              explanation: qd.explanation || null,
              options: optionsStr,
              correctAnswer: String(qd.correctAnswer),
              language: qd.language || null,
              order: q + 1,
            },
          })
        }
      }
    }

    const totalQuestions = frenchB1CourseData.modules.reduce(
      (acc, m) => acc + m.lessons.reduce((a, l) => a + l.questions.length, 0),
      0
    )

    return NextResponse.json({
      message: "French B1 course created successfully",
      courseId: course.id,
      moduleCount: frenchB1CourseData.modules.length,
      totalQuestions,
    })
  } catch (error: any) {
    console.error("Seed French B1 course error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to seed French B1 course" },
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

    const course = await db.course.findFirst({
      where: { title: { equals: frenchB1CourseData.course.title, mode: "insensitive" } },
      include: {
        modules: {
          include: {
            lessons: {
              include: { _count: { select: { questions: true } } },
            },
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ exists: false, message: "French B1 course does not exist" })
    }

    const totalQuestions = course.modules.reduce(
      (acc, m) => acc + m.lessons.reduce((a, l) => a + l._count.questions, 0),
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
