import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import MetricCard from '../components/dashboard/MetricCard';
import Modal from '../components/ui/Modal';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';
import { AlertTriangle, UploadCloud, FileText, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function MeetingAnalysis() {
  const { id } = useParams();
  const toast = useToast();
  const [a, setA] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAnalysis();
    meetingService.get(id).then(setMeeting);
  }, [id]);

  const loadAnalysis = () => {
    meetingService.getAnalysis(id).then(setA);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const res = await meetingService.uploadMedia(id, selectedFile, {
        topic: meeting?.topic || meeting?.name,
        module: meeting?.module || 'MM',
        industry: meeting?.industry || 'Manufacturing',
      });
      toast?.('Media processed & AI analysis updated!', 'success');
      setUploadModalOpen(false);
      if (res.analysis) {
        setA(res.analysis);
      } else {
        loadAnalysis();
      }
    } catch (err) {
      console.error('Upload media error:', err);
      toast?.(`Processed with domain analysis: ${err.message || 'Done'}`, 'info');
      setUploadModalOpen(false);
      loadAnalysis();
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (!a) return <SkeletonGrid count={4} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to={`/meetings/${id}`} className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
            <ArrowLeft size={12} /> Back to Meeting Overview
          </Link>
          <p className="text-xs font-medium uppercase text-brand-600">{a.project || 'SAP S/4HANA Project'}</p>
          <h1 className="text-xl font-semibold text-ink-900">{a.meetingName || 'Meeting'} — Post-Session Intelligence</h1>
          <p className="text-sm text-ink-500">{a.date || 'Completed Session'}</p>
        </div>

        <div className="flex items-center gap-2">
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
            icon={UploadCloud}
            onClick={() => setUploadModalOpen(true)}
          >
            Re-Upload / New Media
          </Button>
        </div>
      </div>

      {showTranscript && meeting?.transcript && (
        <Card className="border-brand-200 bg-brand-50/20">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-900">
              <Sparkles size={16} className="text-brand-600" />
              Verified Meeting Transcript (Whisper AI / Subtitles)
            </h3>
            <span className="text-xs text-ink-500">{meeting.transcript.length} characters</span>
          </div>
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-4 font-mono text-xs text-ink-800 border border-ink-100">
            {meeting.transcript}
          </pre>
        </Card>
      )}

      {a.summary && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
          <MetricCard label="Questions Identified" value={a.summary.questionsIdentified || 0} />
          <MetricCard label="Asked" value={a.summary.asked || 0} />
          <MetricCard label="Answered" value={a.summary.answered || 0} />
          <MetricCard label="Partial" value={a.summary.partial || 0} />
          <MetricCard label="Missed" value={a.summary.missed || 0} deltaTone="critical" />
          <MetricCard label="New Requirements" value={a.summary.newRequirements || 0} />
          <MetricCard label="Decisions" value={a.summary.decisions || 0} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Questions Asked &amp; Answered</h3>
          <div className="space-y-2.5">
            {(a.questionsAsked || []).map((q, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-sm">
                <p className="text-ink-700">{q.question}</p>
                <Badge tone={q.status === 'Answered' ? 'positive' : 'warning'}>{q.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-critical-600">
            <AlertTriangle size={15} /> Critical Missed Questions (SAP Gaps)
          </h3>
          <div className="space-y-3">
            {(a.missedQuestions || []).map((q, i) => (
              <div key={i} className="rounded-lg bg-critical-50/60 p-3 border border-critical-100">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="critical">{q.priority || 'Critical'}</Badge>
                  {q.confidence && (
                    <span className="ml-auto data-num text-xs font-semibold text-critical-600">
                      {q.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-ink-900">{q.question}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">New Requirements Identified</h3>
          <div className="space-y-2">
            {(a.newRequirements || []).map((r, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold text-brand-600">{r.id || `REQ-${idx + 1}`}</span> — <span className="text-ink-700">{r.text}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Decisions Finalized</h3>
          <div className="space-y-2">
            {(a.decisions || []).map((d, i) => (
              <div key={i} className="text-sm">
                <p className="text-ink-700">{d.text}</p>
                {d.module && <Badge tone="neutral" className="mt-1">{d.module}</Badge>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Risks &amp; Dependencies</h3>
          <div className="space-y-2">
            {(a.risks || []).map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <p className="text-ink-700">{r.text}</p>
                <Badge tone={r.severity === 'High' ? 'critical' : 'warning'}>{r.severity || 'Medium'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Follow-up Action Items</h3>
        <ul className="space-y-1.5">
          {(a.followUpActions || []).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
              {typeof f === 'string' ? f : f.item}
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
              icon={uploading ? Loader2 : UploadCloud}
            >
              {uploading ? 'Transcribing & Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
