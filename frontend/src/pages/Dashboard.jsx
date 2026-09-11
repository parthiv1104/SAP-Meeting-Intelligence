import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FolderKanban, CalendarClock, CircleHelp, ClipboardList, BrainCog, AlertTriangle } from 'lucide-react';
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
import { dashboardInsights, recentActivity, projectHealthTrend } from '../data/mockData';

export default function Dashboard() {
  const [projects, setProjects] = useState(null);
  const [meetings, setMeetings] = useState(null);

  useEffect(() => {
    projectService.list().then(setProjects);
    meetingService.list().then(setMeetings);
  }, []);

  const loading = !projects || !meetings;
  const upcoming = meetings?.filter((m) => m.status === 'Scheduled').slice(0, 3);
  const openQuestions = projects?.reduce((sum, p) => sum + p.openQuestions, 0);
  const criticalQuestions = projects?.reduce((sum, p) => sum + p.criticalQuestions, 0);
  const avgKnowledge = projects ? Math.round(projects.reduce((s, p) => s + p.knowledgeCoverage, 0) / projects.length) : 0;

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
            <MetricCard label="Active Projects" value={projects.filter((p) => p.status !== 'Completed').length} icon={FolderKanban} />
            <MetricCard label="Upcoming Meetings" value={upcoming.length} icon={CalendarClock} />
            <MetricCard label="Open Questions" value={openQuestions} icon={CircleHelp} />
            <MetricCard label="Critical Questions" value={criticalQuestions} deltaTone="critical" delta="Needs attention" icon={AlertTriangle} />
            <MetricCard label="Requirements Pending" value={5} icon={ClipboardList} />
            <MetricCard label="Knowledge Coverage" value={`${avgKnowledge}%`} delta="+12% this month" icon={BrainCog} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">Project Health Trend</h3>
                <span className="text-xs text-ink-400">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={projectHealthTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71798c' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dde1e7' }} />
                  <Line type="monotone" dataKey="health" stroke="#5b4bdb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <InsightCard insights={dashboardInsights} />
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
                    projectName={projects.find((p) => p.id === m.projectId)?.name}
                  />
                ))}
              </div>
            </div>
            <RecentActivityList items={recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}
