import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SearchInput from '../ui/SearchInput';
import GlobalSearchResults from './GlobalSearchResults';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ projectContext }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.name || user?.username || 'Consultant';

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="relative w-full max-w-md">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search meetings, questions, knowledge, documents..."
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
          <div className="flex items-center gap-2.5 pl-3">
            <Avatar name={displayName} size={28} />
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-ink-800">{displayName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
