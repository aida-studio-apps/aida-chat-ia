export type MessageAuthor = 'user' | 'assistant';

export interface ConversationDto {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  hasAttachments: boolean;
  lastMessagePreview: string | null;
}

export interface AttachmentDto {
  id: string;
  messageId: string;
  fileName: string;
  mimeType: 'application/pdf';
  fileSize: number;
  storagePath: string;
  extractedText?: string;
  createdAt: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  attachments: AttachmentDto[];
}

export interface ConversationMemoryDto {
  id: string;
  conversationId: string;
  summary: string;
  keyFacts: string[];
  updatedAt: string;
}

