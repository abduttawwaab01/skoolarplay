import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const yorubaA2CourseData = {
  course: {
    title: "Yoruba A2 - Ikẹjì",
    description: "Elemi ìkẹ̀jì: ìgbà ti ó ti kọjá, ọjọ́ iwájú, ìtọ́sọ́nà, ṣíṣẹ́, ilé, àti ọ̀rọ̀ pípọ̀.",
    difficulty: "INTERMEDIATE",
    minimumLevel: "A2",
  },
  modules: [
    {
      title: "Ìgbà Ti ó Ti Kọjá (Past Tense)",
      lessons: [
        {
          title: "Ìgbà Ti Òní (Simple Past)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Báwo ni a ṣe ń sọ pé 'I went' ní Yorùbá?",
              options: ["Mo lọ", "Mo ń lọ", "Mo máa ń lọ", "Mo ti lọ"],
              correctAnswer: "0",
              explanation: "Mo lọ = I went (past tense).",
            },
            {
              type: "MCQ",
              question: "Kí ni 'Mo jẹun' túmọ̀ sí ní Gẹ̀ẹ́sì?",
              options: ["I ate", "I eat", "I am eating", "I will eat"],
              correctAnswer: "0",
              explanation: "Mo jẹun = I ate (past tense).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo ___ (rà) aṣọ lánàá. (I bought clothes yesterday)",
              correctAnswer: "rà",
              explanation: "Rà = buy (past tense: Mo rà = I bought).",
            },
            {
              type: "SPEECH",
              question: "Mo lọ sí ọjà lánàá.",
              correctAnswer: "Mo lọ sí ọjà lánàá",
              language: "yo",
              hint: "Say: I went to the market yesterday",
            },
          ],
        },
        {
          title: "Àwọn Ìwé (Irregular Verbs)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'Mo rí' túmọ̀ sí ní Gẹ̀ẹ́sì?",
              options: ["I saw", "I see", "I am seeing", "I will see"],
              correctAnswer: "0",
              explanation: "Mo rí = I saw (past tense of rí = see).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ (wá) sílé wa lánàá. (Came home yesterday)",
              correctAnswer: "Wá",
              explanation: "Wá = come (past: Mo wá = I came).",
            },
          ],
        },
        {
          title: "Ìtàn Rírò (Storytelling)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Báwo ni a ṣe ń bẹ̀rẹ̀ ìtàn ìgbà ti ó ti kọjá?",
              options: ["Lánàá...", "Òní...", "Ọ̀la...", "Ìsẹ́lé..."],
              correctAnswer: "0",
              explanation: "Lánàá (yesterday) starts a past story.",
            },
            {
              type: "ORDERING",
              question: "Put in order: sí / ọjà / Mo / lọ / lánàá",
              hint: "Subject + verb + location + time",
              correctAnswer: "Mo,lọ,sí,ọjà,lánàá",
              explanation: "Mo lọ sí ọjà lánàá = I went to market yesterday.",
            },
          ],
        },
        {
          title: "Àkókò Ìgbà Ti ó Ti Kọjá",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'lánàá' túmọ̀ sí?",
              options: ["Yesterday", "Today", "Tomorrow", "Next week"],
              correctAnswer: "0",
              explanation: "Lánàá = yesterday.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Lọ́dún' means yesterday.",
              correctAnswer: "false",
              explanation: "Lọ́dún = last year, not yesterday.",
            },
          ],
        },
      ],
    },
    {
      title: "Ọjọ́ Iwájú (Future Expressions)",
      lessons: [
        {
          title: "Ọjọ́ Iwájú Tó Ǹkùnà (Going to Future)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Báwo ni a ṣe ń sọ pé 'I will go' ní Yorùbá?",
              options: ["Ma ń lọ", "Mo lọ", "Mo ń lọ", "Mo ti lọ"],
              correctAnswer: "0",
              explanation: "Ma ń lọ = I will go (future tense).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ (ma ń) jẹun lọ́la. (Will eat tomorrow)",
              correctAnswer: "Ma ń",
              explanation: "Ma ń jẹun = I will eat.",
            },
          ],
        },
        {
          title: "Àwọn Ìfẹ́ Àti Àṣeyọrí (Intentions and Wishes)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'Mo fẹ́ lọ' túmọ̀ sí?",
              options: ["I want to go", "I went", "I am going", "I used to go"],
              correctAnswer: "0",
              explanation: "Mo fẹ́ lọ = I want to go (intention).",
            },
            {
              type: "SPEECH",
              question: "Mo fẹ́ lọ sí ilé olùkọ́ mi ọ́la.",
              correctAnswer: "Mo fẹ́ lọ sí ilé olùkọ́ mi ọ́la",
              language: "yo",
              hint: "Say: I want to go to my teacher's house tomorrow",
            },
          ],
        },
        {
          title: "Àkókò Ọjọ́ Iwájú",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ọ́la' túmọ̀ sí?",
              options: ["Tomorrow", "Today", "Yesterday", "Next year"],
              correctAnswer: "0",
              explanation: "Ọ́la = tomorrow.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Lọ́dún' means next year.",
              correctAnswer: "false",
              explanation: "Lọ́dún = last year. Ọdún tó ń bọ̀ = next year.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìtọ́sọ́nà (Giving Directions)",
      lessons: [
        {
          title: "Àwọn Ọ̀rọ̀ Ìpilẹ̀ (Prepositions of Movement)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'sí' túmọ̀ sí ní Gẹ̀ẹ́sì?",
              options: ["To", "From", "With", "In"],
              correctAnswer: "0",
              explanation: "Sí = to (direction).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo lọ ___ ọjà. (to market)",
              correctAnswer: "sí",
              explanation: "Sí ọjà = to the market.",
            },
          ],
        },
        {
          title: "Àwọn Àṣẹ Fún Ìtọ́sọ́nà (Imperatives for Directions)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'lọ síwájú' túmọ̀ sí?",
              options: ["Go forward", "Go back", "Go left", "Go right"],
              correctAnswer: "0",
              explanation: "Lọ síwájú = go forward.",
            },
            {
              type: "MATCHING",
              question: "Match directions with meanings:",
              options: [
                { left: "Lọ síwájú", right: "Go forward" },
                { left: "Lọ sẹ́yìn", right: "Go back" },
                { left: "Lọ sí òsì", right: "Go left" },
                { left: "Lọ sí ọ̀tún", right: "Go right" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each direction matches its meaning.",
            },
          ],
        },
        {
          title: "Ìbílẹ̀ Àti Àwọn Àmì (Landmarks and Signs)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ilé ìtajà' ní Gẹ̀ẹ́sì?",
              options: ["Shop", "School", "Hospital", "House"],
              correctAnswer: "0",
              explanation: "Ilé ìtajà = shop/store.",
            },
            {
              type: "SPEECH",
              question: "Lọ sí òpópónà, lẹ́yìn náà yà sọ́tún.",
              correctAnswer: "Lọ sí òpópónà, lẹ́yìn náà yà sọ́tún",
              language: "yo",
              hint: "Say: Go to the road, then turn right",
            },
          ],
        },
      ],
    },
    {
      title: "Aṣọ Àti Aṣọ̀nà (Clothing & Fashion)",
      lessons: [
        {
          title: "Àwọn Orúkọ Aṣọ (Clothing Items)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'bùtà' ní Gẹ̀ẹ́sì?",
              options: ["Shirt", "Trouser", "Shoe", "Hat"],
              correctAnswer: "0",
              explanation: "Bùtà = shirt.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo wọ ___ (bùtà) aláwọ̀ funfun. (I wear white shirt)",
              correctAnswer: "bùtà",
              explanation: "Bùtà = shirt.",
            },
          ],
        },
        {
          title: "Àwọn Àwọ̀ (Colors of Clothes)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'aláwọ̀ dúdú' túmọ̀ sí?",
              options: ["Black clothes", "White clothes", "Red clothes", "Blue clothes"],
              correctAnswer: "0",
              explanation: "Dúdú = black. Aláwọ̀ dúdú = black clothes.",
            },
            {
              type: "MATCHING",
              question: "Match colors with clothes:",
              options: [
                { left: "Bùtà dúdú", right: "Black shirt" },
                { left: "Ṣòkọtò funfun", right: "White trouser" },
                { left: "Bàtà pupa", right: "Red shoe" },
                { left: "Fìlà aláwọ̀ bùbá", right: "Brown hat" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each matches color + clothing item.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìlera Àti Ara (Health & The Body)",
      lessons: [
        {
          title: "Àwọn Ẹ̀yà Ara (Parts of Body)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ojú' ní Gẹ̀ẹ́sì?",
              options: ["Eye", "Ear", "Nose", "Mouth"],
              correctAnswer: "0",
              explanation: "Ojú = eye.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo rí pẹ̀lú ___ (ojú) mi. (I see with my eye)",
              correctAnswer: "ojú",
              explanation: "Ojú = eye. Mo rí pẹ̀lú ojú mi = I see with my eye.",
            },
            {
              type: "SPEECH",
              question: "Mo ní ojú méjì àti etí méjì.",
              correctAnswer: "Mo ní ojú méjì àti etí méjì",
              language: "yo",
              hint: "Say: I have two eyes and two ears",
            },
          ],
        },
        {
          title: "Àwọn Àìsàn (Common Illnesses)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ìbà' ní Gẹ̀ẹ́sì?",
              options: ["Fever", "Headache", "Cough", "Cold"],
              correctAnswer: "0",
              explanation: "Ìbà = fever.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Olóró' means fever.",
              correctAnswer: "false",
              explanation: "Olóró = headache. Ìbà = fever.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìrìnlọ Àti Ọkọ̀ (Travel & Transport)",
      lessons: [
        {
          title: "Àwọn Ọkọ̀ Ìrìnlọ (Modes of Transport)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ọkọ̀ ayọ́kẹlẹ́' ní Gẹ̀ẹ́sì?",
              options: ["Car", "Bus", "Bicycle", "Airplane"],
              correctAnswer: "0",
              explanation: "Ọkọ̀ ayọ́kẹlẹ́ = car.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo lọ sí ọjà pẹ̀lú ___ (ọkọ̀) ayọ́kẹlẹ́. (went with car)",
              correctAnswer: "ọkọ̀",
              explanation: "Ọkọ̀ ayọ́kẹlẹ́ = car.",
            },
          ],
        },
        {
          title: "Ìbẹ̀wò Ọkọ̀ Ìrìnlọ (Booking Tickets)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Níbo ni a ti ra tíkẹ́ẹ̀tì ọkọ̀ ayọ́kẹlẹ́?",
              options: ["Ní ilé ìtà tíkẹ́ẹ̀tì", "Ní ọjà", "Ní ilé ìwosàn", "Ní ilé ìwé"],
              correctAnswer: "0",
              explanation: "Ní ilé ìtà tíkẹ́ẹ̀tì = at the ticket office.",
            },
            {
              type: "SPEECH",
              question: "Mo fẹ́ ra tíkẹ́ẹ̀tì ọkọ̀ ayọ́kẹlẹ́ sí Ìbàdàn.",
              correctAnswer: "Mo fẹ́ ra tíkẹ́ẹ̀tì ọkọ̀ ayọ́kẹlẹ́ sí Ìbàdàn",
              language: "yo",
              hint: "Say: I want to buy a bus ticket to Ibadan",
            },
          ],
        },
      ],
    },
    {
      title: "Àfiwé Àti Àpẹẹrẹ (Comparatives & Superlatives)",
      lessons: [
        {
          title: "Àwọn Àfiwé (Comparatives)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Báwo ni a ṣe ń sọ pé 'bigger' ní Yorùbá?",
              options: ["Tóbi jùú", "Tóbi", "Tóbi jù", "Tóbi jùlọ"],
              correctAnswer: "0",
              explanation: "Tóbi jùú = bigger (comparative).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Ilé mi ___ (tóbi) jùú ilé rẹ. (My house is bigger than yours)",
              correctAnswer: "tóbi",
              explanation: "Tóbi jùú = bigger than.",
            },
          ],
        },
        {
          title: "Àwọn Àpẹẹrẹ (Superlatives)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'tóbi jùlọ' túmọ̀ sí?",
              options: ["Biggest", "Bigger", "Big", "Small"],
              correctAnswer: "0",
              explanation: "Tóbi jùlọ = biggest (superlative).",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Kékeré jùlọ' means biggest.",
              correctAnswer: "false",
              explanation: "Kékeré jùlọ = smallest. Tóbi jùlọ = biggest.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìsẹ̀lẹ̀ Tó Ń Lọ (Present Continuous)",
      lessons: [
        {
          title: "Ìsẹ̀lẹ̀ Tó Ń Ṣẹlẹ̀ Nísinsìnyí (Present Activities)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'Mo ń jẹun' túmọ̀ sí ní Gẹ̀ẹ́sì?",
              options: ["I am eating", "I eat", "I ate", "I will eat"],
              correctAnswer: "0",
              explanation: "Mo ń jẹun = I am eating (present continuous).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ (Mo ń) kọ̀wé nísinsìnyí. (I am writing now)",
              correctAnswer: "Mo ń",
              explanation: "Mo ń = I am (doing something).",
            },
          ],
        },
        {
          title: "Ìyàtọ̀ Sí Àṣà (Habit vs Now)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'Mo máa ń jẹun' túmọ̀ sí?",
              options: ["I usually eat", "I am eating", "I ate", "I will eat"],
              correctAnswer: "0",
              explanation: "Mo máa ń jẹun = I usually eat (habit).",
            },
            {
              type: "SPEECH",
              question: "Mo ń kọ̀wé nísinsìnyí, ṣùgbọ́n mo máa ń kọ̀wé ní òwurọ̀.",
              correctAnswer: "Mo ń kọ̀wé nísinsìnyí, ṣùgbọ́n mo máa ń kọ̀wé ní òwurọ̀",
              language: "yo",
              hint: "Say: I am writing now, but I usually write in the morning",
            },
          ],
        },
      ],
    },
    {
      title: "Ilé Àti Àwọn Ohun Èlò Ilé (House & Furniture)",
      lessons: [
        {
          title: "Àwọn Yàrà Nínú Ilé (Rooms in House)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'yàrá ìdáná' ní Gẹ̀ẹ́sì?",
              options: ["Kitchen", "Bedroom", "Living room", "Bathroom"],
              correctAnswer: "0",
              explanation: "Yàrá ìdáná = kitchen.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo sun nínú ___ (yàrá ìsùn) mi. (I sleep in my bedroom)",
              correctAnswer: "yàrá ìsùn",
              explanation: "Yàrá ìsùn = bedroom.",
            },
          ],
        },
        {
          title: "Àwọn Ohun Èlò Ilé (Furniture)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'àga' ní Gẹ̀ẹ́sì?",
              options: ["Chair", "Table", "Bed", "Sofa"],
              correctAnswer: "0",
              explanation: "Àga = chair.",
            },
            {
              type: "MATCHING",
              question: "Match furniture with use:",
              options: [
                { left: "Àga", right: "Sitting" },
                { left: "Tábìlì", right: "Working" },
                { left: "Àkété", right: "Sleeping" },
                { left: "Sófà", right: "Relaxing" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each furniture matches its use.",
            },
          ],
        },
      ],
    },
    {
      title: "Ọjọ́ Àti Àkókò (Time & Dates)",
      lessons: [
        {
          title: "Ìwòye Àkókò (Telling Time)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Báwo ni a ṣe ń sọ '3 o'clock' ní Yorùbá?",
              options: ["Aago mẹ́ta", "Aago méjì", "Aago mẹ́rin", "Aago mẹ́fà"],
              correctAnswer: "0",
              explanation: "Aago mẹ́ta = 3 o'clock.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo jí ní ___ (aago mẹ́fà) òwurọ̀. (I woke up at 6 AM)",
              correctAnswer: "aago mẹ́fà",
              explanation: "Aago mẹ́fà = 6 o'clock.",
            },
          ],
        },
        {
          title: "Ọjọ́ Ọ̀sẹ̀ (Days of Week)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'Ọjọ́ Àìkú' ní Gẹ̀ẹ́sì?",
              options: ["Sunday", "Monday", "Tuesday", "Wednesday"],
              correctAnswer: "0",
              explanation: "Ọjọ́ Àìkú = Sunday.",
            },
            {
              type: "ORDERING",
              question: "Put in order: Ọjọ́ Òjọ́ / Ọjọ́ Àìkú / Ọjọ́ Ajé / Ọjọ́ Ìsẹ́gun",
              hint: "Sunday, Monday, Tuesday, Wednesday",
              correctAnswer: "Ọjọ́ Àìkú,Ọjọ́ Ajé,Ọjọ́ Ìsẹ́gun,Ọjọ́ Ọjọ́",
              explanation: "Sunday, Monday, Tuesday, Wednesday is correct order.",
            },
          ],
        },
      ],
    },
    {
      title: "Ẹ̀kọ́ Àti Ẹ̀kọ́ Gíga (Education & School)",
      lessons: [
        {
          title: "Àwọn Káríwájọ́ Ẹ̀kọ́ (School Subjects)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ìṣirò' ní Gẹ̀ẹ́sì?",
              options: ["Math", "English", "History", "Science"],
              correctAnswer: "0",
              explanation: "Ìṣirò = Math/Arithmetic.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo kọ́ ___ (Gẹ̀ẹ́sì) ní ilé ìwé. (I learn English in school)",
              correctAnswer: "Gẹ̀ẹ́sì",
              explanation: "Gẹ̀ẹ́sì = English.",
            },
          ],
        },
        {
          title: "Àwọn Ohun Èlò Ilé Ìwé (School Objects)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'pẹ̀n' ní Gẹ̀ẹ́sì?",
              options: ["Pen", "Book", "Ruler", "Eraser"],
              correctAnswer: "0",
              explanation: "Pẹ̀n = pen.",
            },
            {
              type: "SPEECH",
              question: "Mo kọ́ Gẹ̀ẹ́sì àti ìṣirò ní ilé ìwé.",
              correctAnswer: "Mo kọ́ Gẹ̀ẹ́sì àti ìṣirò ní ilé ìwé",
              language: "yo",
              hint: "Say: I learn English and Math in school",
            },
          ],
        },
      ],
    },
    {
      title: "Ìdárayá Àti Eré Ìdárayá (Sports & Hobbies)",
      lessons: [
        {
          title: "Àwọn Eré Ìdárayá (Sports)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'bọ́ọ̀lù orí' ní Gẹ̀ẹ́sì?",
              options: ["Football", "Basketball", "Tennis", "Swimming"],
              correctAnswer: "0",
              explanation: "Bọ́ọ̀lù orí = football/soccer.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo fẹ́ eré ___ (bọ́ọ̀lù orí). (I like football)",
              correctAnswer: "bọ́ọ̀lù orí",
              explanation: "Bọ́ọ̀lù orí = football.",
            },
          ],
        },
        {
          title: "Àwọn Ìfẹ́ Eré (Hobbies)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'kíkọ̀wé' túmọ̀ sí?",
              options: ["Writing", "Reading", "Singing", "Dancing"],
              correctAnswer: "0",
              explanation: "Kíkọ̀wé = writing.",
            },
            {
              type: "CHECKBOX",
              question: "Select all hobbies:",
              options: ["Kíkọ̀wé", "Bọ́ọ̀lù orí", "Jíjó", "Ìṣirò"],
              correctAnswer: "[0,2]",
              explanation: "Kíkọ̀wé (writing) and jíjó (dancing) are hobbies. Bọ́ọ̀lù orí is sport, ìṣirò is school subject.",
            },
          ],
        },
      ],
    },
    {
      title: "Ọjà Àti Oògùn (Shopping & Money)",
      lessons: [
        {
          title: "Àwọn Irú Ọjà (Store Types)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Níbo ni a ti ra aṣọ?",
              options: ["Ní ilé ìtajà aṣọ", "Ní ilé ìtajà oúnjẹ", "Ní ilé ìwosàn", "Ní ilé ìwé"],
              correctAnswer: "0",
              explanation: "Ní ilé ìtajà aṣọ = at the clothing store.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo ra oúnjẹ ní ___ (ọjà) lánàá. (bought food at market)",
              correctAnswer: "ọjà",
              explanation: "Ọjà = market.",
            },
          ],
        },
        {
          title: "Ìye Oògùn (Prices and Costs)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Báwo ni a ṣe ń sọ 'It is expensive' ní Yorùbá?",
              options: ["Ó jé níyèsì", "Ó jé kéré", "Ó jé dídùn", "Ó jé gbígbóná"],
              correctAnswer: "0",
              explanation: "Ó jé níyèsì = It is expensive.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Ó jé kéré' means it is expensive.",
              correctAnswer: "false",
              explanation: "Ó jé kéré = It is cheap. Ó jé níyèsì = It is expensive.",
            },
          ],
        },
      ],
    },
    {
      title: "Àwọn Ibùdó Nínú Ìlú (Places in Town)",
      lessons: [
        {
          title: "Àwọn Ibùdó (City Places)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ilé ìwé' ní Gẹ̀ẹ́sì?",
              options: ["School", "Hospital", "Market", "Bank"],
              correctAnswer: "0",
              explanation: "Ilé ìwé = school.",
            },
            {
              type: "MATCHING",
              question: "Match places with activities:",
              options: [
                { left: "Ilé ìwé", right: "Learning" },
                { left: "Ọjà", right: "Buying" },
                { left: "Ilé ìwosàn", right: "Healing" },
                { left: "Báǹkì", right: "Money" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each place matches its activity.",
            },
          ],
        },
        {
          title: "Ìtọ́sọ́nà Nínú Ìlú (Giving Directions in City)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'lẹ́yìn' túmọ̀ sí?",
              options: ["Behind", "Front", "Left", "Right"],
              correctAnswer: "0",
              explanation: "Lẹ́yìn = behind.",
            },
            {
              type: "SPEECH",
              question: "Ilé ìwé wà níwájú ọjà.",
              correctAnswer: "Ilé ìwé wà níwájú ọjà",
              language: "yo",
              hint: "Say: The school is in front of the market",
            },
          ],
        },
      ],
    },
    {
      title: "Ìbáṣepọ̀ Àti Ṣíṣe (Work & Professions)",
      lessons: [
        {
          title: "Àwọn Iṣẹ́ (Jobs)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'olùkọ́' ní Gẹ̀ẹ́sì?",
              options: ["Teacher", "Doctor", "Driver", "Trader"],
              correctAnswer: "0",
              explanation: "Olùkọ́ = teacher.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Bàbá mi jẹ́ ___ (dókítà). (My father is a doctor)",
              correctAnswer: "dókítà",
              explanation: "Dókítà = doctor.",
            },
          ],
        },
        {
          title: "Àwọn Ibùdó Iṣẹ́ (Workplaces)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Níbo ni olùkọ́ ti ń ṣiṣẹ́?",
              options: ["Ní ilé ìwé", "Ní ilé ìwosàn", "Ní ọjà", "Ní báǹkì"],
              correctAnswer: "0",
              explanation: "Olùkọ́ ṣiṣẹ́ ní ilé ìwé = Teacher works at school.",
            },
            {
              type: "CHECKBOX",
              question: "Select all professions:",
              options: ["Dókítà", "Olùkọ́", "Bùtà", "Awakọ̀"],
              correctAnswer: "[0,1,3]",
              explanation: "Dókítà (doctor), olùkọ́ (teacher), awakọ̀ (driver) are professions. Bùtà is clothing.",
            },
          ],
        },
      ],
    },
    {
      title: "Ọ̀títọ́ Àti Ìròyìn (Weather & Seasons)",
      lessons: [
        {
          title: "Àwọn Ìṣẹ̀lẹ̀ Ọ̀títọ́ (Weather Conditions)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ọ̀títọ́ ń rọ̀' túmọ̀ sí ní Gẹ̀ẹ́sì?",
              options: ["Rain is falling", "Sun is out", "Wind is blowing", "It is cold"],
              correctAnswer: "0",
              explanation: "Ọ̀títọ́ ń rọ̀ = rain is falling.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ (Ọ̀títọ́) ń rọ̀ lónìí. (Rain is falling today)",
              correctAnswer: "Ọ̀títọ́",
              explanation: "Ọ̀títọ́ = rain.",
            },
          ],
        },
        {
          title: "Àwọn Àkókò (Seasons)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Ìgbà wo ni ọ̀títọ́ ṣùgbọ́n oorun ń tàn?",
              options: ["Ìgbà ọ̀fà", "Ìgbà òwúrọ̀", "Ìgbà ọ̀sán", "Ìgbà alẹ́"],
              correctAnswer: "0",
              explanation: "Ìgbà ọ̀fà = rainy season.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Ìgbà ọ̀fà' is the dry season.",
              correctAnswer: "false",
              explanation: "Ìgbà ọ̀fà = rainy season. Ìgbà gbigbẹ́ = dry season.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìbágbépọ̀ Àti Ìṣà (Culture & Traditions)",
      lessons: [
        {
          title: "Àwọn Ayẹyẹ́ (Celebrations)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'Ayẹyẹ́ Ọdún' túmọ̀ sí?",
              options: ["New Year celebration", "Wedding", "Funeral", "Birthday"],
              correctAnswer: "0",
              explanation: "Ayẹyẹ́ Ọdún = New Year celebration.",
            },
            {
              type: "SPEECH",
              question: "A máa ń ṣe ayẹyẹ́ Ọdún ní ìbẹ̀rẹ̀ ọdún.",
              correctAnswer: "A máa ń ṣe ayẹyẹ́ Ọdún ní ìbẹ̀rẹ̀ ọdún",
              language: "yo",
              hint: "Say: We celebrate New Year at the beginning of the year",
            },
          ],
        },
        {
          title: "Àṣà Ìbílẹ̀ (Traditional Customs)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'ìṣọ̀rẹ̀'?",
              options: ["Friendship", "Marriage", "Naming ceremony", "Burial"],
              correctAnswer: "0",
              explanation: "Ìṣọ̀rẹ̀ = friendship.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo ní ___ (ọ̀rẹ́) méjì. (I have two friends)",
              correctAnswer: "ọ̀rẹ́",
              explanation: "Ọ̀rẹ́ = friend.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìròyìn Àti Mídià (Media & Entertainment)",
      lessons: [
        {
          title: "Àwọn Amóhùnmáwòrán (TV & Movies)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'amóhùnmáwòrán' ní Gẹ̀ẹ́sì?",
              options: ["Television", "Radio", "Newspaper", "Internet"],
              correctAnswer: "0",
              explanation: "Amóhùnmáwòrán = television.",
            },
            {
              type: "CHECKBOX",
              question: "Select all media:",
              options: ["Amóhùnmáwòrán", "Rédíò", "Ìwé ìròyìn", "Bùtà"],
              correctAnswer: "[0,1,2]",
              explanation: "Amóhùnmáwòrán (TV), rédíò (radio), ìwé ìròyìn (newspaper) are media. Bùtà is clothing.",
            },
          ],
        },
      ],
    },
    {
      title: "Ìmọ̀ Ẹ̀rọ̀ Àti Tẹknolojì (Technology & Media)",
      lessons: [
        {
          title: "Àwọn Ẹ̀rọ̀ Ìmọ̀-Ẹ̀rọ̀ (Digital Devices)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'kọ̀mpútà' ní Gẹ̀ẹ́sì?",
              options: ["Computer", "Phone", "Tablet", "Camera"],
              correctAnswer: "0",
              explanation: "Kọ̀mpútà = computer.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Mo lo ___ (fóònù) láti pè. (I use phone to call)",
              correctAnswer: "fóònù",
              explanation: "Fóònù = phone.",
            },
          ],
        },
      ],
    },
    {
      title: "Àwọn Ẹnìyàn Àti Ìbágbépọ̀ (People & Relationships)",
      lessons: [
        {
          title: "Àwọn Àpẹẹrẹ̀ Ènìyàn (Personality Traits)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Kí ni 'onínúrere' túmọ̀ sí?",
              options: ["Kind person", "Angry person", "Tall person", "Short person"],
              correctAnswer: "0",
              explanation: "Onínúrere = kind person.",
            },
            {
              type: "MATCHING",
              question: "Match traits with descriptions:",
              options: [
                { left: "Onínúrere", right: "Kind" },
                { left: "Onínúbìnú", right: "Angry" },
                { left: "Gíga", right: "Tall" },
                { left: "Kékeré", right: "Short" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each trait matches its description.",
            },
          ],
        },
      ],
    },
  ],
}

export async function POST(req: NextRequest) {
  try {
    await getAdminUser(req);
    
    const { course: courseData, modules: modulesData } = yorubaA2CourseData;
    
    // Check if course already exists
    let course = await db.course.findFirst({
      where: { title: courseData.title }
    });
    
    if (course) {
      // Delete existing modules (cascades to lessons and questions)
      await db.module.deleteMany({
        where: { courseId: course.id }
      });
      // Update course
      course = await db.course.update({
        where: { id: course.id },
        data: {
          description: courseData.description,
          difficulty: courseData.difficulty as any,
          minimumLevel: courseData.minimumLevel,
          isActive: true,
        }
      });
    } else {
      // Create course
      course = await db.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty as any,
          minimumLevel: courseData.minimumLevel,
          isActive: true,
          category: {
            connect: { name: "Languages" }
          }
        }
      });
    }
    
    // Create modules, lessons, and questions
    for (let modIdx = 0; modIdx < modulesData.length; modIdx++) {
      const moduleData = modulesData[modIdx];
      
      const newModule = await db.module.create({
        data: {
          title: moduleData.title,
          courseId: course.id,
          order: modIdx,
          isActive: true,
        }
      });
      
      for (let lessIdx = 0; lessIdx < moduleData.lessons.length; lessIdx++) {
        const lessonData = moduleData.lessons[lessIdx];
        
        const newLesson = await db.lesson.create({
          data: {
            title: lessonData.title,
            moduleId: newModule.id,
            type: lessonData.type as any,
            order: lessIdx,
            xpReward: 20 + Math.floor(Math.random() * 20),
            gemReward: 2 + Math.floor(Math.random() * 4),
            isActive: true,
          }
        });
        
        // Create questions
        const questionsToCreate = lessonData.questions.map((q: any, idx: number) => ({
          lessonId: newLesson.id,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          hint: q.hint || null,
          language: q.language || null,
          order: idx,
          points: q.points || 10,
          isActive: true,
        }));
        
        await db.question.createMany({
          data: questionsToCreate
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Course "${courseData.title}" created/updated with ${modulesData.length} modules`,
      courseId: course.id
    });
    
  } catch (error: any) {
    console.error("Error creating Yoruba A2 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
