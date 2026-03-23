import { getConversationAttachmentsText } from '../data/attachment-repository.js';

export async function getPdfContext(conversationId: string): Promise<string> {
  const text = await getConversationAttachmentsText(conversationId);
  if (!text.trim()) return '';
  return `Contexte PDF des messages précédents:\n${text.slice(0, 12000)}`;
}

