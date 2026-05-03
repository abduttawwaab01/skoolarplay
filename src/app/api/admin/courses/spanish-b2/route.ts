import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const spanishB2CourseData = {
  course: {
    title: "Spanish B2 - Intermedio Superior",
    description: "Español intermedio superior: condicionales mixtas, voz pasiva avanzada, modismos y conceptos abstractos.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Condicionales Mixtas",
      lessons: [
        {
          title: "Tercer Condicional",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es tercer condicional?",
              options: ["Si hubiera estudiado, habría pasado", "Si estudio, pasaré", "Si estudiara, pasaría", "Si he estudiado, paso"],
              correctAnswer: "0",
              explanation: "Si + pluscuamperfecto, habría + participio = tercer condicional.",
            },
          ],
        },
      ],
    },
    {
      title: "Voz Pasiva Avanzada",
      lessons: [
        {
          title: "Pasiva con Modales",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["Debe ser hecho", "Debe es hecho", "Debe fue hecho", "Debe hacer"],
              correctAnswer: "0",
              explanation: "Modal + ser + participio = pasiva con modal.",
            },
          ],
        },
      ],
    },
    {
      title: "Deducción y Especulación",
      lessons: [
        {
          title: "Deber de ser",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué expresa certeza?",
              options: ["Debe de estar en casa", "Podría estar en casa", "Podría ser en casa", "Debería estar en casa"],
              correctAnswer: "0",
              explanation: "'Deber de' + infinitivo = 90-100% certeza.",
            },
          ],
        },
      ],
    },
    {
      title: "Cláusulas de Relativo Avanzadas",
      lessons: [
        {
          title: "Relativos con Preposición",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["El hombre que hablé", "El hombre a quien hablé", "El hombre quien hablé", "El hombre que hablé a él"],
              correctAnswer: "0",
              explanation: "Preposición al final cuando omitimos pronombre.",
            },
          ],
        },
      ],
    },
    {
      title: "Modismos",
      lessons: [
        {
          title: "Modismos de Cuerpo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Costar un ojo de la cara' significa:",
              options: ["Muy caro", "Barato", "Gratis", "Precio medio"],
              correctAnswer: "0",
              explanation: "'Costar un ojo de la cara' = very expensive.",
            },
          ],
        },
        {
          title: "Modismos de Animales",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Estar como una cabra' significa:",
              options: ["Estar loco", "Estar feliz", "Estar triste", "Estar cansado"],
              correctAnswer: "0",
              explanation: "'Como una cabra' = crazy.",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicación de Negocios",
      lessons: [
        {
          title: "Correos Electrónicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es cierre formal?",
              options: ["Atentamente", "Chao", "Nos vemos", "Saludos"],
              correctAnswer: "0",
              explanation: "Atentamente = formal closing.",
            },
          ],
        },
      ],
    },
    {
      title: "Historia y Cultura",
      lessons: [
        {
          title: "Eventos Históricos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuándo terminó la Guerra Civil Española?",
              options: ["1939", "1918", "2001", "1969"],
              correctAnswer: "0",
              explanation: "La Guerra Civil terminó en 1939.",
            },
          ],
        },
      ],
    },
    {
      title: "Ciencia y Tecnología",
      lessons: [
        {
          title: "Descubrimientos Científicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Quién descubrió la penicilina?",
              options: ["Fleming", "Einstein", "Newton", "Curie"],
              correctAnswer: "0",
              explanation: "Alexander Fleming descubrió la penicilina.",
            },
          ],
        },
      ],
    },
    {
      title: "Política y Asuntos Sociales",
      lessons: [
        {
          title: "Discurso Político",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es la democracia?",
              options: ["La gente vota", "Un gobernante", "Militares", "Religiosos"],
              correctAnswer: "0",
              explanation: "Democracia = people vote.",
            },
          ],
        },
      ],
    },
    {
      title: "Conceptos Abstractos",
      lessons: [
        {
          title: "Ideas Filosóficas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'ética'?",
              options: ["Principios morales", "Reglas matemáticas", "Reglas deportivas", "Métodos de cocina"],
              correctAnswer: "0",
              explanation: "Ética = principios morales.",
            },
          ],
        },
      ],
    },
    {
      title: "Verbos Fraseológicos Avanzados",
      lessons: [
        {
          title: "Verbos Complejos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Echarse a' significa:",
              options: ["Empezar", "Subir", "Llegar", "Suceder accidentalmente"],
              correctAnswer: "0",
              explanation: "'Echarse a' = start doing something.",
            },
          ],
        },
      ],
    },
    {
      title: "Medio Ambiente y Sostenibilidad",
      lessons: [
        {
          title: "Cambio Climático",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué causa el calentamiento global?",
              options: ["Gases de efecto invernadero", "Árboles", "Océanos", "Lluvia"],
              correctAnswer: "0",
              explanation: "Gases de efecto invernadero atrapan calor.",
            },
          ],
        },
      ],
    },
    {
      title: "Educación y Pedagogía",
      lessons: [
        {
          title: "Teorías de Aprendizaje",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'aprendizaje kinestésico'?",
              options: ["Aprender haciendo", "Aprender leyendo", "Aprender escuchando", "Aprender mirando"],
              correctAnswer: "0",
              explanation: "Kinestésico = hands-on learning.",
            },
          ],
        },
      ],
    },
    {
      title: "Salud y Medicina",
      lessons: [
        {
          title: "Terminología Médica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'cardiología'?",
              options: ["Medicina del corazón", "Medicina de huesos", "Medicina de piel", "Medicina del cerebro"],
              correctAnswer: "0",
              explanation: "Cardio = corazón. Cardiología = corazón.",
            },
          ],
        },
      ],
    },
    {
      title: "Medios y Periodismo",
      lessons: [
        {
          title: "Escritura Periodística",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'clickbait'?",
              options: ["Titular sensacionalista", "Noticia seria", "Noticia local", "Noticia deportiva"],
              correctAnswer: "0",
              explanation: "Clickbait = titular sensacionalista para clics.",
            },
          ],
        },
      ],
    },
    {
      title: "Literatura y Artes",
      lessons: [
        {
          title: "Análisis Literario",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'metáfora'?",
              options: ["Comparación implícita", "Comparación explícita", "Exageración", "Contraste"],
              correctAnswer: "0",
              explanation: "Metáfora: A es B (implícito).",
            },
          ],
        },
      ],
    },
    {
      title: "Economía y Finanzas",
      lessons: [
        {
          title: "Principios Económicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'oferta y demanda'?",
              options: ["Fuerzas del mercado", "Control gubernamental", "Caridad", "Robo"],
              correctAnswer: "0",
              explanation: "Oferta y demanda = fuerzas del mercado.",
            },
          ],
        },
      ],
    },
    {
      title: "Psicología y Comportamiento",
      lessons: [
        {
          title: "Teorías Psicológicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'disonancia cognitiva'?",
              options: ["Malestar mental", "Felicidad", "Tristeza", "Enojo"],
              correctAnswer: "0",
              explanation: "Disonancia cognitiva = malestar mental por creencias conflictivas.",
            },
          ],
        },
      ],
    },
    {
      title: "Globalización y Cultura",
      lessons: [
        {
          title: "Intercambio Cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es intercambio cultural?",
              options: ["Compartir tradiciones", "Guerra", "Aislamiento", "Robo"],
              correctAnswer: "0",
              explanation: "Intercambio cultural = compartir entre culturas.",
            },
          ],
        },
      ],
    },
    {
      title: "Innovación y Futuro",
      lessons: [
        {
          title: "Tecnologías Emergentes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'blockchain'?",
              options: ["Libro de contabilidad descentralizado", "Banco centralizado", "Tarjeta de crédito", "Efectivo"],
              correctAnswer: "0",
              explanation: "Blockchain = libro digital descentralizado.",
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
    const { course: courseData, modules: modulesData } = spanishB2CourseData;
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
    console.error("Error creating Spanish B2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
