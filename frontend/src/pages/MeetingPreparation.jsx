import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, PlayCircle, Users, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import RecommendedQuestionCard from '../components/questions/RecommendedQuestionCard';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';
import { useToast } from '../hooks/useToast';

export default function MeetingPreparation() {
  const { id } = useParams();
  const [prep, setPrep] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { meetingService.getPreparation(id).then(setPrep); }, [id]);

  const handleAction = (item, action) => {
    toast?.(`Question marked "${action}"`, action === 'Asked' ? 'success' : 'info');
  };

  if (!prep) return <SkeletonGrid count={4} />;

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{prep.project}</p>
            <h1 className="text-xl font-semibold text-ink-900">{prep.meetingName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-500">
              <span className="flex items-center gap-1"><Clock size={13} /> {prep.date} · {prep.time}</span>
              <Badge tone="neutral">{prep.moduleLabel}</Badge>
            </div>
          </div>
          <Button icon={PlayCircle} onClick={() => navigate(`/meetings/${id}/live`)}>Start Live Session</Button>
        </div>
        <p className="mt-4 rounded-lg bg-ink-50/70 p-3 text-sm text-ink-700">
          <span className="font-semibold text-ink-800">Objective — </span>{prep.objective}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900"><Users size={15} /> Participants</h3>
          <div className="space-y-2">
            {prep.participants.map((p) => (
              <div key={p.name} className="text-sm">
                <p className="font-medium text-ink-800">{p.name}</p>
                <p className="text-xs text-ink-500">{p.role}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Topics</h3>
          <div className="flex flex-wrap gap-1.5">
            {prep.topics.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Preparation Readiness</h3>
          <div className="space-y-2.5">
            {[
              ['Overall', prep.readiness.overall],
              ['Project Knowledge', prep.readiness.projectKnowledge],
              ['Open Requirements', prep.readiness.openRequirements],
              ['Question Coverage', prep.readiness.questionCoverage],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-500">{label}</span>
                  <span className="data-num font-medium text-ink-700">{val}%</span>
                </div>
                <ProgressBar value={val} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Recommended Questions</h3>
        <div className="space-y-3">
          {prep.recommendedQuestions.map((q) => (
            <RecommendedQuestionCard key={q.id} item={q} onAction={handleAction} />
          ))}
        </div>
      </div>

      <Card>
        <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <CheckCircle2 size={15} className="text-success-500" /> Already Covered
        </h3>
        <p className="mb-2 text-xs text-ink-500">These topics have already been confirmed — the platform won't suggest asking about them again.</p>
        <ul className="space-y-1.5">
          {prep.alreadyCovered.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-ink-700">
              <CheckCircle2 size={14} className="text-success-500" /> {c}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
