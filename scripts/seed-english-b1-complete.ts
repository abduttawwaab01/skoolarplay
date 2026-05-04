import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`⏳ Connection failed, retrying in ${delay}ms... (${i + 1}/${retries})`)
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

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
  title: "English B1 - Intermediate",
  description: "Take your English to the next level! Master intermediate grammar, expand your vocabulary, and communicate confidently in a wide range of situations. Covers all CEFR B1 competencies.",
  difficulty: "INTERMEDIATE",
  minimumLevel: "B1",
  isFree: true,
  isPremium: false,
  cutoffScore: 70,
  status: "PUBLISHED",
  icon: "🎓",
  color: "#7c3aed",
}

const modulesData = [
  {
    title: "Advanced Past Tenses",
    lessons: [
      {
        title: "Past Continuous for Background Actions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which sentence uses past continuous correctly?", options: ["I was reading when the phone rang", "I was read when the phone rang", "I reading when the phone rang", "I was reading when the phone was ringing"], correctAnswer: "0", explanation: "Past continuous: was/were + verb-ing for background actions interrupted by past simple." },
          { type: "MCQ", question: "'She ___ dinner when the lights went out.'", options: ["was cooking", "cooked", "is cooking", "cooks"], correctAnswer: "0", explanation: "Past continuous for an ongoing action interrupted by another: 'was cooking'." },
          { type: "MCQ", question: "'They ___ football at 5 PM yesterday.'", options: ["were playing", "played", "are playing", "play"], correctAnswer: "0", explanation: "Past continuous for an action in progress at a specific past time." },
          { type: "MCQ", question: "What is the negative form?", options: ["was not / wasn't + verb-ing", "didn't + verb-ing", "not + verb-ing", "wasn't + verb"], correctAnswer: "0", explanation: "Negative: wasn't/weren't + verb-ing." },
          { type: "TRUE_FALSE", question: "True or False: 'I was sleeping when you called' uses past continuous for the longer action.", correctAnswer: "true", explanation: "Past continuous describes the longer background action." },
          { type: "TRUE_FALSE", question: "True or False: 'She was knowing the answer' is correct.", correctAnswer: "false", explanation: "Stative verbs (know, believe, want) don't use continuous forms." },
          { type: "FILL_BLANK", question: "Complete: It ___ (rain) when we left the house.", correctAnswer: "was raining", explanation: "Past continuous for weather as background: 'was raining'." },
          { type: "FILL_BLANK", question: "Complete: While I ___ (walk) to school, I saw an accident.", correctAnswer: "was walking", explanation: "'While' often introduces past continuous." },
          { type: "FILL_BLANK", question: "Complete: They ___ (not/watch) TV when I arrived.", correctAnswer: "weren't watching", explanation: "Negative past continuous: weren't + verb-ing." },
          { type: "MATCHING", question: "Match the sentence with its use:", options: [{ left: "I was studying all evening", right: "Continuous action" }, { left: "She was crossing the street when...", right: "Interrupted action" }, { left: "At 8 PM, we were eating", right: "Action at specific time" }, { left: "While he was driving, he sang", right: "Parallel actions" }], correctAnswer: "[0,1,2,3]", explanation: "Past continuous has several uses." },
          { type: "CHECKBOX", question: "Select all correct past continuous sentences:", options: ["He was running fast", "They were talking loudly", "She was understanding the lesson", "I was having a shower"], correctAnswer: "[0,1,3]", explanation: "'Understanding' is stative; don't use continuous. The others are correct." },
          { type: "ORDERING", question: "Put in order: was / when / she / sleeping / I / called", correctAnswer: "She was sleeping,when I called", explanation: "Past continuous + when + past simple." },
          { type: "SPEECH", question: "I was watching a movie when the power went out.", correctAnswer: "I was watching a movie when the power went out.", language: "en", hint: "Describe an interrupted action" },
          { type: "SPEECH", question: "They were playing in the garden while it was snowing.", correctAnswer: "They were playing in the garden while it was snowing.", language: "en", hint: "Describe two parallel past actions" },
        ]
      },
      {
        title: "Past Continuous vs Past Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I ___ (read) a book when she ___ (arrive).'", options: ["was reading, arrived", "read, was arriving", "was reading, was arriving", "read, arrived"], correctAnswer: "0", explanation: "Longer action = past continuous; interruption = past simple." },
          { type: "MCQ", question: "Which word introduces a past continuous action?", options: ["While", "When", "After", "Before"], correctAnswer: "0", explanation: "'While' typically introduces the continuous background action." },
          { type: "MCQ", question: "'When I ___ home, my mom ___ dinner.'", options: ["got, was cooking", "was getting, cooked", "got, cooked", "was getting, was cooking"], correctAnswer: "0", explanation: "Short action (got) interrupts longer action (was cooking)." },
          { type: "MCQ", question: "Which sentence has both actions in past simple?", options: ["I opened the door and walked in", "I was opening the door and walking in", "I was opening the door when I walked in", "I opened the door while walking in"], correctAnswer: "0", explanation: "Sequential completed actions both use past simple." },
          { type: "TRUE_FALSE", question: "True or False: 'While' is followed by past continuous.", correctAnswer: "true", explanation: "'While + past continuous' is the standard pattern." },
          { type: "TRUE_FALSE", question: "True or False: 'When' is always followed by past simple.", correctAnswer: "false", explanation: "'When' can be followed by either, depending on context." },
          { type: "FILL_BLANK", question: "Complete: He ___ (drive) to work when he ___ (see) the accident.", correctAnswer: "was driving,saw", explanation: "Background action (was driving) + interruption (saw)." },
          { type: "FILL_BLANK", question: "Complete: While they ___ (have) dinner, the phone ___ (ring).", correctAnswer: "were having,rang", explanation: "While + past continuous, past simple for interruption." },
          { type: "FILL_BLANK", question: "Complete: I ___ (break) my leg while I ___ (ski).", correctAnswer: "broke,was skiing", explanation: "Past simple interruption + while + past continuous." },
          { type: "MATCHING", question: "Match the pattern:", options: [{ left: "While I was walking, it started raining", right: "While + continuous, simple" }, { left: "When she arrived, I was sleeping", right: "When + simple, continuous" }, { left: "I finished work and went home", right: "Two past simple actions" }, { left: "As I was leaving, he called", right: "As + continuous, simple" }], correctAnswer: "[0,1,2,3]", explanation: "Each pattern shows a different combination." },
          { type: "CHECKBOX", question: "Select all correct combinations:", options: ["While I was cooking, she called", "When I saw him, he was running", "I was eating and watched TV", "She fell while she was dancing"], correctAnswer: "[0,1,3]", explanation: "'I was eating and watched' mixes forms awkwardly; should be 'was eating and watching' or 'ate and watched'." },
          { type: "ORDERING", question: "Put in order: while / was / they / playing / it / started / to rain", correctAnswer: "While they were playing,it started to rain", explanation: "While + past continuous, past simple for the interruption." },
          { type: "SPEECH", question: "I was studying when my friend called to invite me out.", correctAnswer: "I was studying when my friend called to invite me out.", language: "en", hint: "Describe being interrupted while studying" },
          { type: "SPEECH", question: "While we were driving, we saw a beautiful sunset.", correctAnswer: "While we were driving, we saw a beautiful sunset.", language: "en", hint: "Describe seeing something while traveling" },
        ]
      },
      {
        title: "Past Perfect Tense",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I had finished before she arrived", "I had finish before she arrived", "I have finished before she arrived", "I finished had before she arrived"], correctAnswer: "0", explanation: "Past perfect: had + past participle for an action before another past action." },
          { type: "MCQ", question: "'She ___ already ___ when I called.'", options: ["had, left", "has, left", "have, left", "had, leave"], correctAnswer: "0", explanation: "Past perfect: had + past participle: 'had already left'." },
          { type: "MCQ", question: "'They ___ never ___ abroad before last year.'", options: ["had, been", "have, been", "had, be", "has, been"], correctAnswer: "0", explanation: "Past perfect for experience before a past time: 'had never been'." },
          { type: "MCQ", question: "What is the negative form?", options: ["had not / hadn't + past participle", "didn't have + past participle", "not had + past participle", "hadn't + base verb"], correctAnswer: "0", explanation: "Negative: hadn't + past participle." },
          { type: "TRUE_FALSE", question: "True or False: 'I had eaten breakfast before I went to school' shows the earlier action first.", correctAnswer: "true", explanation: "Past perfect (had eaten) happened before past simple (went)." },
          { type: "TRUE_FALSE", question: "True or False: 'She had went to the store' is correct.", correctAnswer: "false", explanation: "Past participle of 'go' is 'gone': 'She had gone to the store'." },
          { type: "FILL_BLANK", question: "Complete: By the time we arrived, the movie ___ (already/start).", correctAnswer: "had already started", explanation: "Past perfect for action completed before another past action." },
          { type: "FILL_BLANK", question: "Complete: He ___ (never/see) snow before he moved to Canada.", correctAnswer: "had never seen", explanation: "Past perfect for experience before a past event." },
          { type: "FILL_BLANK", question: "Complete: After she ___ (finish) work, she went home.", correctAnswer: "had finished", explanation: "Past perfect after 'after' for the earlier action." },
          { type: "MATCHING", question: "Match the sentence with the timeline:", options: [{ left: "I had eaten before I left", right: "Eating happened first" }, { left: "She had studied for years before passing", right: "Studying happened first" }, { left: "They had married before moving", right: "Marriage happened first" }, { left: "He had lived there before he got the job", right: "Living happened first" }], correctAnswer: "[0,1,2,3]", explanation: "Past perfect always shows the earlier of two past actions." },
          { type: "CHECKBOX", question: "Select all correct past perfect sentences:", options: ["I had already eaten when they invited me", "She had never flown before", "They had went to the park", "He had finished before the deadline"], correctAnswer: "[0,1,3]", explanation: "'Had went' is wrong; should be 'had gone'. The others are correct." },
          { type: "ORDERING", question: "Put in order: had / she / the / finished / exam / before / she / left", correctAnswer: "She had finished the exam,before she left", explanation: "Past perfect + before + past simple." },
          { type: "SPEECH", question: "I had never traveled abroad before I turned twenty.", correctAnswer: "I had never traveled abroad before I turned twenty.", language: "en", hint: "Talk about a first experience" },
          { type: "SPEECH", question: "By the time the police arrived, the thief had already escaped.", correctAnswer: "By the time the police arrived, the thief had already escaped.", language: "en", hint: "Describe something that happened before another event" },
        ]
      },
      {
        title: "Past Perfect vs Past Simple Practice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'When I ___ at the station, the train ___ already ___.", options: ["arrived, had, left", "had arrived, left", "arrived, left", "was arriving, had left"], correctAnswer: "0", explanation: "Arriving (past simple) happened after the train had left (past perfect)." },
          { type: "MCQ", question: "'She ___ the book that I ___ her.'", options: ["returned, had lent", "had returned, lent", "returned, lent", "had returned, had lent"], correctAnswer: "0", explanation: "Lending (past perfect) happened before returning (past simple)." },
          { type: "MCQ", question: "Which sentence uses past perfect correctly?", options: ["I had visited Paris before I went to London", "I had visit Paris before I went to London", "I visited Paris before I had gone to London", "I was visiting Paris before I went to London"], correctAnswer: "0", explanation: "First action (visited Paris) = past perfect; second (went to London) = past simple." },
          { type: "MCQ", question: "'After he ___ his homework, he ___ TV.'", options: ["had finished, watched", "finished, had watched", "had finished, had watched", "finishes, watched"], correctAnswer: "0", explanation: "After + past perfect (earlier action), past simple (later action)." },
          { type: "TRUE_FALSE", question: "True or False: 'I had eaten lunch when I went to the restaurant' makes logical sense.", correctAnswer: "false", explanation: "If you went to the restaurant first, then ate there: 'When I went to the restaurant, I ate lunch'." },
          { type: "TRUE_FALSE", question: "True or False: Past perfect is used for the earlier of two past actions.", correctAnswer: "true", explanation: "Past perfect = the action that happened first in the past." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/realize) that I ___ (lose) my wallet.", correctAnswer: "didn't realize,had lost", explanation: "Realizing (past simple) happened after losing (past perfect)." },
          { type: "FILL_BLANK", question: "Complete: The teacher was angry because I ___ (not/do) my homework.", correctAnswer: "hadn't done", explanation: "Not doing homework happened before the teacher's anger." },
          { type: "FILL_BLANK", question: "Complete: By the time she ___ (arrive), we ___ (already/eat).", correctAnswer: "arrived,had already eaten", explanation: "Arriving (past simple) after eating (past perfect)." },
          { type: "MATCHING", question: "Match the sentence with the correct tense order:", options: [{ left: "I had locked the door before I left", right: "Lock → Leave" }, { left: "She called after she had landed", right: "Land → Call" }, { left: "He was tired because he had worked all day", right: "Work → Feel tired" }, { left: "They had never met before the party", right: "Never met → Party" }], correctAnswer: "[0,1,2,3]", explanation: "Past perfect always comes first chronologically." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I had studied English before I moved to the US", "She had cooked dinner when I arrived home", "He had broke his phone", "We had been friends since childhood"], correctAnswer: "[0,1]", explanation: "'Had broke' should be 'had broken'. 'Had been friends since' needs a past endpoint. 0 and 1 are correct." },
          { type: "ORDERING", question: "Put in order: had / the / already / movie / started / when / we / arrived", correctAnswer: "The movie had already started,when we arrived", explanation: "Past perfect (earlier) + when + past simple (later)." },
          { type: "SPEECH", question: "I had already eaten when they offered me dinner.", correctAnswer: "I had already eaten when they offered me dinner.", language: "en", hint: "Say you ate before an offer" },
          { type: "SPEECH", question: "She had never seen the ocean before she visited California.", correctAnswer: "She had never seen the ocean before she visited California.", language: "en", hint: "Talk about a first-time experience" },
        ]
      },
      {
        title: "Module 1 Review: Advanced Past Tenses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I ___ when the alarm ___.'", options: ["was sleeping, went off", "slept, was going off", "was sleeping, was going off", "slept, went off"], correctAnswer: "0", explanation: "Sleeping (continuous background) + alarm (sudden interruption)." },
          { type: "MCQ", question: "'She ___ the report before the meeting started.'", options: ["had finished", "was finishing", "finishes", "finished"], correctAnswer: "0", explanation: "Past perfect for action completed before another past action." },
          { type: "MCQ", question: "'While they ___ to music, someone ___ at the door.'", options: ["were listening, knocked", "listened, was knocking", "were listening, was knocking", "listened, knocked"], correctAnswer: "0", explanation: "While + past continuous, past simple for interruption." },
          { type: "MCQ", question: "Which uses all three past tenses correctly?", options: ["I was walking home when I realized I had forgotten my keys", "I walked home when I was realizing I had forgot my keys", "I was walking home when I had realized I forgot my keys", "I had walked home when I was realizing I had forgotten my keys"], correctAnswer: "0", explanation: "Was walking (continuous) + realized (simple) + had forgotten (earlier)." },
          { type: "TRUE_FALSE", question: "True or False: 'I had been knowing her for years' is correct.", correctAnswer: "false", explanation: "'Know' is stative; use past perfect simple: 'I had known her for years'." },
          { type: "TRUE_FALSE", question: "True or False: 'By the time he arrived, we had already left' is correct.", correctAnswer: "true", explanation: "Past perfect for the earlier action (leaving) before arriving." },
          { type: "FILL_BLANK", question: "Complete: He ___ (work) at the company for five years before he ___ (get) promoted.", correctAnswer: "had worked,got", explanation: "Working happened before promotion." },
          { type: "FILL_BLANK", question: "Complete: While I ___ (wait) for the bus, it ___ (start) to snow.", correctAnswer: "was waiting,started", explanation: "Waiting (continuous) + starting (interruption)." },
          { type: "FILL_BLANK", question: "Complete: She ___ (never/fly) before she ___ (take) that trip.", correctAnswer: "had never flew,took", explanation: "No flying before the trip." },
          { type: "MATCHING", question: "Match the tense with its function:", options: [{ left: "Past Simple", right: "Completed action" }, { left: "Past Continuous", right: "Action in progress" }, { left: "Past Perfect", right: "Earlier past action" }, { left: "While + Past Continuous", right: "Background action" }], correctAnswer: "[0,1,2,3]", explanation: "Each past tense has a specific function." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I was reading when the door opened", "She had already eaten by 7 PM", "They were playing while it rained", "He had went home early"], correctAnswer: "[0,1,2]", explanation: "'Had went' should be 'had gone'. The others are correct." },
          { type: "ORDERING", question: "Put in order: had / I / never / tried / sushi / before / I / went / to Japan", correctAnswer: "I had never tried sushi,before I went to Japan", explanation: "Past perfect (earlier experience) + before + past simple." },
          { type: "SPEECH", question: "I had been waiting for an hour when the bus finally arrived.", correctAnswer: "I had been waiting for an hour when the bus finally arrived.", language: "en", hint: "Describe a long wait" },
          { type: "SPEECH", question: "While she was cooking, her children were doing their homework.", correctAnswer: "While she was cooking, her children were doing their homework.", language: "en", hint: "Describe two simultaneous past actions" },
          { type: "SPEECH", question: "By the time the doctor came, the patient had already recovered.", correctAnswer: "By the time the doctor came, the patient had already recovered.", language: "en", hint: "Describe recovery before a doctor's visit" },
        ]
      },
    ]
  },
  {
    title: "Present Perfect Continuous",
    lessons: [
      {
        title: "Form and Use of Present Perfect Continuous",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I have been working for three hours", "I have been work for three hours", "I have working for three hours", "I am been working for three hours"], correctAnswer: "0", explanation: "Present perfect continuous: have/has + been + verb-ing." },
          { type: "MCQ", question: "'She ___ studying since morning.'", options: ["has been", "have been", "is been", "was been"], correctAnswer: "0", explanation: "She/he/it uses 'has been' + verb-ing." },
          { type: "MCQ", question: "What does present perfect continuous emphasize?", options: ["Duration of an ongoing action", "Completion of an action", "A future plan", "A past habit"], correctAnswer: "0", explanation: "It emphasizes how long an action has been happening." },
          { type: "MCQ", question: "'They ___ waiting for the bus ___ 20 minutes.'", options: ["have been, for", "has been, since", "have been, since", "are been, for"], correctAnswer: "0", explanation: "'Have been waiting for 20 minutes' (duration)." },
          { type: "TRUE_FALSE", question: "True or False: 'I have been knowing him for years' is correct.", correctAnswer: "false", explanation: "Stative verbs (know, believe, love) don't use continuous forms. Use 'I have known him'." },
          { type: "TRUE_FALSE", question: "True or False: Present perfect continuous can describe a recently finished action with visible results.", correctAnswer: "true", explanation: "'I've been running' (I'm sweaty) shows recent action with present result." },
          { type: "FILL_BLANK", question: "Complete: He ___ (play) video games all afternoon.", correctAnswer: "has been playing", explanation: "Has been + verb-ing for continuous action up to now." },
          { type: "FILL_BLANK", question: "Complete: We ___ (live) here since 2018.", correctAnswer: "have been living", explanation: "Have been living = started in past, continues now." },
          { type: "FILL_BLANK", question: "Complete: ___ you ___ (exercise)? You look tired.", correctAnswer: "Have,been exercising", explanation: "Question: Have + subject + been + verb-ing?" },
          { type: "MATCHING", question: "Match the sentence with its meaning:", options: [{ left: "I've been reading this book", right: "Started reading, still reading" }, { left: "It's been raining", right: "Recently stopped, ground is wet" }, { left: "She's been crying", right: "Visible result: red eyes" }, { left: "They've been traveling", right: "Ongoing journey" }], correctAnswer: "[0,1,2,3]", explanation: "Present perfect continuous has multiple uses." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I've been studying all day", "She has been working here for years", "He has been wanting a new car", "We've been waiting since 3 PM"], correctAnswer: "[0,1,3]", explanation: "'Has been wanting' uses a stative verb incorrectly. The others are correct." },
          { type: "ORDERING", question: "Put in order: been / has / raining / it / all / day", correctAnswer: "It,has been raining,all day", explanation: "Subject + has been + verb-ing + time expression." },
          { type: "SPEECH", question: "I have been learning English for five years now.", correctAnswer: "I have been learning English for five years now.", language: "en", hint: "Talk about how long you've been studying" },
          { type: "SPEECH", question: "She has been practicing the piano since she was six.", correctAnswer: "She has been practicing the piano since she was six.", language: "en", hint: "Talk about a long-term practice" },
        ]
      },
      {
        title: "Present Perfect Continuous vs Present Perfect Simple",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which emphasizes the result?", options: ["I have written three emails", "I have been writing emails", "I am writing emails", "I wrote three emails"], correctAnswer: "0", explanation: "Present perfect simple emphasizes the completed result (three emails)." },
          { type: "MCQ", question: "Which emphasizes the duration?", options: ["I have been reading for two hours", "I have read a book", "I read a book yesterday", "I am reading"], correctAnswer: "0", explanation: "Present perfect continuous emphasizes how long." },
          { type: "MCQ", question: "'I ___ the book.' (finished it)", options: ["have read", "have been reading", "am reading", "read"], correctAnswer: "0", explanation: "Present perfect simple for a completed action." },
          { type: "MCQ", question: "'I ___ the book.' (not finished yet)", options: ["have been reading", "have read", "read", "am read"], correctAnswer: "0", explanation: "Present perfect continuous for an ongoing, incomplete action." },
          { type: "TRUE_FALSE", question: "True or False: 'I have lived here for 10 years' and 'I have been living here for 10 years' mean the same thing.", correctAnswer: "true", explanation: "For 'live' and 'work', both forms are often interchangeable." },
          { type: "TRUE_FALSE", question: "True or False: Present perfect continuous can be used with numbers/quantities.", correctAnswer: "false", explanation: "Use simple for quantities: 'I have written five letters' (not 'have been writing five letters')." },
          { type: "FILL_BLANK", question: "Complete: I ___ (drink) three cups of coffee today.", correctAnswer: "have drunk", explanation: "Quantity = present perfect simple." },
          { type: "FILL_BLANK", question: "Complete: She ___ (write) emails all morning.", correctAnswer: "has been writing", explanation: "Duration = present perfect continuous." },
          { type: "FILL_BLANK", question: "Complete: I ___ (know) him since we were children.", correctAnswer: "have known", explanation: "'Know' is stative; use present perfect simple." },
          { type: "MATCHING", question: "Match the focus:", options: [{ left: "I have painted the room", right: "Result (room is painted)" }, { left: "I have been painting the room", right: "Activity (paint in hand)" }, { left: "She has visited Paris twice", right: "Number of times" }, { left: "She has been visiting Paris", right: "Repeated activity" }], correctAnswer: "[0,1,2,3]", explanation: "Simple = result/quantity; Continuous = activity/duration." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I have been running five miles", "I have run five miles", "She has been cooking since noon", "He has cooked dinner"], correctAnswer: "[1,2,3]", explanation: "'Have been running five miles' is wrong; quantity needs simple: 'have run five miles'." },
          { type: "ORDERING", question: "Put in order: have / three / I / cakes / baked", correctAnswer: "I,have baked,three cakes", explanation: "Subject + have + past participle + quantity." },
          { type: "SPEECH", question: "I have been waiting for you for over an hour!", correctAnswer: "I have been waiting for you for over an hour!", language: "en", hint: "Express frustration about waiting" },
          { type: "SPEECH", question: "She has already finished her assignment.", correctAnswer: "She has already finished her assignment.", language: "en", hint: "Say someone completed something" },
        ]
      },
      {
        title: "Present Perfect Continuous in Context",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Why are your eyes red?' 'I ___.'", options: ["have been crying", "have cried", "am crying", "was crying"], correctAnswer: "0", explanation: "Present perfect continuous for a recent action with visible result." },
          { type: "MCQ", question: "'How long ___ you ___ English?'", options: ["have, been studying", "have, studied", "are, studying", "did, study"], correctAnswer: "0", explanation: "'How long' + present perfect continuous for ongoing actions." },
          { type: "MCQ", question: "'My back hurts because I ___ in the garden.'", options: ["have been working", "have worked", "worked", "am working"], correctAnswer: "0", explanation: "Recent continuous action explaining a present state." },
          { type: "MCQ", question: "'She ___ on this project since January.'", options: ["has been working", "has worked", "is working", "was working"], correctAnswer: "0", explanation: "'Has been working' emphasizes ongoing effort over time." },
          { type: "TRUE_FALSE", question: "True or False: 'I've been losing my keys' is correct.", correctAnswer: "false", explanation: "'Lose' is a momentary action; use 'I've lost my keys'." },
          { type: "TRUE_FALSE", question: "True or False: 'I've been trying to call you all day' shows repeated attempts.", correctAnswer: "true", explanation: "Present perfect continuous for repeated actions over a period." },
          { type: "FILL_BLANK", question: "Complete: He ___ (not/feel) well lately.", correctAnswer: "hasn't been feeling", explanation: "Present perfect continuous for recent ongoing state." },
          { type: "FILL_BLANK", question: "Complete: How long ___ she ___ (wait) for us?", correctAnswer: "has,been waiting", explanation: "How long + has + subject + been + verb-ing?" },
          { type: "FILL_BLANK", question: "Complete: I ___ (look) for my phone everywhere!", correctAnswer: "have been looking", explanation: "Recent repeated action with present relevance." },
          { type: "MATCHING", question: "Match the context with the response:", options: [{ left: "You're out of breath!", right: "I've been running" }, { left: "Your hands are dirty!", right: "I've been gardening" }, { left: "You speak so well!", right: "I've been practicing" }, { left: "You look tired!", right: "I've been working hard" }], correctAnswer: "[0,1,2,3]", explanation: "Each response explains a visible result." },
          { type: "CHECKBOX", question: "Select all correct uses:", options: ["I've been thinking about your offer", "She's been having a cold", "They've been arguing all day", "He's been knowing the answer"], correctAnswer: "[0,2]", explanation: "'Having a cold' and 'knowing' are stative; use simple forms." },
          { type: "ORDERING", question: "Put in order: been / how long / you / learning / have / Spanish?", correctAnswer: "How long,have you been learning,Spanish?", explanation: "How long + have + subject + been + verb-ing?" },
          { type: "SPEECH", question: "I've been trying to fix this computer for hours.", correctAnswer: "I've been trying to fix this computer for hours.", language: "en", hint: "Complain about a long task" },
          { type: "SPEECH", question: "She has been studying really hard for her exams.", correctAnswer: "She has been studying really hard for her exams.", language: "en", hint: "Describe someone's recent effort" },
        ]
      },
      {
        title: "Time Expressions with Perfect Tenses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which time expression goes with present perfect continuous?", options: ["for the past few hours", "yesterday", "last week", "in 2020"], correctAnswer: "0", explanation: "'For the past few hours' connects past to present." },
          { type: "MCQ", question: "'___, I have been reading a lot.'", options: ["Lately", "Yesterday", "Last month", "Two years ago"], correctAnswer: "0", explanation: "'Lately' is used with present perfect tenses." },
          { type: "MCQ", question: "'She has been working here ___ five years.'", options: ["for", "since", "from", "during"], correctAnswer: "0", explanation: "'For' + duration: 'for five years'." },
          { type: "MCQ", question: "'I've been feeling tired ___ I started this new job.'", options: ["since", "for", "from", "during"], correctAnswer: "0", explanation: "'Since' + starting point: 'since I started'." },
          { type: "TRUE_FALSE", question: "True or False: 'Recently' can be used with present perfect continuous.", correctAnswer: "true", explanation: "'I've been exercising recently' is correct." },
          { type: "TRUE_FALSE", question: "True or False: 'I have been working here since three years' is correct.", correctAnswer: "false", explanation: "Use 'for' with durations: 'for three years'." },
          { type: "FILL_BLANK", question: "Complete: It's been snowing ___ this morning.", correctAnswer: "since", explanation: "'Since this morning' = from morning until now." },
          { type: "FILL_BLANK", question: "Complete: He's been calling me ___ weeks.", correctAnswer: "for", explanation: "'For weeks' = over a period of weeks." },
          { type: "FILL_BLANK", question: "Complete: I've been feeling great ___ I started exercising.", correctAnswer: "ever since", explanation: "'Ever since' emphasizes the starting point." },
          { type: "MATCHING", question: "Match the expression with its type:", options: [{ left: "for two hours", right: "Duration" }, { left: "since Monday", right: "Starting point" }, { left: "all day", right: "Continuous period" }, { left: "lately", right: "Recent time" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression indicates a different time relationship." },
          { type: "CHECKBOX", question: "Select all correct time expressions for present perfect:", options: ["so far", "up to now", "in the last few days", "two days ago"], correctAnswer: "[0,1,2]", explanation: "'Two days ago' is past simple, not present perfect." },
          { type: "ORDERING", question: "Put in order: been / she / working / for / has / the company / six months", correctAnswer: "She,has been working for the company,for six months", explanation: "Subject + has been + verb-ing + for + duration." },
          { type: "SPEECH", question: "I've been learning to cook since I moved out.", correctAnswer: "I've been learning to cook since I moved out.", language: "en", hint: "Talk about a skill you've been developing" },
          { type: "SPEECH", question: "They've been traveling around Europe for the past month.", correctAnswer: "They've been traveling around Europe for the past month.", language: "en", hint: "Describe an ongoing trip" },
        ]
      },
      {
        title: "Module 2 Review: Present Perfect Continuous",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'How long ___ you ___ here?'", options: ["have, been waiting", "have, waited", "are, waiting", "did, wait"], correctAnswer: "0", explanation: "How long + present perfect continuous for ongoing action." },
          { type: "MCQ", question: "'I ___ five chapters today.' (completed)", options: ["have read", "have been reading", "am reading", "read"], correctAnswer: "0", explanation: "Quantity/completed = present perfect simple." },
          { type: "MCQ", question: "'She ___ on this essay all afternoon.'", options: ["has been working", "has worked", "works", "is working"], correctAnswer: "0", explanation: "Duration emphasis = present perfect continuous." },
          { type: "MCQ", question: "Which is NOT correct?", options: ["I have been having a headache", "I have had a headache", "I've had a headache all day", "I have been suffering from a headache"], correctAnswer: "0", explanation: "'Have' (possession/illness) is stative; use simple: 'I have had'." },
          { type: "TRUE_FALSE", question: "True or False: 'I've been writing three letters' emphasizes the activity, not the result.", correctAnswer: "true", explanation: "Continuous emphasizes the activity, but with quantities, simple is preferred." },
          { type: "TRUE_FALSE", question: "True or False: 'She has been living in London since 2020' is correct.", correctAnswer: "true", explanation: "Present perfect continuous for an ongoing situation." },
          { type: "FILL_BLANK", question: "Complete: We ___ (study) this topic for two weeks.", correctAnswer: "have been studying", explanation: "Duration = present perfect continuous." },
          { type: "FILL_BLANK", question: "Complete: He ___ (eat) two sandwiches already.", correctAnswer: "has eaten", explanation: "Quantity = present perfect simple." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/sleep) well lately.", correctAnswer: "haven't been sleeping", explanation: "Recent ongoing negative = present perfect continuous." },
          { type: "MATCHING", question: "Match the tense with the situation:", options: [{ left: "I've been jogging", right: "Explaining why you're sweaty" }, { left: "I've jogged five miles", right: "Reporting distance covered" }, { left: "I've read that book", right: "Confirming experience" }, { left: "I've been reading", right: "Explaining what you've been doing" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense fits a different communicative purpose." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I've been meaning to call you", "She has been owning that car for years", "They've been building the bridge for months", "He has been knowing the truth"], correctAnswer: "[0,2]", explanation: "'Owning' and 'knowing' are stative. The others are correct." },
          { type: "ORDERING", question: "Put in order: all / has / morning / she / been / crying", correctAnswer: "She,has been crying,all morning", explanation: "Subject + has been + verb-ing + time expression." },
          { type: "SPEECH", question: "I have been working on this project since last month.", correctAnswer: "I have been working on this project since last month.", language: "en", hint: "Talk about an ongoing project" },
          { type: "SPEECH", question: "How long have you been learning to play the guitar?", correctAnswer: "How long have you been learning to play the guitar?", language: "en", hint: "Ask about someone's learning duration" },
          { type: "SPEECH", question: "We have been trying to solve this problem for hours.", correctAnswer: "We have been trying to solve this problem for hours.", language: "en", hint: "Express ongoing effort" },
        ]
      },
    ]
  },
  {
    title: "Advanced Future Forms",
    lessons: [
      {
        title: "Future Continuous (Will Be + Verb-ing)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I will be studying at 8 PM", "I will studying at 8 PM", "I will be study at 8 PM", "I am will studying at 8 PM"], correctAnswer: "0", explanation: "Future continuous: will be + verb-ing." },
          { type: "MCQ", question: "'This time tomorrow, I ___ on the beach.'", options: ["will be lying", "will lie", "am lying", "will be lie"], correctAnswer: "0", explanation: "Future continuous for an action in progress at a specific future time." },
          { type: "MCQ", question: "'She ___ working when you arrive.'", options: ["will be", "will", "is being", "is going"], correctAnswer: "0", explanation: "Future continuous: will be + verb-ing for an ongoing future action." },
          { type: "MCQ", question: "When do we use future continuous?", options: ["For actions in progress at a specific future time", "For completed future actions", "For past habits", "For general facts"], correctAnswer: "0", explanation: "Future continuous = action that will be happening at a particular moment in the future." },
          { type: "TRUE_FALSE", question: "True or False: 'I will be waiting for you at the station' shows a planned ongoing action.", correctAnswer: "true", explanation: "Future continuous for an action that will be in progress." },
          { type: "TRUE_FALSE", question: "True or False: 'I will be knowing the answer tomorrow' is correct.", correctAnswer: "false", explanation: "'Know' is stative; don't use continuous forms." },
          { type: "FILL_BLANK", question: "Complete: At noon, we ___ (have) lunch.", correctAnswer: "will be having", explanation: "Future continuous for action at a specific time." },
          { type: "FILL_BLANK", question: "Complete: Don't call at 9. I ___ (watch) the game.", correctAnswer: "will be watching", explanation: "Future continuous to explain unavailability." },
          { type: "FILL_BLANK", question: "Complete: ___ you ___ (use) the car tonight?", correctAnswer: "Will,be using", explanation: "Future continuous question: Will + subject + be + verb-ing?" },
          { type: "MATCHING", question: "Match the sentence with its use:", options: [{ left: "I'll be working at 6 PM", right: "Action in progress" }, { left: "Will you be joining us?", right: "Polite inquiry" }, { left: "She'll be arriving soon", right: "Expected event" }, { left: "I'll be seeing him tomorrow", right: "Planned meeting" }], correctAnswer: "[0,1,2,3]", explanation: "Future continuous has several communicative functions." },
          { type: "CHECKBOX", question: "Select all correct future continuous sentences:", options: ["They will be traveling next week", "I'll be thinking about it", "She will be arriving at 5", "He will be having a new car"], correctAnswer: "[0,2]", explanation: "'Will be thinking' (stative) and 'will be having a car' (possession) are incorrect." },
          { type: "ORDERING", question: "Put in order: will / be / at / she / sleeping / midnight", correctAnswer: "She,will be sleeping,at midnight", explanation: "Subject + will be + verb-ing + time." },
          { type: "SPEECH", question: "This time next week, I will be flying to New York.", correctAnswer: "This time next week, I will be flying to New York.", language: "en", hint: "Talk about what you'll be doing at a future time" },
          { type: "SPEECH", question: "Don't worry, I will be waiting for you at the entrance.", correctAnswer: "Don't worry, I will be waiting for you at the entrance.", language: "en", hint: "Reassure someone about a future meeting" },
        ]
      },
      {
        title: "Future Perfect (Will Have + Past Participle)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I will have finished by Friday", "I will have finish by Friday", "I will finishing by Friday", "I will had finished by Friday"], correctAnswer: "0", explanation: "Future perfect: will have + past participle." },
          { type: "MCQ", question: "'By 2030, she ___ her degree.'", options: ["will have completed", "will complete", "will be completing", "completes"], correctAnswer: "0", explanation: "Future perfect for an action completed before a future time." },
          { type: "MCQ", question: "'They ___ the bridge by next month.'", options: ["will have built", "will build", "will be building", "build"], correctAnswer: "0", explanation: "Future perfect: completed action before a future deadline." },
          { type: "MCQ", question: "What time expression goes with future perfect?", options: ["By next week", "At the moment", "Yesterday", "Right now"], correctAnswer: "0", explanation: "'By' + future time is common with future perfect." },
          { type: "TRUE_FALSE", question: "True or False: 'I will have arrived by the time you leave' shows completion before another future action.", correctAnswer: "true", explanation: "Future perfect = action finished before another future event." },
          { type: "TRUE_FALSE", question: "True or False: 'She will have knowing the truth by then' is correct.", correctAnswer: "false", explanation: "'Know' is stative; use 'will know' not 'will have known'." },
          { type: "FILL_BLANK", question: "Complete: By the end of this year, I ___ (save) enough money.", correctAnswer: "will have saved", explanation: "Future perfect for completion before a future point." },
          { type: "FILL_BLANK", question: "Complete: She ___ (graduate) by June.", correctAnswer: "will have graduated", explanation: "Future perfect: will have + past participle." },
          { type: "FILL_BLANK", question: "Complete: ___ you ___ (finish) by tomorrow?", correctAnswer: "Will,have finished", explanation: "Future perfect question: Will + subject + have + past participle?" },
          { type: "MATCHING", question: "Match the sentence with its meaning:", options: [{ left: "I'll have eaten by 7", right: "Eating finished before 7" }, { left: "She'll have left by then", right: "She will already be gone" }, { left: "They'll have built it by 2026", right: "Construction complete" }, { left: "We'll have arrived before sunset", right: "Arrival before sunset" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence shows completion before a future time." },
          { type: "CHECKBOX", question: "Select all correct future perfect sentences:", options: ["I will have written the report by Monday", "She will have finished by then", "They will have been there", "He will have eat by noon"], correctAnswer: "[0,1]", explanation: "'Will have been there' needs context; 'will have eat' is wrong (eaten). 0 and 1 are correct." },
          { type: "ORDERING", question: "Put in order: will / have / the / project / finished / by Friday / we", correctAnswer: "We,will have finished the project,by Friday", explanation: "Subject + will have + past participle + object + by + time." },
          { type: "SPEECH", question: "By next month, I will have worked here for two years.", correctAnswer: "By next month, I will have worked here for two years.", language: "en", hint: "Talk about a work anniversary" },
          { type: "SPEECH", question: "The team will have completed the project before the deadline.", correctAnswer: "The team will have completed the project before the deadline.", language: "en", hint: "Talk about finishing before a deadline" },
        ]
      },
      {
        title: "Future Perfect Continuous",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I will have been working for 10 years by then", "I will have been work for 10 years", "I will being working for 10 years", "I will have working for 10 years"], correctAnswer: "0", explanation: "Future perfect continuous: will have been + verb-ing." },
          { type: "MCQ", question: "'By June, she ___ studying for three years.'", options: ["will have been", "will have", "will be", "has been"], correctAnswer: "0", explanation: "Future perfect continuous: will have been + verb-ing for duration up to a future point." },
          { type: "MCQ", question: "What does future perfect continuous emphasize?", options: ["Duration of an action up to a future point", "Completion of an action", "A sudden future event", "A past habit"], correctAnswer: "0", explanation: "It emphasizes how long something will have been happening." },
          { type: "MCQ", question: "'By the time he retires, he ___ here for 30 years.'", options: ["will have been working", "will work", "will be working", "works"], correctAnswer: "0", explanation: "Future perfect continuous for duration before a future event." },
          { type: "TRUE_FALSE", question: "True or False: Future perfect continuous is rarely used in everyday conversation.", correctAnswer: "true", explanation: "It's a complex tense more common in formal or written English." },
          { type: "TRUE_FALSE", question: "True or False: 'I will have been knowing her for years' is correct.", correctAnswer: "false", explanation: "'Know' is stative; can't use continuous." },
          { type: "FILL_BLANK", question: "Complete: By December, I ___ (live) here for five years.", correctAnswer: "will have been living", explanation: "Future perfect continuous: will have been + verb-ing." },
          { type: "FILL_BLANK", question: "Complete: By next week, they ___ (travel) for a month.", correctAnswer: "will have been traveling", explanation: "Duration up to a future point." },
          { type: "FILL_BLANK", question: "Complete: How long ___ you ___ (study) by the time you graduate?", correctAnswer: "will,have been studying", explanation: "How long + will + subject + have been + verb-ing?" },
          { type: "MATCHING", question: "Match the tense with its future use:", options: [{ left: "I will finish", right: "Simple future" }, { left: "I will be finishing", right: "Future continuous" }, { left: "I will have finished", right: "Future perfect" }, { left: "I will have been finishing", right: "Future perfect continuous" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense expresses a different future perspective." },
          { type: "CHECKBOX", question: "Select all correct future perfect continuous sentences:", options: ["By 2027, I will have been teaching for a decade", "She will have been studying since morning", "He will have been owning the house for years", "They will have been building it for two years"], correctAnswer: "[0,1,3]", explanation: "'Owning' is stative; can't use continuous. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / been / have / for / she / working / two hours / by 5", correctAnswer: "She,will have been working,for two hours by 5", explanation: "Subject + will have been + verb-ing + duration + by + time." },
          { type: "SPEECH", question: "By next year, I will have been learning English for a decade.", correctAnswer: "By next year, I will have been learning English for a decade.", language: "en", hint: "Talk about a long-term learning milestone" },
          { type: "SPEECH", question: "By the time the movie ends, we will have been waiting for three hours.", correctAnswer: "By the time the movie ends, we will have been waiting for three hours.", language: "en", hint: "Complain about a long wait" },
        ]
      },
      {
        title: "All Future Tenses Practice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'This time tomorrow, I ___ in Tokyo.'", options: ["will be arriving", "will have arrived", "will arrive", "am arriving"], correctAnswer: "0", explanation: "Future continuous for action in progress at a specific future time." },
          { type: "MCQ", question: "'By the time you get home, I ___ dinner.'", options: ["will have cooked", "will be cooking", "will cook", "am cooking"], correctAnswer: "0", explanation: "Future perfect for completed action before a future event." },
          { type: "MCQ", question: "'I ___ you at the station at 6.' (planned)", options: ["will be waiting for", "will have waited for", "wait for", "waited for"], correctAnswer: "0", explanation: "Future continuous for a planned ongoing action." },
          { type: "MCQ", question: "'By 2030, scientists ___ a cure.'", options: ["will have discovered", "will be discovering", "will discover", "discover"], correctAnswer: "0", explanation: "Future perfect for completion before a future date." },
          { type: "TRUE_FALSE", question: "True or False: 'I will be finishing my homework by 8 PM' is correct.", correctAnswer: "false", explanation: "Use future perfect for completion: 'I will have finished by 8 PM'." },
          { type: "TRUE_FALSE", question: "True or False: 'At midnight, we will be celebrating' uses future continuous correctly.", correctAnswer: "true", explanation: "Future continuous for action in progress at a specific time." },
          { type: "FILL_BLANK", question: "Complete: By next week, I ___ (read) this book.", correctAnswer: "will have read", explanation: "Future perfect for completion before a future time." },
          { type: "FILL_BLANK", question: "Complete: At 3 PM, I ___ (meet) with my boss.", correctAnswer: "will be meeting", explanation: "Future continuous for a planned action at a specific time." },
          { type: "FILL_BLANK", question: "Complete: By the time she's 30, she ___ (travel) to 20 countries.", correctAnswer: "will have traveled", explanation: "Future perfect for achievement before a future age." },
          { type: "MATCHING", question: "Match the context with the future tense:", options: [{ left: "What will you be doing at 8?", right: "Future continuous" }, { left: "Will you have finished by noon?", right: "Future perfect" }, { left: "I'll call you tonight.", right: "Simple future" }, { left: "How long will you have been studying?", right: "Future perfect continuous" }], correctAnswer: "[0,1,2,3]", explanation: "Each context calls for a different future form." },
          { type: "CHECKBOX", question: "Select all correct future sentences:", options: ["I'll be flying to Paris tomorrow", "By Friday, I'll have submitted the report", "She will have been working here since 2020", "We will have eaten by the time you arrive"], correctAnswer: "[0,1,3]", explanation: "'Will have been working here since' needs a future endpoint, not 'since'. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / have / been / for / they / married / 25 years / by / December", correctAnswer: "They,will have been married,for 25 years by December", explanation: "Subject + will have been + past participle + duration + by + time." },
          { type: "SPEECH", question: "This time next year, I will be living in a new city.", correctAnswer: "This time next year, I will be living in a new city.", language: "en", hint: "Talk about a future life change" },
          { type: "SPEECH", question: "By the time you read this, I will have already left.", correctAnswer: "By the time you read this, I will have already left.", language: "en", hint: "Write a note about leaving before someone arrives" },
        ]
      },
      {
        title: "Module 3 Review: Advanced Future Forms",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'At 10 AM, I ___ a presentation.'", options: ["will be giving", "will have given", "will give", "gave"], correctAnswer: "0", explanation: "Future continuous for action in progress at a specific time." },
          { type: "MCQ", question: "'By the end of the day, I ___ all my emails.'", options: ["will have answered", "will be answering", "will answer", "am answering"], correctAnswer: "0", explanation: "Future perfect for completion before a future deadline." },
          { type: "MCQ", question: "'By 2030, he ___ at this company for 20 years.'", options: ["will have been working", "will work", "will be working", "works"], correctAnswer: "0", explanation: "Future perfect continuous for duration up to a future point." },
          { type: "MCQ", question: "Which tense describes an action completed before another future action?", options: ["Future perfect", "Future continuous", "Simple future", "Present continuous"], correctAnswer: "0", explanation: "Future perfect = completed before a future event." },
          { type: "TRUE_FALSE", question: "True or False: 'I will be knowing the answer soon' is correct.", correctAnswer: "false", explanation: "'Know' is stative; use 'I will know'." },
          { type: "TRUE_FALSE", question: "True or False: 'By next month, I will have been exercising for six months' is correct.", correctAnswer: "true", explanation: "Future perfect continuous for duration up to a future point." },
          { type: "FILL_BLANK", question: "Complete: By the time the concert starts, we ___ (wait) for two hours.", correctAnswer: "will have been waiting", explanation: "Future perfect continuous for duration before a future event." },
          { type: "FILL_BLANK", question: "Complete: Don't call at 7. I ___ (have) dinner.", correctAnswer: "will be having", explanation: "Future continuous to explain unavailability." },
          { type: "FILL_BLANK", question: "Complete: By 2028, she ___ (complete) her PhD.", correctAnswer: "will have completed", explanation: "Future perfect for achievement before a future date." },
          { type: "MATCHING", question: "Match the sentence with the tense:", options: [{ left: "I'll be sleeping at midnight", right: "Future continuous" }, { left: "I'll have slept by then", right: "Future perfect" }, { left: "I'll sleep when I'm tired", right: "Simple future" }, { left: "I'll have been sleeping for hours", right: "Future perfect continuous" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence uses a different future form." },
          { type: "CHECKBOX", question: "Select all correct future sentences:", options: ["She will be presenting at the conference", "By Friday, we will have decided", "They will have been traveling for a month", "He will be having three cars"], correctAnswer: "[0,1,2]", explanation: "'Will be having three cars' (possession) is incorrect. The others are correct." },
          { type: "ORDERING", question: "Put in order: will / at / be / I / working / that time", correctAnswer: "I,will be working,at that time", explanation: "Subject + will be + verb-ing + time." },
          { type: "SPEECH", question: "By the time you arrive, I will have prepared everything.", correctAnswer: "By the time you arrive, I will have prepared everything.", language: "en", hint: "Reassure someone about preparations" },
          { type: "SPEECH", question: "This time next month, we will be relaxing on the beach.", correctAnswer: "This time next month, we will be relaxing on the beach.", language: "en", hint: "Talk about a future vacation" },
          { type: "SPEECH", question: "By the end of this course, you will have been studying English for a year.", correctAnswer: "By the end of this course, you will have been studying English for a year.", language: "en", hint: "Talk about a learning milestone" },
        ]
      },
    ]
  },
  {
    title: "Advanced Conditionals",
    lessons: [
      {
        title: "Third Conditional (Past Unreal)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["If I had studied, I would have passed", "If I studied, I would have passed", "If I had studied, I would pass", "If I had study, I would have passed"], correctAnswer: "0", explanation: "Third conditional: If + past perfect, would have + past participle." },
          { type: "MCQ", question: "'If she ___ the train, she ___ late.'", options: ["had missed, would have been", "missed, would be", "had missed, would be", "missed, would have been"], correctAnswer: "0", explanation: "Third conditional for unreal past situations." },
          { type: "MCQ", question: "'I would have helped if you ___ me.'", options: ["had asked", "asked", "would have asked", "ask"], correctAnswer: "0", explanation: "Third conditional: would have + past participle + if + past perfect." },
          { type: "MCQ", question: "What does the third conditional express?", options: ["Unreal past situations", "Real future possibilities", "General truths", "Present habits"], correctAnswer: "0", explanation: "Third conditional = imaginary past situations that didn't happen." },
          { type: "TRUE_FALSE", question: "True or False: 'If I had known, I would have told you' expresses regret about the past.", correctAnswer: "true", explanation: "Third conditional often expresses regret or criticism." },
          { type: "TRUE_FALSE", question: "True or False: 'If she would have come, I would have been happy' is correct.", correctAnswer: "false", explanation: "Don't use 'would' in the if-clause: 'If she had come'." },
          { type: "FILL_BLANK", question: "Complete: If they ___ (leave) earlier, they ___ (not/miss) the flight.", correctAnswer: "had left,wouldn't have missed", explanation: "Third conditional: If + past perfect, would have + past participle." },
          { type: "FILL_BLANK", question: "Complete: She ___ (be) happier if she ___ (accept) the offer.", correctAnswer: "would have been,had accepted", explanation: "Result (would have been) + condition (had accepted)." },
          { type: "FILL_BLANK", question: "Complete: If I ___ (not/eat) so much, I ___ (not/feel) sick.", correctAnswer: "hadn't eaten,wouldn't have felt", explanation: "Negative third conditional." },
          { type: "MATCHING", question: "Match the third conditional sentence:", options: [{ left: "If I had studied harder", right: "I would have passed" }, { left: "If she had taken the job", right: "she would have earned more" }, { left: "If they had left on time", right: "they wouldn't have been late" }, { left: "If we had booked earlier", right: "we would have gotten better seats" }], correctAnswer: "[0,1,2,3]", explanation: "Each condition matches its past unreal result." },
          { type: "CHECKBOX", question: "Select all correct third conditional sentences:", options: ["If I had known, I would have helped", "She would have come if you invited her", "If they had studied, they would pass", "He would have won if he had trained"], correctAnswer: "[0,3]", explanation: "'Invited' should be 'had invited'; 'would pass' should be 'would have passed'." },
          { type: "ORDERING", question: "Put in order: would / passed / I / had / if / have / studied", correctAnswer: "I would have passed,if I had studied", explanation: "Result (would have + pp) + if + past perfect." },
          { type: "SPEECH", question: "If I had studied harder, I would have gotten a better grade.", correctAnswer: "If I had studied harder, I would have gotten a better grade.", language: "en", hint: "Express regret about studying" },
          { type: "SPEECH", question: "She would have called you if she had known your number.", correctAnswer: "She would have called you if she had known your number.", language: "en", hint: "Explain why someone didn't call" },
        ]
      },
      {
        title: "Mixed Conditionals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If I had studied medicine, I ___ a doctor now.'", options: ["would be", "would have been", "will be", "am"], correctAnswer: "0", explanation: "Mixed conditional: past condition + present result (If + past perfect, would + base verb)." },
          { type: "MCQ", question: "'If she were smarter, she ___ that mistake yesterday.'", options: ["wouldn't have made", "wouldn't make", "won't make", "doesn't make"], correctAnswer: "0", explanation: "Mixed conditional: present condition + past result (If + past simple, would have + pp)." },
          { type: "MCQ", question: "Which is a mixed conditional?", options: ["If I had worked harder, I would be rich now", "If I work harder, I will be rich", "If I worked harder, I would be rich", "If I had worked harder, I would have been rich"], correctAnswer: "0", explanation: "Past condition affecting present = mixed conditional." },
          { type: "MCQ", question: "'If he ___ the directions, he ___ lost.'", options: ["had followed, wouldn't be", "followed, wouldn't be", "had followed, wouldn't have been", "follows, won't be"], correctAnswer: "0", explanation: "Past condition (had followed) + present result (wouldn't be)." },
          { type: "TRUE_FALSE", question: "True or False: Mixed conditionals combine different time references.", correctAnswer: "true", explanation: "They mix past and present situations." },
          { type: "TRUE_FALSE", question: "True or False: 'If I had eaten, I wouldn't be hungry' is a mixed conditional.", correctAnswer: "true", explanation: "Past condition (had eaten) + present result (wouldn't be)." },
          { type: "FILL_BLANK", question: "Complete: If she ___ (take) that job, she ___ (live) in Paris now.", correctAnswer: "had taken,would be living", explanation: "Past action affecting present situation." },
          { type: "FILL_BLANK", question: "Complete: If I ___ (be) taller, I ___ (play) basketball in high school.", correctAnswer: "were,would have played", explanation: "Present condition affecting past result." },
          { type: "FILL_BLANK", question: "Complete: If they ___ (not/sell) the house, they ___ (have) a place to stay.", correctAnswer: "hadn't sold,would have", explanation: "Past decision with past consequences." },
          { type: "MATCHING", question: "Match the mixed conditional type:", options: [{ left: "If I had studied, I would have a better job", right: "Past → Present" }, { left: "If I were braver, I would have spoken up", right: "Present → Past" }, { left: "If she had practiced, she would be a pro", right: "Past → Present" }, { left: "If he were more careful, he wouldn't have crashed", right: "Present → Past" }], correctAnswer: "[0,1,2,3]", explanation: "Mixed conditionals link different time frames." },
          { type: "CHECKBOX", question: "Select all correct mixed conditionals:", options: ["If I had slept more, I wouldn't be tired now", "If she were taller, she would have been picked", "If they had listened, they would understand", "If I am rich, I would have bought it"], correctAnswer: "[0,1]", explanation: "'Would understand' should be 'would have understood' (or keep for mixed past→present). 'If I am rich' should be 'If I were rich'." },
          { type: "ORDERING", question: "Put in order: be / if / would / I / had / healthier / exercised", correctAnswer: "I would be healthier,if I had exercised", explanation: "Present result + if + past condition." },
          { type: "SPEECH", question: "If I had learned to drive earlier, I would have a car now.", correctAnswer: "If I had learned to drive earlier, I would have a car now.", language: "en", hint: "Talk about a past decision affecting the present" },
          { type: "SPEECH", question: "If I were more organized, I would have finished the project on time.", correctAnswer: "If I were more organized, I would have finished the project on time.", language: "en", hint: "Talk about a personal trait affecting a past outcome" },
        ]
      },
      {
        title: "Unless and Provided That",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You won't pass ___ you study harder.'", options: ["unless", "if", "provided that", "when"], correctAnswer: "0", explanation: "'Unless' = if not: 'You won't pass unless you study' = 'You won't pass if you don't study'." },
          { type: "MCQ", question: "'I'll go to the party ___ I finish my work.'", options: ["provided that", "unless", "if not", "without"], correctAnswer: "0", explanation: "'Provided that' = on the condition that." },
          { type: "MCQ", question: "'___ it rains, we'll have the picnic.'", options: ["Unless", "If not", "Provided", "Without"], correctAnswer: "0", explanation: "'Unless it rains' = 'If it doesn't rain'." },
          { type: "MCQ", question: "Which means the same as 'if not'?", options: ["unless", "provided that", "as long as", "when"], correctAnswer: "0", explanation: "'Unless' = if not." },
          { type: "TRUE_FALSE", question: "True or False: 'Unless you hurry, you'll be late' means 'If you don't hurry, you'll be late'.", correctAnswer: "true", explanation: "'Unless' replaces 'if not'." },
          { type: "TRUE_FALSE", question: "True or False: 'Provided that' and 'as long as' are synonyms.", correctAnswer: "true", explanation: "Both mean 'on the condition that'." },
          { type: "FILL_BLANK", question: "Complete: You can't enter ___ you have a ticket.", correctAnswer: "unless", explanation: "'Unless you have a ticket' = 'If you don't have a ticket'." },
          { type: "FILL_BLANK", question: "Complete: I'll lend you the money ___ you pay me back.", correctAnswer: "provided that", explanation: "'Provided that' = on condition." },
          { type: "FILL_BLANK", question: "Complete: ___ you follow the instructions, everything will be fine.", correctAnswer: "As long as", explanation: "'As long as' = provided that." },
          { type: "MATCHING", question: "Match the connector with its meaning:", options: [{ left: "unless", right: "If not" }, { left: "provided that", right: "On condition that" }, { left: "as long as", right: "If" }, { left: "otherwise", right: "If not, then" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector expresses a different conditional relationship." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["Unless you apologize, she won't forgive you", "Provided that you study, you'll pass", "As long as it doesn't rain, we'll go", "Unless you will study, you won't pass"], correctAnswer: "[0,1,2]", explanation: "'Unless you will study' is wrong; use present: 'Unless you study'." },
          { type: "ORDERING", question: "Put in order: unless / you / hurry / will / you / miss / the bus", correctAnswer: "Unless you hurry,you will miss the bus", explanation: "Unless + present, future result." },
          { type: "SPEECH", question: "You won't succeed unless you work hard.", correctAnswer: "You won't succeed unless you work hard.", language: "en", hint: "Give a warning about effort" },
          { type: "SPEECH", question: "I'll help you provided that you promise to try your best.", correctAnswer: "I'll help you provided that you promise to try your best.", language: "en", hint: "Offer help with a condition" },
        ]
      },
      {
        title: "Wish and If Only",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I wish I ___ richer.' (present)", options: ["were", "am", "will be", "would be"], correctAnswer: "0", explanation: "'Wish' + past simple for present unreal wishes." },
          { type: "MCQ", question: "'If only I ___ harder for the exam.' (past)", options: ["had studied", "studied", "study", "would study"], correctAnswer: "0", explanation: "'If only' + past perfect for past regrets." },
          { type: "MCQ", question: "'I wish you ___ making so much noise.' (annoyance)", options: ["would stop", "stopped", "stop", "will stop"], correctAnswer: "0", explanation: "'Wish' + would for complaints about behavior." },
          { type: "MCQ", question: "Which expresses a present wish?", options: ["I wish I spoke French", "I wish I had studied", "I wish you would listen", "I wish I will go"], correctAnswer: "0", explanation: "'Wish' + past simple = present unreal wish." },
          { type: "TRUE_FALSE", question: "True or False: 'I wish I have a bigger house' is correct.", correctAnswer: "false", explanation: "'Wish' + past simple: 'I wish I had a bigger house'." },
          { type: "TRUE_FALSE", question: "True or False: 'If only I had listened to your advice' expresses regret.", correctAnswer: "true", explanation: "'If only' + past perfect = regret about the past." },
          { type: "FILL_BLANK", question: "Complete: I wish I ___ (know) the answer.", correctAnswer: "knew", explanation: "Present wish: wish + past simple." },
          { type: "FILL_BLANK", question: "Complete: If only she ___ (not/leave) so early.", correctAnswer: "hadn't left", explanation: "Past regret: if only + past perfect." },
          { type: "FILL_BLANK", question: "Complete: I wish it ___ (stop) raining!", correctAnswer: "would stop", explanation: "Wish + would for complaints/desires for change." },
          { type: "MATCHING", question: "Match the wish type:", options: [{ left: "I wish I were taller", right: "Present wish" }, { left: "If only I had gone", right: "Past regret" }, { left: "I wish you would help", right: "Complaint" }, { left: "I wish I could fly", right: "Impossible wish" }], correctAnswer: "[0,1,2,3]", explanation: "Each wish expresses a different desire." },
          { type: "CHECKBOX", question: "Select all correct wish sentences:", options: ["I wish I had more time", "If only I knew the truth", "I wish you would be quiet", "I wish I have gone"], correctAnswer: "[0,1,2]", explanation: "'I wish I have gone' should be 'I wish I had gone'." },
          { type: "ORDERING", question: "Put in order: I / could / wish / I / travel / the world", correctAnswer: "I wish,I could travel the world", explanation: "Subject + wish + could + verb." },
          { type: "SPEECH", question: "I wish I had more free time to read.", correctAnswer: "I wish I had more free time to read.", language: "en", hint: "Express a wish about time" },
          { type: "SPEECH", question: "If only I had taken that job offer when I had the chance.", correctAnswer: "If only I had taken that job offer when I had the chance.", language: "en", hint: "Express regret about a missed opportunity" },
        ]
      },
      {
        title: "Module 4 Review: Advanced Conditionals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If I ___ about the meeting, I would have attended.'", options: ["had known", "knew", "know", "would know"], correctAnswer: "0", explanation: "Third conditional: If + past perfect, would have + pp." },
          { type: "MCQ", question: "'I wish I ___ speak Japanese fluently.'", options: ["could", "can", "will", "would"], correctAnswer: "0", explanation: "'Wish' + could for present ability wishes." },
          { type: "MCQ", question: "'___ you apologize, I won't forgive you.'", options: ["Unless", "If", "Provided", "When"], correctAnswer: "0", explanation: "'Unless' = if not: 'Unless you apologize'." },
          { type: "MCQ", question: "'If she had accepted the offer, she ___ in London now.'", options: ["would be living", "would have lived", "will live", "lives"], correctAnswer: "0", explanation: "Mixed conditional: past condition + present result." },
          { type: "TRUE_FALSE", question: "True or False: 'I wish I had studied harder' expresses a present wish.", correctAnswer: "false", explanation: "This is a past regret (past perfect)." },
          { type: "TRUE_FALSE", question: "True or False: 'Provided that you pay, I'll lend you the book' is correct.", correctAnswer: "true", explanation: "'Provided that' = on condition." },
          { type: "FILL_BLANK", question: "Complete: If they ___ (not/argue), they ___ (still/be) friends.", correctAnswer: "hadn't argued,would still be", explanation: "Mixed conditional: past argument affecting present friendship." },
          { type: "FILL_BLANK", question: "Complete: I wish you ___ (not/smoke) so much.", correctAnswer: "wouldn't smoke", explanation: "Wish + would for complaints." },
          { type: "FILL_BLANK", question: "Complete: ___ it snows, the roads will be closed.", correctAnswer: "If", explanation: "'If it snows' = condition." },
          { type: "MATCHING", question: "Match the conditional with its time reference:", options: [{ left: "Third conditional", right: "Past → Past" }, { left: "Mixed conditional", right: "Past → Present" }, { left: "First conditional", right: "Present → Future" }, { left: "Wish + past simple", right: "Present unreal" }], correctAnswer: "[0,1,2,3]", explanation: "Each conditional links different times." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["Unless you try, you won't succeed", "I wish I had listened to you", "If I were you, I would apologize", "If she would have come, I would be happy"], correctAnswer: "[0,1,2]", explanation: "'If she would have come' is wrong; should be 'If she had come'." },
          { type: "ORDERING", question: "Put in order: if / I / had / would / known / I / have / helped", correctAnswer: "If I had known,I would have helped", explanation: "Third conditional: If + past perfect, would have + pp." },
          { type: "SPEECH", question: "I wish I had spent more time with my family last year.", correctAnswer: "I wish I had spent more time with my family last year.", language: "en", hint: "Express regret about time with family" },
          { type: "SPEECH", question: "Unless we act now, the situation will get worse.", correctAnswer: "Unless we act now, the situation will get worse.", language: "en", hint: "Warn about urgency" },
          { type: "SPEECH", question: "If I had been more careful, I wouldn't have broken the vase.", correctAnswer: "If I had been more careful, I wouldn't have broken the vase.", language: "en", hint: "Express regret about an accident" },
        ]
      },
    ]
  },
  {
    title: "Reported Speech",
    lessons: [
      {
        title: "Reporting Statements",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She said, 'I am happy.' → She said that she ___ happy.", options: ["was", "is", "were", "has been"], correctAnswer: "0", explanation: "Present → past: 'am' → 'was'." },
          { type: "MCQ", question: "'I will call you.' → He said he ___ call me.", options: ["would", "will", "would have", "shall"], correctAnswer: "0", explanation: "'Will' → 'would' in reported speech." },
          { type: "MCQ", question: "'I have finished.' → She said she ___ finished.", options: ["had", "has", "have", "was having"], correctAnswer: "0", explanation: "Present perfect → past perfect: 'have' → 'had'." },
          { type: "MCQ", question: "'I can swim.' → He said he ___ swim.", options: ["could", "can", "can be", "would"], correctAnswer: "0", explanation: "'Can' → 'could' in reported speech." },
          { type: "TRUE_FALSE", question: "True or False: In reported speech, pronouns and time expressions may change.", correctAnswer: "true", explanation: "'I' → 'he/she', 'today' → 'that day', 'tomorrow' → 'the next day'." },
          { type: "TRUE_FALSE", question: "True or False: 'She said she is tired' can be correct if she is still tired now.", correctAnswer: "true", explanation: "If the situation is still true, present tense can be kept." },
          { type: "FILL_BLANK", question: "Complete: 'I like coffee.' → He said he ___ coffee.", correctAnswer: "liked", explanation: "Present simple → past simple." },
          { type: "FILL_BLANK", question: "Complete: 'We are leaving tomorrow.' → They said they ___ leaving ___ day.", correctAnswer: "were,the next", explanation: "Present continuous → past continuous; tomorrow → the next day." },
          { type: "FILL_BLANK", question: "Complete: 'I must go.' → She said she ___ go.", correctAnswer: "had to", explanation: "'Must' → 'had to' in reported speech." },
          { type: "MATCHING", question: "Match the direct speech with its reported form:", options: [{ left: "'I live here.'", right: "He said he lived there" }, { left: "'I will help.'", right: "She said she would help" }, { left: "'I can drive.'", right: "He said he could drive" }, { left: "'I have eaten.'", right: "She said she had eaten" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense shifts back in reported speech." },
          { type: "CHECKBOX", question: "Select all correct reported speech sentences:", options: ["She said she was busy", "He said he would come", "They said they are leaving", "He said he had seen the movie"], correctAnswer: "[0,1,3]", explanation: "'They said they are leaving' can be correct if still true, but typically becomes 'were leaving'." },
          { type: "ORDERING", question: "Put in order: said / she / that / was / she / tired", correctAnswer: "She said,that she was tired", explanation: "Subject + said + that + reported clause." },
          { type: "SPEECH", question: "She said that she had already finished the assignment.", correctAnswer: "She said that she had already finished the assignment.", language: "en", hint: "Report what someone said about finishing work" },
          { type: "SPEECH", question: "He told me that he would be late for the meeting.", correctAnswer: "He told me that he would be late for the meeting.", language: "en", hint: "Report someone's lateness" },
        ]
      },
      {
        title: "Reporting Questions and Commands",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Where do you live?' → She asked me where I ___.'", options: ["lived", "do live", "did live", "live"], correctAnswer: "0", explanation: "Reported question: no auxiliary 'do/did'; word order is subject + verb." },
          { type: "MCQ", question: "'Are you coming?' → He asked if I ___ coming.", options: ["was", "am", "were", "would be"], correctAnswer: "0", explanation: "Yes/no questions use 'if' or 'whether' + past tense." },
          { type: "MCQ", question: "'Close the door.' → She told me ___ the door.", options: ["to close", "close", "closing", "closed"], correctAnswer: "0", explanation: "Commands: told/asked + to + base verb." },
          { type: "MCQ", question: "'Don't be late.' → He told me ___ late.", options: ["not to be", "don't be", "to not be", "not be"], correctAnswer: "0", explanation: "Negative commands: told + not to + base verb." },
          { type: "TRUE_FALSE", question: "True or False: In reported questions, we keep the question mark.", correctAnswer: "false", explanation: "Reported questions are statements, ending with a period." },
          { type: "TRUE_FALSE", question: "True or False: 'She asked me what time was the train' is correct.", correctAnswer: "false", explanation: "Word order: 'She asked me what time the train was' (subject before verb)." },
          { type: "FILL_BLANK", question: "Complete: 'What is your name?' → He asked me what my name ___.'", correctAnswer: "was", explanation: "Reported question: 'what my name was' (not 'what was my name')." },
          { type: "FILL_BLANK", question: "Complete: 'Please sit down.' → She asked me ___ down.", correctAnswer: "to sit", explanation: "Polite request: asked + to + verb." },
          { type: "FILL_BLANK", question: "Complete: 'Don't touch that.' → He told the children ___ that.", correctAnswer: "not to touch", explanation: "Negative command: told + not to + verb." },
          { type: "MATCHING", question: "Match the direct question with its reported form:", options: [{ left: "'Do you like coffee?'", right: "She asked if I liked coffee" }, { left: "'Where is the station?'", right: "He asked where the station was" }, { left: "'Can you help me?'", right: "She asked if I could help" }, { left: "'What are you doing?'", right: "He asked what I was doing" }], correctAnswer: "[0,1,2,3]", explanation: "Each question is correctly reported." },
          { type: "CHECKBOX", question: "Select all correct reported questions:", options: ["She asked where I lived", "He asked if I was ready", "They asked what time was the meeting", "She asked whether I had finished"], correctAnswer: "[0,1,3]", explanation: "'What time was the meeting' should be 'what time the meeting was'." },
          { type: "ORDERING", question: "Put in order: asked / she / me / I / was / where / going", correctAnswer: "She asked me,where I was going", explanation: "Subject + asked + object + question word + subject + verb." },
          { type: "SPEECH", question: "The teacher asked us to open our books to page 45.", correctAnswer: "The teacher asked us to open our books to page 45.", language: "en", hint: "Report a teacher's instruction" },
          { type: "SPEECH", question: "He asked me if I had ever been to Japan.", correctAnswer: "He asked me if I had ever been to Japan.", language: "en", hint: "Report a yes/no question" },
        ]
      },
      {
        title: "Time and Place Changes in Reported Speech",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I saw him yesterday.' → She said she had seen him ___.'", options: ["the day before", "yesterday", "tomorrow", "today"], correctAnswer: "0", explanation: "'Yesterday' → 'the day before' or 'the previous day'." },
          { type: "MCQ", question: "'I'll do it tomorrow.' → He said he would do it ___.'", options: ["the next day", "tomorrow", "yesterday", "today"], correctAnswer: "0", explanation: "'Tomorrow' → 'the next day' or 'the following day'." },
          { type: "MCQ", question: "'I live here.' → She said she lived ___.'", options: ["there", "here", "everywhere", "anywhere"], correctAnswer: "0", explanation: "'Here' → 'there' in reported speech." },
          { type: "MCQ", question: "'I'm leaving now.' → He said he was leaving ___.'", options: ["then", "now", "today", "here"], correctAnswer: "0", explanation: "'Now' → 'then' in reported speech." },
          { type: "TRUE_FALSE", question: "True or False: 'Last week' becomes 'the week before' in reported speech.", correctAnswer: "true", explanation: "'Last week' → 'the previous week' or 'the week before'." },
          { type: "TRUE_FALSE", question: "True or False: 'This' becomes 'that' in reported speech.", correctAnswer: "true", explanation: "'This' → 'that'; 'these' → 'those'." },
          { type: "FILL_BLANK", question: "Complete: 'I'll call you tonight.' → He said he would call me ___.'", correctAnswer: "that night", explanation: "'Tonight' → 'that night'." },
          { type: "FILL_BLANK", question: "Complete: 'I met her last month.' → He said he had met her ___ month.", correctAnswer: "the previous", explanation: "'Last month' → 'the previous month'." },
          { type: "FILL_BLANK", question: "Complete: 'These are my books.' → She said ___ were her books.", correctAnswer: "those", explanation: "'These' → 'those'." },
          { type: "MATCHING", question: "Match the time/place word with its reported form:", options: [{ left: "today", right: "that day" }, { left: "next week", right: "the following week" }, { left: "ago", right: "before" }, { left: "this place", right: "that place" }], correctAnswer: "[0,1,2,3]", explanation: "Each word shifts in reported speech." },
          { type: "CHECKBOX", question: "Select all correct transformations:", options: ["tomorrow → the next day", "here → there", "today → tomorrow", "last year → the year before"], correctAnswer: "[0,1,3]", explanation: "'Today' → 'that day', not 'tomorrow'. The others are correct." },
          { type: "ORDERING", question: "Put in order: said / he / the / before / had / the / day / finished", correctAnswer: "He said,he had finished the day before", explanation: "Reported speech with time change." },
          { type: "SPEECH", question: "She told me that she had arrived the previous evening.", correctAnswer: "She told me that she had arrived the previous evening.", language: "en", hint: "Report when someone arrived" },
          { type: "SPEECH", question: "He said he would see me the following week.", correctAnswer: "He said he would see me the following week.", language: "en", hint: "Report a future meeting" },
        ]
      },
      {
        title: "Reported Speech Practice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I've been waiting for two hours.' → She said she ___ for two hours.", options: ["had been waiting", "has been waiting", "was waiting", "waited"], correctAnswer: "0", explanation: "Present perfect continuous → past perfect continuous." },
          { type: "MCQ", question: "'I should study more.' → He said he ___ study more.", options: ["should", "would", "had to", "ought"], correctAnswer: "0", explanation: "'Should' doesn't change in reported speech." },
          { type: "MCQ", question: "'Could you open the window?' → She asked me ___ the window.", options: ["to open", "if I could open", "both A and B", "opened"], correctAnswer: "0", explanation: "Both 'to open' (command) and 'if I could open' (question) are correct." },
          { type: "MCQ", question: "'The Earth is round.' → The teacher said the Earth ___ round.", options: ["is", "was", "were", "has been"], correctAnswer: "0", explanation: "Universal truths don't change tense in reported speech." },
          { type: "TRUE_FALSE", question: "True or False: 'Must' can become 'had to' in reported speech.", correctAnswer: "true", explanation: "'Must' → 'had to' (obligation) or stays 'must' (rule)." },
          { type: "TRUE_FALSE", question: "True or False: 'She asked what I am doing' is always wrong.", correctAnswer: "false", explanation: "If the action is still happening, present tense can be kept." },
          { type: "FILL_BLANK", question: "Complete: 'I may come tomorrow.' → She said she ___ come ___ day.", correctAnswer: "might,the next", explanation: "'May' → 'might'; 'tomorrow' → 'the next day'." },
          { type: "FILL_BLANK", question: "Complete: 'I would travel if I could.' → He said he ___ travel if he ___.'", correctAnswer: "would,could", explanation: "'Would' and 'could' don't change in reported speech." },
          { type: "FILL_BLANK", question: "Complete: 'Let's go!' → She suggested ___.'", correctAnswer: "going", explanation: "Suggest + verb-ing: 'She suggested going'." },
          { type: "MATCHING", question: "Match the reporting verb:", options: [{ left: "said", right: "Neutral reporting" }, { left: "told", right: "Needs an object" }, { left: "asked", right: "Questions" }, { left: "suggested", right: "Suggestions" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb has a specific usage pattern." },
          { type: "CHECKBOX", question: "Select all correct reported speech sentences:", options: ["She said she had been working all day", "He told me that he would call", "They asked if we had eaten", "She asked what time is it"], correctAnswer: "[0,1,2]", explanation: "'What time is it' should be 'what time it was'." },
          { type: "ORDERING", question: "Put in order: asked / whether / she / me / I / could / help", correctAnswer: "She asked me,whether I could help", explanation: "Subject + asked + object + whether + subject + could + verb." },
          { type: "SPEECH", question: "She told me that she had been studying since morning.", correctAnswer: "She told me that she had been studying since morning.", language: "en", hint: "Report someone's long study session" },
          { type: "SPEECH", question: "The doctor advised him to eat more vegetables.", correctAnswer: "The doctor advised him to eat more vegetables.", language: "en", hint: "Report medical advice" },
        ]
      },
      {
        title: "Module 7 Review: Reported Speech",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I don't like spiders.' → She said she ___ spiders.", options: ["didn't like", "doesn't like", "don't like", "not like"], correctAnswer: "0", explanation: "Present simple → past simple in reported speech." },
          { type: "MCQ", question: "'What are you doing?' → He asked me what I ___.'", options: ["was doing", "am doing", "did", "do"], correctAnswer: "0", explanation: "Reported question: past continuous, subject + verb order." },
          { type: "MCQ", question: "'Don't forget your keys.' → She reminded me ___ my keys.", options: ["not to forget", "don't forget", "to not forget", "forgetting"], correctAnswer: "0", explanation: "Reminded + not to + verb." },
          { type: "MCQ", question: "'I'll be waiting.' → He said he ___ waiting.", options: ["would be", "will be", "would", "was being"], correctAnswer: "0", explanation: "'Will be' → 'would be'." },
          { type: "TRUE_FALSE", question: "True or False: 'Can' becomes 'could' in reported speech.", correctAnswer: "true", explanation: "'Can' → 'could'." },
          { type: "TRUE_FALSE", question: "True or False: 'Next year' stays the same in reported speech.", correctAnswer: "false", explanation: "'Next year' → 'the following year'." },
          { type: "FILL_BLANK", question: "Complete: 'I have never been to Africa.' → She said she ___ never ___ to Africa.", correctAnswer: "had,been", explanation: "Present perfect → past perfect." },
          { type: "FILL_BLANK", question: "Complete: 'Please close the window.' → He asked me ___ the window.", correctAnswer: "to close", explanation: "Asked + to + verb." },
          { type: "FILL_BLANK", question: "Complete: 'I was reading when you called.' → She said she ___ reading when I ___.'", correctAnswer: "had been,had called", explanation: "Past continuous → past perfect continuous; past simple → past perfect." },
          { type: "MATCHING", question: "Match the tense change:", options: [{ left: "Present simple → Past simple", right: "'I eat' → 'She ate'" }, { left: "Past simple → Past perfect", right: "'I ate' → 'She had eaten'" }, { left: "Will → Would", right: "'I will go' → 'She would go'" }, { left: "Can → Could", right: "'I can go' → 'She could go'" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense shifts back in reported speech." },
          { type: "CHECKBOX", question: "Select all correct reported speech:", options: ["He said he was leaving", "She asked if I could help", "They told us to wait", "She said she will come tomorrow"], correctAnswer: "[0,1,2]", explanation: "'She will come tomorrow' should be 'she would come the next day'." },
          { type: "ORDERING", question: "Put in order: told / me / she / that / had / bought / a new car", correctAnswer: "She told me,that she had bought a new car", explanation: "Subject + told + object + that + past perfect." },
          { type: "SPEECH", question: "She said that she had been living in London for five years.", correctAnswer: "She said that she had been living in London for five years.", language: "en", hint: "Report someone's duration in a city" },
          { type: "SPEECH", question: "The manager asked us to submit the report by Friday.", correctAnswer: "The manager asked us to submit the report by Friday.", language: "en", hint: "Report a work deadline" },
          { type: "SPEECH", question: "He wondered whether I had received his email.", correctAnswer: "He wondered whether I had received his email.", language: "en", hint: "Report someone's question about an email" },
        ]
      },
    ]
  },
  {
    title: "Relative Clauses",
    lessons: [
      {
        title: "Defining Relative Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["The man who lives next door is a doctor", "The man which lives next door is a doctor", "The man whom lives next door is a doctor", "The man what lives next door is a doctor"], correctAnswer: "0", explanation: "'Who' for people as subject." },
          { type: "MCQ", question: "'The book ___ I read was amazing.'", options: ["that", "who", "whom", "whose"], correctAnswer: "0", explanation: "'That' or 'which' for things." },
          { type: "MCQ", question: "'The woman ___ car was stolen called the police.'", options: ["whose", "who", "whom", "which"], correctAnswer: "0", explanation: "'Whose' shows possession." },
          { type: "MCQ", question: "'The city ___ I was born is beautiful.'", options: ["where", "which", "who", "whom"], correctAnswer: "0", explanation: "'Where' for places." },
          { type: "TRUE_FALSE", question: "True or False: In defining relative clauses, 'that' can replace 'who' or 'which'.", correctAnswer: "true", explanation: "'That' can be used for both people and things in defining clauses." },
          { type: "TRUE_FALSE", question: "True or False: 'The girl whom I met is nice' uses 'whom' correctly as an object.", correctAnswer: "true", explanation: "'Whom' is the object form of 'who'." },
          { type: "FILL_BLANK", question: "Complete: The student ___ got the highest score will receive a prize.", correctAnswer: "who", explanation: "'Who' for people as subject." },
          { type: "FILL_BLANK", question: "Complete: The restaurant ___ we ate last night was expensive.", correctAnswer: "where", explanation: "'Where' for places." },
          { type: "FILL_BLANK", question: "Complete: The movie ___ we watched was boring.", correctAnswer: "that", explanation: "'That' for things." },
          { type: "MATCHING", question: "Match the relative pronoun with its use:", options: [{ left: "who", right: "People (subject)" }, { left: "which", right: "Things" }, { left: "whose", right: "Possession" }, { left: "where", right: "Places" }], correctAnswer: "[0,1,2,3]", explanation: "Each pronoun has a specific use." },
          { type: "CHECKBOX", question: "Select all correct defining relative clauses:", options: ["The person who called me is my boss", "The house that I bought is old", "The boy whose father is a teacher", "The dog which barks loudly"], correctAnswer: "[0,1,2,3]", explanation: "All are correct defining relative clauses." },
          { type: "ORDERING", question: "Put in order: the / who / teacher / teaches / math / is / kind", correctAnswer: "The teacher who teaches math,is kind", explanation: "Noun + who + verb + object + main clause." },
          { type: "SPEECH", question: "The book that I borrowed from you is really interesting.", correctAnswer: "The book that I borrowed from you is really interesting.", language: "en", hint: "Talk about a borrowed book" },
          { type: "SPEECH", question: "The woman who lives across the street is very friendly.", correctAnswer: "The woman who lives across the street is very friendly.", language: "en", hint: "Describe a neighbor" },
        ]
      },
      {
        title: "Non-defining Relative Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["My brother, who lives in London, is a lawyer", "My brother who lives in London is a lawyer", "My brother, that lives in London, is a lawyer", "My brother which lives in London is a lawyer"], correctAnswer: "0", explanation: "Non-defining clauses use commas and 'who' (not 'that') for people." },
          { type: "MCQ", question: "'Paris, ___ is the capital of France, is beautiful.'", options: ["which", "that", "who", "where"], correctAnswer: "0", explanation: "'Which' for non-defining clauses about things/places (not 'that')." },
          { type: "MCQ", question: "Which relative pronoun CANNOT be used in non-defining clauses?", options: ["that", "which", "who", "whose"], correctAnswer: "0", explanation: "'That' is not used in non-defining clauses." },
          { type: "MCQ", question: "'My teacher, ___ advice I always follow, is retiring.'", options: ["whose", "who", "whom", "which"], correctAnswer: "0", explanation: "'Whose' for possession in non-defining clauses." },
          { type: "TRUE_FALSE", question: "True or False: Non-defining relative clauses add extra information that isn't essential.", correctAnswer: "true", explanation: "The sentence still makes sense without the non-defining clause." },
          { type: "TRUE_FALSE", question: "True or False: Non-defining clauses are separated by commas.", correctAnswer: "true", explanation: "Commas indicate the clause is extra information." },
          { type: "FILL_BLANK", question: "Complete: Mr. Smith, ___ is my neighbor, is retiring.", correctAnswer: "who", explanation: "'Who' for people in non-defining clauses." },
          { type: "FILL_BLANK", question: "Complete: The Eiffel Tower, ___ was built in 1889, is famous.", correctAnswer: "which", explanation: "'Which' for things in non-defining clauses." },
          { type: "FILL_BLANK", question: "Complete: My boss, ___ I respect a lot, is leaving.", correctAnswer: "whom", explanation: "'Whom' as object in non-defining clauses (formal)." },
          { type: "MATCHING", question: "Match the clause type:", options: [{ left: "The man who called is here", right: "Defining" }, { left: "John, who called, is here", right: "Non-defining" }, { left: "The car that I bought", right: "Defining" }, { left: "My car, which I bought last year", right: "Non-defining" }], correctAnswer: "[0,1,2,3]", explanation: "Defining = essential info; Non-defining = extra info with commas." },
          { type: "CHECKBOX", question: "Select all correct non-defining clauses:", options: ["My sister, who is a nurse, works at the hospital", "London, which I visited last year, is great", "The girl that I met is kind", "My phone, which I bought yesterday, is broken"], correctAnswer: "[0,1,3]", explanation: "'The girl that I met' is defining (no commas, uses 'that'). The others are non-defining." },
          { type: "ORDERING", question: "Put in order: is / which / my / expensive / very / phone / new / is", correctAnswer: "My new phone,which is very expensive,is", explanation: "Noun + comma + which + clause + comma + main clause." },
          { type: "SPEECH", question: "My grandmother, who is eighty years old, still cooks every day.", correctAnswer: "My grandmother, who is eighty years old, still cooks every day.", language: "en", hint: "Describe an elderly relative" },
          { type: "SPEECH", question: "The museum, which opened last year, has amazing exhibits.", correctAnswer: "The museum, which opened last year, has amazing exhibits.", language: "en", hint: "Describe a new museum" },
        ]
      },
      {
        title: "Relative Clauses with Prepositions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is formal?", options: ["The house in which I live", "The house which I live in", "The house I live in", "The house that I live in"], correctAnswer: "0", explanation: "Preposition before 'which' is the most formal." },
          { type: "MCQ", question: "'The person ___ I spoke to was helpful.'", options: ["whom", "who", "whose", "which"], correctAnswer: "0", explanation: "'Whom' (formal) or 'who' (informal) for people as object." },
          { type: "MCQ", question: "'The topic ___ we discussed was important.'", options: ["which", "who", "whose", "whom"], correctAnswer: "0", explanation: "'Which' for things." },
          { type: "MCQ", question: "'The company ___ I work for is growing.'", options: ["which", "who", "whom", "whose"], correctAnswer: "0", explanation: "'Which' for companies/things." },
          { type: "TRUE_FALSE", question: "True or False: 'The girl who I talked with' is correct in informal English.", correctAnswer: "true", explanation: "'Who' as object is common in informal English." },
          { type: "TRUE_FALSE", question: "True or False: 'The reason why I called' uses 'why' correctly.", correctAnswer: "true", explanation: "'Why' for reasons." },
          { type: "FILL_BLANK", question: "Complete: The day ___ we met was special.", correctAnswer: "when", explanation: "'When' for time." },
          { type: "FILL_BLANK", question: "Complete: The reason ___ I'm calling is to apologize.", correctAnswer: "why", explanation: "'Why' for reasons." },
          { type: "FILL_BLANK", question: "Complete: The hotel ___ we stayed was wonderful.", correctAnswer: "where", explanation: "'Where' for places." },
          { type: "MATCHING", question: "Match the relative adverb:", options: [{ left: "when", right: "Time" }, { left: "where", right: "Place" }, { left: "why", right: "Reason" }, { left: "how", right: "Manner" }], correctAnswer: "[0,1,2,3]", explanation: "Each relative adverb refers to a different concept." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["The man with whom I spoke was polite", "The reason why she left is unknown", "The house where I grew up", "The book whom I read"], correctAnswer: "[0,1,2]", explanation: "'Whom' is for people, not things. Use 'which' or 'that' for books." },
          { type: "ORDERING", question: "Put in order: the / in / city / I / grew up / where / is / beautiful", correctAnswer: "The city where I grew up,is beautiful", explanation: "Noun + where + clause + main clause." },
          { type: "SPEECH", question: "The restaurant in which we celebrated our anniversary is closing.", correctAnswer: "The restaurant in which we celebrated our anniversary is closing.", language: "en", hint: "Talk about a meaningful place" },
          { type: "SPEECH", question: "That's the reason why I decided to study abroad.", correctAnswer: "That's the reason why I decided to study abroad.", language: "en", hint: "Explain your reason for a decision" },
        ]
      },
      {
        title: "Omitting Relative Pronouns",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "When can you omit the relative pronoun?", options: ["When it's the object of the clause", "When it's the subject", "Always", "Never"], correctAnswer: "0", explanation: "The pronoun can be omitted when it's the object: 'The book (that) I read'." },
          { type: "MCQ", question: "'The man ___ I met yesterday' — can you omit the pronoun?", options: ["Yes", "No", "Only in writing", "Only formally"], correctAnswer: "0", explanation: "'The man I met yesterday' — 'who/whom' can be omitted (object)." },
          { type: "MCQ", question: "'The woman ___ called me' — can you omit the pronoun?", options: ["No", "Yes", "Only informally", "Only in writing"], correctAnswer: "0", explanation: "'Who' is the subject here; it cannot be omitted." },
          { type: "MCQ", question: "Which sentence has the pronoun omitted correctly?", options: ["The movie I watched was great", "The movie I watched it was great", "The movie was I watched great", "The movie watched I was great"], correctAnswer: "0", explanation: "Object pronoun omitted: 'The movie (that) I watched was great'." },
          { type: "TRUE_FALSE", question: "True or False: 'The book I am reading is interesting' is correct.", correctAnswer: "true", explanation: "'That/which' can be omitted: 'The book (that) I am reading'." },
          { type: "TRUE_FALSE", question: "True or False: You can omit 'who' when it's the subject.", correctAnswer: "false", explanation: "Subject pronouns cannot be omitted." },
          { type: "FILL_BLANK", question: "Complete: The person ___ I called didn't answer.", correctAnswer: "who", explanation: "'Who' can be omitted: 'The person I called'." },
          { type: "FILL_BLANK", question: "Complete: The cake ___ she made was delicious.", correctAnswer: "that", explanation: "'That' can be omitted: 'The cake she made'." },
          { type: "FILL_BLANK", question: "Complete: The student ___ studies hardest will win.", correctAnswer: "who", explanation: "'Who' is the subject; cannot be omitted." },
          { type: "MATCHING", question: "Match with omitted/not omitted:", options: [{ left: "The car (that) I bought", right: "Can omit" }, { left: "The person who called", right: "Cannot omit" }, { left: "The song (which) I love", right: "Can omit" }, { left: "The dog that bit me", right: "Cannot omit" }], correctAnswer: "[0,1,2,3]", explanation: "Object = can omit; Subject = cannot omit." },
          { type: "CHECKBOX", question: "Select all sentences where the pronoun can be omitted:", options: ["The email I sent", "The boy who runs fast", "The place we visited", "The teacher who helped me"], correctAnswer: "[0,2]", explanation: "'Who runs' and 'who helped' are subjects; cannot omit." },
          { type: "ORDERING", question: "Put in order: the / I / bought / shirt / is / blue", correctAnswer: "The shirt I bought,is blue", explanation: "Noun + (omitted that) + subject + verb + main clause." },
          { type: "SPEECH", question: "The movie we watched last night was fantastic.", correctAnswer: "The movie we watched last night was fantastic.", language: "en", hint: "Talk about a movie (omitting 'that')" },
          { type: "SPEECH", question: "The book I've been reading is about history.", correctAnswer: "The book I've been reading is about history.", language: "en", hint: "Talk about a book (omitting 'which')" },
        ]
      },
      {
        title: "Module 8 Review: Relative Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The girl ___ won the race is my sister.'", options: ["who", "which", "whom", "whose"], correctAnswer: "0", explanation: "'Who' for people as subject." },
          { type: "MCQ", question: "'My phone, ___ I bought last week, is already broken.'", options: ["which", "that", "who", "where"], correctAnswer: "0", explanation: "'Which' for non-defining clauses." },
          { type: "MCQ", question: "'The house ___ I grew up has been demolished.'", options: ["where", "which", "who", "whom"], correctAnswer: "0", explanation: "'Where' for places." },
          { type: "MCQ", question: "In which sentence can you omit the relative pronoun?", options: ["The cake (that) she baked", "The teacher who called", "The man who lives here", "The dog that barked"], correctAnswer: "0", explanation: "'That' is the object; can be omitted." },
          { type: "TRUE_FALSE", question: "True or False: 'That' can be used in non-defining relative clauses.", correctAnswer: "false", explanation: "Non-defining clauses use 'which', not 'that'." },
          { type: "TRUE_FALSE", question: "True or False: 'Whose' can be used for things as well as people.", correctAnswer: "true", explanation: "'The company whose profits increased' — 'whose' for things." },
          { type: "FILL_BLANK", question: "Complete: The teacher ___ class I enjoy most is retiring.", correctAnswer: "whose", explanation: "'Whose' for possession." },
          { type: "FILL_BLANK", question: "Complete: The time ___ we arrived was midnight.", correctAnswer: "when", explanation: "'When' for time." },
          { type: "FILL_BLANK", question: "Complete: My best friend, ___ I've known since childhood, is moving.", correctAnswer: "whom", explanation: "'Whom' as object in non-defining clause." },
          { type: "MATCHING", question: "Match the sentence with the clause type:", options: [{ left: "Students who study hard succeed", right: "Defining" }, { left: "My car, which is old, still runs", right: "Non-defining" }, { left: "The place where we met", right: "Defining" }, { left: "John, whose brother is famous", right: "Non-defining" }], correctAnswer: "[0,1,2,3]", explanation: "Each clause type has a different function." },
          { type: "CHECKBOX", question: "Select all correct relative clauses:", options: ["The book which I read was good", "My mother, who is a doctor, works hard", "The city where I was born is small", "The man which I saw"], correctAnswer: "[0,1,2]", explanation: "'Which' is for things, not people. Use 'who' for 'the man'." },
          { type: "ORDERING", question: "Put in order: who / the / won / prize / student / the / got", correctAnswer: "The student who won the prize,got the", explanation: "Noun + who + verb + object + main verb." },
          { type: "SPEECH", question: "The hotel where we stayed during our vacation had a beautiful pool.", correctAnswer: "The hotel where we stayed during our vacation had a beautiful pool.", language: "en", hint: "Describe a hotel from a trip" },
          { type: "SPEECH", question: "My neighbor, whose dog is always barking, is very kind.", correctAnswer: "My neighbor, whose dog is always barking, is very kind.", language: "en", hint: "Describe a neighbor with a noisy dog" },
          { type: "SPEECH", question: "The reason why I called you is to invite you to my party.", correctAnswer: "The reason why I called you is to invite you to my party.", language: "en", hint: "Explain the reason for calling" },
        ]
      },
    ]
  },
  {
    title: "Advanced Grammar Topics",
    lessons: [
      {
        title: "Articles (A, An, The, Zero Article)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I saw a dog in the park", "I saw dog in the park", "I saw an dog in the park", "I saw the dog in a park"], correctAnswer: "0", explanation: "'A' for first mention, 'the' for specific." },
          { type: "MCQ", question: "'___ sun rises in the east.'", options: ["The", "A", "An", "No article"], correctAnswer: "0", explanation: "'The' for unique things: the sun, the moon, the earth." },
          { type: "MCQ", question: "'She is ___ honest person.'", options: ["an", "a", "the", "no article"], correctAnswer: "0", explanation: "'An' before vowel sounds: 'an honest' (h is silent)." },
          { type: "MCQ", question: "'I love ___ music.' (general)", options: ["no article", "the", "a", "an"], correctAnswer: "0", explanation: "Zero article for general concepts: 'I love music'." },
          { type: "TRUE_FALSE", question: "True or False: 'The water is essential for life' is correct.", correctAnswer: "false", explanation: "General concept: 'Water is essential' (no article)." },
          { type: "TRUE_FALSE", question: "True or False: 'I went to the university' means a specific university.", correctAnswer: "true", explanation: "'The university' = a specific one." },
          { type: "FILL_BLANK", question: "Complete: ___ life is beautiful.", correctAnswer: "Life", explanation: "General concept: no article needed." },
          { type: "FILL_BLANK", question: "Complete: She plays ___ piano very well.", correctAnswer: "the", explanation: "Musical instruments take 'the': 'the piano'." },
          { type: "FILL_BLANK", question: "Complete: He is ___ university student.", correctAnswer: "a", explanation: "'A' before consonant sounds: 'a university'." },
          { type: "MATCHING", question: "Match the article use:", options: [{ left: "a book", right: "First mention" }, { left: "the book", right: "Specific/known" }, { left: "books", right: "General (no article)" }, { left: "an hour", right: "Vowel sound" }], correctAnswer: "[0,1,2,3]", explanation: "Each article has a specific use." },
          { type: "CHECKBOX", question: "Select all correct article usage:", options: ["I have a cat", "The sky is blue", "She is an engineer", "I go to the school every day"], correctAnswer: "[0,1,2]", explanation: "'Go to the school' should be 'go to school' (as a student). The others are correct." },
          { type: "ORDERING", question: "Put in order: a / beautiful / she / has / voice", correctAnswer: "She has,a beautiful voice", explanation: "Subject + has + a + adjective + noun." },
          { type: "SPEECH", question: "The book I read last week was really interesting.", correctAnswer: "The book I read last week was really interesting.", language: "en", hint: "Talk about a specific book" },
          { type: "SPEECH", question: "I would like to be an astronaut when I grow up.", correctAnswer: "I would like to be an astronaut when I grow up.", language: "en", hint: "Talk about a career dream" },
        ]
      },
      {
        title: "Quantifiers (Much, Many, Few, Little, Some, Any)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'How ___ water do you drink?'", options: ["much", "many", "few", "little"], correctAnswer: "0", explanation: "'Much' for uncountable nouns: water." },
          { type: "MCQ", question: "'There aren't ___ students in the classroom.'", options: ["many", "much", "few", "little"], correctAnswer: "0", explanation: "'Many' for countable nouns in negatives." },
          { type: "MCQ", question: "'I have ___ friends.' (a small number, positive)", options: ["a few", "few", "a little", "little"], correctAnswer: "0", explanation: "'A few' = some (positive) for countable nouns." },
          { type: "MCQ", question: "'There is ___ hope.' (almost none, negative)", options: ["little", "a little", "few", "a few"], correctAnswer: "0", explanation: "'Little' = not much (negative) for uncountable." },
          { type: "TRUE_FALSE", question: "True or False: 'Do you have any money?' uses 'any' correctly in a question.", correctAnswer: "true", explanation: "'Any' is used in questions and negatives." },
          { type: "TRUE_FALSE", question: "True or False: 'I have some books' and 'I have any books' mean the same.", correctAnswer: "false", explanation: "'Some' for positive; 'any' for questions/negatives." },
          { type: "FILL_BLANK", question: "Complete: There is ___ milk in the fridge. (enough)", correctAnswer: "some", explanation: "'Some' for positive with uncountable." },
          { type: "FILL_BLANK", question: "Complete: How ___ apples do you need?", correctAnswer: "many", explanation: "'Many' for countable nouns." },
          { type: "FILL_BLANK", question: "Complete: She has ___ patience with children. (a small amount, positive)", correctAnswer: "a little", explanation: "'A little' = some (positive) for uncountable." },
          { type: "MATCHING", question: "Match the quantifier:", options: [{ left: "many", right: "Countable (large)" }, { left: "much", right: "Uncountable (large)" }, { left: "a few", right: "Countable (some)" }, { left: "a little", right: "Uncountable (some)" }], correctAnswer: "[0,1,2,3]", explanation: "Each quantifier has a specific use." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I don't have any money", "There are many cars outside", "She has little experience", "Do you have some time?"], correctAnswer: "[0,1,2]", explanation: "'Do you have some time' should be 'any time' in questions. The others are correct." },
          { type: "ORDERING", question: "Put in order: much / how / sugar / you / need / do?", correctAnswer: "How much sugar,do you need?", explanation: "How much + uncountable + do + subject + need?" },
          { type: "SPEECH", question: "I don't have much time to finish this project.", correctAnswer: "I don't have much time to finish this project.", language: "en", hint: "Say you're short on time" },
          { type: "SPEECH", question: "There are a few things I need to tell you.", correctAnswer: "There are a few things I need to tell you.", language: "en", hint: "Say you have a few points to make" },
        ]
      },
      {
        title: "Passive with Modals and Perfect Infinitives",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The work ___ by tomorrow.'", options: ["must be finished", "must finished", "must be finishing", "must finish"], correctAnswer: "0", explanation: "Modal + be + past participle: 'must be finished'." },
          { type: "MCQ", question: "'The door ___ locked.' (past)", options: ["should have been", "should be", "should have", "should been"], correctAnswer: "0", explanation: "Modal + have been + past participle for past passive." },
          { type: "MCQ", question: "'The package ___ delivered today.'", options: ["can be", "can be being", "can been", "can being"], correctAnswer: "0", explanation: "Modal + be + past participle: 'can be delivered'." },
          { type: "MCQ", question: "'The letter ___ sent last week.'", options: ["must have been", "must be", "must been", "must being"], correctAnswer: "0", explanation: "Modal + have been + pp for past passive: 'must have been sent'." },
          { type: "TRUE_FALSE", question: "True or False: 'The cake should be eaten fresh' uses passive with a modal.", correctAnswer: "true", explanation: "'Should be eaten' = modal + passive." },
          { type: "TRUE_FALSE", question: "True or False: 'He must been told' is correct.", correctAnswer: "false", explanation: "'Must have been told' (modal + have been + pp)." },
          { type: "FILL_BLANK", question: "Complete: The documents ___ (can/sign) by the manager.", correctAnswer: "can be signed", explanation: "Modal + be + past participle." },
          { type: "FILL_BLANK", question: "Complete: The problem ___ (should/solve) immediately.", correctAnswer: "should be solved", explanation: "Modal passive: should be + past participle." },
          { type: "FILL_BLANK", question: "Complete: The keys ___ (might/have/leave) in the car.", correctAnswer: "might have been left", explanation: "Modal + have been + pp for past possibility." },
          { type: "MATCHING", question: "Match the structure:", options: [{ left: "must be done", right: "Present obligation" }, { left: "should have been done", right: "Past advice" }, { left: "can be seen", right: "Present possibility" }, { left: "might have been stolen", right: "Past possibility" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure has a different time/meaning." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["The report must be submitted today", "The car should have been fixed", "The window can be opened", "The letter must been sent"], correctAnswer: "[0,1,2]", explanation: "'Must been sent' should be 'must have been sent'. The others are correct." },
          { type: "ORDERING", question: "Put in order: be / the / must / rules / followed", correctAnswer: "The rules,must be followed", explanation: "Subject + must be + past participle." },
          { type: "SPEECH", question: "The homework must be completed before the next class.", correctAnswer: "The homework must be completed before the next class.", language: "en", hint: "State a requirement" },
          { type: "SPEECH", question: "The meeting should have been scheduled earlier.", correctAnswer: "The meeting should have been scheduled earlier.", language: "en", hint: "Criticize a past scheduling decision" },
        ]
      },
      {
        title: "Question Tags and Short Answers",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You are coming, ___?'", options: ["aren't you", "are you", "don't you", "isn't it"], correctAnswer: "0", explanation: "Positive statement → negative tag: 'aren't you'." },
          { type: "MCQ", question: "'She doesn't like coffee, ___?'", options: ["does she", "doesn't she", "do she", "is she"], correctAnswer: "0", explanation: "Negative statement → positive tag: 'does she'." },
          { type: "MCQ", question: "'They have finished, ___?'", options: ["haven't they", "have they", "don't they", "didn't they"], correctAnswer: "0", explanation: "Positive → negative tag: 'haven't they'." },
          { type: "MCQ", question: "'Let's go, ___?'", options: ["shall we", "will we", "don't we", "can we"], correctAnswer: "0", explanation: "'Let's' → 'shall we'." },
          { type: "TRUE_FALSE", question: "True or False: 'I am late, aren't I?' is correct.", correctAnswer: "true", explanation: "'Aren't I' is the standard tag for 'I am'." },
          { type: "TRUE_FALSE", question: "True or False: 'Nobody came, did they?' uses 'they' correctly.", correctAnswer: "true", explanation: "'Nobody' takes 'they' in the tag." },
          { type: "FILL_BLANK", question: "Complete: You won't tell anyone, ___?", correctAnswer: "will you", explanation: "Negative → positive tag: 'will you'." },
          { type: "FILL_BLANK", question: "Complete: He can swim, ___?", correctAnswer: "can't he", explanation: "Positive → negative tag: 'can't he'." },
          { type: "FILL_BLANK", question: "Complete: Don't be late, ___? (imperative)", correctAnswer: "will you", explanation: "Imperative → 'will you'." },
          { type: "MATCHING", question: "Match the tag:", options: [{ left: "You're tired", right: "aren't you?" }, { left: "She can't drive", right: "can she?" }, { left: "We should leave", right: "shouldn't we?" }, { left: "Nothing happened", right: "did it?" }], correctAnswer: "[0,1,2,3]", explanation: "Each tag matches its statement." },
          { type: "CHECKBOX", question: "Select all correct question tags:", options: ["She is nice, isn't she?", "You don't eat meat, do you?", "They were here, weren't they?", "He has a car, doesn't he?"], correctAnswer: "[0,1,2,3]", explanation: "All are correct question tags." },
          { type: "ORDERING", question: "Put in order: you / coming / aren't / are / ?", correctAnswer: "You are coming,aren't you?", explanation: "Statement + comma + tag." },
          { type: "SPEECH", question: "You've been to Paris before, haven't you?", correctAnswer: "You've been to Paris before, haven't you?", language: "en", hint: "Confirm someone's travel experience" },
          { type: "SPEECH", question: "It's a beautiful day, isn't it?", correctAnswer: "It's a beautiful day, isn't it?", language: "en", hint: "Make small talk about the weather" },
        ]
      },
      {
        title: "Module 9 Review: Advanced Grammar",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ elephant is the largest land animal.'", options: ["The", "A", "An", "No article"], correctAnswer: "0", explanation: "'The' for unique species: 'The elephant'." },
          { type: "MCQ", question: "'There isn't ___ sugar left.'", options: ["much", "many", "few", "a few"], correctAnswer: "0", explanation: "'Much' for uncountable in negatives." },
          { type: "MCQ", question: "'The report ___ by Friday.'", options: ["must be submitted", "must submit", "must submitted", "must submitting"], correctAnswer: "0", explanation: "Modal passive: must be + past participle." },
          { type: "MCQ", question: "'She works very hard, ___?'", options: ["doesn't she", "does she", "isn't she", "is she"], correctAnswer: "0", explanation: "Positive → negative tag: 'doesn't she'." },
          { type: "TRUE_FALSE", question: "True or False: 'I have a few close friends' means I have some friends.", correctAnswer: "true", explanation: "'A few' = some (positive)." },
          { type: "TRUE_FALSE", question: "True or False: 'The letter should have been sent yesterday' is correct.", correctAnswer: "true", explanation: "Modal + have been + pp for past passive." },
          { type: "FILL_BLANK", question: "Complete: ___ knowledge is power.", correctAnswer: "Knowledge", explanation: "General concept: no article." },
          { type: "FILL_BLANK", question: "Complete: How ___ people attended the meeting?", correctAnswer: "many", explanation: "'Many' for countable nouns." },
          { type: "FILL_BLANK", question: "Complete: You like pizza, ___?", correctAnswer: "don't you", explanation: "Positive → negative tag." },
          { type: "MATCHING", question: "Match the grammar concept:", options: [{ left: "a beautiful day", right: "Article + adjective" }, { left: "much water", right: "Quantifier + uncountable" }, { left: "must be done", right: "Modal passive" }, { left: "isn't it?", right: "Question tag" }], correctAnswer: "[0,1,2,3]", explanation: "Each matches its grammar category." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["The car must be washed", "I have little money left", "She is a doctor, isn't she?", "There are much students here"], correctAnswer: "[0,1,2]", explanation: "'Much students' should be 'many students'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / must / door / be / locked", correctAnswer: "The door,must be locked", explanation: "Subject + must be + past participle." },
          { type: "SPEECH", question: "There isn't much time left, so we need to hurry.", correctAnswer: "There isn't much time left, so we need to hurry.", language: "en", hint: "Warn about limited time" },
          { type: "SPEECH", question: "You've already finished the assignment, haven't you?", correctAnswer: "You've already finished the assignment, haven't you?", language: "en", hint: "Confirm completion" },
          { type: "SPEECH", question: "The documents should have been delivered by now.", correctAnswer: "The documents should have been delivered by now.", language: "en", hint: "Express expectation about delivery" },
        ]
      },
    ]
  },
  {
    title: "Real-World Communication",
    lessons: [
      {
        title: "Expressing Opinions and Agreeing/Disagreeing",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is a formal way to express an opinion?", options: ["In my opinion, the plan needs revision", "I think the plan is bad", "The plan sucks", "I don't like the plan"], correctAnswer: "0", explanation: "'In my opinion' is formal and professional." },
          { type: "MCQ", question: "'I ___ with you completely.'", options: ["agree", "accept", "approve", "confirm"], correctAnswer: "0", explanation: "'Agree with' = have the same opinion." },
          { type: "MCQ", question: "Which is a polite disagreement?", options: ["I see your point, but I disagree", "You're wrong", "I don't think so, you're stupid", "That's terrible"], correctAnswer: "0", explanation: "Acknowledge first, then disagree politely." },
          { type: "MCQ", question: "'That's a valid point, ___.'", options: ["however, I have a different view", "you're totally wrong", "I don't care", "shut up"], correctAnswer: "0", explanation: "'However' introduces a contrasting opinion politely." },
          { type: "TRUE_FALSE", question: "True or False: 'I couldn't agree more' means you completely agree.", correctAnswer: "true", explanation: "'I couldn't agree more' = I agree 100%." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm afraid I disagree' is impolite.", correctAnswer: "false", explanation: "'I'm afraid' softens the disagreement; it's polite." },
          { type: "FILL_BLANK", question: "Complete: ___ my point of view, the proposal is too expensive.", correctAnswer: "From", explanation: "'From my point of view' = in my opinion." },
          { type: "FILL_BLANK", question: "Complete: I'm not sure I ___ with that assessment.", correctAnswer: "agree", explanation: "'I'm not sure I agree' = polite disagreement." },
          { type: "FILL_BLANK", question: "Complete: That's a good point, but I'd like to ___ a different perspective.", correctAnswer: "offer", explanation: "'Offer a different perspective' = suggest another view." },
          { type: "MATCHING", question: "Match the expression:", options: [{ left: "I couldn't agree more", right: "Strong agreement" }, { left: "I see what you mean, but...", right: "Polite disagreement" }, { left: "As far as I'm concerned", right: "Personal opinion" }, { left: "You have a point there", right: "Partial agreement" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression serves a different communicative purpose." },
          { type: "CHECKBOX", question: "Select all polite ways to disagree:", options: ["I understand your view, but...", "With respect, I disagree", "That's nonsense", "I see it differently"], correctAnswer: "[0,1,3]", explanation: "'That's nonsense' is rude. The others are polite." },
          { type: "ORDERING", question: "Put in order: I / point / your / see / but / disagree", correctAnswer: "I see your point,but I disagree", explanation: "Acknowledge + but + disagree." },
          { type: "SPEECH", question: "In my opinion, we should invest more in education.", correctAnswer: "In my opinion, we should invest more in education.", language: "en", hint: "Express your opinion about education" },
          { type: "SPEECH", question: "I see your point, but I think there's another way to look at it.", correctAnswer: "I see your point, but I think there's another way to look at it.", language: "en", hint: "Politely disagree with someone's idea" },
        ]
      },
      {
        title: "Making Complaints and Apologies",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is a polite complaint?", options: ["I'm afraid there's a problem with my order", "This is terrible service!", "You always mess up", "I want to speak to your manager now"], correctAnswer: "0", explanation: "'I'm afraid there's a problem' is polite and professional." },
          { type: "MCQ", question: "'I'd like to make a ___ about the noise.'", options: ["complaint", "compliment", "comment", "commitment"], correctAnswer: "0", explanation: "'Make a complaint' = express dissatisfaction." },
          { type: "MCQ", question: "'I ___ for being late.'", options: ["apologize", "sorry", "regret", "blame"], correctAnswer: "0", explanation: "'I apologize' = I say sorry." },
          { type: "MCQ", question: "'Please accept my ___ for the inconvenience.'", options: ["apologies", "apologizes", "apologizing", "apologized"], correctAnswer: "0", explanation: "'Accept my apologies' = formal apology." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm sorry to bother you, but...' is a polite way to start a complaint.", correctAnswer: "true", explanation: "It softens the complaint and shows respect." },
          { type: "TRUE_FALSE", question: "True or False: 'It's not my fault' is a good way to apologize.", correctAnswer: "false", explanation: "An apology should take responsibility, not deflect blame." },
          { type: "FILL_BLANK", question: "Complete: I'd like to ___ a complaint about the service.", correctAnswer: "file", explanation: "'File a complaint' = formally complain." },
          { type: "FILL_BLANK", question: "Complete: I ___ apologize for the mistake.", correctAnswer: "sincerely", explanation: "'I sincerely apologize' = formal, genuine apology." },
          { type: "FILL_BLANK", question: "Complete: I'm really sorry. It was completely my ___.", correctAnswer: "fault", explanation: "'It was my fault' = taking responsibility." },
          { type: "MATCHING", question: "Match the complaint phrase:", options: [{ left: "I'm not satisfied with...", right: "Expressing dissatisfaction" }, { left: "Could you look into this?", right: "Requesting action" }, { left: "I'd appreciate it if you could...", right: "Polite request" }, { left: "I'm sorry for the inconvenience", right: "Apology" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a different purpose." },
          { type: "CHECKBOX", question: "Select all appropriate complaint phrases:", options: ["I'm afraid there's been a mistake", "This is completely unacceptable!", "Could you please explain what happened?", "I'd like to speak to someone about this"], correctAnswer: "[0,2,3]", explanation: "'This is completely unacceptable' is too aggressive for a first complaint." },
          { type: "ORDERING", question: "Put in order: I / for / apologize / the / delay", correctAnswer: "I apologize,for the delay", explanation: "Apology + for + issue." },
          { type: "SPEECH", question: "I'm sorry, but I think there's been a mistake with my bill.", correctAnswer: "I'm sorry, but I think there's been a mistake with my bill.", language: "en", hint: "Complain about a billing error" },
          { type: "SPEECH", question: "Please accept my sincere apologies for the delay in responding.", correctAnswer: "Please accept my sincere apologies for the delay in responding.", language: "en", hint: "Apologize for a late reply" },
        ]
      },
      {
        title: "Discussing Future Plans and Goals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'What are your plans ___ the future?'", options: ["for", "in", "at", "on"], correctAnswer: "0", explanation: "'Plans for the future' = what you intend to do." },
          { type: "MCQ", question: "'I'm planning to ___ my own business.'", options: ["start", "make", "do", "begin"], correctAnswer: "0", explanation: "'Start a business' = begin a company." },
          { type: "MCQ", question: "'My goal is to ___ fluent in English.'", options: ["become", "make", "do", "get"], correctAnswer: "0", explanation: "'Become fluent' = reach fluency." },
          { type: "MCQ", question: "'I'm thinking ___ abroad next year.'", options: ["of studying", "to study", "studying", "study"], correctAnswer: "0", explanation: "'Thinking of' + gerund: 'thinking of studying'." },
          { type: "TRUE_FALSE", question: "True or False: 'I aim to graduate by 2027' expresses a goal.", correctAnswer: "true", explanation: "'Aim to' = have as a goal." },
          { type: "TRUE_FALSE", question: "True or False: 'I will going to travel' is correct.", correctAnswer: "false", explanation: "'I am going to travel' or 'I will travel'." },
          { type: "FILL_BLANK", question: "Complete: My long-term ___ is to become a doctor.", correctAnswer: "goal", explanation: "'Long-term goal' = future objective." },
          { type: "FILL_BLANK", question: "Complete: I'm ___ of moving to a new country.", correctAnswer: "thinking", explanation: "'Thinking of' = considering." },
          { type: "FILL_BLANK", question: "Complete: I ___ to save enough money for a house.", correctAnswer: "hope", explanation: "'Hope to' = wish/intend to." },
          { type: "MATCHING", question: "Match the goal expression:", options: [{ left: "I'm planning to", right: "Intention" }, { left: "My goal is to", right: "Objective" }, { left: "I hope to", right: "Wish" }, { left: "I aim to", right: "Target" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression shows a different level of commitment." },
          { type: "CHECKBOX", question: "Select all correct goal sentences:", options: ["I plan to travel to Japan", "My ambition is to write a book", "I'm thinking of starting a business", "I will going to study medicine"], correctAnswer: "[0,1,2]", explanation: "'Will going to' is wrong. The others are correct." },
          { type: "ORDERING", question: "Put in order: to / I / planning / am / learn / Spanish", correctAnswer: "I am planning,to learn Spanish", explanation: "Subject + am planning + to + verb." },
          { type: "SPEECH", question: "My goal for this year is to improve my English to a B2 level.", correctAnswer: "My goal for this year is to improve my English to a B2 level.", language: "en", hint: "State a language learning goal" },
          { type: "SPEECH", question: "I'm thinking of starting my own business in the next few years.", correctAnswer: "I'm thinking of starting my own business in the next few years.", language: "en", hint: "Talk about entrepreneurial plans" },
        ]
      },
      {
        title: "Handling Social Situations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "How do you respond to an invitation you can't accept?", options: ["Thank you, but I'm afraid I can't make it", "No, I don't want to go", "I'm not coming", "Maybe, I'll see"], correctAnswer: "0", explanation: "Polite decline: thank + reason." },
          { type: "MCQ", question: "'Congratulations on your ___!'", options: ["promotion", "promote", "promoting", "promoted"], correctAnswer: "0", explanation: "'Promotion' = noun for advancing in a job." },
          { type: "MCQ", question: "How do you express sympathy?", options: ["I'm sorry to hear that", "That's your problem", "Don't worry about it", "It's not a big deal"], correctAnswer: "0", explanation: "'I'm sorry to hear that' shows empathy." },
          { type: "MCQ", question: "'Best wishes for your ___ recovery.'", options: ["speedy", "fast", "quick", "rapid"], correctAnswer: "0", explanation: "'Speedy recovery' is the common phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Thank you so much for your hospitality' is appropriate after visiting someone's home.", correctAnswer: "true", explanation: "It's a polite way to thank a host." },
          { type: "TRUE_FALSE", question: "True or False: 'Good luck with your interview!' is an appropriate expression of support.", correctAnswer: "true", explanation: "Wishing someone luck is supportive." },
          { type: "FILL_BLANK", question: "Complete: I'm so ___ of your achievements!", correctAnswer: "proud", explanation: "'Proud of' = feeling happy about someone's success." },
          { type: "FILL_BLANK", question: "Complete: ___ on your graduation! You deserve it.", correctAnswer: "Congratulations", explanation: "'Congratulations' for achievements." },
          { type: "FILL_BLANK", question: "Complete: I'd like to ___ you a toast to your success.", correctAnswer: "propose", explanation: "'Propose a toast' = raise a glass in celebration." },
          { type: "MATCHING", question: "Match the social expression:", options: [{ left: "Congratulations!", right: "Celebration" }, { left: "I'm sorry for your loss", right: "Sympathy" }, { left: "Thank you for having me", right: "Gratitude" }, { left: "Best of luck!", right: "Encouragement" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression fits a social situation." },
          { type: "CHECKBOX", question: "Select all appropriate social responses:", options: ["That's wonderful news! Congratulations!", "I'm really sorry to hear about your loss", "Good job! Keep it up!", "Whatever, I don't care"], correctAnswer: "[0,1,2]", explanation: "'Whatever, I don't care' is dismissive and rude." },
          { type: "ORDERING", question: "Put in order: you / so / thank / much / for / the / invitation", correctAnswer: "Thank you so much,for the invitation", explanation: "Gratitude expression." },
          { type: "SPEECH", question: "Congratulations on your new job! I'm so proud of you.", correctAnswer: "Congratulations on your new job! I'm so proud of you.", language: "en", hint: "Congratulate someone on a new job" },
          { type: "SPEECH", question: "Thank you so much for inviting me to your party. I had a wonderful time.", correctAnswer: "Thank you so much for inviting me to your party. I had a wonderful time.", language: "en", hint: "Thank a host after a party" },
        ]
      },
      {
        title: "Module 10 Review: Real-World Communication",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ my view, the project needs more funding.'", options: ["In", "On", "At", "From"], correctAnswer: "0", explanation: "'In my view' = in my opinion." },
          { type: "MCQ", question: "'I ___ to apologize for the confusion.'", options: ["would like", "would to like", "like to would", "to would like"], correctAnswer: "0", explanation: "'I would like to apologize' = formal apology." },
          { type: "MCQ", question: "'What do you ___ about the new policy?'", options: ["think", "say", "tell", "speak"], correctAnswer: "0", explanation: "'What do you think' = asking for an opinion." },
          { type: "MCQ", question: "'I completely ___ with your assessment.'", options: ["disagree", "disagree with", "disagree to", "disagree about"], correctAnswer: "0", explanation: "'Disagree with' = have a different opinion." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm afraid I have to disagree' is a polite way to express disagreement.", correctAnswer: "true", explanation: "'I'm afraid' softens the disagreement." },
          { type: "TRUE_FALSE", question: "True or False: 'I wish you a speedy recovery' is appropriate for someone who is sick.", correctAnswer: "true", explanation: "It's a standard expression of sympathy." },
          { type: "FILL_BLANK", question: "Complete: I'd like to ___ a complaint about the noisy neighbors.", correctAnswer: "make", explanation: "'Make a complaint' = express dissatisfaction." },
          { type: "FILL_BLANK", question: "Complete: My ___ is to finish my degree by next year.", correctAnswer: "goal", explanation: "'Goal' = objective/target." },
          { type: "FILL_BLANK", question: "Complete: ___ for your achievement! You worked so hard.", correctAnswer: "Congratulations", explanation: "'Congratulations' for celebrating success." },
          { type: "MATCHING", question: "Match the situation with the response:", options: [{ left: "Someone shares good news", right: "Congratulations!" }, { left: "Someone shares bad news", right: "I'm sorry to hear that" }, { left: "Someone asks your opinion", right: "In my view..." }, { left: "Someone invites you", right: "Thank you, I'd love to" }], correctAnswer: "[0,1,2,3]", explanation: "Each response fits its situation." },
          { type: "CHECKBOX", question: "Select all appropriate communication phrases:", options: ["I see your point, but I disagree", "I apologize for the inconvenience", "That's a great idea!", "You're completely wrong"], correctAnswer: "[0,1,2]", explanation: "'You're completely wrong' is too blunt. The others are appropriate." },
          { type: "ORDERING", question: "Put in order: I / like / to / would / thank / you", correctAnswer: "I would like,to thank you", explanation: "Formal expression of gratitude." },
          { type: "SPEECH", question: "In my opinion, the best solution is to work together as a team.", correctAnswer: "In my opinion, the best solution is to work together as a team.", language: "en", hint: "Express your opinion about teamwork" },
          { type: "SPEECH", question: "I'm so sorry for the delay. I'll make sure it doesn't happen again.", correctAnswer: "I'm so sorry for the delay. I'll make sure it doesn't happen again.", language: "en", hint: "Apologize and promise improvement" },
          { type: "SPEECH", question: "My ultimate goal is to become fluent in three languages.", correctAnswer: "My ultimate goal is to become fluent in three languages.", language: "en", hint: "Share a long-term language goal" },
        ]
      },
    ]
  },
  {
    title: "Gerunds, Infinitives & Phrasal Verbs",
    lessons: [
      {
        title: "Gerunds (Verb + -ing as Noun)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I enjoy reading", "I enjoy to read", "I enjoy read", "I enjoying read"], correctAnswer: "0", explanation: "'Enjoy' + gerund: 'I enjoy reading'." },
          { type: "MCQ", question: "'She suggested ___ to the cinema.'", options: ["going", "to go", "go", "went"], correctAnswer: "0", explanation: "'Suggest' + gerund: 'She suggested going'." },
          { type: "MCQ", question: "Which verb takes a gerund?", options: ["avoid", "want", "decide", "hope"], correctAnswer: "0", explanation: "'Avoid' + gerund: 'avoid doing'." },
          { type: "MCQ", question: "'He admitted ___ the mistake.'", options: ["making", "to make", "make", "made"], correctAnswer: "0", explanation: "'Admit' + gerund: 'He admitted making'." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm interested in learning English' uses a gerund after a preposition.", correctAnswer: "true", explanation: "Prepositions are followed by gerunds: 'in learning'." },
          { type: "TRUE_FALSE", question: "True or False: 'I want going home' is correct.", correctAnswer: "false", explanation: "'Want' + infinitive: 'I want to go home'." },
          { type: "FILL_BLANK", question: "Complete: She practices ___ (speak) English every day.", correctAnswer: "speaking", explanation: "'Practice' + gerund." },
          { type: "FILL_BLANK", question: "Complete: He is good at ___ (play) chess.", correctAnswer: "playing", explanation: "Preposition 'at' + gerund." },
          { type: "FILL_BLANK", question: "Complete: I can't stand ___ (wait) in line.", correctAnswer: "waiting", explanation: "'Can't stand' + gerund." },
          { type: "MATCHING", question: "Match the verb with gerund:", options: [{ left: "enjoy", right: "reading" }, { left: "avoid", right: "eating" }, { left: "finish", right: "working" }, { left: "mind", right: "opening" }], correctAnswer: "[0,1,2,3]", explanation: "All these verbs are followed by gerunds." },
          { type: "CHECKBOX", question: "Select all sentences with correct gerund usage:", options: ["She keeps talking", "I consider moving abroad", "He promised helping me", "We discussed leaving early"], correctAnswer: "[0,1,3]", explanation: "'Promised' takes infinitive: 'promised to help'. The others are correct." },
          { type: "ORDERING", question: "Put in order: enjoy / I / to / music / listening", correctAnswer: "I enjoy,listening to music", explanation: "Subject + enjoy + gerund." },
          { type: "SPEECH", question: "I really enjoy spending time with my family on weekends.", correctAnswer: "I really enjoy spending time with my family on weekends.", language: "en", hint: "Talk about what you enjoy" },
          { type: "SPEECH", question: "She suggested going to the new restaurant downtown.", correctAnswer: "She suggested going to the new restaurant downtown.", language: "en", hint: "Make a suggestion" },
        ]
      },
      {
        title: "Infinitives (To + Verb)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is correct?", options: ["I want to learn English", "I want learning English", "I want learn English", "I wanting to learn English"], correctAnswer: "0", explanation: "'Want' + infinitive: 'I want to learn'." },
          { type: "MCQ", question: "'She decided ___ a new car.'", options: ["to buy", "buying", "buy", "bought"], correctAnswer: "0", explanation: "'Decide' + infinitive: 'She decided to buy'." },
          { type: "MCQ", question: "Which verb takes an infinitive?", options: ["hope", "enjoy", "avoid", "suggest"], correctAnswer: "0", explanation: "'Hope' + infinitive: 'hope to do'." },
          { type: "MCQ", question: "'He promised ___ me with the project.'", options: ["to help", "helping", "help", "helped"], correctAnswer: "0", explanation: "'Promise' + infinitive: 'He promised to help'." },
          { type: "TRUE_FALSE", question: "True or False: 'I need to finish this today' uses an infinitive correctly.", correctAnswer: "true", explanation: "'Need' + infinitive: 'need to do'." },
          { type: "TRUE_FALSE", question: "True or False: 'She offered helping me' is correct.", correctAnswer: "false", explanation: "'Offer' + infinitive: 'She offered to help me'." },
          { type: "FILL_BLANK", question: "Complete: They agreed ___ (meet) at 6 PM.", correctAnswer: "to meet", explanation: "'Agree' + infinitive." },
          { type: "FILL_BLANK", question: "Complete: I hope ___ (visit) Japan someday.", correctAnswer: "to visit", explanation: "'Hope' + infinitive." },
          { type: "FILL_BLANK", question: "Complete: She refused ___ (answer) the question.", correctAnswer: "to answer", explanation: "'Refuse' + infinitive." },
          { type: "MATCHING", question: "Match the verb with infinitive:", options: [{ left: "want", right: "to go" }, { left: "plan", right: "to study" }, { left: "expect", right: "to arrive" }, { left: "promise", right: "to call" }], correctAnswer: "[0,1,2,3]", explanation: "All these verbs are followed by infinitives." },
          { type: "CHECKBOX", question: "Select all correct infinitive sentences:", options: ["I hope to see you soon", "She decided to leave early", "He enjoys to read books", "They agreed to help"], correctAnswer: "[0,1,3]", explanation: "'Enjoys' takes gerund: 'enjoys reading'. The others are correct." },
          { type: "ORDERING", question: "Put in order: to / I / need / finish / this / report", correctAnswer: "I need,to finish,this report", explanation: "Subject + need + to + verb + object." },
          { type: "SPEECH", question: "I plan to travel to Europe next summer.", correctAnswer: "I plan to travel to Europe next summer.", language: "en", hint: "Talk about your travel plans" },
          { type: "SPEECH", question: "She promised to call me when she arrives.", correctAnswer: "She promised to call me when she arrives.", language: "en", hint: "Talk about a promise" },
        ]
      },
      {
        title: "Verbs with Both Gerunds and Infinitives",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I stopped ___ (smoke).' = I quit the habit", options: ["smoking", "to smoke", "smoke", "smoked"], correctAnswer: "0", explanation: "'Stop' + gerund = quit the action." },
          { type: "MCQ", question: "'I stopped ___ (buy) water.' = I paused to do it", options: ["to buy", "buying", "buy", "bought"], correctAnswer: "0", explanation: "'Stop' + infinitive = paused to do something." },
          { type: "MCQ", question: "'I remember ___ him at the party.' (past memory)", options: ["seeing", "to see", "see", "saw"], correctAnswer: "0", explanation: "'Remember' + gerund = memory of past action." },
          { type: "MCQ", question: "'Remember ___ the door.' (don't forget)", options: ["to lock", "locking", "lock", "locked"], correctAnswer: "0", explanation: "'Remember' + infinitive = don't forget to do." },
          { type: "TRUE_FALSE", question: "True or False: 'I tried to open the window' means I attempted it.", correctAnswer: "true", explanation: "'Try' + infinitive = attempt." },
          { type: "TRUE_FALSE", question: "True or False: 'I tried opening the window' means I tested it as a solution.", correctAnswer: "true", explanation: "'Try' + gerund = experiment/test." },
          { type: "FILL_BLANK", question: "Complete: I regret ___ (tell) her the secret. (past action)", correctAnswer: "telling", explanation: "'Regret' + gerund = sorry about past action." },
          { type: "FILL_BLANK", question: "Complete: I regret ___ (inform) you that you failed. (formal announcement)", correctAnswer: "to inform", explanation: "'Regret' + infinitive = formal announcement." },
          { type: "FILL_BLANK", question: "Complete: She went on ___ (talk) for an hour. (continued)", correctAnswer: "talking", explanation: "'Go on' + gerund = continued." },
          { type: "MATCHING", question: "Match the meaning:", options: [{ left: "I stopped eating", right: "I quit eating" }, { left: "I stopped to eat", right: "I paused to eat" }, { left: "I remember visiting", right: "Memory of visiting" }, { left: "Remember to visit", right: "Don't forget to visit" }], correctAnswer: "[0,1,2,3]", explanation: "Gerund vs infinitive changes meaning." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I tried calling her but she didn't answer", "He tried to lift the heavy box", "She continued working despite the noise", "I like to swim and swimming"], correctAnswer: "[0,1,2,3]", explanation: "'Like' can take both gerund and infinitive with similar meaning." },
          { type: "ORDERING", question: "Put in order: remember / to / don't / lock / the door", correctAnswer: "Don't forget,to lock the door", explanation: "Remember + to + verb." },
          { type: "SPEECH", question: "I remember visiting Paris when I was a child.", correctAnswer: "I remember visiting Paris when I was a child.", language: "en", hint: "Share a childhood memory" },
          { type: "SPEECH", question: "Don't forget to bring your passport to the airport.", correctAnswer: "Don't forget to bring your passport to the airport.", language: "en", hint: "Remind someone about an important item" },
        ]
      },
      {
        title: "Common Phrasal Verbs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Please ___ the light when you leave.'", options: ["turn off", "turn on", "turn up", "turn down"], correctAnswer: "0", explanation: "'Turn off' = switch off." },
          { type: "MCQ", question: "'She ___ her old clothes to charity.'", options: ["gave away", "gave up", "gave in", "gave out"], correctAnswer: "0", explanation: "'Give away' = donate." },
          { type: "MCQ", question: "'He ___ smoking last year.'", options: ["gave up", "gave away", "gave in", "gave out"], correctAnswer: "0", explanation: "'Give up' = quit a habit." },
          { type: "MCQ", question: "'Can you ___ the music? It's too loud.'", options: ["turn down", "turn up", "turn on", "turn off"], correctAnswer: "0", explanation: "'Turn down' = reduce volume." },
          { type: "TRUE_FALSE", question: "True or False: 'Look up' can mean to search for information.", correctAnswer: "true", explanation: "'Look up' = search (e.g., a word in a dictionary)." },
          { type: "TRUE_FALSE", question: "True or False: 'Run out of' means to have plenty of something.", correctAnswer: "false", explanation: "'Run out of' = have none left." },
          { type: "FILL_BLANK", question: "Complete: We need to ___ (find) a solution.", correctAnswer: "come up with", explanation: "'Come up with' = think of/create." },
          { type: "FILL_BLANK", question: "Complete: She ___ (depends on) her parents for support.", correctAnswer: "relies on", explanation: "'Rely on' = depend on." },
          { type: "FILL_BLANK", question: "Complete: The meeting was ___ (postponed) until next week.", correctAnswer: "put off", explanation: "'Put off' = postpone." },
          { type: "MATCHING", question: "Match the phrasal verb:", options: [{ left: "look after", right: "Take care of" }, { left: "look for", right: "Search for" }, { left: "look forward to", right: "Anticipate eagerly" }, { left: "look into", right: "Investigate" }], correctAnswer: "[0,1,2,3]", explanation: "Each 'look' phrasal verb has a different meaning." },
          { type: "CHECKBOX", question: "Select all correct phrasal verb usage:", options: ["I'll pick you up at 5", "She broke down in tears", "He ran out of money", "They put off the meeting"], correctAnswer: "[0,1,2,3]", explanation: "All are correct phrasal verb usage." },
          { type: "ORDERING", question: "Put in order: up / I / with / came / an idea", correctAnswer: "I came up with,an idea", explanation: "Subject + came up with + object." },
          { type: "SPEECH", question: "I'm looking forward to meeting you next week.", correctAnswer: "I'm looking forward to meeting you next week.", language: "en", hint: "Express excitement about a future meeting" },
          { type: "SPEECH", question: "Could you please turn down the volume? It's too loud.", correctAnswer: "Could you please turn down the volume? It's too loud.", language: "en", hint: "Ask someone to reduce the volume" },
        ]
      },
      {
        title: "Module 9 Review: Gerunds, Infinitives & Phrasal Verbs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I'm used to ___ early.'", options: ["waking up", "wake up", "woke up", "waking"], correctAnswer: "0", explanation: "'Be used to' + gerund: 'waking up'." },
          { type: "MCQ", question: "'She wants ___ a doctor.'", options: ["to become", "becoming", "become", "became"], correctAnswer: "0", explanation: "'Want' + infinitive." },
          { type: "MCQ", question: "'He avoided ___ the question.'", options: ["answering", "to answer", "answer", "answered"], correctAnswer: "0", explanation: "'Avoid' + gerund." },
          { type: "MCQ", question: "'Please ___ the radio; I want to hear the news.'", options: ["turn up", "turn down", "turn off", "turn on"], correctAnswer: "0", explanation: "'Turn up' = increase volume." },
          { type: "TRUE_FALSE", question: "True or False: 'I look forward to seeing you' uses a gerund after 'to'.", correctAnswer: "true", explanation: "'To' here is a preposition, so gerund follows." },
          { type: "TRUE_FALSE", question: "True or False: 'He suggested to go home' is correct.", correctAnswer: "false", explanation: "'Suggest' + gerund: 'He suggested going home'." },
          { type: "FILL_BLANK", question: "Complete: She promised ___ (help) me move.", correctAnswer: "to help", explanation: "'Promise' + infinitive." },
          { type: "FILL_BLANK", question: "Complete: I can't afford ___ (buy) a new car.", correctAnswer: "to buy", explanation: "'Afford' + infinitive." },
          { type: "FILL_BLANK", question: "Complete: He gave ___ (quit) smoking for health reasons.", correctAnswer: "up", explanation: "'Give up' = quit." },
          { type: "MATCHING", question: "Match the structure:", options: [{ left: "enjoy + gerund", right: "I enjoy cooking" }, { left: "want + infinitive", right: "I want to travel" }, { left: "look forward to + gerund", right: "I look forward to meeting you" }, { left: "stop + infinitive", right: "I stopped to rest" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb has its own pattern." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I'm thinking about moving abroad", "She offered to drive me home", "He admitted stealing the money", "I look forward to hear from you"], correctAnswer: "[0,1,2]", explanation: "'Look forward to hear' should be 'look forward to hearing'." },
          { type: "ORDERING", question: "Put in order: to / I / looking / meeting / forward / am / you", correctAnswer: "I am looking forward to,meeting you", explanation: "Subject + am looking forward to + gerund." },
          { type: "SPEECH", question: "I can't stand waiting in long queues at the bank.", correctAnswer: "I can't stand waiting in long queues at the bank.", language: "en", hint: "Complain about waiting" },
          { type: "SPEECH", question: "She decided to give up eating fast food.", correctAnswer: "She decided to give up eating fast food.", language: "en", hint: "Talk about a lifestyle change" },
          { type: "SPEECH", question: "We ran out of milk, so I need to go to the store.", correctAnswer: "We ran out of milk, so I need to go to the store.", language: "en", hint: "Say you need to buy something" },
        ]
      },
    ]
  },
  {
    title: "Word Formation & Linking Words",
    lessons: [
      {
        title: "Word Formation (Prefixes and Suffixes)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is the correct noun form of 'decide'?", options: ["decision", "deciding", "decisive", "decidable"], correctAnswer: "0", explanation: "'Decide' → 'decision' (verb to noun)." },
          { type: "MCQ", question: "What is the opposite of 'happy' using a prefix?", options: ["unhappy", "inhappy", "dis happy", "rehappy"], correctAnswer: "0", explanation: "'Un-' prefix creates the opposite: 'unhappy'." },
          { type: "MCQ", question: "'She is very ___ (create).' Which form is correct?", options: ["creative", "creation", "creating", "creatively"], correctAnswer: "0", explanation: "'Creative' is the adjective form." },
          { type: "MCQ", question: "What is the adverb form of 'quick'?", options: ["quickly", "quickness", "quickful", "quicken"], correctAnswer: "0", explanation: "'Quick' → 'quickly' (adjective to adverb)." },
          { type: "TRUE_FALSE", question: "True or False: 'Un-' and 'dis-' are prefixes that create opposites.", correctAnswer: "true", explanation: "'Un-' (unhappy) and 'dis-' (disagree) create negative meanings." },
          { type: "TRUE_FALSE", question: "True or False: '-ness' turns adjectives into nouns.", correctAnswer: "true", explanation: "'Happy' → 'happiness', 'kind' → 'kindness'." },
          { type: "FILL_BLANK", question: "Complete: The ___ (beautiful) of the sunset amazed us.", correctAnswer: "beauty", explanation: "Noun form of 'beautiful'." },
          { type: "FILL_BLANK", question: "Complete: He ___ (agree) with the decision.", correctAnswer: "disagreed", explanation: "'Dis-' prefix + past tense." },
          { type: "FILL_BLANK", question: "Complete: She spoke ___ (clear) to the audience.", correctAnswer: "clearly", explanation: "Adverb form of 'clear'." },
          { type: "MATCHING", question: "Match the word formation:", options: [{ left: "happy → happiness", right: "Adjective to noun" }, { left: "quick → quickly", right: "Adjective to adverb" }, { left: "do → redo", right: "Prefix (again)" }, { left: "possible → impossible", right: "Prefix (opposite)" }], correctAnswer: "[0,1,2,3]", explanation: "Each shows a different word formation pattern." },
          { type: "CHECKBOX", question: "Select all correct word formations:", options: ["careful → carefully", "act → action", "happy → unhappiness", "write → writer"], correctAnswer: "[0,1,2,3]", explanation: "All are correct word formations." },
          { type: "ORDERING", question: "Put in order: un / believe / able → unbelievable", correctAnswer: "un, + believe, + able → unbelievable", explanation: "Prefix + root + suffix." },
          { type: "SPEECH", question: "The scientist made an important discovery about climate change.", correctAnswer: "The scientist made an important discovery about climate change.", language: "en", hint: "Use a noun form of 'discover'" },
          { type: "SPEECH", question: "She was extremely disappointed with the service.", correctAnswer: "She was extremely disappointed with the service.", language: "en", hint: "Use a word with a prefix to express disappointment" },
        ]
      },
      {
        title: "Linking Words for Coherence",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which linking word shows contrast?", options: ["However", "Furthermore", "In addition", "Therefore"], correctAnswer: "0", explanation: "'However' introduces a contrasting idea." },
          { type: "MCQ", question: "'___, the results were surprising.' (addition)", options: ["Moreover", "However", "Although", "Despite"], correctAnswer: "0", explanation: "'Moreover' adds information." },
          { type: "MCQ", question: "'___ the rain, we went outside.'", options: ["Despite", "Although", "However", "Because"], correctAnswer: "0", explanation: "'Despite' + noun: 'Despite the rain'." },
          { type: "MCQ", question: "'He failed the exam ___ he didn't study.'", options: ["because", "despite", "although", "however"], correctAnswer: "0", explanation: "'Because' gives a reason." },
          { type: "TRUE_FALSE", question: "True or False: 'Furthermore' and 'in addition' can be used interchangeably.", correctAnswer: "true", explanation: "Both add information." },
          { type: "TRUE_FALSE", question: "True or False: 'Despite' is followed by a clause.", correctAnswer: "false", explanation: "'Despite' is followed by a noun/noun phrase, not a clause." },
          { type: "FILL_BLANK", question: "Complete: ___ it was raining, we enjoyed the trip.", correctAnswer: "Although", explanation: "'Although' + clause: 'Although it was raining'." },
          { type: "FILL_BLANK", question: "Complete: The plan was expensive; ___, it was effective.", correctAnswer: "nevertheless", explanation: "'Nevertheless' shows contrast." },
          { type: "FILL_BLANK", question: "Complete: First, we need to gather data. ___, we'll analyze it.", correctAnswer: "Then", explanation: "'Then' shows sequence." },
          { type: "MATCHING", question: "Match the linking word with its function:", options: [{ left: "However", right: "Contrast" }, { left: "Therefore", right: "Result" }, { left: "For example", right: "Illustration" }, { left: "In conclusion", right: "Summary" }], correctAnswer: "[0,1,2,3]", explanation: "Each linking word serves a specific function." },
          { type: "CHECKBOX", question: "Select all correct linking word usage:", options: ["She is smart; however, she is lazy", "Furthermore, the data supports our hypothesis", "Despite of the rain, we went out", "In addition, we need more resources"], correctAnswer: "[0,1,3]", explanation: "'Despite of' is wrong; should be 'Despite' or 'In spite of'. The others are correct." },
          { type: "ORDERING", question: "Put in order: although / tired / she / finished / was / the work / she", correctAnswer: "Although she was tired,she finished the work", explanation: "Although + clause, main clause." },
          { type: "SPEECH", question: "The project was challenging; however, we managed to complete it on time.", correctAnswer: "The project was challenging; however, we managed to complete it on time.", language: "en", hint: "Use 'however' to show contrast" },
          { type: "SPEECH", question: "In conclusion, regular exercise is essential for a healthy lifestyle.", correctAnswer: "In conclusion, regular exercise is essential for a healthy lifestyle.", language: "en", hint: "Use a concluding phrase" },
        ]
      },
      {
        title: "Advanced Connectors (Although, Despite, Whereas)",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ being tired, she finished the work.'", options: ["Despite", "Although", "However", "But"], correctAnswer: "0", explanation: "'Despite' + noun/gerund: 'Despite being tired'." },
          { type: "MCQ", question: "'___ he is rich, he is not happy.'", options: ["Although", "Despite", "However", "But"], correctAnswer: "0", explanation: "'Although' + clause: 'Although he is rich'." },
          { type: "MCQ", question: "'She loves coffee, ___ he prefers tea.'", options: ["whereas", "although", "despite", "however"], correctAnswer: "0", explanation: "'Whereas' contrasts two different things." },
          { type: "MCQ", question: "Which is correct?", options: ["In spite of the weather", "In spite the weather", "Despite of the weather", "Despite the weather was bad"], correctAnswer: "0", explanation: "'In spite of' + noun: 'In spite of the weather'." },
          { type: "TRUE_FALSE", question: "True or False: 'Although' and 'despite' can be used interchangeably.", correctAnswer: "false", explanation: "'Although' + clause; 'despite' + noun. They can't be used the same way." },
          { type: "TRUE_FALSE", question: "True or False: 'Whereas' is used to compare two different situations.", correctAnswer: "true", explanation: "'Whereas' highlights differences between two things." },
          { type: "FILL_BLANK", question: "Complete: ___ the fact that it was late, they continued working.", correctAnswer: "Despite", explanation: "'Despite the fact that' + clause." },
          { type: "FILL_BLANK", question: "Complete: ___ I agree with you, I think we need more time.", correctAnswer: "Although", explanation: "'Although' + clause for contrast." },
          { type: "FILL_BLANK", question: "Complete: She is very outgoing, ___ her brother is quite shy.", correctAnswer: "whereas", explanation: "'Whereas' contrasts two different people." },
          { type: "MATCHING", question: "Match the connector:", options: [{ left: "Although + clause", right: "Despite + noun" }, { left: "In spite of + noun", right: "Despite + noun" }, { left: "Whereas + clause", right: "Contrast two things" }, { left: "While + clause", right: "Simultaneous or contrast" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector has a specific structure." },
          { type: "CHECKBOX", question: "Select all correct connector usage:", options: ["Although it rained, we had fun", "Despite the rain, we had fun", "Whereas I like coffee, she likes tea", "Although the rain, we had fun"], correctAnswer: "[0,1,2]", explanation: "'Although the rain' should be 'Although it rained' or 'Despite the rain'." },
          { type: "ORDERING", question: "Put in order: despite / the / they / weather / bad / continued / was / working", correctAnswer: "Despite the bad weather,they continued working", explanation: "Despite + noun phrase, main clause." },
          { type: "SPEECH", question: "Although it was very cold, they decided to go hiking in the mountains.", correctAnswer: "Although it was very cold, they decided to go hiking in the mountains.", language: "en", hint: "Use 'although' to show a surprising decision" },
          { type: "SPEECH", question: "My sister is very organized, whereas I am quite messy.", correctAnswer: "My sister is very organized, whereas I am quite messy.", language: "en", hint: "Compare yourself with someone using 'whereas'" },
        ]
      },
      {
        title: "Cohesive Devices in Writing",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which phrase introduces an example?", options: ["For instance", "On the contrary", "In conclusion", "As a result"], correctAnswer: "0", explanation: "'For instance' introduces an example." },
          { type: "MCQ", question: "'The company lost money. ___, it had to lay off workers.'", options: ["As a result", "However", "For example", "In contrast"], correctAnswer: "0", explanation: "'As a result' shows consequence." },
          { type: "MCQ", question: "Which phrase shows a sequence?", options: ["First of all", "On the other hand", "In spite of", "For example"], correctAnswer: "0", explanation: "'First of all' starts a sequence." },
          { type: "MCQ", question: "'The plan has many benefits. ___, it will save money.'", options: ["To begin with", "In conclusion", "On the contrary", "Despite"], correctAnswer: "0", explanation: "'To begin with' introduces the first point." },
          { type: "TRUE_FALSE", question: "True or False: 'On the one hand... on the other hand' presents two sides of an argument.", correctAnswer: "true", explanation: "This structure presents contrasting viewpoints." },
          { type: "TRUE_FALSE", question: "True or False: 'In other words' is used to rephrase or clarify.", correctAnswer: "true", explanation: "'In other words' restates something more clearly." },
          { type: "FILL_BLANK", question: "Complete: Many people oppose the plan. ___, the mayor supports it.", correctAnswer: "However", explanation: "'However' shows contrast." },
          { type: "FILL_BLANK", question: "Complete: The evidence is clear. ___, we must take action.", correctAnswer: "Therefore", explanation: "'Therefore' shows conclusion/result." },
          { type: "FILL_BLANK", question: "Complete: ___ all the challenges, the team succeeded.", correctAnswer: "Despite", explanation: "'Despite' + noun phrase." },
          { type: "MATCHING", question: "Match the cohesive device:", options: [{ left: "To sum up", right: "Conclusion" }, { left: "On the contrary", right: "Strong contrast" }, { left: "In addition", right: "Adding information" }, { left: "Consequently", right: "Result" }], correctAnswer: "[0,1,2,3]", explanation: "Each device serves a different writing function." },
          { type: "CHECKBOX", question: "Select all correct cohesive device usage:", options: ["The weather was bad. Consequently, the match was canceled", "On the one hand, it's expensive; on the other hand, it's effective", "For instance, many countries have adopted this policy", "In other words, despite the fact of the situation"], correctAnswer: "[0,1,2]", explanation: "'Despite the fact of' is wrong; should be 'Despite the fact that'. The others are correct." },
          { type: "ORDERING", question: "Put in order: on / one / hand / the / it's / cheap / other / on / hand / the / it's / poor / quality", correctAnswer: "On the one hand it's cheap,on the other hand it's poor quality", explanation: "On the one hand... on the other hand structure." },
          { type: "SPEECH", question: "To sum up, regular exercise improves both physical and mental health.", correctAnswer: "To sum up, regular exercise improves both physical and mental health.", language: "en", hint: "Summarize a point about health" },
          { type: "SPEECH", question: "On the one hand, studying abroad is expensive. On the other hand, it's a valuable experience.", correctAnswer: "On the one hand, studying abroad is expensive. On the other hand, it's a valuable experience.", language: "en", hint: "Present both sides of studying abroad" },
        ]
      },
      {
        title: "Module 10 Review: Word Formation & Linking Words",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the noun form of 'develop'?", options: ["development", "developing", "developed", "developable"], correctAnswer: "0", explanation: "'Develop' → 'development'." },
          { type: "MCQ", question: "'___ the heavy traffic, we arrived on time.'", options: ["Despite", "Although", "However", "But"], correctAnswer: "0", explanation: "'Despite' + noun phrase: 'Despite the heavy traffic'." },
          { type: "MCQ", question: "Which shows addition?", options: ["Furthermore", "However", "Although", "Despite"], correctAnswer: "0", explanation: "'Furthermore' adds information." },
          { type: "MCQ", question: "What is the adjective form of 'danger'?", options: ["dangerous", "dangerly", "dangerful", "dangerment"], correctAnswer: "0", explanation: "'Danger' → 'dangerous'." },
          { type: "TRUE_FALSE", question: "True or False: 'Un-' makes a word negative.", correctAnswer: "true", explanation: "'Un-' prefix creates opposites: unhappy, unknown, unfair." },
          { type: "TRUE_FALSE", question: "True or False: 'In spite of' and 'despite' mean the same thing.", correctAnswer: "true", explanation: "Both express contrast with a noun phrase." },
          { type: "FILL_BLANK", question: "Complete: The ___ (important) of education cannot be overstated.", correctAnswer: "importance", explanation: "Noun form of 'important'." },
          { type: "FILL_BLANK", question: "Complete: ___ she was tired, she continued working.", correctAnswer: "Although", explanation: "'Although' + clause." },
          { type: "FILL_BLANK", question: "Complete: The results were surprising. ___, they were accurate.", correctAnswer: "Nevertheless", explanation: "'Nevertheless' shows contrast." },
          { type: "MATCHING", question: "Match the word formation:", options: [{ left: "success → successful", right: "Noun to adjective" }, { left: "agree → disagreement", right: "Prefix + suffix" }, { left: "act → actor", right: "Verb to noun (person)" }, { left: "happy → happily", right: "Adjective to adverb" }], correctAnswer: "[0,1,2,3]", explanation: "Each shows a different word formation pattern." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["Despite the rain, we went out", "Although he is young, he is wise", "Furthermore, we need more data", "She spoke quick to the audience"], correctAnswer: "[0,1,2]", explanation: "'Spoke quick' should be 'spoke quickly'. The others are correct." },
          { type: "ORDERING", question: "Put in order: on / other / hand / the / it's / efficient", correctAnswer: "On the other hand,it's efficient", explanation: "On the other hand + clause." },
          { type: "SPEECH", question: "In conclusion, the benefits of learning a second language are numerous.", correctAnswer: "In conclusion, the benefits of learning a second language are numerous.", language: "en", hint: "Write a concluding sentence" },
          { type: "SPEECH", question: "Despite the challenges, the team managed to complete the project successfully.", correctAnswer: "Despite the challenges, the team managed to complete the project successfully.", language: "en", hint: "Describe overcoming difficulties" },
          { type: "SPEECH", question: "She is highly intelligent; furthermore, she is very creative.", correctAnswer: "She is highly intelligent; furthermore, she is very creative.", language: "en", hint: "Add information about someone's qualities" },
        ]
      },
    ]
  },
]

async function seedEnglishB1() {
  console.log('=========================================')
  console.log('🚀 Seeding English B1 Course...')
  console.log('=========================================')

  try {
    let category = await withRetry(() => prisma.category.findFirst({
      where: { name: 'Languages' }
    }))

    if (!category) {
      console.log('⚠️ Languages category not found. Creating...')
      category = await withRetry(() => prisma.category.create({
        data: {
          name: 'Languages',
          description: 'Learn languages from beginner to advanced',
          icon: '🌍',
          color: '#2563eb',
          order: 1,
          isActive: true,
        }
      }))
      console.log('✅ Languages category created:', category.id)
    }

    let course = await withRetry(() => prisma.course.findFirst({
      where: { title: courseData.title }
    }))

    if (course) {
      console.log('🗑️ Deleting existing course and all related data...')
      await withRetry(() => prisma.module.deleteMany({
        where: { courseId: course.id }
      }))
      console.log('✅ Existing modules deleted (cascades to lessons and questions)')
    }

    if (!course) {
      course = await withRetry(() => prisma.course.create({
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
          order: 3,
        }
      }))
      console.log('✅ Course created:', course.id)
    } else {
      course = await withRetry(() => prisma.course.update({
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
      }))
      console.log('✅ Course updated:', course.id)
    }

    let totalLessons = 0
    let totalQuestions = 0

    for (let modIdx = 0; modIdx < modulesData.length; modIdx++) {
      const moduleData = modulesData[modIdx]

      const newModule = await withRetry(() => prisma.module.create({
        data: {
          title: moduleData.title,
          courseId: course.id,
          order: modIdx,
          isActive: true,
        }
      }))

      console.log(`📦 Module ${modIdx + 1}: "${moduleData.title}" (${newModule.id})`)

      for (let lessIdx = 0; lessIdx < moduleData.lessons.length; lessIdx++) {
        const lessonData = moduleData.lessons[lessIdx]

        const isLastLesson = lessIdx === moduleData.lessons.length - 1
        const xpReward = isLastLesson ? 30 : 15 + Math.floor(Math.random() * 10)
        const gemReward = isLastLesson ? 4 : 1 + Math.floor(Math.random() * 2)

        const newLesson = await withRetry(() => prisma.lesson.create({
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
        }))

        totalLessons++

        const questionsToCreate = lessonData.questions.map((q: any, idx: number) => {
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

        const batchSize = 50
        for (let i = 0; i < questionsToCreate.length; i += batchSize) {
          const batch = questionsToCreate.slice(i, i + batchSize)
          await withRetry(() => prisma.question.createMany({ data: batch }))
        }

        totalQuestions += questionsToCreate.length

        console.log(`  📝 Lesson ${lessIdx + 1}: "${lessonData.title}" - ${questionsToCreate.length} questions`)
      }

      console.log(`  ✅ Module ${modIdx + 1} complete\n`)

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('=========================================')
    console.log('🎉 English B1 Course Seed Complete!')
    console.log('=========================================')
    console.log(`📚 Course: ${course.title}`)
    console.log(`📦 Modules: ${modulesData.length}`)
    console.log(`📝 Lessons: ${totalLessons}`)
    console.log(`❓ Questions: ${totalQuestions}`)
    console.log(`🆔 Course ID: ${course.id}`)
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding English B1 course:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnglishB1()
