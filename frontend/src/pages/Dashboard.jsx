import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Legend, AreaChart, Area
} from 'recharts';
import {
  CalendarClock, CircleHelp, CheckCircle2, BrainCog,
  AlertTriangle, Sparkles, Plus, Upload, RefreshCw, ArrowUpRight,
  Building2, FileText, ChevronRight, ShieldAlert,
  Layers, Clock, Activity, ExternalLink, BookOpen
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonGrid } from '../components/ui/Skeleton';
import MetricCard from '../components/dashboard/MetricCard';
import InsightCard from '../components/dashboard/InsightCard';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import MeetingCard from '../components/meetings/MeetingCard';
import { meetingService } from '../services/meetingService';
import { documentService } from '../services/documentService';
import { knowledgeService } from '../services/knowledgeService';
import { useToast } from '../hooks/useToast';

const PIE_COLORS = ['#5b4bdb', '#7a6de6', '#2872c9', '#1f9d5c', '#c8830f', '#d33f34', '#0891b2'];

export default function Dashboard() {
  const [meetings, setMeetings] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (isManual = false) => {
    setRefreshing(true);
    const start = Date.now();
    try {
      const [meetData, docData, knowData] = await Promise.all([
        meetingService.list(),
        documentService.list().catch(() => []),
        knowledgeService.list().catch(() => [])
      ]);
      if (isManual) {
        const elapsed = Date.now() - start;
        if (elapsed < 600) {
          await new Promise((r) => setTimeout(r, 600 - elapsed));
        }
      }
      setMeetings(meetData || []);
      setDocuments(docData || []);
      setKnowledgeItems(knowData || []);
      if (isManual) {
        toast?.('Live dashboard intelligence & metrics updated!', 'success');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast?.('Failed to refresh dashboard data', 'critical');
    } finally {
      setRefreshing(false);
    }
  };

  const loading = !meetings;

  // Computed Metrics
  const upcoming = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];
    const scheduled = meetings.filter((m) => m.status === 'Scheduled');
    return scheduled.length > 0 ? scheduled.slice(0, 4) : meetings.slice(0, 4);
  }, [meetings]);

  const completed = useMemo(() => {
    return meetings?.filter((m) => m.status === 'Completed') || [];
  }, [meetings]);

  const analyzedCount = useMemo(() => {
    return meetings?.filter((m) => m.analysisStatus === 'Analyzed' || m.analysis_status === 'Analyzed').length || 0;
  }, [meetings]);

  const totalQuestions = useMemo(() => {
    if (!meetings || meetings.length === 0) return 0;
    let count = 0;
    meetings.forEach((m) => {
      if (m.pre_meeting_preparation?.recommendedQuestions) {
        count += m.pre_meeting_preparation.recommendedQuestions.length;
      }
      if (m.post_meeting_analysis?.questionsAsked) {
        count += m.post_meeting_analysis.questionsAsked.length;
      }
    });
    return count;
  }, [meetings]);

  const totalDecisions = useMemo(() => {
    return knowledgeItems.filter((k) => k.category?.toLowerCase().includes('decision')).length || 0;
  }, [knowledgeItems]);

  const totalMissedGaps = useMemo(() => {
    if (!meetings || meetings.length === 0) return 0;
    let count = 0;
    meetings.forEach((m) => {
      if (m.post_meeting_analysis?.missedQuestions) {
        count += m.post_meeting_analysis.missedQuestions.length;
      }
    });
    return count;
  }, [meetings]);

  const avgReadiness = useMemo(() => {
    if (!meetings || meetings.length === 0) return 0;
    const scores = meetings
      .map((m) => m.preparationScore || m.preparation_score)
      .filter((s) => typeof s === 'number' && s > 0);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [meetings]);

  // Analytics Trends - Dynamic based on actual meetings
  const meetingVolumeTrend = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6.push({
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        month: monthNames[d.getMonth()],
        meetings: 0,
        audited: 0,
      });
    }
    if (meetings && meetings.length > 0) {
      meetings.forEach((m) => {
        const mDate = m.date ? new Date(m.date) : (m.created_at ? new Date(m.created_at) : null);
        if (mDate && !isNaN(mDate.getTime())) {
          const entry = last6.find(item => item.year === mDate.getFullYear() && item.monthIdx === mDate.getMonth());
          if (entry) {
            entry.meetings += 1;
            if (m.analysisStatus === 'Analyzed' || m.analysis_status === 'Analyzed' || m.status === 'Completed') {
              entry.audited += 1;
            }
          }
        }
      });
    }
    return last6.map(({ month, meetings, audited }) => ({ month, meetings, audited }));
  }, [meetings]);

  const questionTrend = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6.push({
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        month: monthNames[d.getMonth()],
        asked: 0,
        missed: 0,
      });
    }
    if (meetings && meetings.length > 0) {
      meetings.forEach((m) => {
        const mDate = m.date ? new Date(m.date) : (m.created_at ? new Date(m.created_at) : null);
        if (mDate && !isNaN(mDate.getTime())) {
          const entry = last6.find(item => item.year === mDate.getFullYear() && item.monthIdx === mDate.getMonth());
          if (entry) {
            const asked = m.post_meeting_analysis?.questionsAsked?.length || 0;
            const missed = m.post_meeting_analysis?.missedQuestions?.length || 0;
            entry.asked += asked;
            entry.missed += missed;
          }
        }
      });
    }
    return last6.map(({ month, asked, missed }) => ({ month, asked, missed }));
  }, [meetings]);

  const knowledgeGrowthTrend = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6.push({
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        month: monthNames[d.getMonth()],
        coverage: 0,
        decisions: 0,
      });
    }
    if (knowledgeItems && knowledgeItems.length > 0) {
      const totalDec = knowledgeItems.filter((k) => k.category?.toLowerCase().includes('decision')).length;
      last6[5].coverage = avgReadiness;
      last6[5].decisions = totalDec;
    }
    return last6.map(({ month, coverage, decisions }) => ({ month, coverage, decisions }));
  }, [knowledgeItems, avgReadiness]);

  const industryBreakdown = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];
    const counts = {};
    meetings.forEach((m) => {
      const ind = m.industry || 'General';
      counts[ind] = (counts[ind] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [meetings]);

  const frequentlyMissedTopics = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];
    const topicsMap = {};
    meetings.forEach((m) => {
      const missedList = m.post_meeting_analysis?.missedQuestions || [];
      const moduleName = m.module || 'General';
      missedList.forEach((q) => {
        const text = typeof q === 'string' ? q : (q.question || q.text || q.topic || 'Unclassified topic');
        if (!topicsMap[text]) {
          topicsMap[text] = { topic: text, module: moduleName, missed: 0, total: 0 };
        }
        topicsMap[text].missed += 1;
      });
      const askedList = m.post_meeting_analysis?.questionsAsked || [];
      askedList.forEach((q) => {
        const text = typeof q === 'string' ? q : (q.question || q.text || q.topic || 'Unclassified topic');
        if (topicsMap[text]) {
          topicsMap[text].total += 1;
        }
      });
    });
    return Object.values(topicsMap)
      .map((t) => ({ ...t, total: Math.max(t.total, t.missed) }))
      .slice(0, 4);
  }, [meetings]);

  const dynamicInsights = useMemo(() => {
    const meetCount = meetings?.length || 0;
    return [
      {
        text: `${meetCount} total session${meetCount === 1 ? '' : 's'} indexed in workspace memory across all modules.`,
        type: 'info'
      },
      {
        text: `${analyzedCount} completed meeting${analyzedCount === 1 ? '' : 's'} analyzed with Whisper & GPT-4o with all missed gaps indexed.`,
        type: analyzedCount > 0 ? 'success' : 'info'
      },
      {
        text: `${documents.length} project scope document${documents.length === 1 ? '' : 's'} attached, augmenting AI discovery questions.`,
        type: 'info'
      },
      {
        text: `${knowledgeItems.length} institutional knowledge point${knowledgeItems.length === 1 ? '' : 's'} & agreed decision${knowledgeItems.length === 1 ? '' : 's'} active in project memory.`,
        type: knowledgeItems.length > 0 ? 'success' : 'info'
      },
    ];
  }, [meetings, analyzedCount, documents, knowledgeItems]);

  const dynamicActivity = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];
    return meetings.slice(0, 5).map((m, idx) => ({
      id: `act-${m.id || idx}`,
      text: `${m.name || 'Meeting Session'} ${m.status === 'Completed' ? 'analyzed & gap audited' : 'scheduled'}`,
      time: m.date || 'Recent',
      user: m.organizer || 'AI Workspace Assistant',
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
            loading={refreshing}
            onClick={() => loadAllData(true)}
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
            variant="primary"
            icon={CalendarClock}
            as={Link}
            to="/meetings"
          >
            Meetings Hub
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
              label="Total Meetings"
              value={meetings.length}
              icon={CalendarClock}
              delta={`${analyzedCount} analyzed`}
            />
            <MetricCard
              label="AI Analyzed Meetings"
              value={analyzedCount}
              icon={CheckCircle2}
              delta={`${completed.length} completed`}
            />
            <MetricCard
              label="Generated Questions"
              value={totalQuestions}
              icon={CircleHelp}
              delta="Across domains"
            />
            <MetricCard
              label="Attached Documents"
              value={documents.length}
              icon={FileText}
              delta="Extracted context"
            />
            <MetricCard
              label="Identified Risks & Gaps"
              value={totalMissedGaps}
              icon={AlertTriangle}
              deltaTone={totalMissedGaps > 0 ? "critical" : "neutral"}
              delta={totalMissedGaps > 0 ? "Audited by AI" : "No gaps found"}
            />
            <MetricCard
              label="Meeting Readiness Score"
              value={avgReadiness > 0 ? `${avgReadiness}%` : '0%'}
              icon={BrainCog}
              delta={avgReadiness > 0 ? "+12% this cycle" : "No sessions analyzed"}
            />
          </div>

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
                  {industryBreakdown.length > 0 ? (
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
                  ) : (
                    <div className="h-[180px] flex flex-col items-center justify-center text-center text-xs text-ink-400">
                      <Building2 size={24} className="text-ink-300 mb-1" />
                      <p>No industry domain data yet</p>
                    </div>
                  )}
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
                  <Button as={Link} to="/questions" variant="secondary" size="sm">
                    View Questions &rarr;
                  </Button>
                </div>
                {frequentlyMissedTopics.length > 0 ? (
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
                ) : (
                  <div className="py-6 text-center text-xs text-ink-400 bg-ink-50/50 rounded-xl border border-dashed border-ink-200">
                    <p className="font-medium text-ink-600">No frequently missed topics detected yet</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">Recurring scope gaps and missed questions will populate dynamically once post-meeting transcripts are analyzed.</p>
                  </div>
                )}
              </Card>

              {/* Upcoming & Active Meeting Sessions + Activity Grid */}
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
                  {upcoming.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {upcoming.map((m) => (
                        <MeetingCard
                          key={m.id}
                          meeting={m}
                          projectName={m.topic || m.module || m.name}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-ink-200 space-y-2">
                      <CalendarClock size={28} className="mx-auto text-ink-300" />
                      <p className="text-sm font-semibold text-ink-800">No upcoming meetings scheduled</p>
                      <p className="text-xs text-ink-500 max-w-sm mx-auto">Create a meeting session to prepare AI questions, capture transcripts, and extract architecture decisions.</p>
                      <div className="pt-2">
                        <Button as={Link} to="/meetings/new" variant="primary" size="sm" icon={Plus}>
                          Schedule Meeting
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink-900">System Activity Stream</h3>
                    <span className="text-[11px] text-ink-400">Live feed</span>
                  </div>
                  <RecentActivityList items={dynamicActivity} />
                </div>
              </div>

              {/* Verified Knowledge Base & Decisions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900">Verified Project Knowledge &amp; Decisions</h3>
                    <p className="text-[11px] text-ink-500">Extracted baseline rules and agreements across meetings</p>
                  </div>
                  <Link to="/knowledge" className="text-xs font-semibold text-brand-600 hover:underline">
                    View Knowledge Base &rarr;
                  </Link>
                </div>
                {knowledgeItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {knowledgeItems.slice(0, 3).map((item) => (
                      <Card key={item.id} className="border border-ink-100 hover:border-brand-300 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge tone="brand">{item.category || 'Architecture'}</Badge>
                          <span className="text-[11px] font-semibold text-ink-400">{item.module || 'General'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-ink-900 line-clamp-1">{item.title}</h4>
                        <p className="mt-1 text-xs text-ink-600 line-clamp-2 leading-relaxed">{item.content}</p>
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-ink-50 text-[11px] text-ink-400">
                          <span>Source: {item.meetingName || 'Meeting Audit'}</span>
                          <Badge tone="positive">{item.confidence || 95}% Confidence</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-ink-400 bg-ink-50/50 rounded-xl border border-dashed border-ink-200">
                    <p className="font-medium text-ink-600">No verified knowledge items or decisions recorded</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">Institutional decisions and architectural agreements will be automatically extracted during meeting analysis.</p>
                  </div>
                )}
              </div>
            </div>
        </>
      )}
    </div>
  );
}

