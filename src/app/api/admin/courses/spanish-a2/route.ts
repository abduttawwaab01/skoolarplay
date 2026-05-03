import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const spanishA2CourseData = {
  course: {
    title: "Spanish A2 - Intermedio",
    description: "Aprende español intermedio. Domina pasado, futuro, comparativos y comunicación cotidiana.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Pasado Simple",
      lessons: [
        {
          title: "Verbos Regulares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'I walked'?",
              options: ["Caminé", "Camino", "Caminando", "Caminado"],
              correctAnswer: "0",
              explanation: "Caminar → caminé (pasado).",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: Ella ___ (comió) pizza ayer.",
              correctAnswer: "comió",
              explanation: "Comer → comió (pasado).",
            },
            {
              type: "SPEECH",
              question: "Visité Madrid el año pasado.",
              correctAnswer: "Visité Madrid el año pasado.",
              language: "es",
              hint: "Say: I visited Madrid last year",
            },
          ],
        },
        {
          title: "Verbos Irregulares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es el pasado de 'ir'?",
              options: ["Fui", "Voy", "Voyendo", "Iría"],
              correctAnswer: "0",
              explanation: "Ir → fui (irregular).",
            },
            {
              type: "TRUE_FALSE",
              question: "¿'Comí' es el pasado de 'comer'?",
              correctAnswer: "true",
              explanation: "Comer → comí (pasado).",
            },
          ],
        },
      ],
    },
    {
      title: "Futuro Próximo",
      lessons: [
        {
          title: "Ir a + Infinitivo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'I am going to go'?",
              options: ["Voy a ir", "Fui a ir", "Voy ir", "Iré"],
              correctAnswer: "0",
              explanation: "Ir a + infinitivo = futuro próximo.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: Ella ___ (va) a estudiar.",
              correctAnswer: "va",
              explanation: "Va a + infinitivo.",
            },
          ],
        },
      ],
    },
    {
      title: "Direcciones",
      lessons: [
        {
          title: "Preposiciones",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["Ve a la tienda", "Ve en la tienda", "Ve con la tienda", "Ve por la tienda"],
              correctAnswer: "0",
              explanation: "Ir A un lugar (destino).",
            },
          ],
        },
      ],
    },
    {
      title: "Ropa y Moda",
      lessons: [
        {
          title: "Prendas de Vestir",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'shirt'?",
              options: ["Camisa", "Pantalón", "Zapato", "Sombrero"],
              correctAnswer: "0",
              explanation: "Camisa = shirt.",
            },
            {
              type: "MATCHING",
              question: "Empareja colores con ropa:",
              options: [
                { left: "Camisa roja", right: "Red shirt" },
                { left: "Pantalón azul", right: "Blue pants" },
                { left: "Zapatos negros", right: "Black shoes" },
                { left: "Sombrero blanco", right: "White hat" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Cada prenda con su color.",
            },
          ],
        },
      ],
    },
    {
      title: "Salud y Cuerpo",
      lessons: [
        {
          title: "Enfermedades Comunes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué causa fiebre?",
              options: ["Gripe", "Fractura", "Corte", "Moretón"],
              correctAnswer: "0",
              explanation: "La gripe causa fiebre.",
            },
          ],
        },
      ],
    },
    {
      title: "Viajes y Transporte",
      lessons: [
        {
          title: "Medios de Transporte",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué usas para volar?",
              options: ["Avión", "Coche", "Tren", "Bicicleta"],
              correctAnswer: "0",
              explanation: "Avión = airplane.",
            },
          ],
        },
      ],
    },
    {
      title: "Comparativos",
      lessons: [
        {
          title: "Más/Menos que",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuál es correcto?",
              options: ["Más grande que", "Más grande de", "Más grande como", "Grande más que"],
              correctAnswer: "0",
              explanation: "Más + adjetivo + que.",
            },
          ],
        },
      ],
    },
    {
      title: "Presente Continuo",
      lessons: [
        {
          title: "Estar + -ando/-iendo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'I am eating'?",
              options: ["Estoy comiendo", "Como", "Comí", "Comeré"],
              correctAnswer: "0",
              explanation: "Estar + -iendo = presente continuo.",
            },
          ],
        },
      ],
    },
    {
      title: "Casa y Muebles",
      lessons: [
        {
          title: "Habitaciones",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Dónde duermes?",
              options: ["Dormitorio", "Cocina", "Sala", "Baño"],
              correctAnswer: "0",
              explanation: "Dormitorio = bedroom.",
            },
          ],
        },
      ],
    },
    {
      title: "Clima y Estaciones",
      lessons: [
        {
          title: "El Tiempo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué significa 'soleado'?",
              options: ["Sunny", "Rainy", "Snowy", "Windy"],
              correctAnswer: "0",
              explanation: "Soleado = sunny.",
            },
          ],
        },
      ],
    },
    {
      title: "Trabajo y Profesiones",
      lessons: [
        {
          title: "Trabajos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Quién enseña?",
              options: ["Profesor", "Médico", "Conductor", "Cocinero"],
              correctAnswer: "0",
              explanation: "Profesor = teacher.",
            },
          ],
        },
      ],
    },
    {
      title: "Comida y Restaurantes",
      lessons: [
        {
          title: "Pedir Comida",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué dices para pedir comida?",
              options: ["Quisiera un café", "Dame café", "Quiero café", "Deme café"],
              correctAnswer: "0",
              explanation: "Quisiera = polite request.",
            },
          ],
        },
      ],
    },
    {
      title: "Escuela y Educación",
      lessons: [
        {
          title: "Materias",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'math'?",
              options: ["Matemáticas", "Historia", "Arte", "Música"],
              correctAnswer: "0",
              explanation: "Matemáticas = math.",
            },
          ],
        },
      ],
    },
    {
      title: "Tiempo Libre y Pasatiempos",
      lessons: [
        {
          title: "Deportes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué usa una pelota y canasta?",
              options: ["Baloncesto", "Fútbol", "Tenis", "Natación"],
              correctAnswer: "0",
              explanation: "Baloncesto = basketball.",
            },
          ],
        },
      ],
    },
    {
      title: "Tecnología y Redes",
      lessons: [
        {
          title: "Dispositivos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué usas para llamar?",
              options: ["Teléfono", "Mesa", "Libro", "Silla"],
              correctAnswer: "0",
              explanation: "Teléfono = phone.",
            },
          ],
        },
      ],
    },
    {
      title: "Medio Ambiente",
      lessons: [
        {
          title: "Problemas Ecológicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué causa el calentamiento global?",
              options: ["Gases de efecto invernadero", "Árboles", "Lluvia", "Viento"],
              correctAnswer: "0",
              explanation: "Gases de efecto invernadero atrapan calor.",
            },
          ],
        },
      ],
    },
    {
      title: "Personas y Relaciones",
      lessons: [
        {
          title: "Rasgos de Personalidad",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'kind'?",
              options: ["Amable", "Enojado", "Alto", "Bajo"],
              correctAnswer: "0",
              explanation: "Amable = kind.",
            },
          ],
        },
      ],
    },
    {
      title: "Compras y Servicios",
      lessons: [
        {
          title: "Tiendas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Dónde compras comida?",
              options: ["Supermercado", "Tienda de ropa", "Librería", "Farmacia"],
              correctAnswer: "0",
              explanation: "Supermercado = supermarket.",
            },
          ],
        },
      ],
    },
    {
      title: "Rutinas Diarias",
      lessons: [
        {
          title: "Adverbios de Frecuencia",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué significa 'siempre'?",
              options: ["Always", "Sometimes", "Never", "Rarely"],
              correctAnswer: "0",
              explanation: "Siempre = always.",
            },
          ],
        },
      ],
    },
    {
      title: "Cultura y Tradiciones",
      lessons: [
        {
          title: "Festivos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cuándo es Navidad?",
              options: ["25 de diciembre", "31 de octubre", "1 de enero", "5 de mayo"],
              correctAnswer: "0",
              explanation: "Navidad = 25 de diciembre.",
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
    const { course: courseData, modules: modulesData } = spanishA2CourseData;
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
    console.error("Error creating Spanish A2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
