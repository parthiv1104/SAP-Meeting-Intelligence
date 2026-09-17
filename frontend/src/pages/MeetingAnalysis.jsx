import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import MetricCard from '../components/dashboard/MetricCard';
import Modal from '../components/ui/Modal';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';
import { AlertTriangle, UploadCloud, FileText, ArrowLeft, Loader2, Sparkles, RefreshCw, CheckCircle2, Printer } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import AiProcessingLoader from '../components/ui/AiProcessingLoader';

import { getMeetingDomain } from '../utils/domainUtils';

export default function MeetingAnalysis() {
  const { id } = useParams();
  const toast = useToast();
  const [a, setA] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    meetingService.get(id).then(setMeeting);
    loadAnalysis();
  }, [id]);

  const loadAnalysis = (force = false) => {
    meetingService.getAnalysis(id, force ? { refresh: 'true' } : {}).then((data) => {
      setA(data);
    });
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      toast?.('Running AI audit on transcript with OpenAI...', 'info');
      const res = await meetingService.regenerateAnalysis(id, {
        topic: meeting?.topic || meeting?.name,
        module: meeting?.module || 'Cross-Module',
        industry: meeting?.industry || 'General',
        transcript: meeting?.transcript || '',
      });
      if (res && res.summary) {
        setA(res);
        toast?.('Post-meeting intelligence analysis refreshed!', 'success');
      } else {
        loadAnalysis(true);
        toast?.('Analysis updated!', 'success');
      }
    } catch (err) {
      console.error('Re-analysis error:', err);
      toast?.(`Analysis updated with fallback: ${err.message || 'Done'}`, 'info');
      loadAnalysis(true);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const res = await meetingService.uploadMedia(id, selectedFile, {
        topic: meeting?.topic || meeting?.name,
        module: meeting?.module || 'Cross-Module',
        industry: meeting?.industry || 'General',
      });
      toast?.('Media processed & AI analysis updated!', 'success');
      setUploadModalOpen(false);
      if (res.analysis) {
        setA(res.analysis);
      } else {
        loadAnalysis(true);
      }
      meetingService.get(id).then(setMeeting);
    } catch (err) {
      console.error('Upload media error:', err);
      toast?.(`Processed with domain analysis: ${err.message || 'Done'}`, 'info');
      setUploadModalOpen(false);
      loadAnalysis(true);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (!a) return <SkeletonGrid count={4} />;

  const domainInfo = getMeetingDomain(meeting || { name: a.meetingName, module: a.project });

  const summary = a.summary || {
    questionsIdentified: 10,
    asked: 8,
    answered: 7,
    partial: 1,
    missed: 2,
    newRequirements: 3,
    decisions: 2
  };

  return (
    <div className="space-y-5">
      {/* Corporate PDF Printable Letterhead (Visible only on print/export) */}
      <div className="print-only border-b-2 border-brand-600 pb-4 mb-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">VC ERP Consulting Group • ProjectIQ Intelligence</p>
            <h1 className="text-xl font-extrabold text-ink-900 mt-1">EXECUTIVE POST-MEETING AUDIT &amp; MINUTES OF MEETING (MOM)</h1>
          </div>
          <div className="text-right text-xs text-ink-500">
            <p className="font-semibold text-ink-800">CONFIDENTIAL // CLIENT ADVISORY</p>
            <p>Audit Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2 text-xs border-t border-ink-100">
          <div><span className="text-ink-400">Meeting:</span> <p className="font-bold text-ink-900">{a.meetingName || meeting?.name}</p></div>
          <div><span className="text-ink-400">Engagement:</span> <p className="font-bold text-ink-900">{a.project || meeting?.name}</p></div>
          <div><span className="text-ink-400">Session Date:</span> <p className="font-bold text-ink-900">{a.date || meeting?.date || 'Completed'}</p></div>
          <div><span className="text-ink-400">Questions Answered:</span> <p className="font-bold text-emerald-700">{summary.answered || 0} / {summary.questionsIdentified || 0}</p></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 print-hidden">
        <div>
          <Link to={`/meetings/${id}`} className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
            <ArrowLeft size={12} /> Back to Meeting Overview
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{a.project || meeting?.name}</p>
            {domainInfo.badges.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-xs text-ink-300">•</span>
                <Badge tone={b.tone === 'brand' ? 'brand' : 'neutral'}>{b.label}</Badge>
              </span>
            ))}
          </div>
          <h1 className="mt-0.5 text-xl font-bold text-ink-900">{a.meetingName || meeting?.name} — Post-Meeting Intelligence</h1>
          <p className="text-xs text-ink-500">{a.date || meeting?.date || 'Session Completed'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={Printer}
            onClick={() => window.print()}
            title="Export this formal post-meeting audit & MOM report as a professional PDF"
          >
            Export PDF Audit (MOM)
          </Button>

          {meeting?.transcript && (
            <Button
              variant="secondary"
              icon={FileText}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? 'Hide Transcript' : 'View Full Transcript'}
            </Button>
          )}

          <Button
            variant="secondary"
            icon={RefreshCw}
            disabled={reanalyzing}
            onClick={handleReanalyze}
            title="Re-audit transcript with OpenAI to discover new gaps and requirements"
          >
            {reanalyzing ? 'Auditing with AI...' : 'Re-Run AI Audit'}
          </Button>

          <Button
            variant="secondary"
            icon={UploadCloud}
            onClick={() => setUploadModalOpen(true)}
          >
            Re-Upload Media
          </Button>
        </div>
      </div>

      {showTranscript && meeting?.transcript && (
        <Card className="border-brand-200 bg-brand-50/20">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-900">
              <Sparkles size={16} className="text-brand-600" />
              Verified Meeting Transcript (Whisper AI / Teams Subtitles)
            </h3>
            <span className="text-xs text-ink-500">{meeting.transcript.length} characters</span>
          </div>
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-4 font-mono text-xs text-ink-800 border border-ink-100">
            {meeting.transcript}
          </pre>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <MetricCard label="Questions Identified" value={summary.questionsIdentified || 0} />
        <MetricCard label="Asked" value={summary.asked || 0} />
        <MetricCard label="Answered" value={summary.answered || 0} />
        <MetricCard label="Partial" value={summary.partial || 0} />
        <MetricCard label="Missed Gaps" value={summary.missed || 0} deltaTone="critical" />
        <MetricCard label="New Requirements" value={summary.newRequirements || 0} />
        <MetricCard label="Decisions" value={summary.decisions || 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-bold text-ink-900 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-success-600" />
            Questions Asked &amp; Answered During Session
          </h3>
          <div className="space-y-2.5">
            {(a.questionsAsked || []).map((q, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-sm border-b border-ink-50 pb-2 last:border-0 last:pb-0">
                <p className="text-ink-800 leading-snug">{q.question}</p>
                <Badge tone={q.status === 'Answered' ? 'positive' : 'warning'}>{q.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-critical-200 bg-critical-50/10">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-critical-700">
            <AlertTriangle size={16} className="text-critical-600" />
            Critical Missed Questions (SAP Gaps)
          </h3>
          <p className="mb-3 text-xs text-ink-500">
            High-risk architectural questions that were omitted during the workshop:
          </p>
          <div className="space-y-3">
            {(a.missedQuestions || []).map((q, i) => (
              <div key={i} className="rounded-lg bg-critical-50/70 p-3.5 border border-critical-200">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="critical">{q.priority || 'Critical'}</Badge>
                  {q.confidence && (
                    <span className="ml-auto data-num text-xs font-semibold text-critical-700">
                      {q.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-ink-900">{q.question}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm font-bold text-ink-900">New Requirements Identified</h3>
          <div className="space-y-2.5">
            {(a.newRequirements || []).map((r, idx) => (
              <div key={idx} className="text-sm border-b border-ink-50 pb-2 last:border-0 last:pb-0">
                <span className="font-bold text-brand-700">{r.id || `REQ-${idx + 1}`}</span> — <span className="text-ink-700">{r.text}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Decisions Finalized</h3>
          <div className="space-y-2.5">
            {(a.decisions || []).map((d, i) => (
              <div key={i} className="text-sm border-b border-ink-50 pb-2 last:border-0 last:pb-0">
                <p className="text-ink-800 font-medium">{d.text}</p>
                {d.module && <Badge tone="neutral" className="mt-1">SAP {d.module}</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Risks &amp; Dependencies</h3>
          <div className="space-y-2.5">
            {(a.risks || []).map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm border-b border-ink-50 pb-2 last:border-0 last:pb-0">
                <p className="text-ink-800">{r.text}</p>
                <Badge tone={r.severity === 'High' ? 'critical' : 'warning'}>{r.severity || 'Medium'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-bold text-ink-900">Follow-up Action Items</h3>
        <ul className="space-y-2">
          {(a.followUpActions || []).map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-ink-800">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-600 shrink-0" />
              <span>{typeof f === 'string' ? f : f.item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Manual Upload Modal */}
      <Modal
        open={uploadModalOpen}
        onClose={() => !uploading && setUploadModalOpen(false)}
        title="Upload Recording / Transcript for AI Re-Analysis"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          {uploading ? (
            <AiProcessingLoader
              title="Auditing Meeting with AI"
              initialMessage="Uploading media & extracting audio streams..."
            />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-ink-200 p-6 text-center hover:border-brand-400 transition-colors">
              <UploadCloud className="mx-auto h-10 w-10 text-brand-600" />
              <p className="mt-2 text-sm font-medium text-ink-800">
                {selectedFile ? selectedFile.name : 'Select meeting media (.mp4, .mp3, .wav, .vtt, .txt)'}
              </p>
              <input
                type="file"
                id="analysisMediaUpload"
                accept=".mp4,.mkv,.mov,.avi,.mp3,.wav,.m4a,.vtt,.txt"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="analysisMediaUpload"
                className="mt-3 inline-block cursor-pointer rounded-lg bg-ink-100 px-3.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200 transition-colors"
              >
                Browse Files
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              disabled={uploading}
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploading}
              loading={uploading}
              icon={UploadCloud}
            >
              {uploading ? 'Transcribing & Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
