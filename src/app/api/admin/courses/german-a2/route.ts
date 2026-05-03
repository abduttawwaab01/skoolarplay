import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const germanA2CourseData = {
  course: {
    title: "German A2 - Mittelstufe",
    description: "Deutsch auf Mittelstufe. Beherrsche Vergangenheit, Zukunft, Vergleiche und Alltagskommunikation.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Vergangenheit - Präteritum",
      lessons: [
        {
          title: "Regelmäßige Verben",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man 'I walked' auf Deutsch?",
              options: ["Ich lief", "Ich laufe", "Ich liefe", "Ich bin gelaufen"],
              correctAnswer: "0",
              explanation: "Laufen → lief (Präteritum).",
            },
            {
              type: "FILL_BLANK",
              question: "Vervollständige: Sie ___ (spielte) Fußball gestern.",
              correctAnswer: "spielte",
              explanation: "Spielen → spielte (Präteritum).",
            },
            {
              type: "SPEECH",
              question: "Ich besuchte Madrid letztes Jahr.",
              correctAnswer: "Ich besuchte Madrid letztes Jahr.",
              language: "de",
              hint: "Say: I visited Madrid last year",
            },
          ],
        },
        {
          title: "Unregelmäßige Verben",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist das Präteritum von 'gehen'?",
              options: ["Ging", "Gehe", "Gangen", "Gegangen"],
              correctAnswer: "0",
              explanation: "Gehen → ging (unregelmäßig).",
            },
            {
              type: "TRUE_FALSE",
              question: "'Sah' ist Präteritum von 'sehen'.",
              correctAnswer: "true",
              explanation: "Sehen → sah (unregelmäßig).",
            },
          ],
        },
      ],
    },
    {
      title: "Zukunft - Futur",
      lessons: [
        {
          title: "Werden + Infinitiv",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man 'I am going to go'?",
              options: ["Ich werde gehen", "Ich gehe", "Ich ging", "Ich bin gegangen"],
              correctAnswer: "0",
              explanation: "Werden + Infinitiv = Futur.",
            },
          ],
        },
      ],
    },
    {
      title: "Richtungen",
      lessons: [
        {
          title: "Präpositionen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist richtig?",
              options: ["Geh zum Laden", "Geh im Laden", "Geh mit Laden", "Geh von Laden"],
              correctAnswer: "0",
              explanation: "Zu + dem = zum (Richtung).",
            },
          ],
        },
      ],
    },
    {
      title: "Kleidung",
      lessons: [
        {
          title: "Kleidungsstücke",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man 'shirt'?",
              options: ["Hemd", "Hose", "Schuhe", "Hut"],
              correctAnswer: "0",
              explanation: "Hemd = shirt.",
            },
            {
              type: "MATCHING",
              question: "Ordne Farben zu Kleidung:",
              options: [
                { left: "Rotes Hemd", right: "Red shirt" },
                { left: "Blaue Hose", right: "Blue pants" },
                { left: "Schwarze Schuhe", right: "Black shoes" },
                { left: "Weißer Hut", right: "White hat" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Jedes Teil hat seine Farbe.",
            },
          ],
        },
      ],
    },
    {
      title: "Gesundheit",
      lessons: [
        {
          title: "Krankheiten",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was verursacht Fieber?",
              options: ["Grippe", "Beinfraktur", "Schnittwunde", "Bluterguss"],
              correctAnswer: "0",
              explanation: "Grippe verursacht Fieber.",
            },
          ],
        },
      ],
    },
    {
      title: "Reisen und Verkehr",
      lessons: [
        {
          title: "Verkehrsmittel",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Womit fliegt man?",
              options: ["Flugzeug", "Auto", "Zug", "Fahrrad"],
              correctAnswer: "0",
              explanation: "Flugzeug = airplane.",
            },
          ],
        },
      ],
    },
    {
      title: "Vergleiche",
      lessons: [
        {
          title: "Komparation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist richtig?",
              options: ["Größer als", "Mehr groß als", "Groß als", "Größer wie"],
              correctAnswer: "0",
              explanation: "Größer = Komparativ (kurze Adjektive: -er).",
            },
          ],
        },
      ],
    },
    {
      title: "Gegenwart",
      lessons: [
        {
          title: "Präsens Progressiv",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist 'I am eating' auf Deutsch?",
              options: ["Ich esse gerade", "Ich esse", "Ich aß", "Ich habe gegessen"],
              correctAnswer: "0",
              explanation: "Gerade = gerade jetzt (Präsens Progressiv).",
            },
          ],
        },
      ],
    },
    {
      title: "Haus und Möbel",
      lessons: [
        {
          title: "Zimmer",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wo schläfst du?",
              options: ["Schlafzimmer", "Küche", "Wohnzimmer", "Badezimmer"],
              correctAnswer: "0",
              explanation: "Schlafzimmer = bedroom.",
            },
          ],
        },
      ],
    },
    {
      title: "Wetter und Jahreszeiten",
      lessons: [
        {
          title: "Wetterberichte",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'sonnig'?",
              options: ["Sunny", "Rainy", "Snowy", "Windy"],
              correctAnswer: "0",
              explanation: "Sonnig = sunny.",
            },
          ],
        },
      ],
    },
    {
      title: "Arbeit und Berufe",
      lessons: [
        {
          title: "Berufsbezeichnungen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wer unterrichtet Schüler?",
              options: ["Lehrer", "Arzt", "Fahrer", "Koch"],
              correctAnswer: "0",
              explanation: "Lehrer = teacher.",
            },
          ],
        },
      ],
    },
    {
      title: "Essen und Trinken",
      lessons: [
        {
          title: "Speisen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man 'bread'?",
              options: ["Brot", "Reis", "Fleisch", "Fisch"],
              correctAnswer: "0",
              explanation: "Brot = bread.",
            },
          ],
        },
      ],
    },
    {
      title: "Schule und Bildung",
      lessons: [
        {
          title: "Schulfächer",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man 'math'?",
              options: ["Mathe", "Geschichte", "Kunst", "Musik"],
              correctAnswer: "0",
              explanation: "Mathe = math.",
            },
          ],
        },
      ],
    },
    {
      title: "Freizeit und Hobbys",
      lessons: [
        {
          title: "Sportarten",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was benutzt man mit Ball und Korb?",
              options: ["Basketball", "Fußball", "Tennis", "Schwimmen"],
              correctAnswer: "0",
              explanation: "Basketball = basketball.",
            },
          ],
        },
      ],
    },
    {
      title: "Medien und Unterhaltung",
      lessons: [
        {
          title: "Medienformen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wo liest du Nachrichten?",
              options: ["Zeitung", "Kochbuch", "Roman", "Wörterbuch"],
              correctAnswer: "0",
              explanation: "Zeitung = newspaper.",
            },
          ],
        },
      ],
    },
    {
      title: "Umwelt und Natur",
      lessons: [
        {
          title: "Naturschutz",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was verursacht den Treibhauseffekt?",
              options: ["Treibhausgase", "Bäume", "Regen", "Wind"],
              correctAnswer: "0",
              explanation: "Treibhausgase halten Wärme.",
            },
          ],
        },
      ],
    },
    {
      title: "Menschen und Beziehungen",
      lessons: [
        {
          title: "Charaktereigenschaften",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'freundlich'?",
              options: ["Kind", "Wütend", "Groß", "Klein"],
              correctAnswer: "0",
              explanation: "Freundlich = kind.",
            },
          ],
        },
      ],
    },
    {
      title: "Einkaufen und Geld",
      lessons: [
        {
          title: "Geschäfte",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wo kauft man Essen?",
              options: ["Supermarkt", "Kleiderladen", "Bücherei", "Apotheke"],
              correctAnswer: "0",
              explanation: "Supermarkt = supermarket.",
            },
          ],
        },
      ],
    },
    {
      title: "Routinen",
      lessons: [
        {
          title: "Häufigkeitsadverbien",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was bedeutet 'immer'?",
              options: ["Always", "Sometimes", "Never", "Rarely"],
              correctAnswer: "0",
              explanation: "Immer = always.",
            },
          ],
        },
      ],
    },
    {
      title: "Kultur und Traditionen",
      lessons: [
        {
          title: "Feiertage",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wann ist Weihnachten?",
              options: ["25. Dezember", "31. Oktober", "1. Januar", "5. Mai"],
              correctAnswer: "0",
              explanation: "Weihnachten = 25. Dezember.",
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
    const { course: courseData, modules: modulesData } = germanA2CourseData;
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
            xpReward: 20 + Math.floor(Math.random() * 20),
            gemReward: 2 + Math.floor(Math.random() * 4),
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
          points: q.points || 10,
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
    console.error("Error creating German A2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
