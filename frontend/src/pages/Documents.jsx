import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Upload, File } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { documentService } from '../services/documentService';
import { useToast } from '../hooks/useToast';

const CATEGORIES = ['All Categories', 'BRD', 'SRS', 'Process Documents', 'Meeting Documents', 'SAP Documents', 'Supporting Files'];

export default function Documents() {
  const { id: projectId } = useParams();
  const [docs, setDocs] = useState(null);
  const [category, setCategory] = useState('All Categories');
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const toast = useToast();

  useEffect(() => { documentService.list().then(setDocs); }, []);

  const filtered = useMemo(() => {
    if (!docs) return [];
    return docs.filter((d) => {
      if (projectId && d.projectId !== projectId) return false;
      if (category !== 'All Categories' && d.type !== category) return false;
      if (query && !d.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [docs, category, query, projectId]);

  const handleUpload = () => {
    setUploadOpen(false);
    toast?.('Document uploaded — processing started', 'success');
  };

  return (
    <div className="space-y-5">
      {!projectId && (
        <PageHeader
          title="Documents"
          description="Source material the platform reads to build project knowledge — BRDs, SRS, process docs, and more."
          actions={<Button icon={Upload} onClick={() => setUploadOpen(true)}>Upload Document</Button>}
        />
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search documents..." className="w-full max-w-xs" />
        <Dropdown value={category} onChange={setCategory} options={CATEGORIES} />
        {projectId && <Button size="sm" icon={Upload} className="ml-auto" onClick={() => setUploadOpen(true)}>Upload</Button>}
      </div>

      {!docs ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No documents uploaded yet" description="Upload a BRD, SRS, or meeting recording to start building project knowledge." />
      ) : (
        <Table columns={['File', 'Type', 'Uploaded By', 'Date', 'Processing', 'Knowledge Extraction']}>
          {filtered.map((d) => (
            <tr key={d.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <span className="flex items-center gap-2 font-medium text-ink-800">
                  <File size={14} className="text-ink-400" /> {d.name}
                </span>
              </td>
              <td className="px-4 py-3"><Badge tone="neutral">{d.type}</Badge></td>
              <td className="px-4 py-3 text-ink-600">{d.uploadedBy}</td>
              <td className="px-4 py-3 text-ink-600">{d.date}</td>
              <td className="px-4 py-3"><Badge>{d.processingStatus}</Badge></td>
              <td className="px-4 py-3"><Badge>{d.extractionStatus}</Badge></td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-10 text-center">
          <Upload size={22} className="text-ink-400" />
          <p className="text-sm font-medium text-ink-700">Drag and drop a file, or click to browse</p>
          <p className="text-xs text-ink-400">Supports .docx, .pdf, .xlsx, .mp4 up to 200MB</p>
        </div>
      </Modal>
    </div>
  );
}
