import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const portugueseB2CourseData = {
  course: {
    title: "Portuguese B2 - Upper Intermediate",
    description: "Português para nível intermediário superior. Compreensão de textos complexos, fluência na comunicação e gramática avançada.",
    difficulty: "UPPER_INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Condicionais Mistas",
      lessons: [
        {
          title: "Se + mais-que-perfeito, condicional",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é o terceiro condicional?",
              options: ["Se tivesse tempo, teria vindo", "Se tenho tempo, virei", "Se tinha tempo, vinha", "Se tive tempo, vim"],
              correctAnswer: "0",
              explanation: "Se + mais-que-perfeito, condicional = terceiro condicional (hipotético).",
              language: "pt",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Se eu ___, teria agido diferente.",
              correctAnswer: "soubesse",
              explanation: "Mais-que-perfeito de saber: tinha sabido → soubesse.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Voz Passiva Avançada",
      lessons: [
        {
          title: "Passiva com modais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é passiva com verbo modal?",
              options: ["O livro deve ser lido", "Eu devo ler o livro", "O livro é lido", "Eu leio o livro"],
              correctAnswer: "0",
              explanation: "Verbo modal + ser + particípio = passiva com modal.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Dedução e Especulação",
      lessons: [
        {
          title: "Deve ser/não pode ser",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que expressa certeza?",
              options: ["Deve estar em casa", "Pode estar em casa", "Pode ser que esteja em casa", "Estará em casa"],
              correctAnswer: "0",
              explanation: "Deve estar = dedução (certeza).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Orações Relativas Avançadas",
      lessons: [
        {
          title: "Relativas com preposições",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual está correto?",
              options: ["O livro sobre o qual falo", "O livro que falo sobre o qual", "O livro que falo sobre", "O livro, falo sobre"],
              correctAnswer: "0",
              explanation: "Sobre o qual = preposição + pronome relativo.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Expressões Idiomáticas",
      lessons: [
        {
          title: "Expressões comuns",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'Quebrar o gelo'?",
              options: ["Iniciar conversa", "Tristeza", "Raiva", "Cansaço"],
              correctAnswer: "0",
              explanation: "Quebrar o gelo = iniciar conversa/aliviar tensão.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicação Empresarial",
      lessons: [
        {
          title: "E-mails empresariais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Como iniciar um e-mail formal?",
              options: ["Prezado Senhor Silva", "Olá Silva", "Oi pessoal", "Bom dia"],
              correctAnswer: "0",
              explanation: "Prezado/a = formal.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "História e Cultura",
      lessons: [
        {
          title: "Eventos históricos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Quando caiu o Muro de Berlim?",
              options: ["1989", "1945", "1961", "2000"],
              correctAnswer: "0",
              explanation: "O Muro de Berlim caiu em 1989.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Ciência e Tecnologia",
      lessons: [
        {
          title: "Avanços científicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é inteligência artificial?",
              options: ["Máquinas que pensam", "Computadores mais rápidos", "Telas maiores", "Mais memória"],
              correctAnswer: "0",
              explanation: "IA simula inteligência humana.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Política e Questões Sociais",
      lessons: [
        {
          title: "Discurso político",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é democracia?",
              options: ["Povo elege líderes", "Um governa", "Militar governa", "Líderes religiosos governam"],
              correctAnswer: "0",
              explanation: "Democracia = governo do povo.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Conceitos Abstratos",
      lessons: [
        {
          title: "Ideias filosóficas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é liberdade?",
              options: ["Autodeterminação", "Café grátis", "Carro rápido", "Casa grande"],
              correctAnswer: "0",
              explanation: "Liberdade = autodeterminação.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Phrasal Verbs Avançados",
      lessons: [
        {
          title: "Phrasal verbs complexos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'realizar'?",
              options: ["Conseguir/Realizar", "Começar", "Terminar", "Parar"],
              correctAnswer: "0",
              explanation: "Realizar = to accomplish/carry out.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Meio Ambiente e Sustentabilidade",
      lessons: [
        {
          title: "Mudanças climáticas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que causa aquecimento global?",
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
      title: "Educação e Pedagogia",
      lessons: [
        {
          title: "Teorias de aprendizagem",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é construtivismo?",
              options: ["Aprender por experiência", "Decoreba", "Ensino tradicional", "Testes"],
              correctAnswer: "0",
              explanation: "Construtivismo = aprender por experiência própria.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Saúde e Medicina",
      lessons: [
        {
          title: "Terminologia médica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é 'Hipertensão'?",
              options: ["Pressão alta", "Pressão baixa", "Dor de cabeça", "Febre"],
              correctAnswer: "0",
              explanation: "Hipertensão = pressão arterial alta.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Mídia e Jornalismo",
      lessons: [
        {
          title: "Escrita jornalística",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é manchete?",
              options: ["Título da notícia", "Corpo do texto", "Legenda", "Coluna"],
              correctAnswer: "0",
              explanation: "Manchete = headline.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Literatura e Artes",
      lessons: [
        {
          title: "Análise literária",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é metáfora?",
              options: ["Comparação sem 'como'", "Comparação com 'como'", "Exagero", "Ironia"],
              correctAnswer: "0",
              explanation: "Metáfora = comparação direta sem 'como'.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Economia e Finanças",
      lessons: [
        {
          title: "Princípios econômicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é inflação?",
              options: ["Aumento de preços", "Redução de preços", "Aumento de salários", "Desemprego"],
              correctAnswer: "0",
              explanation: "Inflação = aumento geral de preços.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Psicologia e Comportamento",
      lessons: [
        {
          title: "Teorias psicológicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é condicionamento?",
              options: ["Aprender por associação", "Traços de nascença", "Trauma", "Sonhos"],
              correctAnswer: "0",
              explanation: "Condicionamento = aprender por estímulo-resposta.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Globalização e Cultura",
      lessons: [
        {
          title: "Intercâmbio cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é globalização?",
              options: ["Interconexão mundial", "Tradições locais", "Isolamento", "Guerra"],
              correctAnswer: "0",
              explanation: "Globalização = interconexão mundial.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Inovação e Futuro",
      lessons: [
        {
          title: "Tecnologias emergentes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é Blockchain?",
              options: ["Banco de dados descentralizado", "Banco central", "Rede social", "Jogo"],
              correctAnswer: "0",
              explanation: "Blockchain = banco de dados descentralizado imutável.",
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
    const { course: courseData, modules: modulesData } = portugueseB2CourseData;
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
          language: q.language || "pt",
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
    console.error("Error creating Portuguese B2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
