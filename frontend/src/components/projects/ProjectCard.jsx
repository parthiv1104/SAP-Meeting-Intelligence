import { useNavigate } from 'react-router-dom';
import { CalendarClock, Users, Layers, CheckCircle2, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();
  const meetingsCount = project.meetingsCount ?? 0;
  const analyzedCount = project.analyzedMeetingsCount ?? 0;
  const teamCount = Array.isArray(project.team) ? project.team.length : 0;
  const reqsCount = Array.isArray(project.cumulativeRequirements) ? project.cumulativeRequirements.length : 0;

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col gap-3.5 rounded-xl border border-ink-100 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-300 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">{project.industry || 'Enterprise'}</span>
            <span className="text-xs text-ink-300">•</span>
            <span className="text-xs text-ink-500 font-medium truncate">{project.sapProduct || 'SAP S/4HANA'}</span>
          </div>
          <h3 className="mt-1 truncate text-base font-bold text-ink-900 group-hover:text-brand-700">{project.name}</h3>
          <p className="text-xs text-ink-500 font-medium">{project.client}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge tone={project.health === 'On Track' ? 'success' : project.health === 'Critical' ? 'critical' : 'warning'}>
            {project.health || 'On Track'}
          </Badge>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project);
              }}
              title="Delete Project"
              className="p-1 text-ink-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(project.modules || []).slice(0, 5).map((m) => (
          <Badge key={m} tone="neutral" className="text-[11px] font-semibold">{m}</Badge>
        ))}
        {(project.modules || []).length > 5 && (
          <span className="text-[11px] font-medium text-ink-400 self-center">+{project.modules.length - 5} more</span>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs text-ink-600 font-medium mb-1">
          <span>Project Progress</span>
          <span className="data-num font-semibold text-ink-800">{project.progress ?? 0}%</span>
        </div>
        <ProgressBar value={project.progress ?? 0} />
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 border-y border-ink-100/80 text-center text-xs">
        <div className="flex flex-col">
          <span className="text-ink-400 font-medium text-[11px]">Workshops</span>
          <span className="font-bold text-ink-800 data-num mt-0.5">{meetingsCount} ({analyzedCount} analyzed)</span>
        </div>
        <div className="flex flex-col border-x border-ink-100/80">
          <span className="text-ink-400 font-medium text-[11px]">Master REQs</span>
          <span className="font-bold text-ink-800 data-num mt-0.5">{reqsCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-ink-400 font-medium text-[11px]">Team</span>
          <span className="font-bold text-ink-800 data-num mt-0.5">{teamCount} Leads</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-ink-500">
        <span className="font-medium text-ink-600 truncate">
          {project.projectManager ? `PM: ${project.projectManager}` : 'PM: Lead Architect'}
        </span>
        <span className="text-brand-600 font-semibold group-hover:underline shrink-0">
          Open Workspace →
        </span>
      </div>
    </div>
  );
}
