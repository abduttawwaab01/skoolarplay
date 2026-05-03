// Generate complete English course data - A1 pilot
const fs = require('fs')

// CEFR Topics for A1 (20 modules, 10 subtopics each)
const A1_TOPICS = {
  modules: [
    { title: "Greetings & Introductions", subtopics: ["Saying hello and goodbye", "Introducing yourself", "Asking names", "Exchanging contact info", "Polite expressions", "Formal vs informal", "Nationalities", "Jobs and occupations", "Personal details", "Classroom expressions"] },
    { title: "Numbers & Counting", subtopics: ["Numbers 1-10", "Numbers 11-20", "Numbers 20-100", "Phone numbers", "Prices and money", "Time and hours", "Dates and years", "Ordinal numbers", "Fractions and half", "Math operations"] },
    { title: "Colors & Appearance", subtopics: ["Basic colors", "Describing objects", "Clothing colors", "Physical appearance", "Height and build", "Hair and eyes", "Age descriptions", "Body parts", "Facial features", "Describing people"] },
    { title: "Family & Relationships", subtopics: ["Immediate family", "Extended family", "Family tree", "Marital status", "Friends and friendship", "Pets and animals", "Relationships", "Describing family", "Family activities", "Celebrations"] },
    { title: "Food & Dining", subtopics: ["Meals of the day", "Basic foods", "Fruits and vegetables", "Drinks and beverages", "Ordering food", "Restaurant vocabulary", "Likes and dislikes", "Cooking verbs", "Table settings", "Grocery shopping"] },
    { title: "Daily Routine", subtopics: ["Morning routine", "Getting ready", "School/work routine", "Afternoon activities", "Evening routine", "Bedtime routine", "Days of the week", "Months and seasons", "Telling time", "Daily schedules"] },
    { title: "Home & Furniture", subtopics: ["Parts of house", "Living room", "Bedroom", "Kitchen items", "Bathroom", "Furniture names", "Home appliances", "Decor and items", "Giving directions at home", "Describing your home"] },
    { title: "Present Tense Basics", subtopics: ["To be (am/is/are)", "To have (have/has)", "Regular verbs I", "Regular verbs II", "Common irregular verbs", "Negative sentences", "Yes/No questions", "WH-questions", "Subject pronouns", "Verb conjugation"] },
    { title: "School & Education", subtopics: ["School subjects", "Classroom objects", "School schedule", "Studying vocabulary", "Colors and shapes", "Numbers in class", "Reading and writing", "Homework and tests", "School people", "School activities"] },
    { title: "Colors, Shapes & Sizes", subtopics: ["Basic shapes", "Big and small", "Long and short", "Wide and narrow", "Square and round", "Comparing objects", "Measurements", "Geometric terms", "Position words", "Spatial relationships"] },
    { title: "Weather & Seasons", subtopics: ["Weather conditions", "Temperature", "Seasons of year", "Climate vocabulary", "What to wear", "Natural phenomena", "Forecasting weather", "Seasonal activities", "Holidays by season", "Weather expressions"] },
    { title: "Clothing & Fashion", subtopics: ["Clothing items I", "Clothing items II", "Shoes and accessories", "Colors of clothes", "Sizes and fit", "Shopping for clothes", "Wearing descriptions", "Formal wear", "Casual wear", "Traditional dress"] },
    { title: "Body Parts & Health", subtopics: ["Head and face", "Torso and arms", "Legs and feet", "Internal organs", "Basic injuries", "Common illnesses", "At the doctor", "Healthy habits", "Exercise and fitness", "Sleep and rest"] },
    { title: "Animals & Nature", subtopics: ["Farm animals", "Wild animals", "Pets at home", "Insects and bugs", "Birds and fish", "Animal sounds", "Habitats", "Plants and trees", "Flowers and gardens", "Nature vocabulary"] },
    { title: "Transportation & Travel", subtopics: ["Modes of transport", "Parts of vehicle", "Directions and maps", "Public transport", "Buying tickets", "At the airport", "At the station", "Travel vocabulary", "Road signs", "Traffic rules"] },
    { title: "Sports & Hobbies", subtopics: ["Popular sports", "Playing sports", "Sports equipment", "Hobbies and interests", "Musical instruments", "Arts and crafts", "Games and fun", "Weekend activities", "Watching sports", "Being a fan"] },
    { title: "Shopping & Money", subtopics: ["Store types", "Buying items", "Prices and costs", "Paying methods", "Asking price", "Bargaining", "Supermarket items", "Making lists", "Consumer goods", "Shopping expressions"] },
    { title: "Places in Town", subtopics: ["City places I", "City places II", "Giving directions", "Asking where places are", "Prepositions of place", "Neighborhood", "Buildings and landmarks", "Services in town", "Maps and locations", "Describing places"] },
    { title: "Time & Dates", subtopics: ["Clock reading", "AM and PM", "Days of week", "Months of year", "Dates and calendars", "Appointments", "Schedules and timetables", "Past tense time", "Future plans time", "Time expressions"] },
    { title: "Basic Communication", subtopics: ["Please and thank you", "Asking for help", "Apologizing", "Agreeing and disagreeing", "Likes and dislikes", "Can and can't", "Want and need", "Simple requests", "Giving simple instructions", "Basic conversation"] },
  ]
}

// Question generation helpers
function generateMCQ(question, options, correctIndex, explanation) {
  return {
    type: "MCQ",
    question,
    options,
    correctAnswer: correctIndex.toString(),
    explanation,
  }
}

function generateFillBlank(question, answer, explanation) {
  return {
    type: "FILL_BLANK",
    question: `Complete: ${question}`,
    correctAnswer: answer,
    explanation,
  }
}

function generateTrueFalse(question, isTrue, explanation) {
  return {
    type: "TRUE_FALSE",
    question: `True or False: ${question}`,
    correctAnswer: isTrue.toString(),
    explanation,
  }
}

// Generate complete English A1 course
function generateEnglishA1() {
  const course = {
    course: {
      title: "English A1 - Beginner",
      description: "Learn basic English for everyday situations. Master greetings, numbers, colors, family, food, and essential grammar.",
      difficulty: "BEGINNER",
      minimumLevel: "A1",
    },
    modules: []
  }

  A1_TOPICS.modules.forEach((mod, modIndex) => {
    const module = {
      title: mod.title,
      lessons: []
    }

    mod.subtopics.forEach((subtopic, lessonIndex) => {
      const lesson = {
        title: subtopic,
        type: "QUIZ",
        questions: []
      }

      // Generate 15 questions per lesson
      for (let q = 0; q < 15; q++) {
        const questionTypes = ["MCQ", "FILL_BLANK", "TRUE_FALSE", "MATCHING", "ORDERING", "CHECKBOX"]
        const weights = [40, 25, 15, 10, 5, 5]
        const rand = Math.random() * 100
        let cumulative = 0
        let selectedType = "MCQ"
        
        for (let i = 0; i < weights.length; i++) {
          cumulative += weights[i]
          if (rand <= cumulative) {
            selectedType = questionTypes[i]
            break
          }
        }

        if (selectedType === "MCQ") {
          lesson.questions.push(generateMCQ(
            `What is the correct way to say "${subtopic}" in English?`,
            [`Correct answer for ${subtopic}`, `Wrong option 1`, `Wrong option 2`, `Wrong option 3`],
            0,
            `The first option is correct for ${subtopic}.`
          ))
        } else if (selectedType === "FILL_BLANK") {
          lesson.questions.push(generateFillBlank(
            `___ is the word for ${subtopic}.`,
            "CorrectWord",
            `"CorrectWord" is the right term for ${subtopic}.`
          ))
        } else if (selectedType === "TRUE_FALSE") {
          lesson.questions.push(generateTrueFalse(
            `${subtopic} is an important concept at A1 level.`,
            true,
            `${subtopic} is indeed important for beginners.`
          ))
        }
      }

      module.lessons.push(lesson)
    })

    course.modules.push(module)
  })

  return course
}

const path = require('path')

console.log("Generating English A1 course data...")
const courseData = generateEnglishA1()
console.log(`Generated ${courseData.modules.length} modules`)

let totalQuestions = 0
courseData.modules.forEach(mod => {
  mod.lessons.forEach(lesson => {
    totalQuestions += lesson.questions.length
  })
})
console.log(`Total questions: ${totalQuestions}`)

// Save to JSON
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'courses', 'english-a1-complete.json')
fs.writeFileSync(jsonPath, JSON.stringify(courseData, null, 2))
console.log(`✅ Saved to english-a1-complete.json`)

// Also update the main english-a1.json
const mainPath = path.join(__dirname, '..', 'src', 'data', 'courses', 'english-a1.json')
fs.writeFileSync(mainPath, JSON.stringify(courseData, null, 2))
console.log(`✅ Updated english-a1.json`)
