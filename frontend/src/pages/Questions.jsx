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

const STATUSES = ['All Statuses', 'Open', 'Asked', 'Answered', 'Missed', 'Suggested'];
const PRIORITIES = ['All Priorities', 'Critical', 'High', 'Medium', 'Low'];
const MODULES = ['All Scopes', 'AI & Data', 'MM', 'FI', 'SD', 'PP', 'QM', 'Cross-Module'];

export default function Questions() {
  const { id: projectId } = useParams();
  const [questions, setQuestions] = useState(null);
  const [status, setStatus] = useState('All Statuses');
  const [modFilter, setModFilter] = useState('All Scopes');
  const [priority, setPriority] = useState('All Priorities');
  const [query, setQuery] = useState('');

  useEffect(() => { questionService.list().then(setQuestions); }, []);

  const filtered = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      const qText = q.text || q.question || '';
      const qTopic = q.topic || '';
      const qPriority = q.importance || q.priority || 'High';
      const qStatus = q.status || 'Open';
      const qMod = q.module || 'Cross-Module';

      if (projectId && q.projectId && q.projectId !== projectId) return false;
      if (query && !qText.toLowerCase().includes(query.toLowerCase()) && !qTopic.toLowerCase().includes(query.toLowerCase())) return false;
      if (status !== 'All Statuses' && qStatus.toLowerCase() !== status.toLowerCase()) return false;
      if (modFilter !== 'All Scopes' && qMod.toUpperCase() !== modFilter.toUpperCase()) return false;
      if (priority !== 'All Priorities' && qPriority.toLowerCase() !== priority.toLowerCase()) return false;
      return true;
    });
  }, [questions, status, modFilter, priority, query, projectId]);

  return (
    <div className="space-y-5">
      {!projectId && (
        <PageHeader
          title="Question Intelligence"
          description="Every question your teams have asked, need to ask, or are still tracking answers for across live sessions."
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
        <Dropdown value={modFilter} onChange={setModFilter} options={MODULES} />
        <Dropdown value={priority} onChange={setPriority} options={PRIORITIES} />
      </div>

      {!questions ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CircleHelp} title="No questions match these filters" description="Adjust your filters or generate new questions in meeting preparation." />
      ) : (
        <Table columns={['Question', 'Domain / Scope', 'Topic', 'Meeting Context', 'Priority', 'Status', 'Confidence']}>
          {filtered.map((q, idx) => (
            <tr key={q.id || idx} className="hover:bg-ink-50/60">
              <td className="px-4 py-3 max-w-sm">
                <Link to={`/questions/${q.id}`} className="font-medium text-brand-700 hover:underline">
                  {q.text || q.question}
                </Link>
              </td>
              <td className="px-4 py-3"><Badge tone="neutral">{q.module || 'General'}</Badge></td>
              <td className="px-4 py-3 text-ink-600">{q.topic || 'Core Scope'}</td>
              <td className="px-4 py-3 text-ink-600">{q.meetingName || 'Meeting Workspace'}</td>
              <td className="px-4 py-3">
                <Badge tone={(q.importance === 'Critical' || q.priority === 'Critical') ? 'critical' : 'neutral'}>
                  {q.importance || q.priority || 'High'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={q.status === 'Answered' ? 'positive' : q.status === 'Missed' ? 'critical' : 'brand'}>
                  {q.status || 'Open'}
                </Badge>
              </td>
              <td className="px-4 py-3 data-num text-ink-600">{q.confidence || 92}%</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
