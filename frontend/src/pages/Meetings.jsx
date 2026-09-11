import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarClock, Video, RefreshCw, ExternalLink } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { meetingService } from '../services/meetingService';
import { projectService } from '../services/projectService';
import { apiFetch } from '../services/apiClient';

const FILTERS = ['All', 'Upcoming', 'Completed'];

export default function Meetings() {
  const { id: projectId } = useParams();
  const [meetings, setMeetings] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);

  // 1. AUTO-LOAD ON PAGE OPEN / REFRESH:
  useEffect(() => {
    fetchLiveTeamsMeetings();
    projectService.list().then(setProjects);
  }, []);

  // 2. FETCH REAL-TIME TEAMS MEETINGS:
  const fetchLiveTeamsMeetings = async () => {
    setLoadingTeams(true);
    try {
      const res = await apiFetch('/meetings/live-teams/');
      if (res.connected && res.meetings.length > 0) {
        setMeetings(res.meetings);
      } else {
        meetingService.list().then(setMeetings);
      }
    } catch (err) {
      console.error('Failed to fetch live Teams meetings', err);
      meetingService.list().then(setMeetings);
    } finally {
      setLoadingTeams(false);
    }
  };

  const projectName = (pid) => projects.find((p) => p.id === pid)?.name || pid || '—';

  const filtered = useMemo(() => {
    if (!meetings) return [];
    return meetings.filter((m) => {
      if (projectId && m.projectId !== projectId) return false;
      if (query && !m.name?.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === 'Upcoming' && m.status !== 'Scheduled') return false;
      if (filter === 'Completed' && m.status !== 'Completed') return false;
      return true;
    });
  }, [meetings, filter, query, projectId]);

  return (
    <div className="space-y-5">
      {!projectId && (
        <div className="flex items-center justify-between">
          <PageHeader title="Meetings" description="Every workshop and review session across your active projects." />
          
          {/* Microsoft Teams Auto-Sync Status & Refresh Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveTeamsMeetings}
              disabled={loadingTeams}
              className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm cursor-pointer"
              title="Click to refresh meetings from Microsoft Teams"
            >
              <RefreshCw className={`h-4 w-4 ${loadingTeams ? 'animate-spin' : ''}`} />
              {loadingTeams ? 'Syncing...' : 'Synced with Microsoft Teams'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search meetings..." className="w-full max-w-xs" />
        <div className="flex gap-1 rounded-lg border border-ink-200 p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`focus-ring rounded-md px-2.5 py-1 text-xs font-medium ${
                filter === f ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!meetings ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No meetings found" description="No upcoming meetings found on your calendar." />
      ) : (
        <Table columns={['Meeting', 'Project', 'Date', 'Time', 'Participants', 'Topic', 'Status', 'Teams Link']}>
          {filtered.map((m) => (
            <tr key={m.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <Link to={`/meetings/${m.id}`} className="font-medium text-brand-700 hover:underline">{m.name}</Link>
              </td>
              <td className="px-4 py-3 text-ink-600">{projectName(m.projectId)}</td>
              <td className="px-4 py-3 text-ink-600">{m.date}</td>
              <td className="px-4 py-3 text-ink-600">{m.time || '—'}</td>
              <td className="px-4 py-3 text-ink-600">{m.participants}</td>
              <td className="px-4 py-3"><Badge tone="neutral">{m.topic}</Badge></td>
              <td className="px-4 py-3"><Badge>{m.status}</Badge></td>
              <td className="px-4 py-3">
                {m.joinUrl ? (
                  <a
                    href={m.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#464EB8] hover:underline"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Join Teams
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-ink-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
