import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const spanishA1CourseData = {
  course: {
    title: "Spanish A1 - Principiante",
    description: "Aprende español básico para situaciones cotidianas. Domina saludos, números, colores, familia y gramática esencial.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Saludos e Introducciones",
      lessons: [
        {
          title: "Saludos Matutinos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo saludas por la mañana?",
              options: ["Buenos días", "Buenas tardes", "Buenas noches", "Adiós"],
              correctAnswer: "0",
              explanation: "Buenos días se usa en la mañana.",
            },
            {
              type: "MCQ",
              question: "¿Qué significa 'Buenas tardes'?",
              options: ["Good afternoon", "Good morning", "Good night", "Goodbye"],
              correctAnswer: "0",
              explanation: "Buenas tardes = good afternoon.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: ___ días. (Saludo matutino)",
              correctAnswer: "Buenos",
              explanation: "Buenos días = good morning.",
            },
            {
              type: "SPEECH",
              question: "Buenos días. ¿Cómo estás?",
              correctAnswer: "Buenos días. ¿Cómo estás?",
              language: "es",
              hint: "Say: Good morning. How are you?",
            },
          ],
        },
        {
          title: "Presentarse",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo te presentas?",
              options: ["Me llamo Juan", "Te llamo Juan", "Se llamo Juan", "Nos llamamos Juan"],
              correctAnswer: "0",
              explanation: "Me llamo = My name is (reflexive).",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: ___ (Me) llamo María.",
              correctAnswer: "Me",
              explanation: "Me llamo = I call myself (reflexive).",
            },
          ],
        },
        {
          title: "Preguntar Nombres",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo preguntas el nombre?",
              options: ["¿Cómo te llamás?", "¿Cómo me llamo?", "¿Cómo se llama?", "¿Cómo nos llamamos?"],
              correctAnswer: "0",
              explanation: "¿Cómo te llamás? = What is your name?",
            },
          ],
        },
        {
          title: "Expresiones de Cortesía",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué dices para dar las gracias?",
              options: ["Gracias", "Por favor", "Lo siento", "Adiós"],
              correctAnswer: "0",
              explanation: "Gracias = thank you.",
            },
            {
              type: "TRUE_FALSE",
              question: "¿'Por favor' significa 'please'?",
              correctAnswer: "true",
              explanation: "Por favor = please.",
            },
          ],
        },
      ],
    },
    {
      title: "Números y Conteo",
      lessons: [
        {
          title: "Números 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice '5'?",
              options: ["Cinco", "Cuatro", "Seis", "Siete"],
              correctAnswer: "0",
              explanation: "Cinco = 5.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: Uno, dos, tres, ___, cinco.",
              correctAnswer: "cuatro",
              explanation: "Uno, dos, tres, cuatro, cinco = 1, 2, 3, 4, 5.",
            },
          ],
        },
        {
          title: "Números 11-20",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice '12'?",
              options: ["Doce", "Once", "Trece", "Catorce"],
              correctAnswer: "0",
              explanation: "Doce = 12.",
            },
          ],
        },
        {
          title: "Números 20-100",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice '30'?",
              options: ["Treinta", "Veinte", "Cuarenta", "Cincuenta"],
              correctAnswer: "0",
              explanation: "Treinta = 30.",
            },
          ],
        },
      ],
    },
    {
      title: "Colores y Apariencia",
      lessons: [
        {
          title: "Colores Básicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'blue'?",
              options: ["Azul", "Rojo", "Verde", "Amarillo"],
              correctAnswer: "0",
              explanation: "Azul = blue.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: El cielo es ___ (azul).",
              correctAnswer: "azul",
              explanation: "El cielo = the sky (blue).",
            },
          ],
        },
      ],
    },
    {
      title: "Familia y Relaciones",
      lessons: [
        {
          title: "Familia Inmediata",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'father'?",
              options: ["Padre", "Madre", "Hermano", "Tío"],
              correctAnswer: "0",
              explanation: "Padre = father.",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: Mi ___ (madre) es doctora.",
              correctAnswer: "madre",
              explanation: "Madre = mother.",
            },
          ],
        },
      ],
    },
    {
      title: "Comida y Restaurantes",
      lessons: [
        {
          title: "Comidas Básicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'bread'?",
              options: ["Pan", "Arroz", "Carne", "Pescado"],
              correctAnswer: "0",
              explanation: "Pan = bread.",
            },
          ],
        },
      ],
    },
    {
      title: "Rutina Diaria",
      lessons: [
        {
          title: "Por la Mañana",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué haces al despertar?",
              options: ["Me despierto", "Me acuesto", "Ceno", "Almuerzo"],
              correctAnswer: "0",
              explanation: "Me despierto = I wake up.",
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
              options: ["Dormitorio", "Cocina", "Baño", "Sala"],
              correctAnswer: "0",
              explanation: "Dormitorio = bedroom.",
            },
          ],
        },
      ],
    },
    {
      title: "Presente del Verbo Ser",
      lessons: [
        {
          title: "Conjugación Básica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'I am'?",
              options: ["Soy", "Eres", "Es", "Somos"],
              correctAnswer: "0",
              explanation: "Soy = I am (ser).",
            },
            {
              type: "FILL_BLANK",
              question: "Completa: Yo ___ (soy) estudiante.",
              correctAnswer: "soy",
              explanation: "Soy = I am (permanent).",
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
      title: "Colores, Formas y Tamaños",
      lessons: [
        {
          title: "Formas Básicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'circle'?",
              options: ["Círculo", "Cuadrado", "Triángulo", "Rectángulo"],
              correctAnswer: "0",
              explanation: "Círculo = circle.",
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
              question: "¿Cómo se dice 'sunny'?",
              options: ["Soleado", "Lluvioso", "Nevando", "Ventoso"],
              correctAnswer: "0",
              explanation: "Soleado = sunny.",
            },
          ],
        },
      ],
    },
    {
      title: "Ropa y Moda",
      lessons: [
        {
          title: "Prendas de Ropa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'shirt'?",
              options: ["Camisa", "Pantalón", "Zapato", "Sombrero"],
              correctAnswer: "0",
              explanation: "Camisa = shirt.",
            },
          ],
        },
      ],
    },
    {
      title: "Partes del Cuerpo",
      lessons: [
        {
          title: "Cabeza y Cara",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'eye'?",
              options: ["Ojo", "Oreja", "Nariz", "Boca"],
              correctAnswer: "0",
              explanation: "Ojo = eye.",
            },
          ],
        },
      ],
    },
    {
      title: "Animales y Naturaleza",
      lessons: [
        {
          title: "Animales de Granja",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'cow'?",
              options: ["Vaca", "Gato", "Perro", "Pollo"],
              correctAnswer: "0",
              explanation: "Vaca = cow.",
            },
          ],
        },
      ],
    },
    {
      title: "Transporte y Viajes",
      lessons: [
        {
          title: "Medios de Transporte",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'car'?",
              options: ["Coche", "Autobús", "Tren", "Avión"],
              correctAnswer: "0",
              explanation: "Coche = car.",
            },
          ],
        },
      ],
    },
    {
      title: "Deportes y Pasatiempos",
      lessons: [
        {
          title: "Deportes Populares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice 'football/soccer'?",
              options: ["Fútbol", "Baloncesto", "Tenis", "Natación"],
              correctAnswer: "0",
              explanation: "Fútbol = soccer/football.",
            },
          ],
        },
      ],
    },
    {
      title: "Compras y Dinero",
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
      title: "Lugares en la Ciudad",
      lessons: [
        {
          title: "Lugares Básicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Dónde estudias?",
              options: ["Escuela", "Hospital", "Restaurante", "Parque"],
              correctAnswer: "0",
              explanation: "Escuela = school.",
            },
          ],
        },
      ],
    },
    {
      title: "Tiempo y Fechas",
      lessons: [
        {
          title: "Decir la Hora",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Cómo se dice '3:00'?",
              options: ["Son las tres", "Es la una", "Son las dos", "Es la cuatro"],
              correctAnswer: "0",
              explanation: "Son las tres = It is 3 o'clock.",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicación Básica",
      lessons: [
        {
          title: "Por Favor y Gracias",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "¿Qué dices para pedir ayuda?",
              options: ["Por favor, ayúdame", "Dame eso", "Quiero eso", "Dáme"],
              correctAnswer: "0",
              explanation: "Por favor, ayúdame = Please help me.",
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
    
    const { course: courseData, modules: modulesData } = spanishA1CourseData;
    
    let course = await db.course.findFirst({
      where: { title: courseData.title }
    });
    
    if (course) {
      await db.module.deleteMany({
        where: { courseId: course.id }
      });
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
          category: {
            connect: { name: "Languages" }
          }
        }
      });
    }
    
    for (let modIdx = 0; modIdx < modulesData.length; modIdx++) {
      const moduleData = modulesData[modIdx];
      
      const newModule = await db.module.create({
        data: {
          title: moduleData.title,
          courseId: course.id,
          order: modIdx,
          isActive: true,
        }
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
        
        await db.question.createMany({
          data: questionsToCreate
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Course "${courseData.title}" created/updated with ${modulesData.length} modules`,
      courseId: course.id
    });
    
  } catch (error: any) {
    console.error("Error creating Spanish A1 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
