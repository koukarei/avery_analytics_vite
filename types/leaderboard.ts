
export interface Leaderboard {
  id: number;
  title: string;
  story_extract: string;
  is_public: boolean;
  published_at: Date;
  vocabularies?: Vocabulary[];
}

export interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    pos: string; // Part of speech
}

export interface GrammarMistakeItem {
  id: string;
  label: string;
  proportion: number; // visual representation, not directly used for size in this version
  color: string; // Tailwind background color class
  textColor: string; // Tailwind text color class
  widthClass: string; // Tailwind width class for oval
  heightClass: string; // Tailwind height class for oval
}

export enum BottomContentType {
  GRAMMAR_VISUALIZATION,
  DESCRIPTIVE_WRITING,
}
