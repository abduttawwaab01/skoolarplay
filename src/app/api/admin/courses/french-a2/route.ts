import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const frenchA2CourseData = {
  course: {
    title: "French A2 - Intermediaire",
    description: "Elementary French: past tense, daily life, shopping, travel, and basic conversations.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Le Passe Compose (Past Tense)",
      lessons: [
        {
          title: "Passé Composé with Avoir",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the past participle of 'parler' (to speak)?",
              options: ["parlé", "parler", "parlant", "parle"],
              correctAnswer: "0",
              explanation: "The past participle of -er verbs ends in -é. Parler → parlé.",
            },
            {
              type: "FILL_BLANK",
              question: "J'ai ___ (manger) une pomme.",
              correctAnswer: "mangé",
              explanation: "Manger is a regular -er verb. Past participle: mangé.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Passé composé uses 'avoir' or 'etre' as helper verbs.",
              correctAnswer: "true",
              explanation: "Passé composé is formed with avoir/etre + past participle.",
            },
            {
              type: "MCQ",
              question: "How do you say 'I watched TV' in French?",
              options: ["J'ai regardé la télé", "Je regarde la télé", "Je regardais la télé", "J'ai regarder la télé"],
              correctAnswer: "0",
              explanation: "Passé composé: j'ai (avoir) + regardé (past participle).",
            },
          ],
        },
        {
          title: "Passé Composé with Etre",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which verb uses 'etre' in passé composé?",
              options: ["aller", "manger", "parler", "finir"],
              correctAnswer: "0",
              explanation: "Aller (to go) uses etre. The DR MRS VANDERTRAMP verbs use etre.",
            },
            {
              type: "FILL_BLANK",
              question: "Je suis ___ (aller) au cinema.",
              correctAnswer: "allé",
              explanation: "Aller uses etre. Je suis allé(e).",
            },
            {
              type: "MCQ",
              question: "'Elle est partie' means:",
              options: ["She left", "She is leaving", "She will leave", "She leaves"],
              correctAnswer: "0",
              explanation: "Partir (to leave) uses etre. Elle est partie = She left (feminine).",
            },
            {
              type: "SPEECH",
              question: "Je suis allé au marché.",
              correctAnswer: "Je suis allé au marché",
              language: "fr",
              hint: "Say: I went to the market",
            },
          ],
        },
        {
          title: "Irregular Past Participles",
          type: "QUIZ",
          questions: [
            {
              type: "MATCHING",
              question: "Match the verb to its past participle:",
              options: [
                { left: "faire", right: "fait" },
                { left: "prendre", right: "pris" },
                { left: "voir", right: "vu" },
                { left: "dire", right: "dit" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "faire→fait, prendre→pris, voir→vu, dire→dit.",
            },
            {
              type: "MCQ",
              question: "What is the past participle of 'écrire' (to write)?",
              options: ["écrit", "écrire", "écrivant", "écris"],
              correctAnswer: "0",
              explanation: "Écrire → écrit (irregular).",
            },
            {
              type: "FILL_BLANK",
              question: "Nous avons ___ (prendre) le bus.",
              correctAnswer: "pris",
              explanation: "Prendre → pris. Nous avons pris = We took.",
            },
          ],
        },
        {
          title: "Past Tense Practice",
          type: "QUIZ",
          questions: [
            {
              type: "CHECKBOX",
              question: "Select all sentences in passé composé:",
              options: [
                "J'ai mangé hier.",
                "Je mange maintenant.",
                "Elle est partie ce matin.",
                "Nous allons au parc.",
              ],
              correctAnswer: "[0,2]",
              explanation: "Passé composé sentences: j'ai mangé (I ate), elle est partie (she left).",
            },
            {
              type: "FILL_BLANK",
              question: "Hier, j'ai ___ (finir) mes devoirs.",
              correctAnswer: "fini",
              explanation: "Finir → fini. J'ai fini = I finished.",
            },
            {
              type: "ORDERING",
              question: "Put in order: hier / au / je / restaurant / suis / allé",
              hint: "I went to the restaurant yesterday",
              correctAnswer: "je,suis,allé,au,restaurant,hier",
              explanation: "Je suis allé au restaurant hier.",
            },
          ],
        },
      ],
    },
    {
      title: "L'Imparfait (Imperfect Tense)",
      lessons: [
        {
          title: "Forming the Imparfait",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the imparfait ending for 'nous'?",
              options: ["-ions", "-ais", "-ait", "-aient"],
              correctAnswer: "0",
              explanation: "Imparfait endings: je -ais, tu -ais, il -ait, nous -ions, vous -iez, ils -aient.",
            },
            {
              type: "FILL_BLANK",
              question: "Je ___ (etre) content quand j'étais petit.",
              correctAnswer: "étais",
              explanation: "Etre → j'étais (I was).",
            },
            {
              type: "MCQ",
              question: "'Quand j'étais jeune, je jouais' means:",
              options: ["When I was young, I used to play", "When I am young, I play", "When I will be young, I will play", "When I was young, I played once"],
              correctAnswer: "0",
              explanation: "Imparfait describes habitual past actions: I used to play / I was playing.",
            },
          ],
        },
        {
          title: "Imparfait vs Passé Composé",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "When do you use the imparfait?",
              options: ["Habitual past actions or descriptions", "Completed actions", "Future plans", "Commands"],
              correctAnswer: "0",
              explanation: "Imparfait = habits, descriptions, ongoing past actions.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'J'ai mangé' (passé composé) describes a completed action.",
              correctAnswer: "true",
              explanation: "Passé composé = specific, completed action in the past.",
            },
            {
              type: "FILL_BLANK",
              question: "Il ___ (faire) beau quand je suis sorti.",
              correctAnswer: "faisait",
              explanation: "Faisait (imparfait) = it was (weather description). Je suis sorti (passé composé) = I went out (completed).",
            },
          ],
        },
        {
          title: "Imparfait Practice",
          type: "QUIZ",
          questions: [
            {
              type: "SPEECH",
              question: "Quand j'étais petit, j'aimais le chocolat.",
              correctAnswer: "Quand j'étais petit, j'aimais le chocolat",
              language: "fr",
              hint: "Say: When I was little, I loved chocolate",
            },
            {
              type: "CHECKBOX",
              question: "Select all imparfait sentences:",
              options: [
                "Je jouais au foot tous les jours.",
                "J'ai joué au foot hier.",
                "Il faisait froid.",
                "Nous avons mangé.",
              ],
              correctAnswer: "[0,2]",
              explanation: "Imparfait: je jouais (I used to play), il faisait (it was).",
            },
            {
              type: "FILL_BLANK",
              question: "Nous ___ (habiter) a Paris quand nous étions enfants.",
              correctAnswer: "habitions",
              explanation: "Habiter → nous habitions (we used to live).",
            },
          ],
        },
      ],
    },
    {
      title: "Le Futur Proche (Near Future)",
      lessons: [
        {
          title: "Aller + Infinitive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'I am going to eat'?",
              options: ["Je vais manger", "Je mange", "Je vais mangé", "J'ai manger"],
              correctAnswer: "0",
              explanation: "Futur proche: aller (conjugated) + infinitive. Je vais manger.",
            },
            {
              type: "FILL_BLANK",
              question: "Tu ___ (aller) étudier ce soir.",
              correctAnswer: "vas",
              explanation: "Tu vas + infinitive = You are going to (do something).",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Nous allons partir' means 'We are going to leave'.",
              correctAnswer: "true",
              explanation: "Nous allons (aller, nous form) + partir (infinitive) = We are going to leave.",
            },
          ],
        },
        {
          title: "Future Plans & Intentions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Comment dit-on 'Tomorrow I will travel'?",
              options: ["Demain je vais voyager", "Demain je voyage", "Demain j'ai voyagé", "Demain je voyageais"],
              correctAnswer: "0",
              explanation: "Demain + futur proche: je vais voyager.",
            },
            {
              type: "FILL_BLANK",
              question: "Ce weekend, je vais ___ (visiter) mes grands-parents.",
              correctAnswer: "visiter",
              explanation: "Je vais + infinitive = I am going to visit.",
            },
            {
              type: "SPEECH",
              question: "Je vais acheter une voiture.",
              correctAnswer: "Je vais acheter une voiture",
              language: "fr",
              hint: "Say: I am going to buy a car",
            },
          ],
        },
      ],
    },
    {
      title: "Les Pronoms (Pronouns)",
      lessons: [
        {
          title: "Direct Object Pronouns",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What replaces 'le livre' (the book) as a direct object?",
              options: ["le", "la", "les", "lui"],
              correctAnswer: "0",
              explanation: "Le livre is masculine singular → le. Je le lis = I read it.",
            },
            {
              type: "FILL_BLANK",
              question: "Tu vois Marie? Oui, je ___ vois.",
              correctAnswer: "la",
              explanation: "Marie is feminine singular → la. Je la vois = I see her.",
            },
            {
              type: "MCQ",
              question: "'Je les ai achetés' means:",
              options: ["I bought them", "I bought it", "I buy them", "I will buy them"],
              correctAnswer: "0",
              explanation: "Les = them (plural). Je les ai achetés = I bought them.",
            },
          ],
        },
        {
          title: "Indirect Object Pronouns",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the indirect object pronoun for 'to him/to her'?",
              options: ["lui", "le", "la", "leur"],
              correctAnswer: "0",
              explanation: "Lui = to him/to her. Je lui parle = I speak to him/her.",
            },
            {
              type: "FILL_BLANK",
              question: "Je donne le cadeau ___ mes amis. → Je ___ donne le cadeau.",
              correctAnswer: "leur",
              explanation: "Mes amis (plural) → leur. Je leur donne le cadeau = I give them the gift.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Je leur parle' means 'I speak to them'.",
              correctAnswer: "true",
              explanation: "Leur = to them (plural indirect object).",
            },
          ],
        },
      ],
    },
    {
      title: "La Vie Quotidienne (Daily Life)",
      lessons: [
        {
          title: "Daily Routine Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'I wake up'?",
              options: ["Je me reveille", "Je me couche", "Je me lave", "Je m'habille"],
              correctAnswer: "0",
              explanation: "Se reveiller = to wake up. Je me reveille.",
            },
            {
              type: "MATCHING",
              question: "Match the routine activity:",
              options: [
                { left: "se laver", right: "to wash oneself" },
                { left: "s'habiller", right: "to get dressed" },
                { left: "se coucher", right: "to go to bed" },
                { left: "se brosser", right: "to brush" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "se laver = wash, s'habiller = dress, se coucher = go to bed, se brosser = brush.",
            },
            {
              type: "SPEECH",
              question: "Je me leve a sept heures.",
              correctAnswer: "Je me leve a sept heures",
              language: "fr",
              hint: "Say: I get up at seven o'clock",
            },
          ],
        },
        {
          title: "Describing Your Day",
          type: "QUIZ",
          questions: [
            {
              type: "FILL_BLANK",
              question: "Le matin, je ___ (prendre) mon petit-dejeuner.",
              correctAnswer: "prends",
              explanation: "Prendre (present): je prends = I take/have.",
            },
            {
              type: "MCQ",
              question: "How do you say 'I take a shower'?",
              options: ["Je prends une douche", "Je prends un bain", "Je me douche", "Both A and C"],
              correctAnswer: "3",
              explanation: "Both 'Je prends une douche' and 'Je me douche' are correct.",
            },
            {
              type: "CHECKBOX",
              question: "Select all morning activities:",
              options: [
                "Je me reveille",
                "Je me couche",
                "Je prends le petit-dejeuner",
                "Je vais au travail",
              ],
              correctAnswer: "[0,2,3]",
              explanation: "Morning: wake up, have breakfast, go to work. Going to bed is evening.",
            },
          ],
        },
      ],
    },
    {
      title: "Les Courses (Shopping)",
      lessons: [
        {
          title: "At the Market",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you ask 'How much does it cost?'",
              options: ["Combien ca coute?", "Qu'est-ce que c'est?", "Ou est le marche?", "Je voudrais..."],
              correctAnswer: "0",
              explanation: "Combien ca coute? = How much does it cost?",
            },
            {
              type: "FILL_BLANK",
              question: "Je voudrais un ___ de pain, s'il vous plait.",
              correctAnswer: "kilo",
              explanation: "Un kilo de pain = a kilo of bread.",
            },
            {
              type: "SPEECH",
              question: "Je voudrais deux kilos de pommes.",
              correctAnswer: "Je voudrais deux kilos de pommes",
              language: "fr",
              hint: "Say: I would like two kilos of apples",
            },
          ],
        },
        {
          title: "Clothing Shopping",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Can I try this on?'",
              options: ["Je peux essayer?", "Je peux acheter?", "Je peux payer?", "Je peux regarder?"],
              correctAnswer: "0",
              explanation: "Je peux essayer? = Can I try (this on)?",
            },
            {
              type: "FILL_BLANK",
              question: "Quelle est votre ___? (What is your size?)",
              correctAnswer: "taille",
              explanation: "Taille = size. Quelle est votre taille?",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'C'est trop cher' means 'It's too expensive'.",
              correctAnswer: "true",
              explanation: "Cher = expensive. Trop = too (much).",
            },
          ],
        },
      ],
    },
    {
      title: "Voyager (Travel)",
      lessons: [
        {
          title: "At the Airport",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'le billet' mean?",
              options: ["Ticket", "Bag", "Passport", "Gate"],
              correctAnswer: "0",
              explanation: "Le billet = ticket (plane, train, etc.).",
            },
            {
              type: "FILL_BLANK",
              question: "Ou est la ___ d'embarquement? (boarding gate)",
              correctAnswer: "porte",
              explanation: "La porte d'embarquement = boarding gate.",
            },
            {
              type: "MCQ",
              question: "'Mon vol est en retard' means:",
              options: ["My flight is delayed", "My flight is cancelled", "My flight is on time", "My flight is early"],
              correctAnswer: "0",
              explanation: "En retard = late/delayed.",
            },
          ],
        },
        {
          title: "Asking for Directions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'Excuse me, where is the station?'",
              options: [
                "Excusez-moi, ou est la gare?",
                "Excusez-moi, ou est l'hotel?",
                "Excusez-moi, ou est le marche?",
                "Excusez-moi, ou est l'aeroport?",
              ],
              correctAnswer: "0",
              explanation: "La gare = train station.",
            },
            {
              type: "FILL_BLANK",
              question: "Tournez a ___ (left) puis allez tout droit.",
              correctAnswer: "gauche",
              explanation: "A gauche = to the left. A droite = to the right.",
            },
            {
              type: "ORDERING",
              question: "Put the directions in order: gauche / a / Tournez / puis / droit / allez / tout",
              hint: "Turn left then go straight",
              correctAnswer: "Tournez,a,gauche,puis,allez,tout,droit",
              explanation: "Tournez a gauche puis allez tout droit.",
            },
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "A2 Comprehensive Review",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which sentence is in passé composé?",
              options: [
                "J'ai fini mon travail.",
                "Je finis mon travail.",
                "Je finissais mon travail.",
                "Je vais finir mon travail.",
              ],
              correctAnswer: "0",
              explanation: "J'ai fini = passé composé (avoir + past participle).",
            },
            {
              type: "FILL_BLANK",
              question: "Quand j'étais enfant, je ___ (jouer) au foot.",
              correctAnswer: "jouais",
              explanation: "Imparfait for childhood habits: je jouais.",
            },
            {
              type: "MCQ",
              question: "'Je vais etudier' is which tense?",
              options: ["Futur proche", "Passe compose", "Imparfait", "Present"],
              correctAnswer: "0",
              explanation: "Aller + infinitive = futur proche (near future).",
            },
            {
              type: "SPEECH",
              question: "Je suis alle au cinema hier.",
              correctAnswer: "Je suis alle au cinema hier",
              language: "fr",
              hint: "Say: I went to the cinema yesterday",
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
      where: { title: { equals: frenchA2CourseData.course.title, mode: "insensitive" } },
    })

    if (existingCourse) {
      return NextResponse.json({
        message: "French A2 course already exists",
        courseId: existingCourse.id,
      })
    }

    const course = await db.course.create({
      data: {
        title: frenchA2CourseData.course.title,
        description: frenchA2CourseData.course.description,
        categoryId: category.id,
        difficulty: frenchA2CourseData.course.difficulty,
        minimumLevel: frenchA2CourseData.course.minimumLevel,
        isFree: true,
        icon: "🇫🇷 French",
        color: "#2563eb",
      },
    })

    for (let m = 0; m < frenchA2CourseData.modules.length; m++) {
      const moduleData = frenchA2CourseData.modules[m]

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

    const totalQuestions = frenchA2CourseData.modules.reduce(
      (acc, m) => acc + m.lessons.reduce((a, l) => a + l.questions.length, 0),
      0
    )

    return NextResponse.json({
      message: "French A2 course created successfully",
      courseId: course.id,
      moduleCount: frenchA2CourseData.modules.length,
      totalQuestions,
    })
  } catch (error: any) {
    console.error("Seed French A2 course error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to seed French A2 course" },
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
      where: { title: { equals: frenchA2CourseData.course.title, mode: "insensitive" } },
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
        message: "French A2 course does not exist",
      })
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
