import { Navigate, Route, Routes } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';

function Nav() {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');
  const isHistory = location.pathname.startsWith('/history');

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-xl">Assistant Mémoire PDF</h1>
        <nav className="flex gap-2">
          <Link className={`px-3 py-2 rounded ${isChat ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} to="/chat">
            Conversation
          </Link>
          <Link className={`px-3 py-2 rounded ${isHistory ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} to="/history">
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <Nav />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
