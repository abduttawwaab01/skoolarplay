import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const frenchC1CourseData = {
  course: {
    title: "French C1 - Maitrise",
    description: "Advanced French: nuanced expression, professional communication, and sophisticated grammar.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Nuances de la Langue (Language Nuances)",
      lessons: [
        {
          title: "Subtle Tense Differences",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the nuance between 'Il dut partir' and 'Il devait partir'?",
              options: [
                "Passe simple (narrative) vs imparfait (ongoing obligation)",
                "Both mean the same thing",
                "One is formal, one is informal",
                "One is future, one is past",
              ],
              correctAnswer: "0",
              explanation: "Il dut partir (passe simple, narrative) vs Il devait partir (imparfait, ongoing).",
            },
            {
              type: "MCQ",
              question: "When is the 'passe simple' used?",
              options: [
                "Literary/formal writing only",
                "Everyday conversation",
                "Email writing",
                "Spoken storytelling",
              ],
              correctAnswer: "0",
              explanation: "Passe simple is used exclusively in literary and formal written French.",
            },
            {
              type: "FILL_BLANK",
              question: "Il ___ (aller) au marche et acheta du pain. (passe simple)",
              correctAnswer: "alla",
              explanation: "Aller (passe simple): il alla = he went.",
            },
          ],
        },
        {
          title: "Register & Tone",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is the most formal way to say 'I think'?",
              options: [
                "Il me semble que",
                "Je crois que",
                "Je pense que",
                "A mon avis",
              ],
              correctAnswer: "0",
              explanation: "Il me semble que = It seems to me that (most formal/literary).",
            },
            {
              type: "CHECKBOX",
              question: "Select all expressions appropriate for formal academic writing:",
              options: [
                "Il convient de noter que",
                "C'est cool",
                "En outre",
                "On va dire que",
              ],
              correctAnswer: "[0,2]",
              explanation: "Il convient de noter que (It should be noted) and En outre (Furthermore) are formal.",
            },
            {
              type: "FILL_BLANK",
              question: "___ (Therefore), il est imperatif de reconsiderer...",
              correctAnswer: "Par consequent",
              explanation: "Par consequent = Therefore (formal academic register).",
            },
          ],
        },
      ],
    },
    {
      title: "Expression Sophistiquee (Sophisticated Expression)",
      lessons: [
        {
          title: "Expressing Nuanced Opinion",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you express a nuanced agreement?",
              options: [
                "Je souscris largement a cette idee, avec certaines reserves",
                "Je suis d'accord",
                "C'est vrai",
                "Ouais",
              ],
              correctAnswer: "0",
              explanation: "C1-level: I largely subscribe to this idea, with certain reservations.",
            },
            {
              type: "FILL_BLANK",
              question: "Bien que cette approche soit seduisante, elle presente neanmoins des ___ . (limitations)",
              correctAnswer: "limites",
              explanation: "Des limites = limitations/limits.",
            },
            {
              type: "SPEECH",
              question: "Il est indeniable que les nouvelles technologies ont transforme notre societe.",
              correctAnswer: "Il est indeniable que les nouvelles technologies ont transforme notre societe",
              language: "fr",
              hint: "Say: It is undeniable that new technologies have transformed our society",
            },
          ],
        },
        {
          title: "Hypothesis & Speculation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'Il se pourrait que' express?",
              options: ["Possibility/speculation", "Certainty", "Past action", "Obligation"],
              correctAnswer: "0",
              explanation: "Il se pourrait que = It could be that / It is possible that (followed by subjunctive).",
            },
            {
              type: "FILL_BLANK",
              question: "Il se pourrait qu'il ___ (avoir) raison.",
              correctAnswer: "ait",
              explanation: "Il se pourrait que + subjunctive: qu'il ait raison.",
            },
            {
              type: "MCQ",
              question: "'Tout porte a croire que' means:",
              options: [
                "Everything suggests that",
                "Everything carries the belief",
                "Everyone believes that",
                "Nothing proves that",
              ],
              correctAnswer: "0",
              explanation: "Tout porte a croire que = Everything suggests/indicates that.",
            },
          ],
        },
      ],
    },
    {
      title: "Le Monde Professionnel (Professional World)",
      lessons: [
        {
          title: "Business Communication",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'meeting' in a professional context?",
              options: ["une reunion", "un rendez-vous", "une rencontre", "All are correct depending on context"],
              correctAnswer: "3",
              explanation: "Reunion (formal meeting), rendez-vous (appointment), rencontre (encounter).",
            },
            {
              type: "FILL_BLANK",
              question: "Veuillez trouver ci-joint le ___ (report) annuel.",
              correctAnswer: "rapport",
              explanation: "Le rapport annuel = the annual report.",
            },
            {
              type: "MCQ",
              question: "What does 'un compte-rendu' mean?",
              options: [
                "Meeting minutes/summary",
                "An invoice",
                "A resume",
                "A complaint",
              ],
              correctAnswer: "0",
              explanation: "Un compte-rendu = meeting minutes/summary report.",
            },
          ],
        },
        {
          title: "Job Interview French",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you describe your strengths in an interview?",
              options: [
                "Mes points forts incluent...",
                "Je suis super fort",
                "Je sais tout faire",
                "Je suis le meilleur",
              ],
              correctAnswer: "0",
              explanation: "Mes points forts incluent... = My strengths include... (professional).",
            },
            {
              type: "FILL_BLANK",
              question: "J'ai une experience de cinq ans dans le domaine du ___ . (marketing)",
              correctAnswer: "marketing",
              explanation: "Le marketing = marketing (same word borrowed from English).",
            },
            {
              type: "SPEECH",
              question: "Je suis convaincu que mon profil correspond a ce poste.",
              correctAnswer: "Je suis convaincu que mon profil correspond a ce poste",
              language: "fr",
              hint: "Say: I am convinced that my profile matches this position",
            },
          ],
        },
      ],
    },
    {
      title: "Debats & Analyses (Debates & Analysis)",
      lessons: [
        {
          title: "Analyzing Complex Issues",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'la problematique' refer to in academic French?",
              options: [
                "The central issue/research question",
                "A problem to solve",
                "A mathematical equation",
                "A grammatical problem",
              ],
              correctAnswer: "0",
              explanation: "La problematique = the central research question/issue in academic analysis.",
            },
            {
              type: "FILL_BLANK",
              question: "Cette analyse met en ___ la complexite du phenomene. (highlights)",
              correctAnswer: "lumiere",
              explanation: "Mettre en lumiere = to highlight/bring to light.",
            },
            {
              type: "MCQ",
              question: "'Il va sans dire que' means:",
              options: [
                "It goes without saying that",
                "It is not said that",
                "It should be said that",
                "It will be said that",
              ],
              correctAnswer: "0",
              explanation: "Il va sans dire que = It goes without saying that (obviously).",
            },
          ],
        },
        {
          title: "Structured Argumentation",
          type: "QUIZ",
          questions: [
            {
              type: "ORDERING",
              question: "Order the elements of a structured argument: preuve / these / exemple / conclusion",
              hint: "Thesis, example, proof, conclusion",
              correctAnswer: "these,exemple,preuve,conclusion",
              explanation: "These (thesis) → Exemple → Preuve (evidence) → Conclusion.",
            },
            {
              type: "FILL_BLANK",
              question: "___ (Conversely), on pourrait soutenir l'argument inverse.",
              correctAnswer: "Inversement",
              explanation: "Inversement = conversely/on the other hand.",
            },
            {
              type: "MCQ",
              question: "Which phrase best concludes an argument?",
              options: [
                "En definitive",
                "Pour commencer",
                "D'autre part",
                "Par exemple",
              ],
              correctAnswer: "0",
              explanation: "En definitive = ultimately/in conclusion (wrapping up argument).",
            },
          ],
        },
      ],
    },
    {
      title: "Culture & Civilisation",
      lessons: [
        {
          title: "French History & Politics",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'La Republique' in the French context?",
              options: [
                "The French political system/ideal",
                "A political party",
                "A newspaper",
                "A region of France",
              ],
              correctAnswer: "0",
              explanation: "La Republique refers to the French Republic and its values: liberte, egalite, fraternite.",
            },
            {
              type: "FILL_BLANK",
              question: "La devise de la France est: Liberte, Egalite, ___ .",
              correctAnswer: "Fraternite",
              explanation: "The French motto: Liberte, Egalite, Fraternite.",
            },
            {
              type: "MCQ",
              question: "What is 'La laicite'?",
              options: [
                "Secularism/separation of church and state",
                "A type of government",
                "An educational system",
                "A political ideology",
              ],
              correctAnswer: "0",
              explanation: "La laicite = secularism, a fundamental principle of French society.",
            },
          ],
        },
        {
          title: "Contemporary French Society",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'le baccalaureat'?",
              options: [
                "The French high school diploma/exam",
                "A university degree",
                "A language certificate",
                "A professional qualification",
              ],
              correctAnswer: "0",
              explanation: "Le baccalaureat (le bac) = the French high school leaving examination.",
            },
            {
              type: "FILL_BLANK",
              question: "Les ___ (suburbs/banlieues) sont un sujet de debat en France.",
              correctAnswer: "banlieues",
              explanation: "Les banlieues = the suburbs (often discussed in social/political context).",
            },
            {
              type: "CHECKBOX",
              question: "Select values associated with French society:",
              options: [
                "La laicite",
                "Les droits de l'homme",
                "Le libre echange absolu",
                "L'exception culturelle",
              ],
              correctAnswer: "[0,1,3]",
              explanation: "La laicite, les droits de l'homme, and l'exception culturelle are core French values.",
            },
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "C1 Comprehensive Review",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which expression demonstrates C1-level register?",
              options: [
                "Il convient de souligner que",
                "C'est super important",
                "Je veux dire que",
                "Bon, alors...",
              ],
              correctAnswer: "0",
              explanation: "Il convient de souligner que = It should be emphasized that (C1 formal register).",
            },
            {
              type: "FILL_BLANK",
              question: "___ (Although it is true that) les avantages sont nombreux, les risques persistent.",
              correctAnswer: "S'il est vrai que",
              explanation: "S'il est vrai que = Although it is true that (concession).",
            },
            {
              type: "MCQ",
              question: "'Il se pourrait que' is followed by:",
              options: ["Subjunctive", "Indicative", "Infinitive", "Conditional"],
              correctAnswer: "0",
              explanation: "Il se pourrait que + subjunctive (expresses possibility).",
            },
            {
              type: "SPEECH",
              question: "En definitive, cette analyse revele la complexite inherente au phenomene.",
              correctAnswer: "En definitive, cette analyse revele la complexite inherente au phenomene",
              language: "fr",
              hint: "Say: Ultimately, this analysis reveals the inherent complexity of the phenomenon",
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

    let category = await db.category.findFirst({ where: { name: { equals: "Languages", mode: "insensitive" } } })
    if (!category) {
      category = await db.category.create({ data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" } })
    }

    const existingCourse = await db.course.findFirst({ where: { title: { equals: frenchC1CourseData.course.title, mode: "insensitive" } } })
    if (existingCourse) return NextResponse.json({ message: "French C1 course already exists", courseId: existingCourse.id })

    const course = await db.course.create({
      data: {
        title: frenchC1CourseData.course.title, description: frenchC1CourseData.course.description,
        categoryId: category.id, difficulty: frenchC1CourseData.course.difficulty,
        minimumLevel: frenchC1CourseData.course.minimumLevel, isFree: true, icon: "🇫🇷 French", color: "#2563eb",
      },
    })

    for (let m = 0; m < frenchC1CourseData.modules.length; m++) {
      const mod = frenchC1CourseData.modules[m]
      const createdModule = await db.module.create({ data: { title: mod.title, courseId: course.id, order: m + 1 } })
      for (let l = 0; l < mod.lessons.length; l++) {
        const lesson = mod.lessons[l]
        const createdLesson = await db.lesson.create({ data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 } })
        for (let q = 0; q < lesson.questions.length; q++) {
          const qd = lesson.questions[q] as { type: string; question: string; hint?: string; explanation?: string; options?: string[] | string; correctAnswer: string; language?: string }
          let optionsStr: string | null = null
          if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options)
          else if (qd.options && typeof qd.options === "string") optionsStr = qd.options
          else if (qd.options) optionsStr = JSON.stringify(qd.options)
          await db.question.create({
            data: { lessonId: createdLesson.id, type: qd.type, question: qd.question, hint: qd.hint || null, explanation: qd.explanation || null, options: optionsStr, correctAnswer: String(qd.correctAnswer), language: qd.language || null, order: q + 1 },
          })
        }
      }
    }

    const totalQuestions = frenchC1CourseData.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.questions.length, 0), 0)
    return NextResponse.json({ message: "French C1 course created successfully", courseId: course.id, moduleCount: frenchC1CourseData.modules.length, totalQuestions })
  } catch (error: any) {
    console.error("Seed French C1 course error:", error)
    return NextResponse.json({ error: error.message || "Failed to seed French C1 course" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const course = await db.course.findFirst({
      where: { title: { equals: frenchC1CourseData.course.title, mode: "insensitive" } },
      include: { modules: { include: { lessons: { include: { _count: { select: { questions: true } } } } } } },
    })
    if (!course) return NextResponse.json({ exists: false, message: "French C1 course does not exist" })
    const totalQuestions = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l._count.questions, 0), 0)
    return NextResponse.json({
      exists: true, course: { id: course.id, title: course.title, moduleCount: course.modules.length, lessonCount: course.modules.reduce((a, m) => a + m.lessons.length, 0), questionCount: totalQuestions },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check course" }, { status: 500 })
  }
}
