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
  title: "English B2 - Upper Intermediate",
  description: "Master upper-intermediate English with advanced grammar, sophisticated vocabulary, and real-world communication skills. Covers all CEFR B2 competencies including mixed conditionals, modal verbs, passive voice, reported speech, phrasal verbs, and more.",
  difficulty: "UPPER_INTERMEDIATE",
  minimumLevel: "B2",
  isFree: true,
  isPremium: false,
  cutoffScore: 70,
  status: "PUBLISHED",
  icon: "🚀",
  color: "#059669",
}

const modulesData = [
  {
    title: "Mixed Conditionals & Advanced Hypotheticals",
    lessons: [
      {
        title: "Mixed Conditionals: Past → Present",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If I had studied harder at school, I ___ a better job now.'", options: ["would have", "would have had", "would have been having", "will have"], correctAnswer: "0", explanation: "Mixed conditional: past condition (had studied) → present result (would have). 'I would have' = I would now have." },
          { type: "MCQ", question: "'If she hadn't moved to London, she ___ us every weekend.'", options: ["would visit", "would have visited", "would be visiting", "will visit"], correctAnswer: "0", explanation: "Past condition (hadn't moved) → present habitual result (would visit now)." },
          { type: "MCQ", question: "'If he had taken that job, he ___ in New York right now.'", options: ["would be living", "would have lived", "will be living", "lived"], correctAnswer: "0", explanation: "Past decision → present ongoing situation. 'Would be living' = currently living there." },
          { type: "MCQ", question: "What structure does a mixed conditional (past→present) use?", options: ["If + past perfect, would + base verb", "If + past simple, would + base verb", "If + past perfect, would have + past participle", "If + present simple, will + base verb"], correctAnswer: "0", explanation: "Past→present mixed: If + past perfect (past condition), would + base verb (present result)." },
          { type: "TRUE_FALSE", question: "True or False: 'If I had accepted the offer, I would be working at Google now' is a mixed conditional.", correctAnswer: "true", explanation: "Past condition (had accepted) → present result (would be working now)." },
          { type: "TRUE_FALSE", question: "True or False: 'If she had left earlier, she would have caught the train' is a mixed conditional.", correctAnswer: "false", explanation: "This is a third conditional (past→past), not mixed. Both parts refer to the past." },
          { type: "FILL_BLANK", question: "Complete: If I hadn't spent all my money, I ___ (can) afford that trip now.", correctAnswer: "could", explanation: "Mixed conditional: past spending → present ability. 'Could' = would be able to now." },
          { type: "FILL_BLANK", question: "Complete: If they had invested in Bitcoin, they ___ (be) millionaires today.", correctAnswer: "would be", explanation: "Past investment decision → present wealth status." },
          { type: "FILL_BLANK", question: "Complete: If you had listened to me, you ___ (not/be) in this mess.", correctAnswer: "wouldn't be", explanation: "Past advice not followed → present problematic situation." },
          { type: "MATCHING", question: "Match the condition with its result:", options: [{ left: "If I had learned French", right: "I would work in Paris now" }, { left: "If she hadn't missed the flight", right: "She would be here today" }, { left: "If we had bought that house", right: "It would be worth millions" }, { left: "If he had studied medicine", right: "He would be a doctor" }], correctAnswer: "[0,1,2,3]", explanation: "Each pairs a past condition with a present result." },
          { type: "CHECKBOX", question: "Select all mixed conditionals (past→present):", options: ["If I had trained harder, I would be on the team now", "If she had called, I would have answered", "If they had saved money, they could buy a car", "If he had practiced, he would play better now"], correctAnswer: "[0,2,3]", explanation: "'Would have answered' is third conditional (past→past). The others show past conditions with present results." },
          { type: "ORDERING", question: "Put in order: had / if / I / money / saved / would / I / a house / buy / some / now", correctAnswer: "If I had saved some money,I would buy a house now", explanation: "Past condition (had saved) → present result (would buy now)." },
          { type: "SPEECH", question: "If I had been more careful, I wouldn't be in this difficult situation now.", correctAnswer: "If I had been more careful, I wouldn't be in this difficult situation now.", language: "en", hint: "Express regret about a past action affecting the present" },
          { type: "SPEECH", question: "If she had accepted that scholarship, she would be studying abroad right now.", correctAnswer: "If she had accepted that scholarship, she would be studying abroad right now.", language: "en", hint: "Talk about a missed opportunity with present consequences" },
        ]
      },
      {
        title: "Mixed Conditionals: Present → Past",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If I were more organized, I ___ that deadline yesterday.'", options: ["would have met", "would meet", "will meet", "met"], correctAnswer: "0", explanation: "Mixed conditional: present trait (were organized) → past result (would have met)." },
          { type: "MCQ", question: "'If she spoke better English, she ___ the interview last week.'", options: ["would have passed", "would pass", "will pass", "passes"], correctAnswer: "0", explanation: "Present ability (spoke better) → past outcome (would have passed)." },
          { type: "MCQ", question: "'If he weren't so shy, he ___ to her at the party.'", options: ["would have talked", "would talk", "will talk", "talked"], correctAnswer: "0", explanation: "Present characteristic (weren't shy) → past action (would have talked)." },
          { type: "MCQ", question: "What structure does a mixed conditional (present→past) use?", options: ["If + past simple, would have + past participle", "If + past perfect, would + base verb", "If + past simple, would + base verb", "If + present simple, will + base verb"], correctAnswer: "0", explanation: "Present→past mixed: If + past simple (present unreal), would have + past participle (past result)." },
          { type: "TRUE_FALSE", question: "True or False: 'If I were taller, I would have joined the basketball team' mixes present and past.", correctAnswer: "true", explanation: "Present trait (were taller) → past opportunity (would have joined)." },
          { type: "TRUE_FALSE", question: "True or False: 'If I had known, I would tell you' is grammatically correct.", correctAnswer: "false", explanation: "Should be 'If I had known, I would have told you' (third conditional) or 'If I knew, I would tell you' (second conditional)." },
          { type: "FILL_BLANK", question: "Complete: If I weren't afraid of flying, I ___ (travel) to Japan last year.", correctAnswer: "would have traveled", explanation: "Present fear → past missed trip." },
          { type: "FILL_BLANK", question: "Complete: If he were more confident, he ___ (ask) for a raise last month.", correctAnswer: "would have asked", explanation: "Present trait → past missed opportunity." },
          { type: "FILL_BLANK", question: "Complete: If we lived closer, we ___ (visit) you more often last winter.", correctAnswer: "would have visited", explanation: "Present location → past frequency of visits." },
          { type: "MATCHING", question: "Match the present condition with its past result:", options: [{ left: "If I knew the answer", right: "I would have told you" }, { left: "If she were more careful", right: "She wouldn't have made that mistake" }, { left: "If they had more time", right: "They would have finished" }, { left: "If he weren't so busy", right: "He would have helped us" }], correctAnswer: "[0,1,2,3]", explanation: "Each pairs a present unreal condition with a past hypothetical result." },
          { type: "CHECKBOX", question: "Select all present→past mixed conditionals:", options: ["If I were smarter, I would have solved that puzzle", "If she had studied, she would pass the test", "If he weren't lazy, he would have gotten the job", "If they were richer, they would have bought that yacht"], correctAnswer: "[0,2,3]", explanation: "'Would pass' is second conditional (present→present). The others show present conditions affecting past outcomes." },
          { type: "ORDERING", question: "Put in order: if / I / more / careful / were / wouldn't / I / have / broken / the vase", correctAnswer: "If I were more careful,I wouldn't have broken the vase", explanation: "Present trait (were more careful) → past result (wouldn't have broken)." },
          { type: "SPEECH", question: "If I were better at math, I would have become an engineer.", correctAnswer: "If I were better at math, I would have become an engineer.", language: "en", hint: "Talk about how a present trait would have changed your past" },
          { type: "SPEECH", question: "If she weren't so stubborn, she would have apologized last night.", correctAnswer: "If she weren't so stubborn, she would have apologized last night.", language: "en", hint: "Describe how someone's personality prevented a past action" },
        ]
      },
      {
        title: "Unless, Provided That & As Long As",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You won't succeed ___ you work hard.'", options: ["unless", "if", "provided that", "when"], correctAnswer: "0", explanation: "'Unless' = 'if not': 'You won't succeed if you don't work hard.'" },
          { type: "MCQ", question: "'I'll lend you the money ___ you pay me back next month.'", options: ["provided that", "unless", "until", "except"], correctAnswer: "0", explanation: "'Provided that' = 'on the condition that'." },
          { type: "MCQ", question: "'You can borrow my car ___ you drive carefully.'", options: ["as long as", "unless", "until", "except if"], correctAnswer: "0", explanation: "'As long as' = 'on the condition that' (similar to 'provided that')." },
          { type: "MCQ", question: "Which is NOT a conditional connector?", options: ["although", "unless", "provided that", "as long as"], correctAnswer: "0", explanation: "'Although' is a contrast connector, not a conditional." },
          { type: "TRUE_FALSE", question: "True or False: 'Unless' and 'if not' mean the same thing.", correctAnswer: "true", explanation: "'Unless you study' = 'If you don't study'." },
          { type: "TRUE_FALSE", question: "True or False: 'I'll go unless it rains' means 'I'll go if it doesn't rain.'", correctAnswer: "true", explanation: "'Unless it rains' = 'If it doesn't rain.'" },
          { type: "FILL_BLANK", question: "Complete: You can't enter the building ___ you have a security pass.", correctAnswer: "unless", explanation: "'Unless you have' = 'If you don't have.'" },
          { type: "FILL_BLANK", question: "Complete: I'll support your project ___ it stays within budget.", correctAnswer: "provided that", explanation: "'Provided that' sets a condition for support." },
          { type: "FILL_BLANK", question: "Complete: We'll go hiking tomorrow ___ the weather is good.", correctAnswer: "as long as", explanation: "'As long as' = on the condition that." },
          { type: "MATCHING", question: "Match the connector with its meaning:", options: [{ left: "Unless", right: "If not" }, { left: "Provided that", right: "On the condition that" }, { left: "As long as", right: "On the condition that" }, { left: "In case", right: "As a precaution" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector expresses a different conditional relationship." },
          { type: "CHECKBOX", question: "Select all sentences using conditional connectors correctly:", options: ["You can't pass unless you study", "I'll help provided that you try first", "You can stay as long as you're quiet", "Unless you hurry, you'll be late"], correctAnswer: "[0,1,2,3]", explanation: "All four use conditional connectors correctly." },
          { type: "ORDERING", question: "Put in order: you / succeed / won't / unless / try", correctAnswer: "You won't succeed,unless you try", explanation: "'Unless' introduces the negative condition." },
          { type: "SPEECH", question: "I won't accept this job unless they offer a better salary.", correctAnswer: "I won't accept this job unless they offer a better salary.", language: "en", hint: "State a condition for accepting something" },
          { type: "SPEECH", question: "You can use my laptop as long as you take care of it.", correctAnswer: "You can use my laptop as long as you take care of it.", language: "en", hint: "Give permission with a condition" },
        ]
      },
      {
        title: "Wish & If Only for Regrets",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I wish I ___ harder at school.' (past regret)", options: ["had studied", "studied", "study", "would study"], correctAnswer: "0", explanation: "'Wish + past perfect' expresses regret about the past." },
          { type: "MCQ", question: "'If only I ___ that job offer.' (past)", options: ["had accepted", "accepted", "would accept", "accept"], correctAnswer: "0", explanation: "'If only + past perfect' = strong regret about a past decision." },
          { type: "MCQ", question: "'I wish I ___ speak French fluently.' (present desire)", options: ["could", "can", "will", "would"], correctAnswer: "0", explanation: "'Wish + could' expresses a desire for a present ability." },
          { type: "MCQ", question: "What's the difference between 'I wish I were' and 'I wish I had been'?", options: ["Present unreal vs past regret", "Past unreal vs present regret", "Future vs present", "No difference"], correctAnswer: "0", explanation: "'Were' = present unreal; 'had been' = past regret." },
          { type: "TRUE_FALSE", question: "True or False: 'I wish I would have gone' is grammatically correct.", correctAnswer: "false", explanation: "Should be 'I wish I had gone' (past perfect for past regrets)." },
          { type: "TRUE_FALSE", question: "True or False: 'If only' is stronger than 'I wish.'", correctAnswer: "true", explanation: "'If only' expresses stronger emotion or regret." },
          { type: "FILL_BLANK", question: "Complete: I wish I ___ (not/say) that to her yesterday.", correctAnswer: "hadn't said", explanation: "Past perfect for regret about something said in the past." },
          { type: "FILL_BLANK", question: "Complete: If only we ___ (bring) an umbrella!", correctAnswer: "had brought", explanation: "Past regret about not bringing something." },
          { type: "FILL_BLANK", question: "Complete: I wish I ___ (have) more free time. (present)", correctAnswer: "had", explanation: "Past simple for present unreal desires." },
          { type: "MATCHING", question: "Match the wish with its time reference:", options: [{ left: "I wish I had studied", right: "Past regret" }, { left: "I wish I were richer", right: "Present unreal" }, { left: "I wish it would stop raining", right: "Desire for change" }, { left: "If only I had listened", right: "Strong past regret" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure expresses a different type of wish or regret." },
          { type: "CHECKBOX", question: "Select all correct wish/regret sentences:", options: ["I wish I had studied harder", "If only I hadn't said that", "I wish I were taller", "I wish I would have come earlier"], correctAnswer: "[0,1,2]", explanation: "'Would have come' after 'wish' is wrong; use 'had come'. The others are correct." },
          { type: "ORDERING", question: "Put in order: wish / I / more / had / money / I", correctAnswer: "I wish,I had more money", explanation: "I wish + past simple for present unreal." },
          { type: "SPEECH", question: "I wish I had spent more time with my grandparents when they were alive.", correctAnswer: "I wish I had spent more time with my grandparents when they were alive.", language: "en", hint: "Express a deep regret about the past" },
          { type: "SPEECH", question: "If only I had listened to my parents' advice about saving money.", correctAnswer: "If only I had listened to my parents' advice about saving money.", language: "en", hint: "Express regret about ignoring advice" },
        ]
      },
      {
        title: "Module 1 Review: Mixed Conditionals & Hypotheticals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If she had invested wisely, she ___ rich now.'", options: ["would be", "would have been", "will be", "is"], correctAnswer: "0", explanation: "Mixed conditional: past action → present state. 'Would be' = she would be rich now." },
          { type: "MCQ", question: "'If I were more patient, I ___ that argument yesterday.'", options: ["would have avoided", "would avoid", "will avoid", "avoided"], correctAnswer: "0", explanation: "Present trait → past result. Mixed conditional (present→past)." },
          { type: "MCQ", question: "'You won't improve ___ you practice regularly.'", options: ["unless", "if", "provided that", "when"], correctAnswer: "0", explanation: "'Unless' = 'if not': 'You won't improve if you don't practice.'" },
          { type: "MCQ", question: "'I wish I ___ more time to study.' (present desire)", options: ["had", "have", "would have", "having"], correctAnswer: "0", explanation: "'Wish + past simple' for present unreal desires." },
          { type: "TRUE_FALSE", question: "True or False: 'I wish I had been kinder to her' expresses a past regret.", correctAnswer: "true", explanation: "'Wish + past perfect' = regret about the past." },
          { type: "TRUE_FALSE", question: "True or False: 'As long as' and 'unless' mean the same thing.", correctAnswer: "false", explanation: "'As long as' = on condition; 'unless' = if not. They are different." },
          { type: "FILL_BLANK", question: "Complete: If he hadn't quit his job, he ___ (be) a manager now.", correctAnswer: "would be", explanation: "Mixed conditional: past decision → present position." },
          { type: "FILL_BLANK", question: "Complete: I'll go to the party ___ you come with me.", correctAnswer: "provided that", explanation: "'Provided that' sets a condition for going." },
          { type: "FILL_BLANK", question: "Complete: If only I ___ (study) medicine instead of law.", correctAnswer: "had studied", explanation: "Past regret about a career choice." },
          { type: "MATCHING", question: "Match the structure with its function:", options: [{ left: "If + past perfect, would + base", right: "Mixed (past→present)" }, { left: "If + past simple, would have + pp", right: "Mixed (present→past)" }, { left: "Unless + present", right: "Negative condition" }, { left: "Wish + past perfect", right: "Past regret" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure serves a different hypothetical function." },
          { type: "CHECKBOX", question: "Select all grammatically correct sentences:", options: ["If I had known, I would tell you", "I wish I had traveled more when I was young", "Unless you study, you won't pass", "If she were more confident, she would have spoken up"], correctAnswer: "[1,2,3]", explanation: "'If I had known, I would tell you' is wrong; should be 'would have told' or 'If I knew, I would tell'. The others are correct." },
          { type: "ORDERING", question: "Put in order: if / had / listened / I / to you / I / wouldn't / be / in trouble", correctAnswer: "If I had listened to you,I wouldn't be in trouble", explanation: "Mixed conditional: past advice → present situation." },
          { type: "SPEECH", question: "If I had been more ambitious, I would have started my own business by now.", correctAnswer: "If I had been more ambitious, I would have started my own business by now.", language: "en", hint: "Talk about how a different past would affect the present" },
          { type: "SPEECH", question: "I wish I hadn't wasted so much time on social media last year.", correctAnswer: "I wish I hadn't wasted so much time on social media last year.", language: "en", hint: "Express regret about how you spent time" },
          { type: "SPEECH", question: "You won't achieve your goals unless you're willing to make sacrifices.", correctAnswer: "You won't achieve your goals unless you're willing to make sacrifices.", language: "en", hint: "Give advice using 'unless'" },
        ]
      },
    ]
  },
  {
    title: "Modal Verbs in Depth",
    lessons: [
      {
        title: "Modals of Deduction: Must Have, Can't Have, Might Have",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She's not answering her phone. She ___ asleep.'", options: ["must be", "must have been", "can't be", "might have been"], correctAnswer: "0", explanation: "'Must be' = strong present deduction based on evidence." },
          { type: "MCQ", question: "'He ___ the exam. He didn't study at all.'", options: ["can't have passed", "must have passed", "might have passed", "should have passed"], correctAnswer: "0", explanation: "'Can't have passed' = strong negative deduction about the past." },
          { type: "MCQ", question: "'The ground is wet. It ___ last night.'", options: ["must have rained", "must rain", "can't have rained", "should rain"], correctAnswer: "0", explanation: "'Must have rained' = logical deduction about a past event." },
          { type: "MCQ", question: "Which expresses the strongest certainty?", options: ["must have", "might have", "could have", "may have"], correctAnswer: "0", explanation: "'Must have' expresses the strongest positive deduction." },
          { type: "TRUE_FALSE", question: "True or False: 'She must have left early' expresses certainty about a past action.", correctAnswer: "true", explanation: "'Must have + past participle' = strong deduction about the past." },
          { type: "TRUE_FALSE", question: "True or False: 'He can't have stolen the money' means it's impossible he did.", correctAnswer: "true", explanation: "'Can't have' = strong negative deduction; the speaker believes it's impossible." },
          { type: "FILL_BLANK", question: "Complete: The lights are off. They ___ (go) out already.", correctAnswer: "must have gone", explanation: "Deduction from evidence: lights off → they must have left." },
          { type: "FILL_BLANK", question: "Complete: She ___ (know) about the surprise. Nobody told her.", correctAnswer: "can't have known", explanation: "Negative deduction: nobody told her → she can't have known." },
          { type: "FILL_BLANK", question: "Complete: He ___ (take) the wrong bus. He's very late.", correctAnswer: "might have taken", explanation: "Possibility deduction: less certain than 'must have'." },
          { type: "MATCHING", question: "Match the modal with its certainty level:", options: [{ left: "Must have", right: "Very certain (90%+)" }, { left: "Can't have", right: "Very certain it didn't happen" }, { left: "Might have", right: "Possible (30-50%)" }, { left: "Could have", right: "Possible (30-50%)" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal expresses a different degree of certainty." },
          { type: "CHECKBOX", question: "Select all correct deductions:", options: ["She must have forgotten about the meeting", "He can't have driven there; his car is broken", "They might have missed the train", "She must to have left early"], correctAnswer: "[0,1,2]", explanation: "'Must to have' is wrong; modals don't take 'to'. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / the / she / have / forgotten / password", correctAnswer: "She,must have forgotten,the password", explanation: "Subject + must have + past participle." },
          { type: "SPEECH", question: "He must have studied really hard to get such a high score.", correctAnswer: "He must have studied really hard to get such a high score.", language: "en", hint: "Deduce someone's effort from their result" },
          { type: "SPEECH", question: "She can't have said that! She's much too polite.", correctAnswer: "She can't have said that! She's much too polite.", language: "en", hint: "Express strong disbelief about something someone said" },
        ]
      },
      {
        title: "Modals of Obligation & Necessity",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You ___ wear a seatbelt. It's the law.'", options: ["must", "might", "could", "would"], correctAnswer: "0", explanation: "'Must' = strong obligation, often from rules or laws." },
          { type: "MCQ", question: "'You ___ come if you don't want to.'", options: ["don't have to", "mustn't", "can't", "shouldn't"], correctAnswer: "0", explanation: "'Don't have to' = no obligation. 'Mustn't' = prohibition (different meaning)." },
          { type: "MCQ", question: "'You ___ smoke in this building.'", options: ["mustn't", "don't have to", "needn't", "haven't to"], correctAnswer: "0", explanation: "'Mustn't' = prohibition; it's forbidden." },
          { type: "MCQ", question: "What's the difference between 'mustn't' and 'don't have to'?", options: ["Prohibition vs no obligation", "No obligation vs prohibition", "Advice vs obligation", "Past vs present"], correctAnswer: "0", explanation: "'Mustn't' = you are forbidden. 'Don't have to' = it's not necessary." },
          { type: "TRUE_FALSE", question: "True or False: 'You needn't have brought anything' means it was unnecessary.", correctAnswer: "true", explanation: "'Needn't have + past participle' = you did it, but it wasn't necessary." },
          { type: "TRUE_FALSE", question: "True or False: 'You didn't need to come' means you came but it wasn't necessary.", correctAnswer: "false", explanation: "'Didn't need to' = it wasn't necessary, and we don't know if you came. 'Needn't have' = you came unnecessarily." },
          { type: "FILL_BLANK", question: "Complete: Students ___ (wear) uniforms at this school.", correctAnswer: "must wear", explanation: "Strong obligation from school rules." },
          { type: "FILL_BLANK", question: "Complete: You ___ (not/pay) for this. It's free.", correctAnswer: "don't have to pay", explanation: "No obligation: it's not necessary to pay." },
          { type: "FILL_BLANK", question: "Complete: I ___ (buy) more groceries, but I did anyway.", correctAnswer: "needn't have bought", explanation: "'Needn't have' = I did it unnecessarily." },
          { type: "MATCHING", question: "Match the modal with its meaning:", options: [{ left: "Must", right: "Strong obligation" }, { left: "Mustn't", right: "Prohibition" }, { left: "Don't have to", right: "No obligation" }, { left: "Needn't have", right: "Unnecessary action done" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal expresses a different type of obligation or necessity." },
          { type: "CHECKBOX", question: "Select all correct obligation sentences:", options: ["You must wear a helmet", "You don't have to finish today", "You mustn't park here", "You must to sign this form"], correctAnswer: "[0,1,2]", explanation: "'Must to sign' is wrong; modals don't take 'to'. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / all / passengers / fasten / seatbelts / their", correctAnswer: "All passengers,must fasten,their seatbelts", explanation: "Subject + must + verb + object." },
          { type: "SPEECH", question: "You must submit your application before the deadline.", correctAnswer: "You must submit your application before the deadline.", language: "en", hint: "State a strong requirement or deadline" },
          { type: "SPEECH", question: "You needn't have bought me a gift, but thank you so much!", correctAnswer: "You needn't have bought me a gift, but thank you so much!", language: "en", hint: "Express gratitude for an unnecessary but kind gesture" },
        ]
      },
      {
        title: "Modals of Advice & Criticism",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'You ___ see a doctor about that cough.'", options: ["should", "must", "will", "can"], correctAnswer: "0", explanation: "'Should' = advice or recommendation." },
          { type: "MCQ", question: "'You ___ have told me earlier! Now it's too late.'", options: ["should", "would", "could", "might"], correctAnswer: "0", explanation: "'Should have' = criticism about a past action that didn't happen." },
          { type: "MCQ", question: "'You ___ try the chocolate cake. It's delicious!'", options: ["ought to", "mustn't", "can't", "needn't"], correctAnswer: "0", explanation: "'Ought to' = advice (similar to 'should')." },
          { type: "MCQ", question: "What's the difference between 'should' and 'should have'?", options: ["Present advice vs past criticism", "Past advice vs present criticism", "Future vs present", "No difference"], correctAnswer: "0", explanation: "'Should' = present/future advice. 'Should have' = past criticism." },
          { type: "TRUE_FALSE", question: "True or False: 'You ought to have apologized' is a criticism about the past.", correctAnswer: "true", explanation: "'Ought to have + past participle' = criticism about something not done." },
          { type: "TRUE_FALSE", question: "True or False: 'You should have called me' means the person did call.", correctAnswer: "false", explanation: "'Should have called' = the person did NOT call (criticism)." },
          { type: "FILL_BLANK", question: "Complete: You ___ (study) harder for the exam. Now you've failed.", correctAnswer: "should have studied", explanation: "Past criticism: you didn't study enough." },
          { type: "FILL_BLANK", question: "Complete: You ___ (tell) the truth instead of lying.", correctAnswer: "ought to have told", explanation: "Past criticism using 'ought to have'." },
          { type: "FILL_BLANK", question: "Complete: You ___ (not/eat) so much junk food. (advice)", correctAnswer: "shouldn't eat", explanation: "Present advice about a habit." },
          { type: "MATCHING", question: "Match the modal with its function:", options: [{ left: "Should", right: "Present advice" }, { left: "Should have", right: "Past criticism" }, { left: "Ought to", right: "Formal advice" }, { left: "Ought to have", right: "Past criticism (formal)" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal form serves a different advisory function." },
          { type: "CHECKBOX", question: "Select all correct advice/criticism sentences:", options: ["You should have warned me earlier", "You ought to see a specialist", "You should to be more careful", "You shouldn't have said that to her"], correctAnswer: "[0,1,3]", explanation: "'Should to be' is wrong; no 'to' after modals. The others are correct." },
          { type: "ORDERING", question: "Put in order: should / you / more / exercise / regularly", correctAnswer: "You,should exercise,more regularly", explanation: "Subject + should + verb + adverb." },
          { type: "SPEECH", question: "You should have asked for help instead of struggling alone.", correctAnswer: "You should have asked for help instead of struggling alone.", language: "en", hint: "Criticize someone for not asking for help" },
          { type: "SPEECH", question: "You ought to think about your future before making this decision.", correctAnswer: "You ought to think about your future before making this decision.", language: "en", hint: "Give formal advice about considering consequences" },
        ]
      },
      {
        title: "Modals of Ability: Was/Were Able To, Managed To",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I ___ finish the project on time despite the difficulties.'", options: ["managed to", "was able to", "could", "both A and B"], correctAnswer: "3", explanation: "Both 'managed to' and 'was able to' work for specific past achievements. 'Could' is for general ability." },
          { type: "MCQ", question: "'When I was young, I ___ run very fast.'", options: ["could", "managed to", "was able to", "had been able to"], correctAnswer: "0", explanation: "'Could' for general past ability. 'Managed to' implies difficulty." },
          { type: "MCQ", question: "'She ___ escape from the burning building.'", options: ["managed to", "could", "was able to", "both A and C"], correctAnswer: "3", explanation: "Both 'managed to' and 'was able to' work for specific past events. 'Could' is less natural for one-time events." },
          { type: "MCQ", question: "When should you use 'managed to' instead of 'could'?", options: ["For a specific difficult achievement", "For general ability", "For future ability", "For present ability"], correctAnswer: "0", explanation: "'Managed to' emphasizes overcoming difficulty in a specific situation." },
          { type: "TRUE_FALSE", question: "True or False: 'I could swim when I was five' describes a general ability.", correctAnswer: "true", explanation: "'Could' + verb = general ability in the past." },
          { type: "TRUE_FALSE", question: "True or False: 'He could open the safe' is the best way to describe a one-time achievement.", correctAnswer: "false", explanation: "'Managed to open' or 'was able to open' is better for a specific achievement. 'Could' is for general ability." },
          { type: "FILL_BLANK", question: "Complete: After hours of trying, I ___ (fix) the computer.", correctAnswer: "managed to fix", explanation: "Emphasizes difficulty and eventual success." },
          { type: "FILL_BLANK", question: "Complete: My grandmother ___ (speak) five languages fluently.", correctAnswer: "could speak", explanation: "General ability over a period of time." },
          { type: "FILL_BLANK", question: "Complete: Despite the storm, they ___ (reach) the summit.", correctAnswer: "managed to reach", explanation: "Specific achievement despite difficulty." },
          { type: "MATCHING", question: "Match the modal with its use:", options: [{ left: "Could", right: "General past ability" }, { left: "Managed to", right: "Specific achievement with difficulty" }, { left: "Was able to", right: "Specific achievement" }, { left: "Couldn't", right: "General inability" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal form expresses a different type of ability." },
          { type: "CHECKBOX", question: "Select all correct ability sentences:", options: ["I could read when I was four", "She managed to solve the puzzle", "He was able to find the answer", "They could win the match yesterday"], correctAnswer: "[0,1,2]", explanation: "'Could win the match yesterday' is wrong for a specific event; use 'managed to' or 'were able to'. The others are correct." },
          { type: "ORDERING", question: "Put in order: managed / after / she / the / to find / search / keys", correctAnswer: "She,managed to find the keys,after the search", explanation: "Subject + managed to + verb + object." },
          { type: "SPEECH", question: "I was able to negotiate a better deal after hours of discussion.", correctAnswer: "I was able to negotiate a better deal after hours of discussion.", language: "en", hint: "Describe successfully achieving something difficult" },
          { type: "SPEECH", question: "Even though he was injured, he managed to finish the marathon.", correctAnswer: "Even though he was injured, he managed to finish the marathon.", language: "en", hint: "Describe overcoming an obstacle to achieve something" },
        ]
      },
      {
        title: "Module 2 Review: Modal Verbs in Depth",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The package has arrived. It ___ from my sister.'", options: ["must be", "can't be", "might have been", "should be"], correctAnswer: "0", explanation: "'Must be' = strong deduction from evidence (package arrived)." },
          { type: "MCQ", question: "'You ___ have locked the door. Now someone broke in!'", options: ["should", "must", "can't", "might"], correctAnswer: "0", explanation: "'Should have locked' = criticism about not doing something necessary." },
          { type: "MCQ", question: "'You ___ wear a tie to the interview, but it's recommended.'", options: ["don't have to", "mustn't", "can't", "shouldn't"], correctAnswer: "0", explanation: "'Don't have to' = not obligatory (but still a good idea)." },
          { type: "MCQ", question: "'Despite the heavy rain, we ___ get home before midnight.'", options: ["managed to", "could", "should", "might"], correctAnswer: "0", explanation: "'Managed to' = succeeded in doing something difficult." },
          { type: "TRUE_FALSE", question: "True or False: 'He mustn't have seen us' is a correct deduction.", correctAnswer: "false", explanation: "For deductions, use 'can't have seen' (negative). 'Mustn't have' is not standard for deduction." },
          { type: "TRUE_FALSE", question: "True or False: 'You needn't have worried' means the worry was unnecessary.", correctAnswer: "true", explanation: "'Needn't have' = you did something that wasn't necessary." },
          { type: "FILL_BLANK", question: "Complete: She ___ (be) exhausted after running the marathon.", correctAnswer: "must be", explanation: "Strong deduction from the situation." },
          { type: "FILL_BLANK", question: "Complete: You ___ (not/work) so hard. You're burning out.", correctAnswer: "shouldn't work", explanation: "Advice about a current habit." },
          { type: "FILL_BLANK", question: "Complete: After three attempts, he ___ (pass) the driving test.", correctAnswer: "managed to pass", explanation: "Specific achievement after difficulty." },
          { type: "MATCHING", question: "Match the modal with its category:", options: [{ left: "Must have", right: "Deduction (past)" }, { left: "Should have", right: "Criticism (past)" }, { left: "Don't have to", right: "No obligation" }, { left: "Managed to", right: "Achievement" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal belongs to a different functional category." },
          { type: "CHECKBOX", question: "Select all correct modal sentences:", options: ["You should have told me sooner", "She must be at home; her car is here", "You mustn't touch that wire", "He could to swim when he was young"], correctAnswer: "[0,1,2]", explanation: "'Could to swim' is wrong; no 'to' after modals. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / she / the / have / lost / keys", correctAnswer: "She,must have lost,the keys", explanation: "Subject + must have + past participle + object." },
          { type: "SPEECH", question: "You must have been thrilled when you heard the good news!", correctAnswer: "You must have been thrilled when you heard the good news!", language: "en", hint: "Deduce someone's emotional reaction" },
          { type: "SPEECH", question: "You shouldn't have spent all your savings on that car.", correctAnswer: "You shouldn't have spent all your savings on that car.", language: "en", hint: "Criticize someone's financial decision" },
          { type: "SPEECH", question: "You needn't have come all this way just to deliver the message.", correctAnswer: "You needn't have come all this way just to deliver the message.", language: "en", hint: "Say someone did something unnecessarily" },
        ]
      },
    ]
  },
  {
    title: "Passive Voice Advanced",
    lessons: [
      {
        title: "All Passive Tenses Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The building ___ at the moment.'", options: ["is being renovated", "is renovated", "was renovated", "has been renovated"], correctAnswer: "0", explanation: "Present continuous passive: is/are + being + past participle." },
          { type: "MCQ", question: "'The report ___ by tomorrow.'", options: ["will have been completed", "is completed", "was completed", "has completed"], correctAnswer: "0", explanation: "Future perfect passive: will have been + past participle." },
          { type: "MCQ", question: "'English ___ in many countries.'", options: ["is spoken", "speaks", "is speaking", "has spoken"], correctAnswer: "0", explanation: "Present simple passive for general facts." },
          { type: "MCQ", question: "Which is NOT a passive form?", options: ["She has been working", "It was built", "The cake was eaten", "The letter is being written"], correctAnswer: "0", explanation: "'Has been working' is present perfect continuous active, not passive." },
          { type: "TRUE_FALSE", question: "True or False: 'The movie is being directed by Spielberg' is present continuous passive.", correctAnswer: "true", explanation: "Is/are + being + past participle = present continuous passive." },
          { type: "TRUE_FALSE", question: "True or False: 'The book has been read by millions' is present perfect passive.", correctAnswer: "true", explanation: "Has/have + been + past participle = present perfect passive." },
          { type: "FILL_BLANK", question: "Complete: The new bridge ___ (construct) right now.", correctAnswer: "is being constructed", explanation: "Present continuous passive for ongoing action." },
          { type: "FILL_BLANK", question: "Complete: The documents ___ (sign) before the meeting starts.", correctAnswer: "will have been signed", explanation: "Future perfect passive for completion before a future time." },
          { type: "FILL_BLANK", question: "Complete: The letter ___ (send) yesterday.", correctAnswer: "was sent", explanation: "Past simple passive for completed past action." },
          { type: "MATCHING", question: "Match the tense with its passive form:", options: [{ left: "Present simple", right: "is/are + past participle" }, { left: "Past continuous", right: "was/were + being + pp" }, { left: "Present perfect", right: "has/have + been + pp" }, { left: "Future simple", right: "will be + pp" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense has a specific passive construction." },
          { type: "CHECKBOX", question: "Select all correct passive sentences:", options: ["The cake was baked by my mom", "English is spoken worldwide", "The project is being reviewed", "The car has been washing"], correctAnswer: "[0,1,2]", explanation: "'Has been washing' is active, not passive. Should be 'has been washed'. The others are correct." },
          { type: "ORDERING", question: "Put in order: been / the / has / project / approved", correctAnswer: "The project,has been approved", explanation: "Subject + has been + past participle." },
          { type: "SPEECH", question: "The new hospital is being built on the outskirts of the city.", correctAnswer: "The new hospital is being built on the outskirts of the city.", language: "en", hint: "Describe an ongoing construction project" },
          { type: "SPEECH", question: "All the tickets had been sold out before we even arrived.", correctAnswer: "All the tickets had been sold out before we even arrived.", language: "en", hint: "Describe something that was already completed" },
        ]
      },
      {
        title: "Passive with Modals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The work ___ by Friday.'", options: ["must be completed", "must complete", "must completing", "must been completed"], correctAnswer: "0", explanation: "Modal passive: modal + be + past participle." },
          { type: "MCQ", question: "'This information ___ to anyone.'", options: ["should not be revealed", "should not reveal", "should not revealing", "should not been revealed"], correctAnswer: "0", explanation: "Modal + not + be + past participle for negative passive." },
          { type: "MCQ", question: "'The package ___ delivered today.'", options: ["might be", "might been", "might being", "might is"], correctAnswer: "0", explanation: "Modal + be + past participle for passive possibility." },
          { type: "MCQ", question: "Which is correct for past modal passive?", options: ["should have been done", "should have done", "should been done", "should have being done"], correctAnswer: "0", explanation: "Modal + have + been + past participle = past modal passive." },
          { type: "TRUE_FALSE", question: "True or False: 'The rules must be followed' uses a modal passive.", correctAnswer: "true", explanation: "Must + be + followed = modal passive for obligation." },
          { type: "TRUE_FALSE", question: "True or False: 'The problem can solve' is correct passive.", correctAnswer: "false", explanation: "Should be 'The problem can be solved' (modal + be + past participle)." },
          { type: "FILL_BLANK", question: "Complete: The results ___ (announce) tomorrow.", correctAnswer: "will be announced", explanation: "Future modal passive: will + be + past participle." },
          { type: "FILL_BLANK", question: "Complete: This door ___ (not/open) without a key.", correctAnswer: "cannot be opened", explanation: "Negative modal passive: cannot + be + past participle." },
          { type: "FILL_BLANK", question: "Complete: The mistake ___ (correct) earlier.", correctAnswer: "should have been corrected", explanation: "Past modal passive for criticism: should + have + been + past participle." },
          { type: "MATCHING", question: "Match the modal passive:", options: [{ left: "Must be done", right: "Obligation" }, { left: "Can be done", right: "Possibility/ability" }, { left: "Should have been done", right: "Past criticism" }, { left: "Might be done", right: "Uncertainty" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal passive expresses a different modality." },
          { type: "CHECKBOX", question: "Select all correct modal passive sentences:", options: ["The letter must be sent today", "The cake can be eaten now", "The report should have been finished", "The problem must been solved"], correctAnswer: "[0,1,2]", explanation: "'Must been solved' is wrong; needs 'have': 'must have been solved'. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / be / submitted / the / application / by Friday", correctAnswer: "The application,must be submitted,by Friday", explanation: "Subject + modal + be + past participle." },
          { type: "SPEECH", question: "The decision should have been made after careful consideration.", correctAnswer: "The decision should have been made after careful consideration.", language: "en", hint: "Criticize a decision that wasn't made properly" },
          { type: "SPEECH", question: "These documents must be kept confidential at all times.", correctAnswer: "These documents must be kept confidential at all times.", language: "en", hint: "State a strict requirement about confidentiality" },
        ]
      },
      {
        title: "Passive with Reporting Verbs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'He ___ to be the best doctor in the country.'", options: ["is said", "says", "is saying", "said"], correctAnswer: "0", explanation: "'Is said to' = passive reporting structure: people say that he is." },
          { type: "MCQ", question: "'The painting ___ to be worth millions.'", options: ["is believed", "believes", "is believing", "believed"], correctAnswer: "0", explanation: "'Is believed to' = passive: people believe that it is." },
          { type: "MCQ", question: "'She ___ to have won the competition.'", options: ["is reported", "reports", "is reporting", "reported"], correctAnswer: "0", explanation: "'Is reported to have' = passive reporting about a past event." },
          { type: "MCQ", question: "What's the difference between 'is said to be' and 'is said to have been'?", options: ["Present vs past reference", "Past vs present reference", "Future vs present", "No difference"], correctAnswer: "0", explanation: "'Is said to be' = present; 'is said to have been' = past." },
          { type: "TRUE_FALSE", question: "True or False: 'It is expected that the meeting will start on time' can become 'The meeting is expected to start on time.'", correctAnswer: "true", explanation: "Both structures are valid passive reporting forms." },
          { type: "TRUE_FALSE", question: "True or False: 'He is thought to be innocent' means people think he's innocent.", correctAnswer: "true", explanation: "'Is thought to be' = passive reporting of general opinion." },
          { type: "FILL_BLANK", question: "Complete: The suspect ___ (know) to be dangerous.", correctAnswer: "is known", explanation: "'Is known to be' = people know that he is." },
          { type: "FILL_BLANK", question: "Complete: The company ___ (expect) to announce profits next week.", correctAnswer: "is expected", explanation: "'Is expected to' = people expect that it will." },
          { type: "FILL_BLANK", question: "Complete: The ancient city ___ (believe) to have been destroyed by an earthquake.", correctAnswer: "is believed", explanation: "'Is believed to have been' = passive reporting about a past event." },
          { type: "MATCHING", question: "Match the reporting verb with its use:", options: [{ left: "Is said to", right: "General opinion/rumor" }, { left: "Is believed to", right: "Belief/opinion" }, { left: "Is reported to", right: "News/media report" }, { left: "Is expected to", right: "Prediction/expectation" }], correctAnswer: "[0,1,2,3]", explanation: "Each reporting verb has a specific communicative function." },
          { type: "CHECKBOX", question: "Select all correct passive reporting sentences:", options: ["He is said to be a genius", "The building is believed to be over 100 years old", "She is reported to have left the country", "They are thought to being the best team"], correctAnswer: "[0,1,2]", explanation: "'Are thought to being' is wrong; should be 'are thought to be'. The others are correct." },
          { type: "ORDERING", question: "Put in order: is / the / expected / to arrive / train / at noon", correctAnswer: "The train,is expected to arrive,at noon", explanation: "Subject + is expected to + verb." },
          { type: "SPEECH", question: "The painting is thought to be one of the most valuable in the world.", correctAnswer: "The painting is thought to be one of the most valuable in the world.", language: "en", hint: "Report general opinion about something valuable" },
          { type: "SPEECH", question: "He is said to have spent millions on his new house.", correctAnswer: "He is said to have spent millions on his new house.", language: "en", hint: "Report a rumor about someone's spending" },
        ]
      },
      {
        title: "Causative: Have/Get Something Done",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I ___ my hair ___ yesterday.'", options: ["had, cut", "had, cutted", "have, cut", "had, cutting"], correctAnswer: "0", explanation: "Causative: had + object + past participle = someone else did it for me." },
          { type: "MCQ", question: "'We're ___ the house ___ next month.'", options: ["having, painted", "having, paint", "have, painted", "having, painting"], correctAnswer: "0", explanation: "Present continuous causative: having + object + past participle." },
          { type: "MCQ", question: "'She needs to ___ her car ___.", options: ["get, repaired", "get, repair", "got, repaired", "getting, repaired"], correctAnswer: "0", explanation: "'Get + object + past participle' = informal causative." },
          { type: "MCQ", question: "What's the difference between 'I cut my hair' and 'I had my hair cut'?", options: ["I did it myself vs someone did it", "Someone did it vs I did it myself", "Past vs present", "No difference"], correctAnswer: "0", explanation: "'I cut my hair' = I did it. 'I had my hair cut' = someone else did it." },
          { type: "TRUE_FALSE", question: "True or False: 'I got my phone repaired' means someone else repaired it.", correctAnswer: "true", explanation: "'Get + object + past participle' = causative (someone else did it)." },
          { type: "TRUE_FALSE", question: "True or False: 'She had her dress designed' means she designed it herself.", correctAnswer: "false", explanation: "'Had her dress designed' = someone else designed it for her." },
          { type: "FILL_BLANK", question: "Complete: I need to ___ my eyes ___ (test).", correctAnswer: "have, tested", explanation: "Causative: have + object + past participle." },
          { type: "FILL_BLANK", question: "Complete: They ___ their wedding photos ___ by a professional.", correctAnswer: "had, taken", explanation: "Past causative: had + object + past participle." },
          { type: "FILL_BLANK", question: "Complete: How much did it cost to ___ your roof ___ (replace)?", correctAnswer: "have, replaced", explanation: "Causative in a question about cost." },
          { type: "MATCHING", question: "Match the causative with its meaning:", options: [{ left: "I had my car washed", right: "Someone washed it for me" }, { left: "She got her nails done", right: "Someone did her nails" }, { left: "We're having the kitchen renovated", right: "Someone is renovating it" }, { left: "He had his passport stolen", right: "It was stolen from him" }], correctAnswer: "[0,1,2,3]", explanation: "The causative can mean arranging a service or experiencing something negative." },
          { type: "CHECKBOX", question: "Select all correct causative sentences:", options: ["I had my teeth checked last week", "She got her hair colored", "They are having the house painted", "He had his wallet stolen"], correctAnswer: "[0,1,2,3]", explanation: "All four are correct causative constructions." },
          { type: "ORDERING", question: "Put in order: having / we / the / carpet / cleaned", correctAnswer: "We,are having the carpet,cleaned", explanation: "Subject + are having + object + past participle." },
          { type: "SPEECH", question: "I'm going to have my computer fixed tomorrow because it keeps crashing.", correctAnswer: "I'm going to have my computer fixed tomorrow because it keeps crashing.", language: "en", hint: "Talk about arranging a repair service" },
          { type: "SPEECH", question: "She had her portrait painted by a famous artist last year.", correctAnswer: "She had her portrait painted by a famous artist last year.", language: "en", hint: "Describe commissioning artwork" },
        ]
      },
      {
        title: "Module 3 Review: Passive Voice Advanced",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The new law ___ in parliament next week.'", options: ["will be debated", "will debate", "will been debated", "will be debating"], correctAnswer: "0", explanation: "Future passive: will + be + past participle." },
          { type: "MCQ", question: "'The documents ___ before the deadline.'", options: ["must have been submitted", "must have submitted", "must been submitted", "must have being submitted"], correctAnswer: "0", explanation: "Past modal passive: must + have + been + past participle." },
          { type: "MCQ", question: "'The company ___ to be losing money.'", options: ["is reported", "reports", "is reporting", "reported"], correctAnswer: "0", explanation: "'Is reported to be' = passive reporting structure." },
          { type: "MCQ", question: "'I ___ my car ___ last week.'", options: ["had, serviced", "had, service", "have, serviced", "having, serviced"], correctAnswer: "0", explanation: "Causative past: had + object + past participle." },
          { type: "TRUE_FALSE", question: "True or False: 'The project is being completed' is present continuous passive.", correctAnswer: "true", explanation: "Is + being + past participle = present continuous passive." },
          { type: "TRUE_FALSE", question: "True or False: 'She got her phone to repaired' is correct causative.", correctAnswer: "false", explanation: "Should be 'got her phone repaired' (no 'to')." },
          { type: "FILL_BLANK", question: "Complete: The new school ___ (build) at the moment.", correctAnswer: "is being built", explanation: "Present continuous passive for ongoing construction." },
          { type: "FILL_BLANK", question: "Complete: The CEO ___ (know) to be considering retirement.", correctAnswer: "is known", explanation: "Passive reporting: is known to be." },
          { type: "FILL_BLANK", question: "Complete: We ___ our garden ___ last summer. (landscape)", correctAnswer: "had, landscaped", explanation: "Past causative: had + object + past participle." },
          { type: "MATCHING", question: "Match the passive type:", options: [{ left: "Is being built", right: "Present continuous passive" }, { left: "Must be done", right: "Modal passive" }, { left: "Is said to", right: "Reporting passive" }, { left: "Had it done", right: "Causative" }], correctAnswer: "[0,1,2,3]", explanation: "Each represents a different passive construction." },
          { type: "CHECKBOX", question: "Select all correct passive sentences:", options: ["The letter has been sent", "The project must be completed", "He is believed to be guilty", "The cake was baking by my mom"], correctAnswer: "[0,1,2]", explanation: "'Was baking by' is wrong; should be 'was baked by'. The others are correct." },
          { type: "ORDERING", question: "Put in order: been / the / has / decision / announced", correctAnswer: "The decision,has been announced", explanation: "Subject + has been + past participle." },
          { type: "SPEECH", question: "The ancient temple is believed to have been built over 2,000 years ago.", correctAnswer: "The ancient temple is believed to have been built over 2,000 years ago.", language: "en", hint: "Report historical information using passive" },
          { type: "SPEECH", question: "I'm having my eyes tested tomorrow because I've been having headaches.", correctAnswer: "I'm having my eyes tested tomorrow because I've been having headaches.", language: "en", hint: "Talk about arranging a medical appointment" },
          { type: "SPEECH", question: "All the preparations should have been completed by the time the guests arrive.", correctAnswer: "All the preparations should have been completed by the time the guests arrive.", language: "en", hint: "Express expectation about completed preparations" },
        ]
      },
    ]
  },
  {
    title: "Reported Speech & Advanced Reporting Verbs",
    lessons: [
      {
        title: "Complex Reported Speech",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I will definitely call you tomorrow.' → She said she ___ me the next day.", options: ["would definitely call", "will definitely call", "definitely called", "would definitely called"], correctAnswer: "0", explanation: "'Will' → 'would' in reported speech; 'tomorrow' → 'the next day'." },
          { type: "MCQ", question: "'I've been working here since 2015.' → He said he ___ there since 2015.", options: ["had been working", "has been working", "was working", "is working"], correctAnswer: "0", explanation: "Present perfect continuous → past perfect continuous in reported speech." },
          { type: "MCQ", question: "'Don't touch that wire!' → She ___ me ___ touch the wire.", options: ["warned, not to", "said, don't", "told, to not", "asked, don't"], correctAnswer: "0", explanation: "'Warned + object + not to + verb' for warnings." },
          { type: "MCQ", question: "'Where have you been?' → He asked me where I ___.'", options: ["had been", "have been", "was been", "am been"], correctAnswer: "0", explanation: "Present perfect → past perfect; question word order becomes statement order." },
          { type: "TRUE_FALSE", question: "True or False: 'She asked me where was I going' is correct reported speech.", correctAnswer: "false", explanation: "Should be 'She asked me where I was going' (statement word order, not question order)." },
          { type: "TRUE_FALSE", question: "True or False: 'He said he had visited Paris twice' can be correct in reported speech.", correctAnswer: "true", explanation: "Past perfect is used when the original was 'I have visited' or 'I visited'." },
          { type: "FILL_BLANK", question: "Complete: 'I can't attend the meeting.' → She said she ___ attend the meeting.", correctAnswer: "couldn't", explanation: "'Can't' → 'couldn't' in reported speech." },
          { type: "FILL_BLANK", question: "Complete: 'Let's go to the cinema!' → She suggested ___ to the cinema.", correctAnswer: "going", explanation: "'Suggest + verb-ing' or 'suggest that we go'." },
          { type: "FILL_BLANK", question: "Complete: 'I'm meeting John tonight.' → He said he ___ John that night.", correctAnswer: "was meeting", explanation: "Present continuous → past continuous; 'tonight' → 'that night'." },
          { type: "MATCHING", question: "Match the direct speech with its reported form:", options: [{ left: "'I must leave now.'", right: "She said she had to leave then" }, { left: "'Shall I open the window?'", right: "He asked if he should open the window" }, { left: "'I ought to apologize.'", right: "She said she ought to apologize" }, { left: "'What a beautiful day!'", right: "She exclaimed what a beautiful day it was" }], correctAnswer: "[0,1,2,3]", explanation: "Each direct speech sentence transforms into reported speech differently." },
          { type: "CHECKBOX", question: "Select all correctly reported sentences:", options: ["She said she would arrive the following day", "He asked me where was I from", "They told us they had finished the work", "She warned us not to swim in that river"], correctAnswer: "[0,2,3]", explanation: "'Where was I from' is wrong word order; should be 'where I was from'. The others are correct." },
          { type: "ORDERING", question: "Put in order: asked / she / me / if / I / help / could", correctAnswer: "She asked me,if I could help", explanation: "Subject + asked + object + if + subject + could + verb." },
          { type: "SPEECH", question: "She told me that she had been trying to contact me for weeks.", correctAnswer: "She told me that she had been trying to contact me for weeks.", language: "en", hint: "Report someone's attempt to contact you" },
          { type: "SPEECH", question: "He asked whether I would be attending the conference the following month.", correctAnswer: "He asked whether I would be attending the conference the following month.", language: "en", hint: "Report a question about future plans" },
        ]
      },
      {
        title: "Reporting Verbs: Suggest, Recommend, Accuse, Deny",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Let's go to the beach.' → She ___ to the beach.", options: ["suggested going", "suggested to go", "suggested go", "suggested we to go"], correctAnswer: "0", explanation: "'Suggest + verb-ing' or 'suggest that + subject + verb'." },
          { type: "MCQ", question: "'You should try the new restaurant.' → He ___ the new restaurant.", options: ["recommended trying", "recommended to try", "recommended try", "recommended we try"], correctAnswer: "0", explanation: "'Recommend + verb-ing' or 'recommend that + subject + verb'." },
          { type: "MCQ", question: "'I didn't steal the money!' → He ___ the money.", options: ["denied stealing", "denied to steal", "denied steal", "denied he steals"], correctAnswer: "0", explanation: "'Deny + verb-ing' or 'deny that + clause'." },
          { type: "MCQ", question: "'It's your fault the project failed.' → She ___ of causing the failure.", options: ["accused him", "accused to him", "accused for him", "accused him to"], correctAnswer: "0", explanation: "'Accuse + someone + of + verb-ing'." },
          { type: "TRUE_FALSE", question: "True or False: 'She suggested to go early' is correct.", correctAnswer: "false", explanation: "Should be 'She suggested going early' or 'She suggested that we go early'." },
          { type: "TRUE_FALSE", question: "True or False: 'He admitted making a mistake' is correct.", correctAnswer: "true", explanation: "'Admit + verb-ing' is the correct pattern." },
          { type: "FILL_BLANK", question: "Complete: She ___ (apologize) for being late.", correctAnswer: "apologized", explanation: "'Apologize for + verb-ing' or 'apologize for being late'." },
          { type: "FILL_BLANK", question: "Complete: He ___ (promise) to be on time next time.", correctAnswer: "promised", explanation: "'Promise + to + verb' is the correct pattern." },
          { type: "FILL_BLANK", question: "Complete: They ___ (threaten) to call the police.", correctAnswer: "threatened", explanation: "'Threaten + to + verb' for threats." },
          { type: "MATCHING", question: "Match the reporting verb with its pattern:", options: [{ left: "Suggest", right: "Suggest + verb-ing / that + clause" }, { left: "Accuse", right: "Accuse + someone + of + verb-ing" }, { left: "Promise", right: "Promise + to + verb" }, { left: "Deny", right: "Deny + verb-ing / that + clause" }], correctAnswer: "[0,1,2,3]", explanation: "Each reporting verb has a specific grammatical pattern." },
          { type: "CHECKBOX", question: "Select all correct reporting verb sentences:", options: ["She suggested taking a break", "He admitted to stealing the money", "They denied having any involvement", "She accused him of lying to her"], correctAnswer: "[0,2,3]", explanation: "'Admitted to stealing' is less common; 'admitted stealing' is preferred. Some accept 'admitted to stealing' as valid. 0, 2, 3 are clearly correct." },
          { type: "ORDERING", question: "Put in order: suggested / that / we / leave / early", correctAnswer: "She suggested,that we leave,early", explanation: "Suggest + that + subject + base verb." },
          { type: "SPEECH", question: "He accused me of not telling the whole truth about what happened.", correctAnswer: "He accused me of not telling the whole truth about what happened.", language: "en", hint: "Report an accusation about honesty" },
          { type: "SPEECH", question: "She recommended booking the hotel in advance during peak season.", correctAnswer: "She recommended booking the hotel in advance during peak season.", language: "en", hint: "Give a recommendation about travel planning" },
        ]
      },
      {
        title: "Reported Questions & Commands",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'What time does the train leave?' → She asked what time the train ___.", options: ["left", "does leave", "leaves", "is leaving"], correctAnswer: "0", explanation: "Present simple → past simple in reported questions." },
          { type: "MCQ", question: "'Don't be late!' → He told me ___ late.", options: ["not to be", "don't be", "to not be", "not being"], correctAnswer: "0", explanation: "Reported command: told + object + not to + verb." },
          { type: "MCQ", question: "'Have you ever been to Japan?' → She asked if I ___ ever been to Japan.", options: ["had", "have", "was", "did"], correctAnswer: "0", explanation: "Present perfect → past perfect in reported questions." },
          { type: "MCQ", question: "'Please help me with this.' → She ___ me to help her.", options: ["asked", "said", "told", "spoke"], correctAnswer: "0", explanation: "'Ask + object + to + verb' for polite requests." },
          { type: "TRUE_FALSE", question: "True or False: 'She asked me where do I live' is correct reported speech.", correctAnswer: "false", explanation: "Should be 'She asked me where I lived' (statement word order, past tense)." },
          { type: "TRUE_FALSE", question: "True or False: 'He ordered them to leave immediately' is a reported command.", correctAnswer: "true", explanation: "'Order + object + to + verb' for strong commands." },
          { type: "FILL_BLANK", question: "Complete: 'Are you coming to the party?' → He asked if I ___ coming.", correctAnswer: "was", explanation: "Present continuous → past continuous in reported questions." },
          { type: "FILL_BLANK", question: "Complete: 'Open the window!' → She told me ___ the window.", correctAnswer: "to open", explanation: "Reported command: told + object + to + verb." },
          { type: "FILL_BLANK", question: "Complete: 'Who told you that?' → She asked who ___ me that.", correctAnswer: "had told", explanation: "Past simple → past perfect in reported questions." },
          { type: "MATCHING", question: "Match the question type:", options: [{ left: "Yes/no question", right: "Asked if/whether + clause" }, { left: "WH question", right: "Asked + WH word + clause" }, { left: "Command", right: "Told/ordered + to + verb" }, { left: "Request", right: "Asked + to + verb" }], correctAnswer: "[0,1,2,3]", explanation: "Each question/command type has a different reported form." },
          { type: "CHECKBOX", question: "Select all correct reported questions/commands:", options: ["She asked if I had seen the movie", "He told me not to wait for him", "They asked where was the station", "She asked me to pass the salt"], correctAnswer: "[0,1,3]", explanation: "'Where was the station' is wrong word order; should be 'where the station was'. The others are correct." },
          { type: "ORDERING", question: "Put in order: asked / if / I / coming / she / was / to the party", correctAnswer: "She asked,if I was coming,to the party", explanation: "Subject + asked + if + subject + was + verb-ing." },
          { type: "SPEECH", question: "The teacher told us to finish the assignment by Friday.", correctAnswer: "The teacher told us to finish the assignment by Friday.", language: "en", hint: "Report a teacher's instruction" },
          { type: "SPEECH", question: "She asked me whether I would be able to attend the meeting the following day.", correctAnswer: "She asked me whether I would be able to attend the meeting the following day.", language: "en", hint: "Report a question about future availability" },
        ]
      },
      {
        title: "Reporting with Infinitives & Gerunds",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I'll help you move.' → He ___ me move.", options: ["promised to help", "promised helping", "promised help", "promised for helping"], correctAnswer: "0", explanation: "'Promise + to + verb' for commitments." },
          { type: "MCQ", question: "'I didn't break the window.' → He ___ the window.", options: ["denied breaking", "denied to break", "denied break", "denied for breaking"], correctAnswer: "0", explanation: "'Deny + verb-ing' for denying an action." },
          { type: "MCQ", question: "'You should exercise more.' → She ___ more.", options: ["advised me to exercise", "advised me exercising", "advised me exercise", "advised to exercise me"], correctAnswer: "0", explanation: "'Advise + object + to + verb' for advice." },
          { type: "MCQ", question: "'Let me carry your bag.' → He ___ my bag.", options: ["offered to carry", "offered carrying", "offered carry", "offered for carrying"], correctAnswer: "0", explanation: "'Offer + to + verb' for offers." },
          { type: "TRUE_FALSE", question: "True or False: 'She agreed helping us' is correct.", correctAnswer: "false", explanation: "Should be 'She agreed to help us' (agree + to + verb)." },
          { type: "TRUE_FALSE", question: "True or False: 'He confessed to stealing the money' is correct.", correctAnswer: "true", explanation: "'Confess to + verb-ing' is correct." },
          { type: "FILL_BLANK", question: "Complete: She ___ (refuse) to answer the question.", correctAnswer: "refused", explanation: "'Refuse + to + verb' for refusing." },
          { type: "FILL_BLANK", question: "Complete: He ___ (regret) not studying harder at university.", correctAnswer: "regretted", explanation: "'Regret + verb-ing' for past regrets." },
          { type: "FILL_BLANK", question: "Complete: They ___ (threaten) to report him to the authorities.", correctAnswer: "threatened", explanation: "'Threaten + to + verb' for threats." },
          { type: "MATCHING", question: "Match the verb with its pattern:", options: [{ left: "Agree", right: "Agree + to + verb" }, { left: "Admit", right: "Admit + verb-ing" }, { left: "Refuse", right: "Refuse + to + verb" }, { left: "Regret", right: "Regret + verb-ing" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb requires a specific following form." },
          { type: "CHECKBOX", question: "Select all correct reporting patterns:", options: ["She offered to drive me home", "He admitted making a mistake", "They refused to cooperate", "She agreed helping us"], correctAnswer: "[0,1,2]", explanation: "'Agreed helping' is wrong; should be 'agreed to help'. The others are correct." },
          { type: "ORDERING", question: "Put in order: promised / to / she / call / later", correctAnswer: "She,promised to call,later", explanation: "Subject + promised + to + verb." },
          { type: "SPEECH", question: "He admitted having made a serious error in judgment.", correctAnswer: "He admitted having made a serious error in judgment.", language: "en", hint: "Report someone admitting a mistake" },
          { type: "SPEECH", question: "She offered to help me organize the event, which was very kind.", correctAnswer: "She offered to help me organize the event, which was very kind.", language: "en", hint: "Report someone's offer of assistance" },
        ]
      },
      {
        title: "Module 4 Review: Reported Speech & Reporting Verbs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I'm leaving tomorrow.' → She said she ___ the next day.", options: ["was leaving", "is leaving", "left", "leaves"], correctAnswer: "0", explanation: "Present continuous → past continuous; tomorrow → the next day." },
          { type: "MCQ", question: "'Don't forget your passport!' → He ___ me ___ my passport.", options: ["reminded, not to forget", "said, don't forget", "told, forget not", "asked, don't forget"], correctAnswer: "0", explanation: "'Remind + object + not to + verb' for reminders." },
          { type: "MCQ", question: "'I didn't take the money!' → He ___ the money.", options: ["denied taking", "denied to take", "denied take", "denied he takes"], correctAnswer: "0", explanation: "'Deny + verb-ing' for denying an action." },
          { type: "MCQ", question: "'Would you mind closing the door?' → She ___ the door.", options: ["asked me to close", "asked me closing", "said me to close", "told closing"], correctAnswer: "0", explanation: "'Ask + object + to + verb' for polite requests." },
          { type: "TRUE_FALSE", question: "True or False: 'She suggested that we should leave early' is correct.", correctAnswer: "true", explanation: "'Suggest that + subject + should + verb' is a valid pattern." },
          { type: "TRUE_FALSE", question: "True or False: 'He accused her for lying' is correct.", correctAnswer: "false", explanation: "Should be 'He accused her of lying' (accuse + of)." },
          { type: "FILL_BLANK", question: "Complete: 'Where did you go?' → She asked where I ___.'", correctAnswer: "had gone", explanation: "Past simple → past perfect in reported questions." },
          { type: "FILL_BLANK", question: "Complete: She ___ (promise) to keep the secret.", correctAnswer: "promised", explanation: "'Promise + to + verb' for commitments." },
          { type: "FILL_BLANK", question: "Complete: He ___ (apologize) for being rude.", correctAnswer: "apologized", explanation: "'Apologize for + verb-ing' for apologies." },
          { type: "MATCHING", question: "Match the reported speech type:", options: [{ left: "Statement", right: "Said/told + that + clause" }, { left: "Question", right: "Asked + if/WH + clause" }, { left: "Command", right: "Told/ordered + to + verb" }, { left: "Advice", right: "Advised + to + verb" }], correctAnswer: "[0,1,2,3]", explanation: "Each speech type has a specific reported structure." },
          { type: "CHECKBOX", question: "Select all correct reported sentences:", options: ["She asked if I had finished the report", "He denied having seen the document", "They suggested going to the museum", "She told to me to be careful"], correctAnswer: "[0,1,2]", explanation: "'Told to me' is wrong; should be 'told me'. The others are correct." },
          { type: "ORDERING", question: "Put in order: denied / he / breaking / the / window", correctAnswer: "He,denied breaking,the window", explanation: "Subject + denied + verb-ing + object." },
          { type: "SPEECH", question: "She advised me to reconsider my decision before it was too late.", correctAnswer: "She advised me to reconsider my decision before it was too late.", language: "en", hint: "Report someone giving advice" },
          { type: "SPEECH", question: "He promised that he would never lie to me again.", correctAnswer: "He promised that he would never lie to me again.", language: "en", hint: "Report a promise about honesty" },
          { type: "SPEECH", question: "They accused the company of deliberately misleading customers.", correctAnswer: "They accused the company of deliberately misleading customers.", language: "en", hint: "Report an accusation about business practices" },
        ]
      },
    ]
  },
  {
    title: "Narrative Tenses & Storytelling",
    lessons: [
      {
        title: "Past Perfect Continuous",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She was tired because she ___ all day.'", options: ["had been working", "has been working", "was working", "worked"], correctAnswer: "0", explanation: "Past perfect continuous: had been + verb-ing for duration before a past point." },
          { type: "MCQ", question: "'How long ___ you ___ before you found the answer?'", options: ["had, been searching", "have, been searching", "were, searching", "did, search"], correctAnswer: "0", explanation: "Past perfect continuous for duration up to a past moment." },
          { type: "MCQ", question: "'The ground was wet because it ___ all night.'", options: ["had been raining", "has been raining", "was raining", "rained"], correctAnswer: "0", explanation: "Past perfect continuous explains a past state's cause." },
          { type: "MCQ", question: "What's the difference between 'had worked' and 'had been working'?", options: ["Completed action vs ongoing duration", "Ongoing vs completed", "Present vs past", "No difference"], correctAnswer: "0", explanation: "'Had worked' = completed; 'had been working' = ongoing duration." },
          { type: "TRUE_FALSE", question: "True or False: 'I had been waiting for two hours when she finally arrived' is correct.", correctAnswer: "true", explanation: "Past perfect continuous for duration before a past event." },
          { type: "TRUE_FALSE", question: "True or False: 'She had been knowing him for years' is correct.", correctAnswer: "false", explanation: "'Know' is stative; use past perfect simple: 'had known'." },
          { type: "FILL_BLANK", question: "Complete: They ___ (travel) for six hours when the car broke down.", correctAnswer: "had been traveling", explanation: "Duration before a past event." },
          { type: "FILL_BLANK", question: "Complete: His eyes were red because he ___ (cry).", correctAnswer: "had been crying", explanation: "Past perfect continuous explains a visible result." },
          { type: "FILL_BLANK", question: "Complete: How long ___ she ___ (study) before she took the exam?", correctAnswer: "had, been studying", explanation: "Duration before a past event." },
          { type: "MATCHING", question: "Match the sentence with its meaning:", options: [{ left: "I had been working for hours", right: "Duration before past event" }, { left: "She had finished the work", right: "Completed before past event" }, { left: "They had been arguing", right: "Ongoing conflict before something" }, { left: "It had snowed", right: "Completed past action" }], correctAnswer: "[0,1,2,3]", explanation: "Each sentence uses a different past tense for different purposes." },
          { type: "CHECKBOX", question: "Select all correct past perfect continuous sentences:", options: ["He had been running, so he was out of breath", "She had been living there for five years before moving", "They had been knowing each other for years", "I had been studying when the phone rang"], correctAnswer: "[0,1]", explanation: "'Had been knowing' is wrong (stative verb). 'Had been studying when' should be 'was studying when' for interruption. 0 and 1 are correct." },
          { type: "ORDERING", question: "Put in order: had / she / for / been / crying / hours", correctAnswer: "She,had been crying,for hours", explanation: "Subject + had been + verb-ing + duration." },
          { type: "SPEECH", question: "I had been waiting for over an hour when the bus finally showed up.", correctAnswer: "I had been waiting for over an hour when the bus finally showed up.", language: "en", hint: "Describe a long wait before something happened" },
          { type: "SPEECH", question: "She was exhausted because she had been working on the project all night.", correctAnswer: "She was exhausted because she had been working on the project all night.", language: "en", hint: "Explain why someone was tired" },
        ]
      },
      {
        title: "Narrative Tenses Combined",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'When I ___ home, I ___ that someone ___ into my house.'", options: ["arrived, noticed, had broken", "was arriving, was noticing, broke", "arrived, was noticing, had been breaking", "had arrived, noticed, was breaking"], correctAnswer: "0", explanation: "Arrived (past simple) + noticed (past simple) + had broken (past perfect for earlier action)." },
          { type: "MCQ", question: "'She ___ for the bus when it ___ to rain.'", options: ["was waiting, started", "waited, was starting", "had been waiting, had started", "waited, started"], correctAnswer: "0", explanation: "Past continuous (was waiting) + past simple (started) for interruption." },
          { type: "MCQ", question: "'I ___ already ___ dinner when they ___.", options: ["had, eaten, arrived", "was, eating, were arriving", "have, eaten, arrived", "was, eaten, had arrived"], correctAnswer: "0", explanation: "Past perfect (had eaten) + past simple (arrived)." },
          { type: "MCQ", question: "Which tense order is correct for storytelling?", options: ["Past perfect → Past simple → Past continuous", "Past continuous → Past simple → Past perfect", "Present → Past → Future", "All of the above can work"], correctAnswer: "3", explanation: "Different tense combinations work depending on the narrative context." },
          { type: "TRUE_FALSE", question: "True or False: 'I was walking down the street when I saw an old friend' uses past continuous for background.", correctAnswer: "true", explanation: "Past continuous sets the scene; past simple is the interrupting event." },
          { type: "TRUE_FALSE", question: "True or False: 'She had been crying before I arrived' explains why she looked upset.", correctAnswer: "true", explanation: "Past perfect continuous explains a past state's cause." },
          { type: "FILL_BLANK", question: "Complete: While I ___ (drive) to work, I ___ (remember) I ___ (leave) the stove on.", correctAnswer: "was driving,remembered,had left", explanation: "Past continuous (was driving) + past simple (remembered) + past perfect (had left)." },
          { type: "FILL_BLANK", question: "Complete: By the time the police ___, the thief ___ (already/escape).", correctAnswer: "arrived,had already escaped", explanation: "Past simple (arrived) + past perfect (had escaped)." },
          { type: "FILL_BLANK", question: "Complete: She ___ (feel) sick because she ___ (eat) too much.", correctAnswer: "felt,had eaten", explanation: "Past simple (felt) + past perfect (had eaten) for cause." },
          { type: "MATCHING", question: "Match the tense with its narrative role:", options: [{ left: "Past simple", right: "Main events" }, { left: "Past continuous", right: "Background/scene-setting" }, { left: "Past perfect", right: "Earlier events" }, { left: "Past perfect continuous", right: "Duration before past event" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense serves a different role in storytelling." },
          { type: "CHECKBOX", question: "Select all correct narrative sentences:", options: ["I was reading when the power went out", "She had left before I arrived", "They had been arguing for hours", "I have been walking when I saw her"], correctAnswer: "[0,1,2]", explanation: "'Have been walking' is present perfect, wrong for past narrative. The others are correct." },
          { type: "ORDERING", question: "Put in order: was / the / it / raining / started / to / while / walking / I", correctAnswer: "While I was walking,it started to rain", explanation: "While + past continuous, past simple." },
          { type: "SPEECH", question: "I had been living in London for three years when I finally decided to move to Paris.", correctAnswer: "I had been living in London for three years when I finally decided to move to Paris.", language: "en", hint: "Describe how long you'd been somewhere before making a change" },
          { type: "SPEECH", question: "She was crossing the street when she noticed that someone had been following her.", correctAnswer: "She was crossing the street when she noticed that someone had been following her.", language: "en", hint: "Tell a suspenseful story using narrative tenses" },
        ]
      },
      {
        title: "Used To vs Would for Past Habits",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'When I was a child, I ___ play outside every day.'", options: ["used to", "was used to", "got used to", "use to"], correctAnswer: "0", explanation: "'Used to + verb' for past habits/states that are no longer true." },
          { type: "MCQ", question: "'My grandmother ___ tell us stories before bed.'", options: ["would", "used to", "both A and B", "was used to"], correctAnswer: "2", explanation: "Both 'would' and 'used to' work for past habits (not states)." },
          { type: "MCQ", question: "'I ___ live in a small village.' (state, not habit)", options: ["used to", "would", "will", "am used to"], correctAnswer: "0", explanation: "'Used to' works for states; 'would' only works for repeated actions." },
          { type: "MCQ", question: "What's the difference between 'used to live' and 'was used to living'?", options: ["Past state vs accustomed to", "Accustomed to vs past state", "Future vs past", "No difference"], correctAnswer: "0", explanation: "'Used to live' = past state; 'was used to living' = was accustomed to." },
          { type: "TRUE_FALSE", question: "True or False: 'She would have long hair' is correct for a past state.", correctAnswer: "false", explanation: "'Would' can't be used for states; use 'used to': 'She used to have long hair.'" },
          { type: "TRUE_FALSE", question: "True or False: 'I'm used to waking up early' means it's normal for me now.", correctAnswer: "true", explanation: "'Be used to + verb-ing' = be accustomed to something." },
          { type: "FILL_BLANK", question: "Complete: We ___ (go) to the beach every summer when I was young.", correctAnswer: "used to go", explanation: "'Used to + verb' for past habits." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/like) spinach, but now I love it.", correctAnswer: "didn't use to like", explanation: "Negative: didn't use to + verb." },
          { type: "FILL_BLANK", question: "Complete: It took me months to ___ (adapt) to the cold weather.", correctAnswer: "get used to", explanation: "'Get used to + verb-ing/noun' = become accustomed to." },
          { type: "MATCHING", question: "Match the structure with its meaning:", options: [{ left: "Used to + verb", right: "Past habit/state" }, { left: "Would + verb", right: "Past habit (actions only)" }, { left: "Be used to + -ing", right: "Accustomed to now" }, { left: "Get used to + -ing", right: "Become accustomed" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure expresses a different relationship with habit/acclimatization." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["I used to play tennis every weekend", "She would always sing in the shower", "He was used to working late", "I would have a bicycle when I was young"], correctAnswer: "[0,1,2]", explanation: "'Would have a bicycle' is wrong (state); use 'used to have'. The others are correct." },
          { type: "ORDERING", question: "Put in order: used / to / I / get up / early / would", correctAnswer: "I used to,I would get up,early", explanation: "'Used to' + 'would' can be combined for emphasis." },
          { type: "SPEECH", question: "When I was a teenager, I used to spend hours reading science fiction novels.", correctAnswer: "When I was a teenager, I used to spend hours reading science fiction novels.", language: "en", hint: "Talk about a past habit that you no longer do" },
          { type: "SPEECH", question: "It took me a while to get used to driving on the left side of the road.", correctAnswer: "It took me a while to get used to driving on the left side of the road.", language: "en", hint: "Describe becoming accustomed to something new" },
        ]
      },
      {
        title: "Past Continuous for Atmosphere & Background",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The sun ___, birds ___, and a gentle breeze ___ through the trees.'", options: ["was shining, were singing, was blowing", "shone, sang, blew", "had shone, had sung, had blown", "is shining, are singing, is blowing"], correctAnswer: "0", explanation: "Past continuous sets the atmospheric scene in storytelling." },
          { type: "MCQ", question: "'As I ___ down the dark corridor, I ___ footsteps behind me.'", options: ["was walking, heard", "walked, was hearing", "had walked, had heard", "walk, hear"], correctAnswer: "0", explanation: "Past continuous (was walking) for background + past simple (heard) for event." },
          { type: "MCQ", question: "'While they ___ dinner, the phone ___.", options: ["were having, rang", "had, was ringing", "had had, rang", "were having, was ringing"], correctAnswer: "0", explanation: "Past continuous for ongoing action + past simple for interruption." },
          { type: "MCQ", question: "When writing a story, which tense creates atmosphere?", options: ["Past continuous", "Past simple", "Past perfect", "Present simple"], correctAnswer: "0", explanation: "Past continuous creates atmosphere and sets the scene." },
          { type: "TRUE_FALSE", question: "True or False: 'It was raining heavily and the wind was howling' creates atmosphere.", correctAnswer: "true", explanation: "Past continuous for weather/atmosphere in storytelling." },
          { type: "TRUE_FALSE", question: "True or False: 'She was knowing the answer' is correct for storytelling.", correctAnswer: "false", explanation: "'Know' is stative; can't use continuous." },
          { type: "FILL_BLANK", question: "Complete: The children ___ (play) in the garden while their parents ___ (watch) from the porch.", correctAnswer: "were playing,were watching", explanation: "Past continuous for simultaneous background actions." },
          { type: "FILL_BLANK", question: "Complete: As the night ___ (fall), the temperature ___ (drop) rapidly.", correctAnswer: "was falling,was dropping", explanation: "Past continuous for changing conditions." },
          { type: "FILL_BLANK", question: "Complete: While I ___ (wait) for the train, I ___ (notice) a strange man.", correctAnswer: "was waiting,noticed", explanation: "Past continuous (waiting) + past simple (noticed) for interruption." },
          { type: "MATCHING", question: "Match the narrative technique:", options: [{ left: "Past continuous", right: "Setting the scene" }, { left: "Past simple", right: "Main events" }, { left: "Past perfect", right: "Flashbacks" }, { left: "Past perfect continuous", right: "Duration before event" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense serves a specific narrative function." },
          { type: "CHECKBOX", question: "Select all atmospheric descriptions:", options: ["The moon was shining through the clouds", "People were chatting and laughing", "She had lived there for years", "The old clock was ticking in the corner"], correctAnswer: "[0,1,3]", explanation: "'Had lived there' is narrative background, not atmosphere. The others create mood/atmosphere." },
          { type: "ORDERING", question: "Put in order: was / snowing / it / and / the / was / blowing / wind", correctAnswer: "It was snowing,and the wind was blowing", explanation: "Past continuous for atmospheric description." },
          { type: "SPEECH", question: "The rain was pouring down and the thunder was rumbling in the distance as we drove home.", correctAnswer: "The rain was pouring down and the thunder was rumbling in the distance as we drove home.", language: "en", hint: "Describe a stormy atmosphere" },
          { type: "SPEECH", question: "While everyone was dancing and having fun, I was sitting quietly in the corner watching.", correctAnswer: "While everyone was dancing and having fun, I was sitting quietly in the corner watching.", language: "en", hint: "Contrast background activity with a personal observation" },
        ]
      },
      {
        title: "Module 5 Review: Narrative Tenses & Storytelling",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'By the time I ___ at the station, the train ___.'", options: ["arrived, had already left", "was arriving, had already leaving", "had arrived, already left", "arrive, has already left"], correctAnswer: "0", explanation: "Past simple (arrived) + past perfect (had already left)." },
          { type: "MCQ", question: "'She ___ for three hours when she finally ___ a break.'", options: ["had been working, took", "was working, was taking", "worked, had taken", "has been working, takes"], correctAnswer: "0", explanation: "Past perfect continuous (had been working) + past simple (took)." },
          { type: "MCQ", question: "'When I was young, I ___ collect stamps.'", options: ["used to", "would", "both A and B", "was used to"], correctAnswer: "2", explanation: "Both 'used to' and 'would' work for past habits." },
          { type: "MCQ", question: "'The sun ___ and the birds ___ as we ___ down the path.'", options: ["was shining, were singing, walked", "shone, sang, were walking", "had shone, had sung, had walked", "shines, sing, walk"], correctAnswer: "0", explanation: "Past continuous for atmosphere + past simple for main event." },
          { type: "TRUE_FALSE", question: "True or False: 'I used to have long hair' describes a past state.", correctAnswer: "true", explanation: "'Used to' works for past states that are no longer true." },
          { type: "TRUE_FALSE", question: "True or False: 'She would be very kind' is correct for a past state.", correctAnswer: "false", explanation: "'Would' can't be used for states; use 'used to'." },
          { type: "FILL_BLANK", question: "Complete: While I ___ (cook) dinner, the power ___ (go) out.", correctAnswer: "was cooking,went", explanation: "Past continuous (was cooking) + past simple (went)." },
          { type: "FILL_BLANK", question: "Complete: He ___ (drive) for five hours before he ___ (stop) for a rest.", correctAnswer: "had been driving,stopped", explanation: "Past perfect continuous + past simple." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/enjoy) school, but now I love learning.", correctAnswer: "didn't use to enjoy", explanation: "Negative 'used to': didn't use to + verb." },
          { type: "MATCHING", question: "Match the tense with its storytelling function:", options: [{ left: "Past continuous", right: "Atmosphere/background" }, { left: "Past perfect", right: "Earlier events" }, { left: "Used to", right: "Past habits" }, { left: "Past simple", right: "Main narrative events" }], correctAnswer: "[0,1,2,3]", explanation: "Each tense contributes differently to storytelling." },
          { type: "CHECKBOX", question: "Select all correct narrative sentences:", options: ["I was walking when I heard a loud noise", "She had been crying before I arrived", "We used to visit our grandparents every Sunday", "I would have a dog when I was a child"], correctAnswer: "[0,1,2]", explanation: "'Would have a dog' is wrong (state); use 'used to have'. The others are correct." },
          { type: "ORDERING", question: "Put in order: had / for / she / been / studying / hours / three", correctAnswer: "She,had been studying,for three hours", explanation: "Subject + had been + verb-ing + duration." },
          { type: "SPEECH", question: "I had been working at the company for ten years when they suddenly announced layoffs.", correctAnswer: "I had been working at the company for ten years when they suddenly announced layoffs.", language: "en", hint: "Describe a long period before an unexpected event" },
          { type: "SPEECH", question: "While the children were playing in the park, their parents were chatting on a nearby bench.", correctAnswer: "While the children were playing in the park, their parents were chatting on a nearby bench.", language: "en", hint: "Describe simultaneous background activities" },
          { type: "SPEECH", question: "When I was a student, I used to stay up all night studying for exams.", correctAnswer: "When I was a student, I used to stay up all night studying for exams.", language: "en", hint: "Talk about a past study habit" },
        ]
      },
    ]
  },
  {
    title: "Future Forms Mastery",
    lessons: [
      {
        title: "Future Continuous: Advanced Uses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'This time next week, I ___ on a beach in Bali.'", options: ["will be lying", "will lie", "am lying", "will have lain"], correctAnswer: "0", explanation: "Future continuous: will be + verb-ing for action in progress at a future time." },
          { type: "MCQ", question: "'___ you ___ the car tonight? I need it.'", options: ["Will, be using", "Will, use", "Are, using", "Do, use"], correctAnswer: "0", explanation: "Future continuous for polite inquiry about someone's plans." },
          { type: "MCQ", question: "'Don't call between 6 and 8. I ___ dinner.'", options: ["will be having", "will have", "am having", "have"], correctAnswer: "0", explanation: "Future continuous for an action that will be in progress." },
          { type: "MCQ", question: "Which is a polite use of future continuous?", options: ["Will you be passing the post office?", "Will you pass the post office?", "Are you passing the post office?", "Do you pass the post office?"], correctAnswer: "0", explanation: "'Will you be doing...?' is a polite, indirect way of asking." },
          { type: "TRUE_FALSE", question: "True or False: 'I will be waiting for you at the station' describes a planned ongoing action.", correctAnswer: "true", explanation: "Future continuous for an action that will be in progress at a specific future time." },
          { type: "TRUE_FALSE", question: "True or False: 'I will be knowing the answer soon' is correct.", correctAnswer: "false", explanation: "'Know' is stative; can't use continuous forms." },
          { type: "FILL_BLANK", question: "Complete: At midnight, we ___ (celebrate) the New Year.", correctAnswer: "will be celebrating", explanation: "Future continuous for action at a specific future time." },
          { type: "FILL_BLANK", question: "Complete: This time tomorrow, I ___ (fly) over the Atlantic.", correctAnswer: "will be flying", explanation: "Future continuous for action in progress at a future moment." },
          { type: "FILL_BLANK", question: "Complete: ___ you ___ (join) us for dinner tonight?", correctAnswer: "Will, be joining", explanation: "Future continuous for polite invitation." },
          { type: "MATCHING", question: "Match the future continuous use:", options: [{ left: "I'll be working at 9", right: "Action in progress" }, { left: "Will you be coming?", right: "Polite inquiry" }, { left: "She'll be arriving soon", right: "Expected event" }, { left: "I'll be seeing him tomorrow", right: "Matter-of-course future" }], correctAnswer: "[0,1,2,3]", explanation: "Future continuous has several communicative functions." },
          { type: "CHECKBOX", question: "Select all correct future continuous sentences:", options: ["They will be traveling next month", "I'll be thinking about your offer", "She will be arriving at 5 PM", "He will be having a new car soon"], correctAnswer: "[0,2]", explanation: "'Will be thinking' (stative) and 'will be having a car' (possession) are incorrect." },
          { type: "ORDERING", question: "Put in order: will / at / she / be / studying / midnight", correctAnswer: "She,will be studying,at midnight", explanation: "Subject + will be + verb-ing + time." },
          { type: "SPEECH", question: "This time next year, I will be living in a completely different country.", correctAnswer: "This time next year, I will be living in a completely different country.", language: "en", hint: "Talk about what you'll be doing at a future time" },
          { type: "SPEECH", question: "Don't worry, I will be waiting for you outside the theater.", correctAnswer: "Don't worry, I will be waiting for you outside the theater.", language: "en", hint: "Reassure someone about a future meeting" },
        ]
      },
      {
        title: "Future Perfect & Future Perfect Continuous",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'By 2030, I ___ my degree.'", options: ["will have completed", "will complete", "will be completing", "complete"], correctAnswer: "0", explanation: "Future perfect: will have + past participle for completion before a future time." },
          { type: "MCQ", question: "'By the time you arrive, we ___ for two hours.'", options: ["will have been waiting", "will have waited", "will be waiting", "are waiting"], correctAnswer: "0", explanation: "Future perfect continuous: will have been + verb-ing for duration up to a future point." },
          { type: "MCQ", question: "'She ___ the book by Friday.'", options: ["will have finished", "will finish", "will be finishing", "finishes"], correctAnswer: "0", explanation: "Future perfect for completion before a future deadline." },
          { type: "MCQ", question: "What's the difference between 'will have written' and 'will have been writing'?", options: ["Completed vs ongoing duration", "Ongoing vs completed", "Present vs future", "No difference"], correctAnswer: "0", explanation: "'Will have written' = completed; 'will have been writing' = ongoing duration." },
          { type: "TRUE_FALSE", question: "True or False: 'By next month, I will have been working here for five years' is correct.", correctAnswer: "true", explanation: "Future perfect continuous for duration up to a future point." },
          { type: "TRUE_FALSE", question: "True or False: 'She will have been knowing him for years' is correct.", correctAnswer: "false", explanation: "'Know' is stative; can't use continuous." },
          { type: "FILL_BLANK", question: "Complete: By December, I ___ (save) enough money for the trip.", correctAnswer: "will have saved", explanation: "Future perfect for completion before a future point." },
          { type: "FILL_BLANK", question: "Complete: By next week, they ___ (travel) for a month.", correctAnswer: "will have been traveling", explanation: "Future perfect continuous for ongoing duration." },
          { type: "FILL_BLANK", question: "Complete: How long ___ you ___ (study) by the time you graduate?", correctAnswer: "will, have been studying", explanation: "Future perfect continuous question form." },
          { type: "MATCHING", question: "Match the tense with its meaning:", options: [{ left: "Will have finished", right: "Completed by future time" }, { left: "Will have been working", right: "Duration up to future time" }, { left: "Will be working", right: "In progress at future time" }, { left: "Will work", right: "Simple future action" }], correctAnswer: "[0,1,2,3]", explanation: "Each future tense expresses a different temporal perspective." },
          { type: "CHECKBOX", question: "Select all correct future perfect sentences:", options: ["By 2025, I will have graduated", "She will have been teaching for 20 years by June", "They will have been building the bridge", "He will have eat by noon"], correctAnswer: "[0,1]", explanation: "'Will have been building' needs a time reference. 'Will have eat' is wrong (eaten). 0 and 1 are correct." },
          { type: "ORDERING", question: "Put in order: will / have / by / the / we / finished / project / Friday", correctAnswer: "We,will have finished the project,by Friday", explanation: "Subject + will have + past participle + object + by + time." },
          { type: "SPEECH", question: "By the end of this year, I will have been learning English for a decade.", correctAnswer: "By the end of this year, I will have been learning English for a decade.", language: "en", hint: "Talk about a learning milestone" },
          { type: "SPEECH", question: "By the time the guests arrive, we will have prepared everything.", correctAnswer: "By the time the guests arrive, we will have prepared everything.", language: "en", hint: "Talk about completing preparations before an event" },
        ]
      },
      {
        title: "Will vs Going To vs Present Continuous for Future",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I think it ___ rain later.' (prediction based on opinion)", options: ["will", "is going to", "is", "shall"], correctAnswer: "0", explanation: "'Will' for predictions based on opinion/belief." },
          { type: "MCQ", question: "'Look at those clouds! It ___ rain.' (prediction based on evidence)", options: ["is going to", "will", "is", "shall"], correctAnswer: "0", explanation: "'Going to' for predictions based on present evidence." },
          { type: "MCQ", question: "'I ___ meeting Sarah for lunch tomorrow.' (arrangement)", options: ["am", "will be", "am going to be", "will"], correctAnswer: "0", explanation: "Present continuous for fixed arrangements with specific times." },
          { type: "MCQ", question: "'I ___ help you with that.' (spontaneous decision)", options: ["will", "am going to", "am", "shall be"], correctAnswer: "0", explanation: "'Will' for spontaneous decisions made at the moment of speaking." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm going to study medicine' expresses a prior intention.", correctAnswer: "true", explanation: "'Going to' for intentions/decisions made before speaking." },
          { type: "TRUE_FALSE", question: "True or False: 'I will meet John at 6' is better than 'I'm meeting John at 6' for an arrangement.", correctAnswer: "false", explanation: "Present continuous ('I'm meeting') is preferred for fixed arrangements." },
          { type: "FILL_BLANK", question: "Complete: I ___ (visit) my parents this weekend. (arrangement)", correctAnswer: "am visiting", explanation: "Present continuous for arrangements." },
          { type: "FILL_BLANK", question: "Complete: I ___ (start) a new diet next month. (intention)", correctAnswer: "am going to start", explanation: "'Going to' for intentions." },
          { type: "FILL_BLANK", question: "Complete: I'm sure she ___ love the gift. (prediction)", correctAnswer: "will", explanation: "'Will' for predictions with 'I'm sure'." },
          { type: "MATCHING", question: "Match the future form with its use:", options: [{ left: "Will", right: "Spontaneous decision/prediction" }, { left: "Going to", right: "Intention/evidence-based prediction" }, { left: "Present continuous", right: "Fixed arrangement" }, { left: "Present simple", right: "Timetable/schedule" }], correctAnswer: "[0,1,2,3]", explanation: "Each future form has a specific use." },
          { type: "CHECKBOX", question: "Select all correct future sentences:", options: ["I'm meeting the doctor at 3 PM", "I think she will pass the exam", "Look! He's going to fall", "I will visiting you tomorrow"], correctAnswer: "[0,1,2]", explanation: "'Will visiting' is wrong; should be 'will visit'. The others are correct." },
          { type: "ORDERING", question: "Put in order: going / to / I / start / am / a new job", correctAnswer: "I,am going to start,a new job", explanation: "Subject + am going to + verb + object." },
          { type: "SPEECH", question: "I'm going to start exercising regularly next week, I've already bought the equipment.", correctAnswer: "I'm going to start exercising regularly next week, I've already bought the equipment.", language: "en", hint: "Talk about a firm intention with evidence of preparation" },
          { type: "SPEECH", question: "The train leaves at 8:30 tomorrow morning, so we need to be at the station by 8.", correctAnswer: "The train leaves at 8:30 tomorrow morning, so we need to be at the station by 8.", language: "en", hint: "Talk about a scheduled event" },
        ]
      },
      {
        title: "All Future Forms Practice",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'By this time tomorrow, I ___ on a plane to Tokyo.'", options: ["will be sitting", "will sit", "am sitting", "will have sat"], correctAnswer: "0", explanation: "Future continuous for action in progress at a future time." },
          { type: "MCQ", question: "'I ___ the report by the end of the day.'", options: ["will have finished", "will be finishing", "am finishing", "finish"], correctAnswer: "0", explanation: "Future perfect for completion before a future deadline." },
          { type: "MCQ", question: "'I ___ you as soon as I arrive.' (spontaneous)", options: ["will call", "am going to call", "am calling", "call"], correctAnswer: "0", explanation: "'Will' for spontaneous promises/decisions." },
          { type: "MCQ", question: "'Look at that car! It ___ crash!'", options: ["is going to", "will", "is", "shall"], correctAnswer: "0", explanation: "'Going to' for predictions based on present evidence." },
          { type: "TRUE_FALSE", question: "True or False: 'I'll have been working here for ten years by next March' is correct.", correctAnswer: "true", explanation: "Future perfect continuous for duration up to a future point." },
          { type: "TRUE_FALSE", question: "True or False: 'I will to help you' is correct.", correctAnswer: "false", explanation: "Should be 'I will help you' (no 'to' after will)." },
          { type: "FILL_BLANK", question: "Complete: By 2030, scientists ___ (discover) a cure for many diseases.", correctAnswer: "will have discovered", explanation: "Future perfect for prediction about completion." },
          { type: "FILL_BLANK", question: "Complete: Don't call at 7. I ___ (have) dinner.", correctAnswer: "will be having", explanation: "Future continuous for action in progress." },
          { type: "FILL_BLANK", question: "Complete: The conference ___ (start) at 9 AM sharp. (schedule)", correctAnswer: "starts", explanation: "Present simple for timetabled events." },
          { type: "MATCHING", question: "Match the future form:", options: [{ left: "Will have done", right: "Completed by future time" }, { left: "Will be doing", right: "In progress at future time" }, { left: "Going to do", right: "Intention" }, { left: "Is doing", right: "Arrangement" }], correctAnswer: "[0,1,2,3]", explanation: "Each form expresses a different future perspective." },
          { type: "CHECKBOX", question: "Select all correct future sentences:", options: ["I'll have finished by noon", "She will be waiting at the station", "They're going to move next month", "I am to meet him at 5"], correctAnswer: "[0,1,2]", explanation: "'Am to meet' is formal and correct, but less common. All are grammatically valid. 0, 1, 2 are most natural." },
          { type: "ORDERING", question: "Put in order: will / have / by / graduated / she / June", correctAnswer: "She,will have graduated,by June", explanation: "Subject + will have + past participle + by + time." },
          { type: "SPEECH", question: "By the time I turn thirty, I will have traveled to over twenty countries.", correctAnswer: "By the time I turn thirty, I will have traveled to over twenty countries.", language: "en", hint: "Talk about a future achievement goal" },
          { type: "SPEECH", question: "This time next week, I will be relaxing on a beach in Thailand.", correctAnswer: "This time next week, I will be relaxing on a beach in Thailand.", language: "en", hint: "Describe what you'll be doing at a specific future time" },
          { type: "SPEECH", question: "I'm going to study harder this semester because my grades need to improve.", correctAnswer: "I'm going to study harder this semester because my grades need to improve.", language: "en", hint: "State an intention with a reason" },
        ]
      },
      {
        title: "Module 6 Review: Future Forms Mastery",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'By next year, she ___ at this company for a decade.'", options: ["will have been working", "will be working", "will have worked", "both A and C"], correctAnswer: "3", explanation: "Both 'will have been working' (emphasis on duration) and 'will have worked' work." },
          { type: "MCQ", question: "'Don't worry, I ___ you with your homework.'", options: ["will help", "am going to help", "am helping", "help"], correctAnswer: "0", explanation: "'Will' for spontaneous offers." },
          { type: "MCQ", question: "'This time next month, we ___ in our new house.'", options: ["will be living", "will live", "are living", "will have lived"], correctAnswer: "0", explanation: "Future continuous for action in progress at a future time." },
          { type: "MCQ", question: "'Look at the sky! It ___ snow.'", options: ["is going to", "will", "is", "shall"], correctAnswer: "0", explanation: "'Going to' for predictions based on evidence." },
          { type: "TRUE_FALSE", question: "True or False: 'I'll have been studying for six hours by midnight' is correct.", correctAnswer: "true", explanation: "Future perfect continuous for duration up to a future point." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm going to the dentist at 4' expresses an arrangement.", correctAnswer: "true", explanation: "Present continuous for fixed arrangements." },
          { type: "FILL_BLANK", question: "Complete: The meeting ___ (start) at 10 AM. (schedule)", correctAnswer: "starts", explanation: "Present simple for timetabled events." },
          { type: "FILL_BLANK", question: "Complete: I ___ (not/be) late. I promise.", correctAnswer: "won't be", explanation: "'Will' for promises." },
          { type: "FILL_BLANK", question: "Complete: By the time you read this, I ___ (leave).", correctAnswer: "will have left", explanation: "Future perfect for completion before a future reference point." },
          { type: "MATCHING", question: "Match the future use:", options: [{ left: "Will", right: "Spontaneous/promise" }, { left: "Going to", right: "Intention/evidence" }, { left: "Present continuous", right: "Arrangement" }, { left: "Future perfect", right: "Completed by future time" }], correctAnswer: "[0,1,2,3]", explanation: "Each future form has a distinct communicative purpose." },
          { type: "CHECKBOX", question: "Select all correct future sentences:", options: ["She will have arrived by then", "I'll be waiting for you", "They're going to launch the product in March", "The meeting will be starting at 9"], correctAnswer: "[0,1,2]", explanation: "'Will be starting' is less natural than 'starts' for schedules. 0, 1, 2 are clearly correct." },
          { type: "ORDERING", question: "Put in order: will / been / have / for / I / studying / hours / three", correctAnswer: "I,will have been studying,for three hours", explanation: "Subject + will have been + verb-ing + duration." },
          { type: "SPEECH", question: "By the time you receive this letter, I will have already left the country.", correctAnswer: "By the time you receive this letter, I will have already left the country.", language: "en", hint: "Describe something completed before a future reference point" },
          { type: "SPEECH", question: "I'm going to save enough money this year to buy a new car.", correctAnswer: "I'm going to save enough money this year to buy a new car.", language: "en", hint: "State a financial intention" },
          { type: "SPEECH", question: "This time next year, I will be celebrating my graduation with my family.", correctAnswer: "This time next year, I will be celebrating my graduation with my family.", language: "en", hint: "Describe a future celebration in progress" },
        ]
      },
    ]
  },
  {
    title: "Advanced Vocabulary & Collocations",
    lessons: [
      {
        title: "Work & Business Collocations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She managed to ___ a deal with the new client after weeks of negotiation.", options: ["close", "make", "do", "take"], correctAnswer: "0", explanation: "'Close a deal' is the correct business collocation." },
          { type: "MCQ", question: "The company needs to ___ a new marketing strategy.", options: ["implement", "make", "do", "put"], correctAnswer: "0", explanation: "'Implement a strategy' is the correct collocation, not 'make a strategy'." },
          { type: "MCQ", question: "He decided to ___ his resignation after disagreements with management.", options: ["hand in", "give in", "put in", "send in"], correctAnswer: "0", explanation: "'Hand in resignation' is the standard collocation." },
          { type: "MCQ", question: "We need to ___ the deadline for this project.", options: ["meet", "make", "do", "take"], correctAnswer: "0", explanation: "'Meet a deadline' is correct, not 'make/do a deadline'." },
          { type: "TRUE_FALSE", question: "True or False: 'She took a decision to leave the company' is correct.", correctAnswer: "false", explanation: "Should be 'made a decision', not 'took a decision'." },
          { type: "TRUE_FALSE", question: "True or False: 'They launched a new product last month' is correct.", correctAnswer: "true", explanation: "'Launch a product' is the correct business collocation." },
          { type: "FILL_BLANK", question: "Complete: The CEO will ___ a speech at the annual conference.", correctAnswer: "deliver", explanation: "'Deliver a speech' is the formal collocation." },
          { type: "FILL_BLANK", question: "Complete: We need to ___ a meeting to discuss the budget.", correctAnswer: "schedule", explanation: "'Schedule a meeting' or 'arrange a meeting'." },
          { type: "FILL_BLANK", question: "Complete: The team worked hard to ___ their targets this quarter.", correctAnswer: "achieve", explanation: "'Achieve targets' or 'meet targets'." },
          { type: "MATCHING", question: "Match the collocation:", options: [{ left: "Negotiate", right: "a contract" }, { left: "Chair", right: "a meeting" }, { left: "Conduct", right: "an interview" }, { left: "Secure", right: "funding" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb collocates with a specific business noun." },
          { type: "CHECKBOX", question: "Select all correct business collocations:", options: ["She earned a promotion", "He was offered a position", "They fired the entire department", "She did a presentation"], correctAnswer: "[0,1,2]", explanation: "'Did a presentation' should be 'gave/delivered a presentation'. The others are correct." },
          { type: "ORDERING", question: "Put in order: a / close / they / managed to / deal / the", correctAnswer: "They,managed to close,a deal", explanation: "Subject + managed to close + a deal." },
          { type: "SPEECH", question: "After months of negotiations, the two companies finally reached an agreement.", correctAnswer: "After months of negotiations, the two companies finally reached an agreement.", language: "en", hint: "Describe a successful business negotiation" },
          { type: "SPEECH", question: "She was headhunted by a major competitor and offered a senior position.", correctAnswer: "She was headhunted by a major competitor and offered a senior position.", language: "en", hint: "Talk about being recruited for a job" },
        ]
      },
      {
        title: "Health & Wellbeing Vocabulary",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "The doctor made a ___ after running several tests.", options: ["diagnosis", "diagnose", "diagnostic", "diagnosing"], correctAnswer: "0", explanation: "'Make a diagnosis' is the correct collocation." },
          { type: "MCQ", question: "She ___ a full recovery after the surgery.", options: ["made", "did", "took", "had"], correctAnswer: "0", explanation: "'Make a full recovery' is the correct collocation." },
          { type: "MCQ", question: "The side effects should ___ after a few days.", options: ["wear off", "go off", "take off", "turn off"], correctAnswer: "0", explanation: "'Wear off' = gradually disappear (for effects/feelings)." },
          { type: "MCQ", question: "He ___ symptoms of fatigue and headaches.", options: ["developed", "made", "did", "got"], correctAnswer: "0", explanation: "'Develop symptoms' is the formal collocation, though 'get symptoms' works casually." },
          { type: "TRUE_FALSE", question: "True or False: 'The doctor prescribed me some antibiotics' is correct.", correctAnswer: "true", explanation: "'Prescribe' = officially recommend medication." },
          { type: "TRUE_FALSE", question: "True or False: 'She did a diagnosis of the patient' is correct.", correctAnswer: "false", explanation: "Should be 'made a diagnosis', not 'did a diagnosis'." },
          { type: "FILL_BLANK", question: "Complete: He was ___ from the hospital after three days.", correctAnswer: "discharged", explanation: "'Discharged from hospital' = officially allowed to leave." },
          { type: "FILL_BLANK", question: "Complete: She suffers from chronic back ___.", correctAnswer: "pain", explanation: "'Chronic pain' = long-term persistent pain." },
          { type: "FILL_BLANK", question: "Complete: The patient is in ___ condition.", correctAnswer: "stable", explanation: "'Stable condition' = not deteriorating." },
          { type: "MATCHING", question: "Match the health collocation:", options: [{ left: "Prescribe", right: "medication" }, { left: "Undergo", right: "surgery" }, { left: "Suffer from", right: "a condition" }, { left: "Monitor", right: "vital signs" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb pairs with a specific medical term." },
          { type: "CHECKBOX", question: "Select all correct health sentences:", options: ["She made a quick recovery", "The doctor prescribed antibiotics", "He developed an allergy", "She did a treatment"], correctAnswer: "[0,1,2]", explanation: "'Did a treatment' should be 'received/underwent treatment'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / patient / discharged / was / yesterday", correctAnswer: "The patient,was discharged,yesterday", explanation: "Subject + was discharged + time." },
          { type: "SPEECH", question: "The doctor diagnosed me with a vitamin deficiency and prescribed supplements.", correctAnswer: "The doctor diagnosed me with a vitamin deficiency and prescribed supplements.", language: "en", hint: "Describe a medical consultation" },
          { type: "SPEECH", question: "After weeks of treatment, she finally made a full recovery.", correctAnswer: "After weeks of treatment, she finally made a full recovery.", language: "en", hint: "Talk about recovering from an illness" },
        ]
      },
      {
        title: "Environment & Society Topics",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Governments must take action to ___ carbon emissions.", options: ["reduce", "decrease", "lessen", "shrink"], correctAnswer: "0", explanation: "'Reduce emissions' is the standard collocation, not 'decrease emissions'." },
          { type: "MCQ", question: "We need to ___ our carbon footprint.", options: ["reduce", "decrease", "minimize", "both A and C"], correctAnswer: "3", explanation: "Both 'reduce' and 'minimize' work with 'carbon footprint'." },
          { type: "MCQ", question: "The organization works to ___ endangered species.", options: ["conserve", "preserve", "protect", "all of the above"], correctAnswer: "3", explanation: "All three verbs collocate with environmental protection contexts." },
          { type: "MCQ", question: "Climate change is one of the biggest ___ of our time.", options: ["challenges", "issues", "problems", "all of the above"], correctAnswer: "3", explanation: "All three work, but 'challenges' is most common in formal contexts." },
          { type: "TRUE_FALSE", question: "True or False: 'We must address inequality in education' is correct.", correctAnswer: "true", explanation: "'Address inequality' = deal with/tackle inequality." },
          { type: "TRUE_FALSE", question: "True or False: 'The government decreased emissions by 20%' is the best collocation.", correctAnswer: "false", explanation: "'Reduced emissions' is the standard collocation, not 'decreased'." },
          { type: "FILL_BLANK", question: "Complete: Many species are at ___ of extinction.", correctAnswer: "risk", explanation: "'At risk of extinction' = in danger of dying out." },
          { type: "FILL_BLANK", question: "Complete: We should invest in ___ energy sources.", correctAnswer: "renewable", explanation: "'Renewable energy' = solar, wind, hydro, etc." },
          { type: "FILL_BLANK", question: "Complete: The conference aims to promote ___ development.", correctAnswer: "sustainable", explanation: "'Sustainable development' = development that meets present needs without compromising the future." },
          { type: "MATCHING", question: "Match the environmental collocation:", options: [{ left: "Combat", right: "climate change" }, { left: "Protect", right: "biodiversity" }, { left: "Adopt", right: "green policies" }, { left: "Raise", right: "awareness" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb pairs with a specific environmental term." },
          { type: "CHECKBOX", question: "Select all correct environmental sentences:", options: ["We must reduce our carbon footprint", "The government adopted new green policies", "They addressed the issue of deforestation", "We need to decrease pollution levels"], correctAnswer: "[0,1,2]", explanation: "'Decrease pollution' should be 'reduce pollution'. The others are correct." },
          { type: "ORDERING", question: "Put in order: reduce / we / must / our / waste", correctAnswer: "We,must reduce,our waste", explanation: "Subject + must reduce + object." },
          { type: "SPEECH", question: "We need to invest more in renewable energy to combat climate change effectively.", correctAnswer: "We need to invest more in renewable energy to combat climate change effectively.", language: "en", hint: "Discuss solutions to environmental problems" },
          { type: "SPEECH", question: "The organization raises awareness about the importance of protecting biodiversity.", correctAnswer: "The organization raises awareness about the importance of protecting biodiversity.", language: "en", hint: "Talk about environmental advocacy" },
        ]
      },
      {
        title: "Media & Communication Vocabulary",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "The story received wide ___ in the national press.", options: ["coverage", "covering", "cover", "covered"], correctAnswer: "0", explanation: "'Receive coverage' = be reported about. Not 'have coverage'." },
          { type: "MCQ", question: "The journalist ___ a reliable source for the information.", options: ["cited", "quoted", "referenced", "all of the above"], correctAnswer: "3", explanation: "All three verbs work with 'source' in journalism." },
          { type: "MCQ", question: "The article was highly ___, presenting only one side of the story.", options: ["biased", "bias", "biases", "biasing"], correctAnswer: "0", explanation: "'Biased' = showing prejudice or one-sidedness." },
          { type: "MCQ", question: "The newspaper published an ___ correcting the errors in the previous article.", options: ["editorial", "correction", "retraction", "apology"], correctAnswer: "1", explanation: "'Correction' = a published statement correcting an error." },
          { type: "TRUE_FALSE", question: "True or False: 'The broadcast was live' means it was shown as it happened.", correctAnswer: "true", explanation: "'Live broadcast' = shown/transmitted in real time." },
          { type: "TRUE_FALSE", question: "True or False: 'The headline was sensational' means it was designed to attract attention.", correctAnswer: "true", explanation: "'Sensational headline' = exaggerated to grab attention." },
          { type: "FILL_BLANK", question: "Complete: The scandal ___ the front page of every newspaper.", correctAnswer: "made", explanation: "'Make the front page' = be featured prominently." },
          { type: "FILL_BLANK", question: "Complete: The report ___ serious concerns about data privacy.", correctAnswer: "raised", explanation: "'Raise concerns' = bring attention to worries/issues." },
          { type: "FILL_BLANK", question: "Complete: The documentary ___ light on the issue of corruption.", correctAnswer: "shed", explanation: "'Shed light on' = reveal/explain something." },
          { type: "MATCHING", question: "Match the media collocation:", options: [{ left: "Break", right: "the news" }, { left: "Go", right: "viral" }, { left: "Issue", right: "a statement" }, { left: "Leak", right: "information" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb pairs with a specific media term." },
          { type: "CHECKBOX", question: "Select all correct media sentences:", options: ["The story went viral on social media", "The journalist cited an anonymous source", "The newspaper issued a correction", "The report had wide covering"], correctAnswer: "[0,1,2]", explanation: "'Wide covering' should be 'wide coverage'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / story / went / viral / within hours", correctAnswer: "The story,went viral,within hours", explanation: "Subject + went viral + time." },
          { type: "SPEECH", question: "The journalist broke the story about government corruption, which sparked a national debate.", correctAnswer: "The journalist broke the story about government corruption, which sparked a national debate.", language: "en", hint: "Talk about investigative journalism" },
          { type: "SPEECH", question: "The documentary shed light on the living conditions of migrant workers.", correctAnswer: "The documentary shed light on the living conditions of migrant workers.", language: "en", hint: "Describe a documentary's impact" },
        ]
      },
      {
        title: "Module 7 Review: Advanced Vocabulary & Collocations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "The company managed to ___ a profitable deal with international partners.", options: ["close", "make", "do", "seal"], correctAnswer: "0", explanation: "'Close a deal' or 'seal a deal' are correct. 'Close' is more common." },
          { type: "MCQ", question: "The doctor ___ a thorough examination before making a diagnosis.", options: ["conducted", "made", "did", "took"], correctAnswer: "0", explanation: "'Conduct an examination' is the formal collocation." },
          { type: "MCQ", question: "Countries must work together to ___ the effects of global warming.", options: ["mitigate", "reduce", "combat", "all of the above"], correctAnswer: "3", explanation: "All three verbs work with environmental contexts." },
          { type: "MCQ", question: "The article ___ widespread public debate about the issue.", options: ["sparked", "ignited", "triggered", "all of the above"], correctAnswer: "3", explanation: "All three verbs collocate with 'debate'." },
          { type: "TRUE_FALSE", question: "True or False: 'She made a full recovery' is the correct collocation.", correctAnswer: "true", explanation: "'Make a recovery' is the standard health collocation." },
          { type: "TRUE_FALSE", question: "True or False: 'The newspaper did an editorial about the crisis' is correct.", correctAnswer: "false", explanation: "Should be 'published/wrote an editorial', not 'did an editorial'." },
          { type: "FILL_BLANK", question: "Complete: The government needs to ___ the issue of unemployment.", correctAnswer: "address", explanation: "'Address an issue' = deal with/tackle a problem." },
          { type: "FILL_BLANK", question: "Complete: The whistleblower ___ confidential documents to the press.", correctAnswer: "leaked", explanation: "'Leak documents' = disclose secretly." },
          { type: "FILL_BLANK", question: "Complete: The patient ___ an adverse reaction to the medication.", correctAnswer: "experienced", explanation: "'Experience a reaction' is the formal collocation." },
          { type: "MATCHING", question: "Match the collocation category:", options: [{ left: "Close a deal", right: "Business" }, { left: "Make a recovery", right: "Health" }, { left: "Reduce emissions", right: "Environment" }, { left: "Go viral", right: "Media" }], correctAnswer: "[0,1,2,3]", explanation: "Each collocation belongs to a specific topic area." },
          { type: "CHECKBOX", question: "Select all correct collocations:", options: ["She delivered a compelling presentation", "The company implemented new policies", "He developed symptoms of the disease", "The article had wide covering"], correctAnswer: "[0,1,2]", explanation: "'Wide covering' should be 'wide coverage'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / sparked / documentary / debate / a / national", correctAnswer: "The documentary,sparked,a national debate", explanation: "Subject + sparked + object." },
          { type: "SPEECH", question: "The company implemented a comprehensive sustainability strategy to reduce its environmental impact.", correctAnswer: "The company implemented a comprehensive sustainability strategy to reduce its environmental impact.", language: "en", hint: "Describe corporate environmental action" },
          { type: "SPEECH", question: "The investigative journalist broke the story that led to significant political reform.", correctAnswer: "The investigative journalist broke the story that led to significant political reform.", language: "en", hint: "Talk about journalism's impact on society" },
          { type: "SPEECH", question: "After months of negotiation, the two sides finally reached a mutually beneficial agreement.", correctAnswer: "After months of negotiation, the two sides finally reached a mutually beneficial agreement.", language: "en", hint: "Describe a successful negotiation outcome" },
        ]
      },
    ]
  },
  {
    title: "Phrasal Verbs & Idioms Mastery",
    lessons: [
      {
        title: "Essential Phrasal Verbs: Get, Take, Bring",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She ___ well with all her colleagues.", options: ["gets along", "gets on", "both A and B", "gets up"], correctAnswer: "2", explanation: "Both 'gets along with' and 'gets on with' mean has a good relationship." },
          { type: "MCQ", question: "Can you ___ this report to the manager?", options: ["take", "bring", "carry", "both A and B"], correctAnswer: "3", explanation: "'Take' (away from speaker) and 'bring' (toward listener) both work depending on perspective." },
          { type: "MCQ", question: "He finally ___ to the truth after hours of questioning.", options: ["came around", "came round", "both A and B", "came up"], correctAnswer: "2", explanation: "Both 'came around' and 'came round' mean changed opinion/agreed." },
          { type: "MCQ", question: "The meeting has been ___ until next Monday.", options: ["put off", "put on", "put up", "put away"], correctAnswer: "0", explanation: "'Put off' = postpone/delay." },
          { type: "TRUE_FALSE", question: "True or False: 'Get over' means to recover from something.", correctAnswer: "true", explanation: "'Get over an illness/a breakup' = recover from." },
          { type: "TRUE_FALSE", question: "True or False: 'Take after' means to resemble a family member.", correctAnswer: "true", explanation: "'Take after someone' = look/act like a relative." },
          { type: "FILL_BLANK", question: "Complete: I need to ___ my act ___ if I want to pass this exam.", correctAnswer: "get, together", explanation: "'Get your act together' = become organized." },
          { type: "FILL_BLANK", question: "Complete: She ___ her success ___ to hard work and determination.", correctAnswer: "puts, down", explanation: "'Put down to' = attribute to." },
          { type: "FILL_BLANK", question: "Complete: The project really ___ when we got the new funding.", correctAnswer: "took off", explanation: "'Take off' = become successful quickly." },
          { type: "MATCHING", question: "Match the phrasal verb:", options: [{ left: "Get across", right: "Communicate successfully" }, { left: "Take over", right: "Assume control" }, { left: "Bring up", right: "Mention/raise a topic" }, { left: "Get through", right: "Survive/complete" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrasal verb has a distinct meaning." },
          { type: "CHECKBOX", question: "Select all correct phrasal verb sentences:", options: ["She gets along with everyone", "He takes after his father", "They put off the meeting", "I'll bring up the children well"], correctAnswer: "[0,1,2,3]", explanation: "All four are correct phrasal verb usages." },
          { type: "ORDERING", question: "Put in order: got / she / over / the / illness / quickly", correctAnswer: "She,got over the illness,quickly", explanation: "Subject + got over + object." },
          { type: "SPEECH", question: "It took me months to get over the loss of my job, but I eventually found something better.", correctAnswer: "It took me months to get over the loss of my job, but I eventually found something better.", language: "en", hint: "Talk about recovering from a difficult experience" },
          { type: "SPEECH", question: "The new CEO took over last month and has already implemented major changes.", correctAnswer: "The new CEO took over last month and has already implemented major changes.", language: "en", hint: "Describe a leadership transition" },
        ]
      },
      {
        title: "Essential Phrasal Verbs: Look, Turn, Run",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She ___ the document quickly before signing it.", options: ["looked over", "looked after", "looked into", "looked up"], correctAnswer: "0", explanation: "'Look over' = examine/scan quickly." },
          { type: "MCQ", question: "The situation ___ worse despite our efforts.", options: ["turned", "turned out", "turned into", "turned over"], correctAnswer: "0", explanation: "'Turn worse/better' = become worse/better." },
          { type: "MCQ", question: "We've ___ ___ sugar. Can you buy some?", options: ["run out of", "run into", "run over", "run through"], correctAnswer: "0", explanation: "'Run out of' = have no more left." },
          { type: "MCQ", question: "He ___ an old friend at the supermarket.", options: ["ran into", "ran over", "ran through", "ran out of"], correctAnswer: "0", explanation: "'Run into someone' = meet by chance." },
          { type: "TRUE_FALSE", question: "True or False: 'Look up to someone' means to admire them.", correctAnswer: "true", explanation: "'Look up to' = respect/admire." },
          { type: "TRUE_FALSE", question: "True or False: 'Turn down' means to increase volume.", correctAnswer: "false", explanation: "'Turn down' = decrease/reject. 'Turn up' = increase." },
          { type: "FILL_BLANK", question: "Complete: Can you ___ the children while I'm at work?", correctAnswer: "look after", explanation: "'Look after' = take care of." },
          { type: "FILL_BLANK", question: "Complete: The evidence ___ to be inconclusive.", correctAnswer: "turned out", explanation: "'Turn out to be' = prove to be." },
          { type: "FILL_BLANK", question: "Complete: She ___ her notes before the exam.", correctAnswer: "looked through", explanation: "'Look through' = read/examine." },
          { type: "MATCHING", question: "Match the phrasal verb:", options: [{ left: "Look forward to", right: "Anticipate with pleasure" }, { left: "Turn to", right: "Seek help from" }, { left: "Run out of", right: "Have none left" }, { left: "Look down on", right: "Consider inferior" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrasal verb has a specific meaning." },
          { type: "CHECKBOX", question: "Select all correct phrasal verb sentences:", options: ["I look forward to meeting you", "She turned to her friends for support", "We ran out of time", "He looked down at the document carefully"], correctAnswer: "[0,1,2]", explanation: "'Looked down at' means physically looked downward, not examined. 'Looked over' would be correct. 0, 1, 2 are correct." },
          { type: "ORDERING", question: "Put in order: ran / they / out of / money", correctAnswer: "They,ran out of,money", explanation: "Subject + ran out of + object." },
          { type: "SPEECH", question: "I'm really looking forward to the holiday after such a stressful few months.", correctAnswer: "I'm really looking forward to the holiday after such a stressful few months.", language: "en", hint: "Express anticipation about a future event" },
          { type: "SPEECH", question: "When I didn't know what to do, I turned to my mentor for advice.", correctAnswer: "When I didn't know what to do, I turned to my mentor for advice.", language: "en", hint: "Describe seeking guidance from someone" },
        ]
      },
      {
        title: "Essential Phrasal Verbs: Put, Come, Go",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She ___ a lot of effort into her work.", options: ["puts", "puts in", "puts on", "puts up"], correctAnswer: "1", explanation: "'Put in effort' = invest time/energy." },
          { type: "MCQ", question: "The idea ___ to her while she was in the shower.", options: ["came up", "came to", "came across", "came about"], correctAnswer: "1", explanation: "'Come to someone' = occur to someone's mind." },
          { type: "MCQ", question: "Things are ___ well for the company this quarter.", options: ["going", "going on", "going through", "going over"], correctAnswer: "0", explanation: "'Go well/badly' = progress well/badly." },
          { type: "MCQ", question: "He ___ with an excellent solution to the problem.", options: ["came up", "came about", "came across", "came to"], correctAnswer: "0", explanation: "'Come up with' = think of/invent." },
          { type: "TRUE_FALSE", question: "True or False: 'Put up with' means to tolerate.", correctAnswer: "true", explanation: "'Put up with' = endure/tolerate something unpleasant." },
          { type: "TRUE_FALSE", question: "True or False: 'Go through' means to experience something difficult.", correctAnswer: "true", explanation: "'Go through a difficult time' = experience hardship." },
          { type: "FILL_BLANK", question: "Complete: She couldn't ___ up ___ his rudeness any longer.", correctAnswer: "put, with", explanation: "'Put up with' = tolerate." },
          { type: "FILL_BLANK", question: "Complete: The plan ___ about due to miscommunication.", correctAnswer: "fell", explanation: "'Fall about' is wrong; should be 'fell through' = failed." },
          { type: "FILL_BLANK", question: "Complete: He ___ a fortune on his new car.", correctAnswer: "forked out", explanation: "'Fork out' = pay a large amount (informal)." },
          { type: "MATCHING", question: "Match the phrasal verb:", options: [{ left: "Put off", right: "Postpone" }, { left: "Come across", right: "Find by chance" }, { left: "Go through", right: "Experience/examine" }, { left: "Put forward", right: "Suggest/propose" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrasal verb has a distinct meaning." },
          { type: "CHECKBOX", question: "Select all correct phrasal verb sentences:", options: ["She came up with a brilliant idea", "He put forward a new proposal", "They went through a difficult period", "I put up the tent in the garden"], correctAnswer: "[0,1,2,3]", explanation: "All four are correct phrasal verb usages." },
          { type: "ORDERING", question: "Put in order: came / the / idea / to / suddenly / me", correctAnswer: "The idea,came to me,suddenly", explanation: "Subject + came to + object." },
          { type: "SPEECH", question: "I can't put up with this noise anymore; I need to find a quieter place to work.", correctAnswer: "I can't put up with this noise anymore; I need to find a quieter place to work.", language: "en", hint: "Express frustration about an intolerable situation" },
          { type: "SPEECH", question: "She came across an interesting article while researching for her thesis.", correctAnswer: "She came across an interesting article while researching for her thesis.", language: "en", hint: "Describe finding something by chance" },
        ]
      },
      {
        title: "Common English Idioms",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Let's call it a day.' This means:", options: ["Let's stop working", "Let's name the day", "Let's start a new day", "Let's plan the day"], correctAnswer: "0", explanation: "'Call it a day' = stop working for the day." },
          { type: "MCQ", question: "'She hit the nail on the head.' This means:", options: ["She was exactly right", "She hurt herself", "She built something", "She was aggressive"], correctAnswer: "0", explanation: "'Hit the nail on the head' = be exactly correct." },
          { type: "MCQ", question: "'He's sitting on the fence.' This means:", options: ["He can't decide", "He's resting", "He's watching", "He's trapped"], correctAnswer: "0", explanation: "'Sit on the fence' = avoid making a decision." },
          { type: "MCQ", question: "'The project went down the drain.' This means:", options: ["It failed completely", "It was cleaned", "It was improved", "It was delayed"], correctAnswer: "0", explanation: "'Go down the drain' = be wasted/failed." },
          { type: "TRUE_FALSE", question: "True or False: 'Bite the bullet' means to face a difficult situation bravely.", correctAnswer: "true", explanation: "'Bite the bullet' = endure something painful/unpleasant bravely." },
          { type: "TRUE_FALSE", question: "True or False: 'Break the ice' means to destroy something frozen.", correctAnswer: "false", explanation: "'Break the ice' = start a conversation in an awkward situation." },
          { type: "FILL_BLANK", question: "Complete: I was so nervous, but he helped break the ___ with a funny story.", correctAnswer: "ice", explanation: "'Break the ice' = relieve tension/start conversation." },
          { type: "FILL_BLANK", question: "Complete: She decided to bite the ___ and ask for a raise.", correctAnswer: "bullet", explanation: "'Bite the bullet' = face something difficult bravely." },
          { type: "FILL_BLANK", question: "Complete: After the scandal, the politician's career went down the ___.", correctAnswer: "drain", explanation: "'Go down the drain' = be ruined/wasted." },
          { type: "MATCHING", question: "Match the idiom:", options: [{ left: "Once in a blue moon", right: "Very rarely" }, { left: "Cost an arm and a leg", right: "Very expensive" }, { left: "Piece of cake", right: "Very easy" }, { left: "Under the weather", right: "Feeling ill" }], correctAnswer: "[0,1,2,3]", explanation: "Each idiom has a specific figurative meaning." },
          { type: "CHECKBOX", question: "Select all correctly used idioms:", options: ["It happens once in a blue moon", "The car cost an arm and a leg", "The exam was a piece of cake", "She hit the nail with the head"], correctAnswer: "[0,1,2]", explanation: "'Hit the nail with the head' is wrong; should be 'hit the nail on the head'. The others are correct." },
          { type: "ORDERING", question: "Put in order: it's / a / of / cake / piece", correctAnswer: "It's,a piece of cake", explanation: "'It's a piece of cake' = it's very easy." },
          { type: "SPEECH", question: "I don't see them often; it only happens once in a blue moon.", correctAnswer: "I don't see them often; it only happens once in a blue moon.", language: "en", hint: "Describe something that happens very rarely" },
          { type: "SPEECH", question: "The new smartphone cost an arm and a leg, but it was worth every penny.", correctAnswer: "The new smartphone cost an arm and a leg, but it was worth every penny.", language: "en", hint: "Talk about something very expensive" },
        ]
      },
      {
        title: "Module 8 Review: Phrasal Verbs & Idioms",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "She ___ her success ___ years of hard work.", options: ["put, down to", "put, up to", "put, on to", "put, off to"], correctAnswer: "0", explanation: "'Put down to' = attribute to." },
          { type: "MCQ", question: "We need to ___ this issue before it gets worse.", options: ["look into", "look after", "look over", "look up"], correctAnswer: "0", explanation: "'Look into' = investigate." },
          { type: "MCQ", question: "'Let's call it a day' means:", options: ["Let's stop working", "Let's start fresh", "Let's name it", "Let's schedule it"], correctAnswer: "0", explanation: "'Call it a day' = stop for the day." },
          { type: "MCQ", question: "He ___ an excellent idea during the brainstorming session.", options: ["came up with", "came across", "came to", "came about"], correctAnswer: "0", explanation: "'Come up with' = think of/invent." },
          { type: "TRUE_FALSE", question: "True or False: 'Put up with' means to tolerate.", correctAnswer: "true", explanation: "'Put up with' = endure something unpleasant." },
          { type: "TRUE_FALSE", question: "True or False: 'Hit the nail on the head' means to make a mistake.", correctAnswer: "false", explanation: "It means to be exactly right." },
          { type: "FILL_BLANK", question: "Complete: She couldn't ___ up ___ his constant complaining.", correctAnswer: "put, with", explanation: "'Put up with' = tolerate." },
          { type: "FILL_BLANK", question: "Complete: The meeting has been ___ off until Friday.", correctAnswer: "put", explanation: "'Put off' = postpone." },
          { type: "FILL_BLANK", question: "Complete: The solution was a piece of ___.", correctAnswer: "cake", explanation: "'Piece of cake' = very easy." },
          { type: "MATCHING", question: "Match the expression:", options: [{ left: "Run out of", right: "Have none left" }, { left: "Look forward to", right: "Anticipate with pleasure" }, { left: "Break the ice", right: "Start a conversation" }, { left: "Go through", right: "Experience" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression has a specific meaning." },
          { type: "CHECKBOX", question: "Select all correct sentences:", options: ["She gets along with everyone", "The project fell through", "He hit the nail on the head", "I look forward to meet you"], correctAnswer: "[0,1,2]", explanation: "'Look forward to meet' should be 'look forward to meeting'. The others are correct." },
          { type: "ORDERING", question: "Put in order: came / she / an / up with / idea / brilliant", correctAnswer: "She,came up with,a brilliant idea", explanation: "Subject + came up with + object." },
          { type: "SPEECH", question: "We've run out of time, so let's call it a day and continue tomorrow.", correctAnswer: "We've run out of time, so let's call it a day and continue tomorrow.", language: "en", hint: "Suggest stopping work due to time constraints" },
          { type: "SPEECH", question: "She put her success down to hard work, determination, and a bit of luck.", correctAnswer: "She put her success down to hard work, determination, and a bit of luck.", language: "en", hint: "Attribute success to multiple factors" },
          { type: "SPEECH", question: "I was nervous about the interview, but the interviewer broke the ice with a friendly joke.", correctAnswer: "I was nervous about the interview, but the interviewer broke the ice with a friendly joke.", language: "en", hint: "Describe how tension was relieved" },
        ]
      },
    ]
  },
  {
    title: "Relative Clauses & Complex Structures",
    lessons: [
      {
        title: "Defining vs Non-Defining Relative Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The man ___ lives next door is a doctor.'", options: ["who", "which", "whom", "whose"], correctAnswer: "0", explanation: "'Who' for people as the subject of the relative clause." },
          { type: "MCQ", question: "'The book, ___ was published in 1990, is now a classic.'", options: ["which", "that", "who", "whom"], correctAnswer: "0", explanation: "'Which' for non-defining clauses (with commas). 'That' cannot be used in non-defining clauses." },
          { type: "MCQ", question: "'The company ___ I work for is expanding.'", options: ["which/that", "who", "whom", "whose"], correctAnswer: "0", explanation: "'Which' or 'that' for things as the object of the relative clause." },
          { type: "MCQ", question: "What's the difference between defining and non-defining relative clauses?", options: ["Essential vs extra information", "Extra vs essential information", "Past vs present", "No difference"], correctAnswer: "0", explanation: "Defining = essential information (no commas). Non-defining = extra information (with commas)." },
          { type: "TRUE_FALSE", question: "True or False: 'My sister, who lives in London, is a teacher' has a non-defining clause.", correctAnswer: "true", explanation: "The commas indicate extra, non-essential information." },
          { type: "TRUE_FALSE", question: "True or False: 'That' can be used in non-defining relative clauses.", correctAnswer: "false", explanation: "'That' cannot be used in non-defining clauses (with commas). Use 'which'." },
          { type: "FILL_BLANK", question: "Complete: The woman ___ car was stolen reported it to the police.", correctAnswer: "whose", explanation: "'Whose' = possessive relative pronoun." },
          { type: "FILL_BLANK", question: "Complete: The reason ___ I'm calling is to apologize.", correctAnswer: "why", explanation: "'Why' for reasons." },
          { type: "FILL_BLANK", question: "Complete: The hotel ___ we stayed was wonderful.", correctAnswer: "where", explanation: "'Where' for places." },
          { type: "MATCHING", question: "Match the relative pronoun:", options: [{ left: "Who", right: "People (subject)" }, { left: "Whom", right: "People (object)" }, { left: "Which", right: "Things" }, { left: "Whose", right: "Possession" }], correctAnswer: "[0,1,2,3]", explanation: "Each relative pronoun has a specific grammatical function." },
          { type: "CHECKBOX", question: "Select all correct relative clause sentences:", options: ["The man who called is my brother", "The book, that I read, was excellent", "The city where I was born is beautiful", "The woman whose bag was stolen reported it"], correctAnswer: "[0,2,3]", explanation: "'That' in a non-defining clause (with commas) is wrong; use 'which'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / who / man / called / is / my / brother", correctAnswer: "The man who called,is my brother", explanation: "Noun + who + verb + main clause." },
          { type: "SPEECH", question: "The restaurant, which was recommended by a friend, turned out to be absolutely fantastic.", correctAnswer: "The restaurant, which was recommended by a friend, turned out to be absolutely fantastic.", language: "en", hint: "Describe a place with extra information" },
          { type: "SPEECH", question: "The student who scored the highest in the exam was awarded a scholarship.", correctAnswer: "The student who scored the highest in the exam was awarded a scholarship.", language: "en", hint: "Identify a specific person with essential information" },
        ]
      },
      {
        title: "Relative Clauses with Prepositions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The man ___ I spoke to was very helpful.'", options: ["whom/who", "which", "whose", "that"], correctAnswer: "0", explanation: "'Whom' (formal) or 'who' (informal) for people as the object." },
          { type: "MCQ", question: "'The house ___ which I grew up has been demolished.'", options: ["in", "on", "at", "from"], correctAnswer: "0", explanation: "'In which' = where I grew up. Formal relative clause with preposition." },
          { type: "MCQ", question: "'The person ___ whom the letter was addressed has moved.'", options: ["to", "for", "from", "with"], correctAnswer: "0", explanation: "'To whom' = the letter was addressed to this person." },
          { type: "MCQ", question: "In formal English, where does the preposition go in a relative clause?", options: ["Before the relative pronoun", "After the verb", "At the end of the sentence", "Both A and B"], correctAnswer: "3", explanation: "Formal: preposition before pronoun ('to whom'). Informal: preposition at the end ('who...to')." },
          { type: "TRUE_FALSE", question: "True or False: 'The man to whom I spoke' is more formal than 'The man who I spoke to.'", correctAnswer: "true", explanation: "Preposition before the pronoun is more formal." },
          { type: "TRUE_FALSE", question: "True or False: 'The table on which the book is lying' is correct.", correctAnswer: "true", explanation: "Preposition + which = formal relative clause." },
          { type: "FILL_BLANK", question: "Complete: The tools ___ which he fixed the car were in the garage.", correctAnswer: "with", explanation: "'With which' = the tools he used to fix." },
          { type: "FILL_BLANK", question: "Complete: The day ___ which we met was unforgettable.", correctAnswer: "on", explanation: "'On which' = the specific day." },
          { type: "FILL_BLANK", question: "Complete: The reason ___ which she left remains unclear.", correctAnswer: "for", explanation: "'For which' = the reason." },
          { type: "MATCHING", question: "Match the preposition:", options: [{ left: "In which", right: "Inside/within" }, { left: "On which", right: "Surface/day" }, { left: "With which", right: "Using" }, { left: "For which", right: "Purpose/reason" }], correctAnswer: "[0,1,2,3]", explanation: "Each preposition relates to a different spatial/logical relationship." },
          { type: "CHECKBOX", question: "Select all correct relative clause + preposition sentences:", options: ["The person to whom I spoke was kind", "The house in which I live is old", "The book about which she wrote was popular", "The man who I talked to him was rude"], correctAnswer: "[0,1,2]", explanation: "'Who I talked to him' has a redundant 'him'; should be 'who I talked to' or 'to whom I talked'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / in / city / I / grew up / is / beautiful", correctAnswer: "The city,in which I grew up,is beautiful", explanation: "Noun + in which + clause + main clause." },
          { type: "SPEECH", question: "The conference at which she presented her research was held in Geneva.", correctAnswer: "The conference at which she presented her research was held in Geneva.", language: "en", hint: "Describe an event using formal relative structure" },
          { type: "SPEECH", question: "The colleagues with whom I worked on the project were incredibly supportive.", correctAnswer: "The colleagues with whom I worked on the project were incredibly supportive.", language: "en", hint: "Describe people you collaborated with formally" },
        ]
      },
      {
        title: "Reduced Relative Clauses & Participle Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The man ___ at the bus stop is my teacher.'", options: ["standing", "who standing", "who is standing", "both A and C"], correctAnswer: "3", explanation: "Both 'standing' (reduced) and 'who is standing' (full) are correct." },
          { type: "MCQ", question: "'The book ___ last year won an award.'", options: ["published", "which published", "was published", "publishing"], correctAnswer: "0", explanation: "'Published' = reduced passive relative clause (which was published)." },
          { type: "MCQ", question: "'___ by the noise, she opened the window.'", options: ["Disturbed", "Disturbing", "Disturb", "Was disturbed"], correctAnswer: "0", explanation: "Past participle clause: 'Disturbed by the noise' = Because she was disturbed." },
          { type: "MCQ", question: "What's the difference between 'the woman wearing a red dress' and 'the woman who is wearing a red dress'?", options: ["No difference in meaning", "Different meaning", "One is wrong", "One is past tense"], correctAnswer: "0", explanation: "Both are correct; the first is a reduced relative clause." },
          { type: "TRUE_FALSE", question: "True or False: 'Students completing the exam early can leave' is correct.", correctAnswer: "true", explanation: "Reduced relative clause: 'Students who complete' → 'Students completing'." },
          { type: "TRUE_FALSE", question: "True or False: 'The cake eating by the children was delicious' is correct.", correctAnswer: "false", explanation: "Should be 'The cake being eaten by the children' (passive)." },
          { type: "FILL_BLANK", question: "Complete: ___ in 1990, the company has grown significantly.", correctAnswer: "Founded", explanation: "Past participle clause: 'Having been founded' → 'Founded'." },
          { type: "FILL_BLANK", question: "Complete: The letter ___ yesterday requires a response.", correctAnswer: "received", explanation: "Reduced passive: 'that was received' → 'received'." },
          { type: "FILL_BLANK", question: "Complete: ___ the report, she submitted it to her manager.", correctAnswer: "Having finished", explanation: "Perfect participle: after she had finished." },
          { type: "MATCHING", question: "Match the participle type:", options: [{ left: "Present participle (-ing)", right: "Active/ongoing" }, { left: "Past participle (-ed)", right: "Passive/completed" }, { left: "Perfect participle (having + pp)", right: "Completed before main action" }, { left: "Being + pp", right: "Ongoing passive" }], correctAnswer: "[0,1,2,3]", explanation: "Each participle form has a different grammatical function." },
          { type: "CHECKBOX", question: "Select all correct reduced relative/participle sentences:", options: ["The man standing outside is waiting for you", "Founded in 1890, the university is prestigious", "Having finished his work, he went home", "The book reading by students was difficult"], correctAnswer: "[0,1,2]", explanation: "'The book reading' should be 'The book being read'. The others are correct." },
          { type: "ORDERING", question: "Put in order: standing / the / man / at / door / is / my / uncle", correctAnswer: "The man standing at the door,is my uncle", explanation: "Noun + present participle phrase + main clause." },
          { type: "SPEECH", question: "Born in a small village, he went on to become one of the most influential scientists of his generation.", correctAnswer: "Born in a small village, he went on to become one of the most influential scientists of his generation.", language: "en", hint: "Describe someone's background using a participle clause" },
          { type: "SPEECH", question: "Having completed all the requirements, she finally received her degree.", correctAnswer: "Having completed all the requirements, she finally received her degree.", language: "en", hint: "Describe achieving something after completing prerequisites" },
        ]
      },
      {
        title: "Cleft Sentences & Emphasis Structures",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ I need is a good night's sleep.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "'What I need' = cleft sentence for emphasis." },
          { type: "MCQ", question: "'It was John ___ broke the window.'", options: ["who/that", "which", "whom", "whose"], correctAnswer: "0", explanation: "'It was John who/that...' = it-cleft for emphasis." },
          { type: "MCQ", question: "'___ annoys me is his constant complaining.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "'What annoys me' = wh-cleft for emphasis." },
          { type: "MCQ", question: "What's the purpose of a cleft sentence?", options: ["To emphasize specific information", "To ask a question", "To negate something", "To describe a process"], correctAnswer: "0", explanation: "Cleft sentences split information to emphasize a particular part." },
          { type: "TRUE_FALSE", question: "True or False: 'What I want is a new car' is a wh-cleft sentence.", correctAnswer: "true", explanation: "Wh-cleft: 'What' clause + be + emphasized element." },
          { type: "TRUE_FALSE", question: "True or False: 'It was yesterday when I met her' is an it-cleft.", correctAnswer: "true", explanation: "It-cleft: 'It was' + emphasized element + relative clause." },
          { type: "FILL_BLANK", question: "Complete: ___ really matters is your attitude.", correctAnswer: "What", explanation: "Wh-cleft: 'What really matters' = the thing that really matters." },
          { type: "FILL_BLANK", question: "Complete: It was the teacher ___ inspired me to study harder.", correctAnswer: "who/that", explanation: "It-cleft emphasizing the subject." },
          { type: "FILL_BLANK", question: "Complete: ___ I don't agree with is his approach.", correctAnswer: "What", explanation: "Wh-cleft: 'What I don't agree with' = the thing I disagree with." },
          { type: "MATCHING", question: "Match the cleft type:", options: [{ left: "It was she who called", right: "It-cleft (person emphasis)" }, { left: "What I need is help", right: "Wh-cleft (thing emphasis)" }, { left: "Where I grew up was small", right: "Wh-cleft (place emphasis)" }, { left: "Why he left remains unclear", right: "Wh-cleft (reason emphasis)" }], correctAnswer: "[0,1,2,3]", explanation: "Each cleft type emphasizes different information." },
          { type: "CHECKBOX", question: "Select all correct cleft sentences:", options: ["What I love about Paris is the food", "It was John who won the prize", "Where she lives is a mystery", "That I need is time"], correctAnswer: "[0,1,2]", explanation: "'That I need is time' should be 'What I need is time'. The others are correct." },
          { type: "ORDERING", question: "Put in order: what / I / is / need / a break", correctAnswer: "What I need,is a break", explanation: "What + subject + verb + is + emphasized element." },
          { type: "SPEECH", question: "What really impressed me about the presentation was the speaker's confidence and clarity.", correctAnswer: "What really impressed me about the presentation was the speaker's confidence and clarity.", language: "en", hint: "Emphasize what impressed you about something" },
          { type: "SPEECH", question: "It wasn't the cost that bothered me; it was the poor quality of the product.", correctAnswer: "It wasn't the cost that bothered me; it was the poor quality of the product.", language: "en", hint: "Contrast two factors using cleft sentences" },
        ]
      },
      {
        title: "Module 9 Review: Relative Clauses & Complex Structures",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The movie, ___ director won an Oscar, was a huge success.'", options: ["whose", "who", "which", "that"], correctAnswer: "0", explanation: "'Whose' = possessive relative pronoun (the movie's director)." },
          { type: "MCQ", question: "'___ caused the accident is still under investigation.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "Wh-cleft: 'What caused the accident' = the thing that caused it." },
          { type: "MCQ", question: "'The building ___ in 1920 is now a museum.'", options: ["built", "which built", "was built", "building"], correctAnswer: "0", explanation: "Reduced passive relative clause: 'built' = 'which was built'." },
          { type: "MCQ", question: "'It was his dedication ___ led to his promotion.'", options: ["that/which", "who", "whom", "whose"], correctAnswer: "0", explanation: "It-cleft: 'It was...that/which...' for things." },
          { type: "TRUE_FALSE", question: "True or False: 'The students studying in the library are preparing for exams' is correct.", correctAnswer: "true", explanation: "Reduced relative clause: 'who are studying' → 'studying'." },
          { type: "TRUE_FALSE", question: "True or False: 'The city in where I was born' is correct.", correctAnswer: "false", explanation: "Should be 'The city where I was born' or 'The city in which I was born'." },
          { type: "FILL_BLANK", question: "Complete: The reason ___ he resigned is still unknown.", correctAnswer: "why", explanation: "'Why' for reasons." },
          { type: "FILL_BLANK", question: "Complete: ___ I admire most about her is her determination.", correctAnswer: "What", explanation: "Wh-cleft: 'What I admire most' = the thing I admire most." },
          { type: "FILL_BLANK", question: "Complete: The artist, ___ paintings are displayed worldwide, passed away last year.", correctAnswer: "whose", explanation: "'Whose' for possession in non-defining clause." },
          { type: "MATCHING", question: "Match the structure:", options: [{ left: "Who/which/that", right: "Relative pronouns" }, { left: "Present participle", right: "Reduced active relative" }, { left: "Past participle", right: "Reduced passive relative" }, { left: "It was...that", right: "It-cleft emphasis" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure serves a different grammatical purpose." },
          { type: "CHECKBOX", question: "Select all correct complex sentences:", options: ["The man who called is my uncle", "Built in 1900, the house needs renovation", "What I need is more time", "The woman whom I spoke to she was helpful"], correctAnswer: "[0,1,2]", explanation: "'Whom I spoke to she' has redundant 'she'; should be 'whom I spoke to'. The others are correct." },
          { type: "ORDERING", question: "Put in order: what / matters / most / is / honesty", correctAnswer: "What matters most,is honesty", explanation: "What + verb + adverb + is + emphasized element." },
          { type: "SPEECH", question: "The book, which was written by a former student, has become a bestseller worldwide.", correctAnswer: "The book, which was written by a former student, has become a bestseller worldwide.", language: "en", hint: "Describe a book with additional information" },
          { type: "SPEECH", question: "What surprised me most about the trip was the incredible hospitality of the locals.", correctAnswer: "What surprised me most about the trip was the incredible hospitality of the locals.", language: "en", hint: "Emphasize the most surprising aspect of an experience" },
          { type: "SPEECH", question: "It was only after years of practice that she finally mastered the piano.", correctAnswer: "It was only after years of practice that she finally mastered the piano.", language: "en", hint: "Emphasize the time it took to achieve something" },
        ]
      },
    ]
  },
  {
    title: "Discourse Markers & Cohesive Devices",
    lessons: [
      {
        title: "Contrast & Concession Connectors",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the heavy traffic, we arrived on time.'", options: ["Despite", "Although", "However", "But"], correctAnswer: "0", explanation: "'Despite' + noun phrase: 'Despite the heavy traffic'." },
          { type: "MCQ", question: "'___ it was raining, we went hiking.'", options: ["Although", "Despite", "However", "In spite"], correctAnswer: "0", explanation: "'Although' + clause: 'Although it was raining'." },
          { type: "MCQ", question: "'The plan is risky. ___, it might be worth trying.'", options: ["However", "Although", "Despite", "But"], correctAnswer: "0", explanation: "'However' + comma = contrast between sentences." },
          { type: "MCQ", question: "'___ the fact that he was tired, he continued working.'", options: ["Despite", "Although", "However", "But"], correctAnswer: "0", explanation: "'Despite the fact that' + clause = although." },
          { type: "TRUE_FALSE", question: "True or False: 'In spite of' and 'despite' mean the same thing.", correctAnswer: "true", explanation: "Both express contrast with a noun phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Although the rain' is correct.", correctAnswer: "false", explanation: "Should be 'Although it was raining' (clause) or 'Despite the rain' (noun phrase)." },
          { type: "FILL_BLANK", question: "Complete: ___ being wealthy, he lives very modestly.", correctAnswer: "Despite", explanation: "'Despite' + verb-ing/noun phrase." },
          { type: "FILL_BLANK", question: "Complete: She is very outgoing, ___ her brother is quite shy.", correctAnswer: "whereas", explanation: "'Whereas' contrasts two different people." },
          { type: "FILL_BLANK", question: "Complete: The evidence was strong. ___, the jury acquitted the defendant.", correctAnswer: "Nevertheless", explanation: "'Nevertheless' = despite that/however." },
          { type: "MATCHING", question: "Match the connector:", options: [{ left: "Although + clause", right: "Despite + noun" }, { left: "In spite of + noun", right: "Despite + noun" }, { left: "Whereas + clause", right: "Contrast two things" }, { left: "While + clause", right: "Simultaneous or contrast" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector has a specific structure." },
          { type: "CHECKBOX", question: "Select all correct connector usage:", options: ["Although it rained, we had fun", "Despite the rain, we had fun", "Whereas I like coffee, she likes tea", "Although the rain, we had fun"], correctAnswer: "[0,1,2]", explanation: "'Although the rain' should be 'Although it rained' or 'Despite the rain'. The others are correct." },
          { type: "ORDERING", question: "Put in order: despite / the / they / weather / bad / continued / working", correctAnswer: "Despite the bad weather,they continued working", explanation: "Despite + noun phrase, main clause." },
          { type: "SPEECH", question: "Although it was very cold, they decided to go hiking in the mountains.", correctAnswer: "Although it was very cold, they decided to go hiking in the mountains.", language: "en", hint: "Use 'although' to show a surprising decision" },
          { type: "SPEECH", question: "My sister is very organized, whereas I am quite messy.", correctAnswer: "My sister is very organized, whereas I am quite messy.", language: "en", hint: "Compare yourself with someone using 'whereas'" },
        ]
      },
      {
        title: "Addition & Sequencing Connectors",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The plan is cost-effective. ___, it's easy to implement.'", options: ["Furthermore", "However", "Although", "Despite"], correctAnswer: "0", explanation: "'Furthermore' adds supporting information." },
          { type: "MCQ", question: "'___, we need to consider the environmental impact.'", options: ["In addition", "On the contrary", "Despite", "Although"], correctAnswer: "0", explanation: "'In addition' = moreover/furthermore." },
          { type: "MCQ", question: "'___ the initial setup, the system requires minimal maintenance.'", options: ["Apart from", "However", "Nevertheless", "On the contrary"], correctAnswer: "0", explanation: "'Apart from' = except for/in addition to." },
          { type: "MCQ", question: "'___, let me outline the main points.'", options: ["To begin with", "In conclusion", "On the contrary", "Nevertheless"], correctAnswer: "0", explanation: "'To begin with' starts a sequence of points." },
          { type: "TRUE_FALSE", question: "True or False: 'Moreover' and 'furthermore' can be used interchangeably.", correctAnswer: "true", explanation: "Both add information and strengthen an argument." },
          { type: "TRUE_FALSE", question: "True or False: 'Firstly...secondly...finally' is a sequencing structure.", correctAnswer: "true", explanation: "These connectors organize points in order." },
          { type: "FILL_BLANK", question: "Complete: The product is affordable. ___, it's very durable.", correctAnswer: "Moreover", explanation: "'Moreover' adds a further positive point." },
          { type: "FILL_BLANK", question: "Complete: ___, I'd like to thank everyone for coming.", correctAnswer: "First of all", explanation: "'First of all' starts a speech/presentation." },
          { type: "FILL_BLANK", question: "Complete: The software is fast. ___, it's user-friendly.", correctAnswer: "Additionally", explanation: "'Additionally' = in addition/moreover." },
          { type: "MATCHING", question: "Match the connector:", options: [{ left: "Furthermore", right: "Adding information" }, { left: "To begin with", right: "Starting a sequence" }, { left: "Subsequently", right: "Following in time" }, { left: "Finally", right: "Last point" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector serves a different sequencing/addition function." },
          { type: "CHECKBOX", question: "Select all correct addition/sequencing sentences:", options: ["The hotel was clean; furthermore, it was affordable", "First of all, let me introduce myself", "The plan failed; subsequently, we revised it", "However, the results were impressive"], correctAnswer: "[0,1,2]", explanation: "'However' is a contrast connector, not addition/sequencing. The others are correct." },
          { type: "ORDERING", question: "Put in order: first / of / let / me / all / explain", correctAnswer: "First of all,let me explain", explanation: "First of all + clause." },
          { type: "SPEECH", question: "The proposal is innovative; furthermore, it's financially viable and environmentally sustainable.", correctAnswer: "The proposal is innovative; furthermore, it's financially viable and environmentally sustainable.", language: "en", hint: "Add multiple supporting points to an argument" },
          { type: "SPEECH", question: "First of all, I'd like to welcome everyone to today's conference.", correctAnswer: "First of all, I'd like to welcome everyone to today's conference.", language: "en", hint: "Open a formal presentation" },
        ]
      },
      {
        title: "Cause, Effect & Result Connectors",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The company invested heavily in R&D. ___, it launched several innovative products.'", options: ["As a result", "However", "Although", "Despite"], correctAnswer: "0", explanation: "'As a result' shows consequence." },
          { type: "MCQ", question: "'___ the drought, crop yields dropped significantly.'", options: ["Due to", "Although", "However", "Despite"], correctAnswer: "0", explanation: "'Due to' + noun phrase = because of." },
          { type: "MCQ", question: "'He worked hard; ___, he achieved his goals.'", options: ["consequently", "however", "although", "despite"], correctAnswer: "0", explanation: "'Consequently' = as a result/therefore." },
          { type: "MCQ", question: "'The flight was delayed ___ bad weather.'", options: ["owing to", "although", "however", "despite"], correctAnswer: "0", explanation: "'Owing to' = because of (formal)." },
          { type: "TRUE_FALSE", question: "True or False: 'Therefore' and 'consequently' can be used interchangeably.", correctAnswer: "true", explanation: "Both show result/consequence." },
          { type: "TRUE_FALSE", question: "True or False: 'Due to' and 'because of' always mean the same thing.", correctAnswer: "false", explanation: "'Due to' should follow 'be' (formal); 'because of' is more flexible." },
          { type: "FILL_BLANK", question: "Complete: The road was closed ___ the heavy snowfall.", correctAnswer: "due to", explanation: "'Due to' + noun phrase for cause." },
          { type: "FILL_BLANK", question: "Complete: She studied diligently. ___, she passed with distinction.", correctAnswer: "Consequently", explanation: "'Consequently' = as a result." },
          { type: "FILL_BLANK", question: "Complete: ___ the lack of funding, the project was canceled.", correctAnswer: "Due to", explanation: "'Due to' + noun phrase for cause." },
          { type: "MATCHING", question: "Match the connector:", options: [{ left: "Due to", right: "Cause (noun phrase)" }, { left: "Therefore", right: "Result" }, { left: "Consequently", right: "Consequence" }, { left: "As a result", right: "Result" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector expresses a cause-effect relationship." },
          { type: "CHECKBOX", question: "Select all correct cause/effect sentences:", options: ["Due to the storm, flights were canceled", "She trained hard; consequently, she won", "The project failed owing to poor management", "Because of the fact that he was late"], correctAnswer: "[0,1,2]", explanation: "'Because of the fact that' is wordy; 'because' alone is better. The others are correct." },
          { type: "ORDERING", question: "Put in order: as / the / result / of / accident / he / was / injured", correctAnswer: "As a result of the accident,he was injured", explanation: "As a result of + noun phrase, main clause." },
          { type: "SPEECH", question: "Due to the increasing demand for renewable energy, the company invested heavily in solar technology.", correctAnswer: "Due to the increasing demand for renewable energy, the company invested heavily in solar technology.", language: "en", hint: "Explain a business decision with a cause" },
          { type: "SPEECH", question: "The team worked tirelessly for months; consequently, they delivered the project ahead of schedule.", correctAnswer: "The team worked tirelessly for months; consequently, they delivered the project ahead of schedule.", language: "en", hint: "Describe effort leading to a positive result" },
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
        title: "Module 10 Review: Discourse Markers & Cohesive Devices",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the fact that she was exhausted, she finished the marathon.'", options: ["Despite", "Although", "However", "But"], correctAnswer: "0", explanation: "'Despite the fact that' + clause = although." },
          { type: "MCQ", question: "'The policy is effective. ___, it has some drawbacks.'", options: ["Nevertheless", "Although", "Despite", "Because"], correctAnswer: "0", explanation: "'Nevertheless' = despite that/however." },
          { type: "MCQ", question: "'The report was thorough. ___, it was well-researched.'", options: ["Furthermore", "However", "Although", "Despite"], correctAnswer: "0", explanation: "'Furthermore' adds supporting information." },
          { type: "MCQ", question: "'___ the rising costs, the company remained profitable.'", options: ["Despite", "Although", "However", "Therefore"], correctAnswer: "0", explanation: "'Despite' + noun phrase for contrast." },
          { type: "TRUE_FALSE", question: "True or False: 'In addition to' can be followed by a noun phrase.", correctAnswer: "true", explanation: "'In addition to' + noun phrase = as well as." },
          { type: "TRUE_FALSE", question: "True or False: 'On the contrary' and 'on the other hand' mean the same thing.", correctAnswer: "false", explanation: "'On the contrary' contradicts; 'on the other hand' presents an alternative." },
          { type: "FILL_BLANK", question: "Complete: The evidence is overwhelming. ___, the jury reached a guilty verdict.", correctAnswer: "Consequently", explanation: "'Consequently' = as a result." },
          { type: "FILL_BLANK", question: "Complete: ___, I'd like to address the main concerns raised.", correctAnswer: "To begin with", explanation: "'To begin with' starts a structured argument." },
          { type: "FILL_BLANK", question: "Complete: The plan is ambitious. ___, it's achievable.", correctAnswer: "Nevertheless", explanation: "'Nevertheless' = despite that." },
          { type: "MATCHING", question: "Match the cohesive function:", options: [{ left: "Furthermore", right: "Addition" }, { left: "Despite", right: "Concession" }, { left: "Consequently", right: "Result" }, { left: "To sum up", right: "Conclusion" }], correctAnswer: "[0,1,2,3]", explanation: "Each device serves a different cohesive function." },
          { type: "CHECKBOX", question: "Select all correct cohesive sentences:", options: ["Despite the challenges, we succeeded", "The plan is risky; nevertheless, it's worth trying", "Furthermore, the results exceeded expectations", "On the contrary, the data supported the hypothesis"], correctAnswer: "[0,1,2]", explanation: "'On the contrary' contradicts a previous statement; it doesn't support. 'Furthermore' is correct here. 0, 1, 2 are correct." },
          { type: "ORDERING", question: "Put in order: to / in / addition / the / main / plan", correctAnswer: "In addition to the main,plan", explanation: "In addition to + noun phrase." },
          { type: "SPEECH", question: "Despite the initial setbacks, the team managed to deliver the project on time and within budget.", correctAnswer: "Despite the initial setbacks, the team managed to deliver the project on time and within budget.", language: "en", hint: "Describe overcoming difficulties to achieve success" },
          { type: "SPEECH", question: "To sum up, the evidence clearly demonstrates that renewable energy is both economically viable and environmentally necessary.", correctAnswer: "To sum up, the evidence clearly demonstrates that renewable energy is both economically viable and environmentally necessary.", language: "en", hint: "Write a strong concluding summary" },
          { type: "SPEECH", question: "On the one hand, technology has made communication easier; on the other hand, it has reduced face-to-face interaction.", correctAnswer: "On the one hand, technology has made communication easier; on the other hand, it has reduced face-to-face interaction.", language: "en", hint: "Present both sides of technology's impact" },
        ]
      },
    ]
  },
  {
    title: "Inversion, Emphasis & Formal Structures",
    lessons: [
      {
        title: "Negative Adverbial Inversion",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Never ___ I seen such a beautiful sunset.'", options: ["have", "I have", "had I", "both A and C"], correctAnswer: "3", explanation: "'Never have I seen' or 'Never had I seen' both work depending on tense." },
          { type: "MCQ", question: "'Not only ___ he late, but he also forgot the documents.'", options: ["was", "did", "had", "is"], correctAnswer: "0", explanation: "'Not only was he late' = inversion after 'not only'." },
          { type: "MCQ", question: "'Hardly ___ the meeting started when the fire alarm went off.'", options: ["had", "did", "was", "have"], correctAnswer: "0", explanation: "'Hardly had' + subject + past participle = inversion for 'as soon as'." },
          { type: "MCQ", question: "'Seldom ___ such a talented young musician.'", options: ["have we seen", "we have seen", "we saw", "did we saw"], correctAnswer: "0", explanation: "'Seldom have we seen' = inversion after 'seldom'." },
          { type: "TRUE_FALSE", question: "True or False: 'Rarely do we encounter such honesty' uses inversion correctly.", correctAnswer: "true", explanation: "'Rarely' triggers inversion: Rarely + auxiliary + subject + verb." },
          { type: "TRUE_FALSE", question: "True or False: 'Never I have seen' is correct inversion.", correctAnswer: "false", explanation: "Should be 'Never have I seen' (auxiliary before subject)." },
          { type: "FILL_BLANK", question: "Complete: No sooner ___ the concert begun than it started raining.", correctAnswer: "had", explanation: "'No sooner had' + subject + past participle + than + clause." },
          { type: "FILL_BLANK", question: "Complete: Under no circumstances ___ you leave the building.", correctAnswer: "should", explanation: "'Under no circumstances' triggers inversion." },
          { type: "FILL_BLANK", question: "Complete: Not until she arrived ___ we realize the truth.", correctAnswer: "did", explanation: "'Not until' + clause triggers inversion in the main clause." },
          { type: "MATCHING", question: "Match the negative adverbial:", options: [{ left: "Never", right: "At no time" }, { left: "Hardly", right: "Barely/scarcely" }, { left: "Not only", right: "But also" }, { left: "Seldom", right: "Rarely" }], correctAnswer: "[0,1,2,3]", explanation: "Each adverbial triggers inversion for emphasis." },
          { type: "CHECKBOX", question: "Select all correct inversion sentences:", options: ["Never have I heard such nonsense", "Not only did she win, but she broke the record", "Hardly had we arrived when it rained", "Rarely we see such dedication"], correctAnswer: "[0,1,2]", explanation: "'Rarely we see' should be 'Rarely do we see' (needs inversion). The others are correct." },
          { type: "ORDERING", question: "Put in order: never / I / have / forgotten / such / kindness", correctAnswer: "Never have I,forgotten such kindness", explanation: "Never + auxiliary + subject + verb." },
          { type: "SPEECH", question: "Not only did the team exceed their targets, but they also set a new company record.", correctAnswer: "Not only did the team exceed their targets, but they also set a new company record.", language: "en", hint: "Emphasize multiple achievements using inversion" },
          { type: "SPEECH", question: "Hardly had I stepped outside when the storm hit with full force.", correctAnswer: "Hardly had I stepped outside when the storm hit with full force.", language: "en", hint: "Describe something that happened immediately after" },
        ]
      },
      {
        title: "Conditionals with Inversion",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ I known about the delay, I would have left later.'", options: ["Had", "If", "Have", "Would"], correctAnswer: "0", explanation: "'Had I known' = inverted third conditional (without 'if')." },
          { type: "MCQ", question: "'___ he apologize, I won't forgive him.'", options: ["Should", "If", "Would", "Could"], correctAnswer: "0", explanation: "'Should he apologize' = inverted first conditional." },
          { type: "MCQ", question: "'___ I to win the lottery, I would travel the world.'", options: ["Were", "If", "Would", "Had"], correctAnswer: "0", explanation: "'Were I to win' = inverted second conditional." },
          { type: "MCQ", question: "What's the advantage of using inversion in conditionals?", options: ["More formal/emphatic", "More casual", "Shorter", "No advantage"], correctAnswer: "0", explanation: "Inverted conditionals are more formal and emphatic." },
          { type: "TRUE_FALSE", question: "True or False: 'Had she studied harder, she would have passed' means 'If she had studied harder.'", correctAnswer: "true", explanation: "Inverted third conditional = if + past perfect." },
          { type: "TRUE_FALSE", question: "True or False: 'Should you need help, call me' means 'If you need help.'", correctAnswer: "true", explanation: "'Should you need' = inverted first conditional." },
          { type: "FILL_BLANK", question: "Complete: ___ I been more careful, the accident wouldn't have happened.", correctAnswer: "Had", explanation: "Inverted third conditional." },
          { type: "FILL_BLANK", question: "Complete: ___ the situation worsen, we will take immediate action.", correctAnswer: "Should", explanation: "Inverted first conditional for formal warnings." },
          { type: "FILL_BLANK", question: "Complete: ___ she offered me the job, I would accept immediately.", correctAnswer: "Were", explanation: "Inverted second conditional: 'Were she to offer' or 'Were she offering'." },
          { type: "MATCHING", question: "Match the inverted conditional:", options: [{ left: "Had I known", right: "If I had known (3rd)" }, { left: "Should you need", right: "If you need (1st)" }, { left: "Were she to ask", right: "If she asked (2nd)" }, { left: "Were it not for", right: "If it weren't for" }], correctAnswer: "[0,1,2,3]", explanation: "Each inverted form corresponds to a conditional type." },
          { type: "CHECKBOX", question: "Select all correct inverted conditionals:", options: ["Had they listened, they would have succeeded", "Should you change your mind, let me know", "Were I in your position, I'd accept", "Have I known, I would have told you"], correctAnswer: "[0,1,2]", explanation: "'Have I known' should be 'Had I known'. The others are correct." },
          { type: "ORDERING", question: "Put in order: had / I / realized / the / danger / I / would have left", correctAnswer: "Had I realized the danger,I would have left", explanation: "Had + subject + past participle, subject + would have + past participle." },
          { type: "SPEECH", question: "Had the government acted sooner, the crisis could have been avoided entirely.", correctAnswer: "Had the government acted sooner, the crisis could have been avoided entirely.", language: "en", hint: "Criticize delayed action using inverted conditional" },
          { type: "SPEECH", question: "Should you require any further assistance, please do not hesitate to contact us.", correctAnswer: "Should you require any further assistance, please do not hesitate to contact us.", language: "en", hint: "Write a formal offer of assistance" },
        ]
      },
      {
        title: "Emphasis with Cleft & Pseudo-Cleft Sentences",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ I love about this city is its diversity.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "'What I love' = pseudo-cleft for emphasis." },
          { type: "MCQ", question: "'It was his dedication ___ impressed the committee.'", options: ["that", "what", "which", "who"], correctAnswer: "0", explanation: "'It was...that...' = it-cleft for emphasis." },
          { type: "MCQ", question: "'___ she needed was some time alone.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "'What she needed' = pseudo-cleft emphasizing the object." },
          { type: "MCQ", question: "What's the difference between 'What I want is...' and 'It's...that I want'?", options: ["Pseudo-cleft vs it-cleft", "It-cleft vs pseudo-cleft", "No difference", "Different tenses"], correctAnswer: "0", explanation: "'What I want' = pseudo-cleft; 'It's...that' = it-cleft." },
          { type: "TRUE_FALSE", question: "True or False: 'Where I grew up was a small village' is a pseudo-cleft sentence.", correctAnswer: "true", explanation: "Wh-cleft: 'Where' clause + be + complement." },
          { type: "TRUE_FALSE", question: "True or False: 'It was yesterday that I met her' emphasizes the time.", correctAnswer: "true", explanation: "It-cleft: 'It was' + emphasized time + relative clause." },
          { type: "FILL_BLANK", question: "Complete: ___ annoys me is his constant interrupting.", correctAnswer: "What", explanation: "Wh-cleft: 'What annoys me' = the thing that annoys me." },
          { type: "FILL_BLANK", question: "Complete: It was the teacher ___ changed my life.", correctAnswer: "who/that", explanation: "It-cleft emphasizing the subject." },
          { type: "FILL_BLANK", question: "Complete: ___ I don't understand is why he resigned.", correctAnswer: "What", explanation: "Wh-cleft: 'What I don't understand' = the thing I don't understand." },
          { type: "MATCHING", question: "Match the emphasis type:", options: [{ left: "It was John who called", right: "It-cleft (person)" }, { left: "What I need is time", right: "Wh-cleft (thing)" }, { left: "Where she lives is unknown", right: "Wh-cleft (place)" }, { left: "Why he left remains a mystery", right: "Wh-cleft (reason)" }], correctAnswer: "[0,1,2,3]", explanation: "Each cleft type emphasizes different information." },
          { type: "CHECKBOX", question: "Select all correct cleft sentences:", options: ["What I admire most is her honesty", "It was the movie that inspired me", "Where he went is anyone's guess", "That I need is help"], correctAnswer: "[0,1,2]", explanation: "'That I need is help' should be 'What I need is help'. The others are correct." },
          { type: "ORDERING", question: "Put in order: what / she / wanted / was / independence", correctAnswer: "What she wanted,was independence", explanation: "What + subject + wanted + was + emphasized element." },
          { type: "SPEECH", question: "What truly sets this restaurant apart is the exceptional quality of its ingredients.", correctAnswer: "What truly sets this restaurant apart is the exceptional quality of its ingredients.", language: "en", hint: "Emphasize what makes something special" },
          { type: "SPEECH", question: "It wasn't the difficulty of the task that discouraged them; it was the lack of support.", correctAnswer: "It wasn't the difficulty of the task that discouraged them; it was the lack of support.", language: "en", hint: "Contrast two factors using negative cleft" },
        ]
      },
      {
        title: "Formal Writing Structures",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'It is widely believed that climate change ___ primarily by human activity.'", options: ["is caused", "causes", "causing", "has caused"], correctAnswer: "0", explanation: "'It is widely believed that' + passive for formal academic writing." },
          { type: "MCQ", question: "'___ the evidence suggests, the policy needs revision.'", options: ["As", "That", "Which", "What"], correctAnswer: "0", explanation: "'As the evidence suggests' = formal reference to evidence." },
          { type: "MCQ", question: "'The data ___ that there is a significant correlation.'", options: ["indicates", "indicate", "indicating", "indicated"], correctAnswer: "0", explanation: "'Data' is singular in formal usage (though plural is also accepted)." },
          { type: "MCQ", question: "Which is the most formal way to express an opinion?", options: ["It could be argued that", "I think that", "In my opinion", "I believe"], correctAnswer: "0", explanation: "'It could be argued that' is the most formal/academic." },
          { type: "TRUE_FALSE", question: "True or False: 'It has been suggested that' is a formal reporting structure.", correctAnswer: "true", explanation: "Passive reporting structure for formal/academic writing." },
          { type: "TRUE_FALSE", question: "True or False: 'Lots of people think' is appropriate for formal writing.", correctAnswer: "false", explanation: "Should be 'Many people believe' or 'It is widely believed'." },
          { type: "FILL_BLANK", question: "Complete: It is ___ that immediate action is required.", correctAnswer: "imperative", explanation: "'It is imperative that' = it is essential/urgent." },
          { type: "FILL_BLANK", question: "Complete: ___ can be seen from the graph, sales have increased.", correctAnswer: "As", explanation: "'As can be seen' = formal reference to data." },
          { type: "FILL_BLANK", question: "Complete: It is ___ to note that the results are preliminary.", correctAnswer: "important", explanation: "'It is important to note' = formal emphasis." },
          { type: "MATCHING", question: "Match the formal structure:", options: [{ left: "It is argued that", right: "Academic opinion" }, { left: "As demonstrated", right: "Reference to evidence" }, { left: "It is essential that", right: "Strong recommendation" }, { left: "It should be noted", right: "Important observation" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure serves a different formal writing function." },
          { type: "CHECKBOX", question: "Select all formal writing sentences:", options: ["It could be argued that the results are inconclusive", "As can be seen from the data, trends are emerging", "It is imperative that measures be taken immediately", "Lots of experts think this is wrong"], correctAnswer: "[0,1,2]", explanation: "'Lots of experts think' is informal. The others are formal." },
          { type: "ORDERING", question: "Put in order: it / be / could / argued / that / policy / needs / change", correctAnswer: "It could be argued that,the policy needs change", explanation: "It could be argued that + clause." },
          { type: "SPEECH", question: "It is widely acknowledged that education plays a crucial role in economic development.", correctAnswer: "It is widely acknowledged that education plays a crucial role in economic development.", language: "en", hint: "State a widely accepted academic position" },
          { type: "SPEECH", question: "As the data clearly demonstrates, there is a strong correlation between exercise and mental health.", correctAnswer: "As the data clearly demonstrates, there is a strong correlation between exercise and mental health.", language: "en", hint: "Reference data in formal writing" },
        ]
      },
      {
        title: "Module 11 Review: Inversion, Emphasis & Formal Structures",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Never before ___ such a large crowd gathered.'", options: ["has", "has there", "there has", "had"], correctAnswer: "1", explanation: "'Never before has there been' = inversion with 'there has been'." },
          { type: "MCQ", question: "'___ I been aware of the risks, I would have acted differently.'", options: ["Had", "If", "Have", "Would"], correctAnswer: "0", explanation: "'Had I been aware' = inverted third conditional." },
          { type: "MCQ", question: "'___ I find most frustrating is the lack of communication.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "'What I find most frustrating' = pseudo-cleft." },
          { type: "MCQ", question: "'It is ___ that all students submit their assignments on time.'", options: ["essential", "essentially", "essence", "essentials"], correctAnswer: "0", explanation: "'It is essential that' = formal requirement." },
          { type: "TRUE_FALSE", question: "True or False: 'Seldom do we see such dedication' uses inversion correctly.", correctAnswer: "true", explanation: "'Seldom' + auxiliary + subject + verb = correct inversion." },
          { type: "TRUE_FALSE", question: "True or False: 'What she wanted was a promotion' is an it-cleft sentence.", correctAnswer: "false", explanation: "It's a wh-cleft (pseudo-cleft), not an it-cleft." },
          { type: "FILL_BLANK", question: "Complete: Not until the deadline approached ___ they realize the urgency.", correctAnswer: "did", explanation: "'Not until' triggers inversion: did + subject + verb." },
          { type: "FILL_BLANK", question: "Complete: It was the lack of funding ___ caused the project to fail.", correctAnswer: "that", explanation: "It-cleft: 'It was...that...' emphasizing the cause." },
          { type: "FILL_BLANK", question: "Complete: ___ the results indicate, further research is needed.", correctAnswer: "As", explanation: "'As the results indicate' = formal reference." },
          { type: "MATCHING", question: "Match the structure:", options: [{ left: "Had I known", right: "Inverted conditional" }, { left: "What matters is", right: "Pseudo-cleft" }, { left: "It is essential that", right: "Formal requirement" }, { left: "Never have I", right: "Negative inversion" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure serves a different grammatical/stylistic purpose." },
          { type: "CHECKBOX", question: "Select all correct formal sentences:", options: ["It could be argued that the policy is flawed", "Never have I witnessed such incompetence", "What the study reveals is concerning", "Had she known, she would acted differently"], correctAnswer: "[0,1,2]", explanation: "'Would acted' should be 'would have acted'. The others are correct." },
          { type: "ORDERING", question: "Put in order: what / the / revealed / study / was / surprising", correctAnswer: "What the study revealed,was surprising", explanation: "What + subject + verb + was + complement." },
          { type: "SPEECH", question: "Not only did the research yield significant results, but it also opened up new avenues for investigation.", correctAnswer: "Not only did the research yield significant results, but it also opened up new avenues for investigation.", language: "en", hint: "Describe research outcomes using formal inversion" },
          { type: "SPEECH", question: "It is imperative that immediate action be taken to address the growing environmental crisis.", correctAnswer: "It is imperative that immediate action be taken to address the growing environmental crisis.", language: "en", hint: "Call for urgent action in formal language" },
          { type: "SPEECH", question: "What distinguishes this approach from others is its emphasis on practical application.", correctAnswer: "What distinguishes this approach from others is its emphasis on practical application.", language: "en", hint: "Highlight what makes something unique" },
        ]
      },
    ]
  },
  {
    title: "Real-World Communication Mastery",
    lessons: [
      {
        title: "Expressing Opinions & Debating",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___, I believe the policy needs revision.'", options: ["From my perspective", "From my perspective,", "In my perspective", "On my perspective"], correctAnswer: "0", explanation: "'From my perspective' or 'In my opinion' are correct." },
          { type: "MCQ", question: "'I see your point, but I have to ___.'", options: ["disagree", "disagree with", "disagree to", "disagree about"], correctAnswer: "0", explanation: "'I have to disagree' = polite disagreement." },
          { type: "MCQ", question: "'That's a valid point; ___, I'd add that...'", options: ["however", "moreover", "although", "despite"], correctAnswer: "1", explanation: "'Moreover' = adding to the point." },
          { type: "MCQ", question: "'I'm afraid I have to ___ with you on that.'", options: ["part ways", "disagree", "differ", "both B and C"], correctAnswer: "3", explanation: "Both 'disagree' and 'differ' work for polite disagreement." },
          { type: "TRUE_FALSE", question: "True or False: 'I couldn't agree more' means you completely agree.", correctAnswer: "true", explanation: "'I couldn't agree more' = I agree completely." },
          { type: "TRUE_FALSE", question: "True or False: 'I take your point' means you disagree.", correctAnswer: "false", explanation: "'I take your point' = I understand/acknowledge your argument." },
          { type: "FILL_BLANK", question: "Complete: From my ___, the benefits outweigh the risks.", correctAnswer: "standpoint", explanation: "'From my standpoint' = from my point of view." },
          { type: "FILL_BLANK", question: "Complete: I ___ to differ, but I think there's another angle to consider.", correctAnswer: "hate", explanation: "'I hate to differ' = polite disagreement." },
          { type: "FILL_BLANK", question: "Complete: That's a fair point, but ___ we also consider the cost?", correctAnswer: "shouldn't", explanation: "Polite counter-argument." },
          { type: "MATCHING", question: "Match the debate phrase:", options: [{ left: "I couldn't agree more", right: "Strong agreement" }, { left: "I see your point, but", right: "Polite disagreement" }, { left: "Let me play devil's advocate", right: "Argue the opposite" }, { left: "To play it safe", right: "Be cautious" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a different debating function." },
          { type: "CHECKBOX", question: "Select all correct debate phrases:", options: ["From my perspective, the data supports this", "I'm inclined to agree with you", "That's a valid point; however, I'd add", "I take your disagree"], correctAnswer: "[0,1,2]", explanation: "'Take your disagree' is wrong; should be 'I disagree' or 'I take your point but disagree'. The others are correct." },
          { type: "ORDERING", question: "Put in order: I / point / see / your / but / disagree", correctAnswer: "I see your point,but I disagree", explanation: "I see your point, but I disagree." },
          { type: "SPEECH", question: "From my perspective, the benefits of this policy far outweigh the potential drawbacks.", correctAnswer: "From my perspective, the benefits of this policy far outweigh the potential drawbacks.", language: "en", hint: "Express your opinion in a formal debate" },
          { type: "SPEECH", question: "I see your point about cost, but we also need to consider the long-term environmental impact.", correctAnswer: "I see your point about cost, but we also need to consider the long-term environmental impact.", language: "en", hint: "Acknowledge someone's point while introducing a counterargument" },
        ]
      },
      {
        title: "Making Complaints & Apologies",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I'm afraid I have to ___ about the service I received.'", options: ["complain", "complaint", "complain to", "complaint about"], correctAnswer: "0", explanation: "'Have to complain' = verb form needed." },
          { type: "MCQ", question: "'I'd like to make a formal ___ about my experience.'", options: ["complaint", "complain", "complaining", "complainant"], correctAnswer: "0", explanation: "'Make a complaint' = noun form needed." },
          { type: "MCQ", question: "'I ___ for any inconvenience this may have caused.'", options: ["apologize", "apology", "apologetic", "apologizing"], correctAnswer: "0", explanation: "'I apologize' = verb form." },
          { type: "MCQ", question: "'Please accept my sincere ___ for the delay.'", options: ["apologies", "apologize", "apologetic", "apologizing"], correctAnswer: "0", explanation: "'Accept my apologies' = noun form." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm sorry for the inconvenience' is a formal apology.", correctAnswer: "true", explanation: "This is a standard formal apology phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'I'd like to complain' is considered rude.", correctAnswer: "false", explanation: "'I'd like to complain' is polite and appropriate." },
          { type: "FILL_BLANK", question: "Complete: I'm writing to express my ___ with the product.", correctAnswer: "dissatisfaction", explanation: "'Express my dissatisfaction' = formal complaint." },
          { type: "FILL_BLANK", question: "Complete: Please accept our ___ for the error.", correctAnswer: "apologies", explanation: "'Accept our apologies' = formal apology." },
          { type: "FILL_BLANK", question: "Complete: I must ___ the poor quality of the service.", correctAnswer: "complain about", explanation: "'Complain about' = verb + preposition." },
          { type: "MATCHING", question: "Match the complaint/apology phrase:", options: [{ left: "I'm afraid I have to complain", right: "Polite complaint" }, { left: "Please accept my apologies", right: "Formal apology" }, { left: "I'd like to raise a concern", right: "Express concern" }, { left: "We sincerely regret", right: "Formal regret" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a different complaint/apology function." },
          { type: "CHECKBOX", question: "Select all correct complaint/apology sentences:", options: ["I'm writing to complain about the defective product", "Please accept our sincere apologies for the delay", "I'd like to raise a concern about the service", "I apologize for the inconvenience caused"], correctAnswer: "[0,1,2,3]", explanation: "All four are correct formal complaint/apology expressions." },
          { type: "ORDERING", question: "Put in order: I / to / like / make / a / complaint / would", correctAnswer: "I would like,to make a complaint", explanation: "I would like to make a complaint." },
          { type: "SPEECH", question: "I'm afraid I have to complain about the quality of the product I received last week.", correctAnswer: "I'm afraid I have to complain about the quality of the product I received last week.", language: "en", hint: "Make a polite but firm complaint" },
          { type: "SPEECH", question: "Please accept our sincere apologies for the delay; we're doing everything we can to resolve the issue.", correctAnswer: "Please accept our sincere apologies for the delay; we're doing everything we can to resolve the issue.", language: "en", hint: "Apologize formally and reassure the customer" },
        ]
      },
      {
        title: "Negotiating & Persuading",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ we could offer you a discount if you increase the order.'", options: ["Perhaps", "Perhaps,", "Maybe,", "Probably"], correctAnswer: "0", explanation: "'Perhaps' (without comma) introduces a suggestion." },
          { type: "MCQ", question: "'I'm sure we can ___ a mutually beneficial arrangement.'", options: ["reach", "make", "do", "achieve"], correctAnswer: "0", explanation: "'Reach an arrangement/agreement' is the correct collocation." },
          { type: "MCQ", question: "'___, I think we should consider alternative options.'", options: ["Having said that", "Having said that,", "That said", "Both A and C"], correctAnswer: "3", explanation: "Both 'Having said that' and 'That said' work as transitions." },
          { type: "MCQ", question: "'Let's ___ the terms and find a middle ground.'", options: ["negotiate", "negotiation", "negotiating", "negotiated"], correctAnswer: "0", explanation: "'Negotiate the terms' = verb form." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm open to suggestions' shows willingness to negotiate.", correctAnswer: "true", explanation: "This phrase indicates flexibility." },
          { type: "TRUE_FALSE", question: "True or False: 'That's non-negotiable' means the terms can be changed.", correctAnswer: "false", explanation: "'Non-negotiable' = cannot be changed." },
          { type: "FILL_BLANK", question: "Complete: We're willing to ___ on the price if you commit to a long-term contract.", correctAnswer: "compromise", explanation: "'Compromise on' = meet halfway." },
          { type: "FILL_BLANK", question: "Complete: I'd like to ___ a counteroffer.", correctAnswer: "propose", explanation: "'Propose a counteroffer' = suggest alternative terms." },
          { type: "FILL_BLANK", question: "Complete: Let's try to find a ___ that works for both parties.", correctAnswer: "compromise", explanation: "'Find a compromise' = reach a mutually acceptable solution." },
          { type: "MATCHING", question: "Match the negotiation phrase:", options: [{ left: "I'm open to suggestions", right: "Willingness to negotiate" }, { left: "That's non-negotiable", right: "Firm position" }, { left: "Let's find a middle ground", right: "Seeking compromise" }, { left: "I'd like to propose", right: "Making an offer" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a different negotiation function." },
          { type: "CHECKBOX", question: "Select all correct negotiation sentences:", options: ["We're willing to compromise on the delivery date", "I'd like to propose an alternative arrangement", "That's non-negotiable; take it or leave it", "Perhaps we could reach an agreement"], correctAnswer: "[0,1,2,3]", explanation: "All four are correct negotiation expressions." },
          { type: "ORDERING", question: "Put in order: we / find / a / ground / let's / middle", correctAnswer: "Let's find,a middle ground", explanation: "Let's find a middle ground." },
          { type: "SPEECH", question: "I understand your concerns, but I'm confident we can reach an agreement that benefits both parties.", correctAnswer: "I understand your concerns, but I'm confident we can reach an agreement that benefits both parties.", language: "en", hint: "Persuade someone during a negotiation" },
          { type: "SPEECH", question: "Perhaps we could compromise on the timeline if you're flexible on the budget.", correctAnswer: "Perhaps we could compromise on the timeline if you're flexible on the budget.", language: "en", hint: "Suggest a trade-off in negotiations" },
        ]
      },
      {
        title: "Formal Presentations & Public Speaking",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Today, I'd like to ___ you through our findings.'", options: ["take", "bring", "lead", "guide"], correctAnswer: "0", explanation: "'Take you through' = guide/explain step by step." },
          { type: "MCQ", question: "'To ___ with, let me outline the main objectives.'", options: ["begin", "start", "open", "both A and B"], correctAnswer: "3", explanation: "Both 'To begin with' and 'To start with' work." },
          { type: "MCQ", question: "'As you can see from the ___, sales have increased by 20%.'", options: ["graph", "graphic", "graphics", "graphing"], correctAnswer: "0", explanation: "'Graph' = chart/diagram." },
          { type: "MCQ", question: "'To ___ up, the key takeaway is that we need to act now.'", options: ["sum", "wrap", "both A and B", "conclude"], correctAnswer: "2", explanation: "Both 'To sum up' and 'To wrap up' work for conclusions." },
          { type: "TRUE_FALSE", question: "True or False: 'Let me draw your attention to' is a formal presentation phrase.", correctAnswer: "true", explanation: "This is a standard formal phrase for directing attention." },
          { type: "TRUE_FALSE", question: "True or False: 'I'll get straight to the point' is appropriate for formal presentations.", correctAnswer: "true", explanation: "This is acceptable in business presentations for efficiency." },
          { type: "FILL_BLANK", question: "Complete: I'd now like to ___ over to my colleague.", correctAnswer: "hand", explanation: "'Hand over to' = pass the presentation to someone else." },
          { type: "FILL_BLANK", question: "Complete: If you have any questions, please feel free to ___ them at the end.", correctAnswer: "ask", explanation: "'Ask questions' = standard presentation invitation." },
          { type: "FILL_BLANK", question: "Complete: Let me ___ this point with an example.", correctAnswer: "illustrate", explanation: "'Illustrate this point' = explain with an example." },
          { type: "MATCHING", question: "Match the presentation phrase:", options: [{ left: "To begin with", right: "Opening" }, { left: "Moving on to", right: "Transition" }, { left: "As you can see", right: "Reference to data" }, { left: "To sum up", right: "Conclusion" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a different presentation function." },
          { type: "CHECKBOX", question: "Select all correct presentation sentences:", options: ["Let me take you through the key findings", "As you can see from the graph, revenue has grown", "To sum up, our recommendation is to invest in innovation", "I'll hand over my colleague"], correctAnswer: "[0,1,2]", explanation: "'Hand over my colleague' should be 'hand over to my colleague'. The others are correct." },
          { type: "ORDERING", question: "Put in order: let / through / take / the / me / you / data", correctAnswer: "Let me take you,through the data", explanation: "Let me take you through the data." },
          { type: "SPEECH", question: "Today, I'd like to walk you through our quarterly results and highlight the key trends.", correctAnswer: "Today, I'd like to walk you through our quarterly results and highlight the key trends.", language: "en", hint: "Open a formal business presentation" },
          { type: "SPEECH", question: "To sum up, the evidence clearly supports our recommendation to expand into the Asian market.", correctAnswer: "To sum up, the evidence clearly supports our recommendation to expand into the Asian market.", language: "en", hint: "Conclude a formal presentation with a strong recommendation" },
        ]
      },
      {
        title: "Module 12 Review: Real-World Communication",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___, I believe the evidence supports our position.'", options: ["From my standpoint", "From my standpoint,", "In my standpoint", "On my standpoint"], correctAnswer: "0", explanation: "'From my standpoint' = from my point of view." },
          { type: "MCQ", question: "'Please accept our ___ for the inconvenience.'", options: ["sincere apologies", "sincerely apologize", "sincere apologize", "sincerest apologize"], correctAnswer: "0", explanation: "'Accept our sincere apologies' = noun form." },
          { type: "MCQ", question: "'I'm sure we can ___ a mutually beneficial agreement.'", options: ["reach", "make", "do", "achieve"], correctAnswer: "0", explanation: "'Reach an agreement' is the correct collocation." },
          { type: "MCQ", question: "'Let me ___ this point with a recent example.'", options: ["illustrate", "illustration", "illustrating", "illustrated"], correctAnswer: "0", explanation: "'Illustrate this point' = explain with an example." },
          { type: "TRUE_FALSE", question: "True or False: 'I couldn't agree more' means complete agreement.", correctAnswer: "true", explanation: "This phrase means you agree completely." },
          { type: "TRUE_FALSE", question: "True or False: 'I'd like to make a complain' is correct.", correctAnswer: "false", explanation: "Should be 'make a complaint' (noun) or 'complain' (verb)." },
          { type: "FILL_BLANK", question: "Complete: We're willing to ___ on the price for a long-term commitment.", correctAnswer: "compromise", explanation: "'Compromise on' = meet halfway." },
          { type: "FILL_BLANK", question: "Complete: To ___ up, the main conclusion is that we need to act.", correctAnswer: "sum", explanation: "'To sum up' = in conclusion." },
          { type: "FILL_BLANK", question: "Complete: Let me ___ your attention to the key findings.", correctAnswer: "draw", explanation: "'Draw your attention to' = direct focus." },
          { type: "MATCHING", question: "Match the communication context:", options: [{ left: "From my perspective", right: "Debate/opinion" }, { left: "Please accept our apologies", right: "Formal apology" }, { left: "Let's find a middle ground", right: "Negotiation" }, { left: "To sum up", right: "Presentation conclusion" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase belongs to a different communication context." },
          { type: "CHECKBOX", question: "Select all correct communication sentences:", options: ["I see your point, but I have to disagree", "We're open to negotiating the terms", "Let me illustrate this with an example", "I'd like to make a complain about the service"], correctAnswer: "[0,1,2]", explanation: "'Make a complain' should be 'make a complaint'. The others are correct." },
          { type: "ORDERING", question: "Put in order: I / point / see / your / but / disagree", correctAnswer: "I see your point,but I disagree", explanation: "I see your point, but I disagree." },
          { type: "SPEECH", question: "From my standpoint, the advantages of this approach significantly outweigh the potential risks.", correctAnswer: "From my standpoint, the advantages of this approach significantly outweigh the potential risks.", language: "en", hint: "Express your opinion formally in a debate" },
          { type: "SPEECH", question: "I understand your position, and I'm confident we can find a compromise that works for everyone.", correctAnswer: "I understand your position, and I'm confident we can find a compromise that works for everyone.", language: "en", hint: "Show willingness to negotiate" },
          { type: "SPEECH", question: "To wrap up, I'd like to thank you for your time and invite any questions you may have.", correctAnswer: "To wrap up, I'd like to thank you for your time and invite any questions you may have.", language: "en", hint: "Conclude a formal presentation" },
        ]
      },
    ]
  },
]

async function seedEnglishB2() {
  console.log('=========================================')
  console.log('🚀 Seeding English B2 Course...')
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
          order: 4,
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
    console.log('🎉 English B2 Course Seed Complete!')
    console.log('=========================================')
    console.log(`📚 Course: ${course.title}`)
    console.log(`📦 Modules: ${modulesData.length}`)
    console.log(`📝 Lessons: ${totalLessons}`)
    console.log(`❓ Questions: ${totalQuestions}`)
    console.log(`🆔 Course ID: ${course.id}`)
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding English B2 course:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnglishB2()


