import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { UserPlus } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { teamMembers } from '../../config/constants';

export default function ProjectTeamTab() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => { projectService.get(id).then(setProject); }, [id]);
  if (!project) return null;

  const projectTeam = Array.isArray(project.team) ? project.team : [];
  const members = teamMembers.filter((t) => projectTeam.includes(t.id) || projectTeam.includes(t.name));
  const displayMembers = members.length > 0 ? members : teamMembers;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" icon={UserPlus} variant="secondary">Assign Consultant</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayMembers.map((m) => (
          <Card key={m.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={m.name} size={38} />
              <div>
                <p className="text-sm font-semibold text-ink-900">{m.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.modules.map((mod) => <Badge key={mod} tone="neutral">{mod}</Badge>)}
              <Badge tone="info">{m.experience}</Badge>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-ink-400">Responsibilities</p>
              <div className="flex flex-wrap gap-1.5">
                {m.responsibilities.map((r) => (
                  <span key={r} className="rounded-md bg-ink-50 px-2 py-0.5 text-xs text-ink-600">{r}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-2.5 text-xs text-ink-500">
              <span>{m.meetingsAttended} meetings</span>
              <span>{m.openQuestions} open questions</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
