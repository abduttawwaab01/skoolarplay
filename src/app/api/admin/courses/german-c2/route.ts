import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const germanC2CourseData = {
  course: {
    title: "German C2 - Mastery",
    description: "Deutsch auf C2-Niveau: Nahezu muttersprachliche Beherrschung, Verstehen praktisch aller Texte, präzise und differenzierte Ausdrucksweise.",
    difficulty: "MASTERY",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Lexical Precision",
      lessons: [
        {
          title: "Rare vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'obskur'?",
              options: ["Unbekannt/geheimnisvoll", "Hell", "Laut", "Schnell"],
              correctAnswer: "0",
              explanation: "Obskur = unbekannt oder geheimnisvoll.",
            },
            {
              type: "FILL_BLANK",
              question: "Vervollständige: Die ___ Forschung brachte neue Erkenntnisse.",
              correctAnswer: "obskure",
              explanation: "Obskure Forschung = wenig bekannte Forschung.",
            },
          ],
        },
      ],
    },
    {
      title: "Archaic & Literary Terms",
      lessons: [
        {
          title: "Shakespearean language",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist 'thou' auf Deutsch?",
              options: ["Du (veraltet)", "Ich", "Er", "Sie"],
              correctAnswer: "0",
              explanation: "Thou = du (archaisch).",
            },
          ],
        },
      ],
    },
    {
      title: "Professional Specialization",
      lessons: [
        {
          title: "Expert discourse",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Fachsprache?",
              options: ["Spezielle Sprache für Beruf", "Alltagssprache", "Slang", "Dialekt"],
              correctAnswer: "0",
              explanation: "Fachsprache = spezielle Terminologie für ein Fachgebiet.",
            },
          ],
        },
      ],
    },
    {
      title: "Regional Dialects & Slang",
      lessons: [
        {
          title: "Regional variations",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist 'Moin'?",
              options: ["Begrüßung in Norddeutschland", "Danke", "Tschüss", "Bitte"],
              correctAnswer: "0",
              explanation: "Moin = typische Begrüßung in Norddeutschland.",
            },
          ],
        },
      ],
    },
    {
      title: "Metaphorical Mastery",
      lessons: [
        {
          title: "Complex metaphors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist eine erweiterte Metapher?",
              options: ["Metapher über mehrere Sätze", "Ein Wortvergleich", "Übertreibung", "Ironie"],
              correctAnswer: "0",
              explanation: "Erweiterte Metapher = metaphorischer Vergleich über Textabschnitt.",
            },
          ],
        },
      ],
    },
    {
      title: "High-Level Debate",
      lessons: [
        {
          title: "Advanced rhetoric",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Ethos?",
              options: ["Glaubwürdigkeit des Sprechers", "Emotionaler Appell", "Logischer Beweis", "Humor"],
              correctAnswer: "0",
              explanation: "Ethos = rhetorische Überzeugungskraft durch Charakter.",
            },
          ],
        },
      ],
    },
    {
      title: "Subtle Cultural Nuances",
      lessons: [
        {
          title: "Cultural subtext",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist kultureller Kontext?",
              options: ["Hintergrundinformationen", "Grammatik", "Wortwahl", "Aussprache"],
              correctAnswer: "0",
              explanation: "Kultureller Kontext = unausgesprochene Bedeutungen.",
            },
          ],
        },
      ],
    },
    {
      title: "Idiomatic Fluency",
      lessons: [
        {
          title: "Advanced idioms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'Da steppt der Bär'?",
              options: ["Es ist viel los/Party", "Bär tanzt", "Es ist ruhig", "Es ist kalt"],
              correctAnswer: "0",
              explanation: "Da steppt der Bär = es ist viel los, gute Stimmung.",
            },
          ],
        },
      ],
    },
    {
      title: "Grammatical Perfection",
      lessons: [
        {
          title: "Advanced syntax",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Infinitivsatz?",
              options: ["Um zu helfen", "Ich helfe", "Hilf mir", "Geholfen"],
              correctAnswer: "0",
              explanation: "Infinitivsatz = um/zu + Infinitiv.",
            },
          ],
        },
      ],
    },
    {
      title: "Creative Expression",
      lessons: [
        {
          title: "Literary creativity",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Stilmittel?",
              options: ["Bewusstes Sprachelement", "Fehler", "Zufall", "Grammatikregel"],
              correctAnswer: "0",
              explanation: "Stilmittel = bewusst eingesetztes Sprachelement.",
            },
          ],
        },
      ],
    },
    {
      title: "Academic Discourse",
      lessons: [
        {
          title: "Scholarly writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Abstract?",
              options: ["Zusammenfassung", "Einleitung", "Hauptteil", "Schluss"],
              correctAnswer: "0",
              explanation: "Abstract = kurze Zusammenfassung einer wissenschaftlichen Arbeit.",
            },
          ],
        },
      ],
    },
    {
      title: "Professional Communication",
      lessons: [
        {
          title: "Executive communication",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Elevator Pitch?",
              options: ["Kurze Vorstellung", "Langwierige Präsentation", "E-Mail", "Bericht"],
              correctAnswer: "0",
              explanation: "Elevator Pitch = kurze, überzeugende Vorstellung.",
            },
          ],
        },
      ],
    },
    {
      title: "Critical Analysis",
      lessons: [
        {
          title: "Analytical frameworks",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist SWOT-Analyse?",
              options: ["Stärken/Schwächen/Chancen/Gefahren", "Finanzanalyse", "Marketingstrategie", "Produktion"],
              correctAnswer: "0",
              explanation: "SWOT = Strengths, Weaknesses, Opportunities, Threats.",
            },
          ],
        },
      ],
    },
    {
      title: "Intercultural Competence",
      lessons: [
        {
          title: "Cultural intelligence",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist kulturelle Intelligenz?",
              options: ["Fähigkeit, kulturelle Unterschiede zu navigieren", "IQ", "Sprachkenntnisse", "Reiseerfahrung"],
              correctAnswer: "0",
              explanation: "Kulturelle Intelligenz = Anpassung an verschiedene Kulturen.",
            },
          ],
        },
      ],
    },
    {
      title: "Specialized Translation",
      lessons: [
        {
          title: "Translation theory",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Äquivalenz in der Übersetzung?",
              options: ["Gleiche Wirkung im Zieltext", "Wort-für-Wort-Übersetzung", "Freie Übersetzung", "Auslassung"],
              correctAnswer: "0",
              explanation: "Äquivalenz = gleiche Wirkung auf Leser.",
            },
          ],
        },
      ],
    },
    {
      title: "Linguistic Theory",
      lessons: [
        {
          title: "Generative grammar",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Universalgrammatik?",
              options: ["Angeborene Sprachstruktur", "Lernbare Grammatik", "Schulgrammatik", "Dialekt"],
              correctAnswer: "0",
              explanation: "Universalgrammatik = angeborene Sprachfähigkeit (Chomsky).",
            },
          ],
        },
      ],
    },
    {
      title: "Discourse Analysis",
      lessons: [
        {
          title: "Critical discourse analysis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was untersucht die Diskursanalyse?",
              options: ["Sprache in sozialem Kontext", "Grammatik", "Wortwahl", "Aussprache"],
              correctAnswer: "0",
              explanation: "Diskursanalyse = Sprache als soziale Praxis.",
            },
          ],
        },
      ],
    },
    {
      title: "Rhetorical Excellence",
      lessons: [
        {
          title: "Persuasive mastery",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Logos?",
              options: ["Logischer Appell", "Emotionaler Appell", "Glaubwürdigkeit", "Humor"],
              correctAnswer: "0",
              explanation: "Logos = Überzeugung durch Logik/Argumente.",
            },
          ],
        },
      ],
    },
    {
      title: "Cultural Synthesis",
      lessons: [
        {
          title: "Multicultural synthesis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist kulturelle Hybridität?",
              options: ["Mischung von Kulturen", "Reine Kultur", "Isolation", "Krieg"],
              correctAnswer: "0",
              explanation: "Kulturelle Hybridität = Verschmelzung verschiedener Kulturen.",
            },
          ],
        },
      ],
    },
    {
      title: "Mastery Demonstration",
      lessons: [
        {
          title: "Near-native fluency",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was zeichnet C2-Niveau aus?",
              options: ["Verstehen praktisch aller Texte", "Grundlegende Kommunikation", "Einfache Sätze", "Viel Fehler"],
              correctAnswer: "0",
              explanation: "C2 = nahezu muttersprachliche Beherrschung.",
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
    const { course: courseData, modules: modulesData } = germanC2CourseData;
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
          language: q.language || null,
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
    console.error("Error creating German C2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
