import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const portugueseC1CourseData = {
  course: {
    title: "Portuguese C1 - Advanced",
    description: "Português para nível avançado. Compreensão de textos exigentes, expressão fluente e precisa, domínio de gramática complexa.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Nuances de Significado",
      lessons: [
        {
          title: "Diferenças sutis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Qual é a diferena entre 'terminar' e 'acabar'?",
              options: ["Sem diferena", "Uma palavra é mais formal", "Uma é plural", "Uma é passado"],
              correctAnswer: "0",
              explanation: "Terminar = acabar (transitivo); acabar = terminar (intransitivo) - diferenças sutis.",
              language: "pt",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A palavra '___' tem conotação positiva.",
              correctAnswer: "bem-sucedido",
              explanation: "Bem-sucedido = successful (conotação positiva).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Recursos Retóricos",
      lessons: [
        {
          title: "Metáfora e símile",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é comparação com 'como'?",
              options: ["Símile", "Metáfora", "Personificação", "Hipérbole"],
              correctAnswer: "0",
              explanation: "Símile = comparação com 'como' ou 'como se'.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Estilo de Escrita Acadêmica",
      lessons: [
        {
          title: "Registro acadêmico",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é formal?",
              options: ["É investigado", "Eu investiguei", "A gente dá uma olhada", "Isso é dahora"],
              correctAnswer: "0",
              explanation: "Construções passivas são formais.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Registro Formal vs Informal",
      lessons: [
        {
          title: "Continuum de registro",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é mais formal?",
              options: ["Prezados senhores", "Oi pessoal", "Oi", "Bom dia"],
              correctAnswer: "0",
              explanation: "Prezados senhores = saudação mais cortês.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Estruturas de Frases Complexas",
      lessons: [
        {
          title: "Padrões de subordinação",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma oração subordinada?",
              options: ["A oração que começa com 'porque'", "A oração principal", "A frase sem verbo", "A pergunta"],
              correctAnswer: "0",
              explanation: "Orações subordinadas começam com conjunções subordinativas (porque, que, se...).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Filosofia e Ética",
      lessons: [
        {
          title: "Estruturas éticas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é deontologia?",
              options: ["Ética do dever", "Ética da felicidade", "Ética da virtude", "Ética da responsabilidade"],
              correctAnswer: "0",
              explanation: "Deontologia = ética do dever (Kant).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Análise Literária",
      lessons: [
        {
          title: "Crítica literária",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma alegoria?",
              options: ["Expressão figurativa", "Significado literal", "Exagero", "Ironia"],
              correctAnswer: "0",
              explanation: "Alegoria = expressão figurativa para conceitos abstratos.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Marcadores Discursivos Avançados",
      lessons: [
        {
          title: "Conectores acadêmicos",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que expressa contraste?",
              options: ["Todavia", "Além disso", "Portanto", "Ademais"],
              correctAnswer: "0",
              explanation: "Todavia = porém (contraste).",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Frases Cleft",
      lessons: [
        {
          title: "Frases cleft com 'é'",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma frase cleft?",
              options: ["É Maria quem vem", "Maria vem", "Vem Maria", "Maria veio"],
              correctAnswer: "0",
              explanation: "Frases cleft enfatizam uma parte da frase com 'é'.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Inversão para Ênfase",
      lessons: [
        {
          title: "Inversão negativa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é inversão?",
              options: ["Nunca vi isso", "Eu nunca vi isso", "Isso eu nunca vi", "Vi isso nunca"],
              correctAnswer: "0",
              explanation: "Com advérbios negativos no início, inverte-se a ordem.",
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
          title: "Linguagem jurídica",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é 'reclamante'?",
              options: ["Pessoa que processa", "Juiz", "Advogado", "Testemunha"],
              correctAnswer: "0",
              explanation: "Reclamante = plaintiff.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Sociolinguística",
      lessons: [
        {
          title: "Variação linguística",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é um dialeto?",
              options: ["Variedade regional", "Língua padrão", "Jargão técnico", "Gíria"],
              correctAnswer: "0",
              explanation: "Dialeto = variedade regional.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Linguística Cognitiva",
      lessons: [
        {
          title: "Metáforas cognitivas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é metáfora conceitual?",
              options: ["Tempo é dinheiro", "Mesa é madeira", "Livro é papel", "Casa é pedra"],
              correctAnswer: "0",
              explanation: "Metáfora conceitual: conceito abstrato entendido via concreto.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Análise do Discurso da Mídia",
      lessons: [
        {
          title: "Análise crítica do discurso",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que estuda a Análise Crítica do Discurso?",
              options: ["Relações de poder no texto", "Gramática", "Escolha de palavras", "Pronúncia"],
              correctAnswer: "0",
              explanation: "ACD estuda como a linguagem reflete poder e ideologia.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Metodologia de Pesquisa",
      lessons: [
        {
          title: "Design de pesquisa",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é uma hipótese?",
              options: ["Suposição testável", "Fato", "Teoria", "Lei"],
              correctAnswer: "0",
              explanation: "Hipótese = suposição testável.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Crítica Cultural",
      lessons: [
        {
          title: "Teoria cultural",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que são Estudos Culturais?",
              options: ["Estudo interdisciplinar da cultura", "Ciências naturais", "Matemática", "Esporte"],
              correctAnswer: "0",
              explanation: "Estudos Culturais = estudo interdisciplinar da cultura.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Argumentação Avançada",
      lessons: [
        {
          title: "Falácias lógicas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é Ad hominem?",
              options: ["Ataque à pessoa não ao argumento", "Causalidade falsa", "Círculo vicioso", "Homem de palha"],
              correctAnswer: "0",
              explanation: "Ad hominem = ataque à pessoa em vez do argumento.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Psicolinguística",
      lessons: [
        {
          title: "Aquisição da linguagem",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é o período crítico?",
              options: ["Janela temporal para aprender língua", "Hora de dormir", "Hora de trabalhar", "Férias"],
              correctAnswer: "0",
              explanation: "Período crítico = janela ideal para aquisição de língua.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Questões Globais e Diplomacia",
      lessons: [
        {
          title: "Linguagem diplomática",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é diplomático?",
              options: ["Cortês e cauteloso", "Direto e aberto", "Agressivo", "Barulhento"],
              correctAnswer: "0",
              explanation: "Linguagem diplomática é cortês e cautelosa.",
              language: "pt",
            },
          ],
        },
      ],
    },
    {
      title: "Mestria Estilística",
      lessons: [
        {
          title: "Variação estilística",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "O que é um registro?",
              options: ["Uso da língua conforme o contexto", "Escolha de palavras", "Gramática", "Pronúncia"],
              correctAnswer: "0",
              explanation: "Registro = uso da língua adaptado à situação.",
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
    const { course: courseData, modules: modulesData } = portugueseC1CourseData;
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
            xpReward: 35 + Math.floor(Math.random() * 25),
            gemReward: 4 + Math.floor(Math.random() * 6),
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
          points: q.points || 20,
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
    console.error("Error creating Portuguese C1 course:", error);
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 });
  }
}
