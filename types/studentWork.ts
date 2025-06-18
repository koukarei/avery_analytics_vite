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
  id:string;
  sender: 'student' | 'chatbot';
  text: string; // This might remain in original language for mock data
  timestamp: string;
}

export interface ChatRecord {
  id: string;
  topic: string; // This might remain in original language for mock data
  messages: ChatMessage[];
  relatedImageUrl?: string;
}

export interface StudentWork {
  student: Student;
  writings: WritingEntry[];
  chatRecords: ChatRecord[];
}

export interface WritingMistake {
  id: string;
  mistake: string; // This is used as a label, ideally a key for translation
  description: string; // This might remain in original language for mock data
  frequency: number;
  categoryKey: string; // Changed from category to categoryKey
}
