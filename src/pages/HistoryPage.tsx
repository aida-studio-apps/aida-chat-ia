import { Link } from 'react-router-dom';
import { useConversations } from '../hooks/useConversations';

export default function HistoryPage() {
  const { conversations, loading, error } = useConversations();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Historique des conversations</h2>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-3">
        {conversations.map((c) => (
          <li key={c.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-slate-500">{new Date(c.updatedAt).toLocaleString()}</p>
                {c.lastMessagePreview && <p className="text-sm mt-2">{c.lastMessagePreview}</p>}
              </div>
              <div className="flex items-center gap-2">
                {c.hasAttachments && <span className="text-xs px-2 py-1 bg-indigo-100 rounded">PDF</span>}
                <Link className="px-3 py-2 rounded bg-slate-900 text-white" to={`/chat/${c.id}`}>
                  Reprendre
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
