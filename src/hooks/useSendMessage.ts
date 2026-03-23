import { useState } from 'react';
import { sendMessage } from '../services/messagesApi';

export function useSendMessage() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (conversationId: string, content: string, attachment?: File | null) => {
    try {
      setSending(true);
      setError(null);
      return await sendMessage({ conversationId, content, attachment });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { submit, sending, error };
}
