import { useEffect, useState } from 'react';
import { meetingService } from '../../services/meetingService';
import { questionService } from '../../services/questionService';
import { knowledgeService } from '../../services/knowledgeService';
import { documentService } from '../../services/documentService';

function matches(text, query) {
  return text?.toLowerCase().includes(query.toLowerCase());
}

export default function GlobalSearchResults({ query, onNavigate }) {
  const [meetings, setMeetings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!query || query.trim().length < 2) return;
    meetingService.list({ search: query }).then(setMeetings);
    questionService.list({ search: query }).then(setQuestions);
    knowledgeService.list({ search: query }).then(setKnowledge);
    documentService.list({ search: query }).then(setDocuments).catch(() => []);
  }, [query]);

  const groups = [
    {
      label: 'Meetings',
      items: (meetings || []).filter((m) => matches(m.name, query) || matches(m.topic, query))
        .slice(0, 4)
        .map((m) => ({ title: m.name, subtitle: m.topic || m.module, path: `/meetings/${m.id}` })),
    },
    {
      label: 'Questions',
      items: (questions || []).filter((q) => matches(q.text || q.question, query))
        .slice(0, 4)
        .map((q) => ({ title: q.text || q.question, subtitle: q.module, path: '/questions' })),
    },
    {
      label: 'Knowledge & Decisions',
      items: (knowledge || []).filter((k) => matches(k.title, query) || matches(k.content, query))
        .slice(0, 3)
        .map((k) => ({ title: k.title, subtitle: k.category, path: '/knowledge' })),
    },
    {
      label: 'Documents',
      items: (documents || []).filter((d) => matches(d.name || d.filename, query) || matches(d.meetingName, query))
        .slice(0, 3)
        .map((d) => ({ title: d.name || d.filename, subtitle: d.meetingName, path: '/documents' })),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-lg">
      {groups.length === 0 ? (
        <p className="px-3 py-4 text-center text-sm text-ink-400">No results for "{query}"</p>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{group.label}</p>
            {group.items.map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.path)}
                className="focus-ring block w-full truncate rounded-lg px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                <span className="truncate">{item.title}</span>
                <span className="ml-2 text-xs text-ink-400">{item.subtitle}</span>
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
