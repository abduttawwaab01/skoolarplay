import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const englishA2CourseData = {
  course: {
    title: "English A2 - Intermediate Foundations",
    description: "Build on A1 foundations. Master past tense, future expressions, comparatives, and everyday communication.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Past Tense - Simple Past",
      lessons: [
        {
          title: "Regular Past Tense",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the past of 'walk'?",
              options: ["Walked", "Walked", "Walk", "Walking"],
              correctAnswer: "0",
              explanation: "Walk → walked (add -ed for regular verbs).",
            },
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I played soccer", "I playd soccer", "I play soccer", "I playing soccer"],
              correctAnswer: "0",
              explanation: "Play → played (regular past).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: She ___ (watch) TV yesterday.",
              correctAnswer: "watched",
              explanation: "Watch → watched (add -ed).",
            },
            {
              type: "SPEECH",
              question: "I visited my grandmother last weekend.",
              correctAnswer: "I visited my grandmother last weekend.",
              language: "en",
              hint: "Say: I visited my grandmother last weekend",
            },
          ],
        },
        {
          title: "Irregular Past Forms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the past of 'go'?",
              options: ["Went", "Goed", "Gone", "Goes"],
              correctAnswer: "0",
              explanation: "Go → went (irregular).",
            },
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I saw a movie", "I seed a movie", "I sawed a movie", "I see a movie"],
              correctAnswer: "0",
              explanation: "See → saw (irregular past).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: They ___ (buy) a new car.",
              correctAnswer: "bought",
              explanation: "Buy → bought (irregular).",
            },
          ],
        },
        {
          title: "Past Time Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which word means 'yesterday'?",
              options: ["Yesterday", "Tomorrow", "Today", "Next week"],
              correctAnswer: "0",
              explanation: "Yesterday = the day before today.",
            },
            {
              type: "MATCHING",
              question: "Match time expressions with meanings:",
              options: [
                { left: "Yesterday", right: "1 day ago" },
                { left: "Last week", right: "7 days ago" },
                { left: "Ago", right: "In the past" },
                { left: "Last year", right: "12 months ago" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each time expression matches its meaning.",
            },
          ],
        },
      ],
    },
    {
      title: "Future Expressions",
      lessons: [
        {
          title: "Going to Future",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say 'I will go' using 'going to'?",
              options: ["I am going to go", "I go to go", "I going to go", "I will going"],
              correctAnswer: "0",
              explanation: "Am/is/are + going to + verb.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: She ___ (going to) visit her friend.",
              correctAnswer: "is going to",
              explanation: "She is going to visit = future plan.",
            },
          ],
        },
        {
          title: "Will for Predictions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is a prediction?",
              options: ["It will rain tomorrow", "I am going to rain", "It rains tomorrow", "It rained tomorrow"],
              correctAnswer: "0",
              explanation: "'Will' is used for predictions.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'I will go' expresses a future plan.",
              correctAnswer: "true",
              explanation: "'Will' can express future plans or predictions.",
            },
          ],
        },
      ],
    },
    {
      title: "Giving Directions",
      lessons: [
        {
          title: "Prepositions of Movement",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["Go to the park", "Go at the park", "Go in the park", "Go on the park"],
              correctAnswer: "0",
              explanation: "Go TO a place (destination).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Walk ___ (to/towards) the library.",
              correctAnswer: "to",
              explanation: "Walk to = destination.",
            },
          ],
        },
        {
          title: "Imperatives for Directions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is a command to turn left?",
              options: ["Turn left", "Turns left", "Turning left", "To turn left"],
              correctAnswer: "0",
              explanation: "Turn left = imperative (base form).",
            },
            {
              type: "ORDERING",
              question: "Put in order: left / turn / !",
              hint: "Give a command",
              correctAnswer: "turn,left,!",
              explanation: "Turn left! is an imperative.",
            },
          ],
        },
      ],
    },
    {
      title: "Shopping & Clothing",
      lessons: [
        {
          title: "Clothing Descriptions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct adjective order?",
              options: ["Blue silk shirt", "Silk blue shirt", "Shirt blue silk", "Blue shirt silk"],
              correctAnswer: "0",
              explanation: "Order: opinion-size-age-shape-color-origin-material-purpose + noun.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I bought a ___ (red) cotton dress.",
              correctAnswer: "red",
              explanation: "Color comes before material.",
            },
          ],
        },
        {
          title: "Shopping Dialogues",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to ask for a smaller size?",
              options: ["Do you have this in a smaller size?", "Give me smaller", "This is smaller", "I want smaller"],
              correctAnswer: "0",
              explanation: "Do you have this in...? is polite.",
            },
            {
              type: "CHECKBOX",
              question: "Select all polite shopping expressions:",
              options: ["Can I try this on?", "Give me that", "I'll take it", "This is mine"],
              correctAnswer: "[0,2]",
              explanation: "Can I try this on? and I'll take it are polite.",
            },
          ],
        },
      ],
    },
    {
      title: "Health & The Body",
      lessons: [
        {
          title: "Common Illnesses",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What illness gives you a headache?",
              options: ["Flu", "Broken leg", "Cut", "Bruise"],
              correctAnswer: "0",
              explanation: "Flu causes headache, fever, body aches.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I have a ___ (cold). I sneeze a lot.",
              correctAnswer: "cold",
              explanation: "A cold causes sneezing, runny nose.",
            },
          ],
        },
        {
          title: "At the Doctor",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when describing symptoms?",
              options: ["I have a fever", "I am fever", "I have feverish", "I am having fever"],
              correctAnswer: "0",
              explanation: "I have a fever = correct structure.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'I have a headache' is correct.",
              correctAnswer: "true",
              explanation: "I have a headache = correct.",
            },
          ],
        },
      ],
    },
    {
      title: "Travel & Transport",
      lessons: [
        {
          title: "Booking Tickets",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to book a flight?",
              options: ["I'd like to book a flight", "Give me a flight", "I want flight", "Flight now"],
              correctAnswer: "0",
              explanation: "I'd like to... is polite for requests.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I want to book a ___ (ticket) to Paris.",
              correctAnswer: "ticket",
              explanation: "Book a ticket = reserve a seat.",
            },
          ],
        },
        {
          title: "At the Airport",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you show your passport?",
              options: ["Security check", "Restaurant", "Shop", "Waiting area"],
              correctAnswer: "0",
              explanation: "Passport is checked at security.",
            },
            {
              type: "MATCHING",
              question: "Match airport places with purposes:",
              options: [
                { left: "Check-in desk", right: "Get boarding pass" },
                { left: "Security", right: "Passport check" },
                { left: "Gate", right: "Board plane" },
                { left: "Baggage claim", right: "Get suitcase" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each place matches its purpose.",
            },
          ],
        },
      ],
    },
    {
      title: "Comparatives & Superlatives",
      lessons: [
        {
          title: "Comparatives",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["Bigger than", "More big than", "Big than", "Bigger as"],
              correctAnswer: "0",
              explanation: "Bigger = comparative of big (short adjectives: -er).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: This book is ___ (more interesting) than that one.",
              correctAnswer: "more interesting",
              explanation: "More + adjective for long words.",
            },
          ],
        },
        {
          title: "Superlatives",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["The biggest city", "The bigger city", "The most big city", "The more big city"],
              correctAnswer: "0",
              explanation: "Biggest = superlative (the + -est).",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'The most beautiful' is a superlative.",
              correctAnswer: "true",
              explanation: "Most + adjective = superlative for long words.",
            },
          ],
        },
      ],
    },
    {
      title: "Present Continuous",
      lessons: [
        {
          title: "Present Activities",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I am eating now", "I eat now", "I eaten now", "I eating now"],
              correctAnswer: "0",
              explanation: "Am/is/are + -ing = present continuous.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: She ___ (is studying) right now.",
              correctAnswer: "is studying",
              explanation: "Is studying = present continuous.",
            },
          ],
        },
        {
          title: "Now vs Habit",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which shows a habit?",
              options: ["I usually eat breakfast at 8", "I am eating breakfast now", "I eat breakfast now", "I am eat breakfast"],
              correctAnswer: "0",
              explanation: "Usually = habit (simple present).",
            },
            {
              type: "CHECKBOX",
              question: "Select all present continuous sentences:",
              options: ["I am running", "He eats lunch", "They are playing", "We play soccer"],
              correctAnswer: "[0,2]",
              explanation: "Am/is/are + -ing = present continuous.",
            },
          ],
        },
      ],
    },
    {
      title: "House & Furniture",
      lessons: [
        {
          title: "Rooms in House",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you cook?",
              options: ["Kitchen", "Bedroom", "Living room", "Bathroom"],
              correctAnswer: "0",
              explanation: "Kitchen is for cooking.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I sleep in the ___ (bedroom).",
              correctAnswer: "bedroom",
              explanation: "Bedroom = room for sleeping.",
            },
          ],
        },
        {
          title: "Furniture Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you sit on?",
              options: ["Sofa", "Table", "Bed", "Lamp"],
              correctAnswer: "0",
              explanation: "A sofa is for sitting.",
            },
            {
              type: "MATCHING",
              question: "Match furniture with rooms:",
              options: [
                { left: "Bed", right: "Bedroom" },
                { left: "Sofa", right: "Living room" },
                { left: "Table", right: "Kitchen" },
                { left: "Toilet", right: "Bathroom" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each furniture matches its room.",
            },
          ],
        },
      ],
    },
    {
      title: "Weather & Seasons",
      lessons: [
        {
          title: "Weather Forecast",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'sunny' mean?",
              options: ["Bright with sun", "Raining", "Snowing", "Windy"],
              correctAnswer: "0",
              explanation: "Sunny = sun is out, bright.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: It is ___ (raining) outside. Take an umbrella.",
              correctAnswer: "raining",
              explanation: "Raining = precipitation falling.",
            },
          ],
        },
        {
          title: "Seasonal Activities",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do in summer?",
              options: ["Go to beach", "Ski", "Wear coat", "Drink hot cocoa"],
              correctAnswer: "0",
              explanation: "Beach activities are summer activities.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: You wear a swimsuit in winter.",
              correctAnswer: "false",
              explanation: "Swimsuits are for summer, not winter.",
            },
          ],
        },
      ],
    },
    {
      title: "Work & Professions",
      lessons: [
        {
          title: "Job Titles",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who teaches students?",
              options: ["Teacher", "Doctor", "Driver", "Cook"],
              correctAnswer: "0",
              explanation: "A teacher teaches students.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My father is a ___ (doctor).",
              correctAnswer: "doctor",
              explanation: "A doctor treats patients.",
            },
          ],
        },
        {
          title: "Work Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where does a teacher work?",
              options: ["School", "Hospital", "Restaurant", "Store"],
              correctAnswer: "0",
              explanation: "Teachers work at schools.",
            },
            {
              type: "CHECKBOX",
              question: "Select all work places:",
              options: ["Office", "Beach", "Factory", "Park"],
              correctAnswer: "[0,2]",
              explanation: "Office and factory are work places.",
            },
          ],
        },
      ],
    },
    {
      title: "Food & Dining",
      lessons: [
        {
          title: "Restaurant Dialogues",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to order food?",
              options: ["I'd like a hamburger", "Give me hamburger", "Hamburger here", "I want hamburger"],
              correctAnswer: "0",
              explanation: "I'd like... is polite for ordering.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Can I have a glass of ___ (water)?",
              correctAnswer: "water",
              explanation: "A glass of water is a drink order.",
            },
          ],
        },
        {
          title: "Tastes and Flavors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which describes sweet taste?",
              options: ["Sweet", "Salty", "Sour", "Bitter"],
              correctAnswer: "0",
              explanation: "Sweet = sugar taste.",
            },
            {
              type: "MATCHING",
              question: "Match tastes with examples:",
              options: [
                { left: "Sweet", right: "Candy" },
                { left: "Salty", right: "Chips" },
                { left: "Sour", right: "Lemon" },
                { left: "Bitter", right: "Coffee" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each taste matches its example.",
            },
          ],
        },
      ],
    },
    {
      title: "Education & School",
      lessons: [
        {
          title: "School Subjects",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which subject studies numbers?",
              options: ["Math", "History", "Art", "Music"],
              correctAnswer: "0",
              explanation: "Math studies numbers and calculations.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I study ___ (science) at school.",
              correctAnswer: "science",
              explanation: "Science is a school subject.",
            },
          ],
        },
        {
          title: "Studying Habits",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do to learn vocabulary?",
              options: ["Study flashcards", "Eat dinner", "Play soccer", "Sleep"],
              correctAnswer: "0",
              explanation: "Flashcards help memorize vocabulary.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'I am studying every day' shows a habit.",
              correctAnswer: "false",
              explanation: "Every day = habit (I study every day). 'Am studying' = now.",
            },
          ],
        },
      ],
    },
    {
      title: "Free Time & Hobbies",
      lessons: [
        {
          title: "Sports Activities",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which uses a ball and hoop?",
              options: ["Basketball", "Soccer", "Tennis", "Swimming"],
              correctAnswer: "0",
              explanation: "Basketball uses ball + hoop.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I play ___ (soccer) with my friends.",
              correctAnswer: "soccer",
              explanation: "Soccer/football is a team sport.",
            },
          ],
        },
        {
          title: "Entertainment",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you watch a movie?",
              options: ["Cinema", "Library", "School", "Hospital"],
              correctAnswer: "0",
              explanation: "Cinema is for watching movies.",
            },
            {
              type: "CHECKBOX",
              question: "Select all entertainment activities:",
              options: ["Watch movie", "Study math", "Listen to music", "Clean room"],
              correctAnswer: "[0,2]",
              explanation: "Watching movies and listening to music are entertainment.",
            },
          ],
        },
      ],
    },
    {
      title: "Technology & Media",
      lessons: [
        {
          title: "Digital Devices",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you use to make calls?",
              options: ["Phone", "Table", "Book", "Chair"],
              correctAnswer: "0",
              explanation: "A phone is for making calls.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I check my ___ (email) on the computer.",
              correctAnswer: "email",
              explanation: "Email is checked on digital devices.",
            },
          ],
        },
        {
          title: "Social Media",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is a social media platform?",
              options: ["Facebook", "Newspaper", "Radio", "Television"],
              correctAnswer: "0",
              explanation: "Facebook is a social media platform.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Instagram is for sharing photos.",
              correctAnswer: "true",
              explanation: "Instagram is a photo-sharing platform.",
            },
          ],
        },
      ],
    },
    {
      title: "Environment & Nature",
      lessons: [
        {
          title: "Natural Places",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do fish live?",
              options: ["Ocean", "Desert", "Mountain", "City"],
              correctAnswer: "0",
              explanation: "Fish live in oceans, rivers, lakes.",
            },
            {
              type: "MATCHING",
              question: "Match places with features:",
              options: [
                { left: "Forest", right: "Trees" },
                { left: "Desert", right: "Sand" },
                { left: "Mountain", right: "High peak" },
                { left: "River", right: "Flowing water" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each place matches its feature.",
            },
          ],
        },
      ],
    },
    {
      title: "People & Relationships",
      lessons: [
        {
          title: "Personality Traits",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What describes a kind person?",
              options: ["Kind", "Angry", "Mean", "Rude"],
              correctAnswer: "0",
              explanation: "Kind = nice, generous.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My friend is very ___ (funny).",
              correctAnswer: "funny",
              explanation: "Funny = makes people laugh.",
            },
          ],
        },
      ],
    },
    {
      title: "Shopping & Services",
      lessons: [
        {
          title: "Customer Service",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to return an item?",
              options: ["I'd like to return this", "Give me money", "This is broken", "I want refund"],
              correctAnswer: "0",
              explanation: "I'd like to return this is polite.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Do you have this in blue?' is polite.",
              correctAnswer: "true",
              explanation: "Do you have...? is a polite question.",
            },
          ],
        },
      ],
    },
    {
      title: "Daily Routine & Habits",
      lessons: [
        {
          title: "Frequency Adverbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which means 'always'?",
              options: ["Always", "Sometimes", "Never", "Rarely"],
              correctAnswer: "0",
              explanation: "Always = 100% of the time.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I ___ (usually) wake up at 7 AM.",
              correctAnswer: "usually",
              explanation: "Usually = most of the time.",
            },
          ],
        },
      ],
    },
    {
      title: "Culture & Traditions",
      lessons: [
        {
          title: "National Holidays",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you celebrate on December 25th?",
              options: ["Christmas", "Halloween", "Easter", "Thanksgiving"],
              correctAnswer: "0",
              explanation: "December 25th = Christmas Day.",
            },
            {
              type: "MATCHING",
              question: "Match holidays with months:",
              options: [
                { left: "Christmas", right: "December" },
                { left: "Halloween", right: "October" },
                { left: "Valentine's Day", right: "February" },
                { left: "Independence Day", right: "July" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each holiday matches its month.",
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
    
    const { course: courseData, modules: modulesData } = englishA2CourseData;
    
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
    console.error("Error creating English A2 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
