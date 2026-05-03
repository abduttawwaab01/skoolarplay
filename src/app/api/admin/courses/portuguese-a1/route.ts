import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const portugueseA1CourseData = {
  course: {
    title: "Portuguese A1 - Beginner",
    description: "Português para iniciantes. Aprenda saudações, números, cores, família e comunicação básica do dia a dia.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Saudações e Apresentações",
      lessons: [
        {
          title: "Olá e Tchau",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'Olá' em português?",
              options: ["Olá", "Tchau", "Obrigado", "Desculpe"],
              correctAnswer: "0",
              explanation: "Olá = Hello.",
              language: "pt",
            },
            {
              type: "SPEECH",
              question: "Olá, meu nome é João.",
              correctAnswer: "Olá, meu nome é João.",
              language: "pt",
              hint: "Say: Hello, my name is João",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ é Maria.",
              correctAnswer: "Esta",
              explanation: "Esta = This (feminine).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Números e Contagem",
      lessons: [
        {
          title: "Números 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é o número 5?",
              options: ["Cinco", "Seis", "Sete", "Oito"],
              correctAnswer: "0",
              explanation: "5 = Cinco.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Cores e Aparência",
      lessons: [
        {
          title: "Cores básicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é a cor do sol?",
              options: ["Amarelo", "Azul", "Vermelho", "Verde"],
              correctAnswer: "0",
              explanation: "O sol é amarelo.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Família e Relacionamentos",
      lessons: [
        {
          title: "Membros da família",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Quem é o pai do pai?",
              options: ["Avô", "Neto", "Tio", "Irmão"],
              correctAnswer: "0",
              explanation: "O pai do pai é o avô.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Comida e Bebida",
      lessons: [
        {
          title: "Alimentos básicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como se diz 'pão' em português?",
              options: ["Pão", "Carne", "Peixe", "Arroz"],
              correctAnswer: "0",
              explanation: "Pão = bread.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Rotina Diária",
      lessons: [
        {
          title: "De manhã",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que você faz ao acordar?",
              options: ["Acordo", "Durmo", "Janto", "Assisto TV"],
              correctAnswer: "0",
              explanation: "Acordar = waking up.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Casa e Móveis",
      lessons: [
        {
          title: "Cômodos da casa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde você dorme?",
              options: ["Quarto", "Cozinha", "Banheiro", "Sala"],
              correctAnswer: "0",
              explanation: "Quarto = bedroom.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Presente Simples",
      lessons: [
        {
          title: "Ser e Estar",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Eu ___ estudante.",
              options: ["sou", "estou", "era", "fui"],
              correctAnswer: "0",
              explanation: "Ser = to be (permanent).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Escola e Educação",
      lessons: [
        {
          title: "Materiais escolares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Com o que você escreve?",
              options: ["Caneta", "Livro", "Borracha", "Tesoura"],
              correctAnswer: "0",
              explanation: "Caneta = pen.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Formas e Tamanhos",
      lessons: [
        {
          title: "Formas geométricas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é a forma de uma bola?",
              options: ["Círculo", "Quadrado", "Triângulo", "Retângulo"],
              correctAnswer: "0",
              explanation: "Círculo = circle.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Tempo e Estações",
      lessons: [
        {
          title: "Estações do ano",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O verão é ___",
              options: ["quente", "frio", "morno", "chuvoso"],
              correctAnswer: "0",
              explanation: "Verão = summer (hot).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Roupas e Moda",
      lessons: [
        {
          title: "Peças de roupa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que você veste nos pés?",
              options: ["Sapato", "Camisa", "Calça", "Chapéu"],
              correctAnswer: "0",
              explanation: "Sapato = shoes.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Partes do Corpo e Saúde",
      lessons: [
        {
          title: "Partes do rosto",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Com o que você cheira?",
              options: ["Nariz", "Olho", "Orelha", "Boca"],
              correctAnswer: "0",
              explanation: "Nariz = nose.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Animais e Natureza",
      lessons: [
        {
          title: "Animais de fazenda",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Quem dá leite?",
              options: ["Vaca", "Galinha", "Ovelha", "Cavalo"],
              correctAnswer: "0",
              explanation: "Vaca dá leite.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Transporte e Viagem",
      lessons: [
        {
          title: "Meios de transporte",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que voa no céu?",
              options: ["Avião", "Carro", "Trem", "Bicicleta"],
              correctAnswer: "0",
              explanation: "Avião = airplane.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Esportes e Hobbies",
      lessons: [
        {
          title: "Esportes populares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual esporte usa os pés?",
              options: ["Futebol", "Basquete", "Tênis", "Natação"],
              correctAnswer: "0",
              explanation: "Futebol = football/soccer.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Compras e Dinheiro",
      lessons: [
        {
          title: "Tipos de lojas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde você compra comida?",
              options: ["Supermercado", "Loja de roupas", "Livraria", "Farmácia"],
              correctAnswer: "0",
              explanation: "Supermercado = supermarket.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Lugares na Cidade",
      lessons: [
        {
          title: "Lugares importantes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde se tratam doentes?",
              options: ["Hospital", "Escola", "Mesquita", "Restaurante"],
              correctAnswer: "0",
              explanation: "Hospital = hospital.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Tempo e Datas",
      lessons: [
        {
          title: "Lendo o relógio",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Quantas horas tem um dia?",
              options: ["24", "12", "36", "48"],
              correctAnswer: "0",
              explanation: "Um dia = 24 horas.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicação Básica",
      lessons: [
        {
          title: "Palavras educadas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que você diz ao receber algo?",
              options: ["Obrigado", "Com licença", "Olá", "Tchau"],
              correctAnswer: "0",
              explanation: "Obrigado = thank you.",
              language: "pt",
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
    const { course: courseData, modules: modulesData } = portugueseA1CourseData;
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
            xpReward: 10 + Math.floor(Math.random() * 10),
            gemReward: 1 + Math.floor(Math.random() * 3),
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
          language: q.language || "pt",
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
    console.error("Error creating Portuguese A1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
