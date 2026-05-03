import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const englishC1CourseData = {
  course: {
    title: "English C1 - Advanced",
    description: "Advanced English: nuanced expression, professional communication, sophisticated grammar, and academic discourse.",
    difficulty: "ADVANCED",
    minimumLevel: "C1",
  },
  modules: [
    {
      title: "Nuances of Meaning",
      lessons: [
        {
          title: "Subtle Differences",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the nuance between 'prestige' and 'prestigious'?",
              options: ["Noun vs adjective", "Same meaning", "Verb vs noun", "Adjective vs adverb"],
              correctAnswer: "0",
              explanation: "'Prestige' is noun, 'prestigious' is adjective.",
            },
            {
              type: "MCQ",
              question: "'Big' vs 'enormous' - what is the difference?",
              options: ["Size intensity", "Same meaning", "Big is larger", "Enormous is smaller"],
              correctAnswer: "0",
              explanation: "Enormous = very big (stronger intensity).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The ___ (subtle) difference was hard to notice.",
              correctAnswer: "subtle",
              explanation: "Subtle = not obvious, delicate.",
            },
            {
              type: "SPEECH",
              question: "The nuance between these words is subtle.",
              correctAnswer: "The nuance between these words is subtle.",
              language: "en",
              hint: "Say: The nuance is subtle",
            },
          ],
        },
        {
          title: "Connotation vs Denotation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the connotation of 'slim' vs 'skinny'?",
              options: ["Positive vs negative", "Negative vs positive", "Same meaning", "Both negative"],
              correctAnswer: "0",
              explanation: "Slim = positive, skinny = negative.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Cheap' and 'affordable' have same connotation.",
              correctAnswer: "false",
              explanation: "Cheap = negative, affordable = positive.",
            },
          ],
        },
        {
          title: "Register Awareness",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is most formal?",
              options: ["Procure", "Get", "Buy", "Purchase"],
              correctAnswer: "0",
              explanation: "Procure = very formal (business/academic).",
            },
            {
              type: "MATCHING",
              question: "Match words with register:",
              options: [
                { left: "Procure", right: "Very formal" },
                { left: "Get", right: "Informal" },
                { left: "Purchase", right: "Formal" },
                { left: "Buy", right: "Neutral" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each word has specific register level.",
            },
          ],
        },
      ],
    },
    {
      title: "Rhetorical Devices",
      lessons: [
        {
          title: "Metaphor and Simile",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Time is a thief' is a:",
              options: ["Metaphor", "Simile", "Personification", "Hyperbole"],
              correctAnswer: "0",
              explanation: "Metaphor: A is B (no 'like' or 'as').",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: 'She runs like the wind' is a ___ (simile/metaphor).",
              correctAnswer: "simile",
              explanation: "Simile uses 'like' or 'as'.",
            },
          ],
        },
        {
          title: "Irony and Sarcasm",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Great job!' when someone fails is:",
              options: ["Sarcasm", "Compliment", "Encouragement", "Praise"],
              correctAnswer: "0",
              explanation: "Sarcasm = saying opposite of what you mean.",
            },
            {
              type: "SPEECH",
              question: "That is just what I needed, said sarcasticaly.",
              correctAnswer: "That is just what I needed, said sarcasticaly.",
              language: "en",
              hint: "Say sarcasticaly: Just what I needed",
            },
          ],
        },
      ],
    },
    {
      title: "Academic Writing Style",
      lessons: [
        {
          title: "Hedging and Boosting",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is a hedge?",
              options: ["Might", "Definitely", "Certainly", "Always"],
              correctAnswer: "0",
              explanation: "Might = weakens claim (hedge).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: This ___ (may) suggest that... (hedging)",
              correctAnswer: "may",
              explanation: "May = hedge (not 100% certain).",
            },
          ],
        },
        {
          title: "Academic Voice",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is appropriate for academic writing?",
              options: ["This study demonstrates", "I think that", "You know that", "We can see that"],
              correctAnswer: "0",
              explanation: "Academic voice = objective, formal.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'I believe' is common in academic writing.",
              correctAnswer: "false",
              explanation: "Academic writing avoids first person 'I'.",
            },
          ],
        },
      ],
    },
    {
      title: "Formal vs Informal Register",
      lessons: [
        {
          title: "Register Continuum",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is most formal for ending an email?",
              options: ["Yours faithfully", "Cheers", "Bye", "See ya"],
              correctAnswer: "0",
              explanation: "Yours faithfully = very formal email closing.",
            },
            {
              type: "MATCHING",
              question: "Match expressions with register:",
              options: [
                { left: "Yours sincerely", right: "Formal" },
                { left: "Cheers", right: "Semi-formal" },
                { left: "Hi there", right: "Informal" },
                { left: "Dear Sir", right: "Very formal" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each matches its register level.",
            },
          ],
        },
      ],
    },
    {
      title: "Complex Sentence Structures",
      lessons: [
        {
          title: "Subordination Patterns",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which shows subordination?",
              options: ["Although it rained, we went", "It rained and we went", "It rained, so we went", "It rained; we went"],
              correctAnswer: "0",
              explanation: "Although = subordinate conjunction.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ (Despite) the rain, we went out.",
              correctAnswer: "Despite",
              explanation: "Despite = preposition showing contrast.",
            },
          ],
        },
        {
          title: "Participle Clauses",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which has a participle clause?",
              options: ["Seeing the dog, I stopped", "I saw the dog and stopped", "When I saw the dog, I stopped", "I stopped because I saw the dog"],
              correctAnswer: "0",
              explanation: "Seeing = participle clause (reduced).",
            },
            {
              type: "SPEECH",
              question: "Having finished the work, I went home.",
              correctAnswer: "Having finished the work, I went home.",
              language: "en",
              hint: "Say: Having finished, I went home",
            },
          ],
        },
      ],
    },
    {
      title: "Philosophy & Ethics",
      lessons: [
        {
          title: "Ethical Frameworks",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'utilitarianism' mean?",
              options: ["Greatest good for greatest number", "Duty-based ethics", "Virtue ethics", "Relativism"],
              correctAnswer: "0",
              explanation: "Utilitarianism = maximize overall happiness.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Deontology focuses on consequences.",
              correctAnswer: "false",
              explanation: "Deontology = duty-based (not consequences).",
            },
          ],
        },
      ],
    },
    {
      title: "Literature Analysis",
      lessons: [
        {
          title: "Narrative Techiques",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'unreliable narrator'?",
              options: ["Untrustworthy storyteller", "Third-person narrator", "Omniscient narrator", "First-person narrator"],
              correctAnswer: "0",
              explanation: "Unreliable = narrator we cannot trust.",
            },
            {
              type: "MATCHING",
              question: "Match literary terms:",
              options: [
                { left: "Metaphor", right: "Implicit comparison" },
                { left: "Simile", right: "Explicit comparison" },
                { left: "Irony", right: "Opposite meaning" },
                { left: "Symbolism", right: "Represents something else" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each term matches its definition.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Discourse Markers",
      lessons: [
        {
          title: "Academic Connectors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which shows contrast in academic writing?",
              options: ["Nevertheless", "And", "Moreover", "Furthermore"],
              correctAnswer: "0",
              explanation: "Nevertheless = contrast (formal).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ (However), the results were inconclusive.",
              correctAnswer: "However",
              explanation: "However = contrast connector.",
            },
          ],
        },
      ],
    },
    {
      title: "Cleft Sentences",
      lessons: [
        {
          title: "It-Clefts",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'It was John who called' is an example of:",
              options: ["It-cleft", "Wh-cleft", "Passive", "Question"],
              correctAnswer: "0",
              explanation: "It-cleft emphasizes 'John' as subject.",
            },
            {
              type: "SPEECH",
              question: "It was Mary that solved the problem.",
              correctAnswer: "It was Mary that solved the problem.",
              language: "en",
              hint: "Say: It was Mary that solved it",
            },
          ],
        },
      ],
    },
    {
      title: "Inversion for Emphasis",
      lessons: [
        {
          title: "Negative Inversion",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which uses negative inversion?",
              options: ["Never have I seen that", "I have never seen that", "I never have seen that", "Never I have seen that"],
              correctAnswer: "0",
              explanation: "Never + auxiliary + subject = inversion.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Rarely do I go' uses inversion.",
              correctAnswer: "true",
              explanation: "Rarely (negative adverb) triggers inversion.",
            },
          ],
        },
      ],
    },
    {
      title: "Professional Specialization",
      lessons: [
        {
          title: "Legal Language",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'hereinafter' mean?",
              options: ["From now on", "Before this", "After this", "Below this"],
              correctAnswer: "0",
              explanation: "Hereinafter = from this point forward (legal).",
            },
            {
              type: "MATCHING",
              question: "Match legal terms:",
              options: [
                { left: "Plaintiff", right: "Person suing" },
                { left: "Defendant", right: "Person being sued" },
                { left: "Affidavit", right: "Written statement" },
                { left: "Subpoena", right: "Court order" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each legal term matches its meaning.",
            },
          ],
        },
      ],
    },
    {
      title: "Sociolinguistics",
      lessons: [
        {
          title: "Language Variation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a dialect?",
              options: ["Regional language variation", "Formal language", "Written language", "Foreign language"],
              correctAnswer: "0",
              explanation: "Dialect = regional/social language variation.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A ___ (dialect) is a regional variation.",
              correctAnswer: "dialect",
              explanation: "Dialect = variation of language.",
            },
          ],
        },
      ],
    },
    {
      title: "Cognitive Linguistics",
      lessons: [
        {
          title: "Cognitive Metaphors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Time is money' is a cognitive metaphor meaning:",
              options: ["Time is valuable", "Time is fast", "Time is slow", "Time is free"],
              correctAnswer: "0",
              explanation: "TIME IS MONEY = time is valuable resource.",
            },
            {
              type: "SPEECH",
              question: "I spent time on that project.",
              correctAnswer: "I spent time on that project.",
              language: "en",
              hint: "Say: I spent time (TIME IS MONEY metaphor)",
            },
          ],
        },
      ],
    },
    {
      title: "Media Discourse Analysis",
      lessons: [
        {
          title: "Critical Discourse Analysis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does CDA examine?",
              options: ["Power in language", "Grammar rules", "Vocabulary size", "Pronunciation"],
              correctAnswer: "0",
              explanation: "CDA = how language reflects power relations.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Media language is always neutral.",
              correctAnswer: "false",
              explanation: "Media language often has bias/agenda.",
            },
          ],
        },
      ],
    },
    {
      title: "Research Methodology",
      lessons: [
        {
          title: "Research Design",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is qualitative research?",
              options: ["Non-numerical data", "Statistical data", "Mathematical models", "Experiments"],
              correctAnswer: "0",
              explanation: "Qualitative = interviews, observations (not numbers).",
            },
            {
              type: "MATCHING",
              question: "Match research methods:",
              options: [
                { left: "Survey", right: "Quantitative" },
                { left: "Interview", right: "Qualitative" },
                { left: "Experiment", right: "Scientific" },
                { left: "Case study", right: "In-depth analysis" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each method matches its type.",
            },
          ],
        },
      ],
    },
    {
      title: "Cultural Criticism",
      lessons: [
        {
          title: "Cultural Theory",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'cultural capital'?",
              options: ["Knowledge/education as asset", "Money for culture", "Art collection", "Tourism"],
              correctAnswer: "0",
              explanation: "Cultural capital = education/knowledge as social asset.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Cultural ___ (capital) helps social mobility.",
              correctAnswer: "capital",
              explanation: "Cultural capital = Bourdieu's concept.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Argumentation",
      lessons: [
        {
          title: "Logical Fallacies",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Everyone does it' is which fallacy?",
              options: ["Bandwagon", "Straw man", "Ad hominem", "False cause"],
              correctAnswer: "0",
              explanation: "Bandwagon = everyone else is doing it.",
            },
            {
              type: "CHECKBOX",
              question: "Select all logical fallacies:",
              options: ["Straw man", "Clear argument", "Ad hominem", "Strong evidence"],
              correctAnswer: "[0,2]",
              explanation: "Straw man and ad hominem are fallacies.",
            },
          ],
        },
      ],
    },
    {
      title: "Psycholinguistics",
      lessons: [
        {
          title: "Language Acquisition",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'critical period hypothesis'?",
              options: ["Language learned best young", "Grammar rules", "Vocabulary size", "Pronunciation rules"],
              correctAnswer: "0",
              explanation: "Critical period = easier to learn language when young.",
            },
            {
              type: "SPEECH",
              question: "Children acquire language rapidly.",
              correctAnswer: "Children acquire language rapidly.",
              language: "en",
              hint: "Say: Children learn language fast",
            },
          ],
        },
      ],
    },
    {
      title: "Global Issues & Diplomacy",
      lessons: [
        {
          title: "Diplomatic Language",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'soft power'?",
              options: ["Persuasion/culture", "Military force", "Economic sanctions", "War"],
              correctAnswer: "0",
              explanation: "Soft power = persuasion, culture, values.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Hard power' refers to military/economic force.",
              correctAnswer: "true",
              explanation: "Hard power = coercion (military/economic).",
            },
          ],
        },
      ],
    },
    {
      title: "Stylistic Mastery",
      lessons: [
        {
          title: "Stylistic Variation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which shows elegant variation?",
              options: ["The cat, the feline, the tabby", "The cat, the cat, the cat", "Cat, cat, cat", "The cat, it, he"],
              correctAnswer: "0",
              explanation: "Elegant variation = avoiding repetition with synonyms.",
            },
            {
              type: "MATCHING",
              question: "Match style with purpose:",
              options: [
                { left: "Formal", right: "Academic" },
                { left: "Informal", right: "Casual" },
                { left: "Poetic", right: "Artistic" },
                { left: "Technical", right: "Professional" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each style matches its purpose.",
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
    
    const { course: courseData, modules: modulesData } = englishC1CourseData;
    
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
    console.error("Error creating English C1 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
