import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { questionService } from '../services/questionService';

export default function QuestionDetail() {
  const { id } = useParams();
  const [q, setQ] = useState(null);

  useEffect(() => { questionService.get(id).then(setQ); }, [id]);

  if (!q) return <SkeletonGrid count={3} />;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge>{q.priority}</Badge>
          <Badge>{q.status}</Badge>
          <Badge tone="neutral">{q.module}</Badge>
        </div>
        <h1 className="text-lg font-semibold leading-snug text-ink-900">{q.question}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
          <div><dt className="text-xs text-ink-400">Owner</dt><dd className="font-medium text-ink-800">{q.owner}</dd></div>
          <div><dt className="text-xs text-ink-400">Project</dt><dd className="font-medium text-ink-800">{q.project}</dd></div>
          <div><dt className="text-xs text-ink-400">Business Process</dt><dd className="font-medium text-ink-800">{q.businessProcess}</dd></div>
          <div><dt className="text-xs text-ink-400">Historical Frequency</dt><dd className="data-num font-medium text-ink-800">{q.historicalFrequency}×</dd></div>
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Question History</h3>
          <div className="space-y-2.5">
            {q.history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{h.meeting}</span>
                <div className="flex gap-1.5">
                  <Badge tone="neutral">{h.outcome}</Badge>
                  <Badge>{h.result}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Answer History</h3>
          <div className="space-y-2.5">
            {q.answerHistory.map((a, i) => (
              <div key={i} className="text-sm">
                <p className="text-xs text-ink-400">{a.date}</p>
                <p className="text-ink-700">{a.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900"><FileText size={15} /> Evidence</h3>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div><dt className="text-xs text-ink-400">Source</dt><dd className="font-medium text-ink-800">{q.evidence.source}</dd></div>
          <div><dt className="text-xs text-ink-400">Transcript</dt><dd className="data-num font-medium text-ink-800">{q.evidence.transcript}</dd></div>
          <div><dt className="text-xs text-ink-400">Speaker</dt><dd className="font-medium text-ink-800">{q.evidence.speaker}</dd></div>
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-ink-900">Related Requirements</h3>
          {q.relatedRequirements.map((r) => <p key={r} className="text-sm text-brand-600">{r}</p>)}
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-ink-900">Related Decisions</h3>
          {q.relatedDecisions.map((d, i) => <p key={i} className="text-sm text-ink-700">{d}</p>)}
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-ink-900">Related Questions</h3>
          {q.relatedQuestions.map((rq) => (
            <Link key={rq} to={`/questions/${rq}`} className="block text-sm text-brand-600 hover:underline">{rq}</Link>
          ))}
        </Card>
      </div>
    </div>
  );
}
