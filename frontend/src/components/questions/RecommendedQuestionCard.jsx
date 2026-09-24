import { useState } from 'react';
import { ThumbsUp, SkipForward, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function RecommendedQuestionCard({ item, onAction, onSkip, isSkipping = false }) {
  const [status, setStatus] = useState(null);

  const handleAsk = () => {
    setStatus('Asked');
    onAction?.(item, 'Asked');
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip(item);
    } else {
      onAction?.(item, 'Skipped');
    }
  };

  return (
    <Card className={`transition-all duration-300 ${status === 'Asked' ? 'opacity-75 bg-emerald-50/20 border-emerald-200' : ''} ${isSkipping ? 'opacity-50 animate-pulse border-brand-300' : ''}`}>
      <div className="mb-2 flex items-center gap-2">
        <Badge>{item.priority || 'High'} Priority</Badge>
        <Badge tone="neutral">{item.module || 'General'}</Badge>
        {item.topic && <Badge tone="neutral">{item.topic}</Badge>}
        <span className="ml-auto data-num text-xs font-semibold text-brand-600">{item.confidence || 90}% confidence</span>
      </div>

      <p className="text-sm font-medium leading-snug text-ink-900">{item.question}</p>

      {item.reasons && item.reasons.length > 0 && (
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
          {item.source && <p className="mt-2 text-[11px] text-ink-400">Source: {item.source}</p>}
        </div>
      )}

      {status === 'Asked' ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 w-fit">
          <CheckCircle2 size={14} className="text-emerald-600" /> Marked to Ask in Meeting
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" icon={ThumbsUp} onClick={handleAsk}>
            Ask
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={SkipForward}
            loading={isSkipping}
            onClick={handleSkip}
            title="Skip this question and generate a fresh replacement question with AI"
          >
            {isSkipping ? 'Replacing with AI...' : 'Skip'}
          </Button>
        </div>
      )}
    </Card>
  );
}

