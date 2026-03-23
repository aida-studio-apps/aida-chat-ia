import { useEffect, useState } from 'react';
import { Message } from '../types';
import { conversationsApi } from '../services/conversationsApi';

export function useConversationMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const data = await conversationsApi.messages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [conversationId]);

  return { messages, setMessages, loading, error, refresh };
}
