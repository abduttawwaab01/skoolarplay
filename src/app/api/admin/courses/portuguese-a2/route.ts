import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const portugueseA2CourseData = {
  course: {
    title: "Portuguese A2 - Elementary",
    description: "Português para nível elementar. Aprenda passado, futuro, comparações e comunicação cotidiana.",
    difficulty: "ELEMENTARY",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Passado Simples",
      lessons: [
        {
          title: "Verbos regulares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'I walked' em português?",
              options: ["Eu caminhei", "Eu caminho", "Eu caminhava", "Eu tenho caminhado"],
              correctAnswer: "0",
              explanation: "Caminhar → caminhei (passado).",
              language: "pt",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Ela ___ (jogou) futebol ontem.",
              correctAnswer: "jogou",
              explanation: "Jogar → jogou (passado).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Expressões de Futuro",
      lessons: [
        {
          title: "Ir + infinitivo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'I am going to go'?",
              options: ["Eu vou ir", "Eu vou", "Eu fui", "Eu tenho ido"],
              correctAnswer: "0",
              explanation: "Ir + infinitivo = futuro.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Dando Direções",
      lessons: [
        {
          title: "Preposições de movimento",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual está correto?",
              options: ["Vá à loja", "Vá na loja", "Vá com loja", "Vá de loja"],
              correctAnswer: "0",
              explanation: "À = a + a (direção).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Compras e Roupas",
      lessons: [
        {
          title: "Peças de roupa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'shirt'?",
              options: ["Camisa", "Calça", "Sapato", "Chapéu"],
              correctAnswer: "0",
              explanation: "Camisa = shirt.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Saúde e Corpo",
      lessons: [
        {
          title: "Doenças comuns",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que causa febre?",
              options: ["Gripe", "Fratura", "Corte", "Contusão"],
              correctAnswer: "0",
              explanation: "Gripe causa febre.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Viagem e Transporte",
      lessons: [
        {
          title: "Meios de transporte",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Com o que se voa?",
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
      title: "Comparativos",
      lessons: [
        {
          title: "Comparação com -er",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual está correto?",
              options: ["Maior que", "Mais grande que", "Grande que", "Maior como"],
              correctAnswer: "0",
              explanation: "Maior = comparativo (curto: -er).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Presente Contínuo",
      lessons: [
        {
          title: "Estar + -ndo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'I am eating'?",
              options: ["Eu estou comendo", "Eu como", "Eu comi", "Eu tenho comido"],
              correctAnswer: "0",
              explanation: "Estar + -ndo = presente contínuo.",
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
          title: "Cômodos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde você dorme?",
              options: ["Quarto", "Cozinha", "Sala", "Banheiro"],
              correctAnswer: "0",
              explanation: "Quarto = bedroom.",
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
          title: "Previsão do tempo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'ensolarado'?",
              options: ["Ensolarado", "Chuvoso", "Neve", "Ventoso"],
              correctAnswer: "0",
              explanation: "Ensolarado = sunny.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Trabalho e Profissões",
      lessons: [
        {
          title: "Profissões",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Quem ensina alunos?",
              options: ["Professor", "Médico", "Motorista", "Cozinheiro"],
              correctAnswer: "0",
              explanation: "Professor = teacher.",
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
          title: "Alimentos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'bread'?",
              options: ["Pão", "Arroz", "Carne", "Peixe"],
              correctAnswer: "0",
              explanation: "Pão = bread.",
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
          title: "Matérias escolares",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como dizer 'math'?",
              options: ["Matemática", "História", "Arte", "Música"],
              correctAnswer: "0",
              explanation: "Matemática = math.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Tempo Livre e Hobbies",
      lessons: [
        {
          title: "Esportes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que usa bola e cesta?",
              options: ["Basquete", "Futebol", "Tênis", "Natação"],
              correctAnswer: "0",
              explanation: "Basquete = basketball.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Mídia e Entretenimento",
      lessons: [
        {
          title: "Meios de comunicação",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde lê notícias?",
              options: ["Jornal", "Livro de receitas", "Romance", "Dicionário"],
              correctAnswer: "0",
              explanation: "Jornal = newspaper.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Meio Ambiente",
      lessons: [
        {
          title: "Problemas ambientais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que causa efeito estufa?",
              options: ["Gases estufa", "Árvores", "Chuva", "Vento"],
              correctAnswer: "0",
              explanation: "Gases estufa retêm calor.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Pessoas e Relacionamentos",
      lessons: [
        {
          title: "Personalidade",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'amigável'?",
              options: ["Amigável", "Bravo", "Grande", "Pequeno"],
              correctAnswer: "0",
              explanation: "Amigável = kind.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Compras e Serviços",
      lessons: [
        {
          title: "Tipos de lojas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde compra comida?",
              options: ["Supermercado", "Loja de roupas", "Biblioteca", "Farmácia"],
              correctAnswer: "0",
              explanation: "Supermercado = supermarket.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Rotina e Hábitos",
      lessons: [
        {
          title: "Advérbios de frequência",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'sempre'?",
              options: ["Sempre", "Às vezes", "Nunca", "Raramente"],
              correctAnswer: "0",
              explanation: "Sempre = always.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Cultura e Tradições",
      lessons: [
        {
          title: "Feriados",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Quando é o Natal?",
              options: ["25 de dezembro", "31 de outubro", "1 de janeiro", "5 de maio"],
              correctAnswer: "0",
              explanation: "Natal = 25 de dezembro.",
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
    const { course: courseData, modules: modulesData } = portugueseA2CourseData;
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
            xpReward: 15 + Math.floor(Math.random() * 10),
            gemReward: 2 + Math.floor(Math.random() * 3),
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
    console.error("Error creating Portuguese A2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
