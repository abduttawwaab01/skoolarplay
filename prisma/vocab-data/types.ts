export interface VocabWord {
  word: string;
  definition: string;
  translation?: string;
  partOfSpeech: string;
  pronunciation: string;
  exampleSentence: string;
  exampleTranslation?: string;
  synonyms?: string;
  antonyms?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  languageCode: string;
  audioUrl?: string;
  ttsUrl?: string;
  scrambledWord?: string;
  missingLetter?: string;
}

export interface VocabSet {
  title: string;
  description: string;
  level: string;
  difficulty: string;
  order: number;
  xpReward: number;
  gemReward: number;
  words: VocabWord[];
}

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CEFRLevel = (typeof CEFR_LEVELS)[number];

export const DIFFICULTY_MAP: Record<CEFRLevel, string> = {
  A1: "BEGINNER",
  A2: "BEGINNER",
  B1: "INTERMEDIATE",
  B2: "INTERMEDIATE",
  C1: "ADVANCED",
  C2: "ADVANCED",
};

export const WORD_DIFFICULTY_MAP: Record<CEFRLevel, "EASY" | "MEDIUM" | "HARD"> = {
  A1: "EASY",
  A2: "EASY",
  B1: "MEDIUM",
  B2: "MEDIUM",
  C1: "HARD",
  C2: "HARD",
};
