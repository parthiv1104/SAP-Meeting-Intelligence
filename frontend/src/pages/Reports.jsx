import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import {
  meetingTrend, questionsTrend, knowledgeGrowthTrend, frequentlyMissedTopics,
  industryBreakdown, projects,
} from '../data/mockData';

const PIE_COLORS = ['#5b4bdb', '#7a6de6', '#2872c9', '#1f9d5c', '#c8830f', '#d33f34'];

export default function Reports() {
  const avgMeetingCoverage = 78;
  const avgKnowledgeCoverage = Math.round(projects.reduce((s, p) => s + p.knowledgeCoverage, 0) / projects.length);
  const avgQuestionCoverage = 86;
  const requirementDiscoveryRate = 92;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports &amp; Analytics" description="Organization-wide trends across meetings, questions, and project knowledge." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Meeting Coverage" value={`${avgMeetingCoverage}%`} />
        <MetricCard label="Knowledge Coverage" value={`${avgKnowledgeCoverage}%`} delta="+12% this month" />
        <MetricCard label="Question Coverage" value={`${avgQuestionCoverage}%`} />
        <MetricCard label="Requirement Discovery" value={`${requirementDiscoveryRate}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Meeting Trend</h3>
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
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Knowledge Growth</h3>
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
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Module Coverage (ABC Manufacturing)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projects[0].moduleCoverage} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="module" type="category" width={40} tick={{ fontSize: 12, fill: '#3d4356' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Bar dataKey="coverage" fill="#5b4bdb" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Frequently Missed Topics</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={frequentlyMissedTopics.map((t) => ({ ...t, pct: Math.round((t.missed / t.total) * 100) }))} layout="vertical" margin={{ left: 24 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="topic" type="category" width={160} tick={{ fontSize: 12, fill: '#3d4356' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Bar dataKey="pct" fill="#d33f34" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Industry Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={industryBreakdown} dataKey="projects" nameKey="industry" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {industryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
