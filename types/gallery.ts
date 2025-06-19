
export interface ImageItem {
  id: string;
  name: string;
  url: string;
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
