import dayjs from "dayjs";

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

export interface IdOnly{
  id: number
}

export interface Scene {
  id: number;
  name: string;
  prompt: string;
}

export interface StoryCreate {
  story_content_file: File; // Changed from string to File for file upload
  title: string;
  scene_id: number;
}

export interface Story {
  id: number;
  title: string;
  scene: Scene;
  content: string;
}

export interface UserOut {
  id: number;
  display_name: string;
  level: number;
}

export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pos: string;
}

export interface VocabularyBase {
  word: string;
  meaning: string;
  pos: string;
}

export interface Leaderboard {
  id: number;
  title: string;
  original_image: IdOnly;
  scene: Scene;
  story?: Story;
  created_by: UserOut;
  vocabularies: Vocabulary[];
}

export interface Stats {
  n_leaderboards?: number;
  n_rounds?: number;
}

export interface School {
  school: string;
}

export interface LeaderboardStartNew {
  id: number;
  start_new: boolean;
}

export interface LeaderboardAnalysis {
  id: number;
  title: string;
  story_extract: string;
  published_at: Date;
  descriptions?: string;
  mistake_word_cloud_id: number;
  writing_word_cloud_id: number;
  user_chat_word_cloud_id: number;
  assistant_chat_word_cloud_id: number;
}

export interface LeaderboardCreate {
  title: string;
  scene_id: number;
  story_id?: number | string | null;
  story_extract: string;
  published_at: Date;
  vocabularies: Vocabulary[];
}

export interface LeaderboardCreateAPI {
  title: string;
  is_public: boolean;
  scene_id: number;
  story_id?: number | string | null;
  story_extract: string;
  published_at: Date | string;
  original_image_id: number;
}

export interface LeaderboardDetail {
  is_public?: boolean;
  title: string;
  scene_id: number;
  story_id?: number | string | null;
  created_by: string;
  story_extract: string;
  published_at: Date;
  descriptions?: string;
  vocabularies: Vocabulary[];
}

export interface LeaderboardItem {
  title: string;
  story_extract: string;
  is_public: boolean;
  published_at: Date;
  id: number;
  original_image: IdOnly;
  scene: Scene;
  story?: Story;
  created_by: UserOut;
  vocabularies: Vocabulary[];
}

export interface LeaderboardUpdate {
  id: number;
  is_public: boolean;
  published_at?: Date | string;
  title?: string;
  scene_id?: number;
  story_id?: number;
  story_extract?: string;
}

export interface LeaderboardSchoolUpdate {
  id: number;
  school: string[];
}

export interface LeaderboardVocabulariesUpdate {
  id: number;
  vocabularies: VocabularyBase[];
}

export interface MistakeItem {
  extracted_text: string; // Text where the mistake was found
  explanation: string;
  correction: string;
}

export type LeaderboardListParams = {
  published_at_start?: dayjs.Dayjs;
  published_at_end?: dayjs.Dayjs;
  is_public?: boolean;
};

export type LeaderboardPageParams = {
  skip?: number;
  limit?: number;
};

export type LeaderboardFetchParams = {
  skip?: number;
  limit?: number;
  published_at_start?: dayjs.Dayjs;
  published_at_end?: dayjs.Dayjs;
  is_public?: boolean;
};

export type GenerationItemParams = {
  program: string;
}

export type LeaderboardAnalysisParams = {
  cloud_type: 'mistake' | 'writing' | 'user_chat' | 'assistant_chat';
  lang: 'en' | 'ja';
}

export type WordCloudParams = {
  word_cloud_id: number;
  cloud_type: 'mistake' | 'writing' | 'user_chat' | 'assistant_chat';
}

export type BaseListParams = {
  skip?: number;
  limit?: number;
};