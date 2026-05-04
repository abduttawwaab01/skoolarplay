import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fisher-Yates shuffle to randomize array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Process MCQ question: shuffle options and update correctAnswer index
function processMCQQuestion(q: any): any {
  if (!q.options || !Array.isArray(q.options)) {
    return q
  }

  const correctIndex = parseInt(q.correctAnswer, 10)
  const correctOption = q.options[correctIndex]

  // Shuffle options
  const shuffledOptions = shuffleArray(q.options)

  // Find new index of correct answer
  const newCorrectIndex = shuffledOptions.findIndex((opt: any) => {
    if (typeof opt === 'string' && typeof correctOption === 'string') {
      return opt === correctOption
    }
    if (typeof opt === 'object' && typeof correctOption === 'object') {
      return JSON.stringify(opt) === JSON.stringify(correctOption)
    }
    return false
  })

  return {
    ...q,
    options: shuffledOptions,
    correctAnswer: String(newCorrectIndex),
  }
}

const courseData = {
  title: "English A1 - Beginner",
  description: "Start your English journey! Learn essential vocabulary, basic grammar, and everyday conversation skills. Perfect for complete beginners.",
  difficulty: "BEGINNER",
  minimumLevel: "A1",
  isFree: true,
  isPremium: false,
  cutoffScore: 70,
  status: "PUBLISHED",
  icon: "🇬🇧",
  color: "#2563eb",
}

const modulesData = [
  {
    title: "Greetings & Introductions",
    lessons: [
      {
        title: "Hello and Goodbye",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you say when you meet someone in the morning?", options: ["Good morning", "Good night", "Good evening", "Goodbye"], correctAnswer: "0", explanation: "'Good morning' is used from dawn until around noon." },
          { type: "MCQ", question: "Which is the most formal greeting?", options: ["Hello", "Hey", "Hi", "Yo"], correctAnswer: "0", explanation: "'Hello' is the most formal. 'Hey', 'Hi', and 'Yo' are informal." },
          { type: "MCQ", question: "What do you say when leaving someone?", options: ["Goodbye", "Hello", "Good morning", "Nice to meet you"], correctAnswer: "0", explanation: "'Goodbye' is used when parting from someone." },
          { type: "TRUE_FALSE", question: "True or False: 'Good night' is used when you go to sleep.", correctAnswer: "true", explanation: "'Good night' is said before going to bed or when leaving late at night." },
          { type: "TRUE_FALSE", question: "True or False: 'Good afternoon' is used at 10 AM.", correctAnswer: "false", explanation: "'Good afternoon' is used from around 12 PM to 5 PM." },
          { type: "FILL_BLANK", question: "Complete: Good ___! (used in the morning)", correctAnswer: "morning", explanation: "'Good morning' is the standard morning greeting." },
          { type: "FILL_BLANK", question: "Complete: ___ evening! (used after 5 PM)", correctAnswer: "Good", explanation: "'Good evening' is used in the evening hours." },
          { type: "FILL_BLANK", question: "Complete: See you ___! (common farewell)", correctAnswer: "later", explanation: "'See you later' is a casual way to say goodbye." },
          { type: "MATCHING", question: "Match the greeting with the time of day:", options: [{ left: "Good morning", right: "7 AM" }, { left: "Good afternoon", right: "2 PM" }, { left: "Good evening", right: "7 PM" }, { left: "Good night", right: "11 PM" }], correctAnswer: "[0,1,2,3]", explanation: "Each greeting matches its typical time." },
          { type: "CHECKBOX", question: "Select all ways to say goodbye:", options: ["Goodbye", "See you", "Hello", "Bye"], correctAnswer: "[0,1,3]", explanation: "Goodbye, See you, and Bye are all ways to say farewell. Hello is a greeting." },
          { type: "ORDERING", question: "Put these in a conversation order: Goodbye / Good morning / How are you?", hint: "Start with greeting", correctAnswer: "Good morning,How are you?,Goodbye", explanation: "First greet, then ask how someone is, then say goodbye." },
          { type: "SPEECH", question: "Good morning! How are you today?", correctAnswer: "Good morning! How are you today?", language: "en", hint: "Say a morning greeting" },
          { type: "SPEECH", question: "Goodbye! Have a nice day.", correctAnswer: "Goodbye! Have a nice day.", language: "en", hint: "Say goodbye politely" },
          { type: "MCQ", question: "When do you say 'Good evening'?", options: ["At 7 PM", "At 8 AM", "At noon", "At midnight"], correctAnswer: "0", explanation: "'Good evening' is used from around 5 PM onwards." },
        ]
      },
      {
        title: "Introducing Yourself",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you say your name?", options: ["My name is Sarah", "I name is Sarah", "Me name Sarah", "I is Sarah"], correctAnswer: "0", explanation: "'My name is...' is the correct way to introduce yourself." },
          { type: "MCQ", question: "How do you ask someone their name?", options: ["What is your name?", "What your name?", "Who your name?", "How your name?"], correctAnswer: "0", explanation: "'What is your name?' is the correct question." },
          { type: "MCQ", question: "Someone says 'Nice to meet you.' What do you say?", options: ["Nice to meet you too", "Thank you", "Goodbye", "Sorry"], correctAnswer: "0", explanation: "'Nice to meet you too' is the polite response." },
          { type: "MCQ", question: "Which sentence is correct?", options: ["I am from Nigeria", "I from Nigeria", "I am Nigeria", "I from am Nigeria"], correctAnswer: "0", explanation: "'I am from...' tells where you are from." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm' means 'I am'.", correctAnswer: "true", explanation: "'I'm' is the contraction of 'I am'." },
          { type: "TRUE_FALSE", question: "True or False: You say 'My name are John' to introduce yourself.", correctAnswer: "false", explanation: "The correct form is 'My name is John'." },
          { type: "FILL_BLANK", question: "Complete: Hello, I ___ Ahmed. (introduce yourself)", correctAnswer: "am", explanation: "'I am' or 'I'm' is used to introduce yourself." },
          { type: "FILL_BLANK", question: "Complete: My ___ is Fatima.", correctAnswer: "name", explanation: "'My name is...' introduces your name." },
          { type: "FILL_BLANK", question: "Complete: ___ to meet you! (when meeting someone new)", correctAnswer: "Nice", explanation: "'Nice to meet you' is polite when meeting someone for the first time." },
          { type: "MATCHING", question: "Match the phrases:", options: [{ left: "My name is", right: "Introduction" }, { left: "Where are you from?", right: "Question" }, { left: "I'm from Ghana", right: "Answer" }, { left: "Nice to meet you", right: "Greeting" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase matches its purpose." },
          { type: "CHECKBOX", question: "Select all correct introductions:", options: ["I am David", "My name is Lisa", "Name is John", "I'm Maria"], correctAnswer: "[0,1,3]", explanation: "'I am David', 'My name is Lisa', and 'I'm Maria' are all correct. 'Name is John' is missing 'My'." },
          { type: "SPEECH", question: "Hello, my name is John. Nice to meet you.", correctAnswer: "Hello, my name is John. Nice to meet you.", language: "en", hint: "Introduce yourself" },
          { type: "ORDERING", question: "Put in order: name / My / is / Adam", correctAnswer: "My,name,is,Adam", explanation: "'My name is Adam' is the correct order." },
        ]
      },
      {
        title: "Asking About People",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you ask about someone's well-being?", options: ["How are you?", "What are you?", "Where are you?", "Who are you?"], correctAnswer: "0", explanation: "'How are you?' asks about someone's well-being." },
          { type: "MCQ", question: "How do you ask where someone is from?", options: ["Where are you from?", "Where you from?", "From where you?", "You where from?"], correctAnswer: "0", explanation: "'Where are you from?' is the correct question." },
          { type: "MCQ", question: "How do you ask someone's age?", options: ["How old are you?", "What old are you?", "Which age are you?", "You how old?"], correctAnswer: "0", explanation: "'How old are you?' asks about age." },
          { type: "MCQ", question: "What is the correct response to 'How are you?'", options: ["I'm fine, thank you", "I'm name", "I'm from Nigeria", "I'm 25"], correctAnswer: "0", explanation: "'I'm fine, thank you' responds to well-being." },
          { type: "TRUE_FALSE", question: "True or False: 'How do you do?' is a formal greeting.", correctAnswer: "true", explanation: "'How do you do?' is a formal greeting used when meeting someone." },
          { type: "TRUE_FALSE", question: "True or False: You answer 'Where are you from?' with 'I'm fine.'", correctAnswer: "false", explanation: "You answer with 'I'm from...' not 'I'm fine.' which answers 'How are you?'" },
          { type: "FILL_BLANK", question: "Complete: How ___ you? (ask about well-being)", correctAnswer: "are", explanation: "'How are you?' is the standard question." },
          { type: "FILL_BLANK", question: "Complete: I ___ from Kenya.", correctAnswer: "am", explanation: "'I am from...' or 'I'm from...' tells your origin." },
          { type: "FILL_BLANK", question: "Complete: How ___ are you? (ask about age)", correctAnswer: "old", explanation: "'How old are you?' asks about age." },
          { type: "MATCHING", question: "Match questions with answers:", options: [{ left: "How are you?", right: "I'm fine" }, { left: "Where are you from?", right: "I'm from Egypt" }, { left: "How old are you?", right: "I'm 20" }, { left: "What is your name?", right: "My name is Ali" }], correctAnswer: "[0,1,2,3]", explanation: "Each question matches its correct answer." },
          { type: "CHECKBOX", question: "Select all questions about a person:", options: ["How are you?", "What is your name?", "Where do you live?", "What time is it?"], correctAnswer: "[0,1,2]", explanation: "The first three ask about a person. 'What time is it?' asks about time." },
          { type: "SPEECH", question: "How are you? I am fine, thank you.", correctAnswer: "How are you? I am fine, thank you.", language: "en", hint: "Practice asking and answering" },
          { type: "ORDERING", question: "Put in order: old / How / you / are / ?", correctAnswer: "How,old,are,you,?", explanation: "'How old are you?' is the correct order." },
        ]
      },
      {
        title: "Polite Expressions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you say when someone gives you something?", options: ["Thank you", "Sorry", "Hello", "Goodbye"], correctAnswer: "0", explanation: "'Thank you' expresses gratitude." },
          { type: "MCQ", question: "What do you say when you bump into someone?", options: ["Sorry", "Thank you", "Hello", "Please"], correctAnswer: "0", explanation: "'Sorry' or 'Excuse me' apologizes for accidents." },
          { type: "MCQ", question: "What do you say when someone says 'Thank you'?", options: ["You're welcome", "Sorry", "Goodbye", "Please"], correctAnswer: "0", explanation: "'You're welcome' responds to 'Thank you'." },
          { type: "MCQ", question: "Which word makes a request polite?", options: ["Please", "Now", "Quick", "Stop"], correctAnswer: "0", explanation: "'Please' makes requests more polite." },
          { type: "TRUE_FALSE", question: "True or False: 'Excuse me' is used to get someone's attention.", correctAnswer: "true", explanation: "'Excuse me' politely gets someone's attention." },
          { type: "TRUE_FALSE", question: "True or False: You say 'Sorry' when you are happy.", correctAnswer: "false", explanation: "'Sorry' is for apologies, not for happiness." },
          { type: "FILL_BLANK", question: "Complete: ___ you very much! (express gratitude)", correctAnswer: "Thank", explanation: "'Thank you very much' shows strong gratitude." },
          { type: "FILL_BLANK", question: "Complete: You're ___! (response to thank you)", correctAnswer: "welcome", explanation: "'You're welcome' is the standard response." },
          { type: "FILL_BLANK", question: "Complete: ___ me, where is the bathroom?", correctAnswer: "Excuse", explanation: "'Excuse me' politely gets attention before asking." },
          { type: "FILL_BLANK", question: "Complete: Can I have water, ___? (make it polite)", correctAnswer: "please", explanation: "Adding 'please' makes the request polite." },
          { type: "MATCHING", question: "Match expressions with meanings:", options: [{ left: "Thank you", right: "Gratitude" }, { left: "Sorry", right: "Apology" }, { left: "Please", right: "Polite request" }, { left: "You're welcome", right: "Response" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression matches its purpose." },
          { type: "CHECKBOX", question: "Select all polite expressions:", options: ["Please", "Thank you", "Sorry", "Give me"], correctAnswer: "[0,1,2]", explanation: "Please, Thank you, and Sorry are polite. 'Give me' is not polite." },
          { type: "SPEECH", question: "Thank you very much. You're welcome.", correctAnswer: "Thank you very much. You're welcome.", language: "en", hint: "Practice thanking and responding" },
        ]
      },
      {
        title: "Review: Greetings & Introductions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which greeting is used at 9 AM?", options: ["Good morning", "Good afternoon", "Good evening", "Good night"], correctAnswer: "0", explanation: "'Good morning' is used until around noon." },
          { type: "MCQ", question: "How do you introduce yourself?", options: ["My name is Sara", "I name Sara", "Me name is Sara", "Name my Sara"], correctAnswer: "0", explanation: "'My name is Sara' is correct." },
          { type: "MCQ", question: "What do you say after 'Nice to meet you'?", options: ["Nice to meet you too", "Goodbye", "Thank you", "Sorry"], correctAnswer: "0", explanation: "'Nice to meet you too' is the response." },
          { type: "MCQ", question: "How do you ask where someone is from?", options: ["Where are you from?", "Where you from?", "You from where?", "From you where?"], correctAnswer: "0", explanation: "'Where are you from?' is correct." },
          { type: "TRUE_FALSE", question: "True or False: 'Good night' is used when leaving at night.", correctAnswer: "true", explanation: "'Good night' is used when parting at night or before sleep." },
          { type: "TRUE_FALSE", question: "True or False: 'Please' makes requests rude.", correctAnswer: "false", explanation: "'Please' makes requests more polite, not rude." },
          { type: "FILL_BLANK", question: "Complete: Good ___, see you tomorrow! (evening farewell)", correctAnswer: "night", explanation: "'Good night' is used when saying goodbye at night." },
          { type: "FILL_BLANK", question: "Complete: I ___ from South Africa.", correctAnswer: "am", explanation: "'I am from...' tells your country of origin." },
          { type: "FILL_BLANK", question: "Complete: ___ you for your help. (gratitude)", correctAnswer: "Thank", explanation: "'Thank you' expresses gratitude." },
          { type: "MATCHING", question: "Match greetings with times:", options: [{ left: "Good morning", right: "8 AM" }, { left: "Good afternoon", right: "1 PM" }, { left: "Good evening", right: "8 PM" }, { left: "Good night", right: "10 PM" }], correctAnswer: "[0,1,2,3]", explanation: "Each greeting matches its time." },
          { type: "CHECKBOX", question: "Select all correct self-introductions:", options: ["I'm from Brazil", "My name is Tom", "I am 25 years old", "You are from Nigeria"], correctAnswer: "[0,1,2]", explanation: "The first three introduce yourself. The fourth talks about someone else." },
          { type: "ORDERING", question: "Put in order: you / How / are / ?", correctAnswer: "How,are,you,?", explanation: "'How are you?' is the correct order." },
          { type: "SPEECH", question: "Hello! My name is Sarah. Nice to meet you.", correctAnswer: "Hello! My name is Sarah. Nice to meet you.", language: "en", hint: "Introduce yourself fully" },
        ]
      }
    ]
  },
  {
    title: "Numbers, Time & Dates",
    lessons: [
      {
        title: "Numbers 1 to 20",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What number comes after 5?", options: ["6", "7", "4", "8"], correctAnswer: "0", explanation: "The sequence is 1, 2, 3, 4, 5, 6..." },
          { type: "MCQ", question: "How do you spell 12?", options: ["Twelve", "Twelv", "Tweleve", "Twelwe"], correctAnswer: "0", explanation: "Twelve is spelled T-W-E-L-V-E." },
          { type: "MCQ", question: "What number is 'fifteen'?", options: ["15", "50", "5", "25"], correctAnswer: "0", explanation: "Fifteen = 15." },
          { type: "MCQ", question: "Which number is between 8 and 10?", options: ["9", "7", "11", "6"], correctAnswer: "0", explanation: "9 comes between 8 and 10." },
          { type: "TRUE_FALSE", question: "True or False: 'One' is the number 1.", correctAnswer: "true", explanation: "One = 1." },
          { type: "TRUE_FALSE", question: "True or False: 'Twenty' is the number 12.", correctAnswer: "false", explanation: "Twenty = 20, not 12." },
          { type: "FILL_BLANK", question: "Complete: One, two, three, ___, five.", correctAnswer: "four", explanation: "The counting sequence: one, two, three, four, five." },
          { type: "FILL_BLANK", question: "Complete: Ten, eleven, ___, thirteen.", correctAnswer: "twelve", explanation: "Ten, eleven, twelve, thirteen." },
          { type: "FILL_BLANK", question: "Complete: The number after 18 is ___", correctAnswer: "nineteen", explanation: "Eighteen, nineteen, twenty." },
          { type: "ORDERING", question: "Put in order: 15 / 3 / 8 / 1", hint: "Smallest to largest", correctAnswer: "1,3,8,15", explanation: "Ordered: 1, 3, 8, 15." },
          { type: "MATCHING", question: "Match numbers to words:", options: [{ left: "3", right: "Three" }, { left: "7", right: "Seven" }, { left: "10", right: "Ten" }, { left: "20", right: "Twenty" }], correctAnswer: "[0,1,2,3]", explanation: "Each number matches its word." },
          { type: "CHECKBOX", question: "Select all numbers between 10 and 15:", options: ["11", "9", "13", "16"], correctAnswer: "[0,2]", explanation: "11 and 13 are between 10 and 15." },
          { type: "SPEECH", question: "One, two, three, four, five, six, seven, eight, nine, ten.", correctAnswer: "One, two, three, four, five, six, seven, eight, nine, ten.", language: "en", hint: "Count from 1 to 10" },
        ]
      },
      {
        title: "Numbers 20 to 100",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is 30 in words?", options: ["Thirty", "Thirteen", "Three zero", "Threety"], correctAnswer: "0", explanation: "30 = thirty." },
          { type: "MCQ", question: "What number is 'seventy-five'?", options: ["75", "57", "70", "50"], correctAnswer: "0", explanation: "Seventy-five = 75." },
          { type: "MCQ", question: "What comes after 89?", options: ["90", "91", "88", "80"], correctAnswer: "0", explanation: "After 89 comes 90." },
          { type: "MCQ", question: "How do you say 100?", options: ["One hundred", "Ten ten", "A thousand", "Ten hundred"], correctAnswer: "0", explanation: "100 = one hundred (or a hundred)." },
          { type: "TRUE_FALSE", question: "True or False: 'Forty' is spelled with a 'u'.", correctAnswer: "false", explanation: "Forty is spelled F-O-R-T-Y, no 'u'." },
          { type: "TRUE_FALSE", question: "True or False: 50 is 'fifty'.", correctAnswer: "true", explanation: "50 = fifty." },
          { type: "FILL_BLANK", question: "Complete: twenty, ___, forty, fifty.", correctAnswer: "thirty", explanation: "The tens: twenty, thirty, forty, fifty." },
          { type: "FILL_BLANK", question: "Complete: sixty, seventy, ___, ninety.", correctAnswer: "eighty", explanation: "The tens: sixty, seventy, eighty, ninety." },
          { type: "FILL_BLANK", question: "Complete: ten, twenty, thirty, ___, fifty.", correctAnswer: "forty", explanation: "The tens in order." },
          { type: "ORDERING", question: "Put in order: 100 / 25 / 75 / 50", hint: "Smallest to largest", correctAnswer: "25,50,75,100", explanation: "Ordered: 25, 50, 75, 100." },
          { type: "MATCHING", question: "Match numbers with words:", options: [{ left: "40", right: "Forty" }, { left: "60", right: "Sixty" }, { left: "80", right: "Eighty" }, { left: "90", right: "Ninety" }], correctAnswer: "[0,1,2,3]", explanation: "Each number matches its word." },
          { type: "CHECKBOX", question: "Select all numbers divisible by 10:", options: ["20", "35", "50", "90"], correctAnswer: "[0,2,3]", explanation: "20, 50, and 90 are divisible by 10. 35 is not." },
          { type: "SPEECH", question: "Twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred.", correctAnswer: "Twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred.", language: "en", hint: "Count by tens to 100" },
        ]
      },
      {
        title: "Telling Time",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What time is it when the clock shows 3:00?", options: ["Three o'clock", "Three thirty", "Thirteen", "Three fifteen"], correctAnswer: "0", explanation: "3:00 = three o'clock." },
          { type: "MCQ", question: "What does 'half past' mean?", options: ["30 minutes", "15 minutes", "45 minutes", "60 minutes"], correctAnswer: "0", explanation: "Half past means 30 minutes past the hour." },
          { type: "MCQ", question: "What is 7:30?", options: ["Seven thirty", "Seven thirteen", "Thirty seven", "Seven three"], correctAnswer: "0", explanation: "7:30 = seven thirty (or half past seven)." },
          { type: "MCQ", question: "What does AM mean?", options: ["Morning", "Evening", "Night", "Afternoon"], correctAnswer: "0", explanation: "AM = morning (before noon)." },
          { type: "TRUE_FALSE", question: "True or False: 12:00 PM is noon.", correctAnswer: "true", explanation: "12:00 PM = noon (midday)." },
          { type: "TRUE_FALSE", question: "True or False: 6:00 AM is in the evening.", correctAnswer: "false", explanation: "6:00 AM is in the morning, not evening." },
          { type: "FILL_BLANK", question: "Complete: It is 5:00. It is five ___'clock.", correctAnswer: "o", explanation: "We say 'o'clock' for exact hours." },
          { type: "FILL_BLANK", question: "Complete: ___ past three means 3:30.", correctAnswer: "Half", explanation: "'Half past three' = 3:30." },
          { type: "FILL_BLANK", question: "Complete: I wake up at 7 ___ the morning.", correctAnswer: "in", explanation: "We say 'in the morning'." },
          { type: "MATCHING", question: "Match times with descriptions:", options: [{ left: "6:00 AM", right: "Morning" }, { left: "12:00 PM", right: "Noon" }, { left: "3:00 PM", right: "Afternoon" }, { left: "9:00 PM", right: "Night" }], correctAnswer: "[0,1,2,3]", explanation: "Each time matches its description." },
          { type: "CHECKBOX", question: "Select all morning times:", options: ["7:00 AM", "10:00 AM", "3:00 PM", "8:00 PM"], correctAnswer: "[0,1]", explanation: "7:00 AM and 10:00 AM are morning times." },
          { type: "SPEECH", question: "What time is it? It is half past two.", correctAnswer: "What time is it? It is half past two.", language: "en", hint: "Ask and tell the time" },
          { type: "ORDERING", question: "Put times in order: 6:00 PM / 9:00 AM / 12:00 PM / 3:00 PM", hint: "Earliest to latest", correctAnswer: "9:00 AM,12:00 PM,3:00 PM,6:00 PM", explanation: "9 AM comes first, then noon, then 3 PM, then 6 PM." },
        ]
      },
      {
        title: "Days of the Week",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which day comes after Monday?", options: ["Tuesday", "Sunday", "Wednesday", "Friday"], correctAnswer: "0", explanation: "Tuesday follows Monday." },
          { type: "MCQ", question: "Which is the first day of the week?", options: ["Sunday", "Monday", "Friday", "Saturday"], correctAnswer: "0", explanation: "Sunday is considered the first day in many calendars." },
          { type: "MCQ", question: "Which day comes before Friday?", options: ["Thursday", "Saturday", "Wednesday", "Tuesday"], correctAnswer: "0", explanation: "Thursday comes before Friday." },
          { type: "MCQ", question: "How many days are in a week?", options: ["7", "5", "6", "10"], correctAnswer: "0", explanation: "A week has 7 days." },
          { type: "TRUE_FALSE", question: "True or False: Saturday and Sunday are the weekend.", correctAnswer: "true", explanation: "Saturday and Sunday are the weekend days." },
          { type: "TRUE_FALSE", question: "True or False: Wednesday comes after Thursday.", correctAnswer: "false", explanation: "Wednesday comes before Thursday." },
          { type: "FILL_BLANK", question: "Complete: Monday, Tuesday, ___, Thursday.", correctAnswer: "Wednesday", explanation: "The days in order: Monday, Tuesday, Wednesday, Thursday." },
          { type: "FILL_BLANK", question: "Complete: Friday, Saturday, ___", correctAnswer: "Sunday", explanation: "Friday, Saturday, Sunday." },
          { type: "FILL_BLANK", question: "Complete: I go to school from Monday to ___ (end of school week).", correctAnswer: "Friday", explanation: "Most schools operate Monday to Friday." },
          { type: "ORDERING", question: "Put days in order: Friday / Monday / Wednesday / Tuesday", hint: "Start from Monday", correctAnswer: "Monday,Tuesday,Wednesday,Friday", explanation: "Monday, Tuesday, Wednesday, then Friday." },
          { type: "MATCHING", question: "Match days with numbers:", options: [{ left: "Monday", right: "1st" }, { left: "Wednesday", right: "3rd" }, { left: "Friday", right: "5th" }, { left: "Sunday", right: "7th" }], correctAnswer: "[0,1,2,3]", explanation: "Each day matches its position in the week." },
          { type: "CHECKBOX", question: "Select all weekdays (not weekend):", options: ["Monday", "Saturday", "Thursday", "Tuesday"], correctAnswer: "[0,2,3]", explanation: "Monday, Thursday, and Tuesday are weekdays. Saturday is weekend." },
          { type: "SPEECH", question: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.", correctAnswer: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.", language: "en", hint: "Say all days of the week" },
        ]
      },
      {
        title: "Months & Dates",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which month is first?", options: ["January", "February", "March", "December"], correctAnswer: "0", explanation: "January is the first month of the year." },
          { type: "MCQ", question: "Which month comes after March?", options: ["April", "February", "May", "June"], correctAnswer: "0", explanation: "April comes after March." },
          { type: "MCQ", question: "Which is the last month?", options: ["December", "November", "October", "January"], correctAnswer: "0", explanation: "December is the 12th and last month." },
          { type: "MCQ", question: "How many months are in a year?", options: ["12", "10", "11", "13"], correctAnswer: "0", explanation: "A year has 12 months." },
          { type: "TRUE_FALSE", question: "True or False: June is the sixth month.", correctAnswer: "true", explanation: "June is month 6." },
          { type: "TRUE_FALSE", question: "True or False: August comes before July.", correctAnswer: "false", explanation: "August comes after July." },
          { type: "FILL_BLANK", question: "Complete: January, February, ___, April.", correctAnswer: "March", explanation: "The first four months in order." },
          { type: "FILL_BLANK", question: "Complete: September, October, ___, December.", correctAnswer: "November", explanation: "September, October, November, December." },
          { type: "FILL_BLANK", question: "Complete: New Year's Day is ___ January 1st.", correctAnswer: "on", explanation: "We use 'on' for specific dates." },
          { type: "ORDERING", question: "Put months in order: December / March / July / June", hint: "Earliest first", correctAnswer: "March,June,July,December", explanation: "March (3rd), June (6th), July (7th), December (12th)." },
          { type: "MATCHING", question: "Match months with seasons (Northern):", options: [{ left: "January", right: "Winter" }, { left: "June", right: "Summer" }, { left: "March", right: "Spring" }, { left: "October", right: "Fall" }], correctAnswer: "[0,1,2,3]", explanation: "Each month matches its typical season." },
          { type: "CHECKBOX", question: "Select all summer months:", options: ["June", "July", "December", "August"], correctAnswer: "[0,1,3]", explanation: "June, July, and August are summer months." },
          { type: "SPEECH", question: "January, February, March, April, May, June.", correctAnswer: "January, February, March, April, May, June.", language: "en", hint: "Say the first six months" },
        ]
      }
    ]
  },
  {
    title: "Colors, Shapes & Sizes",
    lessons: [
      {
        title: "Basic Colors",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What color is the sky?", options: ["Blue", "Red", "Green", "Yellow"], correctAnswer: "0", explanation: "The sky is typically blue." },
          { type: "MCQ", question: "What color is grass?", options: ["Green", "Blue", "Red", "Purple"], correctAnswer: "0", explanation: "Grass is green." },
          { type: "MCQ", question: "What color is snow?", options: ["White", "Black", "Yellow", "Orange"], correctAnswer: "0", explanation: "Snow is white." },
          { type: "MCQ", question: "What color is a banana?", options: ["Yellow", "Blue", "Red", "Purple"], correctAnswer: "0", explanation: "A banana is yellow." },
          { type: "TRUE_FALSE", question: "True or False: The sun is yellow.", correctAnswer: "true", explanation: "The sun appears yellow." },
          { type: "TRUE_FALSE", question: "True or False: Blood is blue.", correctAnswer: "false", explanation: "Blood is red." },
          { type: "FILL_BLANK", question: "Complete: An orange is ___ (color).", correctAnswer: "orange", explanation: "An orange is orange." },
          { type: "FILL_BLANK", question: "Complete: Coal is ___ (color).", correctAnswer: "black", explanation: "Coal is black." },
          { type: "FILL_BLANK", question: "Complete: A tomato is ___ (color).", correctAnswer: "red", explanation: "Tomatoes are typically red." },
          { type: "MATCHING", question: "Match colors with objects:", options: [{ left: "Sky", right: "Blue" }, { left: "Grass", right: "Green" }, { left: "Sun", right: "Yellow" }, { left: "Snow", right: "White" }], correctAnswer: "[0,1,2,3]", explanation: "Each object matches its color." },
          { type: "CHECKBOX", question: "Select all primary colors:", options: ["Red", "Green", "Blue", "Yellow"], correctAnswer: "[0,2,3]", explanation: "Red, blue, and yellow are primary colors. Green is a secondary color." },
          { type: "ORDERING", question: "Put rainbow colors in order: Blue / Red / Yellow", hint: "ROYGBIV order", correctAnswer: "Red,Yellow,Blue", explanation: "Red comes first, then yellow, then blue in the rainbow." },
          { type: "SPEECH", question: "Red, blue, green, yellow, orange, purple.", correctAnswer: "Red, blue, green, yellow, orange, purple.", language: "en", hint: "Say the colors" },
        ]
      },
      {
        title: "More Colors",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What color do you get by mixing red and yellow?", options: ["Orange", "Purple", "Green", "Brown"], correctAnswer: "0", explanation: "Red + yellow = orange." },
          { type: "MCQ", question: "What color do you get by mixing blue and yellow?", options: ["Green", "Purple", "Orange", "Brown"], correctAnswer: "0", explanation: "Blue + yellow = green." },
          { type: "MCQ", question: "What color do you get by mixing red and blue?", options: ["Purple", "Green", "Orange", "Pink"], correctAnswer: "0", explanation: "Red + blue = purple." },
          { type: "MCQ", question: "What color is a chocolate bar?", options: ["Brown", "White", "Black", "Red"], correctAnswer: "0", explanation: "Chocolate is brown." },
          { type: "TRUE_FALSE", question: "True or False: Pink is a lighter shade of red.", correctAnswer: "true", explanation: "Pink is a light red." },
          { type: "TRUE_FALSE", question: "True or False: Gray is a bright color.", correctAnswer: "false", explanation: "Gray is a neutral/dull color, not bright." },
          { type: "FILL_BLANK", question: "Complete: A lemon is ___ (color).", correctAnswer: "yellow", explanation: "Lemons are yellow." },
          { type: "FILL_BLANK", question: "Complete: A strawberry is ___ (color).", correctAnswer: "red", explanation: "Strawberries are red." },
          { type: "FILL_BLANK", question: "Complete: An eggplant is ___ (color).", correctAnswer: "purple", explanation: "Eggplants are purple." },
          { type: "MATCHING", question: "Match colors with things:", options: [{ left: "Gold", right: "Yellow-metallic" }, { left: "Silver", right: "Gray-metallic" }, { left: "Rose", right: "Pink" }, { left: "Midnight", right: "Dark blue" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its shade." },
          { type: "CHECKBOX", question: "Select all warm colors:", options: ["Red", "Blue", "Orange", "Yellow"], correctAnswer: "[0,2,3]", explanation: "Red, orange, and yellow are warm colors. Blue is cool." },
          { type: "SPEECH", question: "Pink, brown, purple, gray, gold, silver.", correctAnswer: "Pink, brown, purple, gray, gold, silver.", language: "en", hint: "Say the colors" },
        ]
      },
      {
        title: "Basic Shapes",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What shape has 4 equal sides?", options: ["Square", "Triangle", "Circle", "Rectangle"], correctAnswer: "0", explanation: "A square has 4 equal sides." },
          { type: "MCQ", question: "What shape has 3 sides?", options: ["Triangle", "Square", "Circle", "Oval"], correctAnswer: "0", explanation: "A triangle has 3 sides." },
          { type: "MCQ", question: "What shape is round with no corners?", options: ["Circle", "Square", "Triangle", "Rectangle"], correctAnswer: "0", explanation: "A circle is round with no corners." },
          { type: "MCQ", question: "What shape has 4 sides but not all equal?", options: ["Rectangle", "Square", "Circle", "Triangle"], correctAnswer: "0", explanation: "A rectangle has 4 sides, opposite sides equal." },
          { type: "TRUE_FALSE", question: "True or False: A circle has corners.", correctAnswer: "false", explanation: "A circle has no corners." },
          { type: "TRUE_FALSE", question: "True or False: A triangle has 3 sides.", correctAnswer: "true", explanation: "A triangle has exactly 3 sides." },
          { type: "FILL_BLANK", question: "Complete: A ___ has 4 equal sides and 4 corners.", correctAnswer: "square", explanation: "A square has 4 equal sides and 4 corners." },
          { type: "FILL_BLANK", question: "Complete: A ball is shaped like a ___ (3D shape).", correctAnswer: "sphere", explanation: "A ball is a sphere." },
          { type: "FILL_BLANK", question: "Complete: A book is shaped like a ___", correctAnswer: "rectangle", explanation: "A book is typically rectangular." },
          { type: "MATCHING", question: "Match shapes with sides:", options: [{ left: "Triangle", right: "3 sides" }, { left: "Square", right: "4 sides" }, { left: "Circle", right: "No sides" }, { left: "Pentagon", right: "5 sides" }], correctAnswer: "[0,1,2,3]", explanation: "Each shape matches its number of sides." },
          { type: "CHECKBOX", question: "Select all shapes with 4 sides:", options: ["Square", "Triangle", "Rectangle", "Circle"], correctAnswer: "[0,2]", explanation: "Square and rectangle have 4 sides." },
          { type: "SPEECH", question: "Square, circle, triangle, rectangle.", correctAnswer: "Square, circle, triangle, rectangle.", language: "en", hint: "Say the shapes" },
          { type: "ORDERING", question: "Put by sides: Triangle / Pentagon / Square", hint: "Fewest sides first", correctAnswer: "Triangle,Square,Pentagon", explanation: "Triangle (3), Square (4), Pentagon (5)." },
        ]
      },
      {
        title: "Sizes: Big and Small",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the opposite of big?", options: ["Small", "Tall", "Long", "Wide"], correctAnswer: "0", explanation: "Small is the opposite of big." },
          { type: "MCQ", question: "Which is bigger: an elephant or a mouse?", options: ["Elephant", "Mouse", "Same size", "Cannot tell"], correctAnswer: "0", explanation: "An elephant is much bigger than a mouse." },
          { type: "MCQ", question: "What is the opposite of tall?", options: ["Short", "Small", "Thin", "Wide"], correctAnswer: "0", explanation: "Short is the opposite of tall." },
          { type: "MCQ", question: "Which word means very big?", options: ["Huge", "Tiny", "Small", "Little"], correctAnswer: "0", explanation: "Huge means very big." },
          { type: "TRUE_FALSE", question: "True or False: A building is taller than a person.", correctAnswer: "true", explanation: "Buildings are taller than people." },
          { type: "TRUE_FALSE", question: "True or False: 'Tiny' means very big.", correctAnswer: "false", explanation: "Tiny means very small." },
          { type: "FILL_BLANK", question: "Complete: A mouse is ___ (small/big).", correctAnswer: "small", explanation: "A mouse is small." },
          { type: "FILL_BLANK", question: "Complete: A giraffe is ___ (tall/short).", correctAnswer: "tall", explanation: "A giraffe is very tall." },
          { type: "FILL_BLANK", question: "Complete: An ant is ___ (tiny/huge).", correctAnswer: "tiny", explanation: "An ant is tiny." },
          { type: "MATCHING", question: "Match size words:", options: [{ left: "Huge", right: "Very big" }, { left: "Tiny", right: "Very small" }, { left: "Tall", right: "High" }, { left: "Short", right: "Low height" }], correctAnswer: "[0,1,2,3]", explanation: "Each word matches its meaning." },
          { type: "CHECKBOX", question: "Select all words that mean small:", options: ["Tiny", "Little", "Huge", "Mini"], correctAnswer: "[0,1,3]", explanation: "Tiny, little, and mini mean small. Huge means very big." },
          { type: "ORDERING", question: "Put from smallest to biggest: House / Ant / Car / Dog", hint: "Smallest first", correctAnswer: "Ant,Dog,Car,House", explanation: "Ant < Dog < Car < House in size." },
          { type: "SPEECH", question: "Big and small. Tall and short. Long and short.", correctAnswer: "Big and small. Tall and short. Long and short.", language: "en", hint: "Practice size words" },
        ]
      },
      {
        title: "Describing Objects",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you describe a red, big ball?", options: ["Big red ball", "Red big ball", "Ball big red", "Red ball big"], correctAnswer: "0", explanation: "Order: size + color + noun. 'Big red ball'." },
          { type: "MCQ", question: "Which description is correct?", options: ["Small blue car", "Blue small car", "Car blue small", "Small car blue"], correctAnswer: "0", explanation: "Size before color: 'small blue car'." },
          { type: "MCQ", question: "What shape is a pizza?", options: ["Circle", "Square", "Triangle", "Rectangle"], correctAnswer: "0", explanation: "A pizza is typically round/circular." },
          { type: "MCQ", question: "Which is long: a ruler or an ant?", options: ["A ruler", "An ant", "Both", "Neither"], correctAnswer: "0", explanation: "A ruler is longer than an ant." },
          { type: "TRUE_FALSE", question: "True or False: A diamond shape has 4 sides.", correctAnswer: "true", explanation: "A diamond (rhombus) has 4 sides." },
          { type: "TRUE_FALSE", question: "True or False: A pencil is short.", correctAnswer: "false", explanation: "A pencil is typically described as long, not short." },
          { type: "FILL_BLANK", question: "Complete: The sky is ___ and ___ (color + size concept).", correctAnswer: "blue,big", explanation: "The sky is blue and big." },
          { type: "FILL_BLANK", question: "Complete: A coin is ___ and ___ (shape + size).", correctAnswer: "round,small", explanation: "A coin is round and small." },
          { type: "FILL_BLANK", question: "Complete: The sun is ___ and ___ (shape + size).", correctAnswer: "round,big", explanation: "The sun is round (circle-shaped) and big." },
          { type: "MATCHING", question: "Match objects with descriptions:", options: [{ left: "House", right: "Big" }, { left: "Ant", right: "Tiny" }, { left: "Rope", right: "Long" }, { left: "Coin", right: "Small" }], correctAnswer: "[0,1,2,3]", explanation: "Each object matches its size." },
          { type: "CHECKBOX", question: "Select correct adjective orders:", options: ["Big red apple", "Small blue cup", "Blue small cup", "Tall green tree"], correctAnswer: "[0,1,3]", explanation: "Size + color + noun is correct. 'Blue small cup' has wrong order." },
          { type: "SPEECH", question: "I have a big blue ball and a small red car.", correctAnswer: "I have a big blue ball and a small red car.", language: "en", hint: "Describe objects" },
        ]
      }
    ]
  },
  {
    title: "Family & People",
    lessons: [
      {
        title: "Immediate Family",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Who is your mother?", options: ["Your female parent", "Your male parent", "Your sister", "Your aunt"], correctAnswer: "0", explanation: "Your mother is your female parent." },
          { type: "MCQ", question: "Who is your father?", options: ["Your male parent", "Your female parent", "Your brother", "Your uncle"], correctAnswer: "0", explanation: "Your father is your male parent." },
          { type: "MCQ", question: "Your parents' son is your:", options: ["Brother", "Father", "Uncle", "Cousin"], correctAnswer: "0", explanation: "Your parents' son is your brother." },
          { type: "MCQ", question: "Your parents' daughter is your:", options: ["Sister", "Mother", "Aunt", "Cousin"], correctAnswer: "0", explanation: "Your parents' daughter is your sister." },
          { type: "TRUE_FALSE", question: "True or False: 'Dad' means father.", correctAnswer: "true", explanation: "'Dad' is an informal word for father." },
          { type: "TRUE_FALSE", question: "True or False: Your brother is your parent.", correctAnswer: "false", explanation: "Your brother is your sibling, not your parent." },
          { type: "FILL_BLANK", question: "Complete: My ___ is my father's wife. (mother)", correctAnswer: "mother", explanation: "Your mother is your father's wife." },
          { type: "FILL_BLANK", question: "Complete: My ___ is my mother's husband. (father)", correctAnswer: "father", explanation: "Your father is your mother's husband." },
          { type: "FILL_BLANK", question: "Complete: I have two ___ (brothers/sisters). They are boys.", correctAnswer: "brothers", explanation: "Brothers are male siblings." },
          { type: "MATCHING", question: "Match family terms:", options: [{ left: "Mother", right: "Mom" }, { left: "Father", right: "Dad" }, { left: "Brother", right: "Male sibling" }, { left: "Sister", right: "Female sibling" }], correctAnswer: "[0,1,2,3]", explanation: "Each term matches its definition." },
          { type: "CHECKBOX", question: "Select all immediate family members:", options: ["Mother", "Father", "Cousin", "Sister"], correctAnswer: "[0,1,3]", explanation: "Mother, father, and sister are immediate family. Cousin is extended." },
          { type: "SPEECH", question: "I have a mother, a father, and a sister.", correctAnswer: "I have a mother, a father, and a sister.", language: "en", hint: "Talk about your family" },
          { type: "ORDERING", question: "Put by age: Daughter / Grandmother / Mother", hint: "Oldest first", correctAnswer: "Grandmother,Mother,Daughter", explanation: "Grandmother > Mother > Daughter in age." },
        ]
      },
      {
        title: "Extended Family",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Who is your grandfather?", options: ["Your father's/mother's father", "Your father's brother", "Your mother's brother", "Your cousin"], correctAnswer: "0", explanation: "Your grandfather is your parent's father." },
          { type: "MCQ", question: "Who is your grandmother?", options: ["Your father's/mother's mother", "Your father's sister", "Your aunt", "Your cousin"], correctAnswer: "0", explanation: "Your grandmother is your parent's mother." },
          { type: "MCQ", question: "Who is your uncle?", options: ["Your parent's brother", "Your parent's father", "Your brother", "Your cousin"], correctAnswer: "0", explanation: "Your uncle is your parent's brother." },
          { type: "MCQ", question: "Who is your aunt?", options: ["Your parent's sister", "Your grandmother", "Your sister", "Your cousin"], correctAnswer: "0", explanation: "Your aunt is your parent's sister." },
          { type: "TRUE_FALSE", question: "True or False: Your cousin is your uncle's or aunt's child.", correctAnswer: "true", explanation: "Your cousin is the child of your uncle or aunt." },
          { type: "TRUE_FALSE", question: "True or False: Your nephew is your brother's son.", correctAnswer: "true", explanation: "Your nephew is your brother's or sister's son." },
          { type: "FILL_BLANK", question: "Complete: My father's mother is my ___", correctAnswer: "grandmother", explanation: "Your father's mother is your grandmother." },
          { type: "FILL_BLANK", question: "Complete: My mother's brother is my ___", correctAnswer: "uncle", explanation: "Your mother's brother is your uncle." },
          { type: "FILL_BLANK", question: "Complete: My uncle's son is my ___", correctAnswer: "cousin", explanation: "Your uncle's child is your cousin." },
          { type: "MATCHING", question: "Match extended family:", options: [{ left: "Grandfather", right: "Parent's father" }, { left: "Uncle", right: "Parent's brother" }, { left: "Aunt", right: "Parent's sister" }, { left: "Cousin", right: "Uncle's child" }], correctAnswer: "[0,1,2,3]", explanation: "Each term matches its relationship." },
          { type: "CHECKBOX", question: "Select all extended family:", options: ["Grandmother", "Cousin", "Mother", "Uncle"], correctAnswer: "[0,1,3]", explanation: "Grandmother, cousin, and uncle are extended family. Mother is immediate." },
          { type: "SPEECH", question: "My grandfather lives in the village. He is very kind.", correctAnswer: "My grandfather lives in the village. He is very kind.", language: "en", hint: "Talk about grandparents" },
        ]
      },
      {
        title: "Pronouns and People",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which pronoun is for a male?", options: ["He", "She", "It", "They"], correctAnswer: "0", explanation: "'He' is used for males." },
          { type: "MCQ", question: "Which pronoun is for a female?", options: ["She", "He", "It", "They"], correctAnswer: "0", explanation: "'She' is used for females." },
          { type: "MCQ", question: "Which pronoun is for things?", options: ["It", "He", "She", "They"], correctAnswer: "0", explanation: "'It' is used for things and animals." },
          { type: "MCQ", question: "Which pronoun is for multiple people?", options: ["They", "He", "She", "It"], correctAnswer: "0", explanation: "'They' is used for multiple people." },
          { type: "TRUE_FALSE", question: "True or False: 'His' means belonging to a male.", correctAnswer: "true", explanation: "'His' is the possessive pronoun for males." },
          { type: "TRUE_FALSE", question: "True or False: 'Her' is used for males.", correctAnswer: "false", explanation: "'Her' is used for females, not males." },
          { type: "FILL_BLANK", question: "Complete: John is tall. ___ is 25 years old.", correctAnswer: "He", explanation: "'He' refers to John (male)." },
          { type: "FILL_BLANK", question: "Complete: Sara is kind. ___ is my friend.", correctAnswer: "She", explanation: "'She' refers to Sara (female)." },
          { type: "FILL_BLANK", question: "Complete: The book is on the table. ___ is interesting.", correctAnswer: "It", explanation: "'It' refers to the book (thing)." },
          { type: "FILL_BLANK", question: "Complete: My parents are nice. ___ love me.", correctAnswer: "They", explanation: "'They' refers to multiple people." },
          { type: "MATCHING", question: "Match pronouns:", options: [{ left: "I", right: "Myself" }, { left: "You", right: "Person spoken to" }, { left: "He", right: "Male" }, { left: "She", right: "Female" }], correctAnswer: "[0,1,2,3]", explanation: "Each pronoun matches its reference." },
          { type: "CHECKBOX", question: "Select all subject pronouns:", options: ["He", "She", "His", "They"], correctAnswer: "[0,1,3]", explanation: "He, She, and They are subject pronouns. 'His' is possessive." },
          { type: "SPEECH", question: "He is my brother. She is my sister. They are my family.", correctAnswer: "He is my brother. She is my sister. They are my family.", language: "en", hint: "Use pronouns correctly" },
        ]
      },
      {
        title: "Possessives",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which shows possession for 'I'?", options: ["My", "Me", "I", "Mine"], correctAnswer: "0", explanation: "'My' shows possession for I." },
          { type: "MCQ", question: "Which shows possession for 'he'?", options: ["His", "He", "Him", "He's"], correctAnswer: "0", explanation: "'His' shows possession for he." },
          { type: "MCQ", question: "Which shows possession for 'she'?", options: ["Her", "She", "Hers", "She's"], correctAnswer: "0", explanation: "'Her' shows possession for she." },
          { type: "MCQ", question: "Which shows possession for 'they'?", options: ["Their", "They", "Them", "They're"], correctAnswer: "0", explanation: "'Their' shows possession for they." },
          { type: "TRUE_FALSE", question: "True or False: 'My book' means the book belongs to me.", correctAnswer: "true", explanation: "'My' shows possession." },
          { type: "TRUE_FALSE", question: "True or False: 'His' is used for females.", correctAnswer: "false", explanation: "'His' is used for males. 'Her' is for females." },
          { type: "FILL_BLANK", question: "Complete: This is ___ (I) pen.", correctAnswer: "my", explanation: "'My' is the possessive form of I." },
          { type: "FILL_BLANK", question: "Complete: That is ___ (she) bag.", correctAnswer: "her", explanation: "'Her' is the possessive form of she." },
          { type: "FILL_BLANK", question: "Complete: Those are ___ (they) shoes.", correctAnswer: "their", explanation: "'Their' is the possessive form of they." },
          { type: "FILL_BLANK", question: "Complete: ___ (he) name is Ahmed.", correctAnswer: "His", explanation: "'His name' means the name belonging to him." },
          { type: "MATCHING", question: "Match possessives:", options: [{ left: "I", right: "My" }, { left: "He", right: "His" }, { left: "She", right: "Her" }, { left: "They", right: "Their" }], correctAnswer: "[0,1,2,3]", explanation: "Each pronoun matches its possessive." },
          { type: "CHECKBOX", question: "Select all possessive adjectives:", options: ["My", "His", "Her", "They"], correctAnswer: "[0,1,2]", explanation: "My, His, and Her are possessive. 'They' is a subject pronoun." },
          { type: "SPEECH", question: "My mother, her sister, his brother, their house.", correctAnswer: "My mother, her sister, his brother, their house.", language: "en", hint: "Practice possessives" },
        ]
      },
      {
        title: "Describing People",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you describe someone who is not tall?", options: ["Short", "Thin", "Heavy", "Young"], correctAnswer: "0", explanation: "Short is the opposite of tall." },
          { type: "MCQ", question: "What word describes a person's age if they just started life?", options: ["Young", "Old", "Tall", "Short"], correctAnswer: "0", explanation: "Young describes someone who is not old." },
          { type: "MCQ", question: "How do you describe a person with long hair?", options: ["She has long hair", "She is long hair", "Her long hair", "Long hair she"], correctAnswer: "0", explanation: "'She has long hair' is correct." },
          { type: "MCQ", question: "Which describes physical appearance?", options: ["Tall", "Happy", "Smart", "Kind"], correctAnswer: "0", explanation: "'Tall' describes physical appearance. Happy, smart, and kind describe personality." },
          { type: "TRUE_FALSE", question: "True or False: 'He has blue eyes' describes appearance.", correctAnswer: "true", explanation: "Eye color is a physical description." },
          { type: "TRUE_FALSE", question: "True or False: 'She is beautiful' describes personality.", correctAnswer: "false", explanation: "'Beautiful' describes physical appearance, not personality." },
          { type: "FILL_BLANK", question: "Complete: She ___ (has) curly hair.", correctAnswer: "has", explanation: "'She has curly hair' describes her hair." },
          { type: "FILL_BLANK", question: "Complete: He ___ (is) tall and handsome.", correctAnswer: "is", explanation: "'He is tall' uses 'is' for description." },
          { type: "FILL_BLANK", question: "Complete: They have ___ eyes. (brown)", correctAnswer: "brown", explanation: "'They have brown eyes' describes eye color." },
          { type: "MATCHING", question: "Match descriptions:", options: [{ left: "Tall", right: "Height" }, { left: "Blonde", right: "Hair color" }, { left: "Slim", right: "Body shape" }, { left: "Blue eyes", right: "Eye color" }], correctAnswer: "[0,1,2,3]", explanation: "Each description matches its category." },
          { type: "CHECKBOX", question: "Select all appearance words:", options: ["Tall", "Blonde", "Happy", "Thin"], correctAnswer: "[0,1,3]", explanation: "Tall, blonde, and thin describe appearance. Happy describes emotion." },
          { type: "SPEECH", question: "My mother is tall. She has brown hair and blue eyes.", correctAnswer: "My mother is tall. She has brown hair and blue eyes.", language: "en", hint: "Describe someone" },
          { type: "ORDERING", question: "Put in order: tall / She / is / and / slim", correctAnswer: "She,is,tall,and,slim", explanation: "'She is tall and slim' is the correct order." },
        ]
      }
    ]
  },
  {
    title: "Food & Drink",
    lessons: [
      {
        title: "Basic Foods",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you eat in the morning?", options: ["Breakfast", "Lunch", "Dinner", "Supper"], correctAnswer: "0", explanation: "Breakfast is the morning meal." },
          { type: "MCQ", question: "What meal do you eat at midday?", options: ["Lunch", "Breakfast", "Dinner", "Snack"], correctAnswer: "0", explanation: "Lunch is eaten around midday." },
          { type: "MCQ", question: "What meal do you eat in the evening?", options: ["Dinner", "Breakfast", "Lunch", "Brunch"], correctAnswer: "0", explanation: "Dinner is the evening meal." },
          { type: "MCQ", question: "What is bread made from?", options: ["Flour", "Rice", "Milk", "Sugar"], correctAnswer: "0", explanation: "Bread is made from flour." },
          { type: "TRUE_FALSE", question: "True or False: Rice is a grain.", correctAnswer: "true", explanation: "Rice is a grain food." },
          { type: "TRUE_FALSE", question: "True or False: You eat dinner in the morning.", correctAnswer: "false", explanation: "Dinner is eaten in the evening, not morning." },
          { type: "FILL_BLANK", question: "Complete: I eat ___ (morning meal) at 7 AM.", correctAnswer: "breakfast", explanation: "Breakfast is the first meal of the day." },
          { type: "FILL_BLANK", question: "Complete: Eggs come from ___ (animal).", correctAnswer: "chickens", explanation: "Eggs come from chickens/hens." },
          { type: "FILL_BLANK", question: "Complete: Milk comes from ___ (animal).", correctAnswer: "cows", explanation: "Milk comes from cows." },
          { type: "MATCHING", question: "Match meals with times:", options: [{ left: "Breakfast", right: "Morning" }, { left: "Lunch", right: "Midday" }, { left: "Dinner", right: "Evening" }, { left: "Snack", right: "Between meals" }], correctAnswer: "[0,1,2,3]", explanation: "Each meal matches its time." },
          { type: "CHECKBOX", question: "Select all foods:", options: ["Bread", "Chair", "Rice", "Table"], correctAnswer: "[0,2]", explanation: "Bread and rice are foods. Chair and table are furniture." },
          { type: "SPEECH", question: "I eat bread, rice, and eggs every day.", correctAnswer: "I eat bread, rice, and eggs every day.", language: "en", hint: "Talk about food" },
        ]
      },
      {
        title: "Fruits and Vegetables",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is a fruit?", options: ["Apple", "Carrot", "Potato", "Onion"], correctAnswer: "0", explanation: "An apple is a fruit." },
          { type: "MCQ", question: "Which is a vegetable?", options: ["Carrot", "Banana", "Mango", "Orange"], correctAnswer: "0", explanation: "A carrot is a vegetable." },
          { type: "MCQ", question: "What color is a banana?", options: ["Yellow", "Red", "Green", "Blue"], correctAnswer: "0", explanation: "A banana is yellow when ripe." },
          { type: "MCQ", question: "Which fruit is red?", options: ["Strawberry", "Banana", "Orange", "Lemon"], correctAnswer: "0", explanation: "A strawberry is red." },
          { type: "TRUE_FALSE", question: "True or False: A tomato is a fruit.", correctAnswer: "true", explanation: "Scientifically, a tomato is a fruit." },
          { type: "TRUE_FALSE", question: "True or False: An orange is a vegetable.", correctAnswer: "false", explanation: "An orange is a fruit, not a vegetable." },
          { type: "FILL_BLANK", question: "Complete: I like to eat ___ (yellow fruit).", correctAnswer: "banana", explanation: "A banana is a yellow fruit." },
          { type: "FILL_BLANK", question: "Complete: A ___ is a red fruit. (strawberry)", correctAnswer: "strawberry", explanation: "A strawberry is red." },
          { type: "FILL_BLANK", question: "Complete: ___ is an orange fruit. (orange)", correctAnswer: "Orange", explanation: "An orange is orange." },
          { type: "MATCHING", question: "Match fruits with colors:", options: [{ left: "Apple", right: "Red/Green" }, { left: "Banana", right: "Yellow" }, { left: "Grapes", right: "Purple" }, { left: "Orange", right: "Orange" }], correctAnswer: "[0,1,2,3]", explanation: "Each fruit matches its typical color." },
          { type: "CHECKBOX", question: "Select all fruits:", options: ["Apple", "Potato", "Mango", "Grape"], correctAnswer: "[0,2,3]", explanation: "Apple, mango, and grape are fruits. Potato is a vegetable." },
          { type: "SPEECH", question: "I like apples, bananas, and oranges. They are healthy.", correctAnswer: "I like apples, bananas, and oranges. They are healthy.", language: "en", hint: "Talk about fruits you like" },
        ]
      },
      {
        title: "Drinks and Beverages",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which drink has caffeine?", options: ["Coffee", "Water", "Milk", "Juice"], correctAnswer: "0", explanation: "Coffee contains caffeine." },
          { type: "MCQ", question: "Which drink is white?", options: ["Milk", "Coffee", "Tea", "Juice"], correctAnswer: "0", explanation: "Milk is white." },
          { type: "MCQ", question: "Which drink comes from oranges?", options: ["Orange juice", "Apple juice", "Water", "Milk"], correctAnswer: "0", explanation: "Orange juice comes from oranges." },
          { type: "MCQ", question: "What is the healthiest drink?", options: ["Water", "Soda", "Coffee", "Beer"], correctAnswer: "0", explanation: "Water is the healthiest drink." },
          { type: "TRUE_FALSE", question: "True or False: Tea is made from leaves.", correctAnswer: "true", explanation: "Tea is made from tea leaves." },
          { type: "TRUE_FALSE", question: "True or False: Soda is a healthy drink.", correctAnswer: "false", explanation: "Soda contains sugar and is not healthy." },
          { type: "FILL_BLANK", question: "Complete: I drink ___ (hot drink) in the morning.", correctAnswer: "coffee", explanation: "Many people drink coffee in the morning." },
          { type: "FILL_BLANK", question: "Complete: Can I have a glass of ___? (water)", correctAnswer: "water", explanation: "Water is a common drink to order." },
          { type: "FILL_BLANK", question: "Complete: I like ___ (hot drink with milk).", correctAnswer: "tea", explanation: "Tea is often drunk with milk." },
          { type: "MATCHING", question: "Match drinks with descriptions:", options: [{ left: "Water", right: "Clear" }, { left: "Milk", right: "White" }, { left: "Coffee", right: "Brown" }, { left: "Orange juice", right: "Orange" }], correctAnswer: "[0,1,2,3]", explanation: "Each drink matches its color." },
          { type: "CHECKBOX", question: "Select all cold drinks:", options: ["Water", "Ice tea", "Hot coffee", "Cold juice"], correctAnswer: "[0,1,3]", explanation: "Water, ice tea, and cold juice are cold. Hot coffee is hot." },
          { type: "SPEECH", question: "I drink water every day. Sometimes I drink tea.", correctAnswer: "I drink water every day. Sometimes I drink tea.", language: "en", hint: "Talk about drinks" },
        ]
      },
      {
        title: "At a Restaurant",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you say to order food?", options: ["I would like a burger, please", "Give me burger", "I want burger now", "Burger please give"], correctAnswer: "0", explanation: "'I would like...' is polite for ordering." },
          { type: "MCQ", question: "Who brings your food at a restaurant?", options: ["Waiter/Waitress", "Driver", "Teacher", "Doctor"], correctAnswer: "0", explanation: "A waiter or waitress brings food." },
          { type: "MCQ", question: "What do you ask for when you finish eating?", options: ["The bill, please", "The food, please", "The menu, please", "The water, please"], correctAnswer: "0", explanation: "'The bill, please' asks for payment." },
          { type: "MCQ", question: "What is a list of foods at a restaurant?", options: ["Menu", "Bill", "Table", "Order"], correctAnswer: "0", explanation: "A menu lists the food available." },
          { type: "TRUE_FALSE", question: "True or False: A tip is extra money for good service.", correctAnswer: "true", explanation: "A tip rewards good service." },
          { type: "TRUE_FALSE", question: "True or False: You pay before you order.", correctAnswer: "false", explanation: "You order first, then pay." },
          { type: "FILL_BLANK", question: "Complete: Can I see the ___? (list of food)", correctAnswer: "menu", explanation: "The menu shows available food." },
          { type: "FILL_BLANK", question: "Complete: I would ___ a salad, please.", correctAnswer: "like", explanation: "'I would like...' is polite for ordering." },
          { type: "FILL_BLANK", question: "Complete: Can I have the ___? (payment request)", correctAnswer: "bill", explanation: "'The bill' is the payment request." },
          { type: "MATCHING", question: "Match restaurant words:", options: [{ left: "Menu", right: "Food list" }, { left: "Waiter", right: "Server" }, { left: "Bill", right: "Payment" }, { left: "Tip", right: "Extra money" }], correctAnswer: "[0,1,2,3]", explanation: "Each word matches its meaning." },
          { type: "CHECKBOX", question: "Select all polite ordering phrases:", options: ["I would like", "Can I have", "Give me now", "Please may I have"], correctAnswer: "[0,1,3]", explanation: "The first, second, and fourth are polite. 'Give me now' is rude." },
          { type: "SPEECH", question: "Can I have a glass of water and a chicken salad, please?", correctAnswer: "Can I have a glass of water and a chicken salad, please?", language: "en", hint: "Order food politely" },
        ]
      },
      {
        title: "Review: Food & Drink",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the first meal of the day?", options: ["Breakfast", "Lunch", "Dinner", "Snack"], correctAnswer: "0", explanation: "Breakfast is the first meal." },
          { type: "MCQ", question: "Which is a fruit?", options: ["Mango", "Carrot", "Potato", "Rice"], correctAnswer: "0", explanation: "Mango is a fruit." },
          { type: "MCQ", question: "Which drink is healthy?", options: ["Water", "Soda", "Beer", "Energy drink"], correctAnswer: "0", explanation: "Water is the healthiest drink." },
          { type: "MCQ", question: "What do you say to order food?", options: ["I would like...", "Give me...", "I want...", "Bring me..."], correctAnswer: "0", explanation: "'I would like...' is the most polite." },
          { type: "TRUE_FALSE", question: "True or False: Milk comes from cows.", correctAnswer: "true", explanation: "Milk comes from cows." },
          { type: "TRUE_FALSE", question: "True or False: Dinner is eaten in the morning.", correctAnswer: "false", explanation: "Dinner is eaten in the evening." },
          { type: "FILL_BLANK", question: "Complete: I eat ___ at noon. (midday meal)", correctAnswer: "lunch", explanation: "Lunch is the midday meal." },
          { type: "FILL_BLANK", question: "Complete: An apple is a ___ (fruit/vegetable).", correctAnswer: "fruit", explanation: "An apple is a fruit." },
          { type: "FILL_BLANK", question: "Complete: Can I have the ___? (restaurant payment)", correctAnswer: "bill", explanation: "'The bill' asks for payment at a restaurant." },
          { type: "MATCHING", question: "Match foods with categories:", options: [{ left: "Apple", right: "Fruit" }, { left: "Carrot", right: "Vegetable" }, { left: "Milk", right: "Drink" }, { left: "Bread", right: "Grain" }], correctAnswer: "[0,1,2,3]", explanation: "Each food matches its category." },
          { type: "CHECKBOX", question: "Select all breakfast items:", options: ["Eggs", "Cereal", "Soup", "Toast"], correctAnswer: "[0,1,3]", explanation: "Eggs, cereal, and toast are breakfast items. Soup is not typically breakfast." },
          { type: "SPEECH", question: "For breakfast, I eat bread and eggs. I drink tea.", correctAnswer: "For breakfast, I eat bread and eggs. I drink tea.", language: "en", hint: "Talk about your breakfast" },
        ]
      }
    ]
  },
  {
    title: "Home & Daily Routine",
    lessons: [
      {
        title: "Parts of the House",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Where do you sleep?", options: ["Bedroom", "Kitchen", "Bathroom", "Garage"], correctAnswer: "0", explanation: "You sleep in the bedroom." },
          { type: "MCQ", question: "Where do you cook food?", options: ["Kitchen", "Bedroom", "Living room", "Bathroom"], correctAnswer: "0", explanation: "You cook in the kitchen." },
          { type: "MCQ", question: "Where do you watch TV?", options: ["Living room", "Bathroom", "Kitchen", "Garage"], correctAnswer: "0", explanation: "People usually watch TV in the living room." },
          { type: "MCQ", question: "Where do you take a shower?", options: ["Bathroom", "Kitchen", "Bedroom", "Living room"], correctAnswer: "0", explanation: "You take a shower in the bathroom." },
          { type: "TRUE_FALSE", question: "True or False: You eat in the kitchen or dining room.", correctAnswer: "true", explanation: "Meals are eaten in the kitchen or dining room." },
          { type: "TRUE_FALSE", question: "True or False: The garage is where you cook.", correctAnswer: "false", explanation: "The garage is for cars, not cooking." },
          { type: "FILL_BLANK", question: "Complete: I sleep in the ___", correctAnswer: "bedroom", explanation: "The bedroom is for sleeping." },
          { type: "FILL_BLANK", question: "Complete: We cook in the ___", correctAnswer: "kitchen", explanation: "The kitchen is for cooking." },
          { type: "FILL_BLANK", question: "Complete: I wash my hands in the ___", correctAnswer: "bathroom", explanation: "The bathroom has a sink for washing." },
          { type: "MATCHING", question: "Match rooms with activities:", options: [{ left: "Kitchen", right: "Cooking" }, { left: "Bedroom", right: "Sleeping" }, { left: "Living room", right: "Relaxing" }, { left: "Bathroom", right: "Washing" }], correctAnswer: "[0,1,2,3]", explanation: "Each room matches its main activity." },
          { type: "CHECKBOX", question: "Select all rooms in a house:", options: ["Kitchen", "Bedroom", "Hospital", "Bathroom"], correctAnswer: "[0,1,3]", explanation: "Kitchen, bedroom, and bathroom are house rooms. Hospital is not." },
          { type: "SPEECH", question: "My house has a kitchen, a bedroom, and a bathroom.", correctAnswer: "My house has a kitchen, a bedroom, and a bathroom.", language: "en", hint: "Describe your house" },
          { type: "ORDERING", question: "Put in order: bathroom / kitchen / bedroom / living room", hint: "Alphabetical", correctAnswer: "bathroom,bedroom,kitchen,living room", explanation: "Alphabetical: bathroom, bedroom, kitchen, living room." },
        ]
      },
      {
        title: "Furniture and Objects",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you sleep on?", options: ["Bed", "Table", "Chair", "Sofa"], correctAnswer: "0", explanation: "You sleep on a bed." },
          { type: "MCQ", question: "What do you sit on?", options: ["Chair", "Bed", "Table", "Fridge"], correctAnswer: "0", explanation: "You sit on a chair." },
          { type: "MCQ", question: "What do you eat food on?", options: ["Table", "Bed", "Chair", "Door"], correctAnswer: "0", explanation: "You eat food on a table." },
          { type: "MCQ", question: "What keeps food cold?", options: ["Refrigerator", "Oven", "Table", "Chair"], correctAnswer: "0", explanation: "A refrigerator keeps food cold." },
          { type: "TRUE_FALSE", question: "True or False: A sofa is furniture.", correctAnswer: "true", explanation: "A sofa is a piece of furniture." },
          { type: "TRUE_FALSE", question: "True or False: A window is furniture.", correctAnswer: "false", explanation: "A window is part of the house, not furniture." },
          { type: "FILL_BLANK", question: "Complete: I sit on the ___ in the living room.", correctAnswer: "sofa", explanation: "A sofa is seating furniture in the living room." },
          { type: "FILL_BLANK", question: "Complete: I put clothes in the ___", correctAnswer: "closet", explanation: "A closet stores clothes." },
          { type: "FILL_BLANK", question: "Complete: I cook on the ___ (cooking appliance).", correctAnswer: "stove", explanation: "A stove is used for cooking." },
          { type: "MATCHING", question: "Match furniture with rooms:", options: [{ left: "Bed", right: "Bedroom" }, { left: "Sofa", right: "Living room" }, { left: "Stove", right: "Kitchen" }, { left: "Sink", right: "Bathroom" }], correctAnswer: "[0,1,2,3]", explanation: "Each furniture piece matches its room." },
          { type: "CHECKBOX", question: "Select all furniture:", options: ["Bed", "Door", "Table", "Chair"], correctAnswer: "[0,2,3]", explanation: "Bed, table, and chair are furniture. Door is part of the house." },
          { type: "SPEECH", question: "In my bedroom, I have a bed, a closet, and a table.", correctAnswer: "In my bedroom, I have a bed, a closet, and a table.", language: "en", hint: "Describe furniture in your room" },
        ]
      },
      {
        title: "Morning Routine",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you do first in the morning?", options: ["Wake up", "Go to bed", "Eat dinner", "Sleep"], correctAnswer: "0", explanation: "You wake up first in the morning." },
          { type: "MCQ", question: "What do you use to clean your teeth?", options: ["Toothbrush", "Comb", "Towel", "Soap"], correctAnswer: "0", explanation: "A toothbrush cleans teeth." },
          { type: "MCQ", question: "What do you use to wash your body?", options: ["Soap", "Toothpaste", "Shampoo", "Cream"], correctAnswer: "0", explanation: "Soap is used to wash the body." },
          { type: "MCQ", question: "What do you do after waking up?", options: ["Get out of bed", "Go to sleep", "Eat dinner", "Watch TV"], correctAnswer: "0", explanation: "You get out of bed after waking up." },
          { type: "TRUE_FALSE", question: "True or False: You brush your teeth in the morning.", correctAnswer: "true", explanation: "Brushing teeth is a morning routine." },
          { type: "TRUE_FALSE", question: "True or False: You eat breakfast at night.", correctAnswer: "false", explanation: "Breakfast is eaten in the morning." },
          { type: "FILL_BLANK", question: "Complete: I ___ up at 7 AM.", correctAnswer: "wake", explanation: "'Wake up' means to stop sleeping." },
          { type: "FILL_BLANK", question: "Complete: I ___ my face every morning.", correctAnswer: "wash", explanation: "Washing your face is a morning habit." },
          { type: "FILL_BLANK", question: "Complete: I ___ dressed after my shower.", correctAnswer: "get", explanation: "'Get dressed' means to put on clothes." },
          { type: "MATCHING", question: "Match morning actions:", options: [{ left: "Wake up", right: "Stop sleeping" }, { left: "Brush teeth", right: "Clean teeth" }, { left: "Get dressed", right: "Put on clothes" }, { left: "Eat breakfast", right: "Morning meal" }], correctAnswer: "[0,1,2,3]", explanation: "Each action matches its meaning." },
          { type: "CHECKBOX", question: "Select all morning activities:", options: ["Wake up", "Brush teeth", "Eat breakfast", "Go to bed"], correctAnswer: "[0,1,2]", explanation: "Wake up, brush teeth, and eat breakfast are morning activities. Going to bed is at night." },
          { type: "SPEECH", question: "I wake up at 7. I brush my teeth and eat breakfast.", correctAnswer: "I wake up at 7. I brush my teeth and eat breakfast.", language: "en", hint: "Describe your morning" },
          { type: "ORDERING", question: "Put in order: eat breakfast / wake up / brush teeth / get dressed", hint: "Morning sequence", correctAnswer: "wake up,brush teeth,get dressed,eat breakfast", explanation: "Wake up first, then brush teeth, get dressed, then eat." },
        ]
      },
      {
        title: "Daily Activities",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Where do children go during the day?", options: ["School", "Bed", "Restaurant", "Cinema"], correctAnswer: "0", explanation: "Children go to school during the day." },
          { type: "MCQ", question: "Where do adults go to work?", options: ["Office", "School", "Park", "Bedroom"], correctAnswer: "0", explanation: "Adults go to the office to work." },
          { type: "MCQ", question: "What do you do at lunch time?", options: ["Eat", "Sleep", "Study", "Work"], correctAnswer: "0", explanation: "You eat at lunch time." },
          { type: "MCQ", question: "What do you do in the evening at home?", options: ["Relax", "Go to school", "Work", "Study"], correctAnswer: "0", explanation: "People usually relax in the evening at home." },
          { type: "TRUE_FALSE", question: "True or False: You go to school at night.", correctAnswer: "false", explanation: "School is during the day, not at night." },
          { type: "TRUE_FALSE", question: "True or False: You eat dinner in the evening.", correctAnswer: "true", explanation: "Dinner is the evening meal." },
          { type: "FILL_BLANK", question: "Complete: I go to ___ (place for learning) during the day.", correctAnswer: "school", explanation: "School is where you learn." },
          { type: "FILL_BLANK", question: "Complete: I come ___ (direction) home after school.", correctAnswer: "back", explanation: "'Come back home' means return home." },
          { type: "FILL_BLANK", question: "Complete: I ___ (rest) in the evening.", correctAnswer: "relax", explanation: "People relax in the evening." },
          { type: "MATCHING", question: "Match activities with times:", options: [{ left: "Go to school", right: "Morning" }, { left: "Eat lunch", right: "Midday" }, { left: "Go home", right: "Afternoon" }, { left: "Watch TV", right: "Evening" }], correctAnswer: "[0,1,2,3]", explanation: "Each activity matches its typical time." },
          { type: "CHECKBOX", question: "Select all daytime activities:", options: ["Go to school", "Eat lunch", "Go to bed", "Go to work"], correctAnswer: "[0,1,3]", explanation: "School, lunch, and work are daytime. Bed is nighttime." },
          { type: "SPEECH", question: "I go to school in the morning. I come home in the afternoon.", correctAnswer: "I go to school in the morning. I come home in the afternoon.", language: "en", hint: "Talk about your day" },
        ]
      },
      {
        title: "Review: Home & Daily Routine",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Where do you cook?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correctAnswer: "0", explanation: "Cooking is done in the kitchen." },
          { type: "MCQ", question: "What do you sleep on?", options: ["Bed", "Table", "Chair", "Sofa"], correctAnswer: "0", explanation: "You sleep on a bed." },
          { type: "MCQ", question: "What is the first thing you do in the morning?", options: ["Wake up", "Eat dinner", "Go to bed", "Watch TV"], correctAnswer: "0", explanation: "Waking up is the first morning action." },
          { type: "MCQ", question: "What do you use to clean your teeth?", options: ["Toothbrush", "Soap", "Towel", "Comb"], correctAnswer: "0", explanation: "A toothbrush cleans teeth." },
          { type: "TRUE_FALSE", question: "True or False: The living room is for cooking.", correctAnswer: "false", explanation: "The living room is for relaxing, not cooking." },
          { type: "TRUE_FALSE", question: "True or False: You eat dinner in the evening.", correctAnswer: "true", explanation: "Dinner is the evening meal." },
          { type: "FILL_BLANK", question: "Complete: I wash my hands in the ___", correctAnswer: "bathroom", explanation: "The bathroom has a sink." },
          { type: "FILL_BLANK", question: "Complete: I ___ dressed after my shower.", correctAnswer: "get", explanation: "'Get dressed' means put on clothes." },
          { type: "FILL_BLANK", question: "Complete: I keep my clothes in the ___", correctAnswer: "closet", explanation: "A closet stores clothes." },
          { type: "MATCHING", question: "Match rooms with activities:", options: [{ left: "Kitchen", right: "Cooking" }, { left: "Bedroom", right: "Sleeping" }, { left: "Bathroom", right: "Washing" }, { left: "Living room", right: "Watching TV" }], correctAnswer: "[0,1,2,3]", explanation: "Each room matches its activity." },
          { type: "CHECKBOX", question: "Select all morning routine items:", options: ["Wake up", "Brush teeth", "Eat breakfast", "Go to bed"], correctAnswer: "[0,1,2]", explanation: "Wake up, brush teeth, and eat breakfast are morning routine." },
          { type: "SPEECH", question: "I wake up, wash my face, and eat breakfast every morning.", correctAnswer: "I wake up, wash my face, and eat breakfast every morning.", language: "en", hint: "Describe your routine" },
          { type: "ORDERING", question: "Put in order: go to bed / eat dinner / eat lunch / wake up", hint: "Daily sequence", correctAnswer: "wake up,eat lunch,eat dinner,go to bed", explanation: "Morning: wake up. Midday: lunch. Evening: dinner. Night: bed." },
        ]
      }
    ]
  },
  {
    title: "Places in Town & Directions",
    lessons: [
      {
        title: "City Places",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Where do you buy food?", options: ["Supermarket", "Library", "Hospital", "School"], correctAnswer: "0", explanation: "A supermarket sells food." },
          { type: "MCQ", question: "Where do you borrow books?", options: ["Library", "Hospital", "Bank", "Park"], correctAnswer: "0", explanation: "A library lends books." },
          { type: "MCQ", question: "Where do you go when you are sick?", options: ["Hospital", "School", "Park", "Restaurant"], correctAnswer: "0", explanation: "You go to a hospital when sick." },
          { type: "MCQ", question: "Where do you keep your money?", options: ["Bank", "School", "Park", "Library"], correctAnswer: "0", explanation: "A bank stores money." },
          { type: "TRUE_FALSE", question: "True or False: A restaurant is where you eat.", correctAnswer: "true", explanation: "Restaurants serve food." },
          { type: "TRUE_FALSE", question: "True or False: A park is where you work.", correctAnswer: "false", explanation: "A park is for relaxation, not work." },
          { type: "FILL_BLANK", question: "Complete: I buy medicine at the ___", correctAnswer: "pharmacy", explanation: "A pharmacy sells medicine." },
          { type: "FILL_BLANK", question: "Complete: Children go to ___ to learn.", correctAnswer: "school", explanation: "School is for learning." },
          { type: "FILL_BLANK", question: "Complete: I exercise at the ___ (place with equipment).", correctAnswer: "gym", explanation: "A gym is for exercise." },
          { type: "MATCHING", question: "Match places with services:", options: [{ left: "Hospital", right: "Health" }, { left: "School", right: "Education" }, { left: "Bank", right: "Money" }, { left: "Library", right: "Books" }], correctAnswer: "[0,1,2,3]", explanation: "Each place matches its service." },
          { type: "CHECKBOX", question: "Select all places in a city:", options: ["Hospital", "School", "Moon", "Bank"], correctAnswer: "[0,1,3]", explanation: "Hospital, school, and bank are city places. Moon is not." },
          { type: "SPEECH", question: "I go to the supermarket and the library every week.", correctAnswer: "I go to the supermarket and the library every week.", language: "en", hint: "Talk about city places" },
        ]
      },
      {
        title: "Asking for Directions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you ask for directions?", options: ["Excuse me, where is the bank?", "Give me the bank", "I want bank now", "Bank where?"], correctAnswer: "0", explanation: "'Excuse me, where is...?' is polite for asking directions." },
          { type: "MCQ", question: "What does 'Turn left' mean?", options: ["Go to the left side", "Go to the right side", "Go straight", "Go back"], correctAnswer: "0", explanation: "'Turn left' means go to the left." },
          { type: "MCQ", question: "What does 'Go straight' mean?", options: ["Continue forward", "Turn left", "Turn right", "Stop"], correctAnswer: "0", explanation: "'Go straight' means continue in the same direction." },
          { type: "MCQ", question: "What does 'next to' mean?", options: ["Beside", "Far from", "Inside", "Behind"], correctAnswer: "0", explanation: "'Next to' means beside or adjacent to." },
          { type: "TRUE_FALSE", question: "True or False: 'Across from' means on the opposite side.", correctAnswer: "true", explanation: "'Across from' means on the opposite side of the street." },
          { type: "TRUE_FALSE", question: "True or False: 'Turn right' is the same as 'Turn left.'", correctAnswer: "false", explanation: "Right and left are opposite directions." },
          { type: "FILL_BLANK", question: "Complete: ___ me, where is the hospital?", correctAnswer: "Excuse", explanation: "'Excuse me' is a polite way to start." },
          { type: "FILL_BLANK", question: "Complete: Go ___ (forward/continue) for two blocks.", correctAnswer: "straight", explanation: "'Go straight' means continue forward." },
          { type: "FILL_BLANK", question: "Complete: The bank is ___ to the school. (beside)", correctAnswer: "next", explanation: "'Next to' means beside." },
          { type: "MATCHING", question: "Match direction words:", options: [{ left: "Turn left", right: "Left direction" }, { left: "Turn right", right: "Right direction" }, { left: "Go straight", right: "Forward" }, { left: "Go back", right: "Return" }], correctAnswer: "[0,1,2,3]", explanation: "Each direction word matches its meaning." },
          { type: "CHECKBOX", question: "Select all direction words:", options: ["Left", "Right", "Happy", "Straight"], correctAnswer: "[0,1,3]", explanation: "Left, right, and straight are direction words. Happy is not." },
          { type: "SPEECH", question: "Excuse me, where is the library? Go straight and turn left.", correctAnswer: "Excuse me, where is the library? Go straight and turn left.", language: "en", hint: "Ask and give directions" },
        ]
      },
      {
        title: "Prepositions of Place",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "The book is ___ the table. (on top)", options: ["on", "under", "in", "behind"], correctAnswer: "0", explanation: "'On' means on top of." },
          { type: "MCQ", question: "The cat is ___ the bed. (below)", options: ["under", "on", "above", "beside"], correctAnswer: "0", explanation: "'Under' means below." },
          { type: "MCQ", question: "The milk is ___ the fridge. (inside)", options: ["in", "on", "under", "beside"], correctAnswer: "0", explanation: "'In' means inside." },
          { type: "MCQ", question: "The chair is ___ the table. (at the side)", options: ["next to", "on", "under", "in"], correctAnswer: "0", explanation: "'Next to' means at the side of." },
          { type: "TRUE_FALSE", question: "True or False: 'Behind' means in front of.", correctAnswer: "false", explanation: "'Behind' means at the back of, not in front." },
          { type: "TRUE_FALSE", question: "True or False: 'Between' means in the middle of two things.", correctAnswer: "true", explanation: "'Between' means in the middle of two things." },
          { type: "FILL_BLANK", question: "Complete: The picture is ___ the wall.", correctAnswer: "on", explanation: "Pictures hang on walls." },
          { type: "FILL_BLANK", question: "Complete: The shoes are ___ the bed.", correctAnswer: "under", explanation: "Shoes are often stored under the bed." },
          { type: "FILL_BLANK", question: "Complete: The school is ___ the bank and the hospital. (in the middle)", correctAnswer: "between", explanation: "'Between' means in the middle." },
          { type: "MATCHING", question: "Match prepositions:", options: [{ left: "On", right: "Top" }, { left: "Under", right: "Below" }, { left: "In", right: "Inside" }, { left: "Next to", right: "Beside" }], correctAnswer: "[0,1,2,3]", explanation: "Each preposition matches its meaning." },
          { type: "CHECKBOX", question: "Select all prepositions of place:", options: ["On", "Under", "Quickly", "In"], correctAnswer: "[0,1,3]", explanation: "On, under, and in are prepositions. Quickly is an adverb." },
          { type: "SPEECH", question: "The book is on the table. The cat is under the chair.", correctAnswer: "The book is on the table. The cat is under the chair.", language: "en", hint: "Use prepositions correctly" },
        ]
      },
      {
        title: "Transportation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What flies in the sky?", options: ["Airplane", "Car", "Bus", "Train"], correctAnswer: "0", explanation: "An airplane flies in the sky." },
          { type: "MCQ", question: "What runs on tracks?", options: ["Train", "Car", "Bicycle", "Boat"], correctAnswer: "0", explanation: "A train runs on tracks." },
          { type: "MCQ", question: "What travels on water?", options: ["Boat", "Car", "Bus", "Train"], correctAnswer: "0", explanation: "A boat travels on water." },
          { type: "MCQ", question: "What is public transport in a city?", options: ["Bus", "Airplane", "Ship", "Helicopter"], correctAnswer: "0", explanation: "A bus is common city public transport." },
          { type: "TRUE_FALSE", question: "True or False: A bicycle has two wheels.", correctAnswer: "true", explanation: "A bicycle has two wheels." },
          { type: "TRUE_FALSE", question: "True or False: A car runs on water.", correctAnswer: "false", explanation: "Cars run on fuel/electricity, not water." },
          { type: "FILL_BLANK", question: "Complete: I go to school by ___ (two-wheeled vehicle).", correctAnswer: "bicycle", explanation: "A bicycle has two wheels." },
          { type: "FILL_BLANK", question: "Complete: I take the ___ to work. (public transport)", correctAnswer: "bus", explanation: "Many people take the bus to work." },
          { type: "FILL_BLANK", question: "Complete: A ___ flies in the sky.", correctAnswer: "plane", explanation: "A plane/airplane flies." },
          { type: "MATCHING", question: "Match transport with location:", options: [{ left: "Car", right: "Road" }, { left: "Train", right: "Tracks" }, { left: "Boat", right: "Water" }, { left: "Airplane", right: "Sky" }], correctAnswer: "[0,1,2,3]", explanation: "Each transport matches its location." },
          { type: "CHECKBOX", question: "Select all types of transport:", options: ["Bus", "Train", "Table", "Bicycle"], correctAnswer: "[0,1,3]", explanation: "Bus, train, and bicycle are transport. Table is furniture." },
          { type: "SPEECH", question: "I go to work by bus. Sometimes I take a train.", correctAnswer: "I go to work by bus. Sometimes I take a train.", language: "en", hint: "Talk about transport" },
        ]
      },
      {
        title: "Review: Places & Directions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Where do you borrow books?", options: ["Library", "Bank", "Hospital", "Park"], correctAnswer: "0", explanation: "A library lends books." },
          { type: "MCQ", question: "What does 'Turn left' mean?", options: ["Go left", "Go right", "Go straight", "Stop"], correctAnswer: "0", explanation: "'Turn left' means go to the left." },
          { type: "MCQ", question: "The book is ___ the table.", options: ["on", "under", "in", "behind"], correctAnswer: "0", explanation: "Books are placed on tables." },
          { type: "MCQ", question: "What flies in the sky?", options: ["Airplane", "Car", "Bus", "Train"], correctAnswer: "0", explanation: "An airplane flies." },
          { type: "TRUE_FALSE", question: "True or False: A hospital is for health.", correctAnswer: "true", explanation: "Hospitals provide health care." },
          { type: "TRUE_FALSE", question: "True or False: 'Between' means at the side.", correctAnswer: "false", explanation: "'Between' means in the middle, not at the side." },
          { type: "FILL_BLANK", question: "Complete: I buy food at the ___", correctAnswer: "supermarket", explanation: "Supermarkets sell food." },
          { type: "FILL_BLANK", question: "Complete: Go ___ (forward) for two blocks.", correctAnswer: "straight", explanation: "'Go straight' means continue forward." },
          { type: "FILL_BLANK", question: "Complete: The cat is ___ (below) the table.", correctAnswer: "under", explanation: "'Under' means below." },
          { type: "MATCHING", question: "Match places:", options: [{ left: "Bank", right: "Money" }, { left: "School", right: "Learning" }, { left: "Hospital", right: "Health" }, { left: "Park", right: "Recreation" }], correctAnswer: "[0,1,2,3]", explanation: "Each place matches its purpose." },
          { type: "CHECKBOX", question: "Select all transport types:", options: ["Bus", "Train", "Chair", "Bicycle"], correctAnswer: "[0,1,3]", explanation: "Bus, train, and bicycle are transport. Chair is furniture." },
          { type: "SPEECH", question: "Excuse me, where is the bank? Go straight and turn right.", correctAnswer: "Excuse me, where is the bank? Go straight and turn right.", language: "en", hint: "Ask for and give directions" },
          { type: "ORDERING", question: "Put in order: turn right / go straight / stop / turn left", correctAnswer: "go straight,turn left,turn right,stop", explanation: "Move first, then turn, then stop." },
        ]
      }
    ]
  },
  {
    title: "Grammar Foundations",
    lessons: [
      {
        title: "To Be: Am, Is, Are",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I am happy", "I is happy", "I are happy", "I be happy"], correctAnswer: "0", explanation: "'I am' is correct for the subject I." },
          { type: "MCQ", question: "Which is correct for 'he'?", options: ["He is tall", "He am tall", "He are tall", "He be tall"], correctAnswer: "0", explanation: "'He is' is correct for he/she/it." },
          { type: "MCQ", question: "Which is correct for 'they'?", options: ["They are students", "They is students", "They am students", "They be students"], correctAnswer: "0", explanation: "'They are' is correct for plural subjects." },
          { type: "MCQ", question: "Which is correct?", options: ["She is a teacher", "She am a teacher", "She are a teacher", "She be a teacher"], correctAnswer: "0", explanation: "'She is' is correct for she." },
          { type: "TRUE_FALSE", question: "True or False: 'We are' is correct.", correctAnswer: "true", explanation: "'We are' is the correct form for 'we'." },
          { type: "TRUE_FALSE", question: "True or False: 'It is' is wrong.", correctAnswer: "false", explanation: "'It is' is correct for 'it'." },
          { type: "FILL_BLANK", question: "Complete: You ___ my friend.", correctAnswer: "are", explanation: "'You are' is correct for 'you'." },
          { type: "FILL_BLANK", question: "Complete: I ___ a student.", correctAnswer: "am", explanation: "'I am' is correct for 'I'." },
          { type: "FILL_BLANK", question: "Complete: She ___ very kind.", correctAnswer: "is", explanation: "'She is' is correct for 'she'." },
          { type: "MATCHING", question: "Match subjects with 'to be':", options: [{ left: "I", right: "am" }, { left: "He", right: "is" }, { left: "They", right: "are" }, { left: "You", right: "are" }], correctAnswer: "[0,1,2,3]", explanation: "Each subject matches its 'to be' form." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I am happy", "He is tall", "They is here", "She is kind"], correctAnswer: "[0,1,3]", explanation: "'They is' is wrong. It should be 'They are.'" },
          { type: "SPEECH", question: "I am a student. She is a teacher. They are friends.", correctAnswer: "I am a student. She is a teacher. They are friends.", language: "en", hint: "Practice 'to be'" },
          { type: "ORDERING", question: "Put in order: tall / is / He / very", correctAnswer: "He,is,very,tall", explanation: "'He is very tall' is correct." },
        ]
      },
      {
        title: "To Have: Have and Has",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I have a book", "I has a book", "I haves a book", "I am have a book"], correctAnswer: "0", explanation: "'I have' is correct for I/you/we/they." },
          { type: "MCQ", question: "Which is correct?", options: ["She has a car", "She have a car", "She haves a car", "She is have a car"], correctAnswer: "0", explanation: "'She has' is correct for he/she/it." },
          { type: "MCQ", question: "Which is correct?", options: ["They have a house", "They has a house", "They haves a house", "They is have a house"], correctAnswer: "0", explanation: "'They have' is correct for plural." },
          { type: "MCQ", question: "What does 'I have' mean?", options: ["I possess", "I am", "I do", "I go"], correctAnswer: "0", explanation: "'Have' means to possess or own." },
          { type: "TRUE_FALSE", question: "True or False: 'He has' is correct.", correctAnswer: "true", explanation: "'He has' is correct for he." },
          { type: "TRUE_FALSE", question: "True or False: 'She have' is correct.", correctAnswer: "false", explanation: "It should be 'She has,' not 'She have.'" },
          { type: "FILL_BLANK", question: "Complete: We ___ a big family.", correctAnswer: "have", explanation: "'We have' is correct for 'we'." },
          { type: "FILL_BLANK", question: "Complete: He ___ two sisters.", correctAnswer: "has", explanation: "'He has' is correct for 'he'." },
          { type: "FILL_BLANK", question: "Complete: I ___ a blue bag.", correctAnswer: "have", explanation: "'I have' is correct for 'I'." },
          { type: "MATCHING", question: "Match subjects with 'have/has':", options: [{ left: "I", right: "have" }, { left: "She", right: "has" }, { left: "We", right: "have" }, { left: "It", right: "has" }], correctAnswer: "[0,1,2,3]", explanation: "Each subject matches its form." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I have a pen", "She has a book", "He have a car", "They have time"], correctAnswer: "[0,1,3]", explanation: "'He have' is wrong. It should be 'He has.'" },
          { type: "SPEECH", question: "I have a brother. She has a sister. We have a big family.", correctAnswer: "I have a brother. She has a sister. We have a big family.", language: "en", hint: "Practice 'have/has'" },
        ]
      },
      {
        title: "Articles: A, An, The",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["a book", "an book", "the book", "Both a and the"], correctAnswer: "3", explanation: "Both 'a book' and 'the book' are correct." },
          { type: "MCQ", question: "Which is correct?", options: ["an apple", "a apple", "the apple", "Both an and the"], correctAnswer: "3", explanation: "Both 'an apple' and 'the apple' are correct." },
          { type: "MCQ", question: "When do we use 'an'?", options: ["Before vowel sounds", "Before consonants", "Before any word", "Never"], correctAnswer: "0", explanation: "'An' is used before words starting with vowel sounds." },
          { type: "MCQ", question: "When do we use 'the'?", options: ["For specific things", "For any thing", "Never", "Only for people"], correctAnswer: "0", explanation: "'The' refers to specific, known things." },
          { type: "TRUE_FALSE", question: "True or False: 'A' is used before consonant sounds.", correctAnswer: "true", explanation: "'A' is used before words starting with consonant sounds." },
          { type: "TRUE_FALSE", question: "True or False: 'An' is used before 'book.'", correctAnswer: "false", explanation: "It should be 'a book' because 'book' starts with a consonant." },
          { type: "FILL_BLANK", question: "Complete: I have ___ cat. (general)", correctAnswer: "a", explanation: "'A cat' refers to any cat." },
          { type: "FILL_BLANK", question: "Complete: She is ___ honest person.", correctAnswer: "an", explanation: "'An' is used because 'honest' starts with a vowel sound." },
          { type: "FILL_BLANK", question: "Complete: ___ sun is bright. (specific)", correctAnswer: "The", explanation: "'The sun' refers to our specific sun." },
          { type: "MATCHING", question: "Match article with usage:", options: [{ left: "A", right: "General (consonant)" }, { left: "An", right: "General (vowel)" }, { left: "The", right: "Specific" }, { left: "No article", right: "General plural" }], correctAnswer: "[0,1,2,3]", explanation: "Each article matches its usage." },
          { type: "CHECKBOX", question: "Select correct uses of 'an':", options: ["An apple", "An umbrella", "An book", "An orange"], correctAnswer: "[0,1,3]", explanation: "'An book' is wrong. It should be 'a book.'" },
          { type: "SPEECH", question: "I have a cat and an orange. The cat is cute.", correctAnswer: "I have a cat and an orange. The cat is cute.", language: "en", hint: "Practice articles" },
        ]
      },
      {
        title: "There Is / There Are",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["There is a book", "There are a book", "There is two books", "There be a book"], correctAnswer: "0", explanation: "'There is' is used for singular nouns." },
          { type: "MCQ", question: "Which is correct?", options: ["There are three cats", "There is three cats", "There are a cat", "There be three cats"], correctAnswer: "0", explanation: "'There are' is used for plural nouns." },
          { type: "MCQ", question: "What does 'There is' tell us?", options: ["Something exists (singular)", "Many things exist", "Action happening", "Past event"], correctAnswer: "0", explanation: "'There is' shows existence of one thing." },
          { type: "MCQ", question: "___ a pen on the table.", options: ["There is", "There are", "There be", "There am"], correctAnswer: "0", explanation: "'There is' because 'a pen' is singular." },
          { type: "TRUE_FALSE", question: "True or False: 'There are five students' is correct.", correctAnswer: "true", explanation: "'There are' is correct for plural (five students)." },
          { type: "TRUE_FALSE", question: "True or False: 'There is three books' is correct.", correctAnswer: "false", explanation: "It should be 'There are three books' (plural)." },
          { type: "FILL_BLANK", question: "Complete: There ___ a dog in the garden.", correctAnswer: "is", explanation: "'There is' for singular (a dog)." },
          { type: "FILL_BLANK", question: "Complete: There ___ two chairs in the room.", correctAnswer: "are", explanation: "'There are' for plural (two chairs)." },
          { type: "FILL_BLANK", question: "Complete: Is there ___ milk? (any/some)", correctAnswer: "any", explanation: "'Is there any milk?' for questions." },
          { type: "MATCHING", question: "Match sentence types:", options: [{ left: "There is a...", right: "Singular" }, { left: "There are many...", right: "Plural" }, { left: "Is there a...?", right: "Question" }, { left: "There isn't any...", right: "Negative" }], correctAnswer: "[0,1,2,3]", explanation: "Each type matches its form." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["There is a pen", "There are books", "There is three cats", "There are two dogs"], correctAnswer: "[0,1,3]", explanation: "'There is three cats' is wrong. Should be 'There are three cats.'" },
          { type: "SPEECH", question: "There is a table in the room. There are three chairs.", correctAnswer: "There is a table in the room. There are three chairs.", language: "en", hint: "Practice 'there is/are'" },
        ]
      },
      {
        title: "Review: Grammar Foundations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "I ___ happy.", options: ["am", "is", "are", "be"], correctAnswer: "0", explanation: "'I am' is correct." },
          { type: "MCQ", question: "She ___ a car.", options: ["has", "have", "haves", "is have"], correctAnswer: "0", explanation: "'She has' is correct." },
          { type: "MCQ", question: "I have ___ apple.", options: ["an", "a", "the", "two"], correctAnswer: "0", explanation: "'An apple' because apple starts with a vowel." },
          { type: "MCQ", question: "___ a book on the table.", options: ["There is", "There are", "There be", "There am"], correctAnswer: "0", explanation: "'There is' for singular." },
          { type: "TRUE_FALSE", question: "True or False: 'They are students' is correct.", correctAnswer: "true", explanation: "'They are' is correct for plural." },
          { type: "TRUE_FALSE", question: "True or False: 'He have a pen' is correct.", correctAnswer: "false", explanation: "Should be 'He has a pen.'" },
          { type: "FILL_BLANK", question: "Complete: You ___ my friend.", correctAnswer: "are", explanation: "'You are' is correct." },
          { type: "FILL_BLANK", question: "Complete: We ___ a big house.", correctAnswer: "have", explanation: "'We have' is correct for 'we.'" },
          { type: "FILL_BLANK", question: "Complete: ___ (specific) sun is hot.", correctAnswer: "The", explanation: "'The sun' refers to our specific sun." },
          { type: "MATCHING", question: "Match correct forms:", options: [{ left: "I", right: "am" }, { left: "She", right: "has" }, { left: "They", right: "are" }, { left: "There (plural)", right: "are" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its correct form." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I am tall", "She has a book", "There are two cats", "He have a car"], correctAnswer: "[0,1,2]", explanation: "'He have' is wrong. Should be 'He has.'" },
          { type: "SPEECH", question: "I am a student. I have a book. There is a desk in my room.", correctAnswer: "I am a student. I have a book. There is a desk in my room.", language: "en", hint: "Use grammar correctly" },
          { type: "ORDERING", question: "Put in order: is / There / book / a / table / the / on", correctAnswer: "There,is,a,book,on,the,table", explanation: "'There is a book on the table.'" },
        ]
      }
    ]
  },
  {
    title: "Hobbies, Weather & Shopping",
    lessons: [
      {
        title: "Sports and Hobbies",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What sport uses a ball and a net?", options: ["Basketball", "Swimming", "Running", "Cycling"], correctAnswer: "0", explanation: "Basketball uses a ball and net." },
          { type: "MCQ", question: "What sport is done in water?", options: ["Swimming", "Running", "Cycling", "Tennis"], correctAnswer: "0", explanation: "Swimming is done in water." },
          { type: "MCQ", question: "What do you use to play tennis?", options: ["Racket", "Bat", "Club", "Stick"], correctAnswer: "0", explanation: "Tennis uses a racket." },
          { type: "MCQ", question: "Which is a hobby?", options: ["Reading", "Sleeping", "Eating", "Breathing"], correctAnswer: "0", explanation: "Reading is a hobby. The others are basic needs." },
          { type: "TRUE_FALSE", question: "True or False: Football is played with a ball.", correctAnswer: "true", explanation: "Football uses a ball." },
          { type: "TRUE_FALSE", question: "True or False: Swimming is done on land.", correctAnswer: "false", explanation: "Swimming is done in water." },
          { type: "FILL_BLANK", question: "Complete: I like to play ___ (sport with feet and ball).", correctAnswer: "football", explanation: "Football is played with feet and a ball." },
          { type: "FILL_BLANK", question: "Complete: My hobby is ___ (reading books).", correctAnswer: "reading", explanation: "Reading is a popular hobby." },
          { type: "FILL_BLANK", question: "Complete: I ___ (use legs) every morning.", correctAnswer: "run", explanation: "Running is a common exercise." },
          { type: "MATCHING", question: "Match sports with equipment:", options: [{ left: "Football", right: "Ball" }, { left: "Tennis", right: "Racket" }, { left: "Swimming", right: "Pool" }, { left: "Cycling", right: "Bicycle" }], correctAnswer: "[0,1,2,3]", explanation: "Each sport matches its equipment." },
          { type: "CHECKBOX", question: "Select all sports:", options: ["Football", "Reading", "Swimming", "Tennis"], correctAnswer: "[0,2,3]", explanation: "Football, swimming, and tennis are sports. Reading is a hobby." },
          { type: "SPEECH", question: "I like football and swimming. They are fun.", correctAnswer: "I like football and swimming. They are fun.", language: "en", hint: "Talk about sports" },
        ]
      },
      {
        title: "Weather",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What falls from clouds?", options: ["Rain", "Sun", "Wind", "Heat"], correctAnswer: "0", explanation: "Rain falls from clouds." },
          { type: "MCQ", question: "What is hot and bright in the sky?", options: ["Sun", "Moon", "Cloud", "Rain"], correctAnswer: "0", explanation: "The sun is hot and bright." },
          { type: "MCQ", question: "What is cold and white in winter?", options: ["Snow", "Rain", "Sun", "Wind"], correctAnswer: "0", explanation: "Snow is cold and white." },
          { type: "MCQ", question: "What moves air?", options: ["Wind", "Rain", "Snow", "Sun"], correctAnswer: "0", explanation: "Wind is moving air." },
          { type: "TRUE_FALSE", question: "True or False: It is sunny when the sun shines.", correctAnswer: "true", explanation: "Sunny means the sun is shining." },
          { type: "TRUE_FALSE", question: "True or False: Snow is hot.", correctAnswer: "false", explanation: "Snow is cold, not hot." },
          { type: "FILL_BLANK", question: "Complete: It is ___ (water falling from sky).", correctAnswer: "raining", explanation: "'It is raining' describes rain." },
          { type: "FILL_BLANK", question: "Complete: It is ___ (cold white stuff in winter).", correctAnswer: "snowing", explanation: "'It is snowing' describes snow." },
          { type: "FILL_BLANK", question: "Complete: The weather is ___ (hot and sunny).", correctAnswer: "hot", explanation: "'Hot' describes warm weather." },
          { type: "MATCHING", question: "Match weather with descriptions:", options: [{ left: "Sunny", right: "Bright" }, { left: "Rainy", right: "Wet" }, { left: "Snowy", right: "Cold" }, { left: "Windy", right: "Air moving" }], correctAnswer: "[0,1,2,3]", explanation: "Each weather matches its description." },
          { type: "CHECKBOX", question: "Select all weather words:", options: ["Sunny", "Rainy", "Happy", "Windy"], correctAnswer: "[0,1,3]", explanation: "Sunny, rainy, and windy are weather. Happy is an emotion." },
          { type: "SPEECH", question: "Today is sunny and warm. I like this weather.", correctAnswer: "Today is sunny and warm. I like this weather.", language: "en", hint: "Describe the weather" },
        ]
      },
      {
        title: "Clothing",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you wear on your feet?", options: ["Shoes", "Hat", "Gloves", "Scarf"], correctAnswer: "0", explanation: "Shoes are worn on feet." },
          { type: "MCQ", question: "What do you wear on your head?", options: ["Hat", "Shoes", "Pants", "Shirt"], correctAnswer: "0", explanation: "A hat is worn on the head." },
          { type: "MCQ", question: "What do you wear in winter?", options: ["Coat", "Shorts", "T-shirt", "Sandals"], correctAnswer: "0", explanation: "A coat keeps you warm in winter." },
          { type: "MCQ", question: "What covers your upper body?", options: ["Shirt", "Pants", "Shoes", "Hat"], correctAnswer: "0", explanation: "A shirt covers the upper body." },
          { type: "TRUE_FALSE", question: "True or False: Gloves are worn on hands.", correctAnswer: "true", explanation: "Gloves keep hands warm." },
          { type: "TRUE_FALSE", question: "True or False: A scarf is worn on feet.", correctAnswer: "false", explanation: "A scarf is worn on the neck." },
          { type: "FILL_BLANK", question: "Complete: I wear ___ (leg clothing) to school.", correctAnswer: "pants", explanation: "Pants cover the legs." },
          { type: "FILL_BLANK", question: "Complete: In summer, I wear a ___ (light top).", correctAnswer: "t-shirt", explanation: "A t-shirt is light for summer." },
          { type: "FILL_BLANK", question: "Complete: It is cold. I wear a ___ (warm coat).", correctAnswer: "jacket", explanation: "A jacket keeps you warm." },
          { type: "MATCHING", question: "Match clothing with body parts:", options: [{ left: "Hat", right: "Head" }, { left: "Shirt", right: "Upper body" }, { left: "Shoes", right: "Feet" }, { left: "Gloves", right: "Hands" }], correctAnswer: "[0,1,2,3]", explanation: "Each clothing matches its body part." },
          { type: "CHECKBOX", question: "Select all clothing items:", options: ["Shirt", "Shoes", "Table", "Hat"], correctAnswer: "[0,1,3]", explanation: "Shirt, shoes, and hat are clothing. Table is furniture." },
          { type: "SPEECH", question: "I am wearing a blue shirt and black pants.", correctAnswer: "I am wearing a blue shirt and black pants.", language: "en", hint: "Describe your clothes" },
        ]
      },
      {
        title: "Shopping and Money",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you use to pay?", options: ["Money", "Water", "Food", "Book"], correctAnswer: "0", explanation: "Money is used to pay for things." },
          { type: "MCQ", question: "How much is $5 + $3?", options: ["$8", "$2", "$9", "$15"], correctAnswer: "0", explanation: "$5 + $3 = $8." },
          { type: "MCQ", question: "What do you say to ask the price?", options: ["How much is this?", "What is this?", "Where is this?", "Who is this?"], correctAnswer: "0", explanation: "'How much is this?' asks the price." },
          { type: "MCQ", question: "What is a place to buy clothes?", options: ["Clothing store", "Bank", "Hospital", "Library"], correctAnswer: "0", explanation: "A clothing store sells clothes." },
          { type: "TRUE_FALSE", question: "True or False: 'Cheap' means low price.", correctAnswer: "true", explanation: "Cheap means low cost." },
          { type: "TRUE_FALSE", question: "True or False: 'Expensive' means low price.", correctAnswer: "false", explanation: "Expensive means high cost, not low." },
          { type: "FILL_BLANK", question: "Complete: How ___ is this shirt? (asking price)", correctAnswer: "much", explanation: "'How much' asks about price." },
          { type: "FILL_BLANK", question: "Complete: I pay with a ___ card.", correctAnswer: "credit", explanation: "A credit card is used for payment." },
          { type: "FILL_BLANK", question: "Complete: This shirt is too ___ (high cost).", correctAnswer: "expensive", explanation: "'Expensive' means costs a lot." },
          { type: "MATCHING", question: "Match shopping words:", options: [{ left: "Cheap", right: "Low price" }, { left: "Expensive", right: "High price" }, { left: "Pay", right: "Give money" }, { left: "Receipt", right: "Proof of purchase" }], correctAnswer: "[0,1,2,3]", explanation: "Each word matches its meaning." },
          { type: "CHECKBOX", question: "Select all payment methods:", options: ["Cash", "Credit card", "Water", "Bank transfer"], correctAnswer: "[0,1,3]", explanation: "Cash, credit card, and bank transfer are payment methods." },
          { type: "SPEECH", question: "How much is this? It is five dollars. I will take it.", correctAnswer: "How much is this? It is five dollars. I will take it.", language: "en", hint: "Practice shopping dialogue" },
        ]
      },
      {
        title: "Review: Hobbies, Weather & Shopping",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What sport is done in water?", options: ["Swimming", "Running", "Tennis", "Football"], correctAnswer: "0", explanation: "Swimming is done in water." },
          { type: "MCQ", question: "What falls from clouds?", options: ["Rain", "Sun", "Wind", "Stars"], correctAnswer: "0", explanation: "Rain falls from clouds." },
          { type: "MCQ", question: "What do you wear on your feet?", options: ["Shoes", "Hat", "Shirt", "Gloves"], correctAnswer: "0", explanation: "Shoes are worn on feet." },
          { type: "MCQ", question: "What do you use to pay?", options: ["Money", "Food", "Water", "Book"], correctAnswer: "0", explanation: "Money is used for payment." },
          { type: "TRUE_FALSE", question: "True or False: Snow is cold.", correctAnswer: "true", explanation: "Snow is cold and white." },
          { type: "TRUE_FALSE", question: "True or False: 'Expensive' means cheap.", correctAnswer: "false", explanation: "Expensive means costly, the opposite of cheap." },
          { type: "FILL_BLANK", question: "Complete: I like to play ___ (sport with a ball).", correctAnswer: "football", explanation: "Football is a popular ball sport." },
          { type: "FILL_BLANK", question: "Complete: It is ___ (sunny). The sun is shining.", correctAnswer: "sunny", explanation: "'Sunny' means the sun is out." },
          { type: "FILL_BLANK", question: "Complete: I wear a ___ (head clothing) in the sun.", correctAnswer: "hat", explanation: "A hat protects from the sun." },
          { type: "MATCHING", question: "Match categories:", options: [{ left: "Football", right: "Sport" }, { left: "Rainy", right: "Weather" }, { left: "Shirt", right: "Clothing" }, { left: "Cash", right: "Payment" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its category." },
          { type: "CHECKBOX", question: "Select all clothing items:", options: ["Shirt", "Shoes", "Rain", "Hat"], correctAnswer: "[0,1,3]", explanation: "Shirt, shoes, and hat are clothing. Rain is weather." },
          { type: "SPEECH", question: "Today is sunny. I wear a hat and play football outside.", correctAnswer: "Today is sunny. I wear a hat and play football outside.", language: "en", hint: "Combine topics" },
          { type: "ORDERING", question: "Put in order: pay / ask the price / buy / choose", hint: "Shopping sequence", correctAnswer: "choose,ask the price,buy,pay", explanation: "First choose, then ask price, then buy and pay." },
        ]
      }
    ]
  },
  {
    title: "A1 Final Review",
    lessons: [
      {
        title: "Greetings and People Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you say in the morning?", options: ["Good morning", "Good night", "Goodbye", "See you"], correctAnswer: "0", explanation: "'Good morning' is the morning greeting." },
          { type: "MCQ", question: "How do you introduce yourself?", options: ["My name is Ali", "I name Ali", "Me name Ali", "Name my Ali"], correctAnswer: "0", explanation: "'My name is Ali' is correct." },
          { type: "MCQ", question: "Who is your father?", options: ["Your male parent", "Your female parent", "Your brother", "Your uncle"], correctAnswer: "0", explanation: "Your father is your male parent." },
          { type: "MCQ", question: "Which pronoun is for females?", options: ["She", "He", "It", "They"], correctAnswer: "0", explanation: "'She' is used for females." },
          { type: "TRUE_FALSE", question: "True or False: 'Thank you' shows gratitude.", correctAnswer: "true", explanation: "'Thank you' expresses thanks." },
          { type: "TRUE_FALSE", question: "True or False: 'His' is used for females.", correctAnswer: "false", explanation: "'His' is for males. 'Her' is for females." },
          { type: "FILL_BLANK", question: "Complete: ___ to meet you! (when meeting someone)", correctAnswer: "Nice", explanation: "'Nice to meet you' is polite." },
          { type: "FILL_BLANK", question: "Complete: How ___ you? (asking well-being)", correctAnswer: "are", explanation: "'How are you?' asks about well-being." },
          { type: "FILL_BLANK", question: "Complete: My ___ is my parent's sister. (aunt)", correctAnswer: "aunt", explanation: "Your aunt is your parent's sister." },
          { type: "MATCHING", question: "Match words:", options: [{ left: "Hello", right: "Greeting" }, { left: "Thank you", right: "Gratitude" }, { left: "Sorry", right: "Apology" }, { left: "Please", right: "Politeness" }], correctAnswer: "[0,1,2,3]", explanation: "Each word matches its purpose." },
          { type: "CHECKBOX", question: "Select all correct:", options: ["I am from Nigeria", "She has a book", "They are students", "He have a pen"], correctAnswer: "[0,1,2]", explanation: "'He have' is wrong. Should be 'He has.'" },
          { type: "SPEECH", question: "Hello! My name is Mary. Nice to meet you.", correctAnswer: "Hello! My name is Mary. Nice to meet you.", language: "en", hint: "Practice introductions" },
        ]
      },
      {
        title: "Numbers and Time Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What number is 'fifty'?", options: ["50", "15", "5", "500"], correctAnswer: "0", explanation: "Fifty = 50." },
          { type: "MCQ", question: "What time is 7:30?", options: ["Seven thirty", "Seven thirteen", "Thirty seven", "Seven three"], correctAnswer: "0", explanation: "7:30 = seven thirty." },
          { type: "MCQ", question: "Which day comes after Wednesday?", options: ["Thursday", "Friday", "Tuesday", "Monday"], correctAnswer: "0", explanation: "Thursday comes after Wednesday." },
          { type: "MCQ", question: "Which month is first?", options: ["January", "February", "March", "December"], correctAnswer: "0", explanation: "January is the first month." },
          { type: "TRUE_FALSE", question: "True or False: 12:00 PM is noon.", correctAnswer: "true", explanation: "12:00 PM = noon." },
          { type: "TRUE_FALSE", question: "True or False: Saturday is a weekday.", correctAnswer: "false", explanation: "Saturday is part of the weekend." },
          { type: "FILL_BLANK", question: "Complete: Ten, twenty, thirty, ___ (40).", correctAnswer: "forty", explanation: "The tens in order." },
          { type: "FILL_BLANK", question: "Complete: It is half ___ three. (3:30)", correctAnswer: "past", explanation: "'Half past three' = 3:30." },
          { type: "FILL_BLANK", question: "Complete: Friday, Saturday, ___", correctAnswer: "Sunday", explanation: "Friday, Saturday, Sunday." },
          { type: "MATCHING", question: "Match numbers:", options: [{ left: "25", right: "Twenty-five" }, { left: "75", right: "Seventy-five" }, { left: "100", right: "One hundred" }, { left: "0", right: "Zero" }], correctAnswer: "[0,1,2,3]", explanation: "Each number matches its word." },
          { type: "CHECKBOX", question: "Select all morning times:", options: ["7:00 AM", "10:00 AM", "3:00 PM", "6:00 AM"], correctAnswer: "[0,1,3]", explanation: "7 AM, 10 AM, and 6 AM are morning. 3 PM is afternoon." },
          { type: "SPEECH", question: "I wake up at seven o'clock in the morning.", correctAnswer: "I wake up at seven o'clock in the morning.", language: "en", hint: "Practice time" },
        ]
      },
      {
        title: "Food and Home Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the first meal of the day?", options: ["Breakfast", "Lunch", "Dinner", "Snack"], correctAnswer: "0", explanation: "Breakfast is the first meal." },
          { type: "MCQ", question: "Where do you cook?", options: ["Kitchen", "Bedroom", "Bathroom", "Garage"], correctAnswer: "0", explanation: "Cooking is done in the kitchen." },
          { type: "MCQ", question: "Which is a fruit?", options: ["Apple", "Carrot", "Potato", "Onion"], correctAnswer: "0", explanation: "An apple is a fruit." },
          { type: "MCQ", question: "What do you sleep on?", options: ["Bed", "Table", "Chair", "Sofa"], correctAnswer: "0", explanation: "You sleep on a bed." },
          { type: "TRUE_FALSE", question: "True or False: Milk is a drink.", correctAnswer: "true", explanation: "Milk is a drink." },
          { type: "TRUE_FALSE", question: "True or False: You eat dinner in the morning.", correctAnswer: "false", explanation: "Dinner is in the evening." },
          { type: "FILL_BLANK", question: "Complete: I eat ___ at noon. (midday meal)", correctAnswer: "lunch", explanation: "Lunch is the midday meal." },
          { type: "FILL_BLANK", question: "Complete: I brush my teeth in the ___", correctAnswer: "bathroom", explanation: "Teeth are brushed in the bathroom." },
          { type: "FILL_BLANK", question: "Complete: Can I have a glass of ___? (clear drink)", correctAnswer: "water", explanation: "Water is a clear, healthy drink." },
          { type: "MATCHING", question: "Match items:", options: [{ left: "Bread", right: "Food" }, { left: "Bed", right: "Furniture" }, { left: "Kitchen", right: "Room" }, { left: "Water", right: "Drink" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its category." },
          { type: "CHECKBOX", question: "Select all foods:", options: ["Bread", "Rice", "Chair", "Apple"], correctAnswer: "[0,1,3]", explanation: "Bread, rice, and apple are food. Chair is furniture." },
          { type: "SPEECH", question: "I eat breakfast in the kitchen. Then I go to school.", correctAnswer: "I eat breakfast in the kitchen. Then I go to school.", language: "en", hint: "Talk about food and home" },
        ]
      },
      {
        title: "Grammar and Places Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She ___ a student.", options: ["is", "am", "are", "be"], correctAnswer: "0", explanation: "'She is' is correct." },
          { type: "MCQ", question: "I ___ a book.", options: ["have", "has", "haves", "is have"], correctAnswer: "0", explanation: "'I have' is correct." },
          { type: "MCQ", question: "Where do you borrow books?", options: ["Library", "Bank", "Hospital", "Park"], correctAnswer: "0", explanation: "A library lends books." },
          { type: "MCQ", question: "The book is ___ the table.", options: ["on", "under", "in", "behind"], correctAnswer: "0", explanation: "Books are placed on tables." },
          { type: "TRUE_FALSE", question: "True or False: 'There are' is for plural.", correctAnswer: "true", explanation: "'There are' is used for plural nouns." },
          { type: "TRUE_FALSE", question: "True or False: 'An' is used before 'book.'", correctAnswer: "false", explanation: "'A book' is correct. 'An' is for vowel sounds." },
          { type: "FILL_BLANK", question: "Complete: We ___ happy.", correctAnswer: "are", explanation: "'We are' is correct." },
          { type: "FILL_BLANK", question: "Complete: There ___ a cat in the garden.", correctAnswer: "is", explanation: "'There is' for singular." },
          { type: "FILL_BLANK", question: "Complete: Go ___ (forward) for two blocks.", correctAnswer: "straight", explanation: "'Go straight' means continue forward." },
          { type: "MATCHING", question: "Match grammar:", options: [{ left: "I am", right: "First person" }, { left: "She has", right: "Third person" }, { left: "They are", right: "Plural" }, { left: "There is", right: "Existence" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its grammar role." },
          { type: "CHECKBOX", question: "Select all correct:", options: ["I am tall", "She has a pen", "There are two dogs", "He have a book"], correctAnswer: "[0,1,2]", explanation: "'He have' is wrong. Should be 'He has.'" },
          { type: "SPEECH", question: "I am a student. I have a book. There is a school near my house.", correctAnswer: "I am a student. I have a book. There is a school near my house.", language: "en", hint: "Use grammar correctly" },
          { type: "ORDERING", question: "Put in order: on / book / the / is / table / There / the / a", correctAnswer: "There,is,a,book,on,the,table", explanation: "'There is a book on the table.'" },
        ]
      },
      {
        title: "Complete A1 Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you greet someone at 10 AM?", options: ["Good morning", "Good afternoon", "Good evening", "Good night"], correctAnswer: "0", explanation: "10 AM is morning, so 'Good morning.'" },
          { type: "MCQ", question: "What number comes after 49?", options: ["50", "48", "51", "40"], correctAnswer: "0", explanation: "After 49 comes 50." },
          { type: "MCQ", question: "What color is the sky?", options: ["Blue", "Red", "Green", "Yellow"], correctAnswer: "0", explanation: "The sky is blue." },
          { type: "MCQ", question: "Who is your mother's mother?", options: ["Grandmother", "Aunt", "Sister", "Cousin"], correctAnswer: "0", explanation: "Your mother's mother is your grandmother." },
          { type: "MCQ", question: "What is the evening meal called?", options: ["Dinner", "Breakfast", "Lunch", "Snack"], correctAnswer: "0", explanation: "Dinner is the evening meal." },
          { type: "MCQ", question: "Where do you buy food?", options: ["Supermarket", "Library", "Hospital", "School"], correctAnswer: "0", explanation: "A supermarket sells food." },
          { type: "TRUE_FALSE", question: "True or False: 'I am a student' is correct.", correctAnswer: "true", explanation: "'I am' is correct for first person." },
          { type: "TRUE_FALSE", question: "True or False: 'She have a car' is correct.", correctAnswer: "false", explanation: "Should be 'She has a car.'" },
          { type: "FILL_BLANK", question: "Complete: ___ you for your help. (gratitude)", correctAnswer: "Thank", explanation: "'Thank you' expresses gratitude." },
          { type: "FILL_BLANK", question: "Complete: I wear a ___ (head clothing) in the sun.", correctAnswer: "hat", explanation: "A hat protects from sun." },
          { type: "FILL_BLANK", question: "Complete: It is ___ (water falling). Take an umbrella.", correctAnswer: "raining", explanation: "'It is raining' means rain is falling." },
          { type: "MATCHING", question: "Match everything:", options: [{ left: "Good morning", right: "Greeting" }, { left: "50", right: "Fifty" }, { left: "Blue", right: "Sky color" }, { left: "Grandmother", right: "Family" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its category." },
          { type: "CHECKBOX", question: "Select all correct English:", options: ["I am happy", "She has a book", "They are friends", "He have a pen"], correctAnswer: "[0,1,2]", explanation: "'He have' is wrong. Should be 'He has.'" },
          { type: "SPEECH", question: "Hello! I am a student. I have a big family. I like English!", correctAnswer: "Hello! I am a student. I have a big family. I like English!", language: "en", hint: "Final practice - use everything you learned" },
        ]
      }
    ]
  }
]

async function seedEnglishA1() {
  console.log('🚀 Starting English A1 Course Seed...')

  try {
    // Find or create the Languages category
    let category = await prisma.category.findFirst({
      where: { name: 'Languages' }
    })

    if (!category) {
      console.log('⚠️ Languages category not found. Creating...')
      category = await prisma.category.create({
        data: {
          name: 'Languages',
          description: 'Learn languages from beginner to advanced',
          icon: '🌍',
          color: '#2563eb',
          order: 1,
          isActive: true,
        }
      })
      console.log('✅ Languages category created:', category.id)
    }

    // Check if course already exists
    let course = await prisma.course.findFirst({
      where: { title: courseData.title }
    })

    if (course) {
      console.log('🗑️ Deleting existing course and all related data...')
      await prisma.module.deleteMany({
        where: { courseId: course.id }
      })
      console.log('✅ Existing modules deleted (cascades to lessons and questions)')
    }

    // Create or update course
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          categoryId: category.id,
          difficulty: courseData.difficulty,
          minimumLevel: courseData.minimumLevel,
          isFree: courseData.isFree,
          isPremium: courseData.isPremium,
          cutoffScore: courseData.cutoffScore,
          status: courseData.status,
          icon: courseData.icon,
          color: courseData.color,
          isActive: true,
          order: 1,
        }
      })
      console.log('✅ Course created:', course.id)
    } else {
      course = await prisma.course.update({
        where: { id: course.id },
        data: {
          description: courseData.description,
          categoryId: category.id,
          difficulty: courseData.difficulty,
          minimumLevel: courseData.minimumLevel,
          isFree: courseData.isFree,
          isPremium: courseData.isPremium,
          cutoffScore: courseData.cutoffScore,
          status: courseData.status,
          icon: courseData.icon,
          color: courseData.color,
          isActive: true,
        }
      })
      console.log('✅ Course updated:', course.id)
    }

    // Create modules, lessons, and questions
    let totalLessons = 0
    let totalQuestions = 0

    for (let modIdx = 0; modIdx < modulesData.length; modIdx++) {
      const moduleData = modulesData[modIdx]

      const newModule = await prisma.module.create({
        data: {
          title: moduleData.title,
          courseId: course.id,
          order: modIdx,
          isActive: true,
        }
      })

      console.log(`📦 Module ${modIdx + 1}: "${moduleData.title}" (${newModule.id})`)

      for (let lessIdx = 0; lessIdx < moduleData.lessons.length; lessIdx++) {
        const lessonData = moduleData.lessons[lessIdx]

        const isLastLesson = lessIdx === moduleData.lessons.length - 1
        const xpReward = isLastLesson ? 30 : 15 + Math.floor(Math.random() * 10)
        const gemReward = isLastLesson ? 4 : 1 + Math.floor(Math.random() * 2)

        const newLesson = await prisma.lesson.create({
          data: {
            title: lessonData.title,
            moduleId: newModule.id,
            type: lessonData.type,
            order: lessIdx,
            xpReward,
            gemReward,
            isActive: true,
            isLocked: lessIdx > 0,
            lockReason: lessIdx > 0 ? 'Complete previous lessons to unlock' : null,
          }
        })

        totalLessons++

        // Create questions with retry logic
        const questionsToCreate = lessonData.questions.map((q: any, idx: number) => {
          // Process MCQ questions to shuffle options
          let processedQuestion = q
          if (q.type === 'MCQ' && q.options && q.options.length > 0) {
            processedQuestion = processMCQQuestion(q)
          }

          return {
            lessonId: newLesson.id,
            type: processedQuestion.type,
            question: processedQuestion.question,
            options: processedQuestion.options ? JSON.stringify(processedQuestion.options.map((o: any) => typeof o === 'string' ? o : o.left ? o.left : String(o))) : null,
            correctAnswer: processedQuestion.correctAnswer,
            explanation: processedQuestion.explanation,
            hint: processedQuestion.hint || null,
            language: processedQuestion.language || null,
            order: idx,
            points: processedQuestion.points || 10,
            isActive: true,
          }
        })

        // Batch questions to avoid connection timeout
        const batchSize = 50
        for (let i = 0; i < questionsToCreate.length; i += batchSize) {
          const batch = questionsToCreate.slice(i, i + batchSize)
          await prisma.question.createMany({ data: batch })
        }

        totalQuestions += questionsToCreate.length

        console.log(`  📝 Lesson ${lessIdx + 1}: "${lessonData.title}" - ${questionsToCreate.length} questions`)
      }

      console.log(`  ✅ Module ${modIdx + 1} complete\n`)

      // Small delay between modules to prevent connection issues
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('=========================================')
    console.log('🎉 English A1 Course Seed Complete!')
    console.log('=========================================')
    console.log(`📚 Course: ${course.title}`)
    console.log(`📦 Modules: ${modulesData.length}`)
    console.log(`📝 Lessons: ${totalLessons}`)
    console.log(`❓ Questions: ${totalQuestions}`)
    console.log(`🆔 Course ID: ${course.id}`)
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding English A1 course:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnglishA1()
