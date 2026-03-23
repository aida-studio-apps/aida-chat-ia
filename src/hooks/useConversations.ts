import { useEffect, useState } from 'react';
import { Conversation } from '../types';
import { conversationsApi } from '../services/conversationsApi';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await conversationsApi.list();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title?: string) => {
    const created = await conversationsApi.create(title);
    await refresh();
    return created;
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { conversations, loading, error, refresh, createConversation };
}
