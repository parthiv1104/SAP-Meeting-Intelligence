import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, FolderKanban, Trash2, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import ProjectCard from '../components/projects/ProjectCard';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { projectService } from '../services/projectService';
import { industries, sapModules } from '../config/constants';
import { useToast } from '../hooks/useToast';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('All Industries');
  const [status, setStatus] = useState('All Statuses');
  const [module, setModule] = useState('All Modules');
  const [manager, setManager] = useState('All Managers');

  // Deletion modal state
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadProjects = () => {
    projectService.list().then(setProjects).catch(() => setProjects([]));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectService.delete(projectToDelete.id);
      toast(`Project "${projectToDelete.name}" deleted successfully`, 'success');
      setProjectToDelete(null);
      loadProjects();
    } catch (err) {
      toast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const managers = useMemo(() => {
    if (!projects) return [];
    return ['All Managers', ...new Set(projects.map((p) => p.projectManager).filter(Boolean))];
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const nameMatch = (p.name || '').toLowerCase().includes(query.toLowerCase());
      const clientMatch = (p.client || '').toLowerCase().includes(query.toLowerCase());
      if (query && !nameMatch && !clientMatch) return false;
      if (industry !== 'All Industries' && p.industry !== industry) return false;
      if (status !== 'All Statuses' && p.status !== status) return false;
      if (module !== 'All Modules' && !(p.modules || []).includes(module)) return false;
      if (manager !== 'All Managers' && p.projectManager !== manager) return false;
      return true;
    });
  }, [projects, query, industry, status, module, manager]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Every client engagement your organization is running, with live health, cumulative requirements, and workshops."
        actions={<Button as={Link} to="/projects/new">Create Project</Button>}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search projects or clients..." className="w-full max-w-xs" />
        <Dropdown value={industry} onChange={setIndustry} options={['All Industries', ...industries]} />
        <Dropdown value={status} onChange={setStatus} options={['All Statuses', 'Planning', 'In Progress', 'Completed', 'On Hold']} />
        <Dropdown value={module} onChange={setModule} options={['All Modules', ...sapModules]} />
        {managers.length > 1 && (
          <Dropdown value={manager} onChange={setManager} options={managers} />
        )}

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
          description="Try adjusting your search or filters to find the project you're looking for, or create a new one."
          action={<Button as={Link} to="/projects/new">Create First Project</Button>}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={(proj) => setProjectToDelete(proj)}
            />
          ))}
        </div>
      ) : (
        <Table columns={['Project', 'Client', 'Industry', 'Platform Scope', 'Modules', 'Health', 'Progress', 'Workshops', 'Actions']}>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <Link to={`/projects/${p.id}`} className="font-semibold text-brand-700 hover:underline">{p.name}</Link>
              </td>
              <td className="px-4 py-3 text-ink-600">{p.client}</td>
              <td className="px-4 py-3 text-ink-600">{p.industry}</td>
              <td className="px-4 py-3 text-ink-600 text-xs">{p.sapProduct}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">{(p.modules || []).map((m) => <Badge key={m} tone="neutral">{m}</Badge>)}</div>
              </td>
              <td className="px-4 py-3">
                <Badge tone={p.health === 'On Track' ? 'success' : p.health === 'Critical' ? 'critical' : 'warning'}>
                  {p.health || 'On Track'}
                </Badge>
              </td>
              <td className="px-4 py-3 w-32"><ProgressBar value={p.progress ?? 0} showLabel /></td>
              <td className="px-4 py-3 data-num text-ink-600">{p.meetingsCount ?? 0}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setProjectToDelete(p)}
                  className="p-1.5 text-ink-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <Modal
          isOpen={Boolean(projectToDelete)}
          onClose={() => setProjectToDelete(null)}
          title="Delete Project Workspace"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-bold">Are you sure you want to delete this project?</p>
                <p className="mt-1 text-xs text-red-700">
                  Project: <strong>"{projectToDelete.name}"</strong> ({projectToDelete.client})
                </p>
                <p className="mt-1 text-xs text-red-600">
                  This will permanently delete the project container, its master requirements matrix, and uploaded blueprints. Linked meeting recordings/transcripts will remain preserved.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
