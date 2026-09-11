import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { questionService } from '../services/questionService';
import { useToast } from '../hooks/useToast';

export default function MissedQuestions() {
  const [items, setItems] = useState(null);
  const toast = useToast();

  useEffect(() => { questionService.missed().then(setItems); }, []);

  if (!items) return <SkeletonGrid count={3} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Missed Questions"
        description="Questions the platform expected to be discussed but that didn't come up — with the historical pattern behind each one."
      />

      <div className="space-y-4">
        {items.map((mq) => (
          <Card key={mq.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2">
                  <Badge>{mq.priority}</Badge>
                  <Badge tone="neutral">{mq.module}</Badge>
                  <span className="data-num text-xs font-semibold text-brand-600">{mq.confidence}% confidence</span>
                </div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-critical-600">
                  <AlertTriangle size={14} /> Missed Question
                </p>
                <p className="mt-1 text-base font-medium leading-snug text-ink-900">{mq.question}</p>

                <div className="mt-3 rounded-lg bg-ink-50/70 p-3">
                  <p className="mb-1.5 text-xs font-semibold text-ink-600">Why was this detected?</p>
                  <ul className="space-y-1">
                    {mq.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-ink-600">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-critical-400" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="w-full max-w-[200px] shrink-0 rounded-lg border border-ink-100 p-3 text-center">
                <p className="text-xs text-ink-500">Previous {mq.historicalPattern.totalMeetings} Meetings</p>
                <div className="mt-2 flex justify-around">
                  <div>
                    <p className="data-num text-lg font-semibold text-critical-600">{mq.historicalPattern.missed}</p>
                    <p className="text-[11px] text-ink-400">Missed</p>
                  </div>
                  <div>
                    <p className="data-num text-lg font-semibold text-success-600">{mq.historicalPattern.covered}</p>
                    <p className="text-[11px] text-ink-400">Covered</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
              <Button size="sm" onClick={() => toast?.('Added to open questions', 'success')}>Add to Open Questions</Button>
              <Button size="sm" variant="secondary" onClick={() => toast?.('Follow-up scheduled', 'info')}>Schedule Follow-up</Button>
              <Button size="sm" variant="ghost" onClick={() => toast?.('Marked not required', 'info')}>Mark Not Required</Button>
              <Button size="sm" variant="ghost" onClick={() => toast?.('Requirement added', 'success')}>Add Requirement</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
