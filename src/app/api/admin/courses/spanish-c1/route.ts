import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const spanishC1CourseData = {
  course: {
    title: "Spanish C1 - Avanzado",
    description: "Español avanzado: matices de significado, registros formales, gramática sofisticada y discurso académico.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Matices de Significado",
      lessons: [
        {
          title: "Diferencias Sutiles",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es la diferencia entre 'prestigio' y 'prestigioso'?",
              options: ["Sustantivo vs adjetivo", "Mismo significado", "Verbo vs sustantivo", "Adjetivo vs adverbio"],
              correctAnswer: "0",
              explanation: "'Prestigio' es sustantivo, 'prestigioso' es adjetivo.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: La ___ (sutil) diferencia era difícil de notar.",
              correctAnswer: "sutil",
              explanation: "Sutil = no obvia, delicada.",
            },
            {
              type: "SPEECH",
              question: "El matiz entre estas palabras es sutil.",
              correctAnswer: "El matiz entre estas palabras es sutil.",
              language: "es",
              hint: "Say: The nuance is subtle",
            },
          ],
        },
        {
          title: "Connotación vs Denotación",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué connotación tiene 'delgado' vs 'flaco'?",
              options: ["Positiva vs negativa", "Negativa vs positiva", "Mismo significado", "Ambas negativas"],
              correctAnswer: "0",
              explanation: "Delgado = positiva, flaco = negativa.",
            },
          ],
        },
      ],
    },
    {
      title: "Recursos Retóricos",
      lessons: [
        {
          title: "Metáfora y Símil",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'El tiempo es un ladrón' es:",
              options: ["Metáfora", "Símil", "Personificación", "Hipérbole"],
              correctAnswer: "0",
              explanation: "Metáfora: A es B (sin 'como' o 'como').",
            },
          ],
        },
      ],
    },
    {
      title: "Estilo Académico",
      lessons: [
        {
          title: "Hedging y Boosting",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es un hedge (atenuante)?",
              options: ["Podría", "Definitivamente", "Ciertamente", "Siempre"],
              correctAnswer: "0",
              explanation: "'Podría' atenúa la afirmación (hedge).",
            },
          ],
        },
      ],
    },
    {
      title: "Registro Formal vs Informal",
      lessons: [
        {
          title: "Continuo de Registro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es más formal?",
              options: ["Adquirir", "Conseguir", "Comprar", "Obtener"],
              correctAnswer: "0",
              explanation: "'Adquirir' es más formal que 'conseguir'.",
            },
          ],
        },
      ],
    },
    {
      title: "Estructuras Sintácticas Complejas",
      lessons: [
        {
          title: "Subordinación",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál muestra subordinación?",
              options: ["Aunque llovió, fuimos", "Llovió y fuimos", "Llovió, así que fuimos", "Llovió; fuimos"],
              correctAnswer: "0",
              explanation: "'Aunque' = conjunción subordinante.",
            },
          ],
        },
      ],
    },
    {
      title: "Filosofía y Ética",
      lessons: [
        {
          title: "Marcos Éticos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'utilitarianismo'?",
              options: ["Mayor bien para mayor número", "Ética del deber", "Ética de la virtud", "Relativismo"],
              correctAnswer: "0",
              explanation: "Utilitarianismo = maximizar felicidad general.",
            },
          ],
        },
      ],
    },
    {
      title: "Análisis Literario",
      lessons: [
        {
          title: "Técnicas Narrativas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'narrador poco fiable'?",
              options: ["Narrador no confiable", "Narrador omnisciente", "Narrador en primera persona", "Narrador en tercera"],
              correctAnswer: "0",
              explanation: "Narrador cuya palabra no podemos creer.",
            },
          ],
        },
      ],
    },
    {
      title: "Marcadores Discursivos Avanzados",
      lessons: [
        {
          title: "Conectores Académicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál muestra contraste formal?",
              options: ["No obstante", "Y", "Además", "Asimismo"],
              correctAnswer: "0",
              explanation: "'No obstante' = contraste (formal).",
            },
          ],
        },
      ],
    },
    {
      title: "Oraciones Escindidas",
      lessons: [
        {
          title: "Escisión con 'Es'",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Fue Juan quien llamó' es un ejemplo de:",
              options: ["Oración escindida", "Condicional", "Voz pasiva", "Pregunta"],
              correctAnswer: "0",
              explanation: "Enfoca en 'Juan' como sujeto.",
            },
          ],
        },
      ],
    },
    {
      title: "Inversión para Énfasis",
      lessons: [
        {
          title: "Inversión Negativa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál usa inversión negativa?",
              options: ["Nunca he visto eso", "He visto eso nunca", "Yo nunca he visto eso", "Nunca yo he visto eso"],
              correctAnswer: "0",
              explanation: "'Nunca' + verbo + sujeto = inversión.",
            },
          ],
        },
      ],
    },
    {
      title: "Especialización Profesional",
      lessons: [
        {
          title: "Lenguaje Jurídico",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué significa 'demandante'?",
              options: ["Persona que demanda", "Persona demandada", "Juez", "Abogado"],
              correctAnswer: "0",
              explanation: "Demandante = quien presenta la demanda.",
            },
          ],
        },
      ],
    },
    {
      title: "Sociolingüística",
      lessons: [
        {
          title: "Variación Lingüística",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es un 'dialecto'?",
              options: ["Variación regional", "Lenguaje formal", "Lenguaje escrito", "Lengua extranjera"],
              correctAnswer: "0",
              explanation: "Dialecto = variación regional/social.",
            },
          ],
        },
      ],
    },
    {
      title: "Lingüística Cognitiva",
      lessons: [
        {
          title: "Metáforas Cognitivas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'El tiempo es dinero' es metáfora cognitiva que significa:",
              options: ["El tiempo es valioso", "El tiempo es rápido", "El tiempo es lento", "El tiempo es gratis"],
              correctAnswer: "0",
              explanation: "TIEMPO ES DINERO = recurso valioso.",
            },
          ],
        },
      ],
    },
    {
      title: "Análisis del Discurso Mediático",
      lessons: [
        {
          title: "Análisis Crítico",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué examina el análisis crítico del discurso?",
              options: ["Poder en el lenguaje", "Reglas gramaticales", "Tamaño del vocabulario", "Pronunciación"],
              correctAnswer: "0",
              explanation: "ACD = cómo el lenguaje refleja relaciones de poder.",
            },
          ],
        },
      ],
    },
    {
      title: "Metodología de Investigación",
      lessons: [
        {
          title: "Diseño de Investigación",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'investigación cualitativa'?",
              options: ["Datos no numéricos", "Datos estadísticos", "Modelos matemáticos", "Experimentos"],
              correctAnswer: "0",
              explanation: "Cualitativa = entrevistas, observaciones (no números).",
            },
          ],
        },
      ],
    },
    {
      title: "Crítica Cultural",
      lessons: [
        {
          title: "Teoría Cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'capital cultural'?",
              options: ["Conocimiento/educación como activo", "Dinero para cultura", "Colección de arte", "Turismo"],
              correctAnswer: "0",
              explanation: "Capital cultural = Bourdieu's concept.",
            },
          ],
        },
      ],
    },
    {
      title: "Argumentación Avanzada",
      lessons: [
        {
          title: "Falacias Lógicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Todos lo hacen' es qué falacia?",
              options: ["Ad populum", "Hombre de paja", "Ad hominem", "Causa falsa"],
              correctAnswer: "0",
              explanation: "'Todos lo hacen' = apelación a la masa.",
            },
          ],
        },
      ],
    },
    {
      title: "Psicolingüística",
      lessons: [
        {
          title: "Adquisición de Lenguaje",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'hipótesis del periodo crítico'?",
              options: ["Más fácil aprender joven", "Reglas gramaticales", "Tamaño de vocabulario", "Reglas de pronunciación"],
              correctAnswer: "0",
              explanation: "Más fácil aprender lenguaje cuando joven.",
            },
          ],
        },
      ],
    },
    {
      title: "Asuntos Globales y Diplomacia",
      lessons: [
        {
          title: "Lenguaje Diplomático",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué es 'poder blando'?",
              options: ["Persuasión/cultura", "Fuerza militar", "Sanciones económicas", "Guerra"],
              correctAnswer: "0",
              explanation: "Poder blando = persuasión, cultura, valores.",
            },
          ],
        },
      ],
    },
    {
      title: "Maestría Estilística",
      lessons: [
        {
          title: "Variación Estilística",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál muestra variación elegante?",
              options: ["El gato, el felino, el minino", "El gato, el gato, el gato", "Gato, gato, gato", "El gato, él, lo"],
              correctAnswer: "0",
              explanation: "Variación elegante = evitar repetición con sinónimos.",
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
    const { course: courseData, modules: modulesData } = spanishC1CourseData;
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
    console.error("Error creating Spanish C1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
