import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`â³ Connection failed, retrying in ${delay}ms... (${i + 1}/${retries})`)
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
  title: "English C2 - Proficiency",
  description: "Achieve near-native mastery of English. The pinnacle of language proficiency covering complex grammar, sophisticated rhetoric, advanced pragmatics, stylistic precision, diplomatic communication, and literary expression. Designed for scholars, professionals, and language masters.",
  difficulty: "PROFICIENCY",
  minimumLevel: "C2",
  isFree: true,
  isPremium: false,
  cutoffScore: 75,
  status: "PUBLISHED",
  icon: "ðŸ‘‘",
  color: "#1e1b4b",
}

const modulesData = [
  {
    title: "Mastery of Complex Grammar",
    lessons: [
      {
        title: "Advanced Inversion & Ellipsis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'So compelling ___ that the committee immediately approved the proposal.'", options: ["was the evidence", "the evidence was", "did the evidence", "the evidence did"], correctAnswer: "0", explanation: "'So + adjective' at sentence front triggers full inversion: 'So compelling was the evidence' = 'The evidence was so compelling'." },
          { type: "MCQ", question: "'She is a brilliant researcher, and her colleague ___. '", options: ["equally so", "so equally", "is equally", "equally is"], correctAnswer: "0", explanation: "'Equally so' = elliptical substitution meaning 'equally brilliant'. Sophisticated C2-level ellipsis." },
          { type: "MCQ", question: "'Not for one moment ___ that the results would be so groundbreaking.'", options: ["did they anticipate", "they anticipated", "anticipated they", "they did anticipate"], correctAnswer: "0", explanation: "'Not for one moment' triggers negative inversion: auxiliary before subject." },
          { type: "MCQ", question: "'He claimed to be an expert; ___, his performance suggested otherwise.'", options: ["if so", "not so", "so too", "too so"], correctAnswer: "1", explanation: "'Not so' = elliptical negation meaning 'that was not the case'. C2-level reference." },
          { type: "TRUE_FALSE", question: "True or False: 'Such was the magnitude of the disaster that aid was immediately dispatched' uses correct inversion.", correctAnswer: "true", explanation: "'Such + be' inversion: 'Such was the magnitude' = 'The magnitude was such'." },
          { type: "TRUE_FALSE", question: "True or False: 'Gapping' involves omitting repeated verbs in coordinate structures: 'John ordered pasta, and Mary pizza.'", correctAnswer: "true", explanation: "Gapping = omitting the verb in the second clause: 'John ordered pasta, and Mary [ordered] pizza.'" },
          { type: "FILL_BLANK", question: "Complete: So persuasive ___ that even the skeptics were convinced.", correctAnswer: "was her argument", explanation: "'So + adjective' triggers inversion: 'So persuasive was her argument'." },
          { type: "FILL_BLANK", question: "Complete: Had the government acted sooner, the crisis ___.", correctAnswer: "might have been averted", explanation: "Inverted third conditional + passive: 'Had the government acted' = 'If the government had acted'." },
          { type: "FILL_BLANK", question: "Complete: She was nominated for the award, and deservedly ___.", correctAnswer: "so", explanation: "'Deservedly so' = elliptical: 'deservedly nominated for the award'." },
          { type: "MATCHING", question: "Match the inversion type with its example:", options: [{ left: "So...that inversion", right: "So compelling was the case that" }, { left: "Negative inversion", right: "Not for one moment did he" }, { left: "Conditional inversion", right: "Had the circumstances permitted" }, { left: "Gapping", right: "John ordered pasta, Mary pizza" }], correctAnswer: "[0,1,2,3]", explanation: "Each inversion type has a distinct structure and function." },
          { type: "CHECKBOX", question: "Select all grammatically correct C2 inversion sentences:", options: ["So profound were the implications that the field was transformed", "Not until the final analysis did the pattern emerge", "Had the committee not intervened, the project would have failed", "Such was impact of the discovery it changed everything"], correctAnswer: "[0,1,2]", explanation: "'Such was impact' is wrong; needs article: 'Such was THE impact'. The others are correct." },
          { type: "ORDERING", question: "Put in order: so / the / was / evidence / compelling / acquittal / an / immediate / resulted / in", correctAnswer: "So compelling was the evidence,an immediate acquittal resulted", explanation: "'So + adjective + be + subject' inversion." },
          { type: "SPEECH", question: "So profound were the implications of the discovery that entire fields of study were fundamentally transformed.", correctAnswer: "So profound were the implications of the discovery that entire fields of study were fundamentally transformed.", language: "en", hint: "Describe transformative impact using 'so...that' inversion" },
          { type: "SPEECH", question: "Not until the final stages of the experiment did the researchers realize the full significance of their findings.", correctAnswer: "Not until the final stages of the experiment did the researchers realize the full significance of their findings.", language: "en", hint: "Describe a late realization using 'not until' inversion" },
        ]
      },
      {
        title: "Anaphora, Cataphora & Reference Chains",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'When she finally arrived, ___ was exhausted from the journey.' (cataphoric reference to 'she')", options: ["she", "he", "it", "they"], correctAnswer: "0", explanation: "Cataphora: the pronoun 'she' in the subordinate clause refers forward to the same 'she' in the main clause." },
          { type: "MCQ", question: "'The CEO resigned yesterday. ___ decision shocked the entire board.'", options: ["Her", "This", "That", "Such"], correctAnswer: "1", explanation: "'This decision' = anaphoric reference connecting back to the resignation event." },
          { type: "MCQ", question: "'Despite ___ protests, the policy was implemented.' (cataphoric)", options: ["their", "the", "those", "these"], correctAnswer: "0", explanation: "'Their' refers cataphorically to the protesters mentioned later or understood from context." },
          { type: "MCQ", question: "What is 'cataphora'?", options: ["A pronoun referring forward to a later noun", "A pronoun referring back to an earlier noun", "Repeating a word for emphasis", "Omitting understood words"], correctAnswer: "0", explanation: "Cataphora = forward reference. Anaphora = backward reference." },
          { type: "TRUE_FALSE", question: "True or False: 'What I want to tell you is this: the project has been approved' uses cataphoric 'this'.", correctAnswer: "true", explanation: "'This' refers cataphorically to the following clause 'the project has been approved'." },
          { type: "TRUE_FALSE", question: "True or False: 'The company failed. This was due to poor management' uses anaphoric 'this'.", correctAnswer: "true", explanation: "'This' refers anaphorically back to 'the company failed'." },
          { type: "FILL_BLANK", question: "Complete: ___ is what the report concluded: the methodology was fundamentally flawed.", correctAnswer: "This", explanation: "Cataphoric 'this' referring forward to the following clause." },
          { type: "FILL_BLANK", question: "Complete: Three factors contributed to the crisis. The first was economic instability, the second political unrest, and the third ___.", correctAnswer: "social inequality", explanation: "Elliptical reference completing a parallel structure." },
          { type: "FILL_BLANK", question: "Complete: She made a remarkable discovery, one ___ would revolutionize the field.", correctAnswer: "that", explanation: "'One that' = anaphoric reference connecting to 'discovery'." },
          { type: "MATCHING", question: "Match the reference type with its example:", options: [{ left: "Anaphora", right: "John arrived late. He was tired." }, { left: "Cataphora", right: "Before he arrived, John called." }, { left: "Exophora", right: "Look at that! (pointing)" }, { left: "Ellipsis", right: "She can swim; I can too." }], correctAnswer: "[0,1,2,3]", explanation: "Each reference type connects information differently." },
          { type: "CHECKBOX", question: "Select all correct reference chains:", options: ["The study was groundbreaking. It changed the field forever", "When she arrived, Mary noticed the change", "He said this: the results are inconclusive", "The policy was controversial, and this led to protests"], correctAnswer: "[0,1,2,3]", explanation: "All demonstrate correct reference chains at C2 level." },
          { type: "ORDERING", question: "Put in order: the / was / discovery / that / groundbreaking / one / would / transform / field / the", correctAnswer: "The discovery was groundbreaking,one that would transform the field", explanation: "Anaphoric 'one that' reference." },
          { type: "SPEECH", question: "When the committee finally reached its decision, it was one that would have far-reaching consequences for the entire organization.", correctAnswer: "When the committee finally reached its decision, it was one that would have far-reaching consequences for the entire organization.", language: "en", hint: "Describe a significant decision using cataphoric and anaphoric reference" },
          { type: "SPEECH", question: "This is what the evidence suggests: the correlation, while statistically significant, does not imply causation.", correctAnswer: "This is what the evidence suggests: the correlation, while statistically significant, does not imply causation.", language: "en", hint: "Present evidence using cataphoric reference" },
        ]
      },
      {
        title: "Gapping, Stranding & Pseudogapping",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'Some chose the conventional route; others, the innovative one.' What ellipsis is used?", options: ["Gapping", "Stranding", "Pseudogapping", "Sluicing"], correctAnswer: "0", explanation: "Gapping = omitting the verb in the second clause: 'others [chose] the innovative one.'" },
          { type: "MCQ", question: "'She can play the piano better than I can ___. '", options: ["[play the piano]", "play", "the piano", "play it"], correctAnswer: "0", explanation: "Comparative ellipsis: the verb phrase is understood after 'than I can'." },
          { type: "MCQ", question: "'He said he would help, and help he ___. '", options: ["did", "would", "does", "will"], correctAnswer: "0", explanation: "'Help he did' = emphatic VP fronting with auxiliary 'did'." },
          { type: "MCQ", question: "What is 'sluicing'?", options: ["Omitting everything in a wh-question except the wh-word", "Omitting the verb", "Omitting the subject", "Omitting the object"], correctAnswer: "0", explanation: "Sluicing: 'Someone called, but I don't know who [called]'." },
          { type: "TRUE_FALSE", question: "True or False: 'Mary read the first chapter, and John the second' uses gapping correctly.", correctAnswer: "true", explanation: "Gapping: 'John [read] the second' - verb omitted in second clause." },
          { type: "TRUE_FALSE", question: "True or False: 'She's smarter than him' is the grammatically correct form.", correctAnswer: "false", explanation: "Formally correct: 'She's smarter than he [is]'. 'Him' is informal/colloquial." },
          { type: "FILL_BLANK", question: "Complete: The senator advocated for reform, and the president ___.", correctAnswer: "against it", explanation: "Gapping with contrast: 'the president [advocated] against it.'" },
          { type: "FILL_BLANK", question: "Complete: Someone left the door open, but I don't know ___.", correctAnswer: "who", explanation: "Sluicing: 'who [left the door open]'." },
          { type: "FILL_BLANK", question: "Complete: She promised she would defend him, and defend him she ___.", correctAnswer: "did", explanation: "VP fronting with emphatic 'did': 'defend him she did.'" },
          { type: "MATCHING", question: "Match the ellipsis type with its example:", options: [{ left: "Gapping", right: "John ordered pasta, Mary pizza" }, { left: "Sluicing", right: "Someone called, but I don't know who" }, { left: "VP ellipsis", right: "She can swim, and I can too" }, { left: "Pseudogapping", right: "He didn't eat the cake, but he did the pie" }], correctAnswer: "[0,1,2,3]", explanation: "Each ellipsis type omits different elements." },
          { type: "CHECKBOX", question: "Select all correct ellipsis sentences:", options: ["Some favored the proposal; others, opposed it", "She has already finished, but he hasn't yet", "I know someone who can help, but I won't say who", "He accused her of lying, and she did of cheating"], correctAnswer: "[0,1,2]", explanation: "'She did of cheating' is wrong; pseudogapping needs proper structure. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / favored / first / proposal / second / the / committee / the / opposition", correctAnswer: "The first committee favored the proposal,the second the opposition", explanation: "Gapping: 'the second [favored] the opposition.'" },
          { type: "SPEECH", question: "The prosecution presented a compelling case; the defense, an equally persuasive rebuttal.", correctAnswer: "The prosecution presented a compelling case; the defense, an equally persuasive rebuttal.", language: "en", hint: "Describe opposing arguments using gapping" },
          { type: "SPEECH", question: "Someone leaked the confidential report, though I couldn't tell you who.", correctAnswer: "Someone leaked the confidential report, though I couldn't tell you who.", language: "en", hint: "Use sluicing to avoid specifying information" },
        ]
      },
      {
        title: "Module 1 Review: Mastery of Complex Grammar",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'So profound ___ that it fundamentally altered our understanding.'", options: ["was the discovery", "the discovery was", "did the discovery", "the discovery did"], correctAnswer: "0", explanation: "'So + adjective' inversion: 'So profound was the discovery'." },
          { type: "MCQ", question: "'Not until the data was fully analyzed ___ the true significance of the findings.'", options: ["did they comprehend", "they comprehended", "comprehended they", "they did comprehend"], correctAnswer: "0", explanation: "'Not until' triggers negative inversion." },
          { type: "MCQ", question: "'She was an exceptional leader, and rightly ___. '", options: ["so", "too", "also", "as"], correctAnswer: "0", explanation: "'Rightly so' = elliptical: 'rightly recognized as an exceptional leader'." },
          { type: "MCQ", question: "'When he finally spoke, ___ was with great authority.' (cataphoric)", options: ["it", "he", "that", "this"], correctAnswer: "0", explanation: "'It' refers cataphorically to the manner of speaking described in the 'with' phrase." },
          { type: "TRUE_FALSE", question: "True or False: 'Such were the circumstances that no alternative was feasible' is correct inversion.", correctAnswer: "true", explanation: "'Such + be' inversion for emphasis." },
          { type: "TRUE_FALSE", question: "True or False: 'She is more qualified than him' is the formally correct C2-level form.", correctAnswer: "false", explanation: "Formally correct: 'She is more qualified than he [is]'." },
          { type: "FILL_BLANK", question: "Complete: So compelling ___ that even the most skeptical reviewers were convinced.", correctAnswer: "was the evidence", explanation: "'So + adjective + be + subject' inversion." },
          { type: "FILL_BLANK", question: "Complete: The initial findings were promising, and subsequent research ___.", correctAnswer: "confirmed them", explanation: "Elliptical structure completing the reference chain." },
          { type: "FILL_BLANK", question: "Complete: Someone compromised the system, but the investigators couldn't determine ___.", correctAnswer: "how", explanation: "Sluicing: 'how [they compromised the system]'." },
          { type: "MATCHING", question: "Match the structure with its grammatical category:", options: [{ left: "So profound was", right: "So...that inversion" }, { left: "Not until did they", right: "Negative inversion" }, { left: "John pasta, Mary pizza", right: "Gapping" }, { left: "Rightly so", right: "Elliptical reference" }], correctAnswer: "[0,1,2,3]", explanation: "Each structure represents a different advanced grammatical feature." },
          { type: "CHECKBOX", question: "Select all grammatically correct C2 sentences:", options: ["Had the committee not intervened, the project would have been abandoned", "So groundbreaking was the research that it won the Nobel Prize", "She advocated for reform, and so did her colleagues", "Not for one moment they suspected the truth"], correctAnswer: "[0,1,2]", explanation: "'Not for one moment they suspected' is wrong; needs inversion: 'did they suspect'. The others are correct." },
          { type: "ORDERING", question: "Put in order: so / the / was / impact / profound / policy / the / transformed / it / entire / sector", correctAnswer: "So profound was the impact of the policy,it transformed the entire sector", explanation: "'So + adjective + be + subject' inversion." },
          { type: "SPEECH", question: "So profound was the paradigm shift that entire disciplines were forced to reconsider their foundational assumptions.", correctAnswer: "So profound was the paradigm shift that entire disciplines were forced to reconsider their foundational assumptions.", language: "en", hint: "Describe transformative change using 'so...that' inversion" },
          { type: "SPEECH", question: "Not until the final stage of the negotiations did the parties realize how much common ground they actually shared.", correctAnswer: "Not until the final stage of the negotiations did the parties realize how much common ground they actually shared.", language: "en", hint: "Describe a late realization using 'not until' inversion" },
          { type: "SPEECH", question: "The methodology was rigorous, and deservedly so, given the stakes involved in the research.", correctAnswer: "The methodology was rigorous, and deservedly so, given the stakes involved in the research.", language: "en", hint: "Validate a claim using elliptical reference 'deservedly so'" },
        ]
      },
    ]
  },
  {
    title: "Sophisticated Discourse & Pragmatics",
    lessons: [
      {
        title: "Implicature & Conversational Inference",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'A: Is John a good programmer? B: He's a nice person.' What implicature does B's response carry?", options: ["John is not a good programmer", "John is an excellent programmer", "John is average", "No implicature"], correctAnswer: "0", explanation: "By not answering directly and giving an irrelevant positive trait, B implicates that John is NOT a good programmer (flouting the maxim of relevance)." },
          { type: "MCQ", question: "'Some of the students passed the exam.' What scalar implicature does this carry?", options: ["Not all students passed", "All students passed", "Most students passed", "No students passed"], correctAnswer: "0", explanation: "Scalar implicature: 'some' implicates 'not all' because if all had passed, the speaker would have said 'all'." },
          { type: "MCQ", question: "'It's a bit cold in here.' What speech act might this perform?", options: ["A request to close the window", "A statement of fact only", "A command to leave", "A question"], correctAnswer: "0", explanation: "Indirect speech act: the statement about temperature implicates a request to make it warmer." },
          { type: "MCQ", question: "What is 'conversational implicature'?", options: ["Meaning inferred from context beyond literal meaning", "Literal dictionary meaning", "Grammatical structure", "Pronunciation pattern"], correctAnswer: "0", explanation: "Conversational implicature = meaning that is implied but not explicitly stated, inferred from Gricean maxims." },
          { type: "TRUE_FALSE", question: "True or False: 'I have three children' conversationally implicates that the speaker does NOT have four or more children.", correctAnswer: "true", explanation: "Scalar implicature: if the speaker had four, they would have said 'four'. 'Three' implicates 'not more than three'." },
          { type: "TRUE_FALSE", question: "True or False: Flouting a conversational maxim always results in a communication breakdown.", correctAnswer: "false", explanation: "Flouting a maxim often generates implicature (intended inferred meaning), not breakdown." },
          { type: "FILL_BLANK", question: "Complete: 'A: Did you enjoy the lecture? B: The slides were well-designed.' The implicature is that the lecture was ___.", correctAnswer: "not particularly enjoyable", explanation: "By commenting only on a minor aspect, B implicates the lecture itself was not enjoyable." },
          { type: "FILL_BLANK", question: "Complete: 'Can you pass the salt?' is an indirect ___ act.", correctAnswer: "request", explanation: "Surface form = question about ability; actual function = request." },
          { type: "FILL_BLANK", question: "Complete: Grice's Cooperative Principle includes the maxims of quantity, quality, relation, and ___.", correctAnswer: "manner", explanation: "Grice's four maxims: quantity, quality, relation (relevance), manner." },
          { type: "MATCHING", question: "Match the Gricean maxim with its description:", options: [{ left: "Quantity", right: "Be as informative as required" }, { left: "Quality", right: "Do not say what you believe to be false" }, { left: "Relation", right: "Be relevant" }, { left: "Manner", right: "Be clear and orderly" }], correctAnswer: "[0,1,2,3]", explanation: "Grice's four maxims govern cooperative conversation." },
          { type: "CHECKBOX", question: "Select all examples of conversational implicature:", options: ["'It's getting late' implying 'We should leave'", "'Some people agree' implying 'Not everyone agrees'", "'He's tall' said about a basketball player implying 'That's not notable'", "'The door is open' implying 'Close it'"], correctAnswer: "[0,1,2,3]", explanation: "All are examples where meaning is inferred beyond literal content." },
          { type: "ORDERING", question: "Put in order: the / speaker / by / flouting / the / maxim / relevance / generated / of / an / implicature", correctAnswer: "The speaker,by flouting the maxim of relevance,generated an implicature", explanation: "Flouting maxims generates implicatures." },
          { type: "SPEECH", question: "When asked about the candidate's qualifications, the reference letter stated only that he was always punctual and had excellent handwriting.", correctAnswer: "When asked about the candidate's qualifications, the reference letter stated only that he was always punctual and had excellent handwriting.", language: "en", hint: "Describe damning with faint praise through implicature" },
          { type: "SPEECH", question: "The committee's decision to approve the budget with certain caveats suggests they have reservations about the project's feasibility.", correctAnswer: "The committee's decision to approve the budget with certain caveats suggests they have reservations about the project's feasibility.", language: "en", hint: "Interpret hedged approval as conveying doubt" },
        ]
      },
      {
        title: "Speech Acts & Politeness Strategies",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I hereby declare this session open.' What type of speech act is this?", options: ["Declarative", "Assertive", "Directive", "Commissive"], correctAnswer: "0", explanation: "Declarative: the utterance itself performs the action (declaring the session open)." },
          { type: "MCQ", question: "'I promise to complete the report by Friday.' What type of speech act?", options: ["Commissive", "Assertive", "Directive", "Declarative"], correctAnswer: "0", explanation: "Commissive: the speaker commits to a future action." },
          { type: "MCQ", question: "'Would you mind terribly if I borrowed your notes?' What politeness strategy is used?", options: ["Negative politeness", "Positive politeness", "Bald on-record", "Off-record"], correctAnswer: "0", explanation: "Negative politeness: minimizing imposition on the hearer's freedom of action." },
          { type: "MCQ", question: "What is a 'face-threatening act' (FTA)?", options: ["An utterance that challenges someone's social standing or autonomy", "A physical threat", "An insult only", "A compliment"], correctAnswer: "0", explanation: "FTA = any act that threatens the hearer's positive face (desire to be approved of) or negative face (desire for autonomy)." },
          { type: "TRUE_FALSE", question: "True or False: 'I'm sorry to bother you, but could I possibly ask a favor?' uses both negative politeness and hedging.", correctAnswer: "true", explanation: "'Sorry to bother' = negative politeness; 'could I possibly' = hedging." },
          { type: "TRUE_FALSE", question: "True or False: 'Close the door' is a bald on-record directive.", correctAnswer: "true", explanation: "Direct, unmitigated command = bald on-record." },
          { type: "FILL_BLANK", question: "Complete: 'If I could possibly trouble you for a moment...' is an example of ___ politeness.", correctAnswer: "negative", explanation: "Negative politeness minimizes imposition on the hearer." },
          { type: "FILL_BLANK", question: "Complete: 'I'll have the committee review your application' performs the speech act of ___.", correctAnswer: "committing", explanation: "The speaker commits to a future action (commissive speech act)." },
          { type: "FILL_BLANK", question: "Complete: 'You're fired!' is a ___ speech act; the utterance itself performs the dismissal.", correctAnswer: "declarative", explanation: "Declarative speech acts change reality through the utterance." },
          { type: "MATCHING", question: "Match the speech act type with its example:", options: [{ left: "Assertive", right: "The meeting starts at 9" }, { left: "Directive", right: "Please submit your report" }, { left: "Commissive", right: "I will handle this personally" }, { left: "Declarative", right: "I pronounce you husband and wife" }], correctAnswer: "[0,1,2,3]", explanation: "Each speech act type performs a different communicative function." },
          { type: "CHECKBOX", question: "Select all examples of politeness strategies:", options: ["I was wondering if you might be able to help", "We're all in this together, mate!", "I hate to ask, but...", "Give me that now!"], correctAnswer: "[0,1,2]", explanation: "'Give me that now!' is bald on-record with no politeness. The others employ politeness strategies." },
          { type: "ORDERING", question: "Put in order: the / employed / speaker / negative / politeness / to / mitigate / the / face-threatening / act", correctAnswer: "The speaker employed negative politeness,to mitigate the face-threatening act", explanation: "Negative politeness reduces the threat to face." },
          { type: "SPEECH", question: "I don't mean to impose, but would it be at all possible for you to review the document before the deadline?", correctAnswer: "I don't mean to impose, but would it be at all possible for you to review the document before the deadline?", language: "en", hint: "Make a request using layered negative politeness strategies" },
          { type: "SPEECH", question: "I hereby formally adjourn this session until the next scheduled meeting.", correctAnswer: "I hereby formally adjourn this session until the next scheduled meeting.", language: "en", hint: "Perform a declarative speech act to officially close a meeting" },
        ]
      },
      {
        title: "Presupposition & Entailment",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'John stopped smoking.' What is presupposed?", options: ["John used to smoke", "John has quit permanently", "John never smoked", "John started smoking"], correctAnswer: "0", explanation: "'Stopped' presupposes that John used to smoke. Presuppositions survive negation: 'John didn't stop smoking' still presupposes he smoked." },
          { type: "MCQ", question: "'The King of France is bald.' What presupposition does this carry?", options: ["There is a King of France", "France has a monarchy", "The King is French", "Someone is bald"], correctAnswer: "0", explanation: "Definite descriptions presuppose existence. This is Russell's famous example." },
          { type: "MCQ", question: "'She managed to finish the race.' What is presupposed?", options: ["Finishing the race was difficult", "She finished easily", "She didn't finish", "The race was short"], correctAnswer: "0", explanation: "'Managed to' presupposes difficulty. Compare with 'She finished the race' (no difficulty presupposed)." },
          { type: "MCQ", question: "What is the difference between presupposition and entailment?", options: ["Presuppositions survive negation; entailments don't", "They are the same", "Entailments survive negation; presuppositions don't", "Neither survives negation"], correctAnswer: "0", explanation: "'John stopped smoking' and 'John didn't stop smoking' both presuppose he smoked. But 'John killed the mosquito' entails 'the mosquito died', which is NOT true if negated." },
          { type: "TRUE_FALSE", question: "True or False: 'She regretted accepting the offer' presupposes that she accepted the offer.", correctAnswer: "true", explanation: "Factive verb 'regret' presupposes the truth of its complement: she DID accept." },
          { type: "TRUE_FALSE", question: "True or False: 'John thinks that Mary is guilty' presupposes that Mary is guilty.", correctAnswer: "false", explanation: "'Thinks' is non-factive; it does NOT presuppose the truth of its complement." },
          { type: "FILL_BLANK", question: "Complete: 'She ___ to realize the implications' presupposes that she eventually did realize them.", correctAnswer: "came", explanation: "'Came to realize' presupposes the eventual realization occurred." },
          { type: "FILL_BLANK", question: "Complete: 'He forgot to lock the door' presupposes that he was supposed to ___ the door.", correctAnswer: "lock", explanation: "The presupposition is that locking the door was expected/required." },
          { type: "FILL_BLANK", question: "Complete: The sentence 'If John killed the mosquito, it died' shows that 'the mosquito died' is an ___, not a presupposition.", correctAnswer: "entailment", explanation: "Entailments don't survive in conditionals; presuppositions typically do." },
          { type: "MATCHING", question: "Match the trigger with its presupposition type:", options: [{ left: "Stopped", right: "Change of state" }, { left: "Regretted", right: "Factive" }, { left: "The king", right: "Definite description" }, { left: "Managed to", right: "Implicative" }], correctAnswer: "[0,1,2,3]", explanation: "Each trigger type generates a different presupposition." },
          { type: "CHECKBOX", question: "Select all sentences that presuppose the event occurred:", options: ["She forgot to call him", "He realized the mistake", "They stopped arguing", "She thinks he's guilty"], correctAnswer: "[0,1,2]", explanation: "'Thinks' is non-factive; no presupposition of guilt. The others presuppose their complements." },
          { type: "ORDERING", question: "Put in order: the / presupposition / survives / negation / unlike / entailment", correctAnswer: "The presupposition survives negation,unlike entailment", explanation: "Key difference between presupposition and entailment." },
          { type: "SPEECH", question: "She came to regret the decision she had made so hastily, realizing too late the consequences it would entail.", correctAnswer: "She came to regret the decision she had made so hastily, realizing too late the consequences it would entail.", language: "en", hint: "Use factive and implicative triggers to convey presupposed information" },
          { type: "SPEECH", question: "The defendant, who was present at the scene, allegedly witnessed the entire incident unfold.", correctAnswer: "The defendant, who was present at the scene, allegedly witnessed the entire incident unfold.", language: "en", hint: "Use a non-restrictive relative clause to presuppose information" },
        ]
      },
      {
        title: "Module 2 Review: Sophisticated Discourse & Pragmatics",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'A: How was the movie? B: The popcorn was great.' What implicature does B generate?", options: ["The movie was not good", "The movie was excellent", "The movie was average", "No implicature"], correctAnswer: "0", explanation: "By commenting only on popcorn (flouting relevance), B implicates the movie was not worth discussing." },
          { type: "MCQ", question: "'I promise to have the report ready by Monday.' What speech act type?", options: ["Commissive", "Assertive", "Directive", "Declarative"], correctAnswer: "0", explanation: "Commissive = committing to a future action." },
          { type: "MCQ", question: "'She managed to solve the puzzle.' What is presupposed?", options: ["The puzzle was difficult", "The puzzle was easy", "She didn't solve it", "The puzzle was unsolvable"], correctAnswer: "0", explanation: "'Managed to' presupposes difficulty." },
          { type: "MCQ", question: "'Would you by any chance happen to know the time?' What politeness strategy?", options: ["Negative politeness with multiple hedges", "Positive politeness", "Bald on-record", "Off-record hint"], correctAnswer: "0", explanation: "Multiple hedges ('by any chance', 'happen to') minimize imposition (negative politeness)." },
          { type: "TRUE_FALSE", question: "True or False: 'She forgot that he was coming' presupposes that he was coming.", correctAnswer: "true", explanation: "'Forgot' is factive; it presupposes the truth of its complement." },
          { type: "TRUE_FALSE", question: "True or False: Scalar implicature arises from the use of a weaker term on a scale, implying the stronger term doesn't apply.", correctAnswer: "true", explanation: "'Some' implicates 'not all'; 'good' implicates 'not excellent'." },
          { type: "FILL_BLANK", question: "Complete: 'I ___ to inform you that your application has been rejected.' (formal declarative)", correctAnswer: "regret", explanation: "'I regret to inform' = formal polite way of delivering bad news." },
          { type: "FILL_BLANK", question: "Complete: 'John stopped eating meat' presupposes that John used to ___ meat.", correctAnswer: "eat", explanation: "Change of state verb 'stopped' presupposes the prior state." },
          { type: "FILL_BLANK", question: "Complete: The maxim of ___ requires speakers to be truthful and not say things they lack evidence for.", correctAnswer: "Quality", explanation: "Grice's maxim of Quality: do not say what you believe to be false." },
          { type: "MATCHING", question: "Match the concept with its definition:", options: [{ left: "Implicature", right: "Inferred meaning beyond literal" }, { left: "Presupposition", right: "Background assumption" }, { left: "Speech act", right: "Action performed by utterance" }, { left: "Face-threatening act", right: "Challenge to social standing" }], correctAnswer: "[0,1,2,3]", explanation: "Each concept is central to pragmatics." },
          { type: "CHECKBOX", question: "Select all correct pragmatic analyses:", options: ["'Some agree' implicates 'not all agree'", "'She realized the truth' presupposes the truth existed", "'I'll be there' is a commissive speech act", "'Close it!' uses positive politeness"], correctAnswer: "[0,1,2]", explanation: "'Close it!' is bald on-record, not positive politeness. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / by / implicature / flouting / maxim / of / relevance / was / generated", correctAnswer: "The implicature was generated,by flouting the maxim of relevance", explanation: "Flouting maxims generates implicatures." },
          { type: "SPEECH", question: "Some members of the committee expressed reservations about the proposal, which, in diplomatic terms, suggests that the opposition was far more widespread than officially acknowledged.", correctAnswer: "Some members of the committee expressed reservations about the proposal, which, in diplomatic terms, suggests that the opposition was far more widespread than officially acknowledged.", language: "en", hint: "Use scalar implicature and hedging to convey a diplomatic message" },
          { type: "SPEECH", question: "I don't mean to overstep, but might I suggest that we reconsider the timeline before proceeding?", correctAnswer: "I don't mean to overstep, but might I suggest that we reconsider the timeline before proceeding?", language: "en", hint: "Make a suggestion using layered negative politeness strategies" },
          { type: "SPEECH", question: "She came to appreciate the complexity of the issue only after she had already committed to a position.", correctAnswer: "She came to appreciate the complexity of the issue only after she had already committed to a position.", language: "en", hint: "Use factive and change-of-state presuppositions" },
        ]
      },
    ]
  },
  {
    title: "Rhetoric & Persuasion",
    lessons: [
      {
        title: "Classical Rhetorical Devices",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields.' What device is this?", options: ["Anaphora", "Epistrophe", "Chiasmus", "Litotes"], correctAnswer: "0", explanation: "Anaphora = repetition of a word/phrase at the beginning of successive clauses ('we shall fight')." },
          { type: "MCQ", question: "'Ask not what your country can do for you; ask what you can do for your country.' What device?", options: ["Chiasmus", "Anaphora", "Epistrophe", "Synecdoche"], correctAnswer: "0", explanation: "Chiasmus = reversed parallel structure: ABBA pattern (country->you / you->country)." },
          { type: "MCQ", question: "'It's not rocket science.' What rhetorical figure?", options: ["Litotes", "Hyperbole", "Metonymy", "Zeugma"], correctAnswer: "0", explanation: "Litotes = understatement through negation of the opposite: 'not rocket science' = simple." },
          { type: "MCQ", question: "'The pen is mightier than the sword.' What device?", options: ["Metonymy", "Synecdoche", "Metaphor", "Simile"], correctAnswer: "0", explanation: "Metonymy = substituting a related concept: 'pen' = writing/diplomacy; 'sword' = military force." },
          { type: "TRUE_FALSE", question: "True or False: 'Epistrophe' is the repetition of a word at the END of successive clauses.", correctAnswer: "true", explanation: "Epistrophe = end repetition. E.g., 'government of the people, by the people, for the people.'" },
          { type: "TRUE_FALSE", question: "True or False: 'Zeugma' occurs when one word governs two or more other words in different senses.", correctAnswer: "true", explanation: "Zeugma: 'She broke his car and his heart' - 'broke' governs both objects in different senses." },
          { type: "FILL_BLANK", question: "Complete: 'It was the best of times, it was the worst of times' uses the device of ___.", correctAnswer: "antithesis", explanation: "Antithesis = contrasting ideas in parallel structure." },
          { type: "FILL_BLANK", question: "Complete: 'All hands on deck' uses ___ (part representing the whole).", correctAnswer: "synecdoche", explanation: "Synecdoche = part for whole: 'hands' = workers/sailors." },
          { type: "FILL_BLANK", question: "Complete: 'I came, I saw, I conquered' uses ___ (omission of conjunctions).", correctAnswer: "asyndeton", explanation: "Asyndeton = omission of conjunctions for dramatic effect." },
          { type: "MATCHING", question: "Match the rhetorical device with its example:", options: [{ left: "Anaphora", right: "We shall fight...we shall fight...we shall fight" }, { left: "Chiasmus", right: "By day the frock, by night the frock" }, { left: "Litotes", right: "He's no genius" }, { left: "Hyperbole", right: "I've told you a million times" }], correctAnswer: "[0,1,2,3]", explanation: "Each device serves a different rhetorical purpose." },
          { type: "CHECKBOX", question: "Select all examples of parallelism:", options: ["Like father, like son", "No pain, no gain", "Out of sight, out of mind", "She ran quickly to the store"], correctAnswer: "[0,1,2]", explanation: "The first three use parallel structure. The last is a simple sentence." },
          { type: "ORDERING", question: "Put in order: of / the / government / people / by / the / for / the / people / people", correctAnswer: "Government of the people,by the people,for the people", explanation: "Epistrophe: repetition of 'the people' at clause ends." },
          { type: "SPEECH", question: "We must confront this challenge, we must embrace this opportunity, and we must seize this moment.", correctAnswer: "We must confront this challenge, we must embrace this opportunity, and we must seize this moment.", language: "en", hint: "Use anaphora for rhetorical emphasis" },
          { type: "SPEECH", question: "It was not a small setback; it was a catastrophic failure of epic proportions.", correctAnswer: "It was not a small setback; it was a catastrophic failure of epic proportions.", language: "en", hint: "Use antithesis to contrast two opposing ideas" },
        ]
      },
      {
        title: "Advanced Argumentation & Persuasive Strategy",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which Aristotelian appeal uses emotion to persuade?", options: ["Pathos", "Ethos", "Logos", "Mythos"], correctAnswer: "0", explanation: "Pathos = emotional appeal. Ethos = credibility. Logos = logic." },
          { type: "MCQ", question: "'As a doctor with 20 years of experience, I recommend this treatment.' What appeal?", options: ["Ethos", "Pathos", "Logos", "Kairos"], correctAnswer: "0", explanation: "Ethos = appeal to the speaker's credibility/authority." },
          { type: "MCQ", question: "'The data shows a 47% increase in efficiency.' What appeal?", options: ["Logos", "Pathos", "Ethos", "Kairos"], correctAnswer: "0", explanation: "Logos = logical/rational appeal using evidence and data." },
          { type: "MCQ", question: "What is 'kairos' in rhetoric?", options: ["Appeal to timeliness/opportunity", "Emotional appeal", "Logical argument", "Credibility"], correctAnswer: "0", explanation: "Kairos = the opportune moment; timing as a persuasive element." },
          { type: "TRUE_FALSE", question: "True or False: A 'concession' strengthens an argument by acknowledging opposing views before refuting them.", correctAnswer: "true", explanation: "Concession + refutation = powerful persuasive strategy." },
          { type: "TRUE_FALSE", question: "True or False: 'A fortiori' arguments reason from the lesser to the greater.", correctAnswer: "true", explanation: "A fortiori: 'If X is true for the weaker case, it's certainly true for the stronger.'" },
          { type: "FILL_BLANK", question: "Complete: The strategy of acknowledging a counterargument and then demonstrating its weakness is called ___ and refutation.", correctAnswer: "concession", explanation: "Concession-refutation = a classic persuasive strategy." },
          { type: "FILL_BLANK", question: "Complete: The rhetorical device of presenting only two options when more exist is called a false ___.", correctAnswer: "dilemma", explanation: "False dilemma = fallacious persuasive technique." },
          { type: "FILL_BLANK", question: "Complete: An argument that reasons by drawing an analogy between two similar cases uses ___ reasoning.", correctAnswer: "analogical", explanation: "Analogical reasoning = persuading by comparison." },
          { type: "MATCHING", question: "Match the persuasive concept with its description:", options: [{ left: "Ethos", right: "Credibility/authority" }, { left: "Pathos", right: "Emotional appeal" }, { left: "Logos", right: "Logical reasoning" }, { left: "Kairos", right: "Timely opportunity" }], correctAnswer: "[0,1,2,3]", explanation: "These are the core elements of Aristotelian rhetoric." },
          { type: "CHECKBOX", question: "Select all valid persuasive strategies:", options: ["Presenting statistical evidence to support a claim", "Acknowledging opposing views before refuting them", "Appealing to shared values and principles", "Attacking the character of the opposing speaker"], correctAnswer: "[0,1,2]", explanation: "Attacking character = ad hominem fallacy, not a valid strategy. The others are legitimate." },
          { type: "ORDERING", question: "Put in order: the / conceded / author / the / point / then / proceeded / to / refute / it", correctAnswer: "The author conceded the point,then proceeded to refute it", explanation: "Concession followed by refutation." },
          { type: "SPEECH", question: "While it is true that the initial investment is substantial, the long-term returns far outweigh the upfront costs, as the data unequivocally demonstrates.", correctAnswer: "While it is true that the initial investment is substantial, the long-term returns far outweigh the upfront costs, as the data unequivocally demonstrates.", language: "en", hint: "Use concession and logos to build a persuasive argument" },
          { type: "SPEECH", question: "As someone who has dedicated three decades to this field, I can assure you that the evidence overwhelmingly supports this course of action.", correctAnswer: "As someone who has dedicated three decades to this field, I can assure you that the evidence overwhelmingly supports this course of action.", language: "en", hint: "Combine ethos and logos for maximum persuasive impact" },
        ]
      },
      {
        title: "Module 3 Review: Rhetoric & Persuasion",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'We shall never surrender, we shall never give up, we shall never falter.' What device?", options: ["Anaphora", "Epistrophe", "Chiasmus", "Litotes"], correctAnswer: "0", explanation: "Anaphora = repetition at the beginning ('we shall never')." },
          { type: "MCQ", question: "'With great power comes great responsibility.' What structure?", options: ["Chiasmus", "Anaphora", "Epistrophe", "Asyndeton"], correctAnswer: "0", explanation: "Chiasmus = reversed parallel: power->responsibility / responsibility->power pattern." },
          { type: "MCQ", question: "'I am not unmoved by your plea.' What figure of speech?", options: ["Litotes", "Hyperbole", "Metonymy", "Synecdoche"], correctAnswer: "0", explanation: "Litotes = understatement through double negation." },
          { type: "MCQ", question: "'The White House issued a statement.' What device?", options: ["Metonymy", "Synecdoche", "Metaphor", "Simile"], correctAnswer: "0", explanation: "Metonymy: 'White House' = the President/administration." },
          { type: "TRUE_FALSE", question: "True or False: 'Kairos' refers to the strategic timing of an argument.", correctAnswer: "true", explanation: "Kairos = the opportune moment for persuasion." },
          { type: "TRUE_FALSE", question: "True or False: 'Polysyndeton' is the deliberate use of multiple conjunctions.", correctAnswer: "true", explanation: "Polysyndeton = excessive conjunctions: 'and...and...and' for emphasis." },
          { type: "FILL_BLANK", question: "Complete: 'The pen is mightier than the sword' is an example of ___.", correctAnswer: "metonymy", explanation: "Pen = writing/diplomacy; sword = military force." },
          { type: "FILL_BLANK", question: "Complete: An appeal to the audience's emotions is called ___.", correctAnswer: "pathos", explanation: "Pathos = emotional persuasion." },
          { type: "FILL_BLANK", question: "Complete: 'I have a dream... I have a dream...' uses ___ for rhetorical effect.", correctAnswer: "epizeuxis", explanation: "Epizeuxis = immediate repetition of a word for emphasis." },
          { type: "MATCHING", question: "Match the device with its function:", options: [{ left: "Anaphora", right: "Builds momentum" }, { left: "Chiasmus", right: "Creates memorable contrast" }, { left: "Litotes", right: "Emphasizes through understatement" }, { left: "Concession", right: "Strengthens by acknowledging opposition" }], correctAnswer: "[0,1,2,3]", explanation: "Each device serves a specific rhetorical function." },
          { type: "CHECKBOX", question: "Select all correct rhetorical analyses:", options: ["'Not bad' is litotes meaning 'good'", "'The Crown' referring to the monarchy is metonymy", "'He has the heart of a lion' is metaphor", "'She ran fast and he ran faster' is chiasmus"], correctAnswer: "[0,1,2]", explanation: "'She ran fast and he ran faster' is parallelism, not chiasmus. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / used / speaker / to / kairos / maximum / rhetorical / effect", correctAnswer: "The speaker used kairos,to maximum rhetorical effect", explanation: "Kairos = timing as persuasion." },
          { type: "SPEECH", question: "We must act now, we must act decisively, and we must act together, for the future of our children depends on the choices we make today.", correctAnswer: "We must act now, we must act decisively, and we must act together, for the future of our children depends on the choices we make today.", language: "en", hint: "Use anaphora and pathos for a persuasive call to action" },
          { type: "SPEECH", question: "It is not that the proposal lacks merit; rather, it is that the timing could not be more inopportune.", correctAnswer: "It is not that the proposal lacks merit; rather, it is that the timing could not be more inopportune.", language: "en", hint: "Use concession and litotes to deliver a diplomatic objection" },
          { type: "SPEECH", question: "Those who have the privilege of education also bear the responsibility to use it for the betterment of society.", correctAnswer: "Those who have the privilege of education also bear the responsibility to use it for the betterment of society.", language: "en", hint: "Use chiasmus-like parallelism for rhetorical impact" },
        ]
      },
    ]
  },
  {
    title: "Stylistics & Register Manipulation",
    lessons: [
      {
        title: "Stylistic Variation & Code-Switching",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The empirical evidence substantiates the hypothesis' vs 'The data backs up the idea.' What's the difference?", options: ["Register (formal vs informal)", "Meaning", "Grammar", "No difference"], correctAnswer: "0", explanation: "Same meaning, different register: formal academic vs informal conversational." },
          { type: "MCQ", question: "What is 'code-switching'?", options: ["Alternating between language varieties or registers", "Changing languages entirely", "Using code words", "Writing in cipher"], correctAnswer: "0", explanation: "Code-switching = shifting between registers, dialects, or languages within a conversation." },
          { type: "MCQ", question: "'The aforementioned methodology was subsequently implemented.' What stylistic feature?", options: ["Elevated/legalese register", "Informal register", "Colloquial speech", "Slang"], correctAnswer: "0", explanation: "'Aforementioned', 'subsequently' = elevated, formal, almost legalistic register." },
          { type: "MCQ", question: "Which factor does NOT typically influence register choice?", options: ["The speaker's mood", "The social context", "The relationship between participants", "The communicative purpose"], correctAnswer: "0", explanation: "Register is determined by context, participants, and purpose, not merely mood." },
          { type: "TRUE_FALSE", question: "True or False: 'Diglossia' refers to a situation where two varieties of a language are used for different functions.", correctAnswer: "true", explanation: "Diglossia: high variety (formal) and low variety (informal) used in different contexts." },
          { type: "TRUE_FALSE", question: "True or False: Register shifting within a single conversation is always considered inappropriate.", correctAnswer: "false", explanation: "Strategic register shifting is a sophisticated communicative skill, especially at C2." },
          { type: "FILL_BLANK", question: "Complete: The ability to shift between formal and informal registers is called register ___.", correctAnswer: "flexibility", explanation: "Register flexibility = a key C2-level pragmatic competence." },
          { type: "FILL_BLANK", question: "Complete: In a courtroom, lawyers switch between technical legal jargon and simplified language for the ___.", correctAnswer: "jury", explanation: "Strategic code-switching between technical and accessible registers." },
          { type: "FILL_BLANK", question: "Complete: 'The guy's super smart' uses a ___ register compared to 'The individual is highly intelligent.'", correctAnswer: "colloquial", explanation: "Colloquial/informal vs formal register." },
          { type: "MATCHING", question: "Match the register with its typical context:", options: [{ left: "Frozen", right: "Legal contracts" }, { left: "Formal", right: "Academic papers" }, { left: "Consultative", right: "Professional meetings" }, { left: "Casual", right: "Friends chatting" }], correctAnswer: "[0,1,2,3]", explanation: "Each register is appropriate for specific contexts." },
          { type: "CHECKBOX", question: "Select all examples of appropriate register shifting:", options: ["A professor using simplified language when explaining to undergraduates", "A lawyer using technical terms in a brief but plain language with a client", "A doctor using medical jargon when consulting with a specialist", "Using slang in a job interview"], correctAnswer: "[0,1,2]", explanation: "Using slang in a job interview is register-inappropriate. The others are strategic shifts." },
          { type: "ORDERING", question: "Put in order: the / speaker / shifted / from / to / register / formal / informal / mid-conversation", correctAnswer: "The speaker shifted,from formal to informal register,mid-conversation", explanation: "Register shifting within conversation." },
          { type: "SPEECH", question: "While the technical specifications of the algorithm are quite complex, the basic idea is pretty straightforward, and I'll explain it in plain English.", correctAnswer: "While the technical specifications of the algorithm are quite complex, the basic idea is pretty straightforward, and I'll explain it in plain English.", language: "en", hint: "Demonstrate deliberate register shifting from technical to accessible" },
          { type: "SPEECH", question: "The aforesaid provisions shall henceforth be applicable to all parties hereto, without prejudice to any preexisting obligations.", correctAnswer: "The aforesaid provisions shall henceforth be applicable to all parties hereto, without prejudice to any preexisting obligations.", language: "en", hint: "Use formal legal register (frozen style)" },
        ]
      },
      {
        title: "Genre Conventions & Textual Architecture",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Which feature is characteristic of academic journal articles but NOT of newspaper opinion pieces?", options: ["Peer review methodology", "Authorial voice", "Persuasive argument", "Current topic"], correctAnswer: "0", explanation: "Peer review methodology is specific to academic journals." },
          { type: "MCQ", question: "'In conclusion, the findings suggest...' What genre convention is this?", options: ["Academic discourse marker", "Narrative device", "Poetic convention", "Legal formula"], correctAnswer: "0", explanation: "Standard academic convention for signaling conclusions." },
          { type: "MCQ", question: "What is the typical structure of a scientific research article?", options: ["IMRaD (Introduction, Methods, Results, Discussion)", "Beginning, middle, end", "Problem, solution, evaluation", "Claim, evidence, warrant"], correctAnswer: "0", explanation: "IMRaD = standard scientific article structure." },
          { type: "MCQ", question: "'Dear Sir or Madam... Yours faithfully' belongs to which genre?", options: ["Formal business correspondence", "Academic writing", "Creative writing", "Technical documentation"], correctAnswer: "0", explanation: "Standard formal letter genre conventions." },
          { type: "TRUE_FALSE", question: "True or False: 'Intertextuality' refers to how texts reference or relate to other texts.", correctAnswer: "true", explanation: "Intertextuality = the shaping of a text's meaning by other texts." },
          { type: "TRUE_FALSE", question: "True or False: Genre conventions are fixed and cannot be creatively subverted.", correctAnswer: "false", explanation: "C2-level writers can strategically subvert genre conventions for effect." },
          { type: "FILL_BLANK", question: "Complete: An ___ in an academic article summarizes the research and findings in 150-250 words.", correctAnswer: "abstract", explanation: "Abstract = standard academic genre convention." },
          { type: "FILL_BLANK", question: "Complete: The use of 'Once upon a time' signals the ___ of fairy tales.", correctAnswer: "genre", explanation: "Genre convention that immediately signals the text type." },
          { type: "FILL_BLANK", question: "Complete: 'The present study aims to...' is a conventional ___ phrase in academic writing.", correctAnswer: "signposting", explanation: "Signposting = guiding the reader through the text structure." },
          { type: "MATCHING", question: "Match the genre with its characteristic feature:", options: [{ left: "Academic article", right: "IMRaD structure" }, { left: "Opinion editorial", right: "Persuasive thesis" }, { left: "Technical manual", right: "Step-by-step instructions" }, { left: "Legal brief", right: "Case citation" }], correctAnswer: "[0,1,2,3]", explanation: "Each genre has distinctive structural conventions." },
          { type: "CHECKBOX", question: "Select all correct genre analyses:", options: ["Academic writing uses hedging to express caution", "News reports typically use the inverted pyramid structure", "Legal documents employ archaic vocabulary", "Poetry always follows strict metrical patterns"], correctAnswer: "[0,1,2]", explanation: "Poetry does NOT always follow strict meter (free verse exists). The others are correct." },
          { type: "ORDERING", question: "Put in order: the / follows / IMRaD / article / the / standard / structure", correctAnswer: "The article follows,the standard IMRaD structure", explanation: "IMRaD = academic article structure." },
          { type: "SPEECH", question: "The present study addresses a significant gap in the existing literature by examining the longitudinal effects of the intervention across diverse populations.", correctAnswer: "The present study addresses a significant gap in the existing literature by examining the longitudinal effects of the intervention across diverse populations.", language: "en", hint: "Use academic genre conventions to position research" },
          { type: "SPEECH", question: "Having presented the evidence, it is now incumbent upon this body to render a verdict that justice demands.", correctAnswer: "Having presented the evidence, it is now incumbent upon this body to render a verdict that justice demands.", language: "en", hint: "Use legal genre conventions in a closing argument" },
        ]
      },
      {
        title: "Module 4 Review: Stylistics & Register Manipulation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The data substantiates the aforementioned hypothesis' vs 'The numbers back up the idea we mentioned.' Difference?", options: ["Register", "Meaning", "Grammar", "No difference"], correctAnswer: "0", explanation: "Same meaning, different register: formal academic vs informal." },
          { type: "MCQ", question: "What is 'code-switching'?", options: ["Shifting between language varieties or registers", "Changing languages permanently", "Using secret codes", "Translating between languages"], correctAnswer: "0", explanation: "Code-switching = alternating between registers or varieties." },
          { type: "MCQ", question: "What does 'IMRaD' stand for?", options: ["Introduction, Methods, Results, Discussion", "Ideas, Methods, Results, Data", "Introduction, Models, Research, Data", "Investigation, Methods, Reports, Discussion"], correctAnswer: "0", explanation: "IMRaD = standard scientific article structure." },
          { type: "MCQ", question: "'Intertextuality' refers to:", options: ["How texts reference other texts", "Writing between lines", "International text exchange", "Text formatting"], correctAnswer: "0", explanation: "Intertextuality = texts referencing/relating to other texts." },
          { type: "TRUE_FALSE", question: "True or False: 'Diglossia' describes coexistence of high and low language varieties.", correctAnswer: "true", explanation: "High variety (formal) and low variety (informal) in different contexts." },
          { type: "TRUE_FALSE", question: "True or False: Genre conventions can be strategically subverted for creative effect.", correctAnswer: "true", explanation: "C2-level mastery includes knowing when to break conventions." },
          { type: "FILL_BLANK", question: "Complete: The ___ of a research article summarizes the entire study in a brief paragraph.", correctAnswer: "abstract", explanation: "Abstract = standard academic convention." },
          { type: "FILL_BLANK", question: "Complete: 'The findings, while preliminary, appear to corroborate...' demonstrates academic ___.", correctAnswer: "hedging", explanation: "Hedging = cautious academic style." },
          { type: "FILL_BLANK", question: "Complete: A speaker who shifts from formal presentation style to casual banter during a coffee break demonstrates register ___.", correctAnswer: "flexibility", explanation: "Register flexibility = C2 pragmatic skill." },
          { type: "MATCHING", question: "Match the concept with its definition:", options: [{ left: "Register", right: "Level of formality" }, { left: "Code-switching", right: "Shifting varieties" }, { left: "Genre", right: "Text type with conventions" }, { left: "Intertextuality", right: "Cross-text references" }], correctAnswer: "[0,1,2,3]", explanation: "Each concept is central to stylistics." },
          { type: "CHECKBOX", question: "Select all appropriate register choices:", options: ["Using technical terminology in a peer-reviewed article", "Simplifying language when explaining to non-specialists", "Using formal register in a job application letter", "Using slang in a legal document"], correctAnswer: "[0,1,2]", explanation: "Slang in a legal document is register-inappropriate. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / employed / author / deliberate / to / subvert / genre / conventions / effect", correctAnswer: "The author employed deliberate genre subversion,to effect", explanation: "Strategic genre manipulation." },
          { type: "SPEECH", question: "Notwithstanding the limitations inherent in the study design, the results nonetheless lend considerable support to the theoretical framework.", correctAnswer: "Notwithstanding the limitations inherent in the study design, the results nonetheless lend considerable support to the theoretical framework.", language: "en", hint: "Use academic hedging and concession in a research discussion" },
          { type: "SPEECH", question: "Look, the bottom line is pretty simple: we either act now or we face the consequences later.", correctAnswer: "Look, the bottom line is pretty simple: we either act now or we face the consequences later.", language: "en", hint: "Switch to a direct, informal register for impact" },
          { type: "SPEECH", question: "The aforesaid provisions notwithstanding, the parties hereto reserve the right to seek equitable relief in the event of material breach.", correctAnswer: "The aforesaid provisions notwithstanding, the parties hereto reserve the right to seek equitable relief in the event of material breach.", language: "en", hint: "Use formal legal register with appropriate terminology" },
        ]
      },
    ]
  },
  {
    title: "Advanced Academic Writing Mastery",
    lessons: [
      {
        title: "Thesis Development & Argument Architecture",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What distinguishes a C2-level thesis statement from a C1-level one?", options: ["Nuanced, qualified claim with scope and significance", "Simple statement of topic", "Direct yes/no position", "List of points to cover"], correctAnswer: "0", explanation: "C2 thesis: nuanced, acknowledges complexity, specifies scope, and establishes significance." },
          { type: "MCQ", question: "'While X argues A, this paper contends that B, particularly in the context of C.' What thesis structure?", options: ["Concession-counterargument", "Simple claim", "Question-based", "Descriptive"], correctAnswer: "0", explanation: "Concession-counterargument thesis: acknowledges opposing view before presenting own position." },
          { type: "MCQ", question: "What is a 'roadmap' in academic writing?", options: ["Preview of the paper's structure", "A map showing research locations", "A summary of findings", "A bibliography"], correctAnswer: "0", explanation: "Roadmap = preview of how the argument will unfold (structure of the paper)." },
          { type: "MCQ", question: "'This study challenges the prevailing assumption that...' What rhetorical move?", options: ["Establishing a niche", "Claiming centrality", "Reviewing literature", "Stating methodology"], correctAnswer: "0", explanation: "Swales' CARS model: 'establishing a niche' by challenging existing assumptions." },
          { type: "TRUE_FALSE", question: "True or False: A strong thesis should be debatable, not a statement of fact.", correctAnswer: "true", explanation: "A thesis must be arguable; facts don't needè®ºè¯." },
          { type: "TRUE_FALSE", question: "True or False: 'Toulmin's model of argumentation' includes claim, data, warrant, backing, qualifier, and rebuttal.", correctAnswer: "true", explanation: "Toulmin's six components of argument structure." },
          { type: "FILL_BLANK", question: "Complete: In the CARS model, 'occupying the ___' means presenting your contribution to fill the identified gap.", correctAnswer: "niche", explanation: "CARS model: establishing territory â†’ establishing a niche â†’ occupying the niche." },
          { type: "FILL_BLANK", question: "Complete: A thesis that includes a ___ acknowledges its own limitations or conditions.", correctAnswer: "qualifier", explanation: "Qualifier (Toulmin): 'typically', 'in most cases', 'under certain conditions'." },
          { type: "FILL_BLANK", question: "Complete: The ___ of an argument connects the evidence (data) to the claim.", correctAnswer: "warrant", explanation: "Warrant (Toulmin): the reasoning that links data to claim." },
          { type: "MATCHING", question: "Match the Toulmin element with its role:", options: [{ left: "Claim", right: "The conclusion/position" }, { left: "Data", right: "The evidence" }, { left: "Warrant", right: "The logical bridge" }, { left: "Rebuttal", right: "The counterargument" }], correctAnswer: "[0,1,2,3]", explanation: "Each element is essential to a complete argument." },
          { type: "CHECKBOX", question: "Select all features of a C2-level thesis:", options: ["Makes a nuanced, qualified claim", "Specifies the scope and context", "Acknowledges complexity and counterarguments", "States an obvious, universally accepted fact"], correctAnswer: "[0,1,2]", explanation: "A C2 thesis should NOT state obvious facts. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / thesis / established / the / by / challenging / niche / prevailing / assumptions", correctAnswer: "The thesis established the niche,by challenging the prevailing assumptions", explanation: "CARS model: establishing a niche." },
          { type: "SPEECH", question: "While conventional wisdom holds that economic growth necessarily leads to environmental degradation, this paper argues that under specific regulatory frameworks, the two objectives can be mutually reinforcing.", correctAnswer: "While conventional wisdom holds that economic growth necessarily leads to environmental degradation, this paper argues that under specific regulatory frameworks, the two objectives can be mutually reinforcing.", language: "en", hint: "Construct a nuanced C2-level thesis with concession" },
          { type: "SPEECH", question: "This study challenges the widely accepted assumption that early intervention invariably produces superior outcomes, proposing instead that developmental readiness may be a more significant predictor of success.", correctAnswer: "This study challenges the widely accepted assumption that early intervention invariably produces superior outcomes, proposing instead that developmental readiness may be a more significant predictor of success.", language: "en", hint: "Challenge prevailing assumptions in a research thesis" },
        ]
      },
      {
        title: "Literature Review & Synthesis",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What distinguishes synthesis from summary in a literature review?", options: ["Synthesis integrates and connects studies; summary lists them", "They are the same", "Summary is more analytical", "Synthesis is shorter"], correctAnswer: "0", explanation: "Synthesis = identifying patterns, connections, and gaps across studies." },
          { type: "MCQ", question: "'Smith (2020) found X, whereas Jones (2021) demonstrated Y.' What synthesis technique?", options: ["Contrasting findings", "Aggregating results", "Chronological ordering", "Methodological comparison"], correctAnswer: "0", explanation: "Contrasting: highlighting disagreement or different findings." },
          { type: "MCQ", question: "'Several studies converge on the conclusion that...' What synthesis move?", options: ["Identifying consensus", "Highlighting gaps", "Contrasting methods", "Chronological review"], correctAnswer: "0", explanation: "Convergence = identifying areas of agreement across studies." },
          { type: "MCQ", question: "What is a 'thematic' literature review?", options: ["Organized by themes/topics rather than by individual studies", "Chronological", "Methodological", "Theoretical"], correctAnswer: "0", explanation: "Thematic review = grouping studies by common themes." },
          { type: "TRUE_FALSE", question: "True or False: 'Smith (2019) argues X. Jones (2020) also supports X.' is synthesis, not just summary.", correctAnswer: "true", explanation: "Connecting two studies to show agreement is synthesis." },
          { type: "TRUE_FALSE", question: "True or False: A literature review should only include studies that support your thesis.", correctAnswer: "false", explanation: "A good literature review includes conflicting evidence and addresses counterarguments." },
          { type: "FILL_BLANK", question: "Complete: The literature review revealed a significant ___ in understanding the long-term effects.", correctAnswer: "gap", explanation: "Gap = area not yet researched." },
          { type: "FILL_BLANK", question: "Complete: 'Building on the work of Smith (2018), this study extends the analysis to...' uses a ___ strategy.", correctAnswer: "gap-filling", explanation: "Gap-filling = extending existing research." },
          { type: "FILL_BLANK", question: "Complete: 'Despite extensive research on X, little attention has been paid to Y' identifies a research ___.", correctAnswer: "gap", explanation: "Standard formula for identifying a gap in the literature." },
          { type: "MATCHING", question: "Match the synthesis technique with its purpose:", options: [{ left: "Convergence", right: "Showing agreement" }, { left: "Contrast", right: "Highlighting disagreement" }, { left: "Chronology", right: "Tracing development" }, { left: "Gap identification", right: "Justifying new research" }], correctAnswer: "[0,1,2,3]", explanation: "Each technique serves a different purpose in a literature review." },
          { type: "CHECKBOX", question: "Select all correct synthesis sentences:", options: ["While Smith emphasizes X, Jones focuses on Y, suggesting a complementary rather than contradictory relationship", "The consensus across multiple studies points to a robust effect", "Despite methodological differences, the findings converge on a common conclusion", "All researchers agree on every aspect of the theory"], correctAnswer: "[0,1,2]", explanation: "'All researchers agree on every aspect' is almost never true and shows poor synthesis. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / review / literature / revealed / a / significant / in / gap / understanding", correctAnswer: "The literature review revealed,a significant gap in understanding", explanation: "Identifying a research gap." },
          { type: "SPEECH", question: "While a substantial body of research has examined the short-term effects of the intervention, considerably less attention has been devoted to its long-term implications, a gap this study seeks to address.", correctAnswer: "While a substantial body of research has examined the short-term effects of the intervention, considerably less attention has been devoted to its long-term implications, a gap this study seeks to address.", language: "en", hint: "Synthesize literature and identify a research gap" },
          { type: "SPEECH", question: "The findings across these studies, despite considerable methodological variation, converge on a remarkably consistent conclusion regarding the efficacy of the approach.", correctAnswer: "The findings across these studies, despite considerable methodological variation, converge on a remarkably consistent conclusion regarding the efficacy of the approach.", language: "en", hint: "Synthesize converging findings from diverse studies" },
        ]
      },
      {
        title: "Module 5 Review: Advanced Academic Writing Mastery",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'While conventional wisdom suggests X, emerging evidence indicates Y.' What thesis type?", options: ["Concession-counterargument", "Simple claim", "Descriptive", "Methodological"], correctAnswer: "0", explanation: "Acknowledging conventional view before presenting new position." },
          { type: "MCQ", question: "What is the 'warrant' in Toulmin's model?", options: ["The logical bridge between data and claim", "The evidence itself", "The conclusion", "The counterargument"], correctAnswer: "0", explanation: "Warrant = the reasoning that connects evidence to the claim." },
          { type: "MCQ", question: "What distinguishes synthesis from mere summary?", options: ["Synthesis connects and integrates studies", "They are the same", "Summary is more analytical", "Synthesis lists individual studies"], correctAnswer: "0", explanation: "Synthesis = identifying patterns, connections, and gaps." },
          { type: "MCQ", question: "'Despite extensive research, little attention has been paid to...' What move?", options: ["Gap identification", "Consensus building", "Chronological review", "Methodological comparison"], correctAnswer: "0", explanation: "Standard gap identification formula." },
          { type: "TRUE_FALSE", question: "True or False: A C2-level thesis makes a nuanced, qualified claim.", correctAnswer: "true", explanation: "C2 thesis = nuanced, complex, qualified." },
          { type: "TRUE_FALSE", question: "True or False: 'Occupying the niche' in CARS means presenting your contribution.", correctAnswer: "true", explanation: "CARS: territory â†’ niche â†’ occupying the niche (your contribution)." },
          { type: "FILL_BLANK", question: "Complete: A ___ in Toulmin's model limits the scope of the claim (e.g., 'in most cases').", correctAnswer: "qualifier", explanation: "Qualifier = limits/modifies the strength of the claim." },
          { type: "FILL_BLANK", question: "Complete: 'The findings converge on a ___ conclusion' indicates agreement across studies.", correctAnswer: "consistent", explanation: "Convergence = agreement." },
          { type: "FILL_BLANK", question: "Complete: 'Building on the work of X, this study ___ the analysis to new contexts.'", correctAnswer: "extends", explanation: "Extending = gap-filling strategy." },
          { type: "MATCHING", question: "Match the academic concept with its function:", options: [{ left: "Thesis", right: "Central argument" }, { left: "Warrant", right: "Logical connection" }, { left: "Synthesis", right: "Integration of studies" }, { left: "Gap", right: "Unexplored area" }], correctAnswer: "[0,1,2,3]", explanation: "Each concept is central to academic argumentation." },
          { type: "CHECKBOX", question: "Select all correct academic writing practices:", options: ["Acknowledging limitations of the study", "Synthesizing sources rather than summarizing them", "Including counterarguments and addressing them", "Citing only sources that support your position"], correctAnswer: "[0,1,2]", explanation: "Citing only supporting sources shows poor scholarship. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / warrant / connects / the / data / to / the / claim", correctAnswer: "The warrant connects,the data to the claim", explanation: "Warrant = bridge between data and claim." },
          { type: "SPEECH", question: "This study extends the theoretical framework proposed by Smith (2019) by incorporating longitudinal data that challenges the assumption of linear developmental trajectories.", correctAnswer: "This study extends the theoretical framework proposed by Smith (2019) by incorporating longitudinal data that challenges the assumption of linear developmental trajectories.", language: "en", hint: "Position your research as extending and challenging existing work" },
          { type: "SPEECH", question: "Although the evidence is not entirely conclusive, the preponderance of data suggests that the intervention produces meaningful effects, particularly among vulnerable populations.", correctAnswer: "Although the evidence is not entirely conclusive, the preponderance of data suggests that the intervention produces meaningful effects, particularly among vulnerable populations.", language: "en", hint: "Present a qualified conclusion with appropriate academic hedging" },
          { type: "SPEECH", question: "The methodological diversity across these studies, far from undermining the findings, actually strengthens the generalizability of the conclusions.", correctAnswer: "The methodological diversity across these studies, far from undermining the findings, actually strengthens the generalizability of the conclusions.", language: "en", hint: "Turn a potential weakness into a strength in academic argumentation" },
        ]
      },
    ]
  },
  {
    title: "Nuance, Connotation & Semantic Precision",
    lessons: [
      {
        title: "Near-Synonyms & Semantic Distinctions",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What's the nuanced difference between 'slim' and 'skinny'?", options: ["Slim is positive; skinny can be negative", "They are identical", "Skinny is more formal", "Slim refers only to objects"], correctAnswer: "0", explanation: "Slim = attractive thinness (positive); skinny = potentially unattractive thinness (can be negative)." },
          { type: "MCQ", question: "'The evidence ___ that the theory needs revision.' (stronger than 'suggests')", options: ["indicates", "implies", "hints", "whispers"], correctAnswer: "0", explanation: "'Indicates' is stronger than 'suggests' but weaker than 'proves'." },
          { type: "MCQ", question: "What's the difference between 'envy' and 'jealousy'?", options: ["Envy = wanting what others have; jealousy = fear of losing what you have", "They are identical", "Jealousy = wanting what others have", "No difference in modern English"], correctAnswer: "0", explanation: "Envy = desire for what someone else has. Jealousy = fear of losing something/someone to a rival." },
          { type: "MCQ", question: "'The government ___ the new policy.' Which verb implies reluctance?", options: ["implemented", "imposed", "introduced", "launched"], correctAnswer: "1", explanation: "'Imposed' suggests the policy was forced on unwilling parties." },
          { type: "TRUE_FALSE", question: "True or False: 'Semantic prosody' refers to the positive or negative associations that a word accumulates from its typical contexts.", correctAnswer: "true", explanation: "E.g., 'cause' has negative prosody (cause problems, cause death) despite being neutral." },
          { type: "TRUE_FALSE", question: "True or False: 'Frugal' and 'stingy' are exact synonyms.", correctAnswer: "false", explanation: "Frugal = prudent with money (positive); stingy = unwilling to spend (negative)." },
          { type: "FILL_BLANK", question: "Complete: 'She was ___ about her achievements' (modest) vs 'She was ___ about her achievements' (hiding them out of shame).", correctAnswer: "reticent", explanation: "Reticent = reserved/reluctant to speak. Modest = humble." },
          { type: "FILL_BLANK", question: "Complete: 'The policy had ___ effects' (unintended and negative) vs 'The policy had ___ effects' (unintended and positive).", correctAnswer: "adverse", explanation: "Adverse = negative unintended. Serendipitous = positive unintended." },
          { type: "FILL_BLANK", question: "Complete: 'He was ___ in his criticism' (harsh and direct) vs 'He was ___ in his criticism' (indirect and subtle).", correctAnswer: "unsparing", explanation: "Unsparing = harsh and merciless. Subtle = indirect." },
          { type: "MATCHING", question: "Match the word pair with its distinction:", options: [{ left: "Slim/Skinny", right: "Positive/Potentially negative" }, { left: "Frugal/Stingy", right: "Prudent/Unwilling to spend" }, { left: "Envy/Jealousy", right: "Wanting/Fear of losing" }, { left: "Impose/Implement", right: "Force on/Carry out" }], correctAnswer: "[0,1,2,3]", explanation: "Near-synonyms differ in connotation and nuance." },
          { type: "CHECKBOX", question: "Select all correct semantic distinctions:", options: ["'Assertive' is positive; 'aggressive' is negative", "'Curious' can mean eager to know OR strange", "'Notorious' means famous for something bad", "'Thrifty' and 'cheap' have the same connotation"], correctAnswer: "[0,1,2]", explanation: "'Thrifty' is positive; 'cheap' is negative. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / between / distinction / subtle / connotations / the / two / words / lies / in", correctAnswer: "The subtle distinction between the two words,lies in their connotations", explanation: "Near-synonyms differ in connotation." },
          { type: "SPEECH", question: "While the politician was famously frugal in his personal habits, his critics characterized him as stingy when it came to funding public services.", correctAnswer: "While the politician was famously frugal in his personal habits, his critics characterized him as stingy when it came to funding public services.", language: "en", hint: "Contrast positive and negative near-synonyms" },
          { type: "SPEECH", question: "The committee was reticent about disclosing the full extent of the findings, citing concerns about public panic.", correctAnswer: "The committee was reticent about disclosing the full extent of the findings, citing concerns about public panic.", language: "en", hint: "Use 'reticent' to convey reluctant withholding of information" },
        ]
      },
      {
        title: "Semantic Prosody & Collocational Range",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "Why does 'cause' typically collocate with negative words (cause death, cause problems)?", options: ["Negative semantic prosody", "Random chance", "Grammatical rule", "It doesn't"], correctAnswer: "0", explanation: "Semantic prosody: 'cause' has accumulated negative associations through usage." },
          { type: "MCQ", question: "'The findings ___ a need for further research.' Which verb has the strongest collocation?", options: ["underscore", "show", "indicate", "suggest"], correctAnswer: "0", explanation: "'Underscore' has the strongest collocation with 'need' in academic discourse." },
          { type: "MCQ", question: "What is 'collocational range'?", options: ["The variety of words a word typically co-occurs with", "The number of letters in a word", "The distance between words in a sentence", "Word frequency"], correctAnswer: "0", explanation: "Collocational range = the breadth of words a given word typically appears with." },
          { type: "MCQ", question: "'Commit' has negative prosody (commit a crime, commit suicide). Which positive collocation is an exception?", options: ["Commit to a relationship", "Commit murder", "Commit fraud", "Commit an error"], correctAnswer: "0", explanation: "'Commit to' is the positive exception in an otherwise negative pattern." },
          { type: "TRUE_FALSE", question: "True or False: 'Provide' has positive semantic prosody (provide help, provide support, provide evidence).", correctAnswer: "true", explanation: "'Provide' typically collocates with beneficial or constructive nouns." },
          { type: "TRUE_FALSE", question: "True or False: Semantic prosody is conscious and intentional.", correctAnswer: "false", explanation: "Semantic prosody is subconscious; speakers aren't usually aware of it." },
          { type: "FILL_BLANK", question: "Complete: '___ a risk' is the standard collocation (not 'make a risk').", correctAnswer: "Take", explanation: "'Take a risk' = fixed collocation." },
          { type: "FILL_BLANK", question: "Complete: '___ attention' collocates with 'pay' or 'draw' but NOT 'give' in formal contexts.", correctAnswer: "Pay", explanation: "'Pay attention' / 'draw attention' = standard collocations." },
          { type: "FILL_BLANK", question: "Complete: The word 'utter' has negative prosody: utter disaster, utter nonsense, utter ___.", correctAnswer: "failure", explanation: "'Utter' almost exclusively collocates with negative nouns." },
          { type: "MATCHING", question: "Match the verb with its prosody:", options: [{ left: "Cause", right: "Negative" }, { left: "Provide", right: "Positive" }, { left: "Commit", right: "Mostly negative" }, { left: "Foster", right: "Positive" }], correctAnswer: "[0,1,2,3]", explanation: "Each verb has characteristic semantic prosody." },
          { type: "CHECKBOX", question: "Select all correct collocations:", options: ["Make a decision", "Do a decision", "Take a risk", "Run a risk"], correctAnswer: "[0,2,3]", explanation: "'Do a decision' is wrong; should be 'make'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / verb / negative / semantic / has / prosody", correctAnswer: "The verb has,negative semantic prosody", explanation: "Semantic prosody = collocational tendency." },
          { type: "SPEECH", question: "The committee's decision to undertake a comprehensive review underscored the gravity of the allegations and the need for thorough investigation.", correctAnswer: "The committee's decision to undertake a comprehensive review underscored the gravity of the allegations and the need for thorough investigation.", language: "en", hint: "Use precise collocations in formal reporting" },
          { type: "SPEECH", question: "The policy, far from fostering innovation, effectively stifled creative approaches by imposing rigid bureaucratic constraints.", correctAnswer: "The policy, far from fostering innovation, effectively stifled creative approaches by imposing rigid bureaucratic constraints.", language: "en", hint: "Contrast positive and negative semantic prosody" },
        ]
      },
      {
        title: "Module 6 Review: Nuance, Connotation & Semantic Precision",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What distinguishes 'frugal' from 'stingy'?", options: ["Frugal is positive (prudent); stingy is negative", "They are identical", "Stingy is more formal", "Frugal refers to governments only"], correctAnswer: "0", explanation: "Frugal = positive prudence; stingy = negative unwillingness." },
          { type: "MCQ", question: "'The evidence ___ the need for action.' (strongest collocation)", options: ["underscores", "shows", "indicates", "hints at"], correctAnswer: "0", explanation: "'Underscores the need' = strongest academic collocation." },
          { type: "MCQ", question: "What is 'semantic prosody'?", options: ["Positive/negative associations from typical contexts", "Word pronunciation", "Grammar rules", "Sentence structure"], correctAnswer: "0", explanation: "Semantic prosody = the emotional charge a word carries from its typical usage." },
          { type: "MCQ", question: "'Cause' has which type of semantic prosody?", options: ["Negative", "Positive", "Neutral", "Mixed"], correctAnswer: "0", explanation: "'Cause' typically collocates with negative nouns." },
          { type: "TRUE_FALSE", question: "True or False: 'Envy' and 'jealousy' have different meanings.", correctAnswer: "true", explanation: "Envy = wanting what others have; jealousy = fear of losing what you have." },
          { type: "TRUE_FALSE", question: "True or False: 'Take a risk' and 'run a risk' are both correct collocations.", correctAnswer: "true", explanation: "Both are standard collocations with slightly different nuances." },
          { type: "FILL_BLANK", question: "Complete: '___ a crime' uses 'commit' due to negative semantic prosody.", correctAnswer: "Commit", explanation: "'Commit' collocates with negative acts." },
          { type: "FILL_BLANK", question: "Complete: 'She was ___ in her praise' (generous and warm) vs 'She was ___ in her praise' (limited and restrained).", correctAnswer: "lavish", explanation: "Lavish = generous; restrained = limited." },
          { type: "FILL_BLANK", question: "Complete: The ___ of 'utter' is almost exclusively negative: utter disaster, utter failure.", correctAnswer: "prosody", explanation: "Semantic prosody of 'utter' is negative." },
          { type: "MATCHING", question: "Match the concept with its definition:", options: [{ left: "Near-synonyms", right: "Words with similar but distinct meanings" }, { left: "Semantic prosody", right: "Collocational emotional tendency" }, { left: "Collocational range", right: "Breadth of typical co-occurrences" }, { left: "Connotation", right: "Associated meaning beyond literal" }], correctAnswer: "[0,1,2,3]", explanation: "Each concept is key to semantic precision." },
          { type: "CHECKBOX", question: "Select all correct semantic analyses:", options: ["'Assertive' is more positive than 'aggressive'", "'Provide' has positive semantic prosody", "'Utter' collocates with negative nouns", "'Make a research' is standard English"], correctAnswer: "[0,1,2]", explanation: "'Make research' is wrong; use 'conduct research'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / subtle / between / distinction / the / words / lies / in / their / connotations", correctAnswer: "The subtle distinction between the words,lies in their connotations", explanation: "Near-synonyms differ in connotation." },
          { type: "SPEECH", question: "While the report was careful not to assign blame directly, the language it employed unmistakably underscored the severity of the institutional failures.", correctAnswer: "While the report was careful not to assign blame directly, the language it employed unmistakably underscored the severity of the institutional failures.", language: "en", hint: "Use precise verbs with appropriate semantic prosody" },
          { type: "SPEECH", question: "The distinction between being frugal and being stingy is not merely semantic; it reflects a fundamental difference in attitude toward resource allocation.", correctAnswer: "The distinction between being frugal and being stingy is not merely semantic; it reflects a fundamental difference in attitude toward resource allocation.", language: "en", hint: "Discuss near-synonym distinctions with precision" },
          { type: "SPEECH", question: "The committee's decision to foster collaboration rather than impose directives proved instrumental in building trust across departments.", correctAnswer: "The committee's decision to foster collaboration rather than impose directives proved instrumental in building trust across departments.", language: "en", hint: "Contrast positive and negative verbs with different semantic prosody" },
        ]
      },
    ]
  },
  {
    title: "Idiomatic Mastery & Cultural References",
    lessons: [
      {
        title: "C2-Level Idioms & Figurative Language",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The proposal went up in smoke.' What does this mean?", options: ["It was completely destroyed/abandoned", "It was successful", "It was delayed", "It was approved"], correctAnswer: "0", explanation: "'Go up in smoke' = come to nothing, be destroyed or fail completely." },
          { type: "MCQ", question: "'She has a bee in her bonnet about environmental issues.' What does this mean?", options: ["She is obsessively preoccupied", "She is indifferent", "She is knowledgeable", "She is afraid"], correctAnswer: "0", explanation: "'Have a bee in one's bonnet' = be obsessively preoccupied with something." },
          { type: "MCQ", question: "'They decided to bite the bullet and proceed with the merger.' What does this mean?", options: ["Face a difficult situation with courage", "Eat something unpleasant", "Make a small investment", "Avoid the issue"], correctAnswer: "0", explanation: "'Bite the bullet' = face a painful or difficult situation bravely." },
          { type: "MCQ", question: "'The situation is a Catch-22.' What does this mean?", options: ["A paradoxical situation with no escape", "A simple problem", "A lucky break", "A win-win situation"], correctAnswer: "0", explanation: "Catch-22 = a no-win paradoxical situation (from Heller's novel)." },
          { type: "TRUE_FALSE", question: "True or False: 'The elephant in the room' refers to an obvious problem everyone ignores.", correctAnswer: "true", explanation: "Cultural idiom: an obvious issue that no one wants to address." },
          { type: "TRUE_FALSE", question: "True or False: 'Throw the baby out with the bathwater' means to discard something valuable along with the unwanted.", correctAnswer: "true", explanation: "German-origin idiom: don't lose the good while getting rid of the bad." },
          { type: "FILL_BLANK", question: "Complete: 'The project is still in the ___ stages' = in early, undeveloped stages.", correctAnswer: "formative", explanation: "'Formative stages' = early developmental phase." },
          { type: "FILL_BLANK", question: "Complete: 'He painted himself into a ___' = created a situation with no way out.", correctAnswer: "corner", explanation: "'Paint oneself into a corner' = trap oneself." },
          { type: "FILL_BLANK", question: "Complete: 'The decision was a Pyrrhic ___' = a victory that costs more than it's worth.", correctAnswer: "victory", explanation: "Pyrrhic victory = victory at devastating cost (from King Pyrrhus)." },
          { type: "MATCHING", question: "Match the idiom with its meaning:", options: [{ left: "Go up in smoke", right: "Come to nothing" }, { left: "Catch-22", right: "No-win paradox" }, { left: "Bite the bullet", right: "Face difficulty bravely" }, { left: "Elephant in the room", right: "Obvious ignored problem" }], correctAnswer: "[0,1,2,3]", explanation: "Each idiom conveys a specific figurative meaning." },
          { type: "CHECKBOX", question: "Select all correct idiom uses:", options: ["The peace talks went up in smoke after the ceasefire collapsed", "We're in a real Catch-22: we need experience to get a job, but need a job to get experience", "The elephant in the room was the company's mounting debt", "She threw the baby out with the bathwater by accepting the generous offer"], correctAnswer: "[0,1,2]", explanation: "'Threw the baby out with the bathwater by accepting a generous offer' is wrong; accepting isn't discarding the good. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / into / he / painted / himself / corner / a", correctAnswer: "He painted himself,into a corner", explanation: "Idiom: paint oneself into a corner." },
          { type: "SPEECH", question: "The ambitious reform initiative went up in smoke when the funding was abruptly withdrawn by the key stakeholders.", correctAnswer: "The ambitious reform initiative went up in smoke when the funding was abruptly withdrawn by the key stakeholders.", language: "en", hint: "Describe a failed initiative using 'go up in smoke'" },
          { type: "SPEECH", question: "The committee found itself in a Catch-22: cutting the budget would harm services, but maintaining it would bankrupt the department.", correctAnswer: "The committee found itself in a Catch-22: cutting the budget would harm services, but maintaining it would bankrupt the department.", language: "en", hint: "Describe a paradoxical situation using 'Catch-22'" },
        ]
      },
      {
        title: "Proverbs, Allusions & Intertextuality",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The road to hell is paved with good intentions.' What does this mean?", options: ["Well-meaning actions can lead to bad outcomes", "Hell is a real place", "Good intentions are always rewarded", "Roads are dangerous"], correctAnswer: "0", explanation: "Proverb: good intentions without action or wisdom can produce harmful results." },
          { type: "MCQ", question: "'This is our Waterloo.' What cultural allusion is this?", options: ["A decisive defeat", "A great victory", "A water crisis", "A European capital"], correctAnswer: "0", explanation: "Waterloo = Napoleon's decisive defeat; means a crushing final defeat." },
          { type: "MCQ", question: "'She's the Hermione Granger of our team.' What type of reference?", options: ["Pop culture allusion", "Historical reference", "Scientific term", "Legal precedent"], correctAnswer: "0", explanation: "Allusion to a fictional character known for being studious and capable." },
          { type: "MCQ", question: "'Every cloud has a silver lining.' What literary device?", options: ["Proverb", "Metaphor", "Simile", "Hyperbole"], correctAnswer: "0", explanation: "Traditional proverb expressing optimism: bad situations have positive aspects." },
          { type: "TRUE_FALSE", question: "True or False: 'A Gordian knot' alludes to an intractable problem solved by bold action.", correctAnswer: "true", explanation: "Gordian knot = Alexander the Great cut it; means solving a complex problem decisively." },
          { type: "TRUE_FALSE", question: "True or False: 'Intertextuality' is limited to references within the same genre.", correctAnswer: "false", explanation: "Intertextuality crosses genres, periods, and media." },
          { type: "FILL_BLANK", question: "Complete: 'To cross the Rubicon' means to take an irreversible ___.", correctAnswer: "step", explanation: "Crossing the Rubicon = passing a point of no return (Caesar)." },
          { type: "FILL_BLANK", question: "Complete: 'The sword of Damocles' refers to a constant state of ___.", correctAnswer: "impending danger", explanation: "Sword of Damocles = perpetual threat hanging over someone." },
          { type: "FILL_BLANK", question: "Complete: 'He met his Waterloo at the championship finals' alludes to Napoleon's decisive ___.", correctAnswer: "defeat", explanation: "Waterloo = Napoleon's final, crushing defeat." },
          { type: "MATCHING", question: "Match the allusion with its origin:", options: [{ left: "Catch-22", right: "Joseph Heller's novel" }, { left: "Waterloo", right: "Napoleon's defeat" }, { left: "Rubicon", right: "Julius Caesar" }, { left: "Damocles", right: "Greek legend" }], correctAnswer: "[0,1,2,3]", explanation: "Each allusion originates from a specific historical or literary source." },
          { type: "CHECKBOX", question: "Select all correct allusion uses:", options: ["The negotiations proved to be a Gordian knot that required creative thinking to unravel", "His career met its Waterloo when the scandal broke", "The sword of Damocles hung over every decision the committee made", "She crossed the Rubicon by merely considering the proposal"], correctAnswer: "[0,1,2]", explanation: "'Crossed the Rubicon by merely considering' is wrong; crossing implies decisive action, not mere consideration. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / negotiations / proved / to / be / a / knot / Gordian", correctAnswer: "The negotiations proved to be,a Gordian knot", explanation: "Allusion: Gordian knot = complex problem." },
          { type: "SPEECH", question: "The administration's decision to invade was their Waterloo; it marked the beginning of a long and irreversible decline in public support.", correctAnswer: "The administration's decision to invade was their Waterloo; it marked the beginning of a long and irreversible decline in public support.", language: "en", hint: "Use a historical allusion to describe a decisive failure" },
          { type: "SPEECH", question: "By signing the agreement, the CEO crossed the Rubicon; there would be no turning back from this commitment.", correctAnswer: "By signing the agreement, the CEO crossed the Rubicon; there would be no turning back from this commitment.", language: "en", hint: "Use 'cross the Rubicon' to describe an irreversible decision" },
        ]
      },
      {
        title: "Module 7 Review: Idiomatic Mastery & Cultural References",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The plan went up in smoke.' What does this mean?", options: ["It failed completely", "It succeeded", "It was delayed", "It was revised"], correctAnswer: "0", explanation: "'Go up in smoke' = come to nothing." },
          { type: "MCQ", question: "'This is our Waterloo.' What does this mean?", options: ["A decisive defeat", "A great victory", "A water shortage", "A celebration"], correctAnswer: "0", explanation: "Waterloo = decisive, crushing defeat." },
          { type: "MCQ", question: "'The elephant in the room' refers to:", options: ["An obvious problem everyone ignores", "A large animal", "A decoration", "A welcome guest"], correctAnswer: "0", explanation: "Idiom: obvious issue nobody addresses." },
          { type: "MCQ", question: "'To cross the Rubicon' means:", options: ["Take an irreversible step", "Cross a river", "Make a U-turn", "Avoid a decision"], correctAnswer: "0", explanation: "Cross the Rubicon = pass the point of no return." },
          { type: "TRUE_FALSE", question: "True or False: 'A Catch-22' is a paradoxical no-win situation.", correctAnswer: "true", explanation: "Catch-22 = circular, inescapable dilemma." },
          { type: "TRUE_FALSE", question: "True or False: 'The sword of Damocles' symbolizes constant impending danger.", correctAnswer: "true", explanation: "Greek legend: sword suspended by a thread over Damocles." },
          { type: "FILL_BLANK", question: "Complete: 'She has a ___ in her bonnet about the issue' = obsessively preoccupied.", correctAnswer: "bee", explanation: "Have a bee in one's bonnet = obsessed." },
          { type: "FILL_BLANK", question: "Complete: 'Every cloud has a silver ___' = there's something good in every bad situation.", correctAnswer: "lining", explanation: "Traditional proverb." },
          { type: "FILL_BLANK", question: "Complete: 'The sword of ___' = constant threat.", correctAnswer: "Damocles", explanation: "Greek allusion." },
          { type: "MATCHING", question: "Match the idiom with its meaning:", options: [{ left: "Go up in smoke", right: "Fail completely" }, { left: "Bite the bullet", right: "Face difficulty" }, { left: "Catch-22", right: "No-win paradox" }, { left: "Cross the Rubicon", right: "Irreversible action" }], correctAnswer: "[0,1,2,3]", explanation: "Each idiom has a specific figurative meaning." },
          { type: "CHECKBOX", question: "Select all correct idiom uses:", options: ["The merger went up in smoke when the deal fell through", "They faced a Catch-22 in the hiring process", "The elephant in the room was the budget deficit", "She crossed the Rubicon by merely thinking about resigning"], correctAnswer: "[0,1,2]", explanation: "'Crossed the Rubicon by merely thinking' is wrong; requires action. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / elephant / the / in / was / room / the / budget / deficit", correctAnswer: "The elephant in the room,was the budget deficit", explanation: "Idiom: elephant in the room." },
          { type: "SPEECH", question: "The ambitious initiative went up in smoke when key stakeholders withdrew their support at the eleventh hour.", correctAnswer: "The ambitious initiative went up in smoke when key stakeholders withdrew their support at the eleventh hour.", language: "en", hint: "Describe a failed project using idiomatic language" },
          { type: "SPEECH", question: "The company found itself in a Catch-22: it needed capital to grow, but couldn't attract investors without a growth track record.", correctAnswer: "The company found itself in a Catch-22: it needed capital to grow, but couldn't attract investors without a growth track record.", language: "en", hint: "Describe a business paradox using 'Catch-22'" },
          { type: "SPEECH", question: "By withdrawing from the treaty, the nation crossed the Rubicon, setting in motion a chain of events that would reshape the geopolitical landscape.", correctAnswer: "By withdrawing from the treaty, the nation crossed the Rubicon, setting in motion a chain of events that would reshape the geopolitical landscape.", language: "en", hint: "Describe an irreversible political decision using 'cross the Rubicon'" },
        ]
      },
    ]
  },
  {
    title: "Critical Analysis & Evaluation",
    lessons: [
      {
        title: "Advanced Text Analysis & Deconstruction",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The author's use of passive voice throughout the report obscures agency.' What is the critic analyzing?", options: ["Syntactic choice and its ideological effect", "Vocabulary", "Spelling", "Punctuation"], correctAnswer: "0", explanation: "Passive voice hides who is responsible; this is critical discourse analysis." },
          { type: "MCQ", question: "'The text privileges a Western-centric perspective.' What critical approach?", options: ["Postcolonial critique", "Formalism", "Structuralism", "New Criticism"], correctAnswer: "0", explanation: "Postcolonial critique examines Eurocentric bias and marginalization." },
          { type: "MCQ", question: "'The narrative employs an unreliable narrator.' What does this mean?", options: ["The narrator's account cannot be fully trusted", "The narrator is illiterate", "The narrator speaks multiple languages", "The narrator is the protagonist"], correctAnswer: "0", explanation: "Unreliable narrator = narrator whose credibility is compromised." },
          { type: "MCQ", question: "What is 'close reading'?", options: ["Detailed analysis of language, structure, and meaning", "Reading quickly", "Reading aloud", "Skimming"], correctAnswer: "0", explanation: "Close reading = meticulous examination of textual details." },
          { type: "TRUE_FALSE", question: "True or False: 'Deconstruction' seeks to expose internal contradictions and ambiguities in a text.", correctAnswer: "true", explanation: "Derridean deconstruction reveals instabilities in meaning." },
          { type: "TRUE_FALSE", question: "True or False: 'Intertextuality' analysis examines how a text references and transforms earlier texts.", correctAnswer: "true", explanation: "Intertextual analysis traces cross-textual connections." },
          { type: "FILL_BLANK", question: "Complete: A ___ analysis examines how language choices reflect and reinforce power structures.", correctAnswer: "critical discourse", explanation: "Critical discourse analysis (CDA) = language and power." },
          { type: "FILL_BLANK", question: "Complete: The text's ___ structure, with its non-linear timeline, mirrors the fragmented nature of memory.", correctAnswer: "narrative", explanation: "Narrative structure = how the story is organized." },
          { type: "FILL_BLANK", question: "Complete: A ___ reading of the text reveals underlying assumptions about gender roles that the surface narrative seems to endorse.", correctAnswer: "feminist", explanation: "Feminist critique exposes gender ideology." },
          { type: "MATCHING", question: "Match the critical approach with its focus:", options: [{ left: "Formalism", right: "Textual structure and form" }, { left: "Postcolonial", right: "Power and cultural dominance" }, { left: "Feminist", right: "Gender representation" }, { left: "Deconstruction", right: "Instability of meaning" }], correctAnswer: "[0,1,2,3]", explanation: "Each approach analyzes texts from a different perspective." },
          { type: "CHECKBOX", question: "Select all valid critical analysis observations:", options: ["The author's choice of nominalization depersonalizes the actors", "The narrative perspective shifts to create dramatic irony", "The text's intertextual references to classical literature deepen its thematic resonance", "The passive voice is used because the author doesn't know who did what"], correctAnswer: "[0,1,2]", explanation: "Critics assume deliberate craft, not incompetence. The first three are valid analyses." },
          { type: "ORDERING", question: "Put in order: the / analysis / discourse / critical / revealed / embedded / power / structures / the / in / text", correctAnswer: "The critical discourse analysis revealed,power structures embedded in the text", explanation: "CDA reveals power in language." },
          { type: "SPEECH", question: "A critical discourse analysis of the policy document reveals how the systematic use of nominalization serves to obscure accountability and depersonalize the consequences of the decisions.", correctAnswer: "A critical discourse analysis of the policy document reveals how the systematic use of nominalization serves to obscure accountability and depersonalize the consequences of the decisions.", language: "en", hint: "Analyze ideological effects of grammatical choices" },
          { type: "SPEECH", question: "The author's deployment of an unreliable narrator forces the reader to question not only the accuracy of the narrative but the very nature of truth and memory.", correctAnswer: "The author's deployment of an unreliable narrator forces the reader to question not only the accuracy of the narrative but the very nature of truth and memory.", language: "en", hint: "Analyze the effect of an unreliable narrator" },
        ]
      },
      {
        title: "Bias Detection & Source Evaluation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The study was funded by the tobacco industry.' What type of bias does this suggest?", options: ["Funding bias", "Selection bias", "Confirmation bias", "Survivorship bias"], correctAnswer: "0", explanation: "Funding bias = research outcomes may be influenced by the funder's interests." },
          { type: "MCQ", question: "'Only successful startups were included in the analysis.' What bias?", options: ["Survivorship bias", "Confirmation bias", "Publication bias", "Sampling bias"], correctAnswer: "0", explanation: "Survivorship bias = analyzing only those that 'survived,' ignoring failures." },
          { type: "MCQ", question: "What is 'publication bias'?", options: ["Positive results are more likely to be published", "All results are published equally", "Only negative results are published", "Publication date affects quality"], correctAnswer: "0", explanation: "Publication bias = studies with significant/positive results are published more often." },
          { type: "MCQ", question: "'The source has a vested interest in the outcome.' What should a critical reader do?", options: ["Evaluate the evidence independently of the source's interest", "Dismiss the source entirely", "Accept the findings uncritically", "Ignore the conflict of interest"], correctAnswer: "0", explanation: "Critical evaluation requires assessing evidence on its own merits while acknowledging bias." },
          { type: "TRUE_FALSE", question: "True or False: 'Confirmation bias' is the tendency to seek evidence that confirms preexisting beliefs.", correctAnswer: "true", explanation: "Confirmation bias = favoring information that confirms existing beliefs." },
          { type: "TRUE_FALSE", question: "True or False: A peer-reviewed article is automatically free of bias.", correctAnswer: "false", explanation: "Peer review reduces but does not eliminate bias." },
          { type: "FILL_BLANK", question: "Complete: ___ bias occurs when researchers only report results that support their hypothesis.", correctAnswer: "Reporting", explanation: "Reporting bias = selective reporting of favorable results." },
          { type: "FILL_BLANK", question: "Complete: The ___ of a source refers to its reliability and credibility.", correctAnswer: "authority", explanation: "Source authority = credibility based on expertise and reputation." },
          { type: "FILL_BLANK", question: "Complete: A ___ of interest occurs when a researcher's personal interests could affect the study.", correctAnswer: "conflict", explanation: "Conflict of interest = competing interests that may bias results." },
          { type: "MATCHING", question: "Match the bias type with its description:", options: [{ left: "Confirmation bias", right: "Seeking confirming evidence" }, { left: "Survivorship bias", right: "Focusing on successes only" }, { left: "Funding bias", right: "Funder influences outcomes" }, { left: "Publication bias", right: "Positive results published more" }], correctAnswer: "[0,1,2,3]", explanation: "Each bias affects research and reporting differently." },
          { type: "CHECKBOX", question: "Select all appropriate critical evaluation strategies:", options: ["Checking for conflicts of interest", "Examining the methodology for sampling bias", "Considering whether null results might exist but remain unpublished", "Accepting findings from prestigious institutions without scrutiny"], correctAnswer: "[0,1,2]", explanation: "Prestigious institutions can still produce biased research. The others are correct strategies." },
          { type: "ORDERING", question: "Put in order: the / study / funding / was / by / the / industry / with / a / vested / interest", correctAnswer: "The study was funded by the industry,with a vested interest", explanation: "Identifying funding bias." },
          { type: "SPEECH", question: "While the study's findings appear compelling, it is essential to note that the research was entirely funded by the industry it evaluated, which raises questions about potential bias.", correctAnswer: "While the study's findings appear compelling, it is essential to note that the research was entirely funded by the industry it evaluated, which raises questions about potential bias.", language: "en", hint: "Critically evaluate a study by identifying funding bias" },
          { type: "SPEECH", question: "The analysis suffers from survivorship bias, as it considers only the companies that succeeded while ignoring the many that failed under similar conditions.", correctAnswer: "The analysis suffers from survivorship bias, as it considers only the companies that succeeded while ignoring the many that failed under similar conditions.", language: "en", hint: "Identify survivorship bias in a business analysis" },
        ]
      },
      {
        title: "Module 8 Review: Critical Analysis & Evaluation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The author's use of passive voice obscures agency.' What is being analyzed?", options: ["Syntactic choice and ideological effect", "Vocabulary", "Punctuation", "Spelling"], correctAnswer: "0", explanation: "Passive voice hides responsibility; critical discourse analysis." },
          { type: "MCQ", question: "'The narrative employs an unreliable narrator.' What does this mean?", options: ["The narrator's credibility is compromised", "The narrator is illiterate", "The narrator is the protagonist", "The narrator speaks multiple languages"], correctAnswer: "0", explanation: "Unreliable narrator = not fully trustworthy." },
          { type: "MCQ", question: "What is 'survivorship bias'?", options: ["Analyzing only successes, ignoring failures", "Analyzing only failures", "Analyzing everything equally", "Analyzing survivors of disasters only"], correctAnswer: "0", explanation: "Survivorship bias = focusing on those that survived/succeeded." },
          { type: "MCQ", question: "'Publication bias' means:", options: ["Positive results are published more often", "All results are published equally", "Only negative results are published", "Publication date matters"], correctAnswer: "0", explanation: "Publication bias = positive/significant results are favored." },
          { type: "TRUE_FALSE", question: "True or False: 'Deconstruction' exposes contradictions in a text's meaning.", correctAnswer: "true", explanation: "Derridean deconstruction reveals instabilities." },
          { type: "TRUE_FALSE", question: "True or False: A peer-reviewed article is automatically bias-free.", correctAnswer: "false", explanation: "Peer review reduces but doesn't eliminate bias." },
          { type: "FILL_BLANK", question: "Complete: A ___ discourse analysis examines how language reflects power structures.", correctAnswer: "critical", explanation: "CDA = language and power." },
          { type: "FILL_BLANK", question: "Complete: ___ bias occurs when researchers seek only confirming evidence.", correctAnswer: "Confirmation", explanation: "Confirmation bias = seeking confirming evidence." },
          { type: "FILL_BLANK", question: "Complete: A ___ of interest occurs when personal interests could affect research.", correctAnswer: "conflict", explanation: "Conflict of interest." },
          { type: "MATCHING", question: "Match the bias with its description:", options: [{ left: "Confirmation bias", right: "Seeking confirming evidence" }, { left: "Funding bias", right: "Funder influences outcomes" }, { left: "Survivorship bias", right: "Focusing on successes only" }, { left: "Publication bias", right: "Positive results published more" }], correctAnswer: "[0,1,2,3]", explanation: "Each bias affects research differently." },
          { type: "CHECKBOX", question: "Select all valid critical analysis approaches:", options: ["Examining nominalization for depersonalization", "Checking for conflicts of interest", "Considering whether null results exist but are unpublished", "Accepting prestigious sources without question"], correctAnswer: "[0,1,2]", explanation: "Prestigious sources still need scrutiny. The others are valid." },
          { type: "ORDERING", question: "Put in order: the / employs / text / an / unreliable / narrator", correctAnswer: "The text employs,an unreliable narrator", explanation: "Unreliable narrator analysis." },
          { type: "SPEECH", question: "A careful reading of the document reveals that the strategic use of euphemistic language serves to sanitize what are, in reality, deeply problematic policies.", correctAnswer: "A careful reading of the document reveals that the strategic use of euphemistic language serves to sanitize what are, in reality, deeply problematic policies.", language: "en", hint: "Analyze euphemistic language for ideological effect" },
          { type: "SPEECH", question: "The meta-analysis, while comprehensive, is subject to publication bias, as studies with null findings are systematically underrepresented in the literature.", correctAnswer: "The meta-analysis, while comprehensive, is subject to publication bias, as studies with null findings are systematically underrepresented in the literature.", language: "en", hint: "Identify publication bias in a meta-analysis" },
          { type: "SPEECH", question: "The author's postcolonial critique exposes how the narrative, ostensibly universal, is in fact deeply embedded in a Western epistemological framework.", correctAnswer: "The author's postcolonial critique exposes how the narrative, ostensibly universal, is in fact deeply embedded in a Western epistemological framework.", language: "en", hint: "Apply postcolonial critique to reveal cultural bias" },
        ]
      },
    ]
  },
  {
    title: "Professional & Diplomatic Communication",
    lessons: [
      {
        title: "Diplomatic Language & Tactful Expression",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'With the greatest respect, I must express my reservations.' What strategy?", options: ["Mitigated disagreement", "Direct confrontation", "Enthusiastic agreement", "Indifference"], correctAnswer: "0", explanation: "Mitigated disagreement: expressing opposition while preserving the relationship." },
          { type: "MCQ", question: "'The proposal has considerable merit, though certain aspects warrant further consideration.' What does this diplomatically mean?", options: ["There are significant problems", "It's perfect", "It should be rejected outright", "No further discussion is needed"], correctAnswer: "0", explanation: "Diplomatic way of saying 'there are significant issues that need addressing'." },
          { type: "MCQ", question: "'I see where you're coming from, and I think there's merit in both positions.' What technique?", options: ["Validation before disagreement", "Complete agreement", "Dismissal", "Interruption"], correctAnswer: "0", explanation: "Validating the other person's perspective before introducing a counterposition." },
          { type: "MCQ", question: "What is 'diplomatic hedging'?", options: ["Using cautious language to soften disagreement or criticism", "Avoiding all decisions", "Speaking without meaning anything", "Using complex vocabulary to confuse"], correctAnswer: "0", explanation: "Diplomatic hedging = softening potentially face-threatening statements." },
          { type: "TRUE_FALSE", question: "True or False: 'That's an interesting perspective' can be a diplomatic way of expressing disagreement.", correctAnswer: "true", explanation: "In diplomatic contexts, 'interesting' often signals skepticism or disagreement." },
          { type: "TRUE_FALSE", question: "True or False: 'We may need to revisit this' diplomatically means 'this needs significant revision.'", correctAnswer: "true", explanation: "Diplomatic understatement: 'may need to revisit' = 'this has serious problems'." },
          { type: "FILL_BLANK", question: "Complete: 'I'm afraid I have to ___ with that assessment' = politely disagree.", correctAnswer: "disagree", explanation: "'I'm afraid I have to disagree' = polite, mitigated disagreement." },
          { type: "FILL_BLANK", question: "Complete: 'Perhaps we could ___ an alternative approach' = diplomatically suggest a different direction.", correctAnswer: "consider", explanation: "'Consider' = diplomatic suggestion." },
          { type: "FILL_BLANK", question: "Complete: 'The data, while suggestive, is not entirely ___' = diplomatically questioning evidence quality.", correctAnswer: "conclusive", explanation: "'Not entirely conclusive' = diplomatically expressing doubt." },
          { type: "MATCHING", question: "Match the diplomatic phrase with its actual meaning:", options: [{ left: "That's an interesting perspective", right: "I disagree" }, { left: "We may need to revisit this", right: "This needs significant revision" }, { left: "I see your point", right: "I understand but don't agree" }, { left: "With all due respect", right: "I'm about to contradict you" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase diplomatically conveys a different message." },
          { type: "CHECKBOX", question: "Select all diplomatic expressions:", options: ["I appreciate your concern, however...", "That's a fair point; let me offer another perspective", "With respect, I see it differently", "That's a terrible idea"], correctAnswer: "[0,1,2]", explanation: "'That's a terrible idea' is blunt, not diplomatic. The others are diplomatic." },
          { type: "ORDERING", question: "Put in order: with / respect / the / must / I / all / due / express / reservations / my", correctAnswer: "With all due respect,I must express my reservations", explanation: "Diplomatic disagreement formula." },
          { type: "SPEECH", question: "While I appreciate the considerable effort that has gone into this proposal, I'm afraid I have some reservations about the feasibility of the proposed timeline.", correctAnswer: "While I appreciate the considerable effort that has gone into this proposal, I'm afraid I have some reservations about the feasibility of the proposed timeline.", language: "en", hint: "Express disagreement diplomatically while acknowledging effort" },
          { type: "SPEECH", question: "That's certainly one way of looking at it, though I wonder whether we might also want to consider the longer-term implications.", correctAnswer: "That's certainly one way of looking at it, though I wonder whether we might also want to consider the longer-term implications.", language: "en", hint: "Introduce a counter-perspective diplomatically" },
        ]
      },
      {
        title: "Negotiation & Mediation Language",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'I think we can find common ground on this.' What negotiation strategy?", options: ["Building rapport", "Hard bargaining", "Ultimatum", "Walking away"], correctAnswer: "0", explanation: "Finding common ground = rapport-building and collaborative negotiation." },
          { type: "MCQ", question: "'We're prepared to be flexible on the timeline if you can accommodate our budget constraints.' What technique?", options: ["Conditional concession", "Unconditional surrender", "Ultimatum", "Threat"], correctAnswer: "0", explanation: "Conditional concession: offering flexibility in exchange for accommodation." },
          { type: "MCQ", question: "'Let me make sure I understand your position correctly...' What mediation skill?", options: ["Active listening", "Interrupting", "Dismissing", "Arguing"], correctAnswer: "0", explanation: "Active listening: paraphrasing to confirm understanding." },
          { type: "MCQ", question: "What is a 'BATNA' in negotiation?", options: ["Best Alternative To a Negotiated Agreement", "Best Agreement To a Negotiated Alternative", "Basic Analysis of Trade and Negotiation", "Budget Allocation for Trade and Negotiation"], correctAnswer: "0", explanation: "BATNA = your best option if negotiations fail." },
          { type: "TRUE_FALSE", question: "True or False: 'Anchoring' in negotiation means setting the initial reference point.", correctAnswer: "true", explanation: "Anchoring = the first number/position sets the reference for all subsequent discussion." },
          { type: "TRUE_FALSE", question: "True or False: 'ZOPA' is the Zone Of Possible Agreement between parties' reservation points.", correctAnswer: "true", explanation: "ZOPA = the range where both parties' minimum requirements overlap." },
          { type: "FILL_BLANK", question: "Complete: 'Perhaps we could explore a ___ arrangement' = diplomatically suggesting compromise.", correctAnswer: "mutually beneficial", explanation: "'Mutually beneficial' = good for both parties." },
          { type: "FILL_BLANK", question: "Complete: 'I want to be transparent about our ___' = openly state limits.", correctAnswer: "constraints", explanation: "Stating constraints = transparent negotiation." },
          { type: "FILL_BLANK", question: "Complete: 'Let's table this for now and return to it with fresh ___' = postpone productively.", correctAnswer: "perspectives", explanation: "Tabling = postponing to revisit later." },
          { type: "MATCHING", question: "Match the negotiation concept with its definition:", options: [{ left: "BATNA", right: "Best alternative if no deal" }, { left: "ZOPA", right: "Range of possible agreement" }, { left: "Anchoring", right: "Setting initial reference point" }, { left: "Concession", right: "Giving something to get something" }], correctAnswer: "[0,1,2,3]", explanation: "Each concept is central to negotiation theory." },
          { type: "CHECKBOX", question: "Select all effective negotiation strategies:", options: ["Starting with a collaborative tone", "Making conditional concessions", "Understanding the other party's BATNA", "Making the first offer without research"], correctAnswer: "[0,1,2]", explanation: "Making the first offer without research risks poor anchoring. The others are effective." },
          { type: "ORDERING", question: "Put in order: we / to / are / flexible / the / prepared / on / timeline / be", correctAnswer: "We are prepared to be flexible,on the timeline", explanation: "Conditional concession language." },
          { type: "SPEECH", question: "I appreciate your position on the budget, and I want to be transparent about our constraints as well. Perhaps we can explore a phased approach that addresses both our needs.", correctAnswer: "I appreciate your position on the budget, and I want to be transparent about our constraints as well. Perhaps we can explore a phased approach that addresses both our needs.", language: "en", hint: "Negotiate using transparency and conditional suggestions" },
          { type: "SPEECH", question: "Before we proceed, let me make sure I fully understand your concerns, because I think there may be more common ground between our positions than initially appears.", correctAnswer: "Before we proceed, let me make sure I fully understand your concerns, because I think there may be more common ground between our positions than initially appears.", language: "en", hint: "Use active listening to find common ground in negotiation" },
        ]
      },
      {
        title: "Module 9 Review: Professional & Diplomatic Communication",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The proposal has considerable merit, though certain aspects warrant further consideration.' What does this diplomatically mean?", options: ["There are significant problems", "It's perfect", "Reject it", "No issues"], correctAnswer: "0", explanation: "Diplomatic way of saying 'there are significant issues'." },
          { type: "MCQ", question: "'With all due respect' typically precedes:", options: ["A polite contradiction", "Enthusiastic agreement", "An apology", "A compliment"], correctAnswer: "0", explanation: "Diplomatic preface to disagreement." },
          { type: "MCQ", question: "What is a 'BATNA'?", options: ["Best Alternative To a Negotiated Agreement", "Best Agreement", "Basic Analysis", "Budget Allocation"], correctAnswer: "0", explanation: "BATNA = best fallback option." },
          { type: "MCQ", question: "'Anchoring' in negotiation means:", options: ["Setting the initial reference point", "Leaving the negotiation", "Accepting the first offer", "Walking away"], correctAnswer: "0", explanation: "Anchoring = the first position influences all subsequent discussion." },
          { type: "TRUE_FALSE", question: "True or False: 'That's an interesting perspective' can diplomatically mean disagreement.", correctAnswer: "true", explanation: "Diplomatic code for 'I disagree'." },
          { type: "TRUE_FALSE", question: "True or False: 'ZOPA' is the Zone Of Possible Agreement.", correctAnswer: "true", explanation: "ZOPA = overlapping range of acceptable outcomes." },
          { type: "FILL_BLANK", question: "Complete: 'I'm afraid I have to ___' = politely disagree.", correctAnswer: "disagree", explanation: "Mitigated disagreement." },
          { type: "FILL_BLANK", question: "Complete: 'We're prepared to be ___ on the timeline' = willing to adjust.", correctAnswer: "flexible", explanation: "Conditional concession." },
          { type: "FILL_BLANK", question: "Complete: 'Perhaps we could explore a ___ beneficial arrangement' = good for both sides.", correctAnswer: "mutually", explanation: "Mutually beneficial = win-win." },
          { type: "MATCHING", question: "Match the phrase with its diplomatic function:", options: [{ left: "I see your point", right: "Validation" }, { left: "With all due respect", right: "Polite contradiction" }, { left: "Let's explore alternatives", right: "Opening options" }, { left: "We may need to revisit", right: "Suggesting revision" }], correctAnswer: "[0,1,2,3]", explanation: "Each phrase serves a diplomatic function." },
          { type: "CHECKBOX", question: "Select all diplomatic strategies:", options: ["Acknowledging the other party's concerns before presenting counterarguments", "Using conditional language to soften disagreements", "Making transparent statements about constraints", "Dismissing opposing views without consideration"], correctAnswer: "[0,1,2]", explanation: "Dismissing views is not diplomatic. The others are correct strategies." },
          { type: "ORDERING", question: "Put in order: I / appreciate / position / however / your / must / I / express / reservations / my", correctAnswer: "I appreciate your position,however I must express my reservations", explanation: "Validation followed by diplomatic disagreement." },
          { type: "SPEECH", question: "While I recognize the validity of your concerns, I would respectfully suggest that the data presents a somewhat different picture, and I'd welcome the opportunity to walk you through the findings.", correctAnswer: "While I recognize the validity of your concerns, I would respectfully suggest that the data presents a somewhat different picture, and I'd welcome the opportunity to walk you through the findings.", language: "en", hint: "Challenge someone's position diplomatically with evidence" },
          { type: "SPEECH", question: "I want to ensure we're approaching this as partners rather than adversaries, so let me share our constraints and hear yours, with the goal of finding a mutually acceptable solution.", correctAnswer: "I want to ensure we're approaching this as partners rather than adversaries, so let me share our constraints and hear yours, with the goal of finding a mutually acceptable solution.", language: "en", hint: "Frame negotiation as collaborative partnership" },
          { type: "SPEECH", question: "That's certainly a defensible position, and I can see why you'd take that view. At the same time, I wonder whether we might also want to factor in the longer-term implications.", correctAnswer: "That's certainly a defensible position, and I can see why you'd take that view. At the same time, I wonder whether we might also want to factor in the longer-term implications.", language: "en", hint: "Validate then diplomatically introduce a counter-perspective" },
        ]
      },
    ]
  },
  {
    title: "Creative & Literary Expression",
    lessons: [
      {
        title: "Advanced Narrative Techniques",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The story begins at the end and circles back to the beginning.' What narrative technique?", options: ["Circular narrative", "Linear narrative", "Stream of consciousness", "Epistolary"], correctAnswer: "0", explanation: "Circular narrative = ending returns to the beginning." },
          { type: "MCQ", question: "'The narrative shifts between multiple characters' perspectives.' What technique?", options: ["Polyphonic narration", "First-person narration", "Omniscient narration", "Second-person narration"], correctAnswer: "0", explanation: "Polyphonic = multiple voices/perspectives." },
          { type: "MCQ", question: "'The story is told entirely through letters and diary entries.' What form?", options: ["Epistolary", "Stream of consciousness", "In media res", "Frame narrative"], correctAnswer: "0", explanation: "Epistolary = told through documents (letters, emails, diary entries)." },
          { type: "MCQ", question: "'She stood at the window. The rain traced paths down the glass like tears on a widow's cheek.' What literary device?", options: ["Simile with extended metaphor", "Simple comparison", "Hyperbole", "Irony"], correctAnswer: "0", explanation: "Simile ('like tears') that extends into metaphorical resonance." },
          { type: "TRUE_FALSE", question: "True or False: 'In medias res' means starting the narrative in the middle of the action.", correctAnswer: "true", explanation: "Latin: 'into the middle of things'." },
          { type: "TRUE_FALSE", question: "True or False: 'Stream of consciousness' attempts to replicate the flow of a character's thoughts.", correctAnswer: "true", explanation: "Joyce, Woolf, Faulkner pioneered this technique." },
          { type: "FILL_BLANK", question: "Complete: A ___ narrative embeds one story within another, like tales within tales.", correctAnswer: "frame", explanation: "Frame narrative = story within a story (e.g., Canterbury Tales)." },
          { type: "FILL_BLANK", question: "Complete: '___ point of view' uses 'you' to address the reader as a character.", correctAnswer: "Second-person", explanation: "Second-person = 'you' as protagonist." },
          { type: "FILL_BLANK", question: "Complete: 'The ___ of the narrative is unreliable, casting doubt on everything we are told.'", correctAnswer: "narrator", explanation: "Unreliable narrator technique." },
          { type: "MATCHING", question: "Match the narrative technique with its description:", options: [{ left: "In medias res", right: "Starting in the middle" }, { left: "Epistolary", right: "Told through documents" }, { left: "Stream of consciousness", right: "Flow of thoughts" }, { left: "Frame narrative", right: "Story within a story" }], correctAnswer: "[0,1,2,3]", explanation: "Each technique structures narrative differently." },
          { type: "CHECKBOX", question: "Select all correct narrative technique descriptions:", options: ["Circular narrative returns to its starting point", "Polyphonic narration uses multiple character voices", "Flash-forward is the opposite of flashback", "Second-person narration uses 'I'"], correctAnswer: "[0,1,2]", explanation: "Second-person uses 'you', not 'I'. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / narrative / employed / a / structure / circular / to / mirror / the / theme", correctAnswer: "The narrative employed a circular structure,to mirror the theme", explanation: "Circular narrative mirrors thematic content." },
          { type: "SPEECH", question: "The narrative, beginning in medias res with the aftermath of the catastrophe, gradually unfurls the chain of events that led to this devastating conclusion.", correctAnswer: "The narrative, beginning in medias res with the aftermath of the catastrophe, gradually unfurls the chain of events that led to this devastating conclusion.", language: "en", hint: "Describe a narrative that starts in the middle of action" },
          { type: "SPEECH", question: "Through a polyphonic structure, the author weaves together the voices of twelve distinct characters, each offering a fragmentary perspective on the central event.", correctAnswer: "Through a polyphonic structure, the author weaves together the voices of twelve distinct characters, each offering a fragmentary perspective on the central event.", language: "en", hint: "Describe multi-voiced narrative technique" },
        ]
      },
      {
        title: "Poetic Devices & Creative Prose",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The wind whispered through the ancient oaks.' What device?", options: ["Personification", "Simile", "Hyperbole", "Onomatopoeia"], correctAnswer: "0", explanation: "Personification = giving human qualities to non-human things." },
          { type: "MCQ", question: "'The silence was a living thing, pressing against his eardrums.' What device?", options: ["Metaphor with synesthetic quality", "Simile", "Irony", "Alliteration"], correctAnswer: "0", explanation: "Metaphor: silence as a living thing; synesthetic: abstract given physical pressure." },
          { type: "MCQ", question: "What is 'synesthesia' in literature?", options: ["Blending of sensory experiences", "A neurological condition only", "A type of rhyme", "A narrative structure"], correctAnswer: "0", explanation: "Literary synesthesia = describing one sense in terms of another (e.g., 'loud color')." },
          { type: "MCQ", question: "'The bitter sweetness of nostalgia washed over her.' What device?", options: ["Oxymoron", "Hyperbole", "Simile", "Onomatopoeia"], correctAnswer: "0", explanation: "Oxymoron = contradictory terms combined: 'bitter sweetness'." },
          { type: "TRUE_FALSE", question: "True or False: 'Sibilance' is the repetition of 's' sounds for effect.", correctAnswer: "true", explanation: "Sibilance = hissing 's' sounds: 'silken, sad, uncertain rustling'." },
          { type: "TRUE_FALSE", question: "True or False: 'Free verse' poetry has no rhyme scheme or regular meter.", correctAnswer: "true", explanation: "Free verse = unrhymed, unmetered poetry." },
          { type: "FILL_BLANK", question: "Complete: 'The ___ of the waves against the rocks' (repetition of initial consonant sounds).", correctAnswer: "rhythmic repetition", explanation: "Alliteration/consonance for sonic effect." },
          { type: "FILL_BLANK", question: "Complete: 'A deafening silence' is an ___ combining contradictory terms.", correctAnswer: "oxymoron", explanation: "Oxymoron = contradictory terms together." },
          { type: "FILL_BLANK", question: "Complete: 'The ___ imagery of the poem evoked the taste of salt and the sound of the sea.'", correctAnswer: "synesthetic", explanation: "Synesthetic imagery blends senses." },
          { type: "MATCHING", question: "Match the poetic device with its example:", options: [{ left: "Alliteration", right: "Peter Piper picked" }, { left: "Assonance", right: "The rain in Spain" }, { left: "Onomatopoeia", right: "Buzz, crash, whisper" }, { left: "Enjambment", right: "Line break mid-sentence" }], correctAnswer: "[0,1,2,3]", explanation: "Each device creates different effects." },
          { type: "CHECKBOX", question: "Select all correct poetic analyses:", options: ["Sibilance can create a sinister or soothing effect depending on context", "Enjambment disrupts the reader's expectation at line breaks", "Free verse is less sophisticated than rhymed poetry", "Oxymoron creates tension by combining opposites"], correctAnswer: "[0,1,3]", explanation: "Free verse is not less sophisticated; it's a different aesthetic. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / sibilance / created / a / haunting / atmospheric / effect", correctAnswer: "The sibilance created,a haunting atmospheric effect", explanation: "Sibilance for sonic effect." },
          { type: "SPEECH", question: "The autumn light, amber and attenuated, fell across the room like honey poured slow and golden through the dust-filled air.", correctAnswer: "The autumn light, amber and attenuated, fell across the room like honey poured slow and golden through the dust-filled air.", language: "en", hint: "Use synesthetic imagery and alliteration for atmospheric prose" },
          { type: "SPEECH", question: "There was a violent silence in the room, a screaming stillness that pressed against every surface, demanding to be acknowledged.", correctAnswer: "There was a violent silence in the room, a screaming stillness that pressed against every surface, demanding to be acknowledged.", language: "en", hint: "Use oxymoron and synesthesia to describe silence" },
        ]
      },
      {
        title: "Module 10 Review: Creative & Literary Expression",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The story begins in the middle of the action.' What technique?", options: ["In medias res", "Linear narrative", "Epistolary", "Frame narrative"], correctAnswer: "0", explanation: "In medias res = Latin for 'into the middle of things'." },
          { type: "MCQ", question: "'The narrative is told through letters and diary entries.' What form?", options: ["Epistolary", "Stream of consciousness", "Second-person", "Omniscient"], correctAnswer: "0", explanation: "Epistolary = told through documents." },
          { type: "MCQ", question: "'The wind whispered.' What device?", options: ["Personification", "Simile", "Hyperbole", "Irony"], correctAnswer: "0", explanation: "Personification = human quality given to non-human." },
          { type: "MCQ", question: "'Bitter sweetness' is what device?", options: ["Oxymoron", "Simile", "Metaphor", "Hyperbole"], correctAnswer: "0", explanation: "Oxymoron = contradictory terms combined." },
          { type: "TRUE_FALSE", question: "True or False: 'Stream of consciousness' replicates the flow of thoughts.", correctAnswer: "true", explanation: "Pioneered by Joyce, Woolf, Faulkner." },
          { type: "TRUE_FALSE", question: "True or False: 'Sibilance' is the repetition of 's' sounds.", correctAnswer: "true", explanation: "Sibilance = hissing sounds for effect." },
          { type: "FILL_BLANK", question: "Complete: A ___ narrative embeds one story within another.", correctAnswer: "frame", explanation: "Frame narrative = story within a story." },
          { type: "FILL_BLANK", question: "Complete: '___ point of view' uses 'you' to address the reader.", correctAnswer: "Second-person", explanation: "Second-person narration." },
          { type: "FILL_BLANK", question: "Complete: Synesthetic imagery blends different ___ experiences.", correctAnswer: "sensory", explanation: "Synesthesia = blending senses." },
          { type: "MATCHING", question: "Match the device with its definition:", options: [{ left: "Personification", right: "Human qualities to non-human" }, { left: "Oxymoron", right: "Contradictory terms combined" }, { left: "Enjambment", right: "Line break mid-sentence" }, { left: "Polyphonic", right: "Multiple narrative voices" }], correctAnswer: "[0,1,2,3]", explanation: "Each device creates different literary effects." },
          { type: "CHECKBOX", question: "Select all correct literary observations:", options: ["Circular narratives mirror thematic content", "Sibilance can create sinister or soothing effects", "Free verse lacks rhyme and regular meter", "Oxymorons resolve contradictions harmoniously"], correctAnswer: "[0,1,2]", explanation: "Oxymorons create tension, not resolution. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / narrative / employed / consciousness / of / stream / technique / a", correctAnswer: "The narrative employed,a stream of consciousness technique", explanation: "Stream of consciousness narrative." },
          { type: "SPEECH", question: "The narrative's circular structure, beginning and ending with the same image of the empty chair, creates a haunting symmetry that mirrors the inescapable nature of grief.", correctAnswer: "The narrative's circular structure, beginning and ending with the same image of the empty chair, creates a haunting symmetry that mirrors the inescapable nature of grief.", language: "en", hint: "Analyze how narrative structure reinforces theme" },
          { type: "SPEECH", question: "The light was a peculiar shade of amber, the kind that tastes of late summer and sounds like a distant violin.", correctAnswer: "The light was a peculiar shade of amber, the kind that tastes of late summer and sounds like a distant violin.", language: "en", hint: "Use synesthetic imagery blending sight, taste, and sound" },
          { type: "SPEECH", question: "Through a polyphonic structure, the novel gives voice to the voiceless, weaving together the perspectives of those history has marginalized and forgotten.", correctAnswer: "Through a polyphonic structure, the novel gives voice to the voiceless, weaving together the perspectives of those history has marginalized and forgotten.", language: "en", hint: "Describe the social function of polyphonic narrative" },
        ]
      },
    ]
  },
  {
    title: "Debate & Formal Argumentation",
    lessons: [
      {
        title: "Formal Debate Structure & Rebuttal",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "In formal debate, what is the 'constructive' speech?", options: ["The initial presentation of arguments", "The rebuttal", "The cross-examination", "The closing statement"], correctAnswer: "0", explanation: "Constructive = the first speech where each side presents their main arguments." },
          { type: "MCQ", question: "'The opposition's argument rests on a false premise.' What rebuttal technique?", options: ["Undermining the foundation", "Counter-evidence", "Reductio ad absurdum", "Tu quoque"], correctAnswer: "0", explanation: "Attacking the foundational assumption undermines the entire argument." },
          { type: "MCQ", question: "What is 'reductio ad absurdum'?", options: ["Showing that an argument leads to an absurd conclusion", "Attacking the speaker", "Using emotional appeals", "Citing authority"], correctAnswer: "0", explanation: "Reductio ad absurdum = demonstrating that accepting the argument leads to absurdity." },
          { type: "MCQ", question: "'Even if we accept the opposition's premise, their conclusion does not follow.' What technique?", options: ["Conceding the premise, attacking the inference", "Direct refutation", "Ad hominem", "Straw man"], correctAnswer: "0", explanation: "Strategic concession of the premise while attacking the logical connection." },
          { type: "TRUE_FALSE", question: "True or False: 'Tu quoque' (you too) is a valid rebuttal technique.", correctAnswer: "false", explanation: "Tu quoque = 'you do it too' is a fallacy, not valid reasoning." },
          { type: "TRUE_FALSE", question: "True or False: In formal debate, 'clash' refers to directly engaging with the opponent's arguments.", correctAnswer: "true", explanation: "Clash = direct engagement with opposing arguments." },
          { type: "FILL_BLANK", question: "Complete: The debater used ___ to demonstrate that the opposition's policy would lead to absurd consequences.", correctAnswer: "reductio ad absurdum", explanation: "Showing absurd consequences of an argument." },
          { type: "FILL_BLANK", question: "Complete: The ___ speech summarizes the debate and weighs the key clashes.", correctAnswer: "whip", explanation: "Whip speech = final summary in parliamentary debate." },
          { type: "FILL_BLANK", question: "Complete: A strong rebuttal doesn't just ___ the opponent's point; it explains why it doesn't matter to the debate.", correctAnswer: "refute", explanation: "Refutation + impact weighing = advanced rebuttal." },
          { type: "MATCHING", question: "Match the debate term with its meaning:", options: [{ left: "Constructive", right: "Initial argument presentation" }, { left: "Rebuttal", right: "Response to opponent's arguments" }, { left: "Clash", right: "Direct engagement" }, { left: "Whip", right: "Final summary speech" }], correctAnswer: "[0,1,2,3]", explanation: "Each term describes a different debate component." },
          { type: "CHECKBOX", question: "Select all valid rebuttal strategies:", options: ["Demonstrating the argument leads to absurd conclusions", "Showing the evidence is unreliable", "Attacking the logical connection between premise and conclusion", "Insulting the opponent's intelligence"], correctAnswer: "[0,1,2]", explanation: "Insults are not valid debate strategy. The others are legitimate techniques." },
          { type: "ORDERING", question: "Put in order: the / used / debater / reductio / ad / absurdum / the / position / to / undermine / opposing", correctAnswer: "The debater used reductio ad absurdum,to undermine the opposing position", explanation: "Reductio ad absurdum technique." },
          { type: "SPEECH", question: "Even accepting the opposition's premise that economic growth is the primary objective, their proposed policy would, paradoxically, undermine the very conditions necessary for sustainable growth.", correctAnswer: "Even accepting the opposition's premise that economic growth is the primary objective, their proposed policy would, paradoxically, undermine the very conditions necessary for sustainable growth.", language: "en", hint: "Use concession-then-refutation in a formal debate" },
          { type: "SPEECH", question: "If we follow the opposition's logic to its natural conclusion, we arrive at the absurd position that all regulation should be abolished, including those that protect public safety.", correctAnswer: "If we follow the opposition's logic to its natural conclusion, we arrive at the absurd position that all regulation should be abolished, including those that protect public safety.", language: "en", hint: "Use reductio ad absurdum in debate" },
        ]
      },
      {
        title: "Module 11 Review: Debate & Formal Argumentation",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "What is the 'constructive' speech in debate?", options: ["Initial presentation of arguments", "Rebuttal", "Cross-examination", "Closing"], correctAnswer: "0", explanation: "Constructive = first speech presenting main arguments." },
          { type: "MCQ", question: "'The opposition's argument leads to absurd conclusions.' What technique?", options: ["Reductio ad absurdum", "Ad hominem", "Straw man", "Tu quoque"], correctAnswer: "0", explanation: "Reductio ad absurdum = showing absurd consequences." },
          { type: "MCQ", question: "What is 'clash' in debate?", options: ["Direct engagement with opponent's arguments", "Shouting", "Interrupting", "Walking out"], correctAnswer: "0", explanation: "Clash = directly engaging opposing arguments." },
          { type: "MCQ", question: "'Tu quoque' is what type of reasoning?", options: ["Fallacious", "Valid", "Scientific", "Mathematical"], correctAnswer: "0", explanation: "Tu quoque = 'you too' is a logical fallacy." },
          { type: "TRUE_FALSE", question: "True or False: A rebuttal can concede a premise while attacking the inference.", correctAnswer: "true", explanation: "Strategic concession + inference attack is sophisticated." },
          { type: "TRUE_FALSE", question: "True or False: The 'whip' speech presents new arguments.", correctAnswer: "false", explanation: "Whip speech = summary; no new arguments allowed." },
          { type: "FILL_BLANK", question: "Complete: The debater ___ the opponent's argument by showing it rested on an unfounded assumption.", correctAnswer: "undermined", explanation: "Undermining = attacking the foundation." },
          { type: "FILL_BLANK", question: "Complete: A strong rebuttal refutes the point and explains its ___ to the overall debate.", correctAnswer: "irrelevance", explanation: "Impact weighing = showing why a refuted point doesn't matter." },
          { type: "FILL_BLANK", question: "Complete: 'Even if we grant the premise, the ___ does not follow.'", correctAnswer: "conclusion", explanation: "Attacking the logical connection." },
          { type: "MATCHING", question: "Match the debate concept with its function:", options: [{ left: "Constructive", right: "Present case" }, { left: "Rebuttal", right: "Counter arguments" }, { left: "Clash", right: "Direct engagement" }, { left: "Whip", right: "Summarize and weigh" }], correctAnswer: "[0,1,2,3]", explanation: "Each component serves a specific debate function." },
          { type: "CHECKBOX", question: "Select all effective debate strategies:", options: ["Directly engaging with the opponent's strongest arguments", "Using reductio ad absurdum to expose flawed logic", "Weighing the impact of each clash", "Ignoring inconvenient evidence"], correctAnswer: "[0,1,2]", explanation: "Ignoring evidence is poor debate practice. The others are effective." },
          { type: "ORDERING", question: "Put in order: the / constructive / speech / established / the / framework / for / the / debate", correctAnswer: "The constructive speech established,the framework for the debate", explanation: "Constructive sets up the debate." },
          { type: "SPEECH", question: "The opposition has asked us to accept a premise that, if rigorously examined, collapses under the weight of its own internal contradictions.", correctAnswer: "The opposition has asked us to accept a premise that, if rigorously examined, collapses under the weight of its own internal contradictions.", language: "en", hint: "Challenge the opposition's foundational premise" },
          { type: "SPEECH", question: "I want to concede for the sake of argument that the opposition's statistics are accurate; what I challenge is the inference they draw from them.", correctAnswer: "I want to concede for the sake of argument that the opposition's statistics are accurate; what I challenge is the inference they draw from them.", language: "en", hint: "Concede evidence but challenge the conclusion drawn from it" },
          { type: "SPEECH", question: "When we weigh the competing claims before us, it becomes clear that the opposition's case, while rhetorically compelling, lacks the evidentiary foundation necessary to sustain it.", correctAnswer: "When we weigh the competing claims before us, it becomes clear that the opposition's case, while rhetorically compelling, lacks the evidentiary foundation necessary to sustain it.", language: "en", hint: "Deliver a whip speech weighing the key clashes" },
        ]
      },
    ]
  },
  {
    title: "C2 Final Mastery: Integrated Proficiency",
    lessons: [
      {
        title: "Integrated Grammar, Discourse & Style",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'So compelling was the evidence, and so thorough the investigation, that no reasonable observer could dissent.' What features are combined?", options: ["Inversion, gapping, and result clause", "Simple inversion only", "Ellipsis only", "No special features"], correctAnswer: "0", explanation: "Inversion ('So compelling was'), gapping ('so thorough [was] the investigation'), and result clause ('that...')." },
          { type: "MCQ", question: "'What the committee ultimately decided, and what the public subsequently learned, was that the process had been compromised from the outset.' What structure?", options: ["Double wh-cleft with cataphoric reference", "Simple sentence", "Compound sentence", "Question"], correctAnswer: "0", explanation: "Double wh-cleft: 'What X decided, and what Y learned, was that...'" },
          { type: "MCQ", question: "'Not for one moment did the author intend to suggest, nor would any reasonable reader infer, that the policy was without merit.' What features?", options: ["Negative inversion, parenthetical, and concession", "Simple statement", "Question", "Command"], correctAnswer: "0", explanation: "Negative inversion + parenthetical concession + sophisticated hedging." },
          { type: "MCQ", question: "'The findings, while not without their limitations, nonetheless appear to corroborate the hypothesis, suggesting that further investigation may be warranted.' What register?", options: ["Academic with layered hedging", "Informal", "Legal", "Poetic"], correctAnswer: "0", explanation: "Multiple hedging layers: 'while not without', 'appear to', 'suggesting', 'may be'." },
          { type: "TRUE_FALSE", question: "True or False: C2-level writing seamlessly integrates multiple advanced grammatical structures within a single sentence.", correctAnswer: "true", explanation: "C2 mastery = combining inversion, ellipsis, hedging, and complex syntax naturally." },
          { type: "TRUE_FALSE", question: "True or False: 'The report, which was leaked, and whose implications remain unclear, has nonetheless precipitated a debate' uses correct non-defining relatives.", correctAnswer: "true", explanation: "Double non-defining relative with 'whose' and 'which'." },
          { type: "FILL_BLANK", question: "Complete: So ___ was the disparity between the two accounts that investigators struggled to reconcile them.", correctAnswer: "stark", explanation: "'So + adjective' inversion for emphasis." },
          { type: "FILL_BLANK", question: "Complete: Had the committee not intervened, the consequences ___ incalculable.", correctAnswer: "would have been", explanation: "Inverted third conditional." },
          { type: "FILL_BLANK", question: "Complete: The evidence, while ___, is not entirely conclusive.", correctAnswer: "suggestive", explanation: "Hedged evaluation: suggestive but not conclusive." },
          { type: "MATCHING", question: "Match the feature with its example:", options: [{ left: "Inversion", right: "So compelling was the evidence" }, { left: "Hedging", right: "appears to suggest" }, { left: "Ellipsis", right: "some agreed, others not" }, { left: "Wh-cleft", right: "What the data reveals is" }], correctAnswer: "[0,1,2,3]", explanation: "Each feature contributes to C2-level sophistication." },
          { type: "CHECKBOX", question: "Select all grammatically correct C2 sentences:", options: ["Had the circumstances permitted, we would have proceeded with the investigation", "Not until the final analysis did the full implications become apparent", "What the study ultimately demonstrates is the need for further research", "So the results were compelling that everyone agreed"], correctAnswer: "[0,1,2]", explanation: "'So the results were compelling that' is wrong; should be 'So compelling were the results that'. The others are correct." },
          { type: "ORDERING", question: "Put in order: so / the / was / disparity / stark / reconciliation / impossible / between / the / accounts", correctAnswer: "So stark was the disparity between the accounts,reconciliation was impossible", explanation: "'So + adjective' inversion." },
          { type: "SPEECH", question: "So profound were the implications of the findings, and so meticulous the methodology that produced them, that the entire field was compelled to reconsider its foundational assumptions.", correctAnswer: "So profound were the implications of the findings, and so meticulous the methodology that produced them, that the entire field was compelled to reconsider its foundational assumptions.", language: "en", hint: "Combine inversion, gapping, and result clause" },
          { type: "SPEECH", question: "What the data ultimately reveals, and what subsequent analysis has confirmed, is that the relationship between the variables is far more complex than initially presumed.", correctAnswer: "What the data ultimately reveals, and what subsequent analysis has confirmed, is that the relationship between the variables is far more complex than initially presumed.", language: "en", hint: "Use double wh-cleft for complex reporting" },
        ]
      },
      {
        title: "Comprehensive C2 Assessment",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The proposal, while not without merit, suffers from fundamental flaws in its underlying assumptions.' What C2 features?", options: ["Litotes, concession, and formal register", "Simple statement", "Informal register", "No special features"], correctAnswer: "0", explanation: "Litotes ('not without merit'), concession ('while'), and formal academic register." },
          { type: "MCQ", question: "'Notwithstanding the considerable obstacles, and mindful of the constraints under which we operate, we remain cautiously optimistic.' What features?", options: ["Concessive phrase, participial clause, and hedged stance", "Simple optimism", "No hedging", "Informal language"], correctAnswer: "0", explanation: "Concessive ('notwithstanding'), participial ('mindful of'), hedged ('cautiously optimistic')." },
          { type: "MCQ", question: "'The author's argument, which rests on a questionable interpretation of the data, fails to account for the confounding variables that subsequent research has identified.' What critical move?", options: ["Identifying methodological weakness", "Praising the research", "Agreeing with the conclusion", "Summarizing findings"], correctAnswer: "0", explanation: "Critical identification of methodological flaws." },
          { type: "MCQ", question: "'Be that as it may, the fact remains that the evidence, such as it is, points in a direction that most observers would consider unsettling.' What features?", options: ["Concessive idiom, hedging, and diplomatic understatement", "Direct assertion", "No hedging", "Informal language"], correctAnswer: "0", explanation: "'Be that as it may' = concessive idiom; 'such as it is' = hedging; 'unsettling' = diplomatic understatement." },
          { type: "TRUE_FALSE", question: "True or False: C2-level proficiency includes the ability to strategically manipulate register within a single text.", correctAnswer: "true", explanation: "Register manipulation = shifting formality for rhetorical effect." },
          { type: "TRUE_FALSE", question: "True or False: 'The study's findings, while preliminary, appear to corroborate the hypothesis' demonstrates appropriate C2-level hedging.", correctAnswer: "true", explanation: "Multiple hedges: 'while preliminary', 'appear to', 'corroborate' (not 'prove')." },
          { type: "FILL_BLANK", question: "Complete: The ___ of the author's argument, while rhetorically compelling, does not compensate for the paucity of empirical support.", correctAnswer: "elegance", explanation: "Acknowledging rhetorical skill while identifying empirical weakness." },
          { type: "FILL_BLANK", question: "Complete: Had the researchers ___ the methodological limitations in their initial design, the subsequent controversy might have been avoided.", correctAnswer: "anticipated", explanation: "Inverted third conditional with precise verb." },
          { type: "FILL_BLANK", question: "Complete: What distinguishes this study from its ___ is not merely its scale but its methodological rigor.", correctAnswer: "predecessors", explanation: "Academic comparison vocabulary." },
          { type: "MATCHING", question: "Match the C2 skill with its demonstration:", options: [{ left: "Inversion", right: "So compelling was the case" }, { left: "Pragmatic competence", right: "Reading between the lines" }, { left: "Register control", right: "Shifting formal to informal" }, { left: "Critical analysis", right: "Exposing methodological flaws" }], correctAnswer: "[0,1,2,3]", explanation: "Each represents a key C2-level competence." },
          { type: "CHECKBOX", question: "Select all features of C2-level proficiency:", options: ["Seamless integration of complex grammatical structures", "Strategic use of hedging and boosting", "Ability to detect and analyze implicit meaning", "Reliance on simple sentence structures for clarity"], correctAnswer: "[0,1,2]", explanation: "C2 does NOT rely on simple structures; it uses complexity purposefully. The others are correct." },
          { type: "ORDERING", question: "Put in order: what / distinguishes / this / study / is / not / its / scale / but / rigor / its / methodological", correctAnswer: "What distinguishes this study,is not its scale but its methodological rigor", explanation: "Wh-cleft with contrast." },
          { type: "SPEECH", question: "Notwithstanding the considerable methodological challenges inherent in longitudinal research of this scope, the findings, while necessarily preliminary, appear to lend cautious support to the theoretical framework.", correctAnswer: "Notwithstanding the considerable methodological challenges inherent in longitudinal research of this scope, the findings, while necessarily preliminary, appear to lend cautious support to the theoretical framework.", language: "en", hint: "Combine concession, hedging, and academic precision" },
          { type: "SPEECH", question: "What ultimately sets this research apart is not the novelty of its findings but the rigor with which those findings have been established and the transparency with which their limitations have been acknowledged.", correctAnswer: "What ultimately sets this research apart is not the novelty of its findings but the rigor with which those findings have been established and the transparency with which their limitations have been acknowledged.", language: "en", hint: "Use wh-cleft with parallel structure for academic evaluation" },
          { type: "SPEECH", question: "Had the committee fully appreciated the implications of their decision, and had they been properly briefed on the available evidence, one can only conclude that the outcome would have been markedly different.", correctAnswer: "Had the committee fully appreciated the implications of their decision, and had they been properly briefed on the available evidence, one can only conclude that the outcome would have been markedly different.", language: "en", hint: "Combine double inverted conditionals with formal conclusion" },
        ]
      },
      {
        title: "C2 Capstone: The Proficiency Challenge",
        type: "QUIZ",
        questions: [
          { type: "MCQ", question: "'The juxtaposition of the author's professed ideals with the reality of their actions creates an irony so profound as to border on the tragic.' What analysis?", options: ["Thematic analysis of irony", "Grammatical analysis", "Phonological analysis", "Morphological analysis"], correctAnswer: "0", explanation: "Thematic analysis examining the gap between stated ideals and actual behavior." },
          { type: "MCQ", question: "'Were the assumptions underpinning this policy to be subjected to rigorous scrutiny, they would, I submit, crumble under the weight of their own internal inconsistencies.' What features?", options: ["Inverted conditional, formal submission, and metaphorical collapse", "Simple conditional", "No metaphor", "Informal register"], correctAnswer: "0", explanation: "Inverted conditional ('Were the assumptions'), formal submission ('I submit'), metaphor ('crumble under weight')." },
          { type: "MCQ", question: "'The discourse surrounding the issue, characterized as it is by a proliferation of euphemisms and strategic ambiguities, obscures rather than illuminates the fundamental ethical questions at stake.' What critical move?", options: ["Critical discourse analysis", "Grammatical correction", "Literary appreciation", "Statistical analysis"], correctAnswer: "0", explanation: "CDA: analyzing how language choices (euphemisms, ambiguities) obscure ethical issues." },
          { type: "MCQ", question: "'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.' What is the irony?", options: ["It's actually society that wants the man's fortune", "The man is poor", "The man is married", "No irony"], correctAnswer: "0", explanation: "The opening of Pride and Prejudice: the irony is that it's society (families with daughters) that wants the man, not the man who wants a wife." },
          { type: "TRUE_FALSE", question: "True or False: C2 proficiency includes the ability to produce and analyze texts at the level of educated native speakers.", correctAnswer: "true", explanation: "C2 = mastery comparable to educated native speakers." },
          { type: "TRUE_FALSE", question: "True or False: 'The elephant in the room' and 'the sword of Damocles' are examples of cultural allusions that a C2 speaker should understand.", correctAnswer: "true", explanation: "C2 includes cultural literacy and idiomatic mastery." },
          { type: "FILL_BLANK", question: "Complete: The ___ between the policy's stated objectives and its actual outcomes was so stark as to render the entire initiative a study in unintended consequences.", correctAnswer: "disparity", explanation: "Disparity = gap/difference." },
          { type: "FILL_BLANK", question: "Complete: Be that as it ___, the fundamental question remains unresolved.", correctAnswer: "may", explanation: "'Be that as it may' = concessive idiom." },
          { type: "FILL_BLANK", question: "Complete: The author's ___, while rhetorically sophisticated, ultimately fails to compensate for the evidentiary deficiencies at the core of the argument.", correctAnswer: "eloquence", explanation: "Eloquence = persuasive fluency." },
          { type: "MATCHING", question: "Match the C2 concept with its demonstration:", options: [{ left: "Pragmatic competence", right: "Understanding implicature" }, { left: "Register flexibility", right: "Shifting between formal and informal" }, { left: "Cultural literacy", right: "Understanding allusions and idioms" }, { left: "Critical discourse analysis", right: "Exposing ideological language choices" }], correctAnswer: "[0,1,2,3]", explanation: "Each represents a pillar of C2 proficiency." },
          { type: "CHECKBOX", question: "Select all characteristics of C2-level language mastery:", options: ["Understanding nuanced distinctions between near-synonyms", "Producing text with appropriate hedging and boosting", "Detecting implicit bias in source material", "Relying exclusively on literal interpretation"], correctAnswer: "[0,1,2]", explanation: "C2 speakers go BEYOND literal interpretation. The others are correct." },
          { type: "ORDERING", question: "Put in order: the / between / disparity / the / stated / objectives / the / actual / outcomes / was / stark", correctAnswer: "The disparity between the stated objectives and the actual outcomes,was stark", explanation: "Identifying the gap between intention and result." },
          { type: "SPEECH", question: "The irony of the situation, which would not have been lost on a keen observer of human nature, is that the very measures designed to protect the institution ultimately proved to be its undoing.", correctAnswer: "The irony of the situation, which would not have been lost on a keen observer of human nature, is that the very measures designed to protect the institution ultimately proved to be its undoing.", language: "en", hint: "Analyze irony with sophisticated C2-level commentary" },
          { type: "SPEECH", question: "It is a testament to the complexity of the issue that even the most seasoned analysts find themselves divided, not on the facts, but on their interpretation and the weight they assign to competing considerations.", correctAnswer: "It is a testament to the complexity of the issue that even the most seasoned analysts find themselves divided, not on the facts, but on their interpretation and the weight they assign to competing considerations.", language: "en", hint: "Demonstrate nuanced understanding of analytical disagreement" },
          { type: "SPEECH", question: "What this entire episode ultimately reveals is not merely the fallibility of human judgment but the systemic vulnerabilities inherent in any institution that fails to subject its own assumptions to rigorous and continuous scrutiny.", correctAnswer: "What this entire episode ultimately reveals is not merely the fallibility of human judgment but the systemic vulnerabilities inherent in any institution that fails to subject its own assumptions to rigorous and continuous scrutiny.", language: "en", hint: "Deliver a C2-level conclusion using wh-cleft and complex syntax" },
        ]
      },
    ]
  },
]

async function seedEnglishC2() {
  console.log('=========================================')
  console.log('ðŸ‘‘ Seeding English C2 Course...')
  console.log('=========================================')

  try {
    let category = await withRetry(() => prisma.category.findFirst({
      where: { name: 'Languages' }
    }))

    if (!category) {
      console.log('âš ï¸ Languages category not found. Creating...')
      category = await withRetry(() => prisma.category.create({
        data: {
          name: 'Languages',
          description: 'Learn languages from beginner to advanced',
          icon: 'ðŸŒ',
          color: '#2563eb',
          order: 1,
          isActive: true,
        }
      }))
      console.log('âœ… Languages category created:', category.id)
    }

    let course = await withRetry(() => prisma.course.findFirst({
      where: { title: courseData.title }
    }))

    if (course) {
      console.log('ðŸ—‘ï¸ Deleting existing course and all related data...')
      await withRetry(() => prisma.module.deleteMany({
        where: { courseId: course.id }
      }))
      console.log('âœ… Existing modules deleted (cascades to lessons and questions)')
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
          order: 6,
        }
      }))
      console.log('âœ… Course created:', course.id)
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
      console.log('âœ… Course updated:', course.id)
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

      console.log(`ðŸ“¦ Module ${modIdx + 1}: "${moduleData.title}" (${newModule.id})`)

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

        console.log(`  ðŸ“ Lesson ${lessIdx + 1}: "${lessonData.title}" - ${questionsToCreate.length} questions`)
      }

      console.log(`  âœ… Module ${modIdx + 1} complete\n`)

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('=========================================')
    console.log('ðŸŽ‰ English C2 Course Seed Complete!')
    console.log('=========================================')
    console.log(`ðŸ“š Course: ${course.title}`)
    console.log(`ðŸ“¦ Modules: ${modulesData.length}`)
    console.log(`ðŸ“ Lessons: ${totalLessons}`)
    console.log(`â“ Questions: ${totalQuestions}`)
    console.log(`ðŸ†” Course ID: ${course.id}`)
    console.log('=========================================')

  } catch (error: any) {
    console.error('âŒ Error seeding English C2 course:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedEnglishC2()
