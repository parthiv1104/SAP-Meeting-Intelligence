import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban, CalendarClock, CheckCircle2, AlertTriangle, FileText,
  Users, Plus, Trash2, ArrowUpRight, Upload, Sparkles, Building2,
  Layers, Search, Filter, ShieldCheck, ChevronRight
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Table from '../components/ui/Table';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';
import { projectService } from '../services/projectService';
import { meetingService } from '../services/meetingService';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('meetings'); // 'meetings' | 'requirements' | 'decisions' | 'team' | 'documents'
  
  // Modals
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [allMeetings, setAllMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', role: '', email: '' });

  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Requirements filter
  const [reqSearch, setReqSearch] = useState('');
  const [reqModuleFilter, setReqModuleFilter] = useState('All');

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.get(id);
      setProject(data);
    } catch (err) {
      addToast(err.message || 'Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleOpenAddMeeting = async () => {
    try {
      const meetings = await meetingService.list();
      // Filter out meetings already in this project
      const unassigned = meetings.filter((m) => m.projectId !== id && m.project !== id);
      setAllMeetings(unassigned);
      if (unassigned.length > 0) {
        setSelectedMeetingId(unassigned[0].id);
      }
      setIsAddMeetingModalOpen(true);
    } catch (err) {
      addToast('Failed to load meetings', 'error');
    }
  };

  const handleAddMeetingSubmit = async () => {
    if (!selectedMeetingId) return;
    try {
      await projectService.addMeeting(id, selectedMeetingId);
      addToast('Meeting linked to project successfully', 'success');
      setIsAddMeetingModalOpen(false);
      loadProject();
    } catch (err) {
      addToast(err.message || 'Failed to link meeting', 'error');
    }
  };

  const handleRemoveMeeting = async (meetingId) => {
    try {
      await projectService.removeMeeting(id, meetingId);
      addToast('Meeting unlinked from project', 'success');
      loadProject();
    } catch (err) {
      addToast(err.message || 'Failed to unlink meeting', 'error');
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;
    try {
      await projectService.addTeamMember(id, memberForm);
      addToast(`Added ${memberForm.name} to project team`, 'success');
      setIsAddMemberModalOpen(false);
      setMemberForm({ name: '', role: '', email: '' });
      loadProject();
    } catch (err) {
      addToast(err.message || 'Failed to add team member', 'error');
    }
  };

  const handleRemoveMember = async (member) => {
    try {
      await projectService.removeTeamMember(id, { email: member.email, name: member.name });
      addToast(`Removed ${member.name} from project team`, 'success');
      loadProject();
    } catch (err) {
      addToast(err.message || 'Failed to remove team member', 'error');
    }
  };

  const handleUploadDocSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      await projectService.uploadDocument(id, uploadFile);
      addToast(`Uploaded and extracted ${uploadFile.name}`, 'success');
      setIsUploadDocModalOpen(false);
      setUploadFile(null);
      loadProject();
    } catch (err) {
      addToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      await projectService.delete(id);
      addToast(`Project "${project.name}" deleted successfully`, 'success');
      navigate('/projects');
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await projectService.deleteDocument(id, docId);
      addToast('Document deleted', 'success');
      loadProject();
    } catch (err) {
      addToast(err.message || 'Failed to delete document', 'error');
    }
  };

  const teamMembersList = useMemo(() => {
    if (!project) return [];
    const list = Array.isArray(project.team) ? [...project.team] : [];
    if (project.projectManager && !list.some(m => (m.name || '').toLowerCase() === project.projectManager.toLowerCase())) {
      list.unshift({
        id: 'pm-lead',
        name: project.projectManager,
        role: 'Lead Project Manager',
        email: '',
        isManager: true,
      });
    }
    return list;
  }, [project]);

  const filteredRequirements = useMemo(() => {
    if (!project?.cumulativeRequirements) return [];
    return project.cumulativeRequirements.filter((r) => {
      const text = (r.requirement || r.text || '').toLowerCase();
      const matchesSearch = !reqSearch || text.includes(reqSearch.toLowerCase()) || (r.id && r.id.toLowerCase().includes(reqSearch.toLowerCase()));
      const matchesMod = reqModuleFilter === 'All' || r.module === reqModuleFilter;
      return matchesSearch && matchesMod;
    });
  }, [project, reqSearch, reqModuleFilter]);

  if (loading || !project) {
    return (
      <div className="space-y-6">
        <SkeletonGrid count={3} />
      </div>
    );
  }

  const meetings = project.meetings || [];
  const requirements = project.cumulativeRequirements || [];
  const decisions = project.cumulativeDecisions || [];
  const documents = project.documents || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                {project.industry || 'Manufacturing'}
              </span>
              <span className="text-xs text-ink-300">•</span>
              <span className="text-xs font-semibold text-ink-600">{project.client}</span>
              <Badge tone={project.status === 'Completed' ? 'success' : project.status === 'Planning' ? 'neutral' : 'brand'}>
                {project.status}
              </Badge>
              <Badge tone={project.health === 'On Track' ? 'success' : project.health === 'Critical' ? 'critical' : 'warning'}>
                {project.health || 'On Track'} ({project.healthScore ?? 0} Health Score)
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{project.name}</h1>
            <p className="text-sm text-ink-500 font-medium">
              Architecture: <span className="font-semibold text-brand-700">{project.sapProduct}</span>
            </p>
          </div>


          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" onClick={() => setIsUploadDocModalOpen(true)}>
              <Upload size={15} className="mr-1.5" /> Upload Scope Spec
            </Button>
            <Button onClick={handleOpenAddMeeting}>
              <Plus size={15} className="mr-1.5" /> Link / Add Workshop
            </Button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 size={14} /> Delete Project
            </button>
          </div>
        </div>


        {/* Project KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-ink-100">
          <div>
            <span className="text-xs font-semibold uppercase text-ink-400">Total Workshops</span>
            <p className="text-2xl font-bold text-ink-900 data-num mt-1">{meetings.length}</p>
            <span className="text-xs text-ink-500 font-medium">{project.analyzedMeetingsCount ?? 0} analyzed</span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-ink-400">Master REQs Logged</span>
            <p className="text-2xl font-bold text-brand-700 data-num mt-1">{requirements.length}</p>
            <span className="text-xs text-ink-500 font-medium">across all sessions</span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-ink-400">Decisions Finalized</span>
            <p className="text-2xl font-bold text-emerald-600 data-num mt-1">{decisions.length}</p>
            <span className="text-xs text-ink-500 font-medium">institutional memory</span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-ink-400">Knowledge Coverage</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-ink-900 data-num">{project.knowledgeCoverage ?? 0}%</span>
              <span className="text-xs text-success-600 font-semibold">verified</span>
            </div>
            <ProgressBar value={project.knowledgeCoverage ?? 0} className="mt-1.5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-ink-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'meetings'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <CalendarClock size={16} />
          <span>Workshops &amp; Meetings</span>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{meetings.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'requirements'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Master Traceability Matrix</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 font-bold">{requirements.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'decisions'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Confirmed Decisions</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 font-bold">{decisions.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'team'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <Users size={16} />
          <span>Functional Team</span>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{teamMembersList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'documents'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-ink-500 hover:text-ink-800'
          }`}
        >
          <FileText size={16} />
          <span>Project Specs &amp; Blueprints</span>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{documents.length}</span>
        </button>
      </div>

      {/* Tab 1: Workshops / Meetings */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink-900">Project Workshop Sessions</h3>
              <p className="text-xs text-ink-500">Every workshop session inherits prior decisions and builds continuous requirements.</p>
            </div>
            <Button size="sm" onClick={handleOpenAddMeeting}>
              <Plus size={14} className="mr-1" /> Link Workshop
            </Button>
          </div>

          {meetings.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No workshop meetings linked to this project"
              description="Link existing calendar sessions or create a new workshop to start gathering cumulative project intelligence."
              action={<Button onClick={handleOpenAddMeeting}>Link First Workshop</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {meetings.map((m, idx) => {
                const isAnalyzed = m.analysisStatus === 'Analyzed' || (m.post_meeting_analysis && Object.keys(m.post_meeting_analysis).length > 0);
                const hasPrep = m.pre_meeting_preparation && Object.keys(m.pre_meeting_preparation).length > 0;

                return (
                  <Card key={m.id} className="p-4 transition-all hover:border-brand-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            Session {idx + 1}
                          </span>
                          <Badge tone="neutral">{m.module || 'Cross-Module'}</Badge>
                          <span className="text-xs text-ink-400">{m.date || 'Scheduled'} {m.time ? `• ${m.time}` : ''}</span>
                        </div>
                        <h4 className="font-bold text-ink-900 truncate text-base">{m.name}</h4>
                        <p className="text-xs text-ink-500 truncate">{m.topic || 'SAP Requirement Workshop'}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isAnalyzed ? (
                          <Badge tone="success" className="gap-1">
                            <CheckCircle2 size={12} /> Post-Analysis Complete
                          </Badge>
                        ) : (
                          <Badge tone="warning">Analysis Pending</Badge>
                        )}

                        <Button as={Link} to={`/meetings/${m.id}/preparation`} variant="secondary" size="sm">
                          Pre-Prep
                        </Button>

                        <Button as={Link} to={`/meetings/${m.id}/analysis`} variant="primary" size="sm">
                          View MOM &amp; Analysis
                        </Button>

                        <button
                          onClick={() => handleRemoveMeeting(m.id)}
                          title="Unlink from this project"
                          className="p-1.5 text-ink-400 hover:text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Master Requirements Matrix */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink-900">Master Traceability &amp; Requirements Matrix</h3>
              <p className="text-xs text-ink-500">Synthesized and deduplicated continuously across all workshop transcripts.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-ink-200 focus:border-brand-500 focus:outline-none w-56"
                />
              </div>

              <select
                value={reqModuleFilter}
                onChange={(e) => setReqModuleFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg border border-ink-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="All">All Modules</option>
                {['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'BTP'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredRequirements.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No requirements logged yet"
              description="Conducting and analyzing workshop sessions will automatically populate confirmed client requirements into this master matrix."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
              <Table columns={['REQ ID', 'Module', 'Requirement Specification', 'Priority', 'Status', 'Originating Workshop']}>
                {filteredRequirements.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-700 whitespace-nowrap">
                      {r.id || `REQ-${String(i + 1).padStart(3, '0')}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone="neutral" className="text-[11px] font-semibold">{r.module || 'General'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-900 font-medium">
                      {r.requirement || r.text}
                      {r.impact && (
                        <p className="text-xs text-ink-500 mt-0.5">Impact: {r.impact}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone={r.priority === 'High' ? 'critical' : r.priority === 'Medium' ? 'warning' : 'neutral'}>
                        {r.priority || 'High'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge tone="success">{r.status || 'Confirmed'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500 whitespace-nowrap">
                      {r.source_meeting_name || 'Workshop Session'}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Confirmed Decisions */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink-900">Confirmed Architectural &amp; Process Decisions</h3>
              <p className="text-xs text-ink-500">Living knowledge repository preventing repetitive debates across future meetings.</p>
            </div>
          </div>

          {decisions.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No architectural decisions recorded yet"
              description="Finalized decisions captured in workshop transcripts automatically update this cross-meeting institutional memory."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {decisions.map((d, i) => (
                <Card key={d.id || i} className="p-4 border-l-4 border-l-emerald-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {d.id || `DEC-${String(i + 1).padStart(3, '0')}`}
                    </span>
                    <Badge tone="neutral">{d.module || 'Architecture'}</Badge>
                  </div>

                  <h4 className="font-bold text-ink-900 text-sm">{d.decision || d.text}</h4>
                  {d.impact && (
                    <p className="text-xs text-ink-600 bg-ink-50 p-2 rounded">
                      <span className="font-semibold text-ink-800">Architectural Impact:</span> {d.impact}
                    </p>
                  )}
                  <p className="text-[11px] text-ink-400 font-medium">
                    Finalized in: {d.source_meeting_name || 'Workshop Session'}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Functional Team */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink-900">Functional &amp; Technical Leads</h3>
              <p className="text-xs text-ink-500">Consultants assigned to this client project for workshop moderation and MOM reviews.</p>
            </div>
            <Button size="sm" onClick={() => setIsAddMemberModalOpen(true)}>
              <Plus size={14} className="mr-1" /> Add Consultant
            </Button>
          </div>

          {teamMembersList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No consultants assigned to this project"
              description="Assign functional leads, architects, and project managers to moderate workshops and track scope."
              action={<Button onClick={() => setIsAddMemberModalOpen(true)}>Add First Consultant</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teamMembersList.map((member) => (
                <Card key={member.id || member.email} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink-900 text-sm">{member.name}</h4>
                        <p className="text-xs text-brand-700 font-semibold">{member.role}</p>
                      </div>
                    </div>
                    {!member.isManager && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="text-ink-400 hover:text-red-600 p-1"
                        title="Remove from team"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  {member.email && (
                    <p className="text-xs text-ink-500 truncate font-mono bg-ink-50 p-1.5 rounded">{member.email}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Tab 5: Project Documents & Blueprints */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink-900">Project Specifications &amp; Blueprints</h3>
              <p className="text-xs text-ink-500">
                Shared documents uploaded here are automatically ingested into EVERY meeting's AI preparation and analysis engine under this project.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsUploadDocModalOpen(true)}>
              <Upload size={14} className="mr-1" /> Upload Spec Document
            </Button>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No project-level documents uploaded"
              description="Upload the master Business Requirements Document (BRD), RFP, or Solution Architecture Blueprint (.pdf, .docx, .xlsx, .txt)."
              action={<Button onClick={() => setIsUploadDocModalOpen(true)}>Upload Project Blueprint</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-brand-50 text-brand-700">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-ink-900 text-sm truncate">{doc.filename}</h4>
                        <p className="text-xs text-ink-500">{doc.fileType} • {doc.fileSize}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="text-ink-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="rounded-lg bg-ink-50 p-2 text-xs text-ink-600">
                    <span className="font-semibold text-success-700">✓ Ingested for AI Context:</span>{' '}
                    {doc.extractedText ? `${doc.extractedText.slice(0, 120)}...` : 'Text parsed successfully'}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Link / Add Meeting to Project */}
      {isAddMeetingModalOpen && (
        <Modal
          isOpen={isAddMeetingModalOpen}
          onClose={() => setIsAddMeetingModalOpen(false)}
          title="Link Workshop Session to Project"
        >
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Select an existing meeting session to assign to <strong>{project.name}</strong>.
            </p>

            {allMeetings.length === 0 ? (
              <p className="text-sm text-ink-500 py-4">No unassigned meetings found. You can create a new meeting from the Meetings page.</p>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">Select Meeting</label>
                <select
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  {allMeetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.module || 'Cross-Module'} - {m.date || 'Scheduled'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsAddMeetingModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMeetingSubmit} disabled={allMeetings.length === 0}>Link to Project</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Add Team Member */}
      {isAddMemberModalOpen && (
        <Modal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          title="Add Consultant to Project Team"
        >
          <form onSubmit={handleAddMemberSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Consultant Name *</label>
              <input
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Anand Verma"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Functional Role *</label>
              <input
                required
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="e.g. Senior SD Consultant / PP Lead"
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="e.g. anand.verma@vc-erp.com"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsAddMemberModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add to Team</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Upload Project Document */}
      {isUploadDocModalOpen && (
        <Modal
          isOpen={isUploadDocModalOpen}
          onClose={() => setIsUploadDocModalOpen(false)}
          title="Upload Project Blueprint / BRD Specification"
        >
          <form onSubmit={handleUploadDocSubmit} className="space-y-4">
            <p className="text-xs text-ink-500">
              Upload PDF, DOCX, XLSX, or TXT project documents. The text will be extracted and injected into all meeting preparations under this project.
            </p>

            <div className="rounded-xl border-2 border-dashed border-ink-200 p-6 text-center hover:border-brand-400 bg-ink-50/50">
              <Upload size={24} className="mx-auto text-brand-600 mb-2" />
              <input
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="block w-full text-xs text-ink-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              />
              {uploadFile && (
                <p className="mt-2 text-xs font-semibold text-ink-800">
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsUploadDocModalOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!uploadFile || isUploading}>
                {isUploading ? 'Extracting & Saving...' : 'Upload & Parse Spec'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Delete Project Confirmation */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Project Workspace"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-bold">Are you sure you want to permanently delete this project?</p>
                <p className="mt-1 text-xs text-red-700">
                  Project: <strong>"{project.name}"</strong> ({project.client})
                </p>
                <p className="mt-1 text-xs text-red-600">
                  This will delete the project container, its master requirements matrix, decisions, and uploaded blueprints.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeletingProject}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteProject}
                disabled={isDeletingProject}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                {isDeletingProject ? 'Deleting...' : 'Confirm & Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

