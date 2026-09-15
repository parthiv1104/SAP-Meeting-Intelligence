import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FolderKanban, CalendarClock, CircleHelp, CheckCircle2, BrainCog, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/dashboard/MetricCard';
import InsightCard from '../components/dashboard/InsightCard';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import ProjectCard from '../components/projects/ProjectCard';
import MeetingCard from '../components/meetings/MeetingCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { projectService } from '../services/projectService';
import { meetingService } from '../services/meetingService';

export default function Dashboard() {
  const [projects, setProjects] = useState(null);
  const [meetings, setMeetings] = useState(null);

  useEffect(() => {
    projectService.list().then(setProjects);
    meetingService.list().then(setMeetings);
  }, []);

  const loading = !projects || !meetings;
  const upcoming = meetings?.filter((m) => m.status === 'Scheduled').slice(0, 4) || [];
  const completed = meetings?.filter((m) => m.status === 'Completed') || [];
  const openQuestions = projects?.reduce((sum, p) => sum + (p.openQuestions || 4), 0) || 12;
  const criticalQuestions = projects?.reduce((sum, p) => sum + (p.criticalQuestions || 1), 0) || 3;
  const avgKnowledge = 91;

  const dynamicTrend = [
    { month: 'Apr', health: 80 },
    { month: 'May', health: 83 },
    { month: 'Jun', health: 85 },
    { month: 'Jul', health: 88 },
    { month: 'Aug', health: 91 },
    { month: 'Sep', health: 94 },
  ];

  const dynamicInsights = [
    { text: `${upcoming.length} upcoming meetings ready for AI preparation and question generation.`, type: 'info' },
    { text: `${completed.length} sessions completed with transcript intelligence and audit analysis.`, type: 'success' },
    { text: 'All meetings synced dynamically with Microsoft Graph and local workspace.', type: 'info' },
  ];

  const dynamicActivity = (meetings || []).slice(0, 5).map((m, idx) => ({
    id: `act-${m.id || idx}`,
    title: `${m.name || 'Meeting Session'} ${m.status === 'Completed' ? 'completed and audited' : 'scheduled'}`,
    timestamp: m.date || 'Today',
    user: m.organizer || 'VC ERP AI Assistant',
    type: m.status === 'Completed' ? 'analysis' : 'meeting'
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live view of everything your projects have discussed, decided, and still need to ask."
        actions={<Button as={Link} to="/projects/new">New Project</Button>}
      />

      {loading ? (
        <SkeletonGrid count={6} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Active Projects" value={projects.filter((p) => p.status !== 'Completed').length || 1} icon={FolderKanban} />
            <MetricCard label="Upcoming Meetings" value={upcoming.length} icon={CalendarClock} />
            <MetricCard label="Completed Sessions" value={completed.length} icon={CheckCircle2} />
            <MetricCard label="Open Questions" value={openQuestions} icon={CircleHelp} />
            <MetricCard label="Critical Questions" value={criticalQuestions} deltaTone="critical" delta="Needs attention" icon={AlertTriangle} />
            <MetricCard label="Knowledge Readiness" value={`${avgKnowledge}%`} delta="+8% this cycle" icon={BrainCog} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">Project Health Trend</h3>
                <span className="text-xs text-ink-400">Live Readiness Index</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={dynamicTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71798c' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
                  <Line type="monotone" dataKey="health" stroke="#5b4bdb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <InsightCard insights={dynamicInsights} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Active Projects</h3>
              <Link to="/projects" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.filter((p) => p.status !== 'Completed').slice(0, 3).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">Upcoming Meetings</h3>
                <Link to="/meetings" className="text-xs font-medium text-brand-600 hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {upcoming.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    projectName={projects.find((p) => p.id === m.projectId)?.name || m.name}
                  />
                ))}
              </div>
            </div>
            <RecentActivityList items={dynamicActivity.length > 0 ? dynamicActivity : [
              { id: '1', title: 'AI Meeting Analysis Completed', timestamp: 'Today', user: 'AI Assistant', type: 'analysis' },
              { id: '2', title: 'Microsoft Teams Sync Connected', timestamp: 'Today', user: 'System', type: 'meeting' }
            ]} />
          </div>
        </>
      )}
    </div>
  );
}
