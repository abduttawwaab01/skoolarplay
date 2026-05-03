import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const spanishB1CourseData = {
  course: {
    title: "Spanish B1 - Intermedio Alto",
    description: "Español intermedio: pretérito perfecto, condicionales, voz pasiva, y comunicación profesional.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Pretérito Perfecto",
      lessons: [
        {
          title: "Haber + Participio",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["He comido", "He comido", "He comiendo", "Hube comido"],
              correctAnswer: "0",
              explanation: "Haber + participio = pretérito perfecto.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: Ellos ___ (han) vivido aquí.",
              correctAnswer: "han",
              explanation: "Han + participio = 3ra persona plural.",
            },
            {
              type: "SPEECH",
              question: "He visitado Madrid tres veces.",
              correctAnswer: "He visitado Madrid tres veces.",
              language: "es",
              hint: "Say: I have visited Madrid three times",
            },
          ],
        },
        {
          title: "Ya/Nunca/Justa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué significa 'alguna vez'?",
              options: ["Ever", "Never", "Just", "Already"],
              correctAnswer: "0",
              explanation: "'Alguna vez' = ever.",
            },
          ],
        },
      ],
    },
    {
      title: "Condicionales Tipo 1",
      lessons: [
        {
          title: "Si + Presente, Futuro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["Si llueve, me quedaré", "Si llovió, me quedaría", "Si llueve, me quedé", "Si llueva, me quedaré"],
              correctAnswer: "0",
              explanation: "Si + presente, futuro = primera condicional.",
            },
          ],
        },
      ],
    },
    {
      title: "Cláusulas de Relativo",
      lessons: [
        {
          title: "Que/Quien/Cuyo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["El hombre que vive aquí", "El hombre cuyo vive aquí", "El hombre quien vive aquí", "El hombre que vive aquí"],
              correctAnswer: "0",
              explanation: "'Que' puede referirse a personas o cosas.",
            },
          ],
        },
      ],
    },
    {
      title: "Voz Pasiva Básica",
      lessons: [
        {
          title: "Ser + Participio",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es voz pasiva?",
              options: ["La carta fue escrita", "Escribí la carta", "Escribo la carta", "He escrito la carta"],
              correctAnswer: "0",
              explanation: "Ser + participio = voz pasiva.",
            },
          ],
        },
      ],
    },
    {
      title: "Estilo Indirecto",
      lessons: [
        {
          title: "Cambio de Tiempos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Él dijo: 'Estoy cansado.' → Él dijo que ___ cansado.",
              options: ["estaba", "estoy", "estuve", "he estado"],
              correctAnswer: "0",
              explanation: "Presente → pasado en estilo indirecto.",
            },
          ],
        },
      ],
    },
    {
      title: "Verbos Modales de Obligación",
      lessons: [
        {
          title: "Deber y Tener que",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué expresa obligación?",
              options: ["Debo ir", "Puedo ir", "Quiero ir", "Suelo ir"],
              correctAnswer: "0",
              explanation: "Deber = obligación.",
            },
          ],
        },
      ],
    },
    {
      title: "Verbos Fraseológicos",
      lessons: [
        {
          title: "Verbos Comunes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Levantarse' significa:",
              options: ["Wake up", "Sit down", "Lie down", "Go to sleep"],
              correctAnswer: "0",
              explanation: "Levantarse = wake up/get up.",
            },
          ],
        },
      ],
    },
    {
      title: "Trabajo y Vida Profesional",
      lessons: [
        {
          title: "Entrevistas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué dices sobre tus fortalezas?",
              options: ["Soy trabajador", "Tengo trabajador", "Estoy trabajador", "Trabajo trabajador"],
              correctAnswer: "0",
              explanation: "Soy + sustantivo (trabajador).",
            },
          ],
        },
      ],
    },
    {
      title: "Medio Ambiente y Sociedad",
      lessons: [
        {
          title: "Problemas Ambientales",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué causa el calentamiento global?",
              options: ["Gases de efecto invernadero", "Árboles", "Lluvia", "Viento"],
              correctAnswer: "0",
              explanation: "Los gases atrapan el calor.",
            },
          ],
        },
      ],
    },
    {
      title: "Medios y Entretenimiento",
      lessons: [
        {
          title: "Noticias",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Dónde lees noticias?",
              options: ["Periódico", "Libro", "Novela", "Diccionario"],
              correctAnswer: "0",
              explanation: "Periódico = newspaper.",
            },
          ],
        },
      ],
    },
    {
      title: "Educación y Aprendizaje",
      lessons: [
        {
          title: "Educación Superior",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es una universidad?",
              options: ["Lugar de educación superior", "Escuela primaria", "Jardín de niños", "Guardería"],
              correctAnswer: "0",
              explanation: "Universidad = higher education.",
            },
          ],
        },
      ],
    },
    {
      title: "Salud y Estilo de Vida",
      lessons: [
        {
          title: "Dieta Saludable",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es comida saludable?",
              options: ["Verduras", "Dulces", "Papas fritas", "Refrescos"],
              correctAnswer: "0",
              explanation: "Verduras = vegetables, son saludables.",
            },
          ],
        },
      ],
    },
    {
      title: "Viajes y Turismo",
      lessons: [
        {
          title: "Atracciones Turísticas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué visitas en Barcelona?",
              options: ["Sagrada Familia", "Torre Eiffel", "Estatua de la Libertad", "Muralla China"],
              correctAnswer: "0",
              explanation: "Sagrada Familia está en Barcelona.",
            },
          ],
        },
      ],
    },
    {
      title: "Tecnología e Innovación",
      lessons: [
        {
          title: "Transformación Digital",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es la inteligencia artificial?",
              options: ["Máquinas que piensan", "Computadoras más rápidas", "Pantallas más grandes", "Más memoria"],
              correctAnswer: "0",
              explanation: "IA = máquinas que simulan inteligencia humana.",
            },
          ],
        },
      ],
    },
    {
      title: "Relaciones y Vida Social",
      lessons: [
        {
          title: "Dinámicas de Amistad",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué hace un buen amigo?",
              options: ["Confiable", "Rico", "Famoso", "Ocupado"],
              correctAnswer: "0",
              explanation: "Confiable = trustworthy.",
            },
          ],
        },
      ],
    },
    {
      title: "Consumismo y Compras",
      lessons: [
        {
          title: "Derechos del Consumidor",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es un reembolso?",
              options: ["Dinero devuelto", "Cambiar artículo", "Crédito en tienda", "Tarjeta de regalo"],
              correctAnswer: "0",
              explanation: "Reembolso = money back.",
            },
          ],
        },
      ],
    },
    {
      title: "Política y Gobierno",
      lessons: [
        {
          title: "Sistemas Políticos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es la democracia?",
              options: ["La gente vota", "Un líder gobierna", "Militares gobiernan", "Líderes religiosos gobiernan"],
              correctAnswer: "0",
              explanation: "Democracia = la gente elige líderes.",
            },
          ],
        },
      ],
    },
    {
      title: "Ciencia y Naturaleza",
      lessons: [
        {
          title: "Método Científico",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es el primer paso del método científico?",
              options: ["Hacer una pregunta", "Hacer un experimento", "Sacar conclusión", "Analizar datos"],
              correctAnswer: "0",
              explanation: "Método científico empieza con pregunta.",
            },
          ],
        },
      ],
    },
    {
      title: "Artes y Cultura",
      lessons: [
        {
          title: "Artes Visuales",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es una pintura?",
              options: ["Arte en lienzo", "Escultura de barro", "Edificio de piedra", "Pieza musical"],
              correctAnswer: "0",
              explanation: "Pintura = arte en lienzo/papel.",
            },
          ],
        },
      ],
    },
    {
      title: "Planes y Ambiciones",
      lessons: [
        {
          title: "Metas Profesionales",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es una meta profeesional?",
              options: ["Aspiración en carrera", "Comer almuerzo", "Dormir bien", "Ver TV"],
              correctAnswer: "0",
              explanation: "Meta profeesional = aspiración de carrera.",
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
    const { course: courseData, modules: modulesData } = spanishB1CourseData;
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
    console.error("Error creating Spanish B1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
