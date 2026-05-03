import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const englishC2CourseData = {
  course: {
    title: "English C2 - Mastery",
    description: "Mastery level: near-native fluency, literary analysis, advanced rhetoric, specialized domains, and subtle cultural nuances.",
    difficulty: "EXPERT",
    minimumLevel: "C2",
  },
  modules: [
    {
      title: "Lexical Precision",
      lessons: [
        {
          title: "Rare Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'peruse' mean?",
              options: ["Read carefully", "Skim quickly", "Write briefly", "Speak loudly"],
              correctAnswer: "0",
              explanation: "'Peruse' means to read something carefully.",
            },
            {
              type: "MCQ",
              question: "'Obfuscate' means:",
              options: ["Make unclear", "Make clear", "Make simple", "Make beautiful"],
              correctAnswer: "0",
              explanation: "'Obfuscate' = deliberately make something hard to understand.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The lawyer used technical ___ (jargon) to confuse the jury.",
              correctAnswer: "jargon",
              explanation: "Jargon = specialized professional language.",
            },
            {
              type: "SPEECH",
              question: "The intricacies of the argument requre nuanced understanding.",
              correctAnswer: "The intricacies of the argument requre nuanced understanding.",
              language: "en",
              hint: "Say: The argument needs nuanced understanding",
            },
          ],
        },
        {
          title: "Precision Synonyms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is most precise for 'walk slowly'?",
              options: ["Ambble", "Walk", "Go", "Move"],
              correctAnswer: "0",
              explanation: "'Ambble' = walk at a leisurely, slow pace.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Begin' and 'commence' are interchangeable in all contexts.",
              correctAnswer: "false",
              explanation: "'Commence' is more formal than 'begin'.",
            },
          ],
        },
        {
          title: "Contextual Precision",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is most precise for a formal report?",
              options: ["Procure", "Get", "Buy", "Grab"],
              correctAnswer: "0",
              explanation: "'Procure' is formal, precise business language.",
            },
            {
              type: "MATCHING",
              question: "Match words with precision levels:",
              options: [
                { left: "Obtain", right: "Formal/precise" },
                { left: "Get", right: "Informal/general" },
                { left: "Procure", right: "Very formal/business" },
                { left: "Acquire", right: "Formal/general" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each word has specific register/precision level.",
            },
          ],
        },
      ],
    },
    {
      title: "Archaic & Literary Terms",
      lessons: [
        {
          title: "Shakespearean Language",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'thou' mean?",
              options: ["You (singular)", "He", "She", "They"],
              correctAnswer: "0",
              explanation: "'Thou' = archaic 'you' (singular).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: '___ art' (You are) the man Shakespeare wrote about.",
              correctAnswer: "Thou",
              explanation: "'Thou art' = you are (archaic).",
            },
          ],
        },
        {
          title: "Literary Devices",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'anaphora'?",
              options: ["Repetition at start", "Repetition at end", "Rhyme scheme", "Meter pattern"],
              correctAnswer: "0",
              explanation: "Anaphora = repetition of word/phrase at start of clauses.",
            },
            {
              type: "SPEECH",
              question: "I have a dream that one day this nation will rise up.",
              correctAnswer: "I have a dream that one day this nation will rise up.",
              language: "en",
              hint: "Say MLK's famous anaphora",
            },
          ],
        },
      ],
    },
    {
      title: "Professional Specialization",
      lessons: [
        {
          title: "Expert Discourse",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'stare decisis'?",
              options: ["Legal precedent", "Medical procedure", "Business strategy", "Scientific method"],
              correctAnswer: "0",
              explanation: "'Stare decisis' = legal principle of precedent.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Double-blind study' is a medical research term.",
              correctAnswer: "true",
              explanation: "Double-blind = neither researchers nor subjects know who gets treatment.",
            },
          ],
        },
        {
          title: "Specialized Registers",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is medical terminology?",
              options: ["Myocardial infarction", "Heart attack", "Chest pain", "Heart issue"],
              correctAnswer: "0",
              explanation: "'Myocardial infarction' = technical term for heart attack.",
            },
            {
              type: "MATCHING",
              question: "Match specialized terms:",
              options: [
                { left: "Plaintiff", right: "Legal" },
                { left: "Etiology", right: "Medical" },
                { left: "Yield", right: "Financial" },
                { left: "Coefficient", right: "Mathematical" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each term belongs to a specialized domain.",
            },
          ],
        },
      ],
    },
    {
      title: "Regional Dialects & Slang",
      lessons: [
        {
          title: "Regional Variations",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'y'all'?",
              options: ["Southern US plural you", "British greeting", "Australian term", "Canadian expression"],
              correctAnswer: "0",
              explanation: "'Y'all' = Southern US dialect for 'you all'.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: In Boston, they say '___' (wicked) good instead of 'very' good.",
              correctAnswer: "wicked",
              explanation: "'Wicked' = Boston slang for 'very'.",
            },
          ],
        },
        {
          title: "Social Dialects",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is AAVE?",
              options: ["African American Vernacular English", "Australian slang", "British RP", "Canadian French"],
              correctAnswer: "0",
              explanation: "AAVE = African American Vernacular English (legitimate dialect).",
            },
            {
              type: "CHECKBOX",
              question: "Select all recognized English dialects:",
              options: ["Cockney", "Scouse", "Standard English", "Broken English"],
              correctAnswer: "[0,1,2]",
              explanation: "Cockney, Scouse, and Standard English are recognized dialects.",
            },
          ],
        },
      ],
    },
    {
      title: "Metaphorical Mastery",
      lessons: [
        {
          title: "Complex Metaphors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is conceptual metaphor theory?",
              options: ["Thoughts structured by metaphors", "Poetic devices", "Grammar rules", "Pronunciation patterns"],
              correctAnswer: "0",
              explanation: "Conceptual metaphors shape how we think (e.g., TIME IS MONEY).",
            },
            {
              type: "SPEECH",
              question: "Time is a thief that steals our youth.",
              correctAnswer: "Time is a thief that steals our youth.",
              language: "en",
              hint: "Say a complex metaphor",
            },
          ],
        },
        {
          title: "Extended Metaphors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is an extended metaphor?",
              options: ["Metaphor developed over text", "One-word metaphor", "Simile", "Hyperbole"],
              correctAnswer: "0",
              explanation: "Extended metaphor = sustained throughout text.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Life is a journey' is an extended metaphor.",
              correctAnswer: "false",
              explanation: "That's a simple metaphor, not extended (only one sentence).",
            },
          ],
        },
      ],
    },
    {
      title: "High-Level Debate",
      lessons: [
        {
          title: "Advanced Rhetoric",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'ethos' in rhetoric?",
              options: ["Credibility/character", "Emotional appeal", "Logical argument", "Humorous appeal"],
              correctAnswer: "0",
              explanation: "Ethos = speaker's credibility/character.",
            },
            {
              type: "MATCHING",
              question: "Match rhetorical appeals:",
              options: [
                { left: "Ethos", right: "Credibility" },
                { left: "Pathos", right: "Emotion" },
                { left: "Logos", right: "Logic" },
                { left: "Kairos", right: "Timing" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each rhetorical appeal has specific meaning.",
            },
          ],
        },
        {
          title: "Debate Strategy",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a 'straw man' fallacy?",
              options: ["Misrepresent argument", "Attack person", "Appeal to emotion", "False cause"],
              correctAnswer: "0",
              explanation: "Straw man = misrepresent opponent's argument to attack it.",
            },
            {
              type: "CHECKBOX",
              question: "Select all logical fallacies:",
              options: ["Ad hominem", "Straw man", "Clear argument", "Slippery slope"],
              correctAnswer: "[0,1,3]",
              explanation: "Ad hominem, straw man, slippery slope are fallacies.",
            },
          ],
        },
      ],
    },
    {
      title: "Subtle Cultural Nuances",
      lessons: [
        {
          title: "Pragmatic Competence",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'That's an interesting idea' mean pragmatically?",
              options: ["I disagree politely", "I love it", "I will do it", "It's fascinating"],
              correctAnswer: "0",
              explanation: "Pragmatically = polite disagreement in English culture.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: In Britain, 'I'll think about it' often means ___ (no).",
              correctAnswer: "no",
              explanation: "British indirectness = 'maybe' often means 'no'.",
            },
          ],
        },
        {
          title: "Cultural Subtext",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'high context' culture?",
              options: ["Meaning in context", "Explicit meaning", "Written rules", "Direct speech"],
              correctAnswer: "0",
              explanation: "High-context = much meaning in situation, not words.",
            },
            {
              type: "SPEECH",
              question: "Cultural nuances require subtle understanding beyond words.",
              correctAnswer: "Cultural nuances require subtle understanding beyond words.",
              language: "en",
              hint: "Say about cultural nuances",
            },
          ],
        },
      ],
    },
    {
      title: "Idiomatic Fluency",
      lessons: [
        {
          title: "Advanced Idioms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'The elephant in the room' means:",
              options: ["Obvious problem ignored", "Large animal", "Expensive item", "Heavy furniture"],
              correctAnswer: "0",
              explanation: "Elephant in room = obvious problem everyone ignores.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Bite the bullet' means to avoid difficulty.",
              correctAnswer: "false",
              explanation: "'Bite the bullet' = face difficulty bravely.",
            },
          ],
        },
        {
          title: "Native-like Collocations",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct native collocation?",
              options: ["Heavy rain", "Strong rain", "Big rain", "Powerful rain"],
              correctAnswer: "0",
              explanation: "'Heavy rain' is native collocation.",
            },
            {
              type: "MATCHING",
              question: "Match collocations:",
              options: [
                { left: "Make", right: "A decision" },
                { left: "Do", right: "Homework" },
                { left: "Take", right: "A shower" },
                { left: "Have", right: "A headache" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each verb has specific noun collocations.",
            },
          ],
        },
      ],
    },
    {
      title: "Grammatical Perfection",
      lessons: [
        {
          title: "Advanced Syntax",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which shows correct subjunctive?",
              options: ["I insist that he be present", "I insist that he is present", "I insist that he was present", "I insist that he has been present"],
              correctAnswer: "0",
              explanation: "Subjunctive = base form after certain verbs (insist, suggest, demand).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I suggested that she ___ (go) to the doctor.",
              correctAnswer: "go",
              explanation: "Subjunctive = base form after 'suggest'.",
            },
          ],
        },
        {
          title: "Complex Structures",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is grammatically most sophisticated?",
              options: ["Having been warned, he proceeded", "He was warned and proceeded", "He was warned, then proceeded", "After warning, he proceeded"],
              correctAnswer: "0",
              explanation: "Perfect participle clause = sophisticated syntax.",
            },
            {
              type: "CHECKBOX",
              question: "Select all grammatically correct complex sentences:",
              options: ["Bcing ill, he stayed home", "Having finished, he left", "Walking home, I saw him", "Because I was tired, I slept"],
              correctAnswer: "[0,1,2]",
              explanation: "All use participle clauses correctly.",
            },
          ],
        },
      ],
    },
    {
      title: "Creative Expression",
      lessons: [
        {
          title: "Literary Creativity",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'stream of consciousness'?",
              options: ["Interior monologue", "Dialogue", "Description", "Plot summary"],
              correctAnswer: "0",
              explanation: "Stream of consciousness = character's continuous thoughts.",
            },
            {
              type: "SPEECH",
              question: "The stream of consciousness technique revolutionized modern literature.",
              correctAnswer: "The stream of consciousness technique revolutionized modern literature.",
              language: "en",
              hint: "Say: Stream of consciousness changed literature",
            },
          ],
        },
      ],
    },
    {
      title: "Academic Discourse",
      lessons: [
        {
          title: "Scholarly Writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is appropriate for dissertation?",
              options: ["This study demonstrates", "I think that", "You can see that", "We all know that"],
              correctAnswer: "0",
              explanation: "Academic writing = objective, formal voice.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'I believe' is common in academic writing.",
              correctAnswer: "false",
              explanation: "Academic writing avoids first person 'I'.",
            },
          ],
        },
        {
          title: "Research Discourse",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'corpus linguistics' study?",
              options: ["Large text collections", "Single texts", "Spoken only", "Written only"],
              correctAnswer: "0",
              explanation: "Corpus linguistics = analysis of large text databases.",
            },
            {
              type: "MATCHING",
              question: "Match academic terms:",
              options: [
                { left: "Corpus", right: "Text collection" },
                { left: "Discourse", right: "Language beyond sentence" },
                { left: "Pragmatics", right: "Contextual meaning" },
                { left: "Semantics", right: "Literal meaning" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each term matches its definition.",
            },
          ],
        },
      ],
    },
    {
      title: "Professional Communication",
      lessons: [
        {
          title: "Executive Communication",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is executive-level writing?",
              options: ["Strategic alignment", "Good work", "Nice job", "Keep it up"],
              correctAnswer: "0",
              explanation: "Executive communication = strategic, high-level vocabulary.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: We must ___ (leverage) our core competencies.",
              correctAnswer: "leverage",
              explanation: "'Leverage' = use to maximum advantage (business jargon).",
            },
          ],
        },
      ],
    },
    {
      title: "Critical Analysis",
      lessons: [
        {
          title: "Analytical Frameworks",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'SWOT analysis'?",
              options: ["Business analysis tool", "Literary theory", "Grammar framework", "Math model"],
              correctAnswer: "0",
              explanation: "SWOT = Strengths, Weaknesses, Opportunities, Threats (business).",
            },
            {
              type: "CHECKBOX",
              question: "Select all components of SWOT:",
              options: ["Strengths", "Weaknesses", "Beauty", "Opportunities"],
              correctAnswer: "[0,1,3]",
              explanation: "SWOT = Strengths, Weaknesses, Opportunities, Threats.",
            },
          ],
        },
      ],
    },
    {
      title: "Intercultural Competence",
      lessons: [
        {
          title: "Cross-Cultural Mastery",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'cultural intelligence'?",
              options: ["Adaptability to cultures", "IQ test", "Language skill", "Travel experience"],
              correctAnswer: "0",
              explanation: "Cultural intelligence = ability to adapt across cultures.",
            },
            {
              type: "SPEECH",
              question: "Intercultural competence is essential in global business.",
              correctAnswer: "Intercultural competence is essential in global business.",
              language: "en",
              hint: "Say: Intercultural competence matters",
            },
          ],
        },
      ],
    },
    {
      title: "Specialized Translation",
      lessons: [
        {
          title: "Translation Theory",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'dynamic equivalence'?",
              options: ["Meaning-based translation", "Word-for-word", "Literal translation", "Grammar translation"],
              correctAnswer: "0",
              explanation: "Dynamic equivalence = translate meaning, not words.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Literal translation' preserves original grammar.",
              correctAnswer: "true",
              explanation: "Literal translation = word-for-word, keeps original structure.",
            },
          ],
        },
      ],
    },
    {
      title: "Linguistic Theory",
      lessons: [
        {
          title: "Generative Grammar",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who proposed Universal Grammar?",
              options: ["Chomsky", "Saussure", "Halliday", "Labov"],
              correctAnswer: "0",
              explanation: "Noam Chomsky proposed Universal Grammar theory.",
            },
            {
              type: "MATCHING",
              question: "Match linguists with theories:",
              options: [
                { left: "Chomsky", right: "Universal Grammar" },
                { left: "Saussure", right: "Structuralism" },
                { left: "Halliday", right: "Systemic-Functional" },
                { left: "Labov", right: "Sociolinguistics" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each linguist matches their theory.",
            },
          ],
        },
      ],
    },
    {
      title: "Discourse Analysis",
      lessons: [
        {
          title: "Critical Discourse Analysis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does CDA examine?",
              options: ["Power in language", "Grammar rules", "Vocabulary", "Pronunciation"],
              correctAnswer: "0",
              explanation: "CDA = how language reflects/maintains power relations.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Language can ___ (perpetuate) social inequalities.",
              correctAnswer: "perpetuate",
              explanation: "CDA examines how language maintains power structures.",
            },
          ],
        },
      ],
    },
    {
      title: "Rhetorical Excellence",
      lessons: [
        {
          title: "Classical Rhetoric",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who wrote 'Rhetoric'?",
              options: ["Aristotle", "Cicero", "Quintilian", "Plato"],
              correctAnswer: "0",
              explanation: "Aristotle wrote 'Rhetoric' (4th century BCE).",
            },
            {
              type: "CHECKBOX",
              question: "Select all canonical rhetorical works:",
              options: ["Aristotle's Rhetoric", "Cicero's De Oratore", "Shakespeare's Plays", "Quintilian's Institutio Oratoria"],
              correctAnswer: "[0,1,3]",
              explanation: "Aristotle, Cicero, Quintilian wrote foundational rhetoric texts.",
            },
          ],
        },
      ],
    },
    {
      title: "Cultural Synthesis",
      lessons: [
        {
          title: "Multicultural Integration",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'cultural hybridity'?",
              options: ["Mixed cultural identities", "Pure culture", "Isolated culture", "Ancient culture"],
              correctAnswer: "0",
              explanation: "Cultural hybridity = blend of multiple cultural influences.",
            },
            {
              type: "SPEECH",
              question: "Modern identity is a tapestry of multicultural threads.",
              correctAnswer: "Modern identity is a tapestry of multicultural threads.",
              language: "en",
              hint: "Say metaphor about multicultural identity",
            },
          ],
        },
      ],
    },
    {
      title: "Mastery Demonstration",
      lessons: [
        {
          title: "Near-Native Fluency",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which demonstrates native-like nuance?",
              options: ["I couldn't possibly agree more", "I agree", "Yes, correct", "You right"],
              correctAnswer: "0",
              explanation: "Sophisticated, nuanced expression = C2 level.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: C2 speakers never make grammar errors.",
              correctAnswer: "false",
              explanation: "C2 = near-native, may make rare errors in complex structures.",
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
    
    const { course: courseData, modules: modulesData } = englishC2CourseData;
    
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
            xpReward: 40 + Math.floor(Math.random() * 30),
            gemReward: 5 + Math.floor(Math.random() * 5),
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
          points: q.points || 20,
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
    console.error("Error creating English C2 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
