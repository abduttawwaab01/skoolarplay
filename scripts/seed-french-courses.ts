import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function q(type: string, question: string, opts?: Record<string, any>) {
  return { type, question, ...opts };
}

async function seedFrenchA2() {
  console.log("\n🇫🇷 Seeding French A2 - Intermediaire...\n");

  let category = await db.category.findFirst({ where: { name: { equals: "Languages", mode: "insensitive" } } });
  if (!category) {
    category = await db.category.create({
      data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" },
    });
    console.log("   ✅ Created Languages category");
  }

  const existing = await db.course.findFirst({ where: { title: "French A2 - Intermediaire" } });
  if (existing) {
    console.log("   🗑️  Deleting existing French A2...");
    await db.question.deleteMany({ where: { lesson: { module: { courseId: existing.id } } } });
    await db.lesson.deleteMany({ where: { module: { courseId: existing.id } } });
    await db.module.deleteMany({ where: { courseId: existing.id } });
    await db.course.delete({ where: { id: existing.id } });
    console.log("   ✅ Deleted existing course");
  }

  const modules = [
    {
      title: "Le Passe Compose (Past Tense)",
      lessons: [
        {
          title: "Passe Compose with Avoir",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the past participle of 'parler' (to speak)?", { options: ["parle", "parler", "parlant", "parles"], correctAnswer: "0", explanation: "The past participle of -er verbs ends in -e." }),
            q("FILL_BLANK", "J'ai ___ (manger) une pomme.", { correctAnswer: "mange", explanation: "Manger is a regular -er verb. Past participle: mange." }),
            q("TRUE_FALSE", "True or False: Passe compose uses 'avoir' or 'etre' as helper verbs.", { correctAnswer: "true", explanation: "Passe compose is formed with avoir/etre + past participle." }),
            q("MCQ", "What is the past participle of 'finir'?", { options: ["fini", "finir", "finissant", "finis"], correctAnswer: "0", explanation: "Finir (ir verb) -> fini." }),
            q("MCQ", "'Nous avons regarde un film' means:", { options: ["We watched a movie", "We watch a movie", "We are watching a movie", "We will watch a movie"], correctAnswer: "0", explanation: "Nous avons regarde = We watched (passe compose)." }),
            q("FILL_BLANK", "Tu as ___ (choisir) un beau cadeau.", { correctAnswer: "choisi", explanation: "Choisir -> choisi." }),
            q("CHECKBOX", "Select all correct passe compose sentences:", { options: ["J'ai mange", "Nous avons parle", "Tu manger", "Elle a fini"], correctAnswer: "[0,1,3]", explanation: "J'ai mange, Nous avons parle, Elle a fini are all correct." }),
            q("TRUE_FALSE", "True or False: 'J'ai parler' is correct.", { correctAnswer: "false", explanation: "Should be 'J'ai parle' (past participle)." }),
            q("MCQ", "What is the past participle of 'entendre'?", { options: ["entendu", "entendre", "entendant", "entends"], correctAnswer: "0", explanation: "Entendre (re verb) -> entendu." }),
            q("SPEECH", "J'ai achete un livre.", { correctAnswer: "J'ai achete un livre", language: "fr", hint: "Say: I bought a book" }),
            q("MATCHING", "Match the verb to its past participle:", { options: [{ left: "boire", right: "bu" }, { left: "lire", right: "lu" }, { left: "ecrire", right: "ecrit" }, { left: "prendre", right: "pris" }], correctAnswer: "[0,2,1,3]", explanation: "boire->bu, lire->lu, ecrire->ecrit, prendre->pris." }),
            q("FILL_BLANK", "Ils ont ___ (attendre) le bus pendant une heure.", { correctAnswer: "attendu", explanation: "Attendre -> attendu." }),
          ],
        },
        {
          title: "Passe Compose with Etre",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which verb uses 'etre' in passe compose?", { options: ["aller", "manger", "parler", "finir"], correctAnswer: "0", explanation: "Aller uses etre. DR MRS VANDERTRAMP verbs use etre." }),
            q("FILL_BLANK", "Je suis ___ (aller) au cinema.", { correctAnswer: "alle", explanation: "Aller uses etre. Je suis alle(e)." }),
            q("MCQ", "'Elle est partie' means:", { options: ["She left", "She is leaving", "She will leave", "She leaves"], correctAnswer: "0", explanation: "Partir uses etre. Elle est partie = She left (feminine)." }),
            q("TRUE_FALSE", "True or False: With etre, the past participle agrees with the subject.", { correctAnswer: "true", explanation: "With etre, the past participle agrees in gender and number." }),
            q("MCQ", "'Ils sont arrives' is:", { options: ["Masculine plural", "Feminine plural", "Singular", "Neutral"], correctAnswer: "0", explanation: "Ils sont arrives = masculine plural (adds -s)." }),
            q("FILL_BLANK", "Elle est ___ (venir) a la fete.", { correctAnswer: "venue", explanation: "Venir uses etre. Feminine: venue (-e added)." }),
            q("MCQ", "Which group of verbs uses 'etre'?", { options: ["DR MRS VANDERTRAMP", "All -er verbs", "All irregular verbs", "All -re verbs"], correctAnswer: "0", explanation: "DR MRS VANDERTRAMP verbs (and reflexive) use etre." }),
            q("CHECKBOX", "Select verbs that use 'etre':", { options: ["arriver", "manger", "sortir", "boire"], correctAnswer: "[0,2]", explanation: "Arriver and sortir use etre." }),
            q("SPEECH", "Nous sommes alles au parc hier.", { correctAnswer: "Nous sommes alles au parc hier", language: "fr", hint: "Say: We went to the park yesterday" }),
            q("FILL_BLANK", "Elles sont ___ (tomber) par terre.", { correctAnswer: "tombees", explanation: "Tomber uses etre. Feminine plural: tombees (-es)." }),
            q("TRUE_FALSE", "True or False: 'Il est ne en 1990' is correct.", { correctAnswer: "true", explanation: "Naitre uses etre. Il est ne = He was born." }),
            q("MCQ", "'Je suis reste a la maison' means:", { options: ["I stayed at home", "I am staying at home", "I will stay at home", "I rest at home"], correctAnswer: "0", explanation: "Rester uses etre. Je suis reste = I stayed." }),
          ],
        },
        {
          title: "Irregular Past Participles",
          type: "QUIZ",
          questions: [
            q("MATCHING", "Match the verb to its past participle:", { options: [{ left: "faire", right: "fait" }, { left: "prendre", right: "pris" }, { left: "voir", right: "vu" }, { left: "dire", right: "dit" }], correctAnswer: "[0,2,1,3]", explanation: "faire->fait, prendre->pris, voir->vu, dire->dit." }),
            q("MCQ", "What is the past participle of 'ecrire'?", { options: ["ecrit", "ecrire", "ecrivant", "ecris"], correctAnswer: "0", explanation: "Ecrire -> ecrit (irregular)." }),
            q("SPEECH", "J'ai fait mes devoirs.", { correctAnswer: "J'ai fait mes devoirs", language: "fr", hint: "Say: I did my homework" }),
            q("MCQ", "What is the past participle of 'mettre'?", { options: ["mis", "mett", "mettant", "met"], correctAnswer: "0", explanation: "Mettre -> mis." }),
            q("FILL_BLANK", "J'ai ___ (comprendre) la lecon.", { correctAnswer: "compris", explanation: "Comprendre -> compris." }),
            q("TRUE_FALSE", "True or False: The past participle of 'ouvrir' is 'ouvert'.", { correctAnswer: "true", explanation: "Ouvrir -> ouvert (like ouvrir = to open)." }),
            q("MCQ", "'Nous avons offert des fleurs' means:", { options: ["We offered flowers", "We are offering flowers", "We will offer flowers", "We suffer flowers"], correctAnswer: "0", explanation: "Offrir -> offert. Nous avons offert = We offered." }),
            q("CHECKBOX", "Select all correct past participles:", { options: ["connu (connaitre)", "cru (croire)", "dormi (dormir)", "couru (courir)"], correctAnswer: "[0,1,2,3]", explanation: "All are correct irregular past participles." }),
            q("FILL_BLANK", "Elle a ___ (apprendre) le francais.", { correctAnswer: "appris", explanation: "Apprendre -> appris." }),
            q("MCQ", "What is the past participle of 'devoir'?", { options: ["du", "devu", "devant", "dois"], correctAnswer: "0", explanation: "Devoir -> du." }),
            q("TRUE_FALSE", "True or False: 'J'ai voulu partir' is correct.", { correctAnswer: "true", explanation: "Vouloir -> voulu. J'ai voulu = I wanted." }),
            q("FILL_BLANK", "Il a ___ (pleuvoir) hier.", { correctAnswer: "plu", explanation: "Pleuvoir -> plu (impersonal: il a plu)." }),
          ],
        },
      ],
    },
    {
      title: "L'Imparfait (Imperfect Tense)",
      lessons: [
        {
          title: "Forming the Imparfait",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the imparfait ending for 'nous'?", { options: ["-ions", "-ais", "-ait", "-aient"], correctAnswer: "0", explanation: "Imparfait endings: -ais, -ais, -ait, -ions, -iez, -aient." }),
            q("FILL_BLANK", "Je ___ (etre) content quand j'etais petit.", { correctAnswer: "etais", explanation: "Etre -> j'etais (I was)." }),
            q("TRUE_FALSE", "True or False: 'Quand j'etais jeune, je jouais' uses imparfait.", { correctAnswer: "true", explanation: "Imparfait describes habitual past actions." }),
            q("MCQ", "How do you form the imparfait stem?", { options: ["Take 'nous' present form, drop -ons", "Take infinitive", "Take 'ils' present form", "Use past participle"], correctAnswer: "0", explanation: "Stem = nous form minus -ons. Nous parlons -> parl-." }),
            q("MCQ", "'Nous mangions' means:", { options: ["We were eating", "We are eating", "We eat", "We will eat"], correctAnswer: "0", explanation: "Imparfait: nous mangions = we were eating." }),
            q("FILL_BLANK", "Tu ___ (finir) tes devoirs chaque soir.", { correctAnswer: "finissais", explanation: "Finir -> nous finissons -> finiss- -> tu finissais." }),
            q("CHECKBOX", "Select all imparfait forms of 'parler':", { options: ["je parlais", "tu parles", "il parlait", "nous parlions"], correctAnswer: "[0,2,3]", explanation: "Je parlais, il parlait, nous parlions are imparfait." }),
            q("TRUE_FALSE", "True or False: The imparfait of 'etre' is regular.", { correctAnswer: "false", explanation: "Etre is the only irregular stem: etais, etais, etait, etions, etiez, etaient." }),
            q("SPEECH", "Quand j'etais petit, je jouais au foot.", { correctAnswer: "Quand j'etais petit, je jouais au foot", language: "fr", hint: "Say: When I was little, I played football" }),
            q("FILL_BLANK", "Ils ___ (avoir) une grande maison.", { correctAnswer: "avaient", explanation: "Avoir -> nous avons -> av- -> ils avaient." }),
            q("MCQ", "What is the imparfait of 'faire' for 'je'?", { options: ["je faisais", "je fais", "je ferai", "je fait"], correctAnswer: "0", explanation: "Faire -> je faisais." }),
            q("MATCHING", "Match subject to ending:", { options: [{ left: "je", right: "-ais" }, { left: "nous", right: "-ions" }, { left: "ils", right: "-aient" }, { left: "vous", right: "-iez" }], correctAnswer: "[0,2,1,3]", explanation: "je/-ais, nous/-ions, ils/-aient, vous/-iez." }),
          ],
        },
        {
          title: "Imparfait vs Passe Compose",
          type: "QUIZ",
          questions: [
            q("MCQ", "When do you use the imparfait?", { options: ["Habitual past actions", "Completed actions", "Future plans", "Commands"], correctAnswer: "0", explanation: "Imparfait = habits, descriptions, ongoing past actions." }),
            q("FILL_BLANK", "Il ___ (faire) beau quand je suis sorti.", { correctAnswer: "faisait", explanation: "Faisait (imparfait) = it was (weather description)." }),
            q("MCQ", "'Je regardais la tele quand le telephone a sonne.' Which is imparfait?", { options: ["Je regardais", "Le telephone a sonne", "Both", "Neither"], correctAnswer: "0", explanation: "Je regardais = ongoing action (imparfait). A sonne = interrupting event (passe compose)." }),
            q("TRUE_FALSE", "True or False: Passe compose is for completed actions in the past.", { correctAnswer: "true", explanation: "Passe compose = specific, completed actions." }),
            q("CHECKBOX", "Select sentences that use imparfait:", { options: ["Il pleuvait toujours en avril.", "J'ai achete du pain.", "Nous habitions a Paris.", "Elle est arrivee hier."], correctAnswer: "[0,2]", explanation: "Imparfait: Il pleuvait toujours, Nous habitions." }),
            q("FILL_BLANK", "Quand j'etais enfant, je ___ (jouer) dans le jardin.", { correctAnswer: "jouais", explanation: "Childhood habit -> imparfait: je jouais." }),
            q("MCQ", "Which sentence describes a past state?", { options: ["La maison etait grande.", "J'ai achete une maison.", "Je vais a la maison.", "Je suis a la maison."], correctAnswer: "0", explanation: "La maison etait grande = description (imparfait)." }),
            q("SPEECH", "Quand il faisait froid, je mettais un manteau.", { correctAnswer: "Quand il faisait froid, je mettais un manteau", language: "fr", hint: "Say: When it was cold, I wore a coat" }),
            q("FILL_BLANK", "Soudain, le soleil ___ (apparaitre).", { correctAnswer: "est apparu", explanation: "Soudain = sudden event -> passe compose." }),
            q("TRUE_FALSE", "True or False: 'Tous les jours' triggers the imparfait.", { correctAnswer: "true", explanation: "Tous les jours = habitual action -> imparfait." }),
            q("MCQ", "'Hier, j'ai vu un film.' Why passe compose?", { options: ["Specific completed action", "Ongoing action", "Description", "Habit"], correctAnswer: "0", explanation: "Hier + specific action = passe compose." }),
            q("ORDERING", "Put in order: jouais / je / au / quand / petit / tennis / j'etais", { hint: "When I was little I played tennis", correctAnswer: "Quand,j'etais,petit,je,jouais,au,tennis", explanation: "Quand j'etais petit, je jouais au tennis." }),
          ],
        },
      ],
    },
    {
      title: "Le Futur Proche (Near Future)",
      lessons: [
        {
          title: "Aller + Infinitive",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'I am going to eat'?", { options: ["Je vais manger", "Je mange", "Je vais mange", "J'ai manger"], correctAnswer: "0", explanation: "Futur proche: aller (conjugated) + infinitive." }),
            q("FILL_BLANK", "Tu ___ (aller) etudier ce soir.", { correctAnswer: "vas", explanation: "Tu vas + infinitive = You are going to." }),
            q("MCQ", "'Nous allons partir' means:", { options: ["We are going to leave", "We leave", "We left", "We will have left"], correctAnswer: "0", explanation: "Nous allons (aller) + partir (infinitive) = We are going to leave." }),
            q("TRUE_FALSE", "True or False: 'Je vais aller' means 'I am going to go'.", { correctAnswer: "true", explanation: "Je vais aller = futur proche of aller." }),
            q("CHECKBOX", "Select all correct futur proche sentences:", { options: ["Elle va danser", "Nous allons lire", "Ils vont travailler", "Tu vas fini"], correctAnswer: "[0,1,2]", explanation: "All correct except 'Tu vas fini' (should be finir)." }),
            q("FILL_BLANK", "Ils ___ (aller) visiter le musee.", { correctAnswer: "vont", explanation: "Ils vont + infinitive = They are going to." }),
            q("MCQ", "How do you conjugate 'aller' for 'vous'?", { options: ["allez", "allons", "va", "vont"], correctAnswer: "0", explanation: "Vous allez." }),
            q("SPEECH", "Ce soir, je vais regarder un film.", { correctAnswer: "Ce soir, je vais regarder un film", language: "fr", hint: "Say: Tonight I am going to watch a movie" }),
            q("MCQ", "'Qu'est-ce que tu vas faire?' means:", { options: ["What are you going to do?", "What did you do?", "What do you do?", "What will you have done?"], correctAnswer: "0", explanation: "Tu vas faire = you are going to do." }),
            q("FILL_BLANK", "Je ___ (aller) ecrire une lettre.", { correctAnswer: "vais", explanation: "Je vais + infinitive." }),
            q("MATCHING", "Match subject to 'aller':", { options: [{ left: "je", right: "vais" }, { left: "tu", right: "vas" }, { left: "elle", right: "va" }, { left: "ils", right: "vont" }], correctAnswer: "[0,2,1,3]", explanation: "je->vais, tu->vas, elle->va, ils->vont." }),
            q("TRUE_FALSE", "True or False: The infinitive does NOT change in futur proche.", { correctAnswer: "true", explanation: "The infinitive stays the same. Je vais manger (not mange)." }),
          ],
        },
        {
          title: "Future Plans & Intentions",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'Tomorrow I will travel'?", { options: ["Demain je vais voyager", "Demain je voyage", "Demain j'ai voyage", "Demain je voyageais"], correctAnswer: "0", explanation: "Demain + futur proche: je vais voyager." }),
            q("FILL_BLANK", "Ce weekend, je vais ___ (visiter) mes grands-parents.", { correctAnswer: "visiter", explanation: "Je vais + infinitive = I am going to visit." }),
            q("CHECKBOX", "Select all futur proche sentences:", { options: ["Je vais manger", "Je mange", "Elle va partir", "Nous sommes partis"], correctAnswer: "[0,2]", explanation: "Futur proche: je vais manger, elle va partir." }),
            q("MCQ", "'Ce soir' in a sentence usually indicates:", { options: ["Futur proche", "Imparfait", "Passe compose", "Imperative"], correctAnswer: "0", explanation: "Ce soir = this evening -> future plans." }),
            q("FILL_BLANK", "L'annee prochaine, je vais ___ (apprendre) l'espagnol.", { correctAnswer: "apprendre", explanation: "Future intention: je vais apprendre." }),
            q("TRUE_FALSE", "True or False: 'Tout a l'heure' means 'a little while ago'.", { correctAnswer: "false", explanation: "Tout a l'heure = in a little while (future) or a moment ago (past)." }),
            q("SPEECH", "Ce weekend, je vais jouer au football avec mes amis.", { correctAnswer: "Ce weekend, je vais jouer au football avec mes amis", language: "fr", hint: "Say: This weekend I'm going to play football with my friends" }),
            q("MCQ", "'Qu'est-ce que vous allez faire?' is asking about:", { options: ["Future plans", "Past events", "Present actions", "Habits"], correctAnswer: "0", explanation: "Vous allez faire = you are going to do." }),
            q("ORDERING", "Put in order: cinema / aller / ce / au / je / soir / vais", { hint: "I am going to the cinema tonight", correctAnswer: "Ce,soir,je,vais,aller,au,cinema", explanation: "Ce soir je vais aller au cinema." }),
            q("FILL_BLANK", "Bientot, nous allons ___ (commencer) le cours.", { correctAnswer: "commencer", explanation: "Bientot = soon -> futur proche." }),
            q("MCQ", "'Ils vont se marier' means:", { options: ["They are going to get married", "They got married", "They are getting married now", "They were married"], correctAnswer: "0", explanation: "Ils vont se marier = futur proche." }),
            q("TRUE_FALSE", "True or False: 'Demain' means 'yesterday'.", { correctAnswer: "false", explanation: "Demain = tomorrow. Hier = yesterday." }),
          ],
        },
      ],
    },
    {
      title: "Les Pronoms (Pronouns)",
      lessons: [
        {
          title: "Direct Object Pronouns",
          type: "QUIZ",
          questions: [
            q("MCQ", "What replaces 'le livre' as a direct object?", { options: ["le", "la", "les", "lui"], correctAnswer: "0", explanation: "Le livre is masculine singular -> le." }),
            q("FILL_BLANK", "Tu vois Marie? Oui, je ___ vois.", { correctAnswer: "la", explanation: "Marie is feminine singular -> la." }),
            q("MCQ", "'Je les ai achetes' means:", { options: ["I bought them", "I bought it", "I buy them", "I will buy them"], correctAnswer: "0", explanation: "Les = them (plural)." }),
            q("TRUE_FALSE", "True or False: 'Me' is the direct object pronoun for 'me/to me'.", { correctAnswer: "true", explanation: "Me/m' = me (direct and indirect)." }),
            q("MCQ", "Where does the direct object pronoun go?", { options: ["Before the conjugated verb", "After the verb", "At the end of the sentence", "Before the subject"], correctAnswer: "0", explanation: "Direct object pronouns go before the conjugated verb." }),
            q("FILL_BLANK", "Tu manges la pomme? Oui, je ___ mange.", { correctAnswer: "la", explanation: "La pomme -> la." }),
            q("CHECKBOX", "Select all direct object pronouns:", { options: ["le", "la", "les", "lui"], correctAnswer: "[0,1,2]", explanation: "Le, la, les are direct. Lui is indirect." }),
            q("SPEECH", "Je te vois demain.", { correctAnswer: "Je te vois demain", language: "fr", hint: "Say: I see you tomorrow" }),
            q("MCQ", "'Nous vous aimons' means:", { options: ["We love you (formal/plural)", "You love us", "We love him", "They love you"], correctAnswer: "0", explanation: "Nous vous aimons = We love you (formal/plural)." }),
            q("FILL_BLANK", "Il regarde la tele. -> Il ___ regarde.", { correctAnswer: "la", explanation: "La tele -> la." }),
            q("TRUE_FALSE", "True or False: 'Le' and 'la' become 'l'' before a vowel.", { correctAnswer: "true", explanation: "Le/la -> l' before vowel: Je l'aime." }),
            q("MCQ", "'Je ne le comprends pas' means:", { options: ["I don't understand it", "I don't understand them", "I understand it", "I don't understand him"], correctAnswer: "0", explanation: "Le = it. Negative: ne...pas surrounds the pronoun+verb." }),
          ],
        },
        {
          title: "Indirect Object Pronouns",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the indirect object pronoun for 'to him'?", { options: ["lui", "le", "la", "leur"], correctAnswer: "0", explanation: "Lui = to him/to her." }),
            q("FILL_BLANK", "Je donne le cadeau a mes amis. -> Je ___ donne le cadeau.", { correctAnswer: "leur", explanation: "Mes amis (plural) -> leur." }),
            q("TRUE_FALSE", "True or False: 'Je leur parle' means 'I speak to them'.", { correctAnswer: "true", explanation: "Leur = to them (plural indirect object)." }),
            q("MCQ", "Which pronoun replaces 'a ma soeur'?", { options: ["lui", "leur", "la", "le"], correctAnswer: "0", explanation: "A ma soeur (singular) -> lui." }),
            q("CHECKBOX", "Select all indirect object pronouns:", { options: ["me", "te", "lui", "leur"], correctAnswer: "[0,1,2,3]", explanation: "All are indirect object pronouns (me/te/lui/leur)." }),
            q("FILL_BLANK", "Elle ___ telephone a son mari.", { correctAnswer: "lui", explanation: "A son mari -> lui." }),
            q("MCQ", "'Je te dis la verite' means:", { options: ["I tell you the truth", "You tell me the truth", "I tell him the truth", "They tell you the truth"], correctAnswer: "0", explanation: "Je te dis = I tell you." }),
            q("SPEECH", "Je lui offre un cadeau pour son anniversaire.", { correctAnswer: "Je lui offre un cadeau pour son anniversaire", language: "fr", hint: "Say: I give him/her a gift for his/her birthday" }),
            q("TRUE_FALSE", "True or False: 'Lui' can mean both 'to him' and 'to her'.", { correctAnswer: "true", explanation: "Lui = to him OR to her (gender neutral)." }),
            q("FILL_BLANK", "Nous ___ ecrivons une lettre a nos parents.", { correctAnswer: "leur", explanation: "A nos parents (plural) -> leur." }),
            q("MCQ", "Difference between 'le' and 'lui'?", { options: ["le=direct, lui=indirect", "No difference", "le=indirect, lui=direct", "Both are direct"], correctAnswer: "0", explanation: "Le = direct object. Lui = indirect object (to him/her)." }),
            q("ORDERING", "Put in order: parle / je / lui / souvent", { hint: "I often speak to him", correctAnswer: "Je,lui,parle,souvent", explanation: "Je lui parle souvent." }),
          ],
        },
      ],
    },
    {
      title: "La Vie Quotidienne (Daily Life)",
      lessons: [
        {
          title: "Daily Routine Vocabulary",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'I wake up'?", { options: ["Je me reveille", "Je me couche", "Je me lave", "Je m'habille"], correctAnswer: "0", explanation: "Se reveiller = to wake up." }),
            q("FILL_BLANK", "Le matin, je ___ (prendre) mon petit-dejeuner.", { correctAnswer: "prends", explanation: "Prendre: je prends = I take/have." }),
            q("SPEECH", "Je me leve a sept heures.", { correctAnswer: "Je me leve a sept heures", language: "fr", hint: "Say: I get up at seven o'clock" }),
            q("MCQ", "'Se brosser les dents' means:", { options: ["To brush one's teeth", "To wash one's hands", "To comb one's hair", "To take a shower"], correctAnswer: "0", explanation: "Se brosser les dents = to brush teeth." }),
            q("MATCHING", "Match the activity:", { options: [{ left: "se reveiller", right: "to wake up" }, { left: "se coucher", right: "to go to bed" }, { left: "se doucher", right: "to shower" }, { left: "s'habiller", right: "to get dressed" }], correctAnswer: "[0,2,1,3]", explanation: "se reveiller=wake, se coucher=bed, se doucher=shower, s'habiller=dress." }),
            q("TRUE_FALSE", "True or False: 'Le petit-dejeuner' is dinner.", { correctAnswer: "false", explanation: "Petit-dejeuner = breakfast. Le dejeuner = lunch. Le diner = dinner." }),
            q("FILL_BLANK", "Le soir, je me ___ a onze heures.", { correctAnswer: "couche", explanation: "Se coucher = to go to bed." }),
            q("MCQ", "'Je me brosse les cheveux' means:", { options: ["I brush my hair", "I brush my teeth", "I wash my face", "I comb my beard"], correctAnswer: "0", explanation: "Les cheveux = hair." }),
            q("CHECKBOX", "Select all morning activities:", { options: ["Je me reveille", "Je prends une douche", "Je vais au travail", "Je dors"], correctAnswer: "[0,1,2]", explanation: "Waking, showering, going to work are morning activities." }),
            q("FILL_BLANK", "Je ___ (se preparer) pour aller a l'ecole.", { correctAnswer: "me prepare", explanation: "Se preparer = to prepare oneself." }),
            q("MCQ", "What time is 'a midi'?", { options: ["12:00", "6:00", "8:00", "Midnight"], correctAnswer: "0", explanation: "Midi = noon (12:00)." }),
            q("TRUE_FALSE", "True or False: 'Je rentre chez moi' means 'I go home'.", { correctAnswer: "true", explanation: "Je rentre chez moi = I go home / return home." }),
          ],
        },
        {
          title: "Describing Your Day",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'I take a shower'?", { options: ["Je prends une douche", "Je prends un bain", "Je me douche", "Both A and C"], correctAnswer: "3", explanation: "Both are correct: je prends une douche / je me douche." }),
            q("CHECKBOX", "Select all morning activities:", { options: ["Je me reveille", "Je me couche", "Je prends le petit-dejeuner", "Je vais au travail"], correctAnswer: "[0,2,3]", explanation: "Morning: wake up, breakfast, go to work." }),
            q("MATCHING", "Match the activity:", { options: [{ left: "se reveiller", right: "to wake up" }, { left: "se coucher", right: "to go to bed" }, { left: "se laver", right: "to wash" }, { left: "manger", right: "to eat" }], correctAnswer: "[0,2,1,3]", explanation: "se reveiller=wake, se coucher=bed, se laver=wash, manger=eat." }),
            q("FILL_BLANK", "A midi, je ___ (dejeuner) avec mes collegues.", { correctAnswer: "dejeune", explanation: "Dejeuner = to have lunch." }),
            q("MCQ", "'Je prends le bus pour aller au travail' means:", { options: ["I take the bus to go to work", "I take the bus to go home", "I take the train", "I walk to work"], correctAnswer: "0", explanation: "Je prends le bus = I take the bus." }),
            q("SPEECH", "Le soir, je regarde la television avec ma famille.", { correctAnswer: "Le soir, je regarde la television avec ma famille", language: "fr", hint: "Say: In the evening I watch TV with my family" }),
            q("TRUE_FALSE", "True or False: 'Le coucher du soleil' means sunset.", { correctAnswer: "true", explanation: "Coucher du soleil = sunset." }),
            q("FILL_BLANK", "Avant de dormir, je ___ (lire) un livre.", { correctAnswer: "lis", explanation: "Lire: je lis = I read." }),
            q("MCQ", "'Je fais les courses' means:", { options: ["I go grocery shopping", "I do my homework", "I make courses", "I run races"], correctAnswer: "0", explanation: "Faire les courses = to go shopping." }),
            q("ORDERING", "Put in order: reveille / Je / me / sept / a / heures", { hint: "I wake up at seven", correctAnswer: "Je,me,reveille,a,sept,heures", explanation: "Je me reveille a sept heures." }),
            q("MCQ", "'Apres le travail' means:", { options: ["After work", "Before work", "During work", "At work"], correctAnswer: "0", explanation: "Apres = after." }),
            q("CHECKBOX", "Select all evening activities:", { options: ["Je prends le diner", "Je me reveille", "Je regarde un film", "Je me couche"], correctAnswer: "[0,2,3]", explanation: "Evening: dinner, watch a film, go to bed." }),
          ],
        },
      ],
    },
    {
      title: "Les Courses (Shopping)",
      lessons: [
        {
          title: "At the Market",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you ask 'How much does it cost?'", { options: ["Combien ca coute?", "Qu'est-ce que c'est?", "Ou est le marche?", "Je voudrais..."], correctAnswer: "0", explanation: "Combien ca coute? = How much does it cost?" }),
            q("FILL_BLANK", "Je voudrais un ___ de pain.", { correctAnswer: "kilo", explanation: "Un kilo de pain = a kilo of bread." }),
            q("SPEECH", "Je voudrais deux kilos de pommes, s'il vous plait.", { correctAnswer: "Je voudrais deux kilos de pommes, s'il vous plait", language: "fr", hint: "Say: I would like two kilos of apples please" }),
            q("MCQ", "'La boulangerie' is:", { options: ["The bakery", "The butcher", "The market", "The supermarket"], correctAnswer: "0", explanation: "La boulangerie = bakery." }),
            q("MATCHING", "Match the shop:", { options: [{ left: "boucherie", right: "butcher" }, { left: "boulangerie", right: "bakery" }, { left: "epicerie", right: "grocery" }, { left: "pharmacie", right: "pharmacy" }], correctAnswer: "[0,2,1,3]", explanation: "boucherie=butcher, boulangerie=bakery, epicerie=grocery, pharmacie=pharmacy." }),
            q("TRUE_FALSE", "True or False: 'Une livre' means a pound (weight).", { correctAnswer: "false", explanation: "Une livre = a book. Un kilo = a kilogram." }),
            q("FILL_BLANK", "Je voudrais une ___ de fraises.", { correctAnswer: "barquette", explanation: "Une barquette = a punnet/container." }),
            q("MCQ", "'C'est tout?' at the checkout means:", { options: ["Is that everything?", "How much is it?", "Where is the bag?", "Do you accept cards?"], correctAnswer: "0", explanation: "C'est tout? = Is that everything?" }),
            q("CHECKBOX", "Select fruits in French:", { options: ["pommes", "oranges", "pain", "fromage"], correctAnswer: "[0,1]", explanation: "Pommes = apples, oranges = oranges." }),
            q("FILL_BLANK", "Ca fait dix ___ (euros).", { correctAnswer: "euros", explanation: "Ca fait dix euros = That makes 10 euros." }),
            q("MCQ", "'Le rayon' means:", { options: ["The aisle/section", "The cashier", "The basket", "The bag"], correctAnswer: "0", explanation: "Le rayon = the aisle/section of a store." }),
            q("ORDERING", "Put in order: kilos / voudrais / de / Je / pommes / deux", { hint: "I would like two kilos of apples", correctAnswer: "Je,voudrais,deux,kilos,de,pommes", explanation: "Je voudrais deux kilos de pommes." }),
          ],
        },
        {
          title: "Clothing Shopping",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'Can I try this on?'", { options: ["Je peux essayer?", "Je peux acheter?", "Je peux payer?", "Je peux regarder?"], correctAnswer: "0", explanation: "Je peux essayer? = Can I try (this on)?" }),
            q("FILL_BLANK", "Quelle est votre ___? (What is your size?)", { correctAnswer: "taille", explanation: "Taille = size." }),
            q("TRUE_FALSE", "True or False: 'C'est trop cher' means 'It's too expensive'.", { correctAnswer: "true", explanation: "Cher = expensive. Trop = too much." }),
            q("MCQ", "'Les cabines d'essayage' are:", { options: ["Fitting rooms", "Checkout counters", "Display windows", "Shelves"], correctAnswer: "0", explanation: "Cabines d'essayage = fitting rooms." }),
            q("MATCHING", "Match the clothing:", { options: [{ left: "une chemise", right: "a shirt" }, { left: "un pantalon", right: "pants" }, { left: "une robe", right: "a dress" }, { left: "un manteau", right: "a coat" }], correctAnswer: "[0,2,1,3]", explanation: "chemise=shirt, pantalon=pants, robe=dress, manteau=coat." }),
            q("FILL_BLANK", "Je cherche une ___ de sport.", { correctAnswer: "chaussure", explanation: "Chaussure de sport = sports shoe/sneaker." }),
            q("MCQ", "'Avez-vous une taille au-dessus?' means:", { options: ["Do you have a size up?", "Do you have it in blue?", "Can I pay by card?", "Where is the exit?"], correctAnswer: "0", explanation: "Taille au-dessus = size up." }),
            q("CHECKBOX", "Select clothing items:", { options: ["un pull", "une cravate", "un stylo", "un livre"], correctAnswer: "[0,1]", explanation: "Un pull = sweater, une cravate = tie." }),
            q("SPEECH", "Est-ce que vous avez ce modele en noir?", { correctAnswer: "Est-ce que vous avez ce modele en noir", language: "fr", hint: "Say: Do you have this model in black?" }),
            q("FILL_BLANK", "Je peux payer par ___ ? (card)", { correctAnswer: "carte", explanation: "Payer par carte = pay by card." }),
            q("TRUE_FALSE", "True or False: 'Les soldes' means sales/discounts.", { correctAnswer: "true", explanation: "Les soldes = sales." }),
            q("MCQ", "'C'est la bonne taille' means:", { options: ["It's the right size", "It's too big", "It's too small", "It's the wrong color"], correctAnswer: "0", explanation: "La bonne taille = the right size." }),
          ],
        },
      ],
    },
    {
      title: "Voyager (Travel)",
      lessons: [
        {
          title: "At the Airport",
          type: "QUIZ",
          questions: [
            q("MCQ", "What does 'le billet' mean?", { options: ["Ticket", "Bag", "Passport", "Gate"], correctAnswer: "0", explanation: "Le billet = ticket." }),
            q("FILL_BLANK", "Ou est la ___ d'embarquement? (boarding gate)", { correctAnswer: "porte", explanation: "La porte d'embarquement = boarding gate." }),
            q("MCQ", "'Mon vol est en retard' means:", { options: ["My flight is delayed", "My flight is cancelled", "My flight is on time", "My flight is early"], correctAnswer: "0", explanation: "En retard = late/delayed." }),
            q("TRUE_FALSE", "True or False: 'L'enregistrement' is the check-in counter.", { correctAnswer: "true", explanation: "L'enregistrement = check-in." }),
            q("MATCHING", "Match the airport term:", { options: [{ left: "le depart", right: "departure" }, { left: "l'arrivee", right: "arrival" }, { left: "la valise", right: "suitcase" }, { left: "le passeport", right: "passport" }], correctAnswer: "[0,2,1,3]", explanation: "depart=departure, arrivee=arrival, valise=suitcase, passeport=passport." }),
            q("FILL_BLANK", "Je dois enregistrer mes ___ .", { correctAnswer: "bagages", explanation: "Enregistrer mes bagages = check in my luggage." }),
            q("MCQ", "'Une escale' means:", { options: ["A layover", "A ticket", "A boarding pass", "A customs check"], correctAnswer: "0", explanation: "Une escale = a layover/stopover." }),
            q("CHECKBOX", "Select items you need at the airport:", { options: ["passeport", "billet d'avion", "carte d'embarquement", "cuisine"], correctAnswer: "[0,1,2]", explanation: "Passeport, billet, carte d'embarquement are needed." }),
            q("SPEECH", "Mon vol part a dix heures du matin.", { correctAnswer: "Mon vol part a dix heures du matin", language: "fr", hint: "Say: My flight leaves at 10 in the morning" }),
            q("FILL_BLANK", "Le vol est ___ . (cancelled)", { correctAnswer: "annule", explanation: "Le vol est annule = The flight is cancelled." }),
            q("TRUE_FALSE", "True or False: 'La douane' means customs.", { correctAnswer: "true", explanation: "La douane = customs." }),
            q("MCQ", "'Je voudrais un siege cote couloir' means:", { options: ["I'd like an aisle seat", "I'd like a window seat", "I'd like a first class seat", "I'd like a standing ticket"], correctAnswer: "0", explanation: "Cote couloir = aisle side." }),
          ],
        },
        {
          title: "Asking for Directions",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'Where is the station?'", { options: ["Ou est la gare?", "Ou est l'hotel?", "Ou est le marche?", "Ou est l'aeroport?"], correctAnswer: "0", explanation: "La gare = train station." }),
            q("FILL_BLANK", "Tournez a ___ (left) puis allez tout droit.", { correctAnswer: "gauche", explanation: "A gauche = to the left." }),
            q("ORDERING", "Put in order: gauche / a / Tournez / droit / tout / allez / puis", { hint: "Turn left then go straight", correctAnswer: "Tournez,a,gauche,puis,allez,tout,droit", explanation: "Tournez a gauche puis allez tout droit." }),
            q("MCQ", "'Tout droit' means:", { options: ["Straight ahead", "Turn left", "Turn right", "Go back"], correctAnswer: "0", explanation: "Tout droit = straight ahead." }),
            q("TRUE_FALSE", "True or False: 'Au coin de la rue' means 'at the corner of the street'.", { correctAnswer: "true", explanation: "Au coin de la rue = at the corner." }),
            q("FILL_BLANK", "C'est ___ (next to) la poste.", { correctAnswer: "a cote de", explanation: "A cote de = next to." }),
            q("MCQ", "'Prenez la deuxieme a droite' means:", { options: ["Take the second on the right", "Take the first on the left", "Take the second on the left", "Take the third on the right"], correctAnswer: "0", explanation: "Deuxieme = second. A droite = on the right." }),
            q("MATCHING", "Match the direction:", { options: [{ left: "a droite", right: "right" }, { left: "a gauche", right: "left" }, { left: "en face de", right: "opposite" }, { left: "pres de", right: "near" }], correctAnswer: "[0,2,1,3]", explanation: "a droite=right, a gauche=left, en face de=opposite, pres de=near." }),
            q("CHECKBOX", "Select all direction words:", { options: ["droite", "gauche", "devant", "manger"], correctAnswer: "[0,1,2]", explanation: "Droite, gauche, devant are directions. Manger = eat." }),
            q("SPEECH", "Excusez-moi, ou est le musee le plus proche?", { correctAnswer: "Excusez-moi, ou est le musee le plus proche", language: "fr", hint: "Say: Excuse me, where is the nearest museum?" }),
            q("FILL_BLANK", "Traversez le ___ . (bridge)", { correctAnswer: "pont", explanation: "Traversez le pont = Cross the bridge." }),
            q("TRUE_FALSE", "True or False: 'C'est loin' means 'It's close'.", { correctAnswer: "false", explanation: "C'est loin = It's far. C'est pres = It's close." }),
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "A2 Comprehensive Review",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which sentence is in passe compose?", { options: ["J'ai fini mon travail.", "Je finis mon travail.", "Je finissais mon travail.", "Je vais finir mon travail."], correctAnswer: "0", explanation: "J'ai fini = passe compose (avoir + past participle)." }),
            q("FILL_BLANK", "Quand j'etais enfant, je ___ (jouer) au foot.", { correctAnswer: "jouais", explanation: "Imparfait for childhood habits." }),
            q("MCQ", "'Je vais etudier' is which tense?", { options: ["Futur proche", "Passe compose", "Imparfait", "Present"], correctAnswer: "0", explanation: "Aller + infinitive = futur proche." }),
            q("SPEECH", "Je suis alle au cinema hier soir.", { correctAnswer: "Je suis alle au cinema hier soir", language: "fr", hint: "Say: I went to the cinema last night" }),
            q("CHECKBOX", "Select all passe compose sentences:", { options: ["Elle a mange", "Nous sommes partis", "Je vais dormir", "Tu as fini"], correctAnswer: "[0,1,3]", explanation: "Elle a mange, Nous sommes partis, Tu as fini are passe compose." }),
            q("TRUE_FALSE", "True or False: 'Lui' can mean both 'to him' and 'to her'.", { correctAnswer: "true", explanation: "Lui = to him OR to her." }),
            q("FILL_BLANK", "Elle est ___ (nee) en 1995.", { correctAnswer: "nee", explanation: "Naitre uses etre. Feminine: nee." }),
            q("MCQ", "'Combien ca coute?' is used when:", { options: ["Shopping", "Traveling", "Eating", "Studying"], correctAnswer: "0", explanation: "Combien ca coute? = How much does it cost? (Shopping)." }),
            q("MCQ", "Which uses etre in passe compose?", { options: ["Elle est sortie.", "Elle a sorti.", "Elle sortir.", "Elle sortait."], correctAnswer: "0", explanation: "Sortir uses etre: elle est sortie." }),
            q("FILL_BLANK", "Je ___ (aller) voyager en France cet ete.", { correctAnswer: "vais", explanation: "Futur proche: je vais voyager." }),
            q("ORDERING", "Put in order: parle / lui / Je / souvent / francais", { hint: "I often speak French to him", correctAnswer: "Je,lui,parle,souvent,francais", explanation: "Je lui parle souvent francais." }),
            q("MATCHING", "Match to English:", { options: [{ left: "Je me reveille", right: "I wake up" }, { left: "Je me couche", right: "I go to bed" }, { left: "Je me douche", right: "I shower" }, { left: "Je m'habille", right: "I get dressed" }], correctAnswer: "[0,2,1,3]", explanation: "reveille=wake, couche=bed, douche=shower, habille=dressed." }),
          ],
        },
      ],
    },
  ];

  const course = await db.course.create({
    data: {
      title: "French A2 - Intermediaire",
      description: "Elementary French: past tense, daily life, shopping, travel, and basic conversations.",
      categoryId: category.id,
      difficulty: "INTERMEDIATE",
      minimumLevel: "A2",
      isFree: true,
      icon: "🇫🇷 French",
      color: "#2563eb",
    },
  });
  console.log(`   ✅ Created course: ${course.title}`);

  let totalQuestions = 0;
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m];
    const createdModule = await db.module.create({ data: { title: mod.title, courseId: course.id, order: m + 1 } });
    console.log(`   📁 Module: ${mod.title}`);

    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      const createdLesson = await db.lesson.create({ data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 } });

      for (let qd of lesson.questions) {
        let optionsStr: string | null = null;
        if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options);
        else if (qd.options && typeof qd.options === "string") optionsStr = qd.options;

        await db.question.create({
          data: {
            lessonId: createdLesson.id, type: qd.type, question: qd.question,
            hint: qd.hint || null, explanation: qd.explanation || null,
            options: optionsStr, correctAnswer: qd.correctAnswer,
            language: qd.language || null, order: totalQuestions + 1,
          },
        });
        totalQuestions++;
      }
      console.log(`      - Lesson: ${lesson.title} [${lesson.questions.length} questions]`);
    }
  }

  console.log(`\n   📊 French A2: ${modules.length} modules, ${modules.reduce((s, m) => s + m.lessons.length, 0)} lessons, ${totalQuestions} questions`);
}

async function seedFrenchB1() {
  console.log("\n🇫🇷 Seeding French B1 - Avance...\n");

  let category = await db.category.findFirst({ where: { name: { equals: "Languages", mode: "insensitive" } } });
  if (!category) {
    category = await db.category.create({ data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" } });
  }

  const existing = await db.course.findFirst({ where: { title: "French B1 - Avance" } });
  if (existing) {
    console.log("   🗑️  Deleting existing French B1...");
    await db.question.deleteMany({ where: { lesson: { module: { courseId: existing.id } } } });
    await db.lesson.deleteMany({ where: { module: { courseId: existing.id } } });
    await db.module.deleteMany({ where: { courseId: existing.id } });
    await db.course.delete({ where: { id: existing.id } });
    console.log("   ✅ Deleted existing course");
  }

  const modules = [
    {
      title: "Le Subjonctif (Subjunctive mood)",
      lessons: [
        {
          title: "Forming the Subjunctive",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the subjunctive form of 'etre' for 'que je'?", { options: ["sois", "suis", "serai", "etais"], correctAnswer: "0", explanation: "Que je sois = that I be." }),
            q("FILL_BLANK", "Il faut que tu ___ (faire) tes devoirs.", { correctAnswer: "fasses", explanation: "Faire (subjunctive): que tu fasses." }),
            q("MCQ", "How do you form the subjunctive for regular -er verbs?", { options: ["Take 'ils' present form, drop -ent, add endings", "Take 'nous' form, drop -ons", "Add -ait to the stem", "Use the infinitive"], correctAnswer: "0", explanation: "Subjunctive: ils parlent -> stem parl- + e, es, e, ions, iez, ent." }),
            q("FILL_BLANK", "Il faut que nous ___ (finir) avant midi.", { correctAnswer: "finissions", explanation: "Finir (subjunctive): que nous finissions." }),
            q("CHECKBOX", "Select all correct subjunctive forms of 'parler':", { options: ["que je parle", "que tu parles", "qu'il parlait", "que nous parlions"], correctAnswer: "[0,1,3]", explanation: "Que je parle, que tu parles, que nous parlions are subjunctive." }),
            q("MCQ", "What is the subjunctive of 'avoir' for 'que vous'?", { options: ["ayez", "avez", "aviez", "aurez"], correctAnswer: "0", explanation: "Que vous ayez = that you have." }),
            q("TRUE_FALSE", "True or False: The subjunctive stem comes from the 'ils' present tense form.", { correctAnswer: "true", explanation: "Ils parlent -> stem parl- for subjunctive." }),
            q("FILL_BLANK", "Il faut que vous ___ (prendre) le train.", { correctAnswer: "preniez", explanation: "Prendre (subjunctive): que vous preniez." }),
            q("SPEECH", "Il faut que je parte maintenant.", { correctAnswer: "Il faut que je parte maintenant", language: "fr", hint: "Say: I must leave now" }),
            q("MCQ", "What are the subjunctive endings for regular verbs?", { options: ["-e, -es, -e, -ions, -iez, -ent", "-ais, -ais, -ait, -ions, -iez, -aient", "-ai, -as, -a, -ons, -ez, -ont", "-e, -es, -e, -ons, -ez, -ent"], correctAnswer: "0", explanation: "Subjunctive endings: -e, -es, -e, -ions, -iez, -ent." }),
            q("TRUE_FALSE", "True or False: 'Nous' and 'vous' subjunctive forms look like imparfait.", { correctAnswer: "false", explanation: "They look like present indicative 'nous/vous' forms." }),
            q("MATCHING", "Match subjunctive to infinitive:", { options: [{ left: "que je sache", right: "savoir" }, { left: "que je puisse", right: "pouvoir" }, { left: "que je veuille", right: "vouloir" }, { left: "que je fasse", right: "faire" }], correctAnswer: "[0,2,1,3]", explanation: "sache=savoir, puisse=pouvoir, veuille=vouloir, fasse=faire." }),
          ],
        },
        {
          title: "When to Use the Subjunctive",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which expression triggers the subjunctive?", { options: ["Il faut que", "Je pense que", "Je sais que", "Il est certain que"], correctAnswer: "0", explanation: "Il faut que (necessity) requires subjunctive." }),
            q("FILL_BLANK", "Je veux que vous ___ (venir) a la fete.", { correctAnswer: "veniez", explanation: "Vouloir que + subjunctive: que vous veniez." }),
            q("TRUE_FALSE", "True or False: 'Je crois que' is followed by the subjunctive.", { correctAnswer: "false", explanation: "'Je crois que' uses indicative. Negative form uses subjunctive." }),
            q("MCQ", "Which category of expressions uses the subjunctive?", { options: ["Wishes, emotions, doubts", "Facts, certainties", "Questions", "Commands"], correctAnswer: "0", explanation: "Subjunctive follows wishes, emotions, doubts, necessity." }),
            q("CHECKBOX", "Select expressions requiring subjunctive:", { options: ["Il est important que", "Je souhaite que", "Il est vrai que", "Je doute que"], correctAnswer: "[0,1,3]", explanation: "Il est important que, Je souhaite que, Je doute que -> subjunctive." }),
            q("FILL_BLANK", "Bien qu'il ___ (etre) riche, il n'est pas heureux.", { correctAnswer: "soit", explanation: "Bien que + subjunctive: il soit." }),
            q("MCQ", "'Pour que' means:", { options: ["So that", "Because", "Although", "When"], correctAnswer: "0", explanation: "Pour que = so that (+ subjunctive)." }),
            q("SPEECH", "Je suis content que tu sois ici.", { correctAnswer: "Je suis content que tu sois ici", language: "fr", hint: "Say: I am happy that you are here" }),
            q("TRUE_FALSE", "True or False: 'Avant que' is followed by the subjunctive.", { correctAnswer: "true", explanation: "Avant que = before (+ subjunctive)." }),
            q("FILL_BLANK", "Il est necessaire que tu ___ (etudier) plus.", { correctAnswer: "etudies", explanation: "Il est necessaire que + subjunctive." }),
            q("MCQ", "'Je ne pense pas que' vs 'Je pense que':", { options: ["Negative triggers subjunctive", "Both use subjunctive", "Both use indicative", "No difference"], correctAnswer: "0", explanation: "Negative doubt triggers subjunctive." }),
            q("ORDERING", "Put in order: que / faut / Il / tu / viennes", { hint: "It is necessary that you come", correctAnswer: "Il,faut,que,tu,viennes", explanation: "Il faut que tu viennes." }),
          ],
        },
        {
          title: "Subjunctive Practice",
          type: "QUIZ",
          questions: [
            q("CHECKBOX", "Select all sentences requiring the subjunctive:", { options: ["Il faut que je parte.", "Je sais qu'il vient.", "Je souhaite que tu reussisses.", "Il est probable qu'il pleut."], correctAnswer: "[0,2]", explanation: "Il faut que + subj., Je souhaite que + subj." }),
            q("FILL_BLANK", "Bien qu'il ___ (avoir) de l'argent, il ne depense rien.", { correctAnswer: "ait", explanation: "Bien que + subjunctive: il ait." }),
            q("SPEECH", "Il faut que nous finissions ce projet.", { correctAnswer: "Il faut que nous finissions ce projet", language: "fr", hint: "Say: We must finish this project" }),
            q("MCQ", "'Il est content que tu sois venu' uses subjunctive because:", { options: ["Emotion", "Fact", "Question", "Command"], correctAnswer: "0", explanation: "Emotions trigger subjunctive." }),
            q("FILL_BLANK", "Pour que vous ___ (comprendre), je vais expliquer.", { correctAnswer: "compreniez", explanation: "Pour que + subjunctive: vous compreniez." }),
            q("TRUE_FALSE", "True or False: 'Sans que' is followed by the subjunctive.", { correctAnswer: "true", explanation: "Sans que = without (+ subjunctive)." }),
            q("MCQ", "Which sentence is CORRECT?", { options: ["Il faut que tu fasses attention.", "Il faut que tu fais attention.", "Il faut que tu feras attention.", "Il faut que tu faisais attention."], correctAnswer: "0", explanation: "Il faut que + subjunctive: tu fasses." }),
            q("MATCHING", "Match trigger to meaning:", { options: [{ left: "Il faut que", right: "It is necessary that" }, { left: "Je veux que", right: "I want that" }, { left: "Bien que", right: "Although" }, { left: "Pour que", right: "So that" }], correctAnswer: "[0,2,1,3]", explanation: "il faut que=necessary, je veux que=want, bien que=although, pour que=so that." }),
            q("FILL_BLANK", "Je ne crois pas qu'il ___ (savoir) la reponse.", { correctAnswer: "sache", explanation: "Negative belief -> subjunctive: il sache." }),
            q("MCQ", "'Afin que' means:", { options: ["So that", "Although", "Before", "After"], correctAnswer: "0", explanation: "Afin que = so that/in order that (+ subjunctive)." }),
            q("TRUE_FALSE", "True or False: 'Quand' (when) is always followed by the subjunctive.", { correctAnswer: "false", explanation: "Quand uses indicative for facts." }),
            q("ORDERING", "Put in order: heureux / que / Je / tu / sois / suis", { hint: "I am happy that you are", correctAnswer: "Je,suis,heureux,que,tu,sois", explanation: "Je suis heureux que tu sois." }),
          ],
        },
      ],
    },
    {
      title: "Le Conditionnel (Conditional mood)",
      lessons: [
        {
          title: "Present Conditional",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'I would like'?", { options: ["Je voudrais", "Je veux", "Je voulais", "Je veux bien"], correctAnswer: "0", explanation: "Vouloir -> conditional: je voudrais." }),
            q("FILL_BLANK", "Si j'avais de l'argent, j'___ (acheter) une maison.", { correctAnswer: "acheterais", explanation: "Si + imparfait -> conditional: acheterais." }),
            q("MCQ", "What are the conditional endings?", { options: ["-ais, -ais, -ait, -ions, -iez, -aient", "-e, -es, -e, -ons, -ez, -ent", "-ai, -as, -a, -ons, -ez, -ont", "-ais, -ais, -ait, -ons, -ez, -ont"], correctAnswer: "0", explanation: "Conditional endings: -ais, -ais, -ait, -ions, -iez, -aient." }),
            q("MCQ", "The conditional stem is based on:", { options: ["Future stem (infinitive)", "Imparfait stem", "Present stem", "Past participle"], correctAnswer: "0", explanation: "Conditional = future stem + imparfait endings." }),
            q("FILL_BLANK", "Nous ___ (aller) en France si nous pouvions.", { correctAnswer: "irions", explanation: "Aller -> conditional: nous irions." }),
            q("CHECKBOX", "Select all correct conditional forms:", { options: ["Je mangerais", "Tu finirais", "Il est alle", "Nous partirions"], correctAnswer: "[0,1,3]", explanation: "Je mangerais, Tu finirais, Nous partirions are conditional." }),
            q("TRUE_FALSE", "True or False: 'Etre' conditional is 'je serais'.", { correctAnswer: "true", explanation: "Etre conditional: je serais." }),
            q("SPEECH", "Je voudrais un cafe, s'il vous plait.", { correctAnswer: "Je voudrais un cafe, s'il vous plait", language: "fr", hint: "Say: I would like a coffee please" }),
            q("MCQ", "'Avoir' conditional for 'ils'?", { options: ["ils auraient", "ils auront", "ils avaient", "ils ont"], correctAnswer: "0", explanation: "Avoir conditional: ils auraient." }),
            q("FILL_BLANK", "Est-ce que tu ___ (pouvoir) m'aider?", { correctAnswer: "pourrais", explanation: "Pouvoir conditional: tu pourrais (polite request)." }),
            q("MATCHING", "Match conditional form:", { options: [{ left: "je ferais", right: "I would do" }, { left: "tu dirais", right: "you would say" }, { left: "il viendrait", right: "he would come" }, { left: "nous irions", right: "we would go" }], correctAnswer: "[0,2,1,3]", explanation: "ferais=do, dirais=say, viendrait=come, irions=go." }),
            q("TRUE_FALSE", "True or False: 'Faire' conditional is 'je ferais'.", { correctAnswer: "true", explanation: "Faire conditional: je ferais." }),
          ],
        },
        {
          title: "Si Clauses (If Clauses)",
          type: "QUIZ",
          questions: [
            q("MCQ", "'Si j'etais riche, je voyagerais' uses which structure?", { options: ["Si + imparfait -> conditionnel", "Si + present -> futur", "Si + pqp -> conditionnel passe", "Si + imparfait -> present"], correctAnswer: "0", explanation: "Si + imparfait -> conditionnel present (hypothetical)." }),
            q("FILL_BLANK", "Si tu etudiais, tu ___ (reussir) l'examen.", { correctAnswer: "reussirais", explanation: "Si + imparfait -> conditionnel present." }),
            q("TRUE_FALSE", "True or False: After 'si', you can use the conditional tense.", { correctAnswer: "false", explanation: "'Si' is never followed by conditional." }),
            q("MCQ", "'Si il fait beau, j'irai' uses:", { options: ["Si + present -> futur simple", "Si + imparfait -> conditionnel", "Si + pqp -> conditionnel passe", "Si + present -> present"], correctAnswer: "0", explanation: "Si + present -> futur simple (real possibility)." }),
            q("CHECKBOX", "Select correct si clause patterns:", { options: ["Si + present -> futur", "Si + imparfait -> conditionnel", "Si + conditionnel -> futur", "Si + pqp -> conditionnel passe"], correctAnswer: "[0,1,3]", explanation: "These are the three standard si clause patterns." }),
            q("FILL_BLANK", "Si j'___ (etre) toi, j'accepterais.", { correctAnswer: "etais", explanation: "Si j'etais toi = If I were you." }),
            q("MCQ", "'Si nous avions su' uses which tense after 'si'?", { options: ["Plus-que-parfait", "Imparfait", "Present", "Conditional"], correctAnswer: "0", explanation: "Si + plus-que-parfait -> conditionnel passe." }),
            q("SPEECH", "Si j'avais le temps, je lirais ce livre.", { correctAnswer: "Si j'avais le temps, je lirais ce livre", language: "fr", hint: "Say: If I had time, I would read this book" }),
            q("TRUE_FALSE", "True or False: 'Si il pleut' is correct (no elision with si).", { correctAnswer: "true", explanation: "Si + il = si il (no elision with 'si')." }),
            q("FILL_BLANK", "Si elle ___ (pouvoir), elle viendrait.", { correctAnswer: "pouvait", explanation: "Si + imparfait: elle pouvait." }),
            q("MCQ", "'Si tu viens ce soir, nous mangerons ensemble' is:", { options: ["Real possibility", "Impossible hypothesis", "Past regret", "Present fact"], correctAnswer: "0", explanation: "Si + present -> futur = real possibility." }),
            q("ORDERING", "Put in order: voyagerais / Si / je / je / pouvais / en / France", { hint: "If I could I would travel to France", correctAnswer: "Si,je,pouvais,je,voyagerais,en,France", explanation: "Si je pouvais, je voyagerais en France." }),
          ],
        },
        {
          title: "Conditional Practice",
          type: "QUIZ",
          questions: [
            q("SPEECH", "Je voudrais visiter la France un jour.", { correctAnswer: "Je voudrais visiter la France un jour", language: "fr", hint: "Say: I would like to visit France one day" }),
            q("FILL_BLANK", "Si nous avions su, nous ___ (venir) plus tot.", { correctAnswer: "serions venus", explanation: "Si + plus-que-parfait -> conditionnel passe." }),
            q("MATCHING", "Match the si clause type:", { options: [{ left: "Si + present", right: "Future" }, { left: "Si + imparfait", right: "Conditional present" }, { left: "Si + pqp", right: "Conditional past" }, { left: "Si + conditionnel", right: "Impossible" }], correctAnswer: "[0,2,1,3]", explanation: "Si + present -> future; Si + imparfait -> conditional; Si + pqp -> conditional past." }),
            q("MCQ", "'Il aurait du etudier' means:", { options: ["He should have studied", "He would study", "He studies", "He will study"], correctAnswer: "0", explanation: "Il aurait du = He should have (conditionnel passe of devoir)." }),
            q("FILL_BLANK", "Tu ___ (devoir) faire plus d'efforts.", { correctAnswer: "devrais", explanation: "Devoir conditional: tu devrais (you should)." }),
            q("CHECKBOX", "Select all polite requests using conditional:", { options: ["Pourriez-vous m'aider?", "Je voudrais un cafe", "Pouvez-vous m'aider?", "Pourrais-tu ouvrir la fenetre?"], correctAnswer: "[0,1,3]", explanation: "Conditional forms are more polite." }),
            q("TRUE_FALSE", "True or False: 'Savoir' conditional is 'je saurais'.", { correctAnswer: "true", explanation: "Savoir conditional: je saurais." }),
            q("MCQ", "'Si j'etais ne en France, je parlerais francais' expresses:", { options: ["Contrary-to-fact present", "Future possibility", "Past regret", "Present reality"], correctAnswer: "0", explanation: "Si + imparfait -> conditional = contrary to present fact." }),
            q("FILL_BLANK", "Si tu ___ (avoir) faim, on peut manger.", { correctAnswer: "as", explanation: "Si + present -> present/futur: si tu as faim." }),
            q("MCQ", "'Tu ferais mieux de...' means:", { options: ["You had better...", "You do better...", "You will do better...", "You are doing better..."], correctAnswer: "0", explanation: "Tu ferais mieux de = You had better (advice)." }),
            q("TRUE_FALSE", "True or False: 'Aller' conditional is 'j'irais'.", { correctAnswer: "true", explanation: "Aller conditional: j'irais." }),
            q("ORDERING", "Put in order: ferais / mieux / Tu / d'etudier", { hint: "You had better study", correctAnswer: "Tu,ferais,mieux,d'etudier", explanation: "Tu ferais mieux d'etudier." }),
          ],
        },
      ],
    },
    {
      title: "Le Discours Indirect (Reported Speech)",
      lessons: [
        {
          title: "Reporting Statements",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you report 'Je suis fatigue'?", { options: ["Il a dit qu'il etait fatigue", "Il a dit qu'il est fatigue", "Il a dit que je suis fatigue", "Il a dit qu'il sera fatigue"], correctAnswer: "0", explanation: "Present -> imparfait in reported speech (past reporting verb)." }),
            q("FILL_BLANK", "Il a dit: 'Je viendrai' -> Il a dit qu'il ___ .", { correctAnswer: "viendrait", explanation: "Future -> conditional in reported speech." }),
            q("TRUE_FALSE", "True or False: When the reporting verb is present, tenses don't change.", { correctAnswer: "true", explanation: "Il dit qu'il vient (no change)." }),
            q("MCQ", "Report: 'Je mange une pomme' -> Il dit qu'il ___ .", { options: ["mange une pomme", "mangeait une pomme", "mangera une pomme", "a mange une pomme"], correctAnswer: "0", explanation: "Present reporting verb -> no tense change." }),
            q("CHECKBOX", "Select correct tense changes in reported speech:", { options: ["Present -> Imparfait", "Future -> Conditional", "Passe compose -> PQP", "Imparfait -> Present"], correctAnswer: "[0,1,2]", explanation: "Present->imparfait, Future->conditional, Passe compose->PQP." }),
            q("FILL_BLANK", "Elle a dit: 'J'ai fini' -> Elle a dit qu'elle avait ___ .", { correctAnswer: "fini", explanation: "Passe compose -> plus-que-parfait." }),
            q("MCQ", "'demain' in reported speech becomes:", { options: ["le lendemain", "aujourd'hui", "hier", "la veille"], correctAnswer: "0", explanation: "Demain -> le lendemain (the next day)." }),
            q("SPEECH", "Il a dit qu'il etait tres content de me voir.", { correctAnswer: "Il a dit qu'il etait tres content de me voir", language: "fr", hint: "Say: He said he was very happy to see me" }),
            q("TRUE_FALSE", "True or False: 'hier' becomes 'la veille' in reported speech.", { correctAnswer: "true", explanation: "Hier -> la veille (the day before)." }),
            q("FILL_BLANK", "Il a demande: 'Ou vas-tu?' -> Il a demande ou j'___ .", { correctAnswer: "allais", explanation: "Present -> imparfait in reported questions." }),
            q("MCQ", "Report: 'Je partirai demain' -> Il a dit qu'il ___ .", { options: ["partirait le lendemain", "partira demain", "partait demain", "part demain"], correctAnswer: "0", explanation: "Future -> conditional + demain -> le lendemain." }),
            q("ORDERING", "Put in order: dit / a / qu'il / Il / etait / malade", { hint: "He said he was sick", correctAnswer: "Il,a,dit,qu'il,etait,malade", explanation: "Il a dit qu'il etait malade." }),
          ],
        },
        {
          title: "Reporting Questions & Commands",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you report 'Ou vas-tu?'", { options: ["Il m'a demande ou j'allais", "Il m'a demande ou je vais", "Il m'a demande ou est-ce que je vais", "Il m'a demande ou j'irai"], correctAnswer: "0", explanation: "Ou + subject + verb (no inversion) + imparfait." }),
            q("FILL_BLANK", "Il m'a dit: 'Ferme la porte!' -> Il m'a dit de ___ la porte.", { correctAnswer: "fermer", explanation: "Commands become 'de + infinitive'." }),
            q("MCQ", "'Elle m'a demande de venir' means:", { options: ["She asked me to come", "She asked me if I came", "She told me I came", "She asked me where I came from"], correctAnswer: "0", explanation: "Demander de + infinitive = to ask someone to do something." }),
            q("TRUE_FALSE", "True or False: Yes/no questions use 'si' in reported speech.", { correctAnswer: "true", explanation: "'Tu viens?' -> Il m'a demande si je venais." }),
            q("CHECKBOX", "Select correct reported commands:", { options: ["Il m'a dit de partir.", "Elle m'a demande d'attendre.", "Il m'a dit que je parte.", "Elle m'a dit partir."], correctAnswer: "[0,1]", explanation: "Commands: dire/demander de + infinitive." }),
            q("FILL_BLANK", "Il a demande: 'Est-ce que tu viens?' -> Il a demande ___ je venais.", { correctAnswer: "si", explanation: "Yes/no question -> si in reported speech." }),
            q("MCQ", "Report: 'Ne fais pas ca!' -> Il m'a demande de ___ .", { options: ["ne pas faire ca", "ne fais pas ca", "ne pas fais ca", "pas faire ca"], correctAnswer: "0", explanation: "Negative command: de ne pas faire." }),
            q("SPEECH", "Elle m'a demande si j'avais fini mon travail.", { correctAnswer: "Elle m'a demande si j'avais fini mon travail", language: "fr", hint: "Say: She asked me if I had finished my work" }),
            q("TRUE_FALSE", "True or False: 'Qu'est-ce que' questions keep 'qu'est-ce que' in reported speech.", { correctAnswer: "false", explanation: "'Qu'est-ce que' -> 'ce que' in reported speech." }),
            q("FILL_BLANK", "Il m'a ordonne de ___ (sortir) immediatement.", { correctAnswer: "sortir", explanation: "Ordonner de + infinitive." }),
            q("MCQ", "'Qui' in reported speech becomes:", { options: ["qui (unchanged)", "qu'est-ce que", "ce que", "si"], correctAnswer: "0", explanation: "Qui/ou/quand/comment are kept in reported speech." }),
            q("ORDERING", "Put in order: demande / m'a / Il / si / je / venais", { hint: "He asked me if I was coming", correctAnswer: "Il,m'a,demande,si,je,venais", explanation: "Il m'a demande si je venais." }),
          ],
        },
      ],
    },
    {
      title: "Les Connecteurs Logiques (Connectors)",
      lessons: [
        {
          title: "Cause & Effect",
          type: "QUIZ",
          questions: [
            q("MCQ", "What does 'parce que' mean?", { options: ["Because", "Although", "Therefore", "However"], correctAnswer: "0", explanation: "Parce que = because." }),
            q("FILL_BLANK", "Je ne sors pas ___ il pleut.", { correctAnswer: "parce qu", explanation: "Parce qu'il pleut = because it's raining." }),
            q("MCQ", "Which means 'therefore/so'?", { options: ["Donc", "Parce que", "Cependant", "Bien que"], correctAnswer: "0", explanation: "Donc = therefore/so." }),
            q("TRUE_FALSE", "True or False: 'Puisque' means 'since/because'.", { correctAnswer: "true", explanation: "Puisque = since/because (known reason)." }),
            q("CHECKBOX", "Select all cause connectors:", { options: ["parce que", "puisque", "donc", "par consequent"], correctAnswer: "[0,1]", explanation: "Parce que and puisque express cause." }),
            q("FILL_BLANK", "Il est malade, ___ il ne vient pas.", { correctAnswer: "donc", explanation: "Donc = therefore." }),
            q("MCQ", "'Comme il est fatigue, il se repose.' Here 'comme' means:", { options: ["Since/As", "Like", "Because of", "However"], correctAnswer: "0", explanation: "Comme at the beginning = since/as." }),
            q("SPEECH", "Il n'a pas pu venir parce qu'il etait malade.", { correctAnswer: "Il n'a pas pu venir parce qu'il etait malade", language: "fr", hint: "Say: He couldn't come because he was sick" }),
            q("FILL_BLANK", "Il a beaucoup etudie, par ___ il a reussi.", { correctAnswer: "consequent", explanation: "Par consequent = therefore/consequently." }),
            q("TRUE_FALSE", "True or False: 'C'est pourquoi' means 'that's why'.", { correctAnswer: "true", explanation: "C'est pourquoi = that's why." }),
            q("MCQ", "'Grace a' vs 'a cause de':", { options: ["Grace a = positive, a cause de = negative", "Same meaning", "Both negative", "Both positive"], correctAnswer: "0", explanation: "Grace a = thanks to (positive). A cause de = because of (negative)." }),
            q("ORDERING", "Put in order: fatigue / Comme / il / dort / est", { hint: "Since he is tired, he sleeps", correctAnswer: "Comme,il,est,fatigue,il,dort", explanation: "Comme il est fatigue, il dort." }),
          ],
        },
        {
          title: "Contrast & Opposition",
          type: "QUIZ",
          questions: [
            q("MCQ", "What does 'cependant' mean?", { options: ["However", "Because", "Therefore", "Moreover"], correctAnswer: "0", explanation: "Cependant = however." }),
            q("FILL_BLANK", "___ qu'il soit jeune, il est tres intelligent.", { correctAnswer: "Bien", explanation: "Bien que = although + subjunctive." }),
            q("CHECKBOX", "Select all connectors expressing contrast:", { options: ["Cependant", "Mais", "Donc", "Par contre"], correctAnswer: "[0,1,3]", explanation: "Cependant, mais, par contre = contrast." }),
            q("MCQ", "'Malgre' means:", { options: ["Despite", "Because of", "Thanks to", "Although"], correctAnswer: "0", explanation: "Malgre = despite." }),
            q("TRUE_FALSE", "True or False: 'Malgre' is followed by a noun (not a clause).", { correctAnswer: "true", explanation: "Malgre + noun: Malgre la pluie = despite the rain." }),
            q("FILL_BLANK", "Il est riche, ___ il n'est pas heureux.", { correctAnswer: "mais", explanation: "Mais = but." }),
            q("MCQ", "'En revanche' is used to:", { options: ["Show contrast", "Show cause", "Show time", "Show purpose"], correctAnswer: "0", explanation: "En revanche = on the other hand (contrast)." }),
            q("SPEECH", "Il travaille beaucoup, cependant il n'est pas fatigue.", { correctAnswer: "Il travaille beaucoup, cependant il n'est pas fatigue", language: "fr", hint: "Say: He works a lot, however he is not tired" }),
            q("FILL_BLANK", "___ la pluie, nous sommes sortis.", { correctAnswer: "Malgre", explanation: "Malgre la pluie = despite the rain." }),
            q("TRUE_FALSE", "True or False: 'Tandis que' means 'while/whereas'.", { correctAnswer: "true", explanation: "Tandis que = while/whereas (contrast)." }),
            q("MCQ", "Which is the most formal way to say 'but'?", { options: ["Neanmoins", "Mais", "Par contre", "Cependant"], correctAnswer: "0", explanation: "Neanmoins = nevertheless (formal)." }),
            q("ORDERING", "Put in order: pauvre / Il / heureux / mais / est / est", { hint: "He is poor but he is happy", correctAnswer: "Il,est,pauvre,mais,il,est,heureux", explanation: "Il est pauvre mais il est heureux." }),
          ],
        },
      ],
    },
    {
      title: "Exprimer ses Opinions (Opinions)",
      lessons: [
        {
          title: "Giving Your Opinion",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'In my opinion'?", { options: ["A mon avis", "A mon idee", "En ma pensee", "Pour mon avis"], correctAnswer: "0", explanation: "A mon avis = In my opinion." }),
            q("FILL_BLANK", "Je pense ___ c'est une bonne idee.", { correctAnswer: "que", explanation: "Je pense que = I think that." }),
            q("SPEECH", "A mon avis, ce film est excellent.", { correctAnswer: "A mon avis, ce film est excellent", language: "fr", hint: "Say: In my opinion, this film is excellent" }),
            q("MCQ", "'Selon moi' means:", { options: ["According to me", "For me", "With me", "By me"], correctAnswer: "0", explanation: "Selon moi = According to me." }),
            q("CHECKBOX", "Select all opinion expressions:", { options: ["A mon avis", "Je crois que", "Il est certain que", "Je pense que"], correctAnswer: "[0,1,3]", explanation: "A mon avis, Je crois que, Je pense que are opinions." }),
            q("FILL_BLANK", "___ mon point de vue, c'est injuste.", { correctAnswer: "A", explanation: "A mon point de vue = From my point of view." }),
            q("MCQ", "'Il me semble que' means:", { options: ["It seems to me that", "I seem that", "It seems me", "I am that"], correctAnswer: "0", explanation: "Il me semble que = It seems to me that." }),
            q("TRUE_FALSE", "True or False: 'Je trouve que' means 'I find that/I think that'.", { correctAnswer: "true", explanation: "Je trouve que = I find that / I think that." }),
            q("FILL_BLANK", "Personnellement, je ___ que c'est vrai.", { correctAnswer: "pense", explanation: "Personnellement, je pense que... = Personally, I think that..." }),
            q("MCQ", "Which is more formal?", { options: ["Il me semble que", "Je pense que", "A mon avis", "Je crois que"], correctAnswer: "0", explanation: "Il me semble que is more formal." }),
            q("TRUE_FALSE", "True or False: 'Je suis convaincu que' means 'I am convinced that'.", { correctAnswer: "true", explanation: "Je suis convaincu que = I am convinced that." }),
            q("ORDERING", "Put in order: que / pense / bonne / Je / c'est / idee / une", { hint: "I think it's a good idea", correctAnswer: "Je,pense,que,c'est,une,bonne,idee", explanation: "Je pense que c'est une bonne idee." }),
          ],
        },
        {
          title: "Agreeing & Disagreeing",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you strongly agree?", { options: ["Je suis tout a fait d'accord", "Je ne suis pas d'accord", "Peut-etre", "Je ne sais pas"], correctAnswer: "0", explanation: "Je suis tout a fait d'accord = I completely agree." }),
            q("FILL_BLANK", "Je ne suis pas ___ . (I disagree)", { correctAnswer: "d'accord", explanation: "Je ne suis pas d'accord = I don't agree." }),
            q("MCQ", "'C'est vrai' means:", { options: ["That's true", "That's false", "I don't know", "Maybe"], correctAnswer: "0", explanation: "C'est vrai = That's true." }),
            q("CHECKBOX", "Select all agreement expressions:", { options: ["Absolument", "C'est exact", "Je suis d'accord", "Pas du tout"], correctAnswer: "[0,1,2]", explanation: "Absolument, C'est exact, Je suis d'accord = agreement." }),
            q("TRUE_FALSE", "True or False: 'Pas du tout' means 'not at all'.", { correctAnswer: "true", explanation: "Pas du tout = not at all (strong disagreement)." }),
            q("FILL_BLANK", "Tu as ___ ! (You're right!)", { correctAnswer: "raison", explanation: "Tu as raison = You're right." }),
            q("MCQ", "'C'est faux' means:", { options: ["That's false", "That's true", "That's funny", "That's sad"], correctAnswer: "0", explanation: "C'est faux = That's false." }),
            q("SPEECH", "Je suis entierement d'accord avec votre proposition.", { correctAnswer: "Je suis entierement d'accord avec votre proposition", language: "fr", hint: "Say: I completely agree with your proposal" }),
            q("FILL_BLANK", "Je ne partage pas ton ___ . (I don't share your opinion)", { correctAnswer: "avis", explanation: "Je ne partage pas ton avis." }),
            q("TRUE_FALSE", "True or False: 'Au contraire' means 'on the contrary'.", { correctAnswer: "true", explanation: "Au contraire = on the contrary." }),
            q("MCQ", "'Je suis du meme avis' means:", { options: ["I share the same opinion", "I disagree", "I don't know", "I have a different opinion"], correctAnswer: "0", explanation: "Je suis du meme avis = I share the same opinion." }),
            q("ORDERING", "Put in order: tout / fait / Je / d'accord / suis", { hint: "I completely agree", correctAnswer: "Je,suis,tout,a,fait,d'accord", explanation: "Je suis tout a fait d'accord." }),
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "B1 Comprehensive Review",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which sentence uses the subjunctive correctly?", { options: ["Il faut que tu finisses.", "Il faut que tu finis.", "Il faut que tu finiras.", "Il faut que tu finissais."], correctAnswer: "0", explanation: "Il faut que + subjunctive: tu finisses." }),
            q("FILL_BLANK", "Si j'avais le temps, je ___ (voyager) plus.", { correctAnswer: "voyagerais", explanation: "Si + imparfait -> conditionnel present." }),
            q("MCQ", "Report: 'Je viendrai demain' -> Il a dit qu'il ___ .", { options: ["viendrait le lendemain", "viendra demain", "venait demain", "vient le lendemain"], correctAnswer: "0", explanation: "Future -> conditional + demain -> le lendemain." }),
            q("SPEECH", "Je suis tout a fait d'accord avec toi.", { correctAnswer: "Je suis tout a fait d'accord avec toi", language: "fr", hint: "Say: I completely agree with you" }),
            q("CHECKBOX", "Select all subjunctive triggers:", { options: ["Il faut que", "Je veux que", "Il est certain que", "Je doute que"], correctAnswer: "[0,1,3]", explanation: "Il faut que, Je veux que, Je doute que -> subjunctive." }),
            q("TRUE_FALSE", "True or False: 'Parce que' expresses cause.", { correctAnswer: "true", explanation: "Parce que = because (cause)." }),
            q("FILL_BLANK", "___ la pluie, nous sommes restes a la maison.", { correctAnswer: "A cause de", explanation: "A cause de la pluie = because of the rain (negative)." }),
            q("MCQ", "'Cependant' is used to express:", { options: ["Contrast", "Cause", "Time", "Purpose"], correctAnswer: "0", explanation: "Cependant = however (contrast)." }),
            q("MCQ", "Which is correct?", { options: ["Je voudrais que tu viennes.", "Je voudrais que tu viens.", "Je voudrais que tu viendras.", "Je voudrais que tu venais."], correctAnswer: "0", explanation: "Vouloir que + subjunctive: tu viennes." }),
            q("FILL_BLANK", "Il m'a demande ___ je voulais manger.", { correctAnswer: "ce que", explanation: "Qu'est-ce que -> ce que in reported speech." }),
            q("MATCHING", "Match connector to function:", { options: [{ left: "parce que", right: "cause" }, { left: "donc", right: "effect" }, { left: "mais", right: "contrast" }, { left: "puis", right: "sequence" }], correctAnswer: "[0,2,1,3]", explanation: "parce que=cause, donc=effect, mais=contrast, puis=sequence." }),
            q("ORDERING", "Put in order: que / heureux / Je / tu / sois / suis", { hint: "I am happy that you are", correctAnswer: "Je,suis,heureux,que,tu,sois", explanation: "Je suis heureux que tu sois." }),
          ],
        },
      ],
    },
  ];

  const course = await db.course.create({
    data: {
      title: "French B1 - Avance",
      description: "Intermediate French: subjunctive, conditionals, reported speech, and complex expressions.",
      categoryId: category.id,
      difficulty: "INTERMEDIATE",
      minimumLevel: "B1",
      isFree: true,
      icon: "🇫🇷 French",
      color: "#2563eb",
    },
  });
  console.log(`   ✅ Created course: ${course.title}`);

  let totalQuestions = 0;
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m];
    const createdModule = await db.module.create({ data: { title: mod.title, courseId: course.id, order: m + 1 } });

    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      const createdLesson = await db.lesson.create({ data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 } });

      for (let qd of lesson.questions) {
        let optionsStr: string | null = null;
        if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options);
        else if (qd.options && typeof qd.options === "string") optionsStr = qd.options;

        await db.question.create({
          data: {
            lessonId: createdLesson.id, type: qd.type, question: qd.question,
            hint: qd.hint || null, explanation: qd.explanation || null,
            options: optionsStr, correctAnswer: qd.correctAnswer,
            language: qd.language || null, order: totalQuestions + 1,
          },
        });
        totalQuestions++;
      }
      console.log(`      - Lesson: ${lesson.title} [${lesson.questions.length} questions]`);
    }
  }

  console.log(`\n   📊 French B1: ${modules.length} modules, ${modules.reduce((s, m) => s + m.lessons.length, 0)} lessons, ${totalQuestions} questions`);
}

async function seedFrenchB2() {
  console.log("\n🇫🇷 Seeding French B2 - Avance Superieur...\n");

  let category = await db.category.findFirst({ where: { name: { equals: "Languages", mode: "insensitive" } } });
  if (!category) {
    category = await db.category.create({ data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" } });
  }

  const existing = await db.course.findFirst({ where: { title: "French B2 - Avance Superieur" } });
  if (existing) {
    console.log("   🗑️  Deleting existing French B2...");
    await db.question.deleteMany({ where: { lesson: { module: { courseId: existing.id } } } });
    await db.lesson.deleteMany({ where: { module: { courseId: existing.id } } });
    await db.module.deleteMany({ where: { courseId: existing.id } });
    await db.course.delete({ where: { id: existing.id } });
    console.log("   ✅ Deleted existing course");
  }

  const modules = [
    {
      title: "Grammaire Avancee (Advanced Grammar)",
      lessons: [
        {
          title: "Plus-que-parfait (Past Perfect)",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you form the plus-que-parfait?", { options: ["Imparfait of avoir/etre + past participle", "Present of avoir/etre + past participle", "Conditional of avoir + past participle", "Imperative + past participle"], correctAnswer: "0", explanation: "Plus-que-parfait = imparfait of avoir/etre + past participle." }),
            q("FILL_BLANK", "Quand je suis arrive, il avait deja ___ (partir).", { correctAnswer: "parti", explanation: "Plus-que-parfait: il etait parti = he had already left." }),
            q("MCQ", "'Elle avait fini avant midi' means:", { options: ["She had finished before noon", "She finished before noon", "She was finishing before noon", "She will finish before noon"], correctAnswer: "0", explanation: "Plus-que-parfait expresses action completed before another past action." }),
            q("TRUE_FALSE", "True or False: The plus-que-parfait is used for the 'past of the past'.", { correctAnswer: "true", explanation: "PQP = action that happened before another past action." }),
            q("FILL_BLANK", "Elle etait triste parce qu'elle avait ___ (perdre) son chien.", { correctAnswer: "perdu", explanation: "Avait perdu = she had lost." }),
            q("MCQ", "Which sentence is in plus-que-parfait?", { options: ["J'avais deja mange", "J'ai deja mange", "Je mangeais deja", "Je mangerais deja"], correctAnswer: "0", explanation: "J'avais deja mange = I had already eaten." }),
            q("CHECKBOX", "Select all plus-que-parfait sentences:", { options: ["Nous etions partis", "Ils avaient parle", "Tu as fini", "Elle etait venue"], correctAnswer: "[0,1,3]", explanation: "Etions partis, avaient parle, etait venue are PQP." }),
            q("FILL_BLANK", "Ils sont arrives apres que nous avions ___ (finir).", { correctAnswer: "fini", explanation: "Avions fini = we had finished." }),
            q("SPEECH", "Quand je suis arrive, elle etait deja partie.", { correctAnswer: "Quand je suis arrive, elle etait deja partie", language: "fr", hint: "Say: When I arrived, she had already left" }),
            q("TRUE_FALSE", "True or False: 'Etre' verbs in PQP also require past participle agreement.", { correctAnswer: "true", explanation: "PQP with etre: agreement with subject." }),
            q("MCQ", "'Il n'avait jamais voyage avant ce jour' means:", { options: ["He had never traveled before that day", "He never traveled", "He was traveling", "He will travel"], correctAnswer: "0", explanation: "Il n'avait jamais voyage = He had never traveled." }),
            q("ORDERING", "Put in order: avait / deja / il / fini / quand / suis / je / arrive", { hint: "He had already finished when I arrived", correctAnswer: "Il,avait,deja,fini,quand,je,suis,arrive", explanation: "Il avait deja fini quand je suis arrive." }),
          ],
        },
        {
          title: "Gerondif & Participe Present",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you form the gerund (gerondif)?", { options: ["en + present participle (-ant)", "avec + infinitive", "par + past participle", "de + infinitive"], correctAnswer: "0", explanation: "Gerondif = en + present participle. En mangeant = while eating." }),
            q("FILL_BLANK", "___ (marcher), il chantait.", { correctAnswer: "En marchant", explanation: "En marchant = while walking." }),
            q("TRUE_FALSE", "True or False: 'En etudiant, j'ai appris beaucoup' means 'By studying, I learned a lot'.", { correctAnswer: "true", explanation: "Gerondif expresses manner or simultaneity." }),
            q("MCQ", "The present participle of 'finir' is:", { options: ["finissant", "finissant", "fini", "finirant"], correctAnswer: "0", explanation: "Finir -> finissant (nous finissons -> finiss- + -ant)." }),
            q("FILL_BLANK", "___ (faire) ses devoirs, il ecoutait de la musique.", { correctAnswer: "En faisant", explanation: "Faire -> faisant. En faisant = while doing." }),
            q("MCQ", "Difference between gerondif and participe present?", { options: ["Gerondif has 'en', participe present doesn't", "No difference", "Gerondif is past tense", "Participe present is future"], correctAnswer: "0", explanation: "En mangeant (gerondif) vs mangeant (participe present)." }),
            q("CHECKBOX", "Select correct present participles:", { options: ["parlant (parler)", "finissant (finir)", "ayant (avoir)", "etant (etre)"], correctAnswer: "[0,1,2,3]", explanation: "All are correct present participles." }),
            q("SPEECH", "En travaillant dur, il a reussi son examen.", { correctAnswer: "En travaillant dur, il a reussi son examen", language: "fr", hint: "Say: By working hard, he passed his exam" }),
            q("TRUE_FALSE", "True or False: 'Tout en' can emphasize simultaneity.", { correctAnswer: "true", explanation: "Tout en + gerondif = while/at the same time as." }),
            q("FILL_BLANK", "___ (courir), il s'est blesse.", { correctAnswer: "En courant", explanation: "Courir -> courant. En courant = while running." }),
            q("MCQ", "'Ayant fini son travail, il est parti.' Here 'ayant fini' is:", { options: ["Participe compose", "Gerondif", "Imparfait", "Infinitif passe"], correctAnswer: "0", explanation: "Ayant fini = participe compose (past participle form)." }),
            q("ORDERING", "Put in order: en / Il / lisant / appris / a / beaucoup", { hint: "By reading he learned a lot", correctAnswer: "En,lisant,il,a,appris,beaucoup", explanation: "En lisant il a appris beaucoup." }),
          ],
        },
      ],
    },
    {
      title: "Le Discours Formel (Formal Language)",
      lessons: [
        {
          title: "Writing Formal Letters",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you formally begin a letter?", { options: ["Madame, Monsieur", "Cher ami", "Salut", "Coucou"], correctAnswer: "0", explanation: "Madame, Monsieur is the standard formal greeting." }),
            q("FILL_BLANK", "Veuillez agreer, Madame, l'expression de mes ___ .", { correctAnswer: "sentiments distingues", explanation: "Standard formal closing." }),
            q("MCQ", "'Je vous saurais reconnaissant de bien vouloir...' means:", { options: ["I would be grateful if you would...", "I know you want to...", "I thank you for wanting...", "I will know if you want..."], correctAnswer: "0", explanation: "Formal request expression." }),
            q("TRUE_FALSE", "True or False: 'Veuillez' is a formal way to say 'please'.", { correctAnswer: "true", explanation: "Veuillez = please (formal imperative of vouloir)." }),
            q("FILL_BLANK", "Je vous prie de bien vouloir ___ ma demande.", { correctAnswer: "accepter", explanation: "Je vous prie de = I request that you (formal)." }),
            q("MCQ", "Which is the most formal way to end a letter?", { options: ["Veuillez agreer, Madame, mes salutations distinguees", "Cordialement", "A bientot", "Bisous"], correctAnswer: "0", explanation: "Salutations distinguees = most formal closing." }),
            q("CHECKBOX", "Select formal letter components:", { options: ["Objet:", "Madame, Monsieur", "Je vous prie de", "Bisous"], correctAnswer: "[0,1,2]", explanation: "Objet, Madame/Monsieur, Je vous prie de are formal." }),
            q("SPEECH", "Je vous ecris afin de vous informer de ma decision.", { correctAnswer: "Je vous ecris afin de vous informer de ma decision", language: "fr", hint: "Say: I am writing to inform you of my decision" }),
            q("TRUE_FALSE", "True or False: 'Je me permets de vous contacter' is a polite formal opening.", { correctAnswer: "true", explanation: "Je me permets de = I take the liberty of (formal)." }),
            q("FILL_BLANK", "Dans l'attente de votre ___ .", { correctAnswer: "reponse", explanation: "Dans l'attente de votre reponse = Awaiting your response." }),
            q("MCQ", "'En reference a votre lettre du...' means:", { options: ["With reference to your letter of...", "In reply to your call...", "Regarding your email...", "Following our meeting..."], correctAnswer: "0", explanation: "En reference a = with reference to." }),
            q("ORDERING", "Put in order: vous / prie / Je / de / bien / vouloir", { hint: "I request that you kindly", correctAnswer: "Je,vous,prie,de,bien,vouloir", explanation: "Je vous prie de bien vouloir." }),
          ],
        },
        {
          title: "Formal Vocabulary",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the formal equivalent of 'Je veux'?", { options: ["Je souhaiterais", "Je desire", "Je veux bien", "Je veux que"], correctAnswer: "0", explanation: "Je souhaiterais (conditional) is more formal." }),
            q("MATCHING", "Match informal to formal:", { options: [{ left: "Je veux", right: "Je souhaiterais" }, { left: "Mais", right: "Cependant" }, { left: "Donc", right: "Par consequent" }, { left: "Beaucoup", right: "Un grand nombre de" }], correctAnswer: "[0,2,1,3]", explanation: "Formal register replacements." }),
            q("FILL_BLANK", "Nous vous prions de bien vouloir nous ___. (formal 'send us')", { correctAnswer: "envoyer", explanation: "Nous vous prions de bien vouloir nous envoyer." }),
            q("MCQ", "'Il convient de' means:", { options: ["It is appropriate to", "It is necessary to", "It is possible to", "It is forbidden to"], correctAnswer: "0", explanation: "Il convient de = It is appropriate/proper to." }),
            q("TRUE_FALSE", "True or False: 'Obtenir' is more formal than 'avoir'.", { correctAnswer: "true", explanation: "Obtenir = to obtain (formal). Avoir = to have (neutral)." }),
            q("CHECKBOX", "Select formal alternatives to 'dire':", { options: ["affirmer", "soutenir", "dire", "exposer"], correctAnswer: "[0,1,3]", explanation: "Affirmer, soutenir, exposer are more formal than dire." }),
            q("FILL_BLANK", "Nous vous serions ___ de bien vouloir repondre rapidement.", { correctAnswer: "reconnaissants", explanation: "Nous vous serions reconnaissants = we would be grateful." }),
            q("SPEECH", "Il est imperatif de prendre des mesures immediates.", { correctAnswer: "Il est imperatif de prendre des mesures immediates", language: "fr", hint: "Say: It is imperative to take immediate measures" }),
            q("MCQ", "'S'empresser de' means:", { options: ["To hasten to", "To stop", "To refuse", "To continue"], correctAnswer: "0", explanation: "S'empresser de = to hasten to (formal)." }),
            q("TRUE_FALSE", "True or False: 'En ce qui concerne' means 'as for/regarding'.", { correctAnswer: "true", explanation: "En ce qui concerne = regarding/as for." }),
            q("FILL_BLANK", "___ (Therefore), il est recommande de...", { correctAnswer: "Par consequent", explanation: "Par consequent = Therefore." }),
            q("MCQ", "Which is the most formal word for 'buy'?", { options: ["Acquerir", "Acheter", "Prendre", "Obtenir"], correctAnswer: "0", explanation: "Acquerir = to acquire (formal)." }),
          ],
        },
      ],
    },
    {
      title: "L'Argumentation (Argumentation)",
      lessons: [
        {
          title: "Building Arguments",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which phrase introduces an argument?", { options: ["D'une part... d'autre part", "En conclusion", "Pour commencer", "Cependant"], correctAnswer: "0", explanation: "D'une part... d'autre part = on the one hand... on the other hand." }),
            q("FILL_BLANK", "___ (Moreover), il est important de considerer...", { correctAnswer: "De plus", explanation: "De plus = moreover/in addition." }),
            q("MCQ", "How do you introduce a counter-argument?", { options: ["En revanche", "Premierement", "En somme", "Tout d'abord"], correctAnswer: "0", explanation: "En revanche = on the other hand." }),
            q("CHECKBOX", "Select all argument connectors:", { options: ["En premier lieu", "De surcroit", "En conclusion", "Par consequent"], correctAnswer: "[0,1,2,3]", explanation: "All are used in argumentation." }),
            q("TRUE_FALSE", "True or False: 'Il faut aussi noter que' means 'It should also be noted that'.", { correctAnswer: "true", explanation: "Il faut aussi noter que = It should also be noted that." }),
            q("FILL_BLANK", "___ (Firstly), nous devons examiner les faits.", { correctAnswer: "Premierement", explanation: "Premierement = first/firstly." }),
            q("MCQ", "'Par ailleurs' means:", { options: ["Furthermore", "However", "Because", "Although"], correctAnswer: "0", explanation: "Par ailleurs = furthermore/moreover." }),
            q("SPEECH", "D'une part, c'est economique; d'autre part, c'est ecologique.", { correctAnswer: "D'une part, c'est economique; d'autre part, c'est ecologique", language: "fr", hint: "Say: On one hand it's economical; on the other it's ecological" }),
            q("FILL_BLANK", "___ (To conclude), nous pouvons dire que...", { correctAnswer: "En conclusion", explanation: "En conclusion = in conclusion." }),
            q("TRUE_FALSE", "True or False: 'En somme' means 'in short/all in all'.", { correctAnswer: "true", explanation: "En somme = in short/in summary." }),
            q("MCQ", "Which connector adds weight to an argument?", { options: ["Il est essentiel de souligner que", "Peut-etre", "Je ne sais pas", "Bon"], correctAnswer: "0", explanation: "Il est essentiel de souligner que = It is essential to point out that." }),
            q("ORDERING", "Put in order: part / d'une / autre / d'une / part", { hint: "On the one hand... on the other", correctAnswer: "D'une,part,d'autre,part", explanation: "D'une part... d'autre part." }),
          ],
        },
        {
          title: "Debate & Discussion",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you politely disagree?", { options: ["Je ne partage pas cet avis", "Tu as tort", "C'est nul", "Non, jamais"], correctAnswer: "0", explanation: "Je ne partage pas cet avis = I don't share this view." }),
            q("FILL_BLANK", "___ , il faut reconnaitre que... (Nevertheless)", { correctAnswer: "Neanmoins", explanation: "Neanmoins = nevertheless." }),
            q("SPEECH", "En conclusion, je dirais que les avantages l'emportent sur les inconvenients.", { correctAnswer: "En conclusion, je dirais que les avantages l'emportent sur les inconvenients", language: "fr", hint: "Say: In conclusion, the advantages outweigh the disadvantages" }),
            q("MCQ", "'Je comprends votre point de vue, mais...' is:", { options: ["Acknowledging then disagreeing", "Agreeing fully", "Asking a question", "Ending a conversation"], correctAnswer: "0", explanation: "Acknowledge the viewpoint, then present counter-argument." }),
            q("CHECKBOX", "Select polite disagreement expressions:", { options: ["Je ne suis pas de votre avis", "C'est absurde", "Je vois les choses differemment", "Vous avez completement tort"], correctAnswer: "[0,2]", explanation: "Polite: Je ne suis pas de votre avis, Je vois les choses differemment." }),
            q("FILL_BLANK", "Il est ___ de considerer les deux cotes de l'argument.", { correctAnswer: "important", explanation: "Il est important de considerer... = It is important to consider..." }),
            q("MCQ", "'Les tenants et les aboutissants' means:", { options: ["The ins and outs", "The beginning and end", "The pros and cons", "The advantages and disadvantages"], correctAnswer: "0", explanation: "Les tenants et les aboutissants = the ins and outs/details." }),
            q("TRUE_FALSE", "True or False: 'Nuancer son propos' means to moderate/qualify one's statement.", { correctAnswer: "true", explanation: "Nuancer = to add nuance/qualification." }),
            q("FILL_BLANK", "J'___ (admet) que votre argument est valable dans certains cas.", { correctAnswer: "admets", explanation: "J'admets que = I admit that." }),
            q("MCQ", "'Il n'en demeure pas moins que' means:", { options: ["The fact remains that", "It is not the case that", "It doesn't matter that", "It is certain that"], correctAnswer: "0", explanation: "Il n'en demeure pas moins que = The fact remains that." }),
            q("SPEECH", "Je respecte votre opinion, mais je pense differemment.", { correctAnswer: "Je respecte votre opinion, mais je pense differemment", language: "fr", hint: "Say: I respect your opinion but I think differently" }),
            q("TRUE_FALSE", "True or False: 'En d'autres termes' means 'in other words'.", { correctAnswer: "true", explanation: "En d'autres termes = in other words." }),
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "B2 Comprehensive Review",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which is the correct plus-que-parfait?", { options: ["J'avais deja mange", "J'ai deja mange", "Je mangeais deja", "Je mangerais deja"], correctAnswer: "0", explanation: "Plus-que-parfait: j'avais deja mange." }),
            q("FILL_BLANK", "___ (while) travaillant, il ecoutait de la musique.", { correctAnswer: "En", explanation: "En + present participle = while doing." }),
            q("MCQ", "How do you formally say 'I would be grateful'?", { options: ["Je vous serais reconnaissant", "Je suis content", "Je vous remercie", "Merci beaucoup"], correctAnswer: "0", explanation: "Je vous serais reconnaissant (formal)." }),
            q("SPEECH", "D'une part, c'est interessant; d'autre part, c'est tres couteux.", { correctAnswer: "D'une part, c'est interessant; d'autre part, c'est tres couteux", language: "fr", hint: "Say: On the one hand it's interesting; on the other hand it's expensive" }),
            q("CHECKBOX", "Select all formal expressions:", { options: ["Je vous prie de", "Il convient de", "Je veux", "Veuillez agreer"], correctAnswer: "[0,1,3]", explanation: "Je vous prie de, Il convient de, Veuillez agreer are formal." }),
            q("TRUE_FALSE", "True or False: 'Malgre' is followed by a subjunctive verb.", { correctAnswer: "false", explanation: "Malgre is followed by a noun, not a verb." }),
            q("FILL_BLANK", "Je ne partage pas votre ___ . (I don't share your opinion)", { correctAnswer: "avis", explanation: "Je ne partage pas votre avis." }),
            q("MCQ", "'Ayant fini' is:", { options: ["Participe compose", "Gerondif", "Imparfait", "Infinitif"], correctAnswer: "0", explanation: "Ayant fini = participe compose." }),
            q("FILL_BLANK", "___ il soit riche, il n'est pas heureux. (Although)", { correctAnswer: "Bien qu", explanation: "Bien qu'il soit = although he is." }),
            q("MCQ", "Which connector introduces a conclusion?", { options: ["En somme", "De plus", "Parce que", "Cependant"], correctAnswer: "0", explanation: "En somme = in short/in conclusion." }),
            q("MATCHING", "Match formal to neutral:", { options: [{ left: "Acquerir", right: "Acheter" }, { left: "Obtenir", right: "Avoir" }, { left: "S'exprimer", right: "Parler" }, { left: "Demander", right: "Dire" }], correctAnswer: "[0,2,1,3]", explanation: "Acquerir->acheter, Obtenir->avoir, S'exprimer->parler, Demander->dire." }),
            q("ORDERING", "Put in order: reconnu / avoir / Je / le / fait / que / dois", { hint: "I must recognize the fact that", correctAnswer: "Je,dois,reconnaitre,le,fait,que", explanation: "Je dois reconnaitre le fait que." }),
          ],
        },
      ],
    },
  ];

  const course = await db.course.create({
    data: {
      title: "French B2 - Avance Superieur",
      description: "Upper intermediate French: advanced grammar, formal writing, debate, and nuanced expression.",
      categoryId: category.id,
      difficulty: "ADVANCED",
      minimumLevel: "B2",
      isFree: true,
      icon: "🇫🇷 French",
      color: "#2563eb",
    },
  });
  console.log(`   ✅ Created course: ${course.title}`);

  let totalQuestions = 0;
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m];
    const createdModule = await db.module.create({ data: { title: mod.title, courseId: course.id, order: m + 1 } });

    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      const createdLesson = await db.lesson.create({ data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 } });

      for (let qd of lesson.questions) {
        let optionsStr: string | null = null;
        if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options);
        else if (qd.options && typeof qd.options === "string") optionsStr = qd.options;

        await db.question.create({
          data: {
            lessonId: createdLesson.id, type: qd.type, question: qd.question,
            hint: qd.hint || null, explanation: qd.explanation || null,
            options: optionsStr, correctAnswer: qd.correctAnswer,
            language: qd.language || null, order: totalQuestions + 1,
          },
        });
        totalQuestions++;
      }
      console.log(`      - Lesson: ${lesson.title} [${lesson.questions.length} questions]`);
    }
  }

  console.log(`\n   📊 French B2: ${modules.length} modules, ${modules.reduce((s, m) => s + m.lessons.length, 0)} lessons, ${totalQuestions} questions`);
}

async function seedFrenchC1() {
  console.log("\n🇫🇷 Seeding French C1 - Maitrise...\n");

  let category = await db.category.findFirst({ where: { name: { equals: "Languages", mode: "insensitive" } } });
  if (!category) {
    category = await db.category.create({ data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" } });
  }

  const existing = await db.course.findFirst({ where: { title: "French C1 - Maitrise" } });
  if (existing) {
    console.log("   🗑️  Deleting existing French C1...");
    await db.question.deleteMany({ where: { lesson: { module: { courseId: existing.id } } } });
    await db.lesson.deleteMany({ where: { module: { courseId: existing.id } } });
    await db.module.deleteMany({ where: { courseId: existing.id } });
    await db.course.delete({ where: { id: existing.id } });
    console.log("   ✅ Deleted existing course");
  }

  const modules = [
    {
      title: "Nuances de la Langue (Language Nuances)",
      lessons: [
        {
          title: "Subtle Tense Differences",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the nuance between 'Il dut partir' and 'Il devait partir'?", { options: ["Passe simple vs imparfait", "Both mean the same", "One is formal, one informal", "One is future, one is past"], correctAnswer: "0", explanation: "Passe simple (narrative) vs imparfait (ongoing)." }),
            q("MCQ", "When is the 'passe simple' used?", { options: ["Literary/formal writing only", "Everyday conversation", "Email writing", "Spoken storytelling"], correctAnswer: "0", explanation: "Passe simple is used exclusively in literary writing." }),
            q("FILL_BLANK", "Il ___ (aller) au marche et acheta du pain. (passe simple)", { correctAnswer: "alla", explanation: "Aller (passe simple): il alla." }),
            q("TRUE_FALSE", "True or False: The passe compose has replaced the passe simple in spoken French.", { correctAnswer: "true", explanation: "Passe simple is now exclusively literary." }),
            q("MCQ", "What is the passe simple of 'faire' for 'il'?", { options: ["fit", "faisit", "faisa", "fera"], correctAnswer: "0", explanation: "Faire (passe simple): il fit." }),
            q("FILL_BLANK", "Elle ___ (ecrire) un roman. (passe simple)", { correctAnswer: "ecrivit", explanation: "Ecrire (passe simple): elle ecrivit." }),
            q("CHECKBOX", "Select all passe simple forms:", { options: ["il parla", "nous fimes", "ils furent", "je suis alle"], correctAnswer: "[0,1,2]", explanation: "Parla, fimes, furent are passe simple." }),
            q("SPEECH", "Il fut surpris par la nouvelle.", { correctAnswer: "Il fut surpris par la nouvelle", language: "fr", hint: "Say: He was surprised by the news" }),
            q("MCQ", "The passe simple of 'avoir' for 'nous'?", { options: ["eumes", "avions", "avons", "aurions"], correctAnswer: "0", explanation: "Avoir (passe simple): nous eumes." }),
            q("TRUE_FALSE", "True or False: 'Etre' passe simple for 'je' is 'je fus'.", { correctAnswer: "true", explanation: "Etre (passe simple): je fus." }),
            q("FILL_BLANK", "Ils ___ (venir) a la fete. (passe simple)", { correctAnswer: "vinrent", explanation: "Venir (passe simple): ils vinrent." }),
            q("MCQ", "Which is the passe simple of 'voir'?", { options: ["vit", "voyait", "a vu", "verra"], correctAnswer: "0", explanation: "Voir (passe simple): il vit." }),
          ],
        },
        {
          title: "Register & Tone",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which is the most formal way to say 'I think'?", { options: ["Il me semble que", "Je crois que", "Je pense que", "A mon avis"], correctAnswer: "0", explanation: "Il me semble que (most formal)." }),
            q("CHECKBOX", "Select all formal academic expressions:", { options: ["Il convient de noter que", "C'est cool", "En outre", "On va dire que"], correctAnswer: "[0,2]", explanation: "Il convient de noter que and En outre are formal." }),
            q("FILL_BLANK", "___ (Therefore), il est imperatif de reconsiderer...", { correctAnswer: "Par consequent", explanation: "Par consequent = Therefore (formal)." }),
            q("MCQ", "Which is the most informal?", { options: ["C'est genial", "C'est remarquable", "C'est extraordinaire", "C'est remarquable"], correctAnswer: "0", explanation: "C'est genial is informal compared to the others." }),
            q("FILL_BLANK", "Il convient de ___ (highlight) ce point important.", { correctAnswer: "souligner", explanation: "Souligner = to highlight/emphasize (formal)." }),
            q("MCQ", "'Nonobstant' means:", { options: ["Notwithstanding", "However", "Because", "Although"], correctAnswer: "0", explanation: "Nonobstant = notwithstanding (very formal/legal)." }),
            q("TRUE_FALSE", "True or False: 'Susmentionne' means 'aforementioned'.", { correctAnswer: "true", explanation: "Susmentionne = aforementioned (formal/legal)." }),
            q("MATCHING", "Match register levels:", { options: [{ left: "boulot", right: "informal" }, { left: "travail", right: "neutral" }, { left: "emploi", right: "formal" }, { left: "occupation professionnelle", right: "administrative" }], correctAnswer: "[0,2,1,3]", explanation: "boulot=informal, travail=neutral, emploi=formal, occupation=administrative." }),
            q("SPEECH", "Il importe de preciser que cette analyse demeure incomplete.", { correctAnswer: "Il importe de preciser que cette analyse demeure incomplete", language: "fr", hint: "Say: It is important to specify that this analysis remains incomplete" }),
            q("FILL_BLANK", "___ (With regard to) cette question, nous devons agir.", { correctAnswer: "Eu egard a", explanation: "Eu egard a = with regard to (formal)." }),
            q("TRUE_FALSE", "True or False: 'Force est de constater que' is a formal expression meaning 'we must acknowledge that'.", { correctAnswer: "true", explanation: "Force est de constater que = one must acknowledge that." }),
            q("MCQ", "Which register uses 'mec' for 'man/guy'?", { options: ["Slang/familiar", "Standard", "Formal", "Literary"], correctAnswer: "0", explanation: "Mec = guy (slang/familiar)." }),
          ],
        },
      ],
    },
    {
      title: "Expression Sophistiquee (Sophisticated Expression)",
      lessons: [
        {
          title: "Expressing Nuanced Opinion",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you express a nuanced agreement?", { options: ["Je souscris largement a cette idee, avec certaines reserves", "Je suis d'accord", "C'est vrai", "Ouais"], correctAnswer: "0", explanation: "C1-level nuanced expression." }),
            q("FILL_BLANK", "Bien que cette approche soit seduisante, elle presente neanmoins des ___ .", { correctAnswer: "limites", explanation: "Des limites = limitations." }),
            q("SPEECH", "Il est indeniable que les nouvelles technologies ont transforme notre societe.", { correctAnswer: "Il est indeniable que les nouvelles technologies ont transforme notre societe", language: "fr", hint: "Say: It is undeniable that new technologies have transformed our society" }),
            q("MCQ", "'Tout en reconnaissant la validite de votre argument, je dois neanmoins...' is:", { options: ["A nuanced disagreement", "Full agreement", "A question", "An insult"], correctAnswer: "0", explanation: "Acknowledges validity while disagreeing (nuanced)." }),
            q("FILL_BLANK", "Il serait ___ de pretendre que cette question est simple.", { correctAnswer: "hasardeux", explanation: "Hasardeux = risky/hazardous (to claim)." }),
            q("CHECKBOX", "Select nuanced expressions:", { options: ["Dans une certaine mesure", "Il va sans dire", "Force est de constater", "C'est evident"], correctAnswer: "[0,2]", explanation: "Dans une certaine mesure, Force est de constater are nuanced." }),
            q("TRUE_FALSE", "True or False: 'On ne saurait nier que' means 'One cannot deny that'.", { correctAnswer: "true", explanation: "On ne saurait nier que = One cannot deny that (formal)." }),
            q("MCQ", "'Cette these merite d'etre nuancee' means:", { options: ["This thesis needs qualification", "This thesis is wrong", "This thesis is perfect", "This thesis is irrelevant"], correctAnswer: "0", explanation: "Merite d'etre nuancee = deserves to be qualified/nuanced." }),
            q("FILL_BLANK", "___ (It must be acknowledged) que le probleme est complexe.", { correctAnswer: "Il faut reconnaitre", explanation: "Il faut reconnaitre = It must be acknowledged." }),
            q("MCQ", "Which expression shows intellectual humility?", { options: ["Il convient de reconnaitre les limites de cette approche", "J'ai toujours raison", "C'est simple", "C'est clair"], correctAnswer: "0", explanation: "Acknowledging limits shows intellectual humility." }),
            q("TRUE_FALSE", "True or False: 'A proprement parler' means 'strictly speaking'.", { correctAnswer: "true", explanation: "A proprement parler = strictly speaking." }),
            q("ORDERING", "Put in order: mesure / Dans / certaine / une / c'est / juste", { hint: "To a certain extent it's fair", correctAnswer: "Dans,une,certaine,mesure,c'est,juste", explanation: "Dans une certaine mesure c'est juste." }),
          ],
        },
        {
          title: "Hypothesis & Speculation",
          type: "QUIZ",
          questions: [
            q("MCQ", "What does 'Il se pourrait que' express?", { options: ["Possibility/speculation", "Certainty", "Past action", "Obligation"], correctAnswer: "0", explanation: "Il se pourrait que = It could be that." }),
            q("FILL_BLANK", "Il se pourrait qu'il ___ (avoir) raison.", { correctAnswer: "ait", explanation: "Il se pourrait que + subjunctive." }),
            q("MCQ", "'Tout porte a croire que' means:", { options: ["Everything suggests that", "Everything carries the belief", "Everyone believes that", "Nothing proves that"], correctAnswer: "0", explanation: "Tout porte a croire que = Everything suggests." }),
            q("CHECKBOX", "Select expressions of speculation:", { options: ["Il est conceivable que", "Il est certain que", "Rien ne permet d'affirmer que", "On peut supposer que"], correctAnswer: "[0,2,3]", explanation: "These express uncertainty/speculation." }),
            q("TRUE_FALSE", "True or False: 'A en juger par' means 'judging by'.", { correctAnswer: "true", explanation: "A en juger par = judging by." }),
            q("FILL_BLANK", "___ (It is likely that) la situation va s'ameliorer.", { correctAnswer: "Il est probable que", explanation: "Il est probable que + subjunctive." }),
            q("MCQ", "'Quoi qu'il en soit' means:", { options: ["Be that as it may", "Whatever it is", "That is how it is", "It doesn't matter"], correctAnswer: "0", explanation: "Quoi qu'il en soit = Be that as it may." }),
            q("SPEECH", "Il n'est pas exclu que cette hypothese soit la bonne.", { correctAnswer: "Il n'est pas exclu que cette hypothese soit la bonne", language: "fr", hint: "Say: It is not excluded that this hypothesis is correct" }),
            q("FILL_BLANK", "On peut ___ (conjecture) que les resultats seront positifs.", { correctAnswer: "conjecturer", explanation: "Conjecturer = to conjecture/speculate." }),
            q("MCQ", "Which expresses the strongest certainty?", { options: ["Il est av ere que", "Il se pourrait que", "On peut supposer que", "Il est concevable que"], correctAnswer: "0", explanation: "Il est avere que = It is established/proven that." }),
            q("TRUE_FALSE", "True or False: 'Dans l'hypothese ou' is followed by the subjunctive.", { correctAnswer: "true", explanation: "Dans l'hypothese ou + subjunctive = in the event that." }),
            q("ORDERING", "Put in order: porte / Tout / que / croire / c'est / vrai", { hint: "Everything suggests it's true", correctAnswer: "Tout,porte,a,croire,que,c'est,vrai", explanation: "Tout porte a croire que c'est vrai." }),
          ],
        },
      ],
    },
    {
      title: "Le Monde Professionnel (Professional World)",
      lessons: [
        {
          title: "Business Communication",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you say 'meeting' in a professional context?", { options: ["une reunion", "un rendez-vous", "une rencontre", "All are correct depending on context"], correctAnswer: "3", explanation: "Reunion (formal), rendez-vous (appointment), rencontre (encounter)." }),
            q("FILL_BLANK", "Veuillez trouver ci-joint le ___ (report) annuel.", { correctAnswer: "rapport", explanation: "Le rapport annuel = the annual report." }),
            q("MCQ", "What does 'un compte-rendu' mean?", { options: ["Meeting minutes", "An invoice", "A resume", "A complaint"], correctAnswer: "0", explanation: "Un compte-rendu = meeting minutes." }),
            q("CHECKBOX", "Select professional email elements:", { options: ["Objet:", "Cordialement", "Bisous", "Veuillez trouver ci-joint"], correctAnswer: "[0,1,3]", explanation: "Objet, Cordialement, Veuillez trouver ci-joint are professional." }),
            q("TRUE_FALSE", "True or False: 'Un bilan' means a balance sheet/assessment.", { correctAnswer: "true", explanation: "Un bilan = assessment/balance sheet." }),
            q("FILL_BLANK", "Nous devons ___ (schedule) une reunion la semaine prochaine.", { correctAnswer: "planifier", explanation: "Planifier = to schedule." }),
            q("MCQ", "'Un ordre du jour' is:", { options: ["An agenda", "A daily order", "A calendar", "A schedule"], correctAnswer: "0", explanation: "Un ordre du jour = an agenda." }),
            q("SPEECH", "Je vous prie de bien vouloir confirmer votre presence a la reunion.", { correctAnswer: "Je vous prie de bien vouloir confirmer votre presence a la reunion", language: "fr", hint: "Say: Please confirm your attendance at the meeting" }),
            q("FILL_BLANK", "Le ___ d'affaires (turnover) a augmente de 10%.", { correctAnswer: "chiffre", explanation: "Le chiffre d'affaires = turnover/revenue." }),
            q("MCQ", "'Un delai' means:", { options: ["A deadline/timeframe", "A delay", "A deal", "A detail"], correctAnswer: "0", explanation: "Un delai = deadline/timeframe." }),
            q("TRUE_FALSE", "True or False: 'Une feuille de route' means a roadmap/action plan.", { correctAnswer: "true", explanation: "Feuille de route = roadmap/action plan." }),
            q("MCQ", "Which is the most formal way to end a business email?", { options: ["Veuillez agreer nos salutations distinguees", "A plus", "Cordialement", "Bonne journee"], correctAnswer: "0", explanation: "Salutations distinguees = most formal." }),
          ],
        },
        {
          title: "Job Interview French",
          type: "QUIZ",
          questions: [
            q("MCQ", "How do you describe your strengths?", { options: ["Mes points forts incluent...", "Je suis super fort", "Je sais tout faire", "Je suis le meilleur"], correctAnswer: "0", explanation: "Mes points forts incluent (professional)." }),
            q("FILL_BLANK", "J'ai cinq ans d'experience dans le domaine du ___ .", { correctAnswer: "marketing", explanation: "Le marketing = marketing." }),
            q("SPEECH", "Je suis convaincu que mon profil correspond a ce poste.", { correctAnswer: "Je suis convaincu que mon profil correspond a ce poste", language: "fr", hint: "Say: I am convinced that my profile matches this position" }),
            q("MCQ", "'Parlez-moi de vous' means:", { options: ["Tell me about yourself", "Talk to you", "Speak about you", "Describe yourself physically"], correctAnswer: "0", explanation: "Parlez-moi de vous = Tell me about yourself." }),
            q("CHECKBOX", "Select professional qualities:", { options: ["Rigoureux", "Proactif", "Paresseux", "Organise"], correctAnswer: "[0,1,3]", explanation: "Rigoureux, Proactif, Organise are professional qualities." }),
            q("FILL_BLANK", "Mon projet ___ (professional) est de devenir directeur.", { correctAnswer: "professionnel", explanation: "Mon projet professionnel = my professional goal." }),
            q("MCQ", "'Vos pretentions salariales' means:", { options: ["Your salary expectations", "Your salary history", "Your tax returns", "Your bank statements"], correctAnswer: "0", explanation: "Pretentions salariales = salary expectations." }),
            q("TRUE_FALSE", "True or False: 'Un CDD' is a permanent contract.", { correctAnswer: "false", explanation: "CDD = contrat a duree determinee (fixed-term). CDI = permanent." }),
            q("FILL_BLANK", "J'aimerais savoir quelles sont les ___ d'evolution.", { correctAnswer: "possibilites", explanation: "Possibilites d'evolution = career advancement opportunities." }),
            q("MCQ", "'Manager une equipe' means:", { options: ["To manage a team", "To leave a team", "To join a team", "To fire a team"], correctAnswer: "0", explanation: "Manager = to manage." }),
            q("TRUE_FALSE", "True or False: 'Un stage' is an internship.", { correctAnswer: "true", explanation: "Un stage = internship." }),
            q("ORDERING", "Put in order: experience / J'ai / ans / cinq / en / gestion / de", { hint: "I have five years of management experience", correctAnswer: "J'ai,cinq,ans,d'experience,en,gestion", explanation: "J'ai cinq ans d'experience en gestion." }),
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "C1 Comprehensive Review",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which expression demonstrates C1-level register?", { options: ["Il convient de souligner que", "C'est super important", "Je veux dire que", "Bon, alors..."], correctAnswer: "0", explanation: "Il convient de souligner que (C1 formal)." }),
            q("FILL_BLANK", "___ (Although it is true that) les avantages sont nombreux, les risques persistent.", { correctAnswer: "S'il est vrai que", explanation: "S'il est vrai que = Although it is true that." }),
            q("MCQ", "'Il se pourrait que' is followed by:", { options: ["Subjunctive", "Indicative", "Infinitive", "Conditional"], correctAnswer: "0", explanation: "Il se pourrait que + subjunctive." }),
            q("SPEECH", "En definitive, cette analyse revele la complexite inherente au phenomene.", { correctAnswer: "En definitive, cette analyse revele la complexite inherente au phenomene", language: "fr", hint: "Say: Ultimately, this analysis reveals the inherent complexity" }),
            q("CHECKBOX", "Select formal business expressions:", { options: ["Veuillez trouver ci-joint", "Le chiffre d'affaires", "C'est cool", "Un compte-rendu"], correctAnswer: "[0,1,3]", explanation: "These are formal business expressions." }),
            q("TRUE_FALSE", "True or False: 'Passe simple' is used in spoken French.", { correctAnswer: "false", explanation: "Passe simple is exclusively literary." }),
            q("FILL_BLANK", "Il importe de ___ (consider) tous les aspects du probleme.", { correctAnswer: "considerer", explanation: "Considerer = to consider." }),
            q("MCQ", "'Nonobstant' belongs to which register?", { options: ["Legal/very formal", "Standard", "Informal", "Slang"], correctAnswer: "0", explanation: "Nonobstant = legal/very formal." }),
            q("FILL_BLANK", "Dans l'hypothese ou le projet serait annule, nous ___ (reagir) rapidement.", { correctAnswer: "reagirions", explanation: "Dans l'hypothese ou + conditional." }),
            q("MCQ", "Which shows the most nuanced opinion?", { options: ["Il serait premature de tirer des conclusions definitives", "C'est clair", "Je suis sur", "C'est evident"], correctAnswer: "0", explanation: "Premature to draw definitive conclusions = nuanced." }),
            q("MATCHING", "Match expression to function:", { options: [{ left: "Quoi qu'il en soit", right: "Transition" }, { left: "Il est avere que", right: "Certainty" }, { left: "Il se pourrait que", right: "Speculation" }, { left: "Par consequent", right: "Consequence" }], correctAnswer: "[0,2,1,3]", explanation: "Quoi qu'il en soit=transition, Il est avere que=certainty, Il se pourrait que=speculation, Par consequent=consequence." }),
            q("ORDERING", "Put in order: nuancee / Cette / d'etre / merite / approche", { hint: "This approach deserves to be nuanced", correctAnswer: "Cette,approche,merite,d'etre,nuancee", explanation: "Cette approche merite d'etre nuancee." }),
          ],
        },
      ],
    },
  ];

  const course = await db.course.create({
    data: {
      title: "French C1 - Maitrise",
      description: "Advanced French: nuanced expression, professional communication, and sophisticated grammar.",
      categoryId: category.id,
      difficulty: "ADVANCED",
      minimumLevel: "C1",
      isFree: true,
      icon: "🇫🇷 French",
      color: "#2563eb",
    },
  });
  console.log(`   ✅ Created course: ${course.title}`);

  let totalQuestions = 0;
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m];
    const createdModule = await db.module.create({ data: { title: mod.title, courseId: course.id, order: m + 1 } });

    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      const createdLesson = await db.lesson.create({ data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 } });

      for (let qd of lesson.questions) {
        let optionsStr: string | null = null;
        if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options);
        else if (qd.options && typeof qd.options === "string") optionsStr = qd.options;

        await db.question.create({
          data: {
            lessonId: createdLesson.id, type: qd.type, question: qd.question,
            hint: qd.hint || null, explanation: qd.explanation || null,
            options: optionsStr, correctAnswer: qd.correctAnswer,
            language: qd.language || null, order: totalQuestions + 1,
          },
        });
        totalQuestions++;
      }
      console.log(`      - Lesson: ${lesson.title} [${lesson.questions.length} questions]`);
    }
  }

  console.log(`\n   📊 French C1: ${modules.length} modules, ${modules.reduce((s, m) => s + m.lessons.length, 0)} lessons, ${totalQuestions} questions`);
}

async function seedFrenchC2() {
  console.log("\n🇫🇷 Seeding French C2 - Maitrise Avancee...\n");

  let category = await db.category.findFirst({ where: { name: { equals: "Languages", mode: "insensitive" } } });
  if (!category) {
    category = await db.category.create({ data: { name: "Languages", description: "Learn African and world languages", icon: "🌍", color: "#008751" } });
  }

  const existing = await db.course.findFirst({ where: { title: "French C2 - Maitrise Avancee" } });
  if (existing) {
    console.log("   🗑️  Deleting existing French C2...");
    await db.question.deleteMany({ where: { lesson: { module: { courseId: existing.id } } } });
    await db.lesson.deleteMany({ where: { module: { courseId: existing.id } } });
    await db.module.deleteMany({ where: { courseId: existing.id } });
    await db.course.delete({ where: { id: existing.id } });
    console.log("   ✅ Deleted existing course");
  }

  const modules = [
    {
      title: "Maitrise Linguistique (Linguistic Mastery)",
      lessons: [
        {
          title: "Advanced Syntax & Style",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is 'l'inversion stylistique'?", { options: ["Placing subject after verb for literary effect", "Reversing word order in questions", "Using passive voice", "Inverting adjectives and nouns"], correctAnswer: "0", explanation: "Stylistic inversion: 'Vint alors le moment ou...'" }),
            q("MCQ", "Which demonstrates literary inversion?", { options: ["Dans la ville vivait un homme sage", "Un homme sage vivait dans la ville", "Est-ce que tu viens?", "Viens ici!"], correctAnswer: "0", explanation: "Dans la ville vivait = In the town lived (literary)." }),
            q("FILL_BLANK", "Ainsi ___-il que la situation etait desesperee.", { correctAnswer: "demontra", explanation: "Ainsi demontra-t-il = Thus he demonstrated." }),
            q("TRUE_FALSE", "True or False: Stylistic inversion is common in everyday spoken French.", { correctAnswer: "false", explanation: "Stylistic inversion is a literary device." }),
            q("MCQ", "'A peine etait-il entre que...' means:", { options: ["Hardly had he entered when...", "He had just entered that...", "As soon as he entered...", "He barely entered because..."], correctAnswer: "0", explanation: "A peine...que = Hardly...when." }),
            q("FILL_BLANK", "___-ce la verite? (Is that the truth? - formal inversion)", { correctAnswer: "Est", explanation: "Est-ce la verite? = formal inverted question." }),
            q("CHECKBOX", "Select sentences with stylistic inversion:", { options: ["Dans ce pays vecut un roi", "Je suis alle au cinema", "Peut-etre viendra-t-il", "Il est alle au marche"], correctAnswer: "[0,2]", explanation: "Dans ce pays vecut, Peut-etre viendra-t-il use inversion." }),
            q("SPEECH", "A peine avait-il prononce ces mots qu'il le regretta.", { correctAnswer: "A peine avait-il prononce ces mots qu'il le regretta", language: "fr", hint: "Say: Hardly had he spoken these words when he regretted it" }),
            q("MCQ", "Which structure triggers inversion?", { options: ["Peut-etre", "Sans doute", "Toutefois", "Cependant"], correctAnswer: "0", explanation: "Peut-etre que triggers inversion: Peut-etre viendra-t-il." }),
            q("FILL_BLANK", "Non seulement il est intelligent, mais il est ___ (also) gentil.", { correctAnswer: "aussi", explanation: "Non seulement...mais aussi = Not only...but also." }),
            q("TRUE_FALSE", "True or False: 'Aussi' at the beginning of a sentence triggers inversion.", { correctAnswer: "true", explanation: "Aussi + inversion: Aussi decida-t-il de partir." }),
            q("ORDERING", "Put in order: alors / Vint / moment / le / ou", { hint: "Then came the moment when", correctAnswer: "Vint,alors,le,moment,ou", explanation: "Vint alors le moment ou." }),
          ],
        },
        {
          title: "Nuances & Precision",
          type: "QUIZ",
          questions: [
            q("MCQ", "Difference between 'saisir' and 'comprendre'?", { options: ["Saisir = sudden grasp, comprendre = general", "Same meaning", "Saisir is informal", "Saisir is past tense"], correctAnswer: "0", explanation: "Saisir = to grasp (sudden), comprendre = general understanding." }),
            q("FILL_BLANK", "Il a ___ (grasped) l'importance immediatement.", { correctAnswer: "saisi", explanation: "Saisir (past): il a saisi." }),
            q("CHECKBOX", "Select synonyms of 'neanmoins':", { options: ["Cependant", "Toutefois", "Par consequent", "Neanmoins"], correctAnswer: "[0,1,3]", explanation: "Cependant, toutefois, neanmoins = however." }),
            q("MCQ", "Difference between 'savoir' and 'connaitre'?", { options: ["Savoir = facts/skills, connaitre = people/places", "No difference", "Savoir is formal", "Connaitre is for facts"], correctAnswer: "0", explanation: "Savoir = to know (facts/skills). Connaitre = to know (familiar with)." }),
            q("FILL_BLANK", "Je ___ (know how) nager.", { correctAnswer: "sais", explanation: "Savoir + infinitive = to know how to." }),
            q("MCQ", "'Aprement discute' means:", { options: ["Heavily debated", "Gently discussed", "Quickly decided", "Easily resolved"], correctAnswer: "0", explanation: "Aprement = fiercely/bitterly." }),
            q("TRUE_FALSE", "True or False: 'S'en prendre a' means 'to attack/criticize'.", { correctAnswer: "true", explanation: "S'en prendre a quelqu'un = to attack/criticize someone." }),
            q("MATCHING", "Match subtle differences:", { options: [{ left: "empecher", right: "to prevent" }, { left: "eviter", right: "to avoid" }, { left: "interdire", right: "to forbid" }, { left: "proscrire", right: "to proscribe" }], correctAnswer: "[0,2,1,3]", explanation: "empecher=prevent, eviter=avoid, interdire=forbid, proscrire=proscribe." }),
            q("SPEECH", "Il convient de distinguer ces deux notions fondamentales.", { correctAnswer: "Il convient de distinguer ces deux notions fondamentales", language: "fr", hint: "Say: It is important to distinguish these two fundamental concepts" }),
            q("FILL_BLANK", "La situation n'est pas sans ___ (without being without) interet.", { correctAnswer: "etre", explanation: "N'est pas sans + infinitive = is not without (double negative for emphasis)." }),
            q("MCQ", "'Corollaire' means:", { options: ["A direct consequence", "A contradiction", "A hypothesis", "An exception"], correctAnswer: "0", explanation: "Corollaire = corollary (direct consequence)." }),
            q("TRUE_FALSE", "True or False: 'Sous-jacent' means 'underlying'.", { correctAnswer: "true", explanation: "Sous-jacent = underlying/implicit." }),
          ],
        },
      ],
    },
    {
      title: "Rhetorique & Eloquence",
      lessons: [
        {
          title: "Rhetorical Devices",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is 'l'antithese'?", { options: ["Contrasting two opposing ideas", "Repeating the same word", "Asking a rhetorical question", "Exaggerating"], correctAnswer: "0", explanation: "Antithese = antithesis (contrast)." }),
            q("FILL_BLANK", "L'___ joint deux termes contradictoires: 'un silence assourdissant'.", { correctAnswer: "oxymore", explanation: "Un oxymore = oxymoron." }),
            q("MCQ", "'Qui ne dit mot consent' uses which device?", { options: ["Proverb/aphorism", "Hyperbole", "Metaphor", "Alliteration"], correctAnswer: "0", explanation: "Qui ne dit mot consent = proverb." }),
            q("CHECKBOX", "Select rhetorical devices:", { options: ["La litote", "L'euphemisme", "Le participe present", "L'hyperbole"], correctAnswer: "[0,1,3]", explanation: "Litote, euphemisme, hyperbole are rhetorical devices." }),
            q("TRUE_FALSE", "True or False: A 'litote' affirms by negating the opposite.", { correctAnswer: "true", explanation: "Litote: 'Va, je ne te hais point' = I love you (affirms by denying opposite)." }),
            q("FILL_BLANK", "L'___ est une exageration deliberate.", { correctAnswer: "hyperbole", explanation: "Hyperbole = exaggeration." }),
            q("MCQ", "'Je ne suis pas mecontent' (litote) means:", { options: ["I am pleased", "I am not unhappy", "I am sad", "I am neutral"], correctAnswer: "0", explanation: "Litote: not unhappy = pleased." }),
            q("SPEECH", "Ce n'est pas un petit evenement que cette revolution technologique.", { correctAnswer: "Ce n'est pas un petit evenement que cette revolution technologique", language: "fr", hint: "Say: This is no small event, this technological revolution" }),
            q("FILL_BLANK", "L'___ repete le meme son en debut de mots.", { correctAnswer: "alliteration", explanation: "Alliteration = repetition of initial sounds." }),
            q("MCQ", "'Euphemisme' is used to:", { options: ["Soften harsh realities", "Exaggerate", "Contrast", "Question"], correctAnswer: "0", explanation: "Euphemisme = euphemism (softening)." }),
            q("TRUE_FALSE", "True or False: 'Il nous a quittes' is a euphemism for death.", { correctAnswer: "true", explanation: "Il nous a quittes = He left us (euphemism for died)." }),
            q("ORDERING", "Put in order: haine / Va / point / je / ne / te", { hint: "Go, I do not hate you (Corneille litote)", correctAnswer: "Va,je,ne,te,hais,point", explanation: "Va, je ne te hais point." }),
          ],
        },
        {
          title: "Persuasive Writing",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is the 'captatio benevolentiae'?", { options: ["Opening to win goodwill", "A conclusion", "A counter-argument", "An insult"], correctAnswer: "0", explanation: "Captatio benevolentiae = winning the audience's goodwill at the start." }),
            q("FILL_BLANK", "L'argument d'___ s'appuie sur l'autorite d'un expert.", { correctAnswer: "autorite", explanation: "Argument d'autorite = appeal to authority." }),
            q("MCQ", "Which is an 'argument ad hominem'?", { options: ["Attacking the person, not the argument", "Using logic", "Citing evidence", "Appealing to emotion"], correctAnswer: "0", explanation: "Ad hominem = attacking the person." }),
            q("CHECKBOX", "Select persuasive techniques:", { options: ["L'ethos", "Le pathos", "Le logos", "L'imparfait"], correctAnswer: "[0,1,2]", explanation: "Ethos (credibility), pathos (emotion), logos (logic) are persuasive appeals." }),
            q("TRUE_FALSE", "True or False: 'Le pathos' appeals to logic.", { correctAnswer: "false", explanation: "Le pathos appeals to emotion. Le logos appeals to logic." }),
            q("FILL_BLANK", "La ___ consiste a presenter un exemple fictif pour illustrer.", { correctAnswer: "fiction", explanation: "Using a fictional example to illustrate." }),
            q("MCQ", "'Reductio ad absurdum' means:", { options: ["Reducing an argument to absurdity", "Building a strong case", "Appealing to authority", "Simplifying a complex topic"], correctAnswer: "0", explanation: "Reductio ad absurdum = showing an argument leads to absurdity." }),
            q("SPEECH", "Il est de notre devoir collectif de reagir face a cette injustice.", { correctAnswer: "Il est de notre devoir collectif de reagir face a cette injustice", language: "fr", hint: "Say: It is our collective duty to react against this injustice" }),
            q("FILL_BLANK", "L'___ du lecteur est essentielle dans un texte persuasif.", { correctAnswer: "adhesion", explanation: "L'adhesion du lecteur = the reader's agreement/buy-in." }),
            q("MCQ", "'L'ironie' in persuasive writing is used to:", { options: ["Mock or criticize indirectly", "Praise directly", "Ask questions", "List facts"], correctAnswer: "0", explanation: "Ironie = saying the opposite to criticize." }),
            q("TRUE_FALSE", "True or False: 'L'analogie' compares two similar situations to support an argument.", { correctAnswer: "true", explanation: "Analogie = analogy (comparison)." }),
            q("ORDERING", "Put in order: logos / pathos / Ethos / et / sont / les / trois / piliers", { hint: "Ethos pathos and logos are the three pillars", correctAnswer: "Ethos,pathos,et,logos,sont,les,trois,piliers", explanation: "Ethos, pathos et logos sont les trois piliers." }),
          ],
        },
      ],
    },
    {
      title: "Litterature Francaise",
      lessons: [
        {
          title: "Analyzing Literary Texts",
          type: "QUIZ",
          questions: [
            q("MCQ", "What is a 'narrateur omniscient'?", { options: ["An all-knowing narrator", "A first-person narrator", "An unreliable narrator", "A silent narrator"], correctAnswer: "0", explanation: "Narrateur omniscient = all-knowing narrator." }),
            q("FILL_BLANK", "Le ___ de focalisation determine qui raconte l'histoire.", { correctAnswer: "point", explanation: "Point de focalisation = point of view/focalization." }),
            q("MCQ", "'La focalisation interne' means:", { options: ["Narrator knows only what one character knows", "Narrator knows everything", "Narrator is outside the story", "No narrator exists"], correctAnswer: "0", explanation: "Focalisation interne = limited to one character's perspective." }),
            q("CHECKBOX", "Select literary analysis terms:", { options: ["La metaphore", "Le rythme", "Le champ lexical", "Le subjonctif"], correctAnswer: "[0,1,2]", explanation: "Metaphore, rythme, champ lexical are literary analysis terms." }),
            q("TRUE_FALSE", "True or False: 'Un champ lexical' is a group of words related to the same theme.", { correctAnswer: "true", explanation: "Champ lexical = lexical field (words around a theme)." }),
            q("FILL_BLANK", "L'___ est la structure fondamentale du recit.", { correctAnswer: "intrigue", explanation: "L'intrigue = the plot." }),
            q("MCQ", "'Le denouement' is:", { options: ["The resolution of the story", "The beginning", "The climax", "The setting"], correctAnswer: "0", explanation: "Le denouement = resolution." }),
            q("SPEECH", "L'auteur utilise un registre tragicomique pour decrire la condition humaine.", { correctAnswer: "L'auteur utilise un registre tragicomique pour decrire la condition humaine", language: "fr", hint: "Say: The author uses a tragicomic register to describe the human condition" }),
            q("FILL_BLANK", "La ___ narrative est l'ordre dans lequel les evenements sont presentes.", { correctAnswer: "structure", explanation: "Structure narrative = narrative structure." }),
            q("MCQ", "'Un flashback' in French literature is called:", { options: ["Analepse", "Prolepse", "Ellipse", "Anachronie"], correctAnswer: "0", explanation: "Analepse = flashback. Prolepse = flashforward." }),
            q("TRUE_FALSE", "True or False: 'Le registre lyrique' expresses intense personal emotion.", { correctAnswer: "true", explanation: "Registre lyrique = lyrical register (emotional/personal)." }),
            q("MATCHING", "Match literary terms:", { options: [{ left: "Analepse", right: "Flashback" }, { left: "Prolepse", right: "Flashforward" }, { left: "Ellipse", right: "Time skip" }, { left: "Anachronie", right: "Time disorder" }], correctAnswer: "[0,2,1,3]", explanation: "Analepse=flashback, Prolepse=flashforward, Ellipse=time skip, Anachronie=time disorder." }),
          ],
        },
        {
          title: "Literary Movements",
          type: "QUIZ",
          questions: [
            q("MCQ", "The Romantic movement emphasized:", { options: ["Emotion and nature", "Reason and logic", "Science and progress", "Religion and tradition"], correctAnswer: "0", explanation: "Romanticism emphasized emotion, nature, individualism." }),
            q("FILL_BLANK", "Victor Hugo est une figure majeure du ___ .", { correctAnswer: "Romantisme", explanation: "Victor Hugo is a major figure of Romanticism." }),
            q("MCQ", "'Le realisme' in literature focuses on:", { options: ["Depicting everyday life accurately", "Fantasy and imagination", "Abstract philosophy", "Religious themes"], correctAnswer: "0", explanation: "Realisme = accurate depiction of everyday life." }),
            q("CHECKBOX", "Select French literary movements:", { options: ["Le classicisme", "Le surrealisme", "Le jazz", "L'existentialisme"], correctAnswer: "[0,1,3]", explanation: "Classicisme, surrealisme, existentialisme are French literary movements." }),
            q("TRUE_FALSE", "True or False: Voltaire belongs to the Enlightenment (Les Lumieres).", { correctAnswer: "true", explanation: "Voltaire = key figure of Les Lumieres (Enlightenment)." }),
            q("FILL_BLANK", "Baudelaire est associe au mouvement ___ et symboliste.", { correctAnswer: "parnassien", explanation: "Baudelaire is associated with Parnassian and Symbolist movements." }),
            q("MCQ", "The Existentialist movement was led by:", { options: ["Sartre and Camus", "Hugo and Zola", "Moliere and Racine", "Proust and Gide"], correctAnswer: "0", explanation: "Sartre and Camus were existentialist leaders." }),
            q("SPEECH", "Le Nouveau Roman remet en question les conventions narratives traditionnelles.", { correctAnswer: "Le Nouveau Roman remet en question les conventions narratives traditionnelles", language: "fr", hint: "Say: The New Novel questions traditional narrative conventions" }),
            q("FILL_BLANK", "Moliere est le maitre de la ___ classique.", { correctAnswer: "comedie", explanation: "Moliere is the master of classical comedy." }),
            q("MCQ", "'Le surrealisme' was influenced by:", { options: ["Freud's psychoanalysis", "Aristotle's logic", "Newton's physics", "Darwin's evolution"], correctAnswer: "0", explanation: "Surrealism was influenced by Freud's theories of the unconscious." }),
            q("TRUE_FALSE", "True or False: 'Madame Bovary' by Flaubert is a realist novel.", { correctAnswer: "true", explanation: "Madame Bovary = masterpiece of literary realism." }),
            q("ORDERING", "Put in order: Romantisme / Le / classicisme / succede / au", { hint: "Romanticism succeeds classicism", correctAnswer: "Le,Romantisme,succede,au,classicisme", explanation: "Le Romantisme succede au classicisme." }),
          ],
        },
      ],
    },
    {
      title: "Review & Assessment",
      lessons: [
        {
          title: "C2 Final Assessment",
          type: "QUIZ",
          questions: [
            q("MCQ", "Which sentence demonstrates the highest level of French proficiency?", { options: ["Force est de constater que cette these, bien que seduisante, merite d'etre nuancee", "Je pense que c'est pas mal", "C'est vraiment bien", "Je suis d'accord avec toi"], correctAnswer: "0", explanation: "Complex syntax, formal register, and nuance." }),
            q("FILL_BLANK", "A peine ___-il parti que la tempete eclata.", { correctAnswer: "etait", explanation: "A peine etait-il parti que = Hardly had he left when." }),
            q("MCQ", "An 'analepse' is:", { options: ["A flashback", "A flashforward", "A time skip", "A parallel narrative"], correctAnswer: "0", explanation: "Analepse = flashback." }),
            q("SPEECH", "Il convient de distinguer, dans cette oeuvre magistrale, les multiples strates de signification.", { correctAnswer: "Il convient de distinguer, dans cette oeuvre magistrale, les multiples strates de signification", language: "fr", hint: "Say: It is important to distinguish, in this masterful work, the multiple layers of meaning" }),
            q("CHECKBOX", "Select C2-level expressions:", { options: ["Nonobstant", "Sous-jacent", "Corollaire", "C'est bien"], correctAnswer: "[0,1,2]", explanation: "Nonobstant, sous-jacent, corollaire are C2-level vocabulary." }),
            q("TRUE_FALSE", "True or False: 'La litote' is a form of understatement.", { correctAnswer: "true", explanation: "Litote = affirming by negating the opposite (understatement)." }),
            q("FILL_BLANK", "L'argumentation doit mobiliser l'___, le pathos et le logos.", { correctAnswer: "ethos", explanation: "Ethos, pathos, logos are the three rhetorical appeals." }),
            q("MCQ", "Which movement did Camus belong to?", { options: ["Existentialism/Absurdism", "Romanticism", "Realism", "Surrealism"], correctAnswer: "0", explanation: "Camus = Existentialism/Absurdism." }),
            q("FILL_BLANK", "Dans la ville ___ un homme qui avait tout perdu.", { correctAnswer: "vivait", explanation: "Literary inversion: Dans la ville vivait un homme." }),
            q("MCQ", "'S'en prendre a quelqu'un' means:", { options: ["To attack/criticize someone", "To take something from someone", "To help someone", "To ignore someone"], correctAnswer: "0", explanation: "S'en prendre a = to attack/criticize." }),
            q("MATCHING", "Match register to expression:", { options: [{ left: "Slang", right: "C'est ouf" }, { left: "Standard", right: "C'est incroyable" }, { left: "Formal", right: "C'est stupifiant" }, { left: "Literary", right: "C'est proprement renversant" }], correctAnswer: "[0,2,1,3]", explanation: "ouf=slang, incroyable=standard, stupifiant=formal, renversant=literary." }),
            q("ORDERING", "Put in order: demontre / Ainsi / -t-il / la / verite", { hint: "Thus he demonstrated the truth", correctAnswer: "Ainsi,demontra,-t-il,la,verite", explanation: "Ainsi demontra-t-il la verite." }),
          ],
        },
      ],
    },
  ];

  const course = await db.course.create({
    data: {
      title: "French C2 - Maitrise Avancee",
      description: "Expert French: linguistic mastery, rhetoric, literature analysis, and native-level fluency.",
      categoryId: category.id,
      difficulty: "MASTER",
      minimumLevel: "C2",
      isFree: true,
      icon: "🇫🇷 French",
      color: "#2563eb",
    },
  });
  console.log(`   ✅ Created course: ${course.title}`);

  let totalQuestions = 0;
  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m];
    const createdModule = await db.module.create({ data: { title: mod.title, courseId: course.id, order: m + 1 } });

    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      const createdLesson = await db.lesson.create({ data: { title: lesson.title, moduleId: createdModule.id, type: lesson.type, order: l + 1 } });

      for (let qd of lesson.questions) {
        let optionsStr: string | null = null;
        if (qd.options && Array.isArray(qd.options)) optionsStr = JSON.stringify(qd.options);
        else if (qd.options && typeof qd.options === "string") optionsStr = qd.options;

        await db.question.create({
          data: {
            lessonId: createdLesson.id, type: qd.type, question: qd.question,
            hint: qd.hint || null, explanation: qd.explanation || null,
            options: optionsStr, correctAnswer: qd.correctAnswer,
            language: qd.language || null, order: totalQuestions + 1,
          },
        });
        totalQuestions++;
      }
      console.log(`      - Lesson: ${lesson.title} [${lesson.questions.length} questions]`);
    }
  }

  console.log(`\n   📊 French C2: ${modules.length} modules, ${modules.reduce((s, m) => s + m.lessons.length, 0)} lessons, ${totalQuestions} questions`);
}

async function main() {
  console.log("🇫🇷 Seeding all French courses (A2-C2)...");
  await seedFrenchA2();
  await seedFrenchB1();
  await seedFrenchB2();
  await seedFrenchC1();
  await seedFrenchC2();
  console.log("\n✅ All French courses seeded successfully!");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
