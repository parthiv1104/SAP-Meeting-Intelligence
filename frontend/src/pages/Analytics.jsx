import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Building2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { orgMetrics, industryBreakdown, frequentlyMissedTopics, projects, organization } from '../data/mockData';

const PIE_COLORS = ['#5b4bdb', '#7a6de6', '#2872c9', '#1f9d5c', '#c8830f', '#d33f34'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Dashboard"
        description={`Executive view across every engagement run by ${organization.name}.`}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Active Projects" value={orgMetrics.activeProjects} />
        <MetricCard label="Total Meetings" value={orgMetrics.totalMeetings} />
        <MetricCard label="Questions Processed" value={orgMetrics.questionsProcessed} />
        <MetricCard label="Critical Gaps" value={orgMetrics.criticalGaps} deltaTone="critical" />
        <MetricCard label="Requirements Identified" value={orgMetrics.requirementsIdentified} />
        <MetricCard label="Knowledge Growth" value={`+${orgMetrics.knowledgeGrowth}%`} delta="Month over month" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-1.5">
            <Building2 size={15} className="text-brand-500" />
            <h3 className="text-sm font-semibold text-ink-900">Project Health Overview</h3>
          </div>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-48 shrink-0 truncate text-sm text-ink-700">{p.name}</div>
                <ProgressBar value={p.healthScore} className="flex-1" />
                <Badge tone={p.health === 'On Track' ? 'success' : 'critical'} className="shrink-0">{p.health}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Industry Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={industryBreakdown} dataKey="projects" nameKey="industry" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {industryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {industryBreakdown.map((i, idx) => (
              <div key={i.industry} className="flex items-center gap-2 text-xs text-ink-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {i.industry}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Most Common Knowledge Gaps Across Projects</h3>
          <ul className="space-y-2.5">
            <li className="text-sm text-ink-700">Approval escalation paths remain undefined in multiple procurement workshops.</li>
            <li className="text-sm text-ink-700">Tax scenario handling for cross-border transactions is inconsistently documented.</li>
            <li className="text-sm text-ink-700">Exception handling processes for emergency purchases are frequently unclear.</li>
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Most Frequently Missed Topics</h3>
          <div className="space-y-2.5">
            {frequentlyMissedTopics.map((t) => (
              <div key={t.topic} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{t.topic}</span>
                <span className="data-num font-medium text-critical-600">{t.missed}/{t.total}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
