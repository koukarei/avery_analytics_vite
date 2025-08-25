import type { User } from './user';

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
  chat_id: number; // ID of the chat this message belongs to
  sender: 'user' | 'assistant';
  context: string; // This might remain in original language for mock data
  created_at: string;
}

export interface ChatRecord {
  messages: ChatMessage[];
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
  corrected_sentence: string; // Corrected sentence after grammar check
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