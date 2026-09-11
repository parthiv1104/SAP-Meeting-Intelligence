import { projects, meetings, questions, requirements, decisions, documents, knowledgeItems } from '../../data/mockData';

function matches(text, query) {
  return text?.toLowerCase().includes(query.toLowerCase());
}

export default function GlobalSearchResults({ query, onNavigate }) {
  const groups = [
    {
      label: 'Projects',
      items: projects.filter((p) => matches(p.name, query) || matches(p.client, query))
        .slice(0, 3)
        .map((p) => ({ title: p.name, subtitle: p.client, path: `/projects/${p.id}` })),
    },
    {
      label: 'Meetings',
      items: meetings.filter((m) => matches(m.name, query) || matches(m.topic, query))
        .slice(0, 3)
        .map((m) => ({ title: m.name, subtitle: m.topic, path: `/meetings/${m.id}` })),
    },
    {
      label: 'Questions',
      items: questions.filter((q) => matches(q.question, query))
        .slice(0, 3)
        .map((q) => ({ title: q.question, subtitle: q.module, path: `/questions/${q.id}` })),
    },
    {
      label: 'Requirements',
      items: requirements.filter((r) => matches(r.text, query) || matches(r.id, query))
        .slice(0, 3)
        .map((r) => ({ title: r.text, subtitle: r.id, path: '/requirements' })),
    },
    {
      label: 'Decisions',
      items: decisions.filter((d) => matches(d.text, query))
        .slice(0, 3)
        .map((d) => ({ title: d.text, subtitle: d.id, path: '/decisions' })),
    },
    {
      label: 'Documents',
      items: documents.filter((d) => matches(d.name, query))
        .slice(0, 3)
        .map((d) => ({ title: d.name, subtitle: d.type, path: '/documents' })),
    },
    {
      label: 'Knowledge',
      items: knowledgeItems.filter((k) => matches(k.title, query) || matches(k.content, query))
        .slice(0, 3)
        .map((k) => ({ title: k.title, subtitle: k.category, path: '/knowledge' })),
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
