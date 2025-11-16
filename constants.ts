import type { GrammarMistakeItem } from './types/gallery';
export const API_DELAY = 500; // ms

// These are now keys for localization
export const MISTAKE_CATEGORY_KEYS = {
  GRAMMAR: "grammar",
  PUNCTUATION: "punctuation",
  SPELLING: "spelling",
  STYLE: "style",
  VOCABULARY: "vocabulary",
};

export const PLACEHOLDER_IMAGE_DIMENSIONS = {
  small: "200/150",
  medium: "400/300",
  large: "800/600",
};

export const DEFAULT_LANGUAGE: 'en' | 'ja' = 'en';
export const SUPPORTED_LANGUAGES = {
  en: { name: "English" },
  ja: { name: "日本語" },
};
export const SUPPORTED_PROGRAMS = {
  inlab_test: { name: "InLab テストプログラム" },
  student_1_sem_awe: { name: "自動評価プログラム" },
  student_1_sem_img: { name: "画像生成プログラム" },
  student_2_sem: { name: "自動評価・画像生成プログラム" },
};

export const GRAMMAR_MISTAKES_DATA: GrammarMistakeItem[] = [
  { 
    id: 'gm1', 
    label: 'Grammar Mistakes 1', 
    proportion: 0.65, 
    color: 'bg-rose-600', 
    widthClass: 'w-48 sm:w-56 md:w-64', 
    heightClass: 'h-28 sm:h-32 md:h-36' 
  },
  { 
    id: 'gm2', 
    label: 'Grammar Mistakes 2', 
    proportion: 0.35, 
    color: 'bg-pink-500', 
    widthClass: 'w-40 sm:w-48 md:w-52', 
    heightClass: 'h-24 sm:h-28 md:h-32'  
  },
];

export const DESCRIPTIVE_WRITING_SAMPLE = `The ancient library was a sanctuary of silence, its towering shelves carved from dark, polished oak, reaching towards a vaulted ceiling lost in shadows. Dust motes danced in the sparse beams of light that pierced through stained-glass windows, illuminating rows upon rows of leather-bound tomes. Each book whispered secrets of bygone eras, their pages fragile with age, carrying the scent of old paper, ink, and forgotten knowledge. A grand, ornate clock ticked rhythmically in a distant corner, its ponderous beat the only sound to break the profound stillness, measuring out moments in this timeless haven of stories.`;
