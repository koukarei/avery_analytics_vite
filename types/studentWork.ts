import type { User, Profile } from './user';

export interface IdOnly {
  id: number;
}

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface WritingEntry {
  id: string;
  title: string; // This might remain in original language for mock data
  content: string; // This might remain in original language for mock data
  date: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id: number;
  is_hint: boolean;
  is_evaluation: boolean;
  response_id?: string;
  content: string; 
  sender: 'user' | 'assistant';
  created_at: string;
}

export interface ChatRecord {
  messages: ChatMessage[];
}

export interface ChatStats {
  n_messages: number;
  n_user_messages: number;
  n_assistant_messages: number;
}

export interface StudentWork {
  student: Student;
  writings: WritingEntry[];
  chatRecords: ChatRecord[];
}

export interface MistakeItem {
  extracted_text: string;
  explanation: string;
  correction: string;
}

export interface GenerationItem {
  id: number;
  user: User; // User who created this generation
  round_id: number; // ID of the round this generation belongs to
  sentence: string;
  correct_sentence: string; // Corrected sentence after grammar check
  mistakes: MistakeItem[]; // List of grammar mistakes in the
}

export interface WritingMistake {
  id: string;
  word: string; // This is used as a label, ideally a key for translation
  frequency: number;
  color: string;
  generations: GenerationItem[];
}

export interface ChatWordCloudItem {
  id: string;
  word: string; // This is used as a label, ideally a key for translation
  frequency: number;
  color: string;
  chat_messages: ChatMessage[];
}

export interface Score {
  generation_id: number;
  grammar_score: number;
  spelling_score: number;
  vividness_score: number;
  convention: boolean;
  structure_score: number;
  content_score: number;
  id: number;
  image_similarity: number;
}

export interface GenerationDetail {
  id: number;
  grammar_errors: string;
  spelling_errors: string;
  evaluation_id: number;
  total_score: number;
  rank: string;
  duration: number;
  is_completed: boolean;
  sentence: string;
  correct_sentence: string;
  interpreted_image: {
    id: number;
  };
  score: Score;
}

export interface Round {
  id: number;
  player?: Profile;
  created_at: Date;
  last_generation_id: number;
  chat_history: number;
  generations: IdOnly[];
}