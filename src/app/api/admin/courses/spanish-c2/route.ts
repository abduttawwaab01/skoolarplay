import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const spanishC2CourseData = {
  course: {
    title: "Spanish C2 - Maestría",
    description: "Maestría del español: fluidez nativa, análisis literario, retórica avanzada y dominios especializados.",
    difficulty: "EXPERT",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Precisión Léxica",
      lessons: [
        {
          title: "Vocabulario Raro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué significa 'oler'?",
              options: ["Leer detenidamente", "Deslizar rápido", "Escribir brevemente", "Hablar fuerte"],
              correctAnswer: "0",
              explanation: "'Oler' = leer algo detenidamente.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: El abogado usó ___ (jerga) técnica para confundir al jurado.",
              correctAnswer: "jerga",
              explanation: "'Jerga' = lenguaje profesional especializado.",
            },
          ],
        },
      ],
    },
    {
      title: "Términos Arcaicos y Literarios",
      lessons: [
        {
          title: "Lenguaje Shakesperiano",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "En español arcaico, ¿qué significa 'vos'?",
              options: ["Tú (singular)", "Él", "Ella", "Ellos"],
              correctAnswer: "0",
              explanation: "'Vos' = arcaico para 'tú' (singular).",
            },
          ],
        },
      ],
    },
    {
      title: "Especialización Profesional",
      lessons: [
        {
          title: "Discurso Experto",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'stare decisis'?",
              options: ["Precedente legal", "Procedimiento médico", "Estrategia empresarial", "Método científico"],
              correctAnswer: "0",
              explanation: "'Stare decisis' = principio legal de precedente.",
            },
          ],
        },
      ],
    },
    {
      title: "Dialectos Regionales y Jerga",
      lessons: [
        {
          title: "Variaciones Regionales",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'vos' en Argentina?",
              options: ["Tú plural/formal", "Saludo británico", "Expresión australiana", "Término canadiense"],
              correctAnswer: "0",
              explanation: "'Vos' en Argentina = 'tú' con conjugación especial.",
            },
          ],
        },
      ],
    },
    {
      title: "Maestría Metafórica",
      lessons: [
        {
          title: "Metáforas Complejas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es metáfora conceptual?",
              options: ["Pensamiento estructurado por metáforas", "Recursos poéticos", "Reglas gramaticales", "Patrones de pronunciación"],
              correctAnswer: "0",
              explanation: "Metáforas conceptuales moldean cómo pensamos.",
            },
          ],
        },
      ],
    },
    {
      title: "Debatte de Alto Nivel",
      lessons: [
        {
          title: "Retórica Avanzada",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "En retórica, ¿qué es 'ethos'?",
              options: ["Credibilidad/carácter", "Apelación emocional", "Argumento lógico", "Humor"],
              correctAnswer: "0",
              explanation: "'Ethos' = credibilidad del hablante.",
            },
          ],
        },
      ],
    },
    {
      title: "Matices Culturales Sutiles",
      lessons: [
        {
          title: "Competencia Pragmática",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué significa pragmáticamente 'Es una idea interesante'?",
              options: ["No estoy de acuerdo (educadamente)", "Me encanta", "Lo haré", "Es fascinante"],
              correctAnswer: "0",
              explanation: "En cultura inglesa = desacuerdo educado.",
            },
          ],
        },
      ],
    },
    {
      title: "Fluidez Idiomática",
      lessons: [
        {
          title: "Modismos Avanzados",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'El elefante en la habitación' significa:",
              options: ["Problema obvio ignorado", "Animal grande", "Artículo caro", "Mueble pesado"],
              correctAnswer: "0",
              explanation: "Elefante en la habitación = problema obvio que todos ignoran.",
            },
          ],
        },
      ],
    },
    {
      title: "Perfección Gramatical",
      lessons: [
        {
          title: "Sintaxis Avanzada",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál usa subjuntivo correcto?",
              options: ["Insisto en que él esté presente", "Insisto en que él es presente", "Insisto en que él estaba presente", "Insisto en que él ha estado presente"],
              correctAnswer: "0",
              explanation: "Subjuntivo = forma base después de ciertos verbos.",
            },
          ],
        },
      ],
    },
    {
      title: "Expresión Creativa",
      lessons: [
        {
          title: "Creatividad Literaria",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'flujo de consciencia'?",
              options: ["Monólogo interior", "Diálogo", "Descripción", "Resumen de trama"],
              correctAnswer: "0",
              explanation: "Flujo de consciencia = pensamientos continuos del personaje.",
            },
          ],
        },
      ],
    },
    {
      title: "Discurso Académico",
      lessons: [
        {
          title: "Escritura Académica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es apropiado para tesis?",
              options: ["Este estudio demuestra", "Yo creo que", "Tú sabes que", "Nosotros vemos que"],
              correctAnswer: "0",
              explanation: "Voz académica = objetiva, formal.",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicación Profesional",
      lessons: [
        {
          title: "Comunicación Ejecutiva",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es nivel ejecutivo?",
              options: ["Alineación estratégica", "Buen trabajo", "Lindo", "Sigue así"],
              correctAnswer: "0",
              explanation: "Comunicación ejecutiva = vocabulario estratégico.",
            },
          ],
        },
      ],
    },
    {
      title: "Análisis Crítico",
      lessons: [
        {
          title: "Marcos Analíticos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es análisis de SWOT?",
              options: ["Fortalezas, Debilidades, Oportunidades, Amenazas", "Teoría literaria", "Marco gramatical", "Modelo matemático"],
              correctAnswer: "0",
              explanation: "SWOT = Fortalezas, Debilidades, Oportunidades, Amenazas.",
            },
          ],
        },
      ],
    },
    {
      title: "Competencia Intercultural",
      lessons: [
        {
          title: "Maestría Intercultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'inteligencia cultural'?",
              options: ["Adaptabilidad entre culturas", "Prueba de coeficiente intelectual", "Habilidad de idiomas", "Experiencia de viaje"],
              correctAnswer: "0",
              explanation: "Inteligencia cultural = habilidad de adaptarse entre culturas.",
            },
          ],
        },
      ],
    },
    {
      title: "Traducción Especializada",
      lessons: [
        {
          title: "Teoría de Traducción",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'equivalencia dinámica'?",
              options: ["Traducción basada en significado", "Palabra por palabra", "Traducción literal", "Gramática de traducción"],
              correctAnswer: "0",
              explanation: "Equivalencia dinámica = traducir significado, no palabras.",
            },
          ],
        },
      ],
    },
    {
      title: "Teoría Lingüística",
      lessons: [
        {
          title: "Gramática Generativa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Quién propuso Gramática Universal?",
              options: ["Chomsky", "Saussure", "Halliday", "Labov"],
              correctAnswer: "0",
              explanation: "Noam Chomsky propuso Gramática Universal.",
            },
          ],
        },
      ],
    },
    {
      title: "Análisis del Discurso",
      lessons: [
        {
          title: "Análisis Crítico del Discurso",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué examina ACD?",
              options: ["Poder en el lenguaje", "Reglas gramaticales", "Vocabulario", "Pronunciación"],
              correctAnswer: "0",
              explanation: "ACD = cómo el lenguaje refleja/mantiene relaciones de poder.",
            },
          ],
        },
      ],
    },
    {
      title: "Excelencia Retórica",
      lessons: [
        {
          title: "Retórica Clásica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Quién escribió 'Retórica'?",
              options: ["Aristóteles", "Cicerón", "Quintiliano", "Platón"],
              correctAnswer: "0",
              explanation: "Aristóteles escribió 'Retórica' (siglo IV a.C.).",
            },
          ],
        },
      ],
    },
    {
      title: "Síntesis Cultural",
      lessons: [
        {
          title: "Integración Multicultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'hibridez cultural'?",
              options: ["Identidades culturales mezcladas", "Cultura pura", "Cultura aislada", "Cultura antigua"],
              correctAnswer: "0",
              explanation: "Hibridez cultural = mezcla de múltiples influencias culturales.",
            },
          ],
        },
      ],
    },
    {
      title: "Demostración de Maestría",
      lessons: [
        {
          title: "Fluidez Casi-Nativa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál demuestra matiz de nivel C2?",
              options: ["No podría estar más de acuerdo", "Estoy de acuerdo", "Sí, correcto", "Tienes razón"],
              correctAnswer: "0",
              explanation: "Expresión sofisticada, matizada = nivel C2.",
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
    const { course: courseData, modules: modulesData } = spanishC2CourseData;
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
            gemReward: 5 + Math.floor(Math.random() * 5),
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
    console.error("Error creating Spanish C2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
