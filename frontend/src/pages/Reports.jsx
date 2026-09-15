import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import { meetingService } from '../services/meetingService';
import { projectService } from '../services/projectService';
import { SkeletonGrid } from '../components/ui/Skeleton';

const PIE_COLORS = ['#5b4bdb', '#7a6de6', '#2872c9', '#1f9d5c', '#c8830f', '#d33f34'];

export default function Reports() {
  const [meetings, setMeetings] = useState(null);
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    meetingService.list().then(setMeetings);
    projectService.list().then(setProjects);
  }, []);

  if (!meetings || !projects) return <SkeletonGrid count={4} />;

  const completed = meetings.filter(m => m.status === 'Completed');
  const avgMeetingCoverage = completed.length > 0 ? Math.round((completed.length / meetings.length) * 100) : 75;
  const avgKnowledgeCoverage = 92;
  const avgQuestionCoverage = 88;
  const totalAnalyzed = meetings.filter(m => m.analysisStatus === 'Analyzed' || m.analysis_status === 'Analyzed').length;

  const meetingTrend = [
    { month: 'Apr', meetings: 3 },
    { month: 'May', meetings: 5 },
    { month: 'Jun', meetings: 6 },
    { month: 'Jul', meetings: 8 },
    { month: 'Aug', meetings: 10 },
    { month: 'Sep', meetings: meetings.length },
  ];

  const questionsTrend = [
    { month: 'Apr', asked: 14, missed: 4 },
    { month: 'May', asked: 22, missed: 5 },
    { month: 'Jun', asked: 28, missed: 6 },
    { month: 'Jul', asked: 35, missed: 4 },
    { month: 'Aug', asked: 42, missed: 3 },
    { month: 'Sep', asked: Math.max(meetings.length * 5, 25), missed: 2 },
  ];

  const knowledgeGrowthTrend = [
    { month: 'Apr', coverage: 55 },
    { month: 'May', coverage: 65 },
    { month: 'Jun', coverage: 74 },
    { month: 'Jul', coverage: 82 },
    { month: 'Aug', coverage: 89 },
    { month: 'Sep', coverage: 94 },
  ];

  // Industry breakdown derived dynamically
  const industryCounts = {};
  meetings.forEach(m => {
    const ind = m.industry || 'General';
    industryCounts[ind] = (industryCounts[ind] || 0) + 1;
  });
  const dynamicIndustryBreakdown = Object.entries(industryCounts).map(([industry, count]) => ({
    industry,
    projects: count
  }));

  const frequentlyMissedTopics = [
    { topic: 'Invoice Tolerances & Auto-Clearing', module: 'MM/FI', missed: 3, total: 10 },
    { topic: 'Intercompany Billing Conditions', module: 'SD', missed: 2, total: 8 },
    { topic: 'Batch Management & Expiration Rules', module: 'QM', missed: 2, total: 7 },
    { topic: 'Inference Latency & Token Budgets', module: 'AI & Data', missed: 1, total: 5 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports &amp; Analytics" description="Organization-wide trends across live meetings, questions, and project knowledge." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Meeting Coverage" value={`${avgMeetingCoverage}%`} />
        <MetricCard label="Knowledge Coverage" value={`${avgKnowledgeCoverage}%`} delta="+14% this cycle" />
        <MetricCard label="Question Coverage" value={`${avgQuestionCoverage}%`} />
        <MetricCard label="Sessions Analyzed" value={totalAnalyzed} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Meeting Session Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={meetingTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71798c' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Bar dataKey="meetings" fill="#5b4bdb" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Questions Asked vs Missed</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={questionsTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71798c' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="asked" name="Asked" stroke="#1f9d5c" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="missed" name="Missed" stroke="#d33f34" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Knowledge Growth Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={knowledgeGrowthTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71798c' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Line type="monotone" dataKey="coverage" stroke="#2872c9" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Industry / Domain Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dynamicIndustryBreakdown.length > 0 ? dynamicIndustryBreakdown : [{ industry: 'Enterprise', projects: 1 }]} dataKey="projects" nameKey="industry" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {dynamicIndustryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Frequently Missed Topics Audit</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={frequentlyMissedTopics.map((t) => ({ ...t, pct: Math.round((t.missed / t.total) * 100) }))} layout="vertical" margin={{ left: 24 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="topic" type="category" width={220} tick={{ fontSize: 12, fill: '#3d4356' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}% missed`} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Bar dataKey="pct" fill="#d33f34" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
