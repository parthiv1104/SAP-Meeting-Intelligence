import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, FolderKanban } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import ProjectCard from '../components/projects/ProjectCard';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { projectService } from '../services/projectService';
import { industries, sapModules, teamMembers } from '../config/constants';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All Industries');
  const [status, setStatus] = useState('All Statuses');
  const [module, setModule] = useState('All Modules');
  const [manager, setManager] = useState('All Managers');

  useEffect(() => { projectService.list().then(setProjects); }, []);

  const managers = useMemo(() => {
    if (!projects) return [];
    return ['All Managers', ...new Set(projects.map((p) => p.projectManager))];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.client.toLowerCase().includes(query.toLowerCase())) return false;
      if (industry !== 'All Industries' && p.industry !== industry) return false;
      if (status !== 'All Statuses' && p.status !== status) return false;
      if (module !== 'All Modules' && !p.modules.includes(module)) return false;
      if (manager !== 'All Managers' && p.projectManager !== manager) return false;
      return true;
    });
  }, [projects, query, industry, status, module, manager]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Every SAP engagement your organization is running, with live health and knowledge coverage."
        actions={<Button as={Link} to="/projects/new">Create Project</Button>}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search projects or clients..." className="w-full max-w-xs" />
        <Dropdown value={industry} onChange={setIndustry} options={['All Industries', ...industries]} />
        <Dropdown value={status} onChange={setStatus} options={['All Statuses', 'Planning', 'In Progress', 'Completed']} />
        <Dropdown value={module} onChange={setModule} options={['All Modules', ...sapModules]} />
        <Dropdown value={manager} onChange={setManager} options={managers} />

        <div className="ml-auto flex rounded-lg border border-ink-200 p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`focus-ring rounded-md p-1.5 ${view === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-ink-400'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('table')}
            className={`focus-ring rounded-md p-1.5 ${view === 'table' ? 'bg-brand-50 text-brand-700' : 'text-ink-400'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {!projects ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match these filters"
          description="Try adjusting your search or filters to find the project you're looking for."
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      ) : (
        <Table columns={['Project', 'Client', 'Industry', 'SAP Scope', 'Modules', 'Health', 'Progress', 'Open Qs', 'Next Meeting']}>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <Link to={`/projects/${p.id}`} className="font-medium text-brand-700 hover:underline">{p.name}</Link>
              </td>
              <td className="px-4 py-3 text-ink-600">{p.client}</td>
              <td className="px-4 py-3 text-ink-600">{p.industry}</td>
              <td className="px-4 py-3 text-ink-600">{p.sapProduct}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">{p.modules.map((m) => <Badge key={m} tone="neutral">{m}</Badge>)}</div>
              </td>
              <td className="px-4 py-3"><Badge tone={p.health === 'On Track' ? 'success' : 'critical'}>{p.health}</Badge></td>
              <td className="px-4 py-3 w-32"><ProgressBar value={p.progress} showLabel /></td>
              <td className="px-4 py-3 data-num text-ink-600">{p.openQuestions}</td>
              <td className="px-4 py-3 text-ink-600">{p.nextMeeting ? p.nextMeeting.date : '—'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
