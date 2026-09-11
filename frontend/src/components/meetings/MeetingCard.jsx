import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function MeetingCard({ meeting, projectName }) {
  return (
    <Card as={Link} to={`/meetings/${meeting.id}`} className="flex flex-col gap-2.5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink-900">{meeting.name}</h3>
          <p className="text-xs text-ink-500">{projectName || meeting.projectId}</p>
        </div>
        <Badge>{meeting.status}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
        <span className="flex items-center gap-1"><Clock size={12} /> {meeting.date} · {meeting.time}</span>
        <span className="flex items-center gap-1"><Users size={12} /> {meeting.participants} participants</span>
        <Badge tone="neutral">{meeting.module}</Badge>
      </div>
      <div className="flex items-center justify-between border-t border-ink-100 pt-2.5 text-xs">
        <span className="text-ink-500">Preparation readiness</span>
        <span className="data-num font-semibold text-ink-800">{meeting.preparationScore}%</span>
      </div>
    </Card>
  );
}
