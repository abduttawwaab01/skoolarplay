import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function processMCQQuestion(q: any): any {
  if (!q.options || !Array.isArray(q.options)) return q
  const correctIndex = parseInt(q.correctAnswer, 10)
  const correctOption = q.options[correctIndex]
  const shuffledOptions = shuffleArray(q.options)
  const newCorrectIndex = shuffledOptions.findIndex((opt: any) => {
    if (typeof opt === 'string' && typeof correctOption === 'string') return opt === correctOption
    if (typeof opt === 'object' && typeof correctOption === 'object') return JSON.stringify(opt) === JSON.stringify(correctOption)
    return false
  })
  return { ...q, options: shuffledOptions, correctAnswer: String(newCorrectIndex) }
}

const courseData = {
  title: "English A2 - Elementary",
  description: "Build on your English foundation! Master past and future tenses, modals, everyday conversations, and essential grammar for A2 level learners.",
  difficulty: "ELEMENTARY",
  minimumLevel: "A2",
  isFree: true,
  isPremium: false,
  cutoffScore: 70,
  status: "PUBLISHED",
  icon: "📚",
  color: "#059669",
}

const modulesData = [
  {
    title: "Past Simple Tense",
    lessons: [
      {
        title: "Regular Verbs in Past Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the past simple of 'play'?", options: ["played", "playd", "plaied", "playing"], correctAnswer: "0", explanation: "Regular verbs add '-ed' to form the past simple." },
          { type: "MCQ", question: "Choose the correct sentence:", options: ["I watched TV yesterday", "I watch TV yesterday", "I watching TV yesterday", "I watches TV yesterday"], correctAnswer: "0", explanation: "Past simple uses the verb + 'ed' for regular verbs with a past time reference." },
          { type: "MCQ", question: "What is the past simple of 'study'?", options: ["studied", "studyed", "studyes", "studing"], correctAnswer: "0", explanation: "For verbs ending in consonant + 'y', change 'y' to 'i' and add '-ed'." },
          { type: "MCQ", question: "What is the negative form of 'I worked'?", options: ["I didn't work", "I not worked", "I don't worked", "I wasn't worked"], correctAnswer: "0", explanation: "Past simple negative: didn't + base form of the verb." },
          { type: "TRUE_FALSE", question: "True or False: 'I goed to school' is correct.", correctAnswer: "false", explanation: "'Go' is irregular. The past simple is 'went': 'I went to school'." },
          { type: "TRUE_FALSE", question: "True or False: We use 'didn't' with the base form of the verb.", correctAnswer: "true", explanation: "Negative past: subject + didn't + base verb (e.g., 'I didn't eat')." },
          { type: "FILL_BLANK", question: "Complete: She ___ (walk) to school yesterday.", correctAnswer: "walked", explanation: "Regular verb: walk + ed = walked." },
          { type: "FILL_BLANK", question: "Complete: They ___ (not/call) me last night.", correctAnswer: "didn't call", explanation: "Negative past: didn't + base form 'call'." },
          { type: "FILL_BLANK", question: "Complete: We ___ (stop) at the red light.", correctAnswer: "stopped", explanation: "For verbs ending in consonant-vowel-consonant, double the final consonant + 'ed'." },
          { type: "MATCHING", question: "Match the base verb with its past form:", options: [{ left: "watch", right: "watched" }, { left: "cry", right: "cried" }, { left: "try", right: "tried" }, { left: "open", right: "opened" }], correctAnswer: "[0,1,2,3]", explanation: "All are regular verbs; 'cry' and 'try' change 'y' to 'i' + 'ed'." },
          { type: "CHECKBOX", question: "Select all correct past simple forms:", options: ["cooked", "cleaned", "runned", "danced"], correctAnswer: "[0,1,3]", explanation: "'Cooked', 'cleaned', and 'danced' are correct. 'Run' is irregular (ran)." },
          { type: "ORDERING", question: "Put in order: yesterday / I / finished / my homework", correctAnswer: "I,finished,my homework,yesterday", explanation: "Subject + verb (past) + object + time expression." },
          { type: "SPEECH", question: "I played football with my friends last weekend.", correctAnswer: "I played football with my friends last weekend.", language: "en", hint: "Say a past simple sentence about sports" },
          { type: "SPEECH", question: "She studied English for two hours yesterday.", correctAnswer: "She studied English for two hours yesterday.", language: "en", hint: "Say a past simple sentence about studying" },
        ]
      },
      {
        title: "Irregular Verbs in Past Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the past simple of 'go'?", options: ["went", "goed", "gone", "going"], correctAnswer: "0", explanation: "'Go' is irregular; its past simple is 'went'." },
          { type: "MCQ", question: "What is the past simple of 'eat'?", options: ["ate", "eated", "eaten", "eating"], correctAnswer: "0", explanation: "'Eat' is irregular; its past simple is 'ate'." },
          { type: "MCQ", question: "What is the past simple of 'buy'?", options: ["bought", "buyed", "brought", "buying"], correctAnswer: "0", explanation: "'Buy' is irregular; its past simple is 'bought'." },
          { type: "MCQ", question: "Choose the correct sentence:", options: ["She wrote a letter", "She writed a letter", "She written a letter", "She writes a letter yesterday"], correctAnswer: "0", explanation: "'Write' is irregular; past simple is 'wrote'." },
          { type: "TRUE_FALSE", question: "True or False: 'I see a movie last night' is correct.", correctAnswer: "false", explanation: "Past simple of 'see' is 'saw': 'I saw a movie last night'." },
          { type: "TRUE_FALSE", question: "True or False: The past simple of 'teach' is 'taught'.", correctAnswer: "true", explanation: "'Teach' is irregular: teach -> taught." },
          { type: "FILL_BLANK", question: "Complete: He ___ (take) the bus to work.", correctAnswer: "took", explanation: "'Take' is irregular: take -> took." },
          { type: "FILL_BLANK", question: "Complete: I ___ (make) a cake for her birthday.", correctAnswer: "made", explanation: "'Make' is irregular: make -> made." },
          { type: "FILL_BLANK", question: "Complete: They ___ (come) to the party.", correctAnswer: "came", explanation: "'Come' is irregular: come -> came." },
          { type: "MATCHING", question: "Match the base verb with its past form:", options: [{ left: "go", right: "went" }, { left: "have", right: "had" }, { left: "do", right: "did" }, { left: "say", right: "said" }], correctAnswer: "[0,1,2,3]", explanation: "All are common irregular verbs." },
          { type: "CHECKBOX", question: "Select all irregular verbs:", options: ["run -> ran", "walk -> walked", "swim -> swam", "drive -> drove"], correctAnswer: "[0,2,3]", explanation: "'Run', 'swim', and 'drive' are irregular. 'Walk' is regular (walked)." },
          { type: "ORDERING", question: "Put in order: she / yesterday / bought / a new phone", correctAnswer: "She,bought,a new phone,yesterday", explanation: "Subject + irregular past verb + object + time." },
          { type: "SPEECH", question: "I went to the market and bought some fruits.", correctAnswer: "I went to the market and bought some fruits.", language: "en", hint: "Say a sentence with two past actions" },
          { type: "SPEECH", question: "She gave me a beautiful gift.", correctAnswer: "She gave me a beautiful gift.", language: "en", hint: "Say a sentence about receiving something" },
        ]
      },
      {
        title: "Past Simple Questions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you form a question in past simple?", options: ["Did + subject + base verb?", "Did + subject + past verb?", "Does + subject + base verb?", "Was + subject + past verb?"], correctAnswer: "0", explanation: "Past simple questions: Did + subject + base form of verb." },
          { type: "MCQ", question: "Choose the correct question:", options: ["Did you see the movie?", "Did you saw the movie?", "Do you see the movie yesterday?", "Were you see the movie?"], correctAnswer: "0", explanation: "'Did + subject + base verb': 'Did you see the movie?'" },
          { type: "MCQ", question: "What is the correct answer to 'Did she go to school?'", options: ["Yes, she did", "Yes, she does", "Yes, she went", "Yes, she goes"], correctAnswer: "0", explanation: "Short answer matches the auxiliary: 'Yes, she did'." },
          { type: "MCQ", question: "'___ you finish your homework?'", options: ["Did", "Do", "Were", "Are"], correctAnswer: "0", explanation: "Use 'Did' for past simple questions." },
          { type: "TRUE_FALSE", question: "True or False: 'Did they played football?' is correct.", correctAnswer: "false", explanation: "After 'Did', use the base form: 'Did they play football?'" },
          { type: "TRUE_FALSE", question: "True or False: 'Where did you go?' is a correct question.", correctAnswer: "true", explanation: "Wh- question in past: Wh- + did + subject + base verb." },
          { type: "FILL_BLANK", question: "Complete: ___ you eat breakfast this morning?", correctAnswer: "Did", explanation: "Past simple question: 'Did + subject + base verb'." },
          { type: "FILL_BLANK", question: "Complete: What time ___ she arrive?", correctAnswer: "did", explanation: "Wh- question: 'What time did she arrive?'" },
          { type: "FILL_BLANK", question: "Complete: ___ they visit their grandparents last week? Yes, they ___.", correctAnswer: "Did,did", explanation: "Question: 'Did they...?' Answer: 'Yes, they did'." },
          { type: "MATCHING", question: "Match the question with the answer:", options: [{ left: "Did you like the food?", right: "Yes, I did" }, { left: "Where did you go?", right: "To the park" }, { left: "What did she say?", right: "She said hello" }, { left: "When did they leave?", right: "At 5 PM" }], correctAnswer: "[0,1,2,3]", explanation: "Each question matches its appropriate answer." },
          { type: "CHECKBOX", question: "Select all correct past simple questions:", options: ["Did he call you?", "What did you buy?", "Did she went home?", "Where were you born?"], correctAnswer: "[0,1,3]", explanation: "'Did she went' is wrong; should be 'Did she go'. The others are correct." },
          { type: "ORDERING", question: "Put in order: you / did / what / last night / do?", correctAnswer: "What,did,you,do,last night?", explanation: "Wh- question: What + did + subject + verb + time?" },
          { type: "SPEECH", question: "Did you watch the football match yesterday?", correctAnswer: "Did you watch the football match yesterday?", language: "en", hint: "Ask about yesterday's activity" },
        ]
      },
      {
        title: "Was/Were in Past Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I was tired", "I were tired", "I am tired yesterday", "I be tired"], correctAnswer: "0", explanation: "'I/he/she/it' use 'was' in past simple." },
          { type: "MCQ", question: "Which is correct?", options: ["They were happy", "They was happy", "They are happy yesterday", "They be happy"], correctAnswer: "0", explanation: "'They/we/you' use 'were' in past simple." },
          { type: "MCQ", question: "'___ you at home last night?'", options: ["Were", "Was", "Did", "Are"], correctAnswer: "0", explanation: "'Were' is used with 'you' for past states: 'Were you at home?'" },
          { type: "MCQ", question: "'She ___ at the party.'", options: ["was", "were", "is", "did"], correctAnswer: "0", explanation: "'She' uses 'was': 'She was at the party'." },
          { type: "TRUE_FALSE", question: "True or False: 'We was late' is correct.", correctAnswer: "false", explanation: "'We' uses 'were': 'We were late'." },
          { type: "TRUE_FALSE", question: "True or False: The negative of 'was' is 'wasn't'.", correctAnswer: "true", explanation: "Wasn't = was not; weren't = were not." },
          { type: "FILL_BLANK", question: "Complete: It ___ a sunny day yesterday.", correctAnswer: "was", explanation: "'It' uses 'was' in past: 'It was a sunny day'." },
          { type: "FILL_BLANK", question: "Complete: They ___ at the cinema last night.", correctAnswer: "were", explanation: "'They' uses 'were': 'They were at the cinema'." },
          { type: "FILL_BLANK", question: "Complete: I ___ not feeling well yesterday.", correctAnswer: "was", explanation: "'I' uses 'was': 'I was not feeling well'." },
          { type: "MATCHING", question: "Match the subject with the correct form:", options: [{ left: "I", right: "was" }, { left: "You", right: "were" }, { left: "She", right: "was" }, { left: "They", right: "were" }], correctAnswer: "[0,1,2,3]", explanation: "I/he/she/it = was; you/we/they = were." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["He was a teacher", "You were very kind", "They was angry", "I was born in 1990"], correctAnswer: "[0,1,3]", explanation: "'They was' is wrong; should be 'They were'. The others are correct." },
          { type: "ORDERING", question: "Put in order: was / where / yesterday / she?", correctAnswer: "Where,was,she,yesterday?", explanation: "Question: Where + was + subject + time?" },
          { type: "SPEECH", question: "I was very busy last week.", correctAnswer: "I was very busy last week.", language: "en", hint: "Talk about how you were last week" },
          { type: "SPEECH", question: "Were you at school yesterday?", correctAnswer: "Were you at school yesterday?", language: "en", hint: "Ask about someone's location" },
        ]
      },
      {
        title: "Module 1 Review: Past Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the past simple of 'write'?", options: ["wrote", "writed", "written", "writing"], correctAnswer: "0", explanation: "'Write' is irregular; past simple is 'wrote'." },
          { type: "MCQ", question: "Choose the correct sentence:", options: ["She didn't go to work", "She didn't went to work", "She not go to work", "She doesn't went to work"], correctAnswer: "0", explanation: "Negative: didn't + base form = 'didn't go'." },
          { type: "MCQ", question: "'___ they play tennis last Sunday?'", options: ["Did", "Do", "Were", "Are"], correctAnswer: "0", explanation: "Past simple question: 'Did + subject + base verb'." },
          { type: "MCQ", question: "'He ___ born in London.'", options: ["was", "were", "did", "is"], correctAnswer: "0", explanation: "'He' uses 'was': 'He was born in London'." },
          { type: "TRUE_FALSE", question: "True or False: The past simple of 'teach' is 'teached'.", correctAnswer: "false", explanation: "'Teach' is irregular: past simple is 'taught'." },
          { type: "TRUE_FALSE", question: "True or False: 'Did you enjoyed the movie?' is correct.", correctAnswer: "false", explanation: "After 'Did', use base form: 'Did you enjoy the movie?'" },
          { type: "FILL_BLANK", question: "Complete: I ___ (read) a great book last month.", correctAnswer: "read", explanation: "'Read' is irregular; past is spelled the same but pronounced 'red'." },
          { type: "FILL_BLANK", question: "Complete: She ___ (not/drink) coffee yesterday.", correctAnswer: "didn't drink", explanation: "Negative: didn't + base form = 'didn't drink'." },
          { type: "FILL_BLANK", question: "Complete: We ___ (be) at the beach last weekend.", correctAnswer: "were", explanation: "'We' uses 'were' in past." },
          { type: "MATCHING", question: "Match the verb with its past form:", options: [{ left: "think", right: "thought" }, { left: "bring", right: "brought" }, { left: "catch", right: "caught" }, { left: "find", right: "found" }], correctAnswer: "[0,1,2,3]", explanation: "All are common irregular verbs." },
          { type: "CHECKBOX", question: "Select all correct past simple forms:", options: ["told", "spoke", "knowed", "flew"], correctAnswer: "[0,1,3]", explanation: "'Tell->told', 'speak->spoke', 'fly->flew'. 'Know' is irregular (knew)." },
          { type: "ORDERING", question: "Put in order: last / we / visited / week / our grandparents", correctAnswer: "We,visited,our grandparents,last week", explanation: "Subject + verb (past) + object + time." },
          { type: "SPEECH", question: "I didn't see him at the meeting yesterday.", correctAnswer: "I didn't see him at the meeting yesterday.", language: "en", hint: "Say a negative past sentence" },
          { type: "SPEECH", question: "What did you do last summer?", correctAnswer: "What did you do last summer?", language: "en", hint: "Ask about past activities" },
          { type: "SPEECH", question: "She was the best student in the class.", correctAnswer: "She was the best student in the class.", language: "en", hint: "Describe someone in the past" },
        ]
      },
    ]
  },
  {
    title: "Future Tenses",
    lessons: [
      {
        title: "Will for Future",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which sentence uses 'will' correctly?", options: ["I will call you tomorrow", "I will calling you tomorrow", "I will calls you tomorrow", "I will called you tomorrow"], correctAnswer: "0", explanation: "'Will + base verb' expresses future actions." },
          { type: "MCQ", question: "'She ___ help us.'", options: ["will", "wills", "will to", "will be"], correctAnswer: "0", explanation: "'Will' is the same for all subjects: She will help us." },
          { type: "MCQ", question: "What is the negative form?", options: ["will not / won't", "don't will", "not will", "won't to"], correctAnswer: "0", explanation: "'Will not' contracts to 'won't'." },
          { type: "MCQ", question: "'They ___ arrive at 8 PM.'", options: ["will", "wills", "are", "do"], correctAnswer: "0", explanation: "'Will' + base verb for future: 'They will arrive at 8 PM'." },
          { type: "TRUE_FALSE", question: "True or False: 'I will go to the store' expresses a future action.", correctAnswer: "true", explanation: "'Will + base verb' is used for future decisions and predictions." },
          { type: "TRUE_FALSE", question: "True or False: 'She wills come tomorrow' is correct.", correctAnswer: "false", explanation: "'Will' never changes: 'She will come tomorrow'." },
          { type: "FILL_BLANK", question: "Complete: I think it ___ rain tomorrow.", correctAnswer: "will", explanation: "'Will' for predictions: 'I think it will rain tomorrow'." },
          { type: "FILL_BLANK", question: "Complete: She ___ (not/attend) the meeting.", correctAnswer: "won't attend", explanation: "Negative future: won't + base verb." },
          { type: "FILL_BLANK", question: "Complete: ___ you help me with this? Yes, I ___.", correctAnswer: "Will,will", explanation: "Future question: 'Will you...?' Answer: 'Yes, I will'." },
          { type: "MATCHING", question: "Match the sentence with its use:", options: [{ left: "I will help you", right: "Offer" }, { left: "It will be sunny", right: "Prediction" }, { left: "I'll be there at 5", right: "Promise" }, { left: "I think he will win", right: "Opinion" }], correctAnswer: "[0,1,2,3]", explanation: "'Will' is used for offers, predictions, promises, and opinions." },
          { type: "CHECKBOX", question: "Select all correct uses of 'will':", options: ["I will travel next year", "She wills be happy", "They won't come", "Will you join us?"], correctAnswer: "[0,2,3]", explanation: "'She wills' is wrong. The others use 'will' correctly." },
          { type: "ORDERING", question: "Put in order: tomorrow / will / I / visit / my friend", correctAnswer: "I,will visit,my friend,tomorrow", explanation: "Subject + will + verb + object + time." },
          { type: "SPEECH", question: "I will study hard for the exam.", correctAnswer: "I will study hard for the exam.", language: "en", hint: "Make a promise about studying" },
          { type: "SPEECH", question: "She won't be late for the meeting.", correctAnswer: "She won't be late for the meeting.", language: "en", hint: "Say a negative future sentence" },
        ]
      },
      {
        title: "Going to for Future Plans",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I am going to visit Paris", "I am going visit Paris", "I going to visit Paris", "I go to visit Paris"], correctAnswer: "0", explanation: "'Be going to + base verb' for plans: 'I am going to visit'." },
          { type: "MCQ", question: "'She ___ going to buy a car.'", options: ["is", "are", "am", "be"], correctAnswer: "0", explanation: "'She is going to...' for her plans." },
          { type: "MCQ", question: "'We ___ going to travel next month.'", options: ["are", "is", "am", "be"], correctAnswer: "0", explanation: "'We are going to...' for our plans." },
          { type: "MCQ", question: "What is the negative form?", options: ["is not going to / isn't going to", "not going to", "don't going to", "doesn't going to"], correctAnswer: "0", explanation: "Negative: 'is not going to' or 'isn't going to'." },
          { type: "TRUE_FALSE", question: "True or False: 'Going to' is used for plans and intentions.", correctAnswer: "true", explanation: "'Going to' expresses planned future actions." },
          { type: "TRUE_FALSE", question: "True or False: 'I going to eat' is correct.", correctAnswer: "false", explanation: "Needs 'am': 'I am going to eat'." },
          { type: "FILL_BLANK", question: "Complete: They ___ going to move to a new house.", correctAnswer: "are", explanation: "'They are going to...' for their plan." },
          { type: "FILL_BLANK", question: "Complete: ___ you going to study tonight?", correctAnswer: "Are", explanation: "Question: 'Are you going to study tonight?'" },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/go) to the party.", correctAnswer: "am not going", explanation: "Negative: 'I am not going to the party'." },
          { type: "MATCHING", question: "Match the subject with 'going to':", options: [{ left: "I", right: "am going to" }, { left: "He", right: "is going to" }, { left: "They", right: "are going to" }, { left: "She", right: "is going to" }], correctAnswer: "[0,1,2,3]", explanation: "I = am going to; he/she/it = is going to; they/we/you = are going to." },
          { type: "CHECKBOX", question: "Select all correct 'going to' sentences:", options: ["I'm going to cook dinner", "She is going to learn Spanish", "They going to play", "We aren't going to leave"], correctAnswer: "[0,1,3]", explanation: "'They going to' needs 'are': 'They are going to play'." },
          { type: "ORDERING", question: "Put in order: to / are / we / going / a movie / watch", correctAnswer: "We,are going to,watch,a movie", explanation: "Subject + are going to + verb + object." },
          { type: "SPEECH", question: "I am going to travel to Japan next year.", correctAnswer: "I am going to travel to Japan next year.", language: "en", hint: "Talk about a future travel plan" },
          { type: "SPEECH", question: "She is going to study medicine at university.", correctAnswer: "She is going to study medicine at university.", language: "en", hint: "Talk about someone's career plan" },
        ]
      },
      {
        title: "Will vs Going To",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "When do we use 'will' instead of 'going to'?", options: ["For sudden decisions", "For planned actions", "For schedules", "For routines"], correctAnswer: "0", explanation: "'Will' is used for sudden decisions; 'going to' for plans." },
          { type: "MCQ", question: "The phone rings. 'I ___ answer it.'", options: ["will", "am going to", "am", "do"], correctAnswer: "0", explanation: "Sudden decision: 'I will answer it'." },
          { type: "MCQ", question: "'I bought the tickets. We ___ watch the concert.'", options: ["are going to", "will", "do", "are"], correctAnswer: "0", explanation: "Already planned (bought tickets): 'We are going to watch'." },
          { type: "MCQ", question: "'Look at those clouds! It ___ rain.'", options: ["is going to", "will", "is", "does"], correctAnswer: "0", explanation: "Prediction based on evidence: 'It is going to rain'." },
          { type: "TRUE_FALSE", question: "True or False: 'I think she will pass the test' uses 'will' for a prediction.", correctAnswer: "true", explanation: "'I think' + 'will' expresses a prediction/opinion." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm going to help you' suggests a pre-planned action.", correctAnswer: "true", explanation: "'Going to' implies prior intention or plan." },
          { type: "FILL_BLANK", question: "Complete: 'I'm thirsty. I ___ get some water.' (sudden decision)", correctAnswer: "will", explanation: "Sudden decision: 'I will get some water'." },
          { type: "FILL_BLANK", question: "Complete: 'I ___ going to start a new job next week.' (planned)", correctAnswer: "am", explanation: "Planned action: 'I am going to start a new job'." },
          { type: "FILL_BLANK", question: "Complete: 'She looks sick. She ___ faint.' (prediction based on evidence)", correctAnswer: "is going to", explanation: "Evidence-based prediction: 'She is going to faint'." },
          { type: "MATCHING", question: "Match the situation with the correct form:", options: [{ left: "Sudden decision", right: "will" }, { left: "Plan made earlier", right: "going to" }, { left: "Prediction with evidence", right: "going to" }, { left: "Prediction without evidence", right: "will" }], correctAnswer: "[0,1,2,3]", explanation: "Will for sudden decisions/opinions; going to for plans/evidence." },
          { type: "CHECKBOX", question: "Select all sentences using 'will' correctly:", options: ["I'll carry that bag for you", "She will to study tonight", "I think he will succeed", "Will you open the door?"], correctAnswer: "[0,2,3]", explanation: "'She will to study' is wrong. The others use 'will' correctly." },
          { type: "ORDERING", question: "Put in order: going / to / I / am / a doctor / become", correctAnswer: "I,am going to,become,a doctor", explanation: "Life plan: 'I am going to become a doctor'." },
          { type: "SPEECH", question: "Wait! I will help you with those bags.", correctAnswer: "Wait! I will help you with those bags.", language: "en", hint: "Make a sudden offer to help" },
          { type: "SPEECH", question: "We are going to have a party on Saturday.", correctAnswer: "We are going to have a party on Saturday.", language: "en", hint: "Talk about a planned event" },
        ]
      },
      {
        title: "Future Time Expressions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is a future time expression?", options: ["next week", "yesterday", "last month", "ago"], correctAnswer: "0", explanation: "'Next week' refers to the future." },
          { type: "MCQ", question: "'I'll see you ___'", options: ["tomorrow", "yesterday", "last week", "two days ago"], correctAnswer: "0", explanation: "'Tomorrow' is a future time expression." },
          { type: "MCQ", question: "'She is going to move ___ June.'", options: ["in", "on", "at", "by"], correctAnswer: "0", explanation: "Use 'in' for months: 'in June'." },
          { type: "MCQ", question: "'The meeting is ___ Monday.'", options: ["on", "in", "at", "by"], correctAnswer: "0", explanation: "Use 'on' for days: 'on Monday'." },
          { type: "TRUE_FALSE", question: "True or False: 'In the future' is a time expression for the future.", correctAnswer: "true", explanation: "'In the future' refers to a time that hasn't happened yet." },
          { type: "TRUE_FALSE", question: "True or False: We say 'at next week' to refer to the future.", correctAnswer: "false", explanation: "We say 'next week' (no preposition): 'I'll see you next week'." },
          { type: "FILL_BLANK", question: "Complete: I'm going to travel ___ summer.", correctAnswer: "next", explanation: "'Next summer' is a future time expression." },
          { type: "FILL_BLANK", question: "Complete: She will graduate ___ two years.", correctAnswer: "in", explanation: "'In + time period' for future: 'in two years'." },
          { type: "FILL_BLANK", question: "Complete: The party is ___ Friday night.", correctAnswer: "on", explanation: "'On' for specific days: 'on Friday night'." },
          { type: "MATCHING", question: "Match the expression with its type:", options: [{ left: "tomorrow", right: "Next day" }, { left: "next month", right: "Future month" }, { left: "in 2027", right: "Future year" }, { left: "soon", right: "Near future" }], correctAnswer: "[0,1,2,3]", explanation: "All are common future time expressions." },
          { type: "CHECKBOX", question: "Select all future time expressions:", options: ["next year", "in an hour", "yesterday morning", "later today"], correctAnswer: "[0,1,3]", explanation: "'Yesterday morning' is past. The others refer to the future." },
          { type: "ORDERING", question: "Put in order: going / we / are / to / next year / get married", correctAnswer: "We,are going to,get married,next year", explanation: "Subject + are going to + verb + time." },
          { type: "SPEECH", question: "I will call you in five minutes.", correctAnswer: "I will call you in five minutes.", language: "en", hint: "Promise to call soon" },
          { type: "SPEECH", question: "She is going to start a new job next Monday.", correctAnswer: "She is going to start a new job next Monday.", language: "en", hint: "Talk about a future job start" },
        ]
      },
      {
        title: "Module 2 Review: Future Tenses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I promise I ___ tell anyone.'", options: ["won't", "am not going to", "don't", "didn't"], correctAnswer: "0", explanation: "'Won't' for a promise: 'I won't tell anyone'." },
          { type: "MCQ", question: "'Look at the sky! It ___ snow.'", options: ["is going to", "will", "is", "does"], correctAnswer: "0", explanation: "Evidence-based prediction: 'It is going to snow'." },
          { type: "MCQ", question: "Choose the correct sentence:", options: ["She is going to visit us next week", "She going to visit us next week", "She is going visit us next week", "She goes to visit us next week"], correctAnswer: "0", explanation: "'Be going to + base verb': 'She is going to visit'." },
          { type: "MCQ", question: "'___ you help me move this table?' (sudden request)", options: ["Will", "Are", "Do", "Did"], correctAnswer: "0", explanation: "'Will' for spontaneous requests: 'Will you help me?'" },
          { type: "TRUE_FALSE", question: "True or False: 'I will to go' is correct.", correctAnswer: "false", explanation: "'Will + base verb' (no 'to'): 'I will go'." },
          { type: "TRUE_FALSE", question: "True or False: 'We aren't going to stay long' is correct.", correctAnswer: "true", explanation: "Negative 'going to': 'aren't going to + base verb'." },
          { type: "FILL_BLANK", question: "Complete: I think he ___ win the race.", correctAnswer: "will", explanation: "Prediction: 'I think he will win'." },
          { type: "FILL_BLANK", question: "Complete: They ___ going to paint the house blue.", correctAnswer: "are", explanation: "'They are going to paint...' for their plan." },
          { type: "FILL_BLANK", question: "Complete: ___ she going to study abroad?", correctAnswer: "Is", explanation: "Question: 'Is she going to study abroad?'" },
          { type: "MATCHING", question: "Match the sentence with the future form:", options: [{ left: "I'll get it!", right: "Sudden decision" }, { left: "I'm going to lose weight", right: "Plan/Intention" }, { left: "She'll be 25 next month", right: "Fact" }, { left: "It's going to rain", right: "Prediction with evidence" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence uses the correct future form." },
          { type: "CHECKBOX", question: "Select all correct future sentences:", options: ["I will be there", "She's going to call you", "They will going home", "We won't forget"], correctAnswer: "[0,1,3]", explanation: "'They will going' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / she / 30 / be / next / year", correctAnswer: "She,will be,30,next year", explanation: "Subject + will be + age + time." },
          { type: "SPEECH", question: "I think the team will win the championship.", correctAnswer: "I think the team will win the championship.", language: "en", hint: "Make a prediction about sports" },
          { type: "SPEECH", question: "We are going to visit our grandparents this weekend.", correctAnswer: "We are going to visit our grandparents this weekend.", language: "en", hint: "Talk about a weekend plan" },
          { type: "SPEECH", question: "I will never forget your kindness.", correctAnswer: "I will never forget your kindness.", language: "en", hint: "Make a promise" },
        ]
      },
    ]
  },
  {
    title: "Present Perfect Tense",
    lessons: [
      {
        title: "Introduction to Present Perfect",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is the correct present perfect form?", options: ["I have eaten", "I has eaten", "I have eat", "I having eaten"], correctAnswer: "0", explanation: "Present perfect: have/has + past participle." },
          { type: "MCQ", question: "'She ___ finished her work.'", options: ["has", "have", "had", "having"], correctAnswer: "0", explanation: "'She/He/It' uses 'has' in present perfect." },
          { type: "MCQ", question: "'They ___ visited Paris.'", options: ["have", "has", "had", "having"], correctAnswer: "0", explanation: "'They/We/You/I' use 'have' in present perfect." },
          { type: "MCQ", question: "What is the past participle of 'go'?", options: ["gone", "went", "goed", "going"], correctAnswer: "0", explanation: "Go -> went (past) -> gone (past participle)." },
          { type: "TRUE_FALSE", question: "True or False: 'I have saw that movie' is correct.", correctAnswer: "false", explanation: "Past participle of 'see' is 'seen': 'I have seen that movie'." },
          { type: "TRUE_FALSE", question: "True or False: Present perfect connects the past to the present.", correctAnswer: "true", explanation: "Present perfect describes actions that started in the past and continue or have present relevance." },
          { type: "FILL_BLANK", question: "Complete: I ___ (live) here for five years.", correctAnswer: "have lived", explanation: "'I have lived here for five years' (still living here)." },
          { type: "FILL_BLANK", question: "Complete: She ___ (not/read) that book yet.", correctAnswer: "hasn't read", explanation: "Negative present perfect: hasn't + past participle." },
          { type: "FILL_BLANK", question: "Complete: ___ you ever ___ (eat) sushi?", correctAnswer: "Have,eaten", explanation: "Question: 'Have you ever eaten sushi?'" },
          { type: "MATCHING", question: "Match the verb with its past participle:", options: [{ left: "write", right: "written" }, { left: "speak", right: "spoken" }, { left: "break", right: "broken" }, { left: "choose", right: "chosen" }], correctAnswer: "[0,1,2,3]", explanation: "All are irregular past participles." },
          { type: "CHECKBOX", question: "Select all correct present perfect sentences:", options: ["I have been to London", "She has lost her keys", "They have went home", "He has written a letter"], correctAnswer: "[0,1,3]", explanation: "'They have went' is wrong; should be 'They have gone'." },
          { type: "ORDERING", question: "Put in order: have / I / never / been / to Japan", correctAnswer: "I,have never,been,to Japan", explanation: "Subject + have + never + past participle + place." },
          { type: "SPEECH", question: "I have lived in this city since 2020.", correctAnswer: "I have lived in this city since 2020.", language: "en", hint: "Talk about how long you've lived somewhere" },
          { type: "SPEECH", question: "She has already finished her homework.", correctAnswer: "She has already finished her homework.", language: "en", hint: "Say someone has completed something" },
        ]
      },
      {
        title: "Present Perfect with Ever, Never, Already, Yet",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which sentence uses 'ever' correctly?", options: ["Have you ever been to Spain?", "Did you ever been to Spain?", "Have you ever be to Spain?", "Do you ever been to Spain?"], correctAnswer: "0", explanation: "'Ever' with present perfect questions: 'Have you ever...?'" },
          { type: "MCQ", question: "'I have ___ seen a ghost.' (negative meaning)", options: ["never", "ever", "already", "yet"], correctAnswer: "0", explanation: "'Never' means 'not ever': 'I have never seen a ghost'." },
          { type: "MCQ", question: "'She has ___ finished her exam.' (before now)", options: ["already", "never", "yet", "ever"], correctAnswer: "0", explanation: "'Already' means before now or earlier than expected." },
          { type: "MCQ", question: "'Have you done your homework ___?'", options: ["yet", "already", "never", "ever"], correctAnswer: "0", explanation: "'Yet' is used in questions and negatives for something expected." },
          { type: "TRUE_FALSE", question: "True or False: 'I haven't eaten yet' means I will eat later.", correctAnswer: "true", explanation: "'Yet' in negatives suggests the action is expected to happen." },
          { type: "TRUE_FALSE", question: "True or False: 'She has already left' means she left earlier than expected.", correctAnswer: "true", explanation: "'Already' suggests something happened sooner than expected." },
          { type: "FILL_BLANK", question: "Complete: Have you ___ tried skydiving?", correctAnswer: "ever", explanation: "'Ever' asks about life experience: 'Have you ever tried...?'" },
          { type: "FILL_BLANK", question: "Complete: I have ___ been to Australia. (not even once)", correctAnswer: "never", explanation: "'Never' = not at any time: 'I have never been to Australia'." },
          { type: "FILL_BLANK", question: "Complete: They haven't arrived ___.", correctAnswer: "yet", explanation: "'Yet' in negatives: 'They haven't arrived yet'." },
          { type: "MATCHING", question: "Match the word with its meaning:", options: [{ left: "ever", right: "At any time" }, { left: "never", right: "Not at any time" }, { left: "already", right: "Before now" }, { left: "yet", right: "Up to now" }], correctAnswer: "[0,1,2,3]", explanation: "Each word has a specific time-related meaning in present perfect." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["Have you ever ridden a horse?", "I have already told you", "She hasn't called me yet", "I never have been there"], correctAnswer: "[0,1,2]", explanation: "'I never have been' should be 'I have never been'." },
          { type: "ORDERING", question: "Put in order: you / have / eaten / ever / Korean food?", correctAnswer: "Have,you ever,eaten,Korean food?", explanation: "Question: Have + subject + ever + past participle + object?" },
          { type: "SPEECH", question: "I have already booked the tickets for the concert.", correctAnswer: "I have already booked the tickets for the concert.", language: "en", hint: "Say you've done something ahead of time" },
          { type: "SPEECH", question: "Have you ever met a famous person?", correctAnswer: "Have you ever met a famous person?", language: "en", hint: "Ask about a life experience" },
        ]
      },
      {
        title: "Present Perfect: For and Since",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I have lived here for 10 years", "I have lived here since 10 years", "I have lived here since 10 years ago", "I have lived here for 2014"], correctAnswer: "0", explanation: "'For' + duration: 'for 10 years'." },
          { type: "MCQ", question: "'She has worked here ___ 2020.'", options: ["since", "for", "from", "during"], correctAnswer: "0", explanation: "'Since' + starting point: 'since 2020'." },
          { type: "MCQ", question: "'They have been married ___ 25 years.'", options: ["for", "since", "from", "at"], correctAnswer: "0", explanation: "'For' + time period: 'for 25 years'." },
          { type: "MCQ", question: "Which uses 'since' correctly?", options: ["I have known her since we were children", "I have known her since 5 years", "I have known her since a long time", "I have known her since three months"], correctAnswer: "0", explanation: "'Since' + specific point in time: 'since we were children'." },
          { type: "TRUE_FALSE", question: "True or False: 'For' is used with a period of time.", correctAnswer: "true", explanation: "'For' + duration (for 3 days, for 2 weeks, for a year)." },
          { type: "TRUE_FALSE", question: "True or False: 'She has studied English since 6 months' is correct.", correctAnswer: "false", explanation: "Should use 'for': 'She has studied English for 6 months'." },
          { type: "FILL_BLANK", question: "Complete: He has been a doctor ___ 2015.", correctAnswer: "since", explanation: "'Since' + year: 'since 2015'." },
          { type: "FILL_BLANK", question: "Complete: We have waited ___ two hours.", correctAnswer: "for", explanation: "'For' + duration: 'for two hours'." },
          { type: "FILL_BLANK", question: "Complete: I haven't seen him ___ last Christmas.", correctAnswer: "since", explanation: "'Since' + specific past event: 'since last Christmas'." },
          { type: "MATCHING", question: "Match the expression with 'for' or 'since':", options: [{ left: "three days", right: "for" }, { left: "last January", right: "since" }, { left: "a long time", right: "for" }, { left: "I was born", right: "since" }], correctAnswer: "[0,1,2,3]", explanation: "Duration = for; starting point = since." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I have had this phone for 2 years", "She has been here since morning", "They have known each other since 5 years", "We have lived here for a decade"], correctAnswer: "[0,1,3]", explanation: "'Since 5 years' should be 'for 5 years'." },
          { type: "ORDERING", question: "Put in order: has / she / here / worked / for / ten years", correctAnswer: "She,has worked,here,for ten years", explanation: "Subject + has + past participle + location + for + duration." },
          { type: "SPEECH", question: "I have studied English for five years.", correctAnswer: "I have studied English for five years.", language: "en", hint: "Talk about how long you've studied English" },
          { type: "SPEECH", question: "She has been a teacher since 2018.", correctAnswer: "She has been a teacher since 2018.", language: "en", hint: "Say how long someone has been in a job" },
        ]
      },
      {
        title: "Present Perfect vs Past Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which uses present perfect correctly?", options: ["I have visited Paris three times", "I have visited Paris last year", "I have visited Paris in 2020", "I have visited Paris yesterday"], correctAnswer: "0", explanation: "Present perfect for experience (no specific time): 'I have visited Paris three times'." },
          { type: "MCQ", question: "Which uses past simple correctly?", options: ["I went to Paris last summer", "I have gone to Paris last summer", "I went to Paris three times", "I have went to Paris last summer"], correctAnswer: "0", explanation: "Past simple with specific time: 'I went to Paris last summer'." },
          { type: "MCQ", question: "'I ___ my keys. I can't find them.'", options: ["have lost", "lost", "have lose", "losing"], correctAnswer: "0", explanation: "Present perfect for recent action with present result: 'I have lost my keys'." },
          { type: "MCQ", question: "'I ___ my keys yesterday, but I found them.'", options: ["lost", "have lost", "have lose", "losing"], correctAnswer: "0", explanation: "Past simple with specific time: 'I lost my keys yesterday'." },
          { type: "TRUE_FALSE", question: "True or False: 'I have seen him last week' is correct.", correctAnswer: "false", explanation: "Use past simple with 'last week': 'I saw him last week'." },
          { type: "TRUE_FALSE", question: "True or False: 'She has lived here since 2019' is correct.", correctAnswer: "true", explanation: "Present perfect with 'since' for an action continuing to now." },
          { type: "FILL_BLANK", question: "Complete: I ___ (see) that movie last night.", correctAnswer: "saw", explanation: "Past simple with specific time: 'I saw that movie last night'." },
          { type: "FILL_BLANK", question: "Complete: I ___ (see) that movie three times.", correctAnswer: "have seen", explanation: "Present perfect for life experience: 'I have seen that movie three times'." },
          { type: "FILL_BLANK", question: "Complete: She ___ (just/arrive). She's in the kitchen.", correctAnswer: "has just arrived", explanation: "'Just' with present perfect for very recent action." },
          { type: "MATCHING", question: "Match the sentence with the correct tense:", options: [{ left: "I lived in London in 2015", right: "Past Simple" }, { left: "I have lived in London for 5 years", right: "Present Perfect" }, { left: "Did you see the match?", right: "Past Simple" }, { left: "Have you seen the match?", right: "Present Perfect" }], correctAnswer: "[0,1,2,3]", explanation: "Specific past time = past simple; connection to present = present perfect." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I have been to Japan", "I went to Japan in 2022", "She has finished her work just now", "They have visited us yesterday"], correctAnswer: "[0,1]", explanation: "'Has finished just now' is awkward; 'visited us yesterday' should be past simple 'visited'." },
          { type: "ORDERING", question: "Put in order: have / you / ever / eaten / Mexican food?", correctAnswer: "Have,you ever,eaten,Mexican food?", explanation: "Experience question: Have + subject + ever + past participle + object?" },
          { type: "SPEECH", question: "I have already read this book twice.", correctAnswer: "I have already read this book twice.", language: "en", hint: "Talk about reading experience" },
          { type: "SPEECH", question: "She graduated from university last year.", correctAnswer: "She graduated from university last year.", language: "en", hint: "Talk about a past event with specific time" },
        ]
      },
      {
        title: "Module 3 Review: Present Perfect",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'We ___ each other since primary school.'", options: ["have known", "has known", "have knew", "knowing"], correctAnswer: "0", explanation: "'We' uses 'have' + past participle: 'have known'." },
          { type: "MCQ", question: "'___ you ___ the news today?'", options: ["Have,seen", "Did,seen", "Have,saw", "Did,see"], correctAnswer: "0", explanation: "Present perfect question: 'Have you seen the news today?'" },
          { type: "MCQ", question: "Choose the correct sentence:", options: ["I have never eaten snails", "I never have eaten snails", "I have eaten never snails", "I never eaten snails"], correctAnswer: "0", explanation: "'Never' goes between 'have' and past participle: 'I have never eaten'." },
          { type: "MCQ", question: "'He ___ his homework. Now he can play.'", options: ["has already finished", "has already finish", "have already finished", "already has finished"], correctAnswer: "0", explanation: "'He has already finished' for completed action with present result." },
          { type: "TRUE_FALSE", question: "True or False: 'I have went to that restaurant' is correct.", correctAnswer: "false", explanation: "Past participle of 'go' is 'gone': 'I have gone to that restaurant'." },
          { type: "TRUE_FALSE", question: "True or False: 'They haven't called me yet' is correct.", correctAnswer: "true", explanation: "'Yet' in negatives: 'haven't + past participle + yet'." },
          { type: "FILL_BLANK", question: "Complete: She ___ (work) at this company for 8 years.", correctAnswer: "has worked", explanation: "'She has worked' (present perfect with 'for')." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/finish) my project yet.", correctAnswer: "haven't finished", explanation: "Negative present perfect: 'haven't + past participle + yet'." },
          { type: "FILL_BLANK", question: "Complete: We ___ (know) each other since 2010.", correctAnswer: "have known", explanation: "'Have known' with 'since' for a continuing state." },
          { type: "MATCHING", question: "Match the time word with its tense:", options: [{ left: "yesterday", right: "Past Simple" }, { left: "ever", right: "Present Perfect" }, { left: "last week", right: "Past Simple" }, { left: "since", right: "Present Perfect" }], correctAnswer: "[0,1,2,3]", explanation: "Specific past time = past simple; experience/continuing = present perfect." },
          { type: "CHECKBOX", question: "Select all correct present perfect sentences:", options: ["I have been to Italy twice", "She has just left", "They have went shopping", "He has written three books"], correctAnswer: "[0,1,3]", explanation: "'Have went' is wrong; should be 'have gone'." },
          { type: "ORDERING", question: "Put in order: since / has / she / 2019 / here / lived", correctAnswer: "She,has lived,here,since 2019", explanation: "Subject + has + past participle + location + since + time." },
          { type: "SPEECH", question: "I have never been on a plane.", correctAnswer: "I have never been on a plane.", language: "en", hint: "Talk about something you haven't experienced" },
          { type: "SPEECH", question: "Have you finished your assignment yet?", correctAnswer: "Have you finished your assignment yet?", language: "en", hint: "Ask if someone has completed something" },
          { type: "SPEECH", question: "We have been friends since childhood.", correctAnswer: "We have been friends since childhood.", language: "en", hint: "Talk about a long-lasting relationship" },
        ]
      },
    ]
  },
  {
    title: "Modal Verbs",
    lessons: [
      {
        title: "Can, Could, and Be Able To",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I can swim", "I can to swim", "I can swimming", "I cans swim"], correctAnswer: "0", explanation: "'Can + base verb' expresses ability: 'I can swim'." },
          { type: "MCQ", question: "'___ you speak French?'", options: ["Can", "Do", "Are", "Is"], correctAnswer: "0", explanation: "'Can' asks about ability: 'Can you speak French?'" },
          { type: "MCQ", question: "'I ___ play the piano when I was five.'", options: ["could", "can", "could to", "can to"], correctAnswer: "0", explanation: "'Could' is the past of 'can': 'I could play when I was five'." },
          { type: "MCQ", question: "'She will ___ drive soon.'", options: ["be able to", "can", "could", "able"], correctAnswer: "0", explanation: "'Will be able to' for future ability." },
          { type: "TRUE_FALSE", question: "True or False: 'I can to cook' is correct.", correctAnswer: "false", explanation: "'Can' + base verb (no 'to'): 'I can cook'." },
          { type: "TRUE_FALSE", question: "True or False: 'Could' is used for past ability.", correctAnswer: "true", explanation: "'Could' expresses ability in the past: 'I could run fast when I was young'." },
          { type: "FILL_BLANK", question: "Complete: ___ you help me with this?", correctAnswer: "Can", explanation: "'Can you help me?' asks about ability/willingness." },
          { type: "FILL_BLANK", question: "Complete: She couldn't ___ the answer.", correctAnswer: "find", explanation: "'Couldn't' + base verb: 'She couldn't find the answer'." },
          { type: "FILL_BLANK", question: "Complete: I haven't been ___ to sleep well.", correctAnswer: "able", explanation: "'Been able to' for ability in present perfect." },
          { type: "MATCHING", question: "Match the modal with its meaning:", options: [{ left: "can", right: "Present ability" }, { left: "could", right: "Past ability" }, { left: "will be able to", right: "Future ability" }, { left: "can't", right: "Inability" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal expresses a different type of ability." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I can run fast", "She could dance well as a child", "He can to fix cars", "They will be able to attend"], correctAnswer: "[0,1,3]", explanation: "'Can to fix' is wrong. The others use ability modals correctly." },
          { type: "ORDERING", question: "Put in order: I / when / could / I / ride / a bike / was four", correctAnswer: "I,could ride,a bike,when I was four", explanation: "Subject + could + verb + object + past time." },
          { type: "SPEECH", question: "I can speak three languages fluently.", correctAnswer: "I can speak three languages fluently.", language: "en", hint: "Talk about your language abilities" },
          { type: "SPEECH", question: "She couldn't come to the party last night.", correctAnswer: "She couldn't come to the party last night.", language: "en", hint: "Say someone was unable to do something" },
        ]
      },
      {
        title: "Must and Have To",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You ___ wear a seatbelt in the car.'", options: ["must", "must to", "musts", "musted"], correctAnswer: "0", explanation: "'Must' + base verb for obligation: 'You must wear a seatbelt'." },
          { type: "MCQ", question: "'She ___ finish her homework before dinner.'", options: ["has to", "have to", "haves to", "having to"], correctAnswer: "0", explanation: "'She has to' (third person) for obligation." },
          { type: "MCQ", question: "What is the negative of 'must'?", options: ["must not / mustn't", "don't must", "not must", "mustn't to"], correctAnswer: "0", explanation: "'Must not' (mustn't) means it's forbidden/prohibited." },
          { type: "MCQ", question: "'You ___ smoke in the hospital.'", options: ["mustn't", "don't have to", "must", "haven't to"], correctAnswer: "0", explanation: "'Mustn't' = it's forbidden: 'You mustn't smoke in the hospital'." },
          { type: "TRUE_FALSE", question: "True or False: 'I have to go' and 'I must go' both express obligation.", correctAnswer: "true", explanation: "Both express obligation, but 'have to' is more common in everyday speech." },
          { type: "TRUE_FALSE", question: "True or False: 'He must to study harder' is correct.", correctAnswer: "false", explanation: "'Must' + base verb (no 'to'): 'He must study harder'." },
          { type: "FILL_BLANK", question: "Complete: Students ___ arrive on time.", correctAnswer: "must", explanation: "'Must' for rules/obligation: 'Students must arrive on time'." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/wear) a uniform at my school.", correctAnswer: "don't have to", explanation: "'Don't have to' = it's not necessary." },
          { type: "FILL_BLANK", question: "Complete: You ___ talk during the exam.", correctAnswer: "mustn't", explanation: "'Mustn't' = it's prohibited: 'You mustn't talk during the exam'." },
          { type: "MATCHING", question: "Match the modal with its meaning:", options: [{ left: "must", right: "Strong obligation" }, { left: "have to", right: "External obligation" }, { left: "mustn't", right: "Prohibition" }, { left: "don't have to", right: "No obligation" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal expresses a different level of obligation." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["You must follow the rules", "She has to work late", "He must to leave now", "We don't have to pay"], correctAnswer: "[0,1,3]", explanation: "'Must to leave' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / you / your seatbelt / wear", correctAnswer: "You,must wear,your seatbelt", explanation: "Subject + must + verb + object." },
          { type: "SPEECH", question: "You must see a doctor about that cough.", correctAnswer: "You must see a doctor about that cough.", language: "en", hint: "Give strong advice about health" },
          { type: "SPEECH", question: "I have to wake up at 6 AM every day.", correctAnswer: "I have to wake up at 6 AM every day.", language: "en", hint: "Talk about a daily obligation" },
        ]
      },
      {
        title: "Should and Shouldn't for Advice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You ___ eat more vegetables.'", options: ["should", "should to", "shoulds", "shoulded"], correctAnswer: "0", explanation: "'Should' + base verb for advice: 'You should eat more vegetables'." },
          { type: "MCQ", question: "'She ___ study harder for the exam.'", options: ["should", "shoulds", "should to", "shoulded"], correctAnswer: "0", explanation: "'Should' is the same for all subjects: 'She should study harder'." },
          { type: "MCQ", question: "What is the negative form?", options: ["should not / shouldn't", "don't should", "not should", "shouldn't to"], correctAnswer: "0", explanation: "'Should not' contracts to 'shouldn't'." },
          { type: "MCQ", question: "'You ___ spend so much time on your phone.'", options: ["shouldn't", "should", "shouldn't to", "don't should"], correctAnswer: "0", explanation: "'Shouldn't' for advice against something: 'You shouldn't spend so much time'." },
          { type: "TRUE_FALSE", question: "True or False: 'Should' is used to give advice and recommendations.", correctAnswer: "true", explanation: "'Should' is the most common way to give advice in English." },
          { type: "TRUE_FALSE", question: "True or False: 'He should to apologize' is correct.", correctAnswer: "false", explanation: "'Should' + base verb (no 'to'): 'He should apologize'." },
          { type: "FILL_BLANK", question: "Complete: You ___ drink more water every day.", correctAnswer: "should", explanation: "'Should' for health advice: 'You should drink more water'." },
          { type: "FILL_BLANK", question: "Complete: They ___ go to bed so late.", correctAnswer: "shouldn't", explanation: "'Shouldn't' for advice against: 'They shouldn't go to bed so late'." },
          { type: "FILL_BLANK", question: "Complete: ___ I call her? Yes, you ___.", correctAnswer: "Should,should", explanation: "Question: 'Should I call her?' Answer: 'Yes, you should'." },
          { type: "MATCHING", question: "Match the advice with the situation:", options: [{ left: "You should rest", right: "When sick" }, { left: "You shouldn't eat junk food", right: "For health" }, { left: "You should practice daily", right: "For improvement" }, { left: "You shouldn't be late", right: "For meetings" }], correctAnswer: "[0,1,2,3]", explanation: "Each piece of advice fits its situation." },
          { type: "CHECKBOX", question: "Select all correct advice sentences:", options: ["You should exercise regularly", "She shouldn't skip breakfast", "He should to read more", "We should save money"], correctAnswer: "[0,1,3]", explanation: "'Should to read' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: should / you / more / read / books", correctAnswer: "You,should read,more books", explanation: "Subject + should + verb + object." },
          { type: "SPEECH", question: "You should get more sleep at night.", correctAnswer: "You should get more sleep at night.", language: "en", hint: "Give advice about sleep" },
          { type: "SPEECH", question: "She shouldn't worry so much about the test.", correctAnswer: "She shouldn't worry so much about the test.", language: "en", hint: "Give advice about not worrying" },
        ]
      },
      {
        title: "May and Might for Possibility",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'It ___ rain later today.'", options: ["might", "might to", "mights", "mighted"], correctAnswer: "0", explanation: "'Might' + base verb for possibility: 'It might rain'." },
          { type: "MCQ", question: "'She ___ come to the party.' (possible)", options: ["may", "must", "can", "should"], correctAnswer: "0", explanation: "'May' expresses possibility: 'She may come to the party'." },
          { type: "MCQ", question: "Which expresses less certainty?", options: ["might", "will", "must", "should"], correctAnswer: "0", explanation: "'Might' suggests less certainty than 'may'." },
          { type: "MCQ", question: "'We ___ go to the beach if the weather is good.'", options: ["might", "must", "should to", "have to"], correctAnswer: "0", explanation: "'Might' for conditional possibility: 'We might go if the weather is good'." },
          { type: "TRUE_FALSE", question: "True or False: 'I may be late' means it's possible I'll be late.", correctAnswer: "true", explanation: "'May' expresses possibility: there's a chance of being late." },
          { type: "TRUE_FALSE", question: "True or False: 'He might to join us' is correct.", correctAnswer: "false", explanation: "'Might' + base verb (no 'to'): 'He might join us'." },
          { type: "FILL_BLANK", question: "Complete: I ___ travel to Europe this summer.", correctAnswer: "may", explanation: "'May' for future possibility: 'I may travel to Europe'." },
          { type: "FILL_BLANK", question: "Complete: They ___ not have enough time.", correctAnswer: "might", explanation: "'Might not' for negative possibility: 'They might not have enough time'." },
          { type: "FILL_BLANK", question: "Complete: She ___ be at home. I'm not sure.", correctAnswer: "may", explanation: "'May' when uncertain: 'She may be at home'." },
          { type: "MATCHING", question: "Match the sentence with its meaning:", options: [{ left: "It will rain", right: "Certainty" }, { left: "It may rain", right: "Possibility" }, { left: "It might rain", right: "Less possibility" }, { left: "It won't rain", right: "Negative certainty" }], correctAnswer: "[0,1,2,3]", explanation: "Different modals express different levels of certainty." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["She may arrive late", "It might snow tonight", "He may to come", "They might not agree"], correctAnswer: "[0,1,3]", explanation: "'May to come' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: might / we / the / win / game", correctAnswer: "We,might win,the game", explanation: "Subject + might + verb + object." },
          { type: "SPEECH", question: "I may visit my grandparents this weekend.", correctAnswer: "I may visit my grandparents this weekend.", language: "en", hint: "Talk about a possible weekend plan" },
          { type: "SPEECH", question: "It might be cold tomorrow, so bring a jacket.", correctAnswer: "It might be cold tomorrow, so bring a jacket.", language: "en", hint: "Warn about possible weather" },
        ]
      },
      {
        title: "Module 4 Review: Modal Verbs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You ___ drive without a license.'", options: ["mustn't", "should", "may", "can"], correctAnswer: "0", explanation: "'Mustn't' = it's forbidden: 'You mustn't drive without a license'." },
          { type: "MCQ", question: "'___ I borrow your pen?' (polite request)", options: ["Could", "Must", "Should", "Have to"], correctAnswer: "0", explanation: "'Could' for polite requests: 'Could I borrow your pen?'" },
          { type: "MCQ", question: "'She ___ speak three languages.'", options: ["can", "cans", "can to", "can to"], correctAnswer: "0", explanation: "'Can' + base verb for ability: 'She can speak three languages'." },
          { type: "MCQ", question: "'You ___ see a doctor if you feel sick.'", options: ["should", "must to", "should to", "shoulds"], correctAnswer: "0", explanation: "'Should' for advice: 'You should see a doctor'." },
          { type: "TRUE_FALSE", question: "True or False: 'He must wears a uniform' is correct.", correctAnswer: "false", explanation: "'Must' + base verb: 'He must wear a uniform'." },
          { type: "TRUE_FALSE", question: "True or False: 'It may rain tomorrow' expresses possibility.", correctAnswer: "true", explanation: "'May' for possibility: there's a chance of rain." },
          { type: "FILL_BLANK", question: "Complete: I ___ finish this report by Friday. (obligation)", correctAnswer: "have to", explanation: "'Have to' for obligation: 'I have to finish this report'." },
          { type: "FILL_BLANK", question: "Complete: You ___ eat so much sugar. (advice against)", correctAnswer: "shouldn't", explanation: "'Shouldn't' for advice against: 'You shouldn't eat so much sugar'." },
          { type: "FILL_BLANK", question: "Complete: She ___ come to the meeting. She's not sure.", correctAnswer: "might", explanation: "'Might' for uncertain possibility: 'She might come'." },
          { type: "MATCHING", question: "Match the modal with its function:", options: [{ left: "can", right: "Ability" }, { left: "must", right: "Obligation" }, { left: "should", right: "Advice" }, { left: "might", right: "Possibility" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal serves a different function." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["You should eat healthier", "She can plays the piano", "He mustn't be late", "They might travel abroad"], correctAnswer: "[0,2,3]", explanation: "'Can plays' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / we / follow / the / rules", correctAnswer: "We,must follow,the rules", explanation: "Subject + must + verb + object." },
          { type: "SPEECH", question: "You should apologize for what you said.", correctAnswer: "You should apologize for what you said.", language: "en", hint: "Give advice about apologizing" },
          { type: "SPEECH", question: "I might go to the gym later today.", correctAnswer: "I might go to the gym later today.", language: "en", hint: "Talk about a possible activity" },
          { type: "SPEECH", question: "Can you help me with this project?", correctAnswer: "Can you help me with this project?", language: "en", hint: "Make a polite request for help" },
        ]
      },
    ]
  },
  {
    title: "Comparatives and Superlatives",
    lessons: [
      {
        title: "Comparative Adjectives",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["She is taller than me", "She is more tall than me", "She is tallest than me", "She is tall than me"], correctAnswer: "0", explanation: "Short adjectives add '-er': tall -> taller." },
          { type: "MCQ", question: "'This book is ___ than that one.'", options: ["more interesting", "interestinger", "most interesting", "interesting"], correctAnswer: "0", explanation: "Long adjectives use 'more': more interesting." },
          { type: "MCQ", question: "What is the comparative of 'good'?", options: ["better", "gooder", "more good", "best"], correctAnswer: "0", explanation: "'Good' is irregular: good -> better." },
          { type: "MCQ", question: "'Cars are ___ than bicycles.'", options: ["faster", "more fast", "fastest", "fast"], correctAnswer: "0", explanation: "'Fast' -> 'faster': Cars are faster than bicycles." },
          { type: "TRUE_FALSE", question: "True or False: 'This room is more big than that one' is correct.", correctAnswer: "false", explanation: "'Big' -> 'bigger': 'This room is bigger than that one'." },
          { type: "TRUE_FALSE", question: "True or False: 'She is more beautiful than her sister' is correct.", correctAnswer: "true", explanation: "Long adjectives (3+ syllables) use 'more': more beautiful." },
          { type: "FILL_BLANK", question: "Complete: This test is ___ (easy) than the last one.", correctAnswer: "easier", explanation: "'Easy' -> 'easier': change 'y' to 'i' + 'er'." },
          { type: "FILL_BLANK", question: "Complete: My brother is ___ (old) than me.", correctAnswer: "older", explanation: "'Old' -> 'older': 'My brother is older than me'." },
          { type: "FILL_BLANK", question: "Complete: This city is ___ (crowded) than my hometown.", correctAnswer: "more crowded", explanation: "Long adjective: 'more crowded'." },
          { type: "MATCHING", question: "Match the adjective with its comparative:", options: [{ left: "hot", right: "hotter" }, { left: "expensive", right: "more expensive" }, { left: "bad", right: "worse" }, { left: "happy", right: "happier" }], correctAnswer: "[0,1,2,3]", explanation: "Each adjective has its correct comparative form." },
          { type: "CHECKBOX", question: "Select all correct comparative sentences:", options: ["He is stronger than me", "This is more important", "She is more smart", "It's colder today"], correctAnswer: "[0,1,3]", explanation: "'More smart' is wrong; should be 'smarter'." },
          { type: "ORDERING", question: "Put in order: than / is / faster / a car / a bike", correctAnswer: "A car,is faster than,a bike", explanation: "Subject + is + comparative + than + object." },
          { type: "SPEECH", question: "English is easier than math for me.", correctAnswer: "English is easier than math for me.", language: "en", hint: "Compare two subjects" },
          { type: "SPEECH", question: "My house is bigger than my neighbor's.", correctAnswer: "My house is bigger than my neighbor's.", language: "en", hint: "Compare two houses" },
        ]
      },
      {
        title: "Superlative Adjectives",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["She is the tallest in the class", "She is the most tallest in the class", "She is the taller in the class", "She is tallest in the class"], correctAnswer: "0", explanation: "Superlative: 'the' + adjective + '-est': the tallest." },
          { type: "MCQ", question: "'This is the ___ movie I've ever seen.'", options: ["most boring", "boringest", "boringer", "more boring"], correctAnswer: "0", explanation: "Long adjectives: 'the most + adjective': the most boring." },
          { type: "MCQ", question: "What is the superlative of 'good'?", options: ["the best", "the goodest", "the most good", "the better"], correctAnswer: "0", explanation: "'Good' is irregular: good -> better -> the best." },
          { type: "MCQ", question: "'Mount Everest is the ___ mountain in the world.'", options: ["highest", "most high", "higher", "high"], correctAnswer: "0", explanation: "'High' -> 'highest': the highest mountain." },
          { type: "TRUE_FALSE", question: "True or False: 'He is the most smartest student' is correct.", correctAnswer: "false", explanation: "'Smart' -> 'smartest': 'He is the smartest student' (don't use 'most' with '-est')." },
          { type: "TRUE_FALSE", question: "True or False: 'This is the most beautiful painting' is correct.", correctAnswer: "true", explanation: "Long adjective: 'the most beautiful'." },
          { type: "FILL_BLANK", question: "Complete: She is the ___ (fast) runner on the team.", correctAnswer: "fastest", explanation: "'Fast' -> 'fastest': the fastest runner." },
          { type: "FILL_BLANK", question: "Complete: This is the ___ (interesting) book I've read.", correctAnswer: "most interesting", explanation: "Long adjective: 'the most interesting'." },
          { type: "FILL_BLANK", question: "Complete: Today is the ___ (cold) day of the year.", correctAnswer: "coldest", explanation: "'Cold' -> 'coldest': the coldest day." },
          { type: "MATCHING", question: "Match the adjective with its superlative:", options: [{ left: "big", right: "the biggest" }, { left: "dangerous", right: "the most dangerous" }, { left: "far", right: "the farthest" }, { left: "funny", right: "the funniest" }], correctAnswer: "[0,1,2,3]", explanation: "Each adjective has its correct superlative form." },
          { type: "CHECKBOX", question: "Select all correct superlative sentences:", options: ["He is the best player", "This is the most expensive car", "She is the most prettiest", "It's the longest river"], correctAnswer: "[0,1,3]", explanation: "'Most prettiest' is wrong; should be 'prettiest'." },
          { type: "ORDERING", question: "Put in order: the / is / elephant / land / the / largest / animal / on", correctAnswer: "The elephant,is the largest animal,on land", explanation: "Subject + is + the + superlative + noun + location." },
          { type: "SPEECH", question: "This is the most delicious cake I've ever tasted.", correctAnswer: "This is the most delicious cake I've ever tasted.", language: "en", hint: "Talk about the best food you've had" },
          { type: "SPEECH", question: "She is the hardest working student in the class.", correctAnswer: "She is the hardest working student in the class.", language: "en", hint: "Describe the most hardworking person" },
        ]
      },
      {
        title: "Irregular Comparisons",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the comparative of 'bad'?", options: ["worse", "badder", "more bad", "worst"], correctAnswer: "0", explanation: "'Bad' is irregular: bad -> worse." },
          { type: "MCQ", question: "What is the superlative of 'far'?", options: ["the farthest", "the farer", "the most far", "the farest"], correctAnswer: "0", explanation: "'Far' is irregular: far -> farther/further -> the farthest." },
          { type: "MCQ", question: "'My grade is ___ than yours.' (bad)", options: ["worse", "badder", "more bad", "worst"], correctAnswer: "0", explanation: "Comparative of 'bad': 'My grade is worse than yours'." },
          { type: "MCQ", question: "'This is the ___ day of my life.' (good)", options: ["best", "goodest", "most good", "better"], correctAnswer: "0", explanation: "Superlative of 'good': 'This is the best day of my life'." },
          { type: "TRUE_FALSE", question: "True or False: 'This book is badder than that one' is correct.", correctAnswer: "false", explanation: "'Bad' -> 'worse': 'This book is worse than that one'." },
          { type: "TRUE_FALSE", question: "True or False: 'She is the best singer in the competition' is correct.", correctAnswer: "true", explanation: "Superlative of 'good' = 'best': 'the best singer'." },
          { type: "FILL_BLANK", question: "Complete: His health is ___ (bad) than last month.", correctAnswer: "worse", explanation: "Comparative of 'bad': 'worse than'." },
          { type: "FILL_BLANK", question: "Complete: This is the ___ (far) I've ever traveled.", correctAnswer: "farthest", explanation: "Superlative of 'far': 'the farthest'." },
          { type: "FILL_BLANK", question: "Complete: The weather today is ___ (good) than yesterday.", correctAnswer: "better", explanation: "Comparative of 'good': 'better than'." },
          { type: "MATCHING", question: "Match the forms of irregular adjectives:", options: [{ left: "good - better - best", right: "Quality" }, { left: "bad - worse - worst", right: "Negative quality" }, { left: "far - farther - farthest", right: "Distance" }, { left: "little - less - least", right: "Amount" }], correctAnswer: "[0,1,2,3]", explanation: "Each set shows the irregular forms." },
          { type: "CHECKBOX", question: "Select all correct irregular comparisons:", options: ["This movie is worse than the first one", "She is the best player", "It's the most far station", "My cold is worse today"], correctAnswer: "[0,1,3]", explanation: "'Most far' is wrong; should be 'farthest'." },
          { type: "ORDERING", question: "Put in order: the / worse / exam / was / this / than / the last", correctAnswer: "This exam,was worse than,the last", explanation: "Subject + was + comparative + than + object." },
          { type: "SPEECH", question: "This is the worst movie I have ever seen.", correctAnswer: "This is the worst movie I have ever seen.", language: "en", hint: "Talk about the worst movie" },
          { type: "SPEECH", question: "My English is better than it was last year.", correctAnswer: "My English is better than it was last year.", language: "en", hint: "Talk about improvement" },
        ]
      },
      {
        title: "Comparisons with As...As",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["She is as tall as her brother", "She is as taller as her brother", "She is as tall than her brother", "She is as tallest as her brother"], correctAnswer: "0", explanation: "'As + adjective + as' for equality: 'as tall as'." },
          { type: "MCQ", question: "'This book is not ___ that one.'", options: ["as interesting as", "as interesting than", "more interesting as", "interesting as"], correctAnswer: "0", explanation: "Negative comparison: 'not as interesting as'." },
          { type: "MCQ", question: "'He runs ___ me.'", options: ["as fast as", "as faster as", "as fast than", "so fast as"], correctAnswer: "0", explanation: "'As fast as' for equal ability." },
          { type: "MCQ", question: "Which expresses inequality?", options: ["not as...as", "as...as", "the same as", "equal to"], correctAnswer: "0", explanation: "'Not as...as' shows inequality: 'not as big as'." },
          { type: "TRUE_FALSE", question: "True or False: 'She is as smarter as him' is correct.", correctAnswer: "false", explanation: "Use base adjective: 'She is as smart as him'." },
          { type: "TRUE_FALSE", question: "True or False: 'This bag is not as expensive as that one' is correct.", correctAnswer: "true", explanation: "Negative comparison: 'not as expensive as'." },
          { type: "FILL_BLANK", question: "Complete: He is as ___ (tall) as his father.", correctAnswer: "tall", explanation: "Use base adjective: 'as tall as'." },
          { type: "FILL_BLANK", question: "Complete: Today is not as ___ (hot) as yesterday.", correctAnswer: "hot", explanation: "Negative comparison: 'not as hot as'." },
          { type: "FILL_BLANK", question: "Complete: She sings as ___ (beautiful) as a professional.", correctAnswer: "beautifully", explanation: "For verbs, use adverb: 'sings as beautifully as'." },
          { type: "MATCHING", question: "Match the comparison type:", options: [{ left: "as big as", right: "Equality" }, { left: "not as big as", right: "Inequality" }, { left: "bigger than", right: "Comparative" }, { left: "the biggest", right: "Superlative" }], correctAnswer: "[0,1,2,3]", explanation: "Each shows a different comparison structure." },
          { type: "CHECKBOX", question: "Select all correct 'as...as' sentences:", options: ["She is as smart as him", "This isn't as easy as I thought", "He is as taller as me", "The room is as clean as before"], correctAnswer: "[0,1,3]", explanation: "'As taller as' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: as / not / this / expensive / is / as / that", correctAnswer: "This,is not as expensive as,that", explanation: "Subject + is + not + as + adjective + as + object." },
          { type: "SPEECH", question: "My new phone is as good as my old one.", correctAnswer: "My new phone is as good as my old one.", language: "en", hint: "Compare two phones" },
          { type: "SPEECH", question: "This test was not as difficult as I expected.", correctAnswer: "This test was not as difficult as I expected.", language: "en", hint: "Talk about a test being easier than expected" },
        ]
      },
      {
        title: "Module 5 Review: Comparisons",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She is the ___ student in the class.' (intelligent)", options: ["most intelligent", "intelligentest", "more intelligent", "intelligent"], correctAnswer: "0", explanation: "Long adjective superlative: 'the most intelligent'." },
          { type: "MCQ", question: "'My car is ___ than yours.' (fast)", options: ["faster", "more fast", "fastest", "fast"], correctAnswer: "0", explanation: "Comparative: 'faster than'." },
          { type: "MCQ", question: "'This is the ___ meal I've ever had.' (good)", options: ["best", "goodest", "most good", "better"], correctAnswer: "0", explanation: "Superlative of 'good': 'the best'." },
          { type: "MCQ", question: "'He is not as ___ as his brother.' (strong)", options: ["strong", "stronger", "strongest", "more strong"], correctAnswer: "0", explanation: "'As + base adjective + as': 'not as strong as'." },
          { type: "TRUE_FALSE", question: "True or False: 'This is the most cheap hotel' is correct.", correctAnswer: "false", explanation: "'Cheap' -> 'cheapest': 'the cheapest hotel'." },
          { type: "TRUE_FALSE", question: "True or False: 'Her English is worse than mine' is correct.", correctAnswer: "true", explanation: "'Worse' is the comparative of 'bad'." },
          { type: "FILL_BLANK", question: "Complete: This is the ___ (bad) movie I've ever seen.", correctAnswer: "worst", explanation: "Superlative of 'bad': 'the worst'." },
          { type: "FILL_BLANK", question: "Complete: Your house is as ___ (nice) as mine.", correctAnswer: "nice", explanation: "'As nice as' for equality." },
          { type: "FILL_BLANK", question: "Complete: She is ___ (young) than all her friends.", correctAnswer: "younger", explanation: "Comparative: 'younger than'." },
          { type: "MATCHING", question: "Match the sentence with the comparison type:", options: [{ left: "She is as tall as me", right: "Equality" }, { left: "He is taller than me", right: "Comparative" }, { left: "She is the tallest", right: "Superlative" }, { left: "He is not as tall", right: "Inequality" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence shows a different comparison." },
          { type: "CHECKBOX", question: "Select all correct comparison sentences:", options: ["This is more convenient", "She is the most kind", "He is as fast as me", "It's the hottest day"], correctAnswer: "[0,2,3]", explanation: "'Most kind' is awkward; 'kindest' is better. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / this / restaurant / in / city / best / is / the", correctAnswer: "This restaurant,is the best in the city", explanation: "Subject + is + the + superlative + location." },
          { type: "SPEECH", question: "This coffee is not as strong as I like it.", correctAnswer: "This coffee is not as strong as I like it.", language: "en", hint: "Complain about weak coffee" },
          { type: "SPEECH", question: "My sister is the most talented person I know.", correctAnswer: "My sister is the most talented person I know.", language: "en", hint: "Praise someone's talent" },
          { type: "SPEECH", question: "Learning English is more important than learning any other language.", correctAnswer: "Learning English is more important than learning any other language.", language: "en", hint: "Compare importance of languages" },
        ]
      },
    ]
  },
  {
    title: "Everyday Conversations",
    lessons: [
      {
        title: "At the Restaurant",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What do you say to order food?", options: ["I would like the chicken, please", "I want chicken now", "Give me chicken", "Chicken for me"], correctAnswer: "0", explanation: "'I would like...' is polite for ordering." },
          { type: "MCQ", question: "What does the waiter say?", options: ["Are you ready to order?", "Do you eat now?", "You want food?", "What you take?"], correctAnswer: "0", explanation: "'Are you ready to order?' is the polite question." },
          { type: "MCQ", question: "How do you ask for the bill?", options: ["Can I have the bill, please?", "Give me money paper", "I want to pay now", "Bill for me"], correctAnswer: "0", explanation: "'Can I have the bill, please?' is polite." },
          { type: "MCQ", question: "'Would you like something to ___?'", options: ["drink", "drinking", "drinks", "drank"], correctAnswer: "0", explanation: "'Would you like something to drink?'" },
          { type: "TRUE_FALSE", question: "True or False: 'I'll have the soup' is a correct way to order.", correctAnswer: "true", explanation: "'I'll have...' is a common way to order food." },
          { type: "TRUE_FALSE", question: "True or False: 'Give me food' is polite in a restaurant.", correctAnswer: "false", explanation: "'Give me' is rude. Use 'Could I have...' or 'I'd like...'." },
          { type: "FILL_BLANK", question: "Complete: A table for two, ___.", correctAnswer: "please", explanation: "'A table for two, please' is polite." },
          { type: "FILL_BLANK", question: "Complete: Could I see the ___, please? (list of food)", correctAnswer: "menu", explanation: "'Could I see the menu, please?'" },
          { type: "FILL_BLANK", question: "Complete: The food was ___. Thank you! (positive)", correctAnswer: "delicious", explanation: "'The food was delicious' is a compliment." },
          { type: "MATCHING", question: "Match the phrase with its meaning:", options: [{ left: "I'd like a table for four", right: "Reservation" }, { left: "What are today's specials?", right: "Asking recommendations" }, { left: "Can I get this to go?", right: "Takeaway" }, { left: "Keep the change", right: "Tip" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase is used in a restaurant context." },
          { type: "CHECKBOX", question: "Select all polite restaurant phrases:", options: ["Could I have some water?", "I'd like the steak, please", "Bring me food now", "Can we get the check?"], correctAnswer: "[0,1,3]", explanation: "'Bring me food now' is rude. The others are polite." },
          { type: "ORDERING", question: "Put in order: I / soup / would / the / like", correctAnswer: "I,would like,the soup", explanation: "Polite order: I + would like + the + item." },
          { type: "SPEECH", question: "Could I have a glass of water, please?", correctAnswer: "Could I have a glass of water, please?", language: "en", hint: "Ask for water politely" },
          { type: "SPEECH", question: "I'll have the grilled chicken with salad.", correctAnswer: "I'll have the grilled chicken with salad.", language: "en", hint: "Order a main course" },
        ]
      },
      {
        title: "Shopping and Clothes",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you ask for the price?", options: ["How much is this?", "What cost this?", "This price what?", "How many money?"], correctAnswer: "0", explanation: "'How much is this?' asks for the price." },
          { type: "MCQ", question: "'Can I try this ___?'", options: ["on", "in", "at", "for"], correctAnswer: "0", explanation: "'Try on' means to test clothes: 'Can I try this on?'" },
          { type: "MCQ", question: "'Do you have this in a ___ size?'", options: ["larger", "more large", "large", "most large"], correctAnswer: "0", explanation: "'Larger' is the comparative for sizes." },
          { type: "MCQ", question: "What do you say at the checkout?", options: ["I'll take it", "I take this", "I am taking", "I will taking"], correctAnswer: "0", explanation: "'I'll take it' means you want to buy it." },
          { type: "TRUE_FALSE", question: "True or False: 'Where is the fitting room?' asks where to try clothes.", correctAnswer: "true", explanation: "'Fitting room' or 'changing room' is where you try clothes." },
          { type: "TRUE_FALSE", question: "True or False: 'This is too expensive' means it's cheap.", correctAnswer: "false", explanation: "'Too expensive' means it costs too much money." },
          { type: "FILL_BLANK", question: "Complete: Do you accept credit ___?", correctAnswer: "cards", explanation: "'Do you accept credit cards?'" },
          { type: "FILL_BLANK", question: "Complete: Is this on ___? (reduced price)", correctAnswer: "sale", explanation: "'Is this on sale?' asks about a discount." },
          { type: "FILL_BLANK", question: "Complete: I'm just ___, thank you. (not buying)", correctAnswer: "browsing", explanation: "'I'm just browsing' means looking without buying." },
          { type: "MATCHING", question: "Match the shopping phrase:", options: [{ left: "Can I get a discount?", right: "Asking for lower price" }, { left: "Do you have this in medium?", right: "Asking for size" }, { left: "I'd like to return this", right: "Returning an item" }, { left: "Can I pay by card?", right: "Payment method" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase is used in a shopping context." },
          { type: "CHECKBOX", question: "Select all correct shopping phrases:", options: ["How much does this cost?", "Can I try these on?", "I want buy this", "Do you have this in blue?"], correctAnswer: "[0,1,3]", explanation: "'I want buy' is wrong; should be 'I want to buy'. The others are correct." },
          { type: "ORDERING", question: "Put in order: much / how / this / does / cost?", correctAnswer: "How much,does this cost?", explanation: "Price question: How much + does + item + cost?" },
          { type: "SPEECH", question: "Excuse me, where can I find the shoes?", correctAnswer: "Excuse me, where can I find the shoes?", language: "en", hint: "Ask for shoe section in a store" },
          { type: "SPEECH", question: "This shirt doesn't fit. Do you have a smaller size?", correctAnswer: "This shirt doesn't fit. Do you have a smaller size?", language: "en", hint: "Ask for a different size" },
        ]
      },
      {
        title: "Asking for and Giving Directions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you ask for directions?", options: ["Excuse me, how do I get to the station?", "Where station is?", "Tell me station direction", "I want go station"], correctAnswer: "0", explanation: "'Excuse me, how do I get to...?' is polite." },
          { type: "MCQ", question: "'Go ___ this street for two blocks.'", options: ["straight down", "straight to", "straight at", "straight on"], correctAnswer: "0", explanation: "'Go straight down this street' means continue forward." },
          { type: "MCQ", question: "'Turn ___ at the traffic lights.'", options: ["left", "to left", "at left", "in left"], correctAnswer: "0", explanation: "'Turn left' or 'turn right' (no preposition)." },
          { type: "MCQ", question: "'It's ___ the bank and the post office.'", options: ["between", "among", "middle", "center"], correctAnswer: "0", explanation: "'Between' is used for two things: 'between A and B'." },
          { type: "TRUE_FALSE", question: "True or False: 'It's on your right' means it's on the right side.", correctAnswer: "true", explanation: "'On your right/left' gives the side of the street." },
          { type: "TRUE_FALSE", question: "True or False: 'Go past the supermarket' means stop at it.", correctAnswer: "false", explanation: "'Go past' means continue beyond it, don't stop." },
          { type: "FILL_BLANK", question: "Complete: Take the second ___ on the right.", correctAnswer: "turning", explanation: "'Take the second turning on the right'." },
          { type: "FILL_BLANK", question: "Complete: It's ___ from the park. (opposite side)", correctAnswer: "across", explanation: "'It's across from the park'." },
          { type: "FILL_BLANK", question: "Complete: Go ___ the bridge and turn left.", correctAnswer: "over", explanation: "'Go over the bridge' means cross it." },
          { type: "MATCHING", question: "Match the direction with its meaning:", options: [{ left: "Go straight ahead", right: "Continue forward" }, { left: "Turn right", right: "Change direction to right" }, { left: "It's on the corner", right: "At the intersection" }, { left: "Go past the hospital", right: "Continue beyond it" }], correctAnswer: "[0,1,2,3]", explanation: "Each direction phrase has a clear meaning." },
          { type: "CHECKBOX", question: "Select all correct direction phrases:", options: ["It's next to the bank", "Turn left at the lights", "Go straight on for 100 meters", "It's between from the school"], correctAnswer: "[0,1,2]", explanation: "'Between from' is wrong; should be 'between'. The others are correct." },
          { type: "ORDERING", question: "Put in order: left / the / turn / at / corner", correctAnswer: "Turn left,at the corner", explanation: "Direction: Turn + direction + at + location." },
          { type: "SPEECH", question: "Excuse me, is there a pharmacy near here?", correctAnswer: "Excuse me, is there a pharmacy near here?", language: "en", hint: "Ask for a nearby pharmacy" },
          { type: "SPEECH", question: "Go straight and then turn right at the second street.", correctAnswer: "Go straight and then turn right at the second street.", language: "en", hint: "Give directions to someone" },
        ]
      },
      {
        title: "Making Plans and Invitations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you invite someone?", options: ["Would you like to come to my party?", "You come my party", "Come to my party now", "I want you come party"], correctAnswer: "0", explanation: "'Would you like to...?' is a polite invitation." },
          { type: "MCQ", question: "How do you accept an invitation?", options: ["Yes, I'd love to!", "I am loving it", "Yes I love", "I would loving"], correctAnswer: "0", explanation: "'Yes, I'd love to!' is the standard acceptance." },
          { type: "MCQ", question: "How do you politely decline?", options: ["I'm sorry, I can't. I have other plans", "No, I don't want", "I am not coming", "I will not go"], correctAnswer: "0", explanation: "'I'm sorry, I can't' with a reason is polite." },
          { type: "MCQ", question: "'Are you ___ on Saturday?'", options: ["free", "freedom", "freely", "freeing"], correctAnswer: "0", explanation: "'Are you free on Saturday?' asks about availability." },
          { type: "TRUE_FALSE", question: "True or False: 'What about going to the movies?' suggests an idea.", correctAnswer: "true", explanation: "'What about + verb-ing?' is used to make suggestions." },
          { type: "TRUE_FALSE", question: "True or False: 'Let's meet at 7' is a way to suggest a time.", correctAnswer: "true", explanation: "'Let's + verb' is used for suggestions: 'Let's meet at 7'." },
          { type: "FILL_BLANK", question: "Complete: ___ you like to join us for dinner?", correctAnswer: "Would", explanation: "'Would you like to join us?' is a polite invitation." },
          { type: "FILL_BLANK", question: "Complete: Let's ___ it rain. (postpone)", correctAnswer: "put", explanation: "'Put it off' means postpone, but here: 'Let's do it another time'." },
          { type: "FILL_BLANK", question: "Complete: How about we go to the ___ this weekend?", correctAnswer: "beach", explanation: "'How about we go to the beach?' suggests an activity." },
          { type: "MATCHING", question: "Match the invitation response:", options: [{ left: "Sounds great!", right: "Accepting" }, { left: "I'd love to, but I'm busy", right: "Polite declining" }, { left: "Maybe another time", right: "Uncertain" }, { left: "What time should I come?", right: "Accepting with question" }], correctAnswer: "[0,1,2,3]", explanation: "Each response matches its situation." },
          { type: "CHECKBOX", question: "Select all correct invitation phrases:", options: ["Do you want to hang out?", "Let's grab coffee sometime", "You must come my house", "Are you free this evening?"], correctAnswer: "[0,1,3]", explanation: "'You must come my house' needs 'to': 'to my house'. The others are correct." },
          { type: "ORDERING", question: "Put in order: like / you / would / to / come / with us?", correctAnswer: "Would,you like to,come with us?", explanation: "Invitation: Would + you + like to + verb + with us?" },
          { type: "SPEECH", question: "Would you like to go to the cinema tonight?", correctAnswer: "Would you like to go to the cinema tonight?", language: "en", hint: "Invite someone to the movies" },
          { type: "SPEECH", question: "I'm sorry, I can't make it. I have to work late.", correctAnswer: "I'm sorry, I can't make it. I have to work late.", language: "en", hint: "Decline an invitation politely" },
        ]
      },
      {
        title: "Module 6 Review: Everyday Conversations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you politely ask for the menu?", options: ["Could I see the menu, please?", "Give me menu", "Menu now", "I want menu"], correctAnswer: "0", explanation: "'Could I see the menu, please?' is polite." },
          { type: "MCQ", question: "'Excuse me, where is the nearest ___?'", options: ["ATM", "atm", "an ATM", "a ATM"], correctAnswer: "0", explanation: "'The nearest ATM' asks for the closest one." },
          { type: "MCQ", question: "How do you say you're only looking in a shop?", options: ["I'm just browsing, thanks", "I only look", "No buy, just see", "I am looking only"], correctAnswer: "0", explanation: "'I'm just browsing, thanks' is the natural phrase." },
          { type: "MCQ", question: "'Let's ___ out for dinner tonight.'", options: ["go", "going", "went", "gone"], correctAnswer: "0", explanation: "'Let's go out for dinner' is a suggestion." },
          { type: "TRUE_FALSE", question: "True or False: 'Turn right at the roundabout' gives a direction.", correctAnswer: "true", explanation: "'Turn right at the roundabout' is a clear direction." },
          { type: "TRUE_FALSE", question: "True or False: 'I'll have the fish' is a way to order food.", correctAnswer: "true", explanation: "'I'll have...' is commonly used to order." },
          { type: "FILL_BLANK", question: "Complete: Could I ___ this on? (try clothes)", correctAnswer: "try", explanation: "'Could I try this on?' asks to test clothes." },
          { type: "FILL_BLANK", question: "Complete: It's ___ the corner of Main Street and First Avenue.", correctAnswer: "on", explanation: "'On the corner' describes a location." },
          { type: "FILL_BLANK", question: "Complete: Would you ___ to join us for lunch?", correctAnswer: "like", explanation: "'Would you like to join us?' is a polite invitation." },
          { type: "MATCHING", question: "Match the situation with the phrase:", options: [{ left: "At a restaurant", right: "Can I have the bill?" }, { left: "Shopping", right: "Do you have this in red?" }, { left: "Asking directions", right: "How do I get to...?" }, { left: "Making plans", right: "Are you free on Friday?" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase fits its situation." },
          { type: "CHECKBOX", question: "Select all polite conversation phrases:", options: ["Could you help me, please?", "I'd like a cup of coffee", "Tell me where is bank", "Would you like to come?"], correctAnswer: "[0,1,3]", explanation: "'Tell me where is bank' should be 'Tell me where the bank is'. The others are polite." },
          { type: "ORDERING", question: "Put in order: would / love / I / to / but / I'm busy", correctAnswer: "I would love to,but I'm busy", explanation: "Polite decline: I would love to, but + reason." },
          { type: "SPEECH", question: "Can I pay with my credit card?", correctAnswer: "Can I pay with my credit card?", language: "en", hint: "Ask about payment method" },
          { type: "SPEECH", question: "Go straight and it's on your left next to the bank.", correctAnswer: "Go straight and it's on your left next to the bank.", language: "en", hint: "Give directions to a building" },
          { type: "SPEECH", question: "Would you like to grab a coffee after work?", correctAnswer: "Would you like to grab a coffee after work?", language: "en", hint: "Invite someone for coffee" },
        ]
      },
    ]
  },
  {
    title: "Prepositions and Conjunctions",
    lessons: [
      {
        title: "Prepositions of Time (In, On, At)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I was born in 1995", "I was born on 1995", "I was born at 1995", "I was born to 1995"], correctAnswer: "0", explanation: "'In' is used with years: 'in 1995'." },
          { type: "MCQ", question: "'The meeting is ___ Monday.'", options: ["on", "in", "at", "by"], correctAnswer: "0", explanation: "'On' is used with days: 'on Monday'." },
          { type: "MCQ", question: "'She arrives ___ 3 o'clock.'", options: ["at", "in", "on", "by"], correctAnswer: "0", explanation: "'At' is used with specific times: 'at 3 o'clock'." },
          { type: "MCQ", question: "'We go swimming ___ summer.'", options: ["in", "on", "at", "by"], correctAnswer: "0", explanation: "'In' is used with seasons: 'in summer'." },
          { type: "TRUE_FALSE", question: "True or False: 'The party is at night' is correct.", correctAnswer: "true", explanation: "'At night' is a fixed expression." },
          { type: "TRUE_FALSE", question: "True or False: 'I'll see you on January' is correct.", correctAnswer: "false", explanation: "Use 'in' with months: 'in January'." },
          { type: "FILL_BLANK", question: "Complete: The concert is ___ the weekend.", correctAnswer: "at", explanation: "'At the weekend' (British) or 'on the weekend' (American)." },
          { type: "FILL_BLANK", question: "Complete: She has a class ___ the morning.", correctAnswer: "in", explanation: "'In the morning/afternoon/evening'." },
          { type: "FILL_BLANK", question: "Complete: He was born ___ March 15th.", correctAnswer: "on", explanation: "'On' with specific dates: 'on March 15th'." },
          { type: "MATCHING", question: "Match the time expression with the preposition:", options: [{ left: "5 PM", right: "at" }, { left: "Monday", right: "on" }, { left: "2024", right: "in" }, { left: "Christmas Day", right: "on" }], correctAnswer: "[0,1,2,3]", explanation: "At + time; On + day/date; In + month/year/season." },
          { type: "CHECKBOX", question: "Select all correct preposition usage:", options: ["in the afternoon", "on Friday", "at noon", "in 2025"], correctAnswer: "[0,1,2,3]", explanation: "All are correct preposition usage." },
          { type: "ORDERING", question: "Put in order: at / starts / 9 AM / the class", correctAnswer: "The class,starts,at 9 AM", explanation: "Subject + verb + at + time." },
          { type: "SPEECH", question: "I usually go for a walk in the evening.", correctAnswer: "I usually go for a walk in the evening.", language: "en", hint: "Talk about an evening routine" },
          { type: "SPEECH", question: "The meeting is on Tuesday at ten o'clock.", correctAnswer: "The meeting is on Tuesday at ten o'clock.", language: "en", hint: "State a meeting time" },
        ]
      },
      {
        title: "Prepositions of Place (In, On, At, Under, Between)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The book is ___ the table.'", options: ["on", "in", "at", "under"], correctAnswer: "0", explanation: "'On' for surfaces: 'The book is on the table'." },
          { type: "MCQ", question: "'She is ___ the kitchen.'", options: ["in", "on", "at", "to"], correctAnswer: "0", explanation: "'In' for enclosed spaces: 'She is in the kitchen'." },
          { type: "MCQ", question: "'He is waiting ___ the bus stop.'", options: ["at", "in", "on", "to"], correctAnswer: "0", explanation: "'At' for specific locations: 'at the bus stop'." },
          { type: "MCQ", question: "'The cat is ___ the bed.'", options: ["under", "on", "in", "at"], correctAnswer: "0", explanation: "'Under' means below: 'The cat is under the bed'." },
          { type: "TRUE_FALSE", question: "True or False: 'The picture is on the wall' is correct.", correctAnswer: "true", explanation: "'On' for surfaces: 'on the wall'." },
          { type: "TRUE_FALSE", question: "True or False: 'She is in the bus' is correct.", correctAnswer: "false", explanation: "Use 'on' for large vehicles: 'on the bus' (except 'in the car')." },
          { type: "FILL_BLANK", question: "Complete: The keys are ___ the bag.", correctAnswer: "in", explanation: "'In' for inside something: 'in the bag'." },
          { type: "FILL_BLANK", question: "Complete: The bank is ___ the school and the hospital.", correctAnswer: "between", explanation: "'Between' for two things: 'between the school and the hospital'." },
          { type: "FILL_BLANK", question: "Complete: Put your shoes ___ the bed.", correctAnswer: "under", explanation: "'Under' means below: 'under the bed'." },
          { type: "MATCHING", question: "Match the preposition with its meaning:", options: [{ left: "in", right: "Inside" }, { left: "on", right: "Surface" }, { left: "at", right: "Specific point" }, { left: "between", right: "In the middle of two" }], correctAnswer: "[0,1,2,3]", explanation: "Each preposition describes a different spatial relationship." },
          { type: "CHECKBOX", question: "Select all correct preposition sentences:", options: ["The bird is in the cage", "The poster is on the wall", "She is at the door", "The ball is between the box"], correctAnswer: "[0,1,2]", explanation: "'Between' needs two things: 'between the boxes'. The others are correct." },
          { type: "ORDERING", question: "Put in order: under / is / the / dog / the tree", correctAnswer: "The dog,is under,the tree", explanation: "Subject + is + under + object." },
          { type: "SPEECH", question: "My phone is on the desk next to the laptop.", correctAnswer: "My phone is on the desk next to the laptop.", language: "en", hint: "Describe where your phone is" },
          { type: "SPEECH", question: "The children are playing in the garden.", correctAnswer: "The children are playing in the garden.", language: "en", hint: "Describe children playing outside" },
        ]
      },
      {
        title: "Common Conjunctions (And, But, Or, So, Because)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which connects two similar ideas?", options: ["and", "but", "or", "so"], correctAnswer: "0", explanation: "'And' connects similar/additional ideas: 'I like tea and coffee'." },
          { type: "MCQ", question: "'I wanted to go, ___ I was too tired.'", options: ["but", "and", "or", "so"], correctAnswer: "0", explanation: "'But' shows contrast: 'I wanted to go, but I was too tired'." },
          { type: "MCQ", question: "'Would you like tea ___ coffee?'", options: ["or", "and", "but", "so"], correctAnswer: "0", explanation: "'Or' for choices: 'Would you like tea or coffee?'" },
          { type: "MCQ", question: "'She was sick, ___ she stayed home.'", options: ["so", "but", "or", "and"], correctAnswer: "0", explanation: "'So' shows result: 'She was sick, so she stayed home'." },
          { type: "TRUE_FALSE", question: "True or False: 'I stayed home because it was raining' explains a reason.", correctAnswer: "true", explanation: "'Because' introduces the reason: 'because it was raining'." },
          { type: "TRUE_FALSE", question: "True or False: 'I like apples and but oranges' is correct.", correctAnswer: "false", explanation: "Use one conjunction: 'I like apples and oranges' or 'apples but not oranges'." },
          { type: "FILL_BLANK", question: "Complete: He is tall ___ handsome.", correctAnswer: "and", explanation: "'And' connects two positive traits." },
          { type: "FILL_BLANK", question: "Complete: I studied hard, ___ I passed the exam.", correctAnswer: "so", explanation: "'So' shows the result: 'I studied hard, so I passed'." },
          { type: "FILL_BLANK", question: "Complete: She didn't eat ___ she wasn't hungry.", correctAnswer: "because", explanation: "'Because' gives the reason: 'because she wasn't hungry'." },
          { type: "MATCHING", question: "Match the conjunction with its function:", options: [{ left: "and", right: "Addition" }, { left: "but", right: "Contrast" }, { left: "or", right: "Choice" }, { left: "so", right: "Result" }], correctAnswer: "[0,1,2,3]", explanation: "Each conjunction serves a different connecting function." },
          { type: "CHECKBOX", question: "Select all correct conjunction usage:", options: ["I like pizza and pasta", "She is small but strong", "Do you want soup or salad?", "It's late so I must go"], correctAnswer: "[0,1,2,3]", explanation: "All use conjunctions correctly." },
          { type: "ORDERING", question: "Put in order: tired / she / went / but / to school / she", correctAnswer: "She was tired,but she went to school", explanation: "Contrast: Clause + but + contrasting clause." },
          { type: "SPEECH", question: "I wanted to go for a walk but it started raining.", correctAnswer: "I wanted to go for a walk but it started raining.", language: "en", hint: "Talk about a changed plan" },
          { type: "SPEECH", question: "She is studying hard because she wants to pass the exam.", correctAnswer: "She is studying hard because she wants to pass the exam.", language: "en", hint: "Explain why someone is studying" },
        ]
      },
      {
        title: "Prepositions of Movement (To, Into, Through, Across)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She walked ___ the park.'", options: ["through", "across", "into", "to"], correctAnswer: "0", explanation: "'Through' means from one side to the other inside: 'through the park'." },
          { type: "MCQ", question: "'He jumped ___ the pool.'", options: ["into", "in", "on", "to"], correctAnswer: "0", explanation: "'Into' shows movement toward the inside: 'into the pool'." },
          { type: "MCQ", question: "'They swam ___ the river.'", options: ["across", "through", "into", "to"], correctAnswer: "0", explanation: "'Across' means from one side to the other: 'across the river'." },
          { type: "MCQ", question: "'I'm going ___ the store.'", options: ["to", "into", "through", "across"], correctAnswer: "0", explanation: "'To' shows direction/destination: 'going to the store'." },
          { type: "TRUE_FALSE", question: "True or False: 'She ran into the room' shows movement inside.", correctAnswer: "true", explanation: "'Into' shows movement from outside to inside." },
          { type: "TRUE_FALSE", question: "True or False: 'He walked across the bridge' means he went under it.", correctAnswer: "false", explanation: "'Across' means from one side to the other on top." },
          { type: "FILL_BLANK", question: "Complete: The train goes ___ the tunnel.", correctAnswer: "through", explanation: "'Through' for movement inside something: 'through the tunnel'." },
          { type: "FILL_BLANK", question: "Complete: She walked ___ the street to get to the other side.", correctAnswer: "across", explanation: "'Across' for crossing: 'across the street'." },
          { type: "FILL_BLANK", question: "Complete: He drove ___ the city center.", correctAnswer: "into", explanation: "'Into' for entering: 'drove into the city center'." },
          { type: "MATCHING", question: "Match the preposition with its movement:", options: [{ left: "to", right: "Toward a destination" }, { left: "into", right: "Entering" }, { left: "through", right: "Passing inside" }, { left: "across", right: "From side to side" }], correctAnswer: "[0,1,2,3]", explanation: "Each preposition describes a different type of movement." },
          { type: "CHECKBOX", question: "Select all correct movement sentences:", options: ["She walked into the room", "He ran across the field", "They drove through the mountains", "I went into the park"], correctAnswer: "[0,1,2,3]", explanation: "All correctly use prepositions of movement." },
          { type: "ORDERING", question: "Put in order: through / walked / the / forest / we", correctAnswer: "We,walked through,the forest", explanation: "Subject + verb + through + object." },
          { type: "SPEECH", question: "The dog ran across the field to catch the ball.", correctAnswer: "The dog ran across the field to catch the ball.", language: "en", hint: "Describe a dog running" },
          { type: "SPEECH", question: "She walked through the door and entered the building.", correctAnswer: "She walked through the door and entered the building.", language: "en", hint: "Describe entering a building" },
        ]
      },
      {
        title: "Module 7 Review: Prepositions and Conjunctions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The meeting is ___ 9 AM ___ Monday.'", options: ["at, on", "on, at", "in, on", "at, in"], correctAnswer: "0", explanation: "'At' for time, 'on' for day: 'at 9 AM on Monday'." },
          { type: "MCQ", question: "'The keys are ___ the drawer.'", options: ["in", "on", "at", "to"], correctAnswer: "0", explanation: "'In' for inside: 'in the drawer'." },
          { type: "MCQ", question: "'I like tea, ___ I don't like coffee.'", options: ["but", "and", "or", "so"], correctAnswer: "0", explanation: "'But' shows contrast: 'I like tea, but I don't like coffee'." },
          { type: "MCQ", question: "'She walked ___ the room and sat down.'", options: ["into", "in", "on", "at"], correctAnswer: "0", explanation: "'Into' shows movement: 'walked into the room'." },
          { type: "TRUE_FALSE", question: "True or False: 'The cat is under the table' describes position.", correctAnswer: "true", explanation: "'Under' means below the table." },
          { type: "TRUE_FALSE", question: "True or False: 'I stayed home or it was raining' is correct.", correctAnswer: "false", explanation: "Use 'because': 'I stayed home because it was raining'." },
          { type: "FILL_BLANK", question: "Complete: She was born ___ 1998.", correctAnswer: "in", explanation: "'In' for years: 'in 1998'." },
          { type: "FILL_BLANK", question: "Complete: He is sitting ___ his two friends.", correctAnswer: "between", explanation: "'Between' for position among two people." },
          { type: "FILL_BLANK", question: "Complete: I was late ___ the traffic was bad.", correctAnswer: "because", explanation: "'Because' explains the reason: 'because the traffic was bad'." },
          { type: "MATCHING", question: "Match the sentence with the preposition type:", options: [{ left: "at 5 PM", right: "Time" }, { left: "on the table", right: "Place" }, { left: "into the room", right: "Movement" }, { left: "through the tunnel", right: "Movement" }], correctAnswer: "[0,1,2,3]", explanation: "Each preposition fits its category." },
          { type: "CHECKBOX", question: "Select all correct preposition sentences:", options: ["The book is on the shelf", "She arrived at the airport", "He lives in Paris", "I walked across the park"], correctAnswer: "[0,1,2,3]", explanation: "All correctly use prepositions." },
          { type: "ORDERING", question: "Put in order: to / she / the / went / store / and / bought / milk", correctAnswer: "She went to the store,and bought milk", explanation: "Subject + went to + place + and + action." },
          { type: "SPEECH", question: "The ball rolled under the couch and I couldn't reach it.", correctAnswer: "The ball rolled under the couch and I couldn't reach it.", language: "en", hint: "Describe losing something under furniture" },
          { type: "SPEECH", question: "I'm tired but happy because we won the game.", correctAnswer: "I'm tired but happy because we won the game.", language: "en", hint: "Express mixed feelings after a game" },
          { type: "SPEECH", question: "She walked through the park on her way to school.", correctAnswer: "She walked through the park on her way to school.", language: "en", hint: "Describe a route through a place" },
        ]
      },
    ]
  },
  {
    title: "Conditionals",
    lessons: [
      {
        title: "First Conditional (Real Possibility)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["If it rains, I will stay home", "If it rains, I stay home", "If it will rain, I stay home", "If it rained, I will stay home"], correctAnswer: "0", explanation: "First conditional: If + present, will + base verb." },
          { type: "MCQ", question: "'If she studies hard, she ___ the exam.'", options: ["will pass", "passes", "passed", "would pass"], correctAnswer: "0", explanation: "First conditional: If + present, will + base verb." },
          { type: "MCQ", question: "'I will call you if I ___ time.'", options: ["have", "will have", "had", "having"], correctAnswer: "0", explanation: "'If' clause uses present tense: 'if I have time'." },
          { type: "MCQ", question: "Which sentence uses the first conditional?", options: ["If you hurry, you will catch the bus", "If you hurried, you would catch the bus", "If you hurry, you catch the bus", "If you will hurry, you catch the bus"], correctAnswer: "0", explanation: "First conditional: If + present, will + base verb." },
          { type: "TRUE_FALSE", question: "True or False: 'If it will snow, we will play' is correct.", correctAnswer: "false", explanation: "Don't use 'will' in the 'if' clause: 'If it snows, we will play'." },
          { type: "TRUE_FALSE", question: "True or False: First conditional talks about real future possibilities.", correctAnswer: "true", explanation: "First conditional is for things that are likely to happen." },
          { type: "FILL_BLANK", question: "Complete: If you ___ (not/hurry), you will be late.", correctAnswer: "don't hurry", explanation: "Negative 'if' clause: 'If you don't hurry'." },
          { type: "FILL_BLANK", question: "Complete: If she ___ (come), I will tell her.", correctAnswer: "comes", explanation: "Third person present: 'If she comes'." },
          { type: "FILL_BLANK", question: "Complete: I ___ (cook) dinner if you buy the groceries.", correctAnswer: "will cook", explanation: "Result clause: 'I will cook dinner'." },
          { type: "MATCHING", question: "Match the parts of the first conditional:", options: [{ left: "If it is sunny", right: "we will go to the beach" }, { left: "If you study", right: "you will pass" }, { left: "If he misses the bus", right: "he will be late" }, { left: "If they don't leave now", right: "they will miss the flight" }], correctAnswer: "[0,1,2,3]", explanation: "Each 'if' clause matches its logical result." },
          { type: "CHECKBOX", question: "Select all correct first conditional sentences:", options: ["If it rains, we will cancel the trip", "If she calls, I will answer", "If you will help me, I finish", "If they arrive early, we will start"], correctAnswer: "[0,1,3]", explanation: "'If you will help' is wrong; should be 'If you help'. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / if / you / I / help / you / ask / me", correctAnswer: "I will help you,if you ask me", explanation: "Result + if + condition." },
          { type: "SPEECH", question: "If it rains tomorrow, I will take an umbrella.", correctAnswer: "If it rains tomorrow, I will take an umbrella.", language: "en", hint: "Talk about a plan depending on weather" },
          { type: "SPEECH", question: "She will be very happy if you visit her.", correctAnswer: "She will be very happy if you visit her.", language: "en", hint: "Talk about someone's reaction" },
        ]
      },
      {
        title: "Second Conditional (Unreal/Hypothetical)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["If I had money, I would travel", "If I have money, I would travel", "If I had money, I will travel", "If I would have money, I travel"], correctAnswer: "0", explanation: "Second conditional: If + past simple, would + base verb." },
          { type: "MCQ", question: "'If she ___ taller, she would play basketball.'", options: ["were", "is", "was being", "would be"], correctAnswer: "0", explanation: "'Were' is used for all subjects in second conditional: 'If she were taller'." },
          { type: "MCQ", question: "'I would buy a house if I ___ rich.'", options: ["were", "am", "will be", "would be"], correctAnswer: "0", explanation: "'If I were rich' (hypothetical situation)." },
          { type: "MCQ", question: "Which sentence is second conditional?", options: ["If I won the lottery, I would quit my job", "If I win the lottery, I will quit my job", "If I won the lottery, I quit my job", "If I would win, I would quit"], correctAnswer: "0", explanation: "Second conditional: If + past, would + base verb (hypothetical)." },
          { type: "TRUE_FALSE", question: "True or False: 'If I was you, I would accept the offer' is correct.", correctAnswer: "false", explanation: "Use 'were' for all subjects: 'If I were you'." },
          { type: "TRUE_FALSE", question: "True or False: Second conditional talks about unreal or unlikely situations.", correctAnswer: "true", explanation: "Second conditional is for imaginary or unlikely situations." },
          { type: "FILL_BLANK", question: "Complete: If I ___ (know) the answer, I would tell you.", correctAnswer: "knew", explanation: "Past simple in 'if' clause: 'If I knew'." },
          { type: "FILL_BLANK", question: "Complete: She ___ (travel) more if she had time.", correctAnswer: "would travel", explanation: "Result clause: 'She would travel more'." },
          { type: "FILL_BLANK", question: "Complete: If they ___ (not/be) so busy, they would come.", correctAnswer: "weren't", explanation: "Negative: 'If they weren't so busy'." },
          { type: "MATCHING", question: "Match the hypothetical situation:", options: [{ left: "If I were a bird", right: "I would fly" }, { left: "If she lived in Paris", right: "she would speak French" }, { left: "If we had a car", right: "we would drive to work" }, { left: "If he studied harder", right: "he would get better grades" }], correctAnswer: "[0,1,2,3]", explanation: "Each hypothetical situation matches its result." },
          { type: "CHECKBOX", question: "Select all correct second conditional sentences:", options: ["If I were you, I would apologize", "If she had more time, she would exercise", "If they would come, we would be happy", "If it were warmer, we would swim"], correctAnswer: "[0,1,3]", explanation: "'If they would come' is wrong; should be 'If they came'. The others are correct." },
          { type: "ORDERING", question: "Put in order: would / I / buy / if / a car / I / had money", correctAnswer: "I would buy a car,if I had money", explanation: "Result + if + hypothetical condition." },
          { type: "SPEECH", question: "If I had a million dollars, I would travel the world.", correctAnswer: "If I had a million dollars, I would travel the world.", language: "en", hint: "Talk about a dream scenario" },
          { type: "SPEECH", question: "She would be a great teacher if she had more patience.", correctAnswer: "She would be a great teacher if she had more patience.", language: "en", hint: "Talk about someone's potential" },
        ]
      },
      {
        title: "First vs Second Conditional",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which conditional is for real possibilities?", options: ["First conditional", "Second conditional", "Both", "Neither"], correctAnswer: "0", explanation: "First conditional: real/likely future situations." },
          { type: "MCQ", question: "Which conditional uses past tense in the 'if' clause?", options: ["Second conditional", "First conditional", "Both", "Neither"], correctAnswer: "0", explanation: "Second conditional: If + past simple, would + base verb." },
          { type: "MCQ", question: "'If I ___ (see) him, I will tell him.' (real possibility)", options: ["see", "saw", "seen", "seeing"], correctAnswer: "0", explanation: "First conditional (real): 'If I see him, I will tell him'." },
          { type: "MCQ", question: "'If I ___ (see) him, I would tell him.' (unlikely)", options: ["saw", "see", "seen", "seeing"], correctAnswer: "0", explanation: "Second conditional (unlikely): 'If I saw him, I would tell him'." },
          { type: "TRUE_FALSE", question: "True or False: 'If it rains, I will stay inside' is first conditional.", correctAnswer: "true", explanation: "First conditional: If + present, will + base verb (real possibility)." },
          { type: "TRUE_FALSE", question: "True or False: 'If I were president, I would change the law' is first conditional.", correctAnswer: "false", explanation: "This is second conditional (unreal): If + past, would + base verb." },
          { type: "FILL_BLANK", question: "Complete: If she ___ (study) tonight, she will pass. (real)", correctAnswer: "studies", explanation: "First conditional: 'If she studies tonight, she will pass'." },
          { type: "FILL_BLANK", question: "Complete: If she ___ (study) more, she would get better grades. (hypothetical)", correctAnswer: "studied", explanation: "Second conditional: 'If she studied more, she would get better grades'." },
          { type: "FILL_BLANK", question: "Complete: If I ___ (be) you, I would accept the job.", correctAnswer: "were", explanation: "Second conditional: 'If I were you' (advice)." },
          { type: "MATCHING", question: "Match the sentence with its conditional type:", options: [{ left: "If it snows, we will build a snowman", right: "First (real)" }, { left: "If I could fly, I would visit every country", right: "Second (unreal)" }, { left: "If you heat water, it boils", right: "Zero (fact)" }, { left: "If she had wings, she would fly", right: "Second (unreal)" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence matches its conditional type." },
          { type: "CHECKBOX", question: "Select all first conditional sentences:", options: ["If you wait here, I will be back soon", "If I were rich, I would buy a yacht", "If she doesn't call, I will go", "If they invited me, I would go"], correctAnswer: "[0,2]", explanation: "Options 1 and 3 are second conditional. 0 and 2 are first conditional." },
          { type: "ORDERING", question: "Put in order: would / if / I / lived / I / near / the sea / swim / every day", correctAnswer: "If I lived near the sea,I would swim every day", explanation: "Second conditional: If + past, would + base verb." },
          { type: "SPEECH", question: "If I get good grades, I will go to university.", correctAnswer: "If I get good grades, I will go to university.", language: "en", hint: "Talk about a realistic future plan" },
          { type: "SPEECH", question: "If I were older, I would get a driving license.", correctAnswer: "If I were older, I would get a driving license.", language: "en", hint: "Talk about something you wish were true" },
        ]
      },
      {
        title: "Conditional Practice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If you mix red and blue, you ___ purple.' (fact)", options: ["get", "will get", "would get", "got"], correctAnswer: "0", explanation: "Zero conditional for facts: If + present, present." },
          { type: "MCQ", question: "'If you ___ late, you will miss the train.'", options: ["are", "will be", "were", "would be"], correctAnswer: "0", explanation: "First conditional: If + present, will + base verb." },
          { type: "MCQ", question: "'If I ___ a superhero, I would save everyone.'", options: ["were", "am", "will be", "would be"], correctAnswer: "0", explanation: "Second conditional (unreal): 'If I were a superhero'." },
          { type: "MCQ", question: "Choose the correct sentence:", options: ["If she calls, I will let you know", "If she will call, I let you know", "If she called, I will let you know", "If she calls, I would let you know"], correctAnswer: "0", explanation: "First conditional: If + present, will + base verb." },
          { type: "TRUE_FALSE", question: "True or False: 'If I had known, I would have told you' is second conditional.", correctAnswer: "false", explanation: "This is third conditional (past unreal): If + past perfect, would have + past participle." },
          { type: "TRUE_FALSE", question: "True or False: 'If you study hard, you will succeed' is first conditional.", correctAnswer: "true", explanation: "First conditional: If + present, will + base verb (real possibility)." },
          { type: "FILL_BLANK", question: "Complete: If I ___ (have) more time, I would learn piano.", correctAnswer: "had", explanation: "Second conditional: 'If I had more time'." },
          { type: "FILL_BLANK", question: "Complete: If the weather ___ (be) nice, we will go hiking.", correctAnswer: "is", explanation: "First conditional: 'If the weather is nice'." },
          { type: "FILL_BLANK", question: "Complete: She ___ (be) surprised if you visit her.", correctAnswer: "will be", explanation: "First conditional result: 'She will be surprised'." },
          { type: "MATCHING", question: "Match the conditional with its use:", options: [{ left: "If you freeze water, it becomes ice", right: "General truth" }, { left: "If it rains, I'll take an umbrella", right: "Real future" }, { left: "If I were you, I'd rest", right: "Advice" }, { left: "If I won the lottery, I'd travel", right: "Dream/unreal" }], correctAnswer: "[0,1,2,3]", explanation: "Each conditional serves a different purpose." },
          { type: "CHECKBOX", question: "Select all correct conditional sentences:", options: ["If you press this button, the machine starts", "If she were here, she would help", "If it will rain, we stay inside", "If I had time, I would volunteer"], correctAnswer: "[0,1,3]", explanation: "'If it will rain, we stay' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / if / she / she / comes / be / happy", correctAnswer: "She will be happy,if she comes", explanation: "First conditional: Result + if + condition." },
          { type: "SPEECH", question: "If I finish work early, I will go to the gym.", correctAnswer: "If I finish work early, I will go to the gym.", language: "en", hint: "Talk about a conditional plan" },
          { type: "SPEECH", question: "If I were on vacation, I would be at the beach right now.", correctAnswer: "If I were on vacation, I would be at the beach right now.", language: "en", hint: "Talk about a wish" },
        ]
      },
      {
        title: "Module 8 Review: Conditionals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If she ___ earlier, she won't be late.'", options: ["leaves", "left", "will leave", "would leave"], correctAnswer: "0", explanation: "First conditional: If + present, will/won't + base verb." },
          { type: "MCQ", question: "'If I ___ the answer, I would tell you.'", options: ["knew", "know", "known", "knowing"], correctAnswer: "0", explanation: "Second conditional: If + past, would + base verb." },
          { type: "MCQ", question: "Which is a first conditional sentence?", options: ["If you don't study, you will fail", "If you didn't study, you would fail", "If you don't study, you fail", "If you won't study, you fail"], correctAnswer: "0", explanation: "First conditional: If + present, will + base verb." },
          { type: "MCQ", question: "'If he ___ more money, he would buy a new car.'", options: ["had", "has", "will have", "would have"], correctAnswer: "0", explanation: "Second conditional: If + past simple, would + base verb." },
          { type: "TRUE_FALSE", question: "True or False: 'If I were you, I would study harder' gives advice.", correctAnswer: "true", explanation: "'If I were you' is a common way to give advice." },
          { type: "TRUE_FALSE", question: "True or False: 'If it will be sunny, we go to the park' is correct.", correctAnswer: "false", explanation: "'If it is sunny, we will go to the park' (first conditional)." },
          { type: "FILL_BLANK", question: "Complete: If you ___ (practice) every day, you will improve.", correctAnswer: "practice", explanation: "First conditional: If + present, will + base verb." },
          { type: "FILL_BLANK", question: "Complete: I ___ (help) you if I could.", correctAnswer: "would help", explanation: "Second conditional result: 'I would help you'." },
          { type: "FILL_BLANK", question: "Complete: If she ___ (not/like) it, she wouldn't stay.", correctAnswer: "didn't like", explanation: "Second conditional: If + didn't + base verb." },
          { type: "MATCHING", question: "Match the sentence with its type:", options: [{ left: "If you heat ice, it melts", right: "Zero (fact)" }, { left: "If it snows, we will play", right: "First (real)" }, { left: "If I were taller, I'd play basketball", right: "Second (unreal)" }, { left: "If you mix yellow and blue, you get green", right: "Zero (fact)" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence matches its conditional type." },
          { type: "CHECKBOX", question: "Select all correct conditional sentences:", options: ["If she asks, I will say yes", "If I were a millionaire, I would donate", "If they will come, we start", "If you studied, you would pass"], correctAnswer: "[0,1,3]", explanation: "'If they will come' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: would / I / if / travel / could / I / afford it", correctAnswer: "I would travel,if I could afford it", explanation: "Second conditional: Result + if + condition." },
          { type: "SPEECH", question: "If the weather is nice this weekend, we will have a picnic.", correctAnswer: "If the weather is nice this weekend, we will have a picnic.", language: "en", hint: "Talk about a weekend plan depending on weather" },
          { type: "SPEECH", question: "If I could change one thing, I would spend more time with my family.", correctAnswer: "If I could change one thing, I would spend more time with my family.", language: "en", hint: "Talk about a life wish" },
          { type: "SPEECH", question: "If you don't water the plants, they will die.", correctAnswer: "If you don't water the plants, they will die.", language: "en", hint: "Give a warning about plants" },
        ]
      },
    ]
  },
  {
    title: "Passive Voice",
    lessons: [
      {
        title: "Introduction to Passive Voice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is passive voice?", options: ["The cake was eaten by the children", "The children ate the cake", "The children were eating the cake", "The children eat the cake"], correctAnswer: "0", explanation: "Passive: object + be + past participle + by + agent." },
          { type: "MCQ", question: "'The letter ___ written by Sarah.'", options: ["was", "were", "is being", "has"], correctAnswer: "0", explanation: "Past passive: 'was/were + past participle': 'was written'." },
          { type: "MCQ", question: "What is the passive of 'They built the house'?", options: ["The house was built by them", "The house built by them", "The house is building by them", "The house were built by them"], correctAnswer: "0", explanation: "Passive: object + was/were + past participle + by + agent." },
          { type: "MCQ", question: "'English ___ spoken in many countries.'", options: ["is", "are", "was being", "has"], correctAnswer: "0", explanation: "Present passive: 'is/are + past participle': 'is spoken'." },
          { type: "TRUE_FALSE", question: "True or False: 'The song was sung by her' is passive voice.", correctAnswer: "true", explanation: "Passive: object + was + past participle + by + agent." },
          { type: "TRUE_FALSE", question: "True or False: 'She sings the song' is passive voice.", correctAnswer: "false", explanation: "This is active voice. Passive would be: 'The song is sung by her'." },
          { type: "FILL_BLANK", question: "Complete: The window ___ (break) by the ball.", correctAnswer: "was broken", explanation: "Past passive: 'was broken'." },
          { type: "FILL_BLANK", question: "Complete: This book ___ (write) by a famous author.", correctAnswer: "was written", explanation: "Past passive: 'was written by'." },
          { type: "FILL_BLANK", question: "Complete: The rooms ___ (clean) every day.", correctAnswer: "are cleaned", explanation: "Present passive: 'are cleaned' (habitual action)." },
          { type: "MATCHING", question: "Match the active sentence with its passive form:", options: [{ left: "She writes emails", right: "Emails are written by her" }, { left: "He fixed the car", right: "The car was fixed by him" }, { left: "They make cars here", right: "Cars are made here" }, { left: "I called the doctor", right: "The doctor was called by me" }], correctAnswer: "[0,1,2,3]", explanation: "Each active sentence is converted to passive." },
          { type: "CHECKBOX", question: "Select all passive voice sentences:", options: ["The movie was directed by Spielberg", "She teaches English", "The food was cooked by mom", "They are building a bridge"], correctAnswer: "[0,2]", explanation: "Options 1 and 3 are active voice. 0 and 2 are passive." },
          { type: "ORDERING", question: "Put in order: was / the / cake / baked / by / my mother", correctAnswer: "The cake,was baked by,my mother", explanation: "Passive: Subject + was/were + past participle + by + agent." },
          { type: "SPEECH", question: "The letter was delivered this morning.", correctAnswer: "The letter was delivered this morning.", language: "en", hint: "Talk about a delivered letter" },
          { type: "SPEECH", question: "This song is sung by a famous singer.", correctAnswer: "This song is sung by a famous singer.", language: "en", hint: "Describe who sings a song" },
        ]
      },
      {
        title: "Present and Past Passive",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is present passive?", options: ["The house is cleaned every week", "The house was cleaned last week", "The house cleans every week", "The house cleaning every week"], correctAnswer: "0", explanation: "Present passive: is/are + past participle." },
          { type: "MCQ", question: "'The flowers ___ watered every morning.'", options: ["are", "were", "is", "was"], correctAnswer: "0", explanation: "Present passive with plural: 'are watered'." },
          { type: "MCQ", question: "'The building ___ in 1990.'", options: ["was built", "is built", "was build", "is build"], correctAnswer: "0", explanation: "Past passive: 'was built'." },
          { type: "MCQ", question: "Which is past passive?", options: ["The car was repaired yesterday", "The car is repaired yesterday", "The car repairs yesterday", "The car repairing yesterday"], correctAnswer: "0", explanation: "Past passive: was/were + past participle." },
          { type: "TRUE_FALSE", question: "True or False: 'The homework is done by the students' is present passive.", correctAnswer: "true", explanation: "Present passive: is/are + past participle." },
          { type: "TRUE_FALSE", question: "True or False: 'The movie was watched by millions' is present passive.", correctAnswer: "false", explanation: "'Was watched' is past passive." },
          { type: "FILL_BLANK", question: "Complete: Breakfast ___ (serve) at 7 AM.", correctAnswer: "is served", explanation: "Present passive: 'is served' (regular schedule)." },
          { type: "FILL_BLANK", question: "Complete: The thief ___ (catch) by the police.", correctAnswer: "was caught", explanation: "Past passive: 'was caught'." },
          { type: "FILL_BLANK", question: "Complete: These shoes ___ (make) in Italy.", correctAnswer: "are made", explanation: "Present passive: 'are made' (origin)." },
          { type: "MATCHING", question: "Match the passive sentence with its tense:", options: [{ left: "The door is locked", right: "Present passive" }, { left: "The door was locked", right: "Past passive" }, { left: "The doors are locked", right: "Present passive (plural)" }, { left: "The doors were locked", right: "Past passive (plural)" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence matches its passive tense." },
          { type: "CHECKBOX", question: "Select all correct passive sentences:", options: ["English is taught in schools", "The cake was eaten by the kids", "The house is sell by the agent", "The game was won by our team"], correctAnswer: "[0,1,3]", explanation: "'Is sell' is wrong; should be 'is sold'. The others are correct." },
          { type: "ORDERING", question: "Put in order: are / these / made / cars / in Germany", correctAnswer: "These cars,are made,in Germany", explanation: "Present passive: Subject + are + past participle + location." },
          { type: "SPEECH", question: "The homework is checked by the teacher every day.", correctAnswer: "The homework is checked by the teacher every day.", language: "en", hint: "Talk about a daily routine in passive" },
          { type: "SPEECH", question: "The bridge was built in 2005.", correctAnswer: "The bridge was built in 2005.", language: "en", hint: "Talk about when something was constructed" },
        ]
      },
      {
        title: "When to Use Passive Voice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "When do we use passive voice?", options: ["When the action is more important than who did it", "Always", "Never", "Only in writing"], correctAnswer: "0", explanation: "Passive is used when the action or object is more important than the agent." },
          { type: "MCQ", question: "'My phone ___ stolen.' (agent unknown)", options: ["was", "were", "is", "has"], correctAnswer: "0", explanation: "Past passive without agent: 'was stolen'." },
          { type: "MCQ", question: "Which sentence is better in passive?", options: ["The Pyramids were built thousands of years ago", "Someone built the Pyramids thousands of years ago", "The Pyramids built thousands of years ago", "They built the Pyramids thousands of years ago"], correctAnswer: "0", explanation: "Passive is better when the agent is unknown or unimportant." },
          { type: "MCQ", question: "'The results ___ announced tomorrow.'", options: ["will be", "are being", "were", "is"], correctAnswer: "0", explanation: "Future passive: 'will be + past participle'." },
          { type: "TRUE_FALSE", question: "True or False: 'Mistakes were made' avoids saying who made them.", correctAnswer: "true", explanation: "Passive can be used to avoid mentioning the agent." },
          { type: "TRUE_FALSE", question: "True or False: We should always use active voice instead of passive.", correctAnswer: "false", explanation: "Both have their uses; passive is appropriate in certain contexts." },
          { type: "FILL_BLANK", question: "Complete: The winner ___ (announce) next week.", correctAnswer: "will be announced", explanation: "Future passive: 'will be announced'." },
          { type: "FILL_BLANK", question: "Complete: Rice ___ (grow) in many Asian countries.", correctAnswer: "is grown", explanation: "Present passive for facts: 'is grown'." },
          { type: "FILL_BLANK", question: "Complete: The suspect ___ (arrest) last night.", correctAnswer: "was arrested", explanation: "Past passive: 'was arrested'." },
          { type: "MATCHING", question: "Match the situation with why passive is used:", options: [{ left: "The bank was robbed", right: "Agent unknown" }, { left: "English is spoken worldwide", right: "General fact" }, { left: "The report will be submitted", right: "Focus on action" }, { left: "Mistakes were made", right: "Avoid blame" }], correctAnswer: "[0,1,2,3]", explanation: "Each situation shows a different reason for using passive." },
          { type: "CHECKBOX", question: "Select all appropriate uses of passive:", options: ["The building was constructed in 1950", "Coffee is produced in Brazil", "The cake was baked by my sister", "I was given a gift"], correctAnswer: "[0,1,2,3]", explanation: "All are appropriate uses of passive voice." },
          { type: "ORDERING", question: "Put in order: was / the / discovered / in 1492 / America", correctAnswer: "America,was discovered,in 1492", explanation: "Past passive: Subject + was + past participle + time." },
          { type: "SPEECH", question: "The new hospital will be opened next month.", correctAnswer: "The new hospital will be opened next month.", language: "en", hint: "Talk about a future opening" },
          { type: "SPEECH", question: "Many languages are spoken in India.", correctAnswer: "Many languages are spoken in India.", language: "en", hint: "Talk about language diversity" },
        ]
      },
      {
        title: "Passive Voice Practice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the passive of 'She writes a letter'?", options: ["A letter is written by her", "A letter was written by her", "A letter written by her", "A letter is write by her"], correctAnswer: "0", explanation: "Present passive: A letter + is + written + by her." },
          { type: "MCQ", question: "'The food ___ by the time we arrived.'", options: ["had been eaten", "was eating", "is eaten", "has been eating"], correctAnswer: "0", explanation: "Past perfect passive: 'had been eaten'." },
          { type: "MCQ", question: "'The new road ___ next year.'", options: ["will be built", "is built", "was built", "builds"], correctAnswer: "0", explanation: "Future passive: 'will be built'." },
          { type: "MCQ", question: "Choose the correct passive sentence:", options: ["The song was sung by a famous artist", "The song sung by a famous artist", "The song is sang by a famous artist", "The song were sung by a famous artist"], correctAnswer: "0", explanation: "'Was sung' is correct past passive." },
          { type: "TRUE_FALSE", question: "True or False: 'The car is being repaired now' is present continuous passive.", correctAnswer: "true", explanation: "Present continuous passive: is/are + being + past participle." },
          { type: "TRUE_FALSE", question: "True or False: 'He is known by everyone' can be passive.", correctAnswer: "true", explanation: "Present passive: 'He is known by everyone'." },
          { type: "FILL_BLANK", question: "Complete: The package ___ (deliver) tomorrow.", correctAnswer: "will be delivered", explanation: "Future passive: 'will be delivered'." },
          { type: "FILL_BLANK", question: "Complete: The museum ___ (visit) by thousands of people every day.", correctAnswer: "is visited", explanation: "Present passive: 'is visited'." },
          { type: "FILL_BLANK", question: "Complete: The decision ___ (make) by the committee.", correctAnswer: "was made", explanation: "Past passive: 'was made'." },
          { type: "MATCHING", question: "Match the active sentence with its passive:", options: [{ left: "They are building a new school", right: "A new school is being built" }, { left: "Someone stole my wallet", right: "My wallet was stolen" }, { left: "She will paint the wall", right: "The wall will be painted" }, { left: "People speak Spanish here", right: "Spanish is spoken here" }], correctAnswer: "[0,1,2,3]", explanation: "Each active sentence is converted to its passive form." },
          { type: "CHECKBOX", question: "Select all correct passive sentences:", options: ["The door has been locked", "A new bridge is being constructed", "The cake was bake by my mom", "The letter was sent yesterday"], correctAnswer: "[0,1,3]", explanation: "'Was bake' is wrong; should be 'was baked'. The others are correct." },
          { type: "ORDERING", question: "Put in order: being / is / the / house / painted", correctAnswer: "The house,is being painted", explanation: "Present continuous passive: Subject + is being + past participle." },
          { type: "SPEECH", question: "The documents have been signed by the manager.", correctAnswer: "The documents have been signed by the manager.", language: "en", hint: "Talk about completed documents" },
          { type: "SPEECH", question: "The problem will be solved soon.", correctAnswer: "The problem will be solved soon.", language: "en", hint: "Give reassurance about a problem" },
        ]
      },
      {
        title: "Module 9 Review: Passive Voice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The cake ___ by my grandmother.'", options: ["was baked", "baked", "is baking", "bakes"], correctAnswer: "0", explanation: "Past passive: 'was baked'." },
          { type: "MCQ", question: "'English ___ in many countries.'", options: ["is spoken", "speaks", "is speaking", "spoken"], correctAnswer: "0", explanation: "Present passive: 'is spoken'." },
          { type: "MCQ", question: "What is the passive of 'They will announce the winner'?", options: ["The winner will be announced", "The winner will announced", "The winner is announced", "The winner was announced"], correctAnswer: "0", explanation: "Future passive: 'will be announced'." },
          { type: "MCQ", question: "'The windows ___ right now.'", options: ["are being cleaned", "are cleaned", "were cleaned", "cleaned"], correctAnswer: "0", explanation: "Present continuous passive: 'are being cleaned'." },
          { type: "TRUE_FALSE", question: "True or False: 'The book was wrote by him' is correct.", correctAnswer: "false", explanation: "Past participle of 'write' is 'written': 'was written by him'." },
          { type: "TRUE_FALSE", question: "True or False: Passive voice is used when the agent is unknown.", correctAnswer: "true", explanation: "Passive is used when we don't know or don't need to say who did the action." },
          { type: "FILL_BLANK", question: "Complete: The letter ___ (send) yesterday.", correctAnswer: "was sent", explanation: "Past passive: 'was sent'." },
          { type: "FILL_BLANK", question: "Complete: The project ___ (complete) by next Friday.", correctAnswer: "will be completed", explanation: "Future passive: 'will be completed'." },
          { type: "FILL_BLANK", question: "Complete: Coffee ___ (grow) in South America.", correctAnswer: "is grown", explanation: "Present passive for facts: 'is grown'." },
          { type: "MATCHING", question: "Match the sentence with its passive type:", options: [{ left: "The room is cleaned daily", right: "Present passive" }, { left: "The room was cleaned yesterday", right: "Past passive" }, { left: "The room will be cleaned tomorrow", right: "Future passive" }, { left: "The room is being cleaned now", right: "Continuous passive" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence shows a different passive tense." },
          { type: "CHECKBOX", question: "Select all correct passive sentences:", options: ["The song was sung beautifully", "The news has been announced", "The cake was ate by the children", "The house is being painted"], correctAnswer: "[0,1,3]", explanation: "'Was ate' is wrong; should be 'was eaten'. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / be / the / results / announced / tomorrow", correctAnswer: "The results,will be announced,tomorrow", explanation: "Future passive: Subject + will be + past participle + time." },
          { type: "SPEECH", question: "The movie was directed by one of the best filmmakers.", correctAnswer: "The movie was directed by one of the best filmmakers.", language: "en", hint: "Talk about a movie director" },
          { type: "SPEECH", question: "A new shopping mall is being built in our city.", correctAnswer: "A new shopping mall is being built in our city.", language: "en", hint: "Talk about ongoing construction" },
          { type: "SPEECH", question: "All the tickets have been sold out.", correctAnswer: "All the tickets have been sold out.", language: "en", hint: "Say tickets are unavailable" },
        ]
      },
    ]
  },
  {
    title: "Reading and Writing Skills",
    lessons: [
      {
        title: "Reading Comprehension Strategies",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What should you do first when reading a text?", options: ["Skim for the main idea", "Look up every word", "Read very slowly", "Translate everything"], correctAnswer: "0", explanation: "Skimming helps you understand the main idea before detailed reading." },
          { type: "MCQ", question: "What does 'skimming' mean?", options: ["Reading quickly for the main idea", "Reading every word carefully", "Looking up new words", "Reading out loud"], correctAnswer: "0", explanation: "Skimming = reading quickly to get the general idea." },
          { type: "MCQ", question: "What does 'scanning' mean?", options: ["Looking for specific information", "Reading the whole text slowly", "Summarizing the text", "Guessing word meanings"], correctAnswer: "0", explanation: "Scanning = looking for specific details like dates, names, or numbers." },
          { type: "MCQ", question: "How can you guess the meaning of a new word?", options: ["Look at the context around it", "Skip it completely", "Stop reading", "Ask someone"], correctAnswer: "0", explanation: "Context clues help you guess the meaning without a dictionary." },
          { type: "TRUE_FALSE", question: "True or False: You should understand every word to comprehend a text.", correctAnswer: "false", explanation: "You can understand the main idea even without knowing every word." },
          { type: "TRUE_FALSE", question: "True or False: Reading the title and headings helps predict the content.", correctAnswer: "true", explanation: "Titles and headings give you clues about what the text is about." },
          { type: "FILL_BLANK", question: "Complete: Before reading, look at the title and ___.", correctAnswer: "headings", explanation: "Titles and headings help you predict the content." },
          { type: "FILL_BLANK", question: "Complete: Read the first and last ___ for a summary.", correctAnswer: "paragraphs", explanation: "First and last paragraphs often contain the main points." },
          { type: "FILL_BLANK", question: "Complete: Use ___ clues to guess unknown words.", correctAnswer: "context", explanation: "Context = the words and sentences around the unknown word." },
          { type: "MATCHING", question: "Match the reading strategy:", options: [{ left: "Skimming", right: "Quick reading for main idea" }, { left: "Scanning", right: "Looking for specific details" }, { left: "Context clues", right: "Guessing word meaning" }, { left: "Predicting", right: "Guessing what comes next" }], correctAnswer: "[0,1,2,3]", explanation: "Each strategy serves a different reading purpose." },
          { type: "CHECKBOX", question: "Select all good reading strategies:", options: ["Read the title first", "Look at pictures and headings", "Look up every unknown word", "Summarize each paragraph"], correctAnswer: "[0,1,3]", explanation: "Looking up every word slows you down. The others are good strategies." },
          { type: "ORDERING", question: "Put in order: the text / read / first / skim / then / details / look for", correctAnswer: "Skim the text first,then look for details", explanation: "First skim for main idea, then scan for details." },
          { type: "SPEECH", question: "I always read the title before I start reading an article.", correctAnswer: "I always read the title before I start reading an article.", language: "en", hint: "Talk about your reading habit" },
          { type: "SPEECH", question: "You can guess the meaning of new words from context.", correctAnswer: "You can guess the meaning of new words from context.", language: "en", hint: "Give reading advice" },
        ]
      },
      {
        title: "Writing Short Paragraphs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What does a good paragraph need?", options: ["A topic sentence, supporting details, and a conclusion", "Only one sentence", "Many different topics", "No structure"], correctAnswer: "0", explanation: "A paragraph needs a topic sentence, details, and a conclusion." },
          { type: "MCQ", question: "What is a topic sentence?", options: ["The main idea of the paragraph", "The last sentence", "A detail", "A question"], correctAnswer: "0", explanation: "The topic sentence tells the reader what the paragraph is about." },
          { type: "MCQ", question: "Which is a good topic sentence?", options: ["There are many benefits to exercising regularly", "I like food", "Yesterday was Monday", "The cat is small"], correctAnswer: "0", explanation: "A good topic sentence introduces a clear main idea." },
          { type: "MCQ", question: "What should supporting details do?", options: ["Explain or give examples of the topic sentence", "Introduce a new topic", "End the paragraph", "Ask a question"], correctAnswer: "0", explanation: "Supporting details explain, describe, or give examples of the main idea." },
          { type: "TRUE_FALSE", question: "True or False: A paragraph should only be about one main idea.", correctAnswer: "true", explanation: "Each paragraph should focus on one main topic." },
          { type: "TRUE_FALSE", question: "True or False: 'First, Next, Finally' are good linking words for paragraphs.", correctAnswer: "true", explanation: "These linking words help organize ideas in order." },
          { type: "FILL_BLANK", question: "Complete: The ___ sentence introduces the main idea.", correctAnswer: "topic", explanation: "The topic sentence is usually the first sentence." },
          { type: "FILL_BLANK", question: "Complete: Use ___ words like 'however' and 'also' to connect ideas.", correctAnswer: "linking", explanation: "Linking words connect ideas smoothly." },
          { type: "FILL_BLANK", question: "Complete: The last sentence should ___ the main points.", correctAnswer: "summarize", explanation: "The conclusion summarizes or restates the main idea." },
          { type: "MATCHING", question: "Match the part of a paragraph:", options: [{ left: "Topic sentence", right: "Main idea" }, { left: "Supporting details", right: "Examples and explanations" }, { left: "Linking words", right: "Connect ideas" }, { left: "Conclusion", right: "Summary" }], correctAnswer: "[0,1,2,3]", explanation: "Each part has a specific role in a paragraph." },
          { type: "CHECKBOX", question: "Select all good linking words:", options: ["First", "However", "In conclusion", "Banana"], correctAnswer: "[0,1,2]", explanation: "'Banana' is not a linking word. The others are." },
          { type: "ORDERING", question: "Put in order: a / first / write / then / topic sentence / add / details", correctAnswer: "First write a topic sentence,then add details", explanation: "Start with the topic sentence, then add supporting details." },
          { type: "SPEECH", question: "My favorite hobby is reading because it helps me relax.", correctAnswer: "My favorite hobby is reading because it helps me relax.", language: "en", hint: "Write a topic sentence about a hobby" },
          { type: "SPEECH", question: "In conclusion, exercise is important for both body and mind.", correctAnswer: "In conclusion, exercise is important for both body and mind.", language: "en", hint: "Write a concluding sentence" },
        ]
      },
      {
        title: "Writing Emails and Messages",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you start a formal email?", options: ["Dear Mr. Smith,", "Hey!", "What's up?", "Yo!"], correctAnswer: "0", explanation: "'Dear + name' is formal and polite." },
          { type: "MCQ", question: "How do you end a formal email?", options: ["Sincerely,", "Bye!", "See ya!", "Later!"], correctAnswer: "0", explanation: "'Sincerely' or 'Best regards' is formal." },
          { type: "MCQ", question: "'I am writing to ___ you about the meeting.'", options: ["inform", "telling", "say", "speaking"], correctAnswer: "0", explanation: "'I am writing to inform you' is formal and clear." },
          { type: "MCQ", question: "Which is an informal greeting?", options: ["Hi there!", "Dear Sir/Madam", "To Whom It May Concern", "Respected Sir"], correctAnswer: "0", explanation: "'Hi there!' is casual and informal." },
          { type: "TRUE_FALSE", question: "True or False: 'Please find attached the document' is formal.", correctAnswer: "true", explanation: "This is a common formal email phrase." },
          { type: "TRUE_FALSE", question: "True or False: You should use slang in formal emails.", correctAnswer: "false", explanation: "Formal emails should use proper, professional language." },
          { type: "FILL_BLANK", question: "Complete: I look ___ to hearing from you.", correctAnswer: "forward", explanation: "'I look forward to hearing from you' is a polite closing." },
          { type: "FILL_BLANK", question: "Complete: ___ you please send me the report? (polite request)", correctAnswer: "Could", explanation: "'Could you please...' is a polite request." },
          { type: "FILL_BLANK", question: "Complete: Thank you for your ___. (formal closing)", correctAnswer: "time", explanation: "'Thank you for your time' is polite and formal." },
          { type: "MATCHING", question: "Match the email part:", options: [{ left: "Dear Ms. Johnson", right: "Formal greeting" }, { left: "I'm writing to ask about...", right: "Purpose" }, { left: "Please let me know", right: "Request" }, { left: "Best regards", right: "Formal closing" }], correctAnswer: "[0,1,2,3]", explanation: "Each part serves a specific function in an email." },
          { type: "CHECKBOX", question: "Select all formal email phrases:", options: ["I would appreciate your response", "Please find attached", "Can you send me that thing?", "Thank you for your consideration"], correctAnswer: "[0,1,3]", explanation: "'Can you send me that thing?' is informal. The others are formal." },
          { type: "ORDERING", question: "Put in order: forward / hearing / I / to / look / from you", correctAnswer: "I look forward to,hearing from you", explanation: "Formal closing: I + look forward to + hearing from you." },
          { type: "SPEECH", question: "Dear Professor, I would like to request an extension on the assignment.", correctAnswer: "Dear Professor, I would like to request an extension on the assignment.", language: "en", hint: "Write a formal request to a teacher" },
          { type: "SPEECH", question: "Hi Sarah, thanks for your email. Let's meet for coffee next week!", correctAnswer: "Hi Sarah, thanks for your email. Let's meet for coffee next week!", language: "en", hint: "Reply to a friend's email" },
        ]
      },
      {
        title: "Describing People, Places, and Events",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which adjective describes a person's personality?", options: ["friendly", "tall", "blonde", "thin"], correctAnswer: "0", explanation: "'Friendly' describes personality; the others describe appearance." },
          { type: "MCQ", question: "Which describes a place?", options: ["The city is bustling and vibrant", "She is kind and generous", "He runs very fast", "They are tall"], correctAnswer: "0", explanation: "'Bustling and vibrant' describes a city." },
          { type: "MCQ", question: "'The concert was absolutely ___!' (positive)", options: ["amazing", "boring", "terrible", "awful"], correctAnswer: "0", explanation: "'Amazing' is a positive adjective for events." },
          { type: "MCQ", question: "Which order is correct for adjectives?", options: ["a beautiful big house", "a big beautiful house", "a house beautiful big", "a big house beautiful"], correctAnswer: "0", explanation: "Opinion before size: 'a beautiful big house'." },
          { type: "TRUE_FALSE", question: "True or False: 'She has long curly brown hair' is a correct description.", correctAnswer: "true", explanation: "Adjective order: length + texture + color." },
          { type: "TRUE_FALSE", question: "True or False: 'The event was very good' is a strong description.", correctAnswer: "false", explanation: "'Very good' is weak. Use 'fantastic' or 'wonderful' for stronger descriptions." },
          { type: "FILL_BLANK", question: "Complete: The beach was ___ and peaceful. (very beautiful)", correctAnswer: "stunning", explanation: "'Stunning' is a strong adjective for beauty." },
          { type: "FILL_BLANK", question: "Complete: He is a very ___ person; he always helps others. (kind)", correctAnswer: "generous", explanation: "'Generous' describes someone who gives and helps." },
          { type: "FILL_BLANK", question: "Complete: The festival was a ___ experience. (unforgettable)", correctAnswer: "memorable", explanation: "'Memorable' means worth remembering." },
          { type: "MATCHING", question: "Match the description type:", options: [{ left: "She is outgoing and cheerful", right: "Personality" }, { left: "The mountains are breathtaking", right: "Place" }, { left: "The wedding was wonderful", right: "Event" }, { left: "He has short black hair", right: "Appearance" }], correctAnswer: "[0,1,2,3]", explanation: "Each description fits its category." },
          { type: "CHECKBOX", question: "Select all strong descriptive adjectives:", options: ["fantastic", "terrible", "nice", "magnificent"], correctAnswer: "[0,1,3]", explanation: "'Nice' is weak. The others are strong adjectives." },
          { type: "ORDERING", question: "Put in order: a / lovely / old / stone / bridge", correctAnswer: "A lovely old stone bridge", explanation: "Adjective order: opinion + age + material + noun." },
          { type: "SPEECH", question: "My best friend is tall, funny, and always makes me laugh.", correctAnswer: "My best friend is tall, funny, and always makes me laugh.", language: "en", hint: "Describe your best friend" },
          { type: "SPEECH", question: "The village was small but incredibly beautiful.", correctAnswer: "The village was small but incredibly beautiful.", language: "en", hint: "Describe a beautiful place" },
        ]
      },
      {
        title: "Module 10 Review: Reading and Writing",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the purpose of a topic sentence?", options: ["To introduce the main idea", "To end the paragraph", "To give details", "To ask a question"], correctAnswer: "0", explanation: "The topic sentence introduces what the paragraph is about." },
          { type: "MCQ", question: "Which is a formal email closing?", options: ["Sincerely", "Later!", "Bye!", "Cheers!"], correctAnswer: "0", explanation: "'Sincerely' is formal and professional." },
          { type: "MCQ", question: "What does 'scanning' help you do?", options: ["Find specific information quickly", "Understand the whole text", "Guess word meanings", "Summarize"], correctAnswer: "0", explanation: "Scanning = looking for specific details." },
          { type: "MCQ", question: "Which adjective order is correct?", options: ["a delicious hot meal", "a hot delicious meal", "a meal delicious hot", "a meal hot delicious"], correctAnswer: "0", explanation: "Opinion before temperature: 'a delicious hot meal'." },
          { type: "TRUE_FALSE", question: "True or False: 'I look forward to hearing from you' is informal.", correctAnswer: "false", explanation: "This is a formal email phrase." },
          { type: "TRUE_FALSE", question: "True or False: A paragraph should have only one main idea.", correctAnswer: "true", explanation: "Each paragraph focuses on one topic." },
          { type: "FILL_BLANK", question: "Complete: Use ___ words to connect your ideas in writing.", correctAnswer: "linking", explanation: "Linking words like 'however', 'also', 'therefore' connect ideas." },
          { type: "FILL_BLANK", question: "Complete: The teacher is very ___ and patient. (kind)", correctAnswer: "caring", explanation: "'Caring' describes a kind, supportive person." },
          { type: "FILL_BLANK", question: "Complete: ___ reading the text, answer the questions.", correctAnswer: "After", explanation: "'After reading' = when you finish reading." },
          { type: "MATCHING", question: "Match the writing skill:", options: [{ left: "Topic sentence", right: "Main idea" }, { left: "Supporting details", right: "Examples" }, { left: "Linking words", right: "Transitions" }, { left: "Conclusion", right: "Summary" }], correctAnswer: "[0,1,2,3]", explanation: "Each element is essential for good writing." },
          { type: "CHECKBOX", question: "Select all good writing tips:", options: ["Plan before you write", "Use varied vocabulary", "Write only one long paragraph", "Check your spelling"], correctAnswer: "[0,1,3]", explanation: "You should use multiple paragraphs, not just one. The others are good tips." },
          { type: "ORDERING", question: "Put in order: the / read / questions / first / then / text / answer", correctAnswer: "Read the questions first,then answer the text", explanation: "Strategy: Read questions first, then read text to find answers." },
          { type: "SPEECH", question: "The city was crowded, noisy, but full of life and energy.", correctAnswer: "The city was crowded, noisy, but full of life and energy.", language: "en", hint: "Describe a busy city" },
          { type: "SPEECH", question: "Dear Sir, I am writing to apply for the position advertised on your website.", correctAnswer: "Dear Sir, I am writing to apply for the position advertised on your website.", language: "en", hint: "Start a formal job application email" },
          { type: "SPEECH", question: "In conclusion, learning English opens many doors for your career.", correctAnswer: "In conclusion, learning English opens many doors for your career.", language: "en", hint: "Write a concluding sentence about learning English" },
        ]
      },
    ]
  },
]

async function seedEnglishA2() {
  console.log('=========================================')
  console.log('🚀 Seeding English A2 Course...')
  console.log('=========================================')

  try {
    // Get or create Languages category
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
          order: 2,
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
    console.log('🎉 English A2 Course Seed Complete!')
    console.log('=========================================')
    console.log(`📚 Course: ${course.title}`)
    console.log(`📦 Modules: ${modulesData.length}`)
    console.log(`📝 Lessons: ${totalLessons}`)
    console.log(`❓ Questions: ${totalQuestions}`)
    console.log(`🆔 Course ID: ${course.id}`)
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding English A2 course:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnglishA2()


