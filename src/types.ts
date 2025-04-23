export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}