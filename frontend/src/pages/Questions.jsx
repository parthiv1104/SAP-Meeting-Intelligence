import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleHelp } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { questionService } from '../services/questionService';
import { sapModules } from '../data/mockData';

const STATUSES = ['All Statuses', 'New', 'Suggested', 'Asked', 'Answered', 'Partially Answered', 'Follow-up Required', 'Not Applicable', 'Closed'];
const PRIORITIES = ['All Priorities', 'Critical', 'High', 'Medium', 'Low'];

export default function Questions() {
  const { id: projectId } = useParams();
  const [questions, setQuestions] = useState(null);
  const [status, setStatus] = useState('All Statuses');
  const [modFilter, setModFilter] = useState('All Modules');
  const [priority, setPriority] = useState('All Priorities');
  const [query, setQuery] = useState('');

  useEffect(() => { questionService.list().then(setQuestions); }, []);

  const filtered = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      if (projectId && q.projectId !== projectId) return false;
      if (query && !q.question.toLowerCase().includes(query.toLowerCase())) return false;
      if (status !== 'All Statuses' && q.status !== status) return false;
      if (modFilter !== 'All Modules' && q.module !== modFilter) return false;
      if (priority !== 'All Priorities' && q.priority !== priority) return false;
      return true;
    });
  }, [questions, status, modFilter, priority, query, projectId]);

  return (
    <div className="space-y-5">
      {!projectId && (
        <PageHeader
          title="Question Intelligence"
          description="Every question your teams have asked, need to ask, or are still tracking answers for."
          actions={
            <div className="flex gap-2">
              <Button as={Link} to="/questions/faq" variant="secondary">Frequently Asked</Button>
              <Button as={Link} to="/questions/missed" variant="secondary">Frequently Missed</Button>
            </div>
          }
        />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search questions..." className="w-full max-w-xs" />
        <Dropdown value={status} onChange={setStatus} options={STATUSES} />
        <Dropdown value={modFilter} onChange={setModFilter} options={['All Modules', ...sapModules]} />
        <Dropdown value={priority} onChange={setPriority} options={PRIORITIES} />
      </div>

      {!questions ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CircleHelp} title="No questions match these filters" description="Adjust your filters or check back after the next meeting is analyzed." />
      ) : (
        <Table columns={['Question', 'Module', 'Topic', 'Owner', 'Priority', 'Status', 'Frequency', 'Last Asked']}>
          {filtered.map((q) => (
            <tr key={q.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3 max-w-sm">
                <Link to={`/questions/${q.id}`} className="font-medium text-brand-700 hover:underline">{q.question}</Link>
              </td>
              <td className="px-4 py-3"><Badge tone="neutral">{q.module}</Badge></td>
              <td className="px-4 py-3 text-ink-600">{q.topic}</td>
              <td className="px-4 py-3 text-ink-600">{q.owner}</td>
              <td className="px-4 py-3"><Badge>{q.priority}</Badge></td>
              <td className="px-4 py-3"><Badge>{q.status}</Badge></td>
              <td className="px-4 py-3 data-num text-ink-600">{q.frequency}</td>
              <td className="px-4 py-3 text-ink-600">{q.lastAsked}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
