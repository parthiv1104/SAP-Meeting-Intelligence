import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BrainCog } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { knowledgeService } from '../services/knowledgeService';

const CATEGORIES = [
  'All Categories', 'Business Rules', 'Processes', 'Requirements', 'Decisions',
  'Assumptions', 'Risks', 'Issues', 'Client Information', 'SAP Configuration Knowledge', 'Historical Knowledge',
];

export default function Knowledge() {
  const { id: projectId } = useParams();
  const [items, setItems] = useState(null);
  const [category, setCategory] = useState('All Categories');
  const [query, setQuery] = useState('');

  useEffect(() => { knowledgeService.list().then(setItems); }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((k) => {
      if (projectId && k.projectId !== projectId) return false;
      if (category !== 'All Categories' && k.category !== category) return false;
      if (query && !k.title.toLowerCase().includes(query.toLowerCase()) && !k.content.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, category, query, projectId]);

  return (
    <div className="space-y-5">
      {!projectId && (
        <PageHeader
          title="Project Knowledge"
          description="Everything the platform remembers — verified business rules, decisions, risks, and configuration knowledge."
          actions={<Button as={Link} to="/knowledge/timeline" variant="secondary">View Timeline</Button>}
        />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search knowledge..." className="w-full max-w-xs" />
        <Dropdown value={category} onChange={setCategory} options={CATEGORIES} />
        {projectId && <Button as={Link} to="/knowledge/timeline" variant="secondary" size="sm" className="ml-auto">View Timeline</Button>}
      </div>

      {!items ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BrainCog} title="No knowledge recorded yet" description="Knowledge appears here automatically once meetings are analyzed." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((k) => <KnowledgeCard key={k.id} item={k} />)}
        </div>
      )}
    </div>
  );
}
