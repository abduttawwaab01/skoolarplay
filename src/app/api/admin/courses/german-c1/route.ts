import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const germanC1CourseData = {
  course: {
    title: "German C1 - Advanced",
    description: "Deutsch auf C1-Niveau: Verstehen anspruchsvoller Texte, flüssige und präzise Ausdrucksweise, Beherrschung komplexer Grammatik.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Nuances of Meaning",
      lessons: [
        {
          title: "Subtle differences",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist der Unterschied zwischen 'beenden' und 'beenden'?",
              options: ["Kein Unterschied", "Ein Wort ist formeller", "Ein Wort ist Plural", "Ein Wort ist Vergangenheit"],
              correctAnswer: "0",
              explanation: "Beenden = to end (transitive); beenden = to finish (intransitive) - subtle difference.",
            },
            {
              type: "FILL_BLANK",
              question: "Vervollständige: Das Wort '___' hat eine positive Konnotation.",
              correctAnswer: "erfolgreich",
              explanation: "Erfolgreich = erfolgreich (positive Konnotation).",
            },
          ],
        },
      ],
    },
    {
      title: "Rhetorical Devices",
      lessons: [
        {
          title: "Metaphor and simile",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Vergleich mit 'wie'?",
              options: ["Simile", "Metapher", "Personifikation", "Hyperbel"],
              correctAnswer: "0",
              explanation: "Simile = Vergleich mit 'wie' oder 'als'.",
            },
          ],
        },
      ],
    },
    {
      title: "Academic Writing Style",
      lessons: [
        {
          title: "Academic register",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist formell?",
              options: ["Es wird untersucht", "Ich hab's untersucht", "Wir gucken mal", "Das ist voll cool"],
              correctAnswer: "0",
              explanation: "Passivkonstruktionen sind formell.",
            },
          ],
        },
      ],
    },
    {
      title: "Formal vs Informal Register",
      lessons: [
        {
          title: "Register continuum",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist am formellsten?",
              options: ["Sehr geehrte Damen und Herren", "Hallo zusammen", "Hi Leute", "Moin Moin"],
              correctAnswer: "0",
              explanation: "Sehr geehrte Damen und Herren = höflichste Anrede.",
            },
          ],
        },
      ],
    },
    {
      title: "Complex Sentence Structures",
      lessons: [
        {
          title: "Subordination patterns",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Nebensatz?",
              options: ["Der weil-Satz", "Der Hauptsatz", "Der Satz ohne Verb", "Der Fragesatz"],
              correctAnswer: "0",
              explanation: "Nebensätze beginnen mit Subjunktionen (weil, dass, wenn...).",
            },
          ],
        },
      ],
    },
    {
      title: "Philosophy & Ethics",
      lessons: [
        {
          title: "Ethical frameworks",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Deontologie?",
              options: ["Pflichtenethik", "Glücksethik", "Tugendethik", "Verantwortungsethik"],
              correctAnswer: "0",
              explanation: "Deontologie = Pflichtenethik (Kant).",
            },
          ],
        },
      ],
    },
    {
      title: "Literature Analysis",
      lessons: [
        {
          title: "Literary criticism",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist eine Allegorie?",
              options: ["Bildhafter Ausdruck", "Wörtliche Bedeutung", "Übertreibung", "Ironie"],
              correctAnswer: "0",
              explanation: "Allegorie = bildhafter Ausdruck für abstrakte Konzepte.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Discourse Markers",
      lessons: [
        {
          title: "Academic connectors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was drückt Gegensatz aus?",
              options: ["Jedoch", "Außerdem", "Deshalb", "Zudem"],
              correctAnswer: "0",
              explanation: "Jedoch = jedoch (Gegensatz).",
            },
          ],
        },
      ],
    },
    {
      title: "Cleft Sentences",
      lessons: [
        {
          title: "It-clefts",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Cleft-Satz?",
              options: ["Es ist Maria, die kommt", "Maria kommt", "Kommt Maria", "Maria ist gekommen"],
              correctAnswer: "0",
              explanation: "Cleft-Sätze betonen einen Teil des Satzes mit 'es'.",
            },
          ],
        },
      ],
    },
    {
      title: "Inversion for Emphasis",
      lessons: [
        {
          title: "Negative inversion",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist invertiert?",
              options: ["Nie habe ich das gesehen", "Ich habe das nie gesehen", "Das habe ich nie gesehen", "Gesehen habe ich das nie"],
              correctAnswer: "0",
              explanation: "Mit negativen Adverbien am Anfang wird invertiert.",
            },
          ],
        },
      ],
    },
    {
      title: "Professional Specialization",
      lessons: [
        {
          title: "Legal language",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist 'Kläger'?",
              options: ["Person, die klagt", "Richter", "Anwalt", "Zeuge"],
              correctAnswer: "0",
              explanation: "Kläger = plaintiff.",
            },
          ],
        },
      ],
    },
    {
      title: "Sociolinguistics",
      lessons: [
        {
          title: "Language variation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Dialekt?",
              options: ["Regionale Sprachvarietät", "Standardsprache", "Fachsprache", "Slang"],
              correctAnswer: "0",
              explanation: "Dialekt = regionale Varietät.",
            },
          ],
        },
      ],
    },
    {
      title: "Cognitive Linguistics",
      lessons: [
        {
          title: "Cognitive metaphors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist konzeptuelle Metapher?",
              options: ["Zeit ist Geld", "Tisch ist Holz", "Buch ist Papier", "Haus ist Stein"],
              correctAnswer: "0",
              explanation: "Konzeptuelle Metapher: abstraktes Konzept wird durch konkretes verstanden.",
            },
          ],
        },
      ],
    },
    {
      title: "Media Discourse Analysis",
      lessons: [
        {
          title: "Critical discourse analysis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was untersucht die Kritische Diskursanalyse?",
              options: ["Machtverhältnisse im Text", "Grammatik", "Wortwahl", "Aussprache"],
              correctAnswer: "0",
              explanation: "CDA untersucht, wie Sprache Macht und Ideologie widerspiegelt.",
            },
          ],
        },
      ],
    },
    {
      title: "Research Methodology",
      lessons: [
        {
          title: "Research design",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist eine Hypothese?",
              options: ["Testbare Annahme", "Fakt", "Theorie", "Gesetz"],
              correctAnswer: "0",
              explanation: "Hypothese = testbare Annahme.",
            },
          ],
        },
      ],
    },
    {
      title: "Cultural Criticism",
      lessons: [
        {
          title: "Cultural theory",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Cultural Studies?",
              options: ["Interdisziplinäre Kulturuntersuchung", "Naturwissenschaften", "Mathematik", "Sport"],
              correctAnswer: "0",
              explanation: "Cultural Studies = interdisziplinäre Untersuchung von Kultur.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Argumentation",
      lessons: [
        {
          title: "Logical fallacies",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Ad hominem?",
              options: ["Angriff auf Person statt Argument", "Falscher Kausalität", "Zirkelschluss", "Strohmann"],
              correctAnswer: "0",
              explanation: "Ad hominem = Angriff auf die Person statt auf das Argument.",
            },
          ],
        },
      ],
    },
    {
      title: "Psycholinguistics",
      lessons: [
        {
          title: "Language acquisition",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist die kritische Periode?",
              options: ["Zeitfenster für Spracherwerb", "Schlafenszeit", "Arbeitszeit", "Ferien"],
              correctAnswer: "0",
              explanation: "Kritische Periode = optimales Zeitfenster für Spracherwerb.",
            },
          ],
        },
      ],
    },
    {
      title: "Global Issues & Diplomacy",
      lessons: [
        {
          title: "Diplomatic language",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist diplomatisch?",
              options: ["Höflich und vorsichtig", "Direkt und offen", "Aggressiv", "Laut"],
              correctAnswer: "0",
              explanation: "Diplomatische Sprache ist höflich und vorsichtig.",
            },
          ],
        },
      ],
    },
    {
      title: "Stylistic Mastery",
      lessons: [
        {
          title: "Stylistic variation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Register?",
              options: ["Sprachliche Varietät je nach Kontext", "Wortwahl", "Grammatik", "Aussprache"],
              correctAnswer: "0",
              explanation: "Register = Sprachgebrauch angepasst an Situation.",
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
    const { course: courseData, modules: modulesData } = germanC1CourseData;
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
            xpReward: 35 + Math.floor(Math.random() * 25),
            gemReward: 4 + Math.floor(Math.random() * 6),
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
          points: q.points || 20,
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
    console.error("Error creating German C1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
