import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BrainCog, CheckCircle2, AlertTriangle, Layers, FileText,
  RefreshCw, Search, ExternalLink, Sparkles, Building2, User, Info
} from 'lucide-react';
import SearchInput from '../components/ui/SearchInput';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { knowledgeService } from '../services/knowledgeService';
import { useToast } from '../hooks/useToast';

const TABS = [
  { id: 'All', label: 'All Knowledge', icon: BrainCog },
  { id: 'Decisions', label: 'Agreed Decisions', icon: CheckCircle2 },
  { id: 'Requirements', label: 'Requirements', icon: FileText },
  { id: 'Architecture & Scope', label: 'Architecture & Scope', icon: Layers },
  { id: 'Risks & Issues', label: 'Risks & Flags', icon: AlertTriangle },
];

export default function Knowledge() {
  const { id: projectId } = useParams();
  const [items, setItems] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const data = await knowledgeService.list();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load knowledge:', err);
      toast?.('Failed to load knowledge library', 'critical');
    }
  };

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((k) => {
      if (projectId && k.projectId !== projectId) return false;
      
      if (activeTab !== 'All') {
        const cat = k.category?.toLowerCase() || '';
        const target = activeTab.toLowerCase();
        if (target.includes('decision') && !cat.includes('decision')) return false;
        if (target.includes('requirement') && !cat.includes('requirement')) return false;
        if (target.includes('risk') && (!cat.includes('risk') && !cat.includes('issue'))) return false;
        if (target.includes('architecture') && (!cat.includes('architecture') && !cat.includes('scope') && !cat.includes('rule') && !cat.includes('config'))) return false;
      }

      if (query) {
        const q = query.toLowerCase();
        const matchesTitle = k.title?.toLowerCase().includes(q);
        const matchesContent = k.content?.toLowerCase().includes(q);
        const matchesMeeting = k.meetingName?.toLowerCase().includes(q);
        const matchesModule = k.module?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesMeeting && !matchesModule) return false;
      }
      return true;
    });
  }, [items, activeTab, query, projectId]);

  // Statistics
  const stats = useMemo(() => {
    if (!items) return { total: 0, decisions: 0, requirements: 0, risks: 0 };
    return {
      total: items.length,
      decisions: items.filter((i) => i.category?.toLowerCase().includes('decision')).length,
      requirements: items.filter((i) => i.category?.toLowerCase().includes('requirement')).length,
      risks: items.filter((i) => i.category?.toLowerCase().includes('risk') || i.category?.toLowerCase().includes('issue')).length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900">Project Knowledge &amp; Institutional Memory</h1>
          <p className="mt-1 text-xs text-ink-500">
            A centralized memory of confirmed decisions, architecture rules, and newly discovered requirements aggregated across all client meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={loadKnowledge} title="Refresh knowledge base">
            Refresh
          </Button>
          <Button as={Link} to="/knowledge/timeline" variant="secondary">
            View Timeline &rarr;
          </Button>
        </div>
      </div>

      {/* Explainer Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-xs text-brand-900 shadow-xs">
        <div className="rounded-lg bg-brand-100 p-2 text-brand-700 shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold text-brand-950">How Project Knowledge Works</p>
          <p className="text-brand-800">
            Every time a meeting recording or transcript is analyzed, the AI extracts <strong>Decisions Made</strong>, <strong>Newly Discovered Requirements</strong>, and <strong>Architectural Baseline Rules</strong>. They are automatically saved here so consultants and stakeholders always have a single source of truth without re-reading old meeting notes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-ink-500">All Knowledge</p>
            <span className="rounded-md bg-blue-50 p-1.5 text-blue-600">
              <BrainCog size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">Total verified items</p>
        </Card>

        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-emerald-700">Agreed Decisions</p>
            <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-600">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-950">{stats.decisions}</p>
          <p className="mt-0.5 text-[11px] text-emerald-700 font-medium">Finalized in workshops</p>
        </Card>

        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-purple-700">Requirements</p>
            <span className="rounded-md bg-purple-50 p-1.5 text-purple-600">
              <FileText size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-950">{stats.requirements}</p>
          <p className="mt-0.5 text-[11px] text-purple-700 font-medium">New scope deliverables</p>
        </Card>

        <Card className="p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-amber-700">Flagged Risks</p>
            <span className="rounded-md bg-amber-50 p-1.5 text-amber-600">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-950">{stats.risks}</p>
          <p className="mt-0.5 text-[11px] text-amber-700 font-medium">Tracked for mitigation</p>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search decisions, rules, or meetings..."
          className="w-full sm:max-w-xs"
        />
      </div>

      {/* Knowledge Cards Grid */}
      {!items ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BrainCog}
          title="No knowledge items found"
          description="Analyze meeting transcripts or upload recordings to automatically generate verified decisions and architecture knowledge."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k) => (
            <KnowledgeCard key={k.id} item={k} onSelect={setSelectedItem} />
          ))}
        </div>
      )}

      {/* Detailed Knowledge Inspection Modal */}
      <Modal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `${selectedItem.category}: ${selectedItem.title}` : 'Knowledge Item'}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-ink-500">
              Verified by: <strong className="text-ink-800">{selectedItem?.verifiedBy || 'Project Lead'}</strong>
            </span>
            <div className="flex items-center gap-2">
              {selectedItem?.meetingId && (
                <Link
                  to={`/meetings/${selectedItem.meetingId}/analysis`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition"
                >
                  <span>View Meeting Analysis &rarr;</span>
                </Link>
              )}
              <Button variant="secondary" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-2.5 text-xs text-ink-500">
            <span className="font-semibold text-brand-700">{selectedItem?.category}</span>
            <span>Status: <strong className="text-emerald-700">{selectedItem?.status || 'Agreed'}</strong></span>
            <span>Confidence: <strong className="text-ink-800">{selectedItem?.confidence || 95}%</strong></span>
            <span>Date: <strong className="text-ink-800">{selectedItem?.lastUpdated || 'Recent'}</strong></span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink-900">{selectedItem?.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-ink-700 bg-ink-50 p-3.5 rounded-lg border border-ink-200">
              {selectedItem?.content}
            </p>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-3 text-xs text-brand-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <Building2 size={13} /> Originating Context
            </p>
            <p>
              Meeting Session: <strong>{selectedItem?.meetingName || 'Enterprise Blueprint'}</strong>
            </p>
            <p>
              Functional Scope: <strong>{selectedItem?.module || 'General'}</strong> ({selectedItem?.industry || 'General'})
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

