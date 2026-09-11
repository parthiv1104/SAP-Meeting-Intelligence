import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radio, CheckCircle2, SkipForward, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';

export default function MeetingLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [queueIdx, setQueueIdx] = useState(0);
  const [phase, setPhase] = useState('question'); // question | processing
  const [stats, setStats] = useState(null);

  useEffect(() => {
    meetingService.getLiveState(id).then((s) => {
      setState(s);
      setStats({ coverage: s?.coverage, asked: s?.questionsAsked, answered: s?.questionsAnswered, open: s?.questionsOpen });
    });
  }, [id]);

  if (!state) return <SkeletonGrid count={3} />;

  const current = state.queue[queueIdx];

  const markAsked = () => {
    setPhase('processing');
    setTimeout(() => {
      setStats((s) => ({
        coverage: Math.min(100, s.coverage + 6),
        asked: s.asked + 1,
        answered: s.answered + 1,
        open: s.open,
      }));
      setQueueIdx((i) => Math.min(i + 1, state.queue.length - 1));
      setPhase('question');
    }, 1400);
  };

  const skip = () => {
    setQueueIdx((i) => Math.min(i + 1, state.queue.length - 1));
  };

  const finished = queueIdx >= state.queue.length - 1 && phase === 'question' && !current;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-ink-500">Current Topic</p>
            <h2 className="text-lg font-semibold text-ink-900">{state.currentTopic}</h2>
          </div>
          <Badge tone="critical" className="animate-pulse">
            <Radio size={11} /> {state.status}
          </Badge>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-600">Next Best Question</p>
        {phase === 'processing' ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={28} className="text-success-500" />
            <p className="text-sm font-medium text-ink-800">Question marked as asked</p>
            <p className="flex items-center gap-1.5 text-xs text-ink-500">
              <Loader2 size={13} className="animate-spin" /> Processing response...
            </p>
          </div>
        ) : current ? (
          <div className="space-y-4">
            <p className="text-base font-medium leading-snug text-ink-900">{current.question}</p>
            <div className="flex items-center gap-3 text-xs text-ink-500">
              <span className="data-num font-semibold text-brand-600">Confidence: {current.confidence}%</span>
              <span>·</span>
              <span>Reason: {current.reason}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={markAsked} icon={CheckCircle2}>Asked</Button>
              <Button variant="secondary" onClick={skip} icon={SkipForward}>Skip</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <CheckCircle2 size={28} className="mx-auto mb-2 text-success-500" />
            <p className="text-sm font-medium text-ink-800">All recommended questions covered</p>
            <Button className="mt-4" onClick={() => navigate(`/meetings/${id}/analysis`)}>Finish &amp; Analyze Meeting</Button>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Current Meeting Coverage</h3>
          <span className="data-num text-sm font-semibold text-ink-800">{stats.coverage}%</span>
        </div>
        <ProgressBar value={stats.coverage} />
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
          <div><p className="data-num text-lg font-semibold text-ink-900">{stats.asked}</p><p className="text-xs text-ink-500">Asked</p></div>
          <div><p className="data-num text-lg font-semibold text-success-600">{stats.answered}</p><p className="text-xs text-ink-500">Answered</p></div>
          <div><p className="data-num text-lg font-semibold text-warning-600">{stats.open}</p><p className="text-xs text-ink-500">Open</p></div>
        </div>
      </Card>
    </div>
  );
}
