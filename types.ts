
export type WritingModel = 'balanced' | 'dramatic' | 'humorous' | 'unchained' | 'descriptive' | 'action' | 'angst' | 'horror';
export type Theme = 'light' | 'dark';
export type Language = 'pt' | 'en';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Story {
  id: string;
  title: string;
  universe: string;
  model: WritingModel;
  messages: Message[];
  updatedAt: number;
  authorName?: string;
}

export interface PromptIdea {
  category: string;
  title: string;
  description: string;
  prompt: string;
}

export type AppView = 'chat' | 'ideas' | 'settings' | 'community';
