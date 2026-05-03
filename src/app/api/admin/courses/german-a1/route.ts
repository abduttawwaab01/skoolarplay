import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const germanA1CourseData = {
  course: {
    title: "German A1 - Anfänger",
    description: "Lerne grundlegendes Deutsch für alltägliche Situationen. Beherrsche Grüße, Zahlen, Farben, Familie und Grammatik.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Grüße und Vorstellungen",
      lessons: [
        {
          title: "Guten Morgen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man 'Good morning' auf Deutsch?",
              options: ["Guten Morgen", "Guten Tag", "Guten Abend", "Gute Nacht"],
              correctAnswer: "0",
              explanation: "Guten Morgen sagt man am Morgen.",
            },
            {
              type: "MCQ",
              question: "Wie sagt man 'Good afternoon'?",
              options: ["Guten Tag", "Guten Morgen", "Guten Abend", "Gute Nacht"],
              correctAnswer: "0",
              explanation: "Guten Tag ist die Begrüßung für den Tag.",
            },
            {
              type: "FILL_BLANK",
              question: "Vervollständige: ___ Morgen! (Begrüßung)",
              correctAnswer: "Guten",
              explanation: "Guten Morgen = Good morning.",
            },
            {
              type: "SPEECH",
              question: "Guten Morgen. Wie geht es dir?",
              correctAnswer: "Guten Morgen. Wie geht es dir?",
              language: "de",
              hint: "Say: Good morning. How are you?",
            },
          ],
        },
        {
          title: "Sich vorstellen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie stellt man sich vor?",
              options: ["Ich heiße Hans", "Du heißt Hans", "Er heißt Hans", "Sie heißen Hans"],
              correctAnswer: "0",
              explanation: "Ich heiße = My name is.",
            },
            {
              type: "FILL_BLANK",
              question: "Vervollständige: Mein ___ ist Maria.",
              correctAnswer: "Name",
              explanation: "Mein Name ist = My name is.",
            },
          ],
        },
        {
          title": "Nach Namen fragen",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie fragt man nach dem Namen?",
              options: ["Wie heißt du?", "Wie heiße ich?", "Wie heißt er?", "Wie heißen Sie?"],
              correctAnswer: "0",
              explanation: "Wie heißt du? = What is your name?",
            },
          ],
        },
        {
          title": "Höflichkeit",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie dankt man?",
              options: ["Danke", "Bitte", "Entschuldigung", "Tschüss"],
              correctAnswer: "0",
              explanation: "Danke = Thank you.",
            },
            {
              type": "TRUE_FALSE",
              question: "'Bitte' heißt 'please'.",
              correctAnswer: "true",
              explanation: "Bitte = please.",
            },
          ],
        },
      ],
    },
    {
      title": "Zahlen und Zählen",
      lessons: [
        {
          title": "Zahlen 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie sagt man '5'?",
              options: ["Fünf", "Vier", "Sechs", "Sieben"],
              correctAnswer: "0",
              explanation: "Fünf = 5.",
            },
            {
              type": "FILL_BLANK",
              question: "Vervollständige: Eins, zwei, drei, ___, fünf.",
              correctAnswer": "vier",
              explanation": "Eins, zwei, drei, vier, fünf = 1, 2, 3, 4, 5.",
            },
          ],
        },
        {
          title": "Zahlen 11-20",
          type": "QUIZ",
          questions: [
            {
              type": "MCQ",
              question": "Wie sagt man '12'?",
              options": ["Zwölf", "Elf", "Dreizehn", "Vierzehn"],
              correctAnswer": "0",
              explanation": "Zwölf = 12.",
            },
          ],
        },
        {
          title": "Zahlen 20-100",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man '30'?",
              options": ["Dreißig", "Zwanzig", "Vierzig", "Fünfzig"],
              correctAnswer": "0",
              explanation": "Dreißig = 30.",
            },
          ],
        },
      ],
    },
    {
      title": "Farben und Aussehen",
      lessons": [
        {
          title": "Grundfarben",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man 'blue'?",
              options": ["Blau", "Grün", "Rot", "Gelb"],
              correctAnswer": "0",
              explanation": "Blau = blue.",
            },
            {
              type": "MATCHING",
              question": "Ordne Farben zu Objekten:",
              options": [
                { left": "Himmel", right": "Blau" },
                { left": "Gras", right": "Grün" },
                { left": "Blut", right": "Rot" },
                { left": "Schnee", right": "Weiß" },
              ],
              correctAnswer": "[0,2,1,3]",
              explanation": "Jedes Objekt hat seine Farbe.",
            },
          ],
        },
      ],
    },
    {
      title": "Familie und Beziehungen",
      lessons": [
        {
          title": "Unmittelbare Familie",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man 'Vater'?",
              options": ["Vater", "Mutter", "Bruder", "Schwester"],
              correctAnswer": "0",
              explanation": "Vater = father.",
            },
          ],
        },
      ],
    },
    {
      title": "Essen und Trinken",
      lessons": [
        {
          title": "Mahlzeiten",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Was isst du am Morgen?",
              options": ["Frühstück", "Mittagessen", "Abendessen", "Snack"],
              correctAnswer": "0",
              explanation": "Frühstück = breakfast.",
            },
          ],
        },
      ],
    },
    {
      title": "Tagesablauf",
      lessons": [
        {
          title": "Morgens",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Was machst du am Morgen zuerst?",
              options": ["Aufstehen", "Ins Bett gehen", "Mittagessen", "Fernsehen"],
              correctAnswer": "0",
              explanation": "Aufstehen = wake up.",
            },
          ],
        },
      ],
    },
    {
      title": "Haus und Möbel",
      lessons": [
        {
          title": "Zimmer",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wo schläfst du?",
              options": ["Schlafzimmer", "Küche", "Wohnzimmer", "Badezimmer"],
              correctAnswer": "0",
              explanation": "Schlafzimmer = bedroom.",
            },
          ],
        },
      ],
    },
    {
      title": "Grammatik Grundlagen",
      lessons": [
        {
          title": "Sein und Haben",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man 'I am'?",
              options": ["Ich bin", "Ich habe", "Du bist", "Er ist"],
              correctAnswer": "0",
              explanation": "Ich bin = I am.",
            },
          ],
        },
      ],
    },
    {
      title": "Schule und Bildung",
      lessons": [
        {
          title": "Schulfächer",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man 'math'?",
              options": ["Mathe", "Geschichte", "Kunst", "Musik"],
              correctAnswer": "0",
              explanation": "Mathe = math.",
            },
          ],
        },
      ],
    },
    {
      title": "Wetter und Jahreszeiten",
      lessons": [
        {
          title": "Wetterbedingungen",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man 'sunny'?",
              options": ["Sonnig", "Regnerisch", "Schneeig", "Windig"],
              correctAnswer": "0",
              explanation": "Sonnig = sunny.",
            },
          ],
        },
      ],
    },
    {
      title": "Kleidung",
      lessons": [
        {
          title": "Kleidungsstücke",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man 'shirt'?",
              options": ["Hemd", "Hose", "Schuhe", "Hut"],
              correctAnswer": "0",
              explanation": "Hemd = shirt.",
            },
          ],
        },
      ],
    },
    {
      title": "Körperteile und Gesundheit",
      lessons": [
        {
          title": "Körperteile",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Womit sieht man?",
              options": ["Augen", "Ohren", "Nase", "Mund"],
              correctAnswer": "0",
              explanation": "Mit den Augen sieht man.",
            },
          ],
        },
      ],
    },
    {
      title": "Tiere und Natur",
      lessons": [
        {
          title": "Hoftiere",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Welches Tier sagt 'muh'?",
              options": ["Kuh", "Katze", "Hund", "Schwein"],
              correctAnswer": "0",
              explanation": "Kuh sagt 'muh'.",
            },
          ],
        },
      ],
    },
    {
      title": "Verkehr und Reisen",
      lessons": [
        {
          title": "Verkehrsmittel",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Was fliegt am Himmel?",
              options": ["Flugzeug", "Auto", "Zug", "Bus"],
              correctAnswer": "0",
              explanation": "Flugzeug = airplane.",
            },
          ],
        },
      ],
    },
    {
      title": "Sport und Hobbys",
      lessons": [
        {
          title": "Populäre Sportarten",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Welcher Sport benutzt Ball und Korb?",
              options": ["Basketball", "Fußball", "Tennis", "Schwimmen"],
              correctAnswer": "0",
              explanation": "Basketball = basketall.",
            },
          ],
        },
      ],
    },
    {
      title": "Einkaufen und Geld",
      lessons": [
        {
          title": "Geschäfte",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wo kauft man Essen?",
              options": ["Supermarkt", "Kleiderladen", "Bücherei", "Krankenhaus"],
              correctAnswer": "0",
              explanation": "Supermarkt = supermarket.",
            },
          ],
        },
      ],
    },
    {
      title": "Orte in der Stadt",
      lessons": [
        {
          title": "Stadtteile",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wo lernt man?",
              options": ["Schule", "Krankenhaus", "Restaurant", "Park"],
              correctAnswer": "0",
              explanation": "Schule = school.",
            },
          ],
        },
      ],
    },
    {
      title": "Zeit und Daten",
      lessons": [
        {
          title": "Uhrzeit",
          type": "QUIZ",
          questions": [
            {
              type": "MCQ",
              question": "Wie sagt man '3 o'clock'?",
              options": ["Drei Uhr", "Zwei Uhr", "Vier Uhr", "Fünf Uhr"],
              correctAnswer": "0",
              explanation": "Drei Uhr = 3 o'clock.",
            },
          ],
        },
      ],
    },
    {
      title": "Kommunikation",
      lessons: [
        {
          title: "Höflichkeit",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wie bittet man höflich um Hilfe?",
              options: ["Kannst du mir helfen?", "Gib mir das", "Ich will das", "Nimm das"],
              correctAnswer: "0",
              explanation: "Kannst du mir helfen? = Can you help me?",
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
    const { course: courseData, modules: modulesData } = germanA1CourseData;
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
    console.error("Error creating German A1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
