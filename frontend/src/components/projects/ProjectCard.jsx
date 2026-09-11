import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

export default function ProjectCard({ project }) {
  return (
    <Card as={Link} to={`/projects/${project.id}`} className="flex flex-col gap-3 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{project.industry}</p>
          <h3 className="mt-0.5 truncate text-sm font-semibold text-ink-900">{project.name}</h3>
          <p className="text-xs text-ink-500">{project.client}</p>
        </div>
        <Badge tone={project.health === 'On Track' ? 'success' : 'critical'}>{project.health}</Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.modules.map((m) => (
          <Badge key={m} tone="neutral">{m}</Badge>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-ink-500">
          <span>Progress</span>
          <span className="data-num font-medium text-ink-700">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} className="mt-1" />
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500">
        <span>{project.openQuestions} open questions</span>
        {project.nextMeeting ? (
          <span className="flex items-center gap-1">
            <CalendarClock size={12} /> {project.nextMeeting.date}
          </span>
        ) : (
          <span>No upcoming meeting</span>
        )}
      </div>
    </Card>
  );
}
