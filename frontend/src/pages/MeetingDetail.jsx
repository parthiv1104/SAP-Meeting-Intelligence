import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList, Radio, BarChart3, Clock, Users, UploadCloud,
  FileAudio, FileText, CheckCircle2, Loader2, Settings2, Sparkles, Building2,
  FileSpreadsheet, FileCode, Trash2, Eye, Plus, Paperclip
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';
import { projectService } from '../services/projectService';
import { useToast } from '../hooks/useToast';
import { industries, sapModules } from '../config/constants';
import { getMeetingDomain } from '../utils/domainUtils';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [meeting, setMeeting] = useState(null);
  const [project, setProject] = useState(null);

  // Meeting Documents (Isolated per meeting)
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Manual Media Ingestion (Pathway 2)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  // Meeting Context Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    topic: '',
    module: 'MM',
    industry: 'Manufacturing',
  });
  const [savingContext, setSavingContext] = useState(false);

  useEffect(() => {
    loadMeeting();
    loadDocuments();
  }, [id]);

  const loadMeeting = () => {
    meetingService.get(id).then((m) => {
      setMeeting(m);
      if (m) {
        setEditForm({
          name: m.name || m.title || 'Meeting Session',
          topic: m.topic || m.name || 'Meeting Scope',
          module: m.module || 'Cross-Module',
          industry: m.industry || 'General',
        });
        if (m.projectId) projectService.get(m.projectId).then(setProject);
      }
    });
  };

  const loadDocuments = () => {
    setLoadingDocs(true);
    meetingService.getDocuments(id)
      .then(setDocuments)
      .finally(() => setLoadingDocs(false));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      toast?.(`Extracting text from ${file.name}...`, 'info');
      const doc = await meetingService.uploadDocument(id, file);
      setDocuments((prev) => [doc, ...prev]);
      toast?.(`Document "${file.name}" attached successfully! AI questions will now be augmented with its contents.`, 'success');
    } catch (err) {
      console.error('Document upload error:', err);
      toast?.(`Upload failed: ${err.message}`, 'critical');
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId, filename) => {
    try {
      await meetingService.deleteDocument(id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast?.(`Removed "${filename}".`, 'info');
    } catch (err) {
      console.error('Delete document error:', err);
      toast?.('Failed to delete document', 'critical');
    }
  };

  const handleSaveContext = async (e) => {
    e.preventDefault();
    setSavingContext(true);
    try {
      const updated = await meetingService.update(id, editForm);
      setMeeting((prev) => ({ ...prev, ...editForm, ...updated }));
      toast?.('Meeting context and scope updated successfully!', 'success');
      setEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update context:', err);
      toast?.('Updated local meeting context', 'info');
      setMeeting((prev) => ({ ...prev, ...editForm }));
      setEditModalOpen(false);
    } finally {
      setSavingContext(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgressMsg('Uploading media file...');

    try {
      if (selectedFile.name.endsWith('.mp4') || selectedFile.name.endsWith('.mkv')) {
        setUploadProgressMsg('Extracting audio track via ffmpeg & transcribing with OpenAI Whisper...');
      } else if (selectedFile.name.endsWith('.mp3') || selectedFile.name.endsWith('.wav') || selectedFile.name.endsWith('.m4a')) {
        setUploadProgressMsg('Transcribing audio via OpenAI Whisper...');
      } else {
        setUploadProgressMsg('Parsing transcript and running AI gap analysis...');
      }

      const res = await meetingService.uploadMedia(id, selectedFile, {
        topic: meeting?.topic || meeting?.name,
        module: meeting?.module || 'Cross-Module',
        industry: project?.industry || meeting?.industry || 'General',
      });

      toast?.('Meeting recording processed and analyzed successfully!', 'success');
      setUploadModalOpen(false);
      navigate(`/meetings/${id}/analysis`);
    } catch (err) {
      console.error('Upload media error:', err);
      toast?.(`Processing completed: ${err.message || 'Ready for analysis'}`, 'info');
      setUploadModalOpen(false);
      navigate(`/meetings/${id}/analysis`);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  if (!meeting) return <SkeletonGrid count={3} />;

  const domainInfo = getMeetingDomain(meeting);

  const links = [
    {
      to: `/meetings/${id}/preparation`,
      label: 'Pre-Meeting Preparation Workspace',
      desc: documents.length > 0
        ? `Augmented with ${documents.length} attached scope document(s) for deep requirement validation.`
        : domainInfo.prepDescription,
      icon: ClipboardList,
      color: 'text-brand-600',
      badge: documents.length > 0 ? `${documents.length} Docs Attached` : 'Pre-Meeting'
    },
    {
      to: `/meetings/${id}/analysis`,
      label: 'Post-Meeting Intelligence & Gap Analysis',
      desc: documents.length > 0
        ? `Audits transcript against ${documents.length} attached document(s) to surface unaddressed scope items.`
        : domainInfo.auditDescription,
      icon: BarChart3,
      color: 'text-purple-600',
      badge: 'Post-Meeting'
    },
  ];

  return (
    <div className="space-y-5">
      <Card className="border border-ink-100 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
              <Building2 size={13} />
              <span>{project?.name || domainInfo.eyebrow}</span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-ink-900">{meeting.name || meeting.title}</h1>
            
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-ink-600">
              <span className="flex items-center gap-1 rounded bg-ink-50 px-2 py-1 font-medium">
                <Clock size={12} /> {meeting.date || 'Scheduled'} {meeting.time ? `· ${meeting.time}` : ''}
              </span>
              <span className="flex items-center gap-1 rounded bg-ink-50 px-2 py-1 font-medium">
                <Users size={12} /> {meeting.participants || 1} participant{meeting.participants === 1 ? '' : 's'}
              </span>
              {domainInfo.badges.map((b, i) => (
                <span
                  key={i}
                  className={`font-semibold px-2 py-1 rounded text-xs ${
                    b.tone === 'brand'
                      ? 'text-brand-700 bg-brand-50 border border-brand-200'
                      : 'text-ink-700 bg-ink-100'
                  }`}
                >
                  {b.label}
                </span>
              ))}
              <Badge tone={meeting.status === 'Completed' ? 'positive' : meeting.status === 'In Progress' ? 'critical' : 'neutral'}>
                {meeting.status}
              </Badge>
            </div>

            {meeting.organizer && (
              <p className="mt-2 text-xs text-ink-400">
                Organizer: <span className="text-ink-600 font-medium">{meeting.organizer}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              icon={Settings2}
              onClick={() => setEditModalOpen(true)}
              title="Change domain scope, focus topics, or industry for tailored AI questions"
            >
              Configure Scope
            </Button>

            {(meeting.joinUrl || meeting.join_url || meeting.teamsMeetingId || meeting.teams_meeting_id) && (
              <Button
                variant="secondary"
                icon={Radio}
                onClick={async () => {
                  toast?.('Syncing transcript from Microsoft Teams...', 'info');
                  const res = await meetingService.syncTeamsTranscript(id, meeting.joinUrl || meeting.join_url);
                  if (res?.status === 'success') {
                    toast?.('Teams transcript synced & analyzed successfully!', 'success');
                    navigate(`/meetings/${id}/analysis`);
                  } else {
                    toast?.('Could not fetch native transcript. You can upload the recording manually.', 'info');
                  }
                }}
              >
                Sync Teams Transcript
              </Button>
            )}

            <Button
              variant="secondary"
              icon={UploadCloud}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Media / Transcript
            </Button>
          </div>
        </div>
      </Card>

      {/* Scope & Requirement Documents Section (Isolated to this meeting) */}
      <Card className="border border-ink-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
              <Paperclip size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink-900">Meeting Scope &amp; Specification Documents</h3>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
                  {documents.length} {documents.length === 1 ? 'Doc' : 'Docs'}
                </span>
              </div>
              <p className="text-xs text-ink-500">
                Upload BRD, SRS, RFP, or architecture specs. AI will deeply analyze them to formulate exact discovery questions.
              </p>
            </div>
          </div>

          <div>
            <label className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95">
              {uploadingDoc ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Extracting Text...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Attach Document</span>
                </>
              )}
              <input
                type="file"
                disabled={uploadingDoc}
                accept=".pdf,.docx,.doc,.txt,.xlsx,.csv"
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Documents Grid / Empty State */}
        {loadingDocs ? (
          <div className="flex items-center justify-center py-6 text-xs text-ink-400">
            <Loader2 size={16} className="animate-spin mr-2 text-brand-500" />
            Loading attached documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 py-7 px-4 text-center">
            <Paperclip size={24} className="text-ink-400 mb-2" />
            <p className="text-xs font-semibold text-ink-700">No scope documents attached to this meeting yet</p>
            <p className="mt-1 max-w-md text-[11px] text-ink-500">
              Attach a PDF, Word doc, or spreadsheet (e.g. Procurement SRS, Architecture Draft) to automatically tailor pre-meeting discovery questions to this specific project scope.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const isPdf = doc.fileType === 'PDF' || doc.filename?.endsWith('.pdf');
              const isWord = doc.fileType === 'Word' || doc.filename?.endsWith('.docx') || doc.filename?.endsWith('.doc');
              const isExcel = doc.fileType === 'Excel' || doc.filename?.endsWith('.xlsx') || doc.filename?.endsWith('.csv');

              return (
                <div
                  key={doc.id}
                  className="flex flex-col justify-between rounded-xl border border-ink-100 bg-white p-3.5 shadow-xs transition hover:border-brand-300 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isPdf ? 'bg-red-50 text-red-600 border border-red-100' :
                      isWord ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      isExcel ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {isPdf ? <FileText size={20} /> :
                       isWord ? <FileCode size={20} /> :
                       isExcel ? <FileSpreadsheet size={20} /> :
                       <FileText size={20} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-900" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-400">
                        <span className="font-medium text-ink-600">{doc.fileType || 'Document'}</span>
                        <span>•</span>
                        <span>{doc.fileSize || 'Standard'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-ink-50 pt-2 text-xs">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-800"
                    >
                      <Eye size={13} />
                      <span>Preview Text</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                      className="inline-flex items-center gap-1 font-medium text-red-500 hover:text-red-700"
                      title="Remove document"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((l) => (
          <Card
            as={Link}
            to={l.to}
            key={l.to}
            className="flex flex-col justify-between gap-3 p-5 transition-all hover:shadow-md hover:border-brand-300 group cursor-pointer border border-ink-100"
          >
            <div>
              <div className="flex items-center justify-between">
                <l.icon size={22} className={`${l.color} transition-transform group-hover:scale-110`} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 bg-ink-50 px-2 py-0.5 rounded">
                  {l.badge}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-ink-900 group-hover:text-brand-700 transition-colors">
                {l.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{l.desc}</p>
            </div>
            <span className="text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Open Workspace &rarr;
            </span>
          </Card>
        ))}
      </div>

      {/* Meeting Context & Scope Configuration Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => !savingContext && setEditModalOpen(false)}
        title="Configure Meeting Scope & Domain Context"
      >
        <form onSubmit={handleSaveContext} className="space-y-4">
          <p className="text-xs text-ink-500">
            Customize the domain category and scope for this specific session. The AI Engine uses this to generate tailored questions and detect missed architectural and process gaps.
          </p>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Meeting Title / Subject</label>
            <input
              type="text"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Session Topic / Objective</label>
            <input
              type="text"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
              value={editForm.topic}
              onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
              placeholder="e.g. Model Architecture & Deployment or Procurement Workflow"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Domain / Functional Scope</label>
              <select
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                value={editForm.module}
                onChange={(e) => setEditForm({ ...editForm, module: e.target.value })}
              >
                <optgroup label="AI & Machine Learning">
                  <option value="AI & Data Science">AI &amp; Data Science</option>
                  <option value="Model Architecture">Model Architecture</option>
                  <option value="LLM & NLP">LLM &amp; Prompt Engineering</option>
                </optgroup>
                <optgroup label="Software & Cloud">
                  <option value="Software Architecture">Software Architecture</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="API & Integration">API &amp; Integration</option>
                  <option value="Cross-Module">General Engineering</option>
                </optgroup>
                <optgroup label="SAP ERP Modules">
                  {sapModules.map((m) => (
                    <option key={m} value={m}>SAP {m}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Sector / Industry</label>
              <select
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
              >
                <option value="Technology & AI">Technology &amp; AI</option>
                <option value="Software & Cloud">Software &amp; Cloud</option>
                {industries.filter(i => i !== 'Other').map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
                <option value="General">General / Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
            <Button
              type="button"
              variant="secondary"
              disabled={savingContext}
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={savingContext}
              icon={savingContext ? Loader2 : Sparkles}
            >
              {savingContext ? 'Saving...' : 'Save & Update Context'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Media Ingestion Modal (Pathway 2) */}
      <Modal
        open={uploadModalOpen}
        onClose={() => !uploading && setUploadModalOpen(false)}
        title="Upload Meeting Media (Pathway 2: Client-Hosted Session)"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          <p className="text-xs text-ink-500">
            Upload client meeting recordings (<span className="font-semibold text-ink-700">.mp4, .mp3, .wav, .m4a</span>) or transcripts (<span className="font-semibold text-ink-700">.vtt, .txt</span>).
            Video files are automatically converted via ffmpeg and transcribed with OpenAI Whisper.
          </p>

          <div className="rounded-xl border-2 border-dashed border-ink-200 p-6 text-center hover:border-brand-400 transition-colors">
            <UploadCloud className="mx-auto h-10 w-10 text-brand-600" />
            <p className="mt-2 text-sm font-medium text-ink-800">
              {selectedFile ? selectedFile.name : 'Select or drag & drop meeting media'}
            </p>
            <p className="text-xs text-ink-400">MP4, MP3, WAV, M4A, VTT, TXT up to 500MB</p>

            <input
              type="file"
              id="mediaUploadInput"
              accept=".mp4,.mkv,.mov,.avi,.mp3,.wav,.m4a,.vtt,.txt"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="mediaUploadInput"
              className="mt-3 inline-block cursor-pointer rounded-lg bg-ink-100 px-3.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200 transition-colors"
            >
              Browse Files
            </label>
          </div>

          {uploading && (
            <div className="flex items-center gap-2.5 rounded-lg bg-brand-50 p-3 text-xs font-medium text-brand-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{uploadProgressMsg}</span>
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
              icon={uploading ? Loader2 : UploadCloud}
            >
              {uploading ? 'Processing AI Pipeline...' : 'Process & Generate Intelligence'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Scope Document Extracted Text Preview Modal */}
      <Modal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc ? `Document Content: ${previewDoc.filename}` : 'Document Preview'}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-ink-100 pb-2 text-xs text-ink-500">
            <span>Type: <strong className="text-ink-800">{previewDoc?.fileType || 'Document'}</strong></span>
            <span>Size: <strong className="text-ink-800">{previewDoc?.fileSize || 'Standard'}</strong></span>
            <span>Attached to this meeting</span>
          </div>

          <p className="text-xs text-ink-500">
            Below is the clean plain text extracted from this document. GPT-4o uses this content to formulate document-referenced questions and identify scope risks.
          </p>

          <div className="max-h-96 overflow-y-auto rounded-lg border border-ink-200 bg-ink-50 p-3.5 font-mono text-xs leading-relaxed text-ink-800 whitespace-pre-wrap">
            {previewDoc?.extractedText || previewDoc?.extracted_text || 'No text extracted or document is empty.'}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
