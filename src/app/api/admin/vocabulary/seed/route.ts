import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const defaultVocabularyData = [
  // English - Beginner
  {
    title: "Basic English Words",
    description: "Essential English vocabulary for beginners. Perfect for everyday conversations.",
    language: "en",
    difficulty: "BEGINNER",
    xpReward: 10,
    gemReward: 2,
    words: [
      { word: "Hello", definition: "A greeting used when meeting someone", partOfSpeech: "interjection", pronunciation: "heh-LOH", exampleSentence: "Hello, how are you?", synonyms: "Hi, Hey", antonyms: "Goodbye" },
      { word: "Goodbye", definition: "A farewell said when leaving", partOfSpeech: "interjection", pronunciation: "good-BYE", exampleSentence: "Goodbye, see you tomorrow!", synonyms: "Bye, Farewell", antonyms: "Hello" },
      { word: "Thank you", definition: "An expression of gratitude", partOfSpeech: "phrase", pronunciation: "THANK yoo", exampleSentence: "Thank you for your help.", synonyms: "Thanks, Appreciate", antonyms: "" },
      { word: "Please", definition: "Used to make a polite request", partOfSpeech: "adverb", pronunciation: "pleez", exampleSentence: "Please pass the salt.", synonyms: "Kindly", antonyms: "" },
      { word: "Sorry", definition: "An apology or expression of regret", partOfSpeech: "interjection", pronunciation: "SOR-ee", exampleSentence: "Sorry, I didn't mean to interrupt.", synonyms: "Apologize, Excuse me", antonyms: "" },
      { word: "Welcome", definition: "To greet or receive someone gladly", partOfSpeech: "verb", pronunciation: "WEL-kum", exampleSentence: "Welcome to our home!", synonyms: "Greet", antonyms: "" },
      { word: "Excuse me", definition: "A polite phrase to get attention", partOfSpeech: "phrase", pronunciation: "ik-SKYOOZ mee", exampleSentence: "Excuse me, where is the library?", synonyms: "Pardon, Sorry", antonyms: "" },
      { word: "Yes", definition: "An affirmative response", partOfSpeech: "adverb", pronunciation: "yes", exampleSentence: "Yes, I agree with you.", synonyms: "Aye, Sure", antonyms: "No" },
      { word: "No", definition: "A negative response", partOfSpeech: "adverb", pronunciation: "noh", exampleSentence: "No, I don't want any.", synonyms: "Nah, Nope", antonyms: "Yes" },
      { word: "Help", definition: "To assist or support someone", partOfSpeech: "verb", pronunciation: "help", exampleSentence: "Can you help me with this?", synonyms: "Assist, Aid", antonyms: "Hurt" },
    ]
  },
  // English - Intermediate
  {
    title: "Common English Idioms",
    description: "Understand and use popular English idioms and expressions.",
    language: "en",
    difficulty: "INTERMEDIATE",
    xpReward: 15,
    gemReward: 3,
    words: [
      { word: "Break a leg", definition: "Good luck (often used before performances)", partOfSpeech: "idiom", pronunciation: "BRAYK ah leg", exampleSentence: "Break a leg in your exam!", synonyms: "Good luck", antonyms: "" },
      { word: "Bite the bullet", definition: "To face a difficult situation", partOfSpeech: "idiom", pronunciation: "BYET the BUL-it", exampleSentence: "I bit the bullet and told her the truth.", synonyms: "Face it", antonyms: "" },
      { word: "Cost an arm and a leg", definition: "To be very expensive", partOfSpeech: "idiom", pronunciation: "KOST an arm and a leg", exampleSentence: "That car costs an arm and a leg.", synonyms: "Be pricey", antonyms: "Be cheap" },
      { word: "Hit the nail on the head", definition: "To be exactly right", partOfSpeech: "idiom", pronunciation: "HIT the nayl on the hed", exampleSentence: "You hit the nail on the head!", synonyms: "Be correct", antonyms: "" },
      { word: "Kill two birds with one stone", definition: "Achieve two goals at once", partOfSpeech: "idiom", pronunciation: "KIL too bdrz with wun stayn", exampleSentence: "I killed two birds with one stone.", synonyms: "Achieve two goals", antonyms: "" },
      { word: "Once in a blue moon", definition: "Something very rare", partOfSpeech: "idiom", pronunciation: "WUNS in a bloo moon", exampleSentence: "He visits once in a blue moon.", synonyms: "Rarely, Seldom", antonyms: "Often" },
      { word: "Piece of cake", definition: "Something very easy", partOfSpeech: "idiom", pronunciation: "PEES of kayk", exampleSentence: "The test was a piece of cake.", synonyms: "Easy, Simple", antonyms: "Difficult" },
      { word: "Under the weather", definition: "Feeling sick or unwell", partOfSpeech: "idiom", pronunciation: "UN-der the WETH-er", exampleSentence: "I'm feeling under the weather today.", synonyms: "Sick, Ill", antonyms: "Healthy" },
    ]
  },
  // Yoruba - Beginner
  {
    title: "Basic Yoruba Greetings",
    description: "Learn common Yoruba greetings and responses.",
    language: "yo",
    difficulty: "BEGINNER",
    xpReward: 12,
    gemReward: 2,
    words: [
      { word: "Ẹ̀ nlá", definition: "Good morning", partOfSpeech: "greeting", pronunciation: "eh N-LA", exampleSentence: "Ẹ̀ nlá, kí ni àwọn rẹ̀?", synonyms: "", antonyms: "" },
      { word: "Ẹ̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀́́", definition: "How are you?", partOfSpeech: "greeting", pronunciation: "keh nee", exampleSentence: "Kí nǐ sẹ̀?", synonyms: "", antonyms: "" },
      { word: "Moòdímú", definition: "I am fine", partOfSpeech: "response", pronunciation: "moh-OH-dee-moo", exampleSentence: "Moòdímú, óòrùn", synonyms: "", antonyms: "" },
      { word: "Ẹ kúrọ̀", definition: "Thank you", partOfSpeech: "greeting", pronunciation: "eh KOO-ro", exampleSentence: "Ẹ kúrọ̀ nǐu!", synonyms: "", antonyms: "" },
      { word: "Ọ̀la ọ̀nà", definition: "Good afternoon", partOfSpeech: "greeting", pronunciation: "OH-la OH-na", exampleSentence: "Ọ̀la ọ̀nà", synonyms: "", antonyms: "" },
      { word: "Ẹ̀kùọ́", definition: "Good evening", partOfSpeech: "greeting", pronunciation: "eh-KOO-ro", exampleSentence: "Ẹ̀kùọ́", synonyms: "", antonyms: "" },
      { word: "Ìrìn àti", definition: "Goodbye", partOfSpeech: "greeting", pronunciation: "ee-ree-N ah-tee", exampleSentence: "Ìrìn àti!", synonyms: "", antonyms: "" },
      { word: "Báwo ni", definition: "How do you do?", partOfSpeech: "greeting", pronunciation: "BAH-woh nee", exampleSentence: "Báwo ni?", synonyms: "", antonyms: "" },
    ]
  },
  // French - Beginner
  {
    title: "Basic French Phrases",
    description: "Essential French phrases for travelers.",
    language: "fr",
    difficulty: "BEGINNER",
    xpReward: 12,
    gemReward: 2,
    words: [
      { word: "Bonjour", definition: "Hello / Good morning", partOfSpeech: "greeting", pronunciation: "bohn-ZHOOR", exampleSentence: "Bonjour, comment allez-vous?", synonyms: "", antonyms: "Bonsoir" },
      { word: "Merci", definition: "Thank you", partOfSpeech: "greeting", pronunciation: "mehr-SEE", exampleSentence: "Merci beaucoup!", synonyms: "Merci beaucoup", antonyms: "" },
      { word: "S'il vous plaît", definition: "Please", partOfSpeech: "phrase", pronunciation: "seel voo PLEH", exampleSentence: "S'il vous plaît, aidez-moi.", synonyms: "", antonyms: "" },
      { word: "Au revoir", definition: "Goodbye", partOfSpeech: "greeting", pronunciation: "oh reh-VWAHR", exampleSentence: "Au revoir, à bientôt!", synonyms: "", antonyms: "Bonjour" },
      { word: "Oui", definition: "Yes", partOfSpeech: "adverb", pronunciation: "wee", exampleSentence: "Oui, je comprends.", synonyms: "", antonyms: "Non" },
      { word: "Non", definition: "No", partOfSpeech: "adverb", pronunciation: "nohn", exampleSentence: "Non, merci.", synonyms: "", antonyms: "Oui" },
      { word: "Excusez-moi", definition: "Excuse me", partOfSpeech: "phrase", pronunciation: "ex-koo-zay-MWAH", exampleSentence: "Excusez-moi, où est...?", synonyms: "", antonyms: "" },
      { word: "Comment ça va?", definition: "How are you?", partOfSpeech: "phrase", pronunciation: "koh-MOHN sah VAH", exampleSentence: "Comment ça va aujourd'hui?", synonyms: "", antonyms: "" },
    ]
  },
]

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { seedDefault = true } = body

    if (!seedDefault) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const createdSets: Awaited<ReturnType<typeof db.vocabularySet.create>>[] = []
    
    for (const setData of defaultVocabularyData) {
      const existing = await db.vocabularySet.findFirst({
        where: { title: setData.title },
      })

      if (!existing) {
        const createdSet = await db.vocabularySet.create({
          data: {
            title: setData.title,
            description: setData.description,
            language: setData.language,
            difficulty: setData.difficulty,
            xpReward: setData.xpReward,
            gemReward: setData.gemReward,
            isActive: true,
          },
        })

        for (const wordData of setData.words) {
          await db.vocabularyWord.create({
            data: {
              vocabularySetId: createdSet.id,
              word: wordData.word,
              definition: wordData.definition,
              partOfSpeech: wordData.partOfSpeech,
              pronunciation: wordData.pronunciation,
              exampleSentence: wordData.exampleSentence,
              synonyms: wordData.synonyms || null,
              antonyms: wordData.antonyms || null,
            },
          })
        }

        createdSets.push(createdSet)
      }
    }

    return NextResponse.json({ 
      message: `Created ${createdSets.length} vocabulary sets with words`,
      sets: createdSets,
    })
  } catch (error: any) {
    console.error('Seed vocabulary error:', error)
    return NextResponse.json(
      { error: error.message || "Failed to seed vocabulary" },
      { status: 500 }
    )
  }
}