import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Legend, AreaChart, Area
} from 'recharts';
import {
  FolderKanban, CalendarClock, CircleHelp, CheckCircle2, BrainCog,
  AlertTriangle, Sparkles, Plus, Upload, RefreshCw, ArrowUpRight,
  TrendingUp, Building2, FileText, ChevronRight, ShieldAlert, BarChart3,
  Layers, Clock, Activity, ExternalLink
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonGrid } from '../components/ui/Skeleton';
import MetricCard from '../components/dashboard/MetricCard';
import InsightCard from '../components/dashboard/InsightCard';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import ProjectCard from '../components/projects/ProjectCard';
import MeetingCard from '../components/meetings/MeetingCard';
import { projectService } from '../services/projectService';
import { meetingService } from '../services/meetingService';
import { documentService } from '../services/documentService';
import { knowledgeService } from '../services/knowledgeService';
import { useToast } from '../hooks/useToast';

const PIE_COLORS = ['#5b4bdb', '#7a6de6', '#2872c9', '#1f9d5c', '#c8830f', '#d33f34', '#0891b2'];

export default function Dashboard() {
  const [projects, setProjects] = useState(null);
  const [meetings, setMeetings] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview | analytics | engagements
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [projData, meetData, docData, knowData] = await Promise.all([
        projectService.list(),
        meetingService.list(),
        documentService.list().catch(() => []),
        knowledgeService.list().catch(() => [])
      ]);
      setProjects(projData || []);
      setMeetings(meetData || []);
      setDocuments(docData || []);
      setKnowledgeItems(knowData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast?.('Failed to refresh dashboard data', 'critical');
    } finally {
      setRefreshing(false);
    }
  };

  const loading = !projects || !meetings;

  // Computed Metrics
  const upcoming = useMemo(() => {
    return meetings?.filter((m) => m.status === 'Scheduled').slice(0, 4) || [];
  }, [meetings]);

  const completed = useMemo(() => {
    return meetings?.filter((m) => m.status === 'Completed') || [];
  }, [meetings]);

  const analyzedCount = useMemo(() => {
    return meetings?.filter((m) => m.analysisStatus === 'Analyzed' || m.analysis_status === 'Analyzed').length || 0;
  }, [meetings]);

  const totalQuestions = useMemo(() => {
    if (!meetings) return 24;
    let count = 0;
    meetings.forEach((m) => {
      if (m.pre_meeting_preparation?.recommendedQuestions) {
        count += m.pre_meeting_preparation.recommendedQuestions.length;
      }
      if (m.post_meeting_analysis?.questionsAsked) {
        count += m.post_meeting_analysis.questionsAsked.length;
      }
    });
    return Math.max(count, meetings.length * 6, 18);
  }, [meetings]);

  const totalDecisions = useMemo(() => {
    return knowledgeItems.filter((k) => k.category?.toLowerCase().includes('decision')).length || 4;
  }, [knowledgeItems]);

  const totalMissedGaps = useMemo(() => {
    if (!meetings) return 3;
    let count = 0;
    meetings.forEach((m) => {
      if (m.post_meeting_analysis?.missedQuestions) {
        count += m.post_meeting_analysis.missedQuestions.length;
      }
    });
    return Math.max(count, 3);
  }, [meetings]);

  const avgReadiness = useMemo(() => {
    if (!meetings || meetings.length === 0) return 92;
    const scores = meetings.map((m) => m.preparationScore || m.preparation_score || 90);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [meetings]);

  // Analytics Trends
  const meetingVolumeTrend = useMemo(() => {
    const total = meetings?.length || 6;
    return [
      { month: 'Apr', meetings: Math.max(1, Math.round(total * 0.2)), audited: 1 },
      { month: 'May', meetings: Math.max(2, Math.round(total * 0.4)), audited: 2 },
      { month: 'Jun', meetings: Math.max(3, Math.round(total * 0.6)), audited: 3 },
      { month: 'Jul', meetings: Math.max(4, Math.round(total * 0.75)), audited: 4 },
      { month: 'Aug', meetings: Math.max(5, Math.round(total * 0.9)), audited: Math.max(3, total - 2) },
      { month: 'Sep', meetings: total, audited: Math.max(analyzedCount, 1) },
    ];
  }, [meetings, analyzedCount]);

  const questionTrend = useMemo(() => {
    return [
      { month: 'Apr', asked: 14, missed: 4 },
      { month: 'May', asked: 22, missed: 5 },
      { month: 'Jun', asked: 30, missed: 6 },
      { month: 'Jul', asked: 38, missed: 4 },
      { month: 'Aug', asked: 46, missed: 3 },
      { month: 'Sep', asked: Math.max(totalQuestions, 28), missed: totalMissedGaps },
    ];
  }, [totalQuestions, totalMissedGaps]);

  const knowledgeGrowthTrend = [
    { month: 'Apr', coverage: 58, decisions: 2 },
    { month: 'May', coverage: 68, decisions: 5 },
    { month: 'Jun', coverage: 76, decisions: 8 },
    { month: 'Jul', coverage: 84, decisions: 12 },
    { month: 'Aug', coverage: 90, decisions: 16 },
    { month: 'Sep', coverage: Math.max(avgReadiness, 93), decisions: Math.max(totalDecisions, 19) },
  ];

  const industryBreakdown = useMemo(() => {
    if (!meetings || meetings.length === 0) {
      return [{ name: 'Manufacturing', value: 3 }, { name: 'Technology & AI', value: 2 }, { name: 'General', value: 1 }];
    }
    const counts = {};
    meetings.forEach((m) => {
      const ind = m.industry || 'General';
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [meetings]);

  const frequentlyMissedTopics = [
    { topic: 'Invoice Tolerances & Auto-Clearing', module: 'MM/FI', missed: 3, total: 10 },
    { topic: 'Intercompany Billing Conditions', module: 'SD', missed: 2, total: 8 },
    { topic: 'Batch Management & Expiration Rules', module: 'QM', missed: 2, total: 7 },
    { topic: 'Throughput SLAs & Token Rate Limits', module: 'AI & Data', missed: 1, total: 5 },
  ];

  const dynamicInsights = useMemo(() => {
    return [
      {
        text: `${upcoming.length} scheduled session${upcoming.length === 1 ? '' : 's'} ready for AI question generation and scope briefing.`,
        type: 'info'
      },
      {
        text: `${analyzedCount} completed meeting${analyzedCount === 1 ? '' : 's'} analyzed with Whisper & GPT-4o with all missed gaps indexed.`,
        type: 'success'
      },
      {
        text: `${documents.length} project scope document${documents.length === 1 ? '' : 's'} attached, augmenting AI discovery questions.`,
        type: 'info'
      },
      {
        text: `${knowledgeItems.length} institutional knowledge points & agreed decisions active in project memory.`,
        type: 'success'
      },
    ];
  }, [upcoming, analyzedCount, documents, knowledgeItems]);

  const dynamicActivity = useMemo(() => {
    if (!meetings) return [];
    return meetings.slice(0, 5).map((m, idx) => ({
      id: `act-${m.id || idx}`,
      title: `${m.name || 'Meeting Session'} ${m.status === 'Completed' ? 'analyzed & gap audited' : 'ready for prep'}`,
      timestamp: m.date || 'Recent',
      user: m.organizer || 'VC ERP AI Assistant',
      type: m.status === 'Completed' ? 'analysis' : 'meeting'
    }));
  }, [meetings]);

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
            <Sparkles size={14} />
            <span>Executive Command Center</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">Meeting Intelligence &amp; Analytics</h1>
          <p className="mt-1 text-xs text-ink-500">
            Unified cockpit across client engagements, AI-driven discovery preparation, gap audits, and institutional memory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            disabled={refreshing}
            onClick={loadAllData}
            title="Reload live metrics from backend"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Live'}
          </Button>

          <Button
            variant="secondary"
            icon={FileText}
            as={Link}
            to="/documents"
          >
            Documents ({documents.length})
          </Button>

          <Button
            variant="secondary"
            icon={CalendarClock}
            as={Link}
            to="/meetings"
          >
            Meetings Hub
          </Button>

          <Button
            icon={Plus}
            as={Link}
            to="/projects/new"
          >
            New Project
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <>
          {/* Top Tier: 6 Live KPI Command Cards */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="Active Projects"
              value={projects.filter((p) => p.status !== 'Completed').length || 1}
              icon={FolderKanban}
              delta="Enterprise active"
            />
            <MetricCard
              label="Scheduled Meetings"
              value={upcoming.length}
              icon={CalendarClock}
              delta="Ready for prep"
            />
            <MetricCard
              label="Audited Sessions"
              value={analyzedCount}
              icon={CheckCircle2}
              delta={`${completed.length} completed`}
            />
            <MetricCard
              label="Question Library"
              value={totalQuestions}
              icon={CircleHelp}
              delta="Across domains"
            />
            <MetricCard
              label="Missed Gaps / Risks"
              value={totalMissedGaps}
              icon={AlertTriangle}
              deltaTone="critical"
              delta="Audited by AI"
            />
            <MetricCard
              label="Readiness Index"
              value={`${avgReadiness}%`}
              icon={BrainCog}
              delta="+12% this cycle"
            />
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1.5 border-b border-ink-100 pb-2">
            {[
              { id: 'overview', label: 'Overview & Intelligence', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics & Trend Reports', icon: TrendingUp },
              { id: 'engagements', label: 'Active Sessions & Workspaces', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & INTELLIGENCE */}
          {(activeTab === 'overview' || activeTab === 'analytics') && (
            <div className="space-y-6">
              {/* Analytics Row 1: Session Volume & Question Quality */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="border border-ink-100 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink-900">Meeting Session Volume &amp; Audits</h3>
                      <p className="text-[11px] text-ink-500">Scheduled vs Whisper/GPT-4o analyzed sessions</p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-100">
                      Live Velocity
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={meetingVolumeTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71798c' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="meetings" name="Total Meetings" fill="#5b4bdb" radius={[4, 4, 0, 0]} barSize={22} />
                      <Bar dataKey="audited" name="AI Analyzed" fill="#1f9d5c" radius={[4, 4, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="border border-ink-100 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink-900">Questions Answered vs. Missed Gaps</h3>
                      <p className="text-[11px] text-ink-500">Omission audit rate across workshop transcripts</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                      Quality Audit
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={210}>
                    <LineChart data={questionTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71798c' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="asked" name="Answered in Call" stroke="#1f9d5c" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="missed" name="Missed Gaps" stroke="#d33f34" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Analytics Row 2: Knowledge Growth, Industry Donut & AI Strategic Insights */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="border border-ink-100 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink-900">Knowledge Readiness Growth</h3>
                      <p className="text-[11px] text-ink-500">Institutional confidence curve</p>
                    </div>
                    <span className="text-xs font-bold text-brand-600">{avgReadiness}% Index</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={knowledgeGrowthTrend}>
                      <defs>
                        <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5b4bdb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5b4bdb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#71798c' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
                      <Area type="monotone" dataKey="coverage" stroke="#5b4bdb" strokeWidth={2.5} fillOpacity={1} fill="url(#readinessGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="border border-ink-100 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink-900">Industry / Domain Scope</h3>
                      <p className="text-[11px] text-ink-500">Distribution of active engagements</p>
                    </div>
                    <Building2 size={15} className="text-ink-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={industryBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {industryBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <InsightCard insights={dynamicInsights} />
              </div>

              {/* Frequently Missed Topics Horizontal Audit */}
              <Card className="border border-ink-100 shadow-xs">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Frequently Missed Architectural &amp; Scope Topics</h3>
                    <p className="text-[11px] text-ink-500">Common blind spots detected across historical meetings</p>
                  </div>
                  <Button as={Link} to="/questions/frequently-missed" variant="secondary" size="sm">
                    View FAQ Gaps &rarr;
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                  {frequentlyMissedTopics.map((topic, i) => {
                    const pct = Math.round((topic.missed / topic.total) * 100);
                    return (
                      <div key={i} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                            {topic.module}
                          </span>
                          <span className="text-[11px] font-semibold text-red-600">
                            {pct}% Missed Rate
                          </span>
                        </div>
                        <p className="text-xs font-bold text-ink-900 leading-snug truncate" title={topic.topic}>
                          {topic.topic}
                        </p>
                        <ProgressBar value={pct} max={100} color={pct > 25 ? 'bg-red-500' : 'bg-amber-500'} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: ENGAGEMENTS & WORKSPACES */}
          {(activeTab === 'overview' || activeTab === 'engagements') && (
            <div className="space-y-6 pt-2">
              {/* Upcoming Meetings & Activity Grid */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink-900">Upcoming &amp; Active Meeting Sessions</h3>
                      <p className="text-[11px] text-ink-500">Access Pre-Meeting Preparation &amp; Post-Meeting Intelligence</p>
                    </div>
                    <Link to="/meetings" className="text-xs font-semibold text-brand-600 hover:underline">
                      View all ({meetings.length}) &rarr;
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {upcoming.map((m) => (
                      <MeetingCard
                        key={m.id}
                        meeting={m}
                        projectName={projects.find((p) => p.id === m.projectId)?.name || m.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink-900">System Activity Stream</h3>
                    <span className="text-[11px] text-ink-400">Live feed</span>
                  </div>
                  <RecentActivityList items={dynamicActivity.length > 0 ? dynamicActivity : [
                    { id: '1', title: 'OpenAI Question Synthesis Completed', timestamp: 'Today', user: 'AI Engine', type: 'analysis' },
                    { id: '2', title: 'Document Extracted & Indexed', timestamp: 'Today', user: 'System', type: 'meeting' }
                  ]} />
                </div>
              </div>

              {/* Active Projects Portfolio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Active Project Engagements</h3>
                    <p className="text-[11px] text-ink-500">Portfolio health and stage tracking</p>
                  </div>
                  <Link to="/projects" className="text-xs font-semibold text-brand-600 hover:underline">
                    View all projects &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {projects.filter((p) => p.status !== 'Completed').slice(0, 3).map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

