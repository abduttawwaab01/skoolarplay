import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const germanB1CourseData = {
  course: {
    title: "German B1 - Fortgeschritten",
    description: "Deutsch auf B1-Niveau: Perfekt, Konditional, Passiv, Phrasalverben und Berufskommunikation.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Perfekt",
      lessons: [
        {
          title: "Haben/Sein + Partizip II",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist richtig?",
              options: ["Ich habe gesehen", "Ich habe gesehen", "Ich bin gesehen", "Ich habe sehen"],
              correctAnswer: "0",
              explanation: "Haben + Partizip II (gesehen).",
            },
            {
              type: "SPEECH",
              question: "Ich habe Madrid dreimal besucht.",
              correctAnswer: "Ich habe Madrid dreimal besucht.",
              language: "de",
              hint: "Say: I have visited Madrid three times",
            },
          ],
        },
      ],
    },
    {
      title: "Konditional I",
      lessons: [
        {
          title: "Wenn + Präsens, werd + Infinitiv",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist erster Konditional?",
              options: ["Wenn es regnet, werde ich bleiben", "Wenn es regnete, würde ich bleiben", "Wenn es regnete, bleibe ich", "Wenn es geregnet hat, bin ich geblieben"],
              correctAnswer: "0",
              explanation: "Wenn + Präsens, werd + Infinitiv = erster Konditional.",
            },
          ],
        },
      ],
    },
    {
      title: "Relativsätze",
      lessons: [
        {
          title: "Der/die/das",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist richtig?",
              options: ["Der Mann, der dort steht", "Der Mann, was dort steht", "Der Mann, wer dort steht", "Der Mann, dessen dort steht"],
              correctAnswer: "0",
              explanation: "Der/die/das für Personen/Sachen.",
            },
          ],
        },
      ],
    },
    {
      title: "Passiv Präsens",
      lessons: [
        {
          title: "Werden + Partizip II",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Passiv?",
              options: ["Das Buch wird gelesen", "Ich lese das Buch", "Das Buch las", "Ich habe das Buch gelesen"],
              correctAnswer: "0",
              explanation: "Werden + Partizip II = Passiv.",
            },
          ],
        },
      ],
    },
    {
      title: "Indirekte Rede",
      lessons: [
        {
          title: "Zeitenwechsel",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Er sagte: 'Ich bin müde.' → Er sagte, dass er ___ .",
              options: ["müde sei", "müde ist", "müde war", "müde gewesen ist"],
              correctAnswer: "0",
              explanation: "Präsens → Konjunktiv I (sei).",
            },
          ],
        },
      ],
    },
    {
      title: "Modalverben der Obligation",
      lessons: [
        {
          title: "Müssen und haben zu",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was drückt Verpflichtung aus?",
              options: ["Ich muss gehen", "Ich kann gehen", "Ich darf gehen", "Ich werde gehen"],
              correctAnswer: "0",
              explanation: "Müssen = starke Verpflichtung.",
            },
          ],
        },
      ],
    },
    {
      title: "Phrasalverben",
      lessons: [
        {
          title: "Trennbare Verben",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Aufstehen' bedeutet:",
              options: ["Wach auf/Steh auf", "Sitz dich", "Leg dich", "Geh schlafen"],
              correctAnswer: "0",
              explanation: "Aufstehen = wach auf/steh auf.",
            },
          ],
        },
      ],
    },
    {
      title: "Arbeit und Berufsleben",
      lessons: [
        {
          title: "Vorstellungsgespräche",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was sagt man über Stärken?",
              options: ["Ich bin fleißig", "Ich bin Fleiß", "Ich habe Fleiß", "Ich bin fleißig sein"],
              correctAnswer: "0",
              explanation: "Ich bin + Adjektiv (fleißig).",
            },
          ],
        },
      ],
    },
    {
      title: "Umwelt und Gesellschaft",
      lessons: [
        {
          title: "Umweltprobleme",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was verursacht globale Erwärmung?",
              options: ["Treibhausgase", "Bäume", "Ozeane", "Regen"],
              correctAnswer: "0",
              explanation: "Treibhausgase halten Wärme.",
            },
          ],
        },
      ],
    },
    {
      title: "Medien und Unterhaltung",
      lessons: [
        {
          title: "Nachrichten",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Wo liest du aktuelle Nachrichten?",
              options: ["Nachrichtenwebsite", "Kochbuch", "Roman", "Wörterbuch"],
              correctAnswer: "0",
              explanation: "Nachrichtenwebsites haben aktuelle Ereignisse.",
            },
          ],
        },
      ],
    },
    {
      title: "Bildung und Lernen",
      lessons: [
        {
          title: "Hochschulbildung",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist eine Universität?",
              options: ["Ort für höhere Bildung", "Grundschule", "Kindergarten", "Berufsschule"],
              correctAnswer: "0",
              explanation: "Universitaten bieten Studiengänge.",
            },
          ],
        },
      ],
    },
    {
      title: "Gesundheit und Lebensstil",
      lessons: [
        {
          title: "Gesunde Ernährung",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist gesundes Essen?",
              options: ["Gemüse", "Süßigkeiten", "Chips", "Limonade"],
              correctAnswer: "0",
              explanation: "Gemüse ist nahrhaft.",
            },
          ],
        },
      ],
    },
    {
      title: "Reisen und Tourismus",
      lessons: [
        {
          title: "Reiseziele",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was besuchen Touristen in Paris?",
              options: ["Eiffelturm", "Big Ben", "Freiheitsstatue", "Große Mauer"],
              correctAnswer: "0",
              explanation: "Eiffelturm ist in Paris.",
            },
          ],
        },
      ],
    },
    {
      title: "Technologie und Innovation",
      lessons: [
        {
          title: "Digitale Transformation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist künstliche Intelligenz?",
              options: ["Maschinen, die denken", "Schnellere Computer", "Größere Bildschirme", "Mehr Speicher"],
              correctAnswer: "0",
              explanation: "KI = Maschinen simulieren menschliche Intelligenz.",
            },
          ],
        },
      ],
    },
    {
      title: "Politik und Regierung",
      lessons: [
        {
          title: "Politische Systeme",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist Demokratie?",
              options: ["Volk wählt", "Ein Herrscher regiert", "Militär regiert", "Religiöse Führer regieren"],
              correctAnswer: "0",
              explanation: "Demokratie = Volk wählt Führer.",
            },
          ],
        },
      ],
    },
    {
      title: "Wissenschaft und Natur",
      lessons: [
        {
          title: "Wissenschaftliche Methode",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist der erste Schritt?",
              options: ["Frage stellen", "Experiment durchführen", "Schlussfolgerung ziehen", "Daten analysieren"],
              correctAnswer: "0",
              explanation: "Wissenschaftliche Methode beginnt mit Frage.",
            },
          ],
        },
      ],
    },
    {
      title: "Kunst und Kultur",
      lessons: [
        {
          title: "Bildende Kunst",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Gemälde?",
              options: ["Kunst auf Leinwand", "Tonskulptur", "Steingebäude", "Musikstück"],
              correctAnswer: "0",
              explanation: "Gemälde = Kunst auf Leinwand/Papier.",
            },
          ],
        },
      ],
    },
    {
      title: "Zukunftspläne",
      lessons: [
        {
          title: "Karriereziele",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Was ist ein Karriereziel?",
              options: ["Arzt werden", "Mittagessen", "Gut schlafen", "Fernsehen"],
              correctAnswer: "0",
              explanation: "Karriereziel = berufliche Aspiration.",
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
    const { course: courseData, modules: modulesData } = germanB1CourseData;
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
    console.error("Error creating German B1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
