import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GitCommit } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { decisionService } from '../services/decisionService';
import { sapModules } from '../data/mockData';

export default function Decisions() {
  const { id: projectId } = useParams();
  const [decisions, setDecisions] = useState(null);
  const [module, setModule] = useState('All Modules');
  const [query, setQuery] = useState('');

  useEffect(() => { decisionService.list().then(setDecisions); }, []);

  const filtered = useMemo(() => {
    if (!decisions) return [];
    return decisions.filter((d) => {
      if (projectId && d.projectId !== projectId) return false;
      if (module !== 'All Modules' && d.module !== module) return false;
      if (query && !d.text.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [decisions, module, query, projectId]);

  return (
    <div className="space-y-5">
      {!projectId && (
        <PageHeader title="Decisions" description="Every decision recorded from project meetings, with the reasoning trail behind it." />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search decisions..." className="w-full max-w-xs" />
        <Dropdown value={module} onChange={setModule} options={['All Modules', ...sapModules]} />
      </div>

      {!decisions ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={GitCommit} title="No decisions recorded yet" description="Decisions will appear here once meetings are analyzed and outcomes confirmed." />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <Card key={d.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-600">{d.id}</span>
                    <Badge tone="neutral">{d.module}</Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug text-ink-900">{d.text}</p>
                </div>
                <p className="whitespace-nowrap text-xs text-ink-400">{d.date}</p>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2 border-t border-ink-100 pt-3 text-xs sm:grid-cols-3">
                <div><dt className="text-ink-400">Source</dt><dd className="font-medium text-ink-700">{d.source}</dd></div>
                <div><dt className="text-ink-400">Approved By</dt><dd className="font-medium text-ink-700">{d.approvedBy}</dd></div>
                <div><dt className="text-ink-400">Related Requirement</dt><dd className="font-medium text-brand-600">{d.relatedRequirement}</dd></div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
