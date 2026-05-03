import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const englishB1CourseData = {
  course: {
    title: "English B1 - Intermediate Plus",
    description: "Intermediate English: present perfect, conditionals, passive voice, phrasal verbs, and professional communication.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "B1",
  },
  modules: [
    {
      title: "Present Perfect Tense",
      lessons: [
        {
          title: "Have/Has + Past Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I have seen that movie", "I have saw that movie", "I have see that movie", "I has seen that movie"],
              correctAnswer: "0",
              explanation: "Have + past participle (seen).",
            },
            {
              type: "MCQ",
              question: "Which uses present perfect?",
              options: ["She has finished", "She finished", "She is finishing", "She will finish"],
              correctAnswer: "0",
              explanation: "Has + past participle = present perfect.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: They ___ (have) lived here for 5 years.",
              correctAnswer: "have",
              explanation: "Have lived = present perfect.",
            },
            {
              type: "SPEECH",
              question: "I have visited London three times.",
              correctAnswer: "I have visited London three times.",
              language: "en",
              hint: "Say: I have visited London three times",
            },
          ],
        },
        {
          title: "Ever/Never/Just/Yet",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["Have you ever been to Paris?", "Did you ever go to Paris?", "Have you ever went to Paris?", "Do you ever been to Paris?"],
              correctAnswer: "0",
              explanation: "Ever goes with present perfect.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I have ___ (never) eaten sushi.",
              correctAnswer: "never",
              explanation: "Never = 0 times.",
            },
          ],
        },
        {
          title: "For and Since",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I have lived here for 5 years", "I have lived here since 5 years", "I have lived here during 5 years", "I have lived here while 5 years"],
              correctAnswer: "0",
              explanation: "For + duration (5 years).",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Since' is used with a point in time.",
              correctAnswer: "true",
              explanation: "Since + point in time (since 2019).",
            },
          ],
        },
      ],
    },
    {
      title: "Conditional Sentences Type 1",
      lessons: [
        {
          title: "If + Present, Will",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["If it rains, I will stay home", "If it will rain, I will stay home", "If it rained, I will stay home", "If it rains, I stay home"],
              correctAnswer: "0",
              explanation: "If + present, will + verb (first conditional).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: If I have time, I ___ (will) help you.",
              correctAnswer: "will",
              explanation: "Will + verb in result clause.",
            },
          ],
        },
        {
          title: "Real Future Possibilities",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which expresses a real future possibility?",
              options: ["If you study, you will pass", "If you studied, you would pass", "If you had studied, you would have passed", "If you study, you pass"],
              correctAnswer: "0",
              explanation: "First conditional = real future possibility.",
            },
            {
              type: "SPEECH",
              question: "If I have money, I will buy a car.",
              correctAnswer: "If I have money, I will buy a car.",
              language: "en",
              hint: "Say: If I have money, I will buy a car",
            },
          ],
        },
      ],
    },
    {
      title: "Relative Clauses",
      lessons: [
        {
          title: "Who/Which/That",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["The man who lives next door", "The man which lives next door", "The man whose lives next door", "The man what lives next door"],
              correctAnswer: "0",
              explanation: "Who refers to people.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The book ___ (that) I bought is interesting.",
              correctAnswer: "that",
              explanation: "That can refer to things.",
            },
          ],
        },
        {
          title: "Defining Relative Clauses",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which sentence has a defining relative clause?",
              options: ["The car that I bought is red", "My brother, who lives in Paris, is tall", "London, which is the capital, is busy", "My mother, whose name is Mary, is kind"],
              correctAnswer: "0",
              explanation: "Defining clauses give essential information (no commas).",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Which' can be used for things in defining clauses.",
              correctAnswer: "true",
              explanation: "Which can replace 'that' for things.",
            },
          ],
        },
      ],
    },
    {
      title: "Passive Voice Basics",
      lessons: [
        {
          title: "Am/Is/Are + Past Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is passive voice?",
              options: ["The book was written by JK Rowling", "JK Rowling wrote the book", "The book wrote by JK Rowling", "JK Rowling was writing the book"],
              correctAnswer: "0",
              explanation: "Was + past participle = passive.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: English ___ (is) spoken worldwide.",
              correctAnswer: "is",
              explanation: "Is spoken = passive present.",
            },
          ],
        },
        {
          title: "Was/Were + Past Participle",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct passive past?",
              options: ["The car was stolen", "The car is stolen", "The car has stolen", "The car stole"],
              correctAnswer: "0",
              explanation: "Was + past participle = passive past.",
            },
            {
              type: "SPEECH",
              question: "The letter was written yesterday.",
              correctAnswer: "The letter was written yesterday.",
              language: "en",
              hint: "Say: The letter was written yesterday",
            },
          ],
        },
      ],
    },
    {
      title: "Reported Speech Introduction",
      lessons: [
        {
          title: "Tense Changes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "He said: 'I am tired.' → He said that he ___ tired.",
              options: ["was", "is", "has been", "will be"],
              correctAnswer: "0",
              explanation: "Present → past in reported speech.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: She said she ___ (had) finished her work.",
              correctAnswer: "had",
              explanation: "Past → past perfect in reported speech.",
            },
          ],
        },
        {
          title: "Say vs Tell",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["He told me a story", "He said me a story", "He told that he was tired", "He said to me a story"],
              correctAnswer: "0",
              explanation: "Tell + indirect object + something.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Say' is followed by 'to' for the listener.",
              correctAnswer: "true",
              explanation: "Say to someone (tell someone directly).",
            },
          ],
        },
      ],
    },
    {
      title: "Modal Verbs of Obligation",
      lessons: [
        {
          title: "Must and Have to",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which expresses obligation?",
              options: ["I must go now", "I can go now", "I may go now", "I will go now"],
              correctAnswer: "0",
              explanation: "Must = strong obligation.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: You ___ (must) wear a seatbelt when driving.",
              correctAnswer: "must",
              explanation: "Must = obligation/rule.",
            },
          ],
        },
        {
          title: "Should and Ought to",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which gives advice?",
              options: ["You should study more", "You must study more", "You can study more", "You will study more"],
              correctAnswer: "0",
              explanation: "Should = advice/recommendation.",
            },
            {
              type: "SPEECH",
              question: "You should see a doctor if you are sick.",
              correctAnswer: "You should see a doctor if you are sick.",
              language: "en",
              hint: "Say: You should see a doctor",
            },
          ],
        },
      ],
    },
    {
      title: "Phrasal Verbs Introduction",
      lessons: [
        {
          title: "Common Phrasal Verbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "'Get up' means:",
              options: ["Wake up/stand", "Sit down", "Lie down", "Go to sleep"],
              correctAnswer: "0",
              explanation: "Get up = wake up or stand.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I ___ (woke) up at 7 AM.",
              correctAnswer: "woke",
              explanation: "Wake up = get out of bed.",
            },
          ],
        },
        {
          title: "Separable Phrasal Verbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["Turn off the light", "Turn the light off", "Both A and B", "Turn off it"],
              correctAnswer: "2",
              explanation: "Separable: turn off the light OR turn the light off.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Get on' means to board a vehicle.",
              correctAnswer: "true",
              explanation: "Get on = board (bus, train, plane).",
            },
          ],
        },
      ],
    },
    {
      title: "Work & Professional Life",
      lessons: [
        {
          title: "Job Interviews",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say about your strengths?",
              options: ["I am a hard worker", "I am hard work", "I have hard work", "I am working hard"],
              correctAnswer: "0",
              explanation: "I am a + noun (hard worker).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I have 5 years of ___ (experience) in teaching.",
              correctAnswer: "experience",
              explanation: "Experience = knowledge from doing something.",
            },
          ],
        },
        {
          title: "Workplace Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you have meetings?",
              options: ["Conference room", "Bedroom", "Kitchen", "Garden"],
              correctAnswer: "0",
              explanation: "Conference rooms are for meetings.",
            },
            {
              type: "MATCHING",
              question: "Match workplace items:",
              options: [
                { left: "Laptop", right: "Computer" },
                { left: "Projector", right: "Presentation" },
                { left: "Whiteboard", right: "Writing" },
                { left: "Printer", right: "Documents" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each item matches its use.",
            },
          ],
        },
      ],
    },
    {
      title: "Environment & Society",
      lessons: [
        {
          title: "Environmental Problems",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What causes global warming?",
              options: ["Greenhouse gases", "Trees", "Rain", "Wind"],
              correctAnswer: "0",
              explanation: "Greenhouse gases trap heat.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: We should reduce ___ (pollution) for a cleaner planet.",
              correctAnswer: "pollution",
              explanation: "Pollution = harmful substances in environment.",
            },
          ],
        },
        {
          title: "Social Issues",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is poverty?",
              options: ["Lack of money", "Too much money", "Having a job", "Being rich"],
              correctAnswer: "0",
              explanation: "Poverty = not having enough money.",
            },
            {
              type: "CHECKBOX",
              question: "Select all environmental issues:",
              options: ["Deforestation", "Education", "Pollution", "Healthcare"],
              correctAnswer: "[0,2]",
              explanation: "Deforestation and pollution are environmental issues.",
            },
          ],
        },
      ],
    },
    {
      title: "Media & Entertainment",
      lessons: [
        {
          title: "News and Journalism",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you read breaking news?",
              options: ["News website", "Cookbook", "Novel", "Dictionary"],
              correctAnswer: "0",
              explanation: "News websites have current events.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The journalist wrote an article about ___ (climate) change.",
              correctAnswer: "climate",
              explanation: "Climate change is a major news topic.",
            },
          ],
        },
        {
          title: "Social Media",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do on Instagram?",
              options: ["Share photos", "Buy groceries", "Study math", "Drive a car"],
              correctAnswer: "0",
              explanation: "Instagram is for sharing photos.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Trending' means popular right now.",
              correctAnswer: "true",
              explanation: "Trending = currently popular.",
            },
          ],
        },
      ],
    },
    {
      title: "Education & Learning",
      lessons: [
        {
          title: "Higher Education",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a university?",
              options: ["Place for higher education", "High school", "Elementary school", "Kindergarten"],
              correctAnswer: "0",
              explanation: "Universities offer degrees.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I am studying ___ (engineering) at university.",
              correctAnswer: "engineering",
              explanation: "Engineering is a university subject.",
            },
          ],
        },
        {
          title: "Study Methods",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What helps you remember vocabulary?",
              options: ["Flashcards", "Watching TV", "Sleeping", "Eating"],
              correctAnswer: "0",
              explanation: "Flashcards aid memorization.",
            },
            {
              type: "SPEECH",
              question: "I use flashcards to learn new words.",
              correctAnswer: "I use flashcards to learn new words.",
              language: "en",
              hint: "Say how you study",
            },
          ],
        },
      ],
    },
    {
      title: "Health & Lifestyle",
      lessons: [
        {
          title: "Healthy Diet",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is healthy food?",
              options: ["Vegetables", "Candy", "Chips", "Soda"],
              correctAnswer: "0",
              explanation: "Vegetables are nutritious.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: You should eat ___ (more) fruits and vegetables.",
              correctAnswer: "more",
              explanation: "More fruits and vegetables = healthier diet.",
            },
          ],
        },
        {
          title: "Exercise Routines",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How often should you exercise?",
              options: ["3-5 times a week", "Once a month", "Every day all day", "Never"],
              correctAnswer: "0",
              explanation: "3-5 times weekly is recommended.",
            },
            {
              type: "CHECKBOX",
              question: "Select all aerobic exercises:",
              options: ["Running", "Weightlifting", "Swimming", "Yoga"],
              correctAnswer: "[0,2]",
              explanation: "Running and swimming are aerobic (cardio).",
            },
          ],
        },
      ],
    },
    {
      title: "Travel & Tourism",
      lessons: [
        {
          title: "Tourist Attractions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do tourists visit in Paris?",
              options: ["Eiffel Tower", "Big Ben", "Statue of Liberty", "Great Wall"],
              correctAnswer: "0",
              explanation: "Eiffel Tower is in Paris.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The ___ (Great) Wall of China is a famous attraction.",
              correctAnswer: "Great",
              explanation: "Great Wall of China = historic site.",
            },
          ],
        },
        {
          title: "Travel Planning",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you need to travel internationally?",
              options: ["Passport", "Library card", "Student ID", "Driver's license"],
              correctAnswer: "0",
              explanation: "Passport is for international travel.",
            },
            {
              type: "MATCHING",
              question: "Match travel items:",
              options: [
                { left: "Passport", right: "Identification" },
                { left: "Suitcase", right: "Luggage" },
                { left: "Ticket", right: "Boarding" },
                { left: "Map", right: "Navigation" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each item matches its purpose.",
            },
          ],
        },
      ],
    },
    {
      title: "Technology & Innovation",
      lessons: [
        {
          title: "Digital Transformation",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is artificial intelligence?",
              options: ["Machines that think", "Faster computers", "Bigger screens", "More memory"],
              correctAnswer: "0",
              explanation: "AI = machines simulating human intelligence.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: AI stands for Artificial ___ (Intelligence).",
              correctAnswer: "Intelligence",
              explanation: "AI = Artificial Intelligence.",
            },
          ],
        },
        {
          title: "Internet of Things",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a smart home device?",
              options: ["Internet-connected device", "A phone", "A laptop", "A book"],
              correctAnswer: "0",
              explanation: "IoT devices connect to the internet.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Cloud computing' means storing data online.",
              correctAnswer: "true",
              explanation: "Cloud = remote servers accessed via internet.",
            },
          ],
        },
      ],
    },
    {
      title: "Relationships & Social Life",
      lessons: [
        {
          title: "Friendship Dynamics",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What makes a good friend?",
              options: ["Trustworthy", "Rich", "Famous", "Busy"],
              correctAnswer: "0",
              explanation: "Trustworthy = reliable, honest.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Good friends are ___ (supportive) during hard times.",
              correctAnswer: "supportive",
              explanation: "Supportive = helps you when you need it.",
            },
          ],
        },
        {
          title: "Communication Skills",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is active listening?",
              options: ["Paying full attention", "Waiting to speak", "Checking phone", "Interrupting"],
              correctAnswer: "0",
              explanation: "Active listening = focused attention.",
            },
            {
              type: "SPEECH",
              question: "Good communication is important in relationships.",
              correctAnswer: "Good communication is important in relationships.",
              language: "en",
              hint: "Say: Communication is important",
            },
          ],
        },
      ],
    },
    {
      title: "Consumerism & Shopping",
      lessons: [
        {
          title: "Consumer Rights",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a refund?",
              options: ["Money back", "Exchange item", "Store credit", "Gift card"],
              correctAnswer: "0",
              explanation: "Refund = getting your money back.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I want to return this shirt for a ___ (refund).",
              correctAnswer: "refund",
              explanation: "Refund = money returned to you.",
            },
          ],
        },
        {
          title: "Online Shopping",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is an advantage of online shopping?",
              options: ["Convenience", "Try before buy", "Immediate possession", "No shipping cost"],
              correctAnswer: "0",
              explanation: "Convenience = shop from home anytime.",
            },
            {
              type: "CHECKBOX",
              question: "Select all online shopping sites:",
              options: ["Amazon", "Walmart store", "eBay", "Target store"],
              correctAnswer: "[0,2]",
              explanation: "Amazon and eBay are online platforms.",
            },
          ],
        },
      ],
    },
    {
      title: "Politics & Government",
      lessons: [
        {
          title: "Political Systems",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is democracy?",
              options: ["People vote", "One leader rules", "Military rules", "Religious leaders rule"],
              correctAnswer: "0",
              explanation: "Democracy = people choose leaders.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Citizens have the right to ___ (vote) in elections.",
              correctAnswer: "vote",
              explanation: "Vote = choose your leader.",
            },
          ],
        },
        {
          title: "Citizenship",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you become after naturalization?",
              options: ["Citizen", "Tourist", "Student", "Visitor"],
              correctAnswer: "0",
              explanation: "Naturalization = become citizen of another country.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Visa' allows permanent residence.",
              correctAnswer: "false",
              explanation: "Visa = temporary permission to enter.",
            },
          ],
        },
      ],
    },
    {
      title: "Science & Nature",
      lessons: [
        {
          title: "Scientific Method",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the first step in scientific method?",
              options: ["Ask a question", "Do experiment", "Draw conclusion", "Analyze data"],
              correctAnswer: "0",
              explanation: "Scientific method starts with a question.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A ___ (hypothesis) is a testable prediction.",
              correctAnswer: "hypothesis",
              explanation: "Hypothesis = proposed explanation.",
            },
          ],
        },
        {
          title: "Space Exploration",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the closest star to Earth?",
              options: ["Sun", "Moon", "Mars", "Venus"],
              correctAnswer: "0",
              explanation: "The Sun is our closest star.",
            },
            {
              type: "MATCHING",
              question: "Match space objects:",
              options: [
                { left: "Sun", right: "Star" },
                { left: "Earth", right: "Planet" },
                { left: "Moon", right: "Satelite" },
                { left: "Asteroid", right: "Space rock" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each object matches its type.",
            },
          ],
        },
      ],
    },
    {
      title: "Arts & Culture",
      lessons: [
        {
          title: "Visual Arts",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a painting?",
              options: ["Art on canvas", "Clay sculpture", "Stone building", "Music piece"],
              correctAnswer: "0",
              explanation: "Painting = art on canvas/paper.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The Mona Lisa is a famous ___ (painting) by Da Vinci.",
              correctAnswer: "painting",
              explanation: "Mona Lisa = famous painting.",
            },
          ],
        },
        {
          title: "Music Genres",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is classical music?",
              options: ["Mozart", "Rock", "Jazz", "Hip hop"],
              correctAnswer: "0",
              explanation: "Mozart = classical composer.",
            },
            {
              type: "CHECKBOX",
              question: "Select all music genres:",
              options: ["Classical", "Basketball", "Jazz", "Soccer"],
              correctAnswer: "[0,2]",
              explanation: "Classical and Jazz are music genres.",
            },
          ],
        },
      ],
    },
    {
      title: "Future Plans & Ambitions",
      lessons: [
        {
          title: "Career Goals",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a career goal?",
              options: ["Become a doctor", "Eat lunch", "Sleep well", "Watch TV"],
              correctAnswer: "0",
              explanation: "Career goal = professional aspiration.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My ambition is to ___ (become) an engineer.",
              correctAnswer: "become",
              explanation: "Become = achieve a position.",
            },
          ],
        },
        {
          title: "Personal Ambitions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'ambition' mean?",
              options: ["Strong desire to achieve", "Not caring", "Being lazy", "Giving up"],
              correctAnswer: "0",
              explanation: "Ambition = strong desire to succeed.",
            },
            {
              type: "SPEECH",
              question: "I want to travel the world someday.",
              correctAnswer: "I want to travel the world someday.",
              language: "en",
              hint: "Say your ambition",
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
    
    const { course: courseData, modules: modulesData } = englishB1CourseData;
    
    // Check if course already exists
    let course = await db.course.findFirst({
      where: { title: courseData.title }
    });
    
    if (course) {
      // Delete existing modules (cascades to lessons and questions)
      await db.module.deleteMany({
        where: { courseId: course.id }
      });
      // Update course
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
      // Create course
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
    
    // Create modules, lessons, and questions
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
        
        // Create questions
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
    console.error("Error creating English B1 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
