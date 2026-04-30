import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const frenchC2CourseData = {
  course: {
    title: "French C2 - Maitrise Avancee",
    description: "Expert French: near-native proficiency, literary analysis, advanced rhetoric, and specialized domains.",
    difficulty: "EXPERT",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Maitrise Linguistique (Linguistic Mastery)",
      lessons: [
        {
          title: "Advanced Syntax & Style",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'l'inversion stylistique'?",
              options: [
                "Placing the subject after the verb for literary effect",
                "Reversing word order in questions",
                "Using passive voice",
                "Inverting adjectives and nouns",
              ],
              correctAnswer: "0",
              explanation: "Stylistic inversion: 'Vint alors le moment ou...' (Then came the moment when...).",
            },
            {
              type: "MCQ",
              question: "Which demonstrates literary inversion?",
              options: [
                "Dans la ville vivait un homme sage",
                "Un homme sage vivait dans la ville",
                "Est-ce que tu viens?",
                "Viens ici!",
              ],
              correctAnswer: "0",
              explanation: "Dans la ville vivait un homme sage = In the town lived a wise man (literary style).",
            },
            {
              type: "FILL_BLANK",
              question: "Ainsi ___-il que la situation etait desesperée. (show/demonstrate)",
              correctAnswer: "demontra",
              explanation: "Ainsi demontra-t-il = Thus he demonstrated (inversion after ainsi in formal style).",
            },
          ],
        },
        {
          title: "Nuances & Precision",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the subtle difference between 'saisir' and 'comprendre'?",
              options: [
                "Saisir = to grasp (sudden understanding), comprendre = to understand (general)",
                "They mean exactly the same",
                "Saisir is informal, comprendre is formal",
                "Saisir is past tense of comprendre",
              ],
              correctAnswer: "0",
              explanation: "Saisir = to grasp/catch (sudden insight). Comprendre = general understanding.",
            },
            {
              type: "FILL_BLANK",
              question: "Il a ___ (grasped) l'importance de la situation immediatement.",
              correctAnswer: "saisi",
              explanation: "Saisir (past): il a saisi = he grasped/understood immediately.",
            },
            {
              type: "CHECKBOX",
              question: "Select synonyms of 'neanmoins':",
              options: ["Cependant", "Toutefois", "Par consequent", "Neanmoins"],
              correctAnswer: "[0,1,3]",
              explanation: "Cependant, toutefois, neanmoins = however/nevertheless. Par consequent = therefore.",
            },
          ],
        },
      ],
    },
    {
      title: "Rhetorique & Eloquence",
      lessons: [
        {
          title: "Rhetorical Devices",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'l'antithese'?",
              options: [
                "Contrasting two opposing ideas",
                "Repeating the same word",
                "Asking a rhetorical question",
                "Exaggerating for effect",
              ],
              correctAnswer: "0",
              explanation: "Antithese = antithesis (contrast). E.g., 'Je vis, je meurs; je me brule, je me noie.' (Louise Labe)",
            },
            {
              type: "FILL_BLANK",
              question: "L'___ (oxymoron) joint deux termes contradictoires: 'un silence assourdissant'.",
              correctAnswer: "oxymore",
              explanation: "Un oxymore = oxymoron. Silence assourdissant = deafening silence.",
            },
            {
              type: "MCQ",
              question: "'Qui ne dit mot consent' uses which device?",
              options: [
                "Proverb/aphorism",
                "Hyperbole",
                "Metaphor",
                "Alliteration",
              ],
              correctAnswer: "0",
              explanation: "Qui ne dit mot consent = Silence gives consent (proverb/aphorism).",
            },
          ],
        },
        {
          title: "Persuasive Writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'l'appel a l'emotion' in rhetoric?",
              options: [
                "Pathos",
                "Logos",
                "Ethos",
                "Thanatos",
              ],
              correctAnswer: "0",
              explanation: "Pathos = emotional appeal. Logos = logical argument. Ethos = credibility.",
            },
            {
              type: "FILL_BLANK",
              question: "L'___ (ethos) de l'auteur renforce la credibilite de son argument.",
              correctAnswer: "ethos",
              explanation: "Ethos = the author's credibility/authority.",
            },
            {
              type: "SPEECH",
              question: "Non seulement cette mesure est injuste, mais elle est egalement inefficace.",
              correctAnswer: "Non seulement cette mesure est injuste, mais elle est egalement inefficace",
              language: "fr",
              hint: "Say: Not only is this measure unjust, but it is also ineffective",
            },
          ],
        },
      ],
    },
    {
      title: "Litterature Francaise",
      lessons: [
        {
          title: "Analyzing Literary Texts",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'la focalisation interne'?",
              options: [
                "Narration from a character's perspective",
                "Third-person omniscient narration",
                "First-person autobiography",
                "Dialogue between characters",
              ],
              correctAnswer: "0",
              explanation: "Focalisation interne = internal focalization (narrated through a character's viewpoint).",
            },
            {
              type: "MCQ",
              question: "Who is the author of 'L'Etranger'?",
              options: ["Albert Camus", "Jean-Paul Sartre", "Simone de Beauvoir", "Andre Gide"],
              correctAnswer: "0",
              explanation: "Albert Camus wrote L'Etranger (The Stranger, 1942).",
            },
            {
              type: "FILL_BLANK",
              question: "Le mouvement ___ (Enlightenment) a marque le XVIIIe siecle.",
              correctAnswer: "Lumieres",
              explanation: "Les Lumieres = the Enlightenment (18th century philosophical movement).",
            },
          ],
        },
        {
          title: "Literary Movements",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What characterizes 'le symbolisme'?",
              options: [
                "Use of symbols to suggest abstract ideas",
                "Realistic description of daily life",
                "Emphasis on reason and logic",
                "Exaggerated emotions and drama",
              ],
              correctAnswer: "0",
              explanation: "Symbolism uses symbols and metaphors to represent abstract ideas and emotions.",
            },
            {
              type: "MATCHING",
              question: "Match the movement to its era:",
              options: [
                { left: "Romantisme", right: "19th century" },
                { left: "Surrealisme", right: "20th century" },
                { left: "Classicisme", right: "17th century" },
                { left: "Humanisme", right: "16th century" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Humanisme (16th), Classicisme (17th), Romantisme (19th), Surrealisme (20th).",
            },
            {
              type: "FILL_BLANK",
              question: "Victor Hugo est une figure majeure du ___ .",
              correctAnswer: "romantisme",
              explanation: "Victor Hugo was a major figure of French Romanticism.",
            },
          ],
        },
      ],
    },
    {
      title: "Domaines Specialises (Specialized Domains)",
      lessons: [
        {
          title: "Scientific French",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'une hypothese' mean in scientific context?",
              options: ["A hypothesis", "A theory", "A conclusion", "An experiment"],
              correctAnswer: "0",
              explanation: "Une hypothese = a hypothesis (proposed explanation to be tested).",
            },
            {
              type: "FILL_BLANK",
              question: "Les ___ (results) de l'experience confirment l'hypothese.",
              correctAnswer: "resultats",
              explanation: "Les resultats = the results.",
            },
            {
              type: "MCQ",
              question: "What is 'une methode empirique'?",
              options: [
                "Based on observation and experiment",
                "Based on theory alone",
                "Based on intuition",
                "Based on tradition",
              ],
              correctAnswer: "0",
              explanation: "Methode empirique = empirical method (based on observation/experiment).",
            },
          ],
        },
        {
          title: "Legal & Administrative French",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'un arrete' refer to?",
              options: [
                "An administrative order/decree",
                "A stopped vehicle",
                "A court case",
                "A type of contract",
              ],
              correctAnswer: "0",
              explanation: "Un arrete = an administrative order or decree by a local authority.",
            },
            {
              type: "FILL_BLANK",
              question: "Le ___ (law) interdit cette pratique.",
              correctAnswer: "code",
              explanation: "Le code = the code (legal code). Le code interdit = the code/law prohibits.",
            },
            {
              type: "CHECKBOX",
              question: "Select terms used in French legal language:",
              options: ["Le recours", "La jurisprudence", "Le code civil", "Le petit-dejeuner"],
              correctAnswer: "[0,1,2]",
              explanation: "Recours (appeal), jurisprudence (case law), code civil (civil code) are legal terms.",
            },
          ],
        },
      ],
    },
    {
      title: "Expression Ecrite Avancee",
      lessons: [
        {
          title: "Academic Essay Writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the standard structure of a French academic essay?",
              options: [
                "These, antithese, synthese",
                "Introduction only",
                "Question and answer",
                "Chronological narrative",
              ],
              correctAnswer: "0",
              explanation: "These-antithese-synthese is the classic French dialectical essay structure.",
            },
            {
              type: "FILL_BLANK",
              question: "L'___ (introduction) doit presenter la problematique.",
              correctAnswer: "introduction",
              explanation: "L'introduction doit presenter la problematique (The introduction must present the research question).",
            },
            {
              type: "MCQ",
              question: "What should the conclusion do?",
              options: [
                "Summarize and open to broader perspectives",
                "Introduce new arguments",
                "Repeat the introduction",
                "Change the topic",
              ],
              correctAnswer: "0",
              explanation: "A good conclusion summarizes and opens to broader perspectives (ouverture).",
            },
          ],
        },
        {
          title: "Refining Your Style",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'le plonasme'?",
              options: [
                "Unnecessary repetition of ideas",
                "A type of metaphor",
                "A grammatical error",
                "A punctuation rule",
              ],
              correctAnswer: "0",
              explanation: "Un plonasme = redundancy/pleonasm (saying the same thing twice unnecessarily).",
            },
            {
              type: "FILL_BLANK",
              question: "Evitez les repetitions: utilisez des ___ (synonyms).",
              correctAnswer: "synonymes",
              explanation: "Les synonymes = synonyms (to avoid repetition).",
            },
            {
              type: "SPEECH",
              question: "En somme, il convient de nuancer ce propos en considerant les perspectives multiples.",
              correctAnswer: "En somme, il convient de nuancer ce propos en considerant les perspectives multiples",
              language: "fr",
              hint: "Say: In sum, this statement should be nuanced by considering multiple perspectives",
            },
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "C2 Final Assessment",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which sentence demonstrates C2-level mastery?",
              options: [
                "Nonobstant les difficultes rencontrees, force est de constater que les resultats obtenus surpassent les attentes initiales.",
                "C'est super dur mais on a fait bien.",
                "Il y a des problemes mais ca va.",
                "Les choses sont difficiles mais on fait de notre mieux.",
              ],
              correctAnswer: "0",
              explanation: "C2-level: sophisticated vocabulary (nonobstant, force est de constater), complex syntax.",
            },
            {
              type: "FILL_BLANK",
              question: "Quoi qu'il en ___ , la question demeure entiere. (may be)",
              correctAnswer: "soit",
              explanation: "Quoi qu'il en soit = Be that as it may (fixed expression with subjunctive).",
            },
            {
              type: "MCQ",
              question: "'Force est de constater que' means:",
              options: [
                "One must acknowledge that",
                "Force is to note that",
                "It is forced to observe that",
                "The force shows that",
              ],
              correctAnswer: "0",
              explanation: "Force est de constater que = One must acknowledge/observe that (formal).",
            },
            {
              type: "SPEECH",
              question: "Il est imperatif que nous reconsiderions nos positions a la lumiere de ces nouvelles donnees.",
              correctAnswer: "Il est imperatif que nous reconsiderions nos positions a la lumiere de ces nouvelles donnees",
              language: "fr",
              hint: "Say: It is imperative that we reconsider our positions in light of this new data",
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

    const existingCourse = await db.course.findFirst({ where: { title: { equals: frenchC2CourseData.course.title, mode: "insensitive" } } })
    if (existingCourse) return NextResponse.json({ message: "French C2 course already exists", courseId: existingCourse.id })

    const course = await db.course.create({
      data: {
        title: frenchC2CourseData.course.title, description: frenchC2CourseData.course.description,
        categoryId: category.id, difficulty: frenchC2CourseData.course.difficulty,
        minimumLevel: frenchC2CourseData.course.minimumLevel, isFree: true, icon: "🇫🇷 French", color: "#2563eb",
      },
    })

    for (let m = 0; m < frenchC2CourseData.modules.length; m++) {
      const mod = frenchC2CourseData.modules[m]
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

    const totalQuestions = frenchC2CourseData.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.questions.length, 0), 0)
    return NextResponse.json({ message: "French C2 course created successfully", courseId: course.id, moduleCount: frenchC2CourseData.modules.length, totalQuestions })
  } catch (error: any) {
    console.error("Seed French C2 course error:", error)
    return NextResponse.json({ error: error.message || "Failed to seed French C2 course" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const course = await db.course.findFirst({
      where: { title: { equals: frenchC2CourseData.course.title, mode: "insensitive" } },
      include: { modules: { include: { lessons: { include: { _count: { select: { questions: true } } } } } } },
    })
    if (!course) return NextResponse.json({ exists: false, message: "French C2 course does not exist" })
    const totalQuestions = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l._count.questions, 0), 0)
    return NextResponse.json({
      exists: true, course: { id: course.id, title: course.title, moduleCount: course.modules.length, lessonCount: course.modules.reduce((a, m) => a + m.lessons.length, 0), questionCount: totalQuestions },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check course" }, { status: 500 })
  }
}
