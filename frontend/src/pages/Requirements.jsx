import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { requirementService } from '../services/requirementService';
import { sapModules } from '../data/mockData';

const STATUSES = ['All Statuses', 'New', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected'];

export default function Requirements() {
  const { id: projectId } = useParams();
  const [reqs, setReqs] = useState(null);
  const [status, setStatus] = useState('All Statuses');
  const [module, setModule] = useState('All Modules');
  const [query, setQuery] = useState('');

  useEffect(() => { requirementService.list().then(setReqs); }, []);

  const filtered = useMemo(() => {
    if (!reqs) return [];
    return reqs.filter((r) => {
      if (projectId && r.projectId !== projectId) return false;
      if (status !== 'All Statuses' && r.status !== status) return false;
      if (module !== 'All Modules' && r.module !== module) return false;
      if (query && !r.text.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [reqs, status, module, query, projectId]);

  return (
    <div className="space-y-5">
      {!projectId && (
        <PageHeader title="Requirements" description="Requirements discovered from meetings, documents, and client discussions." />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search requirements..." className="w-full max-w-xs" />
        <Dropdown value={status} onChange={setStatus} options={STATUSES} />
        <Dropdown value={module} onChange={setModule} options={['All Modules', ...sapModules]} />
      </div>

      {!reqs ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No requirements found" description="Requirements will appear here as meetings are analyzed." />
      ) : (
        <Table columns={['ID', 'Requirement', 'Module', 'Business Process', 'Priority', 'Status', 'Source Meeting', 'Owner']}>
          {filtered.map((r) => (
            <tr key={r.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3 font-medium text-brand-700">{r.id}</td>
              <td className="px-4 py-3 max-w-sm text-ink-800">{r.text}</td>
              <td className="px-4 py-3"><Badge tone="neutral">{r.module}</Badge></td>
              <td className="px-4 py-3 text-ink-600">{r.businessProcess}</td>
              <td className="px-4 py-3"><Badge>{r.priority}</Badge></td>
              <td className="px-4 py-3"><Badge>{r.status}</Badge></td>
              <td className="px-4 py-3 text-ink-600">{r.sourceMeeting}</td>
              <td className="px-4 py-3 text-ink-600">{r.owner}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
