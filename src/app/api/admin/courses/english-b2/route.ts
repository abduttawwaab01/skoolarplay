import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const englishB2CourseData = {
  course: {
    title: "English B2 - Upper Intermediate",
    description: "Upper intermediate: mixed conditionals, advanced passive, idioms, business communication, and abstract concepts.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B2",
  },
  modules: [
    {
      title: "Mixed Conditionals",
      lessons: [
        {
          title: "Third Conditional Review",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct third conditional?",
              options: ["If I had studied, I would have passed", "If I studied, I would pass", "If I study, I will pass", "If I had studied, I would pass"],
              correctAnswer: "0",
              explanation: "If + past perfect, would have + past participle.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: If she ___ (had known), she would have helped.",
              correctAnswer: "had known",
              explanation: "Past perfect for third conditional.",
            },
            {
              type: "SPEECH",
              question: "If I had known, I would have come.",
              correctAnswer: "If I had known, I would have come.",
              language: "en",
              hint: "Say: If I had known, I would have come",
            },
          ],
        },
        {
          title: "Mixed Conditional Types",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is mixed conditional (past → present)?",
              options: ["If I had studied, I would be smarter now", "If I studied, I would pass", "If I study, I will pass", "If I had studied, I would have passed"],
              correctAnswer: "0",
              explanation: "Past condition → present result = mixed conditional.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'If I had money, I would buy a car' is mixed conditional.",
              correctAnswer: "false",
              explanation: "This is second conditional (present result from present condition).",
            },
          ],
        },
        {
          title: "Hypothetical Situations",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which expresses regret?",
              options: ["If only I had studied", "If I study", "If I will study", "If I studied"],
              correctAnswer: "0",
              explanation: "If only/pwish + past perfect = regret.",
            },
            {
              type: "CHECKBOX",
              question: "Select all third conditional sentences:",
              options: ["If I had gone, I would have seen", "If I go, I will see", "If I had known, I would have told you", "If I knew, I would tell you"],
              correctAnswer: "[0,2]",
              explanation: "Third conditional: past perfect + would have.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Passive Voice",
      lessons: [
        {
          title: "Passive with Modals",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["It must be done", "It must is done", "It must was done", "It must did"],
              correctAnswer: "0",
              explanation: "Modal + be + past participle.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The work should ___ (be) finished today.",
              correctAnswer: "be",
              explanation: "Should + be + past participle.",
            },
          ],
        },
        {
          title: "Present Perfect Passive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is present perfect passive?",
              options: ["The car has been repaired", "The car was repaired", "The car is repaired", "The car will be repaired"],
              correctAnswer: "0",
              explanation: "Has/have been + past participle.",
            },
            {
              type: "SPEECH",
              question: "The documents have been signed.",
              correctAnswer: "The documents have been signed.",
              language: "en",
              hint: "Say: The documents have been signed",
            },
          ],
        },
        {
          title: "Causative Passive",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which means someone else did it?",
              options: ["I had my car repaired", "I repaired my car", "I was repairing my car", "I have repaired my car"],
              correctAnswer: "0",
              explanation: "Have/get + object + past participle = causative.",
            },
            {
              type: "MATCHING",
              question: "Match causative with meaning:",
              options: [
                { left: "Have my hair cut", right: "Someone else cuts it" },
                { left: "Cut my hair", right: "I do it myself" },
                { left: "Get my car fixed", right: "Someone fixes it" },
                { left: "Fix my car", right: "I fix it myself" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Have/get = someone else does it.",
            },
          ],
        },
      ],
    },
    {
      title: "Deduction & Speculation",
      lessons: [
        {
          title: "Must be/Can't be",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which shows certainty?",
              options: ["He must be home", "He could be home", "He might be home", "He can't be home"],
              correctAnswer: "0",
              explanation: "Must be = 90-100% certain.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: He ___ (can't) be at work. I just saw him.",
              correctAnswer: "can't",
              explanation: "Can't be = certain he is NOT there.",
            },
          ],
        },
        {
          title: "Past Deduction",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is past deduction?",
              options: ["He must have left", "He must leave", "He must be leaving", "He must had left"],
              correctAnswer: "0",
              explanation: "Must have + past participle = past deduction.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'He can't have stolen it' is past deduction.",
              correctAnswer: "true",
              explanation: "Can't have + past participle = past negative deduction.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Relative Clauses",
      lessons: [
        {
          title: "Prepositional Relatives",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["The man I spoke to", "The man I spoke to him", "The man whom I spoke to him", "The man who I spoke to him"],
              correctAnswer: "0",
              explanation: "Preposition + relative pronoun omitted after object.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The book I told you ___ (about).",
              correctAnswer: "about",
              explanation: "Preposition stays at end when pronoun omitted.",
            },
          ],
        },
        {
          title: "Reduced Relative Clauses",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is reduced relative clause?",
              options: ["The man sitting there is my father", "The man who is sitting there is my father", "The man that is sitting there is my father", "The man he is sitting there is my father"],
              correctAnswer: "0",
              explanation: "Reduced: remove relative pronoun + be.",
            },
            {
              type: "SPEECH",
              question: "The woman standing there is my teacher.",
              correctAnswer: "The woman standing there is my teacher.",
              language: "en",
              hint: "Say: The woman standing there is my teacher",
            },
          ],
        },
      ],
    },
    {
      title: "Idiomatic Expressions",
      lessons: [
        {
          title: "Body Part Idioms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Costs an arm and a leg' means:",
              options: ["Very expensive", "Cheap", "Free", "Medium price"],
              correctAnswer: "0",
              explanation: "Arm and a leg = very expensive.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I'm all ___ (ears). Tell me the news!",
              correctAnswer: "ears",
              explanation: "All ears = listening attentively.",
            },
          ],
        },
        {
          title: "Animal Idioms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Let the cat out of the bag' means:",
              options: ["Reveal a secret", "Buy a cat", "Hide something", "Love cats"],
              correctAnswer: "0",
              explanation: "Let the cat out = reveal secret.",
            },
            {
              type: "CHECKBOX",
              question: "Select all animal idioms:",
              options: ["Let the cat out", "Break a leg", "Elephant in the room", "Big fish"],
              correctAnswer: "[0,2]",
              explanation: "Cat out and elephant in room are animal idioms.",
            },
          ],
        },
        {
          title: "Color Idioms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Feeling blue' means:",
              options: ["Sad", "Happy", "Angry", "Excited"],
              correctAnswer: "0",
              explanation: "Blue = sadness.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Green thumb' means bad at gardening.",
              correctAnswer: "false",
              explanation: "Green thumb = good at gardening.",
            },
          ],
        },
      ],
    },
    {
      title: "Business Communication",
      lessons: [
        {
          title: "Business Emails",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is formal email closing?",
              options: ["Yours sincerely", "See ya", "Bye now", "Cheers"],
              correctAnswer: "0",
              explanation: "Yours sincerely is formal closing.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I am writing ___ (to) inquire about...",
              correctAnswer: "to",
              explanation: "I am writing to + verb = formal purpose.",
            },
          ],
        },
        {
          title: "Negotiation Skills",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is polite negotiation?",
              options: ["Would you consider $50?", "Give me $50", "I want $50", "I need $50"],
              correctAnswer: "0",
              explanation: "Would you consider... is polite.",
            },
            {
              type: "MATCHING",
              question: "Match negotiation phrases:",
              options: [
                { left: "Let's meet halfway", right: "Compromise" },
                { left: "That's our final offer", right: "No more negotiation" },
                { left: "We can do better", right: "Counter-offer" },
                { left: "Deal", right: "Agreement" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each phrase matches its meaning.",
            },
          ],
        },
      ],
    },
    {
      title: "History & Culture",
      lessons: [
        {
          title: "Historical Events",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "When did World War II end?",
              options: ["1945", "1918", "2001", "1969"],
              correctAnswer: "0",
              explanation: "WWII ended in 1945.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The Berlin Wall fell in ___ (1989).",
              correctAnswer: "1989",
              explanation: "Berlin Wall fell in 1989.",
            },
          ],
        },
        {
          title: "Cultural Movements",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What was the Renaissance?",
              options: ["Art revival", "War period", "Industrial era", "Digital age"],
              correctAnswer: "0",
              explanation: "Renaissance = rebirth of art/science.",
            },
            {
              type: "SPEECH",
              question: "The Renaissance changed European culture.",
              correctAnswer: "The Renaissance changed European culture.",
              language: "en",
              hint: "Say: The Renaissance changed culture",
            },
          ],
        },
      ],
    },
    {
      title: "Science & Technology",
      lessons: [
        {
          title: "Scientific Breakthroughs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who discovered penicillin?",
              options: ["Fleming", "Einstein", "Newton", "Curie"],
              correctAnswer: "0",
              explanation: "Alexander Fleming discovered penicillin.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Einstein discovered gravity.",
              correctAnswer: "false",
              explanation: "Newton discovered gravity. Einstein = relativity.",
            },
          ],
        },
        {
          title: "Tech Innovations",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who co-founded Apple?",
              options: ["Jobs and Wozniak", "Gates and Allen", "Zuckerberg and Saverin", "Page and Brin"],
              correctAnswer: "0",
              explanation: "Jobs and Wozniak founded Apple.",
            },
            {
              type: "CHECKBOX",
              question: "Select all tech companies:",
              options: ["Apple", "Microsoft", "Basketball", "Google"],
              correctAnswer: "[0,1,3]",
              explanation: "Apple, Microsoft, Google are tech companies.",
            },
          ],
        },
      ],
    },
    {
      title: "Politics & Social Issues",
      lessons: [
        {
          title: "Political Discourse",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is democracy?",
              options: ["People vote", "One ruler", "Military rule", "Religious rule"],
              correctAnswer: "0",
              explanation: "Democracy = people choose leaders.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Everyone should have ___ (equal) rights.",
              correctAnswer: "equal",
              explanation: "Equal rights = same for all.",
            },
          ],
        },
        {
          title: "Social Justice",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'equality' mean?",
              options: ["Same rights for all", "Special rights", "No rights", "More rights for some"],
              correctAnswer: "0",
              explanation: "Equality = same treatment/rights.",
            },
            {
              type: "MATCHING",
              question: "Match concepts:",
              options: [
                { left: "Equality", right: "Same rights" },
                { left: "Freedom", right: "Liberty" },
                { left: "Justice", right: "Fairness" },
                { left: "Peace", right: "No war" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each concept matches its meaning.",
            },
          ],
        },
      ],
    },
    {
      title: "Abstract Concepts",
      lessons: [
        {
          title: "Philosophical Ideas",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'ethics'?",
              options: ["Moral principles", "Math rules", "Sports rules", "Cooking methods"],
              correctAnswer: "0",
              explanation: "Ethics = moral principles.",
            },
            {
              type: "SPEECH",
              question: "Ethics guide our moral decisions.",
              correctAnswer: "Ethics guide our moral decisions.",
              language: "en",
              hint: "Say: Ethics guide moral decisions",
            },
          ],
        },
        {
          title: "Theoretical Concepts",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a 'hypothesis'?",
              options: ["Testable prediction", "Proven fact", "Wrong idea", "Old theory"],
              correctAnswer: "0",
              explanation: "Hypothesis = proposed explanation to test.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: A theory is unproven.",
              correctAnswer: "false",
              explanation: "Theory = well-substantiated explanation.",
            },
          ],
        },
      ],
    },
    {
      title: "Advanced Phrasal Verbs",
      lessons: [
        {
          title: "Complex Phrasal Verbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Come up with' means:",
              options: ["Invent/create", "Go up", "Arrive", "Happen accidentally"],
              correctAnswer: "0",
              explanation: "Come up with = create/invent (idea).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: We need to ___ (come) up with a solution.",
              correctAnswer: "come",
              explanation: "Come up with = create.",
            },
          ],
        },
        {
          title: "Business Phrasal Verbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Branch out' means:",
              options: ["Expand business", "Cut branches", "Close business", "Move locations"],
              correctAnswer: "0",
              explanation: "Branch out = expand into new areas.",
            },
            {
              type: "CHECKBOX",
              question: "Select all business phrasal verbs:",
              options: ["Branch out", "Take over", "Cut down", "Close down"],
              correctAnswer: "[0,1,3]",
              explanation: "Branch out, take over, close down are business-related.",
            },
          ],
        },
      ],
    },
    {
      title: "Environment & Sustainability",
      lessons: [
        {
          title: "Climate Change",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What causes global warming?",
              options: ["Greenhouse gases", "Trees", "Oceans", "Rain"],
              correctAnswer: "0",
              explanation: "Greenhouse gases trap heat.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: We must reduce carbon ___ (emissions).",
              correctAnswer: "emissions",
              explanation: "Carbon emissions = CO2 released.",
            },
          ],
        },
        {
          title: "Renewable Energy",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is renewable energy?",
              options: ["Solar power", "Coal", "Oil", "Natural gas"],
              correctAnswer: "0",
              explanation: "Solar = renewable. Coal/oil/gas = fossil fuels.",
            },
            {
              type: "MATCHING",
              question: "Match energy types:",
              options: [
                { left: "Solar", right: "Sun" },
                { left: "Wind", right: "Turbines" },
                { left: "Hydro", right: "Water" },
                { left: "Nuclear", right: "Atoms" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each energy matches its source.",
            },
          ],
        },
      ],
    },
    {
      title: "Education & Pedagogy",
      lessons: [
        {
          title: "Learning Theories",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'kinesthetic learning'?",
              options: ["Learning by doing", "Learning by reading", "Learning by listening", "Learning by watching"],
              correctAnswer: "0",
              explanation: "Kinesthetic = hands-on learning.",
            },
            {
              type: "SPEECH",
              question: "Students learn best through active participation.",
              correctAnswer: "Students learn best through active participation.",
              language: "en",
              hint: "Say: Students learn through participation",
            },
          ],
        },
      ],
    },
    {
      title: "Health & Medicine",
      lessons: [
        {
          title: "Medical Terminology",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'cardiology'?",
              options: ["Heart medicine", "Bone medicine", "Skin medicine", "Brain medicine"],
              correctAnswer: "0",
              explanation: "Cardio = heart. Cardiology = heart medicine.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Dermatology' is skin medicine.",
              correctAnswer: "true",
              explanation: "Derma = skin. Dermatology = skin medicine.",
            },
          ],
        },
      ],
    },
    {
      title: "Media & Journalism",
      lessons: [
        {
          title: "Journalistic Writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'clickbait'?",
              options: ["Sensational headline", "Serious news", "Local news", "Sports news"],
              correctAnswer: "0",
              explanation: "Clickbait = sensational headline to get clicks.",
            },
            {
              type: "CHECKBOX",
              question: "Select all media types:",
              options: ["Newspaper", "Television", "Basketball", "Radio"],
              correctAnswer: "[0,1,3]",
              explanation: "Newspaper, TV, radio are media.",
            },
          ],
        },
      ],
    },
    {
      title: "Literature & Arts",
      lessons: [
        {
          title: "Literary Analysis",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'metaphor'?",
              options: ["Implicit comparison", "Explicit comparison", "Exaggeration", "Contrast"],
              correctAnswer: "0",
              explanation: "Metaphor: A is B (implicit comparison).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: 'Time is a ___ (thief).' is a metaphor.",
              correctAnswer: "thief",
              explanation: "Time = thief (metaphor).",
            },
          ],
        },
      ],
    },
    {
      title: "Economics & Finance",
      lessons: [
        {
          title: "Economic Principles",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'supply and demand'?",
              options: ["Market forces", "Government control", "Charity", "Theft"],
              correctAnswer: "0",
              explanation: "Supply and demand = market forces.",
            },
            {
              type: "MATCHING",
              question: "Match economic terms:",
              options: [
                { left: "Inflation", right: "Rising prices" },
                { left: "Recession", right: "Economic decline" },
                { left: "Boom", right: "Rapid growth" },
                { left: "Stagnation", right: "No growth" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each term matches its meaning.",
            },
          ],
        },
      ],
    },
    {
      title: "Psychology & Behavior",
      lessons: [
        {
          title: "Psychological Theories",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'cognitive dissonance'?",
              options: ["Mental discomfort", "Happiness", "Sadness", "Anger"],
              correctAnswer: "0",
              explanation: "Cognitive dissonance = mental discomfort from conflicting beliefs.",
            },
            {
              type: "SPEECH",
              question: "Cognitive dissonance affects our decisions.",
              correctAnswer: "Cognitive dissonance affects our decisions.",
              language: "en",
              hint: "Say: Cognitive dissonance affects decisions",
            },
          ],
        },
      ],
    },
    {
      title: "Globalization & Culture",
      lessons: [
        {
          title: "Cultural Exchange",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is cultural exchange?",
              options: ["Sharing traditions", "War", "Isolation", "Theft"],
              correctAnswer: "0",
              explanation: "Cultural exchange = sharing between cultures.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Globalization reduces cultural diversity.",
              correctAnswer: "false",
              explanation: "Globalization can both reduce AND increase cultural exchange.",
            },
          ],
        },
      ],
    },
    {
      title: "Innovation & Future",
      lessons: [
        {
          title: "Emerging Technologies",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 'blockchain'?",
              options: ["Decentralized ledger", "Centralized bank", "Credit card", "Cash"],
              correctAnswer: "0",
              explanation: "Blockchain = decentralized digital ledger.",
            },
            {
              type: "CHECKBOX",
              question: "Select all emerging technologies:",
              options: ["AI", "Blockchain", "Printing press", "Steam engine"],
              correctAnswer: "[0,1]",
              explanation: "AI and blockchain are emerging. Printing press/steam engine are historical.",
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
    
    const { course: courseData, modules: modulesData } = englishB2CourseData;
    
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
    console.error("Error creating English B2 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
