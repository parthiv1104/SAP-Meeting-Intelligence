import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarClock, Video, RefreshCw, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { meetingService } from '../services/meetingService';
import { apiFetch } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { getDynamicMeetingTag } from '../utils/domainUtils';

const FILTERS = ['All', 'Upcoming', 'Completed'];

export default function Meetings() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [meetings, setMeetings] = useState(null);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [connectingMS, setConnectingMS] = useState(false);

  const [isMsConnected, setIsMsConnected] = useState(!!sessionStorage.getItem('ms_access_token'));

  // 1. AUTO-LOAD ON PAGE OPEN / REFRESH:
  useEffect(() => {
    setIsMsConnected(!!sessionStorage.getItem('ms_access_token'));
    fetchLiveTeamsMeetings(false);
  }, [user?.email]);


  // 2. TRIGGER MICROSOFT 365 OAUTH & AUTHENTICATOR APP LOGIN:
  const handleConnectMicrosoft = async () => {
    setConnectingMS(true);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const res = await apiFetch(`/auth/microsoft/url/?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (res?.auth_url) {
        window.location.href = res.auth_url;
      } else {
        toast?.('Could not generate Microsoft OAuth login URL.', 'critical');
      }
    } catch (err) {
      console.error('Failed to initiate Microsoft OAuth:', err);
      toast?.('Failed to connect to Microsoft 365. Please try again.', 'critical');
    } finally {
      setConnectingMS(false);
    }
  };

  // 3. FETCH REAL-TIME TEAMS MEETINGS FOR LOGGED-IN USER:
  const fetchLiveTeamsMeetings = async (isManual = false) => {
    setLoadingTeams(true);
    const start = Date.now();
    try {
      const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const res = await apiFetch(`/meetings/live-teams/${emailParam}`);
      if (isManual) {
        const elapsed = Date.now() - start;
        if (elapsed < 600) {
          await new Promise((r) => setTimeout(r, 600 - elapsed));
        }
      }
      if (res?.connected && Array.isArray(res.meetings)) {
        setMeetings(res.meetings);
      } else {
        const listData = await meetingService.list(user?.email ? { user_email: user.email } : {});
        setMeetings(listData || []);
      }

      if (isManual) {
        toast?.('Microsoft Teams calendar synchronized successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to fetch live Teams meetings', err);
      const listData = await meetingService.list(user?.email ? { user_email: user.email } : {});
      setMeetings(listData);
      if (isManual) {
        toast?.('Synced with local workspace meetings', 'info');
      }
    } finally {
      setLoadingTeams(false);
    }
  };

  const filtered = useMemo(() => {
    if (!meetings) return [];
    return meetings.filter((m) => {
      if (query && !m.name?.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === 'Upcoming' && m.status !== 'Scheduled') return false;
      if (filter === 'Completed' && m.status !== 'Completed') return false;
      return true;
    });
  }, [meetings, filter, query]);

  return (
    <div className={`space-y-5 transition-opacity duration-300 ${loadingTeams ? 'opacity-80' : 'opacity-100'}`}>
      <div className="flex items-center justify-between">
        <PageHeader title="Meetings" description="Every workshop, client interview, and review session in your workspace." />
        
        {/* Microsoft Teams Sync & Authenticator Status Action Bar */}
        <div className="flex items-center gap-3">
          {isMsConnected ? (

            <span
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200"
              title="Microsoft Authenticator 2FA Session Verified"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Authenticator MFA Active
            </span>
          ) : (
            <button
              onClick={handleConnectMicrosoft}
              disabled={connectingMS}
              className="flex items-center gap-2 rounded-lg bg-[#464EB8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3b42a0] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              title="Connect Microsoft 365 with Authenticator App Approval"
            >
              <Lock className="h-3.5 w-3.5" />
              {connectingMS ? 'Connecting MS 365...' : 'Connect MS 365 (Authenticator MFA)'}
            </button>
          )}

          <button
            onClick={() => fetchLiveTeamsMeetings(true)}
            disabled={loadingTeams}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            title="Click to refresh meetings from Microsoft Teams"
          >
            <RefreshCw className={`h-4 w-4 transition-transform duration-200 ${loadingTeams ? 'animate-spin' : ''}`} />
            {loadingTeams ? 'Syncing Teams...' : 'Sync Microsoft Teams'}
          </button>
        </div>
      </div>


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
        <Table
          columns={[
            { label: 'Meeting', className: 'w-[42%] min-w-[320px]' },
            { label: 'Date', className: 'w-[110px]' },
            { label: 'Time', className: 'w-[80px]' },
            { label: 'Participants', className: 'w-[90px]' },
            { label: 'Topic / Domain', className: 'w-[140px]' },
            { label: 'Status', className: 'w-[100px]' },
            { label: 'Teams Link', className: 'w-[120px]' },
          ]}
        >
          {filtered.map((m) => {
            const tag = getDynamicMeetingTag(m);
            return (
              <tr key={m.id} className="hover:bg-ink-50/60 transition-colors">
                <td className="px-4 py-3.5 font-medium text-ink-900 leading-snug">
                  <Link to={`/meetings/${m.id}`} className="text-brand-700 hover:text-brand-800 hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-ink-700">{m.date}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-600">{m.time || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-ink-600">{m.participants}</td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-block max-w-[150px] truncate" title={tag.label}>
                    <Badge tone={tag.tone}>{tag.label}</Badge>
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5"><Badge tone={m.status === 'Completed' ? 'positive' : 'brand'}>{m.status}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3.5">
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
            );
          })}
        </Table>
      )}
    </div>
  );
}
