import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles } from 'lucide-react';
import SearchInput from '../ui/SearchInput';
import GlobalSearchResults from './GlobalSearchResults';
import NotificationDrawer from './NotificationDrawer';
import { currentUser } from '../../data/mockData';

export default function Topbar({ projectContext }) {
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="relative w-full max-w-md">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search projects, meetings, questions, knowledge..."
          />
          {query && (
            <GlobalSearchResults
              query={query}
              onNavigate={(path) => {
                setQuery('');
                navigate(path);
              }}
            />
          )}
        </div>

        {projectContext && (
          <div className="hidden items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/70 px-3 py-1.5 text-xs font-medium text-ink-600 lg:flex">
            <Sparkles size={13} className="text-brand-500" />
            <span>{projectContext}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setNotifOpen(true)}
            className="focus-ring relative rounded-lg p-2 text-ink-500 hover:bg-ink-50"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-critical-500 ring-2 ring-white" />
          </button>
          <div className="hidden items-center gap-2 border-l border-ink-100 pl-3 sm:flex">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-ink-800">{currentUser.name}</p>
              <p className="text-xs text-ink-400">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}
