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
  title: "English C1 - Advanced",
  description: "Master advanced English with sophisticated grammar, academic vocabulary, nuanced expression, and complex discourse skills. Covers all CEFR C1 competencies including advanced conditionals, complex syntax, nominalization, academic register, and professional communication.",
  difficulty: "ADVANCED",
  minimumLevel: "C1",
  isFree: true,
  isPremium: false,
  cutoffScore: 70,
  status: "PUBLISHED",
  icon: "🎓",
  color: "#7c3aed",
}

const modulesData = [
  {
    title: "Advanced Conditionals & Complex Hypotheticals",
    lessons: [
      {
        title: "Inverted Conditionals & Formal Structures",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the evidence, we would have won the case.'", options: ["Had we presented", "If we presented", "Were we present", "Should we present"], correctAnswer: "0", explanation: "Inverted third conditional: 'Had we presented' = 'If we had presented'. Formal structure omitting 'if'." },
          { type: "MCQ", question: "'___ more time, I would finish this today.'", options: ["Were I to have", "If I have", "Had I", "Should I"], correctAnswer: "0", explanation: "'Were I to have' = formal inverted mixed conditional. 'Were I to have more time' = 'If I were to have more time'." },
          { type: "MCQ", question: "'___ any questions, please contact our support team.'", options: ["Should you have", "If you had", "Were you having", "Had you"], correctAnswer: "0", explanation: "'Should you have' = formal first conditional inversion. Common in business correspondence." },
          { type: "MCQ", question: "Which is the formal equivalent of 'If I had known'?", options: ["Had I known", "Were I knowing", "Should I know", "Did I know"], correctAnswer: "0", explanation: "'Had I known' is the inverted form of 'If I had known' (third conditional)." },
          { type: "TRUE_FALSE", question: "True or False: 'Were she to arrive early, we could start' is grammatically correct.", correctAnswer: "true", explanation: "Inverted second conditional: 'Were she to' = 'If she were to'." },
          { type: "TRUE_FALSE", question: "True or False: 'Had they invested wisely, they would be wealthy now' is a mixed conditional.", correctAnswer: "true", explanation: "Inverted mixed conditional: past condition (had invested) → present result (would be)." },
          { type: "FILL_BLANK", question: "Complete: ___ I been aware of the risks, I would have proceeded differently.", correctAnswer: "Had", explanation: "'Had I been' = 'If I had been' (inverted third conditional)." },
          { type: "FILL_BLANK", question: "Complete: ___ the opportunity arise, I would take it immediately.", correctAnswer: "Should", explanation: "'Should the opportunity arise' = 'If the opportunity should arise' (formal first conditional)." },
          { type: "FILL_BLANK", question: "Complete: ___ it not for your help, I would have failed.", correctAnswer: "Were", explanation: "'Were it not for' = 'If it were not for' (inverted second conditional)." },
          { type: "MATCHING", question: "Match the inverted form with its standard equivalent:", options: [{ left: "Had I known", right: "If I had known" }, { left: "Were she to come", right: "If she were to come" }, { left: "Should you need", right: "If you should need" }, { left: "Had they not intervened", right: "If they had not intervened" }], correctAnswer: "[0,1,2,3]", explanation: "Each inverted form is the formal equivalent of a standard conditional." },
          { type: "CHECKBOX", question: "Select all correct inverted conditionals:", options: ["Had I realized, I would have acted differently", "Were he to ask, I would help him", "Should you require assistance, please ask", "Did I know the answer, I would tell you"], correctAnswer: "[0,1,2]", explanation: "'Did I know' is wrong; should be 'Were I to know' or 'If I knew'. The others are correct." },
          { type: "ORDERING", question: "Put in order: had / I / foreseen / the / consequences / I / would / never / agreed / have", correctAnswer: "Had I foreseen the consequences,I would never have agreed", explanation: "Inverted third conditional structure." },
          { type: "SPEECH", question: "Had I been given the chance, I would have taken it without hesitation.", correctAnswer: "Had I been given the chance, I would have taken it without hesitation.", language: "en", hint: "Express a missed opportunity using formal inversion" },
          { type: "SPEECH", question: "Were the circumstances different, we might have reached an agreement.", correctAnswer: "Were the circumstances different, we might have reached an agreement.", language: "en", hint: "Discuss hypothetical situations formally" },
        ]
      },
      {
        title: "Subjunctive Mood & Advanced Hypotheticals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I insist that he ___ present at the meeting.'", options: ["be", "is", "was", "will be"], correctAnswer: "0", explanation: "Subjunctive mood: 'I insist that he be' (base form verb after expressions of insistence)." },
          { type: "MCQ", question: "'It's essential that she ___ the documents immediately.'", options: ["sign", "signs", "signed", "will sign"], correctAnswer: "0", explanation: "Subjunctive after 'it's essential that': base form verb." },
          { type: "MCQ", question: "'I'd rather you ___ me before making that decision.'", options: ["had asked", "ask", "asked", "asking"], correctAnswer: "0", explanation: "'I'd rather you had asked' = past regret about someone's action." },
          { type: "MCQ", question: "Which structure requires the subjunctive?", options: ["It's vital that...", "I think that...", "She said that...", "He knows that..."], correctAnswer: "0", explanation: "Expressions of necessity/importance (vital, essential, crucial, important) take the subjunctive." },
          { type: "TRUE_FALSE", question: "True or False: 'I wish he were here' uses the subjunctive correctly.", correctAnswer: "true", explanation: "'Were' is the subjunctive form after 'wish' for unreal situations." },
          { type: "TRUE_FALSE", question: "True or False: 'It's important that she signs the form' is the most formal correct form.", correctAnswer: "false", explanation: "The subjunctive 'sign' is more formal and correct: 'It's important that she sign the form'." },
          { type: "FILL_BLANK", question: "Complete: The judge ordered that the evidence ___ (preserve).", correctAnswer: "be preserved", explanation: "Subjunctive passive after 'ordered that'." },
          { type: "FILL_BLANK", question: "Complete: I'd sooner you ___ (not/tell) anyone about this.", correctAnswer: "didn't tell", explanation: "'I'd sooner you didn't' = preference about someone's action." },
          { type: "FILL_BLANK", question: "Complete: It's high time we ___ (leave).", correctAnswer: "left", explanation: "'It's high time' + past simple = something should have happened already." },
          { type: "MATCHING", question: "Match the expression with its structure:", options: [{ left: "I insist that he...", right: "be (subjunctive)" }, { left: "I'd rather you...", right: "past simple/past perfect" }, { left: "It's time we...", right: "past simple" }, { left: "Suppose he...", right: "past simple (hypothetical)" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression requires a specific grammatical structure." },
          { type: "CHECKBOX", question: "Select all correct subjunctive sentences:", options: ["It's crucial that he arrive on time", "I suggest that she reconsider", "The boss demanded that they work overtime", "It's important that she understands the rules"], correctAnswer: "[0,1,2]", explanation: "'Understands' should be 'understand' (subjunctive). The others correctly use the base form." },
          { type: "ORDERING", question: "Put in order: it's / that / imperative / measures / be / taken / immediately", correctAnswer: "It's imperative that,measures be taken,immediately", explanation: "Subjunctive after 'it's imperative that'." },
          { type: "SPEECH", question: "I'd rather you hadn't mentioned that to the manager.", correctAnswer: "I'd rather you hadn't mentioned that to the manager.", language: "en", hint: "Express regret about something someone said" },
          { type: "SPEECH", question: "It's essential that all participants be informed of the changes.", correctAnswer: "It's essential that all participants be informed of the changes.", language: "en", hint: "State a formal requirement using subjunctive" },
        ]
      },
      {
        title: "Third Conditional Variations & Emphasis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'If it ___ for your intervention, the situation would have escalated.'", options: ["hadn't been", "weren't", "isn't", "hasn't been"], correctAnswer: "0", explanation: "'If it hadn't been for' = without (past). Expressing gratitude for past intervention." },
          { type: "MCQ", question: "'But for the delay, we ___ on time.'", options: ["would have arrived", "would arrive", "will arrive", "arrived"], correctAnswer: "0", explanation: "'But for' = if it hadn't been for. Third conditional meaning." },
          { type: "MCQ", question: "'If only I ___ about the deadline earlier!'", options: ["had known", "knew", "know", "would know"], correctAnswer: "0", explanation: "'If only + past perfect' = strong regret about the past." },
          { type: "MCQ", question: "Which is NOT a third conditional variation?", options: ["If it were for", "But for", "If it hadn't been for", "Had it not been for"], correctAnswer: "0", explanation: "'If it were for' is second conditional (present), not third." },
          { type: "TRUE_FALSE", question: "True or False: 'Were it not for the rain, we would have gone hiking' is correct.", correctAnswer: "true", explanation: "'Were it not for' = if it weren't for (second conditional variation)." },
          { type: "TRUE_FALSE", question: "True or False: 'If it hadn't been for your help' and 'But for your help' mean the same.", correctAnswer: "true", explanation: "Both express 'without your help' in past contexts." },
          { type: "FILL_BLANK", question: "Complete: If it ___ for your warning, I would have been in serious trouble.", correctAnswer: "hadn't been", explanation: "'If it hadn't been for' = without your warning." },
          { type: "FILL_BLANK", question: "Complete: ___ the storm, the ship would have reached port safely.", correctAnswer: "But for", explanation: "'But for the storm' = if it hadn't been for the storm." },
          { type: "FILL_BLANK", question: "Complete: If only I ___ (invest) in that startup when I had the chance.", correctAnswer: "had invested", explanation: "Strong regret about a missed past opportunity." },
          { type: "MATCHING", question: "Match the expression with its meaning:", options: [{ left: "If it hadn't been for", right: "Without (past)" }, { left: "But for", right: "Without (formal)" }, { left: "If only I had", right: "Strong regret" }, { left: "Were it not for", right: "Without (present)" }], correctAnswer: "[0,1,2,3]", explanation: "Each variation expresses hypothetical absence differently." },
          { type: "CHECKBOX", question: "Select all correct third conditional variations:", options: ["Had it not been for the delay, we would have won", "But for his generosity, we would have failed", "If it weren't for his help, we would be in trouble", "If only she had listened to our advice"], correctAnswer: "[0,1,3]", explanation: "'If it weren't for...would be' is second conditional (present result), not third. The others are correct." },
          { type: "ORDERING", question: "Put in order: if / it / not / for / your / guidance / I / would / have / failed / had / been", correctAnswer: "If it had not been for your guidance,I would have failed", explanation: "Third conditional with 'if it had not been for'." },
          { type: "SPEECH", question: "But for the timely intervention of the medical team, the patient wouldn't have survived.", correctAnswer: "But for the timely intervention of the medical team, the patient wouldn't have survived.", language: "en", hint: "Acknowledge crucial help in a formal context" },
          { type: "SPEECH", question: "If only I had pursued that opportunity when it was offered to me.", correctAnswer: "If only I had pursued that opportunity when it was offered to me.", language: "en", hint: "Express deep regret about a missed opportunity" },
        ]
      },
      {
        title: "Hypothetical Comparisons & Advanced Structures",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Suppose you ___ offered the job, what would you do?'", options: ["were", "are", "will be", "have been"], correctAnswer: "0", explanation: "'Suppose + past simple' = hypothetical present/future." },
          { type: "MCQ", question: "'Imagine you ___ in charge. How would you handle this?'", options: ["were", "are", "will be", "have been"], correctAnswer: "0", explanation: "'Imagine + past simple' = hypothetical situation." },
          { type: "MCQ", question: "'What if she ___ find out about the surprise?'", options: ["should", "would", "will", "must"], correctAnswer: "0", explanation: "'What if she should' = hypothetical concern about possibility." },
          { type: "MCQ", question: "Which structure expresses a hypothetical comparison?", options: ["As if he knew everything", "As he knows everything", "Like he knows everything", "Since he knows everything"], correctAnswer: "0", explanation: "'As if + past simple' = hypothetical/unreal comparison." },
          { type: "TRUE_FALSE", question: "True or False: 'He acts as if he owned the place' uses a hypothetical structure.", correctAnswer: "true", explanation: "'As if + past simple' suggests he doesn't actually own it." },
          { type: "TRUE_FALSE", question: "True or False: 'What if I had said no?' refers to a hypothetical past.", correctAnswer: "true", explanation: "'What if + past perfect' questions a past hypothetical." },
          { type: "FILL_BLANK", question: "Complete: Suppose you ___ to start over, what would you change?", correctAnswer: "were", explanation: "'Suppose you were' = imagine a hypothetical situation." },
          { type: "FILL_BLANK", question: "Complete: She looked at me as if she ___ me before.", correctAnswer: "had never seen", explanation: "'As if + past perfect' = hypothetical past comparison." },
          { type: "FILL_BLANK", question: "Complete: Imagine you ___ the president. What's the first thing you'd change?", correctAnswer: "were", explanation: "'Imagine you were' = hypothetical scenario." },
          { type: "MATCHING", question: "Match the structure with its function:", options: [{ left: "Suppose you were", right: "Hypothetical scenario" }, { left: "What if I had", right: "Past hypothetical question" }, { left: "As if he knew", right: "Unreal comparison" }, { left: "Imagine she were", right: "Imagined situation" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure introduces a different type of hypothetical thinking." },
          { type: "CHECKBOX", question: "Select all correct hypothetical structures:", options: ["Suppose you won the lottery, what would you do?", "He talks as if he knew the truth", "What if she had refused the offer?", "Imagine he is the boss and gives orders"], correctAnswer: "[0,1,2]", explanation: "'Imagine he is' is not hypothetical; should be 'Imagine he were'. The others are correct." },
          { type: "ORDERING", question: "Put in order: as / she / acted / nothing / as / happened / if / had", correctAnswer: "She acted,as if nothing,had happened", explanation: "'As if + past perfect' for unreal past comparison." },
          { type: "SPEECH", question: "Suppose you were given unlimited resources, how would you solve this problem?", correctAnswer: "Suppose you were given unlimited resources, how would you solve this problem?", language: "en", hint: "Pose a hypothetical scenario for problem-solving" },
          { type: "SPEECH", question: "He looked at me as if I had betrayed his trust completely.", correctAnswer: "He looked at me as if I had betrayed his trust completely.", language: "en", hint: "Describe someone's reaction to a perceived betrayal" },
        ]
      },
      {
        title: "Module 1 Review: Advanced Conditionals & Hypotheticals",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the circumstances, we would have proceeded with the plan.'", options: ["Had the circumstances permitted", "If the circumstances permit", "Were the circumstances permitting", "Should the circumstances permit"], correctAnswer: "0", explanation: "Inverted third conditional: 'Had the circumstances permitted' = 'If the circumstances had permitted'." },
          { type: "MCQ", question: "'It's imperative that every applicant ___ the form accurately.'", options: ["complete", "completes", "completed", "will complete"], correctAnswer: "0", explanation: "Subjunctive after 'it's imperative that': base form verb." },
          { type: "MCQ", question: "'___ your generosity, the event would not have been possible.'", options: ["But for", "If not for", "Unless for", "Except for"], correctAnswer: "0", explanation: "'But for' = without (formal third conditional variation)." },
          { type: "MCQ", question: "'She spoke as though she ___ the entire project herself.'", options: ["had managed", "manages", "is managing", "will manage"], correctAnswer: "0", explanation: "'As though + past perfect' = unreal past comparison." },
          { type: "TRUE_FALSE", question: "True or False: 'Should you require any assistance' is a formal first conditional.", correctAnswer: "true", explanation: "'Should you require' = 'If you should require' (formal first conditional inversion)." },
          { type: "TRUE_FALSE", question: "True or False: 'I'd rather you hadn't done that' expresses a present preference.", correctAnswer: "false", explanation: "'Hadn't done' refers to a past action, expressing regret about something already done." },
          { type: "FILL_BLANK", question: "Complete: Were I ___ your position, I would reconsider this decision.", correctAnswer: "in", explanation: "'Were I in your position' = 'If I were in your position'." },
          { type: "FILL_BLANK", question: "Complete: It's high time the government ___ (take) action on this issue.", correctAnswer: "took", explanation: "'It's high time + past simple' = action is overdue." },
          { type: "FILL_BLANK", question: "Complete: If only I ___ (realize) the importance of that meeting.", correctAnswer: "had realized", explanation: "Strong regret about not realizing something in the past." },
          { type: "MATCHING", question: "Match the structure with its conditional type:", options: [{ left: "Had I known", right: "Inverted third" }, { left: "Should you need", right: "Inverted first" }, { left: "Were she to ask", right: "Inverted second" }, { left: "It's crucial that he be", right: "Subjunctive" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure represents a different advanced conditional form." },
          { type: "CHECKBOX", question: "Select all grammatically correct sentences:", options: ["Had they not intervened, disaster would have struck", "I insist that she be present at the hearing", "But for his quick thinking, the fire would have spread", "Suppose he would have been there, what then?"], correctAnswer: "[0,1,2]", explanation: "'Suppose he would have been' is wrong; should be 'Suppose he had been'. The others are correct." },
          { type: "ORDERING", question: "Put in order: it's / that / all / confidential / documents / be / destroyed / essential", correctAnswer: "It's essential that,all confidential documents,be destroyed", explanation: "Subjunctive after 'it's essential that'." },
          { type: "SPEECH", question: "Had I been aware of the implications, I would never have agreed to those terms.", correctAnswer: "Had I been aware of the implications, I would never have agreed to those terms.", language: "en", hint: "Express regret about agreeing without full knowledge" },
          { type: "SPEECH", question: "Suppose you were in my shoes, would you make the same decision?", correctAnswer: "Suppose you were in my shoes, would you make the same decision?", language: "en", hint: "Ask someone to consider your perspective hypothetically" },
          { type: "SPEECH", question: "It's vital that the committee review all the evidence before reaching a verdict.", correctAnswer: "It's vital that the committee review all the evidence before reaching a verdict.", language: "en", hint: "Emphasize the importance of due process using subjunctive" },
        ]
      },
    ]
  },
  {
    title: "Modal Nuances & Advanced Speculation",
    lessons: [
      {
        title: "Double Modals & Modal Perfects",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She ___ have been expecting us; the door was unlocked.'", options: ["must", "can", "will", "should"], correctAnswer: "0", explanation: "'Must have been expecting' = strong deduction about a past ongoing state." },
          { type: "MCQ", question: "'You ___ not have bothered; we already had everything.'", options: ["need", "must", "will", "should"], correctAnswer: "0", explanation: "'Need not have bothered' = you did something unnecessarily." },
          { type: "MCQ", question: "'He ___ have been driving for hours when the accident happened.'", options: ["must", "can", "should", "will"], correctAnswer: "0", explanation: "'Must have been driving' = deduction about past continuous action." },
          { type: "MCQ", question: "Which modal perfect expresses a past possibility that didn't happen?", options: ["could have", "must have", "will have", "shall have"], correctAnswer: "0", explanation: "'Could have' = past possibility/ability that wasn't realized." },
          { type: "TRUE_FALSE", question: "True or False: 'She might have been waiting for hours' is a modal perfect continuous.", correctAnswer: "true", explanation: "Might + have + been + -ing = modal perfect continuous." },
          { type: "TRUE_FALSE", question: "True or False: 'He must to have forgotten' is grammatically correct.", correctAnswer: "false", explanation: "Never use 'to' after a modal. Should be 'He must have forgotten'." },
          { type: "FILL_BLANK", question: "Complete: They ___ (work) on this project for months before it was approved.", correctAnswer: "must have been working", explanation: "Deduction about past continuous: must + have + been + -ing." },
          { type: "FILL_BLANK", question: "Complete: You ___ (not/study) so hard; the exam was cancelled.", correctAnswer: "needn't have studied", explanation: "Unnecessary past action: needn't + have + past participle." },
          { type: "FILL_BLANK", question: "Complete: She ___ (read) the report; she knows all the details.", correctAnswer: "must have read", explanation: "Strong deduction about a past action." },
          { type: "MATCHING", question: "Match the modal perfect with its meaning:", options: [{ left: "Must have been", right: "Strong past deduction" }, { left: "Could have been", right: "Past possibility" }, { left: "Needn't have been", right: "Unnecessary past action" }, { left: "Should have been", right: "Past criticism" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal perfect serves a different function." },
          { type: "CHECKBOX", question: "Select all correct modal perfect sentences:", options: ["She must have been exhausted after the journey", "He could have told us earlier", "They needn't have rushed", "She must to have seen the warning"], correctAnswer: "[0,1,2]", explanation: "'Must to have seen' is wrong; modals never take 'to'. The others are correct." },
          { type: "ORDERING", question: "Put in order: must / been / they / waiting / for / hours / have", correctAnswer: "They,must have been waiting,for hours", explanation: "Subject + must + have + been + -ing." },
          { type: "SPEECH", question: "You needn't have gone to all that trouble just for me.", correctAnswer: "You needn't have gone to all that trouble just for me.", language: "en", hint: "Thank someone while noting their effort was unnecessary" },
          { type: "SPEECH", question: "She must have been planning this surprise for weeks.", correctAnswer: "She must have been planning this surprise for weeks.", language: "en", hint: "Deduce someone's preparation from the result" },
        ]
      },
      {
        title: "Advanced Deduction & Speculation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Given the evidence, he ___ be the culprit.'", options: ["can't possibly", "must possibly", "will possibly", "should possibly"], correctAnswer: "0", explanation: "'Can't possibly' = strong negative deduction with emphasis." },
          { type: "MCQ", question: "'There ___ some misunderstanding; let me clarify.'", options: ["must have been", "can have been", "will have been", "should have been"], correctAnswer: "0", explanation: "'Must have been' = logical deduction about a past situation." },
          { type: "MCQ", question: "'She ___ know about the merger; she's on the board.'", options: ["is bound to", "can be bound to", "will be bound to", "should be bound to"], correctAnswer: "0", explanation: "'Is bound to' = certain to (strong positive expectation)." },
          { type: "MCQ", question: "Which expresses the highest certainty?", options: ["is bound to", "might", "could", "may"], correctAnswer: "0", explanation: "'Is bound to' expresses the highest certainty among these options." },
          { type: "TRUE_FALSE", question: "True or False: 'He can't possibly have stolen it' is stronger than 'He might not have stolen it.'", correctAnswer: "true", explanation: "'Can't possibly' = near certainty of impossibility. 'Might not' = weak possibility." },
          { type: "TRUE_FALSE", question: "True or False: 'She is likely to know' and 'She should know' express the same certainty.", correctAnswer: "false", explanation: "'Likely to' = probable. 'Should' = expected but less certain." },
          { type: "FILL_BLANK", question: "Complete: With his experience, he ___ (be) the ideal candidate.", correctAnswer: "must be", explanation: "Strong deduction based on evidence." },
          { type: "FILL_BLANK", question: "Complete: There ___ (be) a mistake in the calculations.", correctAnswer: "must have been", explanation: "Deduction about a past error." },
          { type: "FILL_BLANK", question: "Complete: She ___ (know) the answer; she's an expert in this field.", correctAnswer: "is bound to know", explanation: "'Is bound to' = near certainty based on her expertise." },
          { type: "MATCHING", question: "Match the expression with its certainty level:", options: [{ left: "Must be", right: "Very certain (90%+)" }, { left: "Is bound to be", right: "Almost certain (95%+)" }, { left: "Is likely to be", right: "Probable (70-80%)" }, { left: "Might be", right: "Possible (30-50%)" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression conveys a different degree of certainty." },
          { type: "CHECKBOX", question: "Select all correct deduction sentences:", options: ["He must have forgotten about the meeting", "She can't possibly have finished already", "They are bound to have received the letter", "He must to be the one who called"], correctAnswer: "[0,1,2]", explanation: "'Must to be' is wrong; modals never take 'to'. The others are correct." },
          { type: "ORDERING", question: "Put in order: can't / have / she / possibly / known / about / the / surprise", correctAnswer: "She,can't possibly have known,about the surprise", explanation: "Strong negative deduction: can't possibly + have + past participle." },
          { type: "SPEECH", question: "Given the circumstances, there must have been a communication breakdown.", correctAnswer: "Given the circumstances, there must have been a communication breakdown.", language: "en", hint: "Deduce the cause of a problem" },
          { type: "SPEECH", question: "With her track record, she's bound to succeed in whatever she does.", correctAnswer: "With her track record, she's bound to succeed in whatever she does.", language: "en", hint: "Express strong confidence in someone's future" },
        ]
      },
      {
        title: "Modals in Formal & Academic Contexts",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The findings ___ be interpreted with caution.'", options: ["should", "will", "can", "must"], correctAnswer: "0", explanation: "'Should' = academic recommendation/advice about interpretation." },
          { type: "MCQ", question: "'It ___ be argued that the methodology was flawed.'", options: ["could", "will", "must", "shall"], correctAnswer: "0", explanation: "'Could be argued' = academic hedging; presenting a possible perspective." },
          { type: "MCQ", question: "'Further research ___ be conducted to validate these results.'", options: ["ought to", "will", "can", "shall"], correctAnswer: "0", explanation: "'Ought to' = formal recommendation for future research." },
          { type: "MCQ", question: "Which modal is used for academic hedging?", options: ["could", "must", "will", "shall"], correctAnswer: "0", explanation: "'Could' = hedging (presenting possibilities without certainty)." },
          { type: "TRUE_FALSE", question: "True or False: 'The data suggests that this may be the case' uses appropriate academic hedging.", correctAnswer: "true", explanation: "'May' = hedging; avoids absolute claims." },
          { type: "TRUE_FALSE", question: "True or False: 'This will definitely prove the theory' is appropriate academic writing.", correctAnswer: "false", explanation: "Academic writing avoids absolute claims; use 'could support' instead." },
          { type: "FILL_BLANK", question: "Complete: These results ___ (interpret) as preliminary evidence.", correctAnswer: "should be interpreted", explanation: "Academic recommendation using modal passive." },
          { type: "FILL_BLANK", question: "Complete: One ___ (argue) that the sample size was insufficient.", correctAnswer: "could argue", explanation: "Academic hedging: presenting a possible argument." },
          { type: "FILL_BLANK", question: "Complete: The limitations of this study ___ (acknowledge).", correctAnswer: "must be acknowledged", explanation: "Strong academic obligation." },
          { type: "MATCHING", question: "Match the modal with its academic function:", options: [{ left: "Could", right: "Hedging/possibility" }, { left: "Should", right: "Recommendation" }, { left: "Must", right: "Strong obligation" }, { left: "May", right: "Tentative claim" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal serves a different function in academic discourse." },
          { type: "CHECKBOX", question: "Select all appropriate academic modal uses:", options: ["These findings could suggest a correlation", "Further research should investigate this phenomenon", "The results must be interpreted cautiously", "This will undoubtedly prove the hypothesis"], correctAnswer: "[0,1,2]", explanation: "'Will undoubtedly prove' is too absolute for academic writing. The others are appropriate." },
          { type: "ORDERING", question: "Put in order: these / could / results / interpreted / various / be / in / ways", correctAnswer: "These results,could be interpreted,in various ways", explanation: "Academic hedging: could + be + past participle." },
          { type: "SPEECH", question: "One could argue that the methodology, while innovative, has certain limitations.", correctAnswer: "One could argue that the methodology, while innovative, has certain limitations.", language: "en", hint: "Present a balanced academic critique" },
          { type: "SPEECH", question: "These preliminary findings should be interpreted with appropriate caution.", correctAnswer: "These preliminary findings should be interpreted with appropriate caution.", language: "en", hint: "Advise caution in interpreting research results" },
        ]
      },
      {
        title: "Past Habit: Would vs Used To",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'When I was young, I ___ play in the park every evening.'", options: ["used to", "would", "both A and B", "had to"], correctAnswer: "2", explanation: "Both 'used to' and 'would' work for past habits (actions)." },
          { type: "MCQ", question: "'There ___ be a cinema on this street.'", options: ["used to", "would", "both A and B", "will"], correctAnswer: "0", explanation: "'Used to' for past states; 'would' cannot be used for states." },
          { type: "MCQ", question: "'She ___ have long hair when she was a child.'", options: ["used to", "would", "both A and B", "will"], correctAnswer: "0", explanation: "'Used to' for past states (having hair). 'Would' only for actions." },
          { type: "MCQ", question: "What's the key difference between 'would' and 'used to'?", options: ["'Would' only for actions, 'used to' for both", "'Used to' only for actions, 'would' for both", "No difference", "'Would' for present, 'used to' for past"], correctAnswer: "0", explanation: "'Would' = past habits (actions only). 'Used to' = past habits AND states." },
          { type: "TRUE_FALSE", question: "True or False: 'I would live in Paris' is correct for a past state.", correctAnswer: "false", explanation: "'Would' cannot be used for states. Should be 'I used to live in Paris'." },
          { type: "TRUE_FALSE", question: "True or False: 'We would always go swimming in summer' is correct.", correctAnswer: "true", explanation: "'Would' for repeated past actions is correct." },
          { type: "FILL_BLANK", question: "Complete: My grandfather ___ tell us stories every night. (habit)", correctAnswer: "would", explanation: "'Would' for repeated past actions." },
          { type: "FILL_BLANK", question: "Complete: This building ___ be a school before it was converted.", correctAnswer: "used to", explanation: "'Used to' for past states." },
          { type: "FILL_BLANK", question: "Complete: I ___ believe in Santa Claus when I was little.", correctAnswer: "used to", explanation: "'Used to' for past states/beliefs. 'Would' cannot be used for states." },
          { type: "MATCHING", question: "Match the sentence with the correct form:", options: [{ left: "I ___ play football every weekend", right: "used to / would" }, { left: "She ___ be my teacher", right: "used to only" }, { left: "We ___ visit grandma every Sunday", right: "used to / would" }, { left: "There ___ be a post office here", right: "used to only" }], correctAnswer: "[0,1,2,3]", explanation: "'Would' for actions only; 'used to' for both actions and states." },
          { type: "CHECKBOX", question: "Select all correct past habit sentences:", options: ["I used to play tennis every weekend", "She would always read before bed", "He used to be very shy", "There would be a post office here"], correctAnswer: "[0,1,2]", explanation: "'There would be' is wrong for past states; use 'used to be'. The others are correct." },
          { type: "ORDERING", question: "Put in order: would / we / summer / every / swim / in the lake", correctAnswer: "We,would swim in the lake,every summer", explanation: "'Would' for repeated past actions." },
          { type: "SPEECH", question: "My grandmother would always bake fresh bread on Sunday mornings.", correctAnswer: "My grandmother would always bake fresh bread on Sunday mornings.", language: "en", hint: "Describe a cherished childhood memory" },
          { type: "SPEECH", question: "There used to be a beautiful garden where this parking lot is now.", correctAnswer: "There used to be a beautiful garden where this parking lot is now.", language: "en", hint: "Describe how a place has changed over time" },
        ]
      },
      {
        title: "Module 2 Review: Modal Nuances & Advanced Speculation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She ___ have been studying all night; she looks exhausted.'", options: ["must", "can", "will", "should"], correctAnswer: "0", explanation: "'Must have been studying' = deduction about past continuous action." },
          { type: "MCQ", question: "'The results ___ be taken as definitive proof.'", options: ["should not", "can not", "will not", "shall not"], correctAnswer: "0", explanation: "'Should not' = academic recommendation against treating as definitive." },
          { type: "MCQ", question: "'He ___ know the answer; he wrote the textbook.'", options: ["is bound to", "can be bound to", "will be bound to", "should be bound to"], correctAnswer: "0", explanation: "'Is bound to' = near certainty." },
          { type: "MCQ", question: "'When we were kids, we ___ build forts in the woods.'", options: ["would", "used to", "both A and B", "had to"], correctAnswer: "2", explanation: "Both work for past habitual actions." },
          { type: "TRUE_FALSE", question: "True or False: 'She used to have a dog' is correct but 'She would have a dog' is not.", correctAnswer: "true", explanation: "'Used to' for past states (having a dog). 'Would' cannot be used for states." },
          { type: "TRUE_FALSE", question: "True or False: 'One might argue' is an example of academic hedging.", correctAnswer: "true", explanation: "'Might argue' = hedging; presents a possible perspective." },
          { type: "FILL_BLANK", question: "Complete: You ___ (not/worry) about it; everything turned out fine.", correctAnswer: "needn't have worried", explanation: "Unnecessary past worry: needn't + have + past participle." },
          { type: "FILL_BLANK", question: "Complete: The correlation ___ (not/interpreted) as causation.", correctAnswer: "should not be interpreted", explanation: "Academic recommendation: should not + be + past participle." },
          { type: "FILL_BLANK", question: "Complete: He ___ (live) in the city before moving to the countryside.", correctAnswer: "used to live", explanation: "'Used to' for past state." },
          { type: "MATCHING", question: "Match the modal with its advanced function:", options: [{ left: "Must have been", right: "Past deduction" }, { left: "Could be argued", right: "Academic hedging" }, { left: "Is bound to", right: "Near certainty" }, { left: "Used to", right: "Past habit/state" }], correctAnswer: "[0,1,2,3]", explanation: "Each modal form serves a different advanced function." },
          { type: "CHECKBOX", question: "Select all correct modal sentences:", options: ["He must have been waiting for hours", "She used to be much more outgoing", "The data could suggest a trend", "He would be very tall when he was young"], correctAnswer: "[0,1,2]", explanation: "'Would be' for a past state (height) is wrong; use 'used to be'. The others are correct." },
          { type: "ORDERING", question: "Put in order: needn't / you / have / about / worried / it", correctAnswer: "You,needn't have worried,about it", explanation: "Needn't + have + past participle for unnecessary past action." },
          { type: "SPEECH", question: "Given the available evidence, the defendant must have been at the scene of the crime.", correctAnswer: "Given the available evidence, the defendant must have been at the scene of the crime.", language: "en", hint: "Make a logical deduction based on evidence" },
          { type: "SPEECH", question: "One could reasonably argue that the policy has had unintended consequences.", correctAnswer: "One could reasonably argue that the policy has had unintended consequences.", language: "en", hint: "Present an academic argument with appropriate hedging" },
          { type: "SPEECH", question: "My father would always read the newspaper with his morning coffee.", correctAnswer: "My father would always read the newspaper with his morning coffee.", language: "en", hint: "Describe a past habit of a family member" },
        ]
      },
    ]
  },
  {
    title: "Complex Syntax: Inversion & Emphasis",
    lessons: [
      {
        title: "Negative Inversion for Emphasis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Never before ___ such a magnificent performance.'", options: ["have I seen", "I have seen", "I saw", "did I seen"], correctAnswer: "0", explanation: "Negative inversion: 'Never before' + auxiliary + subject + verb." },
          { type: "MCQ", question: "'Not until the meeting ended ___ the truth.'", options: ["did she reveal", "she revealed", "she did reveal", "revealed she"], correctAnswer: "0", explanation: "'Not until' + time expression + auxiliary + subject + verb." },
          { type: "MCQ", question: "'Rarely ___ such a talented young musician.'", options: ["have we encountered", "we have encountered", "we encountered", "have we encounter"], correctAnswer: "0", explanation: "'Rarely' + auxiliary + subject + verb = negative inversion for emphasis." },
          { type: "MCQ", question: "Which triggers negative inversion?", options: ["Under no circumstances", "Always", "Usually", "Sometimes"], correctAnswer: "0", explanation: "Negative expressions at the beginning trigger inversion." },
          { type: "TRUE_FALSE", question: "True or False: 'Seldom do we see such dedication' is grammatically correct.", correctAnswer: "true", explanation: "'Seldom' + auxiliary + subject + verb = correct negative inversion." },
          { type: "TRUE_FALSE", question: "True or False: 'Never I have seen such beauty' is correct inversion.", correctAnswer: "false", explanation: "Should be 'Never have I seen' (auxiliary before subject)." },
          { type: "FILL_BLANK", question: "Complete: Under no circumstances ___ the door be left unlocked.", correctAnswer: "should", explanation: "'Under no circumstances' + auxiliary + subject." },
          { type: "FILL_BLANK", question: "Complete: Not only ___ she finish first, but she also broke the record.", correctAnswer: "did", explanation: "'Not only' + auxiliary + subject + verb." },
          { type: "FILL_BLANK", question: "Complete: Little ___ he know what was about to happen.", correctAnswer: "did", explanation: "'Little' + auxiliary + subject + verb = negative inversion." },
          { type: "MATCHING", question: "Match the negative expression with its inverted form:", options: [{ left: "Never before", right: "Have I seen" }, { left: "Under no circumstances", right: "Should you" }, { left: "Not only", right: "Did she" }, { left: "Seldom", right: "Do we" }], correctAnswer: "[0,1,2,3]", explanation: "Each negative expression triggers subject-auxiliary inversion." },
          { type: "CHECKBOX", question: "Select all correct negative inversion sentences:", options: ["Never have I heard such nonsense", "Under no circumstances should you leave", "Not only did he win, but he also set a record", "Rarely she has shown such commitment"], correctAnswer: "[0,1,2]", explanation: "'Rarely she has shown' is wrong; should be 'Rarely has she shown'. The others are correct." },
          { type: "ORDERING", question: "Put in order: never / before / I / had / such / seen / beautiful / sunset / a", correctAnswer: "Never before,had I seen,such a beautiful sunset", explanation: "Never before + past perfect inversion." },
          { type: "SPEECH", question: "Never have I witnessed such a spectacular display of natural beauty.", correctAnswer: "Never have I witnessed such a spectacular display of natural beauty.", language: "en", hint: "Express awe using negative inversion" },
          { type: "SPEECH", question: "Not only did the team win the championship, but they also broke every record.", correctAnswer: "Not only did the team win the championship, but they also broke every record.", language: "en", hint: "Emphasize multiple achievements using inversion" },
        ]
      },
      {
        title: "Cleft Sentences: It-Clefts & Wh-Clefts",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ was John who broke the window.'", options: ["It", "He", "That", "What"], correctAnswer: "0", explanation: "It-cleft: 'It was John who...' emphasizes the subject." },
          { type: "MCQ", question: "'___ I need is a good night's sleep.'", options: ["What", "It", "That", "Which"], correctAnswer: "0", explanation: "Wh-cleft (pseudo-cleft): 'What I need is...' emphasizes the complement." },
          { type: "MCQ", question: "'It was ___ she said that really upset me.'", options: ["what", "that", "which", "who"], correctAnswer: "0", explanation: "It-cleft emphasizing the object: 'It was what she said that...'" },
          { type: "MCQ", question: "What's the purpose of a cleft sentence?", options: ["To emphasize a specific element", "To ask a question", "To make a comparison", "To give a command"], correctAnswer: "0", explanation: "Cleft sentences divide information to emphasize one part." },
          { type: "TRUE_FALSE", question: "True or False: 'What annoys me is his constant complaining' is a wh-cleft.", correctAnswer: "true", explanation: "Wh-cleft structure: 'What + clause + be + emphasized element'." },
          { type: "TRUE_FALSE", question: "True or False: 'It was yesterday when I met her' is an it-cleft.", correctAnswer: "true", explanation: "It-cleft emphasizing the time: 'It was yesterday that/when I met her'." },
          { type: "FILL_BLANK", question: "Complete: ___ really matters is your attitude, not your qualifications.", correctAnswer: "What", explanation: "Wh-cleft: 'What really matters is...'" },
          { type: "FILL_BLANK", question: "Complete: It was ___ helped me when I needed it most.", correctAnswer: "Sarah who", explanation: "It-cleft emphasizing the person." },
          { type: "FILL_BLANK", question: "Complete: ___ I find most frustrating is the lack of communication.", correctAnswer: "What", explanation: "Wh-cleft emphasizing the frustrating thing." },
          { type: "MATCHING", question: "Match the cleft type with its structure:", options: [{ left: "It-cleft", right: "It was X that/who..." }, { left: "Wh-cleft", right: "What X is/was Y" }, { left: "Reversed wh-cleft", right: "Y is/was what X..." }, { left: "All-cleft", right: "All X is/was Y..." }], correctAnswer: "[0,1,2,3]", explanation: "Each cleft type has a distinct structure for emphasis." },
          { type: "CHECKBOX", question: "Select all correct cleft sentences:", options: ["It was the weather that ruined our plans", "What I want is a fresh start", "All he did was complain", "What happened it was a misunderstanding"], correctAnswer: "[0,1,2]", explanation: "'What happened it was' is wrong; should be 'What happened was'. The others are correct." },
          { type: "ORDERING", question: "Put in order: it / his / was / attitude / that / annoyed / everyone", correctAnswer: "It was his attitude,that annoyed everyone", explanation: "It-cleft emphasizing the subject." },
          { type: "SPEECH", question: "What I find most remarkable about her is her ability to remain calm under pressure.", correctAnswer: "What I find most remarkable about her is her ability to remain calm under pressure.", language: "en", hint: "Emphasize someone's outstanding quality using a wh-cleft" },
          { type: "SPEECH", question: "It was not until the final minutes of the game that they scored the winning goal.", correctAnswer: "It was not until the final minutes of the game that they scored the winning goal.", language: "en", hint: "Emphasize the timing of a crucial event" },
        ]
      },
      {
        title: "Fronting & Topicalization",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ I cannot tolerate is dishonesty.'", options: ["What", "That", "Which", "Who"], correctAnswer: "0", explanation: "Fronted wh-clause for emphasis: 'What I cannot tolerate is...'" },
          { type: "MCQ", question: "'Strange ___ it may seem, I've never been to Paris.'", options: ["as", "though", "both A and B", "like"], correctAnswer: "2", explanation: "Both 'as' and 'though' work for concessive fronting." },
          { type: "MCQ", question: "'Much ___ I admire her work, I disagree with her methods.'", options: ["as", "though", "both A and B", "since"], correctAnswer: "2", explanation: "Fronted concessive structure: 'Much as/though I admire...'" },
          { type: "MCQ", question: "What is the purpose of fronting?", options: ["To emphasize the fronted element", "To ask a question", "To show sequence", "To express doubt"], correctAnswer: "0", explanation: "Fronting moves an element to the beginning for emphasis or cohesion." },
          { type: "TRUE_FALSE", question: "True or False: 'This book I highly recommend' is an example of fronting.", correctAnswer: "true", explanation: "Object fronting: 'This book' moved to the front for emphasis." },
          { type: "TRUE_FALSE", question: "True or False: 'Try as he might, he couldn't solve it' uses fronting correctly.", correctAnswer: "true", explanation: "Concessive fronting: 'Try as he might' = 'Although he tried hard'." },
          { type: "FILL_BLANK", question: "Complete: ___ I do want is an honest explanation.", correctAnswer: "What", explanation: "Fronted wh-clause: 'What I do want is...'" },
          { type: "FILL_BLANK", question: "Complete: Brilliant ___ she is, she still works incredibly hard.", correctAnswer: "as", explanation: "Concessive fronting: 'Brilliant as she is' = 'Although she is brilliant'." },
          { type: "FILL_BLANK", question: "Complete: ___ he couldn't explain was his absence from the meeting.", correctAnswer: "What", explanation: "Fronted subject clause." },
          { type: "MATCHING", question: "Match the fronting type with its example:", options: [{ left: "Object fronting", right: "This I cannot accept" }, { left: "Adverbial fronting", right: "In the garden sat a cat" }, { left: "Concessive fronting", right: "Try as he might" }, { left: "Wh-clause fronting", right: "What I need is time" }], correctAnswer: "[0,1,2,3]", explanation: "Each type of fronting serves a different emphasis function." },
          { type: "CHECKBOX", question: "Select all correct fronting sentences:", options: ["His behavior I cannot understand", "Strange though it sounds, it's true", "What she wants is recognition", "Very as he tried, he failed"], correctAnswer: "[0,1,2]", explanation: "'Very as he tried' is wrong; should be 'Hard as he tried'. The others are correct." },
          { type: "ORDERING", question: "Put in order: try / she / might / she / couldn't / remember / his name", correctAnswer: "Try as she might,she couldn't remember,his name", explanation: "Concessive fronting structure." },
          { type: "SPEECH", question: "Much as I appreciate your effort, the results are simply not acceptable.", correctAnswer: "Much as I appreciate your effort, the results are simply not acceptable.", language: "en", hint: "Acknowledge effort while delivering criticism" },
          { type: "SPEECH", question: "What really sets this product apart is its innovative design.", correctAnswer: "What really sets this product apart is its innovative design.", language: "en", hint: "Emphasize a key differentiating feature" },
        ]
      },
      {
        title: "Module 3 Review: Complex Syntax & Emphasis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Under no circumstances ___ the alarm be ignored.'", options: ["should", "would", "could", "might"], correctAnswer: "0", explanation: "'Under no circumstances' + should + subject + verb." },
          { type: "MCQ", question: "'___ really frustrates me is the lack of progress.'", options: ["What", "That", "Which", "It"], correctAnswer: "0", explanation: "Wh-cleft: 'What really frustrates me is...'" },
          { type: "MCQ", question: "'___ the truth be known, he was never qualified for the position.'", options: ["Were", "Was", "If", "Had"], correctAnswer: "0", explanation: "'Were the truth be known' = 'If the truth were known'." },
          { type: "MCQ", question: "'Into the darkness ___ the lone figure.'", options: ["disappeared", "did disappear", "was disappearing", "has disappeared"], correctAnswer: "0", explanation: "Directional fronting with full inversion." },
          { type: "TRUE_FALSE", question: "True or False: 'Seldom has such a brilliant mind been wasted' uses negative inversion correctly.", correctAnswer: "true", explanation: "'Seldom' + auxiliary + subject = correct negative inversion." },
          { type: "TRUE_FALSE", question: "True or False: 'It was John he gave the book to' is a correct it-cleft.", correctAnswer: "false", explanation: "Should be 'It was to John that he gave the book' or 'It was John who he gave the book to'." },
          { type: "FILL_BLANK", question: "Complete: Not until the deadline passed ___ they realize the urgency.", correctAnswer: "did", explanation: "'Not until' + past expression + did + subject." },
          { type: "FILL_BLANK", question: "Complete: ___ annoys me most is his condescending attitude.", correctAnswer: "What", explanation: "Wh-cleft emphasizing the annoying thing." },
          { type: "FILL_BLANK", question: "Complete: Hard ___ he tried, he couldn't match her skill.", correctAnswer: "as", explanation: "Concessive fronting: 'Hard as he tried'." },
          { type: "MATCHING", question: "Match the emphasis technique with its example:", options: [{ left: "Negative inversion", right: "Never have I seen" }, { left: "It-cleft", right: "It was John who" }, { left: "Wh-cleft", right: "What I want is" }, { left: "Fronting", right: "This I cannot accept" }], correctAnswer: "[0,1,2,3]", explanation: "Each technique emphasizes different elements." },
          { type: "CHECKBOX", question: "Select all correct emphasis sentences:", options: ["Rarely do we encounter such talent", "It was her dedication that impressed us most", "What matters is the effort, not the outcome", "On the table it was a book"], correctAnswer: "[0,1,2]", explanation: "'On the table it was a book' is wrong; should be 'On the table was a book' (full inversion). The others are correct." },
          { type: "ORDERING", question: "Put in order: what / need / I / is / a / break / long", correctAnswer: "What I need is,a long break", explanation: "Wh-cleft structure." },
          { type: "SPEECH", question: "Never before in the history of this institution has such a distinguished scholar been appointed.", correctAnswer: "Never before in the history of this institution has such a distinguished scholar been appointed.", language: "en", hint: "Announce a historically significant appointment" },
          { type: "SPEECH", question: "What sets this proposal apart from all others is its innovative approach to sustainability.", correctAnswer: "What sets this proposal apart from all others is its innovative approach to sustainability.", language: "en", hint: "Highlight the unique aspect of a proposal" },
          { type: "SPEECH", question: "On no account should these confidential files be accessed by unauthorized personnel.", correctAnswer: "On no account should these confidential files be accessed by unauthorized personnel.", language: "en", hint: "Issue a strict security directive" },
        ]
      },
    ]
  },
  {
    title: "Advanced Discourse & Cohesion",
    lessons: [
      {
        title: "Advanced Linking Words & Transitions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the economic downturn, the company continued to grow.'", options: ["Notwithstanding", "Because of", "Due to", "As a result of"], correctAnswer: "0", explanation: "'Notwithstanding' = despite (formal concessive connector)." },
          { type: "MCQ", question: "'The plan was risky; ___, we decided to proceed.'", options: ["nevertheless", "consequently", "therefore", "thus"], correctAnswer: "0", explanation: "'Nevertheless' = despite that (concessive transition)." },
          { type: "MCQ", question: "'___ the fact that he was inexperienced, he performed admirably.'", options: ["Notwithstanding", "Owing to", "On account of", "In view of"], correctAnswer: "0", explanation: "'Notwithstanding the fact that' = despite the fact that." },
          { type: "MCQ", question: "Which is a formal concessive connector?", options: ["Albeit", "Because", "Therefore", "Moreover"], correctAnswer: "0", explanation: "'Albeit' = although (formal concessive)." },
          { type: "TRUE_FALSE", question: "True or False: 'The results were promising, albeit inconclusive' is correct.", correctAnswer: "true", explanation: "'Albeit' = although; followed by an adjective or phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Notwithstanding' and 'despite' can be used interchangeably.", correctAnswer: "true", explanation: "Both mean 'in spite of'; 'notwithstanding' is more formal." },
          { type: "FILL_BLANK", question: "Complete: ___, the project was completed on time and within budget.", correctAnswer: "Nevertheless", explanation: "'Nevertheless' = despite difficulties." },
          { type: "FILL_BLANK", question: "Complete: The theory is elegant, ___ difficult to apply in practice.", correctAnswer: "albeit", explanation: "'Albeit' = although, connecting two contrasting ideas." },
          { type: "FILL_BLANK", question: "Complete: ___ the overwhelming evidence, he maintained his innocence.", correctAnswer: "Notwithstanding", explanation: "'Notwithstanding' = despite." },
          { type: "MATCHING", question: "Match the connector with its function:", options: [{ left: "Notwithstanding", right: "Despite (formal)" }, { left: "Nevertheless", right: "Despite that" }, { left: "Albeit", right: "Although" }, { left: "Conversely", right: "Opposite comparison" }], correctAnswer: "[0,1,2,3]", explanation: "Each connector serves a different discourse function." },
          { type: "CHECKBOX", question: "Select all correct linking word uses:", options: ["The evidence was compelling; nevertheless, the jury acquitted him", "Albeit tired, she continued working", "Notwithstanding the challenges, they succeeded", "The data was inconclusive; conversely, the trend was clear"], correctAnswer: "[0,2]", explanation: "'Albeit tired' is wrong; 'albeit' is followed by adjectives/phrases, not standalone. 'Conversely' is used incorrectly. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / notwithstanding / criticism / project / proceeded / as planned", correctAnswer: "Notwithstanding the criticism,the project proceeded,as planned", explanation: "'Notwithstanding' at the front for formal concessive meaning." },
          { type: "SPEECH", question: "The proposal, albeit well-intentioned, fails to address the core issues.", correctAnswer: "The proposal, albeit well-intentioned, fails to address the core issues.", language: "en", hint: "Acknowledge good intentions while pointing out flaws" },
          { type: "SPEECH", question: "Notwithstanding the significant obstacles, the team delivered exceptional results.", correctAnswer: "Notwithstanding the significant obstacles, the team delivered exceptional results.", language: "en", hint: "Praise achievement despite difficulties" },
        ]
      },
      {
        title: "Reference & Substitution Devices",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The report was comprehensive. ___ covered every aspect of the issue.'", options: ["It", "This", "That", "Such"], correctAnswer: "0", explanation: "'It' refers back to the specific noun 'the report'." },
          { type: "MCQ", question: "'The findings were surprising. ___ had never been observed before.'", options: ["Such results", "Such a result", "So result", "Such the result"], correctAnswer: "0", explanation: "'Such results' = results of this kind." },
          { type: "MCQ", question: "'The methodology was flawed. ___, the results cannot be trusted.'", options: ["Consequently", "Despite this", "Notwithstanding", "Albeit"], correctAnswer: "0", explanation: "'Consequently' = as a result (cause-effect link)." },
          { type: "MCQ", question: "Which word can substitute for a whole clause?", options: ["So", "Such", "This", "That"], correctAnswer: "0", explanation: "'So' can substitute for a clause: 'I think so' = 'I think that [clause]'." },
          { type: "TRUE_FALSE", question: "True or False: 'The former' and 'the latter' refer to the first and second of two things mentioned.", correctAnswer: "true", explanation: "'The former' = first mentioned; 'the latter' = second mentioned." },
          { type: "TRUE_FALSE", question: "True or False: 'The aforementioned' refers to something mentioned earlier in the text.", correctAnswer: "true", explanation: "'Aforementioned' = previously mentioned (formal reference)." },
          { type: "FILL_BLANK", question: "Complete: Two options were proposed. The ___ was more cost-effective.", correctAnswer: "former", explanation: "'The former' = the first of two options." },
          { type: "FILL_BLANK", question: "Complete: The results were remarkable. ___ a breakthrough had been achieved.", correctAnswer: "It was clear that", explanation: "Reference device introducing a conclusion." },
          { type: "FILL_BLANK", question: "Complete: The data was inconclusive, and ___ further research is needed.", correctAnswer: "therefore", explanation: "'Therefore' = as a logical consequence." },
          { type: "MATCHING", question: "Match the reference device with its function:", options: [{ left: "The former", right: "First of two" }, { left: "The latter", right: "Second of two" }, { left: "Such", right: "Of this kind" }, { left: "The aforementioned", right: "Previously mentioned" }], correctAnswer: "[0,1,2,3]", explanation: "Each device refers back to previously mentioned information." },
          { type: "CHECKBOX", question: "Select all correct reference sentences:", options: ["Both options were viable; the latter was cheaper", "Such evidence is inadmissible in court", "The aforementioned policy has been revised", "He said so, but I don't believe it"], correctAnswer: "[0,1,2,3]", explanation: "All are correct uses of reference and substitution devices." },
          { type: "ORDERING", question: "Put in order: the / results / were / mixed; / former / the / promising / the / latter / was / was / less", correctAnswer: "The results were mixed;the former was promising,the latter was less", explanation: "Former/latter reference structure." },
          { type: "SPEECH", question: "Two approaches were considered; the former was rejected due to cost constraints.", correctAnswer: "Two approaches were considered; the former was rejected due to cost constraints.", language: "en", hint: "Compare two options and explain the decision" },
          { type: "SPEECH", question: "Such was the magnitude of the disaster that international aid was immediately requested.", correctAnswer: "Such was the magnitude of the disaster that international aid was immediately requested.", language: "en", hint: "Emphasize the scale of an event" },
        ]
      },
      {
        title: "Ellipsis & Substitution in Discourse",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'She can speak French, and so ___ I.'", options: ["can", "do", "am", "have"], correctAnswer: "0", explanation: "'So can I' = elliptical agreement with 'can speak French'." },
          { type: "MCQ", question: "'I don't agree, and neither ___ my colleagues.'", options: ["do", "can", "are", "have"], correctAnswer: "0", explanation: "'Neither do' = elliptical negative agreement." },
          { type: "MCQ", question: "'Who wants to go?' 'I ___. '", options: ["do", "want", "am", "will"], correctAnswer: "0", explanation: "'I do' = elliptical response substituting for 'I want to go'." },
          { type: "MCQ", question: "What is ellipsis in discourse?", options: ["Omitting understood words", "Repeating words", "Adding emphasis", "Changing meaning"], correctAnswer: "0", explanation: "Ellipsis = omitting words that are understood from context." },
          { type: "TRUE_FALSE", question: "True or False: 'Some people agreed; others didn't' uses ellipsis correctly.", correctAnswer: "true", explanation: "'Others didn't' = 'Others didn't agree' (ellipsis of understood verb)." },
          { type: "TRUE_FALSE", question: "True or False: 'She will help if she can to' is correct.", correctAnswer: "false", explanation: "Should be 'She will help if she can' (no 'to' needed after ellipsis)." },
          { type: "FILL_BLANK", question: "Complete: He promised to call, but he didn't ___.", correctAnswer: "", explanation: "Ellipsis: 'didn't' alone implies 'didn't call'." },
          { type: "FILL_BLANK", question: "Complete: I haven't read the report, but my colleague has ___.", correctAnswer: "", explanation: "Ellipsis: 'has' alone implies 'has read the report'." },
          { type: "FILL_BLANK", question: "Complete: She's more qualified than I ___.", correctAnswer: "am", explanation: "Elliptical comparison: 'than I am (qualified)'." },
          { type: "MATCHING", question: "Match the elliptical structure with its full form:", options: [{ left: "So do I", right: "I do too" }, { left: "Neither can she", right: "She can't either" }, { left: "I haven't either", right: "Neither have I" }, { left: "She might", right: "She might do" }], correctAnswer: "[0,1,2,3]", explanation: "Each elliptical form is a shortened version of a full response." },
          { type: "CHECKBOX", question: "Select all correct ellipsis sentences:", options: ["Some accepted; others declined", "I could have, but I chose not to", "She speaks better than he does", "He will, and she will too"], correctAnswer: "[0,1,2,3]", explanation: "All are correct examples of ellipsis in discourse." },
          { type: "ORDERING", question: "Put in order: neither / do / I / agree / nor / does / she", correctAnswer: "Neither do I agree,nor does she", explanation: "Neither/nor elliptical structure." },
          { type: "SPEECH", question: "I haven't had the opportunity to review the document, but my assistant has.", correctAnswer: "I haven't had the opportunity to review the document, but my assistant has.", language: "en", hint: "Acknowledge your lack of action while noting someone else's" },
          { type: "SPEECH", question: "She was determined to succeed, and succeed she did.", correctAnswer: "She was determined to succeed, and succeed she did.", language: "en", hint: "Use repetition for emphasis with ellipsis" },
        ]
      },
      {
        title: "Module 4 Review: Advanced Discourse & Cohesion",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the overwhelming opposition, the legislation was passed.'", options: ["Notwithstanding", "Because of", "Due to", "On account of"], correctAnswer: "0", explanation: "'Notwithstanding' = despite (formal concessive)." },
          { type: "MCQ", question: "'The first theory was elegant; the ___, more practical.'", options: ["latter", "former", "formal", "lately"], correctAnswer: "0", explanation: "'The latter' = the second of two things mentioned." },
          { type: "MCQ", question: "'I have never been to Japan, and ___ has my sister.'", options: ["neither", "either", "so", "nor"], correctAnswer: "0", explanation: "'Neither has' = elliptical negative agreement." },
          { type: "MCQ", question: "'The data was inconclusive. ___, the trend was clear.'", options: ["Nevertheless", "Consequently", "Therefore", "Thus"], correctAnswer: "0", explanation: "'Nevertheless' = despite the inconclusive data." },
          { type: "TRUE_FALSE", question: "True or False: 'Albeit' can be followed by a full clause with a subject and verb.", correctAnswer: "false", explanation: "'Albeit' is followed by adjectives, adverbs, or phrases, not full clauses." },
          { type: "TRUE_FALSE", question: "True or False: 'Such was his reputation that everyone feared him' is correct.", correctAnswer: "true", explanation: "'Such...that' = to such a degree that." },
          { type: "FILL_BLANK", question: "Complete: ___, the committee reached a unanimous decision.", correctAnswer: "Consequently", explanation: "Causal cohesive device." },
          { type: "FILL_BLANK", question: "Complete: The proposal is innovative, ___ difficult to implement.", correctAnswer: "albeit", explanation: "'Albeit' = although." },
          { type: "FILL_BLANK", question: "Complete: Two candidates were shortlisted. The ___ had more experience.", correctAnswer: "former", explanation: "'The former' = the first of two." },
          { type: "MATCHING", question: "Match the device with its discourse function:", options: [{ left: "Notwithstanding", right: "Concession" }, { left: "Furthermore", right: "Addition" }, { left: "Consequently", right: "Causation" }, { left: "The former", right: "Reference" }], correctAnswer: "[0,1,2,3]", explanation: "Each device serves a different cohesive function." },
          { type: "CHECKBOX", question: "Select all correct discourse sentences:", options: ["The findings were significant; however, limitations exist", "Furthermore, the methodology was sound", "Notwithstanding the challenges, they persevered", "She can play piano, and so can her brother"], correctAnswer: "[0,1,2,3]", explanation: "All are correct uses of discourse and cohesion devices." },
          { type: "ORDERING", question: "Put in order: despite / criticism / the / project / the / continued / received / it", correctAnswer: "Despite the criticism it received,the project continued", explanation: "Concessive cohesive structure." },
          { type: "SPEECH", question: "Notwithstanding the initial setbacks, the project ultimately exceeded all expectations.", correctAnswer: "Notwithstanding the initial setbacks, the project ultimately exceeded all expectations.", language: "en", hint: "Report success despite early difficulties" },
          { type: "SPEECH", question: "The former approach proved too costly; the latter, while cheaper, was less effective.", correctAnswer: "The former approach proved too costly; the latter, while cheaper, was less effective.", language: "en", hint: "Compare two approaches using former/latter" },
          { type: "SPEECH", question: "The evidence is far from conclusive; consequently, we must proceed with caution.", correctAnswer: "The evidence is far from conclusive; consequently, we must proceed with caution.", language: "en", hint: "Draw a logical conclusion and recommend caution" },
        ]
      },
    ]
  },
  {
    title: "Academic Register & Formal Style",
    lessons: [
      {
        title: "Nominalization & Academic Tone",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The government ___ to reduce emissions.' (nominalized: The government's ___ of emissions)", options: ["decision", "decided", "deciding", "decisive"], correctAnswer: "0", explanation: "Nominalization: 'decided' → 'decision' for formal academic style." },
          { type: "MCQ", question: "'Scientists ___ that the theory is correct.' (nominalized: Scientific ___ that...)", options: ["consensus", "consent", "consensual", "consenting"], correctAnswer: "0", explanation: "Nominalization: verb → noun for formal academic tone." },
          { type: "MCQ", question: "'The population ___ rapidly.' (nominalized: The rapid ___ of the population)", options: ["growth", "growing", "grew", "grown"], correctAnswer: "0", explanation: "Nominalization: 'grew' → 'growth' for academic style." },
          { type: "MCQ", question: "What is nominalization?", options: ["Turning verbs/adjectives into nouns", "Turning nouns into verbs", "Adding adjectives", "Removing articles"], correctAnswer: "0", explanation: "Nominalization creates more formal, abstract academic prose." },
          { type: "TRUE_FALSE", question: "True or False: 'The implementation of the policy' is more formal than 'They implemented the policy.'", correctAnswer: "true", explanation: "Nominalization ('implementation') creates more formal academic style." },
          { type: "TRUE_FALSE", question: "True or False: Excessive nominalization can make writing difficult to read.", correctAnswer: "true", explanation: "Too many nominalizations create dense, hard-to-read prose." },
          { type: "FILL_BLANK", question: "Complete: The ___ of the new system caused confusion. (implement)", correctAnswer: "implementation", explanation: "Nominalization of 'implement' for academic tone." },
          { type: "FILL_BLANK", question: "Complete: There was widespread ___ of the proposal. (reject)", correctAnswer: "rejection", explanation: "Nominalization of 'reject'." },
          { type: "FILL_BLANK", question: "Complete: The ___ of evidence supports this conclusion. (accumulate)", correctAnswer: "accumulation", explanation: "Nominalization of 'accumulate'." },
          { type: "MATCHING", question: "Match the verb with its nominalization:", options: [{ left: "Investigate", right: "Investigation" }, { left: "Analyze", right: "Analysis" }, { left: "Develop", right: "Development" }, { left: "Consume", right: "Consumption" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb has a specific nominalized form." },
          { type: "CHECKBOX", question: "Select all correct nominalizations:", options: ["The implementation of the policy", "The analysis of the data", "The development of new technology", "The investagation of the crime"], correctAnswer: "[0,1,2]", explanation: "'Investagation' is misspelled; should be 'investigation'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / of / implementation / policy / the / caused / debate / widespread", correctAnswer: "The implementation of the policy,caused widespread debate", explanation: "Nominalized subject for academic style." },
          { type: "SPEECH", question: "The implementation of the new regulations resulted in significant improvements.", correctAnswer: "The implementation of the new regulations resulted in significant improvements.", language: "en", hint: "Describe policy outcomes using nominalization" },
          { type: "SPEECH", question: "A thorough analysis of the data reveals several important trends.", correctAnswer: "A thorough analysis of the data reveals several important trends.", language: "en", hint: "Present research findings in academic style" },
        ]
      },
      {
        title: "Hedging & Boosting in Academic Writing",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The results ___ suggest a correlation between the variables.'", options: ["appear to", "definitely", "undoubtedly", "certainly"], correctAnswer: "0", explanation: "'Appear to' = hedging; avoids absolute claims." },
          { type: "MCQ", question: "'This ___ demonstrates the effectiveness of the intervention.'", options: ["clearly", "might", "could", "may"], correctAnswer: "0", explanation: "'Clearly' = boosting; emphasizes certainty." },
          { type: "MCQ", question: "'It is ___ that further research is needed.'", options: ["evident", "maybe", "perhaps", "possibly"], correctAnswer: "0", explanation: "'Evident' = boosting; strong academic claim." },
          { type: "MCQ", question: "What is the purpose of hedging?", options: ["To express caution and avoid overclaiming", "To emphasize certainty", "To confuse readers", "To add length"], correctAnswer: "0", explanation: "Hedging allows writers to make cautious, defensible claims." },
          { type: "TRUE_FALSE", question: "True or False: 'The data strongly suggests' is a boosted claim.", correctAnswer: "true", explanation: "'Strongly' intensifies the claim (boosting)." },
          { type: "TRUE_FALSE", question: "True or False: 'This may indicate' is more appropriate than 'This proves' in academic writing.", correctAnswer: "true", explanation: "Academic writing prefers hedging ('may indicate') over absolute claims ('proves')." },
          { type: "FILL_BLANK", question: "Complete: The findings ___ to support the initial hypothesis.", correctAnswer: "appear", explanation: "Hedging verb: 'appear to' = seem to." },
          { type: "FILL_BLANK", question: "Complete: This ___ confirms the theoretical prediction.", correctAnswer: "clearly", explanation: "Boosting adverb: 'clearly' emphasizes certainty." },
          { type: "FILL_BLANK", question: "Complete: It is ___ that additional factors may be involved.", correctAnswer: "conceivable", explanation: "Hedging adjective: 'conceivable' = possible." },
          { type: "MATCHING", question: "Match the expression with its function:", options: [{ left: "Appear to", right: "Hedging" }, { left: "Clearly", right: "Boosting" }, { left: "It is possible that", right: "Hedging" }, { left: "Undoubtedly", right: "Boosting" }], correctAnswer: "[0,1,2,3]", explanation: "Hedging expresses caution; boosting emphasizes certainty." },
          { type: "CHECKBOX", question: "Select all appropriate academic hedging/boosting:", options: ["The results appear to confirm the hypothesis", "This clearly demonstrates the effectiveness", "It is conceivable that other factors are involved", "This absolutely proves the theory beyond doubt"], correctAnswer: "[0,1,2]", explanation: "'Absolutely proves beyond doubt' is too absolute for academic writing. The others are appropriate." },
          { type: "ORDERING", question: "Put in order: the / appear / data / support / to / this / conclusion", correctAnswer: "The data,appear to support,this conclusion", explanation: "Hedging structure: appear to + verb." },
          { type: "SPEECH", question: "These findings appear to suggest a significant correlation between the two variables.", correctAnswer: "These findings appear to suggest a significant correlation between the two variables.", language: "en", hint: "Report research results with appropriate academic caution" },
          { type: "SPEECH", question: "The evidence clearly demonstrates that the intervention was highly effective.", correctAnswer: "The evidence clearly demonstrates that the intervention was highly effective.", language: "en", hint: "Present strong findings with appropriate boosting" },
        ]
      },
      {
        title: "Module 5 Review: Academic Register & Formal Style",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The ___ of the new policy has been controversial.' (nominalized: implement)", options: ["implementation", "implementing", "implemented", "implements"], correctAnswer: "0", explanation: "Nominalization: 'implement' → 'implementation'." },
          { type: "MCQ", question: "'The results ___ suggest a significant effect.' (hedging)", options: ["appear to", "definitely", "certainly", "undoubtedly"], correctAnswer: "0", explanation: "'Appear to' = hedging; avoids absolute claims." },
          { type: "MCQ", question: "'The study ___ important limitations.' (formal for 'had')", options: ["exhibited", "had", "possessed", "came with"], correctAnswer: "0", explanation: "'Exhibited' = formal academic verb." },
          { type: "MCQ", question: "'The experiment ___ under controlled conditions.'", options: ["was conducted", "conducted", "was conducting", "conducts"], correctAnswer: "0", explanation: "Academic passive voice." },
          { type: "TRUE_FALSE", question: "True or False: 'The findings corroborate previous research' uses appropriate formal vocabulary.", correctAnswer: "true", explanation: "'Corroborate' = formal for 'support'." },
          { type: "TRUE_FALSE", question: "True or False: 'This absolutely proves the theory' is appropriate academic writing.", correctAnswer: "false", explanation: "Too absolute; use hedging: 'This strongly suggests'." },
          { type: "FILL_BLANK", question: "Complete: The ___ of evidence supports this conclusion. (accumulate)", correctAnswer: "accumulation", explanation: "Nominalization for academic tone." },
          { type: "FILL_BLANK", question: "Complete: The findings ___ to confirm the initial hypothesis. (hedging verb)", correctAnswer: "appear", explanation: "Hedging: 'appear to' = seem to." },
          { type: "FILL_BLANK", question: "Complete: Participants ___ randomly assigned to groups.", correctAnswer: "were", explanation: "Academic passive: 'were randomly assigned'." },
          { type: "MATCHING", question: "Match the technique with its example:", options: [{ left: "Nominalization", right: "The implementation of" }, { left: "Hedging", right: "Appears to suggest" }, { left: "Boosting", right: "Clearly demonstrates" }, { left: "Passive voice", right: "Was conducted" }], correctAnswer: "[0,1,2,3]", explanation: "Each technique contributes to academic register." },
          { type: "CHECKBOX", question: "Select all appropriate academic sentences:", options: ["The implementation of the policy was carefully considered", "The results appear to support the hypothesis", "The data were analyzed using appropriate methods", "The researchers got some interesting results"], correctAnswer: "[0,1,2]", explanation: "'Got' is too informal; use 'obtained' or 'found'. The others are appropriate." },
          { type: "ORDERING", question: "Put in order: the / were / into / participants / divided / groups / two / randomly", correctAnswer: "The participants were randomly divided,into two groups", explanation: "Academic passive for methodology." },
          { type: "SPEECH", question: "The accumulation of evidence strongly suggests that further investigation is warranted.", correctAnswer: "The accumulation of evidence strongly suggests that further investigation is warranted.", language: "en", hint: "Summarize research justification using nominalization and boosting" },
          { type: "SPEECH", question: "It should be noted that these findings may not be generalizable to other populations.", correctAnswer: "It should be noted that these findings may not be generalizable to other populations.", language: "en", hint: "Acknowledge limitations with appropriate hedging" },
          { type: "SPEECH", question: "The data were collected through a comprehensive survey administered to a representative sample.", correctAnswer: "The data were collected through a comprehensive survey administered to a representative sample.", language: "en", hint: "Describe data collection methodology formally" },
        ]
      },
    ]
  },
  {
    title: "Advanced Relative & Participle Clauses",
    lessons: [
      {
        title: "Reduced Relative Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The man ___ at the counter is the manager.' (who is standing)", options: ["standing", "stood", "stands", "is standing"], correctAnswer: "0", explanation: "Reduced relative: 'standing' = 'who is standing'." },
          { type: "MCQ", question: "'The report ___ last week contains important findings.' (which was published)", options: ["published", "publishing", "publishes", "was published"], correctAnswer: "0", explanation: "Reduced passive relative: 'published' = 'which was published'." },
          { type: "MCQ", question: "'Students ___ hard usually achieve good results.' (who work)", options: ["working", "worked", "work", "are working"], correctAnswer: "0", explanation: "Reduced active relative: 'working' = 'who work'." },
          { type: "MCQ", question: "When can a relative clause be reduced?", options: ["When the relative pronoun is the subject", "Always", "Never", "Only in questions"], correctAnswer: "0", explanation: "Reduction is possible when the relative pronoun is the subject of the clause." },
          { type: "TRUE_FALSE", question: "True or False: 'The book that I bought yesterday' can become 'The book bought yesterday.'", correctAnswer: "true", explanation: "Passive relative clause: 'that I bought' → 'bought'." },
          { type: "TRUE_FALSE", question: "True or False: 'The woman who lives next door' can become 'The woman living next door.'", correctAnswer: "true", explanation: "Active relative: 'who lives' → 'living'." },
          { type: "FILL_BLANK", question: "Complete: The data ___ in the table support our hypothesis. (shown)", correctAnswer: "shown", explanation: "Reduced passive relative: 'shown' = 'which are shown'." },
          { type: "FILL_BLANK", question: "Complete: Anyone ___ to participate should register by Friday. (wishing)", correctAnswer: "wishing", explanation: "Reduced active relative: 'wishing' = 'who wishes'." },
          { type: "FILL_BLANK", question: "Complete: The issues ___ during the meeting remain unresolved. (discussed)", correctAnswer: "discussed", explanation: "Reduced passive relative: 'discussed' = 'that were discussed'." },
          { type: "MATCHING", question: "Match the full relative with its reduced form:", options: [{ left: "Who is standing", right: "Standing" }, { left: "Which was published", right: "Published" }, { left: "That contains", right: "Containing" }, { left: "Who were invited", right: "Invited" }], correctAnswer: "[0,1,2,3]", explanation: "Each full relative can be reduced by removing the pronoun and auxiliary." },
          { type: "CHECKBOX", question: "Select all correct reduced relatives:", options: ["The students participating in the study", "The results obtained from the experiment", "The man who sitting at the desk", "The report published last month"], correctAnswer: "[0,1,3]", explanation: "'Who sitting' is wrong; should be 'sitting' (reduced) or 'who is sitting' (full). The others are correct." },
          { type: "ORDERING", question: "Put in order: the / conducted / study / revealed / the / significant / findings", correctAnswer: "The study conducted,revealed significant findings", explanation: "Reduced passive relative: 'conducted' = 'that was conducted'." },
          { type: "SPEECH", question: "The participants completing the final questionnaire will receive a certificate.", correctAnswer: "The participants completing the final questionnaire will receive a certificate.", language: "en", hint: "Describe participants using a reduced active relative" },
          { type: "SPEECH", question: "The data collected over the three-year period provides compelling evidence.", correctAnswer: "The data collected over the three-year period provides compelling evidence.", language: "en", hint: "Reference data using a reduced passive relative" },
        ]
      },
      {
        title: "Non-Defining Relative Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The professor, ___ research is groundbreaking, will give a lecture.'", options: ["whose", "who", "which", "that"], correctAnswer: "0", explanation: "'Whose' = possessive relative pronoun in non-defining clause." },
          { type: "MCQ", question: "'The city, ___ has a population of 2 million, is growing rapidly.'", options: ["which", "that", "who", "whom"], correctAnswer: "0", explanation: "'Which' for non-defining relative clauses about things/places. NOT 'that'." },
          { type: "MCQ", question: "'Dr. Smith, ___ I consulted, agreed with my assessment.'", options: ["whom", "who", "which", "that"], correctAnswer: "0", explanation: "'Whom' as object in formal non-defining relative clause." },
          { type: "MCQ", question: "What punctuation is required for non-defining relative clauses?", options: ["Commas", "Semicolons", "Colons", "No punctuation"], correctAnswer: "0", explanation: "Non-defining clauses are set off by commas." },
          { type: "TRUE_FALSE", question: "True or False: 'The book, which was published in 2020, became a bestseller' is correct.", correctAnswer: "true", explanation: "Non-defining relative clause with commas." },
          { type: "TRUE_FALSE", question: "True or False: 'That' can be used in non-defining relative clauses.", correctAnswer: "false", explanation: "'That' cannot be used in non-defining relative clauses; use 'which'." },
          { type: "FILL_BLANK", question: "Complete: The CEO, ___ decision was controversial, resigned yesterday.", correctAnswer: "whose", explanation: "'Whose' = possessive for non-defining relative." },
          { type: "FILL_BLANK", question: "Complete: The report, ___ took months to complete, was well received.", correctAnswer: "which", explanation: "'Which' for non-defining relative about a thing." },
          { type: "FILL_BLANK", question: "Complete: Professor Jones, ___ I had the pleasure of meeting, is a renowned expert.", correctAnswer: "whom", explanation: "'Whom' as object in formal non-defining relative." },
          { type: "MATCHING", question: "Match the relative pronoun with its use:", options: [{ left: "Who", right: "Subject (person)" }, { left: "Whom", right: "Object (person, formal)" }, { left: "Which", right: "Thing/place (non-defining)" }, { left: "Whose", right: "Possession" }], correctAnswer: "[0,1,2,3]", explanation: "Each relative pronoun serves a different grammatical function." },
          { type: "CHECKBOX", question: "Select all correct non-defining relative sentences:", options: ["The report, which was lengthy, contained valuable insights", "The author, whose work I admire, will be signing books", "The building, that was constructed in 1900, is a landmark", "The committee, whose members are experts, will decide"], correctAnswer: "[0,1,3]", explanation: "'That' cannot be used in non-defining clauses; should be 'which'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / which / study / was / comprehensive / the / most / was", correctAnswer: "The study,which was comprehensive,was the most", explanation: "Non-defining relative clause with commas." },
          { type: "SPEECH", question: "The research team, whose findings were published in Nature, will present their work at the conference.", correctAnswer: "The research team, whose findings were published in Nature, will present their work at the conference.", language: "en", hint: "Introduce a team and their achievement using 'whose'" },
          { type: "SPEECH", question: "The proposed legislation, which has been debated for months, was finally passed by parliament.", correctAnswer: "The proposed legislation, which has been debated for months, was finally passed by parliament.", language: "en", hint: "Provide additional context about legislation using 'which'" },
        ]
      },
      {
        title: "Participle Clauses for Cohesion",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the data, the researchers drew their conclusions.'", options: ["Having analyzed", "Having been analyzed", "Analyzing", "Analyzed"], correctAnswer: "0", explanation: "Perfect participle clause: 'Having analyzed' = after they analyzed." },
          { type: "MCQ", question: "'___ by the results, the team decided to continue the study.'", options: ["Encouraged", "Encouraging", "Having encouraged", "Being encouraged"], correctAnswer: "0", explanation: "Past participle clause: 'Encouraged by' = because they were encouraged." },
          { type: "MCQ", question: "'___ in the city center, the office is easily accessible.'", options: ["Located", "Locating", "Having located", "Being located"], correctAnswer: "0", explanation: "Past participle clause: 'Located' = because it is located." },
          { type: "MCQ", question: "What does a participle clause add to writing?", options: ["Conciseness and sophistication", "Confusion", "Length", "Informality"], correctAnswer: "0", explanation: "Participle clauses make writing more concise and formal." },
          { type: "TRUE_FALSE", question: "True or False: 'Walking down the street, she noticed a familiar face' is correct.", correctAnswer: "true", explanation: "Present participle clause: 'Walking' = while she was walking." },
          { type: "TRUE_FALSE", question: "True or False: 'Having finished the report, the results were surprising' is correct.", correctAnswer: "false", explanation: "Dangling participle: 'Having finished' implies the results finished the report." },
          { type: "FILL_BLANK", question: "Complete: ___ the experiment, the team published their findings. (complete)", correctAnswer: "Having completed", explanation: "Perfect participle: 'Having completed' = after completing." },
          { type: "FILL_BLANK", question: "Complete: ___ by numerous studies, the theory is widely accepted. (support)", correctAnswer: "Supported", explanation: "Past participle: 'Supported by' = because it is supported." },
          { type: "FILL_BLANK", question: "Complete: ___ the limitations, the study remains valuable. (acknowledge)", correctAnswer: "Acknowledging", explanation: "Present participle: 'Acknowledging' = while acknowledging." },
          { type: "MATCHING", question: "Match the participle clause with its meaning:", options: [{ left: "Having analyzed", right: "After analyzing" }, { left: "Encouraged by", right: "Because encouraged" }, { left: "Walking down", right: "While walking" }, { left: "Located in", right: "Because located" }], correctAnswer: "[0,1,2,3]", explanation: "Each participle clause conveys a different relationship." },
          { type: "CHECKBOX", question: "Select all correct participle clauses:", options: ["Having reviewed the literature, we identified a gap", "Supported by evidence, the theory gained acceptance", "Walking to the lab, the rain started", "Located near the campus, the library is popular"], correctAnswer: "[0,1,3]", explanation: "'Walking to the lab, the rain started' has a dangling participle (the rain wasn't walking). The others are correct." },
          { type: "ORDERING", question: "Put in order: having / the / researchers / completed / analysis / published / their / findings", correctAnswer: "Having completed the analysis,the researchers published,their findings", explanation: "Perfect participle clause: Having + past participle." },
          { type: "SPEECH", question: "Having conducted a comprehensive review of the literature, we identified several gaps in current knowledge.", correctAnswer: "Having conducted a comprehensive review of the literature, we identified several gaps in current knowledge.", language: "en", hint: "Describe the logical progression of research using a participle clause" },
          { type: "SPEECH", question: "Supported by extensive empirical evidence, the theory has gained widespread acceptance.", correctAnswer: "Supported by extensive empirical evidence, the theory has gained widespread acceptance.", language: "en", hint: "Explain why a theory is accepted using a participle clause" },
        ]
      },
      {
        title: "Module 6 Review: Advanced Relative & Participle Clauses",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The participants ___ in the study received compensation.' (who were involved)", options: ["involved", "involving", "involve", "were involved"], correctAnswer: "0", explanation: "Reduced passive relative: 'involved' = 'who were involved'." },
          { type: "MCQ", question: "'The report, ___ was published last month, has been widely cited.'", options: ["which", "that", "who", "whom"], correctAnswer: "0", explanation: "'Which' for non-defining relative about a thing." },
          { type: "MCQ", question: "'___ the data, the team identified a clear trend.'", options: ["Having analyzed", "Having been analyzed", "Analyzing", "Analyzed"], correctAnswer: "0", explanation: "Perfect participle: 'Having analyzed' = after analyzing." },
          { type: "MCQ", question: "'Dr. Smith, ___ research is groundbreaking, won the award.'", options: ["whose", "who", "which", "that"], correctAnswer: "0", explanation: "'Whose' = possessive relative pronoun." },
          { type: "TRUE_FALSE", question: "True or False: 'The book, that was published in 2020' is correct.", correctAnswer: "false", explanation: "'That' cannot be used in non-defining relative clauses; use 'which'." },
          { type: "TRUE_FALSE", question: "True or False: 'Walking to work, it started to rain' has a dangling participle.", correctAnswer: "true", explanation: "'Walking' implies 'it' was walking, which is incorrect." },
          { type: "FILL_BLANK", question: "Complete: The data ___ in the appendix support the main argument. (presented)", correctAnswer: "presented", explanation: "Reduced passive relative." },
          { type: "FILL_BLANK", question: "Complete: The methodology, ___ rigorous, had certain limitations.", correctAnswer: "albeit", explanation: "'Albeit rigorous' = parenthetical concession." },
          { type: "FILL_BLANK", question: "Complete: ___ by the preliminary results, we expanded the study.", correctAnswer: "Encouraged", explanation: "Past participle clause: 'Encouraged by' = because we were encouraged." },
          { type: "MATCHING", question: "Match the clause type with its example:", options: [{ left: "Reduced relative", right: "The data presented" }, { left: "Non-defining relative", right: "The report, which was" }, { left: "Participle clause", right: "Having analyzed" }, { left: "Appositive", right: "A leading researcher" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure serves a different syntactic function." },
          { type: "CHECKBOX", question: "Select all correct complex clause sentences:", options: ["The study, which was comprehensive, yielded valuable insights", "Having completed the analysis, we published our findings", "The results, presented in Table 1, are significant", "Walking to the conference, the schedule was changed"], correctAnswer: "[0,1,2]", explanation: "'Walking to the conference, the schedule was changed' has a dangling participle. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / whose / team / findings / were / published / the / leader / will present", correctAnswer: "The team leader,whose findings were published,will present", explanation: "Non-defining relative with 'whose'." },
          { type: "SPEECH", question: "The findings, which were consistent across all participant groups, strongly support our hypothesis.", correctAnswer: "The findings, which were consistent across all participant groups, strongly support our hypothesis.", language: "en", hint: "Present robust findings using a non-defining relative clause" },
          { type: "SPEECH", question: "Having reviewed all available evidence, the committee reached a unanimous decision.", correctAnswer: "Having reviewed all available evidence, the committee reached a unanimous decision.", language: "en", hint: "Describe a process leading to a decision using a participle clause" },
          { type: "SPEECH", question: "The proposed framework, a significant departure from traditional models, requires further validation.", correctAnswer: "The proposed framework, a significant departure from traditional models, requires further validation.", language: "en", hint: "Introduce an innovative concept using an appositive" },
        ]
      },
    ]
  },
  {
    title: "Advanced Vocabulary & Collocations",
    lessons: [
      {
        title: "Academic Collocations & Fixed Phrases",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The study ___ light on the issue.'", options: ["sheds", "throws", "gives", "puts"], correctAnswer: "0", explanation: "'Sheds light on' = clarifies or explains." },
          { type: "MCQ", question: "'The findings ___ a significant correlation.'", options: ["reveal", "uncover", "expose", "show"], correctAnswer: "0", explanation: "'Reveal' = most common academic collocation for findings." },
          { type: "MCQ", question: "'The research ___ the groundwork for future studies.'", options: ["lays", "puts", "sets", "makes"], correctAnswer: "0", explanation: "'Lays the groundwork' = establishes the foundation." },
          { type: "MCQ", question: "Which is NOT a standard academic collocation?", options: ["Make a research", "Conduct research", "Carry out research", "Undertake research"], correctAnswer: "0", explanation: "'Make research' is wrong; use 'conduct/carry out/undertake research'." },
          { type: "TRUE_FALSE", question: "True or False: 'Draw a conclusion' is a correct academic collocation.", correctAnswer: "true", explanation: "'Draw a conclusion' = reach a conclusion based on evidence." },
          { type: "TRUE_FALSE", question: "True or False: 'Take into account' and 'take into consideration' mean the same thing.", correctAnswer: "true", explanation: "Both are correct and interchangeable academic collocations." },
          { type: "FILL_BLANK", question: "Complete: The evidence ___ into question the validity of the theory.", correctAnswer: "calls", explanation: "'Calls into question' = challenges or doubts." },
          { type: "FILL_BLANK", question: "Complete: The study takes ___ account several confounding variables.", correctAnswer: "into", explanation: "'Takes into account' = considers." },
          { type: "FILL_BLANK", question: "Complete: The results are ___ line with previous findings.", correctAnswer: "in", explanation: "'In line with' = consistent with." },
          { type: "MATCHING", question: "Match the verb with its academic collocation:", options: [{ left: "Shed", right: "Light on" }, { left: "Draw", right: "A conclusion" }, { left: "Lay", right: "The groundwork" }, { left: "Call", right: "Into question" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb forms a fixed academic collocation." },
          { type: "CHECKBOX", question: "Select all correct academic collocations:", options: ["The study sheds light on the phenomenon", "The researchers conducted a comprehensive analysis", "The findings draw a conclusion", "The paper lays the groundwork for future research"], correctAnswer: "[0,1,3]", explanation: "'Findings draw a conclusion' is wrong; researchers draw conclusions, findings don't. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / sheds / study / light / on / this / important / phenomenon", correctAnswer: "The study sheds light,on this important phenomenon", explanation: "Academic collocation: shed light on." },
          { type: "SPEECH", question: "This groundbreaking study sheds new light on the underlying mechanisms of the disease.", correctAnswer: "This groundbreaking study sheds new light on the underlying mechanisms of the disease.", language: "en", hint: "Describe how research clarifies a complex issue" },
          { type: "SPEECH", question: "The researchers conducted a thorough analysis, taking into account all relevant variables.", correctAnswer: "The researchers conducted a thorough analysis, taking into account all relevant variables.", language: "en", hint: "Describe rigorous research methodology" },
        ]
      },
      {
        title: "Advanced Adjective-Noun Collocations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The study made a ___ contribution to the field.'", options: ["significant", "big", "large", "huge"], correctAnswer: "0", explanation: "'Significant contribution' = standard academic collocation." },
          { type: "MCQ", question: "'There is ___ evidence to support this claim.'", options: ["compelling", "strong", "big", "heavy"], correctAnswer: "0", explanation: "'Compelling evidence' = convincing, persuasive evidence." },
          { type: "MCQ", question: "'The findings have far-___ implications.'", options: ["reaching", "going", "coming", "spreading"], correctAnswer: "0", explanation: "'Far-reaching implications' = widespread, significant consequences." },
          { type: "MCQ", question: "Which is NOT a standard academic collocation?", options: ["Strong conclusion", "Compelling evidence", "Significant contribution", "Robust methodology"], correctAnswer: "0", explanation: "'Strong conclusion' is less standard; use 'valid conclusion' or 'sound conclusion'." },
          { type: "TRUE_FALSE", question: "True or False: 'A comprehensive review' is a correct academic collocation.", correctAnswer: "true", explanation: "'Comprehensive review' = thorough, complete review." },
          { type: "TRUE_FALSE", question: "True or False: 'A heavy research' is correct academic English.", correctAnswer: "false", explanation: "'Heavy' doesn't collocate with 'research'; use 'extensive research'." },
          { type: "FILL_BLANK", question: "Complete: The study has ___ implications for public policy.", correctAnswer: "far-reaching", explanation: "'Far-reaching implications' = wide-ranging consequences." },
          { type: "FILL_BLANK", question: "Complete: The researchers used a ___ methodology.", correctAnswer: "rigorous", explanation: "'Rigorous methodology' = thorough, careful methods." },
          { type: "FILL_BLANK", question: "Complete: There is ___ consensus among experts on this issue.", correctAnswer: "broad", explanation: "'Broad consensus' = widespread agreement." },
          { type: "MATCHING", question: "Match the adjective with its academic collocation:", options: [{ left: "Significant", right: "Contribution" }, { left: "Compelling", right: "Evidence" }, { left: "Rigorous", right: "Methodology" }, { left: "Far-reaching", right: "Implications" }], correctAnswer: "[0,1,2,3]", explanation: "Each adjective forms a standard academic collocation." },
          { type: "CHECKBOX", question: "Select all correct adjective-noun collocations:", options: ["A significant contribution", "Compelling evidence", "A rigorous approach", "A heavy analysis"], correctAnswer: "[0,1,2]", explanation: "'Heavy analysis' is wrong; use 'thorough analysis' or 'extensive analysis'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / has / study / implications / for / far-reaching / the / field", correctAnswer: "The study has far-reaching implications,for the field", explanation: "Adjective-noun collocation: far-reaching implications." },
          { type: "SPEECH", question: "The study makes a significant contribution to our understanding of cognitive development.", correctAnswer: "The study makes a significant contribution to our understanding of cognitive development.", language: "en", hint: "Describe the importance of research using academic collocations" },
          { type: "SPEECH", question: "There is compelling evidence to suggest that early intervention is crucial.", correctAnswer: "There is compelling evidence to suggest that early intervention is crucial.", language: "en", hint: "Present strong evidence for a claim" },
        ]
      },
      {
        title: "Module 7 Review: Advanced Vocabulary & Collocations",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The study ___ light on the underlying mechanisms.'", options: ["sheds", "throws", "gives", "puts"], correctAnswer: "0", explanation: "'Sheds light on' = clarifies." },
          { type: "MCQ", question: "'The findings ___ a strong correlation between the variables.'", options: ["reveal", "make", "do", "have"], correctAnswer: "0", explanation: "'Reveal a correlation' = show a relationship." },
          { type: "MCQ", question: "'The research lays the ___ for future investigations.'", options: ["groundwork", "foundation stone", "bed", "floor"], correctAnswer: "0", explanation: "'Lays the groundwork' = establishes the foundation." },
          { type: "MCQ", question: "'There is ___ evidence to support the claim.'", options: ["compelling", "heavy", "big", "large"], correctAnswer: "0", explanation: "'Compelling evidence' = convincing." },
          { type: "TRUE_FALSE", question: "True or False: 'Draw a conclusion' is a correct academic collocation.", correctAnswer: "true", explanation: "'Draw a conclusion' = reach a conclusion." },
          { type: "TRUE_FALSE", question: "True or False: 'Make research' is standard academic English.", correctAnswer: "false", explanation: "Should be 'conduct research' or 'carry out research'." },
          { type: "FILL_BLANK", question: "Complete: The study has ___ implications for education policy.", correctAnswer: "far-reaching", explanation: "'Far-reaching implications' = wide-ranging consequences." },
          { type: "FILL_BLANK", question: "Complete: The researchers used a ___ methodology.", correctAnswer: "rigorous", explanation: "'Rigorous methodology' = thorough methods." },
          { type: "FILL_BLANK", question: "Complete: The findings are ___ line with previous research.", correctAnswer: "in", explanation: "'In line with' = consistent with." },
          { type: "MATCHING", question: "Match the collocation with its meaning:", options: [{ left: "Shed light on", right: "Clarify" }, { left: "Call into question", right: "Challenge" }, { left: "Take into account", right: "Consider" }, { left: "Draw a conclusion", right: "Reach a judgment" }], correctAnswer: "[0,1,2,3]", explanation: "Each collocation has a specific meaning in academic discourse." },
          { type: "CHECKBOX", question: "Select all correct collocations:", options: ["The study sheds light on the issue", "The researchers conducted extensive research", "The results are consistent with previous findings", "The paper makes a significant contribution"], correctAnswer: "[0,1,2,3]", explanation: "All are correct academic collocations." },
          { type: "ORDERING", question: "Put in order: the / calls / evidence / into question / this / theory", correctAnswer: "The evidence calls into question,this theory", explanation: "Academic collocation: call into question." },
          { type: "SPEECH", question: "The comprehensive review of the literature reveals several significant gaps in current knowledge.", correctAnswer: "The comprehensive review of the literature reveals several significant gaps in current knowledge.", language: "en", hint: "Present a literature review using academic collocations" },
          { type: "SPEECH", question: "The robust methodology employed in this study ensures the reliability of the findings.", correctAnswer: "The robust methodology employed in this study ensures the reliability of the findings.", language: "en", hint: "Describe methodological strength using academic vocabulary" },
          { type: "SPEECH", question: "These findings have far-reaching implications for how we understand human behavior.", correctAnswer: "These findings have far-reaching implications for how we understand human behavior.", language: "en", hint: "Discuss the broader impact of research findings" },
        ]
      },
    ]
  },
  {
    title: "Idiomatic Expressions & Phrasal Verbs Advanced",
    lessons: [
      {
        title: "Advanced Phrasal Verbs in Context",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The company decided to ___ the less profitable divisions.'", options: ["phase out", "phase in", "phase up", "phase over"], correctAnswer: "0", explanation: "'Phase out' = gradually eliminate." },
          { type: "MCQ", question: "'She always ___ her successes to hard work and determination.'", options: ["attributes", "puts down", "writes off", "gives up"], correctAnswer: "0", explanation: "'Attributes to' = credits as the cause." },
          { type: "MCQ", question: "'The negotiations ___ when neither side would compromise.'", options: ["broke down", "broke up", "broke out", "broke in"], correctAnswer: "0", explanation: "'Broke down' = failed/collapsed (negotiations)." },
          { type: "MCQ", question: "'He was ___ for his honesty during the investigation.'", options: ["commended", "put off", "done away", "made up"], correctAnswer: "0", explanation: "'Commended for' = praised formally." },
          { type: "TRUE_FALSE", question: "True or False: 'The meeting was called off' means it was postponed.", correctAnswer: "false", explanation: "'Called off' = cancelled, not postponed." },
          { type: "TRUE_FALSE", question: "True or False: 'She came up with a brilliant solution' means she suggested it.", correctAnswer: "true", explanation: "'Came up with' = thought of/suggested." },
          { type: "FILL_BLANK", question: "Complete: The new policy will be ___ in gradually over the next six months.", correctAnswer: "rolled out", explanation: "'Rolled out' = introduced gradually." },
          { type: "FILL_BLANK", question: "Complete: He ___ on his promise to support the project.", correctAnswer: "went back", explanation: "'Went back on' = broke (a promise)." },
          { type: "FILL_BLANK", question: "Complete: The findings ___ new questions about the theory.", correctAnswer: "raise", explanation: "'Raise questions' = prompt/invoke questions." },
          { type: "MATCHING", question: "Match the phrasal verb with its meaning:", options: [{ left: "Phase out", right: "Gradually eliminate" }, { left: "Break down", right: "Fail/collapse" }, { left: "Come up with", right: "Think of/suggest" }, { left: "Put off", right: "Postpone" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrasal verb has a specific meaning." },
          { type: "CHECKBOX", question: "Select all correct phrasal verb uses:", options: ["The meeting was called off due to bad weather", "She came up with an innovative solution", "The company is phasing in new technology", "He put up the meeting until next week"], correctAnswer: "[0,1,2]", explanation: "'Put up the meeting' is wrong; should be 'put off'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / was / meeting / off / called / the / due to / storm", correctAnswer: "The meeting was called off,due to the storm", explanation: "Phrasal verb: call off = cancel." },
          { type: "SPEECH", question: "The government decided to phase out the subsidy over a five-year period.", correctAnswer: "The government decided to phase out the subsidy over a five-year period.", language: "en", hint: "Describe gradual elimination of a policy" },
          { type: "SPEECH", question: "Despite the initial setbacks, the team came up with a workaround that solved the problem.", correctAnswer: "Despite the initial setbacks, the team came up with a workaround that solved the problem.", language: "en", hint: "Describe creative problem-solving" },
        ]
      },
      {
        title: "Idiomatic Expressions in Professional Contexts",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Let's ___ the main points before we conclude.'", options: ["run through", "run over", "run into", "run out"], correctAnswer: "0", explanation: "'Run through' = review/go over quickly." },
          { type: "MCQ", question: "'The decision is ultimately ___, not mine.'", options: ["yours to make", "your to making", "you making", "made by you"], correctAnswer: "0", explanation: "'Yours to make' = your responsibility to decide." },
          { type: "MCQ", question: "'We need to ___ all the options before deciding.'", options: ["weigh up", "weigh on", "weigh in", "weigh out"], correctAnswer: "0", explanation: "'Weigh up' = carefully consider/evaluate." },
          { type: "MCQ", question: "'The project is still in its ___ stages.'", options: ["infancy", "babyhood", "childhood", "toddler"], correctAnswer: "0", explanation: "'In its infancy' = in early stages of development." },
          { type: "TRUE_FALSE", question: "True or False: 'Get the ball rolling' means to start something.", correctAnswer: "true", explanation: "'Get the ball rolling' = initiate/start a process." },
          { type: "TRUE_FALSE", question: "True or False: 'Cut corners' means to do something efficiently.", correctAnswer: "false", explanation: "'Cut corners' = do something poorly to save time/money." },
          { type: "FILL_BLANK", question: "Complete: Let's ___ down the problem into manageable parts.", correctAnswer: "break", explanation: "'Break down' = divide into smaller parts." },
          { type: "FILL_BLANK", question: "Complete: The manager decided to ___ a hands-on approach.", correctAnswer: "adopt", explanation: "'Adopt an approach' = choose and use a method." },
          { type: "FILL_BLANK", question: "Complete: We need to ___ to a decision by Friday.", correctAnswer: "come", explanation: "'Come to a decision' = reach a decision." },
          { type: "MATCHING", question: "Match the idiom with its meaning:", options: [{ left: "Get the ball rolling", right: "Start a process" }, { left: "Cut corners", right: "Do poorly to save effort" }, { left: "Run through", right: "Review quickly" }, { left: "Weigh up", right: "Evaluate carefully" }], correctAnswer: "[0,1,2,3]", explanation: "Each idiom has a specific professional meaning." },
          { type: "CHECKBOX", question: "Select all correct idiomatic uses:", options: ["Let's get the ball rolling on this project", "We need to weigh up all the options", "The company cut corners on safety", "She ran over the presentation slides"], correctAnswer: "[0,1,2]", explanation: "'Ran over' means exceeded time/hit with vehicle; should be 'ran through' for reviewing slides. The others are correct." },
          { type: "ORDERING", question: "Put in order: let's / the / down / problem / break / smaller / into / parts", correctAnswer: "Let's break the problem down,into smaller parts", explanation: "Phrasal verb: break down = divide." },
          { type: "SPEECH", question: "Before we move forward, let's run through the key points of the proposal one more time.", correctAnswer: "Before we move forward, let's run through the key points of the proposal one more time.", language: "en", hint: "Suggest a quick review before proceeding" },
          { type: "SPEECH", question: "We can't afford to cut corners when it comes to quality assurance.", correctAnswer: "We can't afford to cut corners when it comes to quality assurance.", language: "en", hint: "Emphasize the importance of maintaining standards" },
        ]
      },
      {
        title: "Module 8 Review: Idiomatic Expressions & Phrasal Verbs",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The company will ___ the outdated equipment gradually.'", options: ["phase out", "phase in", "phase up", "phase over"], correctAnswer: "0", explanation: "'Phase out' = gradually eliminate." },
          { type: "MCQ", question: "'The negotiations ___ due to irreconcilable differences.'", options: ["broke down", "broke up", "broke out", "broke in"], correctAnswer: "0", explanation: "'Broke down' = collapsed/failed." },
          { type: "MCQ", question: "'She ___ a brilliant idea during the brainstorming session.'", options: ["came up with", "came down with", "came across", "came into"], correctAnswer: "0", explanation: "'Came up with' = thought of/produced." },
          { type: "MCQ", question: "'Let's ___ the agenda items before the meeting ends.'", options: ["run through", "run over", "run into", "run out"], correctAnswer: "0", explanation: "'Run through' = review/go over." },
          { type: "TRUE_FALSE", question: "True or False: 'The project is in its infancy' means it's nearly complete.", correctAnswer: "false", explanation: "'In its infancy' = in early stages, not complete." },
          { type: "TRUE_FALSE", question: "True or False: 'Weigh up the options' means to evaluate them carefully.", correctAnswer: "true", explanation: "'Weigh up' = evaluate/consider carefully." },
          { type: "FILL_BLANK", question: "Complete: The meeting was ___ off due to the manager's illness.", correctAnswer: "called", explanation: "'Called off' = cancelled." },
          { type: "FILL_BLANK", question: "Complete: He always ___ his success to sheer luck.", correctAnswer: "attributes", explanation: "'Attributes to' = credits as the cause." },
          { type: "FILL_BLANK", question: "Complete: We need to ___ down the budget into departmental allocations.", correctAnswer: "break", explanation: "'Break down' = divide into parts." },
          { type: "MATCHING", question: "Match the expression with its meaning:", options: [{ left: "Phase out", right: "Gradually eliminate" }, { left: "Get the ball rolling", right: "Start a process" }, { left: "Run through", right: "Review quickly" }, { left: "Come to a decision", right: "Reach a conclusion" }], correctAnswer: "[0,1,2,3]", explanation: "Each expression has a specific professional meaning." },
          { type: "CHECKBOX", question: "Select all correct idiomatic sentences:", options: ["The policy will be rolled out next quarter", "We need to come to a decision by Friday", "She came up with a creative solution", "The meeting was put off until next week"], correctAnswer: "[0,1,2,3]", explanation: "All are correct uses of phrasal verbs and idioms." },
          { type: "ORDERING", question: "Put in order: the / ball / let's / get / rolling / on / this / project", correctAnswer: "Let's get the ball rolling,on this project", explanation: "Idiom: get the ball rolling = start." },
          { type: "SPEECH", question: "We need to weigh up the pros and cons before making any commitments.", correctAnswer: "We need to weigh up the pros and cons before making any commitments.", language: "en", hint: "Advise careful consideration before deciding" },
          { type: "SPEECH", question: "The negotiations broke down after both sides refused to compromise on the key issues.", correctAnswer: "The negotiations broke down after both sides refused to compromise on the key issues.", language: "en", hint: "Describe failed negotiations" },
          { type: "SPEECH", question: "Let's break the problem down into smaller, more manageable tasks.", correctAnswer: "Let's break the problem down into smaller, more manageable tasks.", language: "en", hint: "Suggest dividing a complex problem" },
        ]
      },
    ]
  },
  {
    title: "Nuance & Precision in Expression",
    lessons: [
      {
        title: "Subtle Meaning Differences",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What's the difference between 'economic' and 'economical'?", options: ["Related to economy vs saving money", "Saving money vs related to economy", "No difference", "Formal vs informal"], correctAnswer: "0", explanation: "'Economic' = related to economy. 'Economical' = saving money/efficient." },
          { type: "MCQ", question: "'The results were ___ significant.' (statistically meaningful)", options: ["statistically", "statistic", "statistical", "statistically"], correctAnswer: "0", explanation: "'Statistically significant' = meaningful in statistical terms." },
          { type: "MCQ", question: "What's the difference between 'historic' and 'historical'?", options: ["Important in history vs related to history", "Related to history vs important", "Ancient vs modern", "No difference"], correctAnswer: "0", explanation: "'Historic' = important/famous in history. 'Historical' = related to history." },
          { type: "MCQ", question: "Which is correct: 'affect' or 'effect' as a verb?", options: ["Affect", "Effect", "Both", "Neither"], correctAnswer: "0", explanation: "'Affect' = verb (to influence). 'Effect' = noun (result)." },
          { type: "TRUE_FALSE", question: "True or False: 'Disinterested' means 'not interested.'", correctAnswer: "false", explanation: "'Disinterested' = impartial/unbiased. 'Uninterested' = not interested." },
          { type: "TRUE_FALSE", question: "True or False: 'Enormity' means 'enormous size.'", correctAnswer: "false", explanation: "'Enormity' = great wickedness. 'Enormousness' = great size." },
          { type: "FILL_BLANK", question: "Complete: The new policy will have a significant ___ on the budget. (noun)", correctAnswer: "effect", explanation: "'Effect' = noun (result/impact). 'Affect' = verb." },
          { type: "FILL_BLANK", question: "Complete: The judge remained ___ throughout the trial. (impartial)", correctAnswer: "disinterested", explanation: "'Disinterested' = impartial/unbiased." },
          { type: "FILL_BLANK", question: "Complete: The signing of the treaty was a ___ moment. (important in history)", correctAnswer: "historic", explanation: "'Historic' = important/famous in history." },
          { type: "MATCHING", question: "Match the word pair with its distinction:", options: [{ left: "Economic/Economical", right: "Economy-related/Efficient" }, { left: "Historic/Historical", right: "Important/Related to history" }, { left: "Affect/Effect", right: "Verb/Noun" }, { left: "Disinterested/Uninterested", right: "Impartial/Not interested" }], correctAnswer: "[0,1,2,3]", explanation: "Each pair has a subtle but important distinction." },
          { type: "CHECKBOX", question: "Select all correct word uses:", options: ["The economic situation is improving", "This car is very economical on fuel", "The effect of the policy was significant", "She seemed disinterested in the topic"], correctAnswer: "[0,1,2]", explanation: "'Disinterested' means impartial; if she seemed not to care, it should be 'uninterested'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / historic / signing / was / treaty / a / moment / the / of", correctAnswer: "The signing of the treaty,was a historic moment", explanation: "'Historic' = important in history." },
          { type: "SPEECH", question: "The economic impact of the recession was felt across all sectors of society.", correctAnswer: "The economic impact of the recession was felt across all sectors of society.", language: "en", hint: "Describe financial consequences using 'economic'" },
          { type: "SPEECH", question: "The discovery of penicillin was one of the most historic breakthroughs in medical science.", correctAnswer: "The discovery of penicillin was one of the most historic breakthroughs in medical science.", language: "en", hint: "Describe a historically important discovery" },
        ]
      },
      {
        title: "Register & Tone Awareness",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is the most formal way to say 'get'?", options: ["Obtain", "Acquire", "Procure", "All of the above"], correctAnswer: "3", explanation: "All are more formal than 'get', with 'procure' being the most formal." },
          { type: "MCQ", question: "'The findings ___ a need for further investigation.'", options: ["underscore", "show", "point out", "make clear"], correctAnswer: "0", explanation: "'Underscore' = emphasize (formal academic verb)." },
          { type: "MCQ", question: "Which is the most appropriate for formal writing?", options: ["Children", "Kids", "Youngsters", "Tots"], correctAnswer: "0", explanation: "'Children' is the standard formal term." },
          { type: "MCQ", question: "What does 'register' refer to in language?", options: ["Level of formality", "Volume of speech", "Writing speed", "Accent"], correctAnswer: "0", explanation: "Register = the level of formality appropriate to a context." },
          { type: "TRUE_FALSE", question: "True or False: 'Commence' is more formal than 'start.'", correctAnswer: "true", explanation: "'Commence' is the formal equivalent of 'start'." },
          { type: "TRUE_FALSE", question: "True or False: 'Utilize' and 'use' are always interchangeable.", correctAnswer: "false", explanation: "'Utilize' implies making practical use of something; 'use' is more general." },
          { type: "FILL_BLANK", question: "Complete: The committee will ___ the proposal at the next meeting. (formal for 'think about')", correctAnswer: "deliberate on", explanation: "'Deliberate on' = formal for 'think about/discuss'." },
          { type: "FILL_BLANK", question: "Complete: The results ___ the need for additional research. (formal for 'show')", correctAnswer: "demonstrate", explanation: "'Demonstrate' = formal for 'show'." },
          { type: "FILL_BLANK", question: "Complete: The participants were ___ to the study. (formal for 'added')", correctAnswer: "recruited", explanation: "'Recruited' = formal for 'added/enrolled'." },
          { type: "MATCHING", question: "Match the informal word with its formal equivalent:", options: [{ left: "Start", right: "Commence" }, { left: "End", right: "Conclude" }, { left: "Ask for", right: "Request" }, { left: "Get", right: "Obtain" }], correctAnswer: "[0,1,2,3]", explanation: "Each formal equivalent is appropriate for academic/professional contexts." },
          { type: "CHECKBOX", question: "Select all appropriate formal expressions:", options: ["The meeting will commence at 9 AM", "We request your immediate attention", "The results demonstrate a clear trend", "Let's get started right away"], correctAnswer: "[0,1,2]", explanation: "'Let's get started' is informal; should be 'Let us commence'. The others are formal." },
          { type: "ORDERING", question: "Put in order: the / will / committee / the / proposal / deliberate / at / noon", correctAnswer: "The committee will deliberate,the proposal,at noon", explanation: "Formal verb: deliberate." },
          { type: "SPEECH", question: "The committee will deliberate on the proposed amendments before reaching a final decision.", correctAnswer: "The committee will deliberate on the proposed amendments before reaching a final decision.", language: "en", hint: "Describe formal decision-making process" },
          { type: "SPEECH", question: "We kindly request your prompt attention to this matter.", correctAnswer: "We kindly request your prompt attention to this matter.", language: "en", hint: "Make a formal request" },
        ]
      },
      {
        title: "Module 9 Review: Nuance & Precision in Expression",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What's the difference between 'economic' and 'economical'?", options: ["Related to economy vs saving money", "Saving money vs related to economy", "No difference", "Formal vs informal"], correctAnswer: "0", explanation: "'Economic' = related to economy. 'Economical' = efficient/saving money." },
          { type: "MCQ", question: "Which is the most formal synonym for 'start'?", options: ["Commence", "Begin", "Kick off", "Get going"], correctAnswer: "0", explanation: "'Commence' is the most formal." },
          { type: "MCQ", question: "'The findings ___ the importance of early intervention.'", options: ["underscore", "show", "make clear", "point out"], correctAnswer: "0", explanation: "'Underscore' = emphasize (formal academic)." },
          { type: "MCQ", question: "'Disinterested' means:", options: ["Impartial/unbiased", "Not interested", "Bored", "Indifferent"], correctAnswer: "0", explanation: "'Disinterested' = impartial. 'Uninterested' = not interested." },
          { type: "TRUE_FALSE", question: "True or False: 'Historic' means 'important in history.'", correctAnswer: "true", explanation: "'Historic' = important/famous in history. 'Historical' = related to history." },
          { type: "TRUE_FALSE", question: "True or False: 'Affect' is typically a verb and 'effect' is typically a noun.", correctAnswer: "true", explanation: "'Affect' = verb (to influence). 'Effect' = noun (result)." },
          { type: "FILL_BLANK", question: "Complete: The new drug had a positive ___ on patients' recovery.", correctAnswer: "effect", explanation: "'Effect' = noun (result/impact)." },
          { type: "FILL_BLANK", question: "Complete: The ___ crisis affected millions of people worldwide.", correctAnswer: "economic", explanation: "'Economic' = related to the economy." },
          { type: "FILL_BLANK", question: "Complete: The signing of the peace treaty was a ___ achievement.", correctAnswer: "historic", explanation: "'Historic' = important in history." },
          { type: "MATCHING", question: "Match the word with its correct meaning:", options: [{ left: "Economic", right: "Related to economy" }, { left: "Economical", right: "Efficient/saving" }, { left: "Historic", right: "Important in history" }, { left: "Historical", right: "Related to history" }], correctAnswer: "[0,1,2,3]", explanation: "Each word has a distinct meaning." },
          { type: "CHECKBOX", question: "Select all correct word uses:", options: ["The economic policy was well designed", "She found a more economical route", "The historic building was preserved", "Affect is typically a verb"], correctAnswer: "[0,1,2,3]", explanation: "All are correct." },
          { type: "ORDERING", question: "Put in order: the / economic / situation / has / improved / significantly", correctAnswer: "The economic situation,has improved significantly", explanation: "'Economic' = related to the economy." },
          { type: "SPEECH", question: "The economic implications of this policy extend far beyond the immediate fiscal year.", correctAnswer: "The economic implications of this policy extend far beyond the immediate fiscal year.", language: "en", hint: "Discuss financial consequences using 'economic'" },
          { type: "SPEECH", question: "The results underscore the critical importance of early childhood education.", correctAnswer: "The results underscore the critical importance of early childhood education.", language: "en", hint: "Emphasize a key finding using 'underscore'" },
          { type: "SPEECH", question: "The historic agreement between the two nations marked a turning point in diplomatic relations.", correctAnswer: "The historic agreement between the two nations marked a turning point in diplomatic relations.", language: "en", hint: "Describe a historically important event" },
        ]
      },
    ]
  },
  {
    title: "Professional & Business Communication",
    lessons: [
      {
        title: "Formal Correspondence & Email Writing",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which is the most appropriate formal opening for a business email?", options: ["Dear Mr. Smith,", "Hi there,", "Hey,", "What's up,"], correctAnswer: "0", explanation: "'Dear Mr. Smith,' is the standard formal opening." },
          { type: "MCQ", question: "'I am writing ___ your recent inquiry.'", options: ["with reference to", "about", "regarding to", "on the topic of"], correctAnswer: "0", explanation: "'With reference to' = formal standard phrase." },
          { type: "MCQ", question: "Which is the most appropriate formal closing?", options: ["Yours sincerely,", "Best,", "Cheers,", "Later,"], correctAnswer: "0", explanation: "'Yours sincerely,' is standard formal closing when you know the name." },
          { type: "MCQ", question: "'Please ___ the attached document for your review.'", options: ["find", "see", "look at", "check out"], correctAnswer: "0", explanation: "'Please find attached' = standard formal business phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'I look forward to hearing from you' is an appropriate formal closing.", correctAnswer: "true", explanation: "Standard formal closing phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Yours faithfully' is used when you know the recipient's name.", correctAnswer: "false", explanation: "'Yours faithfully' is used when you DON'T know the name. 'Yours sincerely' is when you do." },
          { type: "FILL_BLANK", question: "Complete: I am writing to ___ your attention to an important matter.", correctAnswer: "draw", explanation: "'Draw your attention to' = formal way to highlight something." },
          { type: "FILL_BLANK", question: "Complete: Please do not ___ to contact me should you require further information.", correctAnswer: "hesitate", explanation: "'Do not hesitate to contact' = formal invitation to reach out." },
          { type: "FILL_BLANK", question: "Complete: I would be ___ if you could provide the requested information at your earliest convenience.", correctAnswer: "grateful", explanation: "'I would be grateful' = formal polite request." },
          { type: "MATCHING", question: "Match the phrase with its function:", options: [{ left: "With reference to", right: "Referencing previous communication" }, { left: "Please find attached", right: "Introducing an attachment" }, { left: "I look forward to", right: "Expressing anticipation" }, { left: "Yours sincerely", right: "Formal closing" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a specific function in formal correspondence." },
          { type: "CHECKBOX", question: "Select all appropriate formal email phrases:", options: ["I am writing to inquire about", "Please find attached the requested documents", "I would appreciate your prompt response", "Hit me up when you get a chance"], correctAnswer: "[0,1,2]", explanation: "'Hit me up' is very informal slang. The others are appropriate formal phrases." },
          { type: "ORDERING", question: "Put in order: I / writing / to / am / follow up / our / on / conversation / previous", correctAnswer: "I am writing,to follow up,on our previous conversation", explanation: "Formal email opening." },
          { type: "SPEECH", question: "Dear Sir or Madam, I am writing to express my interest in the advertised position.", correctAnswer: "Dear Sir or Madam, I am writing to express my interest in the advertised position.", language: "en", hint: "Write a formal job application opening" },
          { type: "SPEECH", question: "Thank you for your prompt response. I look forward to our meeting next week.", correctAnswer: "Thank you for your prompt response. I look forward to our meeting next week.", language: "en", hint: "Acknowledge a reply and express anticipation" },
        ]
      },
      {
        title: "Presentations & Public Speaking",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Today, I'd like to ___ you through our quarterly results.'", options: ["take", "bring", "show", "walk"], correctAnswer: "0", explanation: "'Take you through' = guide/explain systematically." },
          { type: "MCQ", question: "'Let me ___ by giving you some background.'", options: ["start off", "start up", "start on", "begin with"], correctAnswer: "0", explanation: "'Start off by' = begin with." },
          { type: "MCQ", question: "'I'd now like to ___ over to my colleague.'", options: ["hand", "give", "pass", "turn"], correctAnswer: "0", explanation: "'Hand over to' = transfer speaking to someone else." },
          { type: "MCQ", question: "Which is NOT an appropriate presentation transition?", options: ["Alright, so like, next thing...", "Moving on to the next point", "Let's now turn our attention to", "I'd like to draw your attention to"], correctAnswer: "0", explanation: "'Alright, so like, next thing...' is too informal for presentations." },
          { type: "TRUE_FALSE", question: "True or False: 'To summarize' is an appropriate phrase for concluding a presentation.", correctAnswer: "true", explanation: "Standard presentation conclusion phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Any questions?' is the most professional way to invite audience questions.", correctAnswer: "false", explanation: "More professional: 'I'd be happy to take any questions' or 'The floor is now open for questions'." },
          { type: "FILL_BLANK", question: "Complete: I'd like to ___ by outlining the key objectives of today's presentation.", correctAnswer: "begin", explanation: "'I'd like to begin by' = formal presentation opening." },
          { type: "FILL_BLANK", question: "Complete: As you can ___ from this graph, sales have increased significantly.", correctAnswer: "see", explanation: "'As you can see' = directing attention to visual data." },
          { type: "FILL_BLANK", question: "Complete: In ___, our strategy has proven highly effective.", correctAnswer: "conclusion", explanation: "'In conclusion' = formal way to end a presentation." },
          { type: "MATCHING", question: "Match the phrase with its presentation function:", options: [{ left: "I'd like to begin by", right: "Opening" }, { left: "Moving on to", right: "Transition" }, { left: "As you can see", right: "Referencing visuals" }, { left: "To conclude", right: "Closing" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a specific presentation function." },
          { type: "CHECKBOX", question: "Select all appropriate presentation phrases:", options: ["Let me start by outlining our objectives", "Moving on to the next slide", "I'd now like to hand over to Sarah", "So yeah, that's pretty much it"], correctAnswer: "[0,1,2]", explanation: "'So yeah, that's pretty much it' is too informal. The others are appropriate." },
          { type: "ORDERING", question: "Put in order: I'd / now / to / like / turn / attention / our / to / the / financial / results", correctAnswer: "I'd now like to turn,our attention,to the financial results", explanation: "Presentation transition phrase." },
          { type: "SPEECH", question: "To conclude, I'd like to reiterate our commitment to delivering exceptional results.", correctAnswer: "To conclude, I'd like to reiterate our commitment to delivering exceptional results.", language: "en", hint: "Deliver a strong presentation conclusion" },
          { type: "SPEECH", question: "I'd now like to hand over to my colleague, who will elaborate on the technical aspects.", correctAnswer: "I'd now like to hand over to my colleague, who will elaborate on the technical aspects.", language: "en", hint: "Transition to another speaker in a presentation" },
        ]
      },
      {
        title: "Module 10 Review: Professional & Business Communication",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I am writing ___ your recent application.'", options: ["with reference to", "about to", "regarding to", "on to"], correctAnswer: "0", explanation: "'With reference to' = formal standard phrase." },
          { type: "MCQ", question: "'Please ___ the attached report for your review.'", options: ["find", "see", "look at", "check"], correctAnswer: "0", explanation: "'Please find attached' = standard formal business phrase." },
          { type: "MCQ", question: "'I'd like to ___ you through the main findings.'", options: ["take", "bring", "show", "walk"], correctAnswer: "0", explanation: "'Take you through' = guide/explain systematically." },
          { type: "MCQ", question: "Which closing is used when you DON'T know the recipient's name?", options: ["Yours faithfully,", "Yours sincerely,", "Best regards,", "Warm wishes,"], correctAnswer: "0", explanation: "'Yours faithfully' = when you don't know the name." },
          { type: "TRUE_FALSE", question: "True or False: 'I look forward to hearing from you' is appropriate for formal emails.", correctAnswer: "true", explanation: "Standard formal closing phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Moving on to the next point' is an appropriate presentation transition.", correctAnswer: "true", explanation: "Standard presentation transition phrase." },
          { type: "FILL_BLANK", question: "Complete: Please do not ___ to contact me if you have any questions.", correctAnswer: "hesitate", explanation: "'Do not hesitate' = formal invitation to reach out." },
          { type: "FILL_BLANK", question: "Complete: I would be ___ if you could respond at your earliest convenience.", correctAnswer: "grateful", explanation: "'I would be grateful' = formal polite request." },
          { type: "FILL_BLANK", question: "Complete: In ___, I'd like to thank you all for your attention.", correctAnswer: "conclusion", explanation: "'In conclusion' = formal ending." },
          { type: "MATCHING", question: "Match the phrase with its context:", options: [{ left: "Dear Sir or Madam", right: "Formal email opening" }, { left: "Please find attached", right: "Business email" }, { left: "I'd like to begin by", right: "Presentation opening" }, { left: "To conclude", right: "Presentation closing" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase is appropriate for its specific context." },
          { type: "CHECKBOX", question: "Select all appropriate professional phrases:", options: ["I am writing to inquire about the position", "Please find attached the requested documents", "I'd now like to hand over to my colleague", "Hit me up if you need anything"], correctAnswer: "[0,1,2]", explanation: "'Hit me up' is informal slang. The others are appropriate professional phrases." },
          { type: "ORDERING", question: "Put in order: I / writing / to / am / follow up / regarding / our / discussion", correctAnswer: "I am writing,to follow up,regarding our discussion", explanation: "Formal email phrase." },
          { type: "SPEECH", question: "I am writing with reference to your recent inquiry about our product offerings.", correctAnswer: "I am writing with reference to your recent inquiry about our product offerings.", language: "en", hint: "Open a formal business email referencing previous communication" },
          { type: "SPEECH", question: "I'd like to begin by thanking you all for taking the time to attend today's presentation.", correctAnswer: "I'd like to begin by thanking you all for taking the time to attend today's presentation.", language: "en", hint: "Open a presentation with gratitude" },
          { type: "SPEECH", question: "Should you require any further information, please do not hesitate to contact me directly.", correctAnswer: "Should you require any further information, please do not hesitate to contact me directly.", language: "en", hint: "Close a formal email with an invitation to follow up" },
        ]
      },
    ]
  },
  {
    title: "Critical Thinking & Argumentation",
    lessons: [
      {
        title: "Constructing & Evaluating Arguments",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The argument is ___; it fails to address the main issue.'", options: ["flawed", "flowed", "flaunted", "flared"], correctAnswer: "0", explanation: "'Flawed' = having weaknesses or defects." },
          { type: "MCQ", question: "'This claim lacks ___ evidence to support it.'", options: ["substantial", "substitute", "sublime", "subtle"], correctAnswer: "0", explanation: "'Substantial evidence' = significant, convincing proof." },
          { type: "MCQ", question: "'The author's ___ is clearly biased toward one perspective.'", options: ["stance", "stand", "stanceful", "standing"], correctAnswer: "0", explanation: "'Stance' = position/opinion on an issue." },
          { type: "MCQ", question: "What is a 'straw man' argument?", options: ["Misrepresenting an opponent's argument", "A strong argument", "An argument with no evidence", "A circular argument"], correctAnswer: "0", explanation: "'Straw man' = distorting an opponent's argument to make it easier to attack." },
          { type: "TRUE_FALSE", question: "True or False: 'Correlation does not imply causation' is a valid critical thinking principle.", correctAnswer: "true", explanation: "Just because two things are related doesn't mean one causes the other." },
          { type: "TRUE_FALSE", question: "True or False: A 'circular argument' is one where the conclusion restates the premise.", correctAnswer: "true", explanation: "Circular reasoning: 'A is true because A is true.'" },
          { type: "FILL_BLANK", question: "Complete: The argument rests on the ___ that all students learn at the same pace.", correctAnswer: "assumption", explanation: "'Assumption' = something accepted as true without proof." },
          { type: "FILL_BLANK", question: "Complete: The evidence presented is purely ___, not quantitative.", correctAnswer: "anecdotal", explanation: "'Anecdotal' = based on personal stories, not systematic data." },
          { type: "FILL_BLANK", question: "Complete: The author makes a compelling ___ for increased funding.", correctAnswer: "case", explanation: "'Makes a case' = presents a convincing argument." },
          { type: "MATCHING", question: "Match the logical fallacy with its description:", options: [{ left: "Straw man", right: "Misrepresenting opponent's argument" }, { left: "Ad hominem", right: "Attacking the person, not the argument" }, { left: "Circular reasoning", right: "Conclusion restates premise" }, { left: "False dilemma", right: "Presenting only two options" }], correctAnswer: "[0,1,2,3]", explanation: "Each fallacy represents a different logical error." },
          { type: "CHECKBOX", question: "Select all valid critical thinking practices:", options: ["Evaluating the source's credibility", "Looking for counter-evidence", "Distinguishing correlation from causation", "Accepting claims from authoritative sources without question"], correctAnswer: "[0,1,2]", explanation: "Even authoritative sources should be critically evaluated. The others are valid practices." },
          { type: "ORDERING", question: "Put in order: the / argument / on / rests / the / assumption / all / are / equal / participants", correctAnswer: "The argument rests on the assumption,all participants are equal", explanation: "Identifying the underlying assumption of an argument." },
          { type: "SPEECH", question: "While the author makes a compelling case, the argument ultimately rests on unsubstantiated assumptions.", correctAnswer: "While the author makes a compelling case, the argument ultimately rests on unsubstantiated assumptions.", language: "en", hint: "Evaluate an argument's strengths and weaknesses" },
          { type: "SPEECH", question: "Correlation between the two variables does not necessarily imply a causal relationship.", correctAnswer: "Correlation between the two variables does not necessarily imply a causal relationship.", language: "en", hint: "Warn against assuming causation from correlation" },
        ]
      },
      {
        title: "Module 11 Review: Critical Thinking & Argumentation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The argument is ___; it lacks logical coherence.'", options: ["flawed", "flowed", "flaunted", "flared"], correctAnswer: "0", explanation: "'Flawed' = having weaknesses." },
          { type: "MCQ", question: "'This claim requires ___ evidence to be convincing.'", options: ["substantial", "substitute", "subtle", "sublime"], correctAnswer: "0", explanation: "'Substantial evidence' = significant proof." },
          { type: "MCQ", question: "'The author's ___ on the issue is well-known.'", options: ["stance", "stand", "stanceful", "standing"], correctAnswer: "0", explanation: "'Stance' = position on an issue." },
          { type: "MCQ", question: "What is an 'ad hominem' fallacy?", options: ["Attacking the person instead of the argument", "Misrepresenting an argument", "Circular reasoning", "False dilemma"], correctAnswer: "0", explanation: "'Ad hominem' = attacking the person, not the argument." },
          { type: "TRUE_FALSE", question: "True or False: 'Anecdotal evidence' is based on personal stories rather than systematic data.", correctAnswer: "true", explanation: "Anecdotal evidence = personal accounts, not rigorous research." },
          { type: "TRUE_FALSE", question: "True or False: A 'false dilemma' presents more than two options fairly.", correctAnswer: "false", explanation: "A false dilemma presents only two options when more exist." },
          { type: "FILL_BLANK", question: "Complete: The argument rests on a faulty ___.", correctAnswer: "premise", explanation: "'Premise' = foundational assumption of an argument." },
          { type: "FILL_BLANK", question: "Complete: The evidence is largely ___, lacking statistical support.", correctAnswer: "anecdotal", explanation: "'Anecdotal' = based on personal accounts." },
          { type: "FILL_BLANK", question: "Complete: She makes a compelling ___ for educational reform.", correctAnswer: "case", explanation: "'Makes a case' = presents a convincing argument." },
          { type: "MATCHING", question: "Match the term with its meaning:", options: [{ left: "Assumption", right: "Accepted without proof" }, { left: "Premise", right: "Foundational statement" }, { left: "Fallacy", right: "Logical error" }, { left: "Bias", right: "Prejudiced perspective" }], correctAnswer: "[0,1,2,3]", explanation: "Each term is key to critical thinking." },
          { type: "CHECKBOX", question: "Select all sound argumentation practices:", options: ["Addressing counterarguments", "Providing evidence for claims", "Distinguishing fact from opinion", "Using emotional appeals as the primary strategy"], correctAnswer: "[0,1,2]", explanation: "Emotional appeals alone are not sound argumentation; evidence and logic are needed. The others are sound practices." },
          { type: "ORDERING", question: "Put in order: the / author / makes / compelling / a / for / change / case", correctAnswer: "The author makes a compelling case,for change", explanation: "Making a case = presenting a convincing argument." },
          { type: "SPEECH", question: "The argument, while intuitively appealing, fails to account for several critical variables.", correctAnswer: "The argument, while intuitively appealing, fails to account for several critical variables.", language: "en", hint: "Critique an argument's limitations" },
          { type: "SPEECH", question: "It's essential to distinguish between correlation and causation when interpreting these results.", correctAnswer: "It's essential to distinguish between correlation and causation when interpreting these results.", language: "en", hint: "Advise careful interpretation of data" },
          { type: "SPEECH", question: "The author presents a false dilemma by suggesting there are only two possible solutions.", correctAnswer: "The author presents a false dilemma by suggesting there are only two possible solutions.", language: "en", hint: "Identify a logical fallacy in an argument" },
        ]
      },
    ]
  },
  {
    title: "C1 Mastery: Integrated Skills Review",
    lessons: [
      {
        title: "Advanced Grammar Synthesis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the complexity of the issue, a nuanced approach is required.'", options: ["Given", "Giving", "Having given", "Being given"], correctAnswer: "0", explanation: "'Given' = considering/taking into account." },
          { type: "MCQ", question: "'Not until the results were published ___ the full significance of the discovery.'", options: ["did scientists realize", "scientists realized", "scientists did realize", "realized scientists"], correctAnswer: "0", explanation: "Negative inversion: 'Not until' + auxiliary + subject." },
          { type: "MCQ", question: "'The study, ___ methodology was rigorously tested, produced reliable results.'", options: ["whose", "which", "that", "who"], correctAnswer: "0", explanation: "'Whose' = possessive relative for things in formal English." },
          { type: "MCQ", question: "'It is essential that the findings ___ disseminated widely.'", options: ["be", "are", "were", "will be"], correctAnswer: "0", explanation: "Subjunctive after 'it is essential that': base form." },
          { type: "TRUE_FALSE", question: "True or False: 'Had the researchers anticipated this outcome, they would have adjusted their methodology' is correct.", correctAnswer: "true", explanation: "Inverted third conditional: 'Had the researchers anticipated' = 'If the researchers had anticipated'." },
          { type: "TRUE_FALSE", question: "True or False: 'What the data reveals is a pattern that was previously unnoticed' is a wh-cleft.", correctAnswer: "true", explanation: "Wh-cleft: 'What + clause + be + emphasized element'." },
          { type: "FILL_BLANK", question: "Complete: ___ the limitations, the study remains a valuable contribution to the field.", correctAnswer: "Notwithstanding", explanation: "'Notwithstanding' = despite (formal concessive)." },
          { type: "FILL_BLANK", question: "Complete: The participants, ___ were randomly selected, represented diverse backgrounds.", correctAnswer: "who", explanation: "Non-defining relative clause with 'who'." },
          { type: "FILL_BLANK", question: "Complete: ___ conducted a thorough analysis, the team published their findings.", correctAnswer: "Having", explanation: "'Having conducted' = perfect participle clause." },
          { type: "MATCHING", question: "Match the structure with its grammatical category:", options: [{ left: "Had the researchers anticipated", right: "Inverted conditional" }, { left: "Whose methodology", right: "Possessive relative" }, { left: "Having conducted", right: "Perfect participle" }, { left: "Notwithstanding the limitations", right: "Concessive phrase" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure represents a different advanced grammar point." },
          { type: "CHECKBOX", question: "Select all grammatically correct advanced sentences:", options: ["The findings, which were peer-reviewed, are highly credible", "Had we known the risks, we would have proceeded differently", "What the study reveals is a fundamental shift in understanding", "The results suggest that further research should be conduct"], correctAnswer: "[0,1,2]", explanation: "'Should be conduct' is wrong; should be 'should be conducted'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / whose / researchers / findings / were / published / will / present", correctAnswer: "The researchers,whose findings were published,will present", explanation: "Non-defining relative with 'whose'." },
          { type: "SPEECH", question: "Given the unprecedented nature of these findings, further investigation is absolutely warranted.", correctAnswer: "Given the unprecedented nature of these findings, further investigation is absolutely warranted.", language: "en", hint: "Justify further research based on exceptional results" },
          { type: "SPEECH", question: "Not only did the study challenge existing paradigms, but it also proposed a revolutionary new framework.", correctAnswer: "Not only did the study challenge existing paradigms, but it also proposed a revolutionary new framework.", language: "en", hint: "Emphasize dual achievements using negative inversion" },
        ]
      },
      {
        title: "Academic Writing Synthesis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The ___ of the findings has been widely debated.'", options: ["interpretation", "interpreting", "interpreted", "interpretive"], correctAnswer: "0", explanation: "Nominalization: 'interpretation' for formal academic style." },
          { type: "MCQ", question: "'The results ___ suggest a need for further investigation.'", options: ["appear to", "definitely", "undoubtedly", "certainly"], correctAnswer: "0", explanation: "'Appear to' = hedging; appropriate academic caution." },
          { type: "MCQ", question: "'The study ___ a significant gap in the existing literature.'", options: ["identifies", "finds", "sees", "spots"], correctAnswer: "0", explanation: "'Identifies' = formal academic verb for finding gaps." },
          { type: "MCQ", question: "'The data were collected ___ a standardized protocol.'", options: ["using", "with using", "by use", "through use of"], correctAnswer: "0", explanation: "'Using' = concise and appropriate for academic writing." },
          { type: "TRUE_FALSE", question: "True or False: 'The findings corroborate previous research' uses appropriate academic vocabulary.", correctAnswer: "true", explanation: "'Corroborate' = formal for 'support/confirm'." },
          { type: "TRUE_FALSE", question: "True or False: 'This proves the theory beyond any doubt' is appropriate academic writing.", correctAnswer: "false", explanation: "Too absolute; use hedging: 'This strongly suggests'." },
          { type: "FILL_BLANK", question: "Complete: The ___ of the new approach yielded promising results. (implement)", correctAnswer: "implementation", explanation: "Nominalization for academic tone." },
          { type: "FILL_BLANK", question: "Complete: It is ___ that the results be interpreted with caution.", correctAnswer: "imperative", explanation: "'It is imperative that' = strong academic recommendation (subjunctive)." },
          { type: "FILL_BLANK", question: "Complete: The study makes a significant ___ to the field. (contribute)", correctAnswer: "contribution", explanation: "Nominalization: 'contribution'." },
          { type: "MATCHING", question: "Match the academic feature with its example:", options: [{ left: "Nominalization", right: "The implementation of" }, { left: "Hedging", right: "Appears to suggest" }, { left: "Formal vocabulary", right: "Corroborates" }, { left: "Passive voice", right: "Were collected" }], correctAnswer: "[0,1,2,3]", explanation: "Each feature contributes to academic register." },
          { type: "CHECKBOX", question: "Select all appropriate academic sentences:", options: ["The implementation of the framework was carefully monitored", "The results appear to support the initial hypothesis", "The study identifies several significant limitations", "The researchers got some really cool results"], correctAnswer: "[0,1,2]", explanation: "'Got some really cool results' is too informal. The others are appropriate." },
          { type: "ORDERING", question: "Put in order: the / implementation / of / the / framework / was / successful / highly", correctAnswer: "The implementation of the framework,was highly successful", explanation: "Nominalized subject for academic style." },
          { type: "SPEECH", question: "The implementation of the proposed framework yielded results that appear to corroborate our initial hypotheses.", correctAnswer: "The implementation of the proposed framework yielded results that appear to corroborate our initial hypotheses.", language: "en", hint: "Report research outcomes using nominalization and hedging" },
          { type: "SPEECH", question: "It is imperative that these findings be interpreted with appropriate caution given the study's limitations.", correctAnswer: "It is imperative that these findings be interpreted with appropriate caution given the study's limitations.", language: "en", hint: "Advise cautious interpretation using subjunctive" },
        ]
      },
      {
        title: "Final Comprehensive Review",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'___ the evidence, we must conclude that the hypothesis is supported.'", options: ["Given", "Giving", "Having given", "Being given"], correctAnswer: "0", explanation: "'Given' = considering." },
          { type: "MCQ", question: "'Not once ___ the researcher acknowledge the limitations of the study.'", options: ["did", "the researcher did", "was", "had"], correctAnswer: "0", explanation: "'Not once' + auxiliary + subject = negative inversion." },
          { type: "MCQ", question: "'The methodology, ___ was rigorously tested, proved highly reliable.'", options: ["which", "that", "who", "whom"], correctAnswer: "0", explanation: "'Which' for non-defining relative about things." },
          { type: "MCQ", question: "'It is crucial that all data ___ verified before publication.'", options: ["be", "is", "are", "was"], correctAnswer: "0", explanation: "Subjunctive after 'it is crucial that': base form." },
          { type: "TRUE_FALSE", question: "True or False: 'Were the circumstances different, we would have reached a different conclusion' is correct.", correctAnswer: "true", explanation: "Inverted second conditional: 'Were the circumstances different' = 'If the circumstances were different'." },
          { type: "TRUE_FALSE", question: "True or False: 'What the study ultimately demonstrates is the need for further research' is a wh-cleft.", correctAnswer: "true", explanation: "Wh-cleft emphasizing what the study demonstrates." },
          { type: "FILL_BLANK", question: "Complete: ___ the challenges encountered, the project was completed successfully.", correctAnswer: "Notwithstanding", explanation: "'Notwithstanding' = despite." },
          { type: "FILL_BLANK", question: "Complete: The findings, ___ were peer-reviewed, have been widely accepted.", correctAnswer: "which", explanation: "Non-defining relative clause with 'which'." },
          { type: "FILL_BLANK", question: "Complete: ___ analyzed the data, the researchers published their conclusions.", correctAnswer: "Having", explanation: "'Having analyzed' = perfect participle clause." },
          { type: "MATCHING", question: "Match the C1 skill with its example:", options: [{ left: "Inversion", right: "Not once did the researcher" }, { left: "Subjunctive", right: "It is crucial that all data be" }, { left: "Participle clause", right: "Having analyzed the data" }, { left: "Nominalization", right: "The implementation of" }], correctAnswer: "[0,1,2,3]", explanation: "Each represents a key C1-level grammatical skill." },
          { type: "CHECKBOX", question: "Select all grammatically correct C1-level sentences:", options: ["Had the researchers anticipated this outcome, they would have adjusted their methodology", "The findings, which were peer-reviewed, are highly credible", "What the study reveals is a fundamental shift in understanding", "The data suggest that further research should be conduct"], correctAnswer: "[0,1,2]", explanation: "'Should be conduct' is wrong; should be 'conducted'. The others are correct C1-level sentences." },
          { type: "ORDERING", question: "Put in order: the / whose / study / findings / were / groundbreaking / will / presented / be", correctAnswer: "The study,whose findings were groundbreaking,will be presented", explanation: "Non-defining relative with 'whose'." },
          { type: "SPEECH", question: "Given the complexity of the phenomenon under investigation, a multidisciplinary approach is not only advisable but essential.", correctAnswer: "Given the complexity of the phenomenon under investigation, a multidisciplinary approach is not only advisable but essential.", language: "en", hint: "Argue for a comprehensive research approach" },
          { type: "SPEECH", question: "Notwithstanding the considerable obstacles we faced, the research team persevered and ultimately achieved our objectives.", correctAnswer: "Notwithstanding the considerable obstacles we faced, the research team persevered and ultimately achieved our objectives.", language: "en", hint: "Describe overcoming challenges using formal concessive language" },
          { type: "SPEECH", question: "What this study ultimately demonstrates is that our understanding of the phenomenon requires substantial revision.", correctAnswer: "What this study ultimately demonstrates is that our understanding of the phenomenon requires substantial revision.", language: "en", hint: "Present a paradigm-shifting conclusion using a wh-cleft" },
        ]
      },
    ]
  },
]

async function seedEnglishC1() {
  console.log('=========================================')
  console.log('🎓 Seeding English C1 Course...')
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
          order: 5,
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
    console.log('🎉 English C1 Course Seed Complete!')
    console.log('=========================================')
    console.log(`📚 Course: ${course.title}`)
    console.log(`📦 Modules: ${modulesData.length}`)
    console.log(`📝 Lessons: ${totalLessons}`)
    console.log(`❓ Questions: ${totalQuestions}`)
    console.log(`🆔 Course ID: ${course.id}`)
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding English C1 course:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnglishC1()
