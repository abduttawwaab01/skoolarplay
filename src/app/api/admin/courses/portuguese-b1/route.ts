import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const portugueseB1CourseData = {
  course: {
    title: "Portuguese B1 - Intermediate",
    description: "Português para nível intermediário. Domine pretérito perfeito, condicional, voz passiva e comunicação profissional.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Pretérito Perfeito Composto",
      lessons: [
        {
          title: "Ter/haver + particípio",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual está correto?",
              options: ["Tenho visto", "Tenho visto", "Sou visto", "Tenho ver"],
              correctAnswer: "0",
              explanation: "Ter + particípio (visto).",
              language: "pt",
            },
            {
              type: "SPEECH",
              question: "Tenho visitado Madri três vezes.",
              correctAnswer: "Tenho visitado Madri três vezes.",
              language: "pt",
              hint: "Say: I have visited Madrid three times",
            },
          ],
        },
      ],
    },
    {
      title: "Condicional 1",
      lessons: [
        {
          title: "Se + presente, futuro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é o primeiro condicional?",
              options: ["Se chover, ficarei", "Se chovesse, ficaria", "Se choveu, fiquei", "Se tiver chovido, tenho ficado"],
              correctAnswer: "0",
              explanation: "Se + presente, futuro = primeiro condicional.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Orações Relativas",
      lessons: [
        {
          title: "Que/quem",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual está correto?",
              options: ["O homem que está ali", "O homem que está ali o que", "O homem quem está ali", "O homem de que está ali"],
              correctAnswer: "0",
              explanation: "Que/quem para pessoas/coisas.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Voz Passiva",
      lessons: [
        {
          title: "Ser + particípio",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é passiva?",
              options: ["O livro é lido", "Eu leio o livro", "O livro leu", "Tenho lido o livro"],
              correctAnswer: "0",
              explanation: "Ser + particípio = passiva.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Discurso Indireto",
      lessons: [
        {
          title: "Mudança de tempo",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ele disse: 'Estou cansado' → Ele disse que ___ .",
              options: ["estava cansado", "está cansado", "foi cansado", "tem sido cansado"],
              correctAnswer: "0",
              explanation: "Presente → pretérito imperfeito.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Verbos Modais de Obrigação",
      lessons: [
        {
          title: "Dever e ter que",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que expressa obrigação?",
              options: ["Devo ir", "Posso ir", "Deixo ir", "Vou ir"],
              correctAnswer: "0",
              explanation: "Dever = obrigação forte.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Phrasal Verbs",
      lessons: [
        {
          title: "Verbos preposicionais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Acordar' significa:",
              options: ["Despertar/Levantar", "Sentar", "Deitar", "Dormir"],
              correctAnswer: "0",
              explanation: "Acordar = to wake up/get up.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Trabalho e Vida Profissional",
      lessons: [
        {
          title: "Entrevistas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que dizer sobre pontos fortes?",
              options: ["Sou diligente", "Sou diligência", "Tenho diligência", "Sou ser diligente"],
              correctAnswer: "0",
              explanation: "Sou + adjetivo (diligente).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Meio Ambiente e Sociedade",
      lessons: [
        {
          title: "Problemas ambientais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que causa aquecimento global?",
              options: ["Gases estufa", "Árvores", "Oceanos", "Chuva"],
              correctAnswer: "0",
              explanation: "Gases estufa retêm calor.",
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
          title: "Notícias",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Onde lê notícias atuais?",
              options: ["Site de notícias", "Livro de receitas", "Romance", "Dicionário"],
              correctAnswer: "0",
              explanation: "Sites de notícias têm eventos atuais.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Educação e Aprendizagem",
      lessons: [
        {
          title: "Ensino superior",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma universidade?",
              options: ["Local de ensino superior", "Escola primária", "Jardim de infância", "Escola profissional"],
              correctAnswer: "0",
              explanation: "Universidades oferecem graduação.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Saúde e Estilo de Vida",
      lessons: [
        {
          title: "Alimentação saudável",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é comida saudável?",
              options: ["Vegetais", "Doces", "Batatas fritas", "Refrigerante"],
              correctAnswer: "0",
              explanation: "Vegetais são nutritivos.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Viagens e Turismo",
      lessons: [
        {
          title: "Destinos turísticos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que turistas visitam em Paris?",
              options: ["Torre Eiffel", "Big Ben", "Estátua da Liberdade", "Grande Muralha"],
              correctAnswer: "0",
              explanation: "Torre Eiffel fica em Paris.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Tecnologia e Inovação",
      lessons: [
        {
          title: "Transformação digital",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é inteligência artificial?",
              options: ["Máquinas que pensam", "Computadores mais rápidos", "Telas maiores", "Mais memória"],
              correctAnswer: "0",
              explanation: "IA = máquinas simulam inteligência humana.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Política e Governo",
      lessons: [
        {
          title: "Sistemas políticos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é democracia?",
              options: ["Povo elege", "Um governa", "Militar governa", "Líderes religiosos governam"],
              correctAnswer: "0",
              explanation: "Democracia = povo elege líderes.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Ciência e Natureza",
      lessons: [
        {
          title: "Método científico",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é o primeiro passo?",
              options: ["Fazer pergunta", "Fazer experimento", "Tirar conclusão", "Analisar dados"],
              correctAnswer: "0",
              explanation: "Método científico começa com pergunta.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Artes e Cultura",
      lessons: [
        {
          title: "Artes visuais",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma pintura?",
              options: ["Arte em tela", "Escultura de barro", "Edifício de pedra", "Peça musical"],
              correctAnswer: "0",
              explanation: "Pintura = arte em tela/papel.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Planos Futuros",
      lessons: [
        {
          title: "Objetivos de carreira",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é objetivo de carreira?",
              options: ["Tornar-se médico", "Almoçar", "Dormir bem", "Assistir TV"],
              correctAnswer: "0",
              explanation: "Objetivo de carreira = aspiração profissional.",
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
    const { course: courseData, modules: modulesData } = portugueseB1CourseData;
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
    console.error("Error creating Portuguese B1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
