import { Conversation, Message } from '../types';
import { apiFetch } from './apiClient';

export const conversationsApi = {
  list: () => apiFetch<Conversation[]>('/conversations'),
  create: (title?: string) =>
    apiFetch<Conversation>('/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }),
  messages: (conversationId: string) => apiFetch<Message[]>(`/conversations/${conversationId}/messages`),
};
