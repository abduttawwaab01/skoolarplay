import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries')
}

const conversationData = [
  {
    level: 'A1',
    moduleIdx: 0,
    lessons: [
      {
        title: "Conversation: Greetings & Introductions",
        conversations: [
          {
            scenario: "Meeting someone for the first time",
            turns: [
              { speaker: "A", text: "Hello! My name is Alex. What's your name?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Nice to meet you, Sam! Where are you from?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "That's great! Welcome to our class." },
            ],
            choices: ["Hi Alex, I'm Sam.", "Goodbye Alex.", "I don't know you.", "Yes, I am Sam."],
            correctIndex: 0,
            responses: [
              { blankIndex: 1, choices: ["Hi Alex, I'm Sam.", "Goodbye Alex.", "I don't know you.", "Yes, I am Sam."], correctIndex: 0 },
              { blankIndex: 3, choices: ["I'm from London.", "I am fine.", "It is a book.", "Yes, please."], correctIndex: 0 },
            ]
          },
          {
            scenario: "Saying goodbye",
            turns: [
              { speaker: "A", text: "It was nice talking to you. I have to go now." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Thank you! See you tomorrow!" },
              { speaker: "B", text: "", isBlank: true },
            ],
            responses: [
              { blankIndex: 1, choices: ["Goodbye! Have a nice day.", "I am eating.", "The sky is blue.", "Yes, it is."], correctIndex: 0 },
              { blankIndex: 3, choices: ["See you later!", "I don't understand.", "No, thank you.", "It is cold."], correctIndex: 0 },
            ]
          },
          {
            scenario: "At a coffee shop",
            turns: [
              { speaker: "A", text: "Good morning! What would you like to order?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Sure. Would you like anything else?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "That'll be $3.50. Your coffee will be ready in a minute." },
            ],
            responses: [
              { blankIndex: 1, choices: ["I'd like a coffee, please.", "I want to sleep.", "The weather is nice.", "No, I can't."], correctIndex: 0 },
              { blankIndex: 3, choices: ["No, that's all. Thank you.", "Yes, I am hungry.", "I don't like it.", "It is expensive."], correctIndex: 0 },
            ]
          },
        ]
      },
    ]
  },
  {
    level: 'A2',
    moduleIdx: 0,
    lessons: [
      {
        title: "Conversation: Daily Routines & Shopping",
        conversations: [
          {
            scenario: "Asking for directions",
            turns: [
              { speaker: "A", text: "Excuse me, could you help me? I'm looking for the train station." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Thank you! Is it far from here?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Perfect, I can walk there. Thanks so much!" },
            ],
            responses: [
              { blankIndex: 1, choices: ["Of course! Go straight and turn left at the traffic lights.", "I don't like trains.", "The station is closed.", "It is very expensive."], correctIndex: 0 },
              { blankIndex: 3, choices: ["No, it's about a five-minute walk.", "Yes, I am a student.", "It costs five dollars.", "The train is late."], correctIndex: 0 },
            ]
          },
          {
            scenario: "At a clothing store",
            turns: [
              { speaker: "A", text: "Welcome! Can I help you find something?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Certainly. The fitting rooms are over there." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "It looks great on you! That'll be $45." },
            ],
            responses: [
              { blankIndex: 1, choices: ["Yes, I'm looking for a shirt in medium.", "I want to return a book.", "The store is closed.", "I don't need help."], correctIndex: 0 },
              { blankIndex: 3, choices: ["Thanks! How much does it cost?", "I don't like the color.", "It is too hot.", "Yes, I am tired."], correctIndex: 0 },
            ]
          },
          {
            scenario: "Making plans with a friend",
            turns: [
              { speaker: "A", text: "Hey! Are you free this weekend?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Great! How about Saturday afternoon?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Sounds perfect! I'll book the tickets." },
            ],
            responses: [
              { blankIndex: 1, choices: ["Yes, I am! What did you have in mind?", "No, I'm very busy.", "I don't know you.", "It is raining."], correctIndex: 0 },
              { blankIndex: 3, choices: ["Saturday works for me. What are we doing?", "I don't like Saturdays.", "The movie is boring.", "Yes, it is cold."], correctIndex: 0 },
            ]
          },
        ]
      },
    ]
  },
  {
    level: 'B1',
    moduleIdx: 0,
    lessons: [
      {
        title: "Conversation: Travel & Opinions",
        conversations: [
          {
            scenario: "At a hotel check-in",
            turns: [
              { speaker: "A", text: "Good evening. I have a reservation under the name Johnson." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Yes, for three nights. I'd prefer a room on a higher floor if possible." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "That would be wonderful, thank you." },
            ],
            responses: [
              { blankIndex: 1, choices: ["Welcome, Mr. Johnson. How many nights will you be staying?", "We don't have reservations.", "The hotel is full.", "Check-in is at noon."], correctIndex: 0 },
              { blankIndex: 3, choices: ["I can upgrade you to a room on the 12th floor with a city view.", "We don't have any rooms.", "Breakfast is at 6 AM.", "The pool is closed."], correctIndex: 0 },
            ]
          },
          {
            scenario: "Discussing a movie with a friend",
            turns: [
              { speaker: "A", text: "Did you see that new science fiction film that came out last week?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Really? I heard the special effects were amazing." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "That's a fair point. Maybe I'll still watch it for the visuals." },
            ],
            responses: [
              { blankIndex: 1, choices: ["Yes, I did. Honestly, I found the plot a bit predictable.", "No, I don't like movies.", "The cinema is far away.", "I prefer reading."], correctIndex: 0 },
              { blankIndex: 3, choices: ["They were, but the story was quite weak. The acting could have been better too.", "I love science fiction.", "The tickets were expensive.", "It was very long."], correctIndex: 0 },
            ]
          },
          {
            scenario: "Job interview - discussing experience",
            turns: [
              { speaker: "A", text: "Tell me about your previous work experience and why you're interested in this position." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "That sounds relevant. How do you handle working under pressure?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Excellent. I think you'd be a great fit for our team." },
            ],
            responses: [
              { blankIndex: 1, choices: ["I've spent three years in project management, and I'm drawn to this role because it aligns with my career goals.", "I don't have experience.", "I need a job.", "My previous boss was nice."], correctIndex: 0 },
              { blankIndex: 3, choices: ["I prioritize tasks and stay organized. I actually thrive in fast-paced environments.", "I don't like pressure.", "I usually quit.", "It is very difficult."], correctIndex: 0 },
            ]
          },
        ]
      },
    ]
  },
  {
    level: 'B2',
    moduleIdx: 0,
    lessons: [
      {
        title: "Conversation: Negotiation & Debate",
        conversations: [
          {
            scenario: "Negotiating a business deal",
            turns: [
              { speaker: "A", text: "We're prepared to offer a 15% discount on bulk orders, but we'd need a two-year commitment." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "I understand your concern. What if we offered a one-year trial period with the same rate?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "I think we can work with that. I'll have the contract ready by next week." },
            ],
            responses: [
              { blankIndex: 1, choices: ["That's an interesting offer, but two years is quite a long commitment without a trial period.", "We don't need a discount.", "No, we won't buy anything.", "The price is too high."], correctIndex: 0 },
              { blankIndex: 3, choices: ["That would be more acceptable, provided we have an exit clause after six months.", "We want everything for free.", "I don't agree with anything.", "The contract is too long."], correctIndex: 0 },
            ]
          },
          {
            scenario: "Discussing environmental policy",
            turns: [
              { speaker: "A", text: "The government's new carbon tax is going to hurt small businesses. They should focus on incentives instead of penalties." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "That's true, but the transition period matters. Many businesses simply can't afford to upgrade their equipment overnight." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "You make a compelling point. A phased approach with subsidies could indeed bridge that gap." },
            ],
            responses: [
              { blankIndex: 1, choices: ["I see your point, but research shows that penalties are actually more effective at driving change than incentives alone.", "I don't care about the environment.", "Taxes are always bad.", "Businesses are fine."], correctIndex: 0 },
              { blankIndex: 3, choices: ["Then perhaps a phased implementation with government subsidies for equipment upgrades would address both concerns.", "Everything should be free.", "The government is wrong.", "I have no opinion."], correctIndex: 0 },
            ]
          },
        ]
      },
    ]
  },
  {
    level: 'C1',
    moduleIdx: 0,
    lessons: [
      {
        title: "Conversation: Academic Discourse & Critique",
        conversations: [
          {
            scenario: "Academic peer review discussion",
            turns: [
              { speaker: "A", text: "Your methodology is innovative, but I'm concerned about the sample size. With only 30 participants, can you really generalize these findings?" },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "Fair enough. But what about the lack of a control group? That seems like a significant limitation." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "I'll concede that point. If you can address the sample size concern in the limitations section, I'd be comfortable recommending publication." },
            ],
            responses: [
              { blankIndex: 1, choices: ["That's a valid concern. However, this is a qualitative study using purposive sampling, so statistical generalization isn't the primary objective. The depth of data compensates for the smaller sample.", "I don't need a large sample.", "The sample is fine.", "You are wrong."], correctIndex: 0 },
              { blankIndex: 3, choices: ["Given the exploratory nature of this research, a within-subjects design served as its own control. I acknowledge this limitation and have expanded the discussion section accordingly.", "I don't need a control group.", "It doesn't matter.", "The study is perfect."], correctIndex: 0 },
            ]
          },
        ]
      },
    ]
  },
  {
    level: 'C2',
    moduleIdx: 0,
    lessons: [
      {
        title: "Conversation: Diplomatic & Nuanced Discourse",
        conversations: [
          {
            scenario: "Diplomatic negotiation on trade policy",
            turns: [
              { speaker: "A", text: "While we appreciate the spirit of this agreement, the tariff reductions proposed in Article 7 would disproportionately impact our agricultural sector. We'd need more nuanced provisions." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "A graduated approach could work, but the timeline you've suggested doesn't account for the structural adjustments our farmers would need. We're looking at generational change, not incremental reform." },
              { speaker: "B", text: "", isBlank: true },
              { speaker: "A", text: "If we could secure those transitional provisions and establish a joint review mechanism, I believe we could present this to our parliament with confidence." },
            ],
            responses: [
              { blankIndex: 1, choices: ["We recognize those concerns and have drafted a graduated implementation schedule with safeguard measures that I believe address the asymmetry while maintaining the agreement's integrity.", "We don't care about your farmers.", "The tariffs will stay.", "Change nothing."], correctIndex: 0 },
              { blankIndex: 3, choices: ["Then let me propose an extended five-year transition with annual review checkpoints and a dedicated agricultural adjustment fund. That should provide the breathing room your sector requires.", "We can reduce it to one year.", "There will be no changes.", "Sign the agreement now."], correctIndex: 0 },
            ]
          },
        ]
      },
    ]
  },
]

async function seedConversations() {
  console.log('=========================================')
  console.log('💬 Seeding Conversation Questions...')
  console.log('=========================================')

  try {
    for (const levelData of conversationData) {
      const course = await withRetry(() => prisma.course.findFirst({
        where: { title: { contains: `English ${levelData.level}` } }
      }))

      if (!course) {
        console.log(`⚠️ Course for ${levelData.level} not found, skipping`)
        continue
      }

      console.log(`\n📚 Processing ${levelData.level}...`)

      for (const lessonData of levelData.lessons) {
        const modules = await withRetry(() => prisma.module.findMany({
          where: { courseId: course.id },
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } }
        }))

        if (modules.length === 0) continue

        const targetModule = modules[levelData.moduleIdx] || modules[modules.length - 1]

        const newLesson = await withRetry(() => prisma.lesson.create({
          data: {
            title: lessonData.title,
            moduleId: targetModule.id,
            type: 'QUIZ',
            order: targetModule.lessons.length,
            xpReward: 20,
            gemReward: 3,
            isActive: true,
            isLocked: true,
            lockReason: 'Complete previous lessons to unlock',
          }
        }))

        console.log(`  📝 Created lesson: "${lessonData.title}"`)

        for (const conv of lessonData.conversations) {
          for (const response of conv.responses) {
            const turnsForQuestion = conv.turns.map((t, i) => {
              if (i === response.blankIndex) {
                return { speaker: t.speaker, text: '', isBlank: true }
              }
              return t
            })

            const questionPayload = {
              scenario: conv.scenario,
              turns: turnsForQuestion,
              choices: response.choices,
              correctIndex: response.correctIndex,
              correctAnswer: response.choices[response.correctIndex],
              responseMode: 'choices',
            }

            const questionText = `Complete the conversation: "${conv.scenario}"`

            await withRetry(() => prisma.question.create({
              data: {
                lessonId: newLesson.id,
                type: 'CONVERSATION',
                question: questionText,
                options: JSON.stringify(questionPayload),
                correctAnswer: response.choices[response.correctIndex],
                explanation: `In this context, "${response.choices[response.correctIndex]}" is the most natural and appropriate response.`,
                order: 0,
                points: 15,
                isActive: true,
              }
            }))
          }
        }

        const questionCount = await withRetry(() => prisma.question.count({
          where: { lessonId: newLesson.id }
        }))
        console.log(`    ✅ Added ${questionCount} conversation questions`)
      }
    }

    console.log('\n=========================================')
    console.log('🎉 Conversation Questions Seed Complete!')
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding conversations:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedConversations()
