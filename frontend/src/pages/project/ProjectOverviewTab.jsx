import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { projectService } from '../../services/projectService';
import { meetingService } from '../../services/meetingService';
import { questionService } from '../../services/questionService';
import { knowledgeService } from '../../services/knowledgeService';

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-800">{value}</span>
    </div>
  );
}

export default function ProjectOverviewTab() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [knowledge, setKnowledge] = useState([]);

  useEffect(() => {
    projectService.get(id).then(setProject);
    meetingService.list().then(setMeetings);
    questionService.list().then(setQuestions);
    knowledgeService.list().then(setKnowledge);
  }, [id]);

  if (!project) return <SkeletonGrid count={4} />;

  const projMeetings = meetings.slice(0, 3);
  const criticalQs = questions.filter((q) => q.importance === 'Critical' || q.priority === 'Critical').slice(0, 3);
  const projKnowledge = knowledge.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase text-ink-500">Client</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{project.client || 'Enterprise Client'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-500">Project Manager</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{project.projectManager || 'Project Lead'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-500">Timeline</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{project.startDate || '2026-03-01'} → {project.endDate || '2026-12-31'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-500">Overall Health</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={project.health === 'On Track' ? 'success' : 'critical'}>{project.health || 'On Track'}</Badge>
            <span className="data-num text-sm font-semibold text-ink-800">{project.healthScore || 90}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Project Health</h3>
          <StatRow label="Overall progress" value={`${project.progress || 65}%`} />
          <ProgressBar value={project.progress || 65} className="my-2" />
          <StatRow label="Open questions" value={project.openQuestions || questions.length || 8} />
          <StatRow label="Critical questions" value={project.criticalQuestions || criticalQs.length || 2} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Knowledge Coverage</h3>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="data-num text-2xl font-semibold text-ink-900">{project.knowledgeCoverage || 88}%</span>
            <span className="text-xs text-success-600 font-medium">verified across meetings &amp; documents</span>
          </div>
          <ProgressBar value={project.knowledgeCoverage || 88} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-900">Recent Meetings</h3>
            <Link to={`/projects/${id}/meetings`} className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5">
            {projMeetings.map((m) => (
              <div key={m.id} className="text-sm">
                <Link to={`/meetings/${m.id}`} className="font-medium text-ink-800 hover:text-brand-600">{m.name}</Link>
                <p className="text-xs text-ink-400">{m.date} · {m.status}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-900">Open Critical Questions</h3>
            <Link to={`/projects/${id}/questions`} className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5">
            {criticalQs.length ? criticalQs.map((q) => (
              <p key={q.id} className="text-sm text-ink-800 leading-snug">
                {q.text || q.question}
              </p>
            )) : <p className="text-sm text-ink-400">No critical questions open.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Recent Knowledge Updates</h3>
          <Link to={`/projects/${id}/knowledge`} className="text-xs text-brand-600 hover:underline">View all</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {projKnowledge.map((k) => (
            <div key={k.id} className="rounded-lg border border-ink-100 p-3">
              <p className="text-xs font-medium uppercase text-brand-600">{k.category}</p>
              <p className="mt-1 text-sm font-medium text-ink-800">{k.title}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
