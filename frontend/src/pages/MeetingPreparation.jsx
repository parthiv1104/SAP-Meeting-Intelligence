import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, BarChart3, Users, Clock, Sparkles, RefreshCw, ArrowLeft, AlertCircle, ShieldAlert, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import RecommendedQuestionCard from '../components/questions/RecommendedQuestionCard';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';
import { useToast } from '../hooks/useToast';

import { getMeetingDomain } from '../utils/domainUtils';

export default function MeetingPreparation() {
  const { id } = useParams();
  const [prep, setPrep] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    meetingService.get(id).then(setMeeting);
    loadPreparation();
  }, [id]);

  const loadPreparation = (force = false) => {
    meetingService.getPreparation(id, force ? { refresh: 'true' } : {}).then((data) => {
      setPrep(data);
    });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      toast?.('Generating tailored domain questions with AI...', 'info');
      const res = await meetingService.regeneratePreparation(id, {
        module: meeting?.module || 'Cross-Module',
        industry: meeting?.industry || 'General',
        topic: meeting?.topic || meeting?.name,
      });
      if (res && res.recommendedQuestions && res.recommendedQuestions.length > 0) {
        setPrep(res);
        toast?.('New questions generated dynamically by OpenAI!', 'success');
      } else {
        loadPreparation(true);
        toast?.('Preparation updated!', 'success');
      }
    } catch (err) {
      console.error('Regenerate error:', err);
      toast?.(`Generated with fallback: ${err.message || 'Updated'}`, 'info');
      loadPreparation(true);
    } finally {
      setRegenerating(false);
    }
  };

  const handleAction = (item, action) => {
    toast?.(`Question marked "${action}"`, action === 'Asked' ? 'success' : 'info');
  };

  if (!prep) return <SkeletonGrid count={4} />;

  const domainInfo = getMeetingDomain(meeting || { name: prep.meetingName, module: prep.moduleLabel });
  const questions = prep.recommendedQuestions || [];
  const readiness = prep.readiness || { overall: 90, projectKnowledge: 92, openRequirements: 86, questionCoverage: 88 };
  const participants = prep.participants || (meeting?.attendees?.length ? meeting.attendees.map(a => ({ name: a, role: 'Participant' })) : [
    { name: domainInfo.roleConsultant, role: domainInfo.isSap ? 'Lead Architect (VC ERP)' : 'Solutions Architect' },
    { name: 'Domain Stakeholder', role: domainInfo.roleClient }
  ]);
  const topics = prep.topics || domainInfo.defaultTopics;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to={`/meetings/${id}`} className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
            <ArrowLeft size={12} /> Back to Meeting Overview
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{prep.project || meeting?.name}</p>
            {domainInfo.badges.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-xs text-ink-300">•</span>
                <Badge tone={b.tone === 'brand' ? 'brand' : 'neutral'}>{b.label}</Badge>
              </span>
            ))}
          </div>
          <h1 className="mt-0.5 text-xl font-bold text-ink-900">{prep.meetingName || meeting?.name} — Pre-Meeting Preparation</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span className="flex items-center gap-1"><Clock size={12} /> {prep.date || meeting?.date} · {prep.time || meeting?.time || 'Scheduled'}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {participants.length} participants</span>
          </div>

          {prep.attachedDocuments && prep.attachedDocuments.length > 0 && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800">
              <Sparkles size={13} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Augmented by {prep.attachedDocuments.length} Attached Document{prep.attachedDocuments.length === 1 ? '' : 's'}:</strong>{' '}
                <span className="font-medium text-emerald-900">{prep.attachedDocuments.join(', ')}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            disabled={regenerating}
            onClick={handleRegenerate}
            title="Query OpenAI to generate fresh questions customized for this meeting topic & domain"
          >
            {regenerating ? 'Generating with OpenAI...' : 'Regenerate Questions with AI'}
          </Button>
          <Button icon={BarChart3} onClick={() => navigate(`/meetings/${id}/analysis`)}>
            Post-Meeting Analysis
          </Button>
        </div>
      </div>

      <Card className="bg-brand-50/30 border-brand-100">
        <p className="text-xs font-semibold text-brand-800 uppercase tracking-wide">Workshop Strategic Objective</p>
        <p className="mt-1 text-sm font-medium text-ink-800 leading-relaxed">
          {prep.objective || `Review key requirements, architecture, and operational alignment for '${meeting?.name || 'this session'}'.`}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900"><Users size={15} /> Key Participants</h3>
          <div className="space-y-2.5">
            {participants.map((p, idx) => (
              <div key={idx} className="text-sm">
                <p className="font-semibold text-ink-900">{p.name}</p>
                <p className="text-xs text-ink-500">{p.role}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900"><BookOpen size={15} /> Focus Topics</h3>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Preparation Readiness Score</h3>
          <div className="space-y-2.5">
            {[
              ['Overall Readiness', readiness.overall || 91],
              ['Project Knowledge', readiness.projectKnowledge || 94],
              ['Open Requirements Covered', readiness.openRequirements || 88],
              ['Question Coverage', readiness.questionCoverage || 86],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-500">{label}</span>
                  <span className="data-num font-semibold text-brand-700">{val}%</span>
                </div>
                <ProgressBar value={val} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
              <Sparkles size={18} className="text-brand-600" />
              AI Recommended Must-Ask Questions ({questions.length})
            </h3>
            <p className="text-xs text-ink-500">Tailored specifically for {prep.meetingName || meeting?.name || 'this session'}</p>
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((q) => (
            <RecommendedQuestionCard key={q.id || q.question} item={q} onAction={handleAction} />
          ))}
        </div>
      </div>

      {(prep.alreadyCovered && prep.alreadyCovered.length > 0) && (
        <Card className="border border-success-200 bg-success-50/20">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-success-900">
            <CheckCircle2 size={16} className="text-success-600" /> Already Covered &amp; Verified in Project Knowledge
          </h3>
          <p className="mb-3 text-xs text-ink-500">
            These decisions were confirmed in earlier sessions — the system will not suggest asking them again.
          </p>
          <ul className="space-y-1.5">
            {prep.alreadyCovered.map((c, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-ink-800">
                <CheckCircle2 size={14} className="text-success-600 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
