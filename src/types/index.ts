export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  hasAttachments: boolean;
  lastMessagePreview: string | null;
}

export type MessageAuthor = 'user' | 'assistant';

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  mimeType: 'application/pdf';
  fileSize: number;
  storagePath: string;
  extractedText?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface ConversationMemory {
  id: string;
  conversationId: string;
  summary: string;
  keyFacts: string[];
  updatedAt: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  memory: ConversationMemory;
}
