import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const portugueseC2CourseData = {
  course: {
    title: "Portuguese C2 - Mastery",
    description: "Português para nível de mestria. Quase proficiência nativa, compreensão de praticamente todos os textos, expressão precisa e diferenciada.",
    difficulty: "MASTERY",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Precisão Lexical",
      lessons: [
        {
          title: "Vocabulário raro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'obscuro'?",
              options: ["Desconhecido/misterioso", "Claro", "Barulhento", "Rápido"],
              correctAnswer: "0",
              explanation: "Obscuro = desconhecido ou misterioso.",
              language: "pt",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A pesquisa ___ trouxe novos conhecimentos.",
              correctAnswer: "obscura",
              explanation: "Pesquisa obscura = pesquisa pouco conhecida.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Termos Arcaicos e Literários",
      lessons: [
        {
          title: "Linguagem shakespeariana",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é 'thou' em português arcaico?",
              options: ["Tu (antigamente)", "Eu", "Ele", "Vocês"],
              correctAnswer: "0",
              explanation: "Thou = tu (arcaico).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Especialização Profissional",
      lessons: [
        {
          title: "Discurso especializado",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é linguagem técnica?",
              options: ["Língua especializada para profissão", "Língua cotidiana", "Gíria", "Dialeto"],
              correctAnswer: "0",
              explanation: "Linguagem técnica = terminologia especializada para campo profissional.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Dialetos Regionais e Gírias",
      lessons: [
        {
          title: "Variações regionais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é 'Moin'?",
              options: ["Saudação no norte da Alemanha", "Obrigado", "Tchau", "Por favor"],
              correctAnswer: "0",
              explanation: "Moin = saudação típica no norte da Alemanha.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Mestria em Metáforas",
      lessons: [
        {
          title: "Metáforas complexas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma metáfora estendida?",
              options: ["Metáfora por vários parágrafos", "Comparação de uma palavra", "Exagero", "Ironia"],
              correctAnswer: "0",
              explanation: "Metáfora estendida = comparação metafórica ao longo de seção textual.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Debate de Alto Nível",
      lessons: [
        {
          title: "Retórica avançada",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é Ethos?",
              options: ["Credibilidade do orador", "Apelo emocional", "Prova lógica", "Humor"],
              correctAnswer: "0",
              explanation: "Ethos = persuasão através do caráter.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Nuances Culturais Sutis",
      lessons: [
        {
          title: "Subtexto cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é contexto cultural?",
              options: ["Informações de fundo", "Gramática", "Escolha de palavras", "Pronúncia"],
              correctAnswer: "0",
              explanation: "Contexto cultural = significados não ditos.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Fluência em Expressões Idiomáticas",
      lessons: [
        {
          title: "Expressões idiomáticas avançadas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que significa 'O bicho vai pegar'?",
              options: ["Vai ficar feio/apertado", "Bicho vai pegar", "Está calmo", "Está frio"],
              correctAnswer: "0",
              explanation: "O bicho vai pegar = situação vai ficar difícil/perigosa.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Perfeição Gramatical",
      lessons: [
        {
          title: "Sintaxe avançada",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma oração reduzida?",
              options: ["Sendo feliz", "Eu sou feliz", "Ajude-me", "Feliz"],
              correctAnswer: "0",
              explanation: "Oração reduzida = verbo principal reduzido a gerúndio/particípio.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Expressão Criativa",
      lessons: [
        {
          title: "Criatividade literária",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é um recurso estilístico?",
              options: ["Elemento linguístico consciente", "Erro", "Acidente", "Regra gramatical"],
              correctAnswer: "0",
              explanation: "Recurso estilístico = elemento linguístico usado conscientemente.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Discurso Acadêmico",
      lessons: [
        {
          title: "Escrita científica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é um Resumo?",
              options: ["Resumo", "Introdução", "Corpo principal", "Conclusão"],
              correctAnswer: "0",
              explanation: "Resumo = resumo curto de trabalho acadêmico.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Comunicação Profissional",
      lessons: [
        {
          title: "Comunicação executiva",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é Elevator Pitch?",
              options: ["Apresentação curta", "Apresentação longa", "E-mail", "Relatório"],
              correctAnswer: "0",
              explanation: "Elevator Pitch = apresentação curta e persuasiva.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Análise Crítica",
      lessons: [
        {
          title: "Estruturas analíticas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é análise SWOT?",
              options: ["Forças/Fraquezas/Oportunidades/Ameaças", "Análise financeira", "Estratégia de marketing", "Produção"],
              correctAnswer: "0",
              explanation: "SWOT = Strengths, Weaknesses, Opportunities, Threats.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Competência Intercultural",
      lessons: [
        {
          title: "Inteligência cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é inteligência cultural?",
              options: ["Habilidade de navegar diferenças culturais", "QI", "Conhecimento de línguas", "Experiência de viagem"],
              correctAnswer: "0",
              explanation: "Inteligência cultural = adaptação a diferentes culturas.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Tradução Especializada",
      lessons: [
        {
          title: "Teoria da tradução",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é equivalência em tradução?",
              options: ["Mesmo efeito no texto alvo", "Tradução palavra-por-palavra", "Tradução livre", "Omissão"],
              correctAnswer: "0",
              explanation: "Equivalência = mesmo efeito no leitor.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Teoria Linguística",
      lessons: [
        {
          title: "Gramática gerativa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é gramática universal?",
              options: ["Estrutura linguística inata", "Gramática aprendida", "Gramática escolar", "Dialeto"],
              correctAnswer: "0",
              explanation: "Gramática universal = capacidade linguística inata (Chomsky).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Análise do Discurso",
      lessons: [
        {
          title: "Análise crítica do discurso",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que estuda a análise do discurso?",
              options: ["Língua em contexto social", "Gramática", "Escolha de palavras", "Pronúncia"],
              correctAnswer: "0",
              explanation: "Análise do discurso = língua como prática social.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Retórica Excelente",
      lessons: [
        {
          title: "Persuasão master",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é Logos?",
              options: ["Apelo lógico", "Apelo emocional", "Credibilidade", "Humor"],
              correctAnswer: "0",
              explanation: "Logos = persuasão através da lógica/argumentos.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Síntese Cultural",
      lessons: [
        {
          title: "Hibridez cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é hibridez cultural?",
              options: ["Mistura de culturas", "Cultura pura", "Isolamento", "Guerra"],
              correctAnswer: "0",
              explanation: "Hibridez cultural = fusão de diferentes culturas.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Demonstração de Mestria",
      lessons: [
        {
          title: "Fluência quase nativa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que caracteriza o nível C2?",
              options: ["Compreensão de praticamente todos textos", "Comunicação básica", "Frases simples", "Muitos erros"],
              correctAnswer: "0",
              explanation: "C2 = proficiência quase nativa.",
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
    const { course: courseData, modules: modulesData } = portugueseC2CourseData;
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
            gemReward: 5 + Math.floor(Math.random() * 8),
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
          points: q.points || 25,
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
    console.error("Error creating Portuguese C2 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
