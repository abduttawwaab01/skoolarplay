import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const germanB2CourseData = {
  course: {
    title: "German B2 - Upper Intermediate",
    description: "Deutsch auf B2-Niveau: Komplexe Texte verstehen, flüssig kommunizieren, fortgeschrittene Grammatik und Fachsprache.",
    difficulty: "UPPER_INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Mixed Conditionals",
      lessons: [
        {
          title: "If + past perfect, would",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist dritter Konditional?",
              options: ["Wenn ich Zeit gehabt hätte, wäre ich gekommen", "Wenn ich Zeit habe, werde ich kommen", "Wenn ich Zeit hatte, kam ich", "Wenn ich Zeit habe, käme ich"],
              correctAnswer: "0",
              explanation: "Wenn + Plusquamperfekt, würde/wäre + Infinitiv = dritter Konditional (hypothetisch).",
            },
            {
              type: "FILL_BLANK",
              question: "Vervollständige: Wenn ich das gewusst ___, hätte ich anders gehandelt.",
              correctAnswer: "hätte",
              explanation: "Plusquamperfekt von wissen: hatte gewusst → hätte gewusst.",
            },
            {
              type: "TRUE_FALSE",
              question: "'Wenn ich reich wäre, würde ich ein Haus kaufen' ist dritter Konditional.",
              correctAnswer: "false",
              explanation: "Wäre (Präteritum Konjunktiv II) + würde = zweiter Konditional.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Passive Voice",
      lessons: [
        {
          title: "Passive with modals",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Passiv mit Modalverb?",
              options: ["Das Buch muss gelesen werden", "Ich muss das Buch lesen", "Das Buch wird gelesen", "Ich lese das Buch"],
              correctAnswer: "0",
              explanation: "Modalverb + Partizip II + werden (Passiv mit Modal).",
            },
          ],
        },
      ],
    },
    {
      title: "Deduction & Speculation",
      lessons: [
        {
          title: "Must be/can't be",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was drückt Sicherheit aus?",
              options: ["Er muss zu Hause sein", "Er könnte zu Hause sein", "Er mag zu Hause sein", "Er wird zu Hause sein"],
              correctAnswer: "0",
              explanation: "Muss sein = deduction (Sicherheit).",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Relative Clauses",
      lessons: [
        {
          title: "Prepositional relatives",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist richtig?",
              options: ["Das Buch, worüber ich spreche", "Das Buch, worüber ich spreche über", "Das Buch, das ich spreche worüber", "Das Buch, ich spreche worüber"],
              correctAnswer: "0",
              explanation: "Worüber = Präposition + relativer Pronomen.",
            },
          ],
        },
      ],
    },
    {
      title: "Idiomatic Expressions",
      lessons: [
        {
          title: "Common idioms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'Daumen drücken'?",
              options: ["Gute Wünsche", "Traurig sein", "Wütend sein", "Müde sein"],
              correctAnswer: "0",
              explanation: "Daumen drücken = to cross one's fingers (good luck).",
            },
          ],
        },
      ],
    },
    {
      title: "Business Communication",
      lessons: [
        {
          title: "Business emails",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie beginnt eine formelle E-Mail?",
              options: ["Sehr geehrte Frau Schmidt", "Hallo Schmidt", "Hi Leute", "Moin"],
              correctAnswer: "0",
              explanation: "Sehr geehrte/r = formell.",
            },
          ],
        },
      ],
    },
    {
      title: "History & Culture",
      lessons: [
        {
          title: "Historical events",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wann fiel die Berliner Mauer?",
              options: ["1989", "1945", "1961", "2000"],
              correctAnswer: "0",
              explanation: "Die Berliner Mauer fiel 1989.",
            },
          ],
        },
      ],
    },
    {
      title: "Science & Technology",
      lessons: [
        {
          title: "Scientific breakthroughs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist künstliche Intelligenz?",
              options: ["Maschinen, die denken", "Schnellere Computer", "Größere Bildschirme", "Mehr Speicher"],
              correctAnswer: "0",
              explanation: "KI simuliert menschliche Intelligenz.",
            },
          ],
        },
      ],
    },
    {
      title: "Politics & Social Issues",
      lessons: [
        {
          title: "Political discourse",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Demokratie?",
              options: ["Volk wählt Führer", "Ein Herrscher regiert", "Militär regiert", "Religiöse Führer regieren"],
              correctAnswer: "0",
              explanation: "Demokratie = Volksherrschaft.",
            },
          ],
        },
      ],
    },
    {
      title: "Abstract Concepts",
      lessons: [
        {
          title: "Philosophical ideas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Freiheit?",
              options: ["Selbstbestimmung", "Kostenloser Kaffee", "Schnelles Auto", "Großes Haus"],
              correctAnswer: "0",
              explanation: "Freiheit = Selbstbestimmung.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Phrasal Verbs",
      lessons: [
        {
          title: "Complex phrasal verbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'zustande kommen'?",
              options: ["Gelingen", "Beginnen", "Enden", "Aufhören"],
              correctAnswer: "0",
              explanation: "Zustande kommen = to come about/succeed.",
            },
          ],
        },
      ],
    },
    {
      title: "Environment & Sustainability",
      lessons: [
        {
          title: "Climate change",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was verursacht Erderwärmung?",
              options: ["Treibhausgase", "Bäume", "Regen", "Wind"],
              correctAnswer: "0",
              explanation: "Treibhausgase halten Wärme.",
            },
          ],
        },
      ],
    },
    {
      title: "Education & Pedagogy",
      lessons: [
        {
          title: "Learning theories",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Konstruktivismus?",
              options: ["Lernen durch Erfahrung", "Auswendiglernen", "Frontalunterricht", "Testen"],
              correctAnswer: "0",
              explanation: "Konstruktivismus = Lernen durch eigene Erfahrung.",
            },
          ],
        },
      ],
    },
    {
      title: "Health & Medicine",
      lessons: [
        {
          title: "Medical terminology",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist 'Hypertonie'?",
              options: ["Hoher Blutdruck", "Niedriger Blutdruck", "Kopfschmerz", "Fieber"],
              correctAnswer: "0",
              explanation: "Hypertonie = arterielle Hypertonie (Bluthochdruck).",
            },
          ],
        },
      ],
    },
    {
      title: "Media & Journalism",
      lessons: [
        {
          title: "Journalistic writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist eine Schlagzeile?",
              options: ["Überschrift einer Nachricht", "Textkörper", "Bildunterschrift", "Kolumne"],
              correctAnswer: "0",
              explanation: "Schlagzeile = Headline.",
            },
          ],
        },
      ],
    },
    {
      title: "Literature & Arts",
      lessons: [
        {
          title: "Literary analysis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Metapher?",
              options: ["Bildhafter Vergleich ohne 'wie'", "Vergleich mit 'wie'", "Übertreibung", "Ironie"],
              correctAnswer: "0",
              explanation: "Metapher = direkter bildhafter Vergleich.",
            },
          ],
        },
      ],
    },
    {
      title: "Economics & Finance",
      lessons: [
        {
          title: "Economic principles",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Inflation?",
              options: ["Preiserhöhung", "Preissenkung", "Lohnanstieg", "Arbeitslosigkeit"],
              correctAnswer: "0",
              explanation: "Inflation = allgemeiner Preisanstieg.",
            },
          ],
        },
      ],
    },
    {
      title: "Psychology & Behavior",
      lessons: [
        {
          title: "Psychological theories",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Konditionierung?",
              options: ["Lernen durch Assoziation", "Geborenen Eigenschaften", "Trauma", "Träume"],
              correctAnswer: "0",
              explanation: "Konditionierung = Lernen durch Reiz-Reaktion.",
            },
          ],
        },
      ],
    },
    {
      title: "Globalization & Culture",
      lessons: [
        {
          title: "Cultural exchange",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Globalisierung?",
              options: ["Weltweite Vernetzung", "Lokale Traditionen", "Isolation", "Krieg"],
              correctAnswer: "0",
              explanation: "Globalisierung = weltweite Verflechtung.",
            },
          ],
        },
      ],
    },
    {
      title: "Innovation & Future",
      lessons: [
        {
          title: "Emerging technologies",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Blockchain?",
              options: ["Dezentrale Datenbank", "Zentrale Bank", "Soziales Netzwerk", "Spiel"],
              correctAnswer: "0",
              explanation: "Blockchain = dezentrale, unveränderliche Datenbank.",
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
    const { course: courseData, modules: modulesData } = germanB2CourseData;
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
          language: q.language || null,
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
    console.error("Error creating German B2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
