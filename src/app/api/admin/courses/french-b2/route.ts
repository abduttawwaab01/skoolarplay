import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const frenchB2CourseData = {
  course: {
    title: "French B2 - Avance Superieur",
    description: "Upper intermediate French: advanced grammar, formal writing, debate, and nuanced expression.",
    difficulty: "ADVANCED",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Grammaire Avancee (Advanced Grammar)",
      lessons: [
        {
          title: "Plus-que-parfait (Past Perfect)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you form the plus-que-parfait?",
              options: [
                "Imparfait of avoir/etre + past participle",
                "Present of avoir/etre + past participle",
                "Conditional of avoir + past participle",
                "Imperative + past participle",
              ],
              correctAnswer: "0",
              explanation: "Plus-que-parfait = imparfait of avoir/etre + past participle. J'avais mange = I had eaten.",
            },
            {
              type: "FILL_BLANK",
              question: "Quand je suis arrive, il avait deja ___ (partir).",
              correctAnswer: "parti",
              explanation: "Plus-que-parfait: il avait parti = he had already left.",
            },
            {
              type: "MCQ",
              question: "'Elle avait fini avant midi' means:",
              options: [
                "She had finished before noon",
                "She finished before noon",
                "She was finishing before noon",
                "She will finish before noon",
              ],
              correctAnswer: "0",
              explanation: "Plus-que-parfait expresses an action completed before another past action.",
            },
          ],
        },
        {
          title: "Gerondif & Participe Present",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you form the gerund (gerondif)?",
              options: [
                "en + present participle (-ant)",
                "avec + infinitive",
                "par + past participle",
                "de + infinitive",
              ],
              correctAnswer: "0",
              explanation: "Gerondif = en + present participle. En mangeant = while eating.",
            },
            {
              type: "FILL_BLANK",
              question: "___ (marcher), il chantait.",
              correctAnswer: "En marchant",
              explanation: "En marchant = while walking (simultaneous actions).",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'En etudiant, j'ai appris beaucoup' means 'By studying, I learned a lot'.",
              correctAnswer: "true",
              explanation: "Gerondif expresses manner or simultaneity: by/while studying.",
            },
          ],
        },
      ],
    },
    {
      title: "Le Discours Formel (Formal Language)",
      lessons: [
        {
          title: "Writing Formal Letters",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you formally begin a letter to someone you don't know?",
              options: [
                "Madame, Monsieur",
                "Cher ami",
                "Salut",
                "Coucou",
              ],
              correctAnswer: "0",
              explanation: "Madame, Monsieur is the standard formal greeting in French letters.",
            },
            {
              type: "FILL_BLANK",
              question: "Veuillez agreer, Madame, l'expression de mes ___ .",
              correctAnswer: "sentiments distingues",
              explanation: "Standard formal closing: l'expression de mes sentiments distingues.",
            },
            {
              type: "MCQ",
              question: "'Je vous saurais reconnaissant de bien vouloir...' means:",
              options: [
                "I would be grateful if you would...",
                "I know you want to...",
                "I thank you for wanting...",
                "I will know if you want...",
              ],
              correctAnswer: "0",
              explanation: "Formal request expression: I would be grateful if you would...",
            },
          ],
        },
        {
          title: "Formal Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the formal equivalent of 'Je veux'?",
              options: ["Je souhaiterais", "Je desire", "Je veux bien", "Je veux que"],
              correctAnswer: "0",
              explanation: "Je souhaiterais (conditional) is more formal/polite than Je veux.",
            },
            {
              type: "MATCHING",
              question: "Match informal to formal:",
              options: [
                { left: "Je veux", right: "Je souhaiterais" },
                { left: "Mais", right: "Cependant" },
                { left: "Donc", right: "Par consequent" },
                { left: "Beaucoup", right: "Un grand nombre de" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Formal register: Je veux → Je souhaiterais, Mais → Cependant, Donc → Par consequent.",
            },
            {
              type: "FILL_BLANK",
              question: "Nous vous prions de bien vouloir nous ___. (formal 'send us')",
              correctAnswer: "envoyer",
              explanation: "Nous vous prions de bien vouloir nous envoyer = We kindly ask you to send us.",
            },
          ],
        },
      ],
    },
    {
      title: "L'Argumentation (Argumentation)",
      lessons: [
        {
          title: "Building Arguments",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which phrase introduces an argument?",
              options: [
                "D'une part... d'autre part",
                "En conclusion",
                "Pour commencer",
                "Cependant",
              ],
              correctAnswer: "0",
              explanation: "D'une part... d'autre part = on the one hand... on the other hand (presents arguments).",
            },
            {
              type: "FILL_BLANK",
              question: "___ (Moreover), il est important de considerer...",
              correctAnswer: "De plus",
              explanation: "De plus = moreover/in addition (adds an argument).",
            },
            {
              type: "MCQ",
              question: "How do you introduce a counter-argument?",
              options: [
                "En revanche",
                "Premierement",
                "En somme",
                "Tout d'abord",
              ],
              correctAnswer: "0",
              explanation: "En revanche = on the other hand/in contrast (introduces opposing view).",
            },
          ],
        },
        {
          title: "Debate & Discussion",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you politely disagree in a debate?",
              options: [
                "Je ne partage pas cet avis",
                "Tu as tort",
                "C'est nul",
                "Non, jamais",
              ],
              correctAnswer: "0",
              explanation: "Je ne partage pas cet avis = I don't share this view (polite disagreement).",
            },
            {
              type: "FILL_BLANK",
              question: "___ , il faut reconnaitre que... (Nevertheless)",
              correctAnswer: "Neanmoins",
              explanation: "Neanmoins = nevertheless/however (formal concession).",
            },
            {
              type: "SPEECH",
              question: "En conclusion, je dirais que les avantages l'emportent sur les inconvenients.",
              correctAnswer: "En conclusion, je dirais que les avantages l'emportent sur les inconvenients",
              language: "fr",
              hint: "Say: In conclusion, I would say the advantages outweigh the disadvantages",
            },
          ],
        },
      ],
    },
    {
      title: "Vocabulaire Avance (Advanced Vocabulary)",
      lessons: [
        {
          title: "Abstract Concepts",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'l'echeance' mean?",
              options: ["Deadline", "Achievement", "Exchange", "Escape"],
              correctAnswer: "0",
              explanation: "L'echeance = deadline/due date.",
            },
            {
              type: "FILL_BLANK",
              question: "La ___ (freedom) d'expression est un droit fondamental.",
              correctAnswer: "liberte",
              explanation: "La liberte = freedom/liberty.",
            },
            {
              type: "MCQ",
              question: "'L'equilibre' means:",
              options: ["Balance", "Equation", "Equality", "Equipment"],
              correctAnswer: "0",
              explanation: "L'equilibre = balance (physical or metaphorical).",
            },
          ],
        },
        {
          title: "Idiomatic Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'Mettre son grain de sel' mean?",
              options: [
                "To give unwanted advice",
                "To add salt to food",
                "To be generous",
                "To stay quiet",
              ],
              correctAnswer: "0",
              explanation: "Mettre son grain de sel = to butt in/give unwanted opinion.",
            },
            {
              type: "FILL_BLANK",
              question: "Il a ___ (broken the ice) en racontant une blague.",
              correctAnswer: "brise la glace",
              explanation: "Briser la glace = to break the ice.",
            },
            {
              type: "CHECKBOX",
              question: "Select the correct meaning of 'Avoir le cafard':",
              options: [
                "To feel depressed/blue",
                "To have a cockroach",
                "To be very happy",
                "To feel bored/sad",
              ],
              correctAnswer: "[0,3]",
              explanation: "Avoir le cafard = to feel depressed/sad/blue.",
            },
          ],
        },
      ],
    },
    {
      title: "Litterature & Media (Literature & Media)",
      lessons: [
        {
          title: "Understanding News Articles",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'un article de presse'?",
              options: [
                "A press/newspaper article",
                "A legal document",
                "A scientific paper",
                "A blog post",
              ],
              correctAnswer: "0",
              explanation: "Un article de presse = a newspaper/press article.",
            },
            {
              type: "FILL_BLANK",
              question: "Le ___ (headline) annonce la nouvelle principale.",
              correctAnswer: "titre",
              explanation: "Le titre = the headline/title.",
            },
            {
              type: "MCQ",
              question: "What does 'selon les sources' mean?",
              options: [
                "According to sources",
                "Along the sources",
                "Beyond the sources",
                "Despite the sources",
              ],
              correctAnswer: "0",
              explanation: "Selon = according to. Selon les sources = according to sources.",
            },
          ],
        },
        {
          title: "French Literature Basics",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who wrote 'Les Miserables'?",
              options: ["Victor Hugo", "Emile Zola", "Moliere", "Voltaire"],
              correctAnswer: "0",
              explanation: "Victor Hugo wrote Les Miserables (1862).",
            },
            {
              type: "FILL_BLANK",
              question: "Moliere est connu pour ses ___ (plays/comedies).",
              correctAnswer: "comedies",
              explanation: "Moliere is famous for his comedies (Le Tartuffe, Le Misanthrope).",
            },
            {
              type: "MCQ",
              question: "'Le Petit Prince' was written by:",
              options: ["Antoine de Saint-Exupery", "Albert Camus", "Jean-Paul Sartre", "Marcel Proust"],
              correctAnswer: "0",
              explanation: "Antoine de Saint-Exupery wrote Le Petit Prince (1943).",
            },
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "B2 Comprehensive Review",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is the correct plus-que-parfait?",
              options: [
                "J'avais deja mange",
                "J'ai deja mange",
                "Je mangeais deja",
                "Je mangerais deja",
              ],
              correctAnswer: "0",
              explanation: "Plus-que-parfait: j'avais deja mange = I had already eaten.",
            },
            {
              type: "FILL_BLANK",
              question: "___ (while) travaillant, il ecoutait de la musique.",
              correctAnswer: "En",
              explanation: "En + present participle = while doing something.",
            },
            {
              type: "MCQ",
              question: "How do you formally say 'I would be grateful'?",
              options: [
                "Je vous serais reconnaissant",
                "Je suis content",
                "Je vous remercie",
                "Merci beaucoup",
              ],
              correctAnswer: "0",
              explanation: "Je vous serais reconnaissant = I would be grateful (formal).",
            },
            {
              type: "SPEECH",
              question: "D'une part, c'est interessant; d'autre part, c'est tres couteux.",
              correctAnswer: "D'une part, c'est interessant; d'autre part, c'est tres couteux",
              language: "fr",
              hint: "Say: On the one hand it's interesting; on the other hand it's very expensive",
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
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let category = await db.category.findFirst({
      where: { name: { equals: "Languages", mode: "insensitive" } },
    })
    if (!category) {
      category = await db.category.create({
        data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" },
      })
    }

    const existingCourse = await db.course.findFirst({
      where: { title: { equals: frenchB2CourseData.course.title, mode: "insensitive" } },
    })
    if (existingCourse) {
      return NextResponse.json({ message: "French B2 course already exists", courseId: existingCourse.id })
    }

    const course = await db.course.create({
      data: {
        title: frenchB2CourseData.course.title,
        description: frenchB2CourseData.course.description,
        categoryId: category.id,
        difficulty: frenchB2CourseData.course.difficulty,
        minimumLevel: frenchB2CourseData.course.minimumLevel,
        isFree: true,
        icon: "🇫🇷 French",
        color: "#2563eb",
      },
    })

    for (let m = 0; m < frenchB2CourseData.modules.length; m++) {
      const mod = frenchB2CourseData.modules[m]
      const createdModule = await db.module.create({
        data: { title: mod.title, courseId: course.id, order: m + 1 },
      })
      for (let l = 0; l < mod.lessons.length; l++) {
        const lesson = mod.lessons[l]
        const createdLesson = await db.lesson.create({
          data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 },
        })
        for (let q = 0; q < lesson.questions.length; q++) {
          const qd = lesson.questions[q] as { type: string; question: string; hint?: string; explanation?: string; options?: string[] | string; correctAnswer: string; language?: string }
          let optionsStr: string | null = null
          if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options)
          else if (qd.options && typeof qd.options === "string") optionsStr = qd.options
          else if (qd.options) optionsStr = JSON.stringify(qd.options)

          await db.question.create({
            data: {
              lessonId: createdLesson.id, type: qd.type, question: qd.question,
              hint: qd.hint || null, explanation: qd.explanation || null,
              options: optionsStr, correctAnswer: String(qd.correctAnswer),
              language: qd.language || null, order: q + 1,
            },
          })
        }
      }
    }

    const totalQuestions = frenchB2CourseData.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.questions.length, 0), 0)
    return NextResponse.json({ message: "French B2 course created successfully", courseId: course.id, moduleCount: frenchB2CourseData.modules.length, totalQuestions })
  } catch (error: any) {
    console.error("Seed French B2 course error:", error)
    return NextResponse.json({ error: error.message || "Failed to seed French B2 course" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const course = await db.course.findFirst({
      where: { title: { equals: frenchB2CourseData.course.title, mode: "insensitive" } },
      include: { modules: { include: { lessons: { include: { _count: { select: { questions: true } } } } } } },
    })
    if (!course) return NextResponse.json({ exists: false, message: "French B2 course does not exist" })
    const totalQuestions = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l._count.questions, 0), 0)
    return NextResponse.json({
      exists: true, course: { id: course.id, title: course.title, moduleCount: course.modules.length, lessonCount: course.modules.reduce((a, m) => a + m.lessons.length, 0), questionCount: totalQuestions },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check course" }, { status: 500 })
  }
}
