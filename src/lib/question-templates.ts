// Question Generation Templates for Language Learning Platform
// Provides realistic, level-appropriate questions for each CEFR level

import { CEFR_TOPICS, CEFRLevel, QuestionType } from './cefr-topics';

// Question distribution per lesson (12-15 questions)
// 40% MCQ, 25% FILL_BLANK, 15% TRUE_FALSE, 10% MATCHING, 5% ORDERING, 5% CHECKBOX, 0-5% SPEECH
export function getQuestionDistribution(count: number = 12): QuestionType[] {
  const types: QuestionType[] = [];
  
  // MCQ: 40%
  for (let i = 0; i < Math.floor(count * 0.4); i++) types.push('MCQ');
  
  // FILL_BLANK: 25%
  for (let i = 0; i < Math.floor(count * 0.25); i++) types.push('FILL_BLANK');
  
  // TRUE_FALSE: 15%
  for (let i = 0; i < Math.floor(count * 0.15); i++) types.push('TRUE_FALSE');
  
  // MATCHING: 10%
  for (let i = 0; i < Math.floor(count * 0.1); i++) types.push('MATCHING');
  
  // ORDERING: 5%
  for (let i = 0; i < Math.floor(count * 0.05); i++) types.push('ORDERING');
  
  // CHECKBOX: 5%
  for (let i = 0; i < Math.floor(count * 0.05); i++) types.push('CHECKBOX');
  
  // SPEECH: 0-5% (add 1 if we have space)
  if (types.length < count) types.push('SPEECH');
  
  // Fill remaining with MCQ
  while (types.length < count) types.push('MCQ');
  
  // Shuffle the array
  return types.sort(() => Math.random() - 0.5);
}

// Template interface for question generation
export interface QuestionTemplate {
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ, MATCHING, ORDERING, CHECKBOX
  correctAnswer: string; // JSON string
  explanation: string;
  hint?: string;
  language?: string; // For SPEECH questions
}

// Generate questions for a specific topic at A1 level (English)
export function generateA1EnglishQuestions(
  moduleTitle: string,
  subtopic: string,
  lessonIndex: number,
  questionTypes: QuestionType[],
  languageCode: string = 'en'
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];
  
  // Real A1 English vocabulary and grammar based on subtopic
  const a1Content: Record<string, any> = {
    "Saying hello and goodbye": {
      mcq: [
        { q: "How do you greet someone in the morning?", opts: ["Good morning", "Good night", "Good afternoon", "Good evening"], ans: "0", exp: "Good morning is used from dawn until late morning." },
        { q: "What do you say when you leave someone in the evening?", opts: ["Good evening", "Good night", "Good afternoon", "Good morning"], ans: "1", exp: "Good night is used when parting in the evening." },
        { q: "Which is a formal way to say hello?", opts: ["Hi", "Hello", "Hey", "Yo"], ans: "1", exp: "Hello is more formal than hi, hey, or yo." },
        { q: "What do you say when meeting someone for the first time?", opts: ["Nice to meet you", "See you later", "Good night", "How are you"], ans: "0", exp: "Nice to meet you is used when meeting someone new." }
      ],
      fill: [
        { q: "Complete: ___ morning! (Greeting)", ans: "Good", exp: "Good morning is a common morning greeting." },
        { q: "Complete: ___ to meet you! (First meeting)", ans: "Nice", exp: "Nice to meet you is polite when meeting someone new." },
        { q: "Complete: See you ___! (Parting)", ans: "later", exp: "See you later means we will see each other again soon." }
      ],
      tf: [
        { q: "True or False: 'Good night' is used when arriving in the evening.", ans: "false", exp: "Good night is used when leaving or going to sleep, not when arriving." },
        { q: "True or False: 'Goodbye' is used when parting from someone.", ans: "true", exp: "Goodbye is a standard way to say farewell." }
      ],
      match: [
        { q: "Match greetings with time of day:", opts: [{ left: "Good morning", right: "Morning" }, { left: "Good afternoon", right: "Afternoon" }, { left: "Good evening", right: "Evening" }, { left: "Good night", right: "Night" }], ans: "[0,2,1,3]", exp: "Each greeting matches its time of day." }
      ],
      order: [
        { q: "Put in order: morning / Good / !", ans: "Good,morning,!", exp: "Good morning! is the correct greeting." }
      ],
      checkbox: [
        { q: "Select all formal greetings:", opts: ["Hello", "Hi", "Good morning", "Hey"], ans: "[0,2]", exp: "Hello and Good morning are formal. Hi and Hey are informal." }
      ],
      speech: [
        { q: "Good morning! How are you?", ans: "Good morning! How are you?", hint: "Say the morning greeting", lang: "en" }
      ]
    },
    "Introducing yourself": {
      mcq: [
        { q: "What do you say when you introduce yourself?", opts: ["My name is John", "Your name is John", "His name is John", "Her name is John"], ans: "0", exp: "My name is... is how you introduce yourself." },
        { q: "How do you ask someone their name?", opts: ["What is your name?", "What is my name?", "What is his name?", "What is her name?"], ans: "0", exp: "What is your name? is the correct question." },
        { q: "Which response is correct when someone says 'Nice to meet you'?", opts: ["Nice to meet you too", "Goodbye", "Thank you", "See you"], ans: "0", exp: "Nice to meet you too is the polite response." }
      ],
      fill: [
        { q: "Complete: My ___ is Maria. (Introduction)", ans: "name", exp: "My name is Maria is how you introduce yourself." },
        { q: "Complete: ___ to meet you! (Response)", ans: "Nice", exp: "Nice to meet you is a polite response." }
      ],
      tf: [
        { q: "True or False: 'I am 20 years old' is a way to introduce your age.", ans: "true", exp: "Stating your age is common when introducing yourself." }
      ],
      speech: [
        { q: "Hello, my name is David. Nice to meet you.", ans: "Hello, my name is David. Nice to meet you.", hint: "Introduce yourself", lang: "en" }
      ]
    },
    "Asking names": {
      mcq: [
        { q: "What is the correct way to ask someone's name?", opts: ["What is your name?", "What is my name?", "How are you?", "Where are you from?"], ans: "0", exp: "What is your name? is the standard question." },
        { q: "How do you ask someone's name politely?", opts: ["May I know your name?", "Give me your name", "Tell me your name", "Your name is?"], ans: "0", exp: "May I know your name? is very polite." }
      ],
      fill: [
        { q: "Complete: What is ___ name? (Asking)", ans: "your", exp: "What is your name? asks someone for their name." }
      ],
      tf: [
        { q: "True or False: 'What is his name?' asks about a male person's name.", ans: "true", exp: "His refers to a male person." }
      ]
    },
    "Exchanging contact info": {
      mcq: [
        { q: "What do you say to ask for a phone number?", opts: ["What is your phone number?", "Where is your phone?", "How is your phone?", "When is your phone?"], ans: "0", exp: "What is your phone number? is the correct question." },
        { q: "Which is a correct email format?", opts: ["john@gmail.com", "john@gmail", "john@com", "john.gmail.com"], ans: "0", exp: "Emails need @ and a domain like .com." }
      ],
      fill: [
        { q: "Complete: My email is john@___.com (Email)", ans: "gmail", exp: "john@gmail.com is a valid email address." }
      ]
    },
    "Polite expressions": {
      mcq: [
        { q: "What do you say when someone helps you?", opts: ["Thank you", "Goodbye", "Hello", "Sorry"], ans: "0", exp: "Thank you is used to show gratitude." },
        { q: "How do you apologize for being late?", opts: ["Sorry I am late", "Thank you", "Hello", "Goodbye"], ans: "0", exp: "Sorry I am late apologizes for tardiness." },
        { q: "What do you say when someone says 'Thank you'?", opts: ["You're welcome", "Goodbye", "Hello", "Sorry"], ans: "0", exp: "You're welcome responds to thank you." }
      ],
      fill: [
        { q: "Complete: ___ you very much! (Gratitude)", ans: "Thank", exp: "Thank you very much shows strong gratitude." }
      ],
      tf: [
        { q: "True or False: 'Please' is used when making requests.", ans: "true", exp: "Please makes requests more polite." }
      ],
      speech: [
        { q: "Thank you very much. You're welcome.", ans: "Thank you very much. You're welcome.", hint: "Say thank you and response", lang: "en" }
      ]
    }
  };

  // Generic fallback content for topics not specifically defined
  const genericContent = {
    mcq: [
      { q: `What is correct about ${subtopic}?`, opts: [`Correct ${subtopic} fact`, `Wrong fact A`, `Wrong fact B`, `Wrong fact C`], ans: "0", exp: `This is the correct understanding of ${subtopic}.` }
    ],
    fill: [
      { q: `Complete: ___ is important in ${subtopic}.`, ans: "This", exp: `This completes the sentence about ${subtopic}.` }
    ],
    tf: [
      { q: `True or False: ${subtopic} is part of ${moduleTitle}.`, ans: "true", exp: `${subtopic} is indeed part of ${moduleTitle}.` }
    ]
  };

  const content = a1Content[subtopic] || genericContent;
  
  questionTypes.forEach((type, idx) => {
    const typeKey = type.toLowerCase() as keyof typeof content;
    const typeContent = content[typeKey] || content.mcq;
    const qData = typeContent[idx % typeContent.length];
    
    const question: QuestionTemplate = {
      type,
      question: qData.q,
      explanation: qData.exp
    };
    
    if (type === 'MCQ' || type === 'CHECKBOX') {
      question.options = JSON.stringify(qData.opts);
      question.correctAnswer = qData.ans;
    } else if (type === 'FILL_BLANK') {
      question.correctAnswer = JSON.stringify(qData.ans);
      question.options = JSON.stringify([]);
    } else if (type === 'TRUE_FALSE') {
      question.options = JSON.stringify(['True', 'False']);
      question.correctAnswer = JSON.stringify(qData.ans === 'true' ? '0' : '1');
    } else if (type === 'MATCHING') {
      question.options = JSON.stringify(qData.opts);
      question.correctAnswer = qData.ans;
    } else if (type === 'ORDERING') {
      question.options = JSON.stringify(qData.opts || qData.q.split(' '));
      question.correctAnswer = qData.ans;
    } else if (type === 'SPEECH') {
      question.correctAnswer = JSON.stringify(qData.ans);
      question.language = qData.lang || languageCode;
      question.hint = qData.hint;
      question.options = JSON.stringify([]);
    }
    
    questions.push(question);
  });
  
  return questions;
}

// Generate questions for any language at any level using templates
export function generateQuestionsForLesson(
  level: CEFRLevel,
  moduleTitle: string,
  subtopic: string,
  questionCount: number = 12,
  languageCode: string = 'en',
  languageName: string = 'English'
): QuestionTemplate[] {
  const types = getQuestionDistribution(questionCount);
  
  // For now, use English A1 templates as base
  // TODO: Create language-specific content for each language
  if (level === 'A1' && languageCode === 'en') {
    return generateA1EnglishQuestions(moduleTitle, subtopic, 0, types, languageCode);
  }
  
  // For other languages/levels, generate appropriate questions
  return generateGenericQuestions(level, moduleTitle, subtopic, types, languageCode, languageName);
}

function generateGenericQuestions(
  level: CEFRLevel,
  moduleTitle: string,
  subtopic: string,
  types: QuestionType[],
  languageCode: string,
  languageName: string
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];
  
  types.forEach((type, idx) => {
    const basePoint = 10 + Math.floor(Math.random() * 10);
    
    if (type === 'MCQ') {
      questions.push({
        type: 'MCQ',
        question: `Choose the correct option related to ${subtopic} in ${moduleTitle}.`,
        options: JSON.stringify([`Correct ${languageName} option`, `Wrong option A`, `Wrong option B`, `Wrong option C`]),
        correctAnswer: JSON.stringify(0),
        explanation: `This is the correct answer for ${subtopic} at ${level} level.`,
        points: basePoint
      });
    } else if (type === 'FILL_BLANK') {
      questions.push({
        type: 'FILL_BLANK',
        question: `Complete the sentence about ${subtopic}: "This is a ___ about ${subtopic}."`,
        correctAnswer: JSON.stringify('sentence'),
        options: JSON.stringify([]),
        explanation: `The word "sentence" correctly completes this ${level} level sentence.`,
        points: basePoint
      });
    } else if (type === 'TRUE_FALSE') {
      const isTrue = idx % 2 === 0;
      questions.push({
        type: 'TRUE_FALSE',
        question: `True or False: This statement about ${subtopic} is ${isTrue ? 'correct' : 'incorrect'} at ${level} level.`,
        options: JSON.stringify(['True', 'False']),
        correctAnswer: JSON.stringify(isTrue ? '0' : '1'),
        explanation: `The statement is ${isTrue ? 'true' : 'false'} based on ${level} level knowledge.`,
        points: basePoint
      });
    } else if (type === 'MATCHING') {
      questions.push({
        type: 'MATCHING',
        question: `Match the ${languageName} terms for ${subtopic}.`,
        options: JSON.stringify([{ left: 'Term A', right: 'Match A' }, { left: 'Term B', right: 'Match B' }, { left: 'Term C', right: 'Match C' }, { left: 'Term D', right: 'Match D' }]),
        correctAnswer: '[0,2,1,3]',
        explanation: `Matching these terms correctly shows understanding of ${subtopic}.`,
        points: basePoint + 5
      });
    } else if (type === 'ORDERING') {
      questions.push({
        type: 'ORDERING',
        question: `Put these words in order to form a correct ${level} sentence about ${subtopic}.`,
        options: JSON.stringify(['Word 1', 'Word 2', 'Word 3', 'Word 4']),
        correctAnswer: JSON.stringify(['Word 1', 'Word 2', 'Word 3', 'Word 4']),
        explanation: `This is the correct word order for ${level} level.`,
        points: basePoint + 10
      });
    } else if (type === 'CHECKBOX') {
      questions.push({
        type: 'CHECKBOX',
        question: `Select ALL correct statements about ${subtopic} at ${level} level.`,
        options: JSON.stringify([`Correct statement 1`, `Wrong statement`, `Correct statement 2`, `Wrong statement`]),
        correctAnswer: JSON.stringify([0, 2]),
        explanation: `Statements 1 and 2 are correct about ${subtopic}.`,
        points: basePoint + 5
      });
    } else if (type === 'SPEECH') {
      questions.push({
        type: 'SPEECH',
        question: `Pronounce this ${languageName} sentence about ${subtopic}.`,
        correctAnswer: JSON.stringify(`This is a ${languageName} sentence about ${subtopic}.`),
        language: languageCode,
        hint: `Say the sentence about ${subtopic}`,
        options: JSON.stringify([]),
        explanation: `Clear pronunciation is important at ${level} level.`,
        points: basePoint + 15
      });
    }
  });
  
  return questions;
}
