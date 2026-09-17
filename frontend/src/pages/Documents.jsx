import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, Upload, Trash2, Eye, Download, ExternalLink,
  FileSpreadsheet, FileCode, CheckCircle2, RefreshCw, Loader2,
  Building2, Calendar, Sparkles, Plus, AlertCircle
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { documentService } from '../services/documentService';
import { meetingService } from '../services/meetingService';
import { useToast } from '../hooks/useToast';

const FILE_TYPES = ['All Types', 'PDF', 'Word', 'Excel', 'Text'];

export default function Documents() {
  const { id: projectId } = useParams();
  const [docs, setDocs] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [fileTypeFilter, setFileTypeFilter] = useState('All Types');
  const [meetingFilter, setMeetingFilter] = useState('All Meetings');
  const [query, setQuery] = useState('');
  
  // Modals & Actions
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsData, meetingsData] = await Promise.all([
        documentService.list(),
        meetingService.list()
      ]);
      setDocs(docsData || []);
      setMeetings(meetingsData || []);
      if (meetingsData && meetingsData.length > 0 && !selectedMeetingId) {
        setSelectedMeetingId(meetingsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents data:', err);
      toast?.('Failed to load documents', 'critical');
    }
  };

  const meetingOptions = useMemo(() => {
    const list = ['All Meetings'];
    meetings.forEach((m) => {
      if (m.name && !list.includes(m.name)) {
        list.push(m.name);
      }
    });
    return list;
  }, [meetings]);

  const filtered = useMemo(() => {
    if (!docs) return [];
    return docs.filter((d) => {
      if (fileTypeFilter !== 'All Types' && d.fileType !== fileTypeFilter && d.type !== fileTypeFilter) {
        return false;
      }
      if (meetingFilter !== 'All Meetings' && d.meetingName !== meetingFilter) {
        return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const matchesName = d.name?.toLowerCase().includes(q) || d.filename?.toLowerCase().includes(q);
        const matchesMeeting = d.meetingName?.toLowerCase().includes(q);
        const matchesModule = d.module?.toLowerCase().includes(q);
        if (!matchesName && !matchesMeeting && !matchesModule) return false;
      }
      return true;
    });
  }, [docs, fileTypeFilter, meetingFilter, query]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast?.('Please select a document file to upload.', 'critical');
      return;
    }
    if (!selectedMeetingId) {
      toast?.('Please select a meeting to attach this document to.', 'critical');
      return;
    }

    setUploading(true);
    try {
      toast?.(`Extracting text from ${uploadFile.name}...`, 'info');
      const newDoc = await documentService.upload(selectedMeetingId, uploadFile);
      
      // Refresh list
      const updatedDocs = await documentService.list();
      setDocs(updatedDocs);
      
      toast?.(`Document "${uploadFile.name}" uploaded and indexed successfully!`, 'success');
      setUploadOpen(false);
      setUploadFile(null);
    } catch (err) {
      console.error('Document upload error:', err);
      toast?.(`Upload failed: ${err.message || 'Error parsing document'}`, 'critical');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (meetingId, docId, docName) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}"?`)) return;

    setDeletingId(docId);
    try {
      await documentService.delete(meetingId, docId);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast?.(`Document "${docName}" removed.`, 'info');
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast?.('Failed to delete document', 'critical');
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (fileType, filename = '') => {
    const isPdf = fileType === 'PDF' || filename.endsWith('.pdf');
    const isWord = fileType === 'Word' || filename.endsWith('.docx') || filename.endsWith('.doc');
    const isExcel = fileType === 'Excel' || filename.endsWith('.xlsx') || filename.endsWith('.csv');

    if (isPdf) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 shrink-0">
          <FileText size={18} />
        </div>
      );
    }
    if (isWord) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
          <FileCode size={18} />
        </div>
      );
    }
    if (isExcel) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
          <FileSpreadsheet size={18} />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
        <FileText size={18} />
      </div>
    );
  };

  const totalChars = useMemo(() => {
    if (!docs) return 0;
    return docs.reduce((acc, d) => acc + (d.extractedLength || d.extractedText?.length || 0), 0);
  }, [docs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900">Project &amp; Meeting Documents</h1>
          <p className="mt-1 text-xs text-ink-500">
            Live repository of uploaded BRD, SRS, architecture specs, and meeting notes parsed by OpenAI for discovery question generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={loadData} title="Refresh documents list">
            Refresh
          </Button>
          <Button icon={Upload} onClick={() => setUploadOpen(true)}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-ink-500">Total Documents</p>
            <span className="rounded-md bg-brand-50 p-1.5 text-brand-600">
              <FileText size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{docs ? docs.length : 0}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">Attached across active meetings</p>
        </Card>

        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-ink-500">AI Indexed Text</p>
            <span className="rounded-md bg-purple-50 p-1.5 text-purple-600">
              <Sparkles size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink-900">
            {totalChars > 1000 ? `${(totalChars / 1000).toFixed(1)}k chars` : `${totalChars} chars`}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">Ready for AI question synthesis</p>
        </Card>

        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-ink-500">Linked Meetings</p>
            <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-600">
              <Building2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink-900">
            {docs ? new Set(docs.map((d) => d.meetingId).filter(Boolean)).size : 0}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-400">Isolated workspace contexts</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by document or meeting name..."
            className="w-full sm:max-w-xs"
          />
          <Dropdown
            value={fileTypeFilter}
            onChange={setFileTypeFilter}
            options={FILE_TYPES}
          />
          <Dropdown
            value={meetingFilter}
            onChange={setMeetingFilter}
            options={meetingOptions}
          />
        </div>

        <span className="text-xs font-medium text-ink-500">
          Showing <strong>{filtered.length}</strong> of <strong>{docs?.length || 0}</strong> files
        </span>
      </div>

      {/* Main Documents Table */}
      {!docs ? (
        <SkeletonGrid count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents match your filter"
          description="Upload project specifications, architecture drafts, or select another filter."
          action={
            <Button icon={Upload} onClick={() => setUploadOpen(true)}>
              Upload First Document
            </Button>
          }
        />
      ) : (
        <Table columns={['Document File', 'Associated Meeting', 'Type & Size', 'Upload Date', 'AI Status', 'Actions']}>
          {filtered.map((d) => (
            <tr key={d.id} className="hover:bg-ink-50/70 transition-colors">
              {/* Document File Column */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {getFileIcon(d.fileType, d.filename || d.name)}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink-900 max-w-xs" title={d.filename || d.name}>
                      {d.filename || d.name}
                    </p>
                    <p className="text-[11px] text-ink-400">
                      Uploaded by: <span className="text-ink-600 font-medium">{d.uploadedBy || 'Consultant'}</span>
                    </p>
                  </div>
                </div>
              </td>

              {/* Associated Meeting Column */}
              <td className="px-4 py-3.5">
                {d.meetingId ? (
                  <Link
                    to={`/meetings/${d.meetingId}`}
                    className="group inline-flex flex-col hover:underline"
                  >
                    <span className="text-xs font-semibold text-brand-700 group-hover:text-brand-900 flex items-center gap-1">
                      {d.meetingName || 'Meeting Session'}
                      <ExternalLink size={11} className="opacity-70" />
                    </span>
                    <span className="text-[10px] text-ink-400">
                      Scope: {d.module || 'General'}
                    </span>
                  </Link>
                ) : (
                  <span className="text-xs text-ink-400 italic">General Document</span>
                )}
              </td>

              {/* Type & Size */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Badge tone="neutral">{d.fileType || 'Doc'}</Badge>
                  <span className="text-xs text-ink-500 font-medium">{d.fileSize || d.size || 'Standard'}</span>
                </div>
              </td>

              {/* Upload Date */}
              <td className="px-4 py-3.5 text-xs text-ink-600">
                {d.date || d.uploadDate || 'Recent'}
              </td>

              {/* AI Indexing Status */}
              <td className="px-4 py-3.5">
                {d.extractedText ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> AI Indexed ({d.extractedLength || d.extractedText.length} chars)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                    <AlertCircle size={12} /> Pending Text
                  </span>
                )}
              </td>

              {/* Quick Actions */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Eye}
                    onClick={() => setPreviewDoc(d)}
                    title="Open text preview modal"
                  >
                    Preview Text
                  </Button>

                  {d.fileUrl && (
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 hover:text-brand-600 transition"
                      title="Download or open original file in browser"
                    >
                      <Download size={13} />
                    </a>
                  )}

                  {d.meetingId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(d.meetingId, d.id, d.filename || d.name)}
                      disabled={deletingId === d.id}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700 h-7 px-2"
                      title="Remove document from meeting"
                    >
                      {deletingId === d.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Extracted Text Preview Modal */}
      <Modal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc ? `Document Content: ${previewDoc.filename || previewDoc.name}` : 'Document Preview'}
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-ink-500">
              Meeting: <strong className="text-ink-800">{previewDoc?.meetingName || 'Session'}</strong>
            </div>
            <div className="flex items-center gap-2">
              {previewDoc?.fileUrl && (
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-xs hover:bg-ink-50 transition"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </a>
              )}
              {previewDoc?.meetingId && (
                <Link
                  to={`/meetings/${previewDoc.meetingId}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition"
                >
                  <span>Open Meeting &rarr;</span>
                </Link>
              )}
              <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-2.5 text-xs text-ink-500">
            <span>Type: <strong className="text-ink-800">{previewDoc?.fileType || 'Document'}</strong></span>
            <span>Size: <strong className="text-ink-800">{previewDoc?.fileSize || previewDoc?.size || 'Standard'}</strong></span>
            <span>Chars: <strong className="text-ink-800">{previewDoc?.extractedLength || previewDoc?.extractedText?.length || 0}</strong></span>
            <span>Indexed: <strong className="text-emerald-700">Active in OpenAI Context</strong></span>
          </div>

          <p className="text-xs text-ink-500">
            This clean plain text was extracted upon upload. It is passed into GPT-4o during preparation to generate customized discovery questions referencing specific clauses, numbers, and scope requirements.
          </p>

          <div className="max-h-96 overflow-y-auto rounded-lg border border-ink-200 bg-ink-50 p-4 font-mono text-xs leading-relaxed text-ink-800 whitespace-pre-wrap select-text">
            {previewDoc?.extractedText || 'No text extracted or document is empty.'}
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => !uploading && setUploadOpen(false)}
        title="Upload Scope & Specification Document"
        footer={
          <>
            <Button variant="secondary" disabled={uploading} onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={uploading || !uploadFile || !selectedMeetingId}
              icon={uploading ? Loader2 : Upload}
            >
              {uploading ? 'Extracting & Ingesting...' : 'Upload & Process with AI'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <p className="text-xs text-ink-500">
            Attach a project BRD, SRS, architecture spec, or spreadsheet to a specific meeting. The system will parse the text and formulate tailored discovery questions.
          </p>

          {/* Select Target Meeting */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Select Target Meeting <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              disabled={uploading}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none"
              required
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.title} ({m.module || 'General'}) — {m.date || 'Scheduled'}
                </option>
              ))}
            </select>
          </div>

          {/* File Selector */}
          <div className="rounded-xl border-2 border-dashed border-ink-200 p-6 text-center hover:border-brand-400 transition-colors">
            <Upload className="mx-auto h-10 w-10 text-brand-600" />
            <p className="mt-2 text-sm font-medium text-ink-800">
              {uploadFile ? uploadFile.name : 'Select document file'}
            </p>
            <p className="text-xs text-ink-400">PDF, DOCX, XLSX, CSV, TXT, VTT up to 200MB</p>

            <input
              type="file"
              id="globalDocUploadInput"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.vtt"
              className="hidden"
              disabled={uploading}
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="globalDocUploadInput"
              className="mt-3 inline-block cursor-pointer rounded-lg bg-ink-100 px-3.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200 transition-colors"
            >
              Browse Local Files
            </label>
          </div>

          {uploading && (
            <div className="flex items-center gap-2.5 rounded-lg bg-brand-50 p-3 text-xs font-medium text-brand-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Extracting document text and updating AI preparation cache...</span>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

