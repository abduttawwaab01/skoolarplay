import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries')
}

const storyData = [
  {
    level: 'A1',
    readingLevel: 'BEGINNER',
    languageCode: 'en',
    stories: [
      {
        title: "A Day at the Market",
        character: "Adaeze",
        setting: "Local Market, Lagos",
        mood: "EDUCATIONAL",
        estimatedReadingTime: 3,
        chapters: [
          {
            title: "Going to the Market",
            narrative: "Adaeze wakes up early in the morning. The sun is shining brightly. Today is market day. She takes her basket and walks to the market. The market is very busy. Many people are buying and selling. Adaeze sees fresh tomatoes and peppers. She buys two kilograms of tomatoes. She also buys onions and garlic. The seller is very friendly. Adaeze pays and goes home happy.",
            vocabulary: [
              { word: "basket", translation: "A container used for carrying things", context: "She takes her basket" },
              { word: "busy", translation: "Having a lot of activity", context: "The market is very busy" },
              { word: "friendly", translation: "Kind and pleasant", context: "The seller is very friendly" },
            ],
            questions: [
              {
                text: "Why does Adaeze go to the market?",
                options: ["To buy food items", "To meet her friends", "To sell tomatoes", "To go for a walk"],
                correctIndex: 0,
                explanation: "Adaeze goes to the market to buy food items like tomatoes, onions, and garlic.",
              },
              {
                text: "How many kilograms of tomatoes does Adaeze buy?",
                options: ["One kilogram", "Two kilograms", "Three kilograms", "Five kilograms"],
                correctIndex: 1,
                explanation: "The story says she buys two kilograms of tomatoes.",
              },
            ],
          },
          {
            title: "Cooking the Food",
            narrative: "Adaeze arrives home. She puts the basket on the table. Her children are waiting. She starts cooking. She washes the tomatoes and chops the onions. The kitchen smells wonderful. The children are excited. Soon, the food is ready. The family sits together and eats. They are happy and thankful.",
            vocabulary: [
              { word: "chops", translation: "Cuts into small pieces", context: "She chops the onions" },
              { word: "wonderful", translation: "Very good or pleasing", context: "The kitchen smells wonderful" },
              { word: "thankful", translation: "Feeling gratitude", context: "They are happy and thankful" },
            ],
            questions: [
              {
                text: "What does Adaeze do when she arrives home?",
                options: ["She goes to sleep", "She starts cooking", "She watches TV", "She calls her friend"],
                correctIndex: 1,
                explanation: "When Adaeze arrives home, she starts cooking the food she bought.",
              },
            ],
          },
        ],
      },
      {
        title: "My First Day at School",
        character: "Emeka",
        setting: "Primary School, Abuja",
        mood: "EDUCATIONAL",
        estimatedReadingTime: 3,
        chapters: [
          {
            title: "Morning Preparations",
            narrative: "Emeka is six years old. Today is his first day at school. His mother helps him put on his new uniform. The uniform is blue and white. He looks very smart. His father gives him a new bag. The bag has books and pencils inside. Emeka is a little nervous but also excited. He waves goodbye to his mother and gets into the car.",
            vocabulary: [
              { word: "uniform", translation: "Special clothes worn by students", context: "His new uniform is blue and white" },
              { word: "smart", translation: "Neat and well-dressed", context: "He looks very smart" },
              { word: "nervous", translation: "Feeling worried or anxious", context: "Emeka is a little nervous" },
            ],
            questions: [
              {
                text: "How old is Emeka?",
                options: ["Five years old", "Six years old", "Seven years old", "Eight years old"],
                correctIndex: 1,
                explanation: "The story says Emeka is six years old.",
              },
              {
                text: "What color is Emeka's uniform?",
                options: ["Red and white", "Green and white", "Blue and white", "Black and white"],
                correctIndex: 2,
                explanation: "Emeka's uniform is blue and white.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 'A2',
    readingLevel: 'BEGINNER',
    languageCode: 'en',
    stories: [
      {
        title: "The Lost Phone",
        character: "Fatima",
        setting: "Shopping Mall, Kano",
        mood: "MYSTERY",
        estimatedReadingTime: 5,
        chapters: [
          {
            title: "A Busy Afternoon",
            narrative: "Fatima loved her phone. It was a gift from her brother who lived abroad. She used it to talk to him every week. One Saturday afternoon, Fatima went to the mall with her friends. They visited three different shops. Fatima tried on a beautiful dress and took many photos. When they reached the food court, Fatima reached for her phone to take a picture of their lunch. But her pocket was empty. Her heart sank. \"My phone is gone!\" she cried.",
            vocabulary: [
              { word: "abroad", translation: "In a foreign country", context: "Her brother who lived abroad" },
              { word: "food court", translation: "An area in a mall with many restaurants", context: "They reached the food court" },
              { word: "sank", translation: "Fell down suddenly (here: felt very sad)", context: "Her heart sank" },
            ],
            questions: [
              {
                text: "Who gave Fatima her phone?",
                options: ["Her mother", "Her father", "Her brother", "Her friend"],
                correctIndex: 2,
                explanation: "The phone was a gift from her brother who lived abroad.",
              },
              {
                text: "Where did Fatima realize her phone was missing?",
                options: ["At the first shop", "In the car", "At the food court", "At home"],
                correctIndex: 2,
                explanation: "Fatima realized her phone was missing when they reached the food court.",
              },
            ],
          },
          {
            title: "The Search Begins",
            narrative: "Fatima's friends immediately started helping. Amina retraced their steps back to the dress shop. Chidi asked the security guards. Fatima called her own number from Amina's phone. After five rings, someone answered. \"Hello?\" said a woman's voice. \"I found this phone near the fitting rooms. Please come to the information desk.\" Fatima ran to the information desk. There was her phone, safe and sound. The woman who found it was a teacher named Mrs. Okon. Fatima thanked her many times. Mrs. Okon smiled and said, \"I know how important this must be to you.\"",
            vocabulary: [
              { word: "retraced", translation: "Went back over the same path", context: "Amina retraced their steps" },
              { word: "fitting rooms", translation: "Rooms where you try on clothes", context: "Near the fitting rooms" },
              { word: "safe and sound", translation: "Completely unharmed", context: "There was her phone, safe and sound" },
            ],
            questions: [
              {
                text: "Who found Fatima's phone?",
                options: ["A security guard", "A teacher named Mrs. Okon", "The shop owner", "One of her friends"],
                correctIndex: 1,
                explanation: "A teacher named Mrs. Okon found the phone near the fitting rooms.",
              },
              {
                text: "What did Fatima do to find her phone?",
                options: ["She called the police", "She called her own number", "She posted on social media", "She went home"],
                correctIndex: 1,
                explanation: "Fatima called her own number from Amina's phone.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 'B1',
    readingLevel: 'INTERMEDIATE',
    languageCode: 'en',
    stories: [
      {
        title: "The Bridge Between Two Worlds",
        character: "Chidi",
        setting: "Village and City, Nigeria",
        mood: "DRAMA",
        estimatedReadingTime: 8,
        chapters: [
          {
            title: "Leaving Home",
            narrative: "Chidi grew up in a small village in Anambra State. Life was simple but meaningful. Every morning, he helped his father tend the farm. The soil was rich, and the yams grew tall and strong. His mother taught him the old stories of their ancestors. But Chidi dreamed of something more. He wanted to study engineering and build things that would last. When the university acceptance letter arrived, the whole village celebrated. His mother cried tears of joy. His father placed a hand on his shoulder and said, \"Make us proud, but never forget where you come from.\" Chidi packed his bags the next morning, carrying both excitement and uncertainty.",
            vocabulary: [
              { word: "meaningful", translation: "Having great significance or purpose", context: "Life was simple but meaningful" },
              { word: "ancestors", translation: "Family members from past generations", context: "The old stories of their ancestors" },
              { word: "uncertainty", translation: "The state of being unsure", context: "Carrying both excitement and uncertainty" },
            ],
            questions: [
              {
                text: "What did Chidi want to study?",
                options: ["Medicine", "Engineering", "Law", "Agriculture"],
                correctIndex: 1,
                explanation: "Chidi wanted to study engineering and build things that would last.",
              },
              {
                text: "What advice did Chidi's father give him?",
                options: ["Work hard and become rich", "Make us proud but never forget your roots", "Send money home every month", "Stay in the city permanently"],
                correctIndex: 1,
                explanation: "His father said: 'Make us proud, but never forget where you come from.'",
              },
            ],
          },
          {
            title: "City Life",
            narrative: "The city was overwhelming. Buildings towered above like giants, and the noise never stopped. Chidi struggled at first. His English wasn't as fluent as the city students. He couldn't afford the latest gadgets or fashionable clothes. Some classmates looked down on him. But Chidi had something they didn't: determination. He studied late into the night, using the library's free Wi-Fi to access research papers. He joined the engineering club and slowly made friends. By his second year, he was leading a project to design a low-cost water filtration system for rural communities. It was his way of bridging the two worlds he belonged to.",
            vocabulary: [
              { word: "overwhelming", translation: "Very intense or difficult to handle", context: "The city was overwhelming" },
              { word: "fluent", translation: "Able to speak smoothly and easily", context: "His English wasn't as fluent" },
              { word: "determination", translation: "Firmness of purpose; resolve", context: "Chidi had determination" },
              { word: "bridging", translation: "Connecting two things", context: "Bridging the two worlds" },
            ],
            questions: [
              {
                text: "What was Chidi's project about?",
                options: ["Building a new campus", "Designing a water filtration system", "Creating a mobile app", "Starting a business"],
                correctIndex: 1,
                explanation: "Chidi led a project to design a low-cost water filtration system for rural communities.",
              },
              {
                text: "How did Chidi overcome his struggles?",
                options: ["He went back to the village", "He borrowed money from friends", "Through determination and hard work", "He changed his course of study"],
                correctIndex: 2,
                explanation: "Chidi overcame struggles through determination, studying late and using available resources.",
              },
            ],
          },
          {
            title: "Coming Full Circle",
            narrative: "Five years later, Chidi returned to his village as a qualified engineer. But he wasn't alone. He brought with him a team of engineers and enough materials to build the water filtration system he had designed. The village elders gathered under the old iroko tree as Chidi explained his plans. His father stood at the back, pride written across his face. The system was installed within three months. For the first time in history, the village had clean, safe drinking water without walking miles to the river. Chidi didn't stop there. He set up a training program to teach young people from the village basic engineering skills. \"Education took me away from home,\" he told them. \"But it's the same education that brought me back. Use it wisely.\"",
            vocabulary: [
              { word: "qualified", translation: "Having completed necessary training or education", context: "A qualified engineer" },
              { word: "elders", translation: "Older, respected members of a community", context: "The village elders gathered" },
              { word: "iroko", translation: "A large African tree, often culturally significant", context: "Under the old iroko tree" },
            ],
            questions: [
              {
                text: "What did Chidi bring back to his village?",
                options: ["Money and cars", "A water filtration system and a team of engineers", "Books and computers", "New farming equipment"],
                correctIndex: 1,
                explanation: "Chidi brought a team of engineers and materials to build the water filtration system.",
              },
              {
                text: "What message did Chidi give to the young people?",
                options: ["Leave the village as soon as possible", "Education can help you serve your community", "Become rich and move to the city", "Forget about the old traditions"],
                correctIndex: 1,
                explanation: "Chidi said: 'Education took me away from home, but it's the same education that brought me back. Use it wisely.'",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 'B2',
    readingLevel: 'INTERMEDIATE',
    languageCode: 'en',
    stories: [
      {
        title: "The Innovation Challenge",
        character: "Zara",
        setting: "Tech Hub, Lagos",
        mood: "ADVENTURE",
        estimatedReadingTime: 10,
        chapters: [
          {
            title: "The Opportunity",
            narrative: "Zara had been coding since she was fourteen. By twenty-three, she had built three apps, none of which gained significant traction. But she wasn't discouraged. Every failure taught her something new. One evening, while scrolling through tech news, she saw an announcement: the African Innovation Challenge, a competition offering $100,000 in seed funding to the best tech solution addressing healthcare access in rural areas. The deadline was six weeks away. Zara felt a familiar spark. She had an idea that had been brewing for months: a telemedicine platform that worked on basic feature phones, not just smartphones. The challenge was that it required a novel approach to user interface design, one that relied on voice prompts and USSD menus. She had never built anything like it. But she had six weeks to try.",
            vocabulary: [
              { word: "traction", translation: "Progress or momentum in business", context: "None of which gained significant traction" },
              { word: "telemedicine", translation: "Remote healthcare delivery using technology", context: "A telemedicine platform" },
              { word: "novel", translation: "New and original", context: "A novel approach to user interface design" },
              { word: "USSD", translation: "A protocol for sending text messages between mobile phones and applications", context: "USSD menus" },
            ],
            questions: [
              {
                text: "What was the African Innovation Challenge about?",
                options: ["Building better smartphones", "Addressing healthcare access in rural areas", "Creating social media apps", "Improving internet connectivity"],
                correctIndex: 1,
                explanation: "The challenge offered funding for the best tech solution addressing healthcare access in rural areas.",
              },
              {
                text: "What made Zara's idea unique?",
                options: ["It used artificial intelligence", "It worked on basic feature phones with voice prompts", "It was free for all users", "It connected doctors globally"],
                correctIndex: 1,
                explanation: "Zara's idea was a telemedicine platform that worked on basic feature phones using voice prompts and USSD menus.",
              },
            ],
          },
          {
            title: "The Building Phase",
            narrative: "Week one was research. Zara interviewed twenty healthcare workers in rural Ogun State. The insights were staggering: 78% of patients traveled over 20 kilometers to see a doctor, and most consultations were for conditions that could be handled remotely. But there was a catch: only 30% of the population owned smartphones. Feature phones, however, were nearly universal. Week two through four were a blur of coding, testing, and refining. Zara worked sixteen-hour days, surviving on instant noodles and determination. She built a voice-based symptom checker that users could access by dialing a number. The system would ask questions in Yoruba, Igbo, Hausa, or English, then connect patients to available doctors through a callback system. By week five, she had a working prototype. She tested it with fifty users in three villages. The feedback was overwhelmingly positive, but one issue kept surfacing: the voice recognition struggled with strong rural accents.",
            vocabulary: [
              { word: "staggering", translation: "Shocking or surprising", context: "The insights were staggering" },
              { word: "universal", translation: "Available to or used by everyone", context: "Feature phones were nearly universal" },
              { word: "prototype", translation: "An early model of a product", context: "She had a working prototype" },
              { word: "surfacing", translation: "Becoming apparent or known", context: "One issue kept surfacing" },
            ],
            questions: [
              {
                text: "What percentage of patients traveled over 20 kilometers to see a doctor?",
                options: ["50%", "65%", "78%", "90%"],
                correctIndex: 2,
                explanation: "Zara's research found that 78% of patients traveled over 20 kilometers to see a doctor.",
              },
              {
                text: "What problem did Zara discover during testing?",
                options: ["The app crashed frequently", "Voice recognition struggled with rural accents", "Users didn't have enough credit", "Doctors were unwilling to participate"],
                correctIndex: 1,
                explanation: "The voice recognition struggled with strong rural accents.",
              },
            ],
          },
          {
            title: "The Pitch",
            narrative: "Standing before the panel of judges, Zara felt the weight of six weeks of sleepless nights. The auditorium was filled with fifty other finalists, each with impressive presentations. But Zara had something different: real user data. She opened her presentation with a recording. A woman's voice in Yoruba described how she had used the service to get medical advice for her child's fever at 2 AM, without leaving her home. The room fell silent. Then Zara walked through the numbers: 500 active users across five villages, 89% satisfaction rate, average response time of 12 minutes. But more importantly, she told the stories behind the numbers. The elderly man who received diabetes management guidance. The pregnant woman who avoided complications through early consultation. The community health worker whose workload decreased by 40%. When she finished, the lead judge, a renowned Silicon Valley investor, leaned forward and asked: \"What do you need to scale this to a million users?\" Zara smiled. She had been waiting for this question. She pulled out a one-page roadmap and began to speak.",
            vocabulary: [
              { word: "panel", translation: "A group of judges or experts", context: "The panel of judges" },
              { word: "auditorium", translation: "A large room for public gatherings", context: "The auditorium was filled" },
              { word: "renowned", translation: "Famous and respected", context: "A renowned Silicon Valley investor" },
              { word: "scale", translation: "Expand to serve more users", context: "What do you need to scale this" },
              { word: "roadmap", translation: "A plan for achieving goals", context: "She pulled out a one-page roadmap" },
            ],
            questions: [
              {
                text: "What did Zara use to open her presentation?",
                options: ["A financial report", "A recording of a user's experience", "A technical diagram", "A video of her team"],
                correctIndex: 1,
                explanation: "Zara opened with a recording of a woman in Yoruba describing how she used the service.",
              },
              {
                text: "What was the average response time of Zara's platform?",
                options: ["5 minutes", "12 minutes", "30 minutes", "1 hour"],
                correctIndex: 1,
                explanation: "The platform had an average response time of 12 minutes.",
              },
              {
                text: "What question did the lead judge ask?",
                options: ["How much did it cost to build?", "What do you need to scale to a million users?", "Who are your competitors?", "When will you expand internationally?"],
                correctIndex: 1,
                explanation: "The judge asked: 'What do you need to scale this to a million users?'",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 'C1',
    readingLevel: 'ADVANCED',
    languageCode: 'en',
    stories: [
      {
        title: "The Language Keeper",
        character: "Nneka",
        setting: "University and Village, Southeast Nigeria",
        mood: "DRAMA",
        estimatedReadingTime: 12,
        chapters: [
          {
            title: "The Discovery",
            narrative: "Dr. Nneka Okafor had spent fifteen years studying linguistic anthropology. Her research had taken her to six continents, documenting dying languages and the cultural knowledge embedded within them. But it was a conversation with her grandmother that changed the trajectory of her career. During a visit home for the New Yam Festival, Nneka noticed that her grandmother was switching between Igbo and English with increasing frequency. The old proverbs, once the backbone of Igbo oral tradition, were being forgotten by the younger generation. When Nneka asked her ten-year-old niece to translate a common saying, the girl stared blankly. That moment crystallized something for Nneka: she had been traveling the world documenting other people's languages while her own was slipping away in her homeland. She made a decision that evening. She would dedicate the next decade to creating a comprehensive digital archive of Igbo language, culture, and oral literature. It would be the most ambitious linguistic preservation project ever undertaken for an African language.",
            vocabulary: [
              { word: "trajectory", translation: "The path or direction of development", context: "Changed the trajectory of her career" },
              { word: "proverbs", translation: "Traditional sayings expressing common truths", context: "The old proverbs were being forgotten" },
              { word: "crystallized", translation: "Became clear and definite", context: "That moment crystallized something" },
              { word: "ambitious", translation: "Requiring great effort and determination", context: "The most ambitious linguistic preservation project" },
            ],
            questions: [
              {
                text: "What realization changed Nneka's career direction?",
                options: ["She wanted to study more languages", "Her own language was disappearing while she studied others", "She needed more funding for her research", "Universities weren't interested in African languages"],
                correctIndex: 1,
                explanation: "Nneka realized she was documenting other people's languages while her own Igbo language was slipping away.",
              },
              {
                text: "What did Nneka decide to create?",
                options: ["A new language learning app", "A comprehensive digital archive of Igbo language and culture", "A university department", "A dictionary for children"],
                correctIndex: 1,
                explanation: "She decided to create a comprehensive digital archive of Igbo language, culture, and oral literature.",
              },
            ],
          },
          {
            title: "The Work",
            narrative: "The project, which Nneka named \"Okwu Ndu\" (Words of Life), began modestly. She recruited twenty graduate students from the University of Nigeria, Nsukka, and equipped them with audio recorders and cameras. Their mission: travel to every Igbo-speaking community and record the elders speaking, storytelling, and performing rituals. The first year yielded over 5,000 hours of audio recordings. But the real challenge was preservation. Audio files degraded. Metadata was inconsistently entered. Some recordings were made in dialects that even native speakers struggled to understand. Nneka brought in linguists, computer scientists, and cultural experts to develop a standardized framework. They created a searchable database with phonetic transcriptions, English translations, and cultural annotations. They built a mobile app that allowed users to hear proverbs spoken by native speakers, complete with contextual explanations. By year three, the database contained recordings from 347 communities, covering forty-two distinct Igbo dialects. The project gained international recognition. UNESCO invited Nneka to present at their Language Preservation Summit in Paris.",
            vocabulary: [
              { word: "modestly", translation: "On a small or humble scale", context: "The project began modestly" },
              { word: "rituals", translation: "Ceremonial acts with cultural significance", context: "Recording elders performing rituals" },
              { word: "degraded", translation: "Deteriorated in quality", context: "Audio files degraded" },
              { word: "phonetic", translation: "Relating to speech sounds", context: "Phonetic transcriptions" },
              { word: "annotations", translation: "Explanatory notes or comments", context: "Cultural annotations" },
            ],
            questions: [
              {
                text: "How many hours of audio did the first year produce?",
                options: ["1,000 hours", "3,000 hours", "5,000 hours", "10,000 hours"],
                correctIndex: 2,
                explanation: "The first year yielded over 5,000 hours of audio recordings.",
              },
              {
                text: "How many Igbo dialects were covered by year three?",
                options: ["15 dialects", "28 dialects", "42 dialects", "100 dialects"],
                correctIndex: 2,
                explanation: "By year three, the database covered forty-two distinct Igbo dialects.",
              },
            ],
          },
          {
            title: "The Legacy",
            narrative: "At the UNESCO summit, Nneka stood before an audience of world leaders, linguists, and cultural preservationists. She didn't present charts or statistics. Instead, she played a recording. It was the voice of a 94-year-old woman from a village in Abia State, reciting a creation myth that had never been written down. The woman's voice trembled with age, but the words flowed with the rhythm of centuries. When the recording ended, the room was utterly silent. Then the applause began. But Nneka's mind was elsewhere. She was thinking about the next phase of the project. The database was complete, but accessibility remained a challenge. Rural communities without internet couldn't access what had been collected in their name. She announced that Okwu Ndu would be transitioning to an offline-first model, with solar-powered audio stations deployed to every community that had contributed. \"Language is not a museum exhibit,\" she said. \"It is a living thing. Our job is not to preserve it behind glass, but to ensure it continues to breathe.\" Five years later, when Nneka returned to her grandmother's village, she found children gathered around one of the audio stations, learning proverbs in a language they had nearly lost. Her grandmother, now 102, sat nearby, smiling. The circle was complete.",
            vocabulary: [
              { word: "myth", translation: "A traditional story explaining beliefs or natural phenomena", context: "A creation myth" },
              { word: "accessibility", translation: "The quality of being easy to reach or use", context: "Accessibility remained a challenge" },
              { word: "offline-first", translation: "Designed to work without internet connection", context: "Transitioning to an offline-first model" },
              { word: "deployed", translation: "Sent out for use", context: "Audio stations deployed to communities" },
            ],
            questions: [
              {
                text: "What did Nneka play at the UNESCO summit?",
                options: ["A statistical analysis", "A recording of a 94-year-old woman reciting a creation myth", "A video of the project team", "A presentation about funding"],
                correctIndex: 1,
                explanation: "She played a recording of a 94-year-old woman from Abia State reciting a creation myth.",
              },
              {
                text: "What was Nneka's philosophy about language preservation?",
                options: ["Languages should be kept in museums", "Language should continue to live and breathe in communities", "Only written languages matter", "Technology should replace traditional language learning"],
                correctIndex: 1,
                explanation: "Nneka said: 'Our job is not to preserve it behind glass, but to ensure it continues to breathe.'",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 'C2',
    readingLevel: 'ADVANCED',
    languageCode: 'en',
    stories: [
      {
        title: "The Architecture of Memory",
        character: "Kwame",
        setting: "Accra and London",
        mood: "DRAMA",
        estimatedReadingTime: 15,
        chapters: [
          {
            title: "The Commission",
            narrative: "Professor Kwame Asante received the commission on a Tuesday morning, delivered via a letter embossed with the gold seal of the British Museum. They wanted him to design a new wing dedicated to African artifacts, specifically those acquired during the colonial period. The irony was not lost on him. Kwame had spent his entire academic career arguing for the repatriation of these very objects, publishing papers that dismantled the museum's provenance claims with forensic precision. And now they were asking him to help them display the loot more elegantly. He read the letter three times, each pass revealing new layers of implication. The salary was extraordinary. The creative freedom was unprecedented. And the potential to reshape the narrative from within was intoxicating. But at what cost? Would accepting make him complicit in the institutional erasure he had devoted his life to fighting? Or would it provide a platform powerful enough to accelerate the repatriation movement? He sat in his study overlooking the Atlantic, the letter heavy in his hands, and began to weigh the architecture of his convictions against the architecture of opportunity.",
            vocabulary: [
              { word: "embossed", translation: "Raised in relief from a surface", context: "A letter embossed with the gold seal" },
              { word: "repatriation", translation: "Return of something to its country of origin", context: "Arguing for the repatriation of objects" },
              { word: "provenance", translation: "The origin or source of something", context: "The museum's provenance claims" },
              { word: "complicit", translation: "Involved in wrongdoing", context: "Would accepting make him complicit" },
              { word: "intoxicating", translation: "Extremely exciting or thrilling", context: "The potential was intoxicating" },
            ],
            questions: [
              {
                text: "What was the irony of the commission?",
                options: ["Kwame needed the money but hated museums", "The museum asked someone who argued for repatriation to help display colonially acquired artifacts", "Kwame was British but designed for Africa", "The museum wanted to return all artifacts"],
                correctIndex: 1,
                explanation: "Kwame had spent his career arguing for repatriation, and now the museum wanted him to help display those same artifacts.",
              },
              {
                text: "What dilemma did Kwame face?",
                options: ["Whether to move to London or stay in Accra", "Whether accepting would make him complicit or give him a platform for change", "Whether to accept the salary or demand more", "Whether to design the wing or write a paper"],
                correctIndex: 1,
                explanation: "Kwame weighed whether accepting would make him complicit in institutional erasure or provide a platform to accelerate repatriation.",
              },
            ],
          },
          {
            title: "The Design",
            narrative: "Kwame accepted, but on his own terms. His proposal was radical: the new wing would not display the artifacts as isolated aesthetic objects, divorced from their cultural context. Instead, each piece would be presented alongside contemporary works by African artists, creating a dialogue across centuries. The Benin Bronzes would be flanked by video installations of modern Nigerian sculptors explaining what the bronzes meant to their communities. The Asante gold weights would be accompanied by interactive displays showing how traditional Akan economic systems operated, long before colonial currencies were imposed. Most controversially, Kwame designed an entire room as an empty space, labeled simply: \"The Absence.\" This room would contain nothing but a list of objects that communities had requested be repatriated, along with the reasons for those requests and the museum's responses. It was a space that monumentalized loss rather than possession. The museum's board was divided. Half saw it as genius; half saw it as sabotage. The director, a pragmatic woman named Dr. Elizabeth Hartwell, called Kwame into her office. \"Professor Asante,\" she said, \"you're asking us to build a museum wing that criticizes the museum itself.\" Kwame nodded. \"I'm asking you to build a museum wing that tells the truth.\"",
            vocabulary: [
              { word: "radical", translation: "Fundamental and extreme in approach", context: "His proposal was radical" },
              { word: "divorced", translation: "Separated or disconnected", context: "Divorced from their cultural context" },
              { word: "controversially", translation: "In a way that causes public disagreement", context: "Most controversially, Kwame designed" },
              { word: "monumentalized", translation: "Made into a monument or memorial", context: "A space that monumentalized loss" },
              { word: "pragmatic", translation: "Dealing with things practically", context: "A pragmatic woman named Dr. Hartwell" },
            ],
            questions: [
              {
                text: "What was radical about Kwame's proposal?",
                options: ["He wanted to return all artifacts immediately", "He displayed artifacts alongside contemporary African art creating cultural dialogue", "He designed a wing without any artifacts", "He refused to use any African materials"],
                correctIndex: 1,
                explanation: "Kwame proposed displaying artifacts alongside contemporary African works, creating a dialogue across centuries.",
              },
              {
                text: "What was \"The Absence\" room?",
                options: ["A room for storage", "An empty space listing objects requested for repatriation", "A room for visitors to rest", "A display of missing artifacts"],
                correctIndex: 1,
                explanation: "\"The Absence\" was an empty room containing a list of objects requested for repatriation, monumentalizing loss.",
              },
            ],
          },
          {
            title: "The Opening",
            narrative: "The wing opened on a cold November morning. The reviews were polarized. The Guardian called it \"a masterclass in institutional self-critique.\" The Telegraph described it as \"an act of cultural vandalism.\" But what mattered to Kwame was the response from the African diaspora. On the first weekend, over three thousand visitors from African communities across Europe came to see the wing. Many wept in \"The Absence\" room. An elderly Ghanaian man stood before the Asante gold weights for forty-five minutes, his granddaughter recording his reflections on her phone. \"My grandfather told me stories about these,\" he said. \"I never thought I'd see them. But seeing them here, like this, makes me understand what was taken and what remains.\" That evening, Kwame received an email from the museum's director. Three communities had formally requested the return of objects, using the framework Kwame had built into the exhibition itself. The wing was not just displaying history; it was actively reshaping the future of cultural repatriation. Kwame closed his laptop and looked out at the London skyline. Somewhere beyond the horizon, the Atlantic stretched back to Accra. He thought about the architecture of memory, how it could be both a prison and a bridge. He had chosen to build a bridge.",
            vocabulary: [
              { word: "polarized", translation: "Divided into opposing groups", context: "The reviews were polarized" },
              { word: "diaspora", translation: "People scattered from their original homeland", context: "The African diaspora" },
              { word: "framework", translation: "A supporting structure or system", context: "Using the framework Kwame had built" },
              { word: "repatriation", translation: "Return to one's country of origin", context: "The future of cultural repatriation" },
            ],
            questions: [
              {
                text: "What was the reaction of the African diaspora visitors?",
                options: ["They were indifferent", "Many were deeply moved, some wept in 'The Absence' room", "They protested the exhibition", "They demanded the museum be closed"],
                correctIndex: 1,
                explanation: "Over three thousand visitors came, many wept in 'The Absence' room, and were deeply moved.",
              },
              {
                text: "What happened as a result of the wing opening?",
                options: ["The museum closed down", "Three communities formally requested repatriation of objects", "Kwame was fired", "All artifacts were returned immediately"],
                correctIndex: 1,
                explanation: "Three communities formally requested the return of objects using the framework Kwame built into the exhibition.",
              },
              {
                text: "What metaphor did Kwame use to describe memory?",
                options: ["Memory is a book", "Memory can be both a prison and a bridge", "Memory is a river", "Memory is a building"],
                correctIndex: 1,
                explanation: "Kwame thought about how memory 'could be both a prison and a bridge' and chose to build a bridge.",
              },
            ],
          },
        ],
      },
    ],
  },
]

async function seedStories() {
  console.log('=========================================')
  console.log('📖 Seeding Story Mode Lessons...')
  console.log('=========================================')

  try {
    for (const levelData of storyData) {
      const course = await withRetry(() => prisma.course.findFirst({
        where: { title: { contains: `English ${levelData.level}` } }
      }))

      if (!course) {
        console.log(`⚠️ Course for ${levelData.level} not found, skipping`)
        continue
      }

      console.log(`\n📚 Processing ${levelData.level}...`)

      const modules = await withRetry(() => prisma.module.findMany({
        where: { courseId: course.id },
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } }
      }))

      if (modules.length === 0) continue

      const targetModule = modules[0]

      for (const story of levelData.stories) {
        const totalQuestions = story.chapters.reduce((sum, ch) => sum + (ch.questions?.length || 0), 0)

        const lesson = await withRetry(() => prisma.lesson.create({
          data: {
            title: `Story: ${story.title}`,
            moduleId: targetModule.id,
            type: 'READING',
            order: targetModule.lessons.length,
            xpReward: levelData.level === 'A1' ? 20 : levelData.level === 'A2' ? 25 : levelData.level === 'B1' ? 30 : levelData.level === 'B2' ? 35 : levelData.level === 'C1' ? 40 : 50,
            gemReward: levelData.level === 'A1' ? 3 : levelData.level === 'A2' ? 4 : levelData.level === 'B1' ? 5 : levelData.level === 'B2' ? 6 : levelData.level === 'C1' ? 7 : 10,
            isActive: true,
            isLocked: true,
            lockReason: 'Complete previous lessons to unlock',
          }
        }))

        const storyLesson = await withRetry(() => prisma.storyLesson.create({
          data: {
            lessonId: lesson.id,
            title: story.title,
            narrative: story.chapters.map(ch => ch.narrative).join('\n\n'),
            character: story.character,
            setting: story.setting,
            mood: story.mood,
            languageCode: levelData.languageCode,
            readingLevel: levelData.readingLevel,
            estimatedReadingTime: story.estimatedReadingTime,
            ttsSpeed: 0.9,
            chapters: JSON.stringify(story.chapters),
            totalQuestions,
            passingScore: 60,
            xpReward: lesson.xpReward,
            gemReward: lesson.gemReward,
          }
        }))

        console.log(`  📖 Created story: "${story.title}" (${story.chapters.length} chapters, ${totalQuestions} questions)`)
      }
    }

    console.log('\n=========================================')
    console.log('🎉 Story Mode Seed Complete!')
    console.log('=========================================')

  } catch (error: any) {
    console.error('❌ Error seeding stories:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedStories()
