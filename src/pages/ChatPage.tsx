import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';
import { useConversationMessages } from '../hooks/useConversationMessages';
import { useSendMessage } from '../hooks/useSendMessage';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { createConversation } = useConversations();
  const { messages, setMessages, loading, error, refresh } = useConversationMessages(conversationId);
  const { submit, sending, error: sendError } = useSendMessage();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const canSend = useMemo(() => content.trim().length > 0 && !sending, [content, sending]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let activeId = conversationId;
    if (!activeId) {
      const created = await createConversation('Conversation');
      activeId = created.id;
      navigate(`/chat/${created.id}`);
    }

    if (!activeId) return;

    const response = await submit(activeId, content, attachment);
    setMessages((prev) => [...prev, response.userMessage, response.assistantMessage]);
    setContent('');
    setAttachment(null);
    await refresh();
  };

  return (
    <section className="grid grid-rows-[1fr_auto] h-[75vh] gap-4">
      <div className="bg-white border rounded-xl p-4 overflow-auto space-y-3">
        {loading && <p>Chargement des messages...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && messages.length === 0 && <p className="text-slate-500">Démarrez la conversation avec votre assistant.</p>}

        {messages.map((m) => (
          <article key={m.id} className={`max-w-[85%] p-3 rounded-xl ${m.author === 'user' ? 'ml-auto bg-slate-900 text-white' : 'bg-slate-100'}`}>
            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            {m.attachments?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.attachments.map((a) => (
                  <span key={a.id} className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-900">
                    📄 {a.fileName}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <form onSubmit={onSubmit} className="bg-white border rounded-xl p-3 space-y-3">
        <textarea
          className="w-full border rounded-lg p-3 min-h-24"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre message..."
        />
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
          </label>
          <button disabled={!canSend} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
        {attachment && <p className="text-xs text-slate-600">PDF joint : {attachment.name}</p>}
        {sendError && <p className="text-red-600 text-sm">{sendError}</p>}
      </form>
    </section>
  );
}
