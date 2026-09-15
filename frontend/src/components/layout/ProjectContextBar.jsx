import { NavLink, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'meetings', label: 'Meetings' },
  { to: 'questions', label: 'Questions' },
  { to: 'knowledge', label: 'Knowledge' },
  { to: 'documents', label: 'Documents' },
  { to: 'team', label: 'Team' },
];

export default function ProjectContextBar() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    let active = true;
    projectService.get(id).then((p) => active && setProject(p));
    return () => { active = false; };
  }, [id]);

  if (!project) return null;

  return (
    <div className="border-b border-ink-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{project.industry}</p>
          <h2 className="text-lg font-semibold text-ink-900">{project.name}</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {project.sapProduct} &middot; {project.modules.join(' · ')}
          </p>
        </div>
      </div>
      <nav className="mt-3 flex gap-1 overflow-x-auto px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to ? `/projects/${id}/${tab.to}` : `/projects/${id}`}
            end={tab.end}
            className={({ isActive }) =>
              `focus-ring whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
