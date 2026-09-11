import { useState } from 'react';
import { ThumbsUp, SkipForward, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function RecommendedQuestionCard({ item, onAction }) {
  const [status, setStatus] = useState(null);

  const handle = (action) => {
    setStatus(action);
    onAction?.(item, action);
  };

  return (
    <Card className={status ? 'opacity-60' : ''}>
      <div className="mb-2 flex items-center gap-2">
        <Badge>{item.priority} Priority</Badge>
        <Badge tone="neutral">{item.module}</Badge>
        <Badge tone="neutral">{item.topic}</Badge>
        <span className="ml-auto data-num text-xs font-semibold text-brand-600">{item.confidence}% confidence</span>
      </div>

      <p className="text-sm font-medium leading-snug text-ink-900">{item.question}</p>

      <div className="mt-3 rounded-lg bg-ink-50/70 p-3">
        <p className="mb-1.5 text-xs font-semibold text-ink-600">Why this question?</p>
        <ul className="space-y-1">
          {item.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-ink-600">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-ink-400">Source: {item.source}</p>
      </div>

      {status ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success-600">
          <CheckCircle2 size={15} /> Marked as {status}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" icon={ThumbsUp} onClick={() => handle('Asked')}>Ask</Button>
          <Button size="sm" variant="secondary" icon={SkipForward} onClick={() => handle('Skipped')}>Skip</Button>
          <Button size="sm" variant="ghost" icon={CheckCircle2} onClick={() => handle('Already Known')}>Already Known</Button>
          <Button size="sm" variant="ghost" icon={XCircle} onClick={() => handle('Not Relevant')}>Not Relevant</Button>
        </div>
      )}
    </Card>
  );
}
