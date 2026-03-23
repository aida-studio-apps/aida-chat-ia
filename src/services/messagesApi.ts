import { SendMessageResponse } from '../types';

export async function sendMessage(params: {
  conversationId: string;
  content: string;
  attachment?: File | null;
}): Promise<SendMessageResponse> {
  const form = new FormData();
  form.append('conversationId', params.conversationId);
  form.append('content', params.content);
  if (params.attachment) form.append('attachment', params.attachment);

  const response = await fetch('/api/messages', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
}
