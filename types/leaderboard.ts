export interface GenerationItem {
  id: number;
  user: User; // User who created this generation
  round_id: number; // ID of the round this generation belongs to
  sentence: string; 
  corrected_sentence: string; // Corrected sentence after grammar check
  mistakes: MistakeItem[]; // List of grammar mistakes in the
}

export interface User {
  id: number;
  profiles: UserProfile;
}

export interface UserProfile {
  display_name: string;
}

export interface WordCloudItem {
  id: number;
  word: string;
  frequency: number; // Frequency of the word in the text
  color: string;
  generations: GenerationItem[]; // List of generations where this word appears
}

export interface ChatWordCloudItem {
  id: number;
  word: string;
  frequency: number; // Frequency of the word in the chat
  color: string;
  chat_messages: ChatMessage[]; // List of chat messages where this word appears
}

export interface ChatMessage {
  id:string;
  chat_id: number; // ID of the chat this message belongs to
  sender: 'user' | 'assistant';
  content: string; // This might remain in original language for mock data
  created_at: Date;
}

export interface Leaderboard {
  id: number;
  title: string;
  story_extract: string;
  published_at: Date;
  descriptions?: string;
  mistake_word_cloud: WordCloudItem[];
  writing_word_cloud: WordCloudItem[];
  user_chat_word_cloud: ChatWordCloudItem[];
  assistant_chat_word_cloud: ChatWordCloudItem[];
}

export interface MistakeItem {
  extracted_text: string; // Text where the mistake was found
  explanation: string;
  correction: string;
}

export enum BottomContentType {
  WordCloudItem,
  GenerationItem,
}

export type LeaderboardListParams = {
  role?: string;
  user_id?: number;
};

export type GenerationItemParams = {
  user_id?: number;
  id?: number;
  mistake_word_cloud_id?: number;
  writing_word_cloud_id?: number;
  user_chat_word_cloud_id?: number;
  assistant_chat_word_cloud_id?: number;
}