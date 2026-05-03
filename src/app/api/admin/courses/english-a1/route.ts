import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

const englishA1CourseData = {
  course: {
    title: "English A1 - Beginner",
    description: "Learn basic English for everyday situations. Master greetings, numbers, colors, family, food, and essential grammar.",
    difficulty: "BEGINNER",
    minimumLevel: "A1",
  },
  modules: [
    {
      title: "Greetings & Introductions",
      lessons: [
        {
          title: "Saying Hello and Goodbye",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you greet someone in the morning?",
              options: ["Good morning", "Good night", "Good afternoon", "Good evening"],
              correctAnswer: "0",
              explanation: "Good morning is used from dawn until late morning.",
            },
            {
              type: "MCQ",
              question: "What do you say when you leave someone in the evening?",
              options: ["Good evening", "Good night", "Good afternoon", "Good morning"],
              correctAnswer: "1",
              explanation: "Good night is used when parting in the evening or going to sleep.",
            },
            {
              type: "MCQ",
              question: "Which is a formal way to say hello?",
              options: ["Hi", "Hello", "Hey", "Yo"],
              correctAnswer: "1",
              explanation: "Hello is more formal than hi, hey, or yo.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ morning! (Greeting)",
              correctAnswer: "Good",
              explanation: "Good morning is a common morning greeting.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ to meet you! (First meeting)",
              correctAnswer: "Nice",
              explanation: "Nice to meet you is polite when meeting someone new.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Good night' is used when arriving in the evening.",
              correctAnswer: "false",
              explanation: "Good night is used when leaving or going to sleep, not when arriving.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Goodbye' is used when parting from someone.",
              correctAnswer: "true",
              explanation: "Goodbye is a standard way to say farewell.",
            },
            {
              type: "MATCHING",
              question: "Match greetings with time of day:",
              options: [
                { left: "Good morning", right: "Morning" },
                { left: "Good afternoon", right: "Afternoon" },
                { left: "Good evening", right: "Evening" },
                { left: "Good night", right: "Night" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each greeting matches its time of day.",
            },
            {
              type: "ORDERING",
              question: "Put in order: morning / Good / !",
              hint: "Standard morning greeting",
              correctAnswer: "Good,morning,!",
              explanation: "Good morning! is the correct greeting.",
            },
            {
              type: "CHECKBOX",
              question: "Select all formal greetings:",
              options: ["Hello", "Hi", "Good morning", "Hey"],
              correctAnswer: "[0,2]",
              explanation: "Hello and Good morning are formal. Hi and Hey are informal.",
            },
            {
              type: "SPEECH",
              question: "Good morning! How are you?",
              correctAnswer: "Good morning! How are you?",
              language: "en",
              hint: "Say the morning greeting",
            },
            {
              type: "SPEECH",
              question: "Goodbye! See you later.",
              correctAnswer: "Goodbye! See you later.",
              language: "en",
              hint: "Say goodbye",
            },
          ],
        },
        {
          title: "Introducing Yourself",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when you introduce yourself?",
              options: ["My name is John", "Your name is John", "His name is John", "Her name is John"],
              correctAnswer: "0",
              explanation: "My name is... is how you introduce yourself.",
            },
            {
              type: "MCQ",
              question: "How do you ask someone their name?",
              options: ["What is your name?", "What is my name?", "What is his name?", "What is her name?"],
              correctAnswer: "0",
              explanation: "What is your name? is the correct question.",
            },
            {
              type: "MCQ",
              question: "Which response is correct when someone says 'Nice to meet you'?",
              options: ["Nice to meet you too", "Goodbye", "Thank you", "See you"],
              correctAnswer: "0",
              explanation: "Nice to meet you too is the polite response.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My ___ is Maria. (Introduction)",
              correctAnswer: "name",
              explanation: "My name is Maria is how you introduce yourself.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ to meet you! (Response)",
              correctAnswer: "Nice",
              explanation: "Nice to meet you is a polite response.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'I am 20 years old' is a way to introduce your age.",
              correctAnswer: "true",
              explanation: "Stating your age is common when introducing yourself.",
            },
            {
              type: "SPEECH",
              question: "Hello, my name is David. Nice to meet you.",
              correctAnswer: "Hello, my name is David. Nice to meet you.",
              language: "en",
              hint: "Introduce yourself",
            },
          ],
        },
        {
          title: "Asking Names",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the correct way to ask someone's name?",
              options: ["What is your name?", "What is my name?", "How are you?", "Where are you from?"],
              correctAnswer: "0",
              explanation: "What is your name? is the standard question.",
            },
            {
              type: "MCQ",
              question: "How do you ask someone's name politely?",
              options: ["May I know your name?", "Give me your name", "Tell me your name", "Your name is?"],
              correctAnswer: "0",
              explanation: "May I know your name? is very polite.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: What is ___ name? (Asking)",
              correctAnswer: "your",
              explanation: "What is your name? asks someone for their name.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'What is his name?' asks about a male person's name.",
              correctAnswer: "true",
              explanation: "His refers to a male person.",
            },
          ],
        },
        {
          title: "Exchanging Contact Info",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to ask for a phone number?",
              options: ["What is your phone number?", "Where is your phone?", "How is your phone?", "When is your phone?"],
              correctAnswer: "0",
              explanation: "What is your phone number? is the correct question.",
            },
            {
              type: "MCQ",
              question: "Which is a correct email format?",
              options: ["john@gmail.com", "john@gmail", "john@com", "john.gmail.com"],
              correctAnswer: "0",
              explanation: "Emails need @ and a domain like .com.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My email is john@___.com (Email)",
              correctAnswer: "gmail",
              explanation: "john@gmail.com is a valid email address.",
            },
          ],
        },
        {
          title: "Polite Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when someone helps you?",
              options: ["Thank you", "Goodbye", "Hello", "Sorry"],
              correctAnswer: "0",
              explanation: "Thank you is used to show gratitude.",
            },
            {
              type: "MCQ",
              question: "How do you apologize for being late?",
              options: ["Sorry I am late", "Thank you", "Hello", "Goodbye"],
              correctAnswer: "0",
              explanation: "Sorry I am late apologizes for tardiness.",
            },
            {
              type: "MCQ",
              question: "What do you say when someone says 'Thank you'?",
              options: ["You're welcome", "Goodbye", "Hello", "Sorry"],
              correctAnswer: "0",
              explanation: "You're welcome responds to thank you.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ you very much! (Gratitude)",
              correctAnswer: "Thank",
              explanation: "Thank you very much shows strong gratitude.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Please' is used when making requests.",
              correctAnswer: "true",
              explanation: "Please makes requests more polite.",
            },
            {
              type: "SPEECH",
              question: "Thank you very much. You're welcome.",
              correctAnswer: "Thank you very much. You're welcome.",
              language: "en",
              hint: "Say thank you and response",
            },
          ],
        },
      ],
    },
    {
      title: "Numbers & Counting",
      lessons: [
        {
          title: "Numbers 1-10",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What number comes after 1?",
              options: ["2", "3", "4", "5"],
              correctAnswer: "0",
              explanation: "The sequence is 1, 2, 3, 4, 5...",
            },
            {
              type: "MCQ",
              question: "How do you spell 5?",
              options: ["Five", "Fiev", "Fivve", "Fyve"],
              correctAnswer: "0",
              explanation: "Five is spelled F-I-V-E.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: One, two, three, ___, five.",
              correctAnswer: "four",
              explanation: "The counting sequence: one, two, three, four, five.",
            },
            {
              type: "ORDERING",
              question: "Put in order: 3 / 1 / 2 / 4",
              hint: "Count from 1 to 4",
              correctAnswer: "1,2,3,4",
              explanation: "The correct order is 1, 2, 3, 4.",
            },
            {
              type: "SPEECH",
              question: "One, two, three, four, five.",
              correctAnswer: "One, two, three, four, five.",
              language: "en",
              hint: "Count from 1 to 5",
            },
          ],
        },
        {
          title: "Numbers 11-20",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What comes after 15?",
              options: ["16", "17", "14", "20"],
              correctAnswer: "0",
              explanation: "After 15 comes 16.",
            },
            {
              type: "MCQ",
              question: "How do you spell 12?",
              options: ["Twelve", "Twelv", "Twelvve", "Twlev"],
              correctAnswer: "0",
              explanation: "Twelve is spelled T-W-E-L-V-E.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Eleven, twelve, ___, fourteen.",
              correctAnswer: "thirteen",
              explanation: "The sequence is eleven, twelve, thirteen, fourteen.",
            },
          ],
        },
        {
          title: "Numbers 20-100",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is 30 in words?",
              options: ["Thirty", "Threety", "Thirtee", "Threety"],
              correctAnswer: "0",
              explanation: "30 is spelled thirty.",
            },
            {
              type: "MCQ",
              question: "How do you say 100?",
              options: ["One hundred", "Ten ten", "One ten", "Ten hundred"],
              correctAnswer: "0",
              explanation: "100 = one hundred.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: twenty, ___, forty, fifty.",
              correctAnswer: "thirty",
              explanation: "The tens: twenty, thirty, forty, fifty.",
            },
          ],
        },
        {
          title: "Phone Numbers",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say the phone number 123-4567?",
              options: ["One two three, four five six seven", "One hundred twenty-three", "Twelve thirty-four", "One two three, four five six"],
              correctAnswer: "0",
              explanation: "Phone numbers are read digit by digit.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My phone number is five five five - ___ ___ ___ ___. (1234)",
              correctAnswer: "one two three four",
              explanation: "Phone numbers are spoken as individual digits.",
            },
          ],
        },
        {
          title: "Prices and Money",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you say $5.50?",
              options: ["Five dollars and fifty cents", "Five fifty dollars", "Five point fifty", "Fifty-five dollars"],
              correctAnswer: "0",
              explanation: "$5.50 = five dollars and fifty cents.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The book costs ten ___ and ninety-nine cents.",
              correctAnswer: "dollars",
              explanation: "Ten dollars and ninety-nine cents = $10.99.",
            },
          ],
        },
      ],
    },
    {
      title: "Colors & Appearance",
      lessons: [
        {
          title: "Basic Colors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What color is the sky?",
              options: ["Blue", "Green", "Red", "Yellow"],
              correctAnswer: "0",
              explanation: "The sky is usually blue.",
            },
            {
              type: "MCQ",
              question: "What color is grass?",
              options: ["Green", "Blue", "Red", "Black"],
              correctAnswer: "0",
              explanation: "Grass is typically green.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The sun is ___ (color).",
              correctAnswer: "yellow",
              explanation: "The sun appears yellow.",
            },
            {
              type: "MATCHING",
              question: "Match colors with objects:",
              options: [
                { left: "Sky", right: "Blue" },
                { left: "Grass", right: "Green" },
                { left: "Blood", right: "Red" },
                { left: "Snow", right: "White" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Sky is blue, grass is green, blood is red, snow is white.",
            },
            {
              type: "SPEECH",
              question: "Red, blue, green, yellow.",
              correctAnswer: "Red, blue, green, yellow.",
              language: "en",
              hint: "Say the colors",
            },
          ],
        },
        {
          title: "Describing Objects",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you describe a small red car?",
              options: ["Small red car", "Red small car", "Car small red", "Small car red"],
              correctAnswer: "0",
              explanation: "Adjective order: size + color + noun.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A ___ (big) blue ball.",
              correctAnswer: "big",
              explanation: "Big blue ball - size comes before color.",
            },
          ],
        },
        {
          title: "Clothing Colors",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you call a shirt that is the color of blood?",
              options: ["Red shirt", "Blue shirt", "Green shirt", "Yellow shirt"],
              correctAnswer: "0",
              explanation: "Blood is red, so a red shirt.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I wear a ___ (black) jacket.",
              correctAnswer: "black",
              explanation: "Black is a common color for jackets.",
            },
          ],
        },
        {
          title: "Physical Appearance",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you describe someone with dark hair?",
              options: ["He has dark hair", "He is dark hair", "He has hair dark", "Dark hair has he"],
              correctAnswer: "0",
              explanation: "He has dark hair is correct.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: She has ___ eyes. (blue)",
              correctAnswer: "blue",
              explanation: "She has blue eyes describes eye color.",
            },
          ],
        },
        {
          title: "Describing People",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How do you describe a tall person?",
              options: ["He is tall", "He has tall", "Tall is he", "He tall is"],
              correctAnswer: "0",
              explanation: "He is tall uses the verb 'to be'.",
            },
            {
              type: "CHECKBOX",
              question: "Select all adjectives that describe appearance:",
              options: ["Tall", "Happy", "Short", "Angry"],
              correctAnswer: "[0,2]",
              explanation: "Tall and short describe physical appearance. Happy and angry describe emotions.",
            },
          ],
        },
      ],
    },
    {
      title: "Family & Relationships",
      lessons: [
        {
          title: "Immediate Family",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who is your father's father?",
              options: ["Grandfather", "Uncle", "Brother", "Cousin"],
              correctAnswer: "0",
              explanation: "Your father's father is your grandfather.",
            },
            {
              type: "MCQ",
              question: "What do you call your mother's sister?",
              options: ["Aunt", "Grandmother", "Sister", "Cousin"],
              correctAnswer: "0",
              explanation: "Your mother's sister is your aunt.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My ___ is my parent's son. (Brother or sister?)",
              correctAnswer: "brother",
              explanation: "Your parent's son is your brother.",
            },
            {
              type: "MATCHING",
              question: "Match family members:",
              options: [
                { left: "Father", right: "Dad" },
                { left: "Mother", right: "Mom" },
                { left: "Brother", right: "Sibling" },
                { left: "Sister", right: "Sibling" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Father = Dad, Mother = Mom, Brother/Sister = Siblings.",
            },
            {
              type: "SPEECH",
              question: "This is my father and this is my mother.",
              correctAnswer: "This is my father and this is my mother.",
              language: "en",
              hint: "Introduce your parents",
            },
          ],
        },
        {
          title: "Extended Family",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Who is your aunt's husband?",
              options: ["Uncle", "Cousin", "Grandfather", "Brother"],
              correctAnswer: "0",
              explanation: "Your aunt's husband is your uncle.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My cousin is my ___'s child. (Aunt or uncle?)",
              correctAnswer: "aunt",
              explanation: "Your cousin is your aunt or uncle's child.",
            },
          ],
        },
        {
          title: "Family Tree",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How many people in a nuclear family?",
              options: ["4 (parents + 2 kids)", "2 (just parents)", "6 (grandparents too)", "1 (just me)"],
              correctAnswer: "0",
              explanation: "Nuclear family: mother, father, and children (typically 2 kids = 4 people).",
            },
            {
              type: "ORDERING",
              question: "Put in order of age: grandmother / mother / daughter",
              hint: "Oldest to youngest",
              correctAnswer: "grandmother,mother,daughter",
              explanation: "Grandmother is oldest, then mother, then daughter.",
            },
          ],
        },
        {
          title: "Marital Status",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you call a person who is married?",
              options: ["Married", "Single", "Divorced", "Widowed"],
              correctAnswer: "0",
              explanation: "Married means you have a husband or wife.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I am ___ (single). I don't have a husband or wife.",
              correctAnswer: "single",
              explanation: "Single means not married.",
            },
          ],
        },
        {
          title: "Friends and Friendship",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you call someone you like and spend time with?",
              options: ["Friend", "Enemy", "Stranger", "Teacher"],
              correctAnswer: "0",
              explanation: "A friend is someone you like and spend time with.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: A best friend is your favorite friend.",
              correctAnswer: "true",
              explanation: "Your best friend is the friend you like the most.",
            },
          ],
        },
      ],
    },
    {
      title: "Food & Dining",
      lessons: [
        {
          title: "Meals of the Day",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the first meal of the day called?",
              options: ["Breakfast", "Lunch", "Dinner", "Snack"],
              correctAnswer: "0",
              explanation: "Breakfast is the first meal, eaten in the morning.",
            },
            {
              type: "MCQ",
              question: "What do you eat at noon?",
              options: ["Lunch", "Breakfast", "Dinner", "Brunch"],
              correctAnswer: "0",
              explanation: "Lunch is eaten around noon/midday.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I eat ___ (dinner) at 7 PM.",
              correctAnswer: "dinner",
              explanation: "Dinner is the evening meal.",
            },
            {
              type: "SPEECH",
              question: "I eat breakfast at 8 AM and dinner at 7 PM.",
              correctAnswer: "I eat breakfast at 8 AM and dinner at 7 PM.",
              language: "en",
              hint: "Talk about meals",
            },
          ],
        },
        {
          title: "Basic Foods",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is bread made from?",
              options: ["Flour", "Rice", "Meat", "Milk"],
              correctAnswer: "0",
              explanation: "Bread is made from flour (wheat).",
            },
            {
              type: "MCQ",
              question: "Which food comes from cows?",
              options: ["Milk", "Eggs", "Bread", "Apples"],
              correctAnswer: "0",
              explanation: "Cows produce milk.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: An apple is a ___ (fruit/vegetable).",
              correctAnswer: "fruit",
              explanation: "Apples are fruit, not vegetables.",
            },
          ],
        },
        {
          title: "Fruits and Vegetables",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is a vegetable?",
              options: ["Carrot", "Banana", "Orange", "Grape"],
              correctAnswer: "0",
              explanation: "Carrots are vegetables that grow underground.",
            },
            {
              type: "MATCHING",
              question: "Match fruits and vegetables:",
              options: [
                { left: "Apple", right: "Fruit" },
                { left: "Broccoli", right: "Vegetable" },
                { left: "Banana", right: "Fruit" },
                { left: "Spinach", right: "Vegetable" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Apple and banana are fruits. Broccoli and spinach are vegetables.",
            },
          ],
        },
        {
          title: "Drinks and Beverages",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you drink in the morning with caffeine?",
              options: ["Coffee", "Water", "Milk", "Juice"],
              correctAnswer: "0",
              explanation: "Coffee contains caffeine and is drunk in the morning.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I would like a glass of ___ (water).",
              correctAnswer: "water",
              explanation: "Water is a healthy drink.",
            },
          ],
        },
        {
          title: "Ordering Food",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to order food?",
              options: ["I would like a burger", "Give me burger", "Burger now", "I want burger"],
              correctAnswer: "0",
              explanation: "I would like... is polite for ordering.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Can I have a sandwich?' is polite for ordering.",
              correctAnswer: "true",
              explanation: "Can I have... is a polite way to order food.",
            },
          ],
        },
      ],
    },
    {
      title: "Daily Routine",
      lessons: [
        {
          title: "Morning Routine",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do first in the morning?",
              options: ["Wake up", "Go to bed", "Eat dinner", "Brush teeth at night"],
              correctAnswer: "0",
              explanation: "You wake up first in the morning.",
            },
            {
              type: "MCQ",
              question: "What do you do after waking up?",
              options: ["Brush teeth", "Go to sleep", "Eat dinner", "Watch TV at night"],
              correctAnswer: "0",
              explanation: "Brushing teeth is a morning routine.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I ___ (wash) my face in the morning.",
              correctAnswer: "wash",
              explanation: "Washing your face is part of morning routine.",
            },
            {
              type: "SPEECH",
              question: "I wake up at 7 AM and brush my teeth.",
              correctAnswer: "I wake up at 7 AM and brush my teeth.",
              language: "en",
              hint: "Describe morning routine",
            },
          ],
        },
        {
          title: "Getting Ready",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you put on in the morning?",
              options: ["Clothes", "Pajamas", "Bed", "Pillow"],
              correctAnswer: "0",
              explanation: "You put on clothes in the morning.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I ___ (get dressed) after my shower.",
              correctAnswer: "get dressed",
              explanation: "Getting dressed means putting on clothes.",
            },
          ],
        },
        {
          title: "School/Work Routine",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you go during the day to learn?",
              options: ["School", "Home", "Bed", "Restaurant"],
              correctAnswer: "0",
              explanation: "School is where you go to learn.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I go to ___ (work) at 9 AM.",
              correctAnswer: "work",
              explanation: "Work is where adults go during the day.",
            },
          ],
        },
        {
          title: "Afternoon Activities",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do after school?",
              options: ["Play sports", "Sleep", "Eat breakfast", "Watch morning TV"],
              correctAnswer: "0",
              explanation: "Playing sports is a common after-school activity.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Lunch is eaten in the afternoon.",
              correctAnswer: "true",
              explanation: "Lunch is the afternoon meal.",
            },
          ],
        },
        {
          title: "Evening Routine",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do before bed?",
              options: ["Brush teeth", "Eat breakfast", "Wake up", "Go to school"],
              correctAnswer: "0",
              explanation: "Brushing teeth before bed is good hygiene.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I go to ___ (bed) at 10 PM.",
              correctAnswer: "bed",
              explanation: "Going to bed means going to sleep.",
            },
          ],
        },
      ],
    },
    {
      title: "Home & Furniture",
      lessons: [
        {
          title: "Parts of House",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you sleep?",
              options: ["Bedroom", "Kitchen", "Bathroom", "Garage"],
              correctAnswer: "0",
              explanation: "The bedroom is where you sleep.",
            },
            {
              type: "MCQ",
              question: "Where do you cook food?",
              options: ["Kitchen", "Bedroom", "Living room", "Bathroom"],
              correctAnswer: "0",
              explanation: "The kitchen is for cooking.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I watch TV in the ___ (living room/bedroom).",
              correctAnswer: "living room",
              explanation: "The living room is for relaxing and watching TV.",
            },
            {
              type: "MATCHING",
              question: "Match rooms with activities:",
              options: [
                { left: "Kitchen", right: "Cooking" },
                { left: "Bedroom", right: "Sleeping" },
                { left: "Bathroom", right: "Washing" },
                { left: "Living room", right: "Relaxing" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each room matches its main activity.",
            },
          ],
        },
        {
          title: "Living Room",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you sit on in the living room?",
              options: ["Sofa", "Bed", "Toilet", "Shower"],
              correctAnswer: "0",
              explanation: "A sofa is for sitting in the living room.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The TV is on the ___ (table).",
              correctAnswer: "table",
              explanation: "The TV sits on a table or stand.",
            },
          ],
        },
        {
          title: "Bedroom",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you sleep on?",
              options: ["Bed", "Chair", "Table", "Floor"],
              correctAnswer: "0",
              explanation: "You sleep on a bed.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I put my clothes in the ___ (closet/drawer).",
              correctAnswer: "closet",
              explanation: "Clothes are stored in a closet or drawer.",
            },
          ],
        },
        {
          title: "Kitchen Items",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you use to eat soup?",
              options: ["Spoon", "Fork", "Knife", "Plate"],
              correctAnswer: "0",
              explanation: "Soup is eaten with a spoon.",
            },
            {
              type: "CHECKBOX",
              question: "Select all items found in a kitchen:",
              options: ["Refrigerator", "Bed", "Stove", "Pillow"],
              correctAnswer: "[0,2]",
              explanation: "Refrigerator and stove are kitchen items. Bed and pillow are bedroom items.",
            },
          ],
        },
        {
          title: "Bathroom",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you use to wash your hands?",
              options: ["Sink", "Toilet", "Bathtub", "Bed"],
              correctAnswer: "0",
              explanation: "A sink is for washing hands and face.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: A shower is for washing your body.",
              correctAnswer: "true",
              explanation: "A shower is used to wash your body.",
            },
          ],
        },
      ],
    },
    {
      title: "Present Tense Basics",
      lessons: [
        {
          title: "To Be (am/is/are)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I am happy", "I is happy", "I are happy", "I be happy"],
              correctAnswer: "0",
              explanation: "I am is the correct form of 'to be' for I.",
            },
            {
              type: "MCQ",
              question: "Which is correct for 'he'?",
              options: ["He is tall", "He am tall", "He are tall", "He be tall"],
              correctAnswer: "0",
              explanation: "He is uses 'is' with he/she/it.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: You ___ (are) my friend.",
              correctAnswer: "are",
              explanation: "You are is the correct form for you.",
            },
            {
              type: "SPEECH",
              question: "I am a student. She is a teacher.",
              correctAnswer: "I am a student. She is a teacher.",
              language: "en",
              hint: "Use 'to be' correctly",
            },
          ],
        },
        {
          title: "To Have (have/has)",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is correct?",
              options: ["I have a dog", "I has a dog", "I haves a dog", "I am have a dog"],
              correctAnswer: "0",
              explanation: "I have is correct. Has is for he/she/it.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: She ___ (has) a cat.",
              correctAnswer: "has",
              explanation: "She has uses 'has' with he/she/it.",
            },
          ],
        },
        {
          title: "Regular Verbs I",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the correct form for 'I'?",
              options: ["I work", "I works", "I working", "I workes"],
              correctAnswer: "0",
              explanation: "I work uses the base form for I/you/we/they.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: He ___ (work) at a school.",
              correctAnswer: "works",
              explanation: "He works adds -s for he/she/it.",
            },
          ],
        },
        {
          title: "Regular Verbs II",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is correct for 'they'?",
              options: ["They play soccer", "They plays soccer", "They playing soccer", "They playes soccer"],
              correctAnswer: "0",
              explanation: "They play uses base form for plural subjects.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'She like music' is correct.",
              correctAnswer: "false",
              explanation: "She likes (with -s) is correct.",
            },
          ],
        },
        {
          title: "Common Irregular Verbs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the past of 'go'?",
              options: ["Went", "Goed", "Goes", "Gone"],
              correctAnswer: "0",
              explanation: "Go → went (irregular past).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I ___ (see) a movie yesterday.",
              correctAnswer: "saw",
              explanation: "See → saw (irregular past).",
            },
          ],
        },
      ],
    },
    {
      title: "School & Education",
      lessons: [
        {
          title: "School Subjects",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which subject teaches about numbers?",
              options: ["Math", "History", "Art", "Music"],
              correctAnswer: "0",
              explanation: "Math is about numbers and calculations.",
            },
            {
              type: "MCQ",
              question: "Which subject teaches about the past?",
              options: ["History", "Math", "PE", "Art"],
              correctAnswer: "0",
              explanation: "History teaches about past events.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I study ___ (science) at school.",
              correctAnswer: "science",
              explanation: "Science is a school subject.",
            },
            {
              type: "SPEECH",
              question: "My favorite subject is English.",
              correctAnswer: "My favorite subject is English.",
              language: "en",
              hint: "Name a school subject",
            },
          ],
        },
        {
          title: "Classroom Objects",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you write with?",
              options: ["Pen", "Book", "Desk", "Chair"],
              correctAnswer: "0",
              explanation: "A pen is for writing.",
            },
            {
              type: "MATCHING",
              question: "Match objects with use:",
              options: [
                { left: "Pen", right: "Writing" },
                { left: "Eraser", right: "Erasing" },
                { left: "Book", right: "Reading" },
                { left: "Ruler", right: "Measuring" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each object matches its use.",
            },
          ],
        },
        {
          title: "School Schedule",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "When does school usually start?",
              options: ["8 AM", "12 PM", "3 PM", "8 PM"],
              correctAnswer: "0",
              explanation: "School usually starts in the morning around 8 AM.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: School ends at ___ (3 PM/12 PM).",
              correctAnswer: "3 PM",
              explanation: "School typically ends in the afternoon.",
            },
          ],
        },
        {
          title: "Studying Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do to learn new words?",
              options: ["Study vocabulary", "Eat lunch", "Play soccer", "Sleep"],
              correctAnswer: "0",
              explanation: "Studying vocabulary helps you learn new words.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: A dictionary helps you learn new words.",
              correctAnswer: "true",
              explanation: "A dictionary gives meanings of words.",
            },
          ],
        },
        {
          title: "Reading and Writing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do with a book?",
              options: ["Read", "Eat", "Drive", "Sing"],
              correctAnswer: "0",
              explanation: "You read books.",
            },
            {
              type: "CHECKBOX",
              question: "Select all literacy activities:",
              options: ["Reading", "Running", "Writing", "Swimming"],
              correctAnswer: "[0,2]",
              explanation: "Reading and writing are literacy activities.",
            },
          ],
        },
      ],
    },
    {
      title: "Colors, Shapes & Sizes",
      lessons: [
        {
          title: "Basic Shapes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What shape has 3 sides?",
              options: ["Triangle", "Square", "Circle", "Rectangle"],
              correctAnswer: "0",
              explanation: "A triangle has 3 sides.",
            },
            {
              type: "MCQ",
              question: "What shape has 4 equal sides?",
              options: ["Square", "Triangle", "Circle", "Oval"],
              correctAnswer: "0",
              explanation: "A square has 4 equal sides.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A circle has no ___ (sides/corners).",
              correctAnswer: "sides",
              explanation: "A circle is round with no sides or corners.",
            },
            {
              type: "SPEECH",
              question: "A square has four sides. A circle is round.",
              correctAnswer: "A square has four sides. A circle is round.",
              language: "en",
              hint: "Describe shapes",
            },
          ],
        },
        {
          title: "Big and Small",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is the opposite of big?",
              options: ["Small", "Tall", "Long", "Wide"],
              correctAnswer: "0",
              explanation: "Small is the opposite of big.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: An elephant is ___ (big). A mouse is ___ (small).",
              correctAnswer: "big,small",
              explanation: "Elephants are big, mice are small.",
            },
          ],
        },
        {
          title: "Long and Short",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is long?",
              options: ["A river", "A pebble", "A button", "A coin"],
              correctAnswer: "0",
              explanation: "Rivers are long. The others are small items.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Hair can be long or short.",
              correctAnswer: "true",
              explanation: "Hair length varies from long to short.",
            },
          ],
        },
        {
          title: "Comparing Objects",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is bigger: a house or a dog?",
              options: ["House", "Dog", "Same size", "Cannot tell"],
              correctAnswer: "0",
              explanation: "A house is much bigger than a dog.",
            },
            {
              type: "CHECKBOX",
              question: "Select all big objects:",
              options: ["Mountain", "Ant", "Building", "Pebble"],
              correctAnswer: "[0,2]",
              explanation: "Mountains and buildings are big. Ants and pebbles are small.",
            },
          ],
        },
        {
          title: "Spatial Relationships",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where is the book if it is on the table?",
              options: ["On the table", "Under the table", "Beside the table", "Inside the table"],
              correctAnswer: "0",
              explanation: "On means the book is on top of the table.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: The cat is ___ (under) the table.",
              correctAnswer: "under",
              explanation: "Under means below something.",
            },
          ],
        },
      ],
    },
    {
      title: "Weather & Seasons",
      lessons: [
        {
          title: "Weather Conditions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What weather brings rain?",
              options: ["Rainy", "Sunny", "Snowy", "Windy"],
              correctAnswer: "0",
              explanation: "Rainy weather means it is raining.",
            },
            {
              type: "MCQ",
              question: "What weather is hot and bright?",
              options: ["Sunny", "Rainy", "Snowy", "Cloudy"],
              correctAnswer: "0",
              explanation: "Sunny weather is hot and bright with sunshine.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: It is ___ (snowing) outside. Cold!",
              correctAnswer: "snowing",
              explanation: "Snowing means snow is falling.",
            },
            {
              type: "SPEECH",
              question: "It is sunny today. The sun is bright.",
              correctAnswer: "It is sunny today. The sun is bright.",
              language: "en",
              hint: "Describe the weather",
            },
          ],
        },
        {
          title: "Temperature",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is hot?",
              options: ["Fire", "Ice", "Snow", "Rain"],
              correctAnswer: "0",
              explanation: "Fire is hot. Ice, snow, and rain are cold.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Water freezes at ___ degrees (cold/hot).",
              correctAnswer: "cold",
              explanation: "Water freezes when it is cold (0°C).",
            },
          ],
        },
        {
          title: "Seasons of Year",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which season is after winter?",
              options: ["Spring", "Summer", "Fall", "Winter again"],
              correctAnswer: "0",
              explanation: "Spring comes after winter.",
            },
            {
              type: "MATCHING",
              question: "Match seasons with weather:",
              options: [
                { left: "Summer", right: "Hot" },
                { left: "Winter", right: "Cold" },
                { left: "Spring", right: "Warm" },
                { left: "Fall", right: "Cool" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Summer is hot, winter is cold, spring is warm, fall is cool.",
            },
          ],
        },
        {
          title: "What to Wear",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you wear in winter?",
              options: ["Coat", "T-shirt", "Shorts", "Sandals"],
              correctAnswer: "0",
              explanation: "A coat keeps you warm in winter.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: You wear a swimsuit in winter.",
              correctAnswer: "false",
              explanation: "Swimsuits are for summer, not winter.",
            },
          ],
        },
        {
          title: "Weather Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when it is raining?",
              options: ["It is raining", "It is sunny", "It is snowing", "It is windy"],
              correctAnswer: "0",
              explanation: "It is raining describes rainy weather.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ a nice day! (It is/That is)",
              correctAnswer: "It is",
              explanation: "It is a nice day is a weather expression.",
            },
          ],
        },
      ],
    },
    {
      title: "Clothing & Fashion",
      lessons: [
        {
          title: "Clothing Items I",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you wear on your feet?",
              options: ["Shoes", "Hat", "Gloves", "Scarf"],
              correctAnswer: "0",
              explanation: "Shoes go on your feet.",
            },
            {
              type: "MCQ",
              question: "What do you wear on your head?",
              options: ["Hat", "Socks", "Pants", "Shirt"],
              correctAnswer: "0",
              explanation: "A hat goes on your head.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I wear a ___ (shirt) on my upper body.",
              correctAnswer: "shirt",
              explanation: "A shirt covers your upper body.",
            },
            {
              type: "SPEECH",
              question: "I am wearing a blue shirt and black pants.",
              correctAnswer: "I am wearing a blue shirt and black pants.",
              language: "en",
              hint: "Describe your clothes",
            },
          ],
        },
        {
          title: "Clothing Items II",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you wear when it rains?",
              options: ["Raincoat", "Swimsuit", "Shorts", "Sandals"],
              correctAnswer: "0",
              explanation: "A raincoat keeps you dry in rain.",
            },
            {
              type: "MATCHING",
              question: "Match clothing with body part:",
              options: [
                { left: "Shoes", right: "Feet" },
                { left: "Gloves", right: "Hands" },
                { left: "Hat", right: "Head" },
                { left: "Scarf", right: "Neck" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each clothing item matches its body part.",
            },
          ],
        },
        {
          title: "Colors of Clothes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What color is a typical school bus?",
              options: ["Yellow", "Blue", "Red", "Green"],
              correctAnswer: "0",
              explanation: "School buses are typically yellow.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My shoes are ___ (black/white).",
              correctAnswer: "black",
              explanation: "Many shoes are black or white.",
            },
          ],
        },
        {
          title: "Sizes and Fit",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What size is bigger than medium?",
              options: ["Large", "Small", "Extra small", "Tiny"],
              correctAnswer: "0",
              explanation: "Large is bigger than medium.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Small is bigger than large.",
              correctAnswer: "false",
              explanation: "Small is smaller than large.",
            },
          ],
        },
        {
          title: "Shopping for Clothes",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to try on clothes?",
              options: ["Can I try this on?", "Give me this", "I want this", "This is mine"],
              correctAnswer: "0",
              explanation: "Can I try this on? is polite for trying clothes.",
            },
            {
              type: "CHECKBOX",
              question: "Select all clothing items:",
              options: ["Shirt", "Table", "Pants", "Chair"],
              correctAnswer: "[0,2]",
              explanation: "Shirt and pants are clothing. Table and chair are furniture.",
            },
          ],
        },
      ],
    },
    {
      title: "Body Parts & Health",
      lessons: [
        {
          title: "Head and Face",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you see with?",
              options: ["Eyes", "Ears", "Nose", "Mouth"],
              correctAnswer: "0",
              explanation: "You see with your eyes.",
            },
            {
              type: "MCQ",
              question: "What do you hear with?",
              options: ["Ears", "Eyes", "Nose", "Hair"],
              correctAnswer: "0",
              explanation: "You hear with your ears.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I smell with my ___ (nose).",
              correctAnswer: "nose",
              explanation: "You smell with your nose.",
            },
            {
              type: "MATCHING",
              question: "Match senses with body parts:",
              options: [
                { left: "See", right: "Eyes" },
                { left: "Hear", right: "Ears" },
                { left: "Smell", right: "Nose" },
                { left: "Taste", right: "Tongue" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each sense matches its body part.",
            },
            {
              type: "SPEECH",
              question: "I have two eyes, two ears, and one nose.",
              correctAnswer: "I have two eyes, two ears, and one nose.",
              language: "en",
              hint: "Name face parts",
            },
          ],
        },
        {
          title: "Torso and Arms",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you hold things with?",
              options: ["Hands", "Feet", "Head", "Knees"],
              correctAnswer: "0",
              explanation: "You hold things with your hands.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I write with my ___ (hand).",
              correctAnswer: "hand",
              explanation: "Most people write with their dominant hand.",
            },
          ],
        },
        {
          title: "Legs and Feet",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you walk with?",
              options: ["Legs", "Arms", "Hands", "Head"],
              correctAnswer: "0",
              explanation: "You walk with your legs and feet.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: You have two legs and two feet.",
              correctAnswer: "true",
              explanation: "Humans typically have 2 legs and 2 feet.",
            },
          ],
        },
        {
          title: "Common Illnesses",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What illness gives you a headache and fever?",
              options: ["Flu", "Broken leg", "Cut finger", "Bruise"],
              correctAnswer: "0",
              explanation: "The flu causes fever, headache, and body aches.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I have a ___ (cold). I sneeze a lot.",
              correctAnswer: "cold",
              explanation: "A cold causes sneezing and runny nose.",
            },
          ],
        },
        {
          title: "At the Doctor",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when you are sick?",
              options: ["I don't feel well", "I feel great", "I am happy", "I am hungry"],
              correctAnswer: "0",
              explanation: "I don't feel well means you are sick.",
            },
            {
              type: "CHECKBOX",
              question: "Select all symptoms of illness:",
              options: ["Fever", "Happiness", "Cough", "Energy"],
              correctAnswer: "[0,2]",
              explanation: "Fever and cough are symptoms. Happiness and energy are not symptoms.",
            },
          ],
        },
      ],
    },
    {
      title: "Animals & Nature",
      lessons: [
        {
          title: "Farm Animals",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which animal says 'moo'?",
              options: ["Cow", "Cat", "Dog", "Pig"],
              correctAnswer: "0",
              explanation: "Cows say 'moo'.",
            },
            {
              type: "MCQ",
              question: "Which animal gives us eggs?",
              options: ["Chicken", "Cow", "Sheep", "Horse"],
              correctAnswer: "0",
              explanation: "Chickens lay eggs.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: A ___ (pig) is pink and says 'oink'.",
              correctAnswer: "pig",
              explanation: "Pigs are pink farm animals.",
            },
            {
              type: "SPEECH",
              question: "The cow says moo. The chicken says cluck.",
              correctAnswer: "The cow says moo. The chicken says cluck.",
              language: "en",
              hint: "Animal sounds",
            },
          ],
        },
        {
          title: "Wild Animals",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which animal is the king of the jungle?",
              options: ["Lion", "Elephant", "Giraffe", "Monkey"],
              correctAnswer: "0",
              explanation: "The lion is called the king of the jungle.",
            },
            {
              type: "MATCHING",
              question: "Match animals with features:",
              options: [
                { left: "Giraffe", right: "Long neck" },
                { left: "Elephant", right: "Big ears" },
                { left: "Zebra", right: "Stripes" },
                { left: "Cheetah", right: "Fast" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each animal matches its feature.",
            },
          ],
        },
        {
          title: "Pets at Home",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which pet says 'meow'?",
              options: ["Cat", "Dog", "Bird", "Fish"],
              correctAnswer: "0",
              explanation: "Cats say 'meow'.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My dog says ___ (woof/bark).",
              correctAnswer: "woof",
              explanation: "Dogs bark or say 'woof'.",
            },
          ],
        },
        {
          title: "Habitats",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do fish live?",
              options: ["Water", "Land", "Trees", "Sky"],
              correctAnswer: "0",
              explanation: "Fish live in water.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Birds live in water.",
              correctAnswer: "false",
              explanation: "Birds live in trees/nests, not water.",
            },
          ],
        },
        {
          title: "Nature Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a group of trees called?",
              options: ["Forest", "Desert", "Ocean", "Mountain"],
              correctAnswer: "0",
              explanation: "A forest is a group of many trees.",
            },
            {
              type: "CHECKBOX",
              question: "Select all natural places:",
              options: ["Forest", "Building", "River", "Road"],
              correctAnswer: "[0,2]",
              explanation: "Forest and river are natural. Building and road are man-made.",
            },
          ],
        },
      ],
    },
    {
      title: "Transportation & Travel",
      lessons: [
        {
          title: "Modes of Transport",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What flies in the sky?",
              options: ["Airplane", "Car", "Train", "Bus"],
              correctAnswer: "0",
              explanation: "Airplanes fly in the sky.",
            },
            {
              type: "MCQ",
              question: "What runs on tracks?",
              options: ["Train", "Car", "Bicycle", "Boat"],
              correctAnswer: "0",
              explanation: "Trains run on tracks/rails.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I drive a ___ (car) on the road.",
              correctAnswer: "car",
              explanation: "Cars are driven on roads.",
            },
            {
              type: "SPEECH",
              question: "I go to school by bus.",
              correctAnswer: "I go to school by bus.",
              language: "en",
              hint: "Transportation mode",
            },
          ],
        },
        {
          title: "Giving Directions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which is left?",
              options: ["L", "R", "U", "D"],
              correctAnswer: "0",
              explanation: "L stands for Left.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: Turn ___ (left/right) at the stop sign.",
              correctAnswer: "left",
              explanation: "Left and right are directions.",
            },
          ],
        },
        {
          title: "Public Transport",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is cheap public transport in the city?",
              options: ["Bus", "Taxi", "Airplane", "Own car"],
              correctAnswer: "0",
              explanation: "Buses are cheap public transport.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: A taxi is cheaper than a bus.",
              correctAnswer: "false",
              explanation: "Taxis are more expensive than buses.",
            },
          ],
        },
        {
          title: "At the Airport",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you show at airport security?",
              options: ["Passport", "Grocery list", "Library card", "Birthday card"],
              correctAnswer: "0",
              explanation: "You need a passport for air travel.",
            },
            {
              type: "MATCHING",
              question: "Match transport with use:",
              options: [
                { left: "Airplane", right: "Long distance" },
                { left: "Bicycle", right: "Short distance" },
                { left: "Ship", right: "Water travel" },
                { left: "Train", right: "Land travel" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each transport matches its use.",
            },
          ],
        },
        {
          title: "Travel Vocabulary",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a journey to another country called?",
              options: ["Trip", "Walk", "Run", "Drive"],
              correctAnswer: "0",
              explanation: "A trip is travel to another place.",
            },
            {
              type: "CHECKBOX",
              question: "Select all travel items:",
              options: ["Suitcase", "Pillow", "Passport", "Toothbrush"],
              correctAnswer: "[0,2]",
              explanation: "Suitcase and passport are for travel. Pillow and toothbrush are personal items.",
            },
          ],
        },
      ],
    },
    {
      title: "Sports & Hobbies",
      lessons: [
        {
          title: "Popular Sports",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What sport uses a ball and hoop?",
              options: ["Basketball", "Soccer", "Tennis", "Swimming"],
              correctAnswer: "0",
              explanation: "Basketball uses a ball and hoop.",
            },
            {
              type: "MCQ",
              question: "What sport uses a net and racket?",
              options: ["Tennis", "Basketball", "Baseball", "Golf"],
              correctAnswer: "0",
              explanation: "Tennis uses rackets and a net.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I play ___ (soccer/football) with my friends.",
              correctAnswer: "soccer",
              explanation: "Soccer/football is a popular sport.",
            },
            {
              type: "SPEECH",
              question: "I like to play basketball and tennis.",
              correctAnswer: "I like to play basketball and tennis.",
              language: "en",
              hint: "Name sports you like",
            },
          ],
        },
        {
          title: "Hobbies and Interests",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do as a hobby?",
              options: ["Paint", "Work", "Sleep", "Eat"],
              correctAnswer: "0",
              explanation: "Painting is a hobby/leisure activity.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: My hobby is ___ (reading/music).",
              correctAnswer: "reading",
              explanation: "Reading is a common hobby.",
            },
          ],
        },
        {
          title: "Watching Sports",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you watch sports?",
              options: ["Stadium", "Library", "School", "Hospital"],
              correctAnswer: "0",
              explanation: "Stadiums are for watching sports.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: Fans watch sports at the stadium.",
              correctAnswer: "true",
              explanation: "Fans go to stadiums to watch games.",
            },
          ],
        },
        {
          title: "Weekend Activities",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you do on weekends for fun?",
              options: ["Go to movies", "Go to work", "Go to school", "Go to sleep early"],
              correctAnswer: "0",
              explanation: "Going to movies is weekend fun.",
            },
            {
              type: "CHECKBOX",
              question: "Select all weekend activities:",
              options: ["Play sports", "Go to work", "Watch TV", "Study math"],
              correctAnswer: "[0,2]",
              explanation: "Play sports and watch TV are weekend fun. Work and study are not typically weekend activities.",
            },
          ],
        },
        {
          title: "Being a Fan",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you call someone who loves a team?",
              options: ["Fan", "Player", "Coach", "Referee"],
              correctAnswer: "0",
              explanation: "A fan supports a team.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I am a ___ (fan) of the Lakers.",
              correctAnswer: "fan",
              explanation: "A fan supports a sports team.",
            },
          ],
        },
      ],
    },
    {
      title: "Shopping & Money",
      lessons: [
        {
          title: "Store Types",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you buy food?",
              options: ["Supermarket", "Clothing store", "Bookstore", "Pharmacy"],
              correctAnswer: "0",
              explanation: "Supermarkets sell food.",
            },
            {
              type: "MCQ",
              question: "Where do you buy medicine?",
              options: ["Pharmacy", "Supermarket", "Bakery", "Toy store"],
              correctAnswer: "0",
              explanation: "Pharmacies sell medicine.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I buy books at the ___ (bookstore/library).",
              correctAnswer: "bookstore",
              explanation: "Bookstores sell books. Libraries lend books.",
            },
            {
              type: "SPEECH",
              question: "I need to go to the supermarket to buy food.",
              correctAnswer: "I need to go to the supermarket to buy food.",
              language: "en",
              hint: "Say where you shop",
            },
          ],
        },
        {
          title: "Prices and Costs",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "How much is $5 + $3?",
              options: ["$8", "$2", "$9", "$15"],
              correctAnswer: "0",
              explanation: "$5 + $3 = $8.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: $10 is more than $5.",
              correctAnswer: "true",
              explanation: "$10 is greater than $5.",
            },
          ],
        },
        {
          title: "Making Purchases",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to buy something?",
              options: ["I would like to buy this", "Give me this", "This is mine", "I take this now"],
              correctAnswer: "0",
              explanation: "I would like to buy this is polite.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: How ___ (much) is this shirt?",
              correctAnswer: "much",
              explanation: "How much asks about price.",
            },
          ],
        },
        {
          title: "Paying Methods",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is plastic and used to pay?",
              options: ["Credit card", "Cash", "Check", "Coin"],
              correctAnswer: "0",
              explanation: "Credit cards are plastic payment cards.",
            },
            {
              type: "CHECKBOX",
              question: "Select all payment methods:",
              options: ["Cash", "Credit card", "Book", "Apple"],
              correctAnswer: "[0,1]",
              explanation: "Cash and credit cards are payment methods.",
            },
          ],
        },
        {
          title: "Shopping Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when something is too expensive?",
              options: ["That is too expensive", "I love this", "I buy this", "That is cheap"],
              correctAnswer: "0",
              explanation: "That is too expensive shows the price is high.",
            },
            {
              type: "MATCHING",
              question: "Match expressions with meanings:",
              options: [
                { left: "How much?", right: "Price" },
                { left: "I'll take it", right: "Buy" },
                { left: "Just looking", right: "Browse" },
                { left: "Do you have this in blue?", right: "Color" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each expression matches its meaning.",
            },
          ],
        },
      ],
    },
    {
      title: "Places in Town",
      lessons: [
        {
          title: "City Places I",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you go to see a doctor?",
              options: ["Hospital", "School", "Restaurant", "Park"],
              correctAnswer: "0",
              explanation: "Hospitals and clinics have doctors.",
            },
            {
              type: "MCQ",
              question: "Where do you go to eat?",
              options: ["Restaurant", "Library", "School", "Bank"],
              correctAnswer: "0",
              explanation: "Restaurants serve food.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I borrow books from the ___ (library).",
              correctAnswer: "library",
              explanation: "Libraries lend books.",
            },
            {
              type: "SPEECH",
              question: "The hospital is next to the school.",
              correctAnswer: "The hospital is next to the school.",
              language: "en",
              hint: "Describe places",
            },
          ],
        },
        {
          title: "City Places II",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where do you keep money?",
              options: ["Bank", "School", "Park", "Restaurant"],
              correctAnswer: "0",
              explanation: "Banks store money.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I exercise at the ___ (gym/park).",
              correctAnswer: "gym",
              explanation: "Gyms are for exercise.",
            },
          ],
        },
        {
          title: "Giving Directions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What does 'next to' mean?",
              options: ["Beside", "Far from", "Inside", "Behind"],
              correctAnswer: "0",
              explanation: "Next to means beside/adjacent to.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Across from' means on the same side.",
              correctAnswer: "false",
              explanation: "Across from means on the opposite side.",
            },
          ],
        },
        {
          title: "Prepositions of Place",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Where is the book if it is on the table?",
              options: ["On the table", "Under the table", "Beside the table", "Behind the table"],
              correctAnswer: "0",
              explanation: "On means the book is on top.",
            },
            {
              type: "CHECKBOX",
              question: "Select all prepositions of place:",
              options: ["On", "Quickly", "Under", "Beautiful"],
              correctAnswer: "[0,2]",
              explanation: "On and under are prepositions of place.",
            },
          ],
        },
        {
          title: "Describing Places",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which word describes a place with many people?",
              options: ["Crowded", "Empty", "Quiet", "Small"],
              correctAnswer: "0",
              explanation: "Crowded means full of people.",
            },
            {
              type: "MATCHING",
              question: "Match places with descriptions:",
              options: [
                { left: "Library", right: "Quiet" },
                { left: "Stadium", right: "Loud" },
                { left: "Park", right: "Green" },
                { left: "Hospital", right: "Clean" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each place matches its description.",
            },
          ],
        },
      ],
    },
    {
      title: "Time & Dates",
      lessons: [
        {
          title: "Telling Time",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What time is it when the big hand is on 12 and small hand on 3?",
              options: ["3:00", "12:00", "3:15", "12:30"],
              correctAnswer: "0",
              explanation: "3:00 = three o'clock.",
            },
            {
              type: "MCQ",
              question: "What does 'AM' mean?",
              options: ["Morning", "Afternoon", "Evening", "Night"],
              correctAnswer: "0",
              explanation: "AM = morning (ante meridiem).",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: It is 7:00 ___ (AM/PM) in the morning.",
              correctAnswer: "AM",
              explanation: "Morning time uses AM.",
            },
            {
              type: "SPEECH",
              question: "It is three o'clock in the afternoon.",
              correctAnswer: "It is three o'clock in the afternoon.",
              language: "en",
              hint: "Tell the time",
            },
          ],
        },
        {
          title: "Days of Week",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which day comes after Monday?",
              options: ["Tuesday", "Sunday", "Wednesday", "Friday"],
              correctAnswer: "0",
              explanation: "Tuesday comes after Monday.",
            },
            {
              type: "ORDERING",
              question: "Put in order: Saturday / Monday / Friday / Wednesday",
              hint: "Days of the week in order",
              correctAnswer: "Monday,Wednesday,Friday,Saturday",
              explanation: "Monday, Wednesday, Friday, Saturday is correct order.",
            },
          ],
        },
        {
          title: "Months and Seasons",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "Which month is New Year's?",
              options: ["January", "December", "July", "March"],
              correctAnswer: "0",
              explanation: "January 1st is New Year's Day.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: December is the ___ (last/first) month of the year.",
              correctAnswer: "last",
              explanation: "December is the 12th and last month.",
            },
          ],
        },
        {
          title: "Appointments",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say to make an appointment?",
              options: ["Can I make an appointment?", "Give me a time", "I want to come", "Time now please"],
              correctAnswer: "0",
              explanation: "Can I make an appointment? is polite.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 2:00 PM is afternoon.",
              correctAnswer: "true",
              explanation: "2:00 PM is afternoon.",
            },
          ],
        },
        {
          title: "Time Expressions",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What means 'at this moment'?",
              options: ["Now", "Later", "Yesterday", "Tomorrow"],
              correctAnswer: "0",
              explanation: "Now means at this moment.",
            },
            {
              type: "CHECKBOX",
              question: "Select all time expressions:",
              options: ["Now", "Happy", "Later", "Blue"],
              correctAnswer: "[0,2]",
              explanation: "Now and later are time expressions.",
            },
          ],
        },
      ],
    },
    {
      title: "Basic Communication",
      lessons: [
        {
          title: "Please and Thank You",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What makes a request polite?",
              options: ["Please", "Quickly", "Now", "Stop"],
              correctAnswer: "0",
              explanation: "Please makes requests more polite.",
            },
            {
              type: "MCQ",
              question: "What do you say when someone helps you?",
              options: ["Thank you", "Please", "Sorry", "Goodbye"],
              correctAnswer: "0",
              explanation: "Thank you shows gratitude.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: ___ you for your help. (Thank)",
              correctAnswer: "Thank",
              explanation: "Thank you is polite gratitude.",
            },
            {
              type: "SPEECH",
              question: "Please help me. Thank you very much.",
              correctAnswer: "Please help me. Thank you very much.",
              language: "en",
              hint: "Be polite",
            },
          ],
        },
        {
          title: "Asking for Help",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when you need help?",
              options: ["Can you help me?", "Go away", "I am fine", "Leave me alone"],
              correctAnswer: "0",
              explanation: "Can you help me? asks for assistance.",
            },
            {
              type: "FILL_BLANK",
              question: "Complete: I need ___ (help). Can you assist me?",
              correctAnswer: "help",
              explanation: "I need help means you require assistance.",
            },
          ],
        },
        {
          title: "Apologizing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when you make a mistake?",
              options: ["Sorry", "Thank you", "Hello", "Goodbye"],
              correctAnswer: "0",
              explanation: "Sorry apologizes for mistakes.",
            },
            {
              type: "TRUE_FALSE",
              question: "True or False: 'Excuse me' is used to get attention politely.",
              correctAnswer: "true",
              explanation: "Excuse me politely gets someone's attention.",
            },
          ],
        },
        {
          title: "Agreeing and Disagreeing",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What do you say when you agree?",
              options: ["I agree", "You are wrong", "I disagree", "No way"],
              correctAnswer: "0",
              explanation: "I agree shows you think the same way.",
            },
            {
              type: "CHECKBOX",
              question: "Select all ways to agree:",
              options: ["I agree", "You are right", "I think so too", "You are wrong"],
              correctAnswer: "[0,1,2]",
              explanation: "I agree, You are right, and I think so too all show agreement.",
            },
          ],
        },
        {
          title: "Simple Requests",
          type: "QUIZ",
          questions: [
            {
              type: "MCQ",
              question: "What is a polite way to ask for water?",
              options: ["Can I have some water, please?", "Give me water", "Water now", "I want water"],
              correctAnswer: "0",
              explanation: "Can I have some water, please? is polite.",
            },
            {
              type: "MATCHING",
              question: "Match requests with responses:",
              options: [
                { left: "Can I have water?", right: "Here you go" },
                { left: "Please help me", right: "Of course" },
                { left: "Pass the salt", right: "Here it is" },
                { left: "Open the door", right: "Sure" },
              ],
              correctAnswer: "[0,2,1,3]",
              explanation: "Each request matches its polite response.",
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
    
    const { course: courseData, modules: modulesData } = englishA1CourseData;
    
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
    console.error("Error creating English A1 course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
