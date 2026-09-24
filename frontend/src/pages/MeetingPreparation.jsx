import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, BarChart3, Users, Clock, Sparkles, RefreshCw,
  ArrowLeft, AlertCircle, ShieldAlert, BookOpen, Printer, Building2, FileText
} from 'lucide-react';
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
  const [skippingId, setSkippingId] = useState(null);
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
        erp_system: meeting?.erp_system || meeting?.erpSystem || 'SAP S/4HANA (Private / On-Premise)',
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

  const handleSkipQuestion = async (item) => {
    const qKey = item.id || item.question;
    setSkippingId(qKey);
    toast?.('Generating replacement question with AI...', 'info');

    try {
      const existingQs = (prep?.recommendedQuestions || []).map((q) => q.question);
      const res = await meetingService.skipQuestion(id, {
        skipped_id: item.id || '',
        skipped_question: item.question || '',
        existing_questions: existingQs,
      });

      if (res && res.newQuestion) {
        setPrep((prev) => {
          if (!prev) return prev;
          const currentList = prev.recommendedQuestions || [];
          const updated = currentList.map((q) =>
            (q.id && item.id && q.id === item.id) || q.question === item.question ? res.newQuestion : q
          );
          return { ...prev, recommendedQuestions: updated };
        });
        toast?.('Question replaced with a new AI discovery question!', 'success');
      } else if (res && Array.isArray(res.recommendedQuestions)) {
        setPrep((prev) => ({ ...prev, recommendedQuestions: res.recommendedQuestions }));
        toast?.('Question replaced successfully!', 'success');
      } else {
        loadPreparation(true);
      }
    } catch (err) {
      console.error('Skip question error:', err);
      toast?.(`Could not replace question: ${err.message || 'Error occurred'}`, 'error');
    } finally {
      setSkippingId(null);
    }
  };

  const handleAction = (item, action) => {
    toast?.(`Question marked "${action}"`, action === 'Asked' ? 'success' : 'info');
  };

  if (!prep) return <SkeletonGrid count={4} />;

  const domainInfo = getMeetingDomain(meeting || { name: prep.meetingName, module: prep.moduleLabel });
  const readinessScore = prep.readinessScore || prep.readiness?.overall || meeting?.preparation_score || (questions.length > 0 ? 90 : 70);
  const readiness = prep.readiness || {
    overall: readinessScore,
    projectKnowledge: Math.min(100, readinessScore + 2),
    openRequirements: Math.max(60, readinessScore - 4),
    questionCoverage: readinessScore
  };
  const participants = (prep.participants && prep.participants.length > 0)
    ? prep.participants
    : (meeting?.attendees && meeting.attendees.length > 0
        ? meeting.attendees.map((a) => ({ name: typeof a === 'string' ? a : (a.name || a.displayName || a.emailAddress?.name || 'Participant') }))
        : (meeting?.organizer ? [{ name: meeting.organizer }] : []));

  // Enforce MAXIMUM 5 Focus Topics
  const topics = (prep.topics || domainInfo.defaultTopics || []).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Corporate PDF Printable Letterhead (Visible only on print/export) */}
      <div className="print-only border-b-2 border-brand-600 pb-4 mb-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">VC ERP Consulting Group • ProjectIQ Intelligence</p>
            <h1 className="text-xl font-extrabold text-ink-900 mt-1">EXECUTIVE PRE-MEETING PREPARATION BRIEF</h1>
          </div>
          <div className="text-right text-xs text-ink-500">
            <p className="font-semibold text-ink-800">CONFIDENTIAL // CLIENT ADVISORY</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 text-xs border-t border-ink-100">
          <div><span className="text-ink-400">Meeting Title:</span> <p className="font-bold text-ink-900">{prep.meetingName || meeting?.name}</p></div>
          <div><span className="text-ink-400">Engagement:</span> <p className="font-bold text-ink-900">{prep.project || 'Client Transformation'}</p></div>
          <div><span className="text-ink-400">Scope Domain:</span> <p className="font-bold text-ink-900">{prep.moduleLabel || meeting?.module || 'General'}</p></div>
          <div><span className="text-ink-400">Readiness Score:</span> <p className="font-bold text-emerald-700">{readiness.overall || 92}% Index</p></div>
        </div>
      </div>

      {/* Screen Header & Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print-hidden">
        <div>
          <Link
            to={`/meetings/${id}`}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition-all duration-200 hover:border-brand-400 hover:bg-brand-50/80 hover:text-brand-700 hover:shadow group"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-ink-100 text-ink-600 transition-colors duration-200 group-hover:bg-brand-100 group-hover:text-brand-700">
              <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            </div>
            <span>Back to Meeting Overview</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{prep.project || meeting?.name}</p>
            {domainInfo.badges.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-xs text-ink-300">•</span>
                <Badge tone={b.tone === 'brand' ? 'brand' : 'neutral'}>{b.label}</Badge>
              </span>
            ))}
            {(meeting?.erp_system || meeting?.erpSystem) && (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-ink-300">•</span>
                <span className="font-semibold px-2 py-0.5 rounded text-xs text-indigo-800 bg-indigo-50 border border-indigo-200">
                  {meeting.erp_system || meeting.erpSystem}
                </span>
              </span>
            )}
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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={Printer}
            onClick={() => window.print()}
            title="Export this executive briefing as a formal PDF document"
          >
            Export PDF Brief
          </Button>

          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={regenerating}
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
                <p className="font-semibold text-ink-900">{typeof p === 'string' ? p : p.name}</p>
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
          {questions.map((q) => {
            const qKey = q.id || q.question;
            return (
              <RecommendedQuestionCard
                key={qKey}
                item={q}
                onAction={handleAction}
                onSkip={handleSkipQuestion}
                isSkipping={skippingId === qKey}
              />
            );
          })}
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
